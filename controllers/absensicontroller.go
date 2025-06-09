package controllers

import (
	"Pasti/config"
	"Pasti/helpers"
	"Pasti/models"
	"net/http"
)

func GetDaftarPelajaranPerKelas(w http.ResponseWriter, r *http.Request) {
	// Safely get siswa info from context
	siswaInfo := r.Context().Value("siswainfo")
	if siswaInfo == nil {
		helpers.Response(w, 401, "Unauthorized: no siswa info in context", nil)
		return
	}

	siswa, ok := siswaInfo.(*helpers.MyCustomClaims)
	if !ok {
		helpers.Response(w, 401, "Unauthorized: invalid siswa info format", nil)
		return
	}

	var daftarMapel []models.DaftarAbsensi

	query := "select * from view_daftar_matapelajaran_per_kelas where kelas_id = ?;"

	if err := config.DB.Raw(query, siswa.KelasID).Scan(&daftarMapel).Error; err != nil {
		helpers.Response(w, 500, err.Error(), nil)
		return
	}

	helpers.Response(w, 200, "Daftar Pelajaran Per Kelas", daftarMapel)
}