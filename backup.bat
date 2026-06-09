@echo off
chcp 65001 > nul
title Consola de Control Git - PROTOTIPE
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0menu_backup.ps1"
