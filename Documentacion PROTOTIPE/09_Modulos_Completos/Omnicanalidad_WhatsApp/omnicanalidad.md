# Motor de Omnicanalidad y Mensajería Dinámica (WhatsApp & Notificaciones)

## 1. Propósito y Casos de Uso
Este motor unificado permite gestionar la comunicación directa cliente-negocio. Combina la sanitización y apertura dinámica de enlaces de chat hacia **WhatsApp** (omnicanalidad conversional) con la persistencia en tiempo real de notificaciones internas de alerta en el cliente.

Habilita el envío automático de plantillas de órdenes de compra, alertas de cobro, respuestas a reclamaciones de garantías y notificaciones de despachos en tiempo real.

---

## 2. Especificación Técnica y Formateo
* **Sanitización Dinámica**: Limpieza atómica de caracteres no numéricos, espacios y símbolos (`+`, `-`, `()`).
* **Soporte Multi-País (Prefijos Celulares)**: Formateador inteligente que calcula la longitud del número y le inyecta el prefijo de país (`defaultCountryCode`) de forma paramétrica.
* **Persistencia Desacoplada**: Gestión de lecturas y escrituras Firestore mediante envolturas parametrizadas inyectables en un `ServiceConfig`.

---

## 3. Props y API del Motor

### `openWhatsAppChat(params)`
* `phone`: `String` - Número de celular destinatario (limpio o con caracteres).
* `message`: `String` - Mensaje de texto a enviar.
* `defaultCountryCode`: `String` - Código de país por defecto si el número no lo incluye (ej. `"57"`, `"52"`, `"1"`).

### `subscribeToClientNotifications(params)`
* `config`: `ServiceConfig` - Objeto de configuración `{ db, collectionName }`.
* `clienteCelular`: `String` - Celular del destinatario para filtrar.
* `onUpdate`: `Function` - Callback dinámico disparado al recibir actualizaciones.

---

## 4. Código JavaScript Completo y 100% Funcional

```javascript
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  writeBatch, 
  getDocs 
} from 'firebase/firestore';

/**
 * 📱 1. MOTOR DE ENLACES DE CHAT WHATSAPP
 * Centraliza la sanitización de teléfonos y la codificación de mensajes.
 */
export function openWhatsAppChat({ 
  phone, 
  message, 
  defaultCountryCode = '57' 
}) {
  if (!phone) {
    console.error('No se proporcionó ningún número de teléfono.');
    return;
  }

  // Limpiar caracteres no numéricos
  let cleanPhone = phone.replace(/\D/g, '');

  // Formatear celular de longitud estándar del país agregando el código por defecto
  if (cleanPhone.length === 10) {
    cleanPhone = defaultCountryCode + cleanPhone;
  }

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  
  window.open(url, '_blank');
}

/**
 * 📝 helper: PARSEADOR DE PLANTILLAS DINÁMICAS DE TEXTO
 * Reemplaza variables en formato {variable} de un string con los valores del objeto.
 */
export function parseNotificationTemplate(template, data = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

/**
 * 🔔 2. MOTOR DE NOTIFICACIONES PERSISTENTES (FIRESTORE)
 */

// Crear notificación
export async function createClientNotification({ 
  config = { db: null, collectionName: 'clientNotifications' }, 
  clienteCelular, 
  message, 
  type = 'info', 
  orderId = null,
  timestampFn = () => new Date()
}) {
  if (!config.db || !clienteCelular || clienteCelular === 'Desconocido') return;
  
  try {
    const collRef = collection(config.db, config.collectionName);
    await addDoc(collRef, {
      clienteCelular,
      message,
      type,
      orderId,
      leida: false,
      createdAt: timestampFn()
    });
  } catch (error) {
    console.error('[clientNotificationService] Error al crear notificación:', error);
  }
}

// Suscribir en tiempo real a no leídas
export function subscribeToClientNotifications({
  config = { db: null, collectionName: 'clientNotifications' },
  clienteCelular,
  onUpdate
}) {
  if (!config.db || !clienteCelular) {
    onUpdate([]);
    return () => {};
  }
  
  const collRef = collection(config.db, config.collectionName);
  const q = query(
    collRef,
    where('clienteCelular', '==', clienteCelular),
    where('leida', '==', false)
  );

  return onSnapshot(q, (snap) => {
    const notifications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ordenar localmente descendente para evitar el requisito estricto de índices compuestos en Firebase
    notifications.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    onUpdate(notifications);
  }, (error) => {
    console.error('[clientNotificationService] Error en suscripción:', error);
  });
}

// Marcar leída
export async function markNotificationAsRead({
  config = { db: null, collectionName: 'clientNotifications' },
  notificationId
}) {
  if (!config.db) return;
  try {
    const docRef = doc(config.db, config.collectionName, notificationId);
    await updateDoc(docRef, { leida: true });
  } catch (error) {
    console.error('[clientNotificationService] Error al marcar leída:', error);
  }
}

// Limpiar todas
export async function clearAllClientNotifications({
  config = { db: null, collectionName: 'clientNotifications' },
  clienteCelular
}) {
  if (!config.db || !clienteCelular) return;
  try {
    const collRef = collection(config.db, config.collectionName);
    const q = query(
      collRef,
      where('clienteCelular', '==', clienteCelular),
      where('leida', '==', false)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(config.db);
    snap.docs.forEach(d => {
      batch.update(d.ref, { leida: true });
    });
    await batch.commit();
  } catch (error) {
    console.error('[clientNotificationService] Error al limpiar notificaciones:', error);
  }
}
```

---

## 5. Ejemplo de Uso

### Uso de Enlaces de WhatsApp con Plantilla Dinámica:
```javascript
import { openWhatsAppChat, parseNotificationTemplate } from './omnicanalidad';

const plantilla = '¡Hola {cliente}! Tu pedido #{pedidoId} de {monto} ha sido recibido.';
const mensajeFinal = parseNotificationTemplate(plantilla, {
  cliente: 'Sergio',
  pedidoId: 'SF-1029',
  monto: '$45.000'
});

openWhatsAppChat({
  phone: '3001234567',
  message: mensajeFinal,
  defaultCountryCode: '57' // Colombia por defecto
});
```
