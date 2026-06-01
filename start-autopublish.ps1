$ErrorActionPreference = "Stop"

$ProjectRoot = "G:\telegram-15-channels"
$Logs = Join-Path $ProjectRoot "logs"
New-Item -ItemType Directory -Force -Path $Logs | Out-Null

Set-Location $ProjectRoot

$npm = Join-Path $ProjectRoot ".tools\node-v20.18.1-win-x64\npm.cmd"
if (-not (Test-Path -LiteralPath $npm)) {
  $npm = "npm.cmd"
}

$webLog = Join-Path $Logs "web.log"
$webErrLog = Join-Path $Logs "web.err.log"
$workerLog = Join-Path $Logs "worker.log"
$workerErrLog = Join-Path $Logs "worker.err.log"
$autopublishLog = Join-Path $Logs "autopublish.log"

Write-Host "Starting web server..."
Start-Process -FilePath $npm -ArgumentList @("run", "dev") -WorkingDirectory $ProjectRoot -RedirectStandardOutput $webLog -RedirectStandardError $webErrLog -WindowStyle Hidden

Start-Sleep -Seconds 5

Write-Host "Starting autopublish worker..."
Start-Process -FilePath $npm -ArgumentList @("run", "worker") -WorkingDirectory $ProjectRoot -RedirectStandardOutput $workerLog -RedirectStandardError $workerErrLog -WindowStyle Hidden
Set-Content -Path $autopublishLog -Value "Autopublish worker started at $(Get-Date -Format o). Details: worker.log / worker.err.log" -Encoding UTF8

Write-Host "Panel: http://localhost:3000/publishing-center"
Write-Host "Logs: $Logs"
Write-Host "Telegram token is never printed by this script."
