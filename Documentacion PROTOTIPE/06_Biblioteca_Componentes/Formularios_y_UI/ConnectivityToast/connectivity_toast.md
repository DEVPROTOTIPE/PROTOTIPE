# Alerta de Conectividad (ConnectivityToast)

Componente que detecta en caliente el estado de conexión a Internet (`window.navigator.onLine`) y provee retroalimentación visual al usuario en forma de notificación toast superior.

---

## 1. Propósito y Casos de Uso
* **Detección Automática:** Escucha los eventos globales `online` y `offline` del navegador.
* **Feedback Temporal:** Al reconectarse, el toast se autodemonta después de 3 segundos. Al perder la conexión, se mantiene visible permanentemente hasta que se restablezca el servicio.
* **Casos de Uso:**
  * Aplicaciones PWA Offline-First que requieren informar al usuario antes de enviar mutaciones a Firestore.

---

## 2. Especificación Visual (Tailwind CSS HSL)
* **Animaciones:** Usa Framer Motion con física elástica de resorte (`spring`) para entrada y salida fluida por la parte superior.
* **Variantes de Estado:**
  * **Online:** Fondo suave verde/esmeralda con borde e ícono pulsante.
  * **Offline:** Fondo suave rojo/rosa con borde e ícono rebotante.

---

## 3. Código React Fuente Completo (`ConnectivityToast.jsx`)
```jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

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

    // Detección inicial opcional
    if (!navigator.onLine) {
      setStatus('offline');
    }

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
              <Wifi size={14} className="animate-pulse" />
              <span>Conexión restablecida</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="animate-bounce" />
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

## 4. Origen
* **Extraído de:** `src/components/ui/ConnectivityToast.jsx`
* **Fecha de extracción:** 2026-06-06
* **Versión:** 1.0 (Marca blanca con soporte de eventos del navegador).
