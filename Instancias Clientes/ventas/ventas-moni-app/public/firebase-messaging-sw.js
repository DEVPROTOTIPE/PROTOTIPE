// Service Worker de Firebase Cloud Messaging para App Ventas (SmartFix)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js')

// Inicializar la aplicación de Firebase dentro del Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyCAclNVlP9GFXdlmm09Pe6MR8Pj-BZbkqE",
  authDomain: "ventas-moni-app.firebaseapp.com",
  projectId: "ventas-moni-app",
  storageBucket: "ventas-moni-app.firebasestorage.app",
  messagingSenderId: "852226050261",
  appId: "1:852226050261:web:995fdc86d74026e7fbba5c"
})

const messaging = firebase.messaging()

// Manejar notificaciones en segundo plano (Background)
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Recibido mensaje en background:', payload)

  const notificationTitle = payload.notification?.title || payload.data?.title || 'App Ventas'
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Nueva actualización',
    icon: payload.notification?.icon || payload.data?.icon || '/favicon.svg',
    badge: '/favicon.svg',
    data: {
      clickAction: payload.data?.clickAction || payload.fcmOptions?.link || '/'
    }
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Manejar click en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const urlToOpen = event.notification.data?.clickAction || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si ya hay una pestaña abierta en la misma URL, enfocarla
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // Si no, abrir una nueva pestaña
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
