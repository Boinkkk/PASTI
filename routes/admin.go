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
	
	// Admin get all kelas data
	adminProtected.HandleFunc("/kelas", controllers.GetAllKelas).Methods("GET")
}
