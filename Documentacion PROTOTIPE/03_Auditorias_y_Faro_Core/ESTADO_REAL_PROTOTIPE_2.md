# 🔍 Auditoría Arquitectónica: Estado Real de PROTOTIPE 2.0

Este informe presenta un diagnóstico objetivo del estado físico y lógico de los módulos del ecosistema **PROTOTIPE 2.0**, contrastando el desarrollo real documentado contra las especificaciones de la arquitectura oficial.

---

## 1. Módulos que ya existen (100% Funcionales / Catalogados)

* **Dev Dashboard (con Consola de Control)**:
  * Interfaz de CRM con edición de clientes, feature flags y comisiones en caliente.
  * Consola de telemetría de logs en tiempo real con estética de terminal de comandos y simulación de LEDs.
  * Pestaña de Explorador de Biblioteca con acordeones colapsables animados (Framer Motion) y buscador inteligente.
  * Sandbox interactivo con carga perezosa (`React.lazy` + `Suspense`) de playgrounds individuales para optimización del bundle size.
* **Prototipe CLI (Bridge API)**:
  * `cli.js`: Interfaz interactiva de terminal basada en Inquirer.js para despliegue manual.
  * `server.js`: Servidor Express local (Bridge en puerto 3001) para conectar el Dashboard.
  * `generator.js`: Motor de aprovisionamiento capaz de clonar templates, inyectar variables `.env.local` e inicializar repositorios.
* **Plantillas Base**:
  * `template-ventas`: Plantilla productiva pre-configurada para E-commerce y POS de mostrador.
  * `template-core-seed`: Plantilla minimalista component-first y limpia para desarrollos desde cero.
* **Biblioteca de Componentes**:
  * Catálogo documentado en `06_Biblioteca_Componentes` compuesto por **12 subcarpetas activas** (luego de la purga de duplicados).

---

## 2. Módulos Incompletos

* **Cloud Functions del Servidor Central**:
  * **Estado:** Pendiente / Bloqueado.
  * **Causa:** La tarea de despliegue de las Cloud Functions receptoras (`reportBilling`) se encuentra frenada debido a la necesidad de actualizar el proyecto central Firebase al plan de facturación Blaze.
* **Sincronización Automatizada de Reglas/Índices en el CLI**:
  * **Estado:** Incompleto / Inestable.
  * **Causa:** El despliegue de reglas e índices desde `generator.js` depende de una sesión de Firebase CLI logueada de forma interactiva localmente, fallando en entornos virtuales o despliegues desatendidos si no se configura la variable `FIREBASE_TOKEN`.
* **Playgrounds de Componentes Complejos en el Sandbox**:
  * **Estado:** Mocks limitados.
  * **Causa:** Los playgrounds de `pdfService`, `deliveryService` y `LeafletMapPicker` están registrados en los metadatos pero no ofrecen simulación visual interactiva de propiedades, actuando únicamente como documentación de código estático.

---

## 3. Módulos Faltantes (Roadmap Q3/Q4)

* **Plantillas de Verticales Específicos**:
  * **Decisión Arquitectónica (Core Único Flexible):** No es necesario crear las carpetas físicas de `template-restaurante`, `template-taller` ni `template-servicios` dentro de `/templates/` del CLI. Para evitar la duplicación innecesaria de código (DRY) y el code drift, el ecosistema utiliza de forma intencional una plantilla maestra unificada (`template-ventas`) y habilita/deshabilita las vistas en caliente según la parametrización de nichos y feature flags del archivo `niche.json` de cada instancia de cliente.
* **Integración de Pasarelas de Pago**:
  * **Módulos Faltantes:** El flujo de checkout del catálogo carece de procesamiento e integración de checkout con pasarelas locales (Bold, MercadoPago, Wompi).
* **Portal del Cliente (B2C)**:
  * **Módulos Faltantes:** Falta la interfaz para que el cliente final verifique saldos de créditos por fiado, realice abonos y descargue extractos consolidados.

---

## 4. Módulos Duplicados y Placeholders (Resuelto en Sprint 1 - 2026-06-08)

Todos los hallazgos de duplicidad de código, tareas duplicadas y comentarios de código cortados fueron solventados con éxito:

* **En la Hoja de Ruta / Tareas [SOLVENTADO]:**
  * `Tarea 124` duplicada fue eliminada de la línea 1234 de `tareas_pendientes.md`, manteniéndose únicamente bajo la sección de bloqueados (línea 1014).
* **En la Biblioteca de Componentes [SOLVENTADO]:**
  * Se removieron físicamente los directorios de componentes obsoletos redundantes: `/Input_Moneda_COP`, `/Selector_Cantidad` y `/Modal_Base`.
  * Se unificó toda la especificación bajo sus contrapartes oficiales en inglés (`CurrencyInput`, `QuantitySelector` y `ModalTemplate`).
* **Placeholder de Código [SOLVENTADO]:**
  * Se corrigió la fila truncada con comentarios `*/` del `AppResetTool` en `inventario_maestro.md`.

---

## 5. Contradicciones con la Arquitectura Oficial

* **Generador de Proyectos en 1 Clic (CLI vs Firebase Console)**:
  * *Contradicción:* La arquitectura oficial estipula un flujo de onboarding automatizado en un clic. Sin embargo, el paso 0 del CLI exige que el desarrollador cree el proyecto en la Firebase Console manualmente y extraiga las llaves VAPID en un navegador web, rompiendo la automatización total.
* **Gráficos y Métricas del Sandbox**:
  * *Contradicción:* Componentes como `HolographicTiltCard` e `InfiniteLogoMarquee` deben ser interactivos y consumir props del panel de control de sandbox en vivo. Actualmente, se renderizan con mocks fijos y no reaccionan a los controles del Sidebar.

---

## 6. Porcentaje de Avance del Roadmap

| Fase del Roadmap | % de Avance | Estado Actual / Observaciones |
| :--- | :---: | :--- |
| **Fase 1: Organización Documental** | **100%** | Todos los manuales, bitácoras y mapas semánticos de IA han sido clasificados, ordenados y limpiados. |
| **Fase 2: Arquitectura** | **100%** | Especificación técnica oficial y catálogo de componentes completados. Redundancias y placeholders purgados en Sprint 1. |
| **Fase 3: Herramientas de Escalabilidad** | **66%** | El CLI y el Dashboard Dev están construidos y conectados. Falta el despliegue del shard piloto para el cliente N°1 (Moni) en hosting de producción. |
| **Fase 4: Automatización IA** | **20%** | GEMINI.md y bootstrap prompt estructurados. Pendiente de automatizar la generación de `niche.json` mediante Vertex AI. |
| **Fase 5: Escalamiento Comercial** | **0%** | Pendiente. Requiere la activación de pasarelas de pago y la centralización de nómina DIAN. |
