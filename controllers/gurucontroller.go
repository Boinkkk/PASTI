package controllers

import (
	"Pasti/config"
	"Pasti/helpers"
	"Pasti/models"
	"net/http"
)

// GetGuruProfile mendapatkan profil guru berdasarkan token
func GetGuruProfile(w http.ResponseWriter, r *http.Request) {
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

	// Ambil data guru lengkap dari database
	var fullGuru models.Guru
	if err := config.DB.First(&fullGuru, "guru_id = ?", guru.ID).Error; err != nil {
		helpers.Response(w, 404, "Guru tidak ditemukan", nil)
		return
	}

	// Response tanpa password
	responseData := map[string]interface{}{
		"guru_id":      fullGuru.GuruID,
		"nip":          fullGuru.NIP,
		"nama_lengkap": fullGuru.NamaLengkap,
		"email":        fullGuru.Email,
		"role":         "guru",
		"created_at":   fullGuru.CreatedAt,
		"updated_at":   fullGuru.UpdatedAt,
	}

	helpers.Response(w, 200, "Profile guru berhasil diambil", responseData)
}

// GetAllSiswa mendapatkan daftar semua siswa (untuk guru)
func GetAllSiswa(w http.ResponseWriter, r *http.Request) {
	// Verifikasi guru dari context
	guruInfo := r.Context().Value("guruinfo")
	if guruInfo == nil {
		helpers.Response(w, 401, "Unauthorized: no guru info in context", nil)
		return
	}

	var siswaList []models.Siswa
	if err := config.DB.Preload("Kelas.Jurusan").Find(&siswaList).Error; err != nil {
		helpers.Response(w, 500, "Gagal mengambil data siswa", nil)
		return
	}

	helpers.Response(w, 200, "Daftar siswa berhasil diambil", siswaList)
}
