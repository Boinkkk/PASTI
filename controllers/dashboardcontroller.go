package controllers

import (
	"Pasti/config"
	"Pasti/helpers"
	"encoding/base64"
	"net/http"
	"strconv"
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

// Struct untuk analytics dashboard admin
type AnalyticsDashboard struct {
	TotalStudents       int                    `json:"total_students"`
	TotalTeachers       int                    `json:"total_teachers"`
	TotalClasses        int                    `json:"total_classes"`
	TotalSubjects       int                    `json:"total_subjects"`
	AttendanceOverview  AttendanceOverview     `json:"attendance_overview"`
	RecentActivities    []RecentActivity       `json:"recent_activities"`
	StudentPerformance  []StudentPerformance   `json:"student_performance"`
	AttendanceByClass   []AttendanceByClass    `json:"attendance_by_class"`
}

type AttendanceOverview struct {
	TotalSessions    int     `json:"total_sessions"`
	PresentCount     int     `json:"present_count"`
	AbsentCount      int     `json:"absent_count"`
	PermissionCount  int     `json:"permission_count"`
	SickCount        int     `json:"sick_count"`
	AttendanceRate   float64 `json:"attendance_rate"`
}

type RecentActivity struct {
	ActivityID   int       `json:"activity_id"`
	ActivityType string    `json:"activity_type"`
	Description  string    `json:"description"`
	UserName     string    `json:"user_name"`
	CreatedAt    time.Time `json:"created_at"`
}

type StudentPerformance struct {
	StudentID   int     `json:"student_id"`
	StudentName string  `json:"student_name"`
	ClassName   string  `json:"class_name"`
	TotalTasks  int     `json:"total_tasks"`
	CompletedTasks int  `json:"completed_tasks"`
	AverageScore float64 `json:"average_score"`
	AttendanceRate float64 `json:"attendance_rate"`
}

type AttendanceByClass struct {
	ClassID        int     `json:"class_id"`
	ClassName      string  `json:"class_name"`
	TotalStudents  int     `json:"total_students"`
	PresentCount   int     `json:"present_count"`
	AttendanceRate float64 `json:"attendance_rate"`
}

// Struct untuk attendance report dengan cursor pagination
type AttendanceReportRequest struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	ClassID   int    `json:"class_id,omitempty"`
	Cursor    string `json:"cursor,omitempty"`
	Limit     int    `json:"limit,omitempty"`
}

type AttendanceReportItem struct {
	StudentID       int       `json:"student_id"`
	StudentName     string    `json:"student_name"`
	ClassName       string    `json:"class_name"`
	SubjectName     string    `json:"subject_name"`
	TeacherName     string    `json:"teacher_name"`
	AttendanceDate  time.Time `json:"attendance_date"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
}

type AttendanceReportResponse struct {
	Data       []AttendanceReportItem `json:"data"`
	NextCursor string                 `json:"next_cursor"`
	HasMore    bool                   `json:"has_more"`
	Total      int                    `json:"total"`
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
			AND p.tanggal >= DATE_SUB(NOW(), INTERVAL 30 DAY)
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
		JOIN pertemuan p ON a.id_pertemuan = p.id_pertemuan		WHERE a.id_siswa = ?
			AND p.tanggal >= DATE_SUB(NOW(), INTERVAL 30 DAY)
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

// Get analytics dashboard data untuk admin
func GetAnalyticsDashboard(w http.ResponseWriter, r *http.Request) {
	var dashboard AnalyticsDashboard
	// Get total counts
	var totalStudents, totalTeachers, totalClasses, totalSubjects int64
	
	config.DB.Table("siswa").Count(&totalStudents)
	config.DB.Table("guru").Count(&totalTeachers)
	config.DB.Table("kelas").Count(&totalClasses)
	config.DB.Table("matapelajaran").Count(&totalSubjects)

	dashboard.TotalStudents = int(totalStudents)
	dashboard.TotalTeachers = int(totalTeachers)
	dashboard.TotalClasses = int(totalClasses)
	dashboard.TotalSubjects = int(totalSubjects)
	// Get attendance overview
	var overview AttendanceOverview
	attendanceQuery := `
		SELECT 
			COUNT(*) as total_sessions,
			SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as present_count,
			SUM(CASE WHEN status = 'Alpha' OR status = 'Tidak Hadir' THEN 1 ELSE 0 END) as absent_count,
			SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) as permission_count,
			SUM(CASE WHEN status = 'Sakit' THEN 1 ELSE 0 END) as sick_count
		FROM absensi 
		WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
	`
	
	err := config.DB.Raw(attendanceQuery).Scan(&overview).Error
	if err != nil {
		helpers.Response(w, 500, "Gagal mengambil data attendance overview", nil)
		return
	}

	if overview.TotalSessions > 0 {
		overview.AttendanceRate = float64(overview.PresentCount) / float64(overview.TotalSessions) * 100
	}
	dashboard.AttendanceOverview = overview

	// Get recent activities (recent assignments, attendance, etc.)
	var activities []RecentActivity
	activityQuery := `
		SELECT 
			t.tugas_id as activity_id,
			'Assignment Created' as activity_type,
			CONCAT('Tugas "', t.judul_tugas, '" dibuat untuk mata pelajaran ', mp.nama_mapel) as description,
			g.nama_lengkap as user_name,
			t.created_at
		FROM tugas t
		JOIN jadwalpelajaran jp ON t.jadwal_id = jp.jadwal_id
		JOIN guru g ON jp.guru_id = g.guru_id
		JOIN matapelajaran mp ON jp.mapel_id = mp.mapel_id
		WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
		ORDER BY t.created_at DESC
		LIMIT 10
	`
	
	err = config.DB.Raw(activityQuery).Scan(&activities).Error
	if err != nil {
		helpers.Response(w, 500, "Gagal mengambil data recent activities", nil)
		return
	}
	dashboard.RecentActivities = activities

	// Get student performance (top 10)
	var performance []StudentPerformance
	performanceQuery := `
		SELECT 
			s.siswa_id as student_id,
			s.nama_lengkap as student_name,
			k.nama_kelas as class_name,
			COUNT(DISTINCT t.tugas_id) as total_tasks,
			COUNT(DISTINCT pt.tugas_id) as completed_tasks,
			COALESCE(AVG(pt.poin_didapat), 0) as average_score,			COALESCE(
				(SELECT 
					(SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
				FROM absensi a 
				JOIN pertemuan p ON a.id_pertemuan = p.id_pertemuan
				JOIN jadwalpelajaran jp2 ON p.id_jadwal = jp2.jadwal_id
				WHERE a.id_siswa = s.siswa_id 
					AND jp2.kelas_id = s.kelas_id
					AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
				), 0
			) as attendance_rate
		FROM siswa s
		JOIN kelas k ON s.kelas_id = k.kelas_id
		LEFT JOIN jadwalpelajaran jp ON s.kelas_id = jp.kelas_id
		LEFT JOIN tugas t ON jp.jadwal_id = t.jadwal_id
		LEFT JOIN pengumpulantugas pt ON t.tugas_id = pt.tugas_id AND s.siswa_id = pt.siswa_id
		GROUP BY s.siswa_id, s.nama_lengkap, k.nama_kelas
		ORDER BY average_score DESC, attendance_rate DESC
		LIMIT 10
	`
	
	err = config.DB.Raw(performanceQuery).Scan(&performance).Error
	if err != nil {
		helpers.Response(w, 500, "Gagal mengambil data student performance", nil)
		return
	}
	dashboard.StudentPerformance = performance

	// Get attendance by class
	var attendanceByClass []AttendanceByClass
	classAttendanceQuery := `
		SELECT 
			k.kelas_id as class_id,
			k.nama_kelas as class_name,
			COUNT(DISTINCT s.siswa_id) as total_students,			SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) as present_count,
			CASE 
				WHEN COUNT(*) > 0 THEN (SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
				ELSE 0 
			END as attendance_rate
		FROM kelas k
		LEFT JOIN siswa s ON k.kelas_id = s.kelas_id
		LEFT JOIN absensi a ON s.siswa_id = a.id_siswa
		WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) OR a.created_at IS NULL
		GROUP BY k.kelas_id, k.nama_kelas
		ORDER BY attendance_rate DESC
	`
	
	err = config.DB.Raw(classAttendanceQuery).Scan(&attendanceByClass).Error
	if err != nil {
		helpers.Response(w, 500, "Gagal mengambil data attendance by class", nil)
		return
	}
	dashboard.AttendanceByClass = attendanceByClass

	helpers.Response(w, 200, "Analytics dashboard data berhasil diambil", dashboard)
}

// Get detailed attendance report dengan cursor pagination
func GetAttendanceReport(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	startDate := r.URL.Query().Get("start_date")
	endDate := r.URL.Query().Get("end_date")
	classID := r.URL.Query().Get("class_id")
	cursor := r.URL.Query().Get("cursor")
	limitStr := r.URL.Query().Get("limit")

	// Set default limit
	limit := 50
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	// Set default date range (last 30 days)
	if startDate == "" {
		startDate = time.Now().AddDate(0, 0, -30).Format("2006-01-02")
	}
	if endDate == "" {
		endDate = time.Now().Format("2006-01-02")
	}
	// Base query
	baseQuery := `
		SELECT 
			s.siswa_id as student_id,
			s.nama_lengkap as student_name,
			k.nama_kelas as class_name,
			mp.nama_mapel as subject_name,
			g.nama_lengkap as teacher_name,
			DATE(p.tanggal) as attendance_date,
			a.status,
			a.created_at
		FROM absensi a
		JOIN siswa s ON a.id_siswa = s.siswa_id
		JOIN kelas k ON s.kelas_id = k.kelas_id
		JOIN pertemuan p ON a.id_pertemuan = p.id_pertemuan
		JOIN jadwalpelajaran jp ON p.id_jadwal = jp.jadwal_id
		JOIN matapelajaran mp ON jp.mapel_id = mp.mapel_id
		JOIN guru g ON jp.guru_id = g.guru_id
		WHERE DATE(p.tanggal) >= ? AND DATE(p.tanggal) <= ?
	`
	
	args := []interface{}{startDate, endDate}

	// Add class filter if specified
	if classID != "" && classID != "0" {
		baseQuery += " AND s.kelas_id = ?"
		args = append(args, classID)
	}

	// Add cursor condition for pagination
	if cursor != "" {
		baseQuery += " AND a.created_at > ?"
		// Decode cursor (base64 encoded timestamp)
		decodedCursor, err := base64.StdEncoding.DecodeString(cursor)
		if err != nil {
			helpers.Response(w, 400, "Invalid cursor format", nil)
			return
		}
		args = append(args, string(decodedCursor))
	}

	baseQuery += " ORDER BY a.created_at ASC LIMIT ?"
	args = append(args, limit+1) // Get one extra to check if there's more

	// Execute query
	var reportData []AttendanceReportItem
	err := config.DB.Raw(baseQuery, args...).Scan(&reportData).Error
	if err != nil {
		helpers.Response(w, 500, "Gagal mengambil data laporan kehadiran", nil)
		return
	}

	// Prepare response
	response := AttendanceReportResponse{
		Data:    reportData,
		HasMore: false,
	}

	// Check if there's more data
	if len(reportData) > limit {
		response.HasMore = true
		response.Data = reportData[:limit] // Remove the extra item
		
		// Create next cursor from the last item's created_at
		lastItem := reportData[limit-1]
		nextCursor := base64.StdEncoding.EncodeToString([]byte(lastItem.CreatedAt.Format("2006-01-02 15:04:05")))
		response.NextCursor = nextCursor
	}

	// Get total count (optional, can be expensive for large datasets)
	var totalCount int64
	countQuery := `
		SELECT COUNT(*)		FROM absensi a
		JOIN siswa s ON a.id_siswa = s.siswa_id
		WHERE a.created_at >= ? AND a.created_at <= ?
	`
	countArgs := []interface{}{startDate, endDate}
	
	if classID != "" && classID != "0" {
		countQuery += " AND s.kelas_id = ?"
		countArgs = append(countArgs, classID)
	}
	
	config.DB.Raw(countQuery, countArgs...).Count(&totalCount)
	response.Total = int(totalCount)

	helpers.Response(w, 200, "Laporan kehadiran berhasil diambil", response)
}
