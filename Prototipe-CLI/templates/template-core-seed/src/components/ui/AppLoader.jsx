import React from 'react'

export default function AppLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-app">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-app border-t-primary animate-spin" />
        <span className="text-2xl animate-pulse">⚡</span>
      </div>
      <p className="mt-4 text-xs font-bold text-muted tracking-widest uppercase animate-pulse">
        Cargando aplicación...
      </p>
    </div>
  )
}
