package controllers

import (
	"Pasti/config"
	"Pasti/helpers"
	"Pasti/models"
	"encoding/json"
	"net/http"
)

func Me(w http.ResponseWriter, r *http.Request) {
	siswaClaims := r.Context().Value("siswainfo").(*helpers.MyCustomClaims)

	var siswa models.Siswa
	err := config.DB.Preload("Kelas.Jurusan").First(&siswa, "siswa_id = ?", siswaClaims.ID).Error
	if err != nil {
		helpers.Response(w, 500, "Gagal mengambil data siswa: "+err.Error(), nil)
		return
	}

	siswaResponse := &models.SiswaProfile{
		SiswaID: siswa.SiswaID,
		NamaLengkap: siswa.NamaLengkap,
		Email: siswa.Email,
		NIS: siswa.NIS,
		KelasID: siswa.KelasID,
		NoTelepon: siswa.NoTelepon,
		PoinMotivasi: siswa.PoinMotivasi,
		TingkatDisiplin: siswa.TingkatDisiplin,
		FotoProfil: siswa.FotoProfil,
		Kelas: siswa.Kelas,
	}

	helpers.Response(w, 200, "Siswa profile", siswaResponse)
}

// UpdateSiswaProfile - Update profil siswa
func UpdateSiswaProfile(w http.ResponseWriter, r *http.Request) {
	// Ambil siswa_id dari JWT token
	siswa := r.Context().Value("siswainfo").(*helpers.MyCustomClaims)
	siswaID := siswa.ID

	// Parse request body
	var request struct {
		NamaLengkap string `json:"nama_lengkap"`
		Email       string `json:"email"`
		NoTelepon   string `json:"no_telepon"`
		FotoProfil  string `json:"foto_profil"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		helpers.Response(w, 400, "Invalid JSON format", nil)
		return
	}

	// Validasi input
	if request.NamaLengkap == "" {
		helpers.Response(w, 400, "Nama lengkap tidak boleh kosong", nil)
		return
	}

	if request.Email == "" {
		helpers.Response(w, 400, "Email tidak boleh kosong", nil)
		return
	}

	// Cek apakah email sudah digunakan oleh siswa lain
	var existingSiswa models.Siswa
	result := config.DB.Where("email = ? AND siswa_id != ?", request.Email, siswaID).First(&existingSiswa)
	if result.Error == nil {
		helpers.Response(w, 400, "Email sudah digunakan oleh siswa lain", nil)
		return
	}

	// Ambil data siswa saat ini
	var currentSiswa models.Siswa
	if err := config.DB.Where("siswa_id = ?", siswaID).First(&currentSiswa).Error; err != nil {
		helpers.Response(w, 404, "Siswa tidak ditemukan", nil)
		return
	}

	// Update data siswa
	currentSiswa.NamaLengkap = request.NamaLengkap
	currentSiswa.Email = request.Email
	currentSiswa.NoTelepon = request.NoTelepon
	currentSiswa.FotoProfil = request.FotoProfil

	if err := config.DB.Save(&currentSiswa).Error; err != nil {
		helpers.Response(w, 500, "Gagal mengupdate profil", nil)
		return
	}

	// Return updated profile
	updatedProfile := &models.SiswaProfile{
		SiswaID:         currentSiswa.SiswaID,
		NIS:             currentSiswa.NIS,
		NamaLengkap:     currentSiswa.NamaLengkap,
		KelasID:         currentSiswa.KelasID,
		Email:           currentSiswa.Email,
		NoTelepon:       currentSiswa.NoTelepon,
		PoinMotivasi:    currentSiswa.PoinMotivasi,
		TingkatDisiplin: currentSiswa.TingkatDisiplin,
		FotoProfil:      currentSiswa.FotoProfil,
	}

	helpers.Response(w, 200, "Profil berhasil diupdate", updatedProfile)
}