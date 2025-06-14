// services/notifikasi_service.go
package helpers

import (
	"Pasti/config"
	"Pasti/models"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sync"
	"time"
)

type NotifikasiService struct {
    FontteAPIKey string
    FontteURL    string
    cache        map[string]time.Time // Cache untuk mencegah duplikasi
    cacheMutex   sync.RWMutex         // Mutex untuk thread safety
}

type WhatsAppMessage struct {
    Target  string `json:"target"`
    Message string `json:"message"`
}

func NewNotifikasiService() *NotifikasiService {
    return &NotifikasiService{
        FontteAPIKey: os.Getenv("FONNTE_API_KEY"),
        FontteURL:    "https://api.fonnte.com/send",
        cache:        make(map[string]time.Time),
        cacheMutex:   sync.RWMutex{},
    }
}

// Struct untuk tugas dengan informasi siswa
type TugasWithSiswa struct {
    TugasID            int       `json:"tugas_id"`
    JudulTugas         string    `json:"judul_tugas"`
    DeadlinePengumpulan time.Time `json:"deadline_pengumpulan"`
    PoinMaksimal       int       `json:"poin_maksimal"`
    NamaMapel          string    `json:"nama_mapel"`
    NamaKelas          string    `json:"nama_kelas"`
    SiswaID            int       `json:"siswa_id"`
    NamaSiswa          string    `json:"nama_siswa"`
    NoTelepon          string    `json:"no_telepon"`
    HasSubmitted       bool      `json:"has_submitted"`
}

// Main function untuk menjalankan cron job
func (ns *NotifikasiService) RunNotificationCron() {
    log.Println("🔔 Running notification cron job...")
      
    ns.sendDeadlineReminders(24 * time.Hour, "1_hari")
    
    log.Println("✅ Notification cron job completed")
}

func (ns *NotifikasiService) sendDeadlineReminders(duration time.Duration, jenisNotifikasi string) {
    targetDate := time.Now().Add(duration)
    // startTime := targetTime.Add(-30 * time.Minute) // Buffer 30 menit
    // endTime := targetTime.Add(30 * time.Minute)

	// testing perpose
	startTime := time.Date(targetDate.Year(), targetDate.Month(), targetDate.Day(), 0, 0, 0, 0, targetDate.Location())
    endTime := time.Date(targetDate.Year(), targetDate.Month(), targetDate.Day(), 23, 59, 59, 0, targetDate.Location())
    var tugasList []TugasWithSiswa
    query := `
        SELECT DISTINCT
            t.tugas_id,
            t.judul_tugas,
            t.deadline_pengumpulan,
            t.poin_maksimal,
            mp.nama_mapel,
            k.nama_kelas,
            s.siswa_id,
            s.nama_lengkap as nama_siswa,
            s.no_telepon,
            CASE 
                WHEN pt.pengumpulan_id IS NOT NULL THEN true 
                ELSE false 
            END as has_submitted
        FROM tugas t
        JOIN jadwalpelajaran jp ON t.jadwal_id = jp.jadwal_id
        JOIN matapelajaran mp ON jp.mapel_id = mp.mapel_id
        JOIN kelas k ON jp.kelas_id = k.kelas_id
        JOIN siswa s ON k.kelas_id = s.kelas_id
        LEFT JOIN pengumpulantugas pt ON t.tugas_id = pt.tugas_id AND s.siswa_id = pt.siswa_id
        LEFT JOIN notifikasi_tugas nt ON t.tugas_id = nt.tugas_id 
            AND s.siswa_id = nt.siswa_id 
            AND nt.jenis_notifikasi = ?
        WHERE t.deadline_pengumpulan BETWEEN ? AND ?
            AND s.no_telepon IS NOT NULL 
            AND s.no_telepon != ''
            AND pt.pengumpulan_id IS NULL  -- Belum mengumpulkan
            AND nt.id IS NULL  -- Belum pernah dikirim notifikasi jenis ini
        ORDER BY t.deadline_pengumpulan ASC
    `
    
    if err := config.DB.Raw(query, jenisNotifikasi, startTime, endTime).Scan(&tugasList).Error; err != nil {
        log.Printf("❌ Error querying tasks: %v", err)
        return
    }
    
    log.Printf("📋 Found %d students to notify (%s)", len(tugasList), jenisNotifikasi)
      // Kirim notifikasi ke setiap siswa
    for _, tugas := range tugasList {
        // Check cache untuk mencegah duplikasi rapid
        cacheKey := fmt.Sprintf("%d_%d_%s", tugas.TugasID, tugas.SiswaID, jenisNotifikasi)
        if ns.isRecentlySent(cacheKey) {
            log.Printf("⏭️ Skipping %s for student %d (recently sent)", jenisNotifikasi, tugas.SiswaID)
            continue
        }
        
        message := ns.generateReminderMessage(tugas, jenisNotifikasi)
        success := ns.sendWhatsAppMessage(tugas.NoTelepon, message)
        
        // Save notification record
        ns.saveNotificationRecord(tugas.TugasID, tugas.SiswaID, jenisNotifikasi, success)
        
        // Update cache
        ns.markAsSent(cacheKey)
        
        // Delay untuk menghindari rate limiting
        time.Sleep(2 * time.Second)
    }
}

func (ns *NotifikasiService) sendOverdueReminders() {    // Query tugas yang sudah lewat deadline tapi belum dikumpulkan
    var tugasList []TugasWithSiswa
    query := `
        SELECT DISTINCT
            t.tugas_id,
            t.judul_tugas,
            t.deadline_pengumpulan,
            t.poin_maksimal,
            mp.nama_mapel,
            k.nama_kelas,
            s.siswa_id,
            s.nama_lengkap as nama_siswa,
            s.no_telepon,
            false as has_submitted
        FROM tugas t
        JOIN jadwalpelajaran jp ON t.jadwal_id = jp.jadwal_id
        JOIN matapelajaran mp ON jp.mapel_id = mp.mapel_id
        JOIN kelas k ON jp.kelas_id = k.kelas_id
        JOIN siswa s ON k.kelas_id = s.kelas_id
        LEFT JOIN pengumpulantugas pt ON t.tugas_id = pt.tugas_id AND s.siswa_id = pt.siswa_id        LEFT JOIN notifikasi_tugas nt ON t.tugas_id = nt.tugas_id 
            AND s.siswa_id = nt.siswa_id 
            AND nt.jenis_notifikasi = 'lewat_deadline'
            AND DATE(nt.tanggal_kirim) = CURDATE()  -- Sudah dikirim hari ini
        WHERE t.deadline_pengumpulan < NOW()
            AND t.deadline_pengumpulan > DATE_SUB(NOW(), INTERVAL 7 DAY)  -- Maksimal 7 hari yang lalu
            AND s.no_telepon IS NOT NULL 
            AND s.no_telepon != ''
            AND pt.pengumpulan_id IS NULL  -- Belum mengumpulkan
            AND nt.id IS NULL  -- Belum dikirim hari ini
    `
    
    if err := config.DB.Raw(query).Scan(&tugasList).Error; err != nil {
        log.Printf("❌ Error querying overdue tasks: %v", err)
        return
    }
    
    log.Printf("⏰ Found %d overdue tasks to notify", len(tugasList))
      for _, tugas := range tugasList {
        // Check cache untuk mencegah duplikasi rapid
        cacheKey := fmt.Sprintf("%d_%d_lewat_deadline", tugas.TugasID, tugas.SiswaID)
        if ns.isRecentlySent(cacheKey) {
            log.Printf("⏭️ Skipping overdue notification for student %d (recently sent)", tugas.SiswaID)
            continue
        }
        
        message := ns.generateOverdueMessage(tugas)
        success := ns.sendWhatsAppMessage(tugas.NoTelepon, message)
        
        ns.saveNotificationRecord(tugas.TugasID, tugas.SiswaID, "lewat_deadline", success)
        ns.markAsSent(cacheKey)
        time.Sleep(2 * time.Second)
    }
}

func (ns *NotifikasiService) generateReminderMessage(tugas TugasWithSiswa, jenisNotifikasi string) string {
    var timeMsg string
    switch jenisNotifikasi {
    case "3_hari":
        timeMsg = "3 hari lagi"
    case "1_hari":
        timeMsg = "besok"
    case "2_jam":
        timeMsg = "2 jam lagi"
    }
    
    location, _ := time.LoadLocation("Asia/Jakarta")
    deadline := tugas.DeadlinePengumpulan.In(location)
    
    message := fmt.Sprintf(`🔔 *REMINDER TUGAS* 🔔

Halo %s!

📚 *Tugas:* %s
📖 *Mata Pelajaran:* %s
🏫 *Kelas:* %s
⏰ *Deadline:* %s (%s)

⚠️ Jangan lupa untuk mengumpulkan tugas ya!

Akses Tugas Disini yaa!:
🌐 http://localhost:5174/tugas

---
📱 Pesan otomatis dari Sistem PASTI`,
        tugas.NamaSiswa,
        tugas.JudulTugas,
        tugas.NamaMapel,
        tugas.NamaKelas,
        deadline.Format("02 Jan 2006 15:04"),
        timeMsg,
    )
    
    return message
}

func (ns *NotifikasiService) generateOverdueMessage(tugas TugasWithSiswa) string {
    location, _ := time.LoadLocation("Asia/Jakarta")
    deadline := tugas.DeadlinePengumpulan.In(location)
    
    message := fmt.Sprintf(`⚠️ *TUGAS TERLAMBAT* ⚠️

Halo %s!

📚 *Tugas:* %s
📖 *Mata Pelajaran:* %s
🏫 *Kelas:* %s
⏰ *Deadline:* %s (SUDAH LEWAT)

🚨 Tugas ini sudah melewati deadline. Segera hubungi guru pengampu untuk menanyakan apakah masih bisa dikumpulkan terlambat.

Akses sistem PASTI:
🌐 http://localhost:5174/tugas-siswa

---
📱 Pesan otomatis dari Sistem PASTI`,
        tugas.NamaSiswa,
        tugas.JudulTugas,
        tugas.NamaMapel,
        tugas.NamaKelas,
        deadline.Format("02 Jan 2006 15:04"),
    )
    
    return message
}

func (ns *NotifikasiService) sendWhatsAppMessage(phoneNumber, message string) bool {
    // Clean nomor telepon (hapus karakter non-digit)
    cleanNumber := ""
    for _, char := range phoneNumber {
        if char >= '0' && char <= '9' {
            cleanNumber += string(char)
        }
    }
    
    // Validasi nomor telepon
    if len(cleanNumber) < 10 {
        log.Printf("❌ Invalid phone number: %s", phoneNumber)
        return false
    }
    
    // Format nomor telepon untuk Fonnte API
    if len(cleanNumber) >= 12 && cleanNumber[0:2] == "62" {
        cleanNumber = "0" + cleanNumber[2:] // 62812... → 0812...
    } else if cleanNumber[0] != '0' {
        cleanNumber = "0" + cleanNumber      // 812... → 0812...
    }
    
    // Format target sesuai API Fonnte: nomor|a (a = WhatsApp)
    target := cleanNumber + "|a"
    
    payload := map[string]string{
        "target":  target,
        "message": message,
    }
    
    jsonData, err := json.Marshal(payload)
    if err != nil {
        log.Printf("❌ Error marshaling JSON: %v", err)
        return false
    }
    
    log.Printf("📱 Sending to target: %s", target)
    
    req, err := http.NewRequest("POST", ns.FontteURL, bytes.NewBuffer(jsonData))
    if err != nil {
        log.Printf("❌ Error creating request: %v", err)
        return false
    }
    
    // Header sesuai dokumentasi Fonnte
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", ns.FontteAPIKey)
    
    client := &http.Client{Timeout: 30 * time.Second}
    resp, err := client.Do(req)
    if err != nil {
        log.Printf("❌ Error sending request: %v", err)
        return false
    }
    defer resp.Body.Close()
    
    // Read response body untuk logging
    var responseBody []byte
    if resp.Body != nil {
        responseBody, _ = io.ReadAll(resp.Body)
    }
    
    log.Printf("📊 Fonnte API Response: Status=%d, Body=%s", resp.StatusCode, string(responseBody))
    
    if resp.StatusCode == 200 {
        log.Printf("✅ WhatsApp sent to %s", target)
        return true
    } else {
        log.Printf("❌ Failed to send to %s, status: %d, response: %s", target, resp.StatusCode, string(responseBody))
        return false
    }
}

func (ns *NotifikasiService) saveNotificationRecord(tugasID, siswaID int, jenisNotifikasi string, success bool) {
    status := "terkirim"
    if !success {
        status = "gagal"
    }
    
    notifikasi := models.NotifikasiTugas{
        TugasID:          tugasID,
        SiswaID:          siswaID,
        JenisNotifikasi:  jenisNotifikasi,
        TanggalKirim:     time.Now(),
        Status:           status,
    }
      if err := config.DB.Create(&notifikasi).Error; err != nil {
        log.Printf("❌ Error saving notification record: %v", err)
    }
}

// Cache methods untuk mencegah duplikasi rapid
func (ns *NotifikasiService) isRecentlySent(cacheKey string) bool {
    ns.cacheMutex.RLock()
    defer ns.cacheMutex.RUnlock()
    
    sentTime, exists := ns.cache[cacheKey]
    if !exists {
        return false
    }
    
    // Cek apakah sudah lewat 1 jam
    return time.Since(sentTime) < time.Hour
}

func (ns *NotifikasiService) markAsSent(cacheKey string) {
    ns.cacheMutex.Lock()
    defer ns.cacheMutex.Unlock()
    
    ns.cache[cacheKey] = time.Now()
    
    // Cleanup cache entries yang sudah lama (lebih dari 24 jam)
    cutoff := time.Now().Add(-24 * time.Hour)
    for key, timestamp := range ns.cache {
        if timestamp.Before(cutoff) {
            delete(ns.cache, key)
        }
    }
}