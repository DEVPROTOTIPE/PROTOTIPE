# REGISTRO DE DECISIONES ESTRATÉGICAS

Este archivo consolida las decisiones operativas, técnicas, comerciales y arquitectónicas más relevantes de PROTOTIPE para mantener la alineación del ecosistema.

---

## 🏛️ Decisiones Técnicas y Arquitectónicas

### DEC-003: Blindaje de Replicación de Cores y Aprovisionamiento
* **Fecha:** 2026-06-25
* **Contexto:** Al clonar un Core en una nueva instancia de marca, es crítico asegurar la paridad de compilación antes del primer inicio y evitar drift de telemetría.
* **Decisión:**
  1. **Firebase Storage Preflight Check**: Realizar llamadas REST nativas al bucket Storage del cliente en el wizard del CLI. Abortar el scaffolding si el bucket no está activo.
  2. **Smoke Test Universal**: Desacoplar Playwright del package.json local, permitiendo resolverlo desde `CLI_ROOT/node_modules/playwright` como fallback.
  3. **Registro Central Resiliente**: Escribir registros fallidos en una cola local JSON (`failed_central_registrations.json`) ante desconexiones de red, procesándolo asíncronamente cada 60s en Express.

### DEC-004: Auditoría de Drift Downstream e Integridad de Build
* **Fecha:** 2026-07-01
* **Contexto:** Sincronizar clientes exponía el riesgo de propagar cambios rotos si las dependencias locales diferían o el build local fallaba.
* **Decisión:** Implementar en el CLI bridge la detección de drift NPM (`mismatchDeps`, `missingDeps`, `addedDeps`), el cálculo de un `consistencyScore` de Cores, y obligar a ejecutar un dry-run de compilación de Vite (`buildAudit=true`) sobre la instancia antes de propagar cambios o desplegar a Hosting.

### DEC-005: Auto-setup CORS y caché elástico de Storage
* **Fecha:** 2026-07-01
* **Contexto:** Inyectar cabeceras CORS en Firebase Storage de forma manual arrojaba errores recurrentes por buckets del formato `.firebasestorage.app` ausentes.
* **Decisión:** Desarrollar en el Express backend un resolvedor con fallback que intente configurar el CORS usando `gsutil` en el bucket principal y conmute automáticamente a `.firebasestorage.app` en caso de error 404, implementando una caché en memoria (`storageBucketCache`) para agilizar subsiguientes consultas.

### DEC-006: Prohibición Absoluta de Cloud Functions en Producción
* **Fecha:** 2026-07-06
* **Contexto:** Se requiere simplificar al máximo el mantenimiento y la infraestructura en la nube para clientes finales.
* **Decisión:** PROTOTIPE operará exclusivamente bajo un modelo Serverless estático (Hosting + Reglas físicas de base de datos). Queda prohibido el despliegue de Cloud Functions en producción. Cualquier lógica de integración se resolverá del lado del cliente o a través de la API REST local del Bridge CLI.
  La variable de entorno `VITE_DEVELOPER_TELEMETRY_ENDPOINT` queda redirigida localmente a `http://localhost:3001` para el validador del modal de diagnóstico, delegando la transmisión comisional productiva de forma directa a Firestore Central (`reportesBilling`) vía SDK de cliente mediante `centralFirebaseService.js`.

### DEC-002: Purga Absoluta de Seeding e Inteligencia Artificial
* **Fecha:** 2026-06-24
* **Contexto:** Se detectaron advertencias de seguridad y excesiva complejidad por la inyección de Cloud Functions de IA (Gemini/Vertex) y scripts de siembra no requeridos por el modelo de negocio actual.
* **Decisión:** Purgar de forma mandatoria todos los archivos, componentes de IA, manuales, y comandos de mapeo/seeding en el Core base y CLI. El scaffolding debe iniciarse de forma 100% limpia sin datos dummy.

### DEC-001: Arquitectura Core → Template → Cliente
* **Fecha:** 2026-06-10
* **Contexto:** La replicación manual de marcas generaba duplicidad de código y dificultades para propagar correcciones downstream.
* **Decisión:** Establecer una jerarquía estricta donde el **Core** provee la lógica reusable y dependencias comunes, la **Plantilla (Template)** define la vertical o UI del rubro, y la **Instancia Cliente** es una copia de marca configurable mediante `.env.local` y tokens HSL.

---

## 💼 Decisiones de Negocio y Comerciales

### DEC-BUS-001: Modelo de Monetización por Setup, SaaS y Comisiones
* **Fecha:** 2026-06-20
* **Contexto:** Definición de la estructura de cobro para pymes comerciales y de servicios.
* **Decisión:** Establecer un modelo de ingresos recurrente en tres fases:
  1. **Pago de Setup obligatorio** por descubrimiento técnico, diseño de marca e implementación inicial.
  2. **Comisión operacional** por venta (1.5% promedio) o reservas procesadas en la app.
  3. **Mensualidad fija** por uso administrativo o de control en la Consola del Cliente.
