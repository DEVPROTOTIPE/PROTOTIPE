@echo off
title PROTOTIPE CLI Daemon Server
cd /d "%~dp0"
echo.
echo =========================================================
echo  INICIANDO SERVIDOR LOCAL DE PROTOTIPE CLI (PUERTO 3001)
echo =========================================================
echo.
call npm run server
echo.
echo El proceso ha terminado.
pause
