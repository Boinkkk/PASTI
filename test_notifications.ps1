# PASTI Notification System Test Script
# PowerShell version for Windows

Write-Host "🔔 Testing PASTI Notification System" -ForegroundColor Green
Write-Host "=================================="

# Test 1: Trigger manual notification
Write-Host "📱 Test 1: Triggering manual notification cron job..." -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_JWT_TOKEN_HERE"
}

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:8080/api/guru/notifications/trigger" -Method POST -Headers $headers
    Write-Host "✅ Response: $($response1 | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Get notification stats
Write-Host "📊 Test 2: Getting notification statistics..." -ForegroundColor Yellow

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8080/api/guru/notifications/stats" -Method GET -Headers $headers
    Write-Host "✅ Response: $($response2 | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Instructions:" -ForegroundColor Cyan
Write-Host "1. Make sure your API server is running: go run main.go"
Write-Host "2. Replace YOUR_JWT_TOKEN_HERE with actual JWT token from login"
Write-Host "3. Ensure FONNTE_API_KEY is set correctly in .env file" 
Write-Host "4. Check database for notifikasi_tugas table entries"
