/* global process */
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc } from 'firebase/firestore';
import { initializeApp as initializeAdminApp, deleteApp as deleteAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// SEC-015: a diferencia de firestoreRules.spec.js (que usa
// @firebase/rules-unit-testing y simula sesiones/claims, pero NO verifica
// contraseñas reales), esta suite corre contra el emulador de Auth real —
// necesario para probar que signInWithEmailAndPassword funciona de verdad
// con el correo sintético + PIN. Requiere `firebase emulators:start --only
// firestore,auth` (no solo --only firestore).
//
// Nota honesta: el emulador NO reproduce el rate-limiting/backoff real de
// producción de Google ante intentos repetidos de contraseña incorrecta —
// la protección contra fuerza bruta es cualitativamente real (Firebase Auth
// gestiona el hash/verificación server-side) pero no cuantitativamente
// verificable aquí.

const PROJECT_ID = 'test-prototipe-rules-moni';

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8085';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9195';

let clientApp;
let clientAuth;
let clientDb;
let adminApp;
let adminAuth;
let adminDb;

beforeAll(() => {
  adminApp = initializeAdminApp({ projectId: PROJECT_ID }, 'admin-employee-auth-test');
  adminAuth = getAdminAuth(adminApp);
  adminDb = getAdminFirestore(adminApp);

  clientApp = initializeApp({ apiKey: 'fake-api-key', projectId: PROJECT_ID }, 'client-employee-auth-test');
  clientAuth = getAuth(clientApp);
  connectAuthEmulator(clientAuth, 'http://127.0.0.1:9195', { disableWarnings: true });
  clientDb = getFirestore(clientApp);
  connectFirestoreEmulator(clientDb, '127.0.0.1', 8085);
});

afterAll(async () => {
  await deleteApp(clientApp);
  await deleteAdminApp(adminApp);
});

// Sufijo único por ejecución: el emulador de Auth conserva estado entre
// corridas de `vitest run` dentro de la misma sesión — sin esto, correr la
// suite dos veces seguidas choca con "email ya existe" de la corrida previa.
const RUN_SUFFIX = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function seedEmployee({ employeeId: baseEmployeeId, pin, activo = true }) {
  const employeeId = `${baseEmployeeId}-${RUN_SUFFIX}`;
  const email = `employee-${employeeId}@internal.prototipe.local`;
  const userRecord = await adminAuth.createUser({ email, password: pin });
  await adminDb.collection('employees').doc(employeeId).set({
    nombre: 'Empleado de Prueba',
    activo,
    authUid: userRecord.uid,
    authEmail: email,
  });
  await adminDb.collection('employeeAuthLinks').doc(userRecord.uid).set({
    employeeId,
    activo,
  });
  return { employeeId, email, authUid: userRecord.uid };
}

describe('SEC-015 — login real de empleados contra el emulador de Auth', () => {
  test('signInWithEmailAndPassword funciona con el PIN correcto', async () => {
    const { email } = await seedEmployee({ employeeId: 'emp-correcto-1', pin: '135790' });

    const cred = await signInWithEmailAndPassword(clientAuth, email, '135790');
    expect(cred.user.email).toBe(email);

    await signOut(clientAuth);
  });

  test('signInWithEmailAndPassword falla con un PIN incorrecto', async () => {
    const { email } = await seedEmployee({ employeeId: 'emp-incorrecto-1', pin: '246810' });

    await expect(signInWithEmailAndPassword(clientAuth, email, '000000')).rejects.toThrow();
  });

  test('la sesión resultante puede pasar una escritura gateada por isEmployee()', async () => {
    const { employeeId, email, authUid } = await seedEmployee({ employeeId: 'emp-stock-1', pin: '112233' });
    await signInWithEmailAndPassword(clientAuth, email, '112233');

    // isEmployee() exige employeeAuthLinks/{authUid}.activo == true (ya
    // sembrado) y que el employeeId declarado en la escritura coincida.
    const movementRef = doc(clientDb, 'stockMovements', `movimiento-de-prueba-${authUid}`);
    await expect(
      setDoc(movementRef, {
        employeeId,
        productId: 'prod-test',
        quantity: 1,
        type: 'entrada',
      })
    ).resolves.not.toThrow();

    await signOut(clientAuth);
  });
});
