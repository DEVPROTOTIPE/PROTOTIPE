import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import AppLoader from '../components/ui/AppLoader'

export default function AppRoutes() {
  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen flex items-center justify-center bg-app p-6">
            <div className="bg-surface rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-app">
              <span className="text-5xl block mb-4">🚀</span>
              <h1 className="text-2xl font-black text-app mb-2">¡Proyecto Aprovisionado!</h1>
              <p className="text-muted text-sm mb-6">
                Este es un lienzo limpio de Prototipe. La IA del proyecto está lista para construir las pantallas y componentes a partir de aquí.
              </p>
              <div className="text-xs text-muted/60 font-mono bg-surface-2 p-3 rounded-lg border border-app">
                src/App.jsx | src/routes/AppRoutes.jsx
              </div>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
