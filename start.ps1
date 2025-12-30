# Start all CVBER Free services

Write-Host "🚀 Starting CVBER Free Platform" -ForegroundColor Cyan
Write-Host ""

# Check if dependencies are installed
if (-not (Test-Path "backend\venv") -and -not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Python dependencies may not be installed. Run setup.ps1 first." -ForegroundColor Yellow
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "⚠️  Frontend dependencies not installed. Run setup.ps1 first." -ForegroundColor Yellow
}

Write-Host "Starting services in separate windows..." -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "📡 Starting Backend (port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Cyan; python -m uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 2

# Start C2PA Service
Write-Host "🔐 Starting C2PA Service (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\c2pa-service'; Write-Host '🔐 C2PA Service' -ForegroundColor Cyan; npm.cmd run dev"

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "🎨 Starting Frontend (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 Frontend Server' -ForegroundColor Cyan; npm.cmd run dev"

Write-Host ""
Write-Host "✨ All services starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8000"
Write-Host "  C2PA:     http://localhost:3001"
Write-Host "  Frontend: http://localhost:3000"
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop services" -ForegroundColor Yellow
