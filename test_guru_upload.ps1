#!/usr/bin/env powershell

Write-Host "Testing PASTI Admin Upload Guru System..." -ForegroundColor Green

# Create test CSV file with sample guru data
$csvContent = @"
nip,nama_lengkap,email,password
197001011998021001,Dr. Ahmad Sudrajat M.Pd,ahmad.sudrajat@test.com,guru123
197205152000032002,Siti Nurhaliza S.Pd,siti.nurhaliza@test.com,guru456
"@

$csvFileName = "test_guru_data.csv"
$csvContent | Out-File -FilePath $csvFileName -Encoding UTF8

Write-Host "✅ Created test CSV file: $csvFileName" -ForegroundColor Green

# Test Admin Login first
Write-Host "`nTest 1: Admin Login" -ForegroundColor Yellow
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($response.status -eq "success") {
        Write-Host "✅ Admin login successful!" -ForegroundColor Green
        $adminToken = $response.data.token
        
        # Test Upload Guru Data
        Write-Host "`nTest 2: Upload Guru Data" -ForegroundColor Yellow
        
        # Read the CSV file as bytes for multipart upload
        $fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $csvFileName))
        $boundary = [System.Guid]::NewGuid().ToString()
        
        # Create multipart form data
        $LF = "`r`n"
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"$csvFileName`"",
            "Content-Type: text/csv$LF",
            [System.Text.Encoding]::UTF8.GetString($fileBytes),
            "--$boundary--$LF"
        ) -join $LF
        
        $headers = @{ 
            Authorization = $adminToken
            'Content-Type' = "multipart/form-data; boundary=$boundary"
        }
        
        try {
            $uploadResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/upload-guru" -Method POST -Body $bodyLines -Headers $headers
            
            if ($uploadResponse.status -eq "success" -or $uploadResponse.status -eq "partial_success") {
                Write-Host "✅ Guru upload successful!" -ForegroundColor Green
                Write-Host "   Total Records: $($uploadResponse.data.total_records)" -ForegroundColor Cyan
                Write-Host "   Success Count: $($uploadResponse.data.success_count)" -ForegroundColor Cyan
                Write-Host "   Error Count: $($uploadResponse.data.error_count)" -ForegroundColor Cyan
                
                if ($uploadResponse.data.errors -and $uploadResponse.data.errors.Count -gt 0) {
                    Write-Host "   Errors:" -ForegroundColor Red
                    foreach ($error in $uploadResponse.data.errors) {
                        Write-Host "     - $error" -ForegroundColor Red
                    }
                }
            } else {
                Write-Host "❌ Guru upload failed: $($uploadResponse.message)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Guru upload error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Admin login failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Admin login error: $($_.Exception.Message)" -ForegroundColor Red
}

# Cleanup
Remove-Item $csvFileName -Force -ErrorAction SilentlyContinue

Write-Host "`n🌐 Frontend URLs:" -ForegroundColor Blue
Write-Host "   Admin Login: http://localhost:5173/admin/login" -ForegroundColor Cyan
Write-Host "   Admin Upload Guru: http://localhost:5173/admin/upload-guru" -ForegroundColor Cyan

Write-Host "`n📋 Password Hashing:" -ForegroundColor Blue
Write-Host "   - Plain text passwords in CSV akan di-hash menggunakan bcrypt" -ForegroundColor White
Write-Host "   - Password yang tersimpan di database sudah dalam bentuk hash" -ForegroundColor White
Write-Host "   - Guru dapat login menggunakan password asli (plain text)" -ForegroundColor White

Write-Host "`n✅ System ready for testing!" -ForegroundColor Green
