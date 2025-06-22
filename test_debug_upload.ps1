#!/usr/bin/env pwsh

Write-Host "🔍 Testing Upload & Submit Flow dengan Debug Logging" -ForegroundColor Green

# Test data - ganti dengan data yang sesuai
$siswaId = "1"  # Sesuaikan dengan siswa_id yang ada
$tugasId = "1"  # Sesuaikan dengan tugas_id yang ada 
$baseUrl = "http://localhost:8080"

# Login dulu untuk mendapatkan token
Write-Host "🔐 Step 1: Login siswa..." -ForegroundColor Yellow
$loginData = @{
    email = "siswa1@example.com"  # Sesuaikan dengan email siswa yang ada
    password = "password123"       # Sesuaikan dengan password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login/siswa" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✅ Login berhasil - Token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Login gagal: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers dengan auth token
$headers = @{
    "Authorization" = "Bearer $token"
}

# Step 2: Test upload file
Write-Host "📤 Step 2: Upload test file..." -ForegroundColor Yellow

# Buat test file dummy
$testFileName = "test_jawaban_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$testFilePath = "d:\PASTI\$testFileName"
"Test jawaban tugas siswa - $(Get-Date)" | Out-File -FilePath $testFilePath -Encoding UTF8

try {
    # Create form data
    $form = @{
        file = Get-Item $testFilePath
    }
    
    $uploadResponse = Invoke-RestMethod -Uri "$baseUrl/api/upload/tugas" -Method POST -Form $form -Headers $headers
    $fileUrl = $uploadResponse.data.url
    Write-Host "✅ Upload berhasil - URL: $fileUrl" -ForegroundColor Green
    Write-Host "   Filename: $($uploadResponse.data.filename)" -ForegroundColor Cyan
    Write-Host "   Original: $($uploadResponse.data.original)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Upload gagal: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Step 3: Submit tugas dengan file URL
Write-Host "📝 Step 3: Submit tugas dengan file URL..." -ForegroundColor Yellow

$submitData = @{
    file_jawaban_siswa = $fileUrl
    catatan_siswa = "Test submit tugas melalui PowerShell script - $(Get-Date)"
} | ConvertTo-Json

Write-Host "Data yang akan dikirim:" -ForegroundColor Cyan
Write-Host $submitData -ForegroundColor White

try {
    $submitResponse = Invoke-RestMethod -Uri "$baseUrl/api/tugas/$tugasId/submit" -Method POST -Body $submitData -ContentType "application/json" -Headers $headers
    Write-Host "✅ Submit tugas berhasil!" -ForegroundColor Green
    Write-Host "Response: $($submitResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Submit tugas gagal: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        Write-Host "Error response: $responseText" -ForegroundColor Red
    }
}

# Step 4: Verify - cek database atau API
Write-Host "🔍 Step 4: Verify pengumpulan tugas..." -ForegroundColor Yellow

try {
    $detailResponse = Invoke-RestMethod -Uri "$baseUrl/api/tugas/$tugasId/detail" -Method GET -Headers $headers
    Write-Host "✅ Detail pengumpulan:" -ForegroundColor Green
    Write-Host "   File jawaban: $($detailResponse.data.file_jawaban_siswa)" -ForegroundColor Cyan
    Write-Host "   Catatan: $($detailResponse.data.catatan_siswa)" -ForegroundColor Cyan
    Write-Host "   Status: $($detailResponse.data.status_pengumpulan)" -ForegroundColor Cyan
    Write-Host "   Tanggal: $($detailResponse.data.tanggal_pengumpulan)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Gagal mengambil detail: $($_.Exception.Message)" -ForegroundColor Red
}

# Cleanup
Remove-Item $testFilePath -Force -ErrorAction SilentlyContinue

Write-Host "🎉 Test selesai! Cek console backend untuk logging detail." -ForegroundColor Green
