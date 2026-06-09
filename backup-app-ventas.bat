@echo off
chcp 65001 > nul
title Respaldo App Ventas
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0subproject_backup.ps1" -SubprojectPath "%~dp0Plantillas Core\App Ventas"
echo.
echo Presione cualquier tecla para cerrar esta ventana...
pause > nul
