<!--
{
  "technicalName": "ToastNotification",
  "targetPath": "src/components/ui/ToastNotification.jsx",
  "dependencies": {
    "npm": {
      "framer-motion": "^11.0.0"
    },
    "internal": []
  },
  "type": "atom",
  "niches": []
}
-->

# Alerta Toast Flotante Interactiva (ToastNotification)
## Biblioteca de Componentes: Componentes Atómicos

Este componente atómico y estructurado sirve como notificación contextual y temporal que aparece en pantalla para dar retroalimentación inmediata sobre operaciones del sistema (éxito, error, etc.) sin interrumpir el flujo del usuario.

---

## 💎 Propósito y Casos de Uso
1. **Feedback No Invasivo:** Muestra un mensaje sutil en el borde superior de la pantalla que desaparece automáticamente después de 4 segundos.
2. **Variantes Semánticas:** Soporte integrado para tipos `success` y `error` con iconos y colores HSL correspondientes.
3. **Casos de Uso:**
   * Notificación de éxito al guardar o actualizar un registro.
   * Feedback de error en transacciones de red o validaciones.
   * Mensajes de confirmación rápida en segundo plano.

---

## 🎨 Especificación Visual y Estilos (Tailwind CSS HSL)
* **Design & Backdrop:** Tarjeta suspendida con desenfoque elegante (`bg-white/95 backdrop-blur-md`), bordes redondeados (`rounded-2xl`) y sombra suave (`shadow-lg`).
* **Icons & Colors:**
  * `success`: Borde verde y texto esmeralda (`border-emerald-500/20 text-emerald-600`).
  * `error` (u otros): Borde rosado y texto rojo (`border-rose-500/20 text-rose-600`).

---

## ⚙️ Props del Componente

| Prop | Tipo | Default | Descripción |
| :--- | :--- | :--- | :--- |
| `show` | `boolean` | - | Controla la visibilidad y activación del toast. |
| `type` | `string` | `"success"` | Tipo semántico del mensaje (`"success"` o `"error"`). |
| `message` | `string` | - | Texto del mensaje a desplegar. |
| `onClose` | `function` | - | Callback invocado cuando expira el temporizador (4s) o se cierra. |

---

## 3. Código React Completo

```jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ToastNotification({ show, type = 'success', message, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4"
        >
          <div className={`p-4 rounded-2xl border shadow-lg flex items-center gap-3 bg-[var(--color-surface)]/95 backdrop-blur-md ${
            type === 'success' 
              ? 'border-emerald-500/20 text-emerald-600' 
              : 'border-rose-500/20 text-rose-600'
          }`}>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              type === 'success' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
            }`}>
              {type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              )}
            </div>
            <p className="text-xs font-bold leading-snug">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```
