param(
  [switch]$Remove
)

$ErrorActionPreference = "Stop"

$startupDir = [Environment]::GetFolderPath("Startup")
$launcherPath = Join-Path $startupDir "ShipSentinelAutonomy.cmd"
$watchScript = Join-Path $PSScriptRoot "start_autonomy_watch.ps1"

if ($Remove) {
  if (Test-Path $launcherPath) {
    Remove-Item $launcherPath -Force
    Write-Host "Removed startup launcher: $launcherPath"
  } else {
    Write-Host "Startup launcher not found."
  }
  exit 0
}

$content = "@echo off`r`n" + 'start "" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -File "' + $watchScript + '"' + "`r`n"
Set-Content -Path $launcherPath -Value $content -Encoding ASCII
Write-Host "Installed startup launcher: $launcherPath"
