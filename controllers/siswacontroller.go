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
		NoTelepon string `json:"no_telepon"`
		Password  string `json:"password,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		helpers.Response(w, 400, "Invalid JSON format", nil)
		return
	}

	// Ambil data siswa saat ini
	var currentSiswa models.Siswa
	if err := config.DB.Where("siswa_id = ?", siswaID).First(&currentSiswa).Error; err != nil {
		helpers.Response(w, 404, "Siswa tidak ditemukan", nil)
		return
	}

	// Update nomor telepon
	currentSiswa.NoTelepon = request.NoTelepon
	// Update password jika diisi
	if request.Password != "" {
		if len(request.Password) < 6 {
			helpers.Response(w, 400, "Password minimal 6 karakter", nil)
			return
		}
		
		hashedPassword, err := helpers.HassPassword(request.Password)
		if err != nil {
			helpers.Response(w, 500, "Gagal mengenkripsi password", nil)
			return
		}
		currentSiswa.PasswordHash = hashedPassword
	}

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