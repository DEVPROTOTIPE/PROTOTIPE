import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, runTransaction, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSy[API_KEY_DE_CLIENTE_AUTOGENERADA]",
  authDomain: "proyecto-cliente-saas.firebaseapp.com",
  projectId: "proyecto-cliente-saas",
  storageBucket: "proyecto-cliente-saas.firebasestorage.app",
  messagingSenderId: "519490711107",
  appId: "APP_ID_MUTABLE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS = {
  ORDERS: 'orders',
  CREDITS: 'credits'
};

async function test() {
  console.log("Creando pedido de prueba...");
  const ordersRef = collection(db, 'orders');
  const orderId = await addDoc(ordersRef, {
    orderNumber: `OR-TEST${Math.floor(Math.random() * 100000)}`,
    estado: 'pendiente',
    metodoPago: 'credito',
    total: 25000,
    cliente: {
      nombre: "Test Cliente",
      celular: "1234567890",
      direccion: "Calle Test",
      barrio: "Barrio Test",
      ciudad: "Ciudad Test"
    },
    items: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }).then(ref => ref.id);

  console.log(`Pedido creado con ID: ${orderId}. Intentando completar...`);

  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await runTransaction(db, async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists()) throw new Error('Pedido no encontrado');

      // Actualizar estado del pedido
      transaction.update(orderRef, {
        estado: 'completado',
        updatedAt: serverTimestamp()
      });

      if (orderDoc.data().metodoPago === 'credito') {
        console.log("metodoPago es credito! Generando credito...");
        const creditRef = doc(collection(db, COLLECTIONS.CREDITS));
        transaction.set(creditRef, {
          orderId: orderDoc.id,
          orderNumber: orderDoc.data().orderNumber,
          clienteNombre: orderDoc.data().cliente?.nombre || 'Desconocido',
          clienteCelular: orderDoc.data().cliente?.celular || 'Desconocido',
          montoTotal: orderDoc.data().total || 0,
          saldoPendiente: orderDoc.data().total || 0,
          abonos: [],
          estado: 'activo',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        console.log(`metodoPago no es credito, es: ${orderDoc.data().metodoPago}`);
      }
    });

    console.log("Transacción ejecutada con éxito!");

    // Verificar si se creó el crédito
    const creditsRef = collection(db, 'credits');
    const snapCredits = await getDocs(creditsRef);
    console.log(`\nNúmero de créditos en la base de datos: ${snapCredits.size}`);
    snapCredits.forEach(doc => {
      console.log(`Crédito - ID: ${doc.id} | Data: ${JSON.stringify(doc.data())}`);
    });
  } catch (err) {
    console.error("Error durante la ejecución:", err);
  }
}

test().catch(console.error);
