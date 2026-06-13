import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, onSnapshot, orderBy
} from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { COLLECTIONS } from '../constants'

const COL = COLLECTIONS.EMPLOYEES

async function hashPin(pin) {
  if (!pin) return ''
  // Si ya es un hash SHA-256 (64 caracteres hex), no volver a hashear
  if (/^[a-f0-9]{64}$/i.test(pin)) return pin
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function saveEmployee(data) {
  const ref = data.id ? doc(db, COL, data.id) : doc(collection(db, COL))
  const isPinChanged = data.pin && data.pin !== '******'
  
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
    const hashedPin = await hashPin(data.pin)
    const secretsColRef = collection(db, COL, ref.id, 'secrets')
    
    const oldSecrets = await getDocs(secretsColRef)
    for (const d of oldSecrets.docs) {
      await deleteDoc(doc(db, COL, ref.id, 'secrets', d.id))
    }
    
    await setDoc(doc(db, COL, ref.id, 'secrets', hashedPin), {
      createdAt: serverTimestamp()
    })
  }

  return ref.id
}

export async function deleteEmployee(id) {
  const secretsColRef = collection(db, COL, id, 'secrets')
  try {
    const oldSecrets = await getDocs(secretsColRef)
    for (const d of oldSecrets.docs) {
      await deleteDoc(doc(db, COL, id, 'secrets', d.id))
    }
  } catch (e) {
    console.error("[employeeService] Error al eliminar secretos del empleado:", e)
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
export async function authenticateEmployeeByPin(pin) {
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
 * Autentica un empleado específico por su ID + PIN.
 * Más seguro que la búsqueda global por PIN.
 * @param {string} employeeId
 * @param {string} pin
 * @returns {Promise<object|null>}
 */
export async function authenticateEmployeeByIdAndPin(employeeId, pin) {
  if (!employeeId || !pin) return null
  const hashedPin = await hashPin(pin)
  const secretRef = doc(db, COL, employeeId, 'secrets', hashedPin)
  try {
    const secretSnap = await getDoc(secretRef)
    if (secretSnap.exists()) {
      const empSnap = await getDoc(doc(db, COL, employeeId))
      if (empSnap.exists() && empSnap.data().activo) {
        return { id: empSnap.id, ...empSnap.data() }
      }
    }
  } catch (err) {
    console.error("[employeeService] Error durante la autenticación del empleado:", err)
  }
  return null
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

