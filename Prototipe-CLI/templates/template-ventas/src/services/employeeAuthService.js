import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, signOut } from 'firebase/auth'
import { auth as primaryAuth, firebaseConfig } from '../config/firebaseConfig'

const SECONDARY_APP_NAME = 'employee-provisioning'

/**
 * SEC-015: instancia de Firebase App separada, dedicada exclusivamente a
 * crear cuentas de Auth de empleados. Necesaria porque
 * createUserWithEmailAndPassword en la instancia PRINCIPAL cerraría la
 * sesión del admin y lo dejaría logueado como el empleado recién creado
 * (comportamiento documentado del SDK de Firebase). Mismo patrón ya usado
 * en este proyecto por centralFirebaseService.js para un propósito
 * distinto (segundo proyecto de Firebase); aquí es el mismo proyecto, solo
 * una segunda instancia de la app.
 */
function getSecondaryAuth() {
  const app = getApps().some((a) => a.name === SECONDARY_APP_NAME)
    ? getApp(SECONDARY_APP_NAME)
    : initializeApp(firebaseConfig, SECONDARY_APP_NAME)
  return getAuth(app)
}

export function buildEmployeeAuthEmail(employeeId) {
  return `employee-${employeeId}@internal.prototipe.local`
}

/**
 * Crea la cuenta de Auth de un empleado nuevo (o al cambiarle el PIN por
 * primera vez) sin afectar la sesión del admin. No otorga ningún privilegio
 * de Firestore por sí sola — eso lo hace, aparte, la escritura de
 * employees/{id}.authUid + employeeAuthLinks/{authUid} bajo isAdmin() en la
 * instancia principal.
 */
export async function createEmployeeAuthAccount(employeeId, pin) {
  const secondaryAuth = getSecondaryAuth()
  const email = buildEmployeeAuthEmail(employeeId)
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, pin)
  await signOut(secondaryAuth)
  return { authUid: cred.user.uid, authEmail: email }
}

/**
 * Login real de un empleado: reemplaza la lectura directa (y rota) de
 * employees/{id}/secrets/{hash}. Corre sobre la instancia PRINCIPAL — el
 * empleado necesita quedar autenticado ahí para que firestore.rules
 * (isEmployee()) reconozca su sesión en los portales.
 */
export async function signInEmployee(employeeAuthEmail, pin) {
  const cred = await signInWithEmailAndPassword(primaryAuth, employeeAuthEmail, pin)
  return cred.user
}

/**
 * Autocambio de PIN: el empleado ya está logueado y conoce su PIN actual.
 * No requiere Admin SDK — Firebase permite que un usuario actualice su
 * propia contraseña estando autenticado.
 */
export async function changeOwnPin(newPin) {
  if (!primaryAuth.currentUser) {
    throw new Error('No hay una sesión de empleado activa para cambiar el PIN.')
  }
  await updatePassword(primaryAuth.currentUser, newPin)
}
