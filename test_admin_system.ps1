#!/usr/bin/env powershell

Write-Host "Testing PASTI Admin System..." -ForegroundColor Green

# Test 1: Admin Login
Write-Host "`nTest 1: Admin Login" -ForegroundColor Yellow
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($response.status -eq "success") {
        Write-Host "✅ Admin login successful!" -ForegroundColor Green
        Write-Host "   Username: $($response.data.username)" -ForegroundColor Cyan
        Write-Host "   Token: $($response.data.token.Substring(0,20))..." -ForegroundColor Cyan
        
        $adminToken = $response.data.token
        
        # Test 2: Admin Profile
        Write-Host "`nTest 2: Admin Profile" -ForegroundColor Yellow
        $headers = @{ Authorization = $adminToken }
        
        try {
            $profileResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/profile" -Method GET -Headers $headers
            
            if ($profileResponse.status -eq "success") {
                Write-Host "✅ Admin profile retrieved successfully!" -ForegroundColor Green
                Write-Host "   Username: $($profileResponse.data.username)" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Admin profile failed: $($profileResponse.message)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Admin profile error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Admin login failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Admin login error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🌐 Frontend URLs:" -ForegroundColor Blue
Write-Host "   Admin Login: http://localhost:5173/admin/login" -ForegroundColor Cyan
Write-Host "   Admin Upload: http://localhost:5173/admin/upload-siswa" -ForegroundColor Cyan

Write-Host "`n📋 Instructions:" -ForegroundColor Blue
Write-Host "   1. Go to http://localhost:5173/admin/login" -ForegroundColor White
Write-Host "   2. Login with username: admin, password: admin123" -ForegroundColor White
Write-Host "   3. You'll be redirected to the upload page" -ForegroundColor White

Write-Host "`n✅ System is ready for testing!" -ForegroundColor Green
