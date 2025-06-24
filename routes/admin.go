package routes

import (
	"Pasti/controllers"
	"Pasti/middleware"

	"github.com/gorilla/mux"
)

func AdminRoutes(r *mux.Router) {
	// Admin auth routes (no middleware needed)
	r.HandleFunc("/admin/login", controllers.LoginAdmin).Methods("POST")
	
	// Protected admin routes (require admin authentication)
	adminProtected := r.PathPrefix("/admin").Subrouter()
	adminProtected.Use(middleware.AuthAdmin)
	
	// Admin profile
	adminProtected.HandleFunc("/profile", controllers.GetAdminProfile).Methods("GET")
		// Admin upload siswa data
	adminProtected.HandleFunc("/upload-siswa", controllers.UploadSiswaData).Methods("POST")
		// Admin upload guru data
	adminProtected.HandleFunc("/upload-guru", controllers.UploadGuruData).Methods("POST")
		// Admin view siswa data
	adminProtected.HandleFunc("/siswa", controllers.GetAllSiswaData).Methods("GET")
		// Admin update siswa data
	adminProtected.HandleFunc("/siswa/{id}", controllers.UpdateSiswa).Methods("PUT")
	
	// Admin update siswa password
	adminProtected.HandleFunc("/siswa/{id}/password", controllers.UpdateSiswaPassword).Methods("PUT")
	// Admin get all kelas data
	adminProtected.HandleFunc("/kelas", controllers.GetAllKelas).Methods("GET")
	
	// Admin get all mata pelajaran data
	adminProtected.HandleFunc("/mapel", controllers.GetAllMapel).Methods("GET")
	
	// Admin view guru data
	adminProtected.HandleFunc("/guru", controllers.GetAllGuruData).Methods("GET")
	
	// Admin update guru data
	adminProtected.HandleFunc("/guru/{id}", controllers.UpdateGuru).Methods("PUT")
	
	// Admin update guru password
	adminProtected.HandleFunc("/guru/{id}/password", controllers.UpdateGuruPasswordByAdmin).Methods("PUT")
	
	// Admin upload jadwal pelajaran (manual)
	adminProtected.HandleFunc("/upload-jadwal", controllers.UploadJadwalData).Methods("POST")
		// Admin upload jadwal pelajaran (CSV)
	adminProtected.HandleFunc("/upload-jadwal-csv", controllers.UploadJadwalCSV).Methods("POST")
	// Analytics dashboard
	adminProtected.HandleFunc("/analytics/dashboard", controllers.GetAnalyticsDashboard).Methods("GET")
	
	// Attendance report dengan cursor pagination
	adminProtected.HandleFunc("/analytics/attendance-report", controllers.GetAttendanceReport).Methods("GET")
	
	// Bulk grade calculation endpoints
	adminProtected.HandleFunc("/analytics/bulk-grade-calculation", controllers.CalculateBulkGrades).Methods("POST")
	adminProtected.HandleFunc("/analytics/bulk-grade-history", controllers.GetBulkGradeHistory).Methods("GET")
}
