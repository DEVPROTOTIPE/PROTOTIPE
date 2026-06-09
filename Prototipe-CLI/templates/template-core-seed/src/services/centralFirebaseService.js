import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const CENTRAL_API_KEY = import.meta.env.VITE_DEVELOPER_CENTRAL_API_KEY;
const CENTRAL_AUTH_DOMAIN = import.meta.env.VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN;
const CENTRAL_PROJECT_ID = import.meta.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID;
const CENTRAL_STORAGE_BUCKET = import.meta.env.VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET;
const CENTRAL_MESSAGING_SENDER_ID = import.meta.env.VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID;
const CENTRAL_APP_ID = import.meta.env.VITE_DEVELOPER_CENTRAL_APP_ID;

let centralFirestoreInstance = null;

/**
 * Inicializa y retorna la instancia del Firestore Central de forma perezosa.
 */
export function getCentralFirestore() {
  if (!CENTRAL_API_KEY || !CENTRAL_PROJECT_ID) {
    return null;
  }

  if (centralFirestoreInstance) {
    return centralFirestoreInstance;
  }

  const appName = "centralDevApp";
  let centralApp;

  try {
    if (getApps().some(app => app.name === appName)) {
      centralApp = getApp(appName);
    } else {
      centralApp = initializeApp({
        apiKey: CENTRAL_API_KEY,
        authDomain: CENTRAL_AUTH_DOMAIN,
        projectId: CENTRAL_PROJECT_ID,
        storageBucket: CENTRAL_STORAGE_BUCKET,
        messagingSenderId: CENTRAL_MESSAGING_SENDER_ID,
        appId: CENTRAL_APP_ID,
      }, appName);
    }
    centralFirestoreInstance = getFirestore(centralApp);
    return centralFirestoreInstance;
  } catch (error) {
    console.error("Error inicializando Firebase Central:", error);
    return null;
  }
}
