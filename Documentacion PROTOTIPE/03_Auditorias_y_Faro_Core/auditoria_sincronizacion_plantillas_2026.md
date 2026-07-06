# Auditoría Técnica: Sincronización de Plantillas Core (`performCoreSync`)

Este informe evalúa minuciosamente el motor de sincronización de Cores (`performCoreSync` en `server.js`) utilizado por el Dashboard Central para empaquetar plantillas en la CLI. Se analizan la concurrencia, robustez del reemplazo y seguridad de datos sensibles.

---

## Diagnóstico y Puntos Críticos Detectados

### 1. Cuello de Botella en Entrada/Salida (Secuencialidad Recursiva)
* **Severidad:** Media-Alta
* **Ubicación:** `server.js` (Función `sanitizeFile` en líneas 1608-1674)
* **Descripción:** El sanitizador recorre directorios recursivamente usando llamadas síncronas bloqueantes dentro de un bucle `for...of` con `await` secuenciales:
  ```javascript
  for (const file of dirFiles) {
    await sanitizeFile(path.join(filePath, file));
  }
  ```
  Esto bloquea el Event Loop de Node.js de forma prolongada cuando un Core posee cientos de archivos pequeños, degradando la capacidad del servidor de responder a otros clientes o APIs concurrentes durante la sincronización.
* **Causa Raíz:** Falta de un procesamiento paralelo limitado (concurrencia controlada) en operaciones de sistema de archivos.

### 2. Riesgo Crítico de Corrupción de Código (Reemplazo Codicioso del `packageName`)
* **Severidad:** Crítica
* **Ubicación:** `server.js` (Líneas 1629-1632)
* **Descripción:** El reemplazo del nombre del paquete se aplica a todo el código fuente de forma global e indiscriminada:
  ```javascript
  if (tokens.packageName && content.includes(tokens.packageName)) {
    content = content.replace(new RegExp(tokens.packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'proyecto-cliente-saas');
    changed = true;
  }
  ```
  Si el `packageName` en `package.json` es una palabra común (ej: `"name": "ventas"` o `"name": "app"`), el motor reemplazará **toda** coincidencia de esta palabra en el código (comentarios, variables, importaciones, textos de botones) con `'proyecto-cliente-saas'`.
* **Causa Raíz:** Aplicar reemplazos de identidad de empaquetado en archivos de lógica pura (`.js`, `.jsx`, `.md`) en lugar de limitarse a `package.json`.

### 3. Fuga de Datos y Omisión de Seguridad en Reglas Firebase (`.rules`)
* **Severidad:** Alta
* **Ubicación:** `server.js` (Filtro de extensiones en línea 1618)
* **Descripción:** El sanitizador de tokens y credenciales de Firebase solo inspecciona las extensiones `['.js', '.jsx', '.json', '.md', '.html']`. Omite por completo archivos con extensión `.rules` (`firestore.rules`, `storage.rules`).
* **Impacto:** Si un desarrollador escribe reglas de seguridad en el Core que contengan el ID de proyecto real o referencias hardcodeadas de su Firebase de desarrollo, estos tokens sensibles se copiarán sin sanitizar a la plantilla del CLI y se propagarán a nuevos clientes, rompiendo la paridad o provocando fallos de seguridad.

### 4. Fragilidad en Copiado de Documentación
* **Severidad:** Baja
* **Ubicación:** `server.js` (Líneas 1560-1569)
* **Descripción:** La detección del directorio de documentación del Core es codiciosa y no estructurada:
  ```javascript
  const docDir = files.find(f => f.startsWith('Documentacion'));
  ```
  Si existen carpetas como `Documentacion_Backup` o `Documentacion_Obsoleta` en la raíz del Core, el sistema podría seleccionar y copiar una carpeta incorrecta en lugar de la carpeta temática oficial `Documentacion App [Clave]`.

### 5. Filtrado Incompleto de Carpetas de Trabajo en Sanitización
* **Severidad:** Baja
* **Ubicación:** `server.js` (Línea 1613)
* **Descripción:** Al sanitizar, el script excluye `node_modules`, `.git`, `dist` y `.vite`, pero permite procesar de forma recursiva subcarpetas de trabajo como `.firebase`, `playwright-report`, `test-results`, `scratch` y `scripts`, consumiendo recursos de lectura inútiles sobre archivos temporales.

---

## Oportunidades de Mejora y Soluciones Propuestas

1. **Paralelismo de E/S con Control de Concurrencia:** Refactorizar la sanitización recursiva para procesar archivos concurrentemente usando `Promise.all` acotado, minimizando el tiempo de bloqueo del Event Loop.
2. **Restricción de Reemplazo de `packageName`:** Modificar la rutina para que el reemplazo de `packageName` se aplique exclusivamente a `package.json` o mediante una expresión regular que valide el contexto de un string de paquete NPM.
3. **Soporte de Sanitización en Reglas:** Ampliar las extensiones del sanitizador para incluir `.rules` y asegurar que cualquier ID de Firebase de desarrollo sea sustituido por marcadores de posición seguros.
4. **Exclusiones Robustas en Sanitización:** Añadir carpetas de caché y reportes temporales al filtro del sanitizador (`.firebase`, `playwright-report`, `test-results`, `scratch`).
5. **Especificidad en Documentación:** Copiar exclusivamente el directorio correspondiente al nombre patrón `Documentacion App [Clave]` en lugar de realizar una búsqueda codiciosa con `startsWith`.
