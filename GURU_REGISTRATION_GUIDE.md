# PASTI - Panduan Registrasi dan Login Guru

## 🎯 Overview
Sistem PASTI kini mendukung registrasi dan login untuk Guru. Fitur ini memungkinkan guru untuk mendaftar akun baru dan mengakses dashboard guru untuk mengelola absensi siswa.

## ✅ Fitur yang Sudah Tersedia

### Backend (Go API)
- ✅ Model `RegisterGuru` di `models/guru.go`
- ✅ Endpoint `POST /api/auth/register-guru` di `controllers/authcontroller.go`
- ✅ Endpoint `POST /api/auth/login-guru` di `controllers/authcontroller.go`
- ✅ JWT token generation untuk guru di `helpers/token.go`
- ✅ Middleware authentication untuk guru di `middleware/auth.go`
- ✅ Routes registrasi guru di `routes/auth.go`
- ✅ Password hashing dengan bcrypt

### Frontend (React TypeScript)
- ✅ Halaman `RegisterGuru.tsx` dengan validasi form lengkap
- ✅ Interface TypeScript untuk `RegisterGuruRequest` dan `RegisterGuruResponse`
- ✅ API function `registerGuru` di `services/api.ts`
- ✅ Route `/register-guru` di `main.tsx`
- ✅ Navigasi dari `LoginGuru.tsx` ke halaman registrasi
- ✅ Validasi real-time untuk semua field input
- ✅ Error handling dan success messaging

## 🚀 Cara Menggunakan

### 1. Registrasi Guru Baru

#### Via Web Interface:
1. Buka browser dan akses `http://localhost:5173/register-guru`
2. Isi form registrasi dengan data berikut:
   - **NIP**: 8-20 digit angka (contoh: 12345678)
   - **Nama Lengkap**: Minimal 3 karakter, maksimal 100 karakter
   - **Email**: Format email valid (contoh: guru@gmail.com)
   - **Password**: Minimal 8 karakter dengan huruf besar, kecil, angka, dan karakter khusus
   - **Konfirmasi Password**: Harus sama dengan password
3. Klik "Daftar Sebagai Guru"
4. Jika berhasil, akan diarahkan ke halaman login guru

#### Via API (PowerShell):
```powershell
$body = @{
  nip = "12345678"
  nama_lengkap = "Dr. Test Guru"
  email = "guru.test@gmail.com"
  password = "TestGuru123!"
  confirm_password = "TestGuru123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/auth/register-guru" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

### 2. Login Guru

#### Via Web Interface:
1. Buka browser dan akses `http://localhost:5173/login-guru`
2. Masukkan NIP dan Password
3. Klik "Login"
4. Jika berhasil, akan diarahkan ke dashboard guru

#### Via API (PowerShell):
```powershell
$loginBody = @{
  nip = "12345678"
  password = "TestGuru123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login-guru" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
```

## 📝 Field Validasi

### NIP (Nomor Induk Pegawai)
- ✅ Wajib diisi
- ✅ 8-20 digit angka
- ✅ Unique di database

### Nama Lengkap
- ✅ Wajib diisi
- ✅ Minimal 3 karakter
- ✅ Maksimal 100 karakter
- ✅ Hanya huruf dan spasi

### Email
- ✅ Wajib diisi
- ✅ Format email valid
- ✅ Domain yang umum (gmail, yahoo, dll)
- ✅ Unique di database

### Password
- ✅ Wajib diisi
- ✅ Minimal 8 karakter
- ✅ Harus mengandung:
  - Huruf kecil (a-z)
  - Huruf besar (A-Z)
  - Angka (0-9)
  - Karakter khusus (!@#$%^&*)
- ✅ Strength indicator (Lemah/Sedang/Kuat)

### Konfirmasi Password
- ✅ Wajib diisi
- ✅ Harus sama dengan password

## 🔐 Keamanan

- ✅ Password di-hash menggunakan bcrypt
- ✅ JWT token dengan expiry 24 jam
- ✅ Middleware authentication untuk endpoint protected
- ✅ CORS protection
- ✅ Input validation dan sanitization

## 🛡️ Error Handling

### Backend Errors:
- `400`: Password tidak cocok
- `500`: Database error atau server error
- `201`: Registrasi berhasil

### Frontend Errors:
- Real-time validation untuk setiap field
- Error messages yang jelas dan informatif
- Loading states selama proses registrasi/login

## 🌐 API Endpoints

### Registrasi Guru
```
POST /api/auth/register-guru
Content-Type: application/json

{
  "nip": "string",
  "nama_lengkap": "string", 
  "email": "string",
  "password": "string",
  "confirm_password": "string"
}
```

### Login Guru
```
POST /api/auth/login-guru
Content-Type: application/json

{
  "nip": "string",
  "password": "string"
}
```

## 🎨 UI/UX Features

- ✅ Responsive design untuk mobile dan desktop
- ✅ Real-time validation dengan indikator visual
- ✅ Password strength meter
- ✅ Loading states dan disable buttons saat processing
- ✅ Success dan error alerts
- ✅ Navigasi yang intuitif antar halaman
- ✅ Consistent styling dengan tema PASTI

## 🔧 Cara Menjalankan

### Backend:
```powershell
cd d:\PASTI
go run main.go
```
Server akan berjalan di: `http://localhost:8080`

### Frontend:
```powershell
cd d:\PASTI\my-app
npm run dev
```
Frontend akan berjalan di: `http://localhost:5173`

## ✅ Status Testing

- ✅ Backend API endpoint `/api/auth/register-guru` tested and working
- ✅ Backend API endpoint `/api/auth/login-guru` tested and working
- ✅ Frontend registrasi form validation working
- ✅ Frontend navigasi dan routing working
- ✅ Database guru table integration working
- ✅ JWT token generation dan validation working
- ✅ Password hashing dan verification working

## 🎯 Next Steps

Sistem registrasi dan login guru sudah selesai dan siap digunakan! Guru dapat:

1. **Mendaftar akun baru** melalui halaman `/register-guru`
2. **Login** melalui halaman `/login-guru`  
3. **Mengakses dashboard guru** untuk mengelola absensi siswa
4. **Menggunakan semua fitur guru** yang sudah tersedia di sistem

---

## 📞 Troubleshooting

### Jika registrasi gagal:
1. Pastikan NIP belum terdaftar
2. Pastikan email belum terdaftar
3. Periksa kekuatan password
4. Pastikan konfirmasi password sama

### Jika login gagal:
1. Periksa NIP dan password
2. Pastikan akun sudah terdaftar
3. Coba reset atau daftar ulang jika diperlukan

---

*Dokumentasi ini dibuat untuk PASTI v2.0 - Sistem Absensi Guru dan Siswa*
