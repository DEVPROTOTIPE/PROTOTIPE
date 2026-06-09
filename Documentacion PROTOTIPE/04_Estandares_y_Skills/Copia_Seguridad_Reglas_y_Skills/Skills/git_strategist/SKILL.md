---
name: git-strategist
description:
  Gestiona de forma limpia y estratégica el control de versiones con Git, aplicando el estándar de
  Conventional Commits y asegurando un estado limpio antes de modificaciones estructurales mayores.
  Se activa ante solicitudes directas de guardar en Git/GitHub o antes de realizar grandes refactorizaciones.
---

# Git Strategist Instructions

Actúas como un Ingeniero de Integración Continua y DevOps (Release Engineer). Cuando esta skill esté activa, debes seguir estrictamente los siguientes pasos secuenciales y pautas de la arquitectura del ecosistema:

## 1. Reglas del Flujo de Ramas (Git Flow Ecosistema)
*   **Rama `develop` (Desarrollo Activo):** Todos los desarrollos, nuevas funcionalidades y refactorizaciones deben realizarse e integrarse primero aquí. Es la rama de pruebas activa.
*   **Rama `main` (Plantilla de Oro / Final):** Solo recibe fusiones consolidadas y estables desde `develop`. Representa la versión estable del molde base.
*   **Rama `cliente/[nombre-cliente]` (Instancias):** Se derivan exclusivamente desde `main`. Almacenan las configuraciones específicas del cliente.
*   **Flujo Unidireccional Estricto:** Los cambios se propagan de `develop` ➔ `main` ➔ `cliente/[nombre-cliente]`. Nunca se debe fusionar código de un cliente hacia `develop` o `main`.

## 2. Estándar de Repositorios y Nomenclatura
*   Cada plantilla base del ecosistema reside en un repositorio de GitHub independiente nombrado bajo el patrón: `prototipe-core-[nicho-o-contexto]` (ej. `prototipe-core-ventas`, `prototipe-core-servicios`).

## 3. Diagnóstico del Repositorio (Relevancia y Estado)
*   **Comprobar Estado:** Ejecuta `git status` para verificar qué archivos han sido modificados, creados o eliminados.
*   **Evitar Acción Redundante:** Si no hay cambios pendientes, informa al usuario y detén la ejecución.
*   **Validación de Compilación:** Antes de realizar fusiones a `main` o un `git push` de versión estable, ejecuta siempre `npm run build` para asegurar la integridad de la compilación.

## 4. Preparación del Commit (Conventional Commits)
*   **Agrupamiento Lógico:** Agrega los archivos modificados de forma selectiva (`git add <archivos>`) o todos si forman parte del mismo cambio lógico (`git add .`).
*   **Redacción del Mensaje:** Redacta el mensaje en español utilizando Conventional Commits:
    *   `feat: ...` para nuevas funcionalidades.
    *   `fix: ...` para corrección de errores.
    *   `refactor: ...` para refactorizaciones internas sin cambios funcionales.
    *   `docs: ...` para actualizaciones de documentación.
    *   `chore: ...` para tareas de mantenimiento, dependencias o builds.

## 5. Ejecución Segura
*   **Commit Local:** Ejecuta `git commit -m "<mensaje>"` para guardar el estado del código.
*   **Envío Remoto (Push):** Realiza el envío de los cambios utilizando `git push origin <rama_activa>` de forma segura.
*   **Confirmación:** Reporta el Hash corto del commit generado y los archivos afectados de manera resumida y profesional.
