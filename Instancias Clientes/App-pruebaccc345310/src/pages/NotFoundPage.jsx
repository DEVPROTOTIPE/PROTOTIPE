import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft } from 'lucide-react'

/**
 * NotFoundPage — Vista de error 404 estándar.
 */
export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ color: 'var(--color-text)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-sm w-full"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="animate-pulse" />
        </div>
        <h1 className="text-7xl font-black text-primary leading-none mb-4">404</h1>
        <h2 className="text-lg font-bold text-app mb-2">Página no encontrada</h2>
        <p className="text-xs text-muted leading-relaxed mb-8">
          La página que estás buscando no existe, ha sido movida o está temporalmente inaccesible.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="h-11 px-6 rounded-xl bg-surface border border-app hover:bg-surface-2 text-app text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto shadow-sm"
        >
          <ArrowLeft size={16} />
          Volver atrás
        </button>
      </motion.div>
    </div>
  )
}
