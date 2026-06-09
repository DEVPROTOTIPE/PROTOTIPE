# Motor Financiero Transaccional de Créditos y Saldos (CreditService)

## 1. Propósito y Casos de Uso
El servicio `creditService` proporciona un motor transaccional robusto para el monitoreo, gestión y liquidación del cupo de crédito y financiamiento a clientes. Administra el control de abonos parciales a deudas activas mediante transacciones atómicas de base de datos (`runTransaction`), evitando race conditions cuando múltiples administradores operan la caja, y calcula de forma precisa saldos pendientes e históricos.

Ideal para sistemas POS con flujo de cuentas por cobrar, esquemas de financiamiento Ecosistema B2B, y carteras de cobros integradas en e-commerce.

---

## 2. Especificación Técnica y Transaccional
* **Transacciones Atómicas de Caja**: Los abonos parciales o totales se ejecutan mediante operaciones transaccionales seguras de base de datos para asegurar el balance correcto de caja.
* **Liquidación en Cascada**: Si una deuda pendiente se reduce a cero, el motor gatilla un cambio de estado en cascada actualizando de forma automática el pedido correspondiente a estado `completado` o `pagado`.
* **Persistencia Abstraída**: Configuración completa inyectable (`ServiceConfig`) para reusar el servicio en cualquier estructura física de base de datos.

---

## 3. Props y API del Motor

### `addPaymentToCredit(params)`
Aplica un abono a un crédito de forma atómica.
* `config`: `ServiceConfig` - Objeto de configuración `{ db, collectionCredits, collectionOrders }`.
* `creditId`: `String` - Identificador único de la deuda a abonar.
* `paymentData`: `Object` - Estructura del abono `{ monto, nota }`.
* `onPaymentApplied`: `Function` - Callback opcional e inyectable de éxito `(creditData, paymentData) => {}` para gatillar notificaciones o avisos por WhatsApp.

---

## 4. Código JavaScript Completo y 100% Funcional

```javascript
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  runTransaction,
  onSnapshot,
  limit,
  orderBy,
  startAfter,
  addDoc
} from 'firebase/firestore';

/**
 * 💳 MOTOR TRANSACCIONAL DE CRÉDITOS Y SALDOS PORTABLE
 */

// Obtener créditos activos/pagados filtrados por estado
export async function getCredits({
  config = { db: null, collectionCredits: 'credits' },
  estado = 'activo'
}) {
  if (!config.db) return [];
  const collRef = collection(config.db, config.collectionCredits);
  const q = query(collRef, where('estado', '==', estado));
  const snap = await getDocs(q);
  
  const credits = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return credits.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
}

// Obtener créditos de un cliente específico
export async function getClientCredits({
  config = { db: null, collectionCredits: 'credits' },
  clienteCelular
}) {
  if (!config.db || !clienteCelular) return [];
  const collRef = collection(config.db, config.collectionCredits);
  const q = query(collRef, where('clienteCelular', '==', clienteCelular));
  const snap = await getDocs(q);
  
  const credits = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return credits.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
}

/**
 * REGISTRO ATÓMICO DE ABONOS A DEUDAS
 * Implementa runTransaction para evitar race conditions en cajas multi-administrador.
 */
export async function addPaymentToCredit({
  config = { db: null, collectionCredits: 'credits', collectionOrders: 'orders' },
  creditId,
  paymentData = { monto: 0, nota: '' },
  onPaymentApplied = async () => {},
  timestampFn = () => new Date()
}) {
  if (!config.db || !creditId) throw new Error('Parámetros de configuración inválidos');

  const creditRef = doc(config.db, config.collectionCredits, creditId);
  let creditData = null;

  await runTransaction(config.db, async (transaction) => {
    const creditDoc = await transaction.get(creditRef);
    if (!creditDoc.exists()) throw new Error('Crédito no encontrado');
    
    const data = creditDoc.data();
    creditData = data;
    
    if (data.estado === 'pagado') {
      throw new Error('Esta deuda ya se encuentra totalmente pagada.');
    }
    
    const nuevoAbono = {
      monto: paymentData.monto,
      nota: paymentData.nota || '',
      fecha: timestampFn().toISOString(),
    };

    const nuevosAbonos = [...(data.abonos || []), nuevoAbono];
    const nuevoSaldo = Math.max(0, data.saldoPendiente - paymentData.monto);
    const nuevoEstado = nuevoSaldo === 0 ? 'pagado' : 'activo';

    // 1. Actualización Atómica del Crédito
    transaction.update(creditRef, {
      abonos: nuevosAbonos,
      saldoPendiente: nuevoSaldo,
      estado: nuevoEstado,
      updatedAt: timestampFn()
    });

    // 2. Liquidación en Cascada del Pedido
    if (nuevoSaldo === 0 && data.orderId) {
      const orderRef = doc(config.db, config.collectionOrders, data.orderId);
      transaction.update(orderRef, {
        estado: 'completado',
        updatedAt: timestampFn()
      });
    }
  });

  // 3. Disparo de Callback de Omnicanalidad (Desacoplado de la transacción física)
  if (creditData && onPaymentApplied) {
    await onPaymentApplied(creditData, paymentData);
  }
}

// Suscripción en tiempo real a créditos activos/pagados
export function subscribeToCredits({
  config = { db: null, collectionCredits: 'credits' },
  estado = 'activo',
  onUpdate
}) {
  if (!config.db) {
    onUpdate([]);
    return () => {};
  }
  const collRef = collection(config.db, config.collectionCredits);
  const q = query(collRef, where('estado', '==', estado));
  return onSnapshot(q, (snap) => {
    const credits = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const sorted = credits.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    onUpdate(sorted);
  });
}

// Suscripción paginada para monitores de cobro
export async function getCreditsPaged({
  config = { db: null, collectionCredits: 'credits' },
  estado = 'activo',
  limitSize = 10,
  startAfterDoc = null
}) {
  if (!config.db) return { credits: [], lastDoc: null };
  
  const collRef = collection(config.db, config.collectionCredits);
  const constraints = [
    where('estado', '==', estado),
    orderBy('createdAt', 'desc'),
    limit(limitSize)
  ];
  
  if (startAfterDoc) {
    constraints.push(startAfter(startAfterDoc));
  }
  
  const q = query(collRef, ...constraints);
  const snap = await getDocs(q);
  
  const credits = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return {
    credits,
    lastDoc: snap.docs[snap.docs.length - 1] || null
  };
}
```

---

## 5. Ejemplo de Uso

```javascript
import { addPaymentToCredit } from './creditService';
import { db } from './firebaseConfig';

const config = {
  db: db,
  collectionCredits: 'credits_cliente_A',
  collectionOrders: 'orders_cliente_A'
};

const handleAbonar = async () => {
  try {
    await addPaymentToCredit({
      config,
      creditId: 'CREDIT-9832',
      paymentData: { monto: 15000, nota: 'Abono en efectivo en oficina' },
      onPaymentApplied: async (creditData, abono) => {
        console.log(`Notificar a WhatsApp: ${creditData.clienteCelular} por abono de ${abono.monto}`);
      }
    });
    alert('Abono registrado con éxito de forma atómica.');
  } catch (err) {
    console.error(err.message);
  }
};
```
