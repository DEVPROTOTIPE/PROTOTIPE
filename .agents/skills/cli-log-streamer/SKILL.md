---
name: cli-log-streamer
description: Muestra los logs internos del Bridge en caliente para depurar fallas silenciosas en operaciones de fondo sin salir de la consola web.
trigger: "@consola-cli"
aliases:
  - "@ver-logs"
---

# Skill de Visualización de Logs (`cli-log-streamer`)

Esta skill permite al desarrollador o al agente de IA visualizar el flujo de logs en tiempo real del backend Bridge CLI (`cli_bridge.log`) sin necesidad de abrir archivos de texto manualmente en el editor.

## 📁 Rutas de Acceso

- **Archivo físico:** `[GIT_ROOT]/Prototipe-CLI/cli_bridge.log`
- **Endpoint SSE:** `GET http://localhost:3001/api/cli/logs/stream` (Acceso exclusivo localhost)

## 🛠️ Procedimiento de Uso

1. **Trigger de IA:** `@consola-cli` o `@ver-logs`.
2. **Visualización:** Abre la sub-pestaña "Logs del Bridge" en el panel de control "Salud y Roadmap".
3. **Acciones Disponibles:**
   - **Play/Pausa:** Congelar la transmisión en vivo para analizar una línea de log específica.
   - **Limpiar Consola:** Vaciar el búfer visual del visor sin purgar el archivo físico de log.
