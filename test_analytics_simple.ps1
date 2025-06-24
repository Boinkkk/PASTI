# Test Analytics Dashboard API
Write-Host "Testing Analytics Dashboard API..." -ForegroundColor Green

# Admin login
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Write-Host "1. Testing admin login..." -ForegroundColor Yellow

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/login" -Method POST -Body $loginData -ContentType "application/json"
    $adminToken = $loginResponse.data.token
    Write-Host "Admin login successful" -ForegroundColor Green
    Write-Host "Token: $adminToken" -ForegroundColor Cyan
} catch {
    Write-Host "Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test Analytics Dashboard
Write-Host "2. Testing analytics dashboard..." -ForegroundColor Yellow

try {
    $headers = @{
        'Authorization' = $adminToken
        'Content-Type' = 'application/json'
    }
    
    $dashboardResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/analytics/dashboard" -Method GET -Headers $headers
    
    Write-Host "Analytics dashboard API successful" -ForegroundColor Green
    Write-Host "Total Students: $($dashboardResponse.data.total_students)" -ForegroundColor Cyan
    Write-Host "Total Teachers: $($dashboardResponse.data.total_teachers)" -ForegroundColor Cyan
    Write-Host "Attendance Rate: $($dashboardResponse.data.attendance_overview.attendance_rate)%" -ForegroundColor Cyan
    
} catch {
    Write-Host "Analytics dashboard failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "Testing completed!" -ForegroundColor Green
