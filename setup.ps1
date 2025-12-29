# CVBER Free - Quick Setup Script
# Run this to install all dependencies

Write-Host "🚀 CVBER Free - Installing Dependencies" -ForegroundColor Cyan
Write-Host ""

# Backend
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location backend
pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Backend installation failed" -ForegroundColor Red
}
Set-Location ..

Write-Host ""

# Frontend
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend installation failed" -ForegroundColor Red
}
Set-Location ..

Write-Host ""

# C2PA Service
Write-Host "📦 Installing C2PA Service Dependencies..." -ForegroundColor Yellow
Set-Location c2pa-service
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ C2PA service dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ C2PA service installation failed" -ForegroundColor Red
    Write-Host "⚠️  Note: C2PA requires native compilation tools" -ForegroundColor Yellow
}
Set-Location ..

Write-Host ""
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy .env.example to .env (optional for testing)"
Write-Host "2. Start backend:  cd backend && python -m uvicorn app.main:app --reload"
Write-Host "3. Start C2PA:     cd c2pa-service && npm run dev"
Write-Host "4. Start frontend: cd frontend && npm run dev"
Write-Host "5. Open http://localhost:3000"
Write-Host ""
