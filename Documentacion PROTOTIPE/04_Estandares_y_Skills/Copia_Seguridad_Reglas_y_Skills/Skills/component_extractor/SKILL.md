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
Esta habilidad define el protocolo autónomo que el agente debe ejecutar cuando el usuario solicita extraer un componente o funcionalidad de la app actual y depositarlo en la Biblioteca de Componentes. El agente NO debe hacer preguntas al usuario — debe auditar el código por su cuenta, identificar toda la lógica relevante y producir el artefacto de documentación completo.

## Trigger / Activación
Se activa cuando el usuario escribe **`@extraer-componente [PROYECTO_ACTIVO?] [descripción]`** seguido del nombre o descripción del componente a extraer.

## Workflow

### 1. Auditoría Autónoma del Código Fuente
- **Acción:** Sin hacer preguntas al usuario, usa `grep_search` y `view_file` para rastrear en toda la base de código del proyecto activo (ej: `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\`) el componente o funcionalidad mencionada.
- **Busca:**
  - Archivo(s) principal(es) que implementan la lógica
  - Hooks, stores (Zustand) o contextos que consume
  - Servicios externos (Firebase, APIs) que utiliza
  - Estilos: custom properties CSS, clases, variables de diseño
  - Subcomponentes hijos que forman parte del conjunto
  - Eventos y callbacks que expone hacia el padre
- **Regla:** Si la funcionalidad está repartida en múltiples archivos, identifícalos todos antes de proceder.

### 2. Identificación de Dependencias
Clasifica las dependencias del componente en dos grupos:
- **Internas al componente** (deben incluirse en la documentación): lógica de estado, helpers, subcomponentes hijos propios.
- **Externas (inyectables)** (deben parametrizarse vía props o configuración): colecciones de Firestore, tokens de diseño, callbacks de negocio.

### 3. Refactorización para Reusabilidad
Antes de documentar, analiza si el componente actual es 100% portátil. Si no lo es, define la versión refactorizada con:
- **Props claras y tipadas** (con valores default)
- **Cero hardcoding** de rutas de Firestore, colores o textos — todo debe ser configurable
- **Separación de responsabilidades**: UI pura vs. lógica de negocio vs. persistencia
- **Diseño atómico**: si el componente contiene elementos básicos (botones, inputs), referencia los que ya existen en `/src/components/ui/` o `/src/components/common/` en lugar de duplicarlos
- **Cero dependencias rígidas de librerías externas (Iconos/CSS):** Si el componente utiliza iconos de terceros (como `lucide-react`) o clases utilitarias de un framework específico (como Tailwind CSS), debe diseñarse con fallbacks seguros. Debe permitir inyectar componentes de iconos alternativos vía props (ej. `customIcon`) y aceptar estilos custom en línea (`style`) o nombres de clase flexibles (`className`) para no romper en proyectos con arquitecturas de diseño o librerías diferentes.
- **Validación Lógica e Integridad Funcional Absoluta:** Queda estrictamente prohibido extraer componentes que contengan errores lógicos latentes, race conditions o comportamientos que se rompan bajo condiciones de datos vacíos, stock cero o deshabilitación. La lógica interna (ej. deshabilitar variantes sin stock, checkouts condicionales, límites dinámicos) debe auditarse de forma quirúrgica antes del empaquetado para asegurar que sea 100% robusta y libre de regresiones.

### 4. Auto-Auditoría de Falencias de Portabilidad y Regresión (Fase Crítica)
- **Acción:** Una vez diseñado el código refactorizado, realízate a ti mismo un control de calidad estricto identificando:
  1. ¿El componente tiene dependencias implícitas de librerías ausentes en un proyecto limpio (ej. enrutadores específicos, gestores de estado)?
  2. ¿Los íconos y elementos gráficos obligan a instalar dependencias externas?
  3. ¿El comportamiento visual se rompe si se desactiva Tailwind CSS o no se configuran clases de tema semántico?
  4. ¿Se validó rigurosamente la lógica funcional interna (cálculos matemáticos, checks de stock, flujo de deshabilitación, control de nulos)?
- **Corrección obligatoria:** Modifica el código refactorizado de inmediato para solucionar cualquier falencia descubierta durante esta auto-auditoría antes de proceder a escribir la documentación.

### 5. Verificación de Unicidad en la Biblioteca
- **Acción:** Lee el archivo `D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md` (o el índice disponible) para verificar que no exista ya un componente con propósito idéntico o muy similar.
- **Si ya existe un componente similar:** Abre el .md existente, identifica qué props o variantes nuevas aporta el componente extraído, y agrega una sección `## 10. Variantes y Extensiones` al final del .md existente con el código de la variante nueva. Actualiza el README.md solo si el nombre de la variante merece una entrada propia. Notifica al usuario la decisión tomada.
- **Si no existe:** Procede con la documentación.

### 6. Creación del Documento en la Biblioteca (Carpetización Estricta en Español)
- **Acción:** Crea la subcarpeta específica para el componente/módulo nombrada de forma descriptiva y en **español claro** bajo su categoría correspondiente. Está prohibido dejar archivos sueltos en la raíz de la categoría.
- **Ruta de Almacenamiento Obligatoria:**
  * **Componentes / Hooks / Servicios (dentro de 06_Biblioteca_Componentes):**
    `D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\<Categoria>\<Nombre_Del_Componente_En_Español>\<nombre_archivo>.md`
    *Ejemplo:* `D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\Formularios_y_UI\Boton_Regreso\back_button.md`
  * **Módulos Completos (dentro de 09_Modulos_Completos):**
    `D:\PROTOTIPE\Documentacion PROTOTIPE\09_Modulos_Completos\<Nombre_Del_Modulo_En_Español>\<nombre_archivo>.md`
    *Ejemplo:* `D:\PROTOTIPE\Documentacion PROTOTIPE\09_Modulos_Completos\Caja_Diaria_POS\caja_diaria_pos.md`

- **Estructura Interna del Archivo:** Usa la siguiente estructura **obligatoria y completa** — sin omitir secciones ni usar placeholders. Debe iniciar estrictamente con el bloque JSON de Manifiesto de Dependencias en comentarios HTML para habilitar la resolución automática de dependencias durante la auto-inyección:

```markdown
<!--
{
  "resource": "[NombreTécnico]",
  "technicalName": "[NombreTécnico]",
  "targetPath": "[ruta/destino/en/proyecto/cliente/NombreTécnico.jsx]",
  "dependencies": {
    "npm": {
      "nombre-libreria": "^version"
    },
    "internal": [
      { "name": "useCustomHook", "type": "hook", "targetPath": "src/hooks/useCustomHook.js", "link": "file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/..." }
    ]
  }
}
-->

# [NombreComponente]

## 1. Propósito y Casos de Uso
[Descripción técnica directa. Para qué sirve, en qué páginas/contextos se usa actualmente y en qué otros proyectos o pantallas futuras tiene sentido reutilizarlo.]

## 2. Especificación Visual y Estilos
[Tokens CSS usados, paleta de colores, tipografía, animaciones. Si usa variables CSS custom, listarlas. Si usa clases de Tailwind, documentar cuáles y con qué breakpoints.]

## 3. Props y API del Componente
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| ...  | ...  | ...     | ...         |

## 4. Código React Completo y 100% Funcional
[Código íntegro del componente. Sin omisiones, sin "// resto igual". Listo para copiar y pegar en cualquier proyecto.]

## 5. Lógica de Estado y Ciclo de Vida
[Hooks usados (useState, useEffect, useMemo, custom hooks), store de Zustand que consume, descripción de cada efecto secundario y su condición de activación.]

## 6. Integración con Servicios Externos
[Cómo se conecta a Firestore u otras APIs. Qué colección lee/escribe. Cómo parametrizar la ruta de Firestore para otro proyecto.]

## 7. Flujo Operativo y Secuencia de Interacción
[Diagrama de flujo en texto o Mermaid que muestre el ciclo de vida: render inicial → interacción usuario → actualización de estado → persistencia → feedback visual.]

## 8. Ejemplo de Uso (Importación y Consumo)
[Snippet de código que muestra cómo importar y renderizar el componente con sus props mínimas y avanzadas.]

## 9. Origen
* **Extraído de:** [Proyecto de origen — nombre del archivo fuente con enlace]
* **Fecha de extracción:** [AAAA-MM-DD]
* **Versión:** 1.0
```

### 7. Evaluación y Creación Obligatoria de Manuales de Desarrollo
- **Acción:** Tras refactorizar y documentar el componente, el agente debe evaluar rigurosamente si la complejidad del componente (por flujos lógicos complejos, integraciones con Zustand/Firebase, dependencias de diseño multi-cliente o lógica de negocio atípica) requiere de un manual de desarrollo específico para otros programadores.

> **Criterio objetivo:** El manual es OBLIGATORIO si el componente cumple al menos uno de estos umbrales:
> - Usa 2 o más hooks custom propios del ecosistema.
> - Integra directamente con Firebase (Firestore, Auth, Storage).
> - Implementa lógica de negocio con más de 3 estados interdependientes (ej. carrito con stock, checkout con validación de sesión).
> - Contiene efectos secundarios con condiciones de carrera documentadas.
> Si no cumple ninguno, el manual es opcional y el agente puede omitirlo indicando la razón.

- **Ruta de Almacenamiento Obligatoria para Manuales:**
  ```
  D:\PROTOTIPE\Documentacion PROTOTIPE\07_Manuales_Desarrollo\<Nombre_De_Categoria_En_Español>\<Nombre_Del_Manual_En_Español>\manual_<nombre_en_ingles_o_espanol>.md
  ```
- **Estructura Requerida del Manual:**
  1. **Propósito y Visión General:** Explicación de alto nivel de por qué existe esta lógica y qué problema resuelve.
  2. **Arquitectura y Flujo de Datos:** Explicación técnica paso a paso de los flujos de información (ej. cómo viajan los datos desde el cliente hasta la base de datos).
  3. **Guía de Integración Paso a Paso:** Instrucciones precisas para que cualquier desarrollador pueda acoplar este componente en un nuevo entorno.
  4. **Preguntas Frecuentes y Solución de Problemas (Troubleshooting):** Casos borde comunes, validación de errores y mitigación de fallos de red/sesión.

### 8. Actualización Automática del Índice de la Biblioteca
- **Acción Obligatoria:** El agente debe editar físicamente el archivo `D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\README.md` para registrar la nueva entrada del componente bajo su categoría de manera inmediata y automatizada.
- **Formato de Registro:** Inserta el elemento en la categoría correspondiente utilizando exactamente la estructura de lista del catálogo:
  `* [Nombre Mostrar (NombreTecnico)](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/<Categoria>/<Subcarpeta>/<archivo>.md): Descripción directa y técnica de lo que hace y sus dependencias.`
- **Consistencia:** Si existe una sección de "*Pendiente por registrar:*", el agente debe remover el componente de esa lista (si estaba listado allí) al momento de documentarlo formalmente.

### 9. Registro en Bitácora
- Añade una entrada en `D:\PROTOTIPE\Documentacion PROTOTIPE\03_Auditorias_y_Faro_Core\bitacora_cambios.md` con tipo **"Biblioteca de Componentes"** indicando qué se extrajo y desde dónde.

### 10. Integración Automática con el Sandbox del dev-dashboard (OBLIGATORIO)
Inmediatamente después de crear el `.md` y actualizar el `README.md`, el agente debe evaluar si el componente es candidato a sandbox interactivo y actuar según el resultado:

#### 10.1 — Evaluación de Simulabilidad
Analiza el código del componente extraído aplicando estas reglas en orden:

| Condición detectada en el código | Clasificación | Acción |
|---|---|---|
| Solo usa `useState`, `useEffect` sin Firebase, CSS/Tailwind | ✅ **Simulable** | Crear playground (ver 10.2) |
| Importa `firebase`, `firestore`, `onSnapshot`, `runTransaction` | ⚙️ **Servicio/Hook Firebase** | Solo registrar en COMPONENT_META |
| Importa `leaflet`, `react-leaflet`, `nominatim` | 🧩 **Dependencia Externa** | Solo registrar en COMPONENT_META |
| Importa `framer-motion` + store de Zustand | 🧩 **Módulo Complejo** | Solo registrar en COMPONENT_META |
| Es una vista/página completa con router | 📄 **Página Completa** | Solo registrar en COMPONENT_META |
| Usa CSS Modules, styled-components o Emotion (sin Firebase) | ✅ **Simulable con adaptación** | Recrear con Tailwind inline en el sandbox. Documentar la diferencia de estilos en el archivo Sandbox. |
| Mezcla custom hook propio (sin Firebase) + estado local | ✅ **Simulable** | Embeber el hook directamente en el archivo Sandbox. |

#### 10.2 — Si ES simulable: crear el playground independiente
Queda estrictamente PROHIBIDO inyectar la lógica del componente o del playground inline en `ComponentSandbox.jsx`.

1. **Creación del archivo de Sandbox:** Crea un archivo independiente en `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\[NombreComponente]Sandbox.jsx`. Debe exportar por defecto el sandbox interactivo con sus propios controles, imports y componentes de apoyo embebidos.
2. **Mapeo en `ComponentSandbox.jsx` (Opcional):**
   La Consola Central resuelve y carga dinámicamente todos los playgrounds en `/sandboxes/` usando `import.meta.glob('./sandboxes/*.jsx')`. No es necesario realizar importaciones perezosas manuales ni declarar wrappers en `SANDBOXES`.
   
   Solo si el nombre de archivo Sandbox difiere de forma no predecible del nombre del componente, edita `ComponentSandbox.jsx` para declarar su alias en `COMPONENT_SANDBOX_MAP`:
   ```javascript
   // Nombre en minúsculas con tildes — exactamente como aparece en el árbol del visor
   'nombre exacto del componente': 'nombre_clave_del_archivo_en_snake_case',
   // Alias adicionales si el nombre puede variar
   'nombre alternativo': 'nombre_clave_del_archivo_en_snake_case',
   ```
   
   **Coincidencia difusa (Opcional):** Si el componente requiere coincidencia difusa avanzada, añade una regla `str.includes('...')` en la función `check()` dentro de `getSandboxKey()`.

#### 10.3 — Si NO es simulable: registrar en COMPONENT_META
Agrega la entrada correspondiente en el objeto `COMPONENT_META` dentro de `ComponentSandbox.jsx`:

```js
'nombre exacto del componente': {
  type: 'hook' | 'service' | 'page' | 'complex',
  label: 'Custom Hook' | 'Servicio' | 'Página Completa' | 'Módulo Completo' | 'Dependencia Externa',
  color: 'violet' | 'amber' | 'blue' | 'teal' | 'red',
  note: 'Explicación técnica de por qué no aplica el sandbox y cómo integrarlo.'
},
```

| `type` | `color` | Cuándo usarlo |
|---|---|---|
| `hook` | `violet` | Hooks de React / Context providers |
| `service` | `amber` | Módulos JS puros / Firebase services |
| `page` | `blue` | Vistas completas con router |
| `complex` | `teal` | Componentes con Leaflet, Framer, Zustand |
| `complex` | `red` | Herramientas destructivas (borrar datos) |

#### 10.4 — Verificar build
Ejecuta `cmd /c npm run build` en `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard` y confirma que compile sin errores antes de reportar la extracción como completada.

> **Si el build falla por el nuevo sandbox:**
> 1. Identifica el error (import roto, JSX inválido, variable no definida).
> 2. Corrígelo directamente en el archivo `[NombreComponente]Sandbox.jsx`.
> 3. Si el error es una dependencia npm ausente en dev-dashboard, lista el comando de instalación exacto al usuario y espera confirmación antes de continuar.
> 4. Corre el build nuevamente. No reportes la extracción como completada hasta que el build pase limpio.

---

## Common Mistakes
* **Preguntar al usuario en lugar de auditar:** El agente debe descubrir por su cuenta la implementación técnica rastreando el código.
* **Documentar sin código funcional completo:** Cada documento de la biblioteca debe incluir código listo para producción, no esqueletos ni pseudocódigo.
* **Hardcodear rutas de Firestore en el componente extraído:** El componente debe recibir la ruta como prop o parámetro de configuración.
* **Ignorar la verificación de unicidad:** Crear un duplicado en la biblioteca cuando ya existía un componente base extensible.
* **Omitir el manual si la lógica es compleja:** Todo componente con flujos de estado avanzados o integraciones complejas debe contar obligatoriamente con su manual técnico estructurado en `/Manuales/`.
* **Omitir el Paso 10:** Todo componente extraído debe terminar con su entrada en `SANDBOXES` + `COMPONENT_SANDBOX_MAP` (si es simulable) o en `COMPONENT_META` (si no lo es). Saltarse este paso es una violación crítica del flujo de extracción.
