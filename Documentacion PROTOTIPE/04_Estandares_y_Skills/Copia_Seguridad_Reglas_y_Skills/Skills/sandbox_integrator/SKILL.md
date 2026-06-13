---
name: sandbox-integrator
description: >-
  Integra un componente ya existente en la Biblioteca de Componentes al sandbox
  interactivo del dev-dashboard. Lee el .md del componente, evalúa si es
  simulable, y ejecuta los cambios en ComponentSandbox.jsx automáticamente.
  Se activa cuando el usuario escribe @sandbox seguido del nombre del proyecto
  y el nombre del componente.
trigger: "@sandbox"
aliases:
  - "@sandbox [PROYECTO_ACTIVO] [NombreComponente]"
---

# Sandbox Integrator

## 📁 Variable de Proyecto Dinámica

> **Variable `[PROYECTO_ACTIVO]`:** Ruta raíz del proyecto sobre el que se está trabajando. Se determina en este orden de prioridad:
> 1. Si el usuario la especificó en el trigger (ej. `@sandbox "App Reservas" "SelectorFecha"`), usar esa.
> 2. Si hay un proyecto abierto actualmente en el contexto de la sesión, usar ese.
> 3. Si ninguna de las anteriores aplica, preguntar al usuario antes de continuar: "¿En qué proyecto estás trabajando? Indica la ruta o el nombre de la plantilla."

---

## 📁 Rutas del Proyecto

> Las rutas de este flujo se construyen dinámicamente usando `[PROYECTO_ACTIVO]`. Las rutas de documentación y biblioteca son siempre fijas (pertenecen al ecosistema, no a un proyecto específico):
>
> **Rutas fijas del ecosistema (siempre iguales):**
> - Biblioteca: `D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\`
> - Bitácora: `D:\PROTOTIPE\Documentacion PROTOTIPE\03_Auditorias_y_Faro_Core\bitacora_cambios.md`
> - Mapas: `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\`
> - Dev-dashboard: `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\`
>
> **Rutas dinámicas del proyecto (dependen de `[PROYECTO_ACTIVO]`):**
> - Código fuente: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\`
> - Componentes: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\components\`
> - Hooks: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\hooks\`
> - Servicios: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\services\`
> - Variables de entorno: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\.env.local`
> - Package: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\package.json`

---

## Overview
Esta skill define el protocolo que el agente ejecuta para conectar un componente
ya documentado en la biblioteca con el sandbox interactivo del dev-dashboard.
El agente NO debe hacer preguntas al usuario — debe leer el `.md`, analizar el
código documentado y tomar decisiones autónomamente.

## Trigger / Activación
Se activa cuando el usuario escribe **`@sandbox [PROYECTO_ACTIVO] [NombreComponente]`**.

---

## Workflow

### 1. Localizar el archivo .md en la Biblioteca
- Busca en `D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\` usando `grep_search` con el nombre del componente.
- Si no lo encuentras por nombre exacto, busca por palabras clave del nombre.
- Lee el archivo `.md` completo con `view_file`.
- **Si no existe el archivo:** reporta al usuario que el componente no está registrado en la biblioteca y detén la ejecución.

### 2. Evaluar Simulabilidad

> ⚠️ **FUENTE DE VERDAD:** Esta tabla es la definición canónica de simulabilidad para todo el ecosistema PROTOTIPE. La skill `component_extractor` (Paso 10.1) debe seguir exactamente estas mismas reglas. Si detectas una inconsistencia entre ambas tablas, aplica siempre los criterios de esta skill y notifica al usuario para sincronizar `component_extractor`.

Analiza el contenido del `.md` (secciones de código, dependencias, integraciones) aplicando estas reglas:

| Condición detectada | Clasificación | Acción |
|---|---|---|
| Solo `useState`, `useEffect` sin Firebase, puro CSS/Tailwind | ✅ **Simulable** | Ir al Paso 3 |
| Menciona `firebase`, `firestore`, `onSnapshot`, `runTransaction` | ⚙️ **Servicio/Hook Firebase** | Ir al Paso 4 |
| Menciona `leaflet`, `react-leaflet`, `Nominatim` | 🧩 **Dependencia Externa** | Ir al Paso 4 |
| Menciona `framer-motion` + Zustand store | 🧩 **Módulo Complejo** | Ir al Paso 4 |
| Es una vista/página con `react-router` | 📄 **Página Completa** | Ir al Paso 4 |
| Menciona operaciones destructivas (borrar, resetear BD) | ⚠️ **Herramienta Destructiva** | Ir al Paso 4 |
| Usa CSS Modules, styled-components o Emotion (sin Firebase) | ✅ **Simulable con adaptación** | Recrear con Tailwind inline en el sandbox. |
| Mezcla custom hook propio (sin Firebase) + estado local | ✅ **Simulable** | Embeber el hook directamente en el archivo Sandbox. |

### 3. Si ES simulable — Crear el Playground

#### 3a. Crear el archivo de Sandbox independiente
- Crea un archivo independiente en `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\[NombreComponente]Sandbox.jsx`.
- Queda estrictamente PROHIBIDO inyectar la lógica del componente o del playground inline en `ComponentSandbox.jsx`.
- Este archivo debe exportar por defecto el sandbox interactivo con sus propios controles, imports y componentes de apoyo embebidos.
- Estructura básica del archivo de sandbox:
```jsx
import React, { useState } from 'react';
import SandboxLayout from '../SandboxLayout';
// Importa iconos de lucide-react u otros componentes auxiliares de UI locales si es necesario

export default function NombreComponenteSandbox() {
  const [prop1, setProp1] = useState(valorDefault);
  const [prop2, setProp2] = useState(valorDefault);

  return (
    <SandboxLayout
      title="Nombre Exacto del Componente"
      description="Una línea describiendo qué hace."
      controls={[
        { label: 'Prop1', type: 'toggle', value: prop1, onChange: setProp1, labels: ['Off', 'On'] },
        { label: 'Prop2', type: 'select', value: prop2, options: ['opcion1', 'opcion2'], onChange: setProp2 },
      ]}
    >
      {/* Versión visual del componente recreado visualmente */}
    </SandboxLayout>
  );
}
```

#### 3b. Registrar en `ComponentSandbox.jsx`
Edita `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\ComponentSandbox.jsx`:
1. **Importación Dinámica Perezosa:** Registrar el nuevo sandbox al inicio usando importación dinámica:
   `const NombreComponenteSandbox = React.lazy(() => import('./sandboxes/NombreComponenteSandbox'));`
2. **Registro en `SANDBOXES`:** Registrar la clave del playground en el diccionario `SANDBOXES` envuelto en `React.Suspense` con el cargador común:
   ```javascript
   'nombre_clave': () => (
     <React.Suspense fallback={<LoaderSpinner />}>
       <NombreComponenteSandbox />
     </React.Suspense>
   ),
   ```
3. **Aliases en `COMPONENT_SANDBOX_MAP`:** Registrar todos los aliases en minúsculas (nombre natural, técnico, variantes ES/EN):
   ```javascript
   // Nombre en minúsculas con tildes — exactamente como aparece en el árbol del visor
   'nombre exacto del componente': 'nombre_clave',
   // Alias adicionales si el nombre puede variar
   'nombre alternativo': 'nombre_clave',
   ```

**Regla crítica de nombres:** La clave del mapa debe ser el nombre del componente en **minúsculas con tildes**, tal y como aparece en el `README.md` de la biblioteca.

### 4. Si NO es simulable — Registrar en `COMPONENT_META`
Agrega la entrada en el objeto `COMPONENT_META` dentro de `ComponentSandbox.jsx`:

```js
'nombre exacto del componente': {
  type: 'hook' | 'service' | 'page' | 'complex',
  label: 'Custom Hook' | 'Servicio' | 'Página Completa' | 'Módulo Completo' | 'Dependencia Externa' | 'Herramienta Destructiva',
  color: 'violet' | 'amber' | 'blue' | 'teal' | 'red',
  note: 'Explicación técnica de por qué no aplica el sandbox y cómo integrarlo correctamente en un proyecto.'
},
```

| `type` | `color` | Cuándo usarlo |
|---|---|---|
| `hook` | `violet` | Hooks de React / Context providers |
| `service` | `amber` | Módulos JS puros / Firebase services |
| `page` | `blue` | Vistas completas con router |
| `complex` | `teal` | Componentes con Leaflet, Framer, Zustand store |
| `complex` | `red` | Herramientas destructivas (operaciones de borrado) |

### 5. Verificar Build
```bash
cmd /c npm run build
```
Ejecutar en `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard`. Confirmar que compile sin errores.
Si hay errores de compilación, corregirlos antes de reportar al usuario.

### 6. Reportar al Usuario
Informa concisamente:
- ✅ Si se creó el playground: nombre del componente, controles disponibles, clave del mapa.
- ℹ️ Si solo se registró en `COMPONENT_META`: tipo detectado, razón técnica, instrucción de integración.

---

## Reglas de Implementación del Playground

### El componente inline NUNCA importa el real
El sandbox está en el repositorio `dev-dashboard`, que es un proyecto separado de las plantillas. No puedes importar componentes de otro repo. Debes recrear visualmente el componente con HTML + Tailwind + los iconos ya importados en `ComponentSandbox.jsx` (`lucide-react`).

### Prioridad de controles
Incluye como controles solo las props que **cambian visualmente** el componente. Props internas de lógica (callbacks de Firebase, IDs de colección) no se controlan en el sandbox.

### Fidelidad visual
El playground debe verse y comportarse como el componente real. Si el `.md` incluye capturas, estilos detallados o código de referencia, úsalos para que la recreación sea lo más fiel posible.

---

## Common Mistakes
* **Importar el componente real desde otro proyecto:** Imposible. Siempre recrear inline.
* **No verificar el build:** Todo cambio en `ComponentSandbox.jsx` debe compilar antes de reportar.
* **Clave del mapa con mayúsculas o sin tildes:** Debe coincidir exactamente con el nombre que aparece en el árbol del visor (minúsculas con tildes incluidas).
* **Agregar controles para props de Firebase:** Los callbacks, rutas de colección y tokens no se controlan en el sandbox.
* **Detener la ejecución sin reportar:** Si el componente no es simulable, siempre registrar en `COMPONENT_META` — nunca dejar el componente sin ninguna entrada.
