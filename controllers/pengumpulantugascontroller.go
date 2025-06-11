package controllers

import (
	"encoding/json"
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
		helpers.Response(w, 400, "Invalid JSON format", nil)
		return
	}

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
			helpers.Response(w, 500, "Failed to submit tugas", nil)
			return
		}
	} else {
		// Update pengumpulan yang sudah ada
		pengumpulan.FileJawabanSiswa = request.FileJawabanSiswa
		pengumpulan.CatatanSiswa = request.CatatanSiswa
		pengumpulan.TanggalPengumpulan = now
		pengumpulan.StatusPengumpulan = status

		if err := config.DB.Save(&pengumpulan).Error; err != nil {
			helpers.Response(w, 500, "Failed to update tugas submission", nil)
			return
		}
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
