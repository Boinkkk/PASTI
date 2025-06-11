package controllers

import (
	"Pasti/config"
	"Pasti/helpers"
	"Pasti/models"
	"net/http"
	"strconv"
)

func GetDaftarMengajar(w http.ResponseWriter, r *http.Request) {
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

	var dataMengajar []models.JadwalGuru
	query  := `select * from jadwal_mengajar_guru where guru_id = ?`
	if err := config.DB.Raw(query, guru.ID).Scan(&dataMengajar).Error; err != nil {
		helpers.Response(w, 500, "Gagal mengambil data", nil)
		return
	}

	helpers.Response(w, 200, "Daftar pertemuan Guru", dataMengajar)

	

}

func GetAbsensiSiswaPertemuan(w http.ResponseWriter, r *http.Request) {
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

	jadwalIDStr := r.URL.Query().Get("jadwal_id")

	if jadwalIDStr == "" {
		helpers.Response(w, 400, "Jadwal ID is required", nil)
		return
	}

	jadwalID, err := strconv.Atoi(jadwalIDStr)

	if err != nil {
		helpers.Response(w, 400, "Invalid Jadwal ID", nil)
		return
	}

	var count int64
	config.DB.Table("jadwal_mengajar_guru").
		Where("jadwal_id = ? AND guru_id = ?", jadwalID, guru.ID).
		Count(&count)

	if count == 0 {
		helpers.Response(w, 404, "Jadwal tidak ditemukan atau tidak sesuai dengan guru", nil)
		return
	}

	var data []models.ResponseAbsensiSiswa

	query := `SELECT * FROM jadwal_pertemuan_guru_pelajaran WHERE jadwal_id = ?`

	if err := config.DB.Raw(query, jadwalID).Scan(&data).Error; err != nil {
		helpers.Response(w, 500, "Gagal mengambil data absensi siswa", nil)
		return
	}

	helpers.Response(w, 200, "Daftar Absensi Siswa Per Pertemuan", data)

}

func GetDetailAbsensiSiswa(w http.ResponseWriter, r *http.Request) {
	id_pertemuanStr := r.URL.Query().Get("id_pertemuan")

	if id_pertemuanStr == "" {
		helpers.Response(w, 400, "ID Pertemuan is required : " + id_pertemuanStr, nil)
		return
	}

	id_pertemuan, err := strconv.Atoi(id_pertemuanStr)
	if err != nil {
		helpers.Response(w, 400, "Invalid ID Pertemuan", nil)
		return
	}

	query := `SELECT
				s.siswa_id,
				s.nis,
				s.no_telepon,
				s.nama_lengkap,
				a.waktu_absen,
				a.status AS status_kehadiran
				FROM
				pertemuan p
				JOIN
				jadwal_mengajar_guru jmg ON jmg.jadwal_id = p.id_jadwal
				JOIN
				kelas k ON k.nama_kelas = jmg.nama_kelas
				JOIN
				siswa s ON s.kelas_id = k.kelas_id
				LEFT JOIN
				absensi a ON a.id_pertemuan = p.id_pertemuan AND a.id_siswa = s.siswa_id
				WHERE
				p.id_pertemuan = ?;`

	var response []models.ResponseAbsensiSiswaPertemuan

	if err := config.DB.Raw(query, id_pertemuan).Scan(&response).Error; err != nil {
		helpers.Response(w, 500, "Gagal mengambil data absensi siswa", nil)
		return
	}

	helpers.Response(w, 200, "Daftar Absensi Siswa Pertemuan", response)

}
