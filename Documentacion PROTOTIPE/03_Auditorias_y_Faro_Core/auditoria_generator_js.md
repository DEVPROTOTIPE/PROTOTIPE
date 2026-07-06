# Auditoría Técnica del Generador de Proyectos (generator.js)

**ID de Auditoría:** AUDIT-GENERATOR-ROBUSTNESS-2026  
**Fecha:** 2026-07-01  
**Estado:** Finalizado  

Este informe documenta los hallazgos críticos de diseño, acoplamiento, seguridad y control de excepciones detectados en el motor de aprovisionamiento `Prototipe-CLI/generator.js`.

---

## 1. Acoplamiento a Cores Específicos y Verticales de Negocio

### Hallazgo 1.1: Acoplamiento rígido de metadatos de nichos comerciales en el motor core
* **Severidad:** Media-Alta
* **Ubicación:** `generator.js`, Líneas 765 a 895.
* **Causa Raíz:** La función `createProject` contiene condicionales `if-else` acoplados a nombres y atributos fijos para 23 verticales de negocio. Si se añade una nueva vertical, se debe modificar físicamente el código core del CLI.
* **Impacto:** Rompe el principio de extensibilidad e impide añadir nichos comerciales sin tocar el CLI.
* **Propuesta de Solución:** Extraer las definiciones a un archivo de configuración JSON externo (`config/nichos.json`) o delegar la provisión en un archivo de plantilla local del Core.

### Hallazgo 1.2: Asunción de colecciones y campos rígidos en el script de siembra
* **Severidad:** Media
* **Ubicación:** `generator.js`, Líneas 1397 a 1486 (en el string literal de `scripts/seed_admin.js`).
* **Causa Raíz:** El script inyectado de siembra asume la existencia de colecciones fijas de `categories` y `products`. Si una plantilla Core personaliza su base de datos, el seed fallará.
* **Propuesta de Solución:** Permitir que el script de siembra sea dinámico, leyendo un archivo estructurado `seed_data.json` provisto por cada Core.

---

## 2. Fragilidad en Fusiones y Limpiezas del Ecosistema

### Hallazgo 2.1: Sobrescritura destructiva directa del archivo `.firebaserc` multientorno
* **Severidad:** Crítico
* **Ubicación:** `generator.js`, Líneas 600-607 en conflicto con Líneas 660-667.
* **Causa Raíz:** En las primeras líneas se escribe el archivo `.firebaserc` multientorno con los alias `default`, `development` y `production`. Sin embargo, en el paso 5 se vuelve a escribir destructivamente en `.firebaserc` con un JSON plano que solo tiene la clave `default`.
* **Impacto:** Inutiliza por completo la segmentación de entornos Firebase en local y producción.
* **Propuesta de Solución:** Eliminar el segundo bloque de escritura (Paso 5) y consolidar todo en el primer objeto de configuración.

### Hallazgo 2.2: Fragilidad en la inyección de metatags SEO en `index.html`
* **Severidad:** Media
* **Ubicación:** `generator.js`, Línea 1003.
* **Causa Raíz:** Inyección SEO mediante `indexContent.replace('</head>', ...)`. Si el archivo original tiene variaciones de minúsculas/mayúsculas o espacios en la etiqueta, el reemplazo fallará silenciosamente.
* **Propuesta de Solución:** Reemplazar el método plano por una expresión regular insensible a mayúsculas y tolerante a espacios:
  ```javascript
  indexContent = indexContent.replace(/<\/head\s*>/i, `${metaTags}\n  </head>`);
  ```

---

## 3. Robustez de la Manipulación de Imágenes con Jimp

### Hallazgo 3.1: Fallo catastrófico de la PWA por excepción silenciosa en procesamiento de imagen
* **Severidad:** Alta
* **Ubicación:** `generator.js`, Líneas 1053 a 1097.
* **Causa Raíz:** Si `Jimp.read(logoSrc)` falla (logo corrupto, extensión inválida), el error es atrapado pero los iconos PNG de la PWA no se generan en el disco, provocando errores 404 y fallos de instalación PWA.
* **Propuesta de Solución:** Implementar un fallback estricto: si falla el procesamiento del logo del usuario, autogenerar un archivo PNG básico (con el SVG de iniciales del cliente renderizado) para que los activos existan en disco.

### Hallazgo 3.2: Corrupción cromática en inyección Hexadecimal desde HSL
* **Severidad:** Media
* **Ubicación:** `generator.js`, Líneas 924 y 925.
* **Causa Raíz:** Si `hslToRgbaHex` calcula un color muy oscuro, la cadena hexadecimal resultante tiene menos de 8 caracteres. Al cortarlo con `slice(0, 6)` se obtienen cadenas truncadas y colores Hex inválidos.
* **Propuesta de Solución:** Formatear el entero a una cadena hexadecimal de 8 dígitos usando `padStart` antes de recortar:
  ```javascript
  const primaryHex = '#' + hslToRgbaHex(primaryColor, 255).toString(16).padStart(8, '0').slice(0, 6);
  ```

---

## 4. Manejo de Excepciones del Sistema de Archivos

### Hallazgo 4.1: Ausencia de Rollback ante fallos de aprovisionamiento físico
* **Severidad:** Media
* **Ubicación:** `generator.js`, Líneas 293 a 314.
* **Causa Raíz:** Si la copia de archivos falla debido a permisos denegados o falta de espacio, el proceso se interrumpe dejando una carpeta de destino parcialmente creada e inconsistente.
* **Propuesta de Solución:** Envolver el proceso de copia y aprovisionamiento en un bloque `try-catch` y eliminar de forma automática la carpeta `targetDir` parcial si ocurre algún error.
