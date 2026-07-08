# 🚀 Guía de Onboarding Técnico para Desarrolladores Junior

¡Bienvenido al equipo de PROTOTIPE! Como desarrollador junior, entrar a un ecosistema multitenant de marca blanca puede parecer complejo al principio, pero siguiendo esta guía paso a paso te adaptarás rápidamente.

Esta guía consolida la estructura de archivos, las reglas de diseño inquebrantables y el flujo para levantar el entorno de desarrollo local.

---

## 📂 Paso 1: Cómo estructurar un nuevo componente para la biblioteca

Todo componente reutilizable en PROTOTIPE debe ser portátil, agnóstico a la marca y estar rigurosamente documentado para que el CLI y el Dashboard puedan inyectarlo en las instancias de clientes. Sigue esta estructura:

1. **Ubicación y Nomenclatura:** Crea una subcarpeta con un nombre descriptivo en español dentro de `Documentacion PROTOTIPE/06_Biblioteca_Componentes/[Categoría]/[Nombre_Español]/` y dentro, tu archivo markdown (ej. `nombre_en_serpiente.md`).
2. **El Manifiesto de Dependencias (JSON):** Tu archivo `.md` debe iniciar obligatoriamente con un bloque de comentarios HTML que contenga un JSON con el "Manifiesto de Dependencias" (`dependencies.npm`, `dependencies.internal`) y el `targetPath` donde se instalará en el cliente final:
   ```html
   <!-- {
     "name": "Selector de Horarios",
     "technicalName": "SelectorHorarios",
     "type": "component",
     "targetPath": "src/components/common/SelectorHorarios.jsx",
     "dependencies": {
       "npm": { "lucide-react": "^0.300.0" },
       "internal": []
     }
   } -->
   ```
3. **Contenido del Markdown:** Debe incluir el propósito y casos de uso, las variables CSS a utilizar (Tailwind / CSS tokens HSL), el código React 100% completo y funcional (sin elipsis ni placeholders), y diagramas Mermaid si aplica.
4. **Playground Interactivo (Sandbox):** Por cada componente visual, debes crear obligatoriamente un archivo de pruebas en `dev-dashboard/src/components/admin/sandboxes/[NombreComponente]Sandbox.jsx` importando el layout base de forma relativa (`<SandboxLayout>`). El dashboard lo descubrirá de forma automática.
5. **Registro Obligatorio (Bloqueante):** Para que el componente sea visible en el Dashboard Central, tienes que registrarlo en `06_Biblioteca_Componentes/README.md` y añadir su ruta al GPS semántico en `mapa_documentacion_ia.md`.

---

## 🎨 Paso 2: Reglas visuales inquebrantables (AGENTS.md)

Bajo ninguna circunstancia puedes violar el "Design Integrity Guard" de PROTOTIPE. Incumplir estas reglas hará que el linter del pre-build (`verify_library_integrity.cjs`) falle la compilación local:

*   **Cero colores hardcodeados:** Está prohibido usar clases estáticas como `bg-emerald-500` o `bg-[#22c55e]`. Todo el color debe consumirse mediante las variables CSS HSL de marca blanca del ecosistema (ej. `bg-[var(--color-primary)]` o `bg-[var(--color-surface)]`).
*   **Prohibición de selectores `<select>` nativos:** Nunca uses el elemento `<select>` nativo de HTML. Emplea obligatoriamente el componente `CustomSelect.jsx` proveído en la interfaz.
*   **Prevención de Truncamiento (Anti-Clipping):** Todo contenedor que tenga desplazamiento o scroll (`overflow-x-auto` u `overflow-y-auto`) y elementos con sombras (`shadow-xl`) o transformaciones al pasar el mouse (`hover:-translate-y-1`) debe llevar obligatoriamente paddings de holgura (mínimo `py-4` o `px-4`) para evitar que se corten los efectos visuales.
*   **Confirmación de acciones destructivas:** Jamás uses `alert()` o `confirm()` nativos. Toda eliminación o borrado debe pasar asíncronamente por el modal promesificado del hook `useAlertConfirm()`.
*   **Responsividad Mobile-First:** Los formularios y grupos de botones deben apilarse verticalmente en móviles por defecto (`flex-col`) y alinearse en fila únicamente en pantallas más grandes (`sm:flex-row`).

---

## 🛠️ Paso 3: Levantamiento del Entorno y Compilación Local

La plataforma opera en dos capas locales conectadas entre sí:

### A. Levantar la API Bridge (Backend del CLI)
1. Abre una terminal en `D:\PROTOTIPE\Prototipe-CLI`.
2. Ejecuta `npm install`.
3. Inicia el servidor con `npm start` (o `node server.js`). Correrá en el puerto `3001`.

### B. Levantar el Dashboard Central (Frontend)
1. Abre una segunda terminal en `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard`.
2. Ejecuta `npm install`.
3. Inicia el entorno de desarrollo con `npm run dev`. Correrá en el puerto `5173`.

### C. Proceso de Compilación y Validación
Al hacer cualquier modificación en el código o antes de realizar un commit, es obligatorio ejecutar `npm run build` en el proyecto afectado (Dashboard o instancia del cliente). 

Esto asegura que no falten importaciones de hooks de React y que el bundle de Vite (Rollup) no contenga errores estructurales. Si el build falla, tu tarea no está terminada y no debes subir cambios.
