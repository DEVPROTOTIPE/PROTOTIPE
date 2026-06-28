# ==============================================================================
#                 PROTOTIPE ECOSISTEMA - BACKUP ENGINE (PREMIUM)
# ==============================================================================
# Este script realiza un snapshot fisico y sincronizacion con GitHub.
# Disenado con una interfaz visual limpia y codificacion compatible.

param (
    [string]$CommitMessage = "",
    [switch]$Push = $true,
    [switch]$AutoMerge = $false,
    [switch]$Interactive = $false
)

$ScriptExitCode = 0

# Forzar consola a UTF-8 para evitar caracteres extranos en Windows
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$rootDir = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
if (-not $rootDir -or -not (Test-Path $rootDir)) {
    $rootDir = "D:\PROTOTIPE"
}
Set-Location -Path $rootDir

# Rutinas auxiliares de logging e historial de cambios
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

function Exit-WithPause {
    param (
        [int]$code = 0
    )
    if ($Interactive) {
        Write-Host ""
        Write-Host "Presione cualquier tecla para salir..." -ForegroundColor Yellow
        $null = [Console]::ReadKey()
    }
    exit $code
}

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
if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
    # Analizar cambios para generar un mensaje con contexto real
    $rawStatus = git status --porcelain
    $added = @()
    $modified = @()
    $deleted = @()
    
    foreach ($line in ($rawStatus -split "`r?`n")) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $statusType = $line.Substring(0, 2).Trim()
        $filePath = $line.Substring(3).Trim()
        $filePath = $filePath -replace '"', ''
        
        # Ignorar archivos en directorios de compilacion/cache para el mensaje de commit
        if ($filePath -match 'node_modules|dist/|\.firebase/|\.git/') { continue }
        $fileName = Split-Path -Path $filePath -Leaf
        
        if ($statusType -eq "M") { $modified += $fileName }
        elseif ($statusType -eq "??" -or $statusType -eq "A") { $added += $fileName }
        elseif ($statusType -eq "D") { $deleted += $fileName }
    }
    
    $summaryParts = @()
    if ($modified.Count -gt 0) { $summaryParts += "Mod: $(Format-CommitMessageList -files $modified)" }
    if ($added.Count -gt 0) { $summaryParts += "Add: $(Format-CommitMessageList -files $added)" }
    if ($deleted.Count -gt 0) { $summaryParts += "Del: $(Format-CommitMessageList -files $deleted)" }
    
    if ($summaryParts.Count -gt 0) {
        $contextText = $summaryParts -join " | "
        if ($contextText.Length -gt 120) {
            $contextText = $contextText.Substring(0, 117) + "..."
        }
        $branchName = (git rev-parse --abbrev-ref HEAD 2>$null)
        $CommitMessage = "Auto-Snapshot [$branchName]: $contextText"
    } else {
        $currentDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $CommitMessage = "Snapshot general PROTOTIPE - $currentDate"
    }
}

Write-Host " [Commit Info] $CommitMessage" -ForegroundColor Gray
Write-Host " [Ruta de Trabajo] $rootDir" -ForegroundColor Gray
Write-Host ""
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray

# Omitimos detener los servidores locales de desarrollo Vite (dev-dashboard, App Ventas, etc.).
# El renombrado de las carpetas .git es tolerante a bloqueos y se realiza mediante un bucle con reintentos.
$viteWasStopped = $false
$stoppedVitePaths = @()


# Auto-saneamiento: restaurar .git-backup-temp residuales de backups anteriores fallidos
# Ahora que Vite esta detenido, el rename tiene exito garantizado
$residualTemps = Get-ChildItem -Path $rootDir -Directory -Hidden -Filter ".git-backup-temp" -Recurse -Depth 5 -ErrorAction SilentlyContinue
if ($residualTemps) {
    Write-Host " [INFO] Restaurando directorios .git residuales de backups anteriores..." -ForegroundColor Yellow
    foreach ($temp in $residualTemps) {
        try {
            attrib -h -r -s $temp.FullName 2>&1 | Out-Null
            Rename-Item -Path $temp.FullName -NewName ".git" -ErrorAction Stop -Force
            attrib +h "$($temp.Parent.FullName)\.git" 2>&1 | Out-Null
            Write-Host "    -> Restaurado: $($temp.Parent.Name)/.git" -ForegroundColor DarkGray
        } catch {
            Write-Host "    [!] No se pudo restaurar: $($temp.FullName)" -ForegroundColor Red
        }
    }
}

# Buscar repositorios Git de desarrollo
Write-Host " [1/6] Escaneando directorios en busqueda de Git locales..." -ForegroundColor Cyan
$gitDirs = Get-ChildItem -Path $rootDir -Directory -Hidden -Filter ".git" -Recurse -Depth 5 -ErrorAction SilentlyContinue | Where-Object {
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
            attrib -h -r -s $dir.FullName 2>&1 | Out-Null
            Rename-Item -Path $dir.FullName -NewName ".git-backup-temp" -Force
            attrib +h $tempPath 2>&1 | Out-Null
            
            $renamedDirs += [PSCustomObject]@{
                OriginalPath = $dir.FullName
                TempPath     = $tempPath
                ParentName   = $parentName
            }
        }
    } else {
        Write-Host " [2/6] No se detectaron repositorios Git internos adicionales." -ForegroundColor Gray
    }

    # 2. Validar cambios y fugas de seguridad ANTES de indexar (Punto 1 y 4)
    $statusBeforeAdd = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($statusBeforeAdd)) {
        Write-Host ""
        Write-Host " [OK] Tu repositorio ya esta al dia con la informacion local. Cero cambios." -ForegroundColor Green
        Write-Host ""
        Write-BackupLog -Status "SUCCESS" -Target "Maestro" -Message "Sin cambios locales pendientes."
    } else {
        # Validar fugas de seguridad de variables de entorno (.env) antes de continuar (Punto 1 y 4)
        $leakDetected = $false
        foreach ($line in ($statusBeforeAdd -split "`r?`n")) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            $statusCode = $line.Substring(0, 2).Trim()
            $filePath = $line.Substring(3).Trim() -replace '"', ''
            if ($statusCode -eq 'D') { continue } # D = staged delete es seguro
            if ($filePath -match '\.env' -and $filePath -notmatch '\.env\.example') {
                Write-Host "    -> [ALERTA SECURITY] Archivo sensible detectado: $filePath" -ForegroundColor Red
                $leakDetected = $true
            }
        }
        if ($leakDetected) {
            Write-Host ""
            Write-Host " [CRITICAL SECURITY] Proceso abortado para prevenir fugas de credenciales en GitHub." -ForegroundColor Red
            Write-Host " Por favor, agrega estos archivos a tu .gitignore antes de continuar." -ForegroundColor Yellow
            Write-Host "======================================================================" -ForegroundColor Red
            Write-BackupLog -Status "FAILED" -Target "Maestro" -Message "Aborted: Fuga de credenciales detectada (.env)"
            $ScriptExitCode = 1; return
        }

        # Indexar cambios físicos en el snapshot y verificar éxito (Punto 5)
        Write-Host " [3/6] Indexando archivos fisicos en el snapshot..." -ForegroundColor Cyan
        $addErr = git add . 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host " [ERROR] Fallo al indexar archivos (git add .)." -ForegroundColor Red
            if ($addErr) { Write-Host "    -> Detalle: $addErr" -ForegroundColor DarkGray }
            Write-BackupLog -Status "FAILED" -Target "Maestro" -Message "Fallo git add: $addErr"
            $ScriptExitCode = 1; return
        }

        # 4. Confirmar cambios localmente
        Write-Host " [4/6] Guardando snapshot en el historial local..." -ForegroundColor Cyan
        git commit -m $CommitMessage | Out-Null
        Write-Host "    -> Snapshot local creado con exito." -ForegroundColor Gray
        
        # ── Estrategia de Push ────────────────────────────────────────────────
        if (-not $Push) {
            Write-Host " [5/6] Modo Solo-Local: commit guardado localmente. Push omitido por configuracion." -ForegroundColor Yellow
            Write-Host "======================================================================" -ForegroundColor Cyan
            Write-BackupLog -Status "SUCCESS" -Target "Maestro" -Message "Snapshot local exitoso: $CommitMessage (Push omitido)"
            $ScriptExitCode = 0; return
        }

        # 5. Sincronizar con GitHub
        $branchName = (git rev-parse --abbrev-ref HEAD 2>$null)
        
        Write-Host " [5/6] Verificando conexion con el repositorio remoto..." -ForegroundColor Cyan
        $isOnline = $false
        $remoteErr = git ls-remote origin HEAD 2>&1
        if ($LASTEXITCODE -eq 0) { $isOnline = $true }

        if (-not $isOnline) {
            Write-Host ""
            Write-Host " [WARN] No se pudo acceder al repositorio remoto 'origin' configurado." -ForegroundColor Yellow
            if ($remoteErr) {
                Write-Host "    -> Detalle de Git: $($remoteErr -join ' ')" -ForegroundColor DarkGray
            }
            
            if ($Interactive) {
                Write-Host " Desea realizar un respaldo local (Commit local en tu disco) unicamente? (S/N): " -NoNewline -ForegroundColor Cyan
                $confirmLocal = Read-Host
                if ($confirmLocal -like "s" -or $confirmLocal -like "S") {
                    Write-Host " [OK] Respaldo local guardado con exito. Los cambios se subiran a GitHub la proxima vez que tenga conexion." -ForegroundColor Green
                    Write-Host "======================================================================" -ForegroundColor Cyan
                    Write-BackupLog -Status "SUCCESS" -Target "Maestro" -Message "Snapshot local guardado: $CommitMessage (Sin red)"
                    $ScriptExitCode = 0; return
                } else {
                    Write-Host " Deshaciendo commit local para mantener el estado original..." -ForegroundColor Yellow
                    git reset --soft HEAD~1 2>&1 | Out-Null
                    Write-Host " [CANCELADO] Proceso abortado por el usuario." -ForegroundColor Red
                    Write-Host "======================================================================" -ForegroundColor Cyan
                    Write-BackupLog -Status "FAILED" -Target "Maestro" -Message "Respaldo cancelado por falta de red."
                    $ScriptExitCode = 1; return
                }
            } else {
                Write-Host " [OK] Respaldo local guardado con exito. Los cambios se subiran a GitHub la proxima vez que tenga conexion." -ForegroundColor Green
                Write-Host "======================================================================" -ForegroundColor Cyan
                Write-BackupLog -Status "SUCCESS" -Target "Maestro" -Message "Snapshot local guardado: $CommitMessage (Sin red)"
                $ScriptExitCode = 0; return
            }
        }

        # Realizar un pull preventivo para evitar rechazos por cambios remotos no sincronizados
        Write-Host " [5/6] Sincronizando repositorio local con GitHub..." -ForegroundColor Cyan
        
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
                Write-Host " [CONFLICTO DETECTADO] Hay cambios en GitHub que colisionan con tu codigo local." -ForegroundColor Red
                Write-Host " Deshaciendo el commit local para proteger tu entorno..." -ForegroundColor Yellow
                git reset --soft HEAD~1 2>&1 | Out-Null
                Write-Host " [INFO] Proceso cancelado. Por favor, resuelve los conflictos manualmente." -ForegroundColor Yellow
                Write-Host "======================================================================" -ForegroundColor Cyan
                Write-BackupLog -Status "FAILED" -Target "Maestro" -Message "Conflicto al sincronizar con GitHub en rama $branchName"
                $ScriptExitCode = 1; return
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
            Write-Host " [ERROR] Fallo al subir los cambios a GitHub (git push origin $branchName)." -ForegroundColor Red
            Write-Host " Por favor, verifica tus permisos, credenciales SSH o estado de la red." -ForegroundColor Yellow
            Write-BackupLog -Status "FAILED" -Target "Maestro" -Message "Fallo git push a origin $branchName (Exit Code: $pushExitCode)"
            $ScriptExitCode = 1; return
        }
        
        Write-Host " [OK] Sincronizacion con la rama [$branchName] completada con exito." -ForegroundColor Green
        Write-BackupLog -Status "SUCCESS" -Target "Maestro" -Message "Snapshot y push exitosos en $branchName. Commit: $CommitMessage"

        # Regla de Seguridad de Ramas para el Maestro
        if ($branchName -ne "main" -and $branchName -ne "master") {
            if ($Interactive) {
                Write-Host ""
                Write-Host " [Git Strategies] Has subido cambios a la rama de desarrollo: [$branchName]" -ForegroundColor Yellow
                Write-Host " Desea fusionar y subir estos cambios tambien a la rama de produccion 'main'? (S/N): " -NoNewline -ForegroundColor Cyan
                $confirmMerge = Read-Host
                if ($confirmMerge -like "s" -or $confirmMerge -like "S") {
                    $AutoMerge = $true
                }
            }
            
            if ($AutoMerge) {
                $mainBranch = "main"
                $hasMaster = (git branch --list "master" 2>$null)
                if ($hasMaster) { $mainBranch = "master" }
                
                Write-Host ""
                Write-Host " [Merge] Auto-Merge activado (Zero-Checkout). Fusionando [$branchName] -> [$mainBranch]..." -ForegroundColor Yellow
                
                # Actualizar la rama local master/main para apuntar a develop/branchName sin realizar checkout
                git branch -f $mainBranch $branchName 2>&1 | Out-Null
                
                Write-Host " [Merge] Subiendo consolidacion a GitHub (git push origin $mainBranch --no-verify)..." -ForegroundColor Cyan
                Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
                git push origin $mainBranch --no-verify
                $mergePushExitCode = $LASTEXITCODE
                Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
                
                if ($mergePushExitCode -ne 0) {
                    Write-Host " [ERROR] Fallo al subir la consolidacion a GitHub (git push origin $mainBranch)." -ForegroundColor Red
                    Write-BackupLog -Status "WARN" -Target "Maestro" -Message "Snapshot de desarrollo OK, pero fallo el push de fusion a $mainBranch (Exit Code: $mergePushExitCode)"
                } else {
                    Write-BackupLog -Status "SUCCESS" -Target "Maestro" -Message "Sincronizado y fusionado en $mainBranch con exito."
                    Write-Host " [OK] Proceso completado. Cambios sincronizados en [$branchName] y [$mainBranch]." -ForegroundColor Green
                }
            } else {
                Write-Host " [INFO] Cambios resguardados unicamente en la rama de desarrollo [$branchName]." -ForegroundColor Gray
            }
        }
    }
}
catch {
    Write-Host ""
    Write-Host " [ERROR] Ocurrio un fallo en el proceso de respaldo:" -ForegroundColor Red
    Write-Host "    -> $_" -ForegroundColor Red
    Write-Host ""
    Write-BackupLog -Status "FAILED" -Target "Maestro" -Message "Excepcion imprevista: $_"
}
finally {
    # Asegurar que el repositorio raíz regrese a la rama original de trabajo en cualquier escenario
    if ($branchName) {
        $currentBranch = (git rev-parse --abbrev-ref HEAD 2>$null)
        if ($currentBranch -and $currentBranch -ne $branchName) {
            Write-Host " [Restauración] Regresando de emergencia a tu rama de trabajo original: [$branchName]..." -ForegroundColor Yellow
            git merge --abort 2>&1 | Out-Null
            git checkout $branchName 2>&1 | Out-Null
        }
    }

    # 6. Restaurar de forma 100% segura los directorios .git de desarrollo
    $renamedCount = $renamedDirs.Count
    if ($renamedCount -gt 0) {
        Write-Host " [6/6] Restaurando directorios Git de desarrollo..." -ForegroundColor Yellow
        foreach ($dir in $renamedDirs) {
            $tempPath = $dir.TempPath
            $originalName = $dir.ParentName
            if (Test-Path $tempPath) {
                Write-Host "    -> Habilitando: $originalName/.git" -ForegroundColor DarkGray
                $retries = 6
                $success = $false
                while (-not $success -and $retries -gt 0) {
                    try {
                        attrib -h -r -s $tempPath 2>&1 | Out-Null
                        Rename-Item -Path $tempPath -NewName ".git" -ErrorAction Stop -Force
                        attrib +h "$($dir.TempPath.Replace('.git-backup-temp', '.git'))" 2>&1 | Out-Null
                        $success = $true
                    } catch {
                        $retries--
                        if ($retries -gt 0) {
                            Start-Sleep -Milliseconds 400
                        }
                    }
                }
                if (-not $success) {
                    Write-Host "    [!] ERROR: No se pudo renombrar $tempPath a .git. Por favor, renombrelo manualmente." -ForegroundColor Red
                }
            }
        }
    }
    # Reiniciar todos los servidores Vite que fueron detenidos al inicio
    if ($viteWasStopped -and $stoppedVitePaths.Count -gt 0) {
        Write-Host " [INFO] Reiniciando servidores de desarrollo Vite..." -ForegroundColor Cyan
        foreach ($path in $stoppedVitePaths) {
            if (Test-Path $path) {
                $projName = Split-Path -Path $path -Leaf
                Write-Host "    -> Iniciando: $projName..." -ForegroundColor DarkGray
                Start-Process powershell -ArgumentList "-NoProfile -NoExit -Command `"Set-Location '$path'; npm run dev`"" -WindowStyle Normal
            }
        }
    }

    # Asegurar que el repositorio maestro quede situado en la rama develop
    $currentBranchMaster = (git rev-parse --abbrev-ref HEAD 2>$null)
    if ($currentBranchMaster -and $currentBranchMaster -ne "develop") {
        Write-Host " [Restauración] Cambiando el repositorio maestro a la rama de desarrollo 'develop'..." -ForegroundColor Yellow
        $hasDevelop = (git branch --list "develop" 2>$null)
        if (-not $hasDevelop) {
            git branch develop 2>&1 | Out-Null
        }
        git checkout develop 2>&1 | Out-Null
    }

    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "  [OK] Snapshot completado | Entorno de desarrollo restaurado con exito" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Cyan
}

Exit-WithPause $ScriptExitCode
