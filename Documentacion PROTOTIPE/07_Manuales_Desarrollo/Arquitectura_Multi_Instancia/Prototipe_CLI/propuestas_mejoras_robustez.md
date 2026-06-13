# 🛡️ Propuestas Realistas de Robustez y Funcionalidades (Cero Regresiones)

Proponemos 3 mejoras realistas y totalmente seguras que elevan la estabilidad del ecosistema y se integran visualmente en el **Dev Dashboard** sin riesgo de romper el código actual:

---

## 1. Validación Activa del SDK Firebase (Pre-Flight Checks)
*   **Problema actual:** Si el desarrollador ingresa una API Key o Project ID con un error tipográfico en el formulario del Dashboard, el proyecto se aprovisiona físicamente en disco, pero fallará más tarde al intentar conectarse a la base de datos o durante el despliegue.
*   **Mejora:** Agregar un endpoint ligero `POST /api/firebase/validate` en `server.js`. Este endpoint realiza un ping rápido usando un fetch básico de Node a los servidores de Firebase (ej: intentar autenticar de forma simulada contra Firebase Auth con las credenciales suministradas).
*   **Integración Visual:** En el formulario de creación, al pegar las credenciales, aparece un indicador en tiempo real:
    *   `🟢 Credenciales Válidas (Conexión Exitosa)`
    *   `🔴 Credenciales Inválidas (Revisa el API Key o ID)`

---

## 2. Reducción y Compresión Automática de Assets de Marca
*   **Problema actual:** Si el desarrollador suministra una imagen de logo corporativa en alta resolución (ej: un PNG de 15MB), el procesamiento de imágenes PWA (Jimp) puede consumir demasiada memoria RAM en el servidor local o ralentizar el rendimiento inicial de la app web (CLS deficiente).
*   **Mejora:** En la rutina de procesamiento de logos de `generator.js`, antes de escalar la imagen, validar su peso en bytes. Si supera los 2MB, el servidor la redimensiona y comprime automáticamente a un tamaño óptimo de desarrollo (máximo 512x512px) antes de generar los assets.
*   **Integración Visual:** Un indicador tipo toast informativo en el Dashboard:
    *   `⚡ Optimizador: El logo superaba los 2MB y ha sido optimizado automáticamente para mejorar la velocidad PWA.`

---

## 3. Descarga de Logs de Diagnóstico (Consola Embebida)
*   **Problema actual:** Cuando un deploy de hosting o una compilación falla en segundo plano, los logs se imprimen en la consola del Dashboard, pero no quedan guardados físicamente para análisis posterior en caso de errores complejos.
*   **Mejora:** Añadir un botón visual de "Descargar Reporte de Error" junto a la consola de logs del Dashboard. Este botón genera un archivo `.log` plano con el volcado completo de la terminal (incluyendo la salida del auditor de calidad).
*   **Integración Visual:** Un botón flotante tipo `Descargar Diagnóstico (.log)` en la esquina superior derecha del panel de logs de despliegue en `CoreManagerPanel.jsx`.
