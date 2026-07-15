import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, onSnapshot, orderBy
} from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { COLLECTIONS } from '../constants'
import { createEmployeeAuthAccount, signInEmployee } from './employeeAuthService'

const COL = COLLECTIONS.EMPLOYEES

/**
 * SEC-015: crea/actualiza un empleado. Al establecer el PIN por PRIMERA VEZ
 * (empleado sin authUid todavía) provisiona una cuenta real de Firebase Auth
 * vía employeeAuthService (correo sintético + PIN como contraseña) y la
 * vincula en employeeAuthLinks/{authUid} — reemplaza el viejo esquema de
 * hash SHA-256 en employees/{id}/secrets, que ya no se usa para login
 * (firestore.rules lo mantiene bloqueado como colección muerta).
 *
 * Cambiar el PIN de un empleado YA provisionado (authUid existente) no se
 * hace aquí — requiere scripts/reset-employee-pin.js (Admin SDK), porque el
 * correo sintético es fijo por employeeId y Firebase no permite recrear una
 * cuenta con el mismo correo. Decisión explícita del fundador.
 */
export async function saveEmployee(data) {
  const ref = data.id ? doc(db, COL, data.id) : doc(collection(db, COL))
  const isPinChanged = data.pin && data.pin !== '******'

  if (isPinChanged && data.authUid) {
    throw new Error(
      'Este empleado ya tiene una cuenta creada. Para cambiar su PIN usa ' +
      'scripts/reset-employee-pin.js desde la terminal (requiere las ' +
      'credenciales del proyecto, no se puede hacer desde el panel).'
    )
  }

  const empData = {
    nombre: data.nombre || '',
    rol: data.rol || 'vendedor',
    activo: data.activo !== false,
    salario: Number(data.salario) || 0,
    frecuenciaPago: data.frecuenciaPago || 'quincenal',
    telefono: data.telefono || '',
    observaciones: data.observaciones || '',
    createdAt: data.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  if (isPinChanged) {
    empData.hasPin = true
  } else if (!data.id) {
    empData.hasPin = false
  }

  await setDoc(ref, empData, { merge: true })

  if (isPinChanged) {
    // Provisión inicial: crea la cuenta de Auth (instancia secundaria, no
    // afecta la sesión del admin) y la vincula. Si esto falla, el empleado
    // queda simplemente "sin authUid" (visible, reintentable) — nada
    // inseguro queda a medio camino.
    const { authUid, authEmail } = await createEmployeeAuthAccount(ref.id, data.pin)
    await updateDoc(ref, { authUid, authEmail, updatedAt: serverTimestamp() })
    await setDoc(doc(db, COLLECTIONS.EMPLOYEE_AUTH_LINKS, authUid), {
      employeeId: ref.id,
      activo: empData.activo,
      createdAt: serverTimestamp(),
    })
  }

  return ref.id
}

export async function deleteEmployee(id) {
  try {
    const empSnap = await getDoc(doc(db, COL, id))
    const authUid = empSnap.exists() ? empSnap.data().authUid : null
    if (authUid) {
      // SEC-015: revoca el privilegio de Firestore de inmediato. La cuenta
      // de Firebase Auth en sí no se puede borrar desde el cliente (requiere
      // Admin SDK) — queda huérfana pero inofensiva, sin employeeAuthLinks
      // que la respalde, isEmployee() la ignora igual que en un reset de PIN.
      await deleteDoc(doc(db, COLLECTIONS.EMPLOYEE_AUTH_LINKS, authUid))
    }
  } catch (e) {
    console.error("[employeeService] Error al revocar el acceso del empleado:", e)
  }
  await deleteDoc(doc(db, COL, id))
}

export async function getEmployee(id) {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getEmployees() {
  const snap = await getDocs(query(collection(db, COL), orderBy('nombre')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribeToEmployees(callback) {
  const q = query(collection(db, COL), orderBy('nombre'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, error => {
    console.warn("[employeeService] Error en la suscripción a empleados:", error.message)
  })
}

/**
 * Autentica un empleado por PIN táctil (para /portal/auth).
 * @param {string} pin
 * @returns {Promise<object|null>}
 */
export async function authenticateEmployeeByPin() {
  console.warn("authenticateEmployeeByPin está obsoleta por razones de seguridad. Usa authenticateEmployeeByIdAndPin.")
  return null
}

export async function toggleEmployeeStatus(id, activo) {
  await updateDoc(doc(db, COL, id), { activo, updatedAt: serverTimestamp() })
}

/**
 * Obtiene empleados filtrados por rol activos.
 * @param {string} rol
 * @returns {Promise<object[]>}
 */
export async function getEmployeesByRole(rol) {
  const q = query(
    collection(db, COL),
    where('rol', '==', rol),
    where('activo', '==', true),
    orderBy('nombre')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * SEC-015: autentica un empleado específico por su ID + PIN vía Firebase
 * Auth real (signInWithEmailAndPassword sobre un correo sintético interno),
 * reemplazando la lectura directa y rota de employees/{id}/secrets/{hash}
 * (esa lectura exigía isAdmin(), que un empleado normal nunca tiene —
 * confirmado como bug real en producción por CORE-353).
 * @param {string} employeeId
 * @param {string} pin
 * @returns {Promise<object|null>}
 */
export async function authenticateEmployeeByIdAndPin(employeeId, pin) {
  if (!employeeId || !pin) return null
  try {
    const empSnap = await getDoc(doc(db, COL, employeeId))
    if (!empSnap.exists() || !empSnap.data().activo || !empSnap.data().authEmail) {
      return null
    }
    await signInEmployee(empSnap.data().authEmail, pin)
    return { id: empSnap.id, ...empSnap.data() }
  } catch (err) {
    // Credenciales inválidas (PIN incorrecto) u otro error de Auth: se trata
    // igual que "no autenticado", sin distinguir la causa exacta al usuario.
    console.warn("[employeeService] Falló la autenticación del empleado:", err.code || err.message)
    return null
  }
}

/**
 * Suscripción a empleados de un rol específico en tiempo real.
 */
export function subscribeToEmployeesByRole(rol, callback) {
  const q = query(
    collection(db, COL),
    where('rol', '==', rol),
    where('activo', '==', true),
    orderBy('nombre')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, error => {
    console.warn(`[employeeService] Error en la suscripción a empleados por rol (${rol}):`, error.message)
  })
}

