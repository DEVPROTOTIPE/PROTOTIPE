# 🛡️ Guía Técnica — Integración Robusta de Firebase con React 19

> **Ubicación:** `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\Firebase_Listeners_Clean.md`  
> **Propósito:** Definir el patrón de arquitectura óptimo para consumir Firebase (Auth y Firestore) sin generar excepciones de seguridad en consola o fugas de memoria por listeners huérfanos.

---

## 1. El Problema Común
En aplicaciones que utilizan Firebase en tiempo real con React, es común registrar observadores (`onSnapshot`) directamente en el cuerpo de un `useEffect`. Si este `useEffect` se ejecuta antes de que Firebase Auth verifique si el usuario ha iniciado sesión (o si el usuario cierra sesión), Firestore rechazará la solicitud por falta de permisos.

Esto provoca:
1. Advertencias en la consola del navegador: `FirebaseError: Missing or insufficient permissions`.
2. Fugas de memoria al acumular múltiples escuchas si el componente se desmonta o remonta constantemente.

---

## 2. El Patrón Correcto (Golden Standard)

Siempre encapsula las suscripciones a Firestore dentro de la devolución de llamada del cambio de estado de autenticación (`onAuthStateChanged`), y asegúrate de inicializar y retornar funciones limpiadoras (`cleanup functions`).

### Ejemplo de Implementación en React

```javascript
import React, { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore'

export default function MiComponente() {
  const [user, setUser] = useState(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authInstance = getAuth()
    const dbInstance = getFirestore()

    // 1. Escuchar cambios de sesión
    const unsubAuth = onAuthStateChanged(authInstance, (firebaseUser) => {
      setUser(firebaseUser)

      // Variables para almacenar las funciones de cancelación
      let unsubDocs = () => {}

      if (firebaseUser) {
        // 2. SOLO suscribirse si existe un usuario autenticado activo
        try {
          const q = query(collection(dbInstance, 'mi_coleccion_restringida'), orderBy('creadoEn', 'desc'))
          
          unsubDocs = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setData(list)
            setLoading(false)
          }, (error) => {
            console.error("Fallo al escuchar colección restringida:", error)
            setLoading(false)
          })
        } catch (err) {
          console.error("Error inicializando el listener:", err)
        }
      } else {
        // 3. Limpiar estados cuando no hay sesión activa
        setData([])
        setLoading(false)
      }

      // Retornar limpiador del listener de Firestore cuando la sesión cambia o se destruye
      return () => {
        unsubDocs()
      }
    })

    // Retornar limpiador de Auth cuando el componente se desmonta
    return () => unsubAuth()
  }, [])

  return (
    <div>
      {/* Tu UI */}
    </div>
  )
}
```

---

## 3. Lista de Verificación para Nuevos Desarrollos (Onboarding Checklist)

Cuando crees o personalices una nueva instancia para un cliente, valida que:
- [ ] Ninguna llamada a `onSnapshot` de colecciones protegidas se realice a nivel raíz del `useEffect` sin verificar `request.auth` o el estado local del usuario.
- [ ] Cada callback de `onSnapshot` cuente con una función controladora de errores (el tercer parámetro de la función) para capturar caídas de red o restricciones de base de datos sin romper la aplicación.
- [ ] Todo retorno de `useEffect` cancele las suscripciones creadas invocando la función devuelta por `onSnapshot()`.
