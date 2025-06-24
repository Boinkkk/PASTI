# Start PASTI Frontend with Bulk Grade Calculation
# Author: AI Assistant
# Description: Script untuk menjalankan frontend React dengan fitur bulk grade calculation

Write-Host "=== Starting PASTI Frontend ===" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js tidak terdeteksi. Install Node.js terlebih dahulu." -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
Set-Location "my-app"

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json tidak ditemukan di direktori my-app" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Gagal install dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Starting development server..." -ForegroundColor Yellow
Write-Host "Frontend akan tersedia di: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Bulk Grade Calculation page: http://localhost:5173/admin/analytics/bulk-grade-calculation" -ForegroundColor Cyan
Write-Host "`nTekan Ctrl+C untuk stop server" -ForegroundColor Yellow

try {
    npm run dev
} catch {
    Write-Host "❌ Gagal start development server: $($_.Exception.Message)" -ForegroundColor Red
}
