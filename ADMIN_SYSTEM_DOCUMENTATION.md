# PASTI Admin System - Feature Documentation

## Fitur Admin yang Telah Diselesaikan

### 1. Authentication System
- **Login Admin**: `/admin/login`
  - Username: `admin`
  - Password: `admin123`
  - Menggunakan JWT token untuk autentikasi
  - Token disimpan di localStorage

### 2. Upload Data Siswa
- **Endpoint Backend**: `POST /api/admin/upload-siswa`
- **Frontend**: `/admin/upload-siswa`
- **Format CSV**: `nis, nama_lengkap, email, kelas_id, no_telepon, password, confirm_password`
- **Fituri**:
  - Upload file CSV dengan validasi format
  - Batch processing dengan delay untuk mencegah server overload
  - Error reporting per record
  - Download template CSV

### 3. Upload Data Guru  
- **Endpoint Backend**: `POST /api/admin/upload-guru`
- **Frontend**: `/admin/upload-guru`
- **Format CSV**: `nip, nama_lengkap, email, password`
- **Fituri**:
  - Upload file CSV dengan validasi format
  - **Password Hashing**: Password otomatis di-hash menggunakan bcrypt
  - Error reporting per record dengan detail
  - Download template CSV
  - Validasi unique NIP dan email

### 4. View Data Siswa
- **Endpoint Backend**: `GET /api/admin/siswa`
- **Frontend**: `/admin/siswa`
- **Data yang Ditampilkan**:
  - NIS
  - Nama Lengkap
  - Kelas
  - No. Telepon
  - Password Hash (dengan toggle visibility)
  - Email
- **Fituri**:
  - Pencarian berdasarkan nama, NIS, kelas, atau email
  - Toggle visibility password untuk keamanan
  - Statistik jumlah siswa
  - Refresh data

## Backend Architecture

### Controllers (`controllers/admincontroller.go`)
```go
- LoginAdmin()           // Admin authentication
- GetAdminProfile()      // Get admin profile info
- UploadSiswaData()      // Upload siswa via CSV
- UploadGuruData()       // Upload guru via CSV with password hashing
- GetAllSiswaData()      // Get all siswa data for viewing
- parseGuruCSV()         // Helper: Parse guru CSV data
- processGuruData()      // Helper: Process and hash guru passwords
```

### Routes (`routes/admin.go`)
```go
// Public routes
POST /api/admin/login

// Protected routes (require admin token)
GET  /api/admin/profile
POST /api/admin/upload-siswa
POST /api/admin/upload-guru
GET  /api/admin/siswa
```

### Middleware (`middleware/auth.go`)
```go
AuthAdmin() // Validates admin JWT token and sets user context
```

### Models
- Admin model with username/password
- Integration with existing Siswa and Guru models

## Frontend Architecture

### Pages
1. **LoginAdmin.tsx** - Admin login form
2. **AdminUploadSiswa_new.tsx** - Upload siswa via CSV
3. **AdminUploadGuru.tsx** - Upload guru via CSV with password hashing
4. **AdminViewSiswa.tsx** - View and search siswa data

### Navigation
Setiap halaman admin memiliki navigasi antar halaman:
- Upload Siswa
- Upload Guru  
- Lihat Data Siswa
- Logout

### Security Features
- JWT token validation on all admin endpoints
- Frontend route protection (redirect to login if no token)
- Password visibility toggle untuk keamanan
- Admin role verification di semua protected endpoints

## Database Schema

### Admin Table
```sql
CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

INSERT INTO `admin` (`username`, `password`) VALUES ('admin', 'admin123');
```

## How to Use

### 1. Start System
```bash
# Backend
cd d:\PASTI
go build
./pasti.exe

# Frontend  
cd d:\PASTI\my-app
npm run dev
```

### 2. Access Admin Panel
1. Go to `http://localhost:5173/admin/login`
2. Login with `admin` / `admin123`
3. Navigate between different admin functions

### 3. Upload Data
- **Siswa**: Download template, fill data, upload CSV
- **Guru**: Download template, fill data (password akan di-hash otomatis), upload CSV

### 4. View Data
- Navigate to "Lihat Data Siswa"
- Search and filter data
- Toggle password visibility as needed

## Security Considerations
- Passwords are hashed using bcrypt
- JWT tokens expire and need re-authentication
- All admin endpoints protected by middleware
- Frontend validates admin token on page load
- Password visibility can be toggled for security

## Testing Scripts
- `test_admin_system.ps1` - Test admin login and basic functionality
- `test_guru_upload.ps1` - Test guru upload with password hashing
- `test_view_siswa.ps1` - Test viewing siswa data

## Status: ✅ COMPLETED
All requested admin features have been implemented and tested.
