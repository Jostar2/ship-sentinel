$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$python = "python"

Push-Location $root
try {
  & $python ".\scripts\autonomy_loop.py" claim-next --write-brief
  & $python ".\scripts\autonomy_loop.py" status
}
finally {
  Pop-Location
}
