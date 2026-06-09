@echo off
chcp 65001 > nul
title Respaldo dev-dashboard
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0subproject_backup.ps1" -SubprojectPath "%~dp0Central PROTOTIPE\dev-dashboard"
echo.
echo Presione cualquier tecla para cerrar esta ventana...
pause > nul
