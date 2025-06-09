package routes

import (
	"Pasti/controllers"
	"Pasti/middleware"

	"github.com/gorilla/mux"
)

func GuruRoutes(r *mux.Router) {
	router := r.PathPrefix("/guru").Subrouter()

	// Semua route guru memerlukan autentikasi
	router.Use(middleware.AuthGuru)

	// Profile routes
	router.HandleFunc("/profile", controllers.GetGuruProfile).Methods("GET")

	// Siswa management routes
	router.HandleFunc("/siswa", controllers.GetAllSiswa).Methods("GET")
}
