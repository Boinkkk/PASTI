# Test Analytics Dashboard API

# First, login as admin to get token
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
    Write-Host "✓ Admin login successful" -ForegroundColor Green
    Write-Host "Token: $adminToken" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test Analytics Dashboard
Write-Host "`n2. Testing analytics dashboard..." -ForegroundColor Yellow

try {
    $headers = @{
        'Authorization' = $adminToken
        'Content-Type' = 'application/json'
    }
    
    $dashboardResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/analytics/dashboard" -Method GET -Headers $headers
    
    Write-Host "✓ Analytics dashboard API successful" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host ($dashboardResponse | ConvertTo-Json -Depth 3)
    
} catch {
    Write-Host "✗ Analytics dashboard failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test Attendance Report
Write-Host "`n3. Testing attendance report..." -ForegroundColor Yellow

try {
    $reportUrl = "http://localhost:8080/api/admin/analytics/attendance-report?limit=10"
    
    $reportResponse = Invoke-RestMethod -Uri $reportUrl -Method GET -Headers $headers
    
    Write-Host "✓ Attendance report API successful" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host ($reportResponse | ConvertTo-Json -Depth 3)
    
} catch {
    Write-Host "✗ Attendance report failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "`nTesting completed!" -ForegroundColor Green
