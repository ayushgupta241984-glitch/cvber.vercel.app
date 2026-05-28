Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\manoj\Downloads\cvber\cvber.free.las.app\backend"
WshShell.Run "python -m uvicorn app.main:app --host 0.0.0.0 --port 8001", 0, False
