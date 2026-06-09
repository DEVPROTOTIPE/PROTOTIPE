@echo off
chcp 65001 > nul
title Respaldo Maestro PROTOTIPE
echo Lanzando script de respaldo fisico y sincronizacion automatica con GitHub...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0git_backup.ps1"
echo.
echo Presione cualquier tecla para cerrar esta ventana...
pause > nul
