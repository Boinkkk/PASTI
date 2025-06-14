package controllers

import (
	"Pasti/helpers"
	"net/http"
)

// Manual trigger untuk test notifikasi
func TriggerNotificationTest(w http.ResponseWriter, r *http.Request) {
	notifService := helpers.NewNotifikasiService()
	
	// Jalankan cron job secara manual
	go notifService.RunNotificationCron()
	
	helpers.Response(w, 200, "Notification cron job triggered successfully", map[string]interface{}{
		"status": "running",
	})
}

// Get notification stats
func GetNotificationStats(w http.ResponseWriter, r *http.Request) {
	// Query statistik notifikasi dari database
	// Implementasi query untuk mendapatkan stats
	
	helpers.Response(w, 200, "Feature coming soon", map[string]interface{}{
		"status": "success",
	})
}
