#!/usr/bin/env pwsh

Write-Host "Testing Upload and Submit Flow dengan Debug Logging" -ForegroundColor Green

# Test data - ganti dengan data yang sesuai
$siswaId = "1"  # Sesuaikan dengan siswa_id yang ada
$tugasId = "1"  # Sesuaikan dengan tugas_id yang ada 
$baseUrl = "http://localhost:8080"

# Login dulu untuk mendapatkan token
Write-Host "Step 1: Login sebagai siswa..." -ForegroundColor Yellow

$loginData = @{
    username = "220010001"  # Ganti dengan username siswa yang valid
    password = "password123"
    role = "siswa"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "Login berhasil, token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "Login gagal: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Header dengan token
$headers = @{
    "Authorization" = "Bearer $token"
}

# Step 2: Upload file
Write-Host "Step 2: Upload file..." -ForegroundColor Yellow

# Buat file test sederhana
$testFilePath = "test_upload_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$testContent = "Ini adalah file jawaban tugas test.`nDibuat pada: $(Get-Date)"
Set-Content -Path $testFilePath -Value $testContent

# Upload menggunakan multipart/form-data
$boundary = [System.Guid]::NewGuid().ToString()
$bodyLines = @()
$bodyLines += "--$boundary"
$bodyLines += 'Content-Disposition: form-data; name="file"; filename="' + $testFilePath + '"'
$bodyLines += 'Content-Type: text/plain'
$bodyLines += ''
$bodyLines += $testContent
$bodyLines += "--$boundary--"
$body = $bodyLines -join "`r`n"

try {
    $uploadResponse = Invoke-RestMethod -Uri "$baseUrl/upload" -Method POST -Body $body -ContentType "multipart/form-data; boundary=$boundary" -Headers $headers
    $fileUrl = $uploadResponse.data.url
    Write-Host "Upload berhasil, file URL: $fileUrl" -ForegroundColor Green
} catch {
    Write-Host "Upload gagal: $($_.Exception.Message)" -ForegroundColor Red
    Remove-Item $testFilePath -Force -ErrorAction SilentlyContinue
    exit 1
}

# Step 3: Submit tugas dengan file yang sudah diupload
Write-Host "Step 3: Submit tugas dengan file..." -ForegroundColor Yellow

$submitData = @{
    siswa_id = [int]$siswaId
    tugas_id = [int]$tugasId
    file_jawaban_siswa = $fileUrl
    tanggal_pengumpulan = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
} | ConvertTo-Json

try {
    $submitResponse = Invoke-RestMethod -Uri "$baseUrl/pengumpulan-tugas" -Method POST -Body $submitData -ContentType "application/json" -Headers $headers
    Write-Host "Submit tugas berhasil!" -ForegroundColor Green
    Write-Host "Response: $($submitResponse | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "Submit tugas gagal: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Step 4: Verifikasi dengan mengambil detail pengumpulan
Write-Host "Step 4: Verifikasi pengumpulan tugas..." -ForegroundColor Yellow

try {
    $detailResponse = Invoke-RestMethod -Uri "$baseUrl/pengumpulan-tugas?siswa_id=$siswaId&tugas_id=$tugasId" -Method GET -Headers $headers
    Write-Host "Detail pengumpulan:" -ForegroundColor Cyan
    Write-Host ($detailResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
    
    if ($detailResponse.data -and $detailResponse.data.file_jawaban_siswa) {
        Write-Host "SUCCESS: File jawaban siswa tersimpan di database: $($detailResponse.data.file_jawaban_siswa)" -ForegroundColor Green
    } else {
        Write-Host "WARNING: File jawaban siswa KOSONG di database!" -ForegroundColor Red
    }
} catch {
    Write-Host "Gagal mengambil detail pengumpulan: $($_.Exception.Message)" -ForegroundColor Red
}

# Cleanup
Remove-Item $testFilePath -Force -ErrorAction SilentlyContinue

Write-Host "Test selesai! Cek console backend untuk logging detail." -ForegroundColor Green
