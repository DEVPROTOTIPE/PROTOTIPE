import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccordionInteractiveFilter({
  title = 'Filtro',
  children,
  defaultOpen = false,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-all duration-200
      ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    `}>
      {/* Cabecera del Accordion */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left font-semibold text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/60 transition-colors outline-none select-none"
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-xs text-[var(--color-text-muted)]"
        >
          ▼
        </motion.span>
      </button>

      {/* Contenido Expandible */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24
            }}
            className="overflow-hidden"
          >
            {/* Margen de seguridad interior para evitar recorte de elevación de hijos */}
            <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}