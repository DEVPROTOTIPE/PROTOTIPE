import React from 'react'

/**
 * Button — Componente atómico de botón premium adaptativo.
 * Aplica de forma automática el radio de bordes de la marca.
 */
export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'h-11 px-6 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-none select-none disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90 shadow-md shadow-primary/10',
    secondary: 'bg-surface-2 text-app hover:bg-surface-3 border border-app',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/15',
    ghost: 'bg-transparent text-muted hover:bg-surface-2 hover:text-app'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      style={{ borderRadius: 'var(--radius-base)' }}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}
