# Test manual upload dengan curl
$baseUrl = "http://localhost:8080"

# Buat file test
"Test file content for upload" | Out-File -FilePath "test_upload.txt" -Encoding UTF8

Write-Host "Testing manual file upload..." -ForegroundColor Yellow

# Test upload tanpa token (should get 401/400)
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/upload/tugas" -Method POST -ContentType "multipart/form-data" -InFile "test_upload.txt"
    Write-Host "ERROR: Upload berhasil tanpa authentication!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Expected: Upload ditolak dengan status $statusCode" -ForegroundColor Green
}

# Cek apakah folder uploads ada dan bisa ditulis
Write-Host "`nTesting folder permissions..." -ForegroundColor Yellow

# Test write ke folder uploads
try {
    "Test write permission" | Out-File -FilePath "uploads\tugas\test_write.txt" -Encoding UTF8
    Write-Host "SUCCESS: Dapat menulis ke folder uploads/tugas" -ForegroundColor Green
    
    # Cek isi folder
    $files = Get-ChildItem "uploads\tugas"
    Write-Host "Files in uploads/tugas: $($files.Count)"
    $files | ForEach-Object { Write-Host "  - $($_.Name)" }
    
    # Cleanup
    Remove-Item "uploads\tugas\test_write.txt" -ErrorAction SilentlyContinue
} catch {
    Write-Host "ERROR: Tidak dapat menulis ke folder uploads/tugas" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

# Cleanup
Remove-Item "test_upload.txt" -ErrorAction SilentlyContinue

Write-Host "`nChecking Go working directory..." -ForegroundColor Yellow
Write-Host "Current PowerShell location: $(Get-Location)"
Write-Host "Expected uploads path for Go: uploads/tugas"

Write-Host "`nNote: File upload hanya akan berhasil dengan authentication token yang valid" -ForegroundColor Magenta
