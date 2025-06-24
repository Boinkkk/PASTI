# Build and Run PASTI Analytics Dashboard

Write-Host "Building and starting PASTI with Analytics Dashboard..." -ForegroundColor Green

# Build Backend
Write-Host "1. Building Go backend..." -ForegroundColor Yellow
try {
    go build -o pasti.exe .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backend build successful" -ForegroundColor Green
    } else {
        Write-Host "✗ Backend build failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Backend build error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Build Frontend  
Write-Host "2. Building React frontend..." -ForegroundColor Yellow
try {
    Set-Location my-app
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend build successful" -ForegroundColor Green
    } else {
        Write-Host "✗ Frontend build failed" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
} catch {
    Write-Host "✗ Frontend build error: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Start Backend Server
Write-Host "3. Starting backend server..." -ForegroundColor Yellow
Write-Host "Analytics Dashboard will be available at:" -ForegroundColor Cyan
Write-Host "- Dashboard: http://localhost:5173/admin/analytics/dashboard" -ForegroundColor Cyan  
Write-Host "- Reports: http://localhost:5173/admin/analytics/attendance-report" -ForegroundColor Cyan
Write-Host "- Admin Login: http://localhost:5173/admin/login" -ForegroundColor Cyan

Start-Process -FilePath ".\pasti.exe" -WindowStyle Minimized

# Start Frontend Dev Server
Write-Host "4. Starting frontend dev server..." -ForegroundColor Yellow
Set-Location my-app
npm run dev
