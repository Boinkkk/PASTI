#!/usr/bin/env powershell

Write-Host "Testing PASTI Admin View Siswa System..." -ForegroundColor Green

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
        
        # Test Get Siswa Data
        Write-Host "`nTest 2: Get All Siswa Data" -ForegroundColor Yellow
        
        $headers = @{ 
            Authorization = $adminToken
        }
        
        try {
            $siswaResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/siswa" -Method GET -Headers $headers
            
            if ($siswaResponse.status -eq "success") {
                Write-Host "✅ Siswa data retrieved successfully!" -ForegroundColor Green
                Write-Host "   Total Records: $($siswaResponse.data.Count)" -ForegroundColor Cyan
                
                if ($siswaResponse.data.Count -gt 0) {
                    Write-Host "`n📋 Sample Data (First 3 records):" -ForegroundColor Blue
                    
                    $sampleData = $siswaResponse.data | Select-Object -First 3
                    foreach ($siswa in $sampleData) {
                        Write-Host "   ---" -ForegroundColor Gray
                        Write-Host "   NIS: $($siswa.nis)" -ForegroundColor White
                        Write-Host "   Nama: $($siswa.nama)" -ForegroundColor White
                        Write-Host "   Kelas: $($siswa.kelas)" -ForegroundColor White
                        Write-Host "   No. Telepon: $($siswa.no_telepon)" -ForegroundColor White
                        Write-Host "   Password Hash: $($siswa.password.Substring(0, [Math]::Min(20, $siswa.password.Length)))..." -ForegroundColor White
                        Write-Host "   Email: $($siswa.email)" -ForegroundColor White
                    }
                } else {
                    Write-Host "   No siswa data found in database" -ForegroundColor Yellow
                }
            } else {
                Write-Host "❌ Get siswa data failed: $($siswaResponse.message)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Get siswa data error: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   Error details: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Admin login failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Admin login error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🌐 Frontend URLs:" -ForegroundColor Blue
Write-Host "   Admin Login: http://localhost:5173/admin/login" -ForegroundColor Cyan
Write-Host "   Admin View Siswa: http://localhost:5173/admin/siswa" -ForegroundColor Cyan
Write-Host "   Admin Upload Siswa: http://localhost:5173/admin/upload-siswa" -ForegroundColor Cyan
Write-Host "   Admin Upload Guru: http://localhost:5173/admin/upload-guru" -ForegroundColor Cyan

Write-Host "`n📋 Features:" -ForegroundColor Blue
Write-Host "   ✅ Login Admin dengan username: admin, password: admin123" -ForegroundColor White
Write-Host "   ✅ Upload data siswa melalui CSV" -ForegroundColor White
Write-Host "   ✅ Upload data guru melalui CSV (dengan password hashing)" -ForegroundColor White
Write-Host "   ✅ Lihat semua data siswa dengan nama, kelas, no_telepon, dan password" -ForegroundColor White
Write-Host "   ✅ Fitur pencarian siswa berdasarkan nama, NIS, kelas, atau email" -ForegroundColor White
Write-Host "   ✅ Toggle visibility password untuk keamanan" -ForegroundColor White

Write-Host "`n🔒 Security Notes:" -ForegroundColor Blue
Write-Host "   - Password siswa ditampilkan dalam bentuk hash (bcrypt)" -ForegroundColor White
Write-Host "   - Admin perlu klik icon mata untuk melihat password hash" -ForegroundColor White
Write-Host "   - Semua endpoint admin dilindungi middleware autentikasi" -ForegroundColor White

Write-Host "`n✅ System ready for testing!" -ForegroundColor Green
