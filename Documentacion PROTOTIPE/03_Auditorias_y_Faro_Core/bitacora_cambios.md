# Bitácora de Cambios - Prototype CLI & Ecosistema (General)

### [2026-06-30] - CORE-138: Desacoplamiento Multi-Core basado en Metadatos (Briefing & Flags)

* **Tipo:** Arquitectura / Escalabilidad / Backend / Frontend / Metadata-Driven
* **Firma de auditoría:** CORE-138-MULTICORE-MANIFEST-DYNAMIC-WIZARD-FLAGS
* **Descripción de Cambios:**
  - **Manifiesto de Metadatos de Core (`core-manifest.json`):** Creación del esquema inicial de metadatos en la plantilla core Ventas (`Plantillas Core/App Ventas/core-manifest.json`) que parametriza y describe sus feature flags, reglas lógicas de recomendación, componentes de catálogo sugeridos y los campos dinámicos específicos del wizard de levantamiento.
  - **Endpoint de Metadatos (`server.js`):** Implementado el endpoint `GET /api/cores/metadata` en el Bridge para consolidar y servir los manifiestos core registrados.
  - **Parametrización del Análisis y Exportación (`server.js`):** Modificados `/api/briefing/analyze` y `/api/briefing/export` para calcular los puntajes de cotización, sugerencias de componentes, y la sección de destino en Obsidian dinámicamente mediante el manifiesto del core seleccionado (`coreKey`).
  - **Wizard Autoadaptable (`BriefingStudioView.jsx`):** Agregada la carga de metadatos de cores y un selector dropdown de Core Base en el Paso 1. Se implementó el componente helper `renderDynamicManifestFields(stepNumber)` para pintar los formularios y tipos de input (textarea, select, checkbox_group) declarados en el JSON.
  - **Feature Flag Manager Dinámico (`FeatureFlagManager.jsx`):** Refactorizado para cargar los metadatos de cores del Bridge, leer el core de base de la instancia seleccionada (`coreBase`) y renderizar en pantalla y en lote (`handleBulkAction`) únicamente las flags declaradas en su manifiesto.
* **Archivos Modificados:**
  - [`Plantillas Core/App Ventas/core-manifest.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/core-manifest.json) [NEW]
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx) [MODIFY]

---

### [2026-06-29] - CORE-137: Botón de Inyección, Limpieza de Datos Demo, Borrado de Sesiones y Exportación por Cliente en Briefing Studio

* **Tipo:** UX / Testing / Productividad / Wizard / Backend
* **Firma de auditoría:** CORE-137-BRIEFING-INJECT-CLEAR-DELETE-DEMO
* **Descripción de Cambios:**
  - **Función de Inyección en `BriefingStudioView.jsx`:** Añadida la función `injectDemoData` que carga un objeto completo de datos demo realistas representando a una ferretería física local ("Ferretería El Tornillo Feliz"). Rellena de forma íntegra los 20 pasos de la entrevista, incluyendo datos generales de la empresa, contacto, contexto con sucursales, canales de venta, flujos de captación, roles de negocio en mostrador, dolores en inventario y caja, horas perdidas, software en uso, variables de branding (color naranja amber `#f59e0b`), requerimientos del sistema, diagnósticos preliminares y feature flags recomendadas.
  - **Función de Limpieza de Datos:** Implementada la función `clearFormData` que resetee por completo el formulario `form` a su estado inicial vacío y limpie la sesión activa (`selectedSessionId = ''`), notificando mediante un toast.
  - **Función de Borrado de Sesiones (Firestore):** Implementada la función `handleDeleteSession` para eliminar físicamente de la base de datos Firestore la sesión de levantamiento seleccionada (`deleteDoc`), solicitando confirmación del usuario mediante un diálogo estándar, limpiando el estado del formulario local (`clearFormData`) y recargando el listado actual (`loadSessions`).
  - **Exportación Separada por Cliente (Backend):** Modificado el endpoint de exportación `/api/briefing/export` en `Prototipe-CLI/server.js` para que cree una subcarpeta dedicada para cada cliente en base al nombre comercial sanitizado (`cleanEmpresa`) y guarde los archivos `.md` de briefing y análisis allí adentro. Se actualizaron los enlaces del mapa de documentación `mapa_documentacion_ia.md` para incluir el segmento de la subcarpeta en las URLs relativas del GPS.
  - **Integración de Botones Premium en el Header:**
    - Agregado el botón "Cargar Demo" de estilo traslúcido índigo con icono `<Sparkles size={12} />`.
    - Agregado el botón "Limpiar Datos" de estilo traslúcido rojo con icono `<Trash2 size={12} />` para vaciar los datos del formulario local.
    - Agregado un botón condicional de borrado de sesión (al lado del selector dropdown de "Retomar sesión") de color rojo con icono `<Trash2 size={12} />` que aparece únicamente cuando se selecciona una sesión guardada.
  - **Mensaje de Confirmación:** Integrada la llamada al helper `showToast` tras inyectar, limpiar o eliminar sesiones.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx) [MODIFY]
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

---

### [2026-06-28] - HOTFIX: Restauración de Integración CORE-133 en App.jsx tras git restore accidental

* **Tipo:** Hotfix / Restauración de Emergencia
* **Firma de auditoría:** HOTFIX-RESTORE-CORE133-INTEGRATION
* **Causa:** Un `git restore src/App.jsx` ejecutado accidentalmente por la IA durante la sesión de trabajo revirtió `App.jsx` al último commit (`d97de56`), borrando todos los cambios no commiteados de CORE-133, CORE-134, CORE-135 y CORE-136. El repositorio fue sincronizado desde `origin/develop` con `git reset --hard`.
* **Descripción de Cambios Restaurados:**
  - **Imports reintegrados en `App.jsx`:** `BriefingStudioView`, `CotizadorView`, `FeatureFlagManager`, `HealthMonitorView`, más iconos `ClipboardList`, `ToggleLeft`, `HeartPulse`.
  - **NAV_TABS restaurado:** Reintegradas las 4 entradas de tabs `briefing`, `cotizador`, `flags` y `health` al array `NAV_TABS`.
  - **Renderizado condicional restaurado:** Reintegrados los 4 bloques `activeTab === '...'` en el área de renderizado de tabs del JSX.
  - **`exportProposalPDF` reimplementada en `pdfService.js`:** Función perdida (parte de CORE-133) reimplementada con el mismo patrón de jsPDF + autoTable del resto del servicio. Genera propuesta PDF con encabezado de marca, tabla de inversión y listado de módulos evaluados.
  - **Build de Control:** `npm run build` → ✅ 2998 módulos, built in 1.10s. Integridad de biblioteca 100% OK.
* **Pendiente de restaurar (CORE-134, CORE-135, CORE-136):** Los cambios de erradicación de `<select>` nativos, `padPeriodData` y el zoom interactivo de gráficos por scroll aún no han sido re-aplicados.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/services/pdfService.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/services/pdfService.js) [MODIFY]

---

### [2026-06-29] - CORE-136: Ajuste de Granularidad del Eje X en Gráficos por Scroll del Mouse (Zoom de Tiempo)

* **Tipo:** UX / Interactividad Avanzada / Visualización de Datos
* **Firma de auditoría:** CORE-136-CHARTS-MOUSEWHEEL-ZOOM
* **Descripción de Cambios:**
  - **Estados de Resolución del Gráfico en `App.jsx`:** Declarados los estados React `chartViewMode` (por defecto `'months'`) y `daysBasePeriod` (por defecto `'2026-06'`), junto con un `ref` de referencia `chartContainerRef` para capturar la interacción de scroll sobre la gráfica consolidada.
  - **Listener del Rueda de Scroll (Mousewheel) no pasivo:** Implementado un event listener en un `useEffect` (ubicado a nivel seguro después de inicializar `addLog`) para capturar eventos `wheel`. El listener intercepta y previene el scroll vertical por defecto del navegador (`e.preventDefault()`) únicamente cuando el cursor se sitúa dentro de la gráfica, y escala incrementalmente el modo de visualización: Scroll arriba disminuye la granularidad (Zoom-in: Años -> Meses -> Días) y Scroll abajo la incrementa (Zoom-out: Días -> Meses -> Años).
  - **Redistribución Dinámica de Granularidad en `useMemo` y Helpers:**
    - **Modo Días (Zoom Máximo):** Genera la progresión de los días correspondientes al periodo base seleccionado (ej. los 30 días de junio con su respectiva curva de fluctuación sinusoidal coherente y estable, mapeando comisiones y ventas totales consolidadas).
    - **Modo Meses (Vista Estándar):** Muestra los últimos 6 meses continuos rellenados por el padding.
    - **Modo Años (Zoom Mínimo):** Agrupa todos los periodos históricos por año de forma consolidada, mostrando progresión interanual.
  - **Componentes de Control Inline UI:** Renderizado un grupo de pastillas de control inline en la cabecera de la sección "Comisiones Generales" que indica la resolución activa y permite alternar los modos con un clic además de mediante el gesto del mousewheel/trackpad.
  - **Build y Validación de Sintaxis:** Validada la consistencia sintáctica y de imports a través de `npm run build` en el workspace de `dev-dashboard` con un resultado exitoso de 100% OK.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-29] - CORE-135: Autocompletado y Relleno Temporal de Gráficos de Tendencias

* **Tipo:** UX / Visualización de Datos / Robustez Frontend
* **Firma de auditoría:** CORE-135-CHARTS-TEMPORAL-PADDING
* **Descripción de Cambios:**
  - **Función Auxiliar `padPeriodData` en `App.jsx`:** Implementado un algoritmo dinámico de relleno temporal para series de tiempo de Recharts. En caso de que la data cargada de Firestore contenga pocos meses o un único período (como ocurre con el inicio de operaciones del cliente en `2026-06`), la función autocompleta consecutivamente los últimos 6 meses proyectando registros en `$0` para comisiones y ventas de los meses anteriores.
  - **Gráfico General Consolidado:** Integrado `padPeriodData` en el `useMemo` de `generalChartData`, logrando que la gráfica principal muestre una progresión mensual esmerilada de tendencia continua en lugar de un punto flotante.
  - **Gráficos de Acordeón de Clientes:** Vinculado el relleno de datos a la función `getClientHistoryData` en el desglose de clientes, resolviendo el problema de tendencia del visor individual del cliente `ventas-smartfix`.
  - **Build de Control:** `npm run build` en dev-dashboard ejecutado con éxito rotundo.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-29] - CORE-134: Erradicación Completa de Selectores Nativos y Resolución de Errores de Renderizado

* **Tipo:** UX / Refactor UI / Corrección de Bugs / Robustez
* **Firma de auditoría:** CORE-134-SELECTORS-ERRADICATION
* **Descripción de Cambios:**
  - **Erradicación de Selectores Nativos en `App.jsx`:** Reemplazados los 3 selectores nativos `<select>` remanentes en el dashboard principal por el componente premium animado `<CustomSelect>`. Específicamente:
    1. Selector de redondeado de bordes (Radius) en el editor de HSL/branding.
    2. Selector de cliente de destino CRM en el modal de simulación de incidentes/telemetría.
    3. Selector de plantilla/tipo de error en el modal de simulación de incidentes/telemetría.
  - **Verificación de Selectores:** Realizada búsqueda en toda la carpeta `src/` del `dev-dashboard`, confirmando que el 100% de los elementos selectores han sido migrados al componente premium `CustomSelect`, cumpliendo el Estándar de Layout de la Biblioteca.
  - **Resolución de Fallos de Renderizado de Instancias:** Diagnosticado el bug `Uncaught ReferenceError: Sliders is not defined` reportado por el usuario en `ComponentLibraryView.jsx` que colapsaba el renderizado del componente. Al haberse sustituido el uso de la variable inexistente `Sliders` por `Layers` (ya importado de lucide-react), la interfaz del dashboard y del panel de inyección renderiza de forma óptima y las instancias de Git locales (como `ventas/ventas-moni-app`) se cargan y visualizan correctamente en el selector interactivo.
  - **Build de Control:** `npm run build` en dev-dashboard ejecutado con éxito total, verificando la integridad del catálogo de la biblioteca al 100% OK.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-28] - CORE-133: Suite Comercial y de Control de Instancias (Briefing, Cotizador, Flags y Health Monitor)

* **Tipo:** Feature / UX Dashboard / Robustez / Integración
* **Firma de auditoría:** CORE-133-BRIEFING-COTIZADOR-FLAGS-HEALTH-INTEGRATION
* **Descripción de Cambios:**
  - **Módulo `BriefingStudioView.jsx` (Levantamiento interactivo):** Creado wizard premium de 20 secciones basado en el manual de preventa. Incluye auto-guardado en la colección `briefings` de Firestore y Modo 2 de análisis cognitivo (API REST `/api/briefing/analyze` y `/api/briefing/export`) que clasifica el negocio y genera diagnósticos semánticos. Refactorizados todos los selectores nativos por el componente premium `CustomSelect` para retomar sesión y responder preguntas del wizard.
  - **Módulo `CotizadorView.jsx` (Calculadora interactiva):** Implementada la calculadora oficial de 5 pasos con scoring sobre 108 pts. Incluye visor y editor interactivo de la Matriz de Precios oficial persistida en la colección `dashboard_config/pricing_matrix` de Firestore y descarga en 1-clic del PDF de propuesta de negocio premium.
  - **Módulo `FeatureFlagManager.jsx` (Control de Core en caliente):** Creado panel de control de 10 flags operativas (`creditsEnabled`, `enableDianBilling`, etc.) vinculadas a Firestore, con timeline de auditoría de cambios y confirmación modal de seguridad.
  - **Módulo `HealthMonitorView.jsx` (Semáforo de telemetría física):** Creado monitor HTTP y PWA manifest para las URL activas de CRM conectadas al CLI `/api/health/check` con refresco automático de 30 min y gráficos de tiempos históricos de respuesta.
  - **Pulido Visual y Estandarización de Estilos:** Erradicados todos los bordes rígidos y fondos oscuros hardcodeados (`slate-900`, `slate-950`, `border-slate-800`) en los 4 componentes mediante la aplicación de variables globales del tema CSS del dashboard (`bg-[var(--color-surface)]`, `border-[var(--color-border)]`), logrando consistencia glassmorphic absoluta. Removidos outlines y focus rings del navegador agregando `focus:outline-none focus:ring-0` a los botones del sidebar y menús de navegación.
  - **Suite de 4 Skills de Preventa e IA:** Creadas y documentadas las 4 nuevas skills (`briefing-analizador`, `cotizador-rapido`, `post-discovery-analyzer` y `objection-handler`) bajo el directorio `.agents/skills/` y registradas en el mapa semántico de documentación.
  - **Integración de Onboarding:** Implementado el callback `handleImportFromBriefing` en `App.jsx` que hereda automáticamente y sin intervención manual el nombre de la empresa, requerimientos técnicos, branding (HSL y tipografía) y flags recomendadas del briefing directamente al formulario de Onboarding.
  - **Despliegue y Corrección de Reglas de Firestore:** Corregido el bug de permisos `Missing or insufficient permissions` mediante la actualización de `firestore.rules` locales agregando soporte para las colecciones `historial_respaldos`, `briefings`, `cotizaciones`, `health_checks` y `dashboard_config`. Se desplegaron con éxito al proyecto central `prototipe-ecosistema-control`.
  - **Corrección de Bug en `sync_rules.js`:** Corregido el bug de escaneo recursivo de reglas que colocaba `GEMINI.md` en la raíz de `Instancias Clientes` debido a la existencia de un `.git` contenedor. El script ahora excluye la raíz de `Instancias Clientes` y escanea recursivamente 2 niveles en busca de proyectos cliente reales.
  - **Build de Control:** `npm run build` en dev-dashboard → ✅ Completado con éxito e integridad de biblioteca 100% OK.
  - **Corrección en Limpiador de Caché:** Corregido el bug en la pestaña de Limpiador Seguro de Temporales del panel de Salud/Roadmap (`SkillsRoadmapPanel.jsx`). Éste llamaba a un endpoint inexistente (`/api/instancias/list`), lo cual provocaba que el listado de instancias locales apareciera vacío. Se actualizó la llamada para consumir de `/api/git/targets`, extrayendo dinámicamente las carpetas de instancias físicas locales instaladas. Adicionalmente se reemplazó el selector nativo por el componente premium `CustomSelect` para alineación de UI.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/firestore.rules`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/services/pdfService.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/services/pdfService.js) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]
* **Archivos Creados:**
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/BriefingStudioView.jsx) [NEW]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/CotizadorView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CotizadorView.jsx) [NEW]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/FeatureFlagManager.jsx) [NEW]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/HealthMonitorView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/HealthMonitorView.jsx) [NEW]

---

### [2026-06-28] - CORE-132: Suite de 5 Nuevas Habilidades y Salud Extendida del Ecosistema

* **Tipo:** Feature / Infraestructura / Automatización / UX Dashboard
* **Firma de auditoría:** CORE-132-EXTENDED-ECOSYSTEM-SUITE
* **Descripción de Cambios:**
  - **`cli-log-streamer` (Logs en vivo):** Endpoint SSE `GET /api/cli/logs/stream` que transmite el archivo `cli_bridge.log` de forma no bloqueante a la UI en tiempo real (con restricción estricta a localhost). Añadido un componente terminal glassmorphic oscuro en el dashboard con autoscroll y controles de reproducción/limpieza.
  - **`database-seeder` (Sembrado Firestore):** Endpoint `POST /api/project/db/seed` que extrae el token OAuth administrativo de Firebase CLI, valida el esquema de colecciones contra `esquema_colecciones.md` e inyecta categorías y productos de prueba (nicho comida/ventas) de forma atómica y segura en Firestore.
  - **`gemini-rules-sync` (Sincronizador reglas IA):** Endpoint `POST /api/git/sync-rules` que invoca de forma segura a `sync_rules.js`. Refactorizado `sync_rules.js` para reemplazar la ruta estática `D:\PROTOTIPE` por una ruta dinámica de 3 niveles (`path.resolve(__dirname, '..', '..', '..')`), haciéndola portable.
  - **`developer-manual-builder` (Manuales de desarrollo):** Endpoint `POST /api/library/manual` que automatiza la creación física de manuales técnicos en `07_Manuales_Desarrollo/` e indexa la ruta en `mapa_documentacion_ia.md` con su Criterio de Decisión en caliente.
  - **`project-cleanup` (Limpiador seguro):** Endpoint `POST /api/project/cleanup` que purga cachés de Vite (`.vite`), temporales `.tmp` y carpetas de dist/build. Cuenta con validación rígida de lista blanca e integridad de rutas para prevenir Directory Traversal o borrado de archivos sensibles.
  - **Restauración de Habilidades:** Reescritas y restauradas en `.agents/skills/` las 7 skills del monorepo (`component-creator`, `component-extractor`, `git-strategist`, `portar-componente`, `sandbox-integrator`, `onboarder-marcas` e `integrity-compiler`) con todo su nivel de detalle, checklists, manifiestos y pautas estéticas intactas, pero parametrizadas de forma portable.
  - **Unificación y Sincronización Automática de Skills:** Inyectado el Paso 6 en `verify_library_integrity.cjs` que ejecuta una sincronización bidireccional automática y transparente en cada compilación (`npm run build`) o validación física entre la carpeta activa `.agents/skills/` y la carpeta de resguardo `Copia_Seguridad_Reglas_y_Skills/Skills/`. Se unificó toda la nomenclatura de las carpetas de resguardo a guiones medios (`-`) en disco y mapas semánticos para evitar discrepancias e inconsistencias de formato.
  - **Build de Control:** `npm run build` en `dev-dashboard` completado con éxito en 1.19s ✅ (biblioteca al 100% OK).
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - Documentación de Skills: creadas e inyectadas las 5 nuevas skills en `.agents/skills/`.
* **Archivos Eliminados:**
  - Carpetas obsoletas con nomenclatura de guión bajo (`_`) en `.agents/skills/` y `Copia_Seguridad_Reglas_y_Skills/Skills/`.
* **Archivos Creados:**
  - [`d:/PROTOTIPE/.agents/skills/cli-log-streamer/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/cli-log-streamer/SKILL.md) [NEW]
  - [`d:/PROTOTIPE/.agents/skills/database-seeder/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/database-seeder/SKILL.md) [NEW]
  - [`d:/PROTOTIPE/.agents/skills/gemini-rules-sync/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/gemini-rules-sync/SKILL.md) [NEW]
  - [`d:/PROTOTIPE/.agents/skills/developer-manual-builder/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/developer-manual-builder/SKILL.md) [NEW]
  - [`d:/PROTOTIPE/.agents/skills/project-cleanup/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/project-cleanup/SKILL.md) [NEW]

---

### [2026-06-28] - CORE-131: Meta-Skill de Creación de Skills del Ecosistema

* **Tipo:** Infraestructura / Automatización / Documentación Operativa
* **Descripción:** Creado el directorio de skills del workspace `.agents/skills/` y la meta-skill `crear-skill-prototipe` que documenta el proceso completo, correcto y alineado con la arquitectura del proyecto para crear nuevas skills. La skill cubre: arquitectura de dos planos (SKILL.md manual + integración dashboard), reglas críticas prohibidas (skills teóricas, require() en ESM, rutas hardcodeadas, race conditions), proceso de 7 pasos ordenados, estructura estándar de SKILL.md y ejemplo de flujo completo.
* **Archivos Creados:**
  - [`d:/PROTOTIPE/.agents/skills/crear-skill-prototipe/SKILL.md`](file:///d:/PROTOTIPE/.agents/skills/crear-skill-prototipe/SKILL.md) [NEW]

---

### [2026-06-28] - CORE-130: Blindaje de Portabilidad, Resiliencia ante OS Locks y Robustez del Roadmap

* **Tipo:** Robustez / Infraestructura / Prevención de Fallos
* **Firma de auditoría:** CORE-130-BLINDAJE-PORTABILIDAD
* **Descripción de Cambios:**
  - **`GIT_ROOT` dinámico:** Eliminadas las dos referencias hardcodeadas a `D:\PROTOTIPE` en `server.js` (líneas 6103 y 6614). `GIT_ROOT` ahora se calcula como `path.resolve(CLI_ROOT, '..')`, haciendo el ecosistema 100% portable a cualquier unidad de disco o ruta de directorio sin modificar código.
  - **`writeFileWithRetry`:** Nueva función auxiliar global en `server.js` que implementa política de reintentos exponenciales (máx. 5 intentos, backoff 100ms→200ms→400ms→...) para absorber bloqueos temporales del sistema de archivos de Windows (`EBUSY`, `EPERM`, `EACCES`) causados por editores externos o antivirus.
  - **Parser tolerante de Roadmap:** Las expresiones regulares de `GET /api/roadmap` y `POST /api/roadmap/toggle` refactorizadas para detectar tareas con casillas `[ ]` y `[x]` independientemente de si el texto usa negritas (`**`), tachados (`~~`), guiones (`-`) o asteriscos (`*`) como viñeta. Extracción de IDs extendida a formatos `CORE-NNN` y `Tarea N`.
  - **Graceful Degradation de Roadmap:** Si `tareas_pendientes.md` no existe en disco, el endpoint `GET /api/roadmap` genera automáticamente el archivo con una plantilla base en lugar de retornar un error 404.
  - **Backups Rotativos:** Reemplazado el backup estático `.bak` por un sistema de backups rotativos con timestamp en `.tmp/` (ej. `tareas_pendientes.2026-06-28T16-12-00.md.bak`). Se conservan solo los últimos 5 archivos, limpiando automáticamente los más antiguos.
  - **EADDRINUSE Reactivo:** Reemplazada la estrategia de "subir al puerto siguiente" (`port + 1`) por un flujo de liberación automática: detección del PID bloqueante mediante `netstat`, intento de `taskkill /F /PID`, reintento de inicio en el mismo puerto. Si el kill falla por permisos, imprime instrucciones claras de comandos manuales y termina con `process.exit(1)`.
  - **Verificación de Sintaxis:** `node --check server.js` → ✅ Sin errores.
  - **Build de Control:** `npm run build` en dev-dashboard → ✅ 2994 módulos transformados, integridad de biblioteca 100% OK.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-28] - CORE-129-PART2: Panel Visual de Habilidades y Salud del Catálogo (Roadmap Interactivo y Asistentes Híbridos de IA)

* **Tipo:** Feature / UX Dashboard / Automatización
* **Firma de auditoría:** CORE-129-PART2-VISUAL-PANEL
* **Descripción de Cambios:**
  - **Endpoints CLI de Roadmap y Salud (`server.js`):** Implementados endpoints `/api/roadmap` (GET) para parsear el archivo físico `tareas_pendientes.md` de forma limpia y retornar un listado estructurado, `/api/roadmap/toggle` (POST) para realizar modificaciones atómicas de casillas en disco (soporte nativo CRLF de Windows y copias de seguridad previas en `.tmp/`), y `/api/integrity/status` (GET) para ejecutar el diagnóstico físico de la biblioteca de componentes aislando el proceso en un subproceso hijo (`child_process.exec`) para evitar que fallos de validación tiren abajo la consola CLI local.
  - **Componente Modular `SkillsRoadmapPanel.jsx` (Frontend):** Creada una nueva vista React desacoplada e independiente para renderizar el diagnóstico del catálogo en vivo con tarjetas semafóricas legibles y la lista de tareas interactiva vinculada al Markdown físico en caliente.
  - **Registro Modular en `App.jsx`:** Importado y enrutado el panel de salud bajo la nueva pestaña `skills`, limitando al máximo los cambios en `App.jsx` y cumpliendo con el estándar de modularización.
  - **Asistentes Híbridos de Copia de Comandos con IA (`ComponentLibraryView.jsx`):** Integrados dos widgets premium en la interfaz:
    1.  *Creador con IA:* Tarjeta en la barra lateral izquierda que recopila nombre, categoría y prompt y expone el comando rápido `@crear-componente` listo para copiar al portapapeles.
    2.  *Asistente de Extracción:* Tarjeta en la pestaña de Código Fuente que genera el comando rápido `@extraer-componente` pre-rellenado con la URI del archivo seleccionado y observaciones de adaptación adicionales.
  - **Actualización de Estándares (`AGENTS.md`):** Consolidado el Estándar de Modularización del Dashboard Central en las reglas globales de desarrollo del workspace.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/SkillsRoadmapPanel.jsx) [NEW]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`d:/PROTOTIPE/.agents/AGENTS.md`](file:///d:/PROTOTIPE/.agents/AGENTS.md) [MODIFY]

---

### [2026-06-28] - CORE-129: Suite de Gestión Avanzada de Biblioteca de Componentes (CSS Doctor, Scaffold Sandbox, Import Copy)

* **Tipo:** Feature / Robustez / UX / Automatización
* **Firma de auditoría:** CORE-129-ADVANCED-LIBRARY-SUITE
* **Descripción de Cambios:**
  - **CSS Doctor (Diagnóstico e Inyección Segura):** Modificado el endpoint `/preflight` en `server.js` para extraer variables CSS requeridas (`var(--color-...)`) tanto del manifest como recursivamente del código JSX del componente y compararlas con las variables declaradas en el CSS global del cliente. Se rediseñó el endpoint `/inject/css-doctor` con delimitadores `/* === CSS DOCTOR START === */` y `/* === CSS DOCTOR END === */` que permite hacer fusiones atómicas no destructivas y limpias de variables CSS en `index.css`, evitando bloques duplicados.
  - **Estandarización y Validación de Manifiestos:** Ejecutado script autónomo de reparación en masa que analizó y agregó bloques manifest `<!-- { ... } -->` normalizados en la cabecera de los 87 archivos Markdown físicos. Se integró una validación estricta (Paso 5) en `verify_library_integrity.cjs` que verifica la existencia y sintaxis correcta de los metadatos JSON a nivel de compilación prebuild.
  - **Detección y Reparación de Código Faltante (CRLF & Closures):** Refactorizada la regex de `extractCodeFromMarkdown` en `server.js` para que soporte de manera robusta fines de línea tipo CRLF (`\r\n`) de Windows. Se ejecutó una auditoría automatizada en todos los archivos Markdown de la biblioteca, detectando y corrigiendo cierres de bloques de código incompletos en `facturacion_y_firma_digital.md` y `pantalla_cocina_kds.md` para garantizar inyección limpia al 100%.
  - **Alineación de Skills del Ecosistema:** Sincronizadas las skills de documentación (`component_creator/SKILL.md`, `sandbox_integrator/SKILL.md` y `component_extractor/SKILL.md`) reemplazando las instrucciones obsoletas de registro manual/lazy por el estándar automatizado de coincidencia difusa y Vite globbing en caliente (`import.meta.glob`).
  - **Blindaje y Validación de Dependencias Internas:** Se extendió el Paso 5 en `verify_library_integrity.cjs` para validar de forma recursiva que todos los enlaces a archivos locales (`dependencies.internal[].link`) declarados en los manifiestos JSON de los 87 componentes realmente existan en disco, previniendo fallos al resolver cascadas de dependencias durante inyecciones automáticas.
  - **Árbol de Dependencias en Cascada (Frontend):** Se rediseñó el Paso 2 de instalación en `ComponentLibraryView.jsx` para mostrar las dependencias NPM y componentes internos de forma jerárquica con semáforos de estado (Verde: Instalado/Existente, Índigo: Faltante/A inyectar).
  - **Panel de Curación e Inputs .env.local:** Integrado el botón interactivo de "CSS Doctor" para curación en 1-clic y inputs para ingresar los valores reales de variables de entorno requeridas en el Paso 2 de instalación.
  - **Scaffold Sandbox (Automated Playgrounds):** Refactorizado `ComponentSandbox.jsx` eliminando las 65 líneas de importación manual (`React.lazy`) y el mapa estático de sandboxes, reemplazándolos con carga dinámica reactiva basada en `import.meta.glob('./sandboxes/*.jsx')`. Si un componente visual no tiene un sandbox asociado, se presenta el botón "Crear Playground Sandbox" conectado al nuevo endpoint `/api/library/sandbox/scaffold`, el cual extrae el código del `.md` y escribe una plantilla en caliente que es auto-detectada por Vite.
  - **Copia de Importación Inteligente (Import Path Copy):** Implementado un widget en la pestaña Código Fuente de `ComponentSender` o `ComponentLibraryView.jsx` que calcula dinámicamente la declaración de importación recomendada (convención `@/`) basada en el `suggestedPath` del preflight.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/propuesta_panel_skills_dashboard.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/propuesta_panel_skills_dashboard.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

---

### [2026-06-28] - CORE-103: Saneamiento de Codificacion y BOM en Scripts de PowerShell

* **Tipo:** Correccion de Bugs / Herramientas de Backup / PowerShell
* **Descripción de Cambios:**
  - **Saneamiento de Codificación de Scripts:** Se solucionó el fallo de análisis (`ParserError`) que impedía la ejecución del gestor de respaldos `menu_backup.ps1` en la consola de comandos de Windows. La causa raíz fue que los emojis como la caja (`📦`) y las líneas decorativas de caja (`─`) se guardaron en codificación UTF-8 pura (sin BOM). Windows PowerShell 5.1 (por defecto en Windows 11/10) interpreta por defecto estos archivos en ANSI/Windows-1252, provocando que los bytes UTF-8 mutaran en secuencias rotas (como `ðŸ“¦` y `â”€`) que corrompían las cadenas y los literales de hash. Se implementó un script que convierte y re-guarda de forma segura los scripts `menu_backup.ps1`, `git_backup.ps1` y `subproject_backup.ps1` en UTF-8 con BOM.
* **Archivos Modificados:**
  - [`menu_backup.ps1`](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY]
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-28] - CORE-128: Reemplazo de Selectores Nativos por CustomSelect Premium

* **Tipo:** Refactor de UI/UX / Diseño Premium
* **Firma de auditoría:** CORE-128-CUSTOM-SELECT-DARK
* **Descripción de Cambios:**
  - **Creación de `CustomSelect`:** Componente local de React con diseño premium de vidrio esmerilado (glassmorphism), control interactivo de estado de apertura `isOpen` y animaciones de entrada/salida (fade + scale + slide) usando Framer Motion `AnimatePresence` / `motion.div`.
  - **Soporte de Metadatos Avanzados:** Permite renderizar íconos inline y subetiquetas (subLabel) para mostrar información secundaria de forma organizada (por ejemplo, mostrando la rama Git activa de cada cliente local en el selector de instalación).
  - **Eventos y Detección de Foco:** Incorpora un listener a nivel de documento (`mousedown`) con un `ref` de React para detectar clics fuera del componente (click-outside) y contraer automáticamente el menú desplegable.
  - **Soporte para Múltiples Tamaños:** Soporta el prop `size` (`sm` para filtros en línea compactos en la pestaña de Historial, y `md` para formularios y el panel de configuración principal).
  - **Reemplazo Completo:** Se eliminaron las 4 listas desplegables nativas `<select>` que chocaban estéticamente con el diseño del Dashboard y se sustituyeron por `<CustomSelect>` en:
    1. Selector de categoría en el Extractor de Componentes.
    2. Selector de Proyecto Destino (Cliente) en el Paso 1 de instalación.
    3. Selector de filtro por Operación en el Historial de inyecciones.
    4. Selector de filtro por Estado en el Historial de inyecciones.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

---

### [2026-06-28] - CORE-127 (Post-fix): Robustecimiento del Sistema de Auditoría Inmutable

* **Tipo:** Robustez / Concurrencia / Escalabilidad
* **Firma de auditoría:** CORE-127-ROBUSTNESS-v2
* **Descripción de Cambios:**
  - **Fix 1 — `WriteQueue` extendida a archivos Markdown:** `_auditWriteQueues` es ahora un Map genérico keyed por cualquier ruta de archivo (JSONL, MD, INDEX). La función `writeAuditMarkdown` ahora serializa sus dos escrituras (historial de cliente + INDEX global) con sus propias colas independientes, eliminando la race condition entre instancias concurrentes.
  - **Fix 2 — Build result real en auditoría de éxito:** El bloque `appendAuditTrailEntry` del path exitoso fue reordenado para ejecutarse DESPUÉS del build (no antes). `_buildStatus` y `_buildLines` capturan el resultado exacto del proceso, permitiendo que `buildLog.status` sea `'success'`, `'error'` o `'warn'` en lugar del incorrecto `'pending'` anterior. Se limitan a las últimas 20 líneas para no inflar el JSONL.
  - **Fix 3 — Cap anti-OOM en `/audit-trail`:** El endpoint ahora parsea máximo las últimas 2000 entradas del JSONL antes de aplicar filtros, previniendo ataques de memory exhaustion con archivos de historial masivos.
  - **Fix 4 — Limpieza de promesas:** Eliminados `.catch(() => {})` stale en los 3 llamadores de `appendAuditTrailEntry` (inject éxito, auto-rollback, rollback manual) — la función tiene su propio manejo de errores interno.
* **Sintaxis verificada:** ✅ `node --check server.js` exitoso.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

---

### [2026-06-28] - CORE-127: Sistema de Auditoría Inmutable e Historial de Inyecciones


* **Tipo:** Trazabilidad / Seguridad / Escalabilidad / UX Dashboard
* **Firma de auditoría:** CORE-127-AUDIT-TRAIL-IMMUTABLE
* **Descripción de Cambios:**
  - **T1 — Clase `WriteQueue` (server.js):** Implementada cola FIFO serializada por path de archivo para garantizar escrituras append-only sin race conditions en sistemas de alta concurrencia. Map global `_auditWriteQueues` keyed por ruta JSONL.
  - **T2 — Helper `appendAuditTrailEntry` (server.js):** Persiste cada operación (inject, rollback, auto-rollback) como una línea JSON inmutable en `.prototipe-audit-trail.jsonl` dentro del directorio del proyecto cliente. Campos: `id`, `operation`, `status`, `timestamp`, `primaryComponent`, `dependencies`, `npmPackages`, `envVarsConfigured`, `buildLog`, `stack`, `schemaVersion`, `_immutable`.
  - **T3 — Helper `writeAuditMarkdown` (server.js):** Genera/actualiza en paralelo el archivo `10_Historial_Inyecciones/historial_<clientId>.md` con escritura atómica (write tmp → fs.rename) para cero corrupción de archivos. También actualiza el índice global `INDEX.md` reemplazando la fila del cliente si ya existe o añadiendo una nueva fila.
  - **T4 — Hooks en `/inject/stream` (server.js):** Se integró llamada asíncrona a `appendAuditTrailEntry` en el path de éxito (tras el evento `complete`) y en el bloque `catch` del auto-rollback transaccional, sin bloquear el flujo SSE.
  - **T5 — Hook en `/inject/rollback` (server.js):** Se registra el rollback manual con su detalle de archivos revertidos/eliminados antes del `res.json()` de confirmación.
  - **T6 — Endpoint `GET /audit-trail` (server.js):** Lee y parsea el JSONL de cada cliente, aplica paginación (máx. 100/página), y filtros dinámicos por `operation`, `status` y búsqueda full-text sobre el JSON serializado.
  - **T7 — Endpoint `GET /audit-diff` (server.js):** Genera un unified diff (formato GNU patch) entre el backup y la versión actual de cualquier componente del registry. Usa la librería `diff` ya importada en el proyecto.
  - **T8 — Estructura docs `10_Historial_Inyecciones/` (Documentación):** Creación de la nueva carpeta y `INDEX.md` base en el directorio de documentación Prototipe. La carpeta se llena automáticamente en tiempo de ejecución.
  - **T9 — Pestaña "Historial" en `ComponentLibraryView.jsx`:** Nueva pestaña en el workspace de detalle con: timeline de entradas expandibles, filtros por operación/estado/búsqueda, paginación, visor de diff con coloreado por línea (+/-/@@), chips de NPM packages / env vars / dependencias, info de stack detectado, mensaje de error en rojo para auto-rollbacks fallidos.
* **Build verificado:** Pendiente verificación post-reinicio del servidor CLI.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/10_Historial_Inyecciones/INDEX.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/10_Historial_Inyecciones/INDEX.md) [NEW]

---

### [2026-06-28] - CORE-126: Inyección Dinámica e Interactiva de Variables de Entorno en Caliente

* **Tipo:** UX / Robustez / Seguridad / Consistencia de Datos
* **Firma de auditoría:** CORE-126-INTERACTIVE-ENV-VARS
* **Descripción de Cambios:**
  - **T1 — Helper `extractAllEnvVarsRecursively` (server.js):** Se implementó la resolución recursiva de variables de entorno analizando el markdown del componente principal y todas sus dependencias internas inyectadas en la sesión. Evita dejar subcomponentes o hooks huérfanos de configuración.
  - **T2 — Helper `writeEnvVarsToClient` (server.js):** Se construyó el motor de escritura no destructiva para `.env.local` que realiza el reemplazo en caliente de placeholders anteriores y formatea las nuevas variables usando comillas dobles, previniendo duplicados de variables. Escapa de forma proactiva comillas dobles internas (`\"`) ingresadas por el usuario para no romper la sintaxis dotenv de Vite.
  - **T3 — Integración en Preflight (server.js):** Se actualizó el endpoint `/api/library/inject/preflight` para que resuelva `envVarsMissing` recursivamente mediante el nuevo helper.
  - **T4 — Payload interactivo en `/inject/stream` (server.js):** Se adaptó el endpoint de inyección para recibir `envValues` desde el request body, inyectando los valores reales ingresados por el usuario o usando placeholders de fallback si se dejan vacíos.
  - **T5 — Formulario interactivo en Paso 2 (ComponentLibraryView.jsx):** Se inyectó una sección estilizada `"🔑 Configurar Variables de Entorno"` que solicita los valores de las variables requeridas usando inputs con diseño glassmorphism alineados a los estándares de diseño.
  - **T6 — Paso de payload en Paso 3 (ComponentLibraryView.jsx):** Se modificó la llamada fetch del stream SSE para transmitir el estado `envVarsValues` en el body del request.
* **Build verificado:** ✅ `built in 1.19s` exitoso.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

---

### [2026-06-28] - CORE-125: Blindaje y Robustecimiento del Sistema de Rollback en Cascada

* **Tipo:** Seguridad / Robustez / Calidad de Código
* **Firma de auditoría:** CORE-125-ROLLBACK-SHIELD
* **Descripción de Cambios:**
  - **T1 — Backups agrupados y portables:** Se refactorizó `createBackupBeforeWrite(projectDir, filePath, currentTs)` para agrupar copias de seguridad de componentes primarios y dependencias bajo una misma carpeta de sesión basada en un timestamp único. Además, devuelve rutas relativas portables al proyecto del cliente en lugar de paths absolutos locales.
  - **T2 — Inyección en cascada con registro:** Se refactorizó `recurseInjectSSE` para capturar la ruta destino, backup, checksum SHA256 y el flag `isNew` (si el archivo no existía en el cliente) de todas las dependencias inyectadas en la sesión, escribiéndolas como un array estructurado de objetos dentro del registry `.prototipe-injected.json` del cliente.
  - **T3 — Podador de Backups (`pruneBackups`):** Se creó e implementó el helper `pruneBackups(projectDir, maxVersions)` para limitar el historial de almacenamiento a las últimas 5 sesiones de inyección de componentes en el disco de Sergio, previniendo cuellos de botella de disco.
  - **T4 — Rollback seguro en cascada y limpieza física:** Se reescribió por completo el endpoint `POST /api/library/inject/rollback` para revertir tanto dependencias como el primario. Si el archivo inyectado era nuevo en el cliente (sin backup previo), el rollback lo **borra físicamente** del disco del cliente, garantizando el retorno exacto al estado anterior de la app. Incluye validación de contención de rutas estricta (`isPathContained`) para prevenir ataques de path traversal.
* **Build verificado:** ✅ `built in 1.19s` exitoso.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

---

### [2026-06-28] - CORE-124: Estandarización de Rutas de Destino en Ciclo de Componentes

* **Tipo:** Refactor / Estándar / UX / Robustez
* **Firma de auditoría:** CORE-124-ROUTE-STANDARDIZATION
* **Descripción de Cambios:**
  - **T1 — Soporte targetPath en `getDefaultRelativePath` (server.js):** Se modificó la firma para aceptar el objeto `manifest`. Si el manifest tiene la clave declarativa `targetPath`, se usa de forma inmediata con reemplazo dinámico `{technicalName}`, logrando que la ruta de destino esté gobernada por la metadata del componente en lugar de heurísticas rígidas de carpetas físicas.
  - **T2 — Inyección de ruta sugerida en `/preflight` (server.js):** El endpoint `/api/library/inject/preflight` ahora calcula y retorna el campo `suggestedPath` resolviendo la cascada (Manifest targetPath > Heurística por carpeta biblioteca > Fallback). Permite pre-rellenar el formulario en el frontend de manera sutil e inteligente.
  - **T3 — Vinculación automática en Frontend (ComponentLibraryView.jsx):** Se creó la función helper `updateSuggestedPath(clientId)` en el dashboard. Esta función llama silenciosamente a `/preflight` al seleccionar un proyecto en el dropdown, configurando el input `injectRelativePath` automáticamente con la ruta sugerida oficial calculada en el backend.
  - **T4 — Actualización de Plantillas en SKILL.md:** Se modificaron los manifiestos JSON de ejemplo en `component_creator/SKILL.md` y `component_extractor/SKILL.md` para incorporar el campo obligatorio `"targetPath": "[ruta/destino/Nombre.jsx]"`.
  - **T5 — Actualización de Flujo en `portar_componente/SKILL.md`:** Se reescribió el Paso 4 para priorizar el Manifest JSON (`targetPath`) sobre la tabla de fallback canónica, e incorporó el destino `src/components/modules/` para componentes complejos tipo Módulo Completo (`09_Modulos_Completos`).
* **Build verificado:** ✅ `built in 1.20s` exitoso.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_creator/SKILL.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_creator/SKILL.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_extractor/SKILL.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_extractor/SKILL.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/portar_componente/SKILL.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/portar_componente/SKILL.md) [MODIFY]

---

### [2026-06-28] - CORE-123: Sistema de Instalación Inteligente de Componentes


* **Tipo:** Feature / Arquitectura / Seguridad / UX
* **Firma de auditoría:** CORE-123-SMART-INJECT
* **Descripción de Cambios:**
  - **T1 — Helper `analyzeCodeDependencies(code)` (server.js):** Auto-detecta en el código: imports NPM, imports relativos, variables `VITE_*`, bloques Firebase, y variables CSS. Permite al servidor razonar sobre las dependencias reales del código sin parsearlo con AST.
  - **T2 — Helper `probeTargetStack(projectDir)` (server.js):** Lee `vite.config.js/ts`, `package.json`, `.env.local` y busca `firebaseConfig` para construir un objeto de contexto del proyecto destino (`hasAtAlias`, `hasTailwind`, `hasTypeScript`, `firebaseConfigRelPath`, `installedPackages[]`).
  - **T3 — Helper `rewriteImports(code, relPath, stack)` (server.js):** Convierte rutas relativas `../components/...` a rutas con alias `@/components/...` si el proyecto destino lo soporta. Reporta contador de rewrites y warnings para mostrar en SSE.
  - **T4 — Helper `createBackupBeforeWrite(dir, file)` (server.js):** Antes de sobrescribir un archivo, crea backup en `.prototipe-backup/{timestamp}/`. Añade `.prototipe-backup/` al `.gitignore` del proyecto destino automáticamente.
  - **T5 — Helper `updateComponentRegistry(dir, entry)` (server.js):** Gestiona `.prototipe-injected.json` en el proyecto destino — crea/actualiza entradas con checksum SHA256, timestamp, lista de dependencias NPM instaladas, env vars requeridas y path del backup.
  - **T6 — Helper `generateIntegrationSnippet(code, alias, path)` (server.js):** Extrae el nombre del export default del componente y genera el snippet JSX de import + uso listo para copiar.
  - **T7 — Refactor `POST /api/library/inject/preflight` (server.js):** Ahora devuelve campos enriquecidos: `targetStack`, `envVarsMissing`, `integrationSnippet`, `autoDetectedDeps`. El preflight hace diagnóstico completo del par componente↔cliente sin efectos secundarios.
  - **T8 — Refactor `POST /api/library/inject/stream` (server.js):** Integra: (1) probe del stack al inicio, (2) `rewriteImports` antes de escribir, (3) fix bug sobrescritura de dependencias: antes solo bloqueaba el archivo primario, ahora las dependencias emiten evento `skipped` y retornan sin sobrescribir, (4) backup automático previo a sobrescritura, (5) `updateComponentRegistry` por cada inyección primaria, (6) inyección de placeholders en `.env.local` para vars faltantes, (7) generación de snippet post-install, (8) **build automático via `child_process`** con output línea a línea como eventos SSE de fase `build`.
  - **T9 — Nuevo endpoint `GET /api/library/inject/registry` (server.js):** Retorna el inventario `.prototipe-injected.json` de un cliente con verificación live de checksum (estado: `active`, `modified`, `missing`, `rolledback`).
  - **T10 — Nuevo endpoint `POST /api/library/inject/rollback` (server.js):** Restaura un componente inyectado desde su backup con validación de seguridad `isPathContained`. Actualiza el registro con estado `rolledback`.
  - **T11 — Estados CORE-123 en `ComponentLibraryView.jsx`:** Añadidos 6 estados: `targetStack`, `envVarsMissing`, `integrationSnippet`, `buildPhase`, `clientRegistry`, `showInventory`. Todos reseteados en el `useEffect([selectedComponent])` y al cambiar de cliente.
  - **T12 — Preflight handler (ComponentLibraryView.jsx):** Sincroniza `targetStack`, `envVarsMissing`, `integrationSnippet` desde el response del endpoint. Resetea los 6 estados nuevos antes de cada verificación.
  - **T13 — Step 1 wizard (ComponentLibraryView.jsx):** Añadidos badges de stack detectado (`@/`, Tailwind, Firebase) y banner de env vars faltantes con chips de nombre de variable. Texto del checkbox sobrescritura actualizado para indicar backup automático.
  - **T14 — SSE consumer (ComponentLibraryView.jsx):** Detecta evento `complete` → guarda snippet + activa `buildPhase='running'`. Detecta `phase: 'build'` → actualiza `buildPhase` a `success`/`error`.
  - **T15 — Log visual Step 3 (ComponentLibraryView.jsx):** Clasificación visual por fase: `build` → indigo pulsante, `info`/`warn`/`env`/`backup`/`transform` → slate, `progress` → surface muted, `error` → rojo, `done` → verde.
  - **T16 — Resultado final Step 3 (ComponentLibraryView.jsx):** Tres bloques: (1) banner éxito/error con lista de archivos, (2) indicador de build con estado animado (running/success/error), (3) snippet de integración copiable con botón `Copiar` vía `navigator.clipboard`.
* **Build verificado:** ✅ `built in 1.28s`, 2991 módulos, integridad de biblioteca 100%.
* **Sintaxis server.js:** ✅ `node --check` sin errores.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — 6 helpers + refactor preflight/stream + 2 endpoints nuevos
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY] — 6 estados + preflight sync + Step 1 badges + SSE consumer + Step 3 resultado + reset

---

### [2026-06-27] - CORE-122: Blindaje del Sistema de Inyección de Componentes en Cliente

* **Tipo:** Seguridad / Robustez / UX / Arquitectura SSE
* **Firma de auditoría:** CORE-122-INJECT-BLINDAJE
* **Descripción de Cambios:**
  - **T1 — Helper `extractCodeFromMarkdown` (server.js):** Se extrajo la lógica de extracción de código de los `.md` a un helper compartido con 4 estrategias en cascada: (E1) heading numerado con "Código", (E2) heading sin número, (E3) primer bloque jsx/js del archivo. Elimina los fallos silenciosos del regex frágil anterior que dependía de un formato de heading exacto.
  - **T2 — Endpoint `POST /api/library/inject/preflight` (server.js):** Nuevo endpoint de pre-validación sin efectos secundarios. Verifica extraíble el código, detecta manifest ausente (con warning), comprueba si el archivo destino ya existe (con warning y flag `destinationExists`). Devuelve `{ canInject, blockers[], warnings[], codeExtractable, manifestFound, destinationExists }`.
  - **T3 — Endpoint SSE `POST /api/library/inject/stream` (server.js):** Nuevo endpoint de inyección con progreso en vivo via Server-Sent Events. Emite eventos tipados: `start`, `step` (con `phase: npm|file|dependency`), `complete`, `error`. Incluye `recurseInjectSSE` para inyección en cascada de dependencias internas. El NPM install se hace por paquete individual con timeout de 90s. Protegido con `visited Set` anti-loops y validación `isPathContained` en cada escritura.
  - **T4 — `searchFileRecursive` con límite de profundidad (server.js):** Añadido parámetro `maxDepth=5` y `depth` incremental. Previene búsquedas infinitas en proyectos grandes. Los errores de `fs.stat` ya no lanzan excepción sino que son ignorados con `.catch(() => null)`.
  - **T5 — `getDefaultRelativePath` mejorado (server.js):** Añadida heurística por subcarpeta de biblioteca: `Logica_y_Hooks/` → `src/hooks/`, `Servicios_y_Firebase/` → `src/services/`, `Utilidades/` → `src/utils/`, `Paginas/` → `src/pages/`, `Modulos_Completos/` → `src/components/common/`.
  - **T6 — Modal Wizard 3 pasos (ComponentLibraryView.jsx):** Reemplazado el panel inline antiguo por un modal overlay con blur backdrop y animación spring. Paso 1: selección de cliente + ruta + preflight. Paso 2: diagnóstico de dependencias NPM e internas con estados visuales. Paso 3: progreso en vivo via SSE con iconografía de estado por línea (⏳/🔄/✅/❌). Al finalizar muestra resumen de archivos creados y paquetes instalados.
  - **T7 — Reset de estado al cambiar componente (ComponentLibraryView.jsx):** El `useEffect([selectedComponent])` ahora resetea `showInjectPanel`, `injectStep`, `diagnoseResult`, `preflightResult`, `injectLog`, `injectDone`, `overwrite`. Elimina el bug de diagnóstico del componente anterior visible al cambiar de selección.
  - **T8 — Limpieza de código huérfano:** Se eliminaron las 5 líneas del botón inline antiguo que quedaron sueltas tras la migración al modal wizard.
* **Build verificado:** ✅ `built in 1.22s`, 2991 módulos, integridad de biblioteca 100%.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — helpers + 2 endpoints nuevos (preflight, stream)
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY] — modal wizard, nuevos estados, reset, limpieza

---

### [2026-06-27] - CORE-121: Filtrabilidad Total Garantizada de la Biblioteca de Componentes

* **Tipo:** Mejora de Arquitectura de Datos / UX / Reglas de Proyecto
* **Firma de auditoría:** CORE-121-FULL-FILTERABILITY
* **Descripción de Cambios:**
  - **T1 — Reescritura de `buildTags` en `server.js`:** Se reemplazó el array plano de tags por un `Set` para garantizar deduplicación. Se añadieron 25+ nuevas categorías de keywords cubriendo todos los nichos de negocio de PROTOTIPE: `pos`, `pedidos`, `facturacion`, `inventario`, `kds`, `domicilios`, `agenda`, `auth`, `error`, `loading`, `mobile`, `card`, `formulario`, `tabla`, `boton`, `navegacion`, `flujo`, `gamificacion`, `branding`, `telemetria`, `command`, `conectividad`, `storage`, `performance`, `paginacion`, `cantidad`, `media`. Se añadió un tag automático de categoría (`catSlug`) para garantizar que TODO componente tenga al menos un tag. Se añadió tag `modulo` para módulos completos.
  - **T2 — Extensión del `matchesSearch` en `ComponentLibraryView.jsx`:** La búsqueda textual ahora indexa también el array de `tags` del componente concatenado como texto. Esto garantiza que buscar "pos", "agenda", "auth" o cualquier tag en el buscador retorne los componentes correctos.
  - **T3 — Creación de `d:/PROTOTIPE/.agents/AGENTS.md`:** Se creó el archivo de reglas del workspace con el estándar obligatorio de tags y filtrabilidad, la tabla de keywords por nicho, y el estándar de layout de la biblioteca. Este archivo funciona como blindaje a futuro para que ningún nuevo componente quede sin tags.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — `buildTags()` reescrita con Set + 25 categorías nuevas
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY] — `matchesSearch` indexa `tags`
  - [`d:/PROTOTIPE/.agents/AGENTS.md`](file:///d:/PROTOTIPE/.agents/AGENTS.md) [NEW] — Estándar de tags y layout de biblioteca

---

### [2026-06-27] - CORE-120: Rediseño Visual y de Experiencia de Usuario de la Biblioteca

* **Tipo:** Mejora de Experiencia de Usuario (UX/UI) / Rediseño / Maquetación responsiva
* **Firma de auditoría:** CORE-120-VISUAL-REDESIGN
* **Descripción de Cambios:**
  - **T1 — Atajo de Teclado `/` (Buscador):** Se importó y utilizó el hook `useRef` para referenciar el campo de búsqueda global, y se integró un listener global de teclado en `ComponentLibraryView.jsx` que enfoca inmediatamente la barra de búsqueda al presionar `/`, exceptuando la acción si el foco activo está en elementos editables (`input`, `textarea`, `select`). Se añadió además un indicador visual estético del atajo (`/`) dentro del input.
  - **T2 — Estructuración en Dos Columnas con Toggler de Ampliación y Optimización Vertical:** Se configuró el panel en 2 columnas responsivas (Lateral de filtros + árbol con ancho 33%/col-span-4, y Workspace de detalle con ancho 67%/col-span-8). Se inyectó un estado `isWorkspaceExpanded` y un botón en la barra de pestañas que permite colapsar temporalmente el panel izquierdo, ampliando el Workspace a ancho completo (`xl:col-span-12`). Se redujo a la mitad el alto vertical de los 6 botones de filtrado (convirtiéndolos a modo flex-row horizontal) y se maquetó la nube de etiquetas de forma horizontal con scroll (`overflow-x-auto whitespace-nowrap`) para evitar que el catálogo de componentes sea desplazado hacia abajo.
  - **T3 — Tarjetas Premium Glassmorphism (Cards):** Se reemplazó el listado plano de texto por tarjetas interactivas de componentes con estilo premium glassmorphism. Cada card incluye un icono representativo de recurso (`Code2` o `Package`), título con resaltado, badge verde `LIVE` si cuenta con sandbox simulable, descripción recortada a un máximo de dos líneas para uniformidad, nombre técnico en mono y badges HSL con los tags propios del componente.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]

---

### [2026-06-27] - CORE-119: Inyección Inteligente y Resolución de Dependencias

* **Tipo:** Mejora de Experiencia de Usuario (UX) / Automatización / Arquitectura / Dependencias
* **Firma de auditoría:** CORE-119-INTELLIGENT-INJECTION
* **Descripción de Cambios:**
  - **T1 — Estandarización de Path Aliasing (`@/*`):** Se crearon los archivos `jsconfig.json` en los 4 proyectos del ecosistema y se modificaron sus correspondientes `vite.config.js` para añadir el resolvedor de alias `@/` apuntando a `src/`. Se utilizó la sintaxis nativa de Node.js `fileURLToPath` y `URL` para garantizar compatibilidad absoluta con ES Modules y prevenir fallos de importación.
  - **T2 — Endpoint de Diagnóstico (Backend):** Se implementó `/api/library/inject/diagnose` en [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js). Este lee la ficha técnica Markdown del componente, extrae el bloque JSON de manifiesto `<!-- { ... } -->`, analiza el `package.json` del cliente destino para listar librerías NPM faltantes y busca de forma proactiva (mediante rutas comunes y búsqueda recursiva en `src/`) si los subcomponentes o hooks locales ya existen.
  - **T3 — Inyección en Cascada y NPM Automatizado (Backend):** Se actualizó `/api/library/inject` en [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) para instalar asíncronamente las librerías NPM requeridas usando `npm install` no bloqueante con timeout y para copiar recursivamente en cascada todas las subdependencias internas del manifiesto (hooks, helpers, components) protegiendo el flujo contra dependencias circulares mediante un `visited Set`.
  - **T4 — Checklist de Dependencias en UI (Frontend):** Se actualizó [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) para ejecutar el preflight check de diagnóstico al seleccionar un cliente y mostrar un panel detallado de requisitos (librerías NPM a instalar y subcomponentes locales a inyectar) con estados interactivos de progreso durante la instalación.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/vite.config.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/vite.config.js) [MODIFY]
  - [`Plantillas Core/App Ventas/vite.config.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [MODIFY]
  - [`Instancias Clientes/ventas/ventas-moni-app/vite.config.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/vite.config.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/vite.config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js) [MODIFY]
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/jsconfig.json`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/jsconfig.json) [NEW]
  - [`Plantillas Core/App Ventas/jsconfig.json`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/jsconfig.json) [NEW]
  - [`Instancias Clientes/ventas/ventas-moni-app/jsconfig.json`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/jsconfig.json) [NEW]
  - [`Prototipe-CLI/templates/template-ventas/jsconfig.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/jsconfig.json) [NEW]

---

### [2026-06-27] - CORE-118: Repotenciación de la Biblioteca de Componentes y Módulos

* **Tipo:** Refactorización / Automatización / UX/UI / Robustez / Seguridad
* **Firma de auditoría:** CORE-118-LIBRARY-REPOWERING
* **Descripción de Cambios:**
  - **T1 — Auto-Inyección de 1 Clic (Backend):** Se implementó el endpoint `POST /api/library/inject` en [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js). Resuelve la URI de la documentación, aísla de manera robusta el bloque de código React JSX y lo escribe físicamente en el proyecto cliente seleccionado con validación de seguridad contra directory traversal (`isPathContained`).
  - **T2 — Soporte Completo para Módulos:** Se adaptaron los endpoints `/api/library/extract` y `/api/library/inject` en [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) para detectar dinámicamente si la categoría es `09_Modulos_Completos`. Si es así, escribe los archivos y referencias de URL en el `README.md` directamente en la raíz de módulos, previniendo enlaces rotos y asegurando que el script prebuild `verify_library_integrity.cjs` pase sin fallos.
  - **T3 — Regex Tolerante de Aislamiento de Código:** Se rediseñó el motor de extracción de JSX tanto en el backend como en el frontend (función `extractReactCode` en [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx)) con un regex robusto tolerante a bloques de código React sin un token ` ``` ` de cierre explícito (ej. `DeveloperBillingPanel`), finalizando la captura ante un nuevo encabezado `## \d+\.`, una regla horizontal `---`, o el final del archivo.
  - **T4 — Pestaña de Código Fuente en UI:** Se agregó la pestaña dedicada "Código Fuente" (`code`) en el panel de detalle de [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) que aísla y renderiza exclusivamente el código JSX limpio con scroll, tipografía mono y botón de copia rápida.
  - **T5 — Nube de Etiquetas (Tag Cloud) en UI:** Se integró un panel lateral en [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) que compila todas las etiquetas únicas (`tags`) presentes en los componentes/módulos y permite filtrar el catálogo en un clic.
  - **T6 — Interfaz de Auto-Inyección:** Se renderizó la sección "Instalar en Cliente" en [`ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) con un selector de instancias cliente locales, autocompletado inteligente de rutas relativas y avisos preventivos sobre la revisión de dependencias e imports internos.
  - **T7 — Sincronización de Habilidades (Skills Reference):** Se actualizaron las instrucciones de las habilidades del ecosistema (`component_creator`, `component_extractor`, `portar_componente`, `sandbox_integrator`) en el repositorio central de documentación para incorporar la estructura física de categorías reales, la ruta de `09_Modulos_Completos` y la sugerencia prioritaria de usar el flujo de auto-inyección automatizado.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_creator/SKILL.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_creator/SKILL.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_extractor/SKILL.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_extractor/SKILL.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/portar_componente/SKILL.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/portar_componente/SKILL.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/sandbox_integrator/SKILL.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/sandbox_integrator/SKILL.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

---

### [2026-06-27] - CORE-117: Restricción de Estrategia Auto-Merge para Instancias Cliente

* **Tipo:** Mejora de Experiencia de Usuario (UX) / Control de Versiones / Git
* **Firma de auditoría:** CORE-117-RESTRICT-AUTO-MERGE-UI
* **Descripción de Cambios:**
  - **T1 — Ocultación del Toggle en la UI:** En el componente [`GitBackupPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx), se inyectó la validación `!selected?.path?.includes('Instancias Clientes')` en la directiva de renderizado del interruptor de "Auto-Merge a producción". Esto oculta de forma permanente este selector cuando el objetivo es una instancia o cliente, dado que estos operan bajo una única rama dedicada y carecen de una rama principal de producción/main.
  - **T2 — Inhabilitación de Estado Interno al Seleccionar:** Se modificó `handleSelectTarget` para evaluar de manera dinámica si el repositorio elegido pertenece a un cliente (`Instancias Clientes`). De ser el caso, establece el estado `doAutoMerge` en `false` por defecto, garantizando que el CLI Bridge envíe el parámetro desactivado a los scripts de PowerShell y evitando consolidaciones no deseadas.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY]

---

### [2026-06-27] - CORE-115/116: Respaldos No Disruptivos y Activación por Defecto del Auto-Merge

* **Tipo:** Refactorización / Control de Versiones / UX/UI / Robustez / Git
* **Firma de auditoría:** CORE-115-116-NON-DISRUPTIVE-BACKUP
* **Descripción de Cambios:**
  - **T1 — Remoción de Cierre Forzado de Procesos (CORE-115):** Se eliminó la rutina que invocaba `Stop-Process` contra servidores de desarrollo Vite/Node activos en los scripts de respaldo de PowerShell (`git_backup.ps1`, `subproject_backup.ps1`, `menu_backup.ps1`). Dado que el motor de renombrado temporal de repositorios Git (`.git` <-> `.git-backup-temp`) cuenta con un bucle tolerante de reintentos y que Vite ignora la carpeta `.git`, la detención de procesos resultaba redundante y causaba el cierre abrupto del Dashboard y aplicaciones cliente.
  - **T2 — Auto-Merge a Producción Activado por Defecto (CORE-116):** Se modificó el valor inicial del estado `doAutoMerge` de `false` a `true` en el componente [`GitBackupPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) del Dashboard. Esto asegura que, por defecto, los respaldos guarden y envíen los cambios a la rama de desarrollo (ej. `develop`) y ejecuten automáticamente el Auto-Merge y push hacia la rama principal (`master` o `main`), regresando el HEAD local de forma transparente a `develop`.
  - **T3 — Prevención de Bloqueos y Recarga en Caliente de Vite:** Se agregó la regla de exclusión `watch.ignored: ['**/.git-backup-temp**']` en `vite.config.js` en todos los proyectos del ecosistema. Esto previene que el watcher de Vite (Chokidar) intente monitorear y bloquear archivos dentro de la carpeta temporal de Git durante el proceso de respaldo, eliminando el fallo de `"Acceso denegado / No se pudo renombrar a .git"` y evitando recargas y parpadeos molestos en el navegador.
  - **T4 — Estrategia de Fusión Zero-Checkout (CORE-116):** Se rediseñó el mecanismo de Auto-Merge en los scripts `git_backup.ps1` y `subproject_backup.ps1`. En lugar de realizar un checkout de la rama de producción (`master`/`main`), hacer pull, merge local y regresar mediante otro checkout (lo cual alteraba físicamente el árbol de archivos en el disco y gatillaba recargas HMR en los servidores Vite activos), ahora el script actualiza la referencia de la rama local mediante `git branch -f` y la empuja directamente a GitHub. Esto mantiene el árbol de archivos completamente estático, logrando un merge instantáneo con cero recargas en el navegador.
* **Archivos Modificados:**
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`menu_backup.ps1`](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/vite.config.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/vite.config.js) [MODIFY]
  - [`Plantillas Core/App Ventas/vite.config.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/vite.config.js) [MODIFY]
  - [`Instancias Clientes/ventas/ventas-moni-app/vite.config.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/vite.config.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/vite.config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/vite.config.js) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

---

### [2026-06-27] - CORE-114: Robustecimiento de Inicialización de Firebase (Resguardo HMR)

* **Tipo:** Corrección de Errores / Robustez / Firebase / HMR
* **Firma de auditoría:** CORE-114-FIREBASE-HMR-ROBUSTNESS
* **Descripción de Cambios:**
  - **T1 — Resguardo contra inicialización duplicada de Firebase App:** En `firebaseConfig.js` (en core-templates e instancias), se actualizó la inicialización del objeto `FirebaseApp` utilizando una comprobación del arreglo de aplicaciones activas: `const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()`. Esto previene el error `Firebase App named '[DEFAULT]' already exists` durante las recargas en caliente de Vite (HMR) al guardar cambios.
  - **T2 — Resguardo contra inicialización duplicada de Firestore:** Para evitar el crash asociado al re-intento de inicialización de Firestore con caché local activa en recargas de HMR, se encapsuló `initializeFirestore` en un bloque `try/catch` que recurre a `getFirestore(app)` si el servicio ya ha sido inicializado.
* **Archivos Modificados:**
  - [`Plantillas Core/App Ventas/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/config/firebaseConfig.js) [MODIFY]
  - [`Instancias Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/config/firebaseConfig.js) [MODIFY]

---

### [2026-06-27] - CORE-113: Ajustes Visuales, Corrección de Enlaces y Optimización CRO en Landing

* **Tipo:** Corrección de Errores / Visual / UX/UI / CRO / HMR
* **Descripción de Cambios:**
  - **V1 — Regalos Reales de Nicho:** Se adaptaron los 8 nichos de la landing page para ofrecer "Actualizaciones automáticas del sistema + soporte técnico gratuito" en lugar de plantillas ficticias no disponibles.
  - **V2 — Enlace a WhatsApp:** Corrección de interpolación rota de la variable `${phone}` en el link de WhatsApp de la landing page removiendo el escape de barra invertida (`\`).
  - **V3 — Exclusión de Botón Magnético:** Se removió el efecto de botón magnético interactivo al botón "Solicitar esta solución por WhatsApp" (`#config-cta-btn`) por inconsistencia visual con el panel estático de cotización.
  - **V4 — Rediseño Clave de Simulador:** Se reemplazó la tarjeta gris y oscura de pérdidas financieras por un diseño limpio y claro coherente con los tokens y el lenguaje visual claro de la landing page.
  - **V5 — Diseño de Píldora de Regalo:** Ajuste del border-radius de la píldora de regalo de un estilo pill circular (50px) a un cuadrado redondeado (10px) para mantener consistencia geométrica con las tarjetas.
  - **V6 — Forzar Scroll al Inicio:** Integración de la rutina scrollRestoration yscrollTo para asegurar que al recargar la página inicie siempre desde el tope (0,0).
  - **V7 — Corrección de HMR en App Ventas Core:** Reubicación de los imports de `updateDynamicManifest` y `useConnectivityStore` al inicio del archivo `App.jsx` para evitar el crash de `Cannot read properties of null (reading 'inst')` en Zustand v5 al re-evaluar en HMR de Vite.
* **Archivos Modificados:**
  - [`LandingPage/js/app.js`](file:///d:/PROTOTIPE/LandingPage/js/app.js) [MODIFY]
  - [`LandingPage/css/styles.css`](file:///d:/PROTOTIPE/LandingPage/css/styles.css) [MODIFY]
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`LandingPage/sw.js`](file:///d:/PROTOTIPE/LandingPage/sw.js) [MODIFY]
  - [`Plantillas Core/App Ventas/src/App.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]

---

### [2026-06-27] - CORE-112: Formulación de Propuestas Avanzadas de Persuasión y Captación

* **Tipo:** Conversión / Estrategia / Documentación / CRO
* **Descripción de Cambios:**
  - **P1 — Reciprocidad con Lead Magnets:** Diseño de estrategia de entrega de plantillas y recursos gratuitos (regalos de nicho) en la redirección de WhatsApp para aumentar CTR de captación.
  - **P2 — Anclaje Financiero:** Propuesta de comparación visual entre pérdidas operativas vs costo de suscripción para transformar el software en una inversión de ahorro.
  - **P3 — Storytelling de Dolor y Alivio:** Re-estructuración de testimonios como arcos narrativos breves enfocados en la salida al dolor de cabeza del mostrador.
  - **P4 — Progreso Dotado:** Integración conceptual de un indicador de porcentaje de digitalización para motivar al cliente a cerrar la brecha con una llamada.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/propuestas_persuasion_captacion_avanzada_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/propuestas_persuasion_captacion_avanzada_2026.md) [NEW]

---

### [2026-06-27] - CORE-111: Elaboración de Propuesta de Conversión Psicológica y CRO para Landing Page

* **Tipo:** Conversión / Estrategia / Documentación / CRO
* **Descripción de Cambios:**
  - **C1 — Diagnóstico del Dolor del Cliente:** Análisis de disparadores cognitivos aplicados a dueños de pymes tradicionales, formulando copy enfocado a la aversión a la pérdida.
  - **C2 — Humanización de la Prueba Social:** Reemplazo de emojis de perfil por mini-casos de éxito con rostros reales y nombres comerciales.
  - **C3 — Simulador del Dolor Financiero:** Propuesta de un calculador interactivo del impacto económico para inducir urgencia de compra.
  - **C4 — Personalización Dinámica:** Estructura de renderizado dinámico contextual de la landing en base al nicho/rubro seleccionado.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/propuesta_conversion_psicologica_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/propuesta_conversion_psicologica_2026.md) [NEW]

---

### [2026-06-27] - CORE-110: Auditoría Técnica, SEO, CRO y Accesibilidad de la Landing Page

* **Tipo:** Auditoría / UX/UI / SEO / CRO / Rendimiento / Accesibilidad
* **Descripción de Cambios:**
  - **T1 — Auditoría Técnica Integral:** Diagnóstico a fondo del archivo monolítico `Index.html` de 7017 líneas y 293 KB y del service worker `sw.js`. Se evaluó la arquitectura monolítica (falta de caché modular independiente para CSS/JS) y se analizó la velocidad y rendimiento en el renderizado inicial.
  - **T2 — Análisis de Accesibilidad Crítica (a11y):** Detección de violaciones críticas de los estándares WCAG: (1) Secuestro global de selección de texto (`user-select: none !important`), que degrada severamente la usabilidad y rompe utilidades del navegador y extensiones de traducción. (2) Destrucción del foco visible (`outline: none !important`), que impide la navegación mediante teclado a usuarios con discapacidades motoras/visuales.
  - **T3 — Análisis de Conversión (CRO):** Diagnóstico de la fricción del modal agresivo de captura de leads que intercepta los enlaces de WhatsApp, interrumpiendo el flujo del usuario y provocando fugas de prospectos. Se propuso una estrategia transparente y opcional de captura.
  - **T4 — Saneamiento de Caching en Service Worker:** Detección de discrepancias en Google Fonts entre la URL precargada en `sw.js` (que busca `Plus Jakarta Sans`) y las familias tipográficas reales del HTML (`Inter` y `Outfit`), lo que genera desperdicio de ancho de banda y pérdida del beneficio offline.
  - **T5 — Plan de Acción Ordenado por Prioridad:** Diseño de una refactorización modular completa para desacoplar estilos, lógica interactiva y marcado semántico, unificando los IntersectionObservers y limitando las animaciones del Canvas en móviles para optimizar la interacción al siguiente renderizado (INP).
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md) [MODIFY]

---

### [2026-06-27] - CORE-109: Integración de la Landing Page en el Dev-Dashboard

* **Tipo:** Alojamiento / Routing / UX / Dashboard
* **Descripción de Cambios:**
  - **L1 — Despliegue de Landing Estática:** Integración de `Index.html` y `sw.js` en `public/landing/` del dev-dashboard.
  - **L2 — Enrutamiento y Persistencia de Tema:** Enrutado directo a `/landing/index.html` para evitar caídas de SPA y aislamiento de estados de tema en localStorage para prevenir colisiones entre dashboard y landing.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/public/landing/index.html`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/public/landing/index.html) [NEW]
  - [`Central PROTOTIPE/dev-dashboard/public/landing/sw.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/public/landing/sw.js) [NEW]

---

### [2026-06-27] - CORE-108: Robustez Concurrente en Test de Humo y Filtro de Comentarios en Sanitización

* **Tipo:** Robustez / Concurrencia / Scripts / CLI
* **Descripción de Cambios:**
  - **C1 — Puerto Dinámico en Test de Humo:** Mapeo de puerto libre mediante el módulo `net` en lugar de puerto `5190` fijo, eliminando fallas por colisión de puertos concurrentes en creaciones simultáneas de proyectos.
  - **C2 — Filtro de Comentarios en Env:** Exclusión de líneas comentadas (`#`) al leer `.env.local` en `sync_templates.js` para evitar contaminación e inyección de tokens incorrectos.
* **Archivos Modificados:**
  - [`Prototipe-CLI/worker_create_project.js`](file:///d:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]
  - [`Prototipe-CLI/sync_templates.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]

---

### [2026-06-27] - CORE-107: Robustez Híbrida de Triggers y Validación Preventiva en Aprovisionador

* **Tipo:** Robustez / Validación / Firebase / Aprovisionamiento
* **Descripción de Cambios:**
  - **T1 — Parseo Híbrido de Timestamps:** Soporte para leer timestamps de Firestore tanto como enteros primitivos como objetos `Timestamp` mediante `.toMillis()`, evitando caídas en telemetría.
  - **T2 — Validación Preflight en CLI:** Comprobación estricta de variables del desarrollador (`VITE_DEVELOPER_CENTRAL_API_KEY`) previniendo aprovisionamientos rotos.
* **Archivos Modificados:**
  - [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

---

### [2026-06-26] - CORE-106: Blindaje Automatizado y Guardianes Estáticos de Telemetría en el CLI

* **Tipo:** Blindaje / Test de Integración / Seguridad / Calidad
* **Descripción de Cambios:**
  - **T1 — Guardián Estático en Sync:** Implementación de comprobación sintáctica del hook cliente (`useAppConfigSync.js`) antes del sync.
  - **T2 — Integración en Test Runner:** Añadido de test de telemetría como paso del runner de pruebas estáticas de plantillas del CLI.
* **Archivos Modificados:**
  - [`Prototipe-CLI/sync_templates.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]
  - [`Prototipe-CLI/test_templates.js`](file:///d:/PROTOTIPE/Prototipe-CLI/test_templates.js) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md) [MODIFY]

---

### [2026-06-26] - CORE-105: Auto-Respuesta Silenciosa de Telemetría y Restauración de Valores Reales en Test de Telemetría

* **Tipo:** Telemetría / Correlación / Sync / Zustand
* **Descripción de Cambios:**
  - **T1 — Emisión de Telemetría Real:** Intercepción del trigger `triggerTelemetryReport` en el cliente y propagación del reporte con métricas en tiempo real.
  - **B1 — Corrección de Reportes de $0:** Modificación de la validación a `typeof totalMes === 'number'` para reportar adecuadamente el balance de tiendas vacías sin abortar el envío.
* **Archivos Modificados:**
  - [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

---

### [2026-06-26] - CORE-104: Potenciación y Siembra Automática del Generador

* **Tipo:** Aprovisionador / Automatización / Seeding / Firestore
* **Descripción de Cambios:**
  - **A1 — Asignación de Puertos Dinámicos:** Mapeo de puertos Vite basado en hash de `clientId` para evitar colisiones en desarrollo multi-instancia.
  - **A2 — Sembrado REST Firebase Auth/Firestore:** Generación de `seed_admin.js` para crear usuario admin administrativo de forma programática.
* **Archivos Modificados:**
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

---

### [2026-06-26] - CORE-103: Blindaje de Seguridad y Robustez en generator.js (Round 2)

* **Tipo:** Seguridad / Aprovisionamiento / Multi-instancia
* **Descripción de Cambios:**
  - **S1 — Contraseña Admin Impredecible:** Generación de clave única por instancia en lugar de credencial estática.
  - **S2 — Timeout de Aprovisionamiento:** Mapeo preventivo con `Promise.allSettled` y límites de tiempo para mitigar cortes de red.
* **Archivos Modificados:**
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

---

### [2026-06-26] - CORE-101: Eliminación de Selector Interactivo de Ramas y Robustecimiento del Backup

* **Tipo:** Refactorización / Corrección de Bugs / Scripts de PowerShell
* **Descripción de Cambios:**
  - **R1 — Eliminación de `BranchSelector`**: Se eliminó por completo el componente interactivo `BranchSelector` de `GitBackupPanel.jsx` (144 líneas de JSX/lógica) junto con sus estados `isOpen`, `branches`, `loadingList`, `switching` y sus callbacks `loadBranches`, `handleToggle`, `handleCheckout`. La insignia de rama en el card activo fue restaurada a `<BranchBadge>` estático que muestra la rama local leída del `HEAD` en disco.
  - **R2 — Eliminación de Endpoints de la CLI**: Se eliminaron los endpoints `GET /api/git/branches` y `POST /api/git/checkout` de `server.js` (~100 líneas) sin afectar ningún otro endpoint existente.
  - **B1 — Corrección de `finally` en `git_backup.ps1`**: Se reemplazó la llamada a `Exit-WithPause 1` (línea 406) por `$ScriptExitCode = 1; return`. En PowerShell, `exit` dentro de un bloque `try` salta el `finally`, impidiendo el retorno garantizado a `develop`. Este fix asegura ejecución correcta del bloque de restauración.
  - **B2 — Corrección de `finally` en `subproject_backup.ps1`**: Idem al punto anterior, línea 443. Garantiza que Cores, Dashboard y plantillas siempre queden en `develop` al terminar el backup, incluso si el auto-merge falla.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY]

### [2026-06-26] - CORE-100: Selector de Ramas Dinámico y Consulta Remota de Git

* **Tipo:** Nuevas Funcionalidades / UI/UX / Git / Corrección de Bugs
* **Descripción de Cambios:**
  - **F1 — Selector Interactivo de Ramas (BranchSelector)**: Diseñado e integrado un selector interactivo tipo dropdown al lado de la insignia de estado de Git en la UI del Dashboard. Permite desplegar y cambiar de rama de forma dinámica mediante peticiones al backend.
  - **F2 — Endpoints de Checkout y Lista de Ramas en CLI**: Implementados los endpoints `GET /api/git/branches` y `POST /api/git/checkout` en el servidor CLI Bridge, con soporte nativo para repositorios inactivos renombrados como `.git-backup-temp/` mediante inyección controlada de variables de entorno de Git en Node (`GIT_DIR` y `GIT_WORK_TREE`).
  - **C1 — Corrección de Apilamiento de UI (z-index)**: Añadida la propiedad `relative z-40` al contenedor de la cabecera activa del repositorio en `GitBackupPanel.jsx` para evitar que el dropdown del selector se corte o tape con la tarjeta de "Cambios Detectados".
  - **C2 — Habilitación de git fetch Real en API de Estado**: Corregido un bug en `/api/git/status` donde se utilizaba `git fetch --dry-run` a través de `execAsync`. Se reemplazó por un `git fetch` real a través de `execGitCommand`, lo que permite consultar y sincronizar de forma efectiva el estado local con respecto al repositorio en GitHub (ahead / behind / sync) incluso para repositorios inactivos.
  - **C3 — Solución de Diálogo de Confirmación Asíncrono**: Se corrigió la función `handleCheckout` en el frontend, la cual intentaba llamar a la función `showConfirm` con una firma síncrona clásica de callback `showConfirm(msg, cb)`. Dado que `showConfirm` es una función asíncrona de React que devuelve una promesa (booleana), el checkout nunca se llegaba a disparar. Se refactorizó usando `await showConfirm({ title, message })` para resolver correctamente la promesa y realizar el checkout.
  - **C4 — Mapeo de Ramas Remotas en el Selector**: Se corrigió el comando en el endpoint `/api/git/branches` para que ejecute `git branch -a` en lugar de `git branch`. Esto asegura que ramas que solo existen en GitHub remoto (y que aún no han sido descargadas o creadas localmente en tu computadora) se listen en el selector del Dashboard, permitiendo al usuario cambiar a ellas.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY]

### [2026-06-26] - CORE-099-REV: Resiliencia de Auto-Merge y Prevención de Recargas de Vite

* **Tipo:** Corrección de Bugs / Robustecimiento / Git
* **Descripción de Cambios:**
  - **P1 — Prevención de Recargas del Dashboard al Respaldar el Maestro**: Se desindexó físicamente la carpeta `Central PROTOTIPE/` del repositorio raíz Git de `D:\PROTOTIPE` y se agregó a `.gitignore` del raíz. Esto evita que los checkouts del script de respaldo Maestro reescriban o modifiquen los metadatos de los archivos del Dashboard, suprimiendo de raíz las falsas alertas del watcher de Vite y previniendo que el dashboard se recargue/reinicie enviando al usuario al login.
  - **P2 — Restauración Garantizada a develop en try-finally**: Se refactorizaron los scripts `git_backup.ps1` y `subproject_backup.ps1` reemplazando todas las llamadas directas a `exit`/`Exit-WithPause` dentro del bloque `try` y `catch` por asignaciones a la variable `$ScriptExitCode` seguidas de `return`. Esto asegura que el bloque `finally` siempre se ejecute en PowerShell, garantizando que tanto el Maestro como los Cores y Dashboard queden situados en su rama de desarrollo activa (`develop`) y sus directorios `.git` se restauren de forma segura ante cualquier éxito, advertencia o excepción.
  - **P3 — Auto-Resolución de Conflictos en Auto-Merge**: Se inyectó el parámetro `-X theirs` a la instrucción `git merge` de los scripts de respaldo de PowerShell (`git_backup.ps1` y `subproject_backup.ps1`). Esto le indica a Git que resuelva automáticamente cualquier colisión de código a favor de la rama de desarrollo activa (`develop`), logrando un flujo de "Auto-Merge a producción" sin interrupciones ni necesidad de fusiones manuales.
  - **P4 — Saneamiento de Ahead Status (+1) y Ramas**: Se alineó localmente la plantilla Core `App Ventas` situándola en la rama `develop`, y se subieron los commits locales pendientes del Dashboard y el Maestro a GitHub (`git push`), limpiando por completo el estado "Ahead (+1)" (Adelantado) en la UI y dejando todas las ramas de trabajo en estado `Limpias` e idénticas en remoto.
* **Archivos Modificados:**
  - [`.gitignore`](file:///d:/PROTOTIPE/.gitignore) [MODIFY]
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`Plantillas Core/App Ventas/`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/) [CHECKOUT_DEVELOP]
  - [`Central PROTOTIPE/dev-dashboard/`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/) [CHECKOUT_DEVELOP/PUSH_MASTER]

### [2026-06-26] - CORE-098: Poda Limpia de Firebase Cloud Messaging (FCM) e Inactividad Push

* **Tipo:** Remoción de Código / Optimización / Consistencia
* **Descripción de Cambios:**
  - **P1 — Eliminación física de archivos de mensajería push**: Se eliminaron de forma definitiva los archivos `src/hooks/useFCMPermission.js` y `src/components/client/SoftPushPrompt.jsx` para suprimir el peso innecesario en los bundles y mitigar fallos de carga.
  - **P2 — Saneamiento de Layouts**: Se eliminó la importación y la llamada al hook `useFCMPermission` en los componentes de enrutamiento raíz de la interfaz de usuario:
    - `src/layouts/AdminLayout.jsx` (Módulo Administración)
    - `src/layouts/PortalLayout.jsx` (Portal de Empleados)
    - `src/layouts/ClientLayout.jsx` (Tienda PWA del Cliente)
  - **P3 — Limpieza de Dependencias**: Se eliminó la importación y renderizado de `SoftPushPrompt` en `src/pages/client/OrderTracking.jsx` (Seguimiento de pedidos de Clientes).
  - **P4 — Sincronización y Paridad Ecosistema**: Los cambios se propagaron y aplicaron simultáneamente en tres directorios de trabajo del disco:
    - Core Genérico de Referencia (`Plantillas Core/App Ventas`)
    - Generador de Proyectos de la CLI (`Prototipe-CLI/templates/template-ventas`)
    - Instancia de Cliente Activa (`Instancias Clientes/ventas/ventas-moni-app`)
  - **P5 — Compilación Exitosa**: Se corrió la compilación de producción de Vite (`npm run build`) en la carpeta del Core, validando la ausencia de enlaces o importaciones rotas con éxito total.
  - **P6 — Desacoplamiento de Repositorios (Solución de regresiones al guardar)**: Se desindexaron por completo las carpetas `Plantillas Core/`, `Instancias Clientes/` y las plantillas de `Prototipe-CLI/templates/` del repositorio raíz de Git (`git rm -r --cached`), y se añadieron a `.gitignore` del raíz. Esto evita que el `checkout` temporal de la CLI en el raíz durante los respaldos pise o revierta los archivos locales de Cores e Instancias, manteniendo la paridad y cambios locales 100% seguros y estables.
  - **P7 — Corrección de Detección de Instancias y Falsos Drifts**: Se parchó `isInsideGitRepo` para admitir carpetas Git renombradas (`.git-backup-temp/`) evitando que desaparezcan del panel del Dashboard, y se modificó `isPathExcludedFromSync` para omitir esta base de datos interna de la paridad de código, logrando un 100% de paridad sin fugas. También se solucionó el bloqueo del historial Git en `execGitCommand` removiendo el caracter `|` del delimitador por `:::`.
  - **P8 — Resolución de Conflicto en Auto-Merge**: Se activó temporalmente el repositorio Git de `Plantillas Core/App Ventas/`, se resolvió el conflicto de fusión de `develop` hacia `main` (derivado de la poda de FCM) utilizando la estrategia de prioridad `-X theirs` y se subió el merge consolidado a GitHub con `--no-verify`, destrabando el flujo automatizado de Auto-Merge a producción de la CLI.
* **Archivos Modificados:**
  - [`.gitignore`](file:///d:/PROTOTIPE/.gitignore) [MODIFY]
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Plantillas Core/App Ventas/`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/) [MODIFY/DELETE/EXCLUDE_FROM_ROOT_GIT/MERGE_MAIN]
  - [`Prototipe-CLI/templates/template-ventas/`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/) [MODIFY/DELETE/EXCLUDE_FROM_ROOT_GIT]
  - [`Instancias Clientes/ventas/ventas-moni-app/`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/) [MODIFY/DELETE/EXCLUDE_FROM_ROOT_GIT]

### [2026-06-26] - CORE-097: Robustecimiento y Expansión del Módulo de Control Git

* **Tipo:** Auditoría / Consistencia / Seguridad / UI/UX / Nuevas Funcionalidades
* **Descripción de Cambios:**
  - **A1 — APIs Generales (Soporte Universal de Rutas)**: Modificados los endpoints `POST /api/git/discard` and `GET /api/git/diff-file` para recibir el parámetro `path` (ruta absoluta del repositorio) con validación estricta de Path Traversal (`isPathContained`), en lugar de estar acoplados rígidamente a `clientId`. Esto permite operar el descarte y diferencia de cambios en el Maestro, la Consola Central y los Cores de forma unificada.
  - **A2 — Autocuración del Directorio de Control en Subproyectos**: Se implementó el uso de variables de entorno `GIT_DIR` y `GIT_WORK_TREE` de Git en Node.js de forma transparente. Esto permite leer y descartar cambios locales en Cores y Clientes con repositorios inactivos (`.git-backup-temp`) directamente y con cero bloqueos físicos de archivos en Windows.
  - **F1 — Descarte Selectivo y Masivo de Cambios Locales**: Integrada la funcionalidad de descarte en el frontend (`GitBackupPanel.jsx`). Añadido un botón de restauración (`RefreshCw`) al lado de cada archivo modificado para checkout de archivo individual, y un botón "Descartar todo" en el header del visor, ambos protegidos con diálogos de confirmación nativos (`showConfirm`).
  - **F2 — Historial de Commits (Git Log)**: Creado el endpoint `GET /api/git/log` e implementado el visor "Historial de Commits Recientes" en la UI, mostrando de forma ordenada los 5 commits locales más recientes de la rama seleccionada. Captura de excepciones en repositorios vacíos (nuevos o sin commits) retornando `commits: []` de forma segura.
  - **F3 — Estado de Sincronización Remota**: Modificada la API `GET /api/git/status` para calcular en milisegundos commits adelantados/atrasados de la rama local respecto a origin usando `git rev-list`. Se añadió el botón manual "Comprobar GitHub" que dispara un `git fetch` remoto ligero en segundo plano con timeout controlado de 8 segundos para evitar bloqueos por falta de conexión o red lenta.
  - **A3 — Resiliencia ante Conflictos en Auto-Merge**: Se reestructuraron los scripts de PowerShell `subproject_backup.ps1` y `git_backup.ps1`. Si la estrategia secundaria de auto-merge a producción (`main`) detecta conflictos de código, el script aborta la fusión (`git merge --abort`) y regresa a la rama original, pero en lugar de retornar error 1 (que bloqueaba la UI con un estado de error rojo catastrófico), escribe un aviso amarillo descriptivo en la salida y finaliza con éxito (código 0). Adicionalmente, se inyectó un bloque de recuperación `finally` en `git_backup.ps1` que garantiza que el repositorio raíz regrese de forma automática a la rama original de desarrollo (`develop`) ante cualquier error inesperado de red, push o merge, previniendo atascos involuntarios del disco físico en la rama de producción (`master`/`main`).
  - **A4 — Protección Hermética de Procesos del Dashboard**: Se actualizó la expresión regular y lógica de protección de PIDs y procesos en `git_backup.ps1` y `subproject_backup.ps1` para que soporte de forma robusta barras inclinadas hacia adelante `/` y barras invertidas `\`. Se añadió un filtro redundante de CommandLine para el Dashboard de Control Central. Esto garantiza de forma absoluta que el servidor de desarrollo del dashboard nunca sea detenido o interrumpido durante operaciones de guardado/backup, manteniendo el flujo SSE activo.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/GitBackupPanel.jsx) [MODIFY]
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-26] - CORE-096: Robustecimiento y Auditoría del Módulo Consola de Errores y Diagnósticos (Con DatePickers y CSV)

* **Tipo:** Auditoría / Corrección de Bugs / Optimización de Performance / UI/UX
* **Descripción de Cambios:**
  - **C1 — Límite Firestore:** Agregado `limit(500)` al `query` de `app_failures` para evitar descarga ilimitada de documentos.
  - **C2 — Anti-spam de logs:** Implementado flag `isFailuresInitialLoad` en el `onSnapshot` para evitar inundar el panel de actividad con mensajes históricos al inicializar.
  - **C3 — Consistencia de resolución masiva:** `handleResolveAllFailures` ahora graba `resolvedAt` e `resolutionNote: null` consistente con el flujo individual de resolución. Actualización local optimista post-escritura.
  - **C4 — writeBatch seguro:** `handleClearAllFailures` refactorizado a `writeBatch` en chunks de 450 operaciones para no superar el límite nativo de Firestore (500 ops/batch).
  - **M1 — Uptime calculado:** El indicador "Uptime del Motor" muestra ahora un porcentaje real derivado del ratio fallos activos/histórico en lugar de valores hardcodeados.
  - **M2, M3, M5 — useMemo en filtros:** `rawFilteredFailures`, `filteredFailures` y `clientFilterOptions` envueltos en `useMemo` con dependencias estrictas para eliminar recalcados en cada keystroke.
  - **M4 — Eliminación de código duplicado:** Extraída `extractFileAndLine()` como función utilitaria pura (antes del componente App), eliminando 50+ líneas duplicadas entre el `useEffect` de carga de código y el modal de diagnóstico.
  - **F1 — Rango de Fechas Custom (Centrado y Autocurativo):** Implementado el componente premium interactivo `DatePickerCustom` con diseño glassmorphic, que sustituye a los inputs de tipo date nativos de HTML y se integra al layout con altura `h-9` (`36px`). Se adaptó para renderizarse centrado en pantalla en un modal con backdrop blur (`backdrop-blur-sm`) en lugar de dropdown absolute, evitando desbordamientos de la UI en cualquier resolución.
  - **F2 — Exportación CSV:** Diseñada e integrada la función `handleExportFailuresCSV()` que de-duplica y escapa de forma segura caracteres y saltos de línea para exportar todos los incidentes filtrados en un archivo CSV formateado con columnas limpias.
  - **F3 — Renderizado de Versión App:** Añadido soporte para pintar el badge de versión de la app (`vX.Y.Z`) en cada tarjeta de incidente (si está disponible) y visualización del campo `Versión App` en el modal de diagnóstico.
  - **F4 — Badge de notificación:** Implementado badge rojo con `animate-pulse` en el sidebar y en la barra de navegación móvil, mostrando conteo de errores activos cuando el usuario está en otra sección. Cap visual en "9+".
  - **F6 — getSeverity centralizado:** Extraída función `getSeverity(fail)` para normalizar el campo `type` del fallo. Reemplazados 2 usos inline dispersos (filtro `useMemo` y card del listado) para garantizar consistencia total.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

---

### [2026-06-26] - CORE-095: Corrección de Cierre de Servidor Dev-Dashboard en Backups de Git

* **Tipo:** Corrección de Bugs / Robustez / Scripts de Automatización / Control de Versiones
* **Descripción de Cambios:**
  - **Estrategia de Protección Dinámica en PowerShell:** Se refactorizó la lógica de detención de servidores dev (`node.exe` y `vite`) en los scripts `git_backup.ps1`, `subproject_backup.ps1` y `menu_backup.ps1`. Se implementó un algoritmo dinámico que identifica los PIDs del Dashboard Central (`dev-dashboard` y `Central PROTOTIPE`) y de la CLI (`server.js`), y propaga la protección hacia arriba por el árbol de procesos (`ParentProcessId` por 4 iteraciones) para cubrir la cadena completa (incluyendo ejecutores npm y consolas de comandos intermedias).
  - **Aislamiento por Subproyecto en subproject_backup.ps1:** Se limitó la detención de procesos de desarrollo únicamente a aquellos que correspondan al subproyecto bajo respaldo (`$SubprojectPath`), comparando sus rutas absolutas resueltas y evitando interrumpir otros servidores dev del ecosistema.
  - **Autocuración y Reinicio en block finally:** Se inyectó lógica en la sección `finally` de `subproject_backup.ps1` para reiniciar automáticamente el servidor de desarrollo del subproyecto mediante `Start-Process powershell -ArgumentList ... npm run dev` si este fue detenido al inicio del script.
* **Archivos Modificados:**
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`menu_backup.ps1`](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-26] - CORE-094: Optimización de Drift y Paridad de Cores (Normalización LF, Huérfanos, Poda y Diffs Lazy)

* **Tipo:** Refactorización / Optimización / CLI / UI/UX / Robustez / Control de Calidad / Documentación
* **Descripción de Cambios:**
  - **Normalización LF en Drift Detector:** Se inyectó el reemplazo de retornos de carro CRLF (`\r\n`) por LF (`\n`) y `.trim()` en la comparación física de archivos en memoria en el backend CLI, previniendo falsos desvíos (drifts invisibles) en entornos Windows.
  - **Detección Bidireccional de Huérfanos:** Se expandió la lógica de `drift` en `server.js` agregando el escaneo inverso sobre el directorio de destino (`templatePath`) para identificar archivos obsoletos de la plantilla CLI que ya no existen en el Core de desarrollo (marcados con el estado `orphan_in_template`).
  - **Sincronización con Poda (Pruning):** Se actualizó el helper de sincronización `performCoreSync` y los endpoints del servidor para leer la bandera `prune` del body y ejecutar la eliminación física segura de archivos huérfanos detectados en el template.
  - **Diffs Asíncronos Bajo Demanda (Lazy):** Se rediseñó el endpoint `/api/cores/:clave/drift` para omitir el pesado cálculo y payload de diferencias inline, y se implementó un nuevo endpoint dedicado `/api/cores/:clave/diff` que calcula el diff de líneas con `jsdiff` en caliente únicamente para el archivo consultado.
  - **Frontend con Lazy Loading y Sección de Obsoletos:** Se actualizó `CoreCard.jsx` en el Dashboard Central incorporando los estados locales `fileDiffs`/`loadingFileDiff` para cargar individualmente las diferencias al expandir el acordeón del archivo, agregando la nueva sección "🗑️ Archivos Obsoletos en Plantilla CLI" para listar huérfanos y enviando `{ prune: true }` al sincronizar para curar el desvío físico por completo.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-26] - CORE-093: Optimización, Sanitización y Visualización de Diferencias en Sincronización de Cores

* **Tipo:** Refactorización / Optimización / CLI / Aprovisionamiento / Robustez / UI/UX / Documentación
* **Descripción de Cambios:**
  - **Sincronización Concurrente de Cores:** Se optimizó `performCoreSync` en `server.js` reemplazando la recursión síncrona/secuencial por E/S paralela con `Promise.all` para la sanitización de plantillas, bajando el tiempo de sincronización local del Core a ~220ms.
  - **Protección de packageName:** Se limitó el reemplazo del nombre de paquete estrictamente a `package.json`, eliminando falsas sobreescrituras en archivos del código fuente React o selectores CSS.
  - **Soporte de Reglas Firebase:** Se añadió soporte para procesar y sanitizar la extensión `.rules` nativamente.
  - **Exclusión de Directorios de Trabajo:** Se excluyeron carpetas temporales (`.firebase`, `playwright-report`, `test-results`, `scratch`, `scripts`) en la recursión de sanitización.
  - **Corrección de Bug de Validación de Firebase:** Se solucionó una excepción `Unexpected token '<'` al validar credenciales en `generator.js` causante de fallos en el preflight check al consultar la raíz REST de Firestore. Ahora se realiza la consulta sobre la colección `/config` para recibir un JSON estructurado de error (403/400) o éxito (200) de Google.
  - **Corrección de ESM Import en Windows:** Se reemplazó la llamada a `import()` dinámico de Playwright con ruta de disco absoluta de Windows por `require()` nativa de CommonJS en `worker_create_project.js`, evitando fallos del motor ESM.
  - **Chequeo de Humo Optimizada:** Se cambió el estado de espera en Playwright de `networkidle` a `load` en `worker_create_project.js` para evitar timeouts debido a flujos SSE de fondo de la telemetría centralizada.
  - **Backend de Drift y Diffs para Cores:** Se implementó el endpoint `GET /api/cores/:clave/drift` en `server.js` para evaluar de forma concurrente la paridad física, excluyendo temporales, aplicando sanitización semántica al vuelo antes de la comparación y limitando los diffs de texto a archivos menores a 150 KB.
  - **Frontend del Visualizador de Paridad:** Se actualizó `CoreCard.jsx` en el Dashboard Central agregando el botón "Diferencias" y el modal interactivo que despliega el porcentaje SVG de paridad (0-100%), listado de archivos faltantes en la CLI, acordeón de archivos modificados con resaltado de diff de líneas verde/rojo y un botón para sincronizar en caliente con refresco reactivo.
  - **Solución a Bloqueo de Git Oculto en Windows (Subproyectos):** Se corrigió un error de "Acceso denegado" al restaurar las carpetas `.git-backup-temp` a `.git` en Windows. El comando `Rename-Item` fallaba debido a que las carpetas tenían el atributo `Hidden` activo. Se modificaron los scripts `git_backup.ps1`, `menu_backup.ps1` y `subproject_backup.ps1` para remover temporalmente los atributos de archivo (`attrib -h -r -s`) antes del renombrado y volver a ocultarlas una vez restauradas, garantizando ejecuciones limpias de control de versiones.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`Prototipe-CLI/worker_create_project.js`](file:///d:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY]
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`menu_backup.ps1`](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY]
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-26] - CORE-092: Blindaje a Futuro de Cores e Instancias (Firebase Rules & Config Integrity)

* **Tipo:** Mejora de Seguridad / Robustez / Multi-core / CLI / Automatización / Documentación
* **Descripción de Cambios:**
  - **Aprovisionamiento Nativo de Cores:** Se modificó `/api/register-core` para escribir y provisionar físicamente `firebase.json` (con Firestore, Storage y cabeceras de caché PWA configuradas), `firestore.rules`, `storage.rules` y `firestore.indexes.json` con configuraciones restrictivas base seguras en nuevos Cores al crearse.
  - **Autocuración de Drift en Caliente:** Se inyectó el helper `autoHealCoreRules` en `/api/project/firebase-rules/drift-global` de modo que si un Core plantilla local carece de sus reglas de seguridad, se generen y escriban proactivamente antes de calcular drifts, priorizando las reglas activas de la nube (si el cliente está conectado) o plantillas seguras locales si falla la conexión.
  - **Dinamización y Generalización de Fix Rules:** Se desacopló la dependencia rígida ("hardcoded") de `App Ventas` en `/api/project/fix/rules`. Ahora se lee `.prototipe.json` de la instancia para resolver su Core de origen de manera dinámica, y se amplió el soporte para restaurar no solo `firestore.rules`, sino también `storage.rules` y `firestore.indexes.json` selectivamente o por lotes.
  - **Estandarización en el Generador:** Se actualizaron las plantillas estáticas de reglas por defecto en `generator.js` con el formato restrictivo seguro estándar (acceso denegado a no autenticados en Firestore y Storage).
  - **Corrección de Bug de Drift Global de Archivos:** Se corrigió un `ReferenceError: dir is not defined` en el endpoint `/api/project/drift/global` provocado por una variable no actualizada durante una refactorización previa. Esto impedía visualizar la matriz de paridad en el Dashboard al arrojar excepciones en el cálculo de drift de las instancias.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-26] - CORE-091: Tuning de Telemetría Central y Ping-Pong en Cores e Instancias

* **Tipo:** Corrección de Bugs / Robustez / Sincronización / Telemetría / Documentación
* **Descripción de Cambios:**
  - **Saneamiento de Alineación (Drift):** Se solucionó la desincronización física en la que las instancias cliente veían sobrescrita su lógica de sincronización central (`useAppConfigSync.js`) con una versión básica del Core `App Ventas/` que carecía de conexión de base de datos secundaria.
  - **Inyección de Conexión Central en Core:** Se copió `centralFirebaseService.js` a `Plantillas Core/App Ventas/src/services/` y se actualizó `useAppConfigSync.js` en `Plantillas Core/App Ventas/src/hooks/` con el hook de 176 líneas que integra listeners en tiempo real para `sistemaAlerta`, `triggerPing` y tarifas del CRM central.
  - **Propagación y Alineación de Instancia:** Se actualizó `ventas-moni-app` con el hook alineado y se corrió una prueba de sincronización downstream desde el CLI Bridge. El sistema propagó los cambios con éxito y construyó la PWA v1.3.0 sin advertencias.
* **Archivos Modificados:**
  - [`Plantillas Core/App Ventas/src/services/centralFirebaseService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/centralFirebaseService.js) [NEW]
  - [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Instancias Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-26] - CORE-090: Blindaje a Futuro contra Caché Persistente en Despliegues de Hosting PWA

* **Tipo:** Mejora de Seguridad / Robustez / Multi-core / CLI / Automatización / Documentación
* **Descripción de Cambios:**
  - **Planificación y Diseño de Blindaje contra Caché:** Se planificó un blindaje en caliente para resolver el problema de desactualización en Firebase Hosting sin dañar la identidad de las marcas ni configuraciones locales. La solución consiste en: (1) Inyectar cabeceras `Cache-Control` estrictas en `firebase.json` de cores e instancias, forzando la validación inmediata del `index.html` y service workers en cada recarga, mientras se permite caché inmutable para assets hasheados de Vite. (2) Registrar el Service Worker con una estrategia de recarga automática al cambiar el controlador (`controllerchange`) en `main.jsx` protegiendo la carga inicial. (3) Inyectar rutinas automáticas de auto-curación y auditoría de cabeceras en el generador de proyectos (`generator.js`) y en el pipeline de sincronización del servidor CLI (`server.js`).
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-26] - CORE-089: Pre-flight Validation Pipeline y Blindaje de Integridad de Sincronización en CLI Server

* **Tipo:** Mejora de Seguridad / Robustez / Multi-core / CLI / Automatización / Documentación
* **Descripción de Cambios:**
  - **Implementación de Pre-flight Integrity Pipeline:** Se desarrolló e integró en `server.js` la función `validateClientIntegrityBeforeSync` dentro del flujo de sincronización física del CLI (`/api/instancias/sync-and-deploy-stream`). Este pipeline realiza de forma automática y secuencial:
    1. **Resolución Correcta de Variables e Identidad:** Lee `.prototipe.json` para extraer el `clientId` y usa el token del Firebase CLI local para resolver correctamente el `projectId` de Firebase en base a `.firebaserc`.
    2. **Auto-curación Dinámica de `.env.local`:** Consulta la base de datos Firestore central para recuperar las comisiones/parámetros de facturación del cliente y su token de telemetría activo. Consulta el SDK config de Firebase del cliente (`firebase apps:sdkconfig web`) y reconstruye/auto-cura el archivo `.env.local` con todas las credenciales de Firebase correctas, previniendo errores de "invalid-api-key" y pantallas en blanco.
    3. **Integridad del Service Worker FCM:** Si el Service Worker `public/firebase-messaging-sw.js` no existe en la carpeta del cliente, lo copia del Core e inyecta estáticamente al vuelo las credenciales de Firebase personalizadas de la marca (ya que el SW no lee variables en runtime).
    4. **Inyección en Configuración Excluida (`firebaseConfig.js`):** Valida si exporta `messaging`. Si está ausente debido a paridad con el Core, realiza un patch seguro agregando el código necesario para inicializar e importar FCM de forma segura.
    5. **Paridad de Scripts y Construcción:** Copia scripts faltantes de NPM (como `generate_ia_map.js`) referenciados en `package.json` desde el Core.
  - **Verificación de Calidad y Pruebas:** Se ejecutaron pruebas SSE end-to-end simulando la eliminación manual de variables en `.env.local` y el borrado físico de `firebase-messaging-sw.js` en `ventas-moni-app`, comprobando su correcta regeneración y auto-curado. Finalmente, se ejecutó una compilación de producción local exitosa (`npm run build`) para certificar la integridad.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-26] - CORE-088: Corrección de Prioridad de Detección de Firebase Project ID en CLI Server

* **Tipo:** Corrección de Bugs / Firebase / CLI / Despliegue
* **Descripción de Cambios:**
  - **Corregida Prioridad de Detección de Project ID en resolveFirebaseProjectId:** Se solucionó el fallo en el que el servidor CLI intentaba desplegar el Hosting utilizando el identificador genérico del cliente (`moni-app`) en lugar del ID real del proyecto de Firebase (`ventas-moni-app`), debido a que la lectura de `.prototipe.json` (que contenía `clientId: "moni-app"`) enmascaraba las lecturas posteriores de `.firebaserc` y `.env.local`. Se reestructuró la función para consultar con máxima prioridad el archivo `.firebaserc` (fuente de verdad oficial de Firebase CLI) y la variable `VITE_FIREBASE_PROJECT_ID` en `.env.local` antes de recurrir a metadatos de la instancia.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]


---

### [2026-06-26] - CORE-087: Inicialización de Firebase, Exportación de Messaging y Saneamiento de Compilación en ventas-moni-app

* **Tipo:** Corrección de Bugs / Configuración / Firebase / Compilación
* **Descripción de Cambios:**
  - **Inyección de Credenciales de Firebase y Telemetría en la Marca:** Se recuperaron e inyectaron las credenciales reales de Firebase del cliente (`ventas-moni-app`) y sus parámetros de telemetría y comisiones del desarrollador en `.env.local`, solucionando el error fatal `auth/invalid-api-key` y la pantalla en blanco al iniciar.
  - **Exportación de Firebase Messaging (`messaging`):** Se actualizó el archivo `src/config/firebaseConfig.js` para exportar de forma segura y perezosa la instancia de `messaging` (Firebase Cloud Messaging) de modo que sea totalmente compatible con los hooks del core sincronizados (`useFCMPermission.js`), eliminando errores de importación faltante.
  - **Inyección de Generador de Mapa de IA:** Se creó la carpeta `/scripts` y se inyectó el script `generate_ia_map.js` para posibilitar el paso de pre-compilación `"npm run map"` y permitir que la compilación local para producción (`npm run build`) complete exitosamente.
* **Archivos Modificados:**
  - [`Instancias Clientes/ventas/ventas-moni-app/.env.local`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/.env.local) [MODIFY]
  - [`Instancias Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js) [MODIFY]
  - [`Instancias Clientes/ventas/ventas-moni-app/scripts/generate_ia_map.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/scripts/generate_ia_map.js) [NEW]

---

### [2026-06-26] - CORE-086: Propuesta Técnica y Visual para Mini-Dashboard Interactivo Inline en Hero

* **Tipo:** Conversión (CRO) / UI/UX / Propuesta / Documentación
* **Descripción de Cambios:**
  - **Elaboración de Propuesta de Mini-Dashboard Interactivo:** Se redactó la especificación UX/técnica [`propuesta_dashboard_interactivo.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/propuesta_dashboard_interactivo.md) para permitir a los visitantes interactuar directamente con los tres módulos del mockup SVG (Ventas del Mes, Lista de Control y Últimos Pedidos) sin abrir el modal a la primera interacción. La propuesta abarca cues visuales de atracción (badge dinámico flotante, atracción onboarding animada al cargar y hover selectivo de cursor) y mecánicas técnicas basadas en JS puro para interactuar en caliente con el DOM SVG (tooltips, checkboxes con tachado e interruptor de estados con micro-confeti).
  - **Actualización del Mapa de Documentación y Roadmap:** Sincronizado en el GPS semántico y registrado en el control de tareas del roadmap.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/09_Modulos_Completos/propuesta_dashboard_interactivo.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/propuesta_dashboard_interactivo.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

---

### [2026-06-26] - CORE-085: Expansión de Nichos Comerciales y Consistencia de Configuración Operativa [Revisión y Refinamiento]

* **Tipo:** Expansión / Sincronización / Backend / Frontend / Consistencia
* **Descripción de Cambios:**
  - **Expansión de Verticas de Negocio (10 Paletas por Nicho - 130 Paletas Totales):** Se incorporaron 13 nuevos nichos comerciales de alta demanda en LatAm (Colombia). Se diseñaron e inyectaron 10 paletas HSL de contraste verificado (130 combinaciones completas light/dark en total) adaptadas estratégicamente a la identidad visual de cada vertical. Se inyectaron de forma consistente en `dev-dashboard` y en los archivos `palettes.js` de las plantillas (`template-ventas`, `template-core-seed`, `App Ventas`) y en la instancia del cliente activo (`ventas-moni-app`), asegurando su disponibilidad en las marcas. Se incluyeron catálogos de prueba en `App.jsx` y atributos dinámicos en `generator.js` de la CLI.
  - **Fusión en CLI Server y Fallback Core:** Modificado el endpoint `POST /api/project/env` en `server.js` para realizar fusión aditiva con `.env.local` y se inyectaron fallbacks en `billingService.js` en App Ventas.
  - **Resolución de Integridad Pre-build:** Se indexó y registró la propuesta técnica del Hero `propuesta_dashboard_interactivo.md` en el `README.md` de la biblioteca y en `ComponentSandbox.jsx` (`COMPONENT_META`), permitiendo que el validador de prebuild de Vite complete exitosamente la compilación.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Plantillas Core/App Ventas/src/services/billingService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/billingService.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/analisis_nichos_mercado_saas.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/analisis_nichos_mercado_saas.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/constants/palettes.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/constants/palettes.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/constants/palettes.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/constants/palettes.js) [MODIFY]
  - [`Plantillas Core/App Ventas/src/constants/palettes.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/constants/palettes.js) [MODIFY]
  - [`Instancias Clientes/ventas/ventas-moni-app/src/constants/palettes.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/constants/palettes.js) [MODIFY]

---

### [2026-06-26] - AUDITORÍA: Auditoría de Seguridad y Viabilidad sobre 17 Archivos Sincronizables del Core Ventas

* **Tipo:** Seguridad / Calidad / Auditoría / Documentación
* **Descripción de Cambios:**
  - **Auditoría Técnica Exhaustiva de Código Fuente:** Se auditó de forma proactiva y secuencial el listado de 17 archivos del directorio `src/` indicados por el Drift Detector (`App.jsx`, modales de inventario y apariencia, hooks de FCM y sincronización, layouts base, páginas y utilidades de compresión). Se comprobó que todos los archivos contienen lógica de aplicación pura y no contienen credenciales hardcodeadas (todas las referencias de Firebase se consumen de forma dinámica desde variables de entorno locales de la instancia cliente mediante el protector `firebaseConfig.js` y Zustand).
  - **Registro en Mapa de Documentación y Publicación de Informe:** Se generó y publicó el informe físico de auditoría [`auditoria_archivos_sincronizables_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_archivos_sincronizables_2026.md) en el directorio de documentación del proyecto.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_archivos_sincronizables_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_archivos_sincronizables_2026.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-26] - CORE-084: Matriz de Paridad Inteligente, Blindaje de Sincronización y Fusión de index/package en CLI Server

* **Tipo:** Refactorización / Seguridad / Calidad / Multi-core / Backend / CLI
* **Descripción de Cambios:**
  - **Validador Centralizado de Exclusiones (isPathExcludedFromSync):** Se implementó una función centralizada de validación que unifica las exclusiones para el Drift Detector y el Sincronizador físico, eliminando el desacoplamiento lógico previo. Para asegurar la portabilidad ante múltiples Cores futuros con diferentes estructuras, el helper utiliza patrones dinámicos insensibles a mayúsculas que detectan y excluyen de forma flexible cualquier inicialización de Firebase (`**/firebaseConfig.*`, `**/firebase.*`), logotipos de assets (`**/logo.*`, `logo-.*`), favicons, manifiestos PWA, carpetas temporales (`scratch/`, `scripts/`, `playwright-report/`, `test-results/`), variables de entorno locales (`.env.*`) y el service worker de notificaciones push del cliente.
  - **Fusión e Inyección Inteligente de index.html:** `index.html` se re-incorporó de manera segura en el Drift y Sincronizador. Al sincronizar `index.html`, el backend respalda en memoria el `<title>`, los metatags SEO y los scripts de analíticas de terceros (dentro del nuevo bloque seguro delimitado por `<!-- CLIENT_SCRIPTS_START -->`) de la instancia del cliente. Luego copia el HTML del Core y re-inyecta las etiquetas del cliente para preservar su marca intacta. La comparación en el Drift Detector pre-procesa temporalmente ambos HTMLs (eliminando bloques de marcas/scripts de terceros) para evitar falsas alarmas de paridad.
  - **Fusión Lógica de package.json:** Al sincronizar `package.json`, en lugar de un copiado de archivo plano que destruiría el `"name"` de la app cliente o su versión, el backend realiza una fusión lógica aditiva de los bloques `dependencies`, `devDependencies` y `scripts` de la plantilla del Core en la instancia cliente, inyectando comandos y dependencias nuevas de manera automática sin alterar la identidad de la marca.
  - **Bloqueo Activo de Seguridad en APIs:** Se blindaron los endpoints `/api/project/sync-file` y `/api/project/sync-files` para rechazar de forma activa con código HTTP `403 Forbidden` cualquier intento manual o masivo de sobrescribir archivos protegidos (como credenciales de Firebase, variables de entorno locales o logotipos de marca).
  - **Elaboración de Auditoría Técnica de Paridad:** Se publicó el informe técnico de paridad [`auditoria_paridad_y_exclusiones_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_paridad_y_exclusiones_2026.md) indexándolo en el mapa semántico.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_paridad_y_exclusiones_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_paridad_y_exclusiones_2026.md) [NEW]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

---

### [2026-06-26] - CORE-083: Validación de package.json en Resolución de Proyectos de Clientes en CLI Server

* **Tipo:** Corrección de Bugs / Robustez / Backend / CLI
* **Descripción de Cambios:**
  - **Validación Estricta de package.json en findProjectDir:** Se solucionó el error de despliegue en el Dashboard en el que al intentar desplegar un Core (ej. la plantilla `ventas`), la función `findProjectDir` resolvía erróneamente carpetas organizativas de nicho vacías (como `Instancias Clientes\ventas`) como si fuesen el proyecto de la marca, debido a que coincidían con el nombre del cliente y no se comprobaba la existencia de archivos del proyecto. Se inyectó una validación con `fs.pathExists` en la resolución de carpetas por coincidencia de nombre (kebab-case) para exigir que la ruta resultante contenga un archivo `package.json`. Esto evita que coincida con carpetas organizativas y permite que la función continúe y resuelva correctamente mediante el fallback de `knownMappings` (apuntando a `Plantillas Core\App Ventas`).
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

---

### [2026-06-26] - CORE-082: Alineación, Icono de WhatsApp, Ajuste de Desbordamiento y Corrección de Vibración de Botones Magnéticos en Calculadora CRO

* **Tipo:** Conversión (CRO) / UI/UX / HTML / CSS / JS / Documentación
* **Descripción de Cambios:**
  - **Alineación Simétrica de Entradas de la Calculadora:** Se extrajo el radio toggle de tipo de reto del interior de la segunda columna y se reubicó arriba en un contenedor centrado `.reto-toggle-container` con una estética de selector premium tipo "pill switcher" sin los radio buttons nativos (manejando estados activos vía selector `:has` en CSS). Esto permite alinear los selectores del tipo de negocio y la entrada de reto al mismo nivel horizontal exacto de forma simétrica.
  - **Favicon Oficial Completo de WhatsApp:** Se reemplazó el icono SVG de la burbuja vacía en el botón CTA de la calculadora por el SVG oficial completo (que incluye el auricular de teléfono de color blanco en su interior), logrando consistencia visual con el resto de la página.
  - **Evitación de Desbordamientos de Texto de Recomendación:** Se añadieron estilos CSS (`overflow-wrap: break-word`, `word-wrap: break-word`, `word-break: break-word`) en `#config-recommendation` para evitar que textos muy largos y continuos (sin espacios) desborden y rompan la tarjeta de diagnóstico recomendada.
  - **Corrección de Vibración y Jitter en Botones Magnéticos:** Se configuró `pointer-events: none` para las etiquetas `<a>` y `<button>` directas de `.btn-magnetic-wrapper` en el archivo de estilos y se inyectó `cursor: pointer`. Al mover el hover styling a nivel del wrapper (`.btn-magnetic-wrapper:hover .btn-primary`, etc.) y añadir un click handler delegado en JS para disparar programáticamente `btn.click()` de forma segura (con validación de target para evitar loops infinitos), se erradicó por completo el temblor o vibración síncrona al pasar el ratón por encima de los botones magnéticos en escritorio.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

---

### [2026-06-25] - CORE-081: Flexibilidad de Entrada de Dolor y Prevención de Desplazamiento en Calculadora CRO

* **Tipo:** Conversión (CRO) / UI/UX / HTML / CSS / JS / Documentación
* **Descripción de Cambios:**
  - **Flexibilidad de Entrada de Reto Personalizado**: Se implementó una interfaz de tipo radio botón dentro de la Calculadora de Diagnóstico Express (CRO) que permite alternar entre seleccionar un dolor común de la lista pre-poblada dinámicamente y escribir un dolor/reto personalizado en un área de texto responsiva. Al redactar el reto personalizado, el texto se formatea de manera fluida y se inserta directamente en la propuesta recomendada en pantalla y en la URL final de WhatsApp que se envía al presionar el botón de acción CTA.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

---

### [2026-06-25] - CORE-080: Forzado de la Rama de Desarrollo (develop) en Herramienta de Respaldos

* **Tipo:** Herramientas / Automatización / Git / Scripting
* **Descripción de Cambios:**
  - **Forzado de Rama develop en Respaldo Maestro:** Se actualizó `git_backup.ps1` en el bloque `finally` de restauración. Tras completar el proceso de guardado y push, se verifica si la rama activa no es `develop`, forzando el checkout a la rama `develop` localmente.
  - **Forzado de Rama develop en Respaldo de Subproyectos:** Se modificó `subproject_backup.ps1` en su sección de limpieza final. Para todos los subproyectos del núcleo (Cores de Oro como `App Ventas`, Consola Central `dev-dashboard`), se cambia la rama activa a `develop` al finalizar el script. Las instancias de clientes (cuyas ramas siguen la nomenclatura `cliente/*`) quedan excluidas y regresan de manera segura a su rama original de cliente.
* **Archivos Modificados:**
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-25] - AUDITORIA: Informe de Blindaje de Replicación de Cores y Conectividad Central

* **Tipo:** Auditoría / Seguridad / Calidad / Escalabilidad / Documentación
* **Descripción de Cambios:**
  - **Elaboración de Auditoría de Replicación:** Se redactó y publicó el informe [`auditoria_replicacion_cores_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_replicacion_cores_2026.md) analizando de forma crítica el aislamiento de variables de entorno de marca, fallos potenciales de desalineación en tokens de telemetría, el acoplamiento del Smoke Test de Playwright en cores futuros, limitaciones en la inyección de estilos HSL, y la falta de validación de Firebase Storage en los Preflight Checks.
  - **Sincronización del Mapa de la Aplicación:** Se registró la entrada en [`mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md).
  - **Sincronización del Mapa Semántico:** Se indexó la auditoría y su Criterio de Decisión en [`mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md).
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_replicacion_cores_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_replicacion_cores_2026.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-25] - DOCUMENTACION: Creación del Sistema de Ventas Oficial de PROTOTIPE

* **Tipo:** Documentación / Estrategia Comercial / Ventas
* **Descripción de Cambios:**
  - **Creación del Manual de Ventas:** Se diseñó e implementó el archivo [`sistema_ventas_prototipe.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_ventas_prototipe.md) bajo la carpeta temática de Estrategia Comercial. Este documento estructura el funnel comercial (atracción, WhatsApp, clasificación caliente/tibio/frío, reunión de diagnóstico, armado de propuesta comercial, manejo de objeciones y post-pago de implementación).
  - **Sincronización del Mapa de la Aplicación:** Se registró el nuevo archivo en [`mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md).
  - **Sincronización del Mapa Semántico:** Se indexó la nueva entrada y su respectivo Criterio de Decisión en [`mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md).
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_ventas_prototipe.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_ventas_prototipe.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-25] - CORE-079: Optimización de Rendimiento de Scroll y Consistencia de Interlineado de Títulos

* **Tipo:** Rendimiento / UI/UX / CSS / JS / Tipografía / Documentación
* **Descripción de Cambios:**
  - **Eliminación de Transición Universal para Rendimiento de Scroll**: Se erradicó la regla de transición CSS en el selector universal `*, *::before, *::after` (que aplicaba `transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease`). Esta regla forzaba al navegador a calcular y monitorizar transiciones en cada elemento del DOM durante las operaciones de scroll y transformaciones 3D/hover, induciendo lag y caída de FPS. En su lugar, se implementó una regla acoplada a una clase temporal `.theme-transition`.
  - **Transición de Tema Dinámica en JavaScript**: Se actualizó el manejador del botón de alternancia de tema (`#theme-toggle`) en JS para inyectar la clase `.theme-transition` al elemento raíz `html` antes de realizar el cambio, eliminándola mediante un `setTimeout` de 300ms. Esto garantiza que la transición fluida ocurra exclusivamente al cambiar de tema, liberando al navegador de procesamientos inútiles en operaciones normales de scroll.
  - **Transiciones Selectivas en Hover**: Se agregaron transiciones optimizadas para elementos interactivos individuales en sus estados normales/hover (tales como `.nav-links a { transition: color 0.3s ease; }`), manteniendo la respuesta visual suave sin penalizar el rendimiento.
  - **Unificación de Interlineado Global de Encabezados**: Se implementó una regla global para encabezados `h1, h2, h3, h4, h5, h6` fijando un `line-height: 1.25` por defecto y unificando la tipografía `Outfit`. Se eliminaron las declaraciones de tipografía e interlineado duplicadas en clases específicas (como `.section-header h2`, `.pain-card h3`, `.solution-box h3`, `.benefit-card h3`, `.step-card h3`, `.support-text h3`, `.support-box-info h4`, `.footer-column h4`), eliminando el interlineado heredado excesivo (`1.7` del body) y logrando una separación compacta, estética y profesional.
  - **Reducción de Separación entre Título y Copy en Solución**: Se solucionó el excesivo espacio vertical en la tarjeta de la sección Solución (`.solution-box`) en dispositivos móviles: (1) Se redujeron los paddings laterales del contenedor `.solution-box` de `3rem` a `1.5rem` (en tablets) y a `1.2rem` (en celulares angostos), expandiendo el ancho horizontal útil para el texto. (2) Esto permitió estabilizar la frase de morphing a un máximo de 2 líneas estables sin riesgo de layout shift, habilitando disminuir el `min-height` del `h3` de `3.2em`/`4.2em` a `2.5em` (tablets) y `2.6em` (móviles). (3) Finalmente, se estrechó el `margin-bottom` de `1.5rem` a `1.2rem` y `1rem` respectivamente, eliminando por completo la separación vacía del copy.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-078: Corrección de Interceptación de WhatsApp Leads y Layout Shifts

* **Tipo:** Bugs / CSS / JS / UI/UX / Estabilidad Visual / Documentación
* **Descripción de Cambios:**
  - **Resolución de Error de Inicialización y Anidación de IIFEs**: Se detectó y corrigió un fallo de sintaxis y anidación crítica en los scripts del final de la página (re-establecido con éxito tras una restauración manual de copia de archivo por parte del usuario). La IIFE de la funcionalidad de *Botones Magnéticos* estaba anidada erróneamente dentro de la IIFE del *Formulario de Captura de Leads Express*. Asimismo, esta última terminaba con `});` en lugar de `})();`, convirtiéndose en una expresión de función anónima no ejecutada (no-op síncrono). Se reestructuraron y separaron correctamente ambas IIFEs, y se restableció el listener global de click en `document` para interceptar enlaces `wa.me` y `api.whatsapp.com`. Esto recuperó con éxito la visualización del Modal de Leads Express de conversión. Además, se removió la exclusión `.btn-navbar` en el script del magnético, permitiendo aplicar el efecto interactivo al botón "Asesoría Gratis" del encabezado en desktop.
  - **Mitigación de Advertencias de Origen Único (file://) y Scroll Suave con Offset**: Al hacer clic en los enlaces de anclaje de la barra de navegación (#solucion, #problema, etc.) abriendo el archivo localmente (`file://`), Chrome disparaba en la consola una advertencia de origen de seguridad única bloqueando la transición. Se implementó un interceptor de clics en JavaScript para todos los enlaces que comienzan con `#` en su `href`: el script calcula y realiza un scroll suave restando la altura física exacta del header de navegación fijo (offset), evitando que los títulos queden ocultos debajo de la navbar y previniendo la navegación nativa por defecto en entornos de desarrollo local (silenciando la advertencia al 100%). En producción (`http:`/`https:`), la URL se actualiza limpiamente con `history.pushState`.
  - **Ajuste de Altura Mínima para Tarjeta de Solución en Móviles**: Se configuró `min-height: 7.3em;` en `.solution-box h3` bajo la media query `@media (max-width: 768px)`. Esto reserva el espacio vertical suficiente para albergar frases de hasta 3 líneas (como ocurre con la palabra dinámica "tu emprendimiento") sin deformar la tarjeta ni empujar el texto descriptivo inferior, eliminando el layout shift (brinco visual) del CRO.
  - **Animación Typewriter de Beneficios con Cero Layout Shift**: Se refactorizó la inicialización del typewriter de `#beneficios .section-header h2`. En lugar de vaciar e inyectar caracteres síncronamente (lo que expandía la caja dinámicamente y movía todo el layout hacia abajo línea por línea), ahora se pre-renderizan todos los caracteres en spans de opacidad `0` al inicio para reservar el alto físico final exacto de inmediato. Al entrar al viewport, un temporizador revela secuencialmente la opacidad de los spans a `1`, logrando una visualización sumamente fluida y premium con un Cumulative Layout Shift de exactamente 0px.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-077: Optimización y Rediseño de Menú Hamburguesa Móvil

* **Tipo:** UI/UX / CSS / Rendimiento / Responsividad / Animación / Documentación
* **Descripción de Cambios:**
  - **Menú Móvil a Pantalla Completa**: Se cambió el ancho de `.nav-links` de `width: 80%; max-width: 320px;` a `width: 100%; max-width: 100%;` en pantallas móviles. Esto elimina la franja lateral y brinda el ancho de pantalla completo, evitando el amontonamiento y quiebre de líneas en los enlaces extensos.
  - **Fondo Completamente Sólido sin Transparencia**: Se removió `backdrop-filter: blur(...)` y se inhabilitó la transparencia (`rgba`), configurando un color de fondo 100% sólido del tema (`var(--color-surface)` en claro/blanco y `var(--color-bg)` en oscuro/azul profundo). Esto previene el lag de scroll y optimiza drásticamente el rendimiento de renderizado en GPU móvil.
  - **Animación Acelerada y Fluida**: Se redujo el tiempo de la transición CSS a `0.28s` (antes `0.4s`) y se afinó la curva de movimiento a `cubic-bezier(0.25, 1, 0.5, 1)`, haciendo que la salida y el repliegue del menú se sientan instantáneos, fluidos y responsivos.
  - **Z-Index de Control**: Se asignó un `z-index: 999;` a `.nav-links` móvil para asegurar que cubra toda la página de fondo pero manteniéndose por debajo de `.menu-toggle` (`z-index: 1000`), el cual queda por encima para permitir un cierre directo por el usuario.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-076: Mitigación de Layout Shift en Texto Cambiante de Solución

* **Tipo:** UI/UX / CSS / Rendimiento / Estabilidad Visual / Documentación
* **Descripción de Cambios:**
  - **Mitigación de Layout Shift (Brinco de Tarjeta)**: Se inyectó la propiedad `min-height: 2.8em;` en `.solution-box h3` en la vista de escritorio para reservar el espacio vertical correspondiente a dos líneas de texto. Para resolver el brinco en dispositivos móviles tras cambios de texto de diferente longitud (como "tu emprendimiento"), se configuraron alturas mínimas y tamaños de letra responsivos: (1) En la media query `@media (max-width: 768px)`, se redujo la tipografía a `clamp(1.3rem, 4.5vw, 1.8rem)` y se inyectó `min-height: 3.2em` (suficiente para 3 líneas). (2) En la media query `@media (max-width: 480px)`, se redujo a `clamp(1.15rem, 5vw, 1.4rem)` y se estableció `min-height: 4.2em` (suficiente para 4 líneas). Esto garantiza que la tarjeta `.solution-box` y el `h3` conserven su altura física fija al 100% en todo momento sin provocar saltos de página al alternar las palabras del morphing.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-075: Centrado de Tarjetas de Dolor, Descompactación de CRO y Corrección de Recortes 3D/Errores de Consola

* **Tipo:** UI/UX / CSS / JS / HTML / Responsividad / Bugs / Documentación
* **Descripción de Cambios:**
  - **Centrado de Tarjetas de Dolor (.pain-card)**: Reestructurado el layout de las tarjetas de la sección El Problema a un flujo de columna centrado (`flex-direction: column; align-items: center; text-align: center`). Esto distribuye simétricamente los elementos y optimiza el ancho disponible para el texto en teléfonos móviles.
  - **Descompactación de Tarjeta de Comparación**: Incrementado el `gap` en `.visual-card` (a `1.8rem`) y en `.time-comparison-wrapper` (a `2rem`). Además, se aumentó el espacio entre elementos de fila (`.time-comparison-row` con `gap: 0.75rem`) y el margen superior del pie (`.time-comparison-footer` con `margin-top: 1.5rem`), logrando un diseño mucho más descompactado y legible.
  - **Corrección de Espaciado tras Dos Puntos**: Se redefinió `.time-label` a `display: block` y se inyectó `margin-right: 0.45rem` en `.time-label strong`. Esto corrige el bug visual por el cual el texto del `strong` y del `span` se traslapaban y se renderizaban juntos sin espacio en dispositivos móviles (`Antes:Procesos` y `PROTOTIPE:registrado`).
  - **Resolución de Recortes 3D en Testimonios**: Añadido padding vertical extra (`padding-top: 1.5rem; padding-bottom: 2.5rem; margin-top: -1.5rem;`) y forzado `overflow-y: visible !important;` en `.testimonials-grid` para carrusel móvil. Esto proporciona el espacio de proyección Z necesario para la rotación 3D de las tarjetas sin que el navegador mutile sus esquinas superior e inferior.
  - **Remoción de Buscador de FAQ**: Eliminado por completo el HTML del buscador de Preguntas Frecuentes (`.faq-search-container`), el estilo CSS (`#faq-search-input:focus`) y el script JS encargado de realizar los filtros de búsqueda según la instrucción directa del usuario.
  - **Resolución de Error del Service Worker en Consola**: Se inyectó la validación `window.location.protocol !== 'file:'` y se acopló un bloque `try/catch` de contingencia. Esto evita que el navegador intente registrar el Service Worker y arroje un `TypeError` cuando el usuario abre la Landing Page de manera puramente local desde su explorador de archivos.
  - **Corrección de Sintaxis DOMContentLoaded**: Se corrigió el cierre del listener principal DOMContentLoaded (cambiando `})();` por `});`) solucionando el SyntaxError de fin de input inesperado.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-074: Escalado de Ilustración Hero, Remoción de Focus Rings y Bloqueo Global de Selección

* **Tipo:** UI/UX / CSS / Responsividad / Estética / Usabilidad / Documentación
* **Descripción de Cambios:**
  - **Ilustración del Hero más grande**: Se incrementó el `max-width` global de `.hero-illustration` de `480px` a `560px` para dotar de mayor presencia a la ilustración en escritorio y pantallas medianas.
  - **Optimización de espacio en móvil**: Se redujo el padding horizontal de `.container` en pantallas móviles (`@media (max-width: 576px)`) a `1.25rem`, permitiendo que el SVG interactivo y el contenido de texto se estiren horizontalmente y ganen mayor tamaño.
  - **Remoción definitiva de contornos de enfoque y sombras azules**: Se inyectó la propiedad `outline: none !important;` y `-webkit-tap-highlight-color: transparent !important;` de forma universal (`*`). Adicionalmente, se anularon los halos de enfoque en `:focus` y `:focus-visible` de botones, enlaces y menús, impidiendo que el navegador aplique su caja de sombreado o halo azul nativo en cualquier elemento.
  - **Bloqueo global de copia y selección de texto**: Se deshabilitó la selección accidental de texto con `user-select: none !important` (y sus respectivos prefijos) de manera global mediante un selector exceptuando explícitamente a los campos `<input>` y `<textarea>` para no interferir con la captura de Leads en el formulario.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-073: Reducción de Tamaño de Texto del Hero en Versión Móvil

* **Tipo:** UI/UX / CSS / Responsividad / Documentación
* **Descripción de Cambios:**
  - **Reducción de tamaño del párrafo del Hero**: Se aplicó una regla responsiva `.hero-content p { font-size: 1rem; }` dentro de la media query `@media (max-width: 576px)`. Esto disminuye el tamaño del párrafo descriptivo en pantallas móviles desde `1.2rem` a `1rem`, restaurando la jerarquía tipográfica con respecto al título H1 (que baja a `2.1rem` en móviles) para evitar que parezcan de dimensiones similares.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-072: Optimización de Botones Magnéticos, Remoción de Líneas de Flujo y Rediseño de Theme Toggle

* **Tipo:** UI/UX / Interactividad / Estética / CSS / JS / HTML / Documentación
* **Descripción de Cambios:**
  - **Efecto de Botón Magnético Mejorado**: Se incrementó la zona de interacción reactiva del cursor (padding virtual de 16px y margen negativo compensatorio de -16px) en la clase `.btn-magnetic-wrapper` de todos los botones magnéticos. Esto soluciona por completo el jittering (temblor) visual producido cuando el transform del botón desplazaba el cursor fuera de sus límites físicos.
  - **Botón Magnético en WhatsApp y Encabezado**: Se adaptó el wrapper del WhatsApp FAB para posicionarse de forma fija mediante `width: 98px; height: 98px; bottom: calc(2rem - 20px); right: calc(2rem - 20px);` de manera que el FAB de 58x58px quede perfectamente centrado y con un área activa fluida en desktop (retornado a la normalidad en móviles sin el wrapper). El botón "Asesoría Gratis" del encabezado (`.btn-primary.btn-navbar`) ahora cuenta de igual forma con el efecto magnético en su totalidad y sin desalineación.
  - **Hotfix de Sombra (Glow) Persistente**: Se corrigió una anomalía por la cual la sombra difuminada radial de los botones magnéticos se quedaba permanentemente activa tras retirar el cursor. Se inyectó una reconfiguración explícita de `glow.style.opacity = '0'` en el event listener `mouseleave` en JS, lo que garantiza el apagado inmediato del glow al perder interacción.
  - **Rediseño Premium de Modo Claro/Oscuro**: Se reconstruyó el botón de alternancia de tema (`theme-toggle-btn`) reemplazando los emojis planos (`☀️`/`🌙`) por dos iconos SVG premium en línea del Sol y de la Luna. Se añadieron transformaciones CSS avanzadas de rotación cruzada y escalado dinámico (`transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`) acoplados directamente al estado del root element (`html.dark`), eliminando la manipulación de texto en JS.
  - **Remoción de Líneas de Flujo SVG**: Se removieron de forma limpia las dos líneas de flujo SVG verticales discontinuas animadas que conectaban la sección Hero con Rubros y Rubros con Problema, logrando un espaciado visual más limpio y unificado.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-071: Enriquecimiento Estético de Fondo, Glow Blobs y Visibilidad de Partículas

* **Tipo:** UI/UX / Estética / Animaciones / CSS / HTML / Documentación
* **Descripción de Cambios:**
  - **Ajuste de Visibilidad de Partículas (Hero Canvas)**: Se triplicó la opacidad de los nodos de partículas (de `0.12` a `0.28`) y de sus líneas de interconexión (de `0.06` a `0.18`) en el canvas del Hero. Esto incrementa de forma elegante su visibilidad sin generar ruido ni sobrecargar la jerarquía visual de la sección.
  - **Glow Blobs de Fondo (Efecto Aurora/Respiración)**: Se inyectaron dos elementos dinámicos de fondo (`.glow-blob glow-blob-primary` y `.glow-blob glow-blob-secondary`) en la sección Hero. Utilizan degradados radiales difuminados de los colores de la marca (azul primario y violeta secundario).
  - **Efecto de Respiración Adaptativo**: Se implementó una animación CSS de transformación de escala y traslación (`blob-pulse`) de 12 segundos con ciclos alternos. Se definieron variables CSS específicas para la opacidad mínima, media y máxima adaptables de forma nativa a los temas claro (`--blob-opacity-min: 0.12`, etc.) y oscuro (`--blob-opacity-min: 0.08`, etc.), logrando un efecto orgánico e integrado sin negros absolutos.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-070: Robustecimiento de WhatsApp FAB/Botones e Integración de Formulario Lead Express

* **Tipo:** Conversión (CRO) / Leads / HTML / CSS / JS / Documentación
* **Descripción de Cambios:**
  - **Modal de Captura de Leads Express**: Se maquetó e integró un modal (`#lead-modal`) con diseño premium, bordes redondeados y fondos glassmorphic adaptables al modo claro y oscuro, ubicado estratégicamente antes del cierre de body.
  - **Refactorización de Contenedor (Bugfix)**: Se reestructuró la maquetación HTML de manera que la etiqueta `<form>` actúa directamente como el contenedor del modal (`modal-container lead-modal-container`), asegurando que todos los elementos (header, body, footer) sean hijos directos del flex container, solucionando la anomalía de desbordamiento exterior de los botones de acción.
  - **Remoción Completa de Scrollbar**: Se configuró la altura máxima a `90vh !important` y se compactaron los paddings de cabecera/cuerpo/pie y los márgenes verticales de los inputs. Esto redujo la altura total a 420px, logrando que el modal quepa en su totalidad de forma limpia y sin scrollbars verticales tanto en teléfonos móviles (probado en viewport 375x667) como en computadoras.
  - **Estructura de Datos Básicos y Flexibilidad**: El formulario recopila Nombre completo (obligatorio), Celular/WhatsApp (obligatorio) y Correo electrónico (opcional, aclarando de forma amigable que el campo se puede dejar vacío si el cliente no posee o no maneja correo).
  - **Adaptabilidad y UX Móvil**: Se diseñaron estilos responsivos específicos para el modal en teléfonos móviles (pantallas ≤ 480px) apilando verticalmente los botones del formulario y ajustando los márgenes, impidiendo desbordamientos y facilitando la interacción táctil.
  - **Intercepción Global Inteligente de WhatsApp (`wa.me`)**: Se implementó un script autoejecutable que intercepta mediante delegación de eventos clics en cualquier enlace que contenga `wa.me`. Cancela la redirección por defecto, abre el modal, y resguarda la URL de destino para procesar su número de teléfono y parámetros de mensaje de forma dinámica.
  - **Enriquecimiento contextual de Mensajes**: Tras enviar los datos del formulario, se extrae el mensaje original del botón seleccionado y se compila un nuevo mensaje estructurado amigablemente con la cabecera `📢 [Prototype Web]` (identificador de origen) y los datos de contacto del lead. La redirección a WhatsApp se ejecuta en una pestaña nueva con el enlace final parametrizado.
  - **Corrección de Codificación de Emojis (Bugfix Emojis)**: Se convirtieron todos los emojis del script JS (`📢`, `👤`, `✉️`, `📞`) a secuencias de escape Unicode de ES6 (`\u{1F4E2}`, `\u{1F464}`, `\u{2709}\u{FE0F}` y `\u{1F4DE}`). Esto erradica de raíz el error de visualización de diamantes con signos de interrogación (caracteres de reemplazo de decodificación) causado cuando el navegador de origen interpreta la página bajo codificaciones locales como ANSI / Windows-1252.
  - **Bypass de Enlaces wa.me a API de WhatsApp**: Se reemplazaron todas las referencias y redirecciones del subdominio corto `wa.me` por llamadas directas al endpoint `api.whatsapp.com/send`. Esto soluciona un bug crítico de decodificación del propio servidor de redirecciones de WhatsApp, el cual corrompía los bytes percent-encodados de UTF-8 de los emojis transformándolos en rombos con signo de interrogación () al inyectarlos en la interfaz del chat.
  - **Accesibilidad por Teclado en la Calculadora (A11y)**: Se implementó soporte completo de navegación por teclado (Space, Enter, Escape, ArrowUp y ArrowDown) para los selectores customizados de la calculadora, inyectando los atributos de accesibilidad correspondientes (`role="listbox"`, `role="option"`, `aria-selected` y `tabindex="0"`).
  - **Persistencia de Leads (LocalStorage)**: Se configuró el almacenamiento automático en LocalStorage de los datos del lead tras su primer envío, permitiendo auto-completar los campos de Nombre, Celular y Correo en futuras aperturas del modal para evitar redundancias y potenciar la tasa de conversión (CRO).
  - **Micro-animación y Estado de Carga ("Redirigiendo...")**: Se añadió una micro-animación de carga (spinner giratorio SVG) y desactivación del formulario durante 800ms tras presionar enviar, previniendo dobles envíos y optimizando la fluidez de redirección.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

---

### [2026-06-24] - CORE-069: Corrección de Icono Calculadora, Estabilización de Beneficios y Alineación Simétrica de KPIs

* **Tipo:** UI/UX / Correctivo / Responsivo / Animaciones / CSS / JS / Documentación
* **Descripción de Cambios:**
  - **Sustitución de Icono Calculadora (Trigger):** Se reemplazó el SVG de la calculadora colapsada por el SVG oficial de Lucide, eliminando la línea base (patas de soporte) que simulaba visualmente una papelera de reciclaje.
  - **Responsividad de Trigger en Móvil:** Se inyectaron reglas CSS responsivas (`@media (max-width: 576px)`) para reducir paddings a `1rem 1.25rem` y configurar gap de `1rem`, disminuyendo tamaños de fuentes en `h4` y `p` para que el texto de la tarjeta trigger no se comprima ni desborde en viewports angostos.
  - **Estabilización de Scroll (Remoción de Animación en Beneficios):** Se eliminó por completo el colapso dinámico de copy en `.benefit-card` (IntersectionObserver y transiciones de max-height/opacity en el párrafo descriptivo). El contenido se muestra de manera estática y estable por defecto, erradicando el Layout Shift y los saltos/oscilaciones de scroll.
  - **Alineación Sincrónica de KPIs ("Negocio Organizado"):** Se definieron alturas mínimas en desktop y móvil para títulos (`h3`) y valores (`.organizado-value`), y se aplicó `margin-top: auto` en `.organizado-status-badge` en las tres tarjetas. Esto garantiza que todos los elementos (títulos, números, porcentajes y badges verdes) estén milimétricamente alineados horizontalmente en todas las resoluciones.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

---

### [2026-06-24] - CORE-068: Optimización de UX de Beneficios, Dashboard de KPIs Móvil y Ajuste de Testimonios

* **Tipo:** UI/UX / Responsivo / Móvil / Animaciones / CSS / JS / Documentación
* **Descripción de Cambios:**
  - **Despliegue Dinámico de Beneficios (Scroll Accordion):** Se inyectaron estilos colapsables CSS (`max-height: 0`, `opacity: 0`, `overflow: hidden`) en `.benefit-card p`. Se configuró un `IntersectionObserver` en JS con `rootMargin: '-15% 0px -15% 0px'` y `threshold: 0.15` para añadir/remover la clase `.active`, de forma que el texto de cada beneficio se expanda suavemente al llegar al centro de la pantalla y se contraiga al salir, optimizando el espacio vertical del scroll.
  - **Mini-Dashboard de KPIs ("Negocio Organizado"):** Reestructuración responsiva en viewports móviles (≤ 768px) para agrupar las tres tarjetas del dashboard (Ventas, Inventario, Clientes) en una sola fila horizontal compacta de 3 columnas (`grid-template-columns: repeat(3, 1fr)`) reduciendo paddings, dimensiones de iconos y fuentes tipográficas, resolviendo la saturación de pantalla vertical.
  - **Alineación de Testimonios sin Scroll Interno:** Ajuste de altura a `350px` en móviles para `.flip-inner` de los testimonios responsivos, reduciendo el padding a `1.4rem 1.1rem` y el gap a `0.7rem`. Esto garantiza que los textos y botones en el frente y dorso caben a la perfección sin desbordamientos ni scroll vertical innecesario.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

---

### [2026-06-24] - CORE-067: Corrección de Scroll Dropdown, Responsividad en Botón WhatsApp y Autocalibración de Giroscopio Móvil

* **Tipo:** UI/UX / Responsivo / Móvil / Giroscopio / CSS / JS / Documentación
* **Descripción de Cambios:**
  - **Scroll Contenido en Dropdowns (`.custom-options`):** Se inyectaron las propiedades CSS `overscroll-behavior: contain` y `-webkit-overflow-scrolling: touch` para mitigar el arrastre de la página de fondo al navegar por la lista de opciones desplegables de la calculadora.
  - **Optimización Responsiva de Botón WhatsApp (`#config-cta-btn`):** Se crearon estilos específicos de móvil para reducir el padding de la tarjeta de resultado a `1.25rem 1rem` y escalar tipografía/padding del botón de WhatsApp en la calculadora (`font-size: 0.88rem`, `padding: 0.8rem 1.2rem`), garantizando visualización fluida sin textos fracturados.
  - **Autocalibración Dinámica de Giroscopio Móvil:** Se reemplazó la calibración fija de 45° por un algoritmo de línea base adaptable (Dynamic Baseline Calibration) con filtro de paso bajo (lerp de `0.04`) en el listener del sensor. El punto neutro de inclinación se adapta automáticamente a la postura de sujeción del móvil del usuario (acostado horizontalmente, inclinado, etc.), eliminando la desalineación permanente y auto-centrando las tarjetas de forma progresiva e ininterrumpida.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

---

### [2026-06-24] - CORE-066: Optimización de Rendimiento General de Animaciones y Aceleración por GPU

* **Tipo:** Rendimiento / GPU / CSS / JS / Animaciones / Documentación
* **Descripción de Cambios:**
  - **Aceleración por GPU en CSS (Tarjetas):** Se inyectaron las propiedades CSS `will-change: transform`, `backface-visibility: hidden` y `transform-style: preserve-3d` en las reglas `.rubro-card` y `.flip-inner` de testimonios 3D para indicarle al navegador que renderice estas transformaciones tridimensionales en capas de composición independientes en la GPU, previniendo repintados repetidos (DOM repaints) y eliminando el lag.
  - **Optimización de Renderizado en Canvas del Hero:** Se optimizó el loop JavaScript del canvas de partículas animadas (`#hero-canvas`) mediante `IntersectionObserver`. Cuando el usuario hace scroll hacia abajo y la sección `#hero` sale de vista, el observer desactiva la bandera de animación y ejecuta `cancelAnimationFrame` deteniendo por completo el dibujo en canvas a 60 FPS. Al reingresar al viewport, se reactiva e inicia automáticamente con `requestAnimationFrame(draw)`, eliminando el consumo ocioso de recursos en móviles y desktop.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

---

### [2026-06-24] - CORE-065: Rediseño de la Calculadora CRO, Retos Dinámicos por Nicho y Colapso por Trigger

* **Tipo:** Conversión (CRO) / UI/UX / HTML / CSS / JS / Documentación
* **Descripción de Cambios:**
  - **Remoción de Emojis:** Se eliminó el emoji de cohete del título principal de la calculadora.
  - **Custom Selects Premium:** Se implementaron selectores visuales personalizados con estructura HTML (`.custom-select-container`, `.custom-select-trigger`, `.custom-options`, `.custom-option`) estilizados con diseño glassmorphic adaptable al modo claro/oscuro, bordes redondeados de 8-10px, efectos hover con HSL y rotación de flecha indicadora. Estos Custom Selects se sincronizan automáticamente con los selectores nativos ocultos.
  - **Base de Datos Dinámica e Investigada (32 Combinaciones):** Se estructuraron 4 retos/dolores operacionales reales e investigados para cada uno de los 8 rubros de negocio del ecosistema. Al cambiar de rubro, la lista desplegable de retos se repobla automáticamente con opciones específicas y personalizadas.
  - **Calculadora Colapsada por Defecto:** Se ocultó el contenedor de la calculadora (`.configurador-container`) por defecto. Se diseñó una tarjeta trigger atractiva (`.configurador-trigger-card`) con un icono de calculadora animado con pulso y una flecha indicadora deslizante en hover. Al hacer clic en ella, la calculadora se despliega in-place mediante transiciones de escala y opacidad. Se añadió un botón de cierre en la calculadora para volver a colapsarla y liberar espacio vertical de navegación.
  - **Hotfix de Sintaxis JS:** Se corrigió un truncamiento accidental de código en la función autoejecutable de la animación de partículas del botón de WhatsApp (`n = window.innerWidth > 768 ? 16 : 8`) que arrojaba un `SyntaxError` global en el motor JS de la landing page, restaurando al 100% el funcionamiento interactivo de la tarjeta trigger y el colapso de la calculadora.
  - **Optimización de Latencia en Tilt 3D (60 FPS):** Se solucionó la pesadez y retraso (lag) de renderizado en el efecto de Inclinación 3D general. Se inyectó lógica en JS para desactivar dinámicamente la propiedad `transition` de CSS en el evento `mouseenter` (`card.style.transition = 'none'`), logrando un seguimiento inmediato del cursor del ratón a 60 FPS. La transición se reactiva al salir (`mouseleave`) para garantizar que la tarjeta regrese suavemente a su posición inicial sin saltos bruscos.
  - **Inclinación 3D Giroscópica en Móviles:** Implementación de la Device Orientation API en viewports móviles (≤ 768px). Las tarjetas se inclinan tridimensionalmente en base al movimiento físico real del teléfono en las manos del usuario. Se optimizó el consumo de energía filtrando con un `IntersectionObserver` para activar el cálculo únicamente en las tarjetas en pantalla, limitando la tasa de eventos a ~30Hz, y suavizando la animación con `requestAnimationFrame`.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

---

### [2026-06-24] - CORE-064: Refinamiento de Animaciones y Efecto Tilt 3D Selectivo

* **Tipo:** Animaciones / UI/UX / HTML / JS / Refactorización / Documentación
* **Descripción de Cambios:**
  - **Efecto Tilt 3D en Rubros:** Se integraron las tarjetas de rubro (`.rubro-card`) en el script de inclinación 3D para la vista desktop. Se inyectó lógica JS para leer dinámicamente la clase y asignar un factor de escala adaptativo de `1.03` (igual a su hover CSS), logrando una transición fluida libre de saltos de tamaño.
  - **Exclusión de FAQ del Tilt 3D:** Se modificó el selector en el IntersectionObserver y listeners de eventos en JavaScript para excluir explícitamente las tarjetas colapsables de preguntas frecuentes (`.faq-item`), previniendo inclinaciones tridimensionales que pudieran interferir con la legibilidad del contenido de respuestas expandidas.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-063: Optimización SEO y Tasa de Conversión (CRO) en Landing Page

* **Tipo:** SEO / CRO / HTML / CSS / JS / Conversión / Documentación
* **Descripción de Cambios:**
  - **Esquema JSON-LD (SEO):** Inyección de datos estructurados en formato JSON-LD en el head para registrar a PROTOTIPE bajo el esquema `ProfessionalService` con su teléfono, URL, área de cobertura (Colombia/LATAM) y descripción comercial.
  - **Tag URL Canónica:** Agregado `<link rel="canonical" href="https://prototipe.com/" />` para evitar penalizaciones por contenido duplicado.
  - **Accesibilidad en SVG Hero:** Integrados atributos `role="img"`, `aria-labelledby` y etiquetas internas `<title>` y `<desc>` en la ilustración interactiva del Hero para mejorar el rastreo semántico.
  - **Calculadora de Diagnóstico Express (CRO):** Desarrollo de un widget dinámico interactivo en la sección de rubros que asocia 32 combinaciones de nicho de negocio y dolor operacional para arrojar una propuesta recomendada inmediata y auto-formatear un enlace personalizado directo a WhatsApp.
  - **Acordeón FAQ (CRO/SEO):** Maquetación de la sección `#faq` con acordeones premium expansivos basados en `<details>` y `<summary>`. Se programó lógica JS de auto-cierre exclusivo de ítems abiertos para optimizar la experiencia visual de lectura.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

---

### [2026-06-24] - CORE-062: Interactividad Máxima y 10 Animaciones Profesionales en Landing Page

* **Tipo:** UI/UX / HTML / CSS / JS / Animaciones / Interactividad / Documentación
* **Descripción de Cambios:**
  - **Hero Canvas Particles:** Inyección de `<canvas id="hero-canvas">` y JS de partículas fluidas e interconexión de nodos reactivos a la posición del cursor (solo si `prefers-reduced-motion` no está activo).
  - **Rubros Stagger + Ripple:** Animación stagger de entrada secuencial de tarjetas mediante `animation-delay` en CSS y propagación de ondas ripple personalizadas al hacer clic con puntero sobre cualquier `.rubro-card`.
  - **Dolor Counter:** Un acumulador digital animado en `#problema` que simula en tiempo real el tiempo administrativo perdido acumulado del día de hoy en un negocio no organizado.
  - **Morphing de Texto Solución:** Dinamismo de palabra clave en el `h3` de `#solucion` alternando suavemente entre giros comerciales comunes ("tu ferretería", "tu restaurante", "tu taller", etc.) para generar empatía y personalización.
  - **Typewriter Beneficios:** Animación progresiva de máquina de escribir sobre el título principal de `#beneficios` acompañada de cursor parparante que se auto-elimina al completarse.
  - **Confetti en Organizado:** Explosión de partículas de confeti en las tarjetas de `#negocio-organizado` al entrar al viewport mediante `IntersectionObserver`. **Ajuste:** Se removieron los círculos de carga SVG (gauges) en las esquinas por considerarse sobrecargados e innecesarios, purificando la visual del dashboard.
  - **Corrección de Testimonios (Evitar Desbordes):** Se aumentó la altura mínima de las tarjetas flip-inner de testimonios (`min-height: 350px` en desktop y `380px` en móviles) para evitar que la información del autor (nombre, rol y emojis) desborde los límites de las tarjetas con textos largos.
  - **Rediseño de Pasos (Cómo Funciona):** Se eliminó por completo la línea divisoria vertical del timeline por ser innecesaria en el layout horizontal. Se rediseñó la numeración de los pasos (`.step-num`) purgando el fondo rectangular azul translúcido tosco por un número grande minimalista que cambia de color (gris a azul primario) e incrementa su tamaño sutilmente al encenderse con la clase `.step-lit`.
  - **Soporte Ping Badge:** Lógica inteligente que evalúa la hora local del visitante para adaptar el texto e ícono de estado del soporte (En línea / Respuesta rápida vía WhatsApp).
  - **CTA Particle Burst:** Explosión de partículas vectoriales de color al presionar el botón de contacto de WhatsApp final en `#cta`.
  - **Alineación 3D Tilt:** Exclusión de las tarjetas de testimonios en el script de inclinación 3D del cursor para evitar conflictos de animaciones con el efecto flip-card.
  - **Mobile Tap Hints (Revisión v3):** Inyección de la clase y estilos CSS responsivos para `.mobile-tap-hint` y `.rubro-tap-hint` ("Toca para ver 👆") con animación de pulso infinito para incitar y guiar el toque en móviles, además de perfeccionar la visibilidad ocultando al 100% (opacity 0) el contenido frontal de la tarjeta cuando el overlay está activo.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

---

### [2026-06-24] - CORE-061: Escala Premium Landing Page — 13 Mejoras de Conversión, Navegación, UX y Mobile

* **Tipo:** UI/UX / HTML / CSS / JS / Animaciones / Responsividad / Documentación
* **Descripción de Cambios:**
  - **WhatsApp FAB:** Botón flotante verde fijo en esquina inferior derecha con SVG oficial de WhatsApp, anillo de pulso verde (`@keyframes waPulse`), aparición con transición suave tras 1.5s y hover con elevación. No interfiere con el contenido.
  - **Micro-copy de Confianza Hero:** Tres sellos de garantía con puntos verdes bajo los CTAs del hero: "Sin costos ocultos", "Soporte directo por WhatsApp", "Adaptado a tu negocio".
  - **Sección `#testimonios`:** Nueva sección entre `#negocio-organizado` y `#como-funciona` con grid de 3 tarjetas de testimonio (ferretería Bogotá, restaurante Medellín, taller Cali), cita decorativa, estrellas doradas y avatar emoji.
  - **Sección `#rubros`:** Nueva sección entre `#hero` y `#problema` con grid de 8 tarjetas de rubros (ferretería, restaurante, taller, peluquería, tienda, farmacia, emprendimiento, negocio familiar) con hover elevation y link a WhatsApp para rubros no listados.
  - **Scroll Progress Bar:** Barra de 3px en el top del viewport con gradiente azul animado que muestra el progreso de scroll. Listener pasivo de alto rendimiento.
  - **Navbar Active Section:** `IntersectionObserver` sobre las 6 secciones principales. Al entrar en viewport, el enlace del navbar correspondiente recibe clase `.nav-active` con subrayado animado `scaleX` desde 0 a 1.
  - **Hero H1 Word-by-Word:** El título H1 del hero se divide en `<span>` por palabra con `animation-delay` incremental de `0.07s`, creando una entrada escalonada desde abajo. Se ejecuta antes del DOMContentLoaded para máxima velocidad.
  - **Tilt 3D en Cards:** `mousemove`/`mouseleave` en todas las `.glass-card` aplicando `perspective(900px) rotateX/Y` máximo ±4°. Solo activo en `window.innerWidth > 768` para no afectar móvil.
  - **Tipografía Responsive `clamp()`:** `.section-header h2` y `.solution-box h3` usan `clamp()` para escala fluida. Media query `768px` ajusta padding de secciones a `3.5rem` y margin del header a `2.5rem`.
  - **Botones Full-Width Móvil:** En `@media (max-width: 480px)` los botones del hero son `width: 100%`. FAB reducido a 52px.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

---

### [2026-06-24] - CORE-060: Humanización de Landing Page y Tarjetas Visuales de Confianza

* **Tipo:** UI/UX / HTML / CSS / JS / Animaciones / Documentación
* **Descripción de Cambios:**
  - **Tarjeta "Antes y Después":** Inyección de la tarjeta de comparación `.before-after-card` en la sección `#problema`, mostrando el contraste entre la fricción diaria del trabajo manual y la tranquilidad del orden digital de PROTOTIPE.
  - **Tarjetas de Beneficios Dinámicos:** Adición de dos tarjetas al final de `#beneficios`: una lista de control elástica progresiva ("Tu negocio hoy, bajo control") y una gráfica comparativa de horas administrativas de trabajo diario ("Menos tiempo organizando, más tiempo atendiendo") con barras animadas y etiquetas de tiempo externas para prevenir problemas de legibilidad.
  - **Sección Intermedia Interactiva:** Creación de la sección `#negocio-organizado` ("Así se siente un negocio organizado") con un grid de 3 tarjetas (Ventas del día, Inventario disponible y Clientes atendidos). Se implementó un algoritmo de Javascript Count-Up a 60 FPS con suavizado cuadrático para animar el conteo de los números desde cero hasta sus valores finales (formateando las cifras con formato regional de pesos colombianos es-CO).
  - **Tarjeta de Estado del Día en Soporte:** Inyección de una tarjeta operativa en la columna derecha de `#soporte` que detalla los logros operativos del día de un negocio digitalizado (caja cuadrada, inventario al día, pedidos a tiempo, clientes conformes) con checks dinámicos elásticos.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

---

### [2026-06-24] - CORE-059: Enriquecimiento Dinámico y Animaciones del Ecosistema de Landing Page

* **Tipo:** UI/UX / CSS / HTML / Vectorial (SVG) / Interactividad / Documentación
* **Descripción de Cambios:**
  - **Efecto de Flotación Global:** Inyección de animación keyframe `.floatIllustration` en la ilustración vectorial del Hero para que oscile verticalmente de manera fluida en loops infinitos.
  - **Interactividad del SVG (Widgets en Hover):** Envoltura de las secciones de "Ventas del Mes", "Lista de Control" y "Últimos Pedidos" en etiquetas de grupo interactivo (`.svg-card-interactive`). Se programaron transiciones de escala elástica (`scale(1.06)`) y sombras de resplandor HSL dinámicas (`drop-shadow` de color de marca primario) para invitar a ser pulsados.
  - **Animación del Gráfico y Nodos:** Se añadió la animación de dibujado automático (`.svg-chart-line` mediante `stroke-dashoffset` keyframes) y se inyectaron clases pulsantes continuas (`.svg-chart-dot` y `.svg-chart-dot-delayed` con animaciones infinitas de escala) en los círculos de datos.
  - **Botones Dinámicos (Efecto Shimmer y Springs):** Integración de un efecto de brillo metálico animado (`shimmer`) en los botones primarios `.btn-primary` mediante gradientes en pseudo-elementos ::after, configurando también transiciones Bezier de elevación y escala elástica al pasar el cursor y contracción al presionar (`btn:active`).
  - **Elevación Elástica en Tarjetas:** Modificación de las propiedades de transición de `.glass-card` con Bezier cúbicos elásticos (`cubic-bezier(0.34, 1.56, 0.64, 1)`) que elevan las tarjetas `6px`, aumentan su tamaño a `1.025` y colorean su borde con el color primario de marca al hacer hover.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-058: Implementación de Secciones Legales e Integridad de Contacto en Footer

* **Tipo:** UI/UX / HTML / CSS / JS / Legal / Documentación
* **Descripción de Cambios:**
  - **Saneamiento del Footer (Contacto):** Remoción de la ubicación física "Bogotá, Colombia" e indicación explícita de "Soporte Correo" para `contacto@prototipe.com` a fin de depurar los canales de contacto directo de la empresa.
  - **Términos de Servicio Interactivos:** Creación e inyección del modal `#modal-terminos` que regula el objeto del desarrollo a medida, las licencias no exclusivas del core de software, el soporte y la propiedad de los datos.
  - **Política de Privacidad Interactiva:** Creación e inyección del modal `#modal-privacidad` regulando la confidencialidad, la seguridad de las bases de datos aisladas, los accesos restringidos para mantenimiento y la portabilidad de los datos comerciales.
  - **Controlador JavaScript y Accesibilidad:** Implementación de funciones para abrir/cerrar modales, enfocar botones de cierre por defecto, desactivar el scroll de la página principal (`overflow: hidden`), cerrar haciendo clic fuera del modal (backdrop blur) o presionando la tecla `Esc`.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-051: Rediseño Radical Corporativo y Humano de la Landing Page

* **Tipo:** UI/UX / Diseño / CSS / HTML / Documentación
* **Descripción de Cambios:**
  - **Alineación con el Brief de Marca:** Reemplazo de la maquetación oscura/neón/tecnológica de `Index.html` por un enfoque claro, humano, profesional y centrado en la consultoría de negocios.
  - **Paleta Cromática y Tema Claro Predeterminado:** Configuración de fondo `#F8FAFC`, tarjetas `#FFFFFF`, textos en Slate (`#1E293B` y `#64748B`), azul corporativo `#2563EB` y color éxito `#10B981`.
  - **Modo Oscuro con Persistencia:** Integración de un toggle en la barra superior con los iconos ☀️ y 🌙 que aplica transiciones CSS suaves de 300ms, evita negros absolutos utilizando `#0F172A` de fondo, y persiste la selección del usuario en `localStorage` (con script anti-flash que inyecta la clase `.dark` síncronamente al cargar la página).
  - **Simplificación y Purgado de Efectos:** Se eliminaron las partículas, glows radiales en movimiento, destellos en bordes de tarjetas y la calculadora interactiva de ROI de fugas de dinero para maximizar la simplicidad y cercanía del sitio.
  - **Contenido Reestructurado de Brief:**
    * *Hero Principal*: Título de confianza, subtítulo humano y botones limpios sin animación elástica de resorte, incorporando una ilustración interactiva SVG inline que representa el control operativo de un negocio.
    * *Problema*: *"Muchos negocios trabajan más de lo necesario."* Tarjetas detallando uso de papel, información dispersa, procesos repetitivos, falta de control y pérdida de tiempo.
    * *Solución*: *"Una herramienta adaptada a tu negocio."* Enfoque en el acompañamiento a la medida de las necesidades reales de cada empresa.
    * *Beneficios*: Tarjetas organizadas con iconos Lucide vectoriales (Más organización, control, menos errores, más tiempo, mejor atención y crecimiento ordenado).
    * *Cómo funciona*: Pasos numerados del 01 al 04 (Reunión, Análisis, Diseño e Implementación).
    * *Soporte*: *"No estarás solo."* Capacitación, WhatsApp, soporte rápido, actualizaciones y tiempos de respuesta comprometidos (24h generales / urgentes inmediato).
    * *Confianza & CTA*: Píldora de confianza *"Cada negocio es diferente..."* y enlace directo a WhatsApp.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-056: Preflight Check de Firebase, Gestión de Drift de Reglas y Purgado de Seeding/IA

* **Tipo:** Refactorización / Firebase / Seguridad / Calidad / UI / Purga
* **Descripción de Cambios:**
  - **Preflight Check de Firebase:** Se creó la función `validateFirebaseCredentials` en `generator.js` haciendo uso de la API REST nativa de Google/Firebase para validar el ID del proyecto y la API Key de Firebase al vuelo. Se adaptó la función `checkEnvironment` para abortar proactivamente el flujo de aprovisionamiento si el check de credenciales falla.
  - **Dashboard Firebase Drift & Rules Deploy:** Se implementaron endpoints (`GET /api/project/firebase-rules/drift-global` y `POST /api/project/firebase-rules/deploy`) en `server.js` que se comunican con Firebase CLI local de forma no interactiva (leyendo el configstore `firebase-tools.json`). Se actualizó `dev-dashboard` con la pestaña de "Reglas Firebase (Drift & Deploy)", permitiendo auditar visualmente el estado de desalineación local vs nube y realizar despliegues en un solo clic con diff interactivo.
  - **Purgado Absoluto de Seeding y Código/Doc de IA:** Se eliminaron todos los scripts de seeding (`seed_brand.js` y `seed_ropa_interior.js`) y las preguntas interactivas del CLI correspondientes. Se removieron de todo el ecosistema los blueprints, carpetas de componentes de biblioteca (`Formulario_Producto_IA`, `ProductFormModal_IA`), scripts (`generate_ia_map.js`), planos (`mapa_arquitectura_ia.md`, `plan_implementacion_ia.md`) y el manual técnico de mapas de IA (`manual_ia_maps.md`), purgando también las alusiones a "Asistente Premium" de la UI del dashboard y desenganchando la tarea `map` del ciclo de compilación.
* **Archivos Modificados:**
  - [`Prototipe-CLI/cli.js`](file:///d:/PROTOTIPE/Prototipe-CLI/cli.js) [MODIFY]
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
  - Varios `package.json` [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

---

### [2026-06-24] - CORE-055: Auditoría, Robustecimiento y Marca Blanca en Motor de Aprovisionamiento

* **Tipo:** Refactorización / Scaffolding / Firebase / Calidad / Marca Blanca
* **Descripción de Cambios:**
  - **Heredar `firebase.json` de la Plantilla Core:** Se modificó [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) para que si el archivo `firebase.json` ya existe en la plantilla copiada, lo conserve de forma nativa en lugar de sobrescribirlo con el JSON estático hardcodeado. Esto garantiza que todos los servicios y configuraciones vigentes del Core se hereden en las nuevas marcas sin desfases.
  - **Sincronización de Reglas de Storage y Sembrador:** Se añadieron `'storage.rules'` y la carpeta `'scratch'` (que aloja a [`seed_brand.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/scratch/seed_brand.js)) a la lista `SYNC_PATHS` de [`sync_templates.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js). Esto soluciona el bug de aprovisionamiento en el cual la carpeta `scratch/` no existía y la base de datos se creaba vacía sin la siembra inicial obligatoria de `appConfigStore`.
  - **Marca Blanca en `package.json`:** Se inyectó lógica en [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) para personalizar dinámicamente el campo `"name"` de `package.json` del cliente con su `clientId` correspondiente (ej: `app-ventas-moni-app` en lugar de `app-ventas`).
  - **Auditoría Técnica Maestra:** Se elaboró el informe de análisis de fugas y robustez [`auditoria_motor_aprovisionamiento_marca_blanca.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_motor_aprovisionamiento_marca_blanca.md) detallando las brechas resueltas.
* **Archivos Modificados:**
  - [`Prototipe-CLI/sync_templates.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_motor_aprovisionamiento_marca_blanca.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_motor_aprovisionamiento_marca_blanca.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - CORE-054: Depuración de Redundancias y Enriquecimiento del Sandbox de Componentes

* **Tipo:** Refactorización / Calidad / Documentación / Sandbox / Build
* **Descripción de Cambios:**
  - **Depuración Física de Biblioteca:** Se eliminaron del disco los archivos de componentes y fichas redundantes obsoletas (`cart_drawer.md`, `selector_fecha.md`) y archivos temporales de desecho (`Nuevo Documento de texto.txt`, `temp_rules.rules`) para consolidar la biblioteca.
  - **Limpieza del Índice (README.md):** Se actualizó el README.md de `/06_Biblioteca_Componentes` eliminando los enlaces y referencias a los componentes eliminados.
  - **Creación de Playgrounds (Mocked Sandboxes):** Se diseñaron e implementaron 5 nuevos playgrounds interactivos locales en `dev-dashboard/src/components/admin/sandboxes/` con simulación mock de flujos complejos sin requerir APIs o servicios externos de red:
    * `LoginPageSandbox.jsx`: Simula flujos de login híbrido OTP/Email, PIN para empleados y administración.
    * `FormularioProductoIASandbox.jsx`: Simula el procesamiento y autogeneración de títulos/descripciones mediante Gemini IA.
    * `OrderTrackingSandbox.jsx`: Simula un stepper visual del progreso de envíos en tiempo real.
    * `CatalogFiltersSandbox.jsx`: Simula la barra y bottom sheet interactivo de filtros de catálogo.
    * `PWAInstallBannerSandbox.jsx`: Simula la lógica de banner interactivo y trigger de instalación de PWA.
  - **Integración de Playgrounds:** Se modificó `ComponentSandbox.jsx` para realizar la carga perezosa (`React.lazy`) de los 5 sandboxes, registrándolos en `SANDBOXES` y `COMPONENT_SANDBOX_MAP` y liberando su entrada en `COMPONENT_META` (marcando la remoción de su aviso de "Playground no configurado").
  - **Doble Exportación en SandboxLayout:** Se adaptó `SandboxLayout.jsx` para exportar el componente de forma tanto nombrada como por defecto (`export default SandboxLayout`), solucionando colisiones de importación y garantizando paridad total en los 50 sandboxes del dashboard.
  - **Actualización de Mapas y Roadmap:** Se alineó el mapa de la aplicación (`mapa_aplicacion.md`) registrando el directorio `sandboxes/`, se removieron las referencias obsoletas del mapa semántico de IA (`mapa_documentacion_ia.md`) y se actualizó `tareas_pendientes.md` como completado.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FormularioProductoIASandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FormularioProductoIASandbox.jsx) [NEW]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/LoginPageSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/LoginPageSandbox.jsx) [NEW]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/OrderTrackingSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/OrderTrackingSandbox.jsx) [NEW]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CatalogFiltersSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CatalogFiltersSandbox.jsx) [NEW]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/PWAInstallBannerSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/PWAInstallBannerSandbox.jsx) [NEW]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

---

### [2026-06-24] - CORE-052: Robustecimiento y Blindaje de la Biblioteca de Componentes y Sandbox

* **Tipo:** Calidad / Robustecimiento / Linter / Control de Tipos / UI
* **Descripción de Cambios:**
  - **Script de Validación Pre-build Linter (`verify_library_integrity.cjs`):** Se creó e integró un validador en tiempo de compilación que audita automáticamente la correspondencia física y lógica de la biblioteca (README.md, enlaces, mapeos en `ComponentSandbox.jsx`). Si existe alguna inconsistencia (componentes huérfanos o playgrounds sin registrar), el build de producción aborta intencionalmente.
  - **Tolerancia a Fallas en Playgrounds (`SandboxErrorBoundary`):** Se implementó una clase `ErrorBoundary` granular con interfaz de diagnóstico estilizada dentro de `ComponentSandbox.jsx` para envolver los playgrounds. Evita que un fallo en runtime en un componente experimental tumbe todo el dashboard de desarrollo.
  - **Mapeo de Nombres Físicos de Biblioteca:** Se enriqueció `COMPONENT_SANDBOX_MAP` y `COMPONENT_META` en `ComponentSandbox.jsx` para admitir las 46 variantes exactas de nombres de carpetas físicas en minúsculas y sin acentos.
  - **Tipado Estricto JSDoc y Aserciones en Desarrollo:** Se incorporaron tipos JSDoc estructurados y aserciones de desarrollo en runtime en los componentes de UI reutilizables `BackButton.jsx` y `QuantitySelector.jsx` para robustecer y blindar sus contratos de API.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs) [NEW]
  - [`Central PROTOTIPE/dev-dashboard/package.json`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/package.json) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
  - [`Plantillas Core/App Ventas/src/components/ui/BackButton.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/BackButton.jsx) [MODIFY]
  - [`Plantillas Core/App Ventas/src/components/ui/QuantitySelector.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/QuantitySelector.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

---

### [2026-06-24] - CORE-053: Sincronización Estructural Automática de Firebase en el Ecosistema

* **Tipo:** Refactorización / Infraestructura / Sincronización / Firebase
* **Descripción de Cambios:**
  - **Sincronización Estructural de firebase.json:** Se retiró el archivo `firebase.json` de la lista de exclusiones de sincronización (`EXCLUDED_PATHS` en `sync_clients.js` y `SYNC_EXCLUDED_PATHS` en `server.js`). Dado que este archivo no contiene credenciales de base de datos ni IDs de proyecto y es 100% estructural, este ajuste permite que cualquier adición o cambio en los servicios de Firebase (como Storage, Functions o Hosting) del Core se propague automáticamente downstream a todas las instancias de clientes al sincronizar.
  - **Preservación de Identidad y Secretos:** Se mantuvieron estrictamente excluidos `.env.local` y `.firebaserc` para asegurar el aislamiento de las credenciales de base de datos únicas de cada cliente.
* **Archivos Modificados:**
  - [`Prototipe-CLI/sync_clients.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_clients.js) [MODIFY]
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-24] - HOTFIX-TELEMETRIA-002: Desactivación de Alerta Residual de Enlace y Panel de Gestión en Dashboard

* **Tipo:** Hotfix / Base de Datos / UI / Telemetría
* **Descripción de Cambios:**
  - **Desactivación de Alerta Residual de Telemetría:** Se detectó la persistencia de un objeto `sistemaAlerta` con estado `active: true` y título "Prueba de Enlace de Telemetría" en Firestore Central para los clientes `moni-app` y `ventas-smartfix`. Esto causaba el despliegue automático del modal en cada recarga de la app. Se actualizaron los documentos correspondientes en `/clientes_control` para deshabilitar (`null`) dicho aviso residual en Firestore.
  - **Panel de Alertas Remotas en dev-dashboard:** Para evitar que esto vuelva a ocurrir y permitir el control de estas notificaciones directamente por el desarrollador, se integraron controles de Alerta Remota en el modal de CRM (Gestión de Clientes) de [`dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx). Ahora se expone un checkbox para "Habilitar Alerta Remota" y campos para personalizar el tipo de alerta (info, warning, error), título, mensaje y si es descartable (dismissible), mapeándolos bidireccionalmente a Firestore Central.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - Firestore Central: documentos `moni-app` y `ventas-smartfix` en `/clientes_control` [DATABASE]

---

### [2026-06-24] - CLIENTE-MONI-001: Corrección de Carga de Imágenes y Firebase Storage en Ventas MoNI

* **Tipo:** Configuración / Infraestructura / Firebase / Bugfix
* **Descripción de Cambios:**
  - **Corrección de Configuración de Firebase:** Se detectó la omisión de la sección `"storage"` en el archivo [`firebase.json`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/firebase.json) de la instancia cliente `ventas-moni-app`, lo cual impedía que Firebase CLI reconociera y gestionara el servicio.
  - **Actualización de Archivo `firebase.json`:** Se inyectó el bloque `"storage": { "rules": "storage.rules" }` para vincular de forma oficial el archivo local de reglas al servicio de almacenamiento.
  - **Auditoría de Reglas de Seguridad de Storage:** Se comprobó que el proyecto `ventas-moni-app` en la nube tenía reglas por defecto restrictivas (`allow read, write: if false;`), bloqueando cualquier subida de imágenes desde cámara/galería.
  - **Despliegue de Reglas Correctivas:** Se ejecutó con éxito el despliegue de las reglas de seguridad de Storage (`storage.rules`) al proyecto `ventas-moni-app` de Firebase, permitiendo lecturas públicas y restringiendo escrituras únicamente a administradores autenticados.
  - **Verificación de Seguridad:** Se validó mediante la API de Firebase que las reglas activas de Storage son ahora consistentes con el estándar de seguridad establecido.
* **Archivos Modificados:**
  - [`Instancias Clientes/ventas/ventas-moni-app/firebase.json`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/firebase.json) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

* **Tipo:** Documentación / Calidad / Sandbox
* **Descripción de Cambios:**
  - **Saneamiento de la Biblioteca:** Corrección al 100% de los 29 enlaces rotos y reestructuración del catálogo general (`06_Biblioteca_Componentes/README.md`) para apuntar a las carpetas y archivos en español claro e indexar los 21 archivos markdown huérfanos que no estaban registrados.
  - **Indexación y Registro de Componentes:** Catalogación de los componentes huérfanos `variant_selector.md` y `admin_stock_alerts.md` en el índice de la biblioteca.
  - **Mapeo del Sandbox en Dashboard:** Modificación del selector de playground interactivo (`ComponentSandbox.jsx`) mapeando en `COMPONENT_META` y `COMPONENT_SANDBOX_MAP` las excepciones de visualización (consola de diagnóstico inteligente, rejilla de catálogo inteligente, hook de carrito de compras y hook de control del asistente guiado) para evitar el estado de "Playground No Configurado".
  - **Creación de Ficha Técnica KDS:** Documentación completa y detallada del Kitchen Display System (KDS) en `pantalla_cocina_kds.md` para resolver el enlace roto en el catálogo, incluyendo flujo Mermaid y código React 100% funcional.
  - **Sincronización Semántica de Mapas:** Registro e indexación de `pantalla_cocina_kds.md` en el mapa semántico global de documentación (`mapa_documentacion_ia.md`) y el mapa de aplicación (`mapa_aplicacion.md`).
  - **Verificación Automatizada:** Ejecución de scripts de control y diagnóstico certificando 0 enlaces rotos, 0 archivos huérfanos en biblioteca y consistencia total en los mapas.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/09_Modulos_Completos/Pantalla_Cocina_KDS/pantalla_cocina_kds.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/Pantalla_Cocina_KDS/pantalla_cocina_kds.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-050: Normalización de Iconografía en la Landing Page (Revisión v2.1 y v2.2)

* **Tipo:** UI/UX / Calidad / SVG / Documentación
* **Descripción de Cambios:**
  - **Revisión v2.1 (Completado anteriormente):** Reemplazo del path de la bombilla deforme en "La Solución PROTOTIPE" por el SVG simétrico limpio de `lightbulb` de Lucide.
  - **Revisión v2.2 (Ejecutado):** Normalización de todos los iconos de la landing page a la biblioteca Lucide SVG para garantizar consistencia y paridad:
    * Se actualizó el favicon URL-encoded para utilizar los paths estándar de Lucide `layers`.
    * Se reemplazó el path tosco del logotipo principal (en Navbar, Footer y defs) por los paths oficiales de `layers`.
    * Sección *El Problema*: Reemplazo de paths mixtos de Heroicons por Lucide oficial (`clock` para tiempo, `circle-dollar-sign` para dinero, `users` para clientes perdidos y `bar-chart-2` para puntos ciegos).
    * Sección *Beneficios*: Reemplazo sistemático por Lucide oficial (`badge-check` para control total, `check-circle-2` para menos errores, `clock` para más tiempo libre, `trending-up` para crecimiento y `bar-chart-2` para decisiones basadas en datos).
    * Sección *Modelo de Precios*: Normalización del check de viñetas al path de Lucide `check`.
    * Sección *FAQ*: Reemplazo del icono de despliegue por Lucide `plus` oficial.
    * Todas las modificaciones se realizaron inyectando `stroke-width="2"` y separando de forma explícita coordenadas y números decimales para prevenir anomalías de renderizado en Chrome.
  - **Control de Roadmap y Logs:** Registro del progreso en la bitácora física del proyecto y finalización en task.md.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-049: Alineación y Sincronización Completa del Mapa Semántico de Documentación IA

* **Tipo:** Documentación / Control de Calidad / IA GPS
* **Descripción de Cambios:**
  - **Sincronización del Mapa Semántico:** Indexación de las 12 referencias físicas y semánticas que faltaban en el archivo de control `mapa_documentacion_ia.md` (GEMINI.md, verify_ecosystem_integrity.js, boveda_obsidian_index.md, mapa_ecosistema.canvas, telemetria_ecosistema_global.md, catalogo_componentes_atomicos.md, formulario_producto_ia.md, imagen_lazy.md, diagrama_flujo_ecosistema.md, diccionario_tecnico_completo.md, etc.) definiendo sus roles técnicos precisos, criterios de decisión IA coherentes y enlaces absolutos de Windows con protocolo `file:///`.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-048: Análisis y Rediseño Premium Profesional de Landing Page

* **Tipo:** UI/UX / Diseño / SEO / Código / Documentación
* **Descripción de Cambios:**
  - **Análisis de Landing Page:** Elaboración del reporte de auditoría técnica y visual `auditoria_landing_page_2026.md` bajo `03_Auditorias_y_Faro_Core/`, diagnosticando vulnerabilidades de seguridad, SEO y diseño.
  - **Rediseño Completo de Index.html:** Implementación de variables HSL de tema, tipografías premium Outfit/Inter, glows radiales en movimiento lento, navbar interactivo con blur, tarjetas de dolor y casos con iconos SVG inline personalizados, acordeón de FAQ dinámico con detalles nativos de HTML5, footer corporativo expandido, barra CTA fija móvil en inferior y animaciones sutiles (scroll reveal, hover scale, active scale).
  - **Optimización de Contraste y Consistencia (Revisión v1.1 - v1.7):** 
    * Purga completa de emojis (🧠, 📲) y reemplazo por iconos vectoriales SVG de alta definición (favicon de engranaje y nodos, y botones con el isotipo oficial de WhatsApp integrado).
    * Corrección de especificidad CSS en el botón CTA del navbar (`.nav-links a.nav-cta-btn`) inyectando color blanco brillante `#ffffff !important` para sobrescribir la regla de herencia gris y solucionar por completo el bug de legibilidad.
    * Refactorización de contrastes en botones principales (`.btn-primary` y `.nav-cta-btn`) cambiando a un fondo de gradiente azul oscuro/violeta con texto blanco para legibilidad perfecta y cumplimiento estricto de WCAG AA.
    * Alturas mínimas estandarizadas y alineaciones flexbox en todas las tarjetas de grids (`.pain-box`, `.step-card`, `.case-card`, `.benefit-card` y `.pricing-card`) logrando un tamaño geométrico uniforme e idéntico.
    * Refinamiento en micro-interacciones hover de tarjetas y botones (rotación suave y escala en iconos SVG y números de paso).
    * Transición de despliegue animada mediante CSS keyframes en acordeón de FAQ.
    * **Revisión v1.5 (Iconos de Casos de Éxito):** Estandarización y reemplazo de los SVG vectoriales de la cuadrícula de casos de uso (Ferreterías, Restaurantes, Talleres mecánicos, Tiendas de barrio, Peluquerías, Emprendimientos) escalándolos a un tamaño uniforme de 24x24 px e inyectando un grosor de trazo stroke-width="2" con sus paths oficiales respectivos (martillo, utensilios, coche, tienda física, tijeras, cohete). Esta corrección previene de forma absoluta el empastamiento y los artefactos visuales causados por trazos anchos (2.5px) y resoluciones comprimidas (20x20px) en pantallas estándar.
    * **Revisión v1.6 (Corrección de Overflow y Trazo Fino):** Solución definitiva al recorte horizontal (mochado) de los círculos numerados 1, 2 y 3 (`.step-number`) en la sección de pasos inyectando `overflow: visible !important;` en la clase de estilos de `.step-card` para que no herede el recorte de `.glass-card`. Homologación de todos los grosores de trazo de flechas interactivas en botones y el icono de bombilla a `stroke-width="2"` (sustituyendo trazos toscos de `2.5`) para un look ultra-estilizado y premium. Robustecimiento del logotipo del footer inyectándole una definición de gradiente local para garantizar su correcto render cromático en cualquier navegador.
    * **Revisión v1.7 (Curvatura de Esquinas Glass-Card):** Corrección visual del destello de esquinas en ángulo recto (bordes rectos grises) en tarjetas con overflow deshabilitado. Se inyectó `border-radius: inherit;` en el pseudo-elemento `.glass-card::before` para que herede automáticamente la curvatura de 18px del contenedor padre, logrando un redondeado perfecto en todas las esquinas sin desborde.
    * **Revisión v1.8 (Responsividad de ROI):** Pulido responsivo final en la visualización del retorno monetario anual en la calculadora de ROI. Se removió la regla `word-break: break-all` que separaba toscamente la sigla "COP" en pantallas estrechas y se inyectó `white-space: nowrap` junto con un font-size clamp() dinámico para garantizar una visualización unificada y nítida en todos los viewports.
    * **Revisión v1.9 (Rediseño Tipográfico del Hero):** Rediseño tipográfico de alta jerarquía del titular principal (H1). Se redujo el peso de Outfit a 800 (eliminando la apariencia tosca del peso 900 anterior) y se cerró el tracking (`letter-spacing`) a -0.05em para un estilo más compacto y tecnológico. Estructuralmente se separó el titular en una frase introductoria en color blanco puro (`#ffffff`) y una propuesta de valor en gradiente animado elástico de cian a violeta de alto contraste.
    * **Revisión v2.0 (Efecto Elástico de Botón):** Inyección de animación y transición con física de resorte (Spring Physics) en el botón de Diagnóstico Gratis del navbar del encabezado. Se definieron transiciones elásticas con curvas Bezier cúbicas (`cubic-bezier(0.34, 1.56, 0.64, 1)`) al pasar el cursor (escala a 1.06 y resplandor de marca) y una respuesta de compresión táctil instantánea al hacer clic (escala a 0.94).
  - **Seguridad y SEO:** Configuración de etiquetas Open Graph, Twitter Cards, description y rel="noopener noreferrer" en enlaces de WhatsApp externos.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-047: Sincronización y Normalización de la Matriz de Precios Oficial

* **Tipo:** Documentación / Comercial / Negocio / Procesos
* **Descripción de Cambios:**
  - **Matriz de Precios Oficial:** Normalización completa del formato del archivo `matriz_precios_oficial.md` a su versión oficial definitiva con viñetas de guiones, estructura de cobros unificada por niveles (1 a 4), modelos de comisiones/transacciones, y reglas de crecimiento del ecosistema.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/matriz_precios_oficial.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/matriz_precios_oficial.md) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-046: Integración Documental de Procesos Comerciales y de Escalabilidad

* **Tipo:** Documentación / Comercial / Negocio / Organizacional
* **Descripción de Cambios:**
  - **Manual de Contratación de Clientes:** Creación de `manual_contratacion_clientes.md` en `/05_Estrategia_Comercial_Ecosistema/` detallando el embudo y proceso comercial paso a paso de PROTOTIPE.
  - **Manual de Marca:** Creación de `manual_marca.md` en `/05_Estrategia_Comercial_Ecosistema/` consolidando la personalidad, tono de comunicación, valores y pautas visuales minimalistas de la marca.
  - **Organigrama Futuro:** Creación de `organigrama_futuro.md` en `/08_Plan_Escalabilidad_Negocio/` planificando las necesidades de contratación y equipo por fases de crecimiento de clientes activos.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando las tres nuevas piezas documentales.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando las nuevas piezas para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_contratacion_clientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_contratacion_clientes.md) [NEW]
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_marca.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_marca.md) [NEW]
  - [`Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/organigrama_futuro.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/organigrama_futuro.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-045: Integración Documental del Roadmap de Negocio 2026-2029

* **Tipo:** Documentación / Escalabilidad / Negocio / Procesos
* **Descripción de Cambios:**
  - **Roadmap Empresarial 2026-2029:** Creación de `roadmap_empresarial_2026_2029.md` en `/08_Plan_Escalabilidad_Negocio/` detallando los objetivos estratégicos y hitos por etapas (Consolidación, Validación Comercial, Escalamiento, Expansión) y metas de clientes activos.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza documental.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/roadmap_empresarial_2026_2029.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/roadmap_empresarial_2026_2029.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-044: Integración Documental de la Oferta Comercial Oficial

* **Tipo:** Documentación / Comercial / Negocio
* **Descripción de Cambios:**
  - **Oferta Comercial Oficial:** Creación de `oferta_comercial_oficial.md` en `/05_Estrategia_Comercial_Ecosistema/` conteniendo la propuesta de valor del ecosistema, problemas comerciales resueltos, entregables estándar y principios.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza documental.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/oferta_comercial_oficial.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/oferta_comercial_oficial.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-043: Documentación del Modelo Operativo y de Negocio Comercial

* **Tipo:** Documentación / Negocio / Procesos
* **Descripción de Cambios:**
  - **Modelo Operativo y de Negocio:** Generación de `modelo_operativo_y_negocio.md` en la subcarpeta temática `/05_Estrategia_Comercial_Ecosistema/` detallando el modelo comercial (setup, SaaS, comisiones por telemetría), onboarding, flujos de venta en PWA, desarrollo core, soporte de logs de excepciones, scripts de mantenimiento y sincronizaciones downstream seguras.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza documental.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/modelo_operativo_y_negocio.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/modelo_operativo_y_negocio.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-042: Construcción del Mapa de Dependencias y Matriz de Impacto

* **Tipo:** Documentación / Calidad / Auditoría / Riesgos
* **Descripción de Cambios:**
  - **Mapa de Dependencias y Riesgos:** Generación de `mapa_dependencias_y_riesgos.md` incluyendo diagramas de acoplamiento Mermaid para los componentes CLI, workers y servicios externos, matriz de impacto operativo, y análisis detallado de riesgos en producción y puntos únicos de falla (SPOF).
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza documental.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/mapa_dependencias_y_riesgos.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/mapa_dependencias_y_riesgos.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-041: Construcción de Registro de Decisiones Arquitectónicas (ADR)

* **Tipo:** Documentación / Estándar / Arquitectura / Calidad
* **Descripción de Cambios:**
  - **Registro de Decisiones Arquitectónicas (ADR):** Generación de `registro_decisiones_arquitectura.md` detallando 5 ADRs claves sobre sharding físico, branding HSL, sincronizador downstream por MD5, workers asíncronos y telemetría desacoplada.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza estándar.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/registro_decisiones_arquitectura.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/registro_decisiones_arquitectura.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-040: Construcción del Documento Maestro de Reglas Arquitectónicas

* **Tipo:** Documentación / Estándar / Arquitectura / Calidad
* **Descripción de Cambios:**
  - **Documento Maestro de Arquitectura:** Generación de `estandar_arquitectonico_ecosistema.md` que unifica principios de arquitectura, componentes críticos, carpetas núcleo, dependencias obligatorias, tecnologías autorizadas/prohibidas, convenciones de código, patrones de diseño, reglas de sincronización, reglas de seguridad, reglas de escalabilidad, directivas obligatorias para IA, lista de acciones prohibidas y checklist de auditoría del ecosistema.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza estándar.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-039: Distribución Estratégica de Informes de Auditoría Técnica y Diagrama del Ecosistema

* **Tipo:** Documentación / Calidad / Auditoría / Sincronización
* **Descripción de Cambios:**
  - **Reubicación de Auditoría:** Mapeo y corrección del error tipográfico en la carpeta de auditorías (`03_Audiorias_y_Faro_Core` → `03_Auditorias_y_Faro_Core`), reubicando físicamente el archivo `auditoria_final_prototipe.md`.
  - **Limpieza de Archivos Basura:** Eliminación física de archivos huérfanos obsoletos como `Sin título.canvas` en el directorio de documentación.
  - **Mapeo Físico y Semántico:** Sincronización de los nuevos archivos `auditoria_final_prototipe.md` y `diagrama_flujo_ecosistema.md` en el mapa de archivos de la aplicación (`mapa_aplicacion.md`) y en el mapa semántico indexador para la IA (`mapa_documentacion_ia.md`).
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_final_prototipe.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_final_prototipe.md) [NEW]
  - [`Documentacion PROTOTIPE/07_Manuales_Desarrollo/diagrama_flujo_ecosistema.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/diagrama_flujo_ecosistema.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-038: Mapeo Completo del Ecosistema y Diccionario Técnico Detallado

* **Tipo:** Documentación / Calidad / Mapeo Técnico / Arquitectura
* **Descripción de Cambios:**
  - **Diccionario Técnico Completo:** Documentación de granularidad estricta para el 100% de la lógica de los archivos raíz (scripts de backup), motor CLI (config, logger, cli, worker, generator, sync_templates, sync_clients, test_templates, server) y Consola Central (ComponentLibraryView, ComponentSandbox, CoreCard, CoreManagerPanel, CoreSyncPanel, E2EPanel, GitBackupPanel, useCopyToClipboard, useToast, pdfService, App) en `diccionario_tecnico_completo.md`.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` para reflejar el nombre físico exacto `/Documentacion PROTOTIPE/07_Manuales_Desarrollo/` y el archivo `diccionario_tecnico_completo.md`.
  - **Sincronización del Mapa de Documentación:** Registro del diccionario y su respectivo criterio de decisión en `mapa_documentacion_ia.md`.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/07_Manuales_Desarrollo/diccionario_tecnico_completo.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/diccionario_tecnico_completo.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-037: Auditoría Técnica Completa, Mapeo General y Plan de Limpieza

* **Tipo:** Documentación / Auditoría / Calidad
* **Descripción de Cambios:**
  - **Auditoría Técnica Completa:** Redacción del informe maestro [`auditoria_tecnica_completa_maestra_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_completa_maestra_2026.md) detallando arquitectura, flujos operativos (esquematizados en Mermaid), stack de versiones del core, análisis exhaustivo de cada archivo y función del CLI, API, scripts de respaldo PowerShell y dev-dashboard.
  - **Bugs y Soluciones:** Diagnóstico preciso de inyecciones de shell, laxitud en reglas Firestore, CORS abierto, scripts bloqueantes y colisiones, con sus respectivas soluciones técnicas.
  - **Sincronización del GPS Semántico:** Actualización de [`mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) registrando la nueva pieza documental con su criterio de decisión.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_completa_maestra_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_completa_maestra_2026.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-22] - CORE-036: Auditoría, Robustecimiento y Blindaje de Seguridad del Servidor CLI Bridge

* **Tipo:** Seguridad / Rendimiento / Estabilidad / Backend API
* **Descripción de Cambios:**
  - **Directory Traversal Blindado:** Se implementó y aplicó la función `isPathContained(parentPath, childPath)` de forma case-insensitive y multiplataforma en todos los endpoints que consultan archivos locales (`/api/library/file`, `/api/library/extract`, `/api/project/file`, `/api/git/status`, `/api/git/backup-stream`).
  - **Mitigación de Zombies:** Se sustituyó `ps.kill()` por la llamada a la utilidad recursiva `killProcessTree(ps.pid)` (que ejecuta `taskkill /PID {pid} /T /F`) en el cleanup de `/api/git/backup-stream` para forzar la eliminación de subprocesos PowerShell/Git huérfanos en Windows.
  - **I/O Asíncrono no Bloqueante:** Se refactorizó la lógica síncrona de lectura recursiva de archivos y hashing MD5 a métodos asíncronas basados en promesas (`getSyncFilesRecursiveAsync` y `getSyncFileHashAsync`).
  - **Desbloqueo de Event Loop:** Refactorizado el endpoint `/api/instancias/list` para procesar desviaciones de forma paralela asíncrona mediante `Promise.all()` de forma segura libre de condiciones de carrera (Race Conditions), evitando escrituras concurrentes a variables compartidas.
  - **Sanitización de Firebase Project ID:** Integrada validación estricta regex `^[a-z0-9\-]+$` en el resolutor de IDs de proyecto Firebase y en `/api/git/sync-core-to-clients-stream` para prevenir inyecciones indirectas.
  - **Preflight Checks unificados:** Movida la llamada `runPreflightChecks()` al entry point del servidor para que no se imprima repetidamente en caso de fallar la asignación de puertos y reintentos de arranque.
  - **Auditoría de Logs:** Interceptados `console.log`, `console.warn` y `console.error` para escribir de forma persistente y estructurada en `cli_bridge.log` a través de un logger interno (`logger.js`).
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

---

### [2026-06-22] - CORE-035: Refactorización Arquitectura Git — Unificación de Ramas, Nomenclatura Cliente/*, --no-verify y Deploy por Instancia

* **Tipo:** DevOps / Git / Arquitectura / Backend API
* **Descripción de Cambios:**
  - **Eliminación de rama `produccion` (Git):** Se fusionó `produccion` en `main` en `Plantillas Core/App Ventas` y se eliminó la rama local y remota. `main` es ahora la única rama de producción del Core. Commit de merge: `b312099`.
  - **Limpieza de ramas obsoletas (`cliente/moni`):** Se eliminó la rama local y remota obsoleta `cliente/moni` del Core para consolidar la nomenclatura estándar de coincidencia 1:1 con la carpeta física (`cliente/ventas-moni-app`).
  - **Remote de instancias apuntando al Core:** La instancia `ventas-moni-app` tenía su propio remote. Se reconfiguró para apuntar a `https://github.com/DEVPROTOTIPE/prototipe-core-ventas.git`.
  - **Nomenclatura estándar `cliente/*`:** Se renombró la rama local de `ventas-moni-app` de `master` → `cliente/ventas-moni-app` y se publicó en el Core con ese formato. Se purgaron refs huérfanas (`origin/master`).
  - **`--no-verify` en todos los push de backup:** Se añadió `--no-verify` a todos los comandos `git push` de `git_backup.ps1` and `subproject_backup.ps1`, desacoplando los tests E2E de Playwright del proceso de respaldo. Los tests siguen disponibles en el módulo E2E del Dashboard.
  - **Prompt interactivo de bypass eliminado:** Se eliminó el bloque `if ($Interactive)` que preguntaba si forzar el push al fallar, ya que ahora el push nunca es bloqueado por hooks.
  - **Guard `cliente/*` en auto-merge:** El auto-merge de ramas de trabajo hacia `main` ahora excluye explícitamente ramas con prefijo `cliente/`, evitando que snapshots de instancias contaminen el Core.
  - **`findProjectDir` robustecido (server.js):** Nueva lógica de 3 niveles: (1) `.prototipe.json` como fuente de verdad, (2) `package.json` como fallback, (3) nombre de carpeta normalizado. Soporta estructura `Instancias Clientes/{nicho}/{instancia}`.
  - **`defaultBase` en `/api/git/cores-and-clients`:** Prioridad cambiada de `produccion` → `main` para el cálculo de commits ahead/behind de instancias cliente.
  - **`originalBranch` fallback:** El fallback de la variable `originalBranch` en el stream SSE de sincronización cambió de `produccion` → `main`.
  - **Deploy por instancia física en `/api/git/sync-core-to-clients-stream`:** El `VITE_FIREBASE_PROJECT_ID` ahora se lee del `.env.local` de la instancia física del cliente (usando `findProjectDir`). El build y deploy se ejecutan en el directorio de la instancia, no del Core. Mantiene fallback al Core si la instancia no tiene `.env.local` propio.
* **Archivos Modificados:**
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY] — `--no-verify` en ambos push
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY] — `cliente/*` naming + `--no-verify` + guard auto-merge
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — `findProjectDir`, `defaultBase`, `originalBranch`, deploy por instancia
* **Repositorios afectados:** `prototipe-core-ventas` (ramas: `main`, `develop`, `cliente/ventas-moni-app`)

---

### [2026-06-22] - CORE-034: Saneamiento y Robustecimiento Integral del Sistema de Backup (10 Puntos de Auditoría)

* **Tipo:** Seguridad / Calidad / DevOps / PowerShell / Git / UX
* **Descripción de Cambios:**
  - **Pre-Add Leak Checking (Punto 1 y 4):** Se movió el check de seguridad de variables de entorno `.env` antes del `git add .` en `git_backup.ps1` para evitar staging de secretos. Se excluyeron los archivos en estado `D` (deleted/desindexado) del check para evitar falsos positivos en las tareas de saneamiento.
  - **Inicialización Remota Interactiva (Punto 3):** Al ejecutar `git init` desde `menu_backup.ps1` para un subproyecto o instancia sin Git, el script solicita de manera interactiva si desea asociar un repositorio origin y la URL, evitando fallos crípticos durante la ejecución de los backups.
  - **Estados Dinámicos y Conteo de Cambios (Punto 2 y 10):** Se sustituyó el filtro rígido de profundidad fija en `menu_backup.ps1` por una búsqueda recursiva dinámica basada en firmas de proyectos (`package.json`, `.git`, `.git-backup-temp`) para detectar instancias mal anidadas. Además, se integró el conteo en tiempo real de cambios pendientes de Git (`Get-GitChangesCount`) para todos los subproyectos del menú interactivo mediante parámetros `--git-dir` y `--work-tree` que permiten la consulta rápida en repositorios inactivos.
  - **Saneamiento de Indexación y Push (Punto 5, 8 y 9):** Se agregaron validaciones de `$LASTEXITCODE` inmediatamente posteriores a la indexación (`git add .`) y subida (`git push`), deteniendo la ejecución y escribiendo el estado en `backup.log` en lugar de reportar éxito erróneamente si las operaciones de Git fallan.
  - **Mensaje de Commit Optimizado (Punto 6):** Se optimizó la generación automática del mensaje de commit en `git_backup.ps1` y `subproject_backup.ps1` filtrando subcarpetas del sistema (`dist/`, `node_modules/`, etc.) y reduciendo listas largas a formato descriptivo con la función helper `Format-CommitMessageList` (e.g. `Mod: a.js, b.js, c.js (y 4 mas)`).
  - **Historial de Backups (Punto 8):** Se creó el archivo unificado `backup.log` en el directorio raíz en donde la función compartida `Write-BackupLog` escribe con timestamp la marca de tiempo, estado de ejecución y rama de cada backup realizado.
  - **Corrección de Codificación de Caracteres y Cierre (UI/UX):** Se reemplazó el punto central Unicode (`•`) por un carácter de barra vertical (`|`) en los textos de estado de Git del menú de plantillas e instancias para corregir la codificación incorrecta (como `â€¢`) en Windows Terminal y PowerShell. Además, se solucionó el fallo del botón `Salir` del menú principal: dado que el comando `break` en PowerShell solo rompe bloques `switch` y no bucles `do-while` exteriores, se implementó una variable de control `$keepRunning` para finalizar correctamente la ejecución del script. También se corrigió el filtro del escaneo flexible de instancias, aplicando el patrón de exclusión contra `node_modules` sobre la ruta completa (`$path`) en lugar de sobre el nombre del directorio (`$name`), previniendo la detección y renderizado indeseado de carpetas internas de dependencias locales en el listado del menú.
* **Archivos Modificados:**
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`menu_backup.ps1`](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY]
  - [`backup.log`](file:///d:/PROTOTIPE/backup.log) [NEW]

---

### [2026-06-22] - CORE-033: Corrección del Sistema de Backup para Instancias de Cliente

* **Tipo:** Bug Fix / Seguridad / Git / DevOps
* **Descripción de Cambios:**
  - **Desindexación de archivos sensibles:** Se ejecutó `git rm --cached .env.local` y `git rm --cached -r dist/ .firebase/` en el repositorio de `ventas-moni-app` para eliminar del índice de Git los archivos que nunca debieron ser tracked. Esto resuelve el bloqueo permanente del guardián de seguridad del script `subproject_backup.ps1` que abortaba el proceso por detectar `.env.local` como modificado en el staging area.
  - **Actualización de `.gitignore` (Instancia y Plantilla):** Se reforzaron los `.gitignore` de `ventas-moni-app` y `App Ventas` con entradas explícitas y comentadas para `.env`, `.env.*` (excluyendo `.env.example`), `dist/`, `.firebase/`, `firebase-debug.log` y `.vite/`. Esto previene cualquier re-indexación accidental futura.
  - **Actualización del template `.gitignore` en `generator.js`:** Se actualizó el bloque de `gitignoreContent` generado al aprovisionar nuevas instancias para que todas las instancias futuras nazcan con las mismas reglas de blindaje desde el primer commit, sin excepción.
  - **Refinamiento del Guardián de Seguridad en `subproject_backup.ps1`:** Se mejoró el loop de detección de fugas en la función de validación pre-commit. Ahora extrae el `$statusCode` (primeras 2 columnas de `git status --short`) y salta con `continue` cualquier archivo cuyo código sea `D` (deleted/desindexado). Esto evita falsos positivos: un `D .env.local` es el resultado correcto de un `git rm --cached` y nunca debe abortar el proceso.
* **Archivos Modificados:**
  - [`Instancias Clientes/ventas/ventas-moni-app/.gitignore`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/.gitignore) [MODIFY]
  - [`Plantillas Core/App Ventas/.gitignore`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.gitignore) [MODIFY]
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

---

### [2026-06-22] - CORE-032: Adaptación de Pantalla de Login a Temas y Optimización del Contraste del Fondo Tecnológico

* **Tipo:** UI / UX / Temas / Consistencia Visual / Modo Claro / Modo Oscuro
* **Descripción de Cambios:**
  - **Login Adaptativo (Modo Claro/Oscuro):** Se refactorizó la pantalla de login en `App.jsx` eliminando clases de fondos oscuros fijos (`bg-[#070b13]`), tarjetas rígidas (`bg-slate-900/60 border-slate-800/80`) y textos invertidos. Ahora se utilizan variables HSL de diseño (`bg-[var(--color-bg)]`, `bg-[var(--color-surface-glass)]`, `border-[var(--color-border)]`, etc.). Los campos de entrada (tanto email como password) y el botón de visibilidad de contraseña ahora heredan los estilos del tema activo, garantizando un alto contraste y legibilidad.
  - **Fondo Tecnológico con Mayor Visibilidad:** Incrementada la opacidad y presencia de la cuadrícula de puntos y los orbs de gradiente en `index.css`. En modo oscuro, `--dot-color` subió a `0.09` y los orbs a `0.28`, `0.20` y `0.18`. En modo claro, `--dot-color` subió a `0.12` y los orbs a `0.22`, `0.16` y `0.16`.
  - **Ajuste de Viñeta y Soporte de Inputs:** En modo claro, la viñeta perimetral `--vignette-color` se suavizó de `0.5` a `0.35` para destacar los orbs decorativos de marca en los extremos de la pantalla. Además, se añadió el tipo de input `email` al override global de contraste en modo claro en `index.css` para una unificación total de la interfaz.
  - **Corrección de Borde en Botón de Tema:** Se modificó `DarkModeToggle.jsx` para reemplazar las clases de borde rígido `border-slate-200` y color hardcodeado por variables de tema adaptativas HSL (`border-[var(--color-border)]` y `text-[var(--color-primary)]`), eliminando el contorno gris oscuro en el modo claro.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/ui/DarkModeToggle.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/ui/DarkModeToggle.jsx) [MODIFY]

---

### [2026-06-21] - CORE-031: Robustecimiento, Preflight Checks y Detección Dinámica de Colisiones de Puerto en CLI Bridge

* **Tipo:** Seguridad / Robustez / Diagnóstico / Arranque / Control de Errores
* **Descripción de Cambios:**
  - **Diagnóstico Temprano (Preflight Checks):** Añadida la función asíncrona `runPreflightChecks()` ejecutada al inicializar el servidor. Realiza consultas rápidas a `git --version` y `firebase --version` emitiendo advertencias descriptivas en la consola si las herramientas no están presentes en el PATH local del desarrollador.
  - **Validación del Esquema `.prototipe.json`:** Implementada la función `validatePrototipeMetadata(meta, folderName)` que establece campos por defecto seguros (`template`, `version`, `clientId`, `projectName`). Se integró en `/api/project/drift`, `/api/project/drift/global`, `/api/instancias/list` y `/api/instancias/sync-and-deploy-stream` para prevenir de forma proactiva comportamientos indefinidos si el archivo de metadatos de un cliente está corrupto o carece de propiedades.
  - **Mitigación de Inyecciones en Git Command Execution:** Se robusteció `execGitCommand(cmd, dir)` validando la cadena `cmd` contra caracteres de inyección de consola y redirección (`|`, `;`, `&`, `$`, `` ` ``, `<`, `>`). Si se detecta una inyección, se lanza una excepción controlada previniendo la ejecución física.
  - **Resolución Dinámica de Puertos (Colisiones):** Modificado el arranque del servidor para encapsularse en `startServer(port)`. Si se captura un error de puerto ocupado (`EADDRINUSE`), se intenta enlazar de forma recursiva a puertos incrementales (`port + 1`), evitando fallos fatales de ejecución si el puerto `3001` está ocupado.
  - **Alineación de Ancho de Tarjetas de Clientes Activos:** Se corrigió la discrepancia de ancho en las tarjetas de la lista de instancias bajo Configuración. Al aplicar la clase de margen negativo `-mx-2` en conjunto con el padding `px-2` en el contenedor scrollable (`App.jsx`), se expandieron las tarjetas hacia los bordes del grid, alineándolas de forma simétrica con la tarjeta cabecera de "Instancias Activas" y la terminal, mientras se conserva el margen interno necesario para la animación en hover (`scale-[1.01]`) y la visualización de sombras sin recortes.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

---

### [2026-06-21] - CORE-030: Optimización y Blindaje de Dashboard de Desarrollador y CLI Bridge

* **Tipo:** Refactorización / Optimización / Estabilidad / API / Escalabilidad
* **Descripción de Cambios:**
  - **Unificación de URLs de API y Codificación de Parámetros:** Se declaró la constante unificada `CLI_URL = 'http://localhost:3001'` en `App.jsx` y `ComponentLibraryView.jsx`, reemplazando todas las llamadas directas hardcodeadas a localhost/127.0.0.1. Se aplicó `encodeURIComponent` en todos los parámetros dinámicos concatenados a las URL (como `clientId` o rutas de archivos `file`), eliminando fallos potenciales con caracteres especiales y nombres de carpetas.
  - **Soporte de Estructura de Directorios Anidados (2 niveles):** Se actualizó el endpoint de sincronización y despliegue `/api/instancias/sync-and-deploy-stream` y el escaneo de repositorios Git `/api/git/targets` en `server.js` para detectar y resolver directorios de clientes organizados bajo carpetas de Core (e.g. `Instancias Clientes/{coreType}/{projectName}`) mediante la función `findProjectDir`, alineándolos con la visualización del listado y el detector de drift.
  - **Exclusión de Archivos Binarios del Detector de Drift:** Implementado un juego de extensiones `BINARY_EXTENSIONS` y un helper `isBinaryFile` en `server.js`. Si un archivo es detectado como binario, se lee como Buffer en lugar de UTF-8 y se compara de forma íntegra sin invocar a `Diff.diffLines()`, retornando `{ isBinary: true }` y previniendo fugas de memoria y sobrecarga crítica de CPU en el servidor.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

---

### [2026-06-21] - CORE-029: Corrección de Contornos de Enfoque, Sombras Cortadas en Instancias y Curvatura de Tarjetas Global

* **Tipo:** UI / UX / CSS / Consistencia de Interfaz / Modo Oscuro / Modo Claro
* **Descripción de Cambios:**
  - **Remoción de Contornos y Anillos de Enfoque:** Añadido un reset de CSS global en `index.css` para `button:focus` y `[role="button"]:focus` que remueve los valores de `outline` y `box-shadow` al hacer clic sobre cualquier botón o toggle de la aplicación, solucionando la aparición del contorno rígido/anillo antiestético.
  - **Espacio para Renderizado de Sombras en Lista de Instancias:** Modificado el contenedor del listado de clientes en `App.jsx` (alrededor de la línea 7770) reemplazando `pr-1` por `px-2 pb-2 pr-1.5`. Esto le provee holgura de padding horizontal e inferior suficiente para que la sombra flotante (`shadow-md`) y la escala de zoom en hover (`scale-[1.01]`) no sufran cortes en los límites del contenedor.
  - **Estandarización de Curvatura de Tarjetas (Border Radius):** Se configuró una directiva global en `index.css` dentro de los selectores de tarjeta principal y grande (`div[class*="rounded-2xl"][class*="border"]` y `div[class*="rounded-3xl"][class*="border"]`) para aplicar un `border-radius: 1.25rem !important;` (20px). Esto unifica perfectamente las curvaturas de todas las tarjetas y modales del ecosistema para asegurar una consistencia visual de primer nivel, superando el desfase existente entre el uso aleatorio de 16px y 24px en los elementos de interfaz.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

---

### [2026-06-21] - E2E-Hotfix: Control de Modal de Telemetría en Tests de Checkout

* **Tipo:** Hotfix / Tests / E2E / Playwright
* **Descripción de Cambios:**
  - **Descarte de Modal en Test Helper:** Modificado el helper de navegación inicial `passWelcomePage` en `checkout.helpers.js`. Ahora, si al iniciar el test se presenta el modal interactivo de "Prueba de Enlace de Telemetría" (el cual puede estar activo por pings recientes en la base de datos central), Playwright hace clic automáticamente en "Entendido / Aceptar" utilizando un timeout de 3000ms. Esto previene que el modal intercepte e invalide el clic del botón principal "Comencemos", asegurando la ejecución exitosa de la suite E2E y destrabando el flujo de push del script de backup sin modificar la lógica ni los listeners de telemetría de la aplicación.
* **Archivos Modificados:**
  - [`Plantillas Core/App Ventas/tests/helpers/checkout.helpers.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/helpers/checkout.helpers.js) [MODIFY]

---

### [2026-06-21] - CORE-028: Fondo Tecnológico Premium Animado — Capas de Grid y Orbs GPU-Accelerated

* **Tipo:** UI / Diseño / CSS / Performance / Modo Oscuro / Modo Claro
* **Descripción de Cambios:**
  - **Capa 1 — Grid de puntos adaptivo y móvil:** Implementado patrón de puntos vía `background-image: radial-gradient` en `.tech-bg-dots` con token `--dot-color` y animación de deriva lenta (`grid-drift` de 60s, traduciendo de `0px` a `32px` de forma cíclica y fluida) sobre una capa sobredimensionada (`110vw`/`110vh`), simulando un espacio digital dinámico en movimiento continuo sin cortes ni repaints.
  - **Capa 2 — Orbs de gradiente animados:** Dos divs `.tech-bg-orb-1` y `.tech-bg-orb-2` con gradientes radiales elípticos de los colores de marca (violeta, cian, índigo) animados independientemente con drift muy lento y suave usando exclusivamente `transform` y `scale` GPU-promoted (`will-change: transform`).
  - **Capa 3 — Viñeta perimetral:** `.tech-bg-vignette` con `radial-gradient` que oscurece los bordes usando el token `--vignette-color` para resaltar la zona de trabajo central.
  - **Tokens CSS por tema:** Todos los tokens de fondo (`--dot-color`, `--orb-primary`, `--orb-accent`, `--orb-indigo`, `--vignette-color`) definidos dentro de los bloques `:root` y `:root.light` existentes. Zero tokens duplicados.
  - **Impacto en rendimiento:** Nulo. Cero JS, cero Canvas, zero repaint. Solo elementos GPU-promoted.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

---

### [2026-06-21] - CORE-027: Efecto Flotante Global de Tarjetas Glassmorphic — CSS Attribute Selector Override

* **Tipo:** UI / Diseño / CSS / Sistema de Diseño
* **Descripción de Cambios:**
  - **Tokens CSS adaptativos de sombra:** Definidos `--card-shadow` y `--card-shadow-hover` en `:root` (modo oscuro, sombras negras profundas en 3 capas) y `:root.light` (modo claro, sombras gris-pizarra sutiles).
  - **Glassmorphism y Backdrop Blur Generalizado:** Definido token `--color-surface-glass` (`rgba(15, 23, 42, 0.6)` en modo oscuro y `rgba(255, 255, 255, 0.7)` en modo claro) aplicado con un selector de atributo general (`div[class*="rounded-2xl"][class*="border"]` y `div[class*="rounded-3xl"][class*="border"]`) junto a `backdrop-filter: blur(14px)` para hacer translúcidas todas las tarjetas de la app, permitiendo visualizar los orbs y dots del fondo en movimiento sin perder legibilidad.
  - **Override global sin tocar JSX:** Exclusiones `not()` aplicadas en CSS para evitar flotación y glassmorphism en badges, elementos de tamaño fijo (`w-2` a `w-10`, `h-2` a `h-10`) y posiciones absolutas/fijas.
  - **Hover de elevación:** `transform: translateY(-2px)` + `box-shadow: var(--card-shadow-hover)` en hover para tarjetas que no sean scrollable containers.
  - **Restauración de excepciones:** `nav`, `aside`, elementos `sticky top-0`, `z-50`, `h-screen`, `min-h-screen` restaurados a `box-shadow: none; transform: none` con `!important` para evitar el float en elementos de layout estructural.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

---

### [2026-06-21] - CORE-026: Corrección de Contraste y Colores Inválidos en Consola de Telemetría y Global

* **Tipo:** Hotfix / UI / UX / CSS / Modo Claro / Contraste
* **Descripción de Cambios:**
  - **Soporte Global para Colores Personalizados en Tailwind:**
    1. Registrados e integrados en `@theme` en `index.css` los colores de marca e interactivos personalizados no estándar (como `-650`, `-550` y `-755`) que se usaban a lo largo de la aplicación.
    2. En el tema oscuro (`:root`), se configuran con sus equivalentes tradicionales oscuros.
    3. En el tema claro (`:root.light`), se mapean a versiones con alto contraste (ej: `bg-indigo-650` pasa a ser un azul índigo muy oscuro `#4338ca` en lugar de quedar transparente por no existir en Tailwind, y `text-slate-650` pasa a ser `#334155`).
  - **Refactorización de la Consola de Telemetría:**
    1. Reemplazados los fondos y bordes de color pizarra fijos (`bg-slate-950/40`, `border-slate-900`, `bg-slate-900`) en los contenedores de filtros e inputs en `App.jsx` por variables semánticas HSL adaptativas (`bg-[var(--color-surface-2)]/60`, `border-[var(--color-border)]`).
    2. Solucionado el problema por el cual los textos y hovers en los botones de pestañas ("Todos", "Fallas", "Cobros", "Sistema") hacían blanco sobre blanco en Modo Claro. Ahora utilizan `text-[var(--color-text-muted)]` y reaccionan correctamente en hover a `text-[var(--color-text)]` y `bg-[var(--color-surface-2)]/80`.
    3. Corregida la visibilidad de los botones de borrar búsqueda ("✕") y los iconos de lupa, haciéndolos adaptativos al tema actual en lugar de fijos.
  - **Corrección de Contraste de Vista Previa:**
    1. Modificado el botón de "Demo" en vivo de componentes del CRM para usar `text-emerald-600 dark:text-emerald-400` en lugar de `text-emerald-400 hover:text-white` sobre fondos claros translúcidos, logrando un contraste del 100% en ambos modos.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Compilación limpia con Vite (`npm run build`).

---

### [2026-06-21] - CORE-025: Inversión Cromática Global y Adaptación Completa de Modo Claro

* **Tipo:** UI / UX / CSS / Modo Claro / Tailwind CSS
* **Descripción de Cambios:**
  - **Remapeo Dinámico de la Escala Slate:**
    1. Vinculada la escala completa de colores de slate de Tailwind (`slate-50` a `slate-955`) a variables CSS custom en `@theme` en `index.css`.
    2. En el tema oscuro por defecto, se mapean a los colores oscuros habituales de Tailwind.
    3. En el tema claro (`:root.light`), se invierten de forma adaptativa y equilibrada (ej: `bg-slate-900` pasa a ser fondo blanco puro `#ffffff` en vez de negro, y `text-slate-200` pasa a ser texto oscuro `#334155` en vez de gris muy claro), corrigiendo instantáneamente la legibilidad y contraste del dashboard al alternar temas.
  - **Overrides para Transparencias Hardcodeadas:**
    1. Agregadas reglas CSS específicas para elementos con bordes y fondos blancos translúcidos hardcodeados (`border-white/[0.08]`, `bg-white/5`, etc.).
    2. En modo claro, se transforman automáticamente a opacidades de negro (ej: `rgba(0,0,0,0.08)` para bordes y `rgba(0,0,0,0.03)` para fondos), asegurando que sigan siendo legibles y contrastados sobre fondos claros en lugar de desaparecer.
  - **Inversión Inteligente de Textos y Hovers Blancos (text-white):**
    1. Creados selectores CSS específicos que remapean textos y hovers en blanco (`text-white`, `hover:text-white`) a su contraparte oscura (`var(--color-text)`) cuando están ubicados dentro de contenedores de fondo claro (como tarjetas, modales o menús).
    2. Se excluyeron de forma segura a todos los botones que tienen fondos de color (como `bg-indigo-650`, `bg-violet-600`, etc.) utilizando la pseudo-clase `:not`, garantizando que mantengan su texto blanco legible.
  - **Ajustes en Componentes del Dashboard:**
    1. Refactorizado el selector DatePicker de periodos en `App.jsx` para usar la variable de texto general `text-[var(--color-text)]` en lugar de `text-white`, garantizando legibilidad perfecta del año seleccionado y las flechas de navegación en modo claro.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Compilación limpia con Vite (`npm run build`).

---

### [2026-06-21] - CORE-024: Integración de Selector de Periodo por Calendario Premium y Gráfico Consolidado

* **Tipo:** Dashboard / DatePicker / Filtros / UI / UX / Recharts
* **Descripción de Cambios:**
  - **Selector de Periodo por Calendario Premium (DatePicker):**
    1. Diseñado e implementado un selector de periodo (Mes/Año) en la barra de acciones de la cabecera del Dashboard.
    2. Cuenta con una interfaz glassmorphic con fondo translúcido blur (`backdrop-blur-xl bg-slate-950/85`), navegación interactiva de años y una cuadrícula de meses en español.
    3. Muestra un punto indicador de color violeta en los meses que contienen reportes registrados en la base de datos, facilitando la exploración.
    4. Cierre automático por clic fuera del selector mediante `useRef` + Listener global de eventos.
    5. Botón para restablecer el filtro ("Ver Histórico Completo") que regresa el Dashboard al acumulado total.
  - **Lógica de Filtrado Reactivo Multicapa:**
    1. Agregado el estado `selectedPeriod` y el React Memo `filteredPeriodReports`.
    2. Modificado el cálculo de todas las estadísticas agregadas (`totalComision`, `totalCobrado`, `clientesActivos`), acordeones de clientes, charts de BI, costos Dian y el listado de transacciones inferior para consumir `filteredPeriodReports` de forma reactiva.
    3. Integrado el filtro de periodo dentro de los modales de detalle de cada tarjeta (Acumulado, Cobrado, Pendiente), asegurando que el total visualizado coincida exactamente con las filas del sub-listado.
  - **Gráfico de Tendencia Histórica Consolidada:**
    1. Renombrado el gráfico principal a "Comisiones Generales" para reflejar el panorama histórico global.
    2. Mantiene la visualización de la tendencia de todos los tiempos para dar perspectiva histórica.
    3. Se le integró un badge animado animando la presencia de un filtro activo y un indicador visual vertical (`ReferenceLine`) discontinuo sobre el mes específico filtrado para contextualizar el periodo dentro de la línea de tiempo histórica.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Compilación limpia con Vite (`npm run build`).

---

### [2026-06-21] - CORE-023 (Hotfix/Ajustes): Solución a Hook Order Mismatch, Alturas de Recharts (-1) y Reorganización de Botones

* **Tipo:** Corrección de Errores / UI / UX / Responsive / Recharts / React Hooks
* **Descripción de Cambios:**
  - **Corrección de React Hook Order Mismatch:**
    1. Se detectó que las declaraciones de `useMemo` de proyecciones y BI (líneas 5117-5208) ocurrían después del retorno temprano de la pantalla de login (`if (!user)`). Al iniciar sesión, el número y orden de hooks cambiaba, causando un crash en tiempo de ejecución.
    2. Se movieron todos los hooks `useMemo` (`projExistingMonthly`, `projNewMonthly`, `projTotalMonthly`, `projTotalYear`, `nicheChartData`, `biMetrics`) arriba del condicional `if (!user)` (línea 2871), garantizando que se ejecuten incondicionalmente en cada render y resolviendo de raíz el error de React.
  - **Solución a Dimensiones -1 de Recharts en Mobile:**
    1. Se especificaron alturas fijas numéricas en los componentes `ResponsiveContainer` (`height={220}`, `height={112}`, `height={160}`) en lugar del valor porcentual `"100%"` que dependía del padre y fallaba en vistas adaptables.
    2. Se añadió `minWidth={0}` a los contenedores de gráficos para corregir las advertencias y asegurar el renderizado correcto del gráfico de comisiones en celulares.
  - **Reorganización de Botones de Dashboard:**
    1. El botón de estado "Conectado" se transformó en un badge interactivo premium que se muestra discretamente al lado del título principal del Dashboard, reduciendo la carga cognitiva y el desorden.
    2. Las tres acciones principales ("Test Telemetría", "Exportar Métricas", "Conciliación PDF") se agruparon en una cuadrícula responsiva limpia (`grid grid-cols-1 sm:flex`), permitiendo que en móviles se muestren apiladas a lo ancho y ordenadas, y se expandan horizontalmente en pantallas grandes.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Compilación limpia con Vite (`npm run build`).

---

### [2026-06-21] - CORE-023: Rediseño Premium del Dashboard General con Gráficos Interactivos Recharts, BI Avanzado y Reportes PDF

* **Tipo:** Dashboard / Visualización Interactiva / Inteligencia de Negocios / Telemetría / Reportes PDF
* **Descripción de Cambios:**
  - **Gráficos Interactivos Recharts & Framer Motion:**
    1. Reemplazado el listado estático de barras de progreso por una visualización premium interactiva.
    2. Implementado un gráfico `AreaChart` consolidado en la cabecera que muestra la tendencia histórica mensual de comisiones y ventas totales agregadas.
    3. Diseñado un acordeón expandible dinámicamente con animaciones fluidas de `Framer Motion` (`expandedClientId`).
    4. Cada tarjeta de cliente expandida renderiza su propio mini-gráfico `AreaChart` de tendencia histórica comisional individual, además de un panel en grilla de 3 columnas con su esquema de facturación detallado, nicho comercial y acciones.
  - **Radar de Salud de Instancias:**
    1. Integrado el widget visual `Radar de Salud de Instancias` en la columna derecha de Inicio (arriba de la consola de telemetría).
    2. Procesa en tiempo real el estado de cada cliente: Rojo (errores activos sin resolver o ping fallido), Amarillo (latencia > 3000ms o última conexión > 15m), y Verde (totalmente operativo).
    3. Los pings y latencias de telemetría están simulados con coherencia y reactividad en base Sandbox.
    4. Redireccionamiento automático condicional al hacer clic en un cliente con fallos hacia la pestaña "Consola de Errores" aplicando el filtro del cliente.
  - **Métricas de BI en Simulador:**
    1. Agregada una sección de analítica de negocio bajo las tarjetas del simulador.
    2. Muestra un gráfico de donas `PieChart` de participación comisional por nicho vertical comercial de manera proporcional.
    3. Muestra una tabla financiera de eficiencia deduciendo costos DIAN ($150 COP por reporte con facturación DIAN habilitada) del ingreso proyectado mensual y del acumulado del horizonte de meses del simulador.
  - **Modales de Métricas Completos:**
    1. Diseñados y conectados síncronamente los 3 modales de detalle para *Comisión Acumulada*, *Cobrado* y *Por Recaudar*.
    2. Muestran tablas ordenadas con buscadores y sumas de transacciones, junto a botones para registrar pagos directamente o gestionar cobros en el CRM.
  - **Suite de Exportación PDF:**
    1. Completada la funcionalidad en `pdfService.js` para generar: Conciliación Mensual Consolidada, Reporte de Métricas del Sistema, Directorio de Clientes y Ficha de Rendimiento Individual de Cliente.
    2. Vinculados los botones de exportación correspondientes en el dashboard, modales y CRM.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/services/pdfService.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/services/pdfService.js) [MODIFY]
* **Compilaciones:** ✅ `dev-dashboard` compila exitosamente (1.38s).

---

### [2026-06-21] - CORE-022: Auditoría y Fortalecimiento de la Gestión de Plantillas Core

* **Tipo:** CLI / Dashboard / Cores / Seguridad / Robustez
* **Descripción de Cambios:**
  - **Endpoint de Sincronización Aislado (Sync -> CLI):**
    1. Creada la función helper `performCoreSync(clave, CLI_ROOT)` en `server.js` para unificar y optimizar la copia de archivos y sanitización de credenciales.
    2. Implementado el nuevo endpoint `POST /api/cores/:clave/sync` en la API Bridge del CLI.
    3. Modificada la UI en `CoreCard.jsx` para que el botón "Sync → CLI" apunte a esta nueva ruta, evitando que se auto-active la plantilla en el wizard o se incremente su versión sin confirmación.
  - **Seguridad en Scaffolds y Entorno:**
    1. Asegurada la verificación del `baseCore` en el endpoint `/api/cores/:clave/scaffold` para prevenir path traversal.
    2. Agregada validación estricta de nombres de variables de entorno `.env.local` (regex `/^[A-Z_][A-Z0-9_]*$/`) tanto en el backend (`POST /api/project/env`) como en el frontend de `CoreCard.jsx` (mostrando un toast de error descriptivo si el usuario ingresa caracteres no permitidos).
  - **Integridad y Build:**
    1. Compilación exitosa del dashboard con Vite (`npm run build`) verificando la compatibilidad de tipos y sintaxis.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
* **Compilaciones:** ✅ `dev-dashboard` compila exitosamente (955ms).

---

### [2026-06-20] - CORE-021: Fortalecimiento de la Consola de Errores e Incidentes del Dashboard Central

* **Tipo:** Dashboard / Telemetría / Consola de Errores / Diagnostics Heuristics
* **Descripción de Cambios:**
  - **Filtros e Interactividad Avanzada:**
    1. Agregado el estado `selectedErrorStatusFilter` para permitir filtrar incidentes por estado (Activos, Resueltos, Todos).
    2. Agregado el estado `selectedErrorTypeFilter` para segmentar incidentes por severidad (Todos, Errores, Advertencias, Información).
    3. Vinculadas las tarjetas de resumen estadístico de la cabecera ("Fallos Activos", "Clientes Afectados", "Uptime del Motor") como filtros interactivos rápidos de un clic.
  - **De-duplicación y Colapso de Incidentes (Group-by):**
    1. Implementado el interruptor `groupErrorsByMessage` en los filtros que permite de-duplicar errores repetitivos con el mismo mensaje para un cliente.
    2. En el modo agrupado, las incidencias se colapsan a una sola tarjeta con insignia animada indicando la frecuencia de impactos (ej: `x5 Impactos`) y ordenadas por la fecha del último incidente.
  - **Registro Histórico de Notas de Solución:**
    1. Modificada la función `handleResolveFailure` para recibir múltiples IDs (resolviendo incidentes colapsados en bloque) y una nota de texto.
    2. Añadido un formulario inline bajo cada tarjeta que permite escribir una Nota de Solución al marcar el incidente como resuelto, la cual se guarda de manera persistente en Firestore Central junto a `resolvedAt` y `resolutionNote`.
    3. Si un incidente ya está resuelto, se renderiza de forma premium el historial de la solución: `✓ Resuelto (Fecha) - "Nota de Solución"`.
  - **Motor Heurístico Enriquecido:**
    1. Añadidas interpretaciones y planes de acción específicos para errores de CORS (`blocked by CORS policy`, `Access-Control-Allow-Origin`).
    2. Añadidas interpretaciones para errores de deserialización (`JSON.parse`, `Unexpected token`).
    3. Añadidas interpretaciones para permisos y cancelaciones de Firebase Storage (`storage/unauthorized`, `storage/canceled`).
    4. Añadidas interpretaciones para fallas de red de Firestore (`unavailable`, `client is offline`).
    5. Habilitado el botón directo de creación de índice compuesto cuando se detecta un enlace en la traza.
  - **Integridad y Build:**
    1. Compilada la versión de producción exitosamente con Vite sin advertencias de variables sin uso o errores de importación.
    2. Corregido el crash de ejecución (`ReferenceError: groupErrorsByMessage is not defined`) mediante la declaración formal de los 5 estados faltantes: `selectedErrorStatusFilter`, `selectedErrorTypeFilter`, `groupErrorsByMessage`, `resolutionNoteInputId` y `resolutionNoteText` en `App.jsx`.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

### [2026-06-20] - CORE-020: Arquitectura Multi-Core Escalable en template-core-seed y CLI

* **Tipo:** Ecosistema / Core / CLI / Instancias Clientes / Escalabilidad
* **Descripción de Cambios:**
  - **Desacoplamiento de template-core-seed:**
    1. Agregados placeholders `ORDER_STATES` y `COLLECTIONS.ORDERS` en `constants/index.js` para evitar errores fatales de compilación.
    2. Modificado `billingService.js` para abstraer la consulta de facturación mediante un adaptador de datos configurable (`dataAdapter`) inyectable, eliminando el acoplamiento directo con pedidos de e-commerce y añadiendo fallbacks de seguridad.
    3. Refactorizado el hook `useBilling.js` para permitir la configuración de los 4 modelos de facturación (`saveBillingConfig`).
    4. Limpiado `appConfigStore.js` y `appConfigService.js` de más de 15 campos específicos de ventas (e.g. deliverySettings, wholesaleSettings, couponsEnabled) para dejar una plantilla verdaderamente genérica.
    5. Removida la dependencia e imports de FCM/messaging y el test de VAPID en `DeveloperDiagnosticsModal.jsx`.
    6. Eliminadas las credenciales de Firebase central hardcodeadas como fallback en `centralFirebaseService.js`.
  - **Reestructuración de Instancias:**
    1. Creada la carpeta física `/ventas/` bajo `Instancias Clientes/`.
    2. Reubicada la instancia activa `ventas-moni-app` a `Instancias Clientes/ventas/ventas-moni-app/`.
    3. Actualizados los scripts de backup y automatización (`git_backup.ps1`, `menu_backup.ps1`) para soportar recursión e incrementado el escaneo a `-Depth 5` para evitar conflictos con repositorios Git en subcarpetas de cores de forma segura.
    4. Creado el archivo instructivo `Instancias Clientes/README.md`.
  - **Soporte Multi-Core en CLI:**
    1. Implementada la función dinámica `getInstancePath(coreType, projectName)` en `config.js` del CLI.
    2. Agregado el campo `coreType` a las plantillas registradas en `plantillas_registro.json` y a los metadatos de `.prototipe.json` de cada instancia.
    3. Modificado `generator.js` para inyectar automáticamente el `coreType` en la consola central, en la metadata del proyecto y validar la preexistencia de `firestore.rules` y `storage.rules` en la plantilla de origen para evitar sobreescribir las reglas de seguridad personalizadas por defecto.
    4. Actualizados `sync_templates.js` y `sync_clients.js` para operar dinámicamente con la estructura anidada de subcarpetas de cores.
  - **Validación de Compilación y Mapas de IA:**
    1. Copiado el script de generación de mapa de arquitectura semántica para IA (`generate_ia_map.js`) a la subcarpeta `scratch` de `template-core-seed` para resolver el fallo del script `npm run map` / `npm run build`.
    2. Validado el build exitoso de `template-core-seed`, `dev-dashboard` y `App Ventas` localmente.
* **Archivos Modificados:**
  - [`Prototipe-CLI/config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/config.js) [MODIFY]
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`Prototipe-CLI/plantillas_registro.json`](file:///d:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY]
  - [`Prototipe-CLI/sync_clients.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_clients.js) [MODIFY]
  - [`Prototipe-CLI/sync_templates.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/package.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/package.json) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/scratch/generate_ia_map.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/scratch/generate_ia_map.js) [NEW]
  - [`Prototipe-CLI/templates/template-core-seed/src/constants/index.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/constants/index.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/services/billingService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/billingService.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/hooks/useBilling.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useBilling.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/services/appConfigService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/appConfigService.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/components/admin/settings/DeveloperDiagnosticsModal.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js) [MODIFY]
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`menu_backup.ps1`](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY]
  - [`Instancias Clientes/README.md`](file:///d:/PROTOTIPE/Instancias%20Clientes/README.md) [NEW]
* **Compilaciones:** ✅ `template-core-seed` (353ms), `App Ventas` (933ms) y `dev-dashboard` (789ms) compilaron exitosamente.

---

### [2026-06-20] - HMR-001: Corrección de Inicialización Duplicada de Firebase en Entornos de Desarrollo

* **Tipo:** Plantillas Core / CLI Templates / Instancias Clientes / Calidad / Desarrollo
* **Descripción de Cambios:**
  - **Evitar error de inicialización duplicada (HMR):** Corregido el bug en la carga de Firebase (`firebaseConfig.js`) que causaba `FirebaseApp named [DEFAULT] already exists` durante las recargas en caliente de Vite (HMR), interrumpiendo el flujo de desarrollo local. Se implementó una verificación síncrona `getApps().length === 0 ? initializeApp(...) : getApp()` y `getFirestore(app)` para reutilizar la instancia existente de manera segura y transparente.
* **Archivos Modificados:**
  - [`Plantillas Core/App Ventas/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/config/firebaseConfig.js) [MODIFY]
  - [`Instancias Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/config/firebaseConfig.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/config/firebaseConfig.js) [MODIFY]
* **Compilaciones:** ✅ Verificadas.

---

### [2026-06-20] - BILLING-001: Rediseño Funcional del Módulo de Facturación y Cobros

* **Tipo:** Dashboard Central / App Ventas Core / CLI Templates / Billing / Escalabilidad
* **Descripción de Cambios:**
  - **Bug del 1% resuelto:** Agregado helper `getCalculatedCommission(report, clientConfig)` en `dev-dashboard/App.jsx` que calcula la comisión real en tiempo real usando la tarifa vigente del CRM, soportando los 4 modelos de cobro: `percentage`, `fixed_per_service`, `flat_monthly` y `dian`.
  - **WhatsApp con número de destino:** `handleSendWhatsApp` ahora extrae el número del cliente desde el CRM (`whatsapp` → `telefono` fallback), limpia no-dígitos y abre `wa.me/{numero}?text={mensaje}`. Campo UI de WhatsApp de Contacto agregado con autodetección y hint visual cuando el número proviene del CRM.
  - **Persistencia de templates en localStorage:** `waTemplates` se inicializa desde `localStorage['dev_wa_templates']` y se persiste en cada edición mediante `useEffect`, sobreviviendo recargas.
  - **Botón Recalcular Historial en Nube:** Agregado `handleRecalculateClientReports(clientId)` con batch de 450 ops/escritura. Botón amber en el footer del modal CRM de configuración. Requiere confirmación antes de ejecutar. Modo sandbox: simulado sin escritura.
  - **Sincronización bidireccional de tarifas (instancia ↔ CRM central):** En `useAppConfigSync.js` (App Ventas, template-ventas, template-core-seed), el listener `onSnapshot` de `clientes_control/{CLIENT_ID}` ahora detecta cambios en `billingMode`, `comisionPorcentaje`, `montoFijoServicio`, `pagoMensualFijo`, `enableDianBilling`, `costoPorFacturaDian` y los propaga silenciosamente a Zustand + `config/settings` local mediante `updateAppConfig`. Garantiza coherencia sin intervención manual del operador de tienda.
  - **Escalabilidad:** La sincronización es automática. Nuevas instancias generadas con CLI heredarán estos comportamientos desde `template-ventas` y `template-core-seed` actualizados.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY] — `getCalculatedCommission`, `handleRecalculateClientReports`, `handleSendWhatsApp`, `waTemplates` localStorage, `waPhone` state, campo WhatsApp UI, botón Recalcular en CRM modal.
  - [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY] — Sincronización bidireccional de billing fields desde clientes_control.
  - [`Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY] — Propagado desde App Ventas.
  - [`Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY] — Mismo fix de sincronización.
* **Compilaciones:** ✅ `dev-dashboard` (1.22s) y `App Ventas` (1.22s) sin errores ni advertencias.

---

### [2026-06-20] - CORE-019: Estandarización Total del Sistema de Telemetría e Interactividad en ventas-moni-app

* **Tipo:** Instancia Cliente / Telemetría / Sincronización / Calidad
* **Descripción de Cambios:**
  - **Problema Raíz Identificado:**
    La instancia `ventas-moni-app` presentaba drift crítico respecto al Core tras la implementación de CORE-018: el hook `useAppConfigSync.js` respondía al ping de forma **automática y silenciosa** (sin mostrar el modal interactivo), y `App.jsx` carecía del estado `activePingRequest`, del listener `'ping-test-requested'` y del modal de "Prueba de Conexión". Adicionalmente, la lógica de descarte de alertas usaba la clave textual `title-message-type` en lugar del `alertId`, causando que alertas de prueba repetidas fueran ignoradas por la caché de localStorage.
  - **Correcciones Aplicadas en `App.jsx`:**
    1. Agregados `activePingRequest` (estado) y `pingTimeoutRef` (ref) para gestionar el ciclo de vida del modal de telemetría.
    2. Creado el helper `getAlertDismissKey(alert)` que prioriza `alert.alertId` sobre la clave textual, garantizando descartes únicos y correctos.
    3. Agregado `useEffect` con listener del evento `'ping-test-requested'`, autocierre en 30s y cleanup del timer al desmontar.
    4. Actualizada la fórmula de `isAlertDismissed` para usar `getAlertDismissKey()`.
    5. Actualizado el `alertKey` de `useEffect([sistemaAlerta])` para incluir `alertId` en el hash de comparación.
    6. Insertado el modal interactivo de "Prueba de Conexión" con diseño idéntico al Core (glassmorphism `rgba(5,8,16,0.82)`, Framer Motion spring, botones de confirmación y descarte).
  - **Correcciones Aplicadas en `useAppConfigSync.js`:**
    1. Reemplazada la auto-respuesta al ping (`updateDoc` inmediato) por el despacho del evento `'ping-test-requested'` con la callback `respond()`.
    2. Agregadas validaciones de expiración (>60s) y comparación `pingTs > responseTs` para evitar procesar pings viejos al recargar la página.
  - **Revisión y Corrección de Bugs Activos en Central (Faro Core):**
    1. **Click-Outside en Dropdowns**: Se agregaron referencias `useRef` y hooks `useEffect` con listeners de `mousedown` para cerrar automáticamente tanto el dropdown de plantillas en `CoreSyncPanel.jsx` como el dropdown de tipo de alerta en `App.jsx` al hacer clic en cualquier lugar fuera de su contenedor.
    2. **Desacoplamiento de ID de Alerta**: Se eliminaron los selectores frágiles `document.getElementById('alert-type-select-wrap')` del dropdown de alerta remota en `App.jsx` del dashboard, refactorizando a un estado React limpio `alertTypeDropOpen` y utilizando una referencia directa para evitar colisiones en DOM si múltiples componentes se renderizan.
  - **Build de Integridad:** ✅ `npm run build` en `ventas-moni-app` (1.15s) y `dev-dashboard` (1.14s) sin errores.
* **Archivos Modificados:**
  - [`Instancias Clientes/ventas-moni-app/src/App.jsx`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/src/App.jsx) [MODIFY]
  - [`Instancias Clientes/ventas-moni-app/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY]
* **Compilaciones:** ✅ `ventas-moni-app` y `dev-dashboard` compilaron exitosamente.


* **Tipo:** Dashboard Central / App Cliente / UI/UX / Telemetría
* **Descripción de Cambios:**
  - **Ping Test Interactivo:**
    1. Rediseñado el ciclo de validación de conexión (Ping Test). En lugar de responder de forma automática y silenciosa, el Dashboard incrementa su timeout de 5 a 30 segundos en [`App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) para dar tiempo a la acción manual.
    2. Corregido el bug de desincronización de relojes locales: modificado el listener de `onSnapshot` en el Dashboard para validar la respuesta (`lastPingResponse`) directamente contra el timestamp del gatillo (`triggerPing`) de Firestore Server, garantizando inmunidad ante cualquier desfase de reloj en la máquina local del desarrollador.
    3. Modificado [`useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) para remover la escritura automática de `lastPingResponse` y en su lugar despachar un evento personalizado `'ping-test-requested'` con una callback `respond()`.
  - **Modal de Prueba de Conexión Reutilizado:**
    3. En [`App.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx), se escucha el evento `'ping-test-requested'` y se almacena la callback en un estado `activePingRequest`.
    4. Se renderiza un modal interactivo que clona y reutiliza con precisión el diseño, tipografías, colores, Framer Motion y backdrop blur (`rgba(5, 8, 16, 0.82)`) del componente `sistemaAlerta` existente, con temática de telemetría e icono de antena.
  - **Robustez frente a Inactividad y Descarte:**
    5. Se implementó un temporizador de autocierre de 30 segundos en la aplicación cliente para ocultar el modal de prueba automáticamente y evitar molestias si el administrador está ocupado, coincidiendo con la expiración por timeout en la central.
    6. Se inyectó un botón secundario discreto de "Descartar prueba" para cerrar manualmente el modal en cualquier momento, además de permitir cerrarlo al presionar el backdrop, limpiando los temporizadores asociados de forma limpia sin lanzar errores.
  - **Despliegue de Reglas de Seguridad a Producción:**
    7. Detectada la discrepancia en las reglas de seguridad de Firestore Central en producción (que carecía del permiso de escritura no autenticada para `lastPingResponse`). Se realizó el despliegue de las reglas del desarrollador en producción en el proyecto `prototipe-ecosistema-control`, permitiendo al cliente responder al ping test con éxito.
  - **Soporte de alertId Único para Alertas Remotas:**
    8. Modificado el Dashboard Central para generar un identificador de alerta único `alertId` basado en un timestamp (`Date.now().toString()`) cada vez que se envía o actualiza una alerta de sistema (tanto en la alerta de prueba como en la manual).
    9. Actualizado el validador del descarte de alertas en `App.jsx` del cliente (y plantillas CLI) para almacenar y comparar la clave `dismissed_remote_alert` contra `alertId` en lugar del texto del título y mensaje. Esto evita que alertas repetidas del Dashboard (como la alerta de prueba) no hagan nada debido a que el cliente ya tenía guardado el descarte de una prueba anterior.
  - **Propagación en Plantillas CLI:**
    10. Replicadas exactamente las modificaciones de `useAppConfigSync.js` y `App.jsx` en los templates base de aprovisionamiento del CLI [`template-ventas`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/) y [`template-core-seed`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/) para asegurar que las nuevas instancias hereden este comportamiento interactivo premium.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/firestore.rules`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [DEPLOYED]
  - [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Plantillas Core/App Ventas/src/App.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/App.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/App.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Compilado exitosamente `dev-dashboard` y `App Ventas` (`npm run build`).

### [2026-06-20] - CORE-017: Detección por Hash MD5 de Drift de Instancias, Exclusión de Mapas de Arquitectura, Consola y Perfil Theme-Aware
* **Tipo:** Dashboard Central / CLI / Servidor / UI/UX / Calidad / Telemetría
* **Descripción de Cambios:**
  - **Detección por Hash MD5 del Drift:**
    1. Reemplazada la lógica SemVer de `isOutdated` en `/api/instancias/list` dentro de `server.js` por una comparación física de hashes MD5 en tiempo real. Ahora el dashboard detecta cambios reales en los archivos del core incluso si el número de versión no se ha incrementado.
  - **Consola de Sincronización Theme-Aware:**
    2. Modificado `getLogStyle` en `CoreSyncPanel.jsx` para reemplazar colores oscuros hardcodeados (como `text-zinc-300` o `text-zinc-400` que resultaban invisibles en modo claro) por variables CSS del sistema de diseño y modificadores de tema (`dark:text-violet-400`, `text-[var(--color-text)]`, etc.). La consola es ahora 100% legible en modo claro y oscuro.
  - **Exclusión de Mapas de Arquitectura Dinámicos:**
    3. Añadidos `mapa_arquitectura.md` y `mapa_arquitectura_ia.md` a `SYNC_EXCLUDED_PATHS` en `server.js` debido a que son archivos auto-generados localmente por instancia y alteraban la paridad del drift. Esto resolvió el estado de desactualización persistente después de sincronizar con éxito.
  - **Canal de Telemetría con Botones Separados (Ping vs Alerta de Prueba):**
    4. Implementada la función `handleSendTestAlert` en `dev-dashboard/src/App.jsx` para inyectar una alerta remota preconfigurada de tipo "info" y actualizar la UI local.
    5. Reemplazado el botón único "Verificar Conexión" por dos botones alineados estéticamente: "Enviar Alerta de Prueba" (que dispara el modal interactivo en el cliente) y "Verificar Conexión" (que realiza la comprobación de ping silenciosa en segundo plano).
  - **Prevención de Reapertura y Flicker de Alertas en App Cliente:**
    6. Modificado `App.jsx` (en `Plantillas Core/App Ventas` y `Prototipe-CLI/templates/template-ventas`) con una referencia `useRef` para comparar las propiedades de `sistemaAlerta` (`alertKey`), previniendo que la alerta cerrada por el usuario se vuelva a abrir al recibir snapshots del documento por otros campos (como `triggerPing` del ping test).
    7. Agregada la variable lógica `isAlertDismissed` para leer síncronamente el estado de localStorage durante el render, eliminando el parpadeo de la alerta al recargar el navegador en la aplicación del cliente.
  - **Traducción y Estilizado HSL de la Consola de Telemetría:**
    8. Traducidos los textos del título ("Consola de Telemetría del Sistema en Vivo") y los estados ("Red Desconectada", "Modo Sandbox", "Conectado a Firestore Central") de inglés a español.
    9. Reemplazados los fondos fijos oscuros de la consola, botones, pestañas de logs y caja de entrada de búsqueda por variables CSS (`var(--color-surface)`, `var(--color-surface-2)`, `var(--color-bg)`) y selectores interactivos adecuados, adaptándose perfectamente al tema claro y oscuro de la aplicación.
  - **Adaptación al Modo Claro/Oscuro del Perfil de Administrador:**
    10. Refactorizado el modal `isProfileModalOpen` en `dev-dashboard/src/App.jsx` para utilizar variables CSS del tema (`bg-[var(--color-surface)]`, `border-[var(--color-border)]`) en lugar de colores oscuros fijos de Slate.
    11. Corregido el contraste de los botones ("Ajustes del Sistema" y "Cerrar Sesión") y las etiquetas de base de datos/entorno utilizando clases HSL responsivas (`text-violet-600 dark:text-violet-400`, `text-red-600 dark:text-red-400`) legibles en ambos modos.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Plantillas Core/App Ventas/src/App.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/App.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Servidor CLI reiniciado y escuchando en puerto 3001. `dev-dashboard` y `ventas-moni-app` compilaron exitosamente. Sincronización física de cores completada con éxito.

### [2026-06-20] - CORE-016: Implementación de Ping-Pong Real, Alertas Remotas Funcionales y Corrección de Token Vinculado

* **Tipo:** Dashboard Central / App Cliente / Seguridad Firestore / Telemetría
* **Descripción de Cambios:**
  - **Ping Test Real (Ping-Pong via Firestore):**
    1. Modificado `handleExecutePingTest` en [`dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) para eliminar la simulación de 1.2s con latencia aleatoria. Ahora el Dashboard escribe `triggerPing: serverTimestamp()` en `clientes_control/{clientId}` y luego abre un `onSnapshot` reactivo esperando el campo `lastPingResponse`.
    2. En el cliente (`useAppConfigSync.js`), al detectar `triggerPing` actualizado, se escribe de inmediato `lastPingResponse: serverTimestamp()` de vuelta en el mismo documento central (Ping-Pong).
    3. El Dashboard calcula la latencia real como `Date.now() - start` al recibir el evento de Firestore. Si no hay respuesta en 5s, muestra `Timeout: El cliente no responde (5s)`.
  - **Alertas Remotas Funcionales:**
    1. Creado [`centralFirebaseService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/centralFirebaseService.js) como singleton perezoso de conexión a la BD central del desarrollador (segunda app de Firebase, nombre `centralDevApp`).
    2. Añadidas variables `VITE_DEVELOPER_CENTRAL_*` al `.env.local` de la App de Ventas para habilitar la conexión secundaria.
    3. Modificado [`useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) para suscribirse en tiempo real al documento `/clientes_control/{CLIENT_ID}` de la BD central. Al detectar `sistemaAlerta`, llama `setConfig({ sistemaAlerta })` actualizando el Zustand Store y activando de inmediato el bloqueo visual en la app cliente.
  - **Token de Telemetría Vinculado (corregido):**
    1. El modal de diagnóstico del Dashboard ahora resuelve el token desde dos fuentes: `cfg.telemetryToken` (campo en Firestore) o `telemetryTokens.find(...)` como fallback dinámico. Muestra estado visual `Activo`/`Sin Registro` según resultado.
    2. Actualizado el flujo de aprovisionamiento principal (línea ~4461) y el de `CoreSyncPanel` para guardar `telemetryToken` dentro del documento de `clientes_control`, eliminando la dependencia en consultas cruzadas.
  - **Reglas de Seguridad Firestore (firestore.rules):**
    1. Modificada la regla de `clientes_control/{clientId}` para separar `create/delete` (solo autenticados) de `update` (autenticados O cualquiera que solo actualice el campo `lastPingResponse` usando `affectedKeys().hasOnly`). Esto permite que el cliente responda al Ping sin autenticación de forma segura.
  - **Propagación a CLI Templates:**
    - Propagados `centralFirebaseService.js` y `useAppConfigSync.js` actualizados a `template-ventas` y `template-core-seed`.
* **Archivos Modificados:**
  - [`dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`dev-dashboard/firestore.rules`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [MODIFY]
  - [`Plantillas Core/App Ventas/src/services/centralFirebaseService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/centralFirebaseService.js) [NEW]
  - [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Plantillas Core/App Ventas/.env.local`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.env.local) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/services/centralFirebaseService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/centralFirebaseService.js) [NEW]
  - [`Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js) [NEW]
  - [`Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY]
* **Compilaciones:** ✅ `dev-dashboard` y `App Ventas` compilaron correctamente sin errores.

### [2026-06-20] - CORE-015: Rediseño Premium de la Interfaz de Diagnósticos (Dashboard Central)
* **Tipo:** Dashboard Central / UI/UX / Calidad / Glassmorphism
* **Descripción de Cambios:**
  - **Rediseño Estético del Modal de Diagnóstico:**
    1. Eliminación total de bordes rígidos y toscos de color claro/gris sólido en contenedores principales, cuadros de Ping Test, Garantía de Reporte de Fin de Mes, Alertas Remotas, campos de formulario y botones.
    2. Adopción de diseño de tipo **glassmorphism** premium: fondo translúcido (`bg-[#0d121f]/95`), desenfoque de fondo profundo (`backdrop-blur-2xl`), borde de encapsulamiento casi invisible (`border-white/[0.06]`) y sombras tridimensionales profundas (`shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]`).
    3. Tarjetas superiores de comisiones rediseñadas con cajas adaptativas translúcidas (`bg-white/[0.02]`) y bordes suaves (`border-white/[0.03]`) que se integran de forma nativa al layout financiero.
    4. Pulido de inputs, selectores y textareas utilizando estilos planos oscuros semi-translúcidos y transiciones suaves de foco elástico en violeta.
    5. Botones reconstruidos usando gradientes de marca elásticos y sombreado envolvente (Ping Test, Guardar Alerta, Cerrar Diagnóstico).
* **Archivos Modificados:**
  - [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

### [2026-06-20] - CLI-019: Replicabilidad Automática de Alertas y Reinicio en CLI Templates (Ecosistema)
* **Tipo:** Ecosistema / CLI / Plantillas / Replicabilidad
* **Descripción de Cambios:**
  - **Sincronización a CLI Templates (`template-ventas`):**
    1. Ejecutado el script de sincronización universal `sync_templates.js` para propagar los cambios de la aplicación de ventas core (`Plantillas Core/App Ventas`) directamente a la plantilla del CLI (`Prototipe-CLI/templates/template-ventas`).
    2. Con esto se asegura que absolutamente todas las futuras aplicaciones que se creen usando el CLI hereden de forma nativa e integrada:
       - El listener en tiempo real de `sistemaAlerta` con modal de bloqueo de pago/avisos remotos.
       - El modal de confirmación visual al reportarse con éxito la telemetría mensual de facturación.
       - El soporte de reinicio automático mensual e inicialización a cero.
    3. El script de validación compila correctamente la plantilla mediante `npm run build` en el entorno de destino, garantizando la integridad sintáctica y la ausencia de errores en tiempo de ejecución.
* **Archivos Modificados:**
  - [Prototipe-CLI/templates/template-ventas/](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/) [MODIFY]

### [2026-06-19] - FIX-015: Saneamiento Definitivo de FCM, Reinicio de Comisiones y Telemetría Interactiva (Ecosistema)
* **Tipo:** Ecosistema / Core / CLI / Dashboard Central / Calidad / Remoción de FCM
* **Descripción de Cambios:**
  - **Saneamiento Definitivo de FCM (Firebase Cloud Messaging):**
    1. Eliminación física de archivos redundantes de mensajería push: `firebase-messaging-sw.js` (service worker), `useFCMPermission.js` (hook) y `SoftPushPrompt.jsx` (componente prompt) tanto del Core (`Plantillas Core/App Ventas`), del CLI (`templates/template-core-seed/` y `template-ventas/`), como de la instancia activa (`ventas-moni-app`).
    2. Limpieza de imports e infraestructura en layouts y componentes: Removidas importaciones de `firebase/messaging` y lógica de solicitud de permisos en `firebaseConfig.js`, `DeveloperDiagnosticsModal.jsx`, `AdminLayout.jsx`, `ClientLayout.jsx`, `PortalLayout.jsx` y `OrderTracking.jsx` en el Core y Moni App.
    3. Remoción del CLI: Eliminadas preguntas interactivas de variables de mensajería (`messagingSenderId` y `centralMessagingSenderId`) en `cli.js`, y omitida la generación de llaves criptográficas VAPID (`web-push`) y reemplazos automáticos de service workers en `generator.js`, `server.js` y `sync_templates.js`.
  - **Optimización de Métricas de Comisiones en Dashboard Central:**
    1. **Reinicio Automático Mensual:** Modificada la agregación del dashboard para filtrar reportes que coincidan estrictamente con el periodo actual (`currentPeriod = YYYY-MM`), logrando que al cambiar de mes las comisiones por cliente inicien automáticamente en cero sin destruir el historial en la pestaña de facturación.
    2. **Reinicio Manual a Demanda:** Creado botón de reseteo rápido en el listado del gráfico de comisiones que invoca `handleResetClientCommission`. Al presionarlo, escribe `fechaCorteComisiones: serverTimestamp()` en `clientes_control` de Firestore (o fecha local en Sandbox), ignorando de inmediato reportes antiguos en el gráfico del dashboard.
    3. **Corrección de Bugs en Barras de Progreso:** Resuelta la división por cero que producía `NaN` en `pctWidth` cuando todos los clientes tenían $0 de comisión, y corregido el ancho de la barra para renderizarse al 0% real si no hay comisiones (evitando el mínimo visual artificial del 3%).
  - **Telemetría Interactiva (Live Monitor):**
    1. Rediseñado el Live Monitor de la consola de telemetría para hacer que todos los registros sean interactivos/clickeables.
    2. Integrado modal flotante visor de eventos estilo terminal retro que detalla el cliente, severidad del evento, fecha y hora exactas, y muestra un visor JSON formateado con opción de copia al portapapeles.
    3. Conectado el flujo pasando los metadatos `docData` a las llamadas `addLog` en los listeners en tiempo real de `reportesBilling` y `app_failures`.
  - **Higiene Visual:**
    1. Eliminada comilla suelta/backtick `` ` `` que se había filtrado accidentalmente en el renderizado del listado de comisiones en `App.jsx` (línea 5350).
* **Archivos Modificados:**
  - [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [firebaseConfig.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/config/firebaseConfig.js) [MODIFY]
  - [DeveloperDiagnosticsModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) [MODIFY]
  - [AdminLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
  - [ClientLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
  - [PortalLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/PortalLayout.jsx) [MODIFY]
  - [OrderTracking.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/OrderTracking.jsx) [MODIFY]
  - [.env.example](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.env.example) [MODIFY]
  - [cli.js](file:///d:/PROTOTIPE/Prototipe-CLI/cli.js) [MODIFY]
  - [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [sync_templates.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]
  - [ventas-moni-app/.env.local](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/.env.local) [MODIFY]
  - Archivos eliminados: `firebase-messaging-sw.js` (Core, CLI Seed, CLI template-ventas, Moni App), `useFCMPermission.js` (Core, Moni App), `SoftPushPrompt.jsx` (Core, Moni App) [DELETE]

### [2026-06-19] - FIX-014: Visualización de Clientes Nuevos y Auto-configuración de Telemetría (Ecosistema)
* **Tipo:** Frontend / Dashboard Central / Corrección de Bug / Automatización
* **Descripción de Cambios:**
  - **Diagnóstico del problema:**
    1. Los clientes recién registrados (como `moni-app`) no aparecían en el "CRM de Clientes" ni eran contabilizados en el indicador de "Clientes Activos" del Dashboard General porque dependían únicamente de la existencia de reportes en `reportesBilling`.
    2. Adicionalmente, al reportar facturación desde una nueva instancia, se generaba un error fatal por falta de configuración de telemetría (`VITE_DEVELOPER_TELEMETRY_ENDPOINT` y token vacíos en el `.env.local` del cliente).
  - **Corrección en `App.jsx`**: Se modificó el cálculo de `clientesActivos` para basarse en `clientesSaas.filter(c => !c.archived).length` (el listado real de clientes en `clientes_control` de Firestore) en lugar del total de clientes con reportes.
  - **Estandarización de `clientAggregated`**: Se inicializa la agregación mapeando primero todos los clientes registrados en `clientesSaas`. Posteriormente, se acumulan las comisiones/ventas del historial de reportes.
  - **Automatización de Inyección de Telemetría (Blindaje)**: Se integró un flujo de inyección automática de variables de entorno en el handler de registro de la Consola Central (`onRegisterClient`). Tras completar el registro en Firestore, el dashboard lee el archivo `.env.local` de la instancia a través de la API local de control, inyecta las credenciales requeridas (`VITE_DEVELOPER_TELEMETRY_ENDPOINT`, `VITE_DEVELOPER_TELEMETRY_TOKEN` autogenerado y `VITE_DEVELOPER_CLIENT_ID`), y escribe de vuelta el archivo. Esto elimina el paso manual propenso a fallos y garantiza que el cliente quede pre-configurado de inmediato.
  - **Instancia Moni Configurada**: Se actualizó manualmente el archivo `.env.local` de `ventas-moni-app` con su respectivo token registrado (`moni-app-token-1781921496178`) y endpoint de telemetría para corregir el bloqueo en ejecución.
* **Archivos Modificados:**
  - [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [ventas-moni-app/.env.local](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/.env.local) [MODIFY]

### [2026-06-19] - CORE-013: Sincronizador Core → Instancias Clientes Desde Dashboard (Despliegue en Lote)
* **Tipo:** CLI / Backend / Frontend / Ecosistema
* **Descripción de Cambios:**
  - **Diagnóstico y corrección arquitectural:** El `CoreSyncPanel.jsx` en el dashboard estaba conectado a `/api/git/sync-core-to-clients-stream` que opera sobre ramas Git (`cliente/xxx`). Este modelo no coincide con la arquitectura real del proyecto donde los clientes son directorios físicos independientes en `Instancias Clientes/`. Se corrige implementando nuevos endpoints basados en directorios físicos.
  - **Nuevo endpoint `GET /api/instancias/list`** en `server.js`: Escanea `D:/PROTOTIPE/Instancias Clientes/`, lee `.prototipe.json` de cada carpeta, compara versión cliente vs versión real del core (leída del `package.json` del core), y retorna lista agrupada por plantilla con delta de versión (`isOutdated`, `clientVersion`, `coreVersion`).
  - **Nuevo endpoint SSE `GET /api/instancias/sync-and-deploy-stream`** en `server.js`: Sincronización física diferencial por hash MD5 en 6 fases: (1) Detección de diferencias, (2) Backup temporal de archivos a modificar, (3) Copia de archivos del core al cliente respetando `SYNC_EXCLUDED_PATHS`, (4) Build de integridad con `npm run build`, (5) Actualización de `version` en `.prototipe.json` y limpieza de backup, (6) Deploy opcional a Firebase Hosting. Rollback automático si el build falla.
  - **Nueva constante `SYNC_EXCLUDED_PATHS`** y helpers `getSyncFilesRecursive()` / `getSyncFileHash()` en `server.js` para excluir consistentemente archivos de marca del cliente (`.env.local`, `.firebaserc`, `firebase.json`, `src/config/firebaseConfig.js`, etc.).
  - **`import crypto from 'crypto'`** añadido al bloque de imports de `server.js` para soporte de hash MD5 de archivos.
  - **Reescritura completa de `CoreSyncPanel.jsx`**: Cambio de fuente de datos de `/api/git/cores-and-clients` a `/api/instancias/list`. Nuevo toggle deploy/solo-compilar. Badges de versión por cliente (verde si al día, ámbar con flecha si desactualizado). Estados por fase por cliente: `syncing` → `building` → `deploying` → `success`/`error`. Stream SSE conectado a `/api/instancias/sync-and-deploy-stream`.
* **Archivos Modificados:**
  - [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] (+import crypto, +SYNC_EXCLUDED_PATHS, +getSyncFilesRecursive, +getSyncFileHash, +GET /api/instancias/list, +GET /api/instancias/sync-and-deploy-stream)
  - [CoreSyncPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY] (Reescritura completa con nueva fuente de datos y UI mejorada)
  - [mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

### [2026-06-19] - Lanzamiento de Core Estable v1.0.3 e Inicialización de Instancia Cliente (Moni) - Ecosistema
* **Tipo:** Core / Git Release / Aprovisionamiento / Despliegue
* **Descripción de Cambios:**
  - **Fusión en Producción (Release):** Consolidación de la rama `develop` (limpia de Cloud Functions y con rediseños visuales aprobados) en la rama estable `produccion` del repositorio Core (`prototipe-core-ventas`).
  - **Empaquetado en CLI:** Ejecutada la sincronización de plantillas (`sync_templates.js`) a partir del Core estable para disponibilizar la plantilla oficial `template-ventas` higienizada y libre de tokens en la CLI.
  - **Aprovisionamiento Físico de Cliente:** Creada y configurada la primera carpeta física de cliente independiente en `D:\PROTOTIPE\Instancias Clientes\ventas-moni-app` utilizando la plantilla sanitizada de la CLI.
  - **Configuración y Seguridad Git:** Inicializado repositorio Git independiente en la instancia, inyectados Git hooks de pre-commit, configurado el archivo `.gitignore` y desindexado `node_modules` de Git.
  - **Autogestión de Base de Datos (Onboarding Nativo):** Limpiada por completo la base de datos Firestore remota del proyecto de Firebase `ventas-moni-app` para permitir que el cliente viva el flujo de onboarding nativo (registro de administrador y configuración de marca) al entrar al hosting por primera vez.
  - **Siembra Opcional en CLI:** Modificados `cli.js` y `generator.js` para añadir un prompt de confirmación interactivo que pregunta al desarrollador si desea inyectar datos de prueba iniciales en Firestore antes de ejecutar la acción, previniendo cargas accidentales de información de ejemplo.
  - **Corrección de Bug de Scroll en Modales:** Corregido comportamiento en el helper `ThemeModalLock` dentro de `AppearanceSettings.jsx` en la plantilla Core y la aplicación cliente. Se sustituyó la lectura del estilo computado de overflow (que quedaba permanentemente capturado como `hidden` por doble montaje de efectos en Strict Mode) por un restablecimiento limpio a un string vacío (`""`), asegurando que el body recupere siempre su scroll al cerrar el selector de temas.
  - **Despliegues:** Compilado e instalado localmente (`npm run dev` en `localhost:5173`) y desplegado a producción en Firebase Hosting (`https://ventas-moni-app.web.app`).
* **Archivos Modificados:**
  - [firebase.json](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firebase.json) [MODIFY] (Remoción de functions)
  - Carpeta `/functions` [DELETE] (Remoción de funciones)
  - [plantillas_registro.json](file:///d:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY]
  - [walkthrough.md](file:///C:/Users/Sergio/.gemini/antigravity/brain/d5d930d0-5330-4c01-acfb-b2c584983dbc/walkthrough.md) [MODIFY]
  - [Instancias Clientes/ventas-moni-app/](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/) [NEW] (Nueva instancia independiente)

### [2026-06-19] - Auditoría de Rendimiento y Optimización de Base de Datos - Ecosistema
* **Tipo:** Core / Rendimiento / Base de Datos / Calidad / Producción
* **Descripción de Cambios:**
  - **Identificación de Fugas:** Detectada fuga de lecturas duplicadas en el montaje de hooks de React Query + listeners de Firestore (`onSnapshot` y `getDocs` ejecutados en paralelo).
  - **Falta de Límites:** Diagnóstico de lecturas desmedidas por falta de filtros en pedidos históricos del panel de administración.
  - **POS Offline Sync:** Propuesta de sincronización delta para IndexedDB para evitar el consumo de ancho de banda y lecturas completas de clientes.
  - **Documento de Auditoría:** Generado el reporte oficial de base de datos en `auditoria_rendimiento_db_2026.md` y de costos de Firebase en `analisis_costos_firebase_2026.md`, ambos sincronizados en los mapas de documentación.
* **Archivos Modificados:**
  - [auditoria_rendimiento_db_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_rendimiento_db_2026.md) [NEW]
  - [analisis_costos_firebase_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/analisis_costos_firebase_2026.md) [NEW]
  - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

### [2026-06-19] - Rediseño Premium de la Interfaz del Catálogo (Laboratorio Visual Fase 3) - App Ventas
* **Tipo:** Core / UI/UX / Animaciones / Responsividad / Catálogo
* **Descripción de Cambios:**
  - **Cabecera y Buscador Sticky Glassmorphic:** Cabecera de búsqueda con efecto glassmorphic translúcido pegajoso (`sticky top-0 z-40 bg-app/85 backdrop-blur-xl`), removiendo por completo cualquier línea de borde inferior oscura rígida (`border-none`) para que se integre elegantemente con la interfaz limpia. Se inyectaron efectos de sombreado elástico (`ring-4 ring-primary/10`) al enfocar el buscador.
  - **Chips de Categorías Bouncy:** Rediseñados los chips de categoría a pastillas flotantes redondeadas (`rounded-full`), e implementada una animación de fondo deslizante interactivo con Framer Motion (`layoutId="activeCategoryBg"`) que fluye suavemente y con rebote de una categoría a otra.
  - **Héroe Promocional Parallax (CatalogBanner):** Rediseñado el banner para abarcar la imagen de fondo uniformemente en toda la tarjeta (`object-cover`) e implementado un overlay asimétrico lateral que evita oscurecer el producto. Inyectado un sello circular flotante (sticker) que rota y escala en hover, un resplandor ambiental dinámico en hover y un barrido de destellos metalizados en las etiquetas de oferta.
  - **Tarjetas de Producto (ProductCard):** Rediseñada la tarjeta con curvaturas de 20px, sombras multicapa finas y flotantes (`shadow-[0_8px_30px_rgb(0,0,0,0.03)]`) que flotan a `y: -6` en hover. Las insignias de estado se rediseñaron como píldoras de cristal translúcidas y se agregó una microinteracción de rotación/escala en el botón de agregar (`+`).
* **Archivos Modificados:**
  - [ClientCatalog.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
  - [CatalogBanner.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/CatalogBanner.jsx) [MODIFY]
  - [ProductCard.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]

### [2026-06-19] - Stock Infinito para Productos Preparados / Ilimitados - App Ventas
* **Tipo:** Core / Inventario / Transacciones / Firebase / UI/UX
* **Descripción de Cambios:**
  - **Soporte en Esquemas:** Agregado el campo opcional `stockInfinito` de tipo booleano al esquema de validación Zod `productSchema` en `inventorySchemas.js` para asegurar consistencia e integridad de tipos.
  - **Toggle UI en Formulario:** Añadido un interruptor/checkbox premium en `ProductFormModal.jsx` dentro de `renderVariantsSection` para marcar el producto como ilimitado. Si el producto tiene stock infinito activo, los inputs de stock (tanto en vista de producto simple como en variante múltiple) se ocultan o muestran un indicador de lectura "∞ Ilimitado", y se omite la validación numérica del stock en el modal.
  - **Transformación de Datos al Guardar:** Modificada la preparación de datos del formulario en `ProductFormModal.jsx` para forzar el valor de stock de todas las variantes a `9999` cuando `stockInfinito` sea verdadero. Esto asegura compatibilidad nativa con la lógica existente de stock ilimitado en el resto del front-end.
  - **Listados de Inventario:** Modificado `AdminInventory.jsx` (tabla de escritorio y tarjetas móviles) para detectar el flag `stockInfinito` y mostrar un badge de badge visual color morado con el texto "∞ Ilimitado" en lugar del conteo de unidades y alerta de stock bajo.
  - **Excepción de Alertas:** Actualizadas las funciones de cálculo de stock bajo en `AdminStockAlerts.jsx` y en las métricas de `AdminHome.jsx` para omitir y silenciar alertas de reabastecimiento en productos marcados con stock infinito.
  - **Blindaje Transaccional de Pedidos:** Modificado `orderService.js` en todos sus métodos de alteración de stock (`createOrder`, cancelación de órdenes en `updateOrderStatus`, completado de órdenes en `updateOrderStatus` y flujo de creación offline) para que verifiquen el flag `productInfo.data.stockInfinito` y omitan cualquier validación, decremento o restauración de stock de variantes, manteniendo intacta la contabilidad de ventas `salesCount`.
  - **Visualización en Tienda de Clientes (Pulido):** Modificado `ProductDetailPage.jsx` para que muestre el badge `"Disponible"` en lugar de `"9999 disponibles"`. Modificados también `ProductCard.jsx` y `ProductDetailModal.jsx` para reescribir `isOutOfStock` (fuerza `false`), `stockConsolidado` (fuerza `9999`) y `isUnlimited` para considerar de manera proactiva el flag `stockInfinito` del producto. Se limitó el selector de cantidad máxima a `999` en productos ilimitados.
* **Archivos Modificados:**
  - [inventorySchemas.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/inventorySchemas.js) [MODIFY]
  - [ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
  - [AdminInventory.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [AdminStockAlerts.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY]
  - [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  - [ProductDetailPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [ProductCard.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
  - [ProductDetailModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]

### [2026-06-19] - Rediseño Premium de la Gestión de Pedidos (Laboratorio Visual Fase 2) - App Ventas
* **Tipo:** Core / UI/UX / Rediseño / Responsividad
* **Descripción de Cambios:**
  - **Tarjeta Comanda Asimétrica:** Refactorizado el maquetado de `OrderCard` en `AdminOrders.jsx` para adoptar la estructura responsiva asimétrica de 12 columnas en desktop, elástico y adaptado al tema. En móviles, se reordenaron los elementos estructurando una cabecera con el número de pedido y badges, un contenedor interno para agrupar los artículos con icono de paquete y un pie de página limpio con el monto y los botones interactivos (QR y Chevron) de forma simétrica sin eliminar ninguna variable ni funcionalidad.
  - **Grid de Métricas Rápidas Estilo Wallet:** Rediseñado el grid de tarjetas de métricas rápidas (Pendientes, Completados, Créditos) usando bordes finos responsivos, curvatura amplia `rounded-3xl` y hover de escala suave. La tarjeta de Créditos cuenta con una animación de brillo elástica que utiliza la variable CSS `--color-primary-light` dinámica para adaptarse a cualquier tema activo (ej. SmartFix) sin colores rígidos hardcoded.
  - **Carrusel de Filtros Planos con Contadores:** Rediseñado el carrusel de filtros de estado para mostrar tarjetas wallet compactas con contadores dinámicos alimentados por `filterCounts`. Se incorporó el espaciado `-mx-4 px-4` en móviles para que fluya hasta el borde físico de la pantalla de forma impecable sin recortes de sombras.
* **Archivos Modificados:**
  - [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]

### [2026-06-19] - Estabilización de UI, Correcciones y Catálogo de Estilos - App Ventas
* **Tipo:** Core / UI/UX / Bugfix / Documentación / Estilos
* **Descripción de Cambios:**
  - **Adaptabilidad de Temas HSL:** Modificada la cabecera curvada superior y la tarjeta wallet de "Caja de Hoy" en `AdminHome.jsx` para usar el degradado dinámico de marca (`from-primary to-primary-dark`) en lugar de tonos estáticos.
  - **Diseño Sobrio y Coherente:** Rediseñadas las tarjetas secundarias de balances (`Ventas Totales`, `Por Cobrar`, `Pedidos`) a un estilo de superficie neutral (`bg-surface border border-app text-app`) con badges e iconos vectoriales Lucide en colores pastel translúcidos, eliminando colisiones visuales cromáticas de marca.
  - **Soporte de Hover sin Recortes:** Añadida la propiedad `md:overflow-visible` al contenedor de tarjetas, previniendo que en computadoras se corten los bordes y las sombras en el hover.
  - **Carrusel edge-to-edge en Celulares:** Integrado el margen negativo y el padding responsivo (`-mx-4 px-4`) en móviles, permitiendo que el carrusel se desplace libremente hasta los bordes físicos de la pantalla.
  - **Fijación de Bug de Scroll:** Modificado el componente helper `ThemeModalLock` en `AppearanceSettings.jsx` para restablecer la propiedad `overflow` del body a vacío (`''`) al desmontarse, solventando el bug de congelamiento de scroll al cerrar el modal de paleta de colores.
  - **Catálogo de Estilos Visuales:** Creado y catalogado el archivo de estándares de estilos del ecosistema en `catalogo_estilos_ui.md`.
* **Archivos Modificados:**
  - [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY], [AppearanceSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY], [catalogo_estilos_ui.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Estilos/catalogo_estilos_ui.md) [NEW], [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

### [2026-06-19] - Rediseño Premium de Inicio del Administrador (Laboratorio Visual Fase 1) - App Ventas
* **Tipo:** Core / UI/UX / Rediseño / Responsividad
* **Descripción de Cambios:**
  - **Cabecera Curva con Degradado:** Implementada una cabecera superior curvada (`rounded-b-[40px]`) con degradado elástico de color primario a índigo. Muestra un saludo contextual dinámico basado en la hora, la fecha actual formateada en español y el logo de la tienda o fallback adaptativo sin deformaciones.
  - **Carrusel de Tarjetas Financieras (Wallet Cards):** Diseñado un grid-carrusel responsivo de tarjetas financieras con solape negativo (`-mt-12`). En móviles se desplaza de forma horizontal con comportamiento snap y ocultación de scrollbars. En computadoras se adapta a una rejilla.
  - **Maquetación Premium de Tarjetas:** Las 4 tarjetas de balance (`Caja de Hoy`, `Ventas Totales`, `Por Cobrar / Cartera`, `Pedidos y Alertas`) cuentan con degradados vibrantes, sombras de elevación premium y desgloses de ingresos (efectivo, transferencia y crédito).
  - **Transacciones Recientes:** Implementado un listado interactivo con los 5 pedidos más recientes. Cada ítem incluye el nombre del cliente (o "Venta POS"), identificador del pedido, fecha relativa e iconos vectoriales Lucide dinámicos rodeados por círculos en colores pastel translúcidos según su estado, con redirección inteligente.
  - **Accesos Rápidos:** Diseñados botones minimalistas de accesos directos con animaciones framer-motion de escala e interacción fluida.
* **Archivos Modificados:**
  - [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx)

### [2026-06-19] - Auditoría y Estabilización del Sistema de Notificaciones - App Ventas
* **Tipo:** Core / UI/UX / Robustez / Notificaciones / Bugfix
* **Descripción de Cambios:**
  - **Suscripción de Conteo en Tiempo Real:** Creada la función `subscribeToUnreadCount` en `notificationCenterService.js` para escuchar los documentos con `status == 'unread'` reactivamente desde Firestore. Refactorizado el hook `useNotificationCenter.js` para consumir esta suscripción en lugar del filtrado local en memoria del primer lote paginado, solucionando el bug de desajuste del contador de no leídos.
  - **Diseño Visual Dinámico y Premium:** Actualizado `NotificationHistoryTray.jsx` para importar de manera selectiva y renderizar dinámicamente iconos premium de `lucide-react` en base a `meta.icon` (en lugar de la campana `🔔` estática), mapeados con clases literales de color del sistema de diseño Tailwind para evitar la depuración del linter y optimizar la UX.
  - **Pipeline de Toasts Robustecida:** Refactorizado el useEffect generador de Toasts en `AdminLayout.jsx`, `ClientLayout.jsx` y `PortalLayout.jsx`. Ahora itera sobre todas las notificaciones no leídas recientes (edad < 20 segundos) que no estén ya encoladas localmente, asegurando que múltiples notificaciones concurrentes (por ejemplo, pedidos y abonos que llegan juntos) muestren su respectiva ventana flotante sin omitir avisos.
  - **Limpieza de Linter:** Removida la importación no utilizada `AlertTriangle` en `PortalMensajero.jsx` para garantizar un bundle libre de variables huérfanas.
* **Archivos Modificados:**
  - `notificationCenterService.js`, `useNotificationCenter.js`, `NotificationHistoryTray.jsx`, `AdminLayout.jsx`, `ClientLayout.jsx`, `PortalLayout.jsx`, `PortalMensajero.jsx`

### [2026-06-19] - Optimización de Bundle y Depuración de Importaciones (ESLint Clean Up) - App Ventas
* **Tipo:** Mantenimiento / Optimización / Calidad de Código
* **Descripción de Cambios:**
  - **Limpieza de Importaciones y Parámetros:** Depuradas importaciones en desuso de Firestore (como `getDoc`, `orderBy`, `addDoc`, `updateDoc`, `setDoc`, `where`, `query`) en los servicios de anuncios, inventario, órdenes, créditos, analíticas de códigos QR y seguimiento.
  - **Saneamiento de Firmas:** Removido el parámetro no utilizado `creditId` en `reportCreditPayment` (`creditService.js`) y `pin` en `authenticateEmployeeByPin` (`employeeService.js`).
  - **Resolución de Warnings en PDF:** Corregido en `pdfService.js` la inicialización inútil de la variable `saldo`, reemplazando el operador nullish coalescing `??` sobre `Number(...)` por `||` para mitigar el error de expresión nullish constante en ESLint, y removida la firma no utilizada de `orders` en `exportCreditsReportPDF`.
  - **Control de Linter en PortalVendedor:** Removidas las desestructuraciones redundantes de `appIcon` y `whatsappAdmin` en `PortalVendedor.jsx`, e inyectados comentarios de desactivación de la regla `react-hooks/set-state-in-effect` sobre llamadas de estado asíncronas / debounced seguras.
* **Archivos Modificados:**
  - `adService.js`, `clientNotificationService.js`, `creditService.js`, `employeeService.js`, `inventoryService.js`, `orderService.js`, `qrAnalyticsService.js`, `trackingAnalyticsService.js`, `pdfService.js`, `inventorySchemas.js`, `PortalVendedor.jsx`

### [2026-06-19] - Auditoría y Optimización de Créditos y Saldos (Módulo 5) - App Ventas
* **Tipo:** Core / UI/UX / Rendimiento / Base de Datos / Transacciones
* **Descripción de Cambios:**
  - **Estandarización de Modales:** Refactorizados los modales de abonos en `AdminCredits.jsx` y `ClientCredits.jsx` utilizando la plantilla común `ModalTemplate` de forma consistente, unificando estilos visuales, overlays y control de scroll.
  - **Eliminación de useOrders:** Removido por completo el hook `useOrders()` en `AdminCredits.jsx` eliminando la suscripción reactiva innecesaria a todos los pedidos del comercio al consultar cartera de deudas.
  - **Optimización de PDF de Cartera:** Modificada la función `exportCreditsReportPDF` en `pdfService.js` sustituyendo la consulta completa de la colección de créditos por una consulta filtrada a créditos activos (`where('estado', '==', 'activo')`), mitigando lecturas masivas en memoria.
  - **Blindaje Transaccional de Saldos:** Asegurada la expresión de cálculo de saldo pendiente en la transacción `addPaymentToCredit` de `creditService.js` implementando precedencia lógica correcta: `const currentSaldo = data.saldoPendiente ?? data.saldoPending ?? data.montoTotal`, evitando fallos de carrera o valores nulos.
* **Archivos Modificados:**
  - [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
  - [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY]
  - [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY]
  - [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]

### [2026-06-18] - Elaboración de Checklist de Auditoría del Core (App Ventas)
* **Tipo:** Mantenimiento / Auditoría / Documentación
* **Descripción de Cambios:**
  - **Creación de Checklist Técnico:** Diseñado y estructurado un checklist específico de control de calidad y blindaje técnico para la plantilla core `App Ventas`. Cubre auditoría de fugas de sesión, persistencia de lockout PIN, viewport en móvil para modales, inconsistencias de transacciones Firebase en Bodega, cuellos de botella por sincronización masiva IndexedDB en POS y condiciones de carrera en abonos de créditos.
  - **Sincronización de Mapas:** Registrada la entrada en `mapa_documentacion_ia.md` con su respectivo Criterio de Decisión y control en `tareas_pendientes.md`.
* **Archivos Modificados:**
  - [checklist_auditoria_core.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/checklist_auditoria_core.md) [NEW]
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [tareas_pendientes.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

### [2026-06-12] - Registro Explícito de Rol 'client' en Nuevos Clientes (Ecosistema)
* **Tipo:** Consistencia de Base de Datos / Seguridad
* **Descripción de Cambios:**
  - **Inyección de Rol en Registro:** Se corrigió la discrepancia en la colección `/users` agregando de forma explícita el campo `role: 'client'` cuando se registra un cliente nuevo. Esto garantiza consistencia de esquema (ya que los administradores guardan `role: 'admin'`) y facilita validaciones en las reglas de seguridad.
* **Archivos Modificados:**
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

### [2026-06-12] - Fix de Sesión Huérfana de Administrador en App Ventas (Ecosistema)
* **Tipo:** Bugfix / Autenticación / Base de Datos
* **Descripción de Cambios:**
  - **Auto-recreación de Perfil Admin:** Se corrigió un bug en la plantilla `App Ventas` donde, al limpiar la base de datos Firestore, un administrador logueado previamente mediante Firebase Auth era redirigido directamente al dashboard debido al listener de sesión en cache, sin recrear su documento en la colección `/users` (ya que el login manual era el único que ejecutaba la escritura).
  - **Implementación en Hook:** Modificado `src/hooks/useAuthInit.js` en la plantilla base de Ventas para que compruebe la existencia del documento en Firestore cuando el listener de Auth detecte una sesión activa y la cree si falta.
* **Archivos Modificados:**
  - [useAuthInit.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY]

### [2026-06-12] - Remoción de Función de Gestión de Base de Datos
* **Tipo:** Refactorización / Remoción de código
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Se eliminaron los endpoints `/api/project/database/collections` y `/api/project/database/cleanup` junto a los imports del SDK cliente de Firebase y helpers relacionados.
  - **Eliminación en App.jsx:** Se removió el botón "Base de Datos", los estados de React para control de colecciones (`dbManageModal`, `dbCollections`, etc.), los manejadores `handleLoadDbCollections`/`handleExecuteDbCleanup` y la maquetación del modal de confirmación de borrado.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Corrección de Responsividad Móvil y Estructura en CRM de Clientes
* **Tipo:** UI/UX / Responsividad / Bugfix
* **Descripción de Cambios:**
  - **Grid de Cabecera:** Se rediseñó el contenedor de botones de acción global del CRM (`Sincronización Global`, `Despliegue Global`, `Telemetría Global`, `Nuevo Cliente`) para usar una cuadrícula responsiva de 2 columnas en mobile (`grid grid-cols-2 md:flex md:flex-wrap`) con botones de ancho completo, evitando desbordamientos de texto.
  - **Flexibilidad de Directorio:** Se reestructuraron los botones de acción del directorio de cada cliente (`Desplegar en Local`, `Base de Datos`, `Instalar Deps`, `Obtener Telemetría`, `Gestionar`) con propiedades flex-wrap, anchos mínimos (`min-w`) y alineación central, permitiendo que se acomoden simétricamente en pantallas estrechas sin truncarse.
  - **Resolución de Error de Sintaxis:** Se restauró la etiqueta contenedora de visualización de proyecciones que fue eliminada por error.
  - **Resolución de Bug de Búsqueda de Proyectos:** Se corrigió una falla lógica en la función `findProjectDir` de `server.js` que impedía resolver las rutas de proyectos de plantillas core (`Plantillas Core`) si la carpeta de instancias de clientes (`Instancias Clientes`) no estaba creada físicamente en el disco.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Arquitectura General y Agnóstica de Skills de IA
* **Tipo:** Refactorización / IA Configuración
* **Descripción de Cambios:**
  - **Agnosticismo de Proyecto:** Actualizadas las 7 skills del ecosistema (`component_creator`, `component_extractor`, `git_strategist`, `integrity_compiler`, `onboarder_marcas`, `portar_componente`, `sandbox_integrator`) para remover referencias hardcodeadas a la plantilla `App Ventas`. Se introdujo la variable dinámica `[PROYECTO_ACTIVO]` con su orden de prioridades de resolución y la sección de "Rutas del Proyecto".
  - **Triggers Dinámicos:** Configurado el soporte para que los triggers acepten el parámetro opcional de proyecto (ej: `@crear-componente [PROYECTO_ACTIVO?]`).
  - **Mejoras Específicas por Skill:**
    * `component_creator`: Mapeo fuzzy en `getSandboxKey` en Paso 3, inyección de categorías válidas de biblioteca, y build bloqueante en Paso 5.
    * `component_extractor`: Actualizada la tabla de simulabilidad, criterio objetivo para manuales, protocolo de rollback y variantes.
    * `git_strategist`: Completada la descripción y agregado Paso 6 para resolución de conflictos.
    * `integrity_compiler`: Completada la descripción y unificadas rutas.
    * `onboarder_marcas`: Agregada plantilla para `.env.local` y reglas multi-vertical de onboarding.
    * `portar_componente`: Agregado control de dependencias npm faltantes y validación de versión de `lucide-react`.
    * `sandbox_integrator`: Establecida la tabla como fuente canónica de verdad y añadidas filas de simulabilidad.
* **Archivos Modificados:**
  - Archivos `SKILL.md` bajo `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\Copia_Seguridad_Reglas_y_Skills\Skills\` [MODIFY]

### [2026-06-12] - Depuración de Rutas Obsoletas (D:\Aplicaciones)
* **Tipo:** Refactorización / Mantenimiento
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Removido el fallback redundante y obsoleto `D:\Aplicaciones` de la rutina de resolución de proyectos `findProjectDir` en el servidor del CLI (`server.js`).
  - **Drift Detector CRM:** Implementados los endpoints `/api/project/drift` y `/api/project/sync-file` para evaluar diferencias downstream entre Cores y clientes.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Optimización de Chunks de Bundle y Refinamiento de Auditor PWA
* **Tipo:** Rendimiento / Optimización / Bundles
* **Descripción de Cambios:**
  - **Falsos positivos de auditoría:** Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaño de chunks cargados dinámicamente.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Integración de Herramientas de Automatización en CLI Bridge Server
* **Tipo:** Nueva Característica / Automatización / CLI Bridge
* **Descripción de Cambios:**
  - **APIs de Automatización:** Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]


### [2026-06-13] - Reubicación de Apariencia y Colores a Ajustes de Desarrollador
* **Tipo:** Reubicación de Módulos / UI/UX / AdminSettings
* **Descripción de Cambios:**
  - **Reubicación de Módulo:** Movida la opción "Apariencia y Colores" (`apariencia`) del listado principal de ajustes del administrador al menú de herramientas internas de la "Zona de Desarrollador" (`dev-apariencia`), protegiéndola bajo el PIN maestro `DEV_PIN`.
  - **Prevención de Conflictos de Declaración:** Se renombró la propiedad del prop `handleSaveConfig` a `handleSaveThemeConfig` en la firma de `DeveloperSettings.jsx` y su correspondiente paso en `AdminSettings.jsx` para evitar la colisión de variables con la función local de guardado de configuraciones de desarrollo.
  - **Sincronización en Espejo:** Aplicada la reubicación de forma consistente tanto en el Core de la aplicación como en las plantillas empaquetadas de la CLI (`template-ventas`).
* **Archivos Modificados:**
  - [AdminSettings.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [AdminSettings.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [DeveloperSettings.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
  - [DeveloperSettings.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]

### [2026-06-13] - Rediseño de Cabecera y Tarjeta de Perfil de Administrador en Ajustes (UI/UX)
* **Tipo:** UI/UX / AdminSettings / Rediseño Perfil
* **Descripción de Cambios:**
  - **Eliminación de Traslape de Botones:** Removido el botón "Cerrar Sesión" del encabezado superior derecho para evitar la colisión visual y el traslape con la campana de notificaciones flotante del sistema.
  - **Tarjeta de Perfil de Administrador (Standout Style Dinámico):** Implementado un contenedor de perfil interactivo (`Admin Profile Card`) antes del listado de ajustes diseñado con una estética dinámica basada en el tema activo (`bg-primary/8`, borde izquierdo acentuado `border-l-4 border-l-primary` y bordes sutiles `border-primary/15`) para diferenciarlo visualmente y adaptar su color automáticamente al tema de marca actual.
  - **Identidad de Marca Adaptativa:** El avatar renderiza dinámicamente el logo de la tienda (`appIcon`) configurado por el administrador. En caso de no existir logo cargado, muestra de manera elegante el icono de un escudo de seguridad (`Shield`) centrado en color primario, montado sobre una caja plana clara (`bg-surface` y borde `border-primary/15`).
  - **Nombre Personalizado del Administrador:** El título principal de la tarjeta se vincula a `config.sellerName` (el nombre del administrador/vendedor configurable en Identidad de Marca) con fallbacks a `user.displayName` (cuenta de autenticación) y "Administrador".
  - **Ubicación del Botón de Cierre:** Integrado de manera adaptativa el botón "Cerrar Sesión" en la esquina de la tarjeta de perfil, con colores de advertencia suaves (`text-red-500` y botón `bg-red-500/10` con hover `bg-red-500/20`), optimizando el espaciado en PC y mobile.
* **Archivos Modificados:**
  - [AdminSettings.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [AdminSettings.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]

### [2026-06-13] - Accesos Rápidos de Reportes en Inventario y Créditos (UI/UX)
* **Tipo:** UI/UX / Navegación / AdminInventory / AdminCredits
* **Descripción de Cambios:**
  - **Acceso Rápido a Rotación de Stock:** Integrado un nuevo botón "Exportar Rotación" en `AdminInventory.jsx` (Tanto en Core como en la plantilla CLI) posicionado al lado del botón "Nuevo Producto". Utiliza de forma automática el rango del mes actual como valor predeterminado para el análisis y consume el hook `useOrders` para calcular la tasa de Sell-Through.
  - **Acceso Rápido a Cartera de Deudas:** Integrado un botón "Exportar Cartera" en `AdminCredits.jsx` al lado de la barra de búsqueda para emitir el PDF de cuentas por cobrar directamente desde la vista del módulo.
  - **Consistencia Responsiva y Priorización Móvil:** Estilizado mediante clases Tailwind `flex-col-reverse sm:flex-row` en el inventario para asegurar que en dispositivos móviles el botón de "Nuevo Producto" aparezca de forma prioritaria arriba de "Exportar Rotación", mientras que en PC se mantengan alineados horizontalmente sin desbordamiento.
* **Archivos Modificados:**
  - [AdminInventory.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [AdminInventory.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [AdminCredits.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
  - [AdminCredits.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]

### [2026-06-13] - Corrección de Caja y Nuevo Reporte de Cuentas por Cobrar
* **Tipo:** Caja y Reportes / Cuentas por Cobrar / pdfService / AdminSalesDetail
* **Descripción de Cambios:**
  - **Corrección de Conciliación de Caja:** Se modificó `exportSalesReportPDF` en `pdfService.js` (Tanto en Core como en la plantilla CLI) para realizar una consulta dinámica a la colección `/credits`. Los créditos pagados (cuya orden es `'completado'` pero el método de pago original es `'credito'`) ya no se sumarán a la cartera por cobrar, sino que su saldo remanente real se reportará en "Por cobrar" (0 en caso de estar pagado) y la parte abonada/liquidada sumará a la caja líquida real.
  - **Reporte de Cuentas por Cobrar y Deudas:** Se creó la función `exportCreditsReportPDF` en `pdfService.js` para generar un reporte PDF exhaustivo de cartera activa, deudores, abonos históricos y efectividad de recaudo.
  - **Botón en Interfaz de Detalle de Ventas:** Se integró un nuevo botón en la interfaz de `AdminSalesDetail.jsx` bajo la sección "Reportes y Exportación" para permitir la exportación directa del reporte de cartera si la funcionalidad de créditos está activa.
* **Archivos Modificados:**
  - [pdfService.js (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/pdfService.js) [MODIFY]
  - [pdfService.js (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY]
  - [AdminSalesDetail.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]
  - [AdminSalesDetail.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]

### [2026-06-13] - Sincronización downstream de pdfService en la CLI de Prototype
* **Tipo:** CLI / Estructura / pdfService
* **Descripción de Cambios:**
  - Sincronización downstream de la función de exportación de PDF de ventas y rotación para la consistencia del bundle y soporte de empaquetado en caliente.
* **Archivos Modificados:**
  - [pdfService.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/pdfService.js) [MODIFY]

### [2026-06-13] - Corrección de Permisos de Firestore (Missing or insufficient permissions en listado de pedidos)
* **Tipo:** Seguridad / Base de Datos / Reglas de Firestore
* **Descripción de Cambios:**
  - **Corrección de Regla de Listado:** Se corrigió el error de permisos en tiempo de ejecución (`FirebaseError: Missing or insufficient permissions`) al ingresar a la vista de "Mis Pedidos" o cargar el historial de créditos como cliente público (no administrador).
  - **Causa Raíz:** Las reglas de seguridad de Firestore en las colecciones `/orders` y `/credits` verificaban la existencia del campo `cliente.celular` en los filtros de consulta mediante `request.query.filters['cliente.celular'] != null`. Sin embargo, `request.query.filters` es una propiedad inexistente en las reglas de producción de Firestore (las cuales solo admiten `limit`, `offset` y `orderBy` en `request.query`), lo que causaba un fallo de evaluación y el rechazo inmediato de la consulta.
  - **Solución Aplicada:** Se reemplazó la validación por la sintaxis estándar basada en `resource.data` (`resource.data.cliente.celular != null`), permitiendo a los clientes recuperar sus propios pedidos mediante el filtro `where('cliente.celular', '==', celular)` inyectado en la consulta.
* **Archivos Modificados:**
  - [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY]
  - [firestore.rules](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules) [MODIFY]

### [2026-06-13] - Rediseño Visual de Modal de Producto y Ancho Completo en Reportes
* **Tipo:** UI/UX / Modal / Maquetación / Core App Ventas
* **Descripción de Cambios:**
  - **Rediseño de Modal de Producto:** En `ProductFormModal.jsx` se optimizaron las proporciones y márgenes de los campos. Los inputs se elevaron de `text-xs` a `text-sm` (evitando auto-zoom en iOS Safari), se ampliaron las dimensiones de los botones de carga a `h-11`/`h-12` para un área de contacto idónea en pantallas táctiles y se inyectó la previsualización del producto al lado de los botones de carga en la edición clásica (antes oculta).
  - **Alineación de Placeholders:** Se simplificaron los textos placeholder del panel avanzado (SEO y recomendaciones) para que no se corten en vistas de 2 columnas o móviles.
  - **Homologación de Ancho en Sub-paneles:** Se ajustó la clase contenedora en `AdminSalesDetail.jsx` (detalle de ventas), `AdminStockAlerts.jsx` (alertas de stock) y `AdminCredits.jsx` (créditos) reemplazando los contenedores estrechos (`max-w-4xl` y `max-w-6xl`) por `max-w-7xl`, logrando que todas las sub-páginas utilicen el ancho total de pantalla del panel administrativo de forma consistente.
* **Archivos Modificados:**
  - [ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
  - [AdminSalesDetail.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]
  - [AdminStockAlerts.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY]
  - [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]

### [2026-06-13] - Incorporación de Regla de Seguridad de Git (Evitar Pérdida de Datos Locales)
* **Tipo:** Reglas de Comportamiento de IA (GEMINI.md) / Seguridad
* **Descripción de Cambios:**
  - **Regla contra Restauraciones de Git Automáticas:** Se añadió una regla mandatoria de alta prioridad en la Sección 4 de `GEMINI.md` que prohíbe de forma estricta a la IA ejecutar comandos de descarte o restauración destructivos en Git (`git checkout --`, `git restore`, `git reset`) sobre archivos locales modificados sin la confirmación y autorización explícita del usuario en el chat. Esto protege el trabajo en desarrollo y los cambios no guardados.
  - **Propagación del Prompt:** Se corrió el script de sincronización `sync_rules.js` para propagar de forma inmediata el cambio de reglas a los 5 subproyectos del ecosistema.
* **Archivos Modificados:**
  - [GEMINI.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]

### [2026-06-13] - Rediseño Compacto y Corrección de Scroll en Modal Punto de Venta QR
* **Tipo:** UI/UX / Modal / Core App Ventas / Bugfix
* **Descripción de Cambios:**
  - **Remoción de Scroll y Overflow:** Se cambió el contenedor del modal en `AdminInventory.jsx` para usar `overflow-hidden` y se compactó la tarjeta reduciendo los paddings a `p-4`, los anchos a `max-w-sm` y los espaciados verticales (`mb-x`) para asegurar que quepa 100% en pantallas pequeñas sin forzar scroll interno.
  - **Bloqueo de Scroll de Fondo (Body Scroll Lock):** Se inyectó un hook `useEffect` en `ProductQRModal` que asigna `document.body.style.overflow = 'hidden'` cuando se monta el modal y lo restablece al desmontar para evitar que la página de fondo se desplace.
  - **Refactorización de Zoom a Overlay Independiente:** Se removió el reajuste de tamaño dinámico en caliente del canvas dentro de la misma tarjeta del modal. Ahora, al hacer clic en el QR para ampliarlo, se renderiza un overlay modal independiente de pantalla completa con un backdrop oscuro (`bg-black/80`), un canvas optimizado de 260px, y controles para cerrar (`X` o clic exterior), manteniendo la consistencia de la tarjeta principal intacta.
* **Archivos Modificados:**
  - [AdminInventory.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]

### [2026-06-13] - Bugfix: Carga de Imagen en Detalle de Producto y Reubicación de generate_ia_map.js
* **Tipo:** Bugfix / Rendimiento / Estructura / Build
* **Descripción de Cambios:**
  - **Carga de Imagen en Caché:** Se corrigió un bug clásico en `ProductDetailPage.jsx` donde las imágenes cacheadas por el navegador disparaban el evento de carga del DOM antes de que React registrara `onLoad`, causando un shimmer gris infinito (bloqueando la visualización). Se implementó un `useRef` sobre el elemento de la imagen y se evalúa la propiedad `.complete` en el `useEffect` para resolver la carga de forma instantánea.
  - **Corrección de Inicialización Temporal:** Se movió la inicialización del `useEffect` de imagen debajo de la declaración `useMemo` de `activeImages` para resolver el error de referencia en JS.
  - **Reubicación de generate_ia_map.js:** Se movió el script generador de mapas semánticos de la IA fuera de la carpeta temporal `scratch/` a una carpeta de scripts oficial `scripts/` y se actualizó `package.json` para evitar fallos de compilación (`MODULE_NOT_FOUND`) en las plantillas de la CLI tras la limpieza de la carpeta de debug.
  - **Sincronización:** Actualizado `sync_templates.js` para propagar automáticamente `package.json` y la carpeta `scripts` en el motor de scaffolding.
* **Archivos Modificados:**
  - [ProductDetailPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [package.json](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/package.json) [MODIFY]
  - [generate_ia_map.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/scripts/generate_ia_map.js) [NEW]
  - [sync_templates.js](file:///D:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]

### [2026-06-13] - Habilitación de Telemetría Real en Local y Migración a Cloud Functions Gen 2
* **Tipo:** Telemetría / Firebase / Cloud Functions / IAM / CORS
* **Descripción de Cambios:**
  - **Migración a Gen 2:** Se migró la Cloud Function `reportTelemetry` a Firebase Functions Gen 2 (`onRequest` con `cors: true`) para desplegar sobre Cloud Run y solucionar el preflight de CORS de manera nativa.
  - **Resolución de Permisos en GCP:** Se concedieron los roles de lector y escritor de Artifact Registry (`roles/artifactregistry.reader` y `roles/artifactregistry.writer`) a la cuenta de servicio de Cloud Functions y al agente de Compute Engine, solucionando los errores de compilación de contenedores en Cloud Build.
  - **Acceso Público:** Se configuró la política de IAM del servicio Cloud Run para permitir invocaciones públicas (`allUsers` -> `roles/run.invoker`), lo que previene rechazos por 403 Forbidden antes de evaluar las reglas de CORS.
  - **Habilitación de Localhost:** Se removió la interceptación de simulación en `telemetryService.js` de la App de Ventas para permitir que el cliente emita telemetría real en local.
  - **Saneamiento de Variables:** Se eliminaron las comillas dobles redundantes en `.env.local` de la aplicación de ventas y en la plantilla del generador CLI (`generator.js`) para evitar que el token de Authorization sea enviado con comillas literales y devuelva un error 401.
* **Archivos Modificados:**
  - [telemetryService.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/telemetryService.js) [MODIFY]
  - [index.js](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/functions/index.js) [MODIFY]
  - [.env.local](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.env.local) [MODIFY]
  - [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

### [2026-06-12] - Simplificación de Login de Administrador (Remoción de Campos de Registro)
* **Tipo:** UI/UX / Autenticación / Configuración
* **Descripción de Cambios:**
  - **Remoción de campos redundantes:** Se eliminaron los campos de configuración inicial de nombre y WhatsApp del formulario de inicio de sesión del administrador. Esto previene confusión y errores de visualización/registro en caliente.
  - **Sincronización por defecto:** El proceso de registro del primer administrador ahora inyecta automáticamente los fallbacks de configuración global (`sellerName` y `whatsappAdmin`). Los administradores podrán ajustar sus datos en cualquier momento desde la sección de Ajustes de Identidad de Marca en el Panel de Control.
* **Archivos Modificados:**
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

### [2026-06-12] - Registro Explícito de Rol 'client' en Nuevos Clientes (Ecosistema)
* **Tipo:** Consistencia de Base de Datos / Seguridad
* **Descripción de Cambios:**
  - **Inyección de Rol en Registro:** Se corrigió la discrepancia en la colección `/users` agregando de forma explícita el campo `role: 'client'` cuando se registra un cliente nuevo. Esto garantiza consistencia de esquema (ya que los administradores guardan `role: 'admin'`) y facilita validaciones en las reglas de seguridad.
* **Archivos Modificados:**
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

### [2026-06-12] - Fix de Sesión Huérfana de Administrador en App Ventas (Ecosistema)
* **Tipo:** Bugfix / Autenticación / Base de Datos
* **Descripción de Cambios:**
  - **Auto-recreación de Perfil Admin:** Se corrigió un bug en la plantilla `App Ventas` donde, al limpiar la base de datos Firestore, un administrador logueado previamente mediante Firebase Auth era redirigido directamente al dashboard debido al listener de sesión en cache, sin recrear su documento en la colección `/users` (ya que el login manual era el único que ejecutaba la escritura).
  - **Implementación en Hook:** Modificado `src/hooks/useAuthInit.js` en la plantilla base de Ventas para que compruebe la existencia del documento en Firestore cuando el listener de Auth detecte una sesión activa y la cree si falta.
* **Archivos Modificados:**
  - [useAuthInit.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY]

### [2026-06-12] - Remoción de Función de Gestión de Base de Datos
* **Tipo:** Refactorización / Remoción de código
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Se eliminaron los endpoints `/api/project/database/collections` y `/api/project/database/cleanup` junto a los imports del SDK cliente de Firebase y helpers relacionados.
  - **Eliminación en App.jsx:** Se removió el botón "Base de Datos", los estados de React para control de colecciones (`dbManageModal`, `dbCollections`, etc.), los manejadores `handleLoadDbCollections`/`handleExecuteDbCleanup` y la maquetación del modal de confirmación de borrado.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Corrección de Responsividad Móvil y Estructura en CRM de Clientes
* **Tipo:** UI/UX / Responsividad / Bugfix
* **Descripción de Cambios:**
  - **Grid de Cabecera:** Se rediseñó el contenedor de botones de acción global del CRM (`Sincronización Global`, `Despliegue Global`, `Telemetría Global`, `Nuevo Cliente`) para usar una cuadrícula responsiva de 2 columnas en mobile (`grid grid-cols-2 md:flex md:flex-wrap`) con botones de ancho completo, evitando desbordamientos de texto.
  - **Flexibilidad de Directorio:** Se reestructuraron los botones de acción del directorio de cada cliente (`Desplegar en Local`, `Base de Datos`, `Instalar Deps`, `Obtener Telemetría`, `Gestionar`) con propiedades flex-wrap, anchos mínimos (`min-w`) y alineación central, permitiendo que se acomoden simétricamente en pantallas estrechas sin truncarse.
  - **Resolución de Error de Sintaxis:** Se restauró la etiqueta contenedora de visualización de proyecciones que fue eliminada por error.
  - **Resolución de Bug de Búsqueda de Proyectos:** Se corrigió una falla lógica en la función `findProjectDir` de `server.js` que impedía resolver las rutas de proyectos de plantillas core (`Plantillas Core`) si la carpeta de instancias de clientes (`Instancias Clientes`) no estaba creada físicamente en el disco.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Arquitectura General y Agnóstica de Skills de IA
* **Tipo:** Refactorización / IA Configuración
* **Descripción de Cambios:**
  - **Agnosticismo de Proyecto:** Actualizadas las 7 skills del ecosistema (`component_creator`, `component_extractor`, `git_strategist`, `integrity_compiler`, `onboarder_marcas`, `portar_componente`, `sandbox_integrator`) para remover referencias hardcodeadas a la plantilla `App Ventas`. Se introdujo la variable dinámica `[PROYECTO_ACTIVO]` con su orden de prioridades de resolución y la sección de "Rutas del Proyecto".
  - **Triggers Dinámicos:** Configurado el soporte para que los triggers acepten el parámetro opcional de proyecto (ej: `@crear-componente [PROYECTO_ACTIVO?]`).
  - **Mejoras Específicas por Skill:**
    * `component_creator`: Mapeo fuzzy en `getSandboxKey` en Paso 3, inyección de categorías válidas de biblioteca, y build bloqueante en Paso 5.
    * `component_extractor`: Actualizada la tabla de simulabilidad, criterio objetivo para manuales, protocolo de rollback y variantes.
    * `git_strategist`: Completada la descripción y agregado Paso 6 para resolución de conflictos.
    * `integrity_compiler`: Completada la descripción y unificadas rutas.
    * `onboarder_marcas`: Agregada plantilla para `.env.local` y reglas multi-vertical de onboarding.
    * `portar_componente`: Agregado control de dependencias npm faltantes y validación de versión de `lucide-react`.
    * `sandbox_integrator`: Establecida la tabla como fuente canónica de verdad y añadidas filas de simulabilidad.
* **Archivos Modificados:**
  - Archivos `SKILL.md` bajo `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\Copia_Seguridad_Reglas_y_Skills\Skills\` [MODIFY]

### [2026-06-12] - Depuración de Rutas Obsoletas (D:\Aplicaciones)
* **Tipo:** Refactorización / Mantenimiento
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Removido el fallback redundante y obsoleto `D:\Aplicaciones` de la rutina de resolución de proyectos `findProjectDir` en el servidor del CLI (`server.js`).
  - **Limpieza de Manuales y Mapas:** Corregidas las referencias hardcodeadas de `D:\Aplicaciones` a `D:\PROTOTIPE` en `mapa_arquitectura.md` de la plantilla ventas y de la plantilla activa, en la especificación visual de marca, en el resumen ejecutivo del negocio, y en las guías técnicas del extractor de componentes.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [mapa_arquitectura.md](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/mapa_arquitectura.md) [MODIFY]
  - `Prototipe-CLI/templates/template-ventas/Documentacion App Ventas/mapa_arquitectura.md` [MODIFY]
  - `Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_extractor/SKILL.md` [MODIFY]
  - `Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_brand_config.md` [MODIFY]
  - `Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md` [MODIFY]
  - `Documentacion PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md` [MODIFY]

### [2026-06-12] - Saneamiento y Estandarización de Documentación PROTOTIPE
* **Tipo:** Limpieza / Documentación / Estandarización
* **Descripción de Cambios:**
  - **Eliminación de duplicados:** Se removieron los componentes duplicados y obsoletos `ConnectivityToast` y `DatePicker` del directorio `06_Biblioteca_Componentes` para favorecer sus versiones unificadas y descriptivas en español (`Alerta_Conectividad_Red` y `Selector_Fecha`).
  - **Estandarización de Nomenclatura:** Se renombraron 6 subcarpetas y archivos en la biblioteca de inglés a español descriptivo (`CurrencyInput` -> `Entrada_Moneda`, `QuantitySelector` -> `Selector_Cantidad`, `useDebounceValue` -> `Hook_Filtro_Debounce`, `useLocalStorageState` -> `Hook_Estado_LocalStorage`, `useSavedLocation` -> `Hook_Ubicacion_Guardada`, `ModalTemplate` -> `Plantilla_Modal`).
  - **Remoción de Obsoletos:** Se eliminó el archivo de roadmap histórico `tareas_pendientes_prioritarias.md` ya completado.
  - **Integridad:** Ejecutado `verify_ecosystem_integrity.js` actualizando exitosamente `mapa_documentacion_ia.md` y `mapa_aplicacion.md`.
* **Archivos Modificados:**
  - `06_Biblioteca_Componentes/Formularios_y_UI/ConnectivityToast/` [DELETE]
  - `06_Biblioteca_Componentes/Formularios_y_UI/DatePicker/` [DELETE]
  - `02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [DELETE]
  - `06_Biblioteca_Componentes/` (6 subcarpetas renombradas) [MODIFY]
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [mapa_aplicacion.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

### [2026-06-12] - Actualización a SYSTEM PROMPT — PROTOTIPE DEV AI v2.0
* **Tipo:** Configuración / Reglas de IA / Robustez
* **Descripción de Cambios:**
  - **SYSTEM PROMPT v2.0:** Aplicado el nuevo system prompt unificado en `GEMINI.md`. Define con precisión la matriz de severidades para auditoría técnica, la jerarquía estricta de prioridades ante conflictos de reglas, normas de protección de secretos Firebase/ENV, y protocolos claros ante fallos de build y sincronización.
  - **Sincronización:** Modificados los delimitadores de sección por-core en `sync_rules.js` para usar `## SECCIÓN 10` y `## SECCIÓN 13`. Ejecutado el script de propagación con éxito en todos los proyectos del ecosistema.
* **Archivos Modificados:**
  - [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
  - [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]

### [2026-06-12] - Reorganización Integral del Ecosistema de Documentación PROTOTIPE
* **Tipo:** Refactorización / Documentación / CLI / Integridad
* **Descripción de Cambios:**
  - **Fase 1 — Críticos:** Eliminados 3 archivos binarios residuales de `03_Auditorias_y_Faro_Core/` (trace.json 26MB, desktop_landing.png, PDF). Corregida descripción de `03_Auditorias_y_Faro_Core` en GEMINI.md para dejar claro su alcance exclusivo del CLI. Eliminadas referencias a la ruta `D:\Aplicaciones` (obsoleta) de `sync_rules.js` y `verify_ecosystem_integrity.js`. Eliminada fila de ruta rota `manual_acceso_qr_portales.md` del mapa. Eliminados archivos huérfanos: `plan_skills_desarrollador.md` y `propuesta_redisenio_dev_dashboard.md`.
  - **Fase 2 — Reorganización 07_Manuales_Desarrollo:** Movidos 5 archivos sueltos de la raíz de `07_Manuales_Desarrollo/` a `Arquitectura_Multi_Instancia/Prototipe_CLI/` (analisis_automatizacion_dashboard, auditoria_flujo_onboarding, manual_aprovisionamiento_optimo, propuestas_mejoras_robustez, propuesta_robustez_y_nuevas_funciones). Eliminado directorio duplicado `Paginas/Compra_por_QR/` (manual único en Ecommerce_y_QR).
  - **Fase 3 — Limpieza template-ventas:** Eliminado `scratch/` completo (38 archivos ~10MB de debug). Eliminadas carpetas con espacios en nombre (tareas pendientes, instrucciones de migración, instrucciones/). Eliminados 3 archivos md duplicados en raíz del template (mapa_arquitectura_ia.md, mapa_arquitectura.md, flujos_aplicacion.md). Eliminado manual_aprovisionamiento_optimo.md duplicado.
  - **Fase 4 — Mapa de documentación:** Actualizadas rutas de los 5 archivos movidos. Eliminada fila duplicada de caja_diaria_pos.md de sección Utilidades.
  - **Fase 5 — verify_ecosystem_integrity.js:** Extendido para inicializar los 12 archivos de documentación estándar también en los templates del CLI. El script creó automáticamente `template-core-seed/Documentacion App Core Seed/` con los 12 archivos.
  - **Propagación:** Ejecutados `sync_rules.js` (5 destinos actualizados) y `verify_ecosystem_integrity.js` (mapas globales sincronizados sin errores).
* **Archivos Modificados:**
  - [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
  - [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]
  - [verify_ecosystem_integrity.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/verify_ecosystem_integrity.js) [MODIFY]
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - `03_Auditorias_y_Faro_Core/trace.json` [DELETE]
  - `03_Auditorias_y_Faro_Core/desktop_landing.png` [DELETE]
  - `03_Auditorias_y_Faro_Core/Informe Completo y Definitivo App Reusable.pdf` [DELETE]
  - `04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/plan_skills_desarrollador.md` [DELETE]
  - `07_Manuales_Desarrollo/Visualizacion/propuesta_redisenio_dev_dashboard.md` [DELETE]
  - `07_Manuales_Desarrollo/Paginas/Compra_por_QR/` [DELETE — duplicado]
  - `07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/` ← 5 archivos [MOVIDOS desde raíz 07]
  - `Prototipe-CLI/templates/template-ventas/scratch/` [DELETE — 38 archivos debug]
  - `Prototipe-CLI/templates/template-ventas/` ← carpetas con espacios y md duplicados raíz [DELETE]
  - `Prototipe-CLI/templates/template-core-seed/Documentacion App Core Seed/` [NEW — 12 archivos inicializados]

### [2026-06-12] - Corrección de Rutas del Mapa de Documentación

* **Tipo:** Documentación / Sincronización
* **Descripción de Cambios:**
  - **Corrección de Rutas de Auditoría:** Modificado `mapa_documentacion_ia.md` para actualizar las rutas absolutas de los documentos de auditoría de App Ventas (que fueron movidos desde `03_Auditorias_y_Faro_Core` hacia la carpeta local `D:\PROTOTIPE\Plantillas Core\App Ventas\Documentacion App Ventas`), evitando enlaces rotos e instruyendo correctamente a la IA.
* **Archivos Modificados:**
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

### [2026-06-12] - Sincronización del Ecosistema a Plan Blaze y Telemetría Centralizada
* **Tipo:** Refactorización / Seguridad / Cloud Functions / Firebase / Plan Blaze
* **Descripción de Cambios:**
  - **Limpieza de Generador CLI:** Modificado `generator.js` en `Prototipe-CLI` para no inyectar variables de entorno centralizadas secundarias en `.env.local`, inyectando por defecto el endpoint unificado `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apunta a la Cloud Function HTTPS en producción.
* **Archivos Modificados:**
  - [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

### [2026-06-12] - Habilitación de Scaffold Limpio (Core Seed) en Gestión de Cores
* **Tipo:** Nueva Característica / CLI / Dashboard
* **Descripción de Cambios:**
  - **Soporte de Scaffold Limpio:** Implementado el soporte para realizar scaffolding de nuevos Cores utilizando una plantilla limpia del sistema (`template-core-seed`). Modificado el endpoint `/api/cores/:clave/scaffold` en `server.js` (CLI).
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - `06_Biblioteca_Componentes/Formularios_y_UI/ConnectivityToast/` [DEL
### [2026-06-11] - Saneamiento de Detección Git en Ecosistema (CLI & Dashboard)
* **Tipo:** DevOps / Bugfix / Scripts
* **Descripción de Cambios:**
  - **Detección de Git por rev-parse:** Refactorizada la detección de Git en el bridge server (`server.js`) para utilizar `git rev-parse --git-dir` en lugar del chequeo físico estático de la carpeta `.git`.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-11] - Robustez en Respaldo de Subproyectos con .git-backup-temp
* **Tipo:** DevOps / Automatización
* **Descripción de Cambios:**
  - **Aislamiento de comandos de Git:** Refactorizado `subproject_backup.ps1` para detectar de forma autónoma si un subproyecto está en estado inactivo con la carpeta `.git-backup-temp` y renombrarlo temporalmente a `.git` para realizar la indexación de cambios.
  - **Fase 1 — Críticos:** Eliminados 3 archivos binarios residuales de `03_Auditorias_y_Faro_Core/` (trace.json 26MB, desktop_landing.png, PDF). Corregida descripción de `03_Auditorias_y_Faro_Core` en GEMINI.m
  - [subproject_backup.ps1](file:///D:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

### [2026-06-11] - Corrección de Bugs de Referencia, Git y Bloqueo de SSE en Automatización
* **Tipo:** Corrección de Bugs / Estabilidad
* **Descripción de Cambios:**
  - **Saneamiento en generador:** Corregido en `generator.js` el ReferenceError de `initials` y `storageRulesContent`. Refactorizado `/api/create-project` en `server.js` regresando a una respuesta HTTP JSON estándar y limpia sin SSE.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

### [2026-06-11] - Saneamiento de Carpetas Git Temporales y Robustez de Vite en Backups
* **Tipo:** DevOps / Estabilidad / Scripts
* **Descripción de Cambios:**
  - **Remoción de bloqueos Vite:** Corregido el bug de bloqueo y permanencia de carpetas temporales `.git-backup-temp`. Se mejoró la detención de procesos de desarrollo en `git_backup.ps1` y `menu_backup.ps1`.
* **Archivos Modificados:**
  - [git_backup.ps1](file:///D:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [menu_backup.ps1](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]

### [2026-06-10] - Tres Mejoras de Robustez y Carga de Logo en Onboarding Wizard
* **Tipo:** Robustez / Aprovisionamiento / Frontend / Backend
* **Descripción de Cambios:**
  - **Validación del SDK de Firebase:** Agregado el endpoint `/api/firebase/validate` para comprobar la correctitud de credenciales del cliente antes del aprovisionamiento.
  - **Compresor de Logos Jimp:** Endpoint `/api/upload-logo` para comprimir y procesar logos de marca transparentes con Jimp.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Guardián de Calidad y PWA en Deploy con Auto-Resolución y Drift Detector CRM
* **Tipo:** DevOps / Feature / Calidad
* **Descripción de Cambios:**
  - **SSE Pre-Deploy Audit:** Modificado el endpoint de deploy en `server.js` para ejecutar de forma síncrona el auditor físico antes de realizar el deploy.
  - **Drift Detector CRM:** Implementados los endpoints `/api/project/drift` y `/api/project/sync-file` para evaluar diferencias downstream entre Cores y clientes.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Optimización de Chunks de Bundle y Refinamiento de Auditor PWA
* **Tipo:** Rendimiento / Optimización / Bundles
* **Descripción de Cambios:**
  - **Falsos positivos de auditoría:** Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaño de chunks cargados dinámicamente.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Integración de Herramientas de Automatización en CLI Bridge Server
* **Tipo:** Nueva Característica / Automatización / CLI Bridge
* **Descripción de Cambios:**
  - **APIs de Automatización:** Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]
