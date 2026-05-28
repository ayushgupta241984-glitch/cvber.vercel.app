$log = "C:\Users\manoj\Downloads\cvber\cvber.free.las.app\backend\server_8001.log"
$err = "C:\Users\manoj\Downloads\cvber\cvber.free.las.app\backend\server_8001_err.log"
$python = "python"
$args = @("-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001")
$p = Start-Process -PassThru -WindowStyle Hidden -FilePath $python -WorkingDirectory "C:\Users\manoj\Downloads\cvber\cvber.free.las.app\backend" -ArgumentList $args -RedirectStandardOutput $log -RedirectStandardError $err
Write-Output "Started PID: $($p.Id)"
