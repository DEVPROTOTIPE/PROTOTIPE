# Plan de Migración de Firebase Central (De prototipe-saas-control a prototipe-ecosistema-control)

Este plan detalla los pasos para crear un nuevo proyecto en Firebase para el control central de telemetría y comisiones de las instancias de **PROTOTIPE**, migrar los datos existentes de configuración y tokens, y actualizar el orquestador CLI y el panel de control.

## Hitos de la Migración

### 1. Creación del nuevo Proyecto Firebase y Aplicación Web
- **ID Propuesto**: `prototipe-ecosistema-control`
- **Registro de App**: Registrar una Web App en el proyecto para extraer las variables SDK (`apiKey`, `appId`, `messagingSenderId`).

### 2. Migración de Datos de Firestore
- Se descargará la información actual del proyecto `prototipe-saas-control`:
  - Colección `clientes_control` (configuraciones de marcas y comisiones).
  - Colección `tokens` (asociaciones de tokens de telemetría).
- Se escribirán los documentos correspondientes en el nuevo proyecto `prototipe-ecosistema-control`.

### 3. Despliegue de Reglas y Configuración
- Desplegar las reglas de Firestore (`firestore.rules`) y los índices compuestos (`firestore.indexes.json`) al nuevo proyecto.

### 4. Actualización de Archivos de Configuración del Ecosistema
- Modificar las variables de entorno centralizadas para apuntar al nuevo proyecto en `dev-dashboard`, `App Ventas` y el CLI `generator.js`.

---
*Última revisión: Junio 2026*
