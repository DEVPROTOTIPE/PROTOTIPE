# Diagrama de Flujo Global del Ecosistema PROTOTIPE

Este documento detalla el flujo operativo y de datos del ecosistema PROTOTIPE, desde el aprovisionamiento de un nuevo cliente hasta la sincronización bidireccional de código y la telemetría centralizada.

---

## 🗺️ Flujo de Procesos de Principio a Fin

```mermaid
graph TD
    %% Entidades y Roles
    Developer[Desarrollador / IA]
    Dashboard[Dev Dashboard Central]
    CLI[Prototipe CLI Server]
    ClientInstance[Instancia Cliente]
    TemplateCore[Plantilla Core / Core Seed]
    FirebaseCentral[Firebase Central CRM]
    FirebaseClient[Firebase Cliente Aislado]

    %% Proceso de Aprovisionamiento (Onboarding)
    Developer -->|1. Configura Marca / Nicho en UI| Dashboard
    Dashboard -->|2. POST /api/create-project| CLI
    CLI -->|3. Fork IPC Worker| Worker[worker_create_project.js]
    Worker -->|4. Clona Semilla| TemplateCore
    Worker -->|5. Inyecta Marca HSL, logos, favicon y PWA| ClientInstance
    Worker -->|6. Genera carpeta Documentacion local con bitácora, tareas y mapa| ClientInstance
    Worker -->|7. Genera .prototipe.json metadatos| ClientInstance
    Worker -->|8. Despliega Reglas & Config| FirebaseClient
    Worker -->|9. Registra cliente vía REST| FirebaseCentral
    Worker -->|10. Retorna éxito por SSE| Dashboard

    %% Proceso de Sincronización Upstream (Templates)
    Developer -->|11. Desarrolla mejoras en Core Dev| TemplateCore
    Developer -->|12. Dispara @actualizar-template| CLI
    CLI -->|13. Corre sync_templates.js aplicando exclusión de /Documentacion /| CLI
    CLI -->|14. Valida esquemas e IDs| CLI
    CLI -->|15. Copia archivos genéricos sanitizados| TemplateCore

    %% Proceso de Sincronización Downstream (Clientes)
    Developer -->|16. Corre sync_clients.js aplicando exclusión de /Documentacion /| CLI
    CLI -->|17. Escanea e identifica metadatos .prototipe.json| ClientInstance
    CLI -->|18. Compara Core Files vs Custom Files| ClientInstance
    CLI -->|19. Copia selectiva con confirmación| ClientInstance
    CLI -->|20. Ejecuta Build e Integridad| ClientInstance

    %% Operación e Interacciones en Producción
    ClientInstance -->|21. Realiza ventas y auditorías| FirebaseClient
    ClientInstance -->|22. Registra fallos y cobros comisionales| Telemetry[telemetryService.js]
    Telemetry -->|23. Envía telemetría en background| FirebaseCentral
    FirebaseCentral -->|24. Visualización en Recharts| Dashboard
```

---

## ⚙️ Descripción de Flujos Críticos

### A. Aprovisionamiento (Onboarding)
El desarrollador define el color de marca, logo y nicho en el Dashboard. El CLI levanta un Worker en un proceso hijo, copia la plantilla, redimensiona el logo para la PWA, inyecta variables HSL, variables `.env.local` e inicializa dinámicamente la carpeta local de documentación (`Documentacion [ProjectName]`), inicializa Firebase y reporta al CRM Central.

### B. Mantenimiento Core (Upstream Sync)
Las mejoras y corrección de bugs se hacen en la app base de desarrollo. Al ejecutar `@actualizar-template`, el CLI sanitiza tokens y credenciales de cliente antes de actualizar la plantilla central en `templates/`, aplicando filtros de exclusión para no transferir documentación local.

### C. Mantenimiento Clientes (Downstream Sync)
Mediante `sync_clients.js`, el CLI escanea los metadatos `.prototipe.json` de cada cliente, analiza diferencias de archivos core, y propaga parches sin alterar variables de marca, temas visuales, configuraciones locales ni carpetas de documentación local.
