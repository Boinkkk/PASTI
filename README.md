# 🎓 PASTI - Sistem Absensi Guru dan Siswa

**PASTI** (Platform Absensi Sistem Terpadu Institusi) adalah sistem manajemen absensi modern yang dirancang khusus untuk institusi pendidikan. Sistem ini mendukung absensi berbasis QR Code dan token dengan interface yang user-friendly.

## ✨ Fitur Utama

### 👨‍🎓 Untuk Siswa
- ✅ **Registrasi dan Login Siswa** dengan validasi lengkap
- ✅ **Dashboard Siswa** dengan overview mata pelajaran
- ✅ **Absensi QR Code/Token** untuk berbagai mata pelajaran
- ✅ **Riwayat Absensi** dan status kehadiran
- ✅ **Profile Management** siswa

### 👨‍🏫 Untuk Guru
- ✅ **Registrasi dan Login Guru** (NEW!)
- ✅ **Dashboard Guru** untuk mengelola kelas
- ✅ **Kelola Pertemuan** dengan generate QR Code/Token absensi
- ✅ **Monitoring Absensi** real-time siswa
- ✅ **Laporan Kehadiran** per mata pelajaran
- ✅ **Data Siswa** management

### 🔧 Fitur Teknis
- ✅ **JWT Authentication** dengan role-based access
- ✅ **Real-time Validation** untuk semua form input
- ✅ **Responsive Design** untuk mobile dan desktop
- ✅ **QR Code Generation** untuk absensi
- ✅ **API Integration** yang robust
- ✅ **Database Integration** dengan GORM

## 🚀 Quick Start

### Prerequisites
- Go 1.21+ 
- Node.js 18+
- MySQL/MariaDB
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd PASTI
```

### 2. Setup Database
1. Buat database MySQL dengan nama `pasti`
2. Import file `pasti.sql` untuk struktur database
3. Update konfigurasi database di `config/database.go`

### 3. Setup Backend
```bash
# Install dependencies
go mod tidy

# Run server
go run main.go
```
Server akan berjalan di: `http://localhost:8080`

### 4. Setup Frontend
```bash
# Masuk ke folder frontend
cd my-app

# Install dependencies
npm install

# Run development server
npm run dev
```
Frontend akan berjalan di: `http://localhost:5173`

## 📚 Dokumentasi

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Registrasi siswa
- `POST /api/auth/register-guru` - Registrasi guru (NEW!)
- `POST /api/auth/login` - Login siswa
- `POST /api/auth/login-guru` - Login guru (NEW!)

#### Siswa
- `GET /api/siswa/profile` - Get profile siswa
- `GET /api/absensi/daftarPelajaran` - Get daftar mata pelajaran
- `GET /api/absensi/daftarPertemuan` - Get daftar pertemuan
- `POST /api/absensi/submit` - Submit absensi

#### Guru
- `GET /api/guru/profile` - Get profile guru
- `GET /api/guru/jadwal/{id}` - Get jadwal mengajar guru
- `GET /api/guru/pertemuan-aktif/{id}` - Get pertemuan aktif guru
- `POST /api/guru/mulai-pertemuan` - Mulai pertemuan baru
- `POST /api/guru/selesai-pertemuan` - Selesaikan pertemuan

## 🛠️ Tech Stack

### Backend
- **Go** - Programming language
- **Gin** - Web framework
- **GORM** - ORM for database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **MySQL** - Database

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Joy UI** - Component library
- **Tailwind CSS** - Styling
- **React Router** - Navigation

## 📱 Halaman Utama

### Siswa
- `/` - Login siswa
- `/register` - Registrasi siswa
- `/dashboard` - Dashboard siswa
- `/absensi` - Halaman absensi
- `/absensi/token/{token}` - Absensi via token

### Guru
- `/login-guru` - Login guru
- `/register-guru` - Registrasi guru (NEW!)
- `/guru/dashboard` - Dashboard guru
- `/guru/jadwal` - Jadwal mengajar
- `/guru/absensi` - Kelola absensi
- `/guru/siswa` - Data siswa
- `/guru/qr-generator` - QR Code generator

## 🔐 Authentication Flow

### Untuk Siswa
1. Registrasi dengan NIS, nama, kelas, email, password
2. Login dengan email dan password
3. Akses dashboard dan fitur siswa

### Untuk Guru (NEW!)
1. Registrasi dengan NIP, nama, email, password
2. Login dengan NIP dan password  
3. Akses dashboard dan fitur guru

## 🎯 Fitur Absensi

### Generate QR Code/Token
- Guru dapat membuat pertemuan baru
- System generate QR Code dan token unik
- Siswa scan QR Code atau akses via link token
- Real-time monitoring kehadiran

### Submit Absensi
- Siswa submit absensi via QR Code atau token
- Validasi waktu dan pertemuan aktif
- Prevent duplicate submission
- Real-time update status kehadiran

## 📋 Database Schema

### Core Tables
- `siswa` - Data siswa
- `guru` - Data guru (UPDATED!)
- `kelas` - Data kelas
- `mata_pelajaran` - Data mata pelajaran
- `jadwal_pelajaran` - Jadwal mengajar
- `pertemuan` - Data pertemuan
- `absensi` - Record absensi

## 🧪 Testing

### Backend API Testing
```powershell
# Test registrasi guru
$body = @{
  nip = "12345678"
  nama_lengkap = "Dr. Test Guru"
  email = "guru.test@gmail.com"
  password = "TestGuru123!"
  confirm_password = "TestGuru123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/auth/register-guru" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body

# Test login guru
$loginBody = @{
  nip = "12345678"
  password = "TestGuru123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login-guru" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
```

### Frontend Testing
1. Buka `http://localhost:5173/register-guru`
2. Test form validation dan registrasi
3. Test login di `http://localhost:5173/login-guru`
4. Test dashboard guru setelah login

## 🚧 Recent Updates (v2.0)

### ✅ NEW: Guru Registration System
- **Backend**: Model RegisterGuru, endpoint registrasi, JWT guru
- **Frontend**: Halaman RegisterGuru dengan validasi lengkap
- **Security**: Password hashing, input validation, unique constraints
- **UX**: Real-time validation, error handling, navigation

### ✅ Enhanced Authentication
- Separate login flows untuk siswa dan guru
- Role-based JWT tokens
- Universal authentication middleware
- Improved error handling

### ✅ Improved API Structure
- Standardized response format
- Better error messages
- CORS configuration
- Request validation

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Untuk bantuan atau pertanyaan, silakan:
- Buat issue di repository
- Kontak development team
- Cek dokumentasi di `GURU_REGISTRATION_GUIDE.md`

---

**PASTI v2.0** - Sistem Absensi Modern untuk Institusi Pendidikan 🎓