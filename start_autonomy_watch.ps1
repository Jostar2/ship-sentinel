param(
  [switch]$DryRun,
  [int]$Interval = 45
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$forwardScript = Join-Path $scriptRoot "scripts\start_autonomy_watch.ps1"

$argsList = @()
if ($DryRun) {
  $argsList += "-DryRun"
}
if ($PSBoundParameters.ContainsKey("Interval")) {
  $argsList += "-Interval"
  $argsList += "$Interval"
}

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $forwardScript @argsList
