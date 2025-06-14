# 🔔 Sistem Notifikasi WhatsApp PASTI

## Deskripsi
Sistem notifikasi otomatis yang mengirim pesan WhatsApp kepada siswa untuk mengingatkan tentang deadline tugas menggunakan Fonnte API.

## Fitur Utama

### 1. Notifikasi Otomatis
- **3 hari sebelum deadline**: Peringatan dini
- **1 hari sebelum deadline**: Peringatan mendesak
- **2 jam sebelum deadline**: Peringatan kritis
- **Setelah lewat deadline**: Notifikasi keterlambatan

### 2. Anti-Duplikasi
- **Database constraint**: Unique constraint pada kombinasi tugas_id, siswa_id, jenis_notifikasi, tanggal_kirim
- **In-memory cache**: Mencegah pengiriman ulang dalam 1 jam terakhir
- **Windowing**: Hanya mengirim dalam window waktu tertentu (±30 menit dari target time)

### 3. Logging & Tracking
- Semua notifikasi dicatat dalam tabel `notifikasi_tugas`
- Status pengiriman (terkirim/gagal)
- Response API dari Fonnte

## Konfigurasi

### Environment Variables (.env)
```bash
FONNTE_API_KEY=your_fonnte_api_key_here
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pasti
```

### Database Schema
```sql
-- Tabel notifikasi_tugas untuk tracking
CREATE TABLE notifikasi_tugas (
  id int AUTO_INCREMENT PRIMARY KEY,
  tugas_id int NOT NULL,
  siswa_id int NOT NULL,
  jenis_notifikasi enum('3_hari','1_hari','2_jam','lewat_deadline'),
  tanggal_kirim timestamp DEFAULT CURRENT_TIMESTAMP,
  status enum('terkirim','gagal') DEFAULT 'terkirim',
  response_api text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_notifikasi_tugas_unique (tugas_id, siswa_id, jenis_notifikasi, DATE(tanggal_kirim))
);
```

## Cara Kerja

### Cron Job Schedule
- **Frekuensi**: Setiap 60 menit
- **Timezone**: UTC
- **Auto-start**: Ya, ketika aplikasi dimulai

### Query Logic
```sql
-- Contoh query untuk notifikasi 1 hari sebelum deadline
SELECT DISTINCT
    t.tugas_id, t.judul_tugas, t.deadline_pengumpulan,
    s.siswa_id, s.nama_lengkap, s.no_telepon
FROM tugas t
JOIN jadwalpelajaran jp ON t.jadwal_id = jp.jadwal_id
JOIN matapelajaran mp ON jp.mapel_id = mp.mapel_id
JOIN kelas k ON jp.kelas_id = k.kelas_id
JOIN siswa s ON k.kelas_id = s.kelas_id
LEFT JOIN pengumpulantugas pt ON t.tugas_id = pt.tugas_id AND s.siswa_id = pt.siswa_id
LEFT JOIN notifikasi_tugas nt ON t.tugas_id = nt.tugas_id 
    AND s.siswa_id = nt.siswa_id 
    AND nt.jenis_notifikasi = '1_hari'
WHERE t.deadline_pengumpulan BETWEEN ? AND ?
    AND s.no_telepon IS NOT NULL 
    AND pt.pengumpulan_id IS NULL  -- Belum mengumpulkan
    AND nt.id IS NULL  -- Belum pernah dikirim
```

## API Endpoints

### Manual Trigger (untuk testing)
```http
POST /api/guru/notifications/trigger
Authorization: Bearer {jwt_token}
```

### Get Statistics
```http
GET /api/guru/notifications/stats  
Authorization: Bearer {jwt_token}
```

## Testing

### Manual Test
1. Jalankan server: `go run main.go`
2. Login sebagai guru untuk mendapatkan JWT token
3. Jalankan: `PowerShell -ExecutionPolicy Bypass -File test_notifications.ps1`

### Verifikasi
1. Check log output di console
2. Check tabel `notifikasi_tugas` di database
3. Check pesan WhatsApp yang dikirim (jika ada nomor valid)

## Format Pesan WhatsApp

### Reminder (1-3 hari sebelum)
```
🔔 *REMINDER TUGAS* 🔔

Halo {nama_siswa}!

📚 *Tugas:* {judul_tugas}
📖 *Mata Pelajaran:* {nama_mapel}
🏫 *Kelas:* {nama_kelas}
⏰ *Deadline:* {deadline} (besok)
🎯 *Poin Maksimal:* {poin}

⚠️ Jangan lupa untuk mengumpulkan tugas ya!

Akses sistem PASTI:
🌐 http://localhost:5174/tugas-siswa
```

### Overdue
```
⚠️ *TUGAS TERLAMBAT* ⚠️

Halo {nama_siswa}!

📚 *Tugas:* {judul_tugas}
📖 *Mata Pelajaran:* {nama_mapel}  
🏫 *Kelas:* {nama_kelas}
⏰ *Deadline:* {deadline} (SUDAH LEWAT)

🚨 Tugas ini sudah melewati deadline...
```

## Troubleshooting

### Cek Log
```bash
# Di console server akan muncul:
🔔 Running notification cron job...
📋 Found X students to notify (1_hari)
✅ WhatsApp sent to 6281234567890
⏰ Found X overdue tasks to notify
✅ Notification cron job completed
```

### Database Issues
- Pastikan tabel `notifikasi_tugas` sudah dibuat
- Cek foreign key constraints ke tabel `tugas` dan `siswa`
- Verify data tugas dan siswa ada di database

### API Issues  
- Verify FONNTE_API_KEY di .env
- Test manual ke Fonnte API
- Cek format nomor telepon (harus dimulai 62 atau 0)

### Cache Issues
- Cache akan auto-cleanup setiap 24 jam
- Restart aplikasi untuk reset cache
- Log akan menunjukkan "recently sent" jika di-skip

## Dependencies

```go
// go.mod
require (
    github.com/robfig/cron/v3 v3.0.1
    github.com/gorilla/mux v1.8.0
    github.com/joho/godotenv v1.4.0
    gorm.io/gorm v1.25.0
)
```

## File Structure
```
helpers/
├── notifikasi.go          # Service utama
├── response.go            # Response helper
└── ...

controllers/
├── notificationcontroller.go  # Manual trigger endpoints
└── ...

cron/
└── scheduler.go           # Cron job starter

migrations/
└── create_notifikasi_tugas_table.sql
```
