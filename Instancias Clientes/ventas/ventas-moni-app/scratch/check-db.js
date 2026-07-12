import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query, orderBy } from 'firebase/firestore';

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

async function main() {
  console.log("=== ÚLTIMOS PEDIDOS ===");
  const ordersRef = collection(db, 'orders');
  const qOrders = query(ordersRef, orderBy('createdAt', 'desc'), limit(5));
  const snapOrders = await getDocs(qOrders);
  snapOrders.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id} | Numero: ${data.orderNumber} | Estado: ${data.estado} | Metodo: ${data.metodoPago} | Total: ${data.total} | Cliente: ${JSON.stringify(data.cliente)}`);
  });

  console.log("\n=== CRÉDITOS ===");
  const creditsRef = collection(db, 'credits');
  const snapCredits = await getDocs(creditsRef);
  if (snapCredits.empty) {
    console.log("No hay créditos registrados en la colección 'credits'.");
  } else {
    snapCredits.forEach(doc => {
      console.log(`ID: ${doc.id} | Data: ${JSON.stringify(doc.data())}`);
    });
  }
}

main().catch(console.error);
