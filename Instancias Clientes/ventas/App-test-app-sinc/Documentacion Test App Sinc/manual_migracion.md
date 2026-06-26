# Configuración Local de Despliegue - Test App Sinc

Este archivo complementa al [Manual de Migración y Despliegue General](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/manual_migracion_despliegue.md) detallando la configuración de la Inteligencia Artificial (Gemini) exclusiva de esta plantilla.

---

## ⚙️ Configuración e Integración de IA Multimodal (Plan Blaze y Vertex AI)

Para que la carga de productos con sugerencias por Inteligencia Artificial funcione de forma óptima para cada cliente de Ventas, debes realizar los siguientes pasos de configuración una vez desplegado el frontend y backend:

### Paso A: Cambiar al Plan Blaze (Pago por uso)
1. Ve a [Firebase Console](https://console.firebase.google.com/) del cliente.
2. En la esquina inferior izquierda verás una etiqueta de **"Plan Spark"**. Haz clic en **"Mejorar"** o **"Upgrade"**.
3. Selecciona el **Plan Blaze** y asócialo a una cuenta de facturación de Google Cloud. *(Firebase cuenta con un plan gratuito muy amplio; no se facturará nada a menos que superes estos límites comerciales)*.

### Paso B: Habilitar la API de Vertex AI en Google Cloud
1. Entra a [Google Cloud Console](https://console.cloud.google.com/) con la misma cuenta del cliente.
2. Asegúrate de tener seleccionado el proyecto correcto en la barra superior.
3. Busca **"Vertex AI API"** en la barra de búsqueda superior.
4. Haz clic en la opción correspondiente y luego presiona el botón **"Habilitar"** (o **"Enable"**). Espera a que se active el servicio.

### Paso C: Despliegue de la Cloud Function
1. Asegúrate de tener instalado Node.js (versión 18 o superior) en tu entorno local.
2. Abre la terminal en la raíz del proyecto y despliega únicamente la función con:
   ```bash
   firebase deploy --only functions
   ```
   *(Esto compilará el código de `/functions`, instalará las dependencias necesarias y creará la función reactiva `processProductImage` en la región `us-central1` de manera automática)*.
