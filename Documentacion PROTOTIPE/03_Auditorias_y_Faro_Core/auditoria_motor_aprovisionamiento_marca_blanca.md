# Auditoría del Motor de Aprovisionamiento y Marca Blanca

Este documento registra los hallazgos y análisis técnicos del motor de aprovisionamiento de marcas blancas en el ecosistema PROTOTIPE (principalmente [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js), [`sync_templates.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) y [`server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js)). El objetivo es certificar una réplica 100% limpia de marca blanca, libre de fugas de datos de desarrollo u otras marcas, y asegurar que cada instancia se inicialice perfectamente a la primera.

---

## 🛠️ Hallazgos Críticos Identificados

### 1. Ausencia de Sincronización de `storage.rules` (Core → Plantilla CLI)
* **Archivo afectado:** [`sync_templates.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) (Línea ~182 en `SYNC_PATHS`)
* **Impacto:** El archivo de reglas de Firebase Storage (`storage.rules`) del Core de Ventas no estaba incluido en la lista de rutas de sincronización. Las plantillas en el CLI nunca recibían las reglas vigentes de almacenamiento de imágenes.

### 2. Pérdida del Sembrador de Base de Datos (`seed_brand.js`)
* **Archivo afectado:** [`sync_templates.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) (Línea ~182 en `SYNC_PATHS`)
* **Impacto:** La carpeta `/scratch/` (que aloja a [`seed_brand.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/scratch/seed_brand.js)) estaba excluida de la sincronización hacia la plantilla del CLI. Al aprovisionar un proyecto, la carpeta `scratch/` no existía y la función `deployFirebase` en `generator.js` abortaba silenciosamente la siembra. Las instancias nacían con Firestore vacío, rompiendo la carga de configuraciones (`appConfigStore`) y forzando pantallas en blanco de error.

### 3. Sobrescritura Destructiva de `firebase.json` en el Generador
* **Archivo afectado:** [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) (Líneas ~423 a 448)
* **Impacto:** El generador sobrescribía a ciegas el archivo `firebase.json` de la marca con un JSON string hardcodeado en su propio código, ignorando la configuración que viniese en la plantilla. Esto forzaba una desalineación inmediata si el Core de Ventas actualizaba o agregaba servicios de Firebase.

### 4. Fuga de Identidad Genérica en `package.json`
* **Archivo afectado:** [`generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) (Línea ~821)
* **Impacto:** El nombre del proyecto en `package.json` se mantenía como `app-ventas` en lugar de asignarse de forma única mediante el `clientId` de la marca (ej: `app-ventas-moni-app`), comprometiendo el estándar estricto de marca blanca.

---

## 🎯 Plan de Acción de Corrección

1. **Sincronización de Archivos Faltantes (Core → Plantilla CLI):**
   * Añadir `'storage.rules'` y `'scratch'` a la lista `SYNC_PATHS` de `sync_templates.js` para asegurar que el sembrador y las reglas actualizadas se copien a la plantilla del CLI.
2. **Dinamicidad en `generator.js` para Archivos de Reglas y Firebase:**
   * Modificar `generator.js` para que si `firebase.json`, `storage.rules` o `firestore.rules` ya existen en la plantilla copiada, los conserve y los use de forma nativa en lugar de sobrescribirlos con fallbacks estáticos.
3. **Personalización del package.json de la Marca:**
   * En `generator.js`, actualizar el campo `"name"` de `package.json` del cliente al `clientId` correspondiente para consolidar la marca blanca.
4. **Verificación de Reglas y Pruebas de Integración:**
   * Ejecutar la sincronización differential para actualizar la plantilla y comprobar mediante test de humo la correctitud sintáctica de los archivos.
