@echo off
setlocal
echo Killing stale JARVIS processes...
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul 2>&1
set /p DEV=Enter mic device index (default 1 = built-in): 
if "%DEV%"=="" set DEV=1
"C:\Users\manoj\AppData\Local\Programs\Python\Python312\python.exe" -u "C:\Users\manoj\Downloads\cvber\jarvis_v3\jarvis_cli.py" %DEV%
pause
