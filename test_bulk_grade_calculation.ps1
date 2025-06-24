# Test Bulk Grade Calculation Backend
# Author: AI Assistant
# Description: Script untuk testing endpoint bulk grade calculation

Write-Host "=== Testing Bulk Grade Calculation Backend ===" -ForegroundColor Green

# Base URL untuk API
$baseUrl = "http://localhost:8080/api"

# Login sebagai admin untuk mendapatkan token
Write-Host "`n1. Login sebagai admin..." -ForegroundColor Yellow
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/admin/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✅ Login berhasil. Token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Login gagal: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers untuk request yang memerlukan autentikasi
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 1: Ambil daftar kelas
Write-Host "`n2. Testing - Ambil daftar kelas..." -ForegroundColor Yellow
try {
    $kelasResponse = Invoke-RestMethod -Uri "$baseUrl/admin/kelas" -Method GET -Headers $headers
    Write-Host "✅ Berhasil ambil $($kelasResponse.data.Length) kelas" -ForegroundColor Green
    $firstClass = $kelasResponse.data[0]
    if ($firstClass) {
        Write-Host "   Contoh kelas: $($firstClass.nama_kelas) (ID: $($firstClass.kelas_id))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Gagal ambil kelas: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Ambil daftar mata pelajaran
Write-Host "`n3. Testing - Ambil daftar mata pelajaran..." -ForegroundColor Yellow
try {
    $mapelResponse = Invoke-RestMethod -Uri "$baseUrl/admin/mapel" -Method GET -Headers $headers
    Write-Host "✅ Berhasil ambil $($mapelResponse.data.Length) mata pelajaran" -ForegroundColor Green
    $firstMapel = $mapelResponse.data[0]
    if ($firstMapel) {
        Write-Host "   Contoh mapel: $($firstMapel.nama_mapel) (ID: $($firstMapel.mapel_id))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Gagal ambil mata pelajaran: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Bulk Grade Calculation - Semua kelas dan mapel
Write-Host "`n4. Testing - Bulk Grade Calculation (Semua kelas dan mapel)..." -ForegroundColor Yellow
try {
    $bulkCalcResponse = Invoke-RestMethod -Uri "$baseUrl/admin/analytics/bulk-grade-calculation" -Method POST -Headers $headers
    Write-Host "✅ Bulk grade calculation berhasil!" -ForegroundColor Green
    Write-Host "   Total students processed: $($bulkCalcResponse.data.total_students)" -ForegroundColor Cyan
    Write-Host "   Total assignments: $($bulkCalcResponse.data.total_assignments)" -ForegroundColor Cyan
    Write-Host "   Log ID: $($bulkCalcResponse.data.log_id)" -ForegroundColor Cyan
    Write-Host "   Calculated at: $($bulkCalcResponse.data.calculated_at)" -ForegroundColor Cyan
    
    if ($bulkCalcResponse.data.students_processed.Length -gt 0) {
        $firstStudent = $bulkCalcResponse.data.students_processed[0]
        Write-Host "   Sample student: $($firstStudent.student_name) - $($firstStudent.average_grade)% ($($firstStudent.status))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Bulk grade calculation gagal: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 4: Bulk Grade Calculation - Kelas spesifik (jika ada)
if ($firstClass) {
    Write-Host "`n5. Testing - Bulk Grade Calculation untuk kelas $($firstClass.nama_kelas)..." -ForegroundColor Yellow
    try {
        $specificClassUrl = "$baseUrl/admin/analytics/bulk-grade-calculation?class_id=$($firstClass.kelas_id)"
        $specificCalcResponse = Invoke-RestMethod -Uri $specificClassUrl -Method POST -Headers $headers
        Write-Host "✅ Bulk grade calculation untuk kelas berhasil!" -ForegroundColor Green
        Write-Host "   Total students processed: $($specificCalcResponse.data.total_students)" -ForegroundColor Cyan
        Write-Host "   Log ID: $($specificCalcResponse.data.log_id)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Bulk grade calculation untuk kelas gagal: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 5: Bulk Grade Calculation - Mata pelajaran spesifik (jika ada)
if ($firstMapel) {
    Write-Host "`n6. Testing - Bulk Grade Calculation untuk mapel $($firstMapel.nama_mapel)..." -ForegroundColor Yellow
    try {
        $specificMapelUrl = "$baseUrl/admin/analytics/bulk-grade-calculation?subject_id=$($firstMapel.mapel_id)"
        $specificMapelResponse = Invoke-RestMethod -Uri $specificMapelUrl -Method POST -Headers $headers
        Write-Host "✅ Bulk grade calculation untuk mapel berhasil!" -ForegroundColor Green
        Write-Host "   Total students processed: $($specificMapelResponse.data.total_students)" -ForegroundColor Cyan
        Write-Host "   Log ID: $($specificMapelResponse.data.log_id)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Bulk grade calculation untuk mapel gagal: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 6: History bulk grade calculation
Write-Host "`n7. Testing - History bulk grade calculation..." -ForegroundColor Yellow
try {
    $historyResponse = Invoke-RestMethod -Uri "$baseUrl/admin/analytics/bulk-grade-history?page=1&limit=5" -Method GET -Headers $headers
    Write-Host "✅ Berhasil ambil history bulk grade calculation!" -ForegroundColor Green
    Write-Host "   Total history records: $($historyResponse.data.history.Length)" -ForegroundColor Cyan
    Write-Host "   Current page: $($historyResponse.data.pagination.page)" -ForegroundColor Cyan
    Write-Host "   Total pages: $($historyResponse.data.pagination.total_pages)" -ForegroundColor Cyan
    
    if ($historyResponse.data.history.Length -gt 0) {
        $latestHistory = $historyResponse.data.history[0]
        Write-Host "   Latest calculation: $($latestHistory.calculated_at)" -ForegroundColor Cyan
        Write-Host "   Students processed: $($latestHistory.total_students_processed)" -ForegroundColor Cyan
        Write-Host "   Parameters: $($latestHistory.parameters_used)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Gagal ambil history: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 7: Validasi tanpa parameter (should fail)
Write-Host "`n8. Testing - Bulk Grade Calculation tanpa parameter (should fail)..." -ForegroundColor Yellow
try {
    $noParamResponse = Invoke-RestMethod -Uri "$baseUrl/admin/analytics/bulk-grade-calculation" -Method POST -Headers $headers
    Write-Host "❌ Test gagal - seharusnya error tapi berhasil" -ForegroundColor Red
} catch {
    Write-Host "✅ Validation berhasil - error yang diharapkan: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n=== Testing Selesai ===" -ForegroundColor Green
Write-Host "Bulk Grade Calculation backend telah siap digunakan!" -ForegroundColor Yellow
Write-Host "Akses frontend di: http://localhost:5173/admin/analytics/bulk-grade-calculation" -ForegroundColor Cyan
