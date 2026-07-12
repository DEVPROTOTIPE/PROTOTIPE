import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, ChevronRight } from 'lucide-react'
import useAppConfigStore from '../store/appConfigStore'
import useAuthStore from '../store/authStore'
import { ROLES } from '../constants'

/**
 * WelcomePage — Pantalla de bienvenida premium.
 * Incluye ondas sonar radiales, logo flotante animado y patrón SVG adaptado.
 */
export default function WelcomePage() {
  const navigate = useNavigate()
  const { role, isLoading } = useAuthStore()
  const { appName, appIcon, primaryColor, welcomeWavesEnabled, slogan, isLoaded } = useAppConfigStore()

  // Leer color primario real desde las variables CSS del DOM
  const patternColor = useMemo(() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary').trim()
    return raw || '#6d28d9'
  }, [primaryColor])

  // Construir SVG del patrón geométrico neutro de puntos con el color real
  const patternSvg = useMemo(() => {
    const c = encodeURIComponent(patternColor)
    return `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='${c}' opacity='0.4'/%3E%3C/svg%3E")`
  }, [patternColor])

  // Redirección si ya hay sesión activa
  useEffect(() => {
    if (!isLoading) {
      if (role === ROLES.ADMIN) navigate('/admin', { replace: true })
    }
  }, [role, isLoading, navigate])

  if (isLoading || !isLoaded) return null

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Fondo: orbes + patrón */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full bg-primary/5 blur-[80px]" />

        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: patternSvg,
            backgroundSize: '160px 160px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">

        {/* Logo Premium */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, type: 'spring', bounce: 0.45 }}
          className="mb-10 relative flex items-center justify-center"
        >
          <motion.div
            animate={{ opacity: [0.3, 0.65, 0.3], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[21.25rem] h-[21.25rem] rounded-full bg-primary/20 blur-3xl"
          />

          <div className="relative w-[21.25rem] h-[21.25rem] rounded-full overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/5" />

            {(welcomeWavesEnabled !== false) && [0, 1.2, 2.4].map((delay, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [0.3, 1.05],
                  opacity: [0, 0.35, 0]
                }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay,
                }}
                className="absolute inset-0 rounded-full bg-primary"
              />
            ))}

            <div className="relative w-[240px] h-[240px] z-10 flex items-center justify-center">
              {appIcon ? (
                <motion.img
                  src={appIcon}
                  alt={`Logo de ${appName}`}
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-full object-contain"
                  style={{
                    filter: 'drop-shadow(0 16px 28px color-mix(in srgb, var(--color-primary) 45%, transparent))'
                  }}
                />
              ) : (
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-48 h-48 rounded-[4rem] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl animate-all"
                >
                  <Globe size={96} className="text-white drop-shadow-lg" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Nombre y eslogan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {!appIcon && (
            <h1 className="text-4xl md:text-5xl font-black text-app tracking-tight mb-3">
              {appName}
            </h1>
          )}

          {appIcon && (
            <h2 className="text-xl md:text-2xl font-black text-primary tracking-wide uppercase mb-3 leading-tight">
              {slogan || 'Ecosistema Premium'}
            </h2>
          )}

          <p className="text-base text-muted mb-8 max-w-xs mx-auto leading-relaxed">
            Plataforma base autogestionable y lista para producción.
          </p>
        </motion.div>

        {/* Botón Comencemos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="w-full"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            className="group w-full md:w-auto md:min-w-[260px] flex items-center justify-center gap-3 bg-primary text-white py-4 px-8 font-bold text-lg rounded-2xl mx-auto transition-all cursor-pointer border-none"
            style={{
              boxShadow: '0 8px 30px color-mix(in srgb, var(--color-primary) 35%, transparent)'
            }}
          >
            <span>Comencemos</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
