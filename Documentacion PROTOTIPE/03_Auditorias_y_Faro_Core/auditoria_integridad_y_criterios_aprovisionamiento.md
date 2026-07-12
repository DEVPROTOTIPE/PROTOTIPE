# Auditoría Técnica: Integridad de Aprovisionamiento y Criterios de Calidad

Este informe evalúa minuciosamente el motor de generación de instancias (`generator.js` y `server.js` de **Prototype CLI**), la paridad con la **Biblioteca de Componentes**, y la calidad de compilación e interfaz visual de la semilla base **App Ventas**. El objetivo es identificar vulnerabilidades de inyección, riesgos de componentes huérfanos y violaciones estéticas de interfaz para proponer un plan de acción definitivo.

---

## 1. Hallazgos del Motor de Aprovisionamiento (Prototype-CLI)

### 🔴 Hallazgo 1: Omisión Crítica de Dependencias Internas Transitivas (Causa de Orfandad Lógica)
*   **Tipo:** Arquitectura / Consistencia de Código
*   **Severidad:** Crítico
*   **Ubicación:** [generator.js:L3883-3953](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L3883-L3953) en la función `injectSelectedComponents`.
*   **Causa Raíz:** Al inyectar un componente recomendado de la biblioteca (ej: un modal de Checkout), el script solo lee su archivo JSX principal y lo copia al destino. Ignora por completo el campo `"dependencies.internal"` declarado en el Frontmatter JSON del markdown. Si el componente depende de otros átomos o utilidades (como `CustomSelect` o `BrandIcons`), el CLI no los copia recursivamente, dejando la app con dependencias rotas e inoperantes.
*   **Solución Concreta:** Refactorizar la función `injectSelectedComponents` para que resuelva de forma recursiva (grafo de dependencias) e inyecte recursivamente todos los archivos JSX declarados en `"dependencies.internal"`, evitando así componentes rotos.

---

### 🟡 Hallazgo 2: Acoplamiento Rígido y Falta de Conciliación de Versiones NPM
*   **Tipo:** DevOps / Gestión de Dependencias
*   **Severidad:** Medio
*   **Ubicación:** [generator.js:L3883](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L3883).
*   **Causa Raíz:** Al inyectar componentes que requieren paquetes NPM externos (declarados en `"dependencies.npm"`), el generador inyecta las dependencias directamente en el `package.json` de la app destino sin conciliar versiones. Si hay un conflicto de versiones con una dependencia ya instalada en la semilla, el comando `npm install` fallará o generará incompatibilidades en caliente.
*   **Solución Concreta:** Implementar un validador semántico en `PackageMerger.js` que compare los rangos de versiones (semver) antes de inyectar dependencias y lance una advertencia o resuelva la versión compatible superior.

---

## 2. Hallazgos de UI/UX y Estabilidad en App Ventas (Semilla Core)

### 🔴 Hallazgo 3: Componentes de Admin Expuestos a Importación Insegura (RBAC Leak)
*   **Tipo:** Seguridad física / Control de Acceso
*   **Severidad:** Crítico
*   **Ubicación:** [OrderDeliveryPanel.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/orders/OrderDeliveryPanel.jsx) y [DeliveryCustomMessengerPanel.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/settings/DeliveryCustomMessengerPanel.jsx).
*   **Causa Raíz:** El linter de integridad del monorepo detectó que estos componentes residen fuera de la carpeta de páginas de administración (`pages/admin`) y no realizan validaciones explícitas de rol de administrador (`user.role === 'admin'`) a nivel interno. Aunque están embebidos en vistas protegidas, una importación accidental o maliciosa en vistas públicas expondría la manipulación de base de datos asíncrona a usuarios no autorizados.
*   **Solución Concreta:** Envolver las funciones de escritura/acción en una validación de seguridad a nivel de componente que lea el contexto de autenticación, o asegurar que las funciones críticas del repositorio Firebase realicen la validación interna.

---

### 🟡 Hallazgo 4: Violación del Estándar de Contraste en Estados Deshabilitados (Slate Inversion Bug)
*   **Tipo:** UI / UX / Responsividad
*   **Severidad:** Medio
*   **Ubicación:** Múltiples formularios e inputs de la semilla.
*   **Causa Raíz:** Se emplean clases hardcoded como `bg-slate-200 text-slate-400` para estados deshabilitados. Debido a la regla de inversión de escala de color HSL en Modo Claro, estos tonos se oscurecen o aclaran inversamente, provocando que los inputs deshabilitados colisionen con los normales o queden ilegibles.
*   **Solución Concreta:** Reemplazar el uso de clases slate fijas en estados deshabilitados por la combinación semántica de variables del tema de la directiva `AGENTS.md`: `bg-[var(--color-surface-3)] text-[var(--color-text-muted)]/50 border border-[var(--color-border)] cursor-not-allowed`.

---

## 3. Criterios de Creación de Aplicaciones e IA (Onboarding Ecosistema)

### 🔴 Hallazgo 5: Desconexión de Onboarding e Inyección de Átomos (Código Duplicado por IA)
*   **Tipo:** Consistencia y Reutilización
*   **Severidad:** Crítico
*   **Ubicación:** Flujo de Discovery y CLI.
*   **Causa Raíz:** El Onboarding Wizard e inyectores de la CLI seleccionan Features principales, pero no asocian los átomos indispensables de soporte (ej: `ConnectivityToast`, `BrandIcons`, `AppLoader`, `GuidedToast`). Cuando la IA del monorepo asiste al cliente final para desarrollar interfaces personalizadas, al no ver estos componentes registrados en `guia_estilos_ui.md`, la IA genera código UI ad-hoc en caliente (duplicando SVGs, timers o cargadores), creando componentes huérfanos y desorden en el bundle.
*   **Solución Concreta:** 
    1. Automatizar que todo aprovisionamiento de app instale por defecto el Hub de Iconos de Marca (`BrandIcons.jsx`) y el sistema de notificaciones atómicas.
    2. Modificar la inyección de componentes en el CLI para que, al seleccionar una Feature, inyecte automáticamente todas sus dependencias atómicas declaradas en el Frontmatter de la biblioteca.
