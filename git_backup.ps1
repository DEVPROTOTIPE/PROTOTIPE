# Script de Respaldo Maestro para el Repositorio General de PROTOTIPE
# Este script renombra temporalmente los directorios .git de las subcarpetas
# para que Git de la raíz pueda realizar un snapshot físico real de todo el código.

param (
    [string]$CommitMessage = ""
)

# Forzar codificación UTF-8 en consola
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = "D:\PROTOTIPE"
Set-Location -Path $rootDir

# Verificar si el repositorio Git de la raíz está inicializado
if (-not (Test-Path "$rootDir\.git")) {
    Write-Host "Inicializando repositorio Git raíz en $rootDir..." -ForegroundColor Cyan
    git init
}

# Obtener fecha y hora actual para mensaje por defecto
$currentDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
    $CommitMessage = "Snapshot general PROTOTIPE - $currentDate"
}

Write-Host "--- INICIANDO PROCESO DE RESPALDO MAESTRO ---" -ForegroundColor Yellow
Write-Host "Mensaje de commit: '$CommitMessage'" -ForegroundColor Gray

# Buscar todas las carpetas .git internas (excluyendo la raíz)
Write-Host "Buscando repositorios Git internos..." -ForegroundColor Cyan
$gitDirs = Get-ChildItem -Path $rootDir -Directory -Hidden -Filter ".git" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -ne "$rootDir\.git"
}

$renamedDirs = @()

try {
    # 1. Renombrar temporalmente las carpetas .git internas
    if ($gitDirs.Count -gt 0) {
        Write-Host "Ocultando temporalmente $($gitDirs.Count) repositorios Git internos..." -ForegroundColor Yellow
        foreach ($dir in $gitDirs) {
            $tempPath = "$($dir.Parent.FullName)\.git-backup-temp"
            Write-Host "Ocultando: $($dir.FullName) -> $tempPath" -ForegroundColor Gray
            Rename-Item -Path $dir.FullName -NewName ".git-backup-temp" -Force
            $renamedDirs += [PSCustomObject]@{
                OriginalPath = $dir.FullName
                TempPath     = $tempPath
            }
        }
    } else {
        Write-Host "No se encontraron repositorios Git internos para ocultar." -ForegroundColor Gray
    }

    # 2. Agregar cambios al índice en el Git de la raíz
    Write-Host "Agregando archivos al índice general de Git..." -ForegroundColor Cyan
    git add .

    # 3. Validar si hay cambios reales para hacer commit
    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host "No hay cambios nuevos detectados en el ecosistema." -ForegroundColor Green
    } else {
        # 4. Crear commit de respaldo físico
        Write-Host "Creando commit de respaldo general..." -ForegroundColor Cyan
        git commit -m $CommitMessage
        Write-Host "Snapshot guardado exitosamente en el historial local." -ForegroundColor Green
        Write-Host "Puedes subirlo a tu repositorio remoto ejecutando: git push" -ForegroundColor Yellow
    }

}
catch {
    Write-Error "Ocurrió un error inesperado durante el respaldo: $_"
}
finally {
    # 5. Restaurar de manera segura todas las carpetas .git originales
    if ($renamedDirs.Count -gt 0) {
        Write-Host "Restaurando directorios Git de desarrollo..." -ForegroundColor Yellow
        foreach ($dir in $renamedDirs) {
            if (Test-Path $dir.TempPath) {
                Write-Host "Restaurando: $($dir.TempPath) -> $($dir.OriginalPath)" -ForegroundColor Gray
                Rename-Item -Path $dir.TempPath -NewName ".git" -Force
            }
        }
    }
    Write-Host "--- PROCESO DE RESPALDO FINALIZADO CON ÉXITO ---" -ForegroundColor Green
}
