package controllers

import (
	"Pasti/config"
	"Pasti/helpers"
	"Pasti/models"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
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

func GetDaftarPertemuanPerPelajaran(w http.ResponseWriter, r *http.Request) {
	siswaInfo := r.Context().Value("siswainfo").(*helpers.MyCustomClaims)

	log.Println("Siswa Info:", siswaInfo.ID)

	if siswaInfo == nil {
		helpers.Response(w, 401, "Unauthorized: no siswa info in context", nil)
		return
	}

	idJadwal := r.URL.Query().Get("id_jadwal_pelajaran")

	type Result struct {
		IDJadwalPelajaran uint
		NamaMapel         string
		NamaKelas         string
		NamaGuru          string
		NipGuru           string

		IDPertemuan      uint
		PertemuanKe      int
		TanggalPertemuan time.Time
		MateriPertemuan  string
		TokenAbsen       string

		StatusKehadiran string
		WaktuAbsen      *time.Time
		IDAbsensi       *uint
	}

	var results []Result

	query := `
	SELECT
		v_dpm.id_jadwal_pelajaran,
		v_dpm.nama_mapel,
		v_dpm.nama_kelas,
		v_dpm.nama_guru,
		v_dpm.nip_guru,

		v_dpm.id_pertemuan,
		v_dpm.pertemuan_ke,
		v_dpm.tanggal_pertemuan,
		v_dpm.materi_pertemuan,
		v_dpm.token_absen,

		COALESCE(a.status, 'Belum Absen') AS status_kehadiran,
		a.waktu_absen,
		a.id_absensi

	FROM
		view_detail_pertemuan_matakuliah v_dpm
	LEFT JOIN
		absensi a ON v_dpm.id_pertemuan = a.id_pertemuan AND a.id_siswa = ?
	WHERE
		v_dpm.id_jadwal_pelajaran = ?
	ORDER BY
		v_dpm.tanggal_pertemuan ASC, v_dpm.pertemuan_ke ASC;`

	log.Println("Id Jadwal:", idJadwal)
	if err := config.DB.Raw(query, siswaInfo.ID, idJadwal).Scan(&results).Error; err != nil {
		helpers.Response(w, 500, "Gagal mengambil data", nil)
		return
	}

	// Cek jika data kosong
	if len(results) == 0 {
		helpers.Response(w, 404, "Data tidak ditemukan", nil)
		return
	}

	// Ambil info mapel dari data pertama
	mapel := models.InfoMapel{
		IDJadwalPelajaran: results[0].IDJadwalPelajaran,
		NamaMapel:         results[0].NamaMapel,
		NamaKelas:         results[0].NamaKelas,
		NamaGuru:          results[0].NamaGuru,
		NipGuru:           results[0].NipGuru,
	}

	// Susun data pertemuan
	var pertemuanList []models.PertemuanItem
	for _, r := range results {
		pertemuanList = append(pertemuanList, models.PertemuanItem{
			IDPertemuan:      r.IDPertemuan,
			PertemuanKe:      r.PertemuanKe,
			TanggalPertemuan: r.TanggalPertemuan,
			MateriPertemuan:  r.MateriPertemuan,
			TokenAbsen:       r.TokenAbsen,
			StatusKehadiran:  r.StatusKehadiran,
			WaktuAbsen:       r.WaktuAbsen,
			IDAbsensi:        r.IDAbsensi,
		})
	}

	response := models.ResponsePertemuan{
		Mapel:     mapel,
		Pertemuan: pertemuanList,
	}

	helpers.Response(w, 200, "Daftar Pertemuan Per Pelajaran", response)
}

func AbsenPertemuan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tokenAbsen := vars["token"]

	log.Println("Token Absen:", tokenAbsen)

	if tokenAbsen == "" {
		helpers.Response(w, 400, "Token Absen tidak invalid pada URL", nil)
		return
	}

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

	var pertemuan models.RequestAbsensi

	if err := config.DB.Raw("SELECT * FROM pertemuan WHERE token_absen = ?", tokenAbsen).Scan(&pertemuan).Error; err != nil {
		helpers.Response(w, 500, "Gagal mengambil data pertemuan", nil)
		return
	}

	if pertemuan.ID == 0 {
		helpers.Response(w, 404, "Pertemuan tidak ditemukan", nil)
		return
	}

	var existingAbsensi models.Absensi
	err := config.DB.Raw(`
		SELECT * FROM absensi 
		WHERE id_pertemuan = ? AND id_siswa = ?
	`, pertemuan.ID, siswa.ID).Scan(&existingAbsensi).Error

	if err != nil {
		helpers.Response(w, 500, "Gagal mengecek kehadiran", nil)
		return
	}

	if existingAbsensi.IDAbsensi != 0 {
		helpers.Response(w, 400, "Anda sudah absen pada pertemuan ini", nil)
		return
	}

	newAbsensi := models.Absensi{
		IDPertemuan: pertemuan.ID,
		IDSiswa: siswa.ID,
		Status: "Hadir",
		WaktuAbsen: time.Now(),
		Keterangan: "Hadir",
	}

	if err := config.DB.Create(&newAbsensi).Error; err != nil {
		helpers.Response(w, 500, "Gagal menyimpan absensi", nil)
		return
	}

	helpers.Response(w, 200, "Absen berhasil", newAbsensi)
}
