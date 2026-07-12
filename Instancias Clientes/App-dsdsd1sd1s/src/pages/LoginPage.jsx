import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signInAdmin } from '../services/authService'
import useAuthStore from '../store/authStore'
import useAppConfigStore from '../store/appConfigStore'
import { useToast } from '../components/common/ToastProvider'
import { useAuth } from '../hooks/useAuth'

/**
 * LoginPage — Pantalla de login para administradores de la app.
 * Diseño con glassmorphism y orbes animados.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const { setAdmin } = useAuthStore()
  const { isAuthenticated, isAdmin } = useAuth()
  const { appName, slogan, appIcon, loginTrustMessage } = useAppConfigStore()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, isAdmin, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.warning('Por favor completa todos los campos.')
      return
    }
    setLoading(true)
    try {
      const user = await signInAdmin(email.trim(), password)
      setAdmin(user)
      toast.success('Sesión iniciada con éxito.')
      navigate('/admin', { replace: true })
    } catch (error) {
      console.error(error)
      toast.error('Credenciales incorrectas o error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4 relative overflow-hidden" style={{ color: 'var(--color-text)' }}>
      {/* Orbes de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-surface/85 backdrop-blur-md border border-app rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center animate-all"
      >
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          {appIcon ? (
            <img src={appIcon} alt="Logo" className="w-16 h-16 object-contain mb-4" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg shadow-primary/20">
              P
            </div>
          )}
          <h2 className="text-xl font-black text-app leading-tight">{appName || 'Mi Aplicación'}</h2>
          <p className="text-xs text-muted mt-1">{slogan || 'Inicia sesión para continuar al panel'}</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-app block">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-2 border border-app text-sm focus:outline-none focus:border-primary transition-colors text-app"
                disabled={loading}
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-app block">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-2 border border-app text-sm focus:outline-none focus:border-primary transition-colors text-app"
                disabled={loading}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-app transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] bg-primary text-white font-bold text-sm rounded-xl hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/15 border-none mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Ingresar al Panel'
            )}
          </button>
        </form>

        {/* Mensaje de Confianza */}
        {loginTrustMessage && (
          <p className="text-[10px] text-muted text-center leading-relaxed mt-6 border-t border-app pt-4 w-full">
            {loginTrustMessage}
          </p>
        )}
      </motion.div>
    </div>
  )
}
