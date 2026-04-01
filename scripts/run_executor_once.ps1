$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$python = "python"

Push-Location $root
try {
  & $python ".\scripts\autonomous_executor.py" status
  & $python ".\scripts\autonomous_executor.py" run-current
  & $python ".\scripts\autonomous_executor.py" tail-log --limit 5
}
finally {
  Pop-Location
}
