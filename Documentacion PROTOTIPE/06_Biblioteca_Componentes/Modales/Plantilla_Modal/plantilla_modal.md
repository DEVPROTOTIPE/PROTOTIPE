<!--
{
  "technicalName": "ModalTemplate",
  "targetPath": "src/components/ui/ModalTemplate.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Modal Base Premium (ModalTemplate)

Componente de Modal premium controlado y reutilizable. Cumple con los estándares de React Portals, Body Scroll Lock, microinteracciones fluidas y un diseño responsivo móvil-primero.

---

## 1. Propósito y Casos de Uso
* **React Portals:** Evita problemas de `overflow: hidden` o `z-index` en contenedores padres al inyectar el modal directamente como hijo de `document.body`.
* **Scroll Lock:** Bloquea reactivamente el scroll del body mientras el modal está abierto para evitar el desplazamiento doble del fondo.
* **Casos de Uso:**
  * Formularios de creación o edición de registros.
  * Detalle de productos en el catálogo de ventas.
  * Modales multi-paso (Checkout, configuración).

---

## 2. Especificación Visual y Estilos (Tailwind CSS HSL)
* **Backdrop Blur:** Fondo translúcido con desenfoque (`bg-black/60 backdrop-blur-sm`).
* **Mobile-First Design:** En pantallas móviles actúa como una Bottom Sheet deslizable hacia arriba, mientras que en pantallas más grandes se centra automáticamente como tarjeta suspendida con sombras premium.

---

## 3. Props y API del Componente
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Flag de control de apertura. |
| `onClose` | `function` | - | Callback de cierre del modal. |
| `title` | `string` | `""` | Título principal en la cabecera. |
| `subtitle` | `string` | `""` | Subtítulo secundario opcional. |
| `icon` | `ReactComponent` | `null` | Ícono decorativo opcional para la cabecera. |
| `onBack` | `function` | `null` | Callback opcional para botón de regreso (modales multi-paso). |
| `children` | `ReactNode` | - | Contenido interno del cuerpo. |
| `footerActions` | `ReactNode` | `null` | Botones de acción del pie de página. |

---

## 4. Código React Fuente Completo (`ModalTemplate.jsx`)
```jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';

export default function ModalTemplate({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  icon: Icon, 
  onBack,
  children, 
  footerActions 
}) {
  
  // ─── Bloqueo de Scroll del Body (Scroll Lock) ───────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const modalDOM = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          
          {/* Backdrop Translúcido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Tarjeta del Modal (Mobile-First Slide-up) */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-[var(--color-border)] pointer-events-auto"
            style={{ willChange: 'transform' }}
          >
            {/* Cabecera (Header) */}
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] shrink-0">
                <div className="flex items-center gap-3">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors active:scale-90"
                      aria-label="Volver"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  {Icon && (
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shrink-0">
                      <Icon size={20} className="animate-pulse" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-[var(--color-text)] text-base leading-none">{title}</h3>
                    {subtitle && <div className="text-xs text-[var(--color-text-muted)] mt-1 leading-none">{subtitle}</div>}
                  </div>
                </div>
                
                {/* Botón X de Cerrar */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-all active:scale-90 cursor-pointer"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Cuerpo Desplazable (Body) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-[var(--color-text)]">
              {children}
            </div>

            {/* Pie de Página */}
            {footerActions && (
              <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 flex gap-3">
                {footerActions}
              </div>
            )}
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalDOM, document.body);
}
```

---

## 5. Origen
* **Extraído de:** `src/components/common/ModalTemplate.jsx`
* **Fecha de extracción:** 2026-06-06
* **Versión:** 1.0 (Refactorizado con HSL variables).
