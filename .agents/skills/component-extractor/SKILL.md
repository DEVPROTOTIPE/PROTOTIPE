---
name: component-extractor
description: >-
  Extrae un componente o funcionalidad de la app actual de forma agnóstica al proyecto,
  lo refactoriza como componente reutilizable autónomo y lo documenta
  en la Biblioteca de Componentes del proyecto. Se activa cuando el
  usuario menciona @extraer-componente o indica que quiere guardar
  un patrón de la app en la biblioteca para reutilización futura.
trigger: "@extraer-componente"
aliases:
  - "@extraer-componente [PROYECTO_ACTIVO?]"
---

# Component Extractor (Extractor y Documentador de Componentes)

## 📁 Variable de Proyecto Dinámica

> **Variable `[PROYECTO_ACTIVO]`:** Ruta raíz del proyecto sobre el que se está trabajando. Se determina en este orden de prioridad:
> 1. Si el usuario la especificó en el trigger (ej. `@extraer-componente "App Reservas" "selector"`), usar esa.
> 2. Si hay un proyecto abierto actualmente en el contexto de la sesión, usar ese.
> 3. Si ninguna de las anteriores aplica, preguntar al usuario antes de continuar.

---

## 📁 Rutas del Proyecto Portables

> Las rutas se construyen dinámicamente usando el directorio raíz del ecosistema `[GIT_ROOT]`:
>
> **Rutas del ecosistema (portables):**
> - Biblioteca: `[GIT_ROOT]/Documentacion PROTOTIPE/06_Biblioteca_Componentes/`
> - Bitácora: `[GIT_ROOT]/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`
> - Mapas: `[GIT_ROOT]/Documentacion PROTOTIPE/04_Estandares_y_Skills/`
> - Dev-dashboard: `[GIT_ROOT]/Central PROTOTIPE/dev-dashboard/`
> - Manuales: `[GIT_ROOT]/Documentacion PROTOTIPE/07_Manuales_Desarrollo/`
>
> **Rutas del cliente/proyecto de desarrollo:**
> - Código fuente: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/`
> - Componentes: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/components/`
> - Hooks: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/hooks/`
> - Servicios: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/services/`
> - Variables de entorno: `[GIT_ROOT]/[PROYECTO_ACTIVO]/.env.local`
> - Package: `[GIT_ROOT]/[PROYECTO_ACTIVO]/package.json`

---

## Workflow

### 1. Auditoría Autónoma del Código Fuente
- **Acción:** Rastrear el componente o funcionalidad en `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/`.
- **Busca:** dependencias lógicas, custom hooks, variables de entorno, assets e iconos Lucide.

### 2. Refactorización para Reusabilidad
- **Props claras y tipadas** con valores default.
- **Cero hardcoding** de rutas de Firestore, variables HSL de color, o textos.
- **Uso estricto de variables HSL de marca blanca:**
  - Fondo: `bg-[var(--color-bg)]`
  - Superficies: `bg-[var(--color-surface)]` / `bg-[var(--color-surface-2)]`
  - Bordes: `border-[var(--color-border)]`
  - Textos: `text-[var(--color-text)]` / `text-[var(--color-text-muted)]`
  - Marca: `text-[var(--color-primary)]` / `bg-[var(--color-primary)]`
- **Responsividad Móvil y Prevención de Desbordamiento:**
  - Usar `flex flex-col` por defecto para formularios, paneles de control y barras de botones (mobile-first), cambiando a `sm:flex-row` únicamente en breakpoints superiores si hay espacio suficiente.
  - Envolver tablas en un div con `overflow-x-auto w-full`.
  - Aplicar `whitespace-nowrap` a cabeceras de tablas (`<th>`), fechas, identificadores y badges de estado para evitar saltos de línea y desbordamiento.
  - Usar `w-full max-w-[ancho]` en lugar de anchos fijos en px (no usar `w-[400px]`).
  - Para textos de nombres de productos o items que puedan ser largos, aplicar siempre contenedor con `min-w-0` y `truncate`/`break-words` para evitar empujar componentes adyacentes.
  - Usar paddings adaptativos (ej. `p-3 sm:p-5`) en lugar de fijos grandes (`p-6`) en móviles.
- **Prevención de Truncamiento en Scroll y Animación (Crítico):** En todo componente o sandbox extraído que emplee desplazamiento horizontal (`overflow-x-auto`) o vertical (`overflow-y-auto`) combinado con elementos interactivos que tengan animaciones de traslación (`translate-y`, `hover:-translate-y-1`), escalas (`scale-105`) o sombras de elevación (`shadow-xl`), es **obligatorio** aplicar un padding de holgura vertical u horizontal (mínimo `py-4` o `px-4`) dentro del contenedor de scroll. Esto garantiza que los bordes activos, tarjetas y efectos resplandecientes no sean recortados/cortados por los límites de caja del contenedor con scroll.
- **Saneamiento de Controles y Confirmación:** Reemplaza selectores `<select>` nativos por el componente `CustomSelect`, e intercepta toda eliminación o borrado destructivo mediante la ventana modal de confirmación `useAlertConfirm`.
- **Gobernanza de Fondos y Elevación Tonal en Modo Oscuro:** Reemplaza colores de fondo fijos por variables semánticas: base (`bg-[var(--color-bg)]`), tarjetas (`bg-[var(--color-surface)]`), desplegables (`bg-[var(--color-surface-2)]`) y modales (`bg-[var(--color-surface-3)]`). Las elevaciones en modo oscuro se expresan con tonos progresivos, no con sombras oscuras fijas.
- **Tamaño Mínimo de Botones e Interactividad (Touch Target WCAG):** Asegura que todos los botones y chips interactivos tengan un tamaño de objetivo táctil mínimo de **44x44 CSS px**. Asegura que declaren los 5 estados en Tailwind: Normal, `hover:opacity-90 transition-opacity`, `focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:outline-none`, `active:scale-[0.98] transition-all`, y Loading.
- **Prevención de Hovers Pegajosos en Dispositivos Táctiles:** Reemplaza hovers planos por hovers condicionales con la media query `@media (hover: hover)` en Tailwind para evitar que se queden pegados tras el tap en móviles. Aplica animaciones aceleradas por GPU (`transform` y `opacity` preferencialmente con will-change).
- **Resiliencia en Dropdowns y Prevención de Clipping:** Todo selector/dropdown personalizado debe ser accesible vía teclado (Tab, flechas, Esc, Enter) y declarar roles ARIA (`role="listbox"`, `aria-expanded`). Envolver desplegables con React Portals (`createPortal`) al final del body si se ubican dentro de contenedores con `overflow-hidden` o `overflow-y-auto`. Transformar dropdowns de más de 6 opciones en Bottom Sheets en viewports móviles (`sm`).
- **Usabilidad en Formularios y Disparadores Móviles (inputmode):** Enlazar inputs a labels mediante `htmlFor`. Declarar la propiedad `inputmode` para forzar el teclado óptimo en móviles en inputs de números (`inputmode="numeric" pattern="[0-9]*"`, decimales/precios -> `inputmode="decimal"`). Utilizar `<input type="date">` nativo en móviles.
- **Registro en Manifiesto:** Declara explícitamente `CustomSelect` y `useAlertConfirm` en el array `dependencies.internal` del manifiesto JSON del archivo `.md` de documentación para asegurar que se porten en cascada.



### 3. Auto-Auditoría de Falencias de Portabilidad y Regresión (Fase Crítica)
- Identificar dependencias implícitas ausentes en un proyecto limpio.
- Validar rigurosamente la lógica interna (checks de stock, nulos, límites) antes de empaquetar.

### 4. Creación del Documento en la Biblioteca (Carpetización Estricta en Español)
- Crear la subcarpeta específica para el componente nombrada en **español claro** bajo su categoría correspondiente.
- **Ruta de Almacenamiento:** `[GIT_ROOT]/Documentacion PROTOTIPE/06_Biblioteca_Componentes/[Categoria]/[Nombre_Español]/[nombre_archivo].md`
- **Estructura Interna del Archivo:** Debe incluir el Manifiesto JSON en comentarios HTML al inicio.
  > [!IMPORTANT]
  > Es obligatorio declarar `"type"` (ej. `"feature"`, `"component"`, `"atom"`, `"logic"`) y el array `"niches"` (con el ID de vertical o vacío `[]` si es global).
  > **REGLAS DE targetPath:**
  > - **Atom (`atom`):** Presentacionales puros. El `targetPath` debe ser `"src/components/ui/[NombreTécnico].jsx"`.
  > - **Component (`component`):** Layouts y navegación común. El `targetPath` debe ser `"src/components/common/[NombreTécnico].jsx"`.
  > - **Feature (`feature`):** Acoplados a dominio de negocio. El `targetPath` debe ser `"src/features/[featureName]/components/[NombreComponente].jsx"`.
  > - **Logic (`logic`):** Hooks o Repositorios. El `targetPath` debe ser `"src/features/[featureName]/hooks/[useHookName].js"` o `"src/features/[featureName]/api/[Repository].js"`.
  
  ```markdown
  <!--
  {
    "resource": "[NombreComponente]",
    "technicalName": "[NombreComponente]",
    "targetPath": "src/features/[featureName]/components/[NombreComponente].jsx",
    "type": "feature",
    "niches": ["[niche_key_de_vertical_o_vacio]"],
    "dependencies": {
      "npm": {
        "nombre-libreria": "^version"
      },
      "internal": []
    }
  }
  -->
  ```
  1. Propósito y Casos de Uso
  2. Especificación Visual y Estilos (Tailwind CSS)
  3. Props y API
  4. Código React Completo y 100% Funcional (sin omitir nada)
  5. Lógica de Estado y Ciclo de Vida
  6. Integración con Servicios Externos (Firestore)
  7. Diagramas de Flujo Mermaid
  8. Snippet de Ejemplo de Uso
  9. Origen de extracción

### 5. Evaluación y Creación Obligatoria de Manuales de Desarrollo
- **Acción:** Si el componente cumple con los umbrales de complejidad (2+ hooks, Firebase connect, lógica de negocio con 3+ estados interdependientes), se debe crear obligatoriamente un manual en `07_Manuales_Desarrollo/`.
- **Ruta de Almacenamiento del Manual:**
  `[GIT_ROOT]/Documentacion PROTOTIPE/07_Manuales_Desarrollo/[Categoria_Español]/[Nombre_Manual_Español]/manual_[nombre].md`
- **Estructura:** Propósito, Arquitectura y Flujo de datos, Guía de Integración paso a paso, y Troubleshooting.

### 6. Actualización Automática del README.md
- Registrar la nueva entrada del componente bajo su categoría en `[GIT_ROOT]/Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`.

### 7. Integración Automática con el Sandbox del dev-dashboard (OBLIGATORIO)
- Crear el archivo independiente `[NombreComponente]Sandbox.jsx` en `[GIT_ROOT]/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/`.
- Registrar aliases en `COMPONENT_SANDBOX_MAP` o `COMPONENT_META` de `ComponentSandbox.jsx` si aplica.
- Compilar con `cmd /c npm run build` en `dev-dashboard` y confirmar que no hay errores.
