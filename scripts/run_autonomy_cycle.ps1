$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$python = "python"

Push-Location $root
try {
  & $python ".\scripts\autonomy_cycle.py" once
}
finally {
  Pop-Location
}
