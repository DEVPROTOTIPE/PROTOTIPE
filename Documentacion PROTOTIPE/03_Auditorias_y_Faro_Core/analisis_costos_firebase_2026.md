# 📊 Reporte Técnico: Análisis de Costos de Firebase y Plan de Prevención (Blaze vs. Spark)

**Proyecto:** App Ventas (`ventas-smartfix`) & Central PROTOTIPE (`prototipe-ecosistema-control`)  
**Fecha:** 2026-06-19  
**Estatus:** Auditoría de Costos de Infraestructura  
**Autor:** Antigravity (Desarrollador Full Stack Senior)  

---

## 📋 1. Diagnóstico del Consumo: ¿De dónde provienen los $2 USD?

De acuerdo con la captura de pantalla suministrada del panel **"Uso y facturación"** de Firebase en el proyecto **App Ventas**, el costo acumulado de $2 USD proviene **única y exclusivamente de Cloud Functions**, no de lecturas o escrituras de base de datos ni de visitas a la aplicación.

### Causa Raíz Explicada:
El plan gratuito **Spark** incluye cuotas de base de datos holgadas (50,000 lecturas y 20,000 escrituras al día) y la subida a **Blaze** sigue respetando estas cuotas gratuitas. Sin embargo, al desplegar Cloud Functions en el proyecto `ventas-smartfix` (específicamente la función `sendPushNotification` para alertas FCM), Google ejecuta tres pasos tras bambalinas que tienen costos asociados:

1. **Google Artifact Registry (Almacenamiento de Contenedores):** 
   - Cada vez que se compila y despliega una función, Firebase crea una imagen Docker del código Node.js y la guarda en el registro de artefactos de Google Cloud.
   - **El cobro:** Mientras que las ejecuciones de funciones tienen 2 millones de llamadas gratis, **el almacenamiento físico de estas imágenes acumuladas de compilaciones anteriores no tiene capa gratuita ilimitada** y se factura por GB al mes.
2. **Buckets de Storage de Cloud Build (`gcf-sources-...`):**
   - El código fuente comprimido en `.zip` utilizado para subir tus funciones se almacena en carpetas de Google Cloud Storage. Al cabo de varios despliegues, este espacio acumulado supera el límite de Storage.
3. **Secret Manager (Variables de entorno seguras):**
   - Si se registran credenciales confidenciales del desarrollador en Firebase, Google cobra un costo menor de $0.06 USD por cada secreto activo.

---

## 🔍 2. Relación de Consumo: Central PROTOTIPE vs. App Ventas

* **Central PROTOTIPE (`prototipe-ecosistema-control`):**
  - Este es el dashboard del desarrollador que centraliza y monitorea todos los clientes. 
  - Corre en su propio proyecto de Firebase independiente, por lo que **cualquier costo generado por su base de datos o almacenamiento corre por cuenta de la cuenta del desarrollador, nunca del cliente**.
* **App Ventas (`ventas-smartfix`):**
  - El cliente (`App Ventas`) se comunica con la central mediante peticiones HTTPS externas desde el navegador (telemetría de incidentes y facturación mensual). 
  - Al ser peticiones salientes hechas desde la máquina/navegador del cliente, **no consumen recursos de servidor de Cloud Functions dentro de `ventas-smartfix`**.
  - **Conclusión:** El dashboard central no es responsable del cobro de $2 USD en el panel de tu cliente.

---

## 🛠️ 3. Plan de Prevención para retornar a $0 USD

Para evitar estos cargos recurrentes de almacenamiento y mantener la infraestructura al menor costo posible, se proponen tres alternativas de acción:

### Alternativa A: Downgrade a Spark (Costo Fijo $0 USD) - *Recomendado si no usas notificaciones Push nativas*
Si no necesitas notificaciones Push nativas en segundo plano (WebPush de navegador cuando la app está cerrada) y prefieres notificaciones en pantalla en tiempo real (las cuales son gratis mediante listeners de Firestore):
1. Eliminar la carpeta `functions` y su configuración en `firebase.json`.
2. Ejecutar la desinstalación de la Cloud Function en la consola de Firebase.
3. Hacer downgrade del plan del proyecto de **Blaze** a **Spark (Gratuito)**.
4. **Resultado:** Garantía de $0 USD mensuales permanentes.

### Alternativa B: Limpieza de Historial de Imágenes (Mantener Blaze a Costo Mínimo < $0.05 USD)
Si requieres mantener activas las Cloud Functions:
1. Eliminar de forma segura las imágenes viejas de Docker en el apartado de **Artifact Registry** de Google Cloud, dejando únicamente la última versión activa de la función.
2. Limpiar el bucket de storage `gcf-sources-...` eliminando los archivos ZIP antiguos de despliegue.
3. **Resultado:** El costo total caerá a prácticamente cero, redondeándose a $0 USD en tu tarjeta.

### Alternativa C: Migración a Notificaciones Offline
Utilizar el sistema de notificaciones del cliente basadas en base de datos local y service workers locales del PWA (que corren directamente en el dispositivo del usuario) en lugar de utilizar una Cloud Function reactiva en la nube.
