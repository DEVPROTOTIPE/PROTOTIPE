# 🛡️ Manual de Gestión de Riesgos, Mitigación y Disaster Recovery (DR)

Este manual define los protocolos de contención ante fallas físicas, degradación por límites de cuotas cloud, disputas comisionales, backups gratuitos, offboarding técnico y concurrencia de stock en el ecosistema **PROTOTIPE**.

---

## 📉 1. Protocolo de Degradación por Límites de Plan Spark (Firebase)

Dado que las instancias clientes operan bajo el **Plan Spark gratuito** de Firebase (límite de 50,000 lecturas y 20,000 escrituras diarias en Firestore), existe el riesgo de suspensión temporal del servicio por exceso de cuota (`resource-exhausted`).

### A. Detección y Captura del Error
Todos los repositorios lógicos (`*Repository.js`) que interactúan directamente con el SDK de Firebase deben atrapar los errores de código de cuota:
*   **Código de error Firebase:** `resource-exhausted` (gRPC Status: `8 RESOURCE_EXHAUSTED`).
*   **Acción:** Capturar la excepción en el manejador y propagar el estado de cuota agotada.

### B. Modo de Operación "Solo Lectura Local"
Cuando se detecta `resource-exhausted`:
1.  **Banner de UI:** La aplicación debe renderizar un banner persistente no invasivo pero visible en la parte superior:
    > ⚠️ *El servicio de base de datos en la nube está temporalmente en mantenimiento por límite de cuotas de datos. El sistema operará en modo local-offline hasta el restablecimiento diario (00:00 PST).*
2.  **Conmutación a IndexedDB (Dexie):** Las operaciones de lectura de catálogos e inventarios se servirán directamente desde el caché de base de datos local persistido por Dexie.
3.  **Encolamiento de Escrituras:** Las nuevas ventas, citas o registros no se enviarán a Firestore; se encolarán en IndexedDB marcadas como pendientes (`outbox`) esperando el reinicio de las cuotas de Firebase.

---

## 💳 2. Conciliación Transaccional y Reembolsos Comisionales

Para los clientes bajo el esquema de cobro comisional (`billingMode: percentage` o `fixed_per_service`), las comisiones de desarrollo se reportan automáticamente a la base central de telemetría en tiempo real al concretar una venta.

### A. El Desafío de las Disputas y Chargebacks
Si el cliente final de una tienda exige un reembolso, o si una transacción es detectada como fraude por la pasarela de pago (Wompi, Bold, etc.) horas después del despacho:
*   La venta original debe marcarse como `disputada` o `reembolsada` en el historial del cliente.

### B. Regla de Deducción Retroactiva de Comisiones
Para evitar que el dueño de la marca pague comisiones por ventas no cobradas:
1.  **Deducción Automática:** El servicio `billingService.js` en el Dashboard Central de PROTOTIPE, al procesar el cierre comisional mensual, restará del saldo total acumulado a facturar el valor de las comisiones asociadas a cualquier venta marcada con estado `reembolsado` o `disputado` en ese período.
2.  **Trazabilidad:** Todo ajuste negativo se registrará bajo el documento de conciliación `/clientes_control/{clientId}/conciliaciones/{periodo}` con la firma del evento de la transacción de pago revertida.

---

## 💾 3. Plan de Backups y Recuperación ante Desastres (Firestore)

El plan Spark no incluye copias de seguridad automatizadas nativas de Google Cloud Scheduler debido a restricciones de Cloud Functions. Implementamos una estrategia gratuita controlada localmente.

### A. Copias de Seguridad mediante Google Cloud CLI
El CLI de PROTOTIPE incluye el script `backup_db.js`. Para realizar un backup de la base de datos de producción de un cliente:
1.  **Comando de exportación local:**
    ```bash
    gcloud firestore export gs://[ID_BUCKET_CLIENTE]/backups/diario --project=[ID_PROYECTO_CLIENTE]
    ```
2.  **Automatización:** El CLI Bridge local, si está en ejecución en la máquina del administrador, corre esta tarea cada 24 horas y copia los archivos resultantes a la carpeta local `D:\PROTOTIPE\Backups_Ecosistema\Firestore_[clientId]\`.

### B. Protocolo de Restauración ante Pérdida de Datos (Disaster Recovery)
Si un administrador borra accidentalmente el catálogo o la colección de ventas (`restauracion_aplicacion.md`):
1.  **Paso 1: Bloquear la Instancia.** Poner la aplicación del cliente en modo mantenimiento actualizando `maintenanceMode: true` en el `.env.local` del hosting.
2.  **Paso 2: Importar el Resguardo.** Ejecutar la importación del último backup desde el bucket de Storage:
    ```bash
    gcloud firestore import gs://[ID_BUCKET_CLIENTE]/backups/diario/[SUBCARPETA_TIMESTAMP] --project=[ID_PROYECTO_CLIENTE]
    ```
3.  **Paso 3: Verificación de Integridad.** Correr la suite de Smoke Tests de Playwright para garantizar la consistencia antes de desactivar el modo mantenimiento.

---

## 🚦 4. Rate-Limiting de la Telemetría Central (Noisy Neighbor)

Para proteger la base de datos de control central (`prototipe-ecosistema-control`) contra picos de reportes ruidosos (ej. una excepción de Javascript disparándose 100 veces por segundo en el navegador de un cliente), implementamos dos defensas:

### A. Loteo Asíncrono (Batching)
En lugar de emitir una petición de red por cada error o registro observacional instantáneamente:
*   Los errores se encolan inmediatamente en IndexedDB (`telemetryDb.outbox`).
*   Un temporizador asíncrono (`setInterval`) se ejecuta cada **30 segundos** en segundo plano, extrae todos los errores acumulados y los envía en un único lote agrupado de escritura (`writeBatch`) a Firestore Central.

### B. Limitador de Tasa (Rate Limiter - Circuit Breaker)
*   **Límite Máximo:** Cada instancia cliente tiene prohibido reportar más de **20 incidentes por minuto** a la base central.
*   **Descarte:** Si el cliente supera este límite, la telemetría local descarta los errores adicionales, registra un único log de advertencia en IndexedDB y bloquea temporalmente el envío centralizado durante 5 minutos para evitar un DDoS accidental.

---

## 🏪 5. Stock Negativo y Conflictos de Sincronización en Mostrador (POS)

Cuando la aplicación POS opera en modo offline, las ventas físicas ocurren de forma inmediata en mostrador utilizando el stock local guardado en IndexedDB.

### A. La Regla de Oro: La Venta Física Prevalece
El dinero del cliente ya entró a la caja registradora física. Por lo tanto, **la transacción nunca debe rechazarse ni bloquearse** al volver la conexión a internet, incluso si el stock real en Firestore es menor al vendido (causando stock negativo teórico).

### B. Flujo de Conciliación Diferida de Inventario
Al sincronizar una venta realizada en modo offline:
1.  **Detección de Conflicto de Stock:** Si el stock real en la nube es `0` pero el POS vendió `2` unidades:
    *   La transacción de Firestore se procesa de forma exitosa forzando el inventario a `-2`.
2.  **Registro de Mermas/Diferencias:** El sistema crea de manera automática un documento en `/sucursales/{id}/diferencias_inventario` con el timestamp, ID de la venta offline y la cantidad de unidades en conflicto.
3.  **Alerta al Administrador:** El dashboard del administrador muestra una notificación del hito para que el gerente realice un ajuste físico de existencias o ingrese la reposición de inventario omitida.

---

## 🚪 6. Políticas de Offboarding Técnico y Legal (Baja de Clientes)

### A. Procedimiento Técnico de Volcado de Datos
Cuando un cliente cancela su suscripción o solicita su offboarding:
1.  El CLI Bridge provee el comando:
    ```bash
    node scripts/offboard_client.js --client=[clientId]
    ```
2.  Este script extrae de forma recursiva todas las colecciones de Firestore del cliente y las exporta a un archivo comprimido `backup_datos_[clientId].zip` conteniendo archivos JSON individuales estructurados por colección.
3.  Se le entrega el archivo al cliente, eliminando la dependencia o retención técnica (Vendor Lock-in).

### B. Propiedad Legal del Proyecto GCP/Firebase
*   **Propiedad de PROTOTIPE:** Los proyectos de Google Cloud Platform y Firebase aprovisionados por el CLI Bridge son propiedad legal exclusiva de PROTOTIPE y operan en su consola multitenant.
*   **Política de Purga:** Tras la confirmación legal de baja, PROTOTIPE conserva la base de datos congelada durante **30 días** como plazo de seguridad. El día 31, el script de purga elimina de forma definitiva el proyecto de Firebase y los buckets de Storage asociados.
