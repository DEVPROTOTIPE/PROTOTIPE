#!/usr/bin/env pwsh
# =============================================================================
# PROTOTIPE — Script de Automatización E2E
# Uso: .\run-e2e.ps1 [-Watch] [-Headed] [-UpdateSnapshots]
# =============================================================================

param(
  [switch]$Watch,            # Modo watch: re-ejecuta al detectar cambios en tests/
  [switch]$Headed,           # Modo con browser visible (debug)
  [switch]$UpdateSnapshots   # Actualiza snapshots visuales si se usan
)

$projectRoot = $PSScriptRoot
$testDir = Join-Path $projectRoot "tests"

function Run-Tests {
  param([string]$Mode = "ci")

  Write-Host ""
  Write-Host "🎭 PROTOTIPE E2E — $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
  Write-Host "────────────────────────────────────────────────────" -ForegroundColor DarkGray

  $args = @("run", "test:ci")

  if ($Headed) {
    $args = @("run", "test:ui")
    Write-Host "  Modo: HEADED (browser visible)" -ForegroundColor Yellow
  } elseif ($UpdateSnapshots) {
    $args = @("exec", "playwright", "test", "--update-snapshots")
    Write-Host "  Modo: ACTUALIZAR SNAPSHOTS" -ForegroundColor Yellow
  } else {
    Write-Host "  Modo: HEADLESS (CI)" -ForegroundColor Green
  }

  Write-Host "────────────────────────────────────────────────────" -ForegroundColor DarkGray

  $result = & npm @args
  $exitCode = $LASTEXITCODE

  if ($exitCode -ne 0) {
    Write-Host ""
    Write-Host "  ❌ Tests FALLARON (código: $exitCode)" -ForegroundColor Red
    Write-Host "  💡 Revisa el reporte: npm run test:ui:show" -ForegroundColor Yellow
  } else {
    Write-Host ""
    Write-Host "  ✅ Todos los tests pasaron" -ForegroundColor Green
  }

  return $exitCode
}

# ── Modo Watch ────────────────────────────────────────────────────────────────
if ($Watch) {
  Write-Host "👁  Modo WATCH activo — monitoreando cambios en tests/" -ForegroundColor Magenta
  Write-Host "   Presiona Ctrl+C para detener." -ForegroundColor DarkGray

  $watcher = New-Object System.IO.FileSystemWatcher
  $watcher.Path = $testDir
  $watcher.Filter = "*.js"
  $watcher.IncludeSubdirectories = $true
  $watcher.EnableRaisingEvents = $true

  # Ejecutar una vez al inicio
  Run-Tests | Out-Null

  while ($true) {
    $change = $watcher.WaitForChanged([System.IO.WatcherChangeTypes]::All, 3000)
    if (-not $change.TimedOut) {
      Write-Host ""
      Write-Host "  📝 Cambio detectado: $($change.Name)" -ForegroundColor Yellow
      Start-Sleep -Milliseconds 500  # Debounce
      Run-Tests | Out-Null
    }
  }
}
# ── Modo Normal ───────────────────────────────────────────────────────────────
else {
  $exitCode = Run-Tests
  exit $exitCode
}
