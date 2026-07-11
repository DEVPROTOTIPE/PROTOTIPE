# Documento Maestro: Evolución y Arquitectura de la Plataforma Prototype

Este documento es la **fuente de verdad técnica definitiva** de la plataforma Prototype. Detalla la historia de la evolución del monorepo, la arquitectura actual de **Core v2.8 (SaaS Enterprise Agnóstico)**, el **Experience Framework** y el diseño de la inminente **Fase 8 (Product Intelligence)**.

---

## 1. Historia de Evolución Arquitectónica

La plataforma ha atravesado una evolución incremental para pasar de una plantilla rígida a un generador universal desacoplado:

### Etapa 1: Core Inicial (Monolito Comercial)
La base de código original (`template-ventas`) estaba fuertemente acoplada a un modelo de negocio de E-commerce y Ventas al por menor (Retail). Los servicios del Core importaban directamente colecciones como `products` y `orders`, impidiendo su uso en verticales de servicios (ej. clínicas, CRM, educación).

### Etapa 2: Migración a Feature Driven Development (FDD)
Se segmentó la base de código separando las funcionalidades de negocio en módulos autónomos (`src/features/*`). Cada feature se autocontiene (posee sus propios componentes, páginas, store local, hooks y utilidades), reduciendo el acoplamiento del monolito.

### Etapa 3: Core v2.x (Separación Física y Aislamiento)
Se introdujeron contratos de persistencia (`databaseContract.js`) y telemetría para prohibir accesos directos al Firebase SDK desde componentes visuales, garantizando un aislamiento multi-tenant estricto y abstracción de bases de datos.

### Etapa 4: Core v2.8 SaaS Agnostic (Semilla de Marca Blanca)
* ** template-core-seed:** Se creó como una semilla pura libre de conceptos transaccionales de Retail.
* **Bootstrapping Dinámico (FeatureLoader):** Se implementó un motor de carga de features asíncrono ordenado topológicamente según sus dependencias con tolerancia a fallos.
* **Navegación Dinámica:** Implementado `NavigationRegistry.js` para permitir a las features inyectar sus propias rutas y menús.
* **Auditoría Automática (`npm run test:audit`):** Script de NodeJS en CI/CD que escanea imports cruzados y prohíbe el ingreso de palabras clave comerciales en el Core.

### Etapa 5: Experience Framework + Provisioning Intelligence (Fase 7)
* **Desacoplamiento de Manifiestos:** Separación de configuraciones estáticas en 7 archivos JSON independientes (`application.json`, `tenant.json`, `experience.json`, `branding.json`, `billing.json`, `patterns.json`, `dashboard.json`) validados con esquemas de Zod en tiempo de bootstrap (`ExperienceRegistry.js`).
* **ComponentRegistry & PatternRegistry:** Capa de runtime para lazy loading de widgets Bento y patrones UX interactivos gobernados por permisos de rol (`PermissionRegistry.js`).
* **CLI Modular:** El CLI del ecosistema (`generator.js`) copia e inyecta features y manifiestos de forma selectiva basándose en presets industriales (`verticals/`).

### Etapa 6: Fase 8 — Hacia la Plataforma Generadora
Evolución de la CLI para eliminar reglas cableadas (`if (vertical === 'clinica')`) en favor de un motor descriptivo basado en la **Capa de Conocimiento (Knowledge Layer)** que mapea necesidades cualitativas a capacidades técnicas, emitiendo un objeto de especificación intermedio llamado **Application Blueprint**.

---

## 2. Arquitectura Actual del Sistema (Core v2.8)

El código de la aplicación final generada se divide en una estructura limpia de capas desacopladas:

```
[ template-core-seed/src/ ]
├── core/
│   ├── kernel/           // FeatureLoader (Bootstrapping topológico)
│   ├── contracts/        // Contratos abstractos (database, telemetry)
│   ├── permissions/      // PermissionRegistry (Roles y comodines)
│   ├── config/           // NavigationRegistry, ComponentRegistry
│   ├── experience/       // ExperienceRegistry (Zod validations), ExperienceResolver
│   └── dashboard/        // DashboardComposer (Resolución Bento de widgets)
│
├── config/               // 7 Manifiestos JSON modulares y build-manifest.json
│
├── features/             // Características transaccionales inyectadas
│   ├── appointments/     // (Clínica)
│   └── sales/            // (Retail)
│
└── App.jsx               // Bootstrap unificado
```

### 🧩 Core Universal vs Features
* **Core Universal:** Es 100% de marca blanca e ignorante de verticales comerciales. Expone los contratos de persistencia, enrutamiento, ciclo de vida de features, el manejador de layouts (`MainLayout.jsx`) y el sistema de bootstrap de experiencia.
* **Features:** Son módulos autocontenidos que se registran en runtime. Inyectan sus widgets en el `ComponentRegistry`, sus rutas de administración en `NavigationRegistry`, y consumen los servicios del Core mediante los contratos del dominio.

---

## 3. Motor de Aprovisionamiento Actual (CLI)

El flujo de aprovisionamiento de la CLI se ejecuta de la siguiente manera:

```
   [ BRIEFING STUDIO ] (Preguntas del CLI)
            │
            ▼
[ VERTICAL EXPERIENCE PACKS ] (verticals/clinica, verticals/retail)
            │
            ▼
     [ generator.js ]
            ├─► Inyecta 7 Manifiestos JSON en src/config/
            ├─► Copia features requeridas a src/features/
            ├─► Escribe .env.local (Parámetros y secretos seguros)
            └─► Emite build-manifest.json (Metadatos de auditoría)
```

### Transformación de Respuestas a Variables Técnicas:
* **Entrada del Briefing:** El usuario elige la vertical (`vertical Choice`), nombre del proyecto e iniciales.
* **Mapeo:** La CLI lee la vertical seleccionada y carga el pack de `verticals/[vertical]/`. Copia las features asociadas, inicializa los manifiestos JSON con el nombre del cliente y las iniciales autogeneradas, y escribe las credenciales de Firebase de forma segura en el archivo `.env.local` sin contaminar los JSON del Core.

---

## 4. Sistema de Personalización Dinámica

El Experience Framework de la semilla base renderiza la aplicación final a través de variables CSS nativas e inyección en runtime:
* **Branding Dinámico (HSL):** El `ExperienceRegistry.js` lee los tokens cromáticos de `branding.json` y los inyecta en el DOM raíz (`documentElement.style.setProperty`), adaptando dinámicamente los acentos del tema.
* **Tipografías:** Carga dinámicamente hojas de estilo desde Google Fonts según la propiedad `typography` del `experience.json`.
* **Densidades Visuales:** Soporte para tres clases de densidad en cascada (`compact`, `comfortable`, `spacious`) que controlan paddings y tamaños de letra del layout principal de forma responsiva.
* **Bento Dashboard:** El `DashboardComposer` mapea los widgets activos del `dashboard.json` y comprueba sus permisos en `ComponentRegistry` antes de resolver su carga asíncrona (`React.lazy`).
* **Navegación Dinámica:** Las features registran sus rutas en su ciclo de vida `initialize` contra el `NavigationRegistry`, y el layout principal renderiza de forma automática las pestañas e iconos del panel administrativo.

---

## 5. Arquitectura Fase 8 Preparada (Product Intelligence)

La Fase 8 redefine el aprovisionamiento desacoplando la inteligencia de decisión del ejecutor físico:

### A) Knowledge Layer (Conocimiento Declarativo)
Consiste en catálogos estructurados por archivos JSON en la carpeta `knowledge/`:
* `knowledge/features/`: Definición de features por **Capacidades** (ej. `appointments.json` requiere capacidad `calendar-management`).
* `knowledge/components/`: Metadatos de gobernanza y calidad de componentes UI.
* `knowledge/capabilities/capability-map.json`: Mapea requerimientos del negocio a features.
* `knowledge/schema/`: Esquemas JSON Schema formales para auditar y validar el catálogo.

### B) Intelligence Layer (Motores Lógicos de Decisión)
* **`BiResolver`:** Mapea el briefing cualitativo a una lista de capacidades técnicas requeridas.
* **`CapabilityResolver`:** Resuelve qué features y patrones de interacción satisfacen las capacidades seleccionadas de forma multivertical.
* **`FeatureRecommender`:** Analiza y resuelve recursivamente dependencias y exclusiones lógicas del catálogo de features.
* **`ExperienceComposer`:** Deduce la tipografía, densidad y distribución Bento Bento-Grid de la rejilla analítica del dashboard.

### C) Generation Layer (Ejecución Plana)
* **`ProvisioningValidator`:** Valida la viabilidad física del `Application Blueprint` emitido.
* **`Blueprint Simulation`:** Calcula dependencias, bundle, componentes y roles para previsualización.
* **`PackageMerger`:** Fusiona dinámicamente las dependencias de package.json.
* **`generator.js`:** Copia archivos e inyecta configuraciones de forma secuencial sin lógica condicional de negocio.

---

## 6. Reglas Arquitectónicas Vigentes (No Negociables)

1. **Agnosticidad Absoluta del Core:** El Core (`src/core/`) no debe importar features ni contener variables o terminología de industrias específicas.
2. **Ignorancia Comercial en el Generador:** El script `generator.js` del CLI no debe contener lógica condicional (`if (vertical === 'clinica')`); solo debe ejecutar planos un `Application Blueprint` validado.
3. **Comunicación por Contratos:** Las features deben comunicarse entre sí únicamente mediante interfaces abstractas (`inventoryInterface.js`) o eventos del bus (`EventBus.js`).
4. **Knowledge Layer Única Fuente de Decisión:** Las dependencias, compatibilidades y presets lógicos deben residir exclusivamente en la base de conocimiento de `knowledge/`.
5. **No Secretos en Manifiestos:** Las variables privadas (`developerPin`, APIs, credenciales) deben persistir únicamente en el archivo `.env.local` y variables de entorno de la nube.
6. **Toda Generación Pasa por Blueprint:** El generador de la CLI solo lee y procesa el objeto intermedio `Application Blueprint` versión 1.0.0.
7. **Normalización del Score Bento:** El scoring actual ponderado con multiplicador por superposición de capabilities (Bono de Match) es aceptado para esta versión, pero debe incorporarse una normalización del score a rango de 0 a 100 si el catálogo del Component Marketplace escala significativamente.
8. **Explainability Logger Permanente:** El `ExplainabilityLogger` que emite `.prototipe-audit-trail.jsonl` e `historial_[clientId].md` es un contrato fijo y obligatorio de trazabilidad del motor de aprovisionamiento.
9. **Principio de Aislamiento de IA:** Ningún futuro módulo de LLM/IA debe escribir o modificar archivos de código React de forma directa. La IA debe actuar exclusivamente sobre la creación y enriquecimiento del `Application Blueprint` validado por esquemas, dejando la escritura de archivos al generador físico plano.

---

## 7. Estado de Madurez Actual del Ecosistema

* **Nivel de Madurez Actual:** *SaaS Application Generation Framework*
* **Capacidades Logradas:**
  * Generación automatizada multi-vertical e inyección modular de features en 5.95s.
  * Validación rigurosa de manifiestos Zod y branding HSL dinámico en caliente.
  * Auditoría de agnosticidad en CI/CD que garantiza blindaje contra imports comerciales cruzados.
  * Estructura de la Knowledge Layer creada y validada al 100% contra JSON Schemas.

---

## 8. Tabla de Control: Estado de Roadmap (Pendientes vs Completados)

### Completados
* **Core v2.8 Agnostic Seed:** Purgado comercial y bootstrapping asíncrono topológico.
* **Experience Framework (Fase 7):** Registros dinámicos, validación Zod y Dashboard Bento de widgets.
* **Vertical Experience Packs:** Presets modulares iniciales para la CLI.
* **Fase 8.1 - Knowledge Layer:** Subcarpetas, esquemas JSON Schema y script de validación `validate:knowledge` con Ajv.

### Pendientes (Fase 8.2 - 8.6)
* **Application Blueprint (Hito 8.2):** Definición del contrato y del `ProvisioningValidator` y simulador.
* **Capability & Feature Recommendation (Hito 8.3):** Motores de resolución de capacidades a features.
* **Experience Composer (Hito 8.4):** Resolver Bento dinámico en el CLI.
* **Integración del CLI (Hito 8.5):** Rediseño del Briefing Studio y acoplamiento en `generator.js`.
* **Validación Multivertical (Hito 8.6):** Generación de Clínica, Restaurante, CRM, Academia y Gimnasio.
