# ==============================================================================
#                 PROTOTIPE ECOSISTEMA - BACKUP ENGINE (PREMIUM)
# ==============================================================================
# Este script realiza un snapshot fisico y sincronizacion con GitHub.
# Disenado con una interfaz visual limpia y codificacion compatible.

param (
    [string]$CommitMessage = ""
)

# Forzar consola a UTF-8 para evitar caracteres extranos en Windows
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = "D:\PROTOTIPE"
Set-Location -Path $rootDir

# Limpiar pantalla para una visualizacion impecable
Clear-Host

# Cabecera Visual Premium
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "           [PROTOTIPE ECOSISTEMA - ENGINE DE RESPALDO]" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar repositorio Git
if (-not (Test-Path "$rootDir\.git")) {
    Write-Host " [INFO] Inicializando repositorio Git maestro en la raiz..." -ForegroundColor Cyan
    git init | Out-Null
}

# Determinar mensaje de commit
$currentDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
    $CommitMessage = "Snapshot general PROTOTIPE - $currentDate"
}

Write-Host " [Commit Info] $CommitMessage" -ForegroundColor Gray
Write-Host " [Ruta de Trabajo] $rootDir" -ForegroundColor Gray
Write-Host ""
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray

# Buscar repositorios Git de desarrollo
Write-Host " [1/6] Escaneando directorios en busqueda de Git locales..." -ForegroundColor Cyan
$gitDirs = Get-ChildItem -Path $rootDir -Directory -Hidden -Filter ".git" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -ne "$rootDir\.git"
}

$renamedDirs = @()

try {
    # 1. Renombrar temporalmente los .git locales para evitar Git Links vacios
    $gitDirsCount = $gitDirs.Count
    if ($gitDirsCount -gt 0) {
        Write-Host " [2/6] Ocultando temporalmente $gitDirsCount repositorios de desarrollo..." -ForegroundColor Yellow
        foreach ($dir in $gitDirs) {
            $parentPath = $dir.Parent.FullName
            $parentName = $dir.Parent.Name
            $tempPath = "$parentPath\.git-backup-temp"
            
            Write-Host "    -> Ocultando: $parentName/.git" -ForegroundColor DarkGray
            Rename-Item -Path $dir.FullName -NewName ".git-backup-temp" -Force
            
            $renamedDirs += [PSCustomObject]@{
                OriginalPath = $dir.FullName
                TempPath     = $tempPath
                ParentName   = $parentName
            }
        }
    } else {
        Write-Host " [2/6] No se detectaron repositorios Git internos adicionales." -ForegroundColor Gray
    }

    # 2. Agregar cambios
    Write-Host " [3/6] Indexando archivos fisicos en el snapshot..." -ForegroundColor Cyan
    git add . 2>&1 | Out-Null

    # 3. Validar cambios
    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host ""
        Write-Host " [OK] Tu repositorio ya esta al dia con la informacion local. Cero cambios." -ForegroundColor Green
        Write-Host ""
    } else {
        # 4. Confirmar cambios localmente
        Write-Host " [4/6] Guardando snapshot en el historial local..." -ForegroundColor Cyan
        git commit -m $CommitMessage | Out-Null
        Write-Host "    -> Snapshot local creado con exito." -ForegroundColor Gray

        # 5. Sincronizar con GitHub
        Write-Host " [5/6] Sincronizando cambios con GitHub (git push)..." -ForegroundColor Cyan
        Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
        git push
        Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
        Write-Host " [SUCCESS] Sincronizacion con el repositorio remoto completada con exito." -ForegroundColor Green
    }
}
catch {
    Write-Host ""
    Write-Host " [ERROR] Ocurrio un fallo en el proceso de respaldo:" -ForegroundColor Red
    Write-Host "    -> $_" -ForegroundColor Red
    Write-Host ""
}
finally {
    # 6. Restaurar de forma 100% segura los directorios .git de desarrollo
    $renamedCount = $renamedDirs.Count
    if ($renamedCount -gt 0) {
        Write-Host " [6/6] Restaurando directorios Git de desarrollo..." -ForegroundColor Yellow
        foreach ($dir in $renamedDirs) {
            $tempPath = $dir.TempPath
            $originalName = $dir.ParentName
            if (Test-Path $tempPath) {
                Write-Host "    -> Habilitando: $originalName/.git" -ForegroundColor DarkGray
                Rename-Item -Path $tempPath -NewName ".git" -Force
            }
        }
    }
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "  [OK] Snapshot completado | Entorno de desarrollo restaurado con exito" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Cyan
}
