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

if ([string]::IsNullOrWhiteSpace($SubprojectPath) -or -not (Test-Path $SubprojectPath)) {
    Write-Host " [ERROR] Ruta de subproyecto invalida o no especificada." -ForegroundColor Red
    exit 1
}

Set-Location -Path $SubprojectPath

# Limpiar pantalla para una visualizacion impecable
Clear-Host

# Obtener nombre del subproyecto
$projectName = Split-Path -Path $SubprojectPath -Leaf

# Auto-detectar la rama actual
$branchName = (git rev-parse --abbrev-ref HEAD 2>$null)
if (-not $branchName) {
    Write-Host " [ERROR] El directorio especificado no es un repositorio Git valido." -ForegroundColor Red
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
    $leakDetected = $false
    foreach ($line in ($statusShort -split "`r?`n")) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $filePath = $line.Substring(3).Trim() -replace '"', ''
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
            $fileName = Split-Path -Path $filePath -Leaf
            
            if ($statusType -eq "M") { $modified += $fileName }
            elseif ($statusType -eq "??" -or $statusType -eq "A") { $added += $fileName }
            elseif ($statusType -eq "D") { $deleted += $fileName }
        }
        
        $summaryParts = @()
        if ($modified.Count -gt 0) { $summaryParts += "Mod: $($modified -join ', ')" }
        if ($added.Count -gt 0)    { $summaryParts += "Add: $($added -join ', ')" }
        if ($deleted.Count -gt 0)  { $summaryParts += "Del: $($deleted -join ', ')" }
        
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
    git add . 2>&1 | Out-Null
    
    Write-Host "  [2/3] Creando commit local..." -ForegroundColor Cyan
    git commit -m $CommitMessage 2>&1 | Out-Null
    Write-Host "    -> Commit exitoso: '$CommitMessage'" -ForegroundColor Gray
    
    # ── Estrategia de Push ────────────────────────────────────────────────
    if (-not $Push) {
        Write-Host "  [3/3] Modo Solo-Local: commit guardado localmente. Push omitido por configuracion." -ForegroundColor Yellow
        Write-Host "======================================================================" -ForegroundColor Green
        exit 0
    }
    
    # Verificar conexion con el servidor remoto via SSH
    Write-Host "  [3/3] Verificando conexion con GitHub (SSH)..." -ForegroundColor Cyan
    $isOnline = $false
    git ls-remote origin HEAD 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $isOnline = $true }
    
    if (-not $isOnline) {
        Write-Host ""
        Write-Host "  [WARN] Sin conexion SSH con GitHub. El commit quedo guardado localmente." -ForegroundColor Yellow
        
        if ($Interactive) {
            Write-Host "  Desea realizar un respaldo local (Commit local en tu disco) unicamente? (S/N): " -NoNewline -ForegroundColor Cyan
            $confirmLocal = Read-Host
            if ($confirmLocal -like "s" -or $confirmLocal -like "S") {
                Write-Host "  [OK] Respaldo local guardado con exito. Los cambios se subiran a GitHub la proxima vez que tenga conexion." -ForegroundColor Green
                Write-Host "======================================================================" -ForegroundColor Green
                exit 0
            } else {
                Write-Host "  Deshaciendo commit local para mantener el estado original..." -ForegroundColor Yellow
                git reset --soft HEAD~1 2>&1 | Out-Null
                Write-Host "  [CANCELADO] Proceso abortado por el usuario." -ForegroundColor Red
                Write-Host "======================================================================" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "  [INFO] Ejecuta 'git push' cuando tengas conexion disponible." -ForegroundColor Gray
            Write-Host "======================================================================" -ForegroundColor Yellow
            exit 0
        }
    }
    
    # Realizar un pull preventivo para evitar rechazos por cambios remotos no sincronizados
    Write-Host "  [3/3] Sincronizando repositorio local con GitHub..." -ForegroundColor Cyan
    Write-Host "    -> Trayendo posibles actualizaciones previas del servidor..." -ForegroundColor DarkGray
    $pullResult = git pull origin $branchName 2>&1
    
    if ($LASTEXITCODE -ne 0 -or $pullResult -match "CONFLICT" -or (git status --porcelain | Where-Object { $_ -match '^UU' })) {
        Write-Host ""
        Write-Host "  [CONFLICTO DETECTADO] Hay cambios en GitHub que colisionan con tu codigo local." -ForegroundColor Red
        Write-Host "  Deshaciendo el commit local para proteger tu entorno..." -ForegroundColor Yellow
        git reset --soft HEAD~1 2>&1 | Out-Null
        Write-Host "  [INFO] Proceso cancelado. Por favor, resuelve los conflictos manualmente." -ForegroundColor Yellow
        Write-Host "======================================================================" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "    -> Subiendo tus cambios locales a GitHub (git push origin $branchName)..." -ForegroundColor DarkGray
    Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
    git push origin $branchName
    Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
    
    # ── Git Strategies: Auto-Merge a produccion ──────────────────────────
    if ($branchName -ne "main" -and $branchName -ne "master") {
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
            git pull origin $mainBranch 2>&1 | Out-Null
            
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
                exit 1
            }
            
            Write-Host "  [Merge] Subiendo consolidacion a GitHub (git push origin $mainBranch)..." -ForegroundColor Cyan
            Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
            git push origin $mainBranch
            Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
            
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
    exit 1
}
finally {
    # Asegurar regreso a la rama de trabajo original (develop o develop branch original)
    if ($branchName) {
        $currentBranch = (git rev-parse --abbrev-ref HEAD 2>$null)
        if ($currentBranch -and $currentBranch -ne $branchName) {
            Write-Host "  [Restauración] Regresando a la rama de trabajo original: [$branchName]..." -ForegroundColor Yellow
            git checkout $branchName 2>&1 | Out-Null
        }
    }
}
