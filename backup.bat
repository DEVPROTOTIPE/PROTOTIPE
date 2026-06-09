@echo off
chcp 65001 > nul
title Consola de Control Git - PROTOTIPE
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0menu_backup.ps1"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Hubo un problema al ejecutar el script de PowerShell.
    echo Presione cualquier tecla para salir...
    pause > nul
)
