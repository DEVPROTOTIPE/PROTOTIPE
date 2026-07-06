# Propuesta Técnica: Modo "Crear desde Cero" (Core Seed Aislado)

Esta propuesta técnica detalla cómo habilitar la opción de crear aplicaciones totalmente personalizadas desde cero en el asistente de aprovisionamiento de **Prototipe**, sin perder la automatización de base de datos, branding y Feature Flags.

---

## 1. Concepto y Enfoque

Cuando seleccionas **"Crear desde cero"** en el selector de plantillas:
1. **No se copia un vertical completo** (como la plantilla de calzado/ropa con su catálogo predefinido).
2. **Se copia un "Core Seed"** (`template-core-seed`), que es una estructura vacía pero completamente configurada con los servicios que todas las aplicaciones usan sin excepción (telemetría, listeners de Firebase, autenticación base, HSL variables y constantes).
3. **Rol de la IA:** El prompt de arranque (`antigravity_bootstrap_prompt.md`) le indica a la IA que asuma el control de un lienzo limpio, ordenándole construir la interfaz del cliente utilizando componentes atómicos, limpios y modulares a partir del catálogo de la biblioteca (`06_Biblioteca_Componentes`).

---

## 2. Inventario de Archivos Reutilizables (Core Seed)

Identificamos los componentes y archivos que son **100% reutilizables** y deben venir pre-cargados en cualquier aplicación construida desde cero:

### ⚙️ Configuración y Build
* `package.json` / `vite.config.js` / `tailwind.config.js` / `index.html` / `.gitignore`
* `.env.local` / `.firebaserc` (Inyectados dinámicamente)

### 📡 Servicios de Integración Central (Telemetría)
* `src/config/firebaseConfig.js` — Inicializador del SDK de Firebase local.
* `src/services/telemetryService.js` — Canal directo de envío de cobros a la central Spark.
* `src/services/billingService.js` — Calculador contable local (porcentaje, fijo, mensual).
* `src/services/appConfigService.js` — Sincronizador en caliente de la marca y Feature Flags de Firestore.

### 👤 Estado de Autenticación Base
* `src/store/authStore.js` — Estado Zustand de la sesión (Rol y datos de usuario).
* `src/hooks/useAuthInit.js` — Oyente reactivo a los cambios de sesión de Firebase Auth.

### 🎨 Diseño y Constantes
* `src/index.css` — Estructura base con las variables CSS mapeadas a Tailwind v4 (`@theme`).
* `src/constants/index.js` — Constantes compartidas (Roles, Métodos de pago, Estados de Pedidos).
* `src/components/ui/` — Botones atómicos, inputs de marca blanca, interruptores y toasts básicos.

---

## 3. Flujo y Modificaciones Arquitectónicas

```
[Dashboard Dev Wizard]
        │
        ├── Modos comisionales, Firebase API, Branding, Módulos
        ▼
[CLI API Bridge] ──▶ ¿Template: "crear-desde-cero"?
                           ├── SI: Copia "template-core-seed"
                           └── NO: Copia "template-ventas" (u otra réplica)
        │
        ├── Inyecta HSL, genera VAPID, inyecta .env.local, .firebaserc
        ▼
[Proyecto Destino]
        ├── Estructura limpia y compilando
        └── Prompt de arranque IA optimizado para desarrollo modular
```

### Regla de Desarrollo Modular (Component-First)
Para evitar archivos monolíticos gigantes (código espagueti), el generador inyectará directrices estrictas en `GEMINI.md` y en el prompt de arranque:
1. **Aislamiento de Componentes:** Cada componente nuevo (ej. `ProductFormModal`, `BookingCalendar`) debe tener su propio archivo exclusivo dentro de `src/components/`. Queda prohibido agrupar múltiples elementos de lógica compleja en un solo archivo.
2. **Separación de Concernientes (Hooks):** La lógica de estado compleja debe extraerse a hooks personalizados (`src/hooks/`) o stores específicos (`src/store/`), dejando las vistas limpias.

---

## 4. Estructura del "template-core-seed"

El directorio `D:\PROTOTIPE\Prototipe-CLI\templates\template-core-seed\` contendrá esta estructura mínima:

```
template-core-seed/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── config/
│   │   └── firebaseConfig.js
│   ├── constants/
│   │   └── index.js
│   ├── store/
│   │   ├── authStore.js
│   │   └── appConfigStore.js
│   ├── hooks/
│   │   └── useAuthInit.js
│   └── services/
│       ├── telemetryService.js
│       ├── billingService.js
│       └── appConfigService.js
```
