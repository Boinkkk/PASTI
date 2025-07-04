package routes

import (
	"Pasti/controllers"
	"Pasti/middleware"

	"github.com/gorilla/mux"
)

func AbsensiRoute(r *mux.Router) {
	router := r.PathPrefix("/absensi").Subrouter()

	router.Use(middleware.Auth)

	router.HandleFunc("/daftarPelajaran", controllers.GetDaftarPelajaranPerKelas).Methods("GET")
	router.HandleFunc("/daftarPertemuan", controllers.GetDaftarPertemuanPerPelajaran).Methods("GET")
	router.HandleFunc("/{token}", controllers.AbsenPertemuan).Methods("POST")
}