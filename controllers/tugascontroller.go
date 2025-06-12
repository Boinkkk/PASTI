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
	"gorm.io/gorm"
)

// GetTugasGuru mengambil semua tugas yang dibuat oleh guru
func GetTugasGuru(w http.ResponseWriter, r *http.Request) {
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

	var tugasList []models.Tugas
	
	// Join dengan jadwal_pelajaran untuk mendapatkan informasi jadwal
	if err := config.DB.
	Preload("JadwalPelajaran").
	Preload("JadwalPelajaran.Kelas").
	Preload("JadwalPelajaran.MataPelajaran").
	Preload("JadwalPelajaran.Guru").
	Joins("JOIN jadwalpelajaran ON tugas.jadwal_id = jadwalpelajaran.jadwal_id").
	Where("jadwalpelajaran.guru_id = ?", guru.ID).
	Order("tugas.created_at DESC").
	Find(&tugasList).Error; err != nil {
	helpers.Response(w, 500, "Database error: "+err.Error(), nil)
	return
}

	helpers.Response(w, 200, "Tugas berhasil diambil", tugasList)
}

// GetTugasByJadwal mengambil tugas berdasarkan jadwal_id
func GetTugasByJadwal(w http.ResponseWriter, r *http.Request) {
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
	jadwalIDStr := vars["jadwal_id"]
	jadwalID, err := strconv.Atoi(jadwalIDStr)
	if err != nil {
		helpers.Response(w, 400, "Invalid jadwal ID", nil)
		return
	}

	// Verify that jadwal belongs to this guru
	var jadwal models.JadwalPelajaran
	if err := config.DB.Where("jadwal_id = ? AND guru_id = ?", jadwalID, guru.ID).First(&jadwal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			helpers.Response(w, 404, "Jadwal tidak ditemukan atau bukan milik Anda", nil)
		} else {
			helpers.Response(w, 500, "Database error: "+err.Error(), nil)
		}
		return
	}

	var tugasList []models.Tugas
	if err := config.DB.Preload("JadwalPelajaran").
		Where("jadwal_id = ?", jadwalID).
		Order("created_at DESC").
		Find(&tugasList).Error; err != nil {
		helpers.Response(w, 500, "Database error: "+err.Error(), nil)
		return
	}

	helpers.Response(w, 200, "Tugas berhasil diambil", tugasList)
}

// CreateTugas membuat tugas baru
func CreateTugas(w http.ResponseWriter, r *http.Request) {
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

	var input struct {
		JadwalID            int    `json:"jadwal_id"`
		JudulTugas          string `json:"judul_tugas"`
		DeskripsiTugas      string `json:"deskripsi_tugas"`
		DeadlinePengumpulan string `json:"deadline_pengumpulan"`
		PoinMaksimal        int    `json:"poin_maksimal"`
		TipeTugas           string `json:"tipe_tugas"`
		FileTugasGuru       string `json:"file_tugas_guru"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		helpers.Response(w, 400, "Invalid input: "+err.Error(), nil)
		return
	}

	// Validate required fields
	if input.JadwalID == 0 || input.JudulTugas == "" || input.DeskripsiTugas == "" || input.DeadlinePengumpulan == "" {
		helpers.Response(w, 400, "Missing required fields", nil)
		return
	}

	// Validate tipe_tugas
	if input.TipeTugas != "Individu" && input.TipeTugas != "Kelompok" {
		helpers.Response(w, 400, "Tipe tugas harus 'Individu' atau 'Kelompok'", nil)
		return
	}

	// Verify that jadwal belongs to this guru
	var jadwal models.JadwalPelajaran
	if err := config.DB.Where("jadwal_id = ? AND guru_id = ?", input.JadwalID, guru.ID).First(&jadwal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			helpers.Response(w, 404, "Jadwal tidak ditemukan atau bukan milik Anda", nil)
		} else {
			helpers.Response(w, 500, "Database error: "+err.Error(), nil)
		}
		return
	}

	// Parse deadline
	deadline, err := time.Parse("2006-01-02T15:04", input.DeadlinePengumpulan)
	if err != nil {
		helpers.Response(w, 400, "Format deadline tidak valid", nil)
		return
	}

	// Set default poin if not provided
	if input.PoinMaksimal == 0 {
		input.PoinMaksimal = 100
	}

	// Create tugas
	tugas := models.Tugas{
		JadwalID:            input.JadwalID,
		JudulTugas:          input.JudulTugas,
		DeskripsiTugas:      input.DeskripsiTugas,
		DeadlinePengumpulan: deadline,
		PoinMaksimal:        input.PoinMaksimal,
		TipeTugas:           input.TipeTugas,
		FileTugasGuru:       input.FileTugasGuru,
	}

	if err := config.DB.Create(&tugas).Error; err != nil {
		helpers.Response(w, 500, "Database error: "+err.Error(), nil)
		return
	}

	// Load jadwal relation
	config.DB.Preload("JadwalPelajaran").First(&tugas, tugas.TugasID)

	helpers.Response(w, 201, "Tugas berhasil dibuat", tugas)
}

// UpdateTugas memperbarui tugas
func UpdateTugas(w http.ResponseWriter, r *http.Request) {
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

	var input struct {
		JudulTugas          string `json:"judul_tugas"`
		DeskripsiTugas      string `json:"deskripsi_tugas"`
		DeadlinePengumpulan string `json:"deadline_pengumpulan"`
		PoinMaksimal        int    `json:"poin_maksimal"`
		TipeTugas           string `json:"tipe_tugas"`
		FileTugasGuru       string `json:"file_tugas_guru"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		helpers.Response(w, 400, "Invalid input: "+err.Error(), nil)
		return
	}

	// Validate tipe_tugas if provided
	if input.TipeTugas != "" && input.TipeTugas != "Individu" && input.TipeTugas != "Kelompok" {
		helpers.Response(w, 400, "Tipe tugas harus 'Individu' atau 'Kelompok'", nil)
		return
	}

	// Find tugas and verify ownership
	var tugas models.Tugas
	if err := config.DB.Joins("JOIN jadwalpelajaran ON tugas.jadwal_id = jadwalpelajaran.jadwal_id").
		Where("tugas.tugas_id = ? AND jadwalpelajaran.guru_id = ?", tugasID, guru.ID).
		First(&tugas).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			helpers.Response(w, 404, "Tugas tidak ditemukan atau bukan milik Anda", nil)
		} else {
			helpers.Response(w, 500, "Database error: "+err.Error(), nil)
		}
		return
	}

	// Update fields if provided
	updates := make(map[string]interface{})
	
	if input.JudulTugas != "" {
		updates["judul_tugas"] = input.JudulTugas
	}
	if input.DeskripsiTugas != "" {
		updates["deskripsi_tugas"] = input.DeskripsiTugas
	}
	if input.DeadlinePengumpulan != "" {
		deadline, err := time.Parse("2006-01-02T15:04", input.DeadlinePengumpulan)
		if err != nil {
			helpers.Response(w, 400, "Format deadline tidak valid", nil)
			return
		}
		updates["deadline_pengumpulan"] = deadline
	}
	if input.PoinMaksimal > 0 {
		updates["poin_maksimal"] = input.PoinMaksimal
	}
	if input.TipeTugas != "" {
		updates["tipe_tugas"] = input.TipeTugas
	}
	if input.FileTugasGuru != "" {
		updates["file_tugas_guru"] = input.FileTugasGuru
	}

	if err := config.DB.Model(&tugas).Updates(updates).Error; err != nil {
		helpers.Response(w, 500, "Database error: "+err.Error(), nil)
		return
	}

	// Load updated tugas with relations
	config.DB.Preload("JadwalPelajaran").First(&tugas, tugas.TugasID)

	helpers.Response(w, 200, "Tugas berhasil diperbarui", tugas)
}

// DeleteTugas menghapus tugas
func DeleteTugas(w http.ResponseWriter, r *http.Request) {
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

	// Find tugas and verify ownership
	var tugas models.Tugas
	if err := config.DB.Joins("JOIN jadwalpelajaran ON tugas.jadwal_id = jadwalpelajaran.jadwal_id").
		Where("tugas.tugas_id = ? AND jadwalpelajaran.guru_id = ?", tugasID, guru.ID).
		First(&tugas).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			helpers.Response(w, 404, "Tugas tidak ditemukan atau bukan milik Anda", nil)
		} else {
			helpers.Response(w, 500, "Database error: "+err.Error(), nil)
		}
		return
	}

	if err := config.DB.Delete(&tugas).Error; err != nil {
		helpers.Response(w, 500, "Database error: "+err.Error(), nil)
		return
	}

	helpers.Response(w, 200, "Tugas berhasil dihapus", nil)
}

// GetTugasDetail mengambil detail tugas dengan pengumpulan
func GetTugasDetail(w http.ResponseWriter, r *http.Request) {
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

	// Find tugas and verify ownership
	var tugas models.Tugas
	if err := config.DB.Preload("JadwalPelajaran").
		Joins("JOIN jadwalpelajaran ON tugas.jadwal_id = jadwalpelajaran.jadwal_id").
		Where("tugas.tugas_id = ? AND jadwalpelajaran.guru_id = ?", tugasID, guru.ID).
		First(&tugas).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			helpers.Response(w, 404, "Tugas tidak ditemukan atau bukan milik Anda", nil)
		} else {
			helpers.Response(w, 500, "Database error: "+err.Error(), nil)
		}
		return
	}

	// Get submissions if PengumpulanTugas model exists
	// Note: Uncomment this when PengumpulanTugas model is ready
	// var submissions []models.PengumpulanTugas
	// config.DB.Where("tugas_id = ?", tugasID).Find(&submissions)

	response := map[string]interface{}{
		"tugas": tugas,
		// "submissions": submissions,
		"total_submissions": 0, // Update when submissions are implemented
	}

	helpers.Response(w, 200, "Detail tugas berhasil diambil", response)
}
