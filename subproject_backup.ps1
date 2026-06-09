# ==============================================================================
#                 PROTOTIPE ECOSISTEMA - SUBPROJECT BACKUP ENGINE
# ==============================================================================
# Este script automatiza el guardado y push de subproyectos individuales.
# Respeta de forma dinámica la rama actual (Git Strategies).

param (
    [string]$SubprojectPath = "",
    [string]$CommitMessage = ""
)

# Forzar consola a UTF-8 para evitar caracteres extraños en Windows
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

if ([string]::IsNullOrWhiteSpace($SubprojectPath) -or -not (Test-Path $SubprojectPath)) {
    Write-Host " [ERROR] Ruta de subproyecto invalida o no especificada." -ForegroundColor Red
    exit 1
}

Set-Location -Path $SubprojectPath

# Limpiar pantalla para una visualización impecable
Clear-Host

# Obtener nombre del subproyecto
$projectName = Split-Path -Path $SubprojectPath -Leaf

# Auto-detectar la rama actual
$branchName = (git rev-parse --abbrev-ref HEAD 2>$null)
if (-not $branchName) {
    Write-Host " [ERROR] El directorio especificado no es un repositorio Git valido." -ForegroundColor Red
    exit 1
}

# Cabecera Visual
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "         ⚡ RESPALDO DE SUBPROYECTO: $projectName ⚡" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host " 🌿 Rama Activa: $branchName" -ForegroundColor Yellow
Write-Host " 📁 Ruta: $SubprojectPath" -ForegroundColor Gray
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray

# Mostrar cambios pendientes
Write-Host " 🔍 Cambios pendientes detectados:" -ForegroundColor Cyan
$statusShort = git status --short
if ([string]::IsNullOrWhiteSpace($statusShort)) {
    Write-Host "    └─ Ninguno. Tu repositorio local esta 100% al dia." -ForegroundColor Green
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    exit 0
}

Write-Host $statusShort -ForegroundColor Gray
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray

# Solicitar mensaje de commit interactivo
if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
    Write-Host " 📝 Escribe el mensaje para el commit (Presiona Enter para mensaje automatico):" -ForegroundColor Cyan
    Write-Host " > " -NoNewline
    $inputMessage = Read-Host
    
    if ([string]::IsNullOrWhiteSpace($inputMessage)) {
        $currentDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $CommitMessage = "Snapshot [$branchName] - $currentDate"
    } else {
        $CommitMessage = $inputMessage
    }
}

Write-Host ""
Write-Host " [1/3] Indexando cambios locales..." -ForegroundColor Cyan
git add . 2>&1 | Out-Null

Write-Host " [2/3] Creando commit local..." -ForegroundColor Cyan
git commit -m $CommitMessage 2>&1 | Out-Null
Write-Host "    └─ Commit exitoso: '$CommitMessage'" -ForegroundColor Gray

Write-Host " [3/3] Sincronizando con GitHub (git push origin $branchName)..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
git push origin $branchName
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray

Write-Host " ✅ Proceso completado. Tu trabajo en la rama [$branchName] esta a salvo en GitHub." -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
