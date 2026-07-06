<!--
{
  "technicalName": "ConnectivityToast",
  "targetPath": "src/components/ui/ConnectivityToast.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "component",
  "niches": []
}
-->

# Alertas de Conectividad en Caliente (ConnectivityToast)

Componente de interfaz global y responsivo que monitorea en tiempo real el estado de red de la aplicación (online/offline) a través de los eventos del navegador, mostrando una alerta flotante en la cabecera con animaciones elásticas y desenfoque de fondo cuando ocurre una desconexión o cuando se restablece el servicio.

---

## 1. Propósito y Casos de Uso
* **Notificación Inmediata de Pérdida de Red:** En aplicaciones PWA y POS es crítico avisar al vendedor que se ha quedado offline para evitar que intente realizar transacciones o escrituras directas en la base de datos en la nube.
* **Confirmación de Reconexión:** Cuando la red regresa, muestra un aviso temporal de color verde indicando que el servicio ha sido restaurado con éxito y luego se destruye silenciosamente del DOM tras 3 segundos.
* **Casos de Uso:**
  * Alerta flotante global inyectada en el layout principal de la aplicación.
  * Bloqueo preventivo de botones de guardado en base al estado de red.

---

## 2. Especificación Visual y Estilos
* **Posicionamiento:** `fixed top-4 left-1/2 -translate-x-1/2` - Centrado horizontalmente en el tope superior del viewport.
* **Fondo Estilizado Premium:** `backdrop-blur-md bg-opacity-90 shadow-lg border rounded-full` - Aspecto translúcido estilo cristal (glassmorphism) con bordes redondeados y sombra.
* **Estados Cromáticos HSL:**
  * *Online:* `bg-emerald-500/10 text-emerald-500 border-emerald-500/30` - Verde suave y traslúcido.
  * *Offline:* `bg-rose-500/10 text-rose-500 border-rose-500/30` - Rojo suave y traslúcido.
* **Micro-animaciones (Framer Motion):**
  * Descenso y escala elástica al aparecer.
  * Ascenso y desvanecimiento al destruirse (`exit`).
  * Parpadeo animado (`animate-pulse`) del icono de Wifi e incremento de escala rebote (`animate-bounce`) en WifiOff.

---

## 3. Código React Fuente Completo (`ConnectivityToast.jsx`)
```jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Inline de Wifi para evitar dependencias duras externas
const WifiIcon = ({ size = 14, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    <line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);

const WifiOffIcon = ({ size = 14, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 1l22 22"/>
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
    <path d="M5 12.55a10.94 10.94 0 0 1 5.83-2.84"/>
    <path d="M1 7.47a16 16 0 0 1 4.85-2.66"/>
    <path d="M11.64 6a15.86 15.86 0 0 1 10.94 1.47"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    <line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);

/**
 * Toast de conectividad reactivo.
 * Monitorea el estado offline/online del navegador de forma global.
 */
export default function ConnectivityToast() {
  const [status, setStatus] = useState(null); // null, 'online', 'offline'

  useEffect(() => {
    const handleOnline = () => {
      setStatus('online');
      const timer = setTimeout(() => {
        setStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!status) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
      >
        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border backdrop-blur-md bg-opacity-90 font-bold text-xs select-none transition-all ${
          status === 'online'
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
        }`}>
          {status === 'online' ? (
            <>
              <WifiIcon size={14} className="animate-pulse" />
              <span>Conexión restablecida</span>
            </>
          ) : (
            <>
              <WifiOffIcon size={14} className="animate-bounce" />
              <span>Sin conexión a Internet</span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 4. Lógica de Estado y Ciclo de Vida
1. **Listeners de Navegador:** Utiliza `window.addEventListener` para suscribirse a los eventos nativos de red `online` y `offline` provistos por el navegador.
2. **Temporizador de Autocierre:** Al reconectarse (`online`), se dispara un temporizador que limpia el estado de vuelta a `null` tras 3000 ms, desmontando el componente con una animación suave de salida.
3. **Persistencia en Desconexión:** El estado `offline` no posee temporizador; permanece visible en pantalla durante todo el periodo que el dispositivo carezca de red para notificar permanentemente al usuario.

---

## 5. Ejemplo de Uso (Inyección Global en App.jsx)
```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConnectivityToast from './components/ui/ConnectivityToast';
import Home from './pages/Home';

export default function App() {
  return (
    <BrowserRouter>
      {/* El toast se monta fuera de las rutas para persistir en toda la navegación */}
      <ConnectivityToast />
      
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 6. Origen
* **Extraído de:** [ConnectivityToast.jsx](file:///d:/Aplicaciones/App%20Ventas/src/components/ui/ConnectivityToast.jsx)
* **Fecha de extracción:** 2026-06-06
* **Versión:** 1.0 (Monitoreo reactivo de red).
