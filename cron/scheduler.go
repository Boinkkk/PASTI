// cron/scheduler.go
package cron

import (
	"Pasti/helpers"
	"log"
	"time"

	"github.com/robfig/cron/v3"
)

func StartCronJobs() {
    c := cron.New(cron.WithLocation(time.FixedZone("UTC", 0)))
    notifService := helpers.NewNotifikasiService()

	go func() {
        log.Println("🚀 Running notification job immediately on startup...")
        notifService.RunNotificationCron()
    }()
    
    // Jalankan setiap 30 menit
    c.AddFunc("*/60 * * * *", func() {
        log.Println("🔄 Starting scheduled notification job...")
        notifService.RunNotificationCron()
    })
    
    
    log.Println("⏰ Cron jobs started")
    c.Start()
}