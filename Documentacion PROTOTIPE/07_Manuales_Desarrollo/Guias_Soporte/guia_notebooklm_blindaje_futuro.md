# 🧠 Guía de Blindaje y Potenciación con NotebookLM en PROTOTIPE

Esta guía define las estrategias, prompts de comandos cognitivos y casos de uso recomendados para utilizar **NotebookLM** como una herramienta de auditoría de arquitectura, linter estético y planificador estratégico en el monorepo.

---

## 📂 Casos de Uso Recomendados

### 1. Auditor de Drift de Código (Linter Cognitivo Pre-Merge)
Antes de realizar commits o mergear una rama con componentes visuales o lógica pesada, copia y pega el código propuesto en NotebookLM junto a `guia_maestra_desarrollo.md` y `estandar_disenio_premium.md`.

*   **Prompt para NotebookLM:**
    > *"Actúa como el Auditor de Calidad Senior de PROTOTIPE. Evalúa el siguiente fragmento de código de React/Tailwind. Compara su diseño y lógica con los principios estéticos y técnicos especificados en la Guía Maestra y el Estándar de Diseño Premium (contraste de HSL, evitar bordes negros, z-index en steppers/ timelines, scroll de tablas y reseteos numéricos). Detalla cualquier desvío detectado y proporciona las líneas de código corregidas."*

---

### 2. Generador de Playbooks para Nuevos Cores y Módulos
Al expandir la plataforma a verticales de negocio atípicas que requieran un nuevo Core de Oro (ej. reservas de salones de eventos o agendas de talleres de tornería), utiliza las especificaciones del Core como contexto en NotebookLM.

*   **Prompt para NotebookLM:**
    > *"Basándote en las especificaciones definidas en `especificacion_nuevos_cores_oro.md` y `estandar_repositorios_infraestructura_agnostica.md`, genera el Playbook de Onboarding paso a paso para inicializar un nuevo Core de Oro llamado '[Nombre_Del_Core]'. Dame el árbol de directorios exacto que debo crear, el formato de su manifest JSON de configuración y los métodos Repository para la persistencia desacoplada."*

---

### 3. Simulador de Migración y Cambios de Infraestructura (Resiliencia)
Para blindar el negocio ante cambios de costos o caídas de Firebase, utiliza las guías de desacoplamiento de arquitectura para evaluar la portabilidad del monorepo.

*   **Prompt para NotebookLM:**
    > *"Si en el futuro decidiéramos migrar la persistencia física de Firestore de Google Cloud a Supabase (PostgreSQL) para abaratar costos de lecturas, ¿cuáles serían los archivos específicos de la estructura del monorepo actual y qué capas de la arquitectura en 3 capas de PROTOTIPE tendríamos que modificar? ¿Qué archivos de la biblioteca se conservarían 100% intactos gracias a nuestro desacoplamiento?"*

---

### 4. Consultor de Configuración para Clientes Atípicos
Cuando el briefing de preventa del cliente tenga complejidades operativas o nichos cruzados, utiliza NotebookLM para mapear sus componentes idóneos.

*   **Prompt para NotebookLM:**
    > *"Tengo un cliente con este briefing: [Pega aquí el briefing del cliente]. Basándote en `niches.json` y el catálogo de componentes en `README.md` de la biblioteca, ¿qué vertical oficial de las 23 existentes se adapta mejor? ¿Qué componentes exactos de la biblioteca debo indicarle al CLI para inyectar en caliente? y ¿cuál es la paleta de colores HSL que sugieres configurar para su marca?"*

---

## 🛠️ Criterio de Decisión (Cuándo Usar NotebookLM)
*   **Usar obligatoriamente:** Antes de registrar un nuevo componente atómico en la biblioteca o al diseñar integraciones complejas con APIs de Google Cloud para prevenir regresiones.
*   **Ignorar:** En ediciones de formato menores o tareas de mantenimiento triviales.
