import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Modal — Ventana modal premium animada y accesible mediante React Portals.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  showCloseButton = true
}) {
  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevenir scroll en el fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop con desenfoque de fondo glassmorphic */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Caja del Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`relative bg-surface border border-app rounded-2xl w-full ${maxWidth} shadow-xl overflow-hidden z-10 flex flex-col`}
            style={{ color: 'var(--color-text)', borderRadius: 'var(--radius-base)' }}
          >
            {/* Cabecera */}
            <div className="h-16 px-6 border-b border-app flex items-center justify-between bg-surface-2/40 shrink-0">
              <h2 className="font-bold text-sm text-app truncate">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-surface hover:bg-surface-2 border border-app flex items-center justify-center text-muted transition-colors cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
