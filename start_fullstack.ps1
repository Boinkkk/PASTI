# Start PASTI Full Stack (Backend + Frontend)
# Author: AI Assistant
# Description: Script untuk menjalankan backend Go dan frontend React secara bersamaan

Write-Host "=== Starting PASTI Full Stack ===" -ForegroundColor Green

# Check if Go is installed
try {
    $goVersion = go version
    Write-Host "✅ Go detected: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go tidak terdeteksi. Install Go terlebih dahulu." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js tidak terdeteksi. Install Node.js terlebih dahulu." -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Starting services..." -ForegroundColor Yellow

# Start Backend Go server in background
Write-Host "📡 Starting Backend (Go) server..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    go run main.go
}

Write-Host "✅ Backend server started (Job ID: $($backendJob.Id))" -ForegroundColor Green
Write-Host "   Backend URL: http://localhost:8080" -ForegroundColor Cyan

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend React dev server
Write-Host "`n🌐 Starting Frontend (React) server..." -ForegroundColor Yellow
Set-Location "my-app"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

Write-Host "🚀 Starting React development server..." -ForegroundColor Yellow
Write-Host "   Frontend URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`n🎯 Access Points:" -ForegroundColor Yellow
Write-Host "   • Analytics Dashboard: http://localhost:5173/admin/analytics/dashboard" -ForegroundColor Cyan
Write-Host "   • Attendance Report: http://localhost:5173/admin/analytics/attendance-report" -ForegroundColor Cyan
Write-Host "   • Bulk Grade Calculation: http://localhost:5173/admin/analytics/bulk-grade-calculation" -ForegroundColor Cyan
Write-Host "`n📋 Admin Login:" -ForegroundColor Yellow
Write-Host "   • Username: admin" -ForegroundColor Cyan
Write-Host "   • Password: admin123" -ForegroundColor Cyan
Write-Host "`nTekan Ctrl+C untuk stop semua servers" -ForegroundColor Yellow

try {
    # Start frontend and wait for it to finish
    npm run dev
} catch {
    Write-Host "❌ Frontend server error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Stop backend job when frontend exits
    Write-Host "`n🛑 Stopping backend server..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob
    Remove-Job -Job $backendJob
    Write-Host "✅ All servers stopped" -ForegroundColor Green
}
