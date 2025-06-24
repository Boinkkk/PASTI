# Analytics Dashboard Documentation

## Overview
Fitur Analytics Dashboard untuk sistem PASTI menyediakan analisis dan visualisasi data untuk administrator. Dashboard ini menampilkan ringkasan statistik dan aktivitas sistem secara real-time.

## Features

### 1. Dashboard Analytics (`/admin/analytics/dashboard`)
**Backend Endpoint:** `GET /api/admin/analytics/dashboard`

**Fitur:**
- **Total Counts**: Menampilkan total siswa, guru, kelas, dan mata pelajaran
- **Attendance Overview**: Ringkasan kehadiran 30 hari terakhir dengan rate dan breakdown
- **Recent Activities**: Aktivitas terbaru sistem (tugas baru, dll)
- **Student Performance**: Top 10 siswa berdasarkan nilai dan kehadiran
- **Attendance by Class**: Tingkat kehadiran per kelas

**Data yang Ditampilkan:**
```json
{
  "total_students": 150,
  "total_teachers": 20,
  "total_classes": 8,
  "total_subjects": 12,
  "attendance_overview": {
    "total_sessions": 1200,
    "present_count": 980,
    "absent_count": 120,
    "permission_count": 80,
    "sick_count": 20,
    "attendance_rate": 81.67
  },
  "recent_activities": [...],
  "student_performance": [...],
  "attendance_by_class": [...]
}
```

### 2. Attendance Report (`/admin/analytics/attendance-report`)
**Backend Endpoint:** `GET /api/admin/analytics/attendance-report`

**Fitur:**
- **Cursor-based Pagination**: Efficient loading untuk dataset besar
- **Advanced Filters**: Filter berdasarkan tanggal, kelas
- **Export CSV**: Download laporan dalam format CSV
- **Real-time Data**: Data terbaru dari database

**Query Parameters:**
- `start_date`: Format YYYY-MM-DD (default: 30 hari lalu)
- `end_date`: Format YYYY-MM-DD (default: hari ini)
- `class_id`: ID kelas (optional)
- `cursor`: Pagination cursor (optional)
- `limit`: Batas data per request (default: 50, max: 100)

**Response Format:**
```json
{
  "status": "success",
  "data": {
    "data": [
      {
        "student_id": 1,
        "student_name": "John Doe",
        "class_name": "XII IPA 1",
        "subject_name": "Matematika",
        "teacher_name": "Dr. Ahmad",
        "attendance_date": "2025-06-24",
        "status": "Hadir",
        "created_at": "2025-06-24T08:00:00Z"
      }
    ],
    "next_cursor": "base64encoded_timestamp",
    "has_more": true,
    "total": 5432
  }
}
```

## Backend Implementation

### Controllers
- `controllers/dashboardcontroller.go`:
  - `GetAnalyticsDashboard()`: Main analytics dashboard
  - `GetAttendanceReport()`: Detailed attendance report with pagination

### Routes
- `routes/admin.go`:
  - `GET /admin/analytics/dashboard`
  - `GET /admin/analytics/attendance-report`

### Database Queries
- Menggunakan raw SQL untuk performa optimal
- Aggregasi data dengan JOIN tabel siswa, guru, kelas, absensi
- Cursor-based pagination menggunakan `created_at` timestamp

## Frontend Implementation

### Components
- `pages/AnalyticsDashboard.tsx`: Main dashboard dengan charts dan cards
- `pages/AttendanceReport.tsx`: Detail report dengan filter dan pagination
- `components/AdminSidebar.tsx`: Navigation menu (updated)

### Features
- **Material-UI Joy**: Modern UI components
- **Responsive Design**: Mobile-friendly layout
- **Real-time Updates**: Automatic data refresh
- **Export Functionality**: CSV download
- **Advanced Filtering**: Date range, class selection
- **Infinite Scroll**: Smooth pagination experience

### Navigation
- Dashboard accessible via `/admin/analytics/dashboard`
- Report accessible via `/admin/analytics/attendance-report`
- Navigation through admin sidebar menu

## Usage

1. **Admin Login**: Login sebagai admin untuk mengakses fitur
2. **Dashboard Overview**: Lihat ringkasan statistik di dashboard
3. **Detailed Reports**: Klik "Lihat Laporan Detail" untuk analisis mendalam
4. **Filter Data**: Gunakan filter tanggal dan kelas untuk data spesifik
5. **Export**: Download laporan dalam format CSV untuk analisis lanjutan

## Technical Details

### Performance Optimizations
- **Cursor Pagination**: Efisien untuk dataset besar
- **Database Indexing**: Index pada `created_at`, `siswa_id`, `kelas_id`
- **Query Optimization**: Raw SQL untuk aggregasi kompleks
- **Lazy Loading**: Load data saat dibutuhkan

### Security
- **Admin Authentication**: Middleware `AuthAdmin` required
- **Token Validation**: JWT token validation
- **Input Sanitization**: Parameter validation

### Error Handling
- **Graceful Degradation**: Fallback untuk error states
- **User Feedback**: Clear error messages
- **Retry Mechanisms**: Automatic retry untuk network errors

## Future Enhancements

1. **Real-time Updates**: WebSocket untuk live data
2. **More Chart Types**: Pie charts, bar charts, line graphs
3. **Advanced Analytics**: Predictive analysis, trends
4. **Custom Reports**: User-defined report templates
5. **Data Visualization**: Interactive charts dan graphs
6. **Mobile App**: Dedicated mobile interface
