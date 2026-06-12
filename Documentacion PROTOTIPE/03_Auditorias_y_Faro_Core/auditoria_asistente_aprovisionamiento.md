# Auditoría y Plan de Evolución: Asistente de Aprovisionamiento Ecosistema PROTOTIPE

Este reporte analiza el Asistente de Aprovisionamiento (Onboarding Wizard en `dev-dashboard` y Motor Generador en `Prototipe-CLI`) identificando fricciones lógicas, riesgos operacionales y proponiendo módulos avanzados para garantizar que los shards cliente se construyan de forma 100% exacta a sus especificaciones de negocio.

---

## 1. Diagnóstico y Correcciones de Robustez (Bug Prevention)

### [MEDIO] Falta de Preflight Checks en el Wizard
* **Causa Raíz:** El dashboard confía en que el CLI local tiene todas las dependencias instaladas y sesiones activas. Si el CLI de Firebase no está autenticado o `git` no está configurado, el proceso asíncrono avanza y falla en pasos avanzados (pasos 9-11), forzando un reintento manual total.
* **Solución Concreta:** Implementar un endpoint `/api/cli/preflight` que valide:
  1. Login activo en Firebase (`firebase login:list`).
  2. Autenticación en GitHub CLI (`gh auth status`).
  3. Presencia de utilidades del sistema (`npm`, `git`).
  Mostrar los checks con semáforos verde/rojo en la pestaña "Servidor" antes de permitir el avance.

### [MEDIO] Riesgo de Colisión de Nombres en Producción
* **Causa Raíz:** Si el `projectId` se configura como `auto-detect` pero el ID de proyecto único derivado del nombre del cliente ya existe en el namespace global de Firebase, la creación falla de forma abrupta.
* **Solución Concreta:** Añadir una llamada reactiva síncrona en el frontend (`blur` del input de nombre de cliente) hacia el CLI para verificar la disponibilidad del ID usando la API de Firebase antes de proceder.

### [BAJO] Gestión de Timeout Límite en Redes Lentas
* **Causa Raíz:** En `server.js`, la promesa de creación tiene un límite rígido de 10 minutos (`WORKER_TIMEOUT_MS`). En despliegues lentos de hosting o compilaciones NPM complejas, este tiempo puede verse rebasado, abortando el proceso a la mitad.
* **Solución Concreta:** Aumentar el límite dinámicamente si el canal SSE detecta que el proceso está realizando activamente `npm install` o subiendo assets de Hosting, y registrar alertas auditables en la consola de telemetría.

---

## 2. Mejoras de UX y Control del Desarrollador

* **Visualizador de Estructura de Core (Lienzo Semántico):** Previsualizar en tiempo real el mapa de directorios (`src/pages`, `src/services`) que se creará según el core elegido (ej: `template-ventas` vs `template-core-seed`), para que el desarrollador comprenda el punto de partida estructural de la aplicación.
* **Cálculo Dinámico de Contraste para Modos Light/Dark:** El simulador actual estima los HSL base, pero no recalcula las relaciones de conformidad WCAG si el usuario alterna la previsualización del Mockup en modo claro. Agregar un toggle claro/oscuro en el simulador para contrastar la accesibilidad en ambos escenarios.

---

## 3. Funcionalidades Avanzadas para Construcción Exacta (Exact-Fit Engine)

Para lograr que los clientes reciban un producto terminado a la medida sin necesidad de refactorizaciones manuales de código extensas, se propone integrar los siguientes tres motores al flujo de aprovisionamiento:

### A. Motor de Esquemas y Datos Dinámicos (Data Schema Builder)
* **Objetivo:** Permitir al desarrollador modelar la base de datos del cliente desde el wizard.
* **Flujo UI/UX:**
  - Añadir una pestaña en el Onboarding llamada **"Modelo de Datos"**.
  - Permitir declarar colecciones (ej: `mascotas`, `historial_clinico`, `repuestos`) con campos tipados (text, number, select, boolean, date) y relaciones básicas.
* **Generación (generator.js):**
  - El motor compilará estas especificaciones y autogenerará en el shard cliente:
    1. Esquemas Zod en `/src/schemas/[coleccion].js`.
    2. Hooks de consulta TanStack Query en `/src/hooks/use[Coleccion].js` enlazados a Firestore.
    3. Interfaces CRUD 100% funcionales (formularios y tablas responsivas) basadas en dichos esquemas.

### B. Inyector de Componentes de la Biblioteca (Component Injection)
* **Objetivo:** Portar código portable y validado del catálogo directamente en el bootstrapping.
* **Flujo UI/UX:**
  - Pestaña **"Módulos de Biblioteca"** donde se despliega el catálogo de `/06_Biblioteca_Componentes/` (ej: `Calendario_Premium`, `Otp_Input`, `Caja_Diaria_POS`).
  - El desarrollador marca checkboxes con los componentes que el cliente requiere.
* **Generación (generator.js):**
  - El CLI copiará los archivos físicos del componente desde la biblioteca (`d:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/`) hacia `/src/components/ui/` o `/src/components/common/` en la estructura destino y resolverá automáticamente las rutas relativas de imports.

### C. Semillado Dinámico por IA (AI Context Seeder)
* **Objetivo:** Poblar la app con datos realistas basados en el brief del cliente en lugar de mocks genéricos.
* **Flujo UI/UX:**
  - Al procesar los requerimientos especiales en `expandRequirementsWithAI`, Gemini generará un JSON estructurado con 10-15 registros de negocio contextualizados (ej: si el cliente es una tornería, inyectará piezas mecánicas pendientes de maquinado, clientes industriales y cotizaciones realistas).
* **Generación (generator.js):**
  - Al inicializar Firestore (paso 6 del CLI), el motor sembrará de forma directa estas colecciones en la base de datos de desarrollo del cliente, asegurando que la primera vez que el cliente abra la app la encuentre completamente contextualizada.
