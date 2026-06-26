# ==============================================================================
#                 PROTOTIPE ECOSISTEMA - SUBPROJECT BACKUP ENGINE
# ==============================================================================
# Este script automatiza el guardado y push de subproyectos individuales.
# Respeta de forma dinamica la rama actual (Git Strategies).

param (
    [string]$SubprojectPath = "",
    [string]$CommitMessage = "",
    [switch]$Push = $true,
    [switch]$AutoMerge = $false,
    [switch]$Interactive = $false
)

# Forzar consola a UTF-8 para evitar caracteres extranos en Windows
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = if ($env:PROTOTIPE_WORKSPACE_ROOT) { $env:PROTOTIPE_WORKSPACE_ROOT } else { "D:\PROTOTIPE" }
if (-not (Test-Path $rootDir)) {
    # Suponer que el directorio raiz es el padre del script
    $rootDir = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
}

function Write-BackupLog {
    param (
        [string]$Status,
        [string]$Target,
        [string]$Message
    )
    $logFile = "$rootDir\backup.log"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logLine = "[$timestamp] [$Status] [$Target] $Message"
    try {
        Add-Content -Path $logFile -Value $logLine -Encoding UTF8
    } catch {}
}

function Format-CommitMessageList {
    param (
        [string[]]$files
    )
    if ($files.Count -eq 0) { return "" }
    if ($files.Count -le 5) {
        return $files -join ", "
    } else {
        $firstThree = $files[0..2]
        $remaining = $files.Count - 3
        return "$($firstThree -join ', ') (y $remaining mas)"
    }
}

if ([string]::IsNullOrWhiteSpace($SubprojectPath) -or -not (Test-Path $SubprojectPath)) {
    Write-Host " [ERROR] Ruta de subproyecto invalida o no especificada." -ForegroundColor Red
    exit 1
}

Set-Location -Path $SubprojectPath

# Limpiar pantalla para una visualizacion impecable
Clear-Host

# Obtener nombre del subproyecto
$projectName = Split-Path -Path $SubprojectPath -Leaf

# Si existe .git-backup-temp, lo renombramos temporalmente a .git para poder operar
$tempRenamed = $false
$gitTempPath = Join-Path $SubprojectPath ".git-backup-temp"
$gitNormalPath = Join-Path $SubprojectPath ".git"

if (Test-Path $gitTempPath) {
    Write-Host "  [INFO] Detectado .git-backup-temp. Habilitando temporalmente para el respaldo..." -ForegroundColor Yellow
    
    # Detener procesos de Vite/Node que puedan bloquear el archivo
    $nodeProcesses = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue
    $stoppedAny = $false
    foreach ($proc in $nodeProcesses) {
        if ($proc.CommandLine -match 'vite' -or ($proc.CommandLine -match 'npm' -and $proc.CommandLine -match 'dev')) {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
            $stoppedAny = $true
        }
    }
    if ($stoppedAny) { Start-Sleep -Milliseconds 1000 }

    # Intentar renombrar con reintentos
    $retries = 6
    $renameSuccess = $false
    while (-not $renameSuccess -and $retries -gt 0) {
        try {
            attrib -h -r -s $gitTempPath 2>&1 | Out-Null
            Rename-Item -Path $gitTempPath -NewName ".git" -ErrorAction Stop -Force
            attrib +h $gitNormalPath 2>&1 | Out-Null
            $renameSuccess = $true
            $tempRenamed = $true
            Write-Host "    -> Habilitando: $projectName/.git" -ForegroundColor DarkGray
        } catch {
            $retries--
            if ($retries -gt 0) { Start-Sleep -Milliseconds 400 }
        }
    }
    if (-not $renameSuccess) {
        Write-Host "  [ERROR] No se pudo habilitar el repositorio Git ($gitTempPath). Carpeta bloqueada." -ForegroundColor Red
        exit 1
    }
}

# Auto-vinculacion y resolucion de ramas para Instancias de Clientes
$isInstance = $false
if ($SubprojectPath -match 'Instancias Clientes') {
    $isInstance = $true
    $parentPath = Split-Path -Path $SubprojectPath -Parent
    $niche = Split-Path -Path $parentPath -Leaf # ej: "ventas"
    
    Write-Host "  [Instancia Detectada] Sincronizando con repositorio remoto del Core..." -ForegroundColor Cyan
    
    # Encontrar la carpeta de plantilla core que coincida con el nicho
    $coreFolder = Get-ChildItem -Path "$rootDir\Plantillas Core" -Directory | Where-Object { $_.Name -match $niche } | Select-Object -First 1
    if ($null -ne $coreFolder) {
        # Obtener el remoto origin de la plantilla core
        $coreGitDir = Join-Path $coreFolder.FullName ".git"
        if (-not (Test-Path $coreGitDir) -and (Test-Path (Join-Path $coreFolder.FullName ".git-backup-temp"))) {
            $coreGitDir = Join-Path $coreFolder.FullName ".git-backup-temp"
        }
        
        $coreRemote = git --git-dir="$coreGitDir" remote get-url origin 2>$null
        if (-not [string]::IsNullOrWhiteSpace($coreRemote)) {
            Write-Host "    -> Configurando repositorio remoto del Core: $coreRemote" -ForegroundColor Gray
            # Reconfigurar el origin de la instancia
            git remote remove origin 2>$null | Out-Null
            git remote add origin $coreRemote.Trim()
        } else {
            Write-Host "    [!] ADVERTENCIA: No se pudo obtener el remoto origin de la plantilla core $($coreFolder.Name)." -ForegroundColor Yellow
        }
    } else {
        Write-Host "    [!] ADVERTENCIA: No se encontro ninguna plantilla core para el nicho '$niche'." -ForegroundColor Yellow
    }
    
    # Asegurar que la rama local coincida con el formato cliente/$projectName (estándar de instancias)
    $expectedBranch = "cliente/$projectName"
    $currentBranchLocal = (git rev-parse --abbrev-ref HEAD 2>$null)
    if ($currentBranchLocal -and $currentBranchLocal -ne $expectedBranch) {
        Write-Host "    -> Configurando rama local como '$expectedBranch' (convención cliente/* del core)..." -ForegroundColor Yellow
        git branch -M $expectedBranch 2>&1 | Out-Null
    }
}

# Auto-detectar la rama actual
$branchName = (git rev-parse --abbrev-ref HEAD 2>$null)
if (-not $branchName) {
    Write-Host " [ERROR] El directorio especificado no es un repositorio Git valido." -ForegroundColor Red
    if ($tempRenamed) {
        Rename-Item -Path $gitNormalPath -NewName ".git-backup-temp" -Force
    }
    exit 1
}

try {
    # Cabecera Visual
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "         [RESPALDO DE SUBPROYECTO: $projectName]" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  Branch Activa: $branchName" -ForegroundColor Yellow
    Write-Host "  Ruta: $SubprojectPath" -ForegroundColor Gray
    Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
    
    # Mostrar cambios pendientes
    Write-Host "  Escaneando cambios pendientes..." -ForegroundColor Cyan
    $statusShort = git status --short
    if ([string]::IsNullOrWhiteSpace($statusShort)) {
        Write-Host "    -> Ninguno. Tu repositorio local esta 100% al dia." -ForegroundColor Green
        Write-Host ""
        Write-Host "======================================================================" -ForegroundColor Green
        exit 0
    }
    
    # Validar fugas de seguridad de variables de entorno (.env) antes de continuar
    # Solo alertamos si un .env está siendo AGREGADO o MODIFICADO (M, A, ??)
    # Si está siendo ELIMINADO del índice (D), es el resultado de un git rm --cached correcto — es SEGURO.
    $leakDetected = $false
    foreach ($line in ($statusShort -split "`r?`n")) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $statusCode = $line.Substring(0, 2).Trim()
        $filePath   = $line.Substring(3).Trim() -replace '"', ''
        # D  = staged delete (desindexado correctamente), ignorar en el check de seguridad
        if ($statusCode -eq 'D') { continue }
        if ($filePath -match '\.env' -and $filePath -notmatch '\.env\.example') {
            Write-Host "    -> [ALERTA SECURITY] Archivo sensible detectado: $filePath" -ForegroundColor Red
            $leakDetected = $true
        }
    }
    if ($leakDetected) {
        Write-Host ""
        Write-Host "  [CRITICAL SECURITY] Proceso abortado para prevenir fugas de credenciales en GitHub." -ForegroundColor Red
        Write-Host "  Por favor, agrega estos archivos a tu .gitignore antes de continuar." -ForegroundColor Yellow
        Write-Host "======================================================================" -ForegroundColor Red
        exit 1
    }
    
    Write-Host $statusShort -ForegroundColor Gray
    Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
    
    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        # Generar mensaje automatico basado en los cambios reales
        $rawStatus = git status --porcelain
        $added = @()
        $modified = @()
        $deleted = @()
        
        foreach ($line in ($rawStatus -split "`r?`n")) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            $statusType = $line.Substring(0, 2).Trim()
            $filePath = $line.Substring(3).Trim() -replace '"', ''
            
            # Ignorar archivos en directorios de compilacion/cache para el mensaje de commit
            if ($filePath -match 'node_modules|dist/|\.firebase/|\.git/') { continue }
            $fileName = Split-Path -Path $filePath -Leaf
            
            if ($statusType -eq "M") { $modified += $fileName }
            elseif ($statusType -eq "??" -or $statusType -eq "A") { $added += $fileName }
            elseif ($statusType -eq "D") { $deleted += $fileName }
        }
        
        $summaryParts = @()
        if ($modified.Count -gt 0) { $summaryParts += "Mod: $(Format-CommitMessageList -files $modified)" }
        if ($added.Count -gt 0)    { $summaryParts += "Add: $(Format-CommitMessageList -files $added)" }
        if ($deleted.Count -gt 0)  { $summaryParts += "Del: $(Format-CommitMessageList -files $deleted)" }
        
        if ($summaryParts.Count -gt 0) {
            $contextText = $summaryParts -join " | "
            if ($contextText.Length -gt 120) { $contextText = $contextText.Substring(0, 117) + "..." }
            $CommitMessage = "Auto-Snapshot [$branchName]: $contextText"
        } else {
            $currentDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $CommitMessage = "Snapshot [$branchName] - $currentDate"
        }
    }
    
    Write-Host ""
    Write-Host "  [1/3] Indexando cambios locales..." -ForegroundColor Cyan
    $addErr = git add . 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Fallo al indexar archivos (git add .)." -ForegroundColor Red
        if ($addErr) { Write-Host "    -> Detalle: $addErr" -ForegroundColor DarkGray }
        Write-BackupLog -Status "FAILED" -Target $projectName -Message "Fallo git add en subproyecto: $addErr"
        exit 1
    }
    
    Write-Host "  [2/3] Creando commit local..." -ForegroundColor Cyan
    git commit -m $CommitMessage 2>&1 | Out-Null
    Write-Host "    -> Commit exitoso: '$CommitMessage'" -ForegroundColor Gray
    
    # ── Estrategia de Push ────────────────────────────────────────────────
    if (-not $Push) {
        Write-Host "  [3/3] Modo Solo-Local: commit guardado localmente. Push omitido por configuracion." -ForegroundColor Yellow
        Write-Host "======================================================================" -ForegroundColor Green
        Write-BackupLog -Status "SUCCESS" -Target $projectName -Message "Snapshot de subproyecto exitoso: $CommitMessage (Push omitido)"
        exit 0
    }
    
    # Verificar conexion con el servidor remoto
    Write-Host "  [3/3] Verificando conexion con el repositorio remoto..." -ForegroundColor Cyan
    $isOnline = $false
    $remoteErr = git ls-remote origin HEAD 2>&1
    if ($LASTEXITCODE -eq 0) { $isOnline = $true }
    
    if (-not $isOnline) {
        Write-Host ""
        Write-Host "  [WARN] No se pudo acceder al repositorio remoto 'origin' configurado." -ForegroundColor Yellow
        if ($remoteErr) {
            Write-Host "    -> Detalle de Git: $($remoteErr -join ' ')" -ForegroundColor DarkGray
        }
        
        if ($Interactive) {
            Write-Host "  Desea realizar un respaldo local (Commit local en tu disco) unicamente? (S/N): " -NoNewline -ForegroundColor Cyan
            $confirmLocal = Read-Host
            if ($confirmLocal -like "s" -or $confirmLocal -like "S") {
                Write-Host "  [OK] Respaldo local guardado con exito. Los cambios se subiran a GitHub la proxima vez que tenga conexion." -ForegroundColor Green
                Write-Host "======================================================================" -ForegroundColor Green
                Write-BackupLog -Status "SUCCESS" -Target $projectName -Message "Snapshot de subproyecto guardado localmente: $CommitMessage (Sin red)"
                exit 0
            } else {
                Write-Host "  Deshaciendo commit local para mantener el estado original..." -ForegroundColor Yellow
                git reset --soft HEAD~1 2>&1 | Out-Null
                Write-Host "  [CANCELADO] Proceso abortado por el usuario." -ForegroundColor Red
                Write-Host "======================================================================" -ForegroundColor Red
                Write-BackupLog -Status "FAILED" -Target $projectName -Message "Respaldo cancelado por falta de red."
                exit 1
            }
        } else {
            Write-Host "  [INFO] Ejecuta 'git push' cuando tengas conexion disponible." -ForegroundColor Gray
            Write-Host "======================================================================" -ForegroundColor Yellow
            Write-BackupLog -Status "SUCCESS" -Target $projectName -Message "Snapshot de subproyecto guardado localmente: $CommitMessage (Sin red)"
            exit 0
        }
    }
    
    # Realizar un pull preventivo para evitar rechazos por cambios remotos no sincronizados
    Write-Host "  [3/3] Sincronizando repositorio local con GitHub..." -ForegroundColor Cyan
    
    # Verificar si la rama existe en el control remoto origin antes de hacer pull
    $branchExistsOnRemote = $false
    $remoteCheck = git ls-remote origin $branchName 2>$null
    if ($remoteCheck) {
        $branchExistsOnRemote = $true
    }

    if ($branchExistsOnRemote) {
        Write-Host "    -> Trayendo posibles actualizaciones previas del servidor..." -ForegroundColor DarkGray
        $pullResult = git pull origin $branchName --no-edit 2>&1
        
        if ($LASTEXITCODE -ne 0 -or $pullResult -match "CONFLICT" -or (git status --porcelain | Where-Object { $_ -match '^UU' })) {
            Write-Host ""
            Write-Host "  [CONFLICTO DETECTADO] Hay cambios en GitHub que colisionan con tu codigo local." -ForegroundColor Red
            Write-Host "  Deshaciendo el commit local para proteger tu entorno..." -ForegroundColor Yellow
            git reset --soft HEAD~1 2>&1 | Out-Null
            Write-Host "  [INFO] Proceso cancelado. Por favor, resuelve los conflictos manualmente." -ForegroundColor Yellow
            Write-Host "======================================================================" -ForegroundColor Red
            Write-BackupLog -Status "FAILED" -Target $projectName -Message "Conflicto al sincronizar con GitHub en subproyecto en rama $branchName"
            exit 1
        }
    } else {
        Write-Host "    -> La rama no existe en el servidor remoto. Omitiendo pull preventivo." -ForegroundColor Gray
    }
    
    Write-Host "    -> Subiendo tus cambios locales a GitHub (git push origin $branchName --no-verify)..." -ForegroundColor DarkGray
    Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
    git push origin $branchName --no-verify
    $pushExitCode = $LASTEXITCODE
    Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
    
    if ($pushExitCode -ne 0) {
        Write-Host "  [ERROR] Fallo al subir los cambios a GitHub (git push origin $branchName)." -ForegroundColor Red
        Write-Host "  Por favor, verifica tus permisos, credenciales SSH o estado de la red o ejecuta 'git push' manualmente." -ForegroundColor Yellow
        Write-BackupLog -Status "FAILED" -Target $projectName -Message "Fallo git push a origin $branchName (Exit Code: $pushExitCode)"
        exit 1
    }
    
    Write-BackupLog -Status "SUCCESS" -Target $projectName -Message "Snapshot y push exitosos en subproyecto. Rama: $branchName, Commit: $CommitMessage"

    # ── Git Strategies: Auto-Merge a main (solo para ramas de trabajo del core, NO para instancias cliente/*)
    if ($branchName -ne "main" -and $branchName -ne "master" -and -not $branchName.StartsWith("cliente/")) {
        if ($Interactive) {
            Write-Host ""
            Write-Host "  [Git Strategies] Has subido cambios a la rama de desarrollo: [$branchName]" -ForegroundColor Yellow
            Write-Host "  Desea fusionar y subir estos cambios tambien a la rama de produccion 'main'? (S/N): " -NoNewline -ForegroundColor Cyan
            $confirmMerge = Read-Host
            if ($confirmMerge -like "s" -or $confirmMerge -like "S") {
                $AutoMerge = $true
            }
        }

        if ($AutoMerge) {
            # Detectar si la rama principal se llama main o master en el repo local
            $mainBranch = "main"
            $hasMaster = (git branch --list "master" 2>$null)
            if ($hasMaster) { $mainBranch = "master" }
            
            Write-Host ""
            Write-Host "  [Git Strategies] Auto-Merge activado. Fusionando [$branchName] -> [$mainBranch]..." -ForegroundColor Yellow
            
            Write-Host "  [Merge] Cambiando a la rama de produccion [$mainBranch]..." -ForegroundColor Cyan
            git checkout $mainBranch 2>&1 | Out-Null
            
            Write-Host "  [Merge] Trayendo ultimos cambios del servidor remoto..." -ForegroundColor Cyan
            git pull origin $mainBranch --no-edit 2>&1 | Out-Null
            
            Write-Host "  [Merge] Fusionando rama [$branchName] en [$mainBranch]..." -ForegroundColor Cyan
            $mergeResult = git merge $branchName -m "merge: consolidar $branchName en $mainBranch" 2>&1
            
            if ($LASTEXITCODE -ne 0 -or $mergeResult -match "CONFLICT" -or (git status --porcelain | Where-Object { $_ -match '^UU' })) {
                Write-Host ""
                Write-Host "  [CONFLICTO] La fusion automatica encontro conflictos de codigo." -ForegroundColor Red
                Write-Host "  Abortando fusion para proteger la rama de produccion [$mainBranch]..." -ForegroundColor Yellow
                git merge --abort 2>&1 | Out-Null
                git checkout $branchName 2>&1 | Out-Null
                Write-Host "  [INFO] Resuelve los conflictos manualmente y vuelve a intentarlo." -ForegroundColor Yellow
                Write-Host "======================================================================" -ForegroundColor Red
                Write-BackupLog -Status "FAILED" -Target $projectName -Message "Conflicto de auto-merge hacia $mainBranch"
                exit 1
            }
            
            Write-Host "  [Merge] Subiendo consolidacion a GitHub (git push origin $mainBranch --no-verify)..." -ForegroundColor Cyan
            Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
            git push origin $mainBranch --no-verify
            $mergePushExitCode = $LASTEXITCODE
            Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
            
            if ($mergePushExitCode -ne 0) {
                Write-Host "  [ERROR] Fallo al subir la consolidacion a GitHub (git push origin $mainBranch)." -ForegroundColor Red
                Write-BackupLog -Status "WARN" -Target $projectName -Message "Snapshot de desarrollo OK, pero fallo el push de fusion a $mainBranch (Exit Code: $mergePushExitCode)"
            } else {
                Write-BackupLog -Status "SUCCESS" -Target $projectName -Message "Sincronizado y fusionado en $mainBranch con exito."
            }
            
            git checkout $branchName 2>&1 | Out-Null
            Write-Host "  [OK] Proceso completado. Cambios sincronizados en [$branchName] y [$mainBranch]." -ForegroundColor Green
        } else {
            Write-Host "  [INFO] Cambios resguardados en la rama de desarrollo [$branchName]. Auto-Merge omitido." -ForegroundColor Gray
        }
    } else {
        Write-Host "  [OK] Proceso completado. Cambios guardados en la rama principal [$branchName]." -ForegroundColor Green
    }
    Write-Host "======================================================================" -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "  [ERROR] Ocurrio un fallo en el proceso de respaldo de subproyecto:" -ForegroundColor Red
    Write-Host "    -> $_" -ForegroundColor Red
    Write-Host ""
    Write-BackupLog -Status "FAILED" -Target $projectName -Message "Excepcion en subproyecto: $_"
    exit 1
}
finally {
    # Asegurar que los componentes base (Core, Dashboard, etc.) queden en develop. Instancias de clientes regresan a su rama de cliente.
    if (-not $isInstance -and -not $branchName.StartsWith("cliente/")) {
        $currentBranchSub = (git rev-parse --abbrev-ref HEAD 2>$null)
        if ($currentBranchSub -and $currentBranchSub -ne "develop") {
            Write-Host "  [Restauración] Cambiando el subproyecto a la rama de desarrollo 'develop'..." -ForegroundColor Yellow
            $hasDevelopSub = (git branch --list "develop" 2>$null)
            if (-not $hasDevelopSub) {
                git branch develop 2>&1 | Out-Null
            }
            git checkout develop 2>&1 | Out-Null
        }
    } else {
        if ($branchName) {
            $currentBranch = (git rev-parse --abbrev-ref HEAD 2>$null)
            if ($currentBranch -and $currentBranch -ne $branchName) {
                Write-Host "  [Restauración] Regresando a la rama original del cliente: [$branchName]..." -ForegroundColor Yellow
                git checkout $branchName 2>&1 | Out-Null
            }
        }
    }
    # Si renombramos de .git-backup-temp a .git al inicio, lo restauramos a .git-backup-temp
    if ($tempRenamed -and (Test-Path $gitNormalPath)) {
        Write-Host "  [Restauración] Restaurando repositorio a su estado inactivo (.git-backup-temp)..." -ForegroundColor Yellow
        $retries = 6
        $restored = $false
        while (-not $restored -and $retries -gt 0) {
            try {
                attrib -h -r -s $gitNormalPath 2>&1 | Out-Null
                Rename-Item -Path $gitNormalPath -NewName ".git-backup-temp" -ErrorAction Stop -Force
                attrib +h $gitTempPath 2>&1 | Out-Null
                $restored = $true
                Write-Host "    -> Resguardo inactivo configurado para $projectName." -ForegroundColor DarkGray
            } catch {
                $retries--
                if ($retries -gt 0) { Start-Sleep -Milliseconds 400 }
            }
        }
        if (-not $restored) {
            Write-Host "  [WARNING] No se pudo renombrar .git a .git-backup-temp. Por favor, hágalo manualmente." -ForegroundColor Red
        }
    }
}
