# 🎨 Estándar de Storybook y Playgrounds Dinámicos Multi-Core

Este documento define las reglas de diseño para la creación de sandboxes interactivos en la Consola Central, garantizando la compatibilidad con cualquier componente genérico.

---

## 1. Registro Automático de Sandboxes
El Dashboard de desarrollo escanea la ruta de playgrounds usando `import.meta.glob`. 

Para que un componente se auto-cargue en el sandbox:
1.  Debe crearse en `dev-dashboard/src/components/admin/sandboxes/[NombreComponente]Sandbox.jsx`.
2.  Debe exportar por defecto un componente React interactivo.
3.  Debe consumir el layout unificado `<SandboxLayout>` pasándole las propiedades del componente.

---

## 2. Decoupled Sandbox (Aislamiento de Dependencias)
Queda prohibido importar stores de Zustand o contextos de bases de datos locales del Core en el archivo Sandbox. Si el componente requiere datos del sistema, estos deben inyectarse mediante propiedades configurables (props) de tipo array u objeto.

---

## 3. Metadatos de Storybook (COMPONENT_META)
Cada componente genérico debe estar registrado en el manifest de biblioteca con sus propiedades editables:

```javascript
export const COMPONENT_META = {
  name: "BotonRegreso",
  category: "Formularios y UI",
  props: {
    label: { type: "text", default: "Volver" },
    disabled: { type: "boolean", default: false },
    variant: { type: "select", options: ["primary", "secondary"], default: "primary" }
  }
};
```;
