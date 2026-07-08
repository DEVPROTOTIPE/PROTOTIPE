# 💡 Buzón de Ideas y Notas del Backlog Futuro

Este archivo sirve como repositorio central de ideas de diseño, flujos operativos sugeridos, integraciones comerciales futuras y propuestas tecnológicas que no forman parte del sprint activo pero que se reservan para su evaluación y planificación en fases posteriores de PROTOTIPE.

---

## 📈 Idea 1: Auditoría Analítica de Deuda Técnica con NotebookLM (Tabla de Datos)

### Propósito
Automatizar la detección de deuda técnica en la inyección de componentes y consistencia de compilaciones sin escribir herramientas complejas de analítica.

### Flujo Operativo Sugerido
1.  **Origen de Datos:** Utilizar el log `.prototipe-audit-trail.jsonl` generado automáticamente en la raíz de los proyectos clientes (`App Ventas`, etc.) tras realizar inyecciones.
2.  **Carga a NotebookLM:** Subir este archivo como fuente en el Workspace de NotebookLM.
3.  **Prompt de Análisis de Tabla de Datos:**
    ```text
    Actúa como un Analista de Datos de Software Senior. Ejecuta un script en Python dentro de tu entorno para procesar los datos de auditoría de inyecciones y compilaciones provistos en el archivo cargado.

    Calcula y presenta de forma resumida en una tabla:
    1. El Consistency Score promedio de las inyecciones.
    2. Identifica los 3 componentes específicos que registran la mayor cantidad de fallos de compilación local ("buildAudit=false" o "buildFailed=true").
    3. Identifica los 3 componentes con mayor "NPM drift" (desviación o discrepancia de dependencias instaladas en los clientes vs la plantilla Core).

    Muestra el código de análisis utilizado y genera una conclusión clave sobre la salud del código de nuestra biblioteca.
    ```
4.  **Objetivo:** Usar el reporte final para dictaminar qué componentes del catálogo necesitan refactorizaciones prioritarias o están desalineados con las dependencias del Core.

---

## 💳 Idea 2: Integración de Portal B2C - Consolidación de Abonos de Créditos en Firestore

### Propósito
Conectar la pasarela de pagos simulada del portal de clientes final (B2C) con el motor transaccional real para consolidar abonos directos.

### Flujo Operativo Sugerido
*   **Origen:** El usuario realiza un pago/abono en la vista interactiva `ClientCredits.jsx`.
*   **Destino:** En lugar de una simulación puramente en el estado local de React, registrar el abono en tiempo real bajo la colección física de auditoría `/credits/{id}/pagos` de Firestore.
*   **Variables de Control:** Validar el saldo insoluto del crédito y recalcular automáticamente el estatus del crédito (Vigente, Pagado o En Mora) usando la lógica de persistencia del lado del cliente.

---

## 🧠 Idea 3: Blindaje de Calidad y Planeación de Cores con NotebookLM

### Propósito
Usar NotebookLM como un auditor de cumplimiento de la Guía Maestra de estilos, simulador de resiliencia ante cambios de infraestructura y consultor rápido de empaquetado para clientes atípicos.

### Flujos Operativos y Prompts Sugeridos

#### A. Auditor de Drift de Código (Linter Cognitivo Pre-Merge)
Antes de realizar commits o mergear una rama con componentes visuales o lógica pesada, copia y pega el código propuesto en NotebookLM junto a `guia_maestra_desarrollo.md` y `estandar_disenio_premium.md`.
*   **Prompt para NotebookLM:**
    > *"Actúa como el Auditor de Calidad Senior de PROTOTIPE. Evalúa el siguiente fragmento de código de React/Tailwind. Compara su diseño y lógica con los principios estéticos y técnicos especificados en la Guía Maestra y el Estándar de Diseño Premium (contraste de HSL, evitar bordes negros, z-index en steppers/timelines, scroll de tablas y reseteos numéricos). Detalla cualquier desvío detectado y proporciona las líneas de código corregidas."*

#### B. Generador de Playbooks para Nuevos Cores y Módulos
Al expandir la plataforma a verticales de negocio atípicas que requieran un nuevo Core de Oro, utiliza las especificaciones del Core como contexto en NotebookLM.
*   **Prompt para NotebookLM:**
    > *"Basándote en las especificaciones definidas en `especificacion_nuevos_cores_oro.md` y `estandar_repositorios_infraestructura_agnostica.md`, genera el Playbook de Onboarding paso a paso para inicializar un nuevo Core de Oro llamado '[Nombre_Del_Core]'. Dame el árbol de directorios exacto que debo crear, el formato de su manifest JSON de configuración y los métodos Repository para la persistencia desacoplada."*

#### C. Simulador de Migración y Cambios de Infraestructura (Resiliencia)
Para blindar el negocio ante cambios de costos o caídas de Firebase, utiliza las guías de desacoplamiento de arquitectura para evaluar la portabilidad del monorepo.
*   **Prompt para NotebookLM:**
    > *"Si en el futuro decidiéramos migrar la persistencia física de Firestore de Google Cloud a Supabase (PostgreSQL) para abaratar costos de lecturas, ¿cuáles serían los archivos específicos de la estructura del monorepo actual y qué capas de la arquitectura en 3 capas de PROTOTIPE tendríamos que modificar? ¿Qué archivos de la biblioteca se conservarían 100% intactos gracias a nuestro desacoplamiento?"*

#### D. Consultor de Configuración para Clientes Atípicos
Cuando el briefing de preventa del cliente tenga complejidades operativas o nichos cruzados, utiliza NotebookLM para mapear sus componentes idóneos.
*   **Prompt para NotebookLM:**
    > *"Tengo un cliente con este briefing: [Pega aquí el briefing del cliente]. Basándote en `niches.json` y el catálogo de componentes en `README.md` de la biblioteca, ¿qué vertical oficial de las 23 existentes se adapta mejor? ¿Qué componentes exactos de la biblioteca debo indicarle al CLI para inyectar en caliente? y ¿cuál es la paleta de colores HSL que sugieres configurar para su marca?"*

