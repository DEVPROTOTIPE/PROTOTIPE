# ==============================================================================
#                 PROTOTIPE ECOSISTEMA - GESTOR MAESTRO DE RESPALDOS
# ==============================================================================
# Menu interactivo dinamico para control de versiones y snapshots generales.
# Detecta de forma autonoma plantillas y clientes en el disco.

# Forzar consola a UTF-8 para evitar caracteres extranos en Windows
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = "D:\PROTOTIPE"
$coresDir = "$rootDir\Plantillas Core"
$instancesDir = "$rootDir\Instancias Clientes"
$dashboardDir = "$rootDir\Central PROTOTIPE\dev-dashboard"

# Asegurar que estamos en el directorio de trabajo
Set-Location -Path $rootDir

function Show-Header {
    Clear-Host
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "         [PROTOTIPE ECOSISTEMA - GESTOR DE RESPALDOS GIT]" -ForegroundColor Cyan
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Run-Master-Backup {
    Show-Header
    Write-Host " >>> INICIANDO RESPALDO MAESTRO DE TODO EL PROYECTO <<<" -ForegroundColor Yellow
    Write-Host ""
    # Llamar al script existente de backup general
    powershell -NoProfile -ExecutionPolicy Bypass -File "$rootDir\git_backup.ps1"
}

function Run-Subproject-Backup {
    param (
        [string]$Path
    )
    # Llamar al script de subproyectos
    powershell -NoProfile -ExecutionPolicy Bypass -File "$rootDir\subproject_backup.ps1" -SubprojectPath $Path
}

function Manage-Cores {
    Show-Header
    Write-Host " [GESTION DE PLANTILLAS CORE]" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
    
    if (-not (Test-Path $coresDir)) {
        Write-Host " [INFO] No se encontro la carpeta de Plantillas Core ($coresDir)." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    $cores = Get-ChildItem -Path $coresDir -Directory
    if ($cores.Count -eq 0) {
        Write-Host " [INFO] No hay plantillas core registradas fisicamente en el disco." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    Write-Host " Seleccione la plantilla Core que desea respaldar/guardar:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $cores.Count; $i++) {
        $hasGit = Test-Path "$($cores[$i].FullName)\.git"
        $gitStatus = if ($hasGit) { "[Git Activo]" } else { "[Sin Git]" }
        $color = if ($hasGit) { "Green" } else { "DarkGray" }
        
        Write-Host "   [$($i + 1)] $($cores[$i].Name) " -NoNewline -ForegroundColor White
        Write-Host $gitStatus -ForegroundColor $color
    }
    Write-Host "   [A] Atras" -ForegroundColor Gray
    Write-Host ""
    Write-Host " > Seleccione una opcion: " -NoNewline
    $selection = Read-Host
    
    if ($selection -like "a" -or $selection -like "A") { return }
    
    $index = [int]$selection - 1
    if ($index -ge 0 -and $index -lt $cores.Count) {
        $selectedPath = $cores[$index].FullName
        if (-not (Test-Path "$selectedPath\.git")) {
            Show-Header
            Write-Host " [WARNING] El subproyecto $($cores[$index].Name) no tiene un repositorio Git activo." -ForegroundColor Yellow
            Write-Host " Desea inicializarlo ahora? (S/N): " -NoNewline
            $initGit = Read-Host
            if ($initGit -like "s" -or $initGit -like "S") {
                Set-Location -Path $selectedPath
                git init | Out-Null
                Write-Host " Repositorio Git inicializado con exito." -ForegroundColor Green
                Start-Sleep -Seconds 1
            } else {
                return
            }
        }
        Run-Subproject-Backup -Path $selectedPath
    } else {
        Write-Host " Opcion invalida." -ForegroundColor Red
        Start-Sleep -Seconds 1
    }
}

function Manage-Instances {
    Show-Header
    Write-Host " [GESTION DE INSTANCIAS DE CLIENTES]" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
    
    if (-not (Test-Path $instancesDir)) {
        Write-Host " [INFO] No se encontro la carpeta de Instancias Clientes ($instancesDir)." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    $instances = Get-ChildItem -Path $instancesDir -Directory
    if ($instances.Count -eq 0) {
        Write-Host " [INFO] No hay instancias de clientes registradas fisicamente en el disco." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    Write-Host " Seleccione la Instancia de Cliente que desea respaldar/guardar:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $instances.Count; $i++) {
        $hasGit = Test-Path "$($instances[$i].FullName)\.git"
        $gitStatus = if ($hasGit) { "[Git Activo]" } else { "[Sin Git]" }
        $color = if ($hasGit) { "Green" } else { "DarkGray" }
        
        Write-Host "   [$($i + 1)] $($instances[$i].Name) " -NoNewline -ForegroundColor White
        Write-Host $gitStatus -ForegroundColor $color
    }
    Write-Host "   [A] Atras" -ForegroundColor Gray
    Write-Host ""
    Write-Host " > Seleccione una opcion: " -NoNewline
    $selection = Read-Host
    
    if ($selection -like "a" -or $selection -like "A") { return }
    
    $index = [int]$selection - 1
    if ($index -ge 0 -and $index -lt $instances.Count) {
        $selectedPath = $instances[$index].FullName
        if (-not (Test-Path "$selectedPath\.git")) {
            Show-Header
            Write-Host " [WARNING] La instancia $($instances[$index].Name) no tiene un repositorio Git activo." -ForegroundColor Yellow
            Write-Host " Desea inicializarla ahora? (S/N): " -NoNewline
            $initGit = Read-Host
            if ($initGit -like "s" -or $initGit -like "S") {
                Set-Location -Path $selectedPath
                git init | Out-Null
                Write-Host " Repositorio Git inicializado con exito." -ForegroundColor Green
                Start-Sleep -Seconds 1
            } else {
                return
            }
        }
        Run-Subproject-Backup -Path $selectedPath
    } else {
        Write-Host " Opcion invalida." -ForegroundColor Red
        Start-Sleep -Seconds 1
    }
}

# Bucle principal del menu
do {
    Show-Header
    Write-Host " Seleccione que accion de control de versiones desea realizar:" -ForegroundColor Cyan
    Write-Host "   [0] RESPALDO MAESTRO DE TODO PROTOTIPE (Snapshot Fisico Completo)" -ForegroundColor Yellow
    Write-Host "   [1] Guardar / Subir Consola Central (dev-dashboard)" -ForegroundColor White
    Write-Host "   [2] Guardar / Subir una Plantilla Core (Molde)" -ForegroundColor White
    Write-Host "   [3] Guardar / Subir una Instancia de Cliente (Produccion/Dev)" -ForegroundColor White
    Write-Host "   [Q] Salir" -ForegroundColor Gray
    Write-Host ""
    Write-Host " > Ingrese su opcion: " -NoNewline
    $menuOption = Read-Host
    
    switch ($menuOption) {
        "0" { Run-Master-Backup; Write-Host " Presione cualquier tecla para volver al menu..."; Read-Host | Out-Null }
        "1" { Run-Subproject-Backup -Path $dashboardDir; Write-Host " Presione cualquier tecla para volver al menu..."; Read-Host | Out-Null }
        "2" { Manage-Cores }
        "3" { Manage-Instances }
        "q" { break }
        "Q" { break }
        default { Write-Host " Opcion invalida. Intente de nuevo." -ForegroundColor Red; Start-Sleep -Seconds 1 }
    }
} while ($true)

Write-Host ""
Write-Host " Hasta luego! Entorno de desarrollo seguro." -ForegroundColor Green
Start-Sleep -Seconds 1
