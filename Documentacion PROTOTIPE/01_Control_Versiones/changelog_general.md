# CHANGELOG GENERAL PROTOTIPE

## 2026-07-01

### Tecnología
- **Módulos de Cobros y Recaudo**: Implementado `RecaudoPanel.jsx` (cartera agregada, telemetría de facturación y recordatorios automatizados de WhatsApp) y `CobrosPanel.jsx` (cajón lateral de transacciones y reversión de cobros).
- **Radar de Salud**: Creado `HealthRadar.jsx` en el cockpit con barrido de radar GPU y coordenadas polares para auditar la disponibilidad HTTP de instancias de clientes en tiempo real.
- **Auditoría de Paridad y Drift de NPM**: Agregado soporte en el CLI bridge para detectar drift de dependencias NPM (`mismatchDeps`, `missingDeps`, `addedDeps`) y calcular de forma matemática el `consistencyScore` de cada Core.
- **Configurador CORS Automatizado**: Añadido endpoint `/api/project/firebase/cors-setup` que realiza la inyección automática de cabeceras CORS en Google Cloud Storage mediante `gsutil`, soportando fallback resiliente del bucket `.appspot.com` a `.firebasestorage.app` y caching local en memoria (`storageBucketCache`).
- **Dry-run de Vite en Sincronización**: Integrado parámetro `buildAudit=true` en el endpoint `/api/project/drift` que valida la integridad física compilando localmente la aplicación del cliente antes del deploy.
- **Playgrounds Dinámicos**: Modificado `ComponentSandbox.jsx` para autodescubrir playgrounds interactivos de componentes en caliente mediante `import.meta.glob` de Vite.
- **Seguridad Robustecida**: Mitigación de fugas por Directory Traversal usando `isPathContained`, control de concurrencia al leer plantillas, inyección de tokens de telemetría y descarte de cambios en caliente en `GitBackupPanel`.

### Documentación
- **Alineación del Ecosistema**: Actualizados 29 archivos de documentación oficial para reflejar la infraestructura multicore y el auto-aprovisionamiento.

---

## 2026-06-25

### Tecnología
- **Preflight Check de Storage en CLI**: Implementada validación remota REST que realiza peticiones GET a `https://firebasestorage.googleapis.com/v0/b/{bucket}` en `generator.js`. Aborta de forma temprana la clonación física de instancias locales del cliente si el Storage no está activo.
- **Smoke Test Universal**: Rediseñada la ejecución de Playwright en `worker_create_project.js` para usar la dependencia del CLI global (`CLI_ROOT`) como fallback si falta de forma local. Esto permite certificar cualquier Core nuevo o futuro sin importar sus dependencias locales.
- **Cola de Telemetría Resiliente**: Creado un sistema de almacenamiento local `scratch/failed_central_registrations.json` para registrar fallos de conexión REST durante el auto-registro central de clientes y tokens.
- **Polling Asíncrono en Backend**: Integrado un interval de procesamiento periódico (cada 60 segundos) en `server.js` que detecta la cola local de telemetría y re-ejecuta de forma transparente las peticiones REST a Firestore Central una vez se restablece la red.

### Operación
- **Auditoría de Replicación de Cores**: Elaborado reporte crítico que analiza vulnerabilidades de variables de marca, drift de tokens de telemetría y aislamiento de despliegues.
- **Auditoría de Arquitectura de la Consola Central**: Elaborada la auditoría arquitectónica `APP_ARCHITECTURE_AUDIT.md` analizando responsabilidades, acoplamientos, re-renders y rendimiento del monolito `App.jsx` de 10k líneas, estructurando la estrategia de refactorización pre-CRM.

### Documentación
- **Normalización Documental**: Consolidada toda la documentación oficial dentro de `Documentacion PROTOTIPE/` eliminando el directorio temporal `/docs/`.
- **Plan de Refactorización Técnica de la Consola Central**: Creado `PLAN_REFACTORIZACION_CENTRAL_PROTOTIPE.md` en `/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/` que expone la hoja de ruta en 5 fases (Zustand, React Router, Lazy Pages, RBAC) para modularizar `App.jsx`.
- **Propuesta de Arquitectura CRM Comercial**: Creado `integracion_crm_comercial.md` en `/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/` que detalla decisiones del Mono-portal (RBAC, React.lazy), modelo de base de datos unificado (`clientes_control`) y plan de verificación.
- **Manual de Ventas Oficial**: Creado `sistema_ventas_prototipe.md` definiendo el funnel de atracción, clasificación de interesados por WhatsApp y propuesta comercial.
- **Briefing Maestro Comercial**: Migrado a `05_Estrategia_Comercial_Ecosistema/Plantillas_de_Levantamiento/briefing_maestro_cliente.md` para guiar el descubrimiento inicial y relevar procesos, automatizaciones y feature flags con el cliente.
- **Plantilla de Análisis Post-Descubrimiento**: Migrada a `05_Estrategia_Comercial_Ecosistema/Plantillas_de_Levantamiento/plantilla_analisis_post_descubrimiento.md`.
- **Propuesta Comercial Oficial**: Migrada a `05_Estrategia_Comercial_Ecosistema/propuesta_comercial_prototipe.md`.
- **Calculadora de Cotización**: Migrada a `05_Estrategia_Comercial_Ecosistema/calculadora_cotizacion_prototipe.md`.
- **Manual del Proceso Comercial**: Migrado a `05_Estrategia_Comercial_Ecosistema/proceso_comercial_prototipe.md`.
- **Framework del CRM**: Migrado a `05_Estrategia_Comercial_Ecosistema/crm_prototipe.md`.
- **Especificación Funcional del CRM Interno**: Migrada a `09_Modulos_Completos/CRM_Interno/crm_interno_especificacion.md`.

---

## 2026-06-24

### Documentación
- **Creación de Contexto Maestro**: Creado `CONTEXTO_MAESTRO_PROTOTIPE.md` como la fuente principal de contexto estratégico, operativo, comercial y tecnológico de PROTOTIPE.
- **Purga de Inteligencia Artificial y Seeding**: Removidos por completo todos los componentes de IA (`Formulario_Producto_IA`), manuales, scripts y pings de bases de datos obsoletos para simplificar el Core base.

### Comercial
- **Landing Page Activo Oficial**: Incorporada la Landing Page corporativa optimizada en SEO y CRO al inventario de activos del proyecto.
- **Modal de Leads Express (CRO)**: Implementado interceptor de clics de WhatsApp (`wa.me`) que solicita datos mínimos del cliente y los almacena en LocalStorage (exclusivamente para UI/auto-completar local; los flujos transaccionales y colas offline usan Dexie/IndexedDB) para envíos futuros.
- **Calculadora de Diagnóstico Express**: Rediseñado el widget de autoevaluación comercial de 32 combinaciones de retos operacionales por nicho, colapsable mediante trigger card interactivo.

### Negocio
- **Definición de Ecosistema**: Formalizada la definición estratégica oficial de PROTOTIPE como ecosistema de transformación digital accesible para pequeños negocios en crecimiento.

### Tecnología
- **Optimización de Scroll (FPS)**: Erradicada la transición universal `*` del DOM que ralentizaba la interactividad. Sustituida por transiciones selectivas y la inyección temporal de la clase `.theme-transition` durante 300ms al alternar el modo oscuro.
- **Aceleración por GPU**: Inyectada la propiedad `will-change: transform` y backface-visibility en tarjetas con rotación 3D Tilt y testimonios para suprimir DOM repaints en GPU móvil.
- **Paralaje Giroscópico con Auto-Calibración**: Desarrollado algoritmo de centrado dinámico (lerp 0.04) e IntersectionObserver en móviles para suavizar el efecto giroscópico 3D sin desalineación persistente del viewport.
- **Mitigación de Layout Shifts (CLS = 0)**: Inyectadas alturas mínimas de seguridad en tarjetas de Solución y typewriter de Beneficios para reservar espacio físico y evitar brincos dinámicos en móviles.
- **Corrección de Inicialización**: Solucionado el bug de ejecución y anidación de la IIFE de Leads Express y Botones Magnéticos.

---

## 2026-06-10

### Tecnología
- **Arquitectura de Replicación**: Finalizada documentación y puesta en marcha de la arquitectura modular Core → Template → Cliente.
- **Reglas de Escalabilidad**: Documentadas reglas de aprovisionamiento automatizado y escalabilidad en el CLI orquestador.

### Operación
- **Onboarding de Clientes**: Formalizado el proceso estructurado de descubrimiento y onboarding de clientes.
