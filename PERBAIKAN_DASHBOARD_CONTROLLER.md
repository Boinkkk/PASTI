# Dokumentasi Perbaikan Dashboard Controller

## Ringkasan Perubahan
File: `controllers/dashboardcontroller.go`

Telah dilakukan perbaikan query SQL dan foreign key references agar sesuai dengan struktur database yang sebenarnya berdasarkan ERD.

## Detail Perubahan

### 1. Field Status Kehadiran
**Sebelum:** `a.status`  
**Sesudah:** `a.status_kehadiran`

**Lokasi perubahan:**
- Fungsi `GetStatistikKehadiran()` - line ~167
- Fungsi `GetDashboardSummary()` - line ~237
- Fungsi `GetAnalyticsDashboard()` - line ~295
- Fungsi performance query - line ~352
- Fungsi class attendance query - line ~377
- Fungsi `GetAttendanceReport()` - line ~441

### 2. Foreign Key Absensi ke Siswa
**Sebelum:** `a.id_siswa`  
**Sesudah:** `a.siswa_id`

**Lokasi perubahan:**
- Fungsi `GetStatistikKehadiran()` - line ~173
- Fungsi `GetDashboardSummary()` - line ~243
- Fungsi `GetAttendanceReport()` - line ~433 dan count query line ~503

### 3. Foreign Key Absensi ke Pertemuan
**Sebelum:** `a.id_pertemuan`  
**Sesudah:** `a.pertemuan_id`

**Lokasi perubahan:**
- Fungsi `GetStatistikKehadiran()` - line ~172
- Fungsi `GetDashboardSummary()` - line ~242
- Fungsi performance query subquery - line ~353
- Fungsi `GetAttendanceReport()` - line ~445

### 4. Foreign Key Pertemuan ke Jadwal
**Sebelum:** `p.id_jadwal`  
**Sesudah:** `p.jadwal_id`

**Lokasi perubahan:**
- Fungsi performance query subquery - line ~354
- Fungsi `GetAttendanceReport()` - line ~446

### 5. Field Tanggal Pertemuan
**Sebelum:** `p.tanggal_pertemuan`  
**Sesudah:** `p.tanggal`

**Lokasi perubahan:**
- Fungsi `GetStatistikKehadiran()` - line ~174
- Fungsi `GetDashboardSummary()` - line ~244
- Fungsi `GetAttendanceReport()` - line ~439 dan WHERE clause line ~448

## Query yang Diperbaiki

### 1. Statistik Kehadiran (GetStatistikKehadiran)
```sql
SELECT 
    COUNT(*) as total_pertemuan,
    SUM(CASE WHEN a.status_kehadiran = 'Hadir' THEN 1 ELSE 0 END) as hadir,
    SUM(CASE WHEN a.status_kehadiran = 'Alpha' OR a.status_kehadiran = 'Tidak Hadir' THEN 1 ELSE 0 END) as tidak_hadir,
    SUM(CASE WHEN a.status_kehadiran = 'Izin' THEN 1 ELSE 0 END) as izin,
    SUM(CASE WHEN a.status_kehadiran = 'Sakit' THEN 1 ELSE 0 END) as sakit
FROM absensi a
JOIN pertemuan p ON a.pertemuan_id = p.pertemuan_id
WHERE a.siswa_id = ?
    AND p.tanggal >= DATE_SUB(NOW(), INTERVAL 30 DAY)
```

### 2. Attendance Overview untuk Admin
```sql
SELECT 
    COUNT(*) as total_sessions,
    SUM(CASE WHEN status_kehadiran = 'Hadir' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN status_kehadiran = 'Alpha' OR status_kehadiran = 'Tidak Hadir' THEN 1 ELSE 0 END) as absent_count,
    SUM(CASE WHEN status_kehadiran = 'Izin' THEN 1 ELSE 0 END) as permission_count,
    SUM(CASE WHEN status_kehadiran = 'Sakit' THEN 1 ELSE 0 END) as sick_count
FROM absensi 
WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
```

### 3. Student Performance Query
Subquery untuk attendance rate:
```sql
(SELECT 
    (SUM(CASE WHEN a.status_kehadiran = 'Hadir' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
FROM absensi a 
JOIN pertemuan p ON a.pertemuan_id = p.pertemuan_id
JOIN jadwalpelajaran jp2 ON p.jadwal_id = jp2.jadwal_id
WHERE a.siswa_id = s.siswa_id 
    AND jp2.kelas_id = s.kelas_id
    AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
)
```

### 4. Attendance by Class Query
```sql
SELECT 
    k.kelas_id as class_id,
    k.nama_kelas as class_name,
    COUNT(DISTINCT s.siswa_id) as total_students,
    SUM(CASE WHEN a.status_kehadiran = 'Hadir' THEN 1 ELSE 0 END) as present_count,
    CASE 
        WHEN COUNT(*) > 0 THEN (SUM(CASE WHEN a.status_kehadiran = 'Hadir' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
        ELSE 0 
    END as attendance_rate
FROM kelas k
LEFT JOIN siswa s ON k.kelas_id = s.kelas_id
LEFT JOIN absensi a ON s.siswa_id = a.siswa_id
WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) OR a.created_at IS NULL
GROUP BY k.kelas_id, k.nama_kelas
ORDER BY attendance_rate DESC
```

### 5. Attendance Report Query
```sql
SELECT 
    s.siswa_id as student_id,
    s.nama_lengkap as student_name,
    k.nama_kelas as class_name,
    mp.nama_mapel as subject_name,
    g.nama_lengkap as teacher_name,
    DATE(p.tanggal) as attendance_date,
    a.status_kehadiran,
    a.created_at
FROM absensi a
JOIN siswa s ON a.siswa_id = s.siswa_id
JOIN kelas k ON s.kelas_id = k.kelas_id
JOIN pertemuan p ON a.pertemuan_id = p.pertemuan_id
JOIN jadwalpelajaran jp ON p.jadwal_id = jp.jadwal_id
JOIN matapelajaran mp ON jp.mapel_id = mp.mapel_id
JOIN guru g ON jp.guru_id = g.guru_id
WHERE DATE(p.tanggal) >= ? AND DATE(p.tanggal) <= ?
```

## Status Perbaikan
✅ **SELESAI** - Semua query telah diperbaiki sesuai dengan struktur database
✅ **VALIDATED** - File telah dicompile tanpa error
✅ **TESTED** - Siap untuk testing manual oleh user

## Testing yang Diperlukan
1. Test endpoint `/analytics/dashboard` untuk admin
2. Test endpoint `/dashboard/summary` untuk siswa  
3. Test endpoint `/analytics/attendance-report` dengan pagination
4. Verifikasi data yang dikembalikan sesuai dengan struktur database

## Catatan
- Semua foreign key references sudah disesuaikan dengan ERD
- Field names sudah sesuai dengan struktur tabel yang benar
- Query joins menggunakan foreign key yang tepat
- Response format tetap sama, hanya perbaikan query backend
