# ==============================================================================
#                 PROTOTIPE ECOSISTEMA - SUBPROJECT BACKUP ENGINE
# ==============================================================================
# Este script automatiza el guardado y push de subproyectos individuales.
# Respeta de forma dinamica la rama actual (Git Strategies).

param (
    [string]$SubprojectPath = "",
    [string]$CommitMessage = ""
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

# Solicitar mensaje de commit interactivo
if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
    Write-Host "  Escribe el mensaje para el commit (Presiona Enter para mensaje automatico):" -ForegroundColor Cyan
    Write-Host "  > " -NoNewline
    $inputMessage = Read-Host
    
    if ([string]::IsNullOrWhiteSpace($inputMessage)) {
        # Analizar cambios para generar un mensaje con contexto real
        $rawStatus = git status --porcelain
        $added = @()
        $modified = @()
        $deleted = @()
        
        foreach ($line in ($rawStatus -split "`r?`n")) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            $statusType = $line.Substring(0, 2).Trim()
            $filePath = $line.Substring(3).Trim()
            # Quitar comillas si el path las contiene
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
            # Limitar longitud para evitar desbordes en el mensaje de commit
            if ($contextText.Length -gt 120) {
                $contextText = $contextText.Substring(0, 117) + "..."
            }
            $CommitMessage = "Auto-Snapshot [$branchName]: $contextText"
        } else {
            $currentDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $CommitMessage = "Snapshot [$branchName] - $currentDate"
        }
    }
}

Write-Host ""
Write-Host "  [1/3] Indexando cambios locales..." -ForegroundColor Cyan
git add . 2>&1 | Out-Null

Write-Host "  [2/3] Creando commit local..." -ForegroundColor Cyan
git commit -m $CommitMessage 2>&1 | Out-Null
Write-Host "    -> Commit exitoso: '$CommitMessage'" -ForegroundColor Gray

# Verificar conexion con el servidor remoto
Write-Host "  [3/3] Verificando conexion con GitHub..." -ForegroundColor Cyan
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
    Write-Host "  [WARN] No se pudo establecer conexion con el repositorio remoto de GitHub (Offline/Error de credenciales)." -ForegroundColor Yellow
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



# Regla de Seguridad de Ramas (Git Strategies: develop -> main)
if ($branchName -ne "main" -and $branchName -ne "master") {
    Write-Host ""
    Write-Host "  [Git Strategies] Has subido cambios a la rama de desarrollo: [$branchName]" -ForegroundColor Yellow
    Write-Host "  Desea fusionar y subir estos cambios tambien a la rama de produccion 'main'? (S/N): " -NoNewline -ForegroundColor Cyan
    $confirmMerge = Read-Host
    
    if ($confirmMerge -like "s" -or $confirmMerge -like "S") {
        # Detectar si la rama principal se llama main o master en el repo local
        $mainBranch = "main"
        $hasMaster = (git branch --list "master" 2>$null)
        if ($hasMaster) { $mainBranch = "master" }
        
        Write-Host ""
        Write-Host "  [Merge] Cambiando a la rama de produccion [$mainBranch]..." -ForegroundColor Cyan
        git checkout $mainBranch 2>&1 | Out-Null
        
        Write-Host "  [Merge] Trayendo ultimos cambios del servidor remoto..." -ForegroundColor Cyan
        git pull origin $mainBranch 2>&1 | Out-Null
        
        Write-Host "  [Merge] Fusionando rama [$branchName] en [$mainBranch]..." -ForegroundColor Cyan
        # Guardar salida del merge para validar conflictos
        $mergeResult = git merge $branchName -m "merge: consolidar $branchName en $mainBranch" 2>&1
        
        # Validar si hubo fallos o conflictos en el merge
        if ($LASTEXITCODE -ne 0 -or $mergeResult -match "CONFLICT" -or (git status --porcelain | Where-Object { $_ -match '^UU' })) {
            Write-Host ""
            Write-Host "  [CONFLICTO DETECTADO] La fusion automatica encontro conflictos de codigo." -ForegroundColor Red
            Write-Host "  Abortando fusion para proteger la rama de produccion [$mainBranch]..." -ForegroundColor Yellow
            git merge --abort 2>&1 | Out-Null
            
            Write-Host "  Regresando a tu rama de trabajo [$branchName]..." -ForegroundColor Cyan
            git checkout $branchName 2>&1 | Out-Null
            
            Write-Host "  [INFO] Proceso cancelado. Por favor, resuelve los conflictos manualmente." -ForegroundColor Yellow
            Write-Host "======================================================================" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "  [Merge] Subiendo consolidacion a GitHub (git push origin $mainBranch)..." -ForegroundColor Cyan
        Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
        git push origin $mainBranch
        Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
        
        Write-Host "  [Merge] Regresando a tu rama de trabajo [$branchName]..." -ForegroundColor Cyan
        git checkout $branchName 2>&1 | Out-Null
        Write-Host "  [OK] Proceso completado. Cambios sincronizados de forma segura en [$branchName] y [$mainBranch]." -ForegroundColor Green
    } else {
        Write-Host "  [INFO] Cambios resguardados unicamente en la rama de desarrollo [$branchName]." -ForegroundColor Gray
    }
} else {
    Write-Host "  [OK] Proceso completado. Cambios guardados en la rama principal [$branchName]." -ForegroundColor Green
}
Write-Host "======================================================================" -ForegroundColor Green
