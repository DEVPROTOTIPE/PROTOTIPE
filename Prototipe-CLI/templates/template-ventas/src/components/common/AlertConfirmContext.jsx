import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import ModalTemplate from './ModalTemplate'
import { register } from '../../services/alertService'

const AlertConfirmContext = createContext(null)

export function AlertConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    resolve: null,
    variant: 'info'
  })

  const showAlert = useCallback(({ title = 'Atención', message = '', variant = 'info', confirmText = 'Aceptar' }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'alert',
        title,
        message,
        confirmText,
        cancelText: '',
        resolve,
        variant
      })
    })
  }, [])

  const showConfirm = useCallback(({ 
    title = 'Confirmar acción', 
    message = '¿Estás seguro de realizar esta acción?', 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar',
    variant = 'warning'
  }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        resolve,
        variant
      })
    })
  }, [])

  // Registrar en el singleton imperativo para uso fuera del árbol React
  useEffect(() => {
    register(showAlert, showConfirm)
  }, [showAlert, showConfirm])

  const handleClose = (result) => {
    const { resolve } = modalState
    setModalState((prev) => ({ ...prev, isOpen: false }))
    if (resolve) resolve(result)
  }

  const getHeaderIcon = () => {
    const baseClass = "w-12 h-12 rounded-2xl flex items-center justify-center border mx-auto mb-4"
    switch (modalState.variant) {
      case 'success':
        return (
          <div className={`${baseClass} bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800`}>
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className={`${baseClass} bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800`}>
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className={`${baseClass} bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800`}>
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'info':
      default:
        return (
          <div className={`${baseClass} bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800`}>
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  return (
    <AlertConfirmContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <ModalTemplate isOpen={modalState.isOpen} onClose={() => handleClose(false)} title={null}>
        <div className="text-center py-2">
          {getHeaderIcon()}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{modalState.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap leading-relaxed max-w-sm mx-auto">{modalState.message}</p>
          <div className="flex gap-3 mt-6">
            {modalState.type === 'confirm' && (
              <button
                onClick={() => handleClose(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-primary-soft bg-surface hover:bg-surface-2 text-app font-bold text-sm transition-all active:scale-95 cursor-pointer"
                style={{ borderRadius: 'var(--radius-base)' }}
              >
                {modalState.cancelText}
              </button>
            )}
            <button
              onClick={() => handleClose(true)}
              className={`flex-1 py-3 px-4 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer ${
                modalState.variant === 'error'
                  ? 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/10'
                  : modalState.variant === 'warning'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/10'
                    : 'bg-primary hover:opacity-95 shadow-md shadow-primary/10'
              }`}
              style={{ borderRadius: 'var(--radius-base)' }}
            >
              {modalState.confirmText}
            </button>
          </div>
        </div>
      </ModalTemplate>
    </AlertConfirmContext.Provider>
  )
}

export function useAlertConfirm() {
  const context = useContext(AlertConfirmContext)
  if (!context) throw new Error('useAlertConfirm debe ser usado dentro de un AlertConfirmProvider')
  return context
}
