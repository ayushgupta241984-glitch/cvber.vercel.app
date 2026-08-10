@echo off
setlocal
echo ============================================
echo   J.A.R.V.I.S. v3 -- Web Interface
echo ============================================

taskkill /F /IM python.exe >nul 2>&1

echo [1/2] Starting JARVIS backend on http://127.0.0.1:8001 ...
start "JARVIS Backend" cmd /c ""C:\Users\manoj\AppData\Local\Programs\Python\Python312\python.exe" -u "%~dp0backend\main.py""

echo [2/2] Opening browser ...
start "" http://127.0.0.1:8001/

echo Backend starting... (Vosk model load takes a few seconds)
echo Close the backend window to stop JARVIS.
endlocal
