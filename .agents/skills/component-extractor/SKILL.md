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
- **Cero dependencias rígidas de librerías externas:** Si usa iconos o librerías específicas, debe diseñarse con fallbacks seguros.
- **Saneamiento de Controles y Confirmación:** Reemplaza selectores `<select>` nativos por el componente `CustomSelect`, e intercepta toda eliminación o borrado destructivo mediante la ventana modal de confirmación `useAlertConfirm`.
- **Registro en Manifiesto:** Declara explícitamente `CustomSelect` y `useAlertConfirm` en el array `dependencies.internal` del manifiesto JSON del archivo `.md` de documentación para asegurar que se porten en cascada.


### 3. Auto-Auditoría de Falencias de Portabilidad y Regresión (Fase Crítica)
- Identificar dependencias implícitas ausentes en un proyecto limpio.
- Validar rigurosamente la lógica interna (checks de stock, nulos, límites) antes de empaquetar.

### 4. Creación del Documento en la Biblioteca (Carpetización Estricta en Español)
- Crear la subcarpeta específica para el componente nombrada en **español claro** bajo su categoría correspondiente.
- **Ruta de Almacenamiento:** `[GIT_ROOT]/Documentacion PROTOTIPE/06_Biblioteca_Componentes/[Categoria]/[Nombre_Español]/[nombre_archivo].md`
- **Estructura Interna del Archivo:** Debe incluir el Manifiesto JSON en comentarios HTML al inicio.
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
