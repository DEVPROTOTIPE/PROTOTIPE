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
        $fileName = Split-Path -Path $filePath -Leaf
        
        if ($statusType -eq "M") { $modified += $fileName }
        elseif ($statusType -eq "??" -or $statusType -eq "A") { $added += $fileName }
        elseif ($statusType -eq "D") { $deleted += $fileName }
    }
    
    $summaryParts = @()
    if ($modified.Count -gt 0) { $summaryParts += "Mod: $($modified -join ', ')" }
    if ($added.Count -gt 0) { $summaryParts += "Add: $($added -join ', ')" }
    if ($deleted.Count -gt 0) { $summaryParts += "Del: $($deleted -join ', ')" }
    
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
        # Validar fugas de seguridad de variables de entorno (.env) antes de continuar
        $leakDetected = $false
        foreach ($line in ($status -split "`r?`n")) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            $filePath = $line.Substring(3).Trim() -replace '"', ''
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
            exit 1
        }

        # 4. Confirmar cambios localmente
        Write-Host " [4/6] Guardando snapshot en el historial local..." -ForegroundColor Cyan
        git commit -m $CommitMessage | Out-Null
        Write-Host "    -> Snapshot local creado con exito." -ForegroundColor Gray

        # 5. Sincronizar con GitHub
        $branchName = (git rev-parse --abbrev-ref HEAD 2>$null)
        
        Write-Host " [5/6] Verificando conexion con GitHub..." -ForegroundColor Cyan
        $isOnline = Test-Connection -ComputerName "github.com" -Count 1 -Quiet -ErrorAction SilentlyContinue
        if ($isOnline) {
            # Evitar prompts interactivos de credenciales durante la prueba de conexion
            $oldPrompt = $env:GIT_TERMINAL_PROMPT
            $oldAskpass = $env:GIT_ASKPASS
            $env:GIT_TERMINAL_PROMPT = "0"
            $env:GIT_ASKPASS = "true"

            git ls-remote --exit-code -h origin HEAD 2>$null | Out-Null
            if ($LASTEXITCODE -ne 0) { $isOnline = $false }

            # Restaurar entorno
            $env:GIT_TERMINAL_PROMPT = $oldPrompt
            $env:GIT_ASKPASS = $oldAskpass
        }

        if (-not $isOnline) {
            Write-Host ""
            Write-Host " [WARN] No se pudo establecer conexion con el repositorio remoto de GitHub (Offline/Error de credenciales)." -ForegroundColor Yellow
            Write-Host " Desea realizar un respaldo local (Commit local en tu disco) unicamente? (S/N): " -NoNewline -ForegroundColor Cyan
            $confirmLocal = Read-Host
            if ($confirmLocal -like "s" -or $confirmLocal -like "S") {
                Write-Host " [OK] Respaldo local guardado con exito. Los cambios se subiran a GitHub la proxima vez que tenga conexion." -ForegroundColor Green
                Write-Host "======================================================================" -ForegroundColor Cyan
                exit 0
            } else {
                Write-Host " Deshaciendo commit local para mantener el estado original..." -ForegroundColor Yellow
                git reset --soft HEAD~1 2>&1 | Out-Null
                Write-Host " [CANCELADO] Proceso abortado por el usuario." -ForegroundColor Red
                Write-Host "======================================================================" -ForegroundColor Cyan
                exit 1
            }
        }

        # Realizar un pull preventivo para evitar rechazos por cambios remotos no sincronizados
        Write-Host " [5/6] Sincronizando repositorio local con GitHub..." -ForegroundColor Cyan
        Write-Host "    -> Trayendo posibles actualizaciones previas del servidor..." -ForegroundColor DarkGray
        $pullResult = git pull origin $branchName 2>&1

        if ($LASTEXITCODE -ne 0 -or $pullResult -match "CONFLICT" -or (git status --porcelain | Where-Object { $_ -match '^UU' })) {
            Write-Host ""
            Write-Host " [CONFLICTO DETECTADO] Hay cambios en GitHub que colisionan con tu codigo local." -ForegroundColor Red
            Write-Host " Deshaciendo el commit local para proteger tu entorno..." -ForegroundColor Yellow
            git reset --soft HEAD~1 2>&1 | Out-Null
            Write-Host " [INFO] Proceso cancelado. Por favor, resuelve los conflictos manualmente." -ForegroundColor Yellow
            Write-Host "======================================================================" -ForegroundColor Cyan
            exit 1
        }

        Write-Host "    -> Subiendo tus cambios locales a GitHub (git push origin $branchName)..." -ForegroundColor DarkGray
        Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
        git push origin $branchName
        Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
        Write-Host " [OK] Sincronizacion con la rama [$branchName] completada con exito." -ForegroundColor Green


        
        # Regla de Seguridad de Ramas para el Maestro
        if ($branchName -ne "main" -and $branchName -ne "master") {
            Write-Host ""
            Write-Host " [Git Strategies] Has subido cambios a la rama de desarrollo: [$branchName]" -ForegroundColor Yellow
            Write-Host " Desea fusionar y subir estos cambios tambien a la rama de produccion 'main'? (S/N): " -NoNewline -ForegroundColor Cyan
            $confirmMerge = Read-Host
            
            if ($confirmMerge -like "s" -or $confirmMerge -like "S") {
                $mainBranch = "main"
                $hasMaster = (git branch --list "master" 2>$null)
                if ($hasMaster) { $mainBranch = "master" }
                
                Write-Host ""
                Write-Host " [Merge] Cambiando a la rama de produccion [$mainBranch]..." -ForegroundColor Cyan
                git checkout $mainBranch 2>&1 | Out-Null
                
                Write-Host " [Merge] Trayendo ultimos cambios del servidor remoto..." -ForegroundColor Cyan
                git pull origin $mainBranch 2>&1 | Out-Null
                
                Write-Host " [Merge] Fusionando rama [$branchName] en [$mainBranch]..." -ForegroundColor Cyan
                $mergeResult = git merge $branchName -m "merge: consolidar $branchName en $mainBranch" 2>&1
                
                # Validar si hubo fallos o conflictos en el merge
                if ($LASTEXITCODE -ne 0 -or $mergeResult -match "CONFLICT" -or (git status --porcelain | Where-Object { $_ -match '^UU' })) {
                    Write-Host ""
                    Write-Host " [CONFLICTO DETECTADO] La fusion automatica encontro conflictos de codigo." -ForegroundColor Red
                    Write-Host " Abortando fusion para proteger la rama de produccion [$mainBranch]..." -ForegroundColor Yellow
                    git merge --abort 2>&1 | Out-Null
                    
                    Write-Host " Regresando a tu rama de trabajo [$branchName]..." -ForegroundColor Cyan
                    git checkout $branchName 2>&1 | Out-Null
                    
                    Write-Host " [INFO] Proceso cancelado. Por favor, resuelve los conflictos manualmente." -ForegroundColor Yellow
                    Write-Host "======================================================================" -ForegroundColor Red
                    exit 1
                }
                
                Write-Host " [Merge] Subiendo consolidacion a GitHub (git push origin $mainBranch)..." -ForegroundColor Cyan
                Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
                git push origin $mainBranch
                Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
                
                Write-Host " [Merge] Regresando a tu rama de trabajo [$branchName]..." -ForegroundColor Cyan
                git checkout $branchName 2>&1 | Out-Null
                Write-Host " [OK] Proceso completado. Cambios sincronizados en [$branchName] y [$mainBranch]." -ForegroundColor Green
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
                $retries = 6
                $success = $false
                while (-not $success -and $retries -gt 0) {
                    try {
                        Rename-Item -Path $tempPath -NewName ".git" -ErrorAction Stop -Force
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
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "  [OK] Snapshot completado | Entorno de desarrollo restaurado con exito" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Cyan
}
