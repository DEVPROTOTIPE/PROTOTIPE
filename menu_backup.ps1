# ==============================================================================
#                 PROTOTIPE ECOSISTEMA - GESTOR MAESTRO DE RESPALDOS
# ==============================================================================
# Menu interactivo premium con navegacion por flechas y seleccion con Enter.
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

# Funcion generica para menu interactivo con flechas y Enter
function Get-MenuSelection {
    param (
        [string]$Title,
        [string[]]$Options
    )
    
    $selectedIndex = 0
    $key = 0
    
    # Ocultar el cursor para una interfaz mas limpia usando secuencias ANSI
    Write-Host "$([char]27)[?25l" -NoNewline
    
    $cursorSizeRestored = $false
    try {
        # Intentar guardar el tamaño del cursor original si la consola lo soporta
        $cursorSize = 25
        try {
            $cursorSize = $Host.UI.RawUI.CursorSize
            if ($cursorSize -gt 0) {
                $Host.UI.RawUI.CursorSize = 1
            }
        } catch {}

        while ($true) {
            Show-Header
            Write-Host " $Title" -ForegroundColor Yellow
            Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
            Write-Host " Use las flechas [Up / Down] para navegar y [Enter] para seleccionar:" -ForegroundColor Gray
            Write-Host ""
            
            for ($i = 0; $i -lt $Options.Count; $i++) {
                if ($i -eq $selectedIndex) {
                    Write-Host "  >  $($Options[$i])" -ForegroundColor Cyan
                } else {
                    Write-Host "     $($Options[$i])" -ForegroundColor White
                }
            }
            Write-Host ""
            Write-Host "======================================================================" -ForegroundColor Cyan
            
            # Capturar tecla presionada
            $keyInfo = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            $key = $keyInfo.VirtualKeyCode
            
            # Flecha Arriba (Virtual Key 38)
            if ($key -eq 38) {
                $selectedIndex--
                if ($selectedIndex -lt 0) { $selectedIndex = $Options.Count - 1 }
            }
            # Flecha Abajo (Virtual Key 40)
            elseif ($key -eq 40) {
                $selectedIndex++
                if ($selectedIndex -ge $Options.Count) { $selectedIndex = 0 }
            }
            # Enter (Virtual Key 13)
            elseif ($key -eq 13) {
                return $selectedIndex
            }
            # Tecla Q o Escape (Virtual Key 81 o 27)
            elseif ($key -eq 81 -or $key -eq 27) {
                return -1
            }
        }
    }
    finally {
        # Restaurar el cursor al salir
        Write-Host "$([char]27)[?25h" -NoNewline
        if (-not $cursorSizeRestored) {
            try {
                if ($cursorSize -gt 0) {
                    $Host.UI.RawUI.CursorSize = $cursorSize
                }
            } catch {}
        }
    }
}

function Run-Master-Backup {
    Show-Header
    Write-Host " [INICIANDO RESPALDO MAESTRO DE TODO EL PROYECTO]" -ForegroundColor Yellow
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
    if (-not (Test-Path $coresDir)) {
        Show-Header
        Write-Host " [INFO] No se encontro la carpeta de Plantillas Core ($coresDir)." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    $cores = Get-ChildItem -Path $coresDir -Directory
    if ($cores.Count -eq 0) {
        Show-Header
        Write-Host " [INFO] No hay plantillas core registradas fisicamente en el disco." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    # Preparar opciones del menu
    $options = @()
    for ($i = 0; $i -lt $cores.Count; $i++) {
        $hasGit = Test-Path "$($cores[$i].FullName)\.git"
        $gitStatus = if ($hasGit) { " (Git Activo)" } else { " (Sin Git)" }
        $options += "$($cores[$i].Name)$gitStatus"
    }
    $options += "[ Volver al menu principal ]"
    
    $selectionIndex = Get-MenuSelection -Title "GESTION DE PLANTILLAS CORE" -Options $options
    
    # Validar si se selecciono volver o salir
    if ($selectionIndex -eq -1 -or $selectionIndex -eq ($options.Count - 1)) { return }
    
    $selectedPath = $cores[$selectionIndex].FullName
    if (-not (Test-Path "$selectedPath\.git")) {
        Show-Header
        Write-Host " [WARNING] El subproyecto $($cores[$selectionIndex].Name) no tiene un repositorio Git activo." -ForegroundColor Yellow
        Write-Host " Desea inicializarlo ahora? (S/N): " -NoNewline -ForegroundColor Cyan
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
}

function Manage-Instances {
    if (-not (Test-Path $instancesDir)) {
        Show-Header
        Write-Host " [INFO] No se encontro la carpeta de Instancias Clientes ($instancesDir)." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    $instances = Get-ChildItem -Path $instancesDir -Directory
    if ($instances.Count -eq 0) {
        Show-Header
        Write-Host " [INFO] No hay instancias de clientes registradas fisicamente en el disco." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    # Preparar opciones del menu
    $options = @()
    for ($i = 0; $i -lt $instances.Count; $i++) {
        $hasGit = Test-Path "$($instances[$i].FullName)\.git"
        $gitStatus = if ($hasGit) { " (Git Activo)" } else { " (Sin Git)" }
        $options += "$($instances[$i].Name)$gitStatus"
    }
    $options += "[ Volver al menu principal ]"
    
    $selectionIndex = Get-MenuSelection -Title "GESTION DE INSTANCIAS DE CLIENTES" -Options $options
    
    # Validar si se selecciono volver o salir
    if ($selectionIndex -eq -1 -or $selectionIndex -eq ($options.Count - 1)) { return }
    
    $selectedPath = $instances[$selectionIndex].FullName
    if (-not (Test-Path "$selectedPath\.git")) {
        Show-Header
        Write-Host " [WARNING] La instancia $($instances[$selectionIndex].Name) no tiene un repositorio Git activo." -ForegroundColor Yellow
        Write-Host " Desea inicializarla ahora? (S/N): " -NoNewline -ForegroundColor Cyan
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
}

# Opciones del Menu Principal
$mainOptions = @(
    "Respaldo Maestro de todo PROTOTIPE (Snapshot Fisico)",
    "Guardar / Subir Consola Central (dev-dashboard)",
    "Guardar / Subir una Plantilla Core (Molde)",
    "Guardar / Subir una Instancia de Cliente (Produccion/Dev)",
    "Salir"
)

# Bucle principal del menu
do {
    $choice = Get-MenuSelection -Title "SELECCIONE LA ACCION QUE DESEA REALIZAR:" -Options $mainOptions
    
    switch ($choice) {
        0 { Run-Master-Backup; Write-Host " Presione cualquier tecla para volver al menu..."; Read-Host | Out-Null }
        1 { Run-Subproject-Backup -Path $dashboardDir; Write-Host " Presione cualquier tecla para volver al menu..."; Read-Host | Out-Null }
        2 { Manage-Cores }
        3 { Manage-Instances }
        4 { break }
        -1 { break }
    }
} while ($true)

Write-Host ""
Write-Host " Hasta luego! Entorno de desarrollo seguro." -ForegroundColor Green
Start-Sleep -Seconds 1
