param(
  [switch]$DryRun,
  [int]$Interval = 45
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$python = "python"
$argsList = @(".\scripts\autonomy_cycle.py", "watch", "--interval", "$Interval")

if ($DryRun) {
  $argsList += "--dry-run"
}

Push-Location $root
try {
  & $python @argsList
}
finally {
  Pop-Location
}
