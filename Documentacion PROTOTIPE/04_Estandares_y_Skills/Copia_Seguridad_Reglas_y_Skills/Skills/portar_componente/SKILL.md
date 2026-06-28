---
name: portar-componente
description: >-
  Porta (migra) un componente documentado en la Biblioteca de Componentes al
  código fuente de un proyecto destino. Lee el .md, extrae el código, crea el
  archivo .jsx en la ruta correcta del proyecto, adapta imports y colecciones
  de Firestore, y verifica el build. Se activa con @portar-componente.
trigger: "@portar-componente"
aliases:
  - "@portar-componente [PROYECTO_ACTIVO] [NombreComponente]"
---

# Portar Componente

## 📁 Variable de Proyecto Dinámica

> **Variable `[PROYECTO_ACTIVO]`:** Ruta raíz del proyecto de destino. Se determina en este orden de prioridad:
> 1. Si el usuario la especificó en el trigger (ej. `@portar-componente "App Reservas" "SelectorFecha"`), usar esa.
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
Esta skill automatiza el bridge entre la Biblioteca de Componentes y Módulos (documentación)
y el código fuente de un proyecto destino (producción). El agente lee el `.md`,
extrae el código funcional, lo adapta al contexto del proyecto destino y lo
integra sin romper la arquitectura existente.

> [!IMPORTANT]
> **Preferencia de Auto-Inyección Automática:**
> Si el dashboard de desarrollo central y el CLI daemon están activos, el desarrollador o el agente debe sugerir al usuario utilizar la funcionalidad **"Instalar en Cliente"** directamente desde la interfaz web del visor de la biblioteca. Esto automatiza la inyección limpia del código React a la carpeta física de la instancia cliente con un solo clic. El flujo manual detallado en esta habilidad debe utilizarse principalmente como alternativa o fallback.

## Trigger / Activación
Se activa cuando el usuario escribe **`@portar-componente [PROYECTO_ACTIVO] [NombreComponente]`**.

---

## Workflow

### 1. Localizar el .md en la Biblioteca
- Busca en `D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\` con `grep_search`.
- Lee el archivo `.md` completo con `view_file`.
- **Si no existe:** reporta al usuario y detén la ejecución.

### 2. Verificar que el componente no existe ya en el proyecto destino
- Usa `grep_search` para buscar el nombre técnico del componente (ej. `PaginationComponent`, `ModalBase`) en `D:\PROTOTIPE\[PROYECTO_ACTIVO]\src\`.
- **Si ya existe:** informa al usuario la ruta donde está y pregunta si desea sobreescribir.
- **Si no existe:** continúa al Paso 3.

### 3. Extraer el código del .md
- Lee la sección `## 4. Código React Completo y 100% Funcional` del `.md`.
- Extrae el bloque de código JSX principal (el componente en sí).
- Si hay múltiples bloques (ej. hook + componente), extráelos todos.

### 4. Determinar la ruta de destino correcta
Aplica esta cascada de decisión en orden de prioridad:

1. **Prioridad 1 — Manifest JSON**: Lee el bloque manifest `<!-- {...} -->` al inicio del archivo `.md` del componente. Si define la propiedad `targetPath`, utiliza esa ruta exacta como destino de instalación.
2. **Prioridad 2 — Tabla de Fallback**: Si no existe `targetPath` en el manifest, aplica la siguiente lógica según el tipo de componente:

| Tipo de componente | Ruta destino |
|---|---|
| Átomo puro (botón, input, toggle, contador) | `src/components/ui/` |
| Componente de negocio (tarjeta pedido, carrito) | `src/components/common/` |
| Hook de React (`use*.js`) | `src/hooks/` |
| Servicio JS puro (sin UI) | `src/services/` |
| Página completa | `src/pages/` |
| Utilidad/helper | `src/utils/` |
| Módulo Completo (09_Modulos_Completos) | `src/components/modules/` |

Si hay ambigüedad, elige la ruta más conservadora y documenta la decisión.

### 5. Adaptar el código al proyecto destino
Antes de escribir el archivo, aplica estas adaptaciones:

**a) Imports de iconos:**
- Verifica que `lucide-react` esté en el `package.json` del proyecto destino.
  - Si está presente, verifica que la versión sea `>=0.263.0` (mínimo requerido para los iconos del ecosistema). Si la versión es anterior, notifica al usuario que puede haber iconos no disponibles y sugiere `npm install lucide-react@latest`.
- Si el componente usa iconos de otra librería, adáptalos a `lucide-react`.

**b) Variables CSS de tema:**
- El componente debe usar las variables `var(--color-primary)`, `var(--color-surface)`, etc. del sistema de diseño del proyecto destino.
- Si usa colores hardcodeados, reemplázalos por las variables correspondientes.

**c) Rutas de Firestore:**
- Identifica cualquier ruta de colección hardcodeada (ej. `'pedidos'`, `'productos'`).
- Conviértelas en props inyectables o en constantes al tope del archivo para que sean fáciles de configurar.

**d) Imports de dependencias internas:**
- Ajusta las rutas relativas de imports (ej. `../../stores/useCartStore` → ruta correcta en el proyecto destino).
- Verifica que los archivos importados existan. Si no existen, créalos con estructura mínima o notifica al usuario.

### 6. Crear el archivo en el proyecto destino
- Escribe el archivo `.jsx` (o `.js` si es servicio/hook) en la ruta determinada en el Paso 4.
- El archivo debe estar listo para importar y usar sin modificaciones adicionales.
- Agrega un comentario de cabecera:
```js
/**
 * [NombreComponente]
 * Portado desde: Biblioteca de Componentes Prototipe
 * Fecha: [AAAA-MM-DD]
 * Fuente: D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\...
 */
```

### 7. Verificar el build del proyecto destino
```bash
cmd /c npm run build
```
Ejecuta en la ruta del proyecto destino. 

> **Si hay errores de compilación:**
> - **Error de import roto o JSX inválido:** Corrígelo directamente en el archivo portado.
> - **Error por dependencia npm ausente** (ej. `Cannot find module 'alguna-libreria'`): NO intentes instalarla automáticamente. En cambio:
>   1. Identifica el nombre exacto del paquete.
>   2. Reporta al usuario: `⚠️ Dependencia faltante: instala [paquete]@[versión-recomendada] con npm install [paquete] --save`
>   3. Pausa la ejecución y espera confirmación del usuario de que instaló la dependencia.
>   4. Corre el build nuevamente solo tras la confirmación.
> - No reportes éxito hasta que el build pase limpio.

### 8. Reportar al usuario
Informa concisamente:
- ✅ Archivo creado en: `[ruta exacta]`
- 📦 Adaptaciones realizadas (Firestore, imports, iconos)
- 💡 Cómo importarlo: `import NombreComponente from '[ruta relativa]'`
- ⚠️ Si hubo dependencias faltantes que el usuario debe instalar

---

## Reglas Críticas

### No crear dependencias que no existen
Si el componente requiere un store de Zustand (ej. `useCartStore`) que no existe
en el proyecto destino, NO lo crees automáticamente. Notifica al usuario qué
dependencias deben portarse primero o instalarse.

### No sobreescribir sin confirmación
Si el componente ya existe en el proyecto destino, siempre preguntar antes de
sobreescribir.

### Fidelidad funcional total
El código portado debe ser 100% funcional. Prohibido usar placeholders,
`// TODO`, o `// resto del código aquí`. El archivo debe estar completo.

### Build obligatorio
Nunca reportar éxito sin que el build haya pasado. Si el build falla, corregir
antes de reportar.

---

## Common Mistakes
* **Copiar el código del .md sin adaptar imports:** Las rutas relativas del proyecto fuente no son iguales al destino.
* **No verificar si el componente ya existe:** Duplicar código en el proyecto destino.
* **Hardcodear rutas de Firestore:** Siempre convertirlas en props o constantes configurables.
* **Reportar éxito sin build:** El build puede fallar por dependencias faltantes.
* **Portar un componente complejo antes de sus dependencias:** Si el componente requiere un hook o store que no existe, portarlos primero.
