@echo off
echo ============================================
echo  CVBER Local Deployment Script
echo  Host everything on your own PC
echo ============================================
echo.

echo [1/4] Checking Docker Desktop...
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker Desktop is not running.
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)
echo OK: Docker is running.

echo [2/4] Pulling Ollama image...
docker pull ollama/ollama:latest

echo [3/4] Starting all services...
docker-compose up -d

echo [4/4] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ============================================
echo  Services are starting!
echo ============================================
echo.
echo  API:       http://localhost:8000
echo  Health:    http://localhost:8000/health
echo  C2PA:      http://localhost:3001
echo  Ollama:    http://localhost:11434
echo.
echo  To expose publicly, set up Cloudflare Tunnel:
echo  cloudflared tunnel create cvber
echo  cloudflared tunnel route dns cvber your-subdomain.example.com
echo  cloudflared tunnel run cvber
echo.
echo  To stop: docker compose down
echo ============================================

pause