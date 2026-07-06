# ==============================================================================
#                 PROTOTIPE ECOSISTEMA - GESTOR MAESTRO DE RESPALDOS
# ==============================================================================
# Menu interactivo premium con navegacion por flechas y seleccion con Enter.
# Detecta de forma autonoma plantillas y clientes en el disco.

# Forzar consola a UTF-8 para evitar caracteres extranos en Windows
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = if ($env:PROTOTIPE_WORKSPACE_ROOT) { $env:PROTOTIPE_WORKSPACE_ROOT } else { "D:\PROTOTIPE" }
if (-not (Test-Path $rootDir)) {
    $rootDir = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
}
$coresDir = "$rootDir\Plantillas Core"
$instancesDir = "$rootDir\Instancias Clientes"
$dashboardDir = "$rootDir\Central PROTOTIPE\dev-dashboard"

# Asegurar que estamos en el directorio de trabajo
Set-Location -Path $rootDir

# Rutina de auto-recuperacion ante cierres abruptos (restaurar .git-backup-temp a .git)
# Depth 5 cubre todos los subrepos anidados sin recorrer node_modules ni carpetas profundas
$tempGitDirs = Get-ChildItem -Path $rootDir -Directory -Hidden -Filter ".git-backup-temp" -Recurse -Depth 5 -ErrorAction SilentlyContinue
if ($tempGitDirs.Count -gt 0) {
    # Omitimos detener los servidores locales de desarrollo Vite (dev-dashboard, App Ventas, etc.).
    # El renombrado de las carpetas .git es tolerante a bloqueos y se realiza mediante un bucle con reintentos.
    $viteStopped = $false

    foreach ($tempDir in $tempGitDirs) {
        if (Test-Path $tempDir.FullName) {
            $retries = 6
            $restored = $false
            while (-not $restored -and $retries -gt 0) {
                try {
                    attrib -h -r -s $tempDir.FullName 2>&1 | Out-Null
                    Rename-Item -Path $tempDir.FullName -NewName ".git" -ErrorAction Stop -Force
                    attrib +h "$($tempDir.Parent.FullName)\.git" 2>&1 | Out-Null
                    $restored = $true
                } catch {
                    $retries--
                    if ($retries -gt 0) { Start-Sleep -Milliseconds 400 }
                }
            }
        }
    }
}

function Test-IsGitRepository {
    param (
        [string]$Path
    )
    if (Test-Path "$Path\.git") { return $true }
    if (Test-Path "$Path\.git-backup-temp") { return $true }
    $prevPath = Get-Location
    $insideGit = $false
    try {
        Set-Location -Path $Path -ErrorAction SilentlyContinue
        $gitDir = (git rev-parse --git-dir 2>$null)
        if ($gitDir) { $insideGit = $true }
    } catch {}
    finally {
        Set-Location -Path $prevPath -ErrorAction SilentlyContinue
    }
    return $insideGit
}

function Get-GitChangesCount {
    param (
        [string]$Path
    )
    if (-not (Test-IsGitRepository -Path $Path)) { return -1 }
    
    $gitDir = "$Path\.git"
    if (-not (Test-Path $gitDir) -and (Test-Path "$Path\.git-backup-temp")) {
        $gitDir = "$Path\.git-backup-temp"
    }
    
    $changes = git --git-dir="$gitDir" --work-tree="$Path" status --porcelain 2>$null
    $changesCount = 0
    foreach ($line in ($changes -split "`r?`n")) {
        if (-not [string]::IsNullOrWhiteSpace($line)) { $changesCount++ }
    }
    return $changesCount
}

function Show-Header {
    Clear-Host
    $ts = Get-Date -Format "dd MMM yyyy  HH:mm"
    $line = "  " + ([string]([char]0x2550) * 68)
    Write-Host ""
    Write-Host $line -ForegroundColor Cyan
    Write-Host "  " -NoNewline
    Write-Host ">> PROTOTIPE ECOSISTEMA" -NoNewline -ForegroundColor White
    Write-Host "  --  GESTOR DE RESPALDOS GIT" -ForegroundColor DarkCyan
    Write-Host "     " -NoNewline
    Write-Host "$rootDir" -NoNewline -ForegroundColor DarkGray
    Write-Host "  .  $ts" -ForegroundColor DarkGray
    Write-Host $line -ForegroundColor Cyan
    Write-Host ""
}

$Global:EcosystemStatusCache = @()

function Update-EcosystemStatusCache {
    $Global:EcosystemStatusCache = @()
    
    # Maestro (raiz del proyecto)
    $mChanges = Get-GitChangesCount -Path $rootDir
    $mBranch  = (git -C $rootDir rev-parse --abbrev-ref HEAD 2>$null)
    $Global:EcosystemStatusCache += [PSCustomObject]@{
        Icon    = "📦"
        Label   = "Maestro (PROTOTIPE)"
        Branch  = $mBranch
        Changes = $mChanges
    }

    # Dashboard
    if (Test-Path $dashboardDir) {
        $dChanges = Get-GitChangesCount -Path $dashboardDir
        $dBranch  = (git -C $dashboardDir rev-parse --abbrev-ref HEAD 2>$null)
        $Global:EcosystemStatusCache += [PSCustomObject]@{
            Icon    = "🖥"
            Label   = " Dashboard (dev-dashboard)"
            Branch  = $dBranch
            Changes = $dChanges
        }
    }

    # Cores
    if (Test-Path $coresDir) {
        foreach ($core in (Get-ChildItem -Path $coresDir -Directory -ErrorAction SilentlyContinue)) {
            $cChanges = Get-GitChangesCount -Path $core.FullName
            $gitDir   = if (Test-Path "$($core.FullName)\.git") { "$($core.FullName)\.git" } else { "$($core.FullName)\.git-backup-temp" }
            $cBranch  = (git --git-dir="$gitDir" rev-parse --abbrev-ref HEAD 2>$null)
            $Global:EcosystemStatusCache += [PSCustomObject]@{
                Icon    = "🧩"
                Label   = $core.Name
                Branch  = $cBranch
                Changes = $cChanges
            }
        }
    }

    # Instancias de Clientes
    if (Test-Path $instancesDir) {
        $instances = Get-ChildItem -Path $instancesDir -Directory -Recurse -Depth 3 -ErrorAction SilentlyContinue | Where-Object {
            $path = $_.FullName
            $path -notmatch 'node_modules|dist|\\\.git|\\\.firebase' -and 
            ((Test-Path "$path\package.json") -or (Test-Path "$path\.git") -or (Test-Path "$path\.git-backup-temp"))
        }
        foreach ($inst in $instances) {
            $iChanges = Get-GitChangesCount -Path $inst.FullName
            $gitDir   = if (Test-Path "$($inst.FullName)\.git") { "$($inst.FullName)\.git" } else { "$($inst.FullName)\.git-backup-temp" }
            $iBranch  = (git --git-dir="$gitDir" rev-parse --abbrev-ref HEAD 2>$null)
            $Global:EcosystemStatusCache += [PSCustomObject]@{
                Icon    = "👤"
                Label   = $inst.Name
                Branch  = $iBranch
                Changes = $iChanges
            }
        }
    }
}

function Show-StatusPanel {
    $sep = "  " + ("─" * 65)
    Write-Host "  ESTADO DEL ECOSISTEMA" -ForegroundColor Yellow
    Write-Host $sep -ForegroundColor DarkGray

    # Helper interno para imprimir una fila de estado
    function Write-RepoRow {
        param([string]$Icon, [string]$Label, [string]$Branch, [int]$Changes)
        $label = $Label.PadRight(29)
        $branchText = if ($Branch) { "[$Branch]" } else { "[?]" }
        $branchColor = if ($Branch -eq "develop") { "Cyan" } elseif ($Branch -eq "master" -or $Branch -eq "main") { "Green" } else { "DarkYellow" }
        if ($Changes -eq -1) {
            $statusText  = "~ Sin Git";  $statusColor = "DarkGray"
        } elseif ($Changes -eq 0) {
            $statusText  = "✓ Limpio";   $statusColor = "Green"
        } else {
            $statusText  = "● $Changes cambios"; $statusColor = "Yellow"
        }
        Write-Host "  $Icon  " -NoNewline -ForegroundColor White
        Write-Host $label -NoNewline -ForegroundColor White
        Write-Host $branchText.PadRight(14) -NoNewline -ForegroundColor $branchColor
        Write-Host $statusText -ForegroundColor $statusColor
    }

    if ($null -eq $Global:EcosystemStatusCache -or $Global:EcosystemStatusCache.Count -eq 0) {
        Write-Host "  Cargando estados del ecosistema..." -ForegroundColor DarkGray
    } else {
        foreach ($repo in $Global:EcosystemStatusCache) {
            Write-RepoRow -Icon $repo.Icon -Label $repo.Label -Branch $repo.Branch -Changes $repo.Changes
        }
    }

    Write-Host $sep -ForegroundColor DarkGray
    Write-Host ""
}


# Funcion generica para menu interactivo con flechas y Enter
function Get-MenuSelection {
    param (
        [string]$Title,
        [string[]]$Options,
        [switch]$ShowStatus
    )

    $selectedIndex = 0
    $key = 0
    $sep = "  " + ("─" * 65)

    Write-Host "$([char]27)[?25l" -NoNewline

    $cursorSizeRestored = $false
    try {
        $cursorSize = 25
        try {
            $cursorSize = $Host.UI.RawUI.CursorSize
            if ($cursorSize -gt 0) { $Host.UI.RawUI.CursorSize = 1 }
        } catch {}

        while ($true) {
            Show-Header

            if ($ShowStatus) { Show-StatusPanel }

            # Titulo de seccion
            Write-Host "  $Title" -ForegroundColor Yellow
            Write-Host "  " -NoNewline
            Write-Host "↑↓ Navegar  ·  Enter Seleccionar  ·  Q Salir" -ForegroundColor DarkGray
            Write-Host $sep -ForegroundColor DarkGray
            Write-Host ""

            for ($i = 0; $i -lt $Options.Count; $i++) {
                if ($i -eq $selectedIndex) {
                    Write-Host "  > " -NoNewline -ForegroundColor Cyan
                    Write-Host $Options[$i] -ForegroundColor White
                } else {
                    Write-Host "    " -NoNewline
                    Write-Host $Options[$i] -ForegroundColor DarkGray
                }
            }

            Write-Host ""
            Write-Host $sep -ForegroundColor DarkGray

            $keyInfo = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            $key = $keyInfo.VirtualKeyCode

            if ($key -eq 38) {
                $selectedIndex--
                if ($selectedIndex -lt 0) { $selectedIndex = $Options.Count - 1 }
            } elseif ($key -eq 40) {
                $selectedIndex++
                if ($selectedIndex -ge $Options.Count) { $selectedIndex = 0 }
            } elseif ($key -eq 13) {
                return $selectedIndex
            } elseif ($key -eq 82) {
                # Tecla R - Forzar recarga de estado
                Write-Host "`n  Re-escaneando estados de Git..." -ForegroundColor Yellow
                Update-EcosystemStatusCache
            } elseif ($key -eq 81 -or $key -eq 27) {
                return -1
            }
        }
    } finally {
        Write-Host "$([char]27)[?25h" -NoNewline
        if (-not $cursorSizeRestored) {
            try {
                if ($cursorSize -gt 0) { $Host.UI.RawUI.CursorSize = $cursorSize }
            } catch {}
        }
    }
}

function Run-Master-Backup {
    Show-Header
    $sep = "  " + ("─" * 65)
    Write-Host "  ╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "  ║  💾  RESPALDO MAESTRO COMPLETO DE PROTOTIPE                         ║" -ForegroundColor Yellow
    Write-Host "  ╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    powershell -NoProfile -ExecutionPolicy Bypass -File "$rootDir\git_backup.ps1" -Interactive
}

function Run-Subproject-Backup {
    param (
        [string]$Path
    )
    # Llamar al script de subproyectos
    powershell -NoProfile -ExecutionPolicy Bypass -File "$rootDir\subproject_backup.ps1" -SubprojectPath $Path -Interactive
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
    
    # Preparar opciones del menu (Punto 10)
    $options = @()
    for ($i = 0; $i -lt $cores.Count; $i++) {
        $changesCount = Get-GitChangesCount -Path $cores[$i].FullName
        $gitStatus = ""
        if ($changesCount -eq -1) {
            $gitStatus = " (Sin Git)"
        } elseif ($changesCount -eq 0) {
            $gitStatus = " (Git Activo | Sin cambios)"
        } else {
            $gitStatus = " (Git Activo | $changesCount cambios)"
        }
        $options += "$($cores[$i].Name)$gitStatus"
    }
    $options += "[ Volver al menu principal ]"
    
    $selectionIndex = Get-MenuSelection -Title "GESTION DE PLANTILLAS CORE" -Options $options
    
    # Validar si se selecciono volver o salir
    if ($selectionIndex -eq -1 -or $selectionIndex -eq ($options.Count - 1)) { return }
    
    $selectedPath = $cores[$selectionIndex].FullName
    if (-not (Test-IsGitRepository -Path $selectedPath)) {
        Show-Header
        Write-Host " [WARNING] El subproyecto $($cores[$selectionIndex].Name) no tiene un repositorio Git activo." -ForegroundColor Yellow
        Write-Host " Desea inicializarlo ahora? (S/N): " -NoNewline -ForegroundColor Cyan
        $initGit = Read-Host
        if ($initGit -like "s" -or $initGit -like "S") {
            Set-Location -Path $selectedPath
            git init | Out-Null
            Write-Host " Repositorio Git inicializado con exito." -ForegroundColor Green
            
            Write-Host " ¿Desea asociar un repositorio remoto de GitHub (origin) ahora? (S/N): " -NoNewline -ForegroundColor Cyan
            $asociarRemote = Read-Host
            if ($asociarRemote -like "s" -or $asociarRemote -like "S") {
                Write-Host " Ingrese la URL del repositorio remoto (ej. git@github.com:usuario/repo.git o https://...): " -NoNewline -ForegroundColor Cyan
                $remoteUrl = Read-Host
                if (-not [string]::IsNullOrWhiteSpace($remoteUrl)) {
                    git remote add origin $remoteUrl.Trim()
                    Write-Host " Remoto 'origin' configurado con: $remoteUrl" -ForegroundColor Green
                } else {
                    Write-Host " [INFO] No se ingreso ninguna URL. El repositorio solo tendra respaldo local temporalmente." -ForegroundColor Yellow
                }
            } else {
                Write-Host " [INFO] Repositorio configurado solo de forma local." -ForegroundColor Yellow
            }
            Start-Sleep -Seconds 1.5
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
    
    $instances = Get-ChildItem -Path $instancesDir -Directory -Recurse -Depth 3 -ErrorAction SilentlyContinue | Where-Object {
        $path = $_.FullName
        $path -notmatch 'node_modules|dist|\\\.git|\\\.firebase' -and 
        ((Test-Path "$path\package.json") -or (Test-Path "$path\.git") -or (Test-Path "$path\.git-backup-temp"))
    }
    
    if ($null -eq $instances -or $instances.Count -eq 0) {
        Show-Header
        Write-Host " [INFO] No hay instancias de clientes registradas fisicamente en el disco." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    # Preparar opciones del menu (Punto 10)
    $options = @()
    for ($i = 0; $i -lt $instances.Count; $i++) {
        $changesCount = Get-GitChangesCount -Path $instances[$i].FullName
        $gitStatus = ""
        if ($changesCount -eq -1) {
            $gitStatus = " (Sin Git)"
        } elseif ($changesCount -eq 0) {
            $gitStatus = " (Git Activo | Sin cambios)"
        } else {
            $gitStatus = " (Git Activo | $changesCount cambios)"
        }
        $options += "$($instances[$i].Name)$gitStatus"
    }
    $options += "[ Volver al menu principal ]"
    
    $selectionIndex = Get-MenuSelection -Title "GESTION DE INSTANCIAS DE CLIENTES" -Options $options
    
    # Validar si se selecciono volver o salir
    if ($selectionIndex -eq -1 -or $selectionIndex -eq ($options.Count - 1)) { return }
    
    $selectedPath = $instances[$selectionIndex].FullName
    if (-not (Test-IsGitRepository -Path $selectedPath)) {
        Show-Header
        Write-Host " [WARNING] La instancia $($instances[$selectionIndex].Name) no tiene un repositorio Git activo." -ForegroundColor Yellow
        Write-Host " Desea inicializarla ahora? (S/N): " -NoNewline -ForegroundColor Cyan
        $initGit = Read-Host
        if ($initGit -like "s" -or $initGit -like "S") {
            Set-Location -Path $selectedPath
            git init | Out-Null
            Write-Host " Repositorio Git inicializado con exito." -ForegroundColor Green
            
            Write-Host " [INFO] Esta instancia se vinculara de forma automatica al repositorio remoto del Core correspondiente." -ForegroundColor Cyan
            Start-Sleep -Seconds 1.5
        } else {
            return
        }
    }
    Run-Subproject-Backup -Path $selectedPath
}

# Opciones del Menu Principal
$mainOptions = @(
    "💾  Respaldo Maestro de todo PROTOTIPE (Snapshot Fisico)",
    "🖥  Guardar / Subir Consola Central (dev-dashboard)",
    "🧩  Guardar / Subir una Plantilla Core (Molde)",
    "👤  Guardar / Subir una Instancia de Cliente (Produccion/Dev)",
    "✖   Salir"
)

# Carga inicial de la caché
Write-Host "  Inicializando y escaneando repositorios..." -ForegroundColor Yellow
Update-EcosystemStatusCache

# Bucle principal del menu
$keepRunning = $true
do {
    $choice = Get-MenuSelection -Title "SELECCIONE LA ACCION QUE DESEA REALIZAR:" -Options $mainOptions -ShowStatus
    
    switch ($choice) {
        0 { Run-Master-Backup; Update-EcosystemStatusCache; Write-Host " Presione cualquier tecla para volver al menu..."; Read-Host | Out-Null }
        1 { Run-Subproject-Backup -Path $dashboardDir; Update-EcosystemStatusCache; Write-Host " Presione cualquier tecla para volver al menu..."; Read-Host | Out-Null }
        2 { Manage-Cores; Update-EcosystemStatusCache }
        3 { Manage-Instances; Update-EcosystemStatusCache }
        4 { $keepRunning = $false }
        -1 { $keepRunning = $false }
    }
} while ($keepRunning)

Write-Host ""
Write-Host " Hasta luego! Entorno de desarrollo seguro." -ForegroundColor Green
Start-Sleep -Seconds 1
