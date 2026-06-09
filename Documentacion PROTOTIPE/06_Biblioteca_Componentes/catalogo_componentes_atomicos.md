# 📂 Catálogo de Componentes Atómicos Reutilizables (UI Base)

**Propósito:** Este catálogo contiene la especificación técnica y el código JSX/Tailwind v4 de los componentes atómicos y modales más utilizados en el ecosistema **PROTOTIPE**. Su objetivo es evitar que las IAs reprogramen interfaces básicas, ahorrando tokens de computación y asegurando un diseño moderno, coherente y mobile-first en todas las aplicaciones creadas (tanto verticales Ecosistema como aplicaciones a medida).

---

## 1. Modal Base Premium (React Portals & Scroll Lock)

Este componente se encarga de proyectar una ventana modal fuera del árbol del DOM local (inyectándola en el `body`) para evitar problemas visuales de apilamiento (`z-index`) y asegurar que el scroll de la página de fondo quede bloqueado al abrirse.

```jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function ModalBase({ isOpen, onClose, title, children }) {
  // Efecto para bloquear el scroll del cuerpo de la página
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Fondo del modal con desenfoque elegante */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Caja de contenido del modal */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-surface border border-app rounded-3xl p-6 shadow-2xl relative max-w-md w-full overflow-hidden z-10"
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between border-b border-app pb-3 mb-4">
            <h3 className="text-sm font-black text-slate-800 tracking-tight">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all active:scale-95 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          {/* Cuerpo */}
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
```

---

## 2. Alerta Toast Flotante Interactiva

Notificación contextual de estado que aparece temporalmente en la pantalla para dar retroalimentación al usuario.

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
          <div className={`p-4 rounded-2xl border shadow-lg flex items-center gap-3 bg-white/95 backdrop-blur-md ${
            type === 'success' ? 'border-emerald-500/20 text-emerald-600' : 'border-rose-500/20 text-rose-600'
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

---

## 3. Selector Desplegable Premium (CustomSelect)

Selector dropdown optimizado para móviles con overlay de tap-shield para un comportamiento fluido y estética de marca blanca HSL.

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CustomSelect({ value, onChange, options = [], placeholder = 'Seleccionar...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Botón del selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-app text-sm font-bold text-slate-800 flex items-center justify-between transition-colors focus:outline-none focus:border-primary active:scale-[0.99] cursor-pointer"
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400 font-medium'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {/* Lista Desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 z-30 max-h-56 overflow-y-auto bg-white border border-app rounded-2xl shadow-xl p-1.5"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full h-10 px-3.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
                  opt.value === value
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 6 9 17l-5-5"/></svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```
