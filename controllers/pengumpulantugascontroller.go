package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"Pasti/config"
	"Pasti/helpers"
	"Pasti/models"

	"github.com/gorilla/mux"
)

// GetTugasSiswa - Mendapatkan semua tugas berdasarkan kelas siswa
func GetTugasSiswa(w http.ResponseWriter, r *http.Request) {
	// Ambil siswa_id dari JWT token
	siswa := r.Context().Value("siswainfo").(*helpers.MyCustomClaims)
	siswaID := siswa.ID

	var tugas []models.Tugas
	
	// Query tugas berdasarkan kelas siswa dengan join
	result := config.DB.
		Preload("JadwalPelajaran").
		Preload("JadwalPelajaran.MataPelajaran").
		Preload("JadwalPelajaran.Kelas").
		Joins("JOIN jadwalpelajaran ON tugas.jadwal_id = jadwalpelajaran.jadwal_id").
		Joins("JOIN siswa ON siswa.kelas_id = jadwalpelajaran.kelas_id").
		Where("siswa.siswa_id = ?", siswaID).
		Find(&tugas)

	if result.Error != nil {
		helpers.Response(w, 500, "Failed to fetch tugas", nil)
		return
	}

	// Untuk setiap tugas, cek status pengumpulan siswa
	var response []map[string]interface{}
	for _, t := range tugas {
		var pengumpulan models.PengumpulanTugas
		config.DB.Where("tugas_id = ? AND siswa_id = ?", t.TugasID, siswaID).First(&pengumpulan)

		tugasData := map[string]interface{}{
			"tugas_id":              t.TugasID,
			"jadwal_id":             t.JadwalID,
			"judul_tugas":           t.JudulTugas,
			"deskripsi_tugas":       t.DeskripsiTugas,
			"file_tugas_guru":       t.FileTugasGuru,
			"tanggal_dibuat":        t.TanggalDibuat,
			"deadline_pengumpulan":  t.DeadlinePengumpulan,
			"poin_maksimal":         t.PoinMaksimal,
			"tipe_tugas":            t.TipeTugas,
			"jadwal_pelajaran":      t.JadwalPelajaran,
			"status_pengumpulan":    "Belum Mengerjakan",
			"file_jawaban_siswa":    "",
			"catatan_siswa":         "",
			"tanggal_pengumpulan":   nil,
			"nilai":                 nil,
			"catatan_guru":          "",
			"poin_didapat":          0,
		}

		// Jika sudah ada pengumpulan, update status
		if pengumpulan.PengumpulanID != 0 {
			tugasData["status_pengumpulan"] = pengumpulan.StatusPengumpulan
			tugasData["file_jawaban_siswa"] = pengumpulan.FileJawabanSiswa
			tugasData["catatan_siswa"] = pengumpulan.CatatanSiswa
			tugasData["tanggal_pengumpulan"] = pengumpulan.TanggalPengumpulan
			tugasData["nilai"] = pengumpulan.Nilai
			tugasData["catatan_guru"] = pengumpulan.CatatanGuru
			tugasData["poin_didapat"] = pengumpulan.PoinDidapat
		}

		response = append(response, tugasData)
	}

	helpers.Response(w, 200, "Tugas retrieved successfully", response)
}

// SubmitTugas - Mengumpulkan tugas atau update pengumpulan
func SubmitTugas(w http.ResponseWriter, r *http.Request) {
	// Ambil siswa_id dari JWT token
	siswa := r.Context().Value("siswainfo").(*helpers.MyCustomClaims)
	siswaID := siswa.ID

	vars := mux.Vars(r)
	tugasIDStr := vars["tugas_id"]
	tugasID, err := strconv.Atoi(tugasIDStr)
	if err != nil {
		helpers.Response(w, 400, "Invalid tugas ID", nil)
		return
	}
	var request struct {
		FileJawabanSiswa string `json:"file_jawaban_siswa"`
		CatatanSiswa     string `json:"catatan_siswa"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		log.Printf("❌ Failed to decode JSON: %v", err)
		helpers.Response(w, 400, "Invalid JSON format", nil)
		return
	}

	// Debug logging
	log.Printf("🔍 SubmitTugas received data:")
	log.Printf("   - siswa_id: %d", siswaID)
	log.Printf("   - tugas_id: %d", tugasID)
	log.Printf("   - file_jawaban_siswa: '%s'", request.FileJawabanSiswa)
	log.Printf("   - catatan_siswa: '%s'", request.CatatanSiswa)

	// Cek apakah tugas ada dan siswa berhak mengaksesnya
	var tugas models.Tugas
	result := config.DB.
		Joins("JOIN jadwalpelajaran ON tugas.jadwal_id = jadwalpelajaran.jadwal_id").
		Joins("JOIN siswa ON siswa.kelas_id = jadwalpelajaran.kelas_id").
		Where("tugas.tugas_id = ? AND siswa.siswa_id = ?", tugasID, siswaID).
		First(&tugas)

	if result.Error != nil {
		helpers.Response(w, 404, "Tugas not found or access denied", nil)
		return
	}

	// Cek deadline
	now := time.Now()
	status := "Mengerjakan"
	if now.After(tugas.DeadlinePengumpulan) {
		status = "Terlambat"
	}

	// Cek apakah sudah ada pengumpulan sebelumnya
	var pengumpulan models.PengumpulanTugas
	existingResult := config.DB.Where("tugas_id = ? AND siswa_id = ?", tugasID, siswaID).First(&pengumpulan)
	if existingResult.Error != nil {
		// Buat pengumpulan baru
		log.Printf("📝 Creating new pengumpulan tugas...")
		pengumpulan = models.PengumpulanTugas{
			TugasID:               tugasID,
			SiswaID:               siswaID,
			FileJawabanSiswa:      request.FileJawabanSiswa,
			CatatanSiswa:          request.CatatanSiswa,
			TanggalPengumpulan:    now,
			StatusPengumpulan:     status,
			PoinDidapat:           0,
		}

		if err := config.DB.Create(&pengumpulan).Error; err != nil {
			log.Printf("❌ Failed to create pengumpulan: %v", err)
			helpers.Response(w, 500, "Failed to submit tugas", nil)
			return
		}
		log.Printf("✅ New pengumpulan created with file: '%s'", request.FileJawabanSiswa)
	} else {
		// Update pengumpulan yang sudah ada
		log.Printf("📝 Updating existing pengumpulan...")
		log.Printf("   - Old file: '%s'", pengumpulan.FileJawabanSiswa)
		log.Printf("   - New file: '%s'", request.FileJawabanSiswa)
		
		pengumpulan.FileJawabanSiswa = request.FileJawabanSiswa
		pengumpulan.CatatanSiswa = request.CatatanSiswa
		pengumpulan.TanggalPengumpulan = now
		pengumpulan.StatusPengumpulan = status

		if err := config.DB.Save(&pengumpulan).Error; err != nil {
			log.Printf("❌ Failed to update pengumpulan: %v", err)
			helpers.Response(w, 500, "Failed to update tugas submission", nil)
			return
		}
		log.Printf("✅ Pengumpulan updated with file: '%s'", request.FileJawabanSiswa)
	}

	helpers.Response(w, 200, "Tugas submitted successfully", pengumpulan)
}

// GetDetailPengumpulan - Mendapatkan detail pengumpulan tugas siswa
func GetDetailPengumpulan(w http.ResponseWriter, r *http.Request) {
	// Ambil siswa_id dari JWT token
	siswa := r.Context().Value("siswainfo").(*helpers.MyCustomClaims)
	siswaID := siswa.ID

	vars := mux.Vars(r)
	tugasIDStr := vars["tugas_id"]
	tugasID, err := strconv.Atoi(tugasIDStr)
	if err != nil {
		helpers.Response(w, 400, "Invalid tugas ID", nil)
		return
	}

	var pengumpulan models.PengumpulanTugas
	result := config.DB.
		Preload("Tugas").
		Preload("Tugas.JadwalPelajaran").
		Preload("Tugas.JadwalPelajaran.MataPelajaran").
		Preload("Tugas.JadwalPelajaran.Kelas").
		Where("tugas_id = ? AND siswa_id = ?", tugasID, siswaID).
		First(&pengumpulan)

	if result.Error != nil {
		helpers.Response(w, 404, "Pengumpulan tugas not found", nil)
		return
	}

	helpers.Response(w, 200, "Detail pengumpulan retrieved successfully", pengumpulan)
}

// DeletePengumpulan - Menghapus pengumpulan tugas (hanya jika belum dinilai)
func DeletePengumpulan(w http.ResponseWriter, r *http.Request) {
	// Ambil siswa_id dari JWT token
	siswa := r.Context().Value("siswainfo").(*helpers.MyCustomClaims)
	siswaID := siswa.ID

	vars := mux.Vars(r)
	tugasIDStr := vars["tugas_id"]
	tugasID, err := strconv.Atoi(tugasIDStr)
	if err != nil {
		helpers.Response(w, 400, "Invalid tugas ID", nil)
		return
	}

	var pengumpulan models.PengumpulanTugas
	result := config.DB.Where("tugas_id = ? AND siswa_id = ?", tugasID, siswaID).First(&pengumpulan)

	if result.Error != nil {
		helpers.Response(w, 404, "Pengumpulan tugas not found", nil)
		return
	}

	// Cek apakah sudah dinilai
	if pengumpulan.StatusPengumpulan == "Dinilai" {
		helpers.Response(w, 400, "Cannot delete graded submission", nil)
		return
	}

	if err := config.DB.Delete(&pengumpulan).Error; err != nil {
		helpers.Response(w, 500, "Failed to delete pengumpulan", nil)
		return
	}

	helpers.Response(w, 200, "Pengumpulan deleted successfully", nil)
}

// GetPengumpulanByTugas - Mendapatkan semua pengumpulan tugas berdasarkan tugas_id (untuk guru)
func GetPengumpulanByTugas(w http.ResponseWriter, r *http.Request) {
	// Ambil info guru dari context (dari middleware)
	guruInfo := r.Context().Value("guruinfo")
	if guruInfo == nil {
		helpers.Response(w, 401, "Unauthorized: no guru info in context", nil)
		return
	}

	guru, ok := guruInfo.(*helpers.GuruCustomClaims)
	if !ok {
		helpers.Response(w, 401, "Unauthorized: invalid guru info format", nil)
		return
	}

	vars := mux.Vars(r)
	tugasIDStr := vars["tugas_id"]
	tugasID, err := strconv.Atoi(tugasIDStr)
	if err != nil {
		helpers.Response(w, 400, "Invalid tugas ID", nil)
		return
	}

	// Verify bahwa tugas ini milik guru yang sedang login
	var tugas models.Tugas
 	if err := config.DB.Preload("JadwalPelajaran").
		Joins("JOIN jadwalpelajaran ON tugas.jadwal_id = jadwalpelajaran.jadwal_id").
		Where("tugas.tugas_id = ? AND jadwalpelajaran.guru_id = ?", tugasID, guru.ID).
		First(&tugas).Error; err != nil {
		helpers.Response(w, 404, "Tugas tidak ditemukan atau bukan milik Anda", nil)
		return
	}

	// Ambil semua siswa di kelas yang terkait dengan tugas ini
	var siswaList []models.Siswa
	if err := config.DB.Where("kelas_id = ?", tugas.JadwalPelajaran.KelasID).
		Order("nama_lengkap ASC").
		Find(&siswaList).Error; err != nil {
		helpers.Response(w, 500, "Failed to fetch siswa list", nil)
		return
	}

	// Ambil semua pengumpulan untuk tugas ini
	var pengumpulanList []models.PengumpulanTugas
	pengumpulanMap := make(map[int]models.PengumpulanTugas)
	
	if err := config.DB.Where("tugas_id = ?", tugasID).Find(&pengumpulanList).Error; err != nil {
		helpers.Response(w, 500, "Failed to fetch pengumpulan", nil)
		return
	}

	// Buat map pengumpulan berdasarkan siswa_id untuk akses cepat
	for _, p := range pengumpulanList {
		pengumpulanMap[p.SiswaID] = p
	}

	// Format response dengan data semua siswa dan status pengumpulan mereka
	var response []map[string]interface{}
	for _, siswa := range siswaList {
		siswaData := map[string]interface{}{
			"siswa_id":     siswa.SiswaID,
			"nis":          siswa.NIS,
			"nama_lengkap": siswa.NamaLengkap,
			"email":        siswa.Email,
		}

		// Cek apakah siswa sudah mengumpulkan tugas
		if pengumpulan, exists := pengumpulanMap[siswa.SiswaID]; exists {
			siswaData["pengumpulan_id"] = pengumpulan.PengumpulanID
			siswaData["tugas_id"] = pengumpulan.TugasID
			siswaData["file_jawaban_siswa"] = pengumpulan.FileJawabanSiswa
			siswaData["catatan_siswa"] = pengumpulan.CatatanSiswa
			siswaData["tanggal_pengumpulan"] = pengumpulan.TanggalPengumpulan
			siswaData["nilai"] = pengumpulan.Nilai
			siswaData["catatan_guru"] = pengumpulan.CatatanGuru
			siswaData["status_pengumpulan"] = pengumpulan.StatusPengumpulan
			siswaData["poin_didapat"] = pengumpulan.PoinDidapat
			siswaData["has_submitted"] = true
		} else {
			// Siswa belum mengumpulkan tugas
			siswaData["pengumpulan_id"] = nil
			siswaData["tugas_id"] = tugasID
			siswaData["file_jawaban_siswa"] = nil
			siswaData["catatan_siswa"] = nil
			siswaData["tanggal_pengumpulan"] = nil
			siswaData["nilai"] = nil
			siswaData["catatan_guru"] = nil
			siswaData["status_pengumpulan"] = "Belum Mengerjakan"
			siswaData["poin_didapat"] = 0
			siswaData["has_submitted"] = false
		}

		response = append(response, siswaData)
	}

	helpers.Response(w, 200, "Data siswa dan pengumpulan tugas berhasil diambil", response)
}

// UpdateStudentPoints - Update poin yang didapat siswa oleh guru
func UpdateStudentPoints(w http.ResponseWriter, r *http.Request) {
	// Parse pengumpulan_id dari URL parameter
	vars := mux.Vars(r)
	pengumpulanIDStr := vars["pengumpulan_id"]
	pengumpulanID, err := strconv.Atoi(pengumpulanIDStr)
	if err != nil {
		helpers.Response(w, 400, "Invalid pengumpulan ID", nil)
		return
	}

	// Parse request body
	var request struct {
		PoinDidapat        int    `json:"poin_didapat"`
		CatatanGuru        string `json:"catatan_guru"`
		StatusPengumpulan  string `json:"status_pengumpulan"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		helpers.Response(w, 400, "Invalid JSON format", nil)
		return
	}

	// Ambil pengumpulan tugas
	var pengumpulan models.PengumpulanTugas
	result := config.DB.Where("pengumpulan_id = ?", pengumpulanID).First(&pengumpulan)
	if result.Error != nil {
		helpers.Response(w, 404, "Pengumpulan tugas not found", nil)
		return
	}

	// Ambil info tugas untuk validasi guru
	var tugas models.Tugas
	tugas_result := config.DB.
		Preload("JadwalPelajaran").
		Where("tugas_id = ?", pengumpulan.TugasID).
		First(&tugas)
	
	if tugas_result.Error != nil {
		helpers.Response(w, 404, "Tugas not found", nil)
		return
	}

	// Validasi guru dari JWT token
	guru := r.Context().Value("guruinfo").(*helpers.GuruCustomClaims)
	guruID := guru.ID

	if tugas.JadwalPelajaran.GuruID != guruID {
		helpers.Response(w, 403, "Access denied - not your class", nil)
		return
	}

	// Validasi poin tidak melebihi poin maksimal
	if request.PoinDidapat > tugas.PoinMaksimal {
		helpers.Response(w, 400, "Poin melebihi poin maksimal tugas", nil)
		return
	}

	// Update pengumpulan tugas
	pengumpulan.PoinDidapat = request.PoinDidapat
	pengumpulan.CatatanGuru = request.CatatanGuru
	pengumpulan.StatusPengumpulan = request.StatusPengumpulan

	if err := config.DB.Save(&pengumpulan).Error; err != nil {
		helpers.Response(w, 500, "Failed to update points", nil)
		return
	}

	helpers.Response(w, 200, "Poin siswa berhasil diupdate", pengumpulan)
}
