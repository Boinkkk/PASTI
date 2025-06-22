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
	router.HandleFunc("/profile/password", controllers.UpdateGuruPassword).Methods("PUT")
	router.HandleFunc("/jadwalMengajar", controllers.GetDaftarMengajar).Methods("GET")
	router.HandleFunc("/pertemuan", controllers.GetAbsensiSiswaPertemuan).Methods("GET")
	router.HandleFunc("/absensi", controllers.GetDetailAbsensiSiswa).Methods("GET")
	
	// Pertemuan management routes
	router.HandleFunc("/pertemuan/{id}/status", controllers.UpdateStatusPertemuan).Methods("PUT")
	
	// Absensi management routes
	router.HandleFunc("/absensi/{id}/status", controllers.UpdateStatusAbsensi).Methods("PUT")
	router.HandleFunc("/absensi/manual", controllers.CreateManualAbsensi).Methods("POST")

	// Siswa management routes	// Siswa management routes
	router.HandleFunc("/siswa", controllers.GetAllSiswa).Methods("GET")
	
	// Tugas management routes
	router.HandleFunc("/tugas", controllers.GetTugasGuru).Methods("GET")
	router.HandleFunc("/tugas/jadwal/{jadwal_id}", controllers.GetTugasByJadwal).Methods("GET")
	router.HandleFunc("/tugas", controllers.CreateTugas).Methods("POST")
	router.HandleFunc("/tugas/{tugas_id}", controllers.UpdateTugas).Methods("PUT")
	router.HandleFunc("/tugas/{tugas_id}", controllers.DeleteTugas).Methods("DELETE")
	router.HandleFunc("/tugas/{tugas_id}/detail", controllers.GetTugasDetail).Methods("GET")
	router.HandleFunc("/tugas/{tugas_id}/pengumpulan", controllers.GetPengumpulanByTugas).Methods("GET")
	router.HandleFunc("/tugas/pengumpulan/{pengumpulan_id}/poin", controllers.UpdateStudentPoints).Methods("PUT")
	
	// Notification routes (admin only - untuk testing)
	router.HandleFunc("/notifications/trigger", controllers.TriggerNotificationTest).Methods("POST")
	router.HandleFunc("/notifications/stats", controllers.GetNotificationStats).Methods("GET")
}
