package controllers

import (
	"Pasti/config"
	"Pasti/helpers"
	"net/http"
	"time"
)

// Struct untuk tugas mendekati deadline
type TugasMendekatiDeadline struct {
	TugasID             int       `json:"tugas_id"`
	JudulTugas          string    `json:"judul_tugas"`
	DeskripsiTugas      string    `json:"deskripsi_tugas"`
	DeadlinePengumpulan time.Time `json:"deadline_pengumpulan"`
	PoinMaksimal        int       `json:"poin_maksimal"`
	TipeTugas           string    `json:"tipe_tugas"`
	MataPelajaran       string    `json:"mata_pelajaran"`
	NamaGuru            string    `json:"nama_guru"`
	StatusPengumpulan   string    `json:"status_pengumpulan"`
	PoinDidapat         int       `json:"poin_didapat"`
	DaysLeft            int       `json:"days_left"`
}

// Struct untuk statistik kehadiran
type StatistikKehadiran struct {
	TotalPertemuan      int     `json:"total_pertemuan"`
	Hadir               int     `json:"hadir"`
	TidakHadir          int     `json:"tidak_hadir"`
	Izin                int     `json:"izin"`
	Sakit               int     `json:"sakit"`
	PersentaseKehadiran float64 `json:"persentase_kehadiran"`
}

// Get tugas yang mendekati deadline untuk siswa
func GetTugasMendekatiDeadline(w http.ResponseWriter, r *http.Request) {
	// Ambil siswa_id dari token
	siswaID, exists := r.Context().Value("user_id").(int)
	if !exists {
		helpers.Response(w, 401, "Unauthorized", nil)
		return
	}

	var tugas []TugasMendekatiDeadline

	// Query untuk mendapatkan tugas yang mendekati deadline (7 hari ke depan)
	query := `
		SELECT DISTINCT
			t.tugas_id,
			t.judul_tugas,
			t.deskripsi_tugas,
			t.deadline_pengumpulan,
			t.poin_maksimal,
			t.tipe_tugas,
			mp.nama_mapel as mata_pelajaran,
			g.nama_lengkap as nama_guru,
			COALESCE(pt.status_pengumpulan, 'Belum Mengerjakan') as status_pengumpulan,
			COALESCE(pt.poin_didapat, 0) as poin_didapat,
			DATEDIFF(t.deadline_pengumpulan, NOW()) as days_left
		FROM tugas t
		JOIN jadwalpelajaran jp ON t.jadwal_id = jp.jadwal_id
		JOIN matapelajaran mp ON jp.mapel_id = mp.mapel_id
		JOIN guru g ON jp.guru_id = g.guru_id
		JOIN siswa s ON jp.kelas_id = s.kelas_id
		LEFT JOIN pengumpulantugas pt ON t.tugas_id = pt.tugas_id AND s.siswa_id = pt.siswa_id
		WHERE s.siswa_id = ?
			AND t.deadline_pengumpulan >= NOW()
			AND t.deadline_pengumpulan <= DATE_ADD(NOW(), INTERVAL 7 DAY)
		ORDER BY t.deadline_pengumpulan ASC
		LIMIT 10
	`

	err := config.DB.Raw(query, siswaID).Scan(&tugas).Error
	if err != nil {
		helpers.Response(w, 500, "Gagal mengambil data tugas", nil)
		return
	}

	helpers.Response(w, 200, "Data tugas mendekati deadline berhasil diambil", tugas)
}

// Get statistik kehadiran siswa
func GetStatistikKehadiran(w http.ResponseWriter, r *http.Request) {
	// Ambil siswa_id dari token
	siswaID, exists := r.Context().Value("user_id").(int)
	if !exists {
		helpers.Response(w, 401, "Unauthorized", nil)
		return
	}

	var stats StatistikKehadiran

	// Query untuk menghitung statistik kehadiran
	query := `
		SELECT 
			COUNT(*) as total_pertemuan,
			SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
			SUM(CASE WHEN a.status = 'Alpha' OR a.status = 'Tidak Hadir' THEN 1 ELSE 0 END) as tidak_hadir,
			SUM(CASE WHEN a.status = 'Izin' THEN 1 ELSE 0 END) as izin,
			SUM(CASE WHEN a.status = 'Sakit' THEN 1 ELSE 0 END) as sakit
		FROM absensi a
		JOIN pertemuan p ON a.id_pertemuan = p.id_pertemuan
		WHERE a.id_siswa = ?
			AND p.tanggal_pertemuan >= DATE_SUB(NOW(), INTERVAL 30 DAY)
	`

	err := config.DB.Raw(query, siswaID).Scan(&stats).Error
	if err != nil {
		helpers.Response(w, 500, "Gagal mengambil statistik kehadiran", nil)
		return
	}

	// Hitung persentase kehadiran
	if stats.TotalPertemuan > 0 {
		stats.PersentaseKehadiran = (float64(stats.Hadir) / float64(stats.TotalPertemuan)) * 100
	} else {
		stats.PersentaseKehadiran = 0
	}

	helpers.Response(w, 200, "Statistik kehadiran berhasil diambil", stats)
}

// Get dashboard summary untuk siswa
func GetDashboardSummary(w http.ResponseWriter, r *http.Request) {
	// Ambil siswa_id dari token
	siswaID, exists := r.Context().Value("user_id").(int)
	if !exists {
		helpers.Response(w, 401, "Unauthorized", nil)
		return
	}

	// Prepare response data
	dashboardData := map[string]interface{}{}

	// Get tugas mendekati deadline
	var tugas []TugasMendekatiDeadline
	tugasQuery := `
		SELECT DISTINCT
			t.tugas_id,
			t.judul_tugas,
			t.deskripsi_tugas,
			t.deadline_pengumpulan,
			t.poin_maksimal,
			t.tipe_tugas,
			mp.nama_mapel as mata_pelajaran,
			g.nama_lengkap as nama_guru,
			COALESCE(pt.status_pengumpulan, 'Belum Mengerjakan') as status_pengumpulan,
			COALESCE(pt.poin_didapat, 0) as poin_didapat,
			DATEDIFF(t.deadline_pengumpulan, NOW()) as days_left
		FROM tugas t
		JOIN jadwalpelajaran jp ON t.jadwal_id = jp.jadwal_id
		JOIN matapelajaran mp ON jp.mapel_id = mp.mapel_id
		JOIN guru g ON jp.guru_id = g.guru_id
		JOIN siswa s ON jp.kelas_id = s.kelas_id
		LEFT JOIN pengumpulantugas pt ON t.tugas_id = pt.tugas_id AND s.siswa_id = pt.siswa_id
		WHERE s.siswa_id = ?
			AND t.deadline_pengumpulan >= NOW()
			AND t.deadline_pengumpulan <= DATE_ADD(NOW(), INTERVAL 7 DAY)
		ORDER BY t.deadline_pengumpulan ASC
		LIMIT 5
	`
	config.DB.Raw(tugasQuery, siswaID).Scan(&tugas)
	dashboardData["tugas_mendekati_deadline"] = tugas

	// Get statistik kehadiran
	var stats StatistikKehadiran
	statsQuery := `
		SELECT 
			COUNT(*) as total_pertemuan,
			SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
			SUM(CASE WHEN a.status = 'Alpha' OR a.status = 'Tidak Hadir' THEN 1 ELSE 0 END) as tidak_hadir,
			SUM(CASE WHEN a.status = 'Izin' THEN 1 ELSE 0 END) as izin,
			SUM(CASE WHEN a.status = 'Sakit' THEN 1 ELSE 0 END) as sakit
		FROM absensi a
		JOIN pertemuan p ON a.id_pertemuan = p.id_pertemuan
		WHERE a.id_siswa = ?
			AND p.tanggal_pertemuan >= DATE_SUB(NOW(), INTERVAL 30 DAY)
	`
	config.DB.Raw(statsQuery, siswaID).Scan(&stats)
	
	if stats.TotalPertemuan > 0 {
		stats.PersentaseKehadiran = (float64(stats.Hadir) / float64(stats.TotalPertemuan)) * 100
	}
	dashboardData["statistik_kehadiran"] = stats

	// Get total tugas yang belum dikumpulkan
	var totalTugasBelumSelesai int64
	config.DB.Raw(`
		SELECT COUNT(*)
		FROM tugas t
		JOIN jadwalpelajaran jp ON t.jadwal_id = jp.jadwal_id
		JOIN siswa s ON jp.kelas_id = s.kelas_id
		LEFT JOIN pengumpulantugas pt ON t.tugas_id = pt.tugas_id AND s.siswa_id = pt.siswa_id
		WHERE s.siswa_id = ?
			AND pt.pengumpulan_id IS NULL
			AND t.deadline_pengumpulan >= NOW()
	`, siswaID).Scan(&totalTugasBelumSelesai)
	dashboardData["total_tugas_belum_selesai"] = totalTugasBelumSelesai

	helpers.Response(w, 200, "Dashboard summary berhasil diambil", dashboardData)
}
