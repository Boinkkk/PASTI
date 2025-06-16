package routes

import (
	"Pasti/controllers"
	"Pasti/middleware"

	"github.com/gorilla/mux"
)

func SiswaRoutes(r *mux.Router) {
	router := r.PathPrefix("/users").Subrouter()
	router.Use(middleware.Auth)	// Profile endpoints
	router.HandleFunc("/me", controllers.Me).Methods("GET")
	router.HandleFunc("/profile", controllers.UpdateSiswaProfile).Methods("PUT")
	
	// Dashboard endpoints
	router.HandleFunc("/tugas/mendekati-deadline", controllers.GetTugasMendekatiDeadline).Methods("GET")
	router.HandleFunc("/statistik-kehadiran", controllers.GetStatistikKehadiran).Methods("GET")
	router.HandleFunc("/dashboard-summary", controllers.GetDashboardSummary).Methods("GET")
	
	// Tugas endpoints for siswa
	router.HandleFunc("/tugas", controllers.GetTugasSiswa).Methods("GET")
	router.HandleFunc("/tugas/{tugas_id}/submit", controllers.SubmitTugas).Methods("POST")
	router.HandleFunc("/tugas/{tugas_id}/detail", controllers.GetDetailPengumpulan).Methods("GET")
	router.HandleFunc("/tugas/{tugas_id}/submit", controllers.DeletePengumpulan).Methods("DELETE")
}