import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Package, CreditCard, Sparkles, ChevronRight, Info, Edit2, Download, CheckCircle, Smartphone } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useGuidedStore from '../../store/guidedStore'
import useAppConfigStore from '../../store/appConfigStore'
import usePWAInstall from '../../hooks/usePWAInstall'
import { CLIENT_LOGIN_TRUST_MESSAGE } from '../../constants'
import { updateClientProfile } from '../../services/userService'

const EMOJIS = ['😊', '😎', '🦄', '🐶', '🐱', '🦋', '🚀', '🌟', '🍕', '🎉', '👑', '🏀', '⚽', '🎨', '🎸', '🎮']

// Variantes para animación en cascada (Staggered Animation)
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function ClientProfile() {
  const { user, logout, updateClient } = useAuthStore()
  const { isAssistanceMode, enableAssistance, disableAssistance, resetProgress } = useGuidedStore()
  const { guidedModeEnabled, developerPhone, appName, creditsEnabled } = useAppConfigStore()
  const { rawInstallable, handleInstall } = usePWAInstall()
  const navigate = useNavigate()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleUpdateEmoji = async (newEmoji) => {
    updateClient({ emoji: newEmoji })
    if (user?.celular) {
      try {
        await updateClientProfile(user.celular, { emoji: newEmoji })
      } catch (error) {
        console.error("Error al guardar en Firestore:", error)
      }
    }
  }

  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  const isStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleAssistance = () => {
    if (isAssistanceMode) {
      disableAssistance()
    } else {
      resetProgress()
      enableAssistance()
    }
  }

  const handleContactDeveloper = () => {
    const contactPhone = developerPhone || '+573242882751'
    const phone = contactPhone.replace(/\D/g, '')
    const message = encodeURIComponent(`Hola, vi tu contacto en la app *${appName}*. Me interesa cotizar una aplicación para mi propio negocio.`)
    window.open(`https://api.whatsapp.com/send/?phone=${phone}&text=${message}&type=phone_number&app_absent=0`, '_blank')
  }

  return (
    <div className="pb-6">
      {/* Header del Perfil con gradiente fluido y aura de color */}
      <div className={`relative bg-gradient-to-b from-primary/8 via-primary/3 to-transparent pt-10 pb-8 px-4 md:px-8 border-b border-primary/5 ${showEmojiPicker ? 'z-40' : 'z-10'}`}>
        {/* Aura decorativa de fondo */}
        <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-primary/4 blur-3xl pointer-events-none overflow-hidden" />
        
        <div className="max-w-7xl mx-auto flex items-center gap-5 relative z-40">
          {/* Avatar interactivo */}
          <div className="relative z-50">
            <motion.button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-primary-soft flex items-center justify-center shadow-[0_12px_30px_rgba(var(--primary-rgb),0.25)] border-[3px] border-white relative group shrink-0 overflow-hidden p-1.5"
            >
              {user?.emoji ? (
                <span className="text-4xl filter drop-shadow-md select-none">{user.emoji}</span>
              ) : (
                <User size={32} className="text-white" />
              )}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-surface rounded-lg border-2 border-white flex items-center justify-center text-primary shadow-md group-hover:scale-110 transition-transform z-10 pointer-events-none">
                <Edit2 size={12} />
              </div>
            </motion.button>

            {/* Selector de Emojis Rediseñado */}
            <AnimatePresence>
              {showEmojiPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: -12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="absolute top-24 left-0 bg-surface border border-app rounded-2xl shadow-xl p-3.5 z-50 w-[290px]"
                  >
                    <div className="flex justify-between items-center mb-2 px-1">
                      <p className="text-xs font-bold text-app">Elige tu avatar:</p>
                      {user?.emoji && (
                        <button 
                          onClick={() => { handleUpdateEmoji(null); setShowEmojiPicker(false) }} 
                          className="text-[10px] font-bold text-red-500 hover:underline"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2.5">
                      {EMOJIS.map(e => (
                        <button 
                          key={e} 
                          onClick={() => { handleUpdateEmoji(e); setShowEmojiPicker(false) }}
                          className={`text-2xl hover:bg-surface-2 rounded-xl p-2 transition-all active:scale-90 flex items-center justify-center border border-transparent ${
                            user?.emoji === e ? 'bg-primary/10 border-primary/20 scale-105' : ''
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div>
            <h1 className="text-2xl font-black text-app leading-tight tracking-tight">{user?.nombre || 'Usuario'}</h1>
            <p className="text-xs text-muted font-bold tracking-wide mt-1 bg-surface/50 border border-app px-2 py-0.5 rounded-md inline-block">
              Cel: {user?.celular}
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor Principal con animación en cascada */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 md:px-8 -mt-5 space-y-4 relative z-20"
      >
        
        {/* ─── TARJETAS PRINCIPALES CON MICRO-RESÚMENES ─────────────────── */}
        <motion.div variants={itemVariants} className="bg-surface rounded-2xl p-2 border border-app shadow-sm">
          <Link to="/tienda/pedidos" className="flex items-center justify-between px-3 py-3 hover:bg-surface-2 rounded-xl transition-all group active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface border border-app text-app flex items-center justify-center group-hover:border-primary/30 group-hover:text-primary transition-all">
                <Package size={20} />
              </div>
              <div>
                <span className="font-bold text-sm text-app block">Mis Pedidos</span>
                <span className="text-[10px] text-muted font-medium">Ver historial y estados de entrega</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">Historial</span>
              <ChevronRight size={18} className="text-muted group-hover:text-primary transition-all group-hover:translate-x-0.5" />
            </div>
          </Link>
          
          {creditsEnabled && (
            <>
              <div className="h-[0.5px] bg-app/50 mx-2" />
              <Link to="/tienda/creditos" className="flex items-center justify-between px-3 py-3 hover:bg-surface-2 rounded-xl transition-all group active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-app text-app flex items-center justify-center group-hover:border-primary/30 group-hover:text-primary transition-all">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-app block">Mis Créditos</span>
                    <span className="text-[10px] text-muted font-medium">Consultar cupo y deudas pendientes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-green-600 bg-green-500/5 px-2 py-0.5 rounded-full">Consultar</span>
                  <ChevronRight size={18} className="text-muted group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                </div>
              </Link>
            </>
          )}
        </motion.div>

        {/* ─── DESCARGAR APLICACIÓN ─────────────────────────────────────── */}
        {!isStandalone && (rawInstallable || isIOS) && (
          <motion.div variants={itemVariants} className="bg-surface rounded-2xl p-4 border border-app shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Download size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-app text-sm leading-tight">Instalar Aplicación</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Descarga la app en tu pantalla de inicio para un acceso rápido y una mejor experiencia.
                </p>
              </div>
            </div>
            {rawInstallable ? (
              <button
                onClick={handleInstall}
                className="w-full h-11 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2"
                style={{ borderRadius: 'var(--radius-base)' }}
              >
                <Download size={16} />
                Descargar ahora
              </button>
            ) : isIOS ? (
              <div className="text-xs text-muted bg-surface-2 p-3.5 rounded-2xl border border-app leading-relaxed">
                📱 En tu iPhone/iPad: pulsa el botón de <strong>Compartir</strong> <span className="text-primary font-bold">↑</span> en la barra inferior de Safari y luego selecciona <strong>"Agregar a la pantalla de inicio"</strong>.
              </div>
            ) : null}
          </motion.div>
        )}

        {isStandalone && (
          <motion.div variants={itemVariants} className="bg-surface rounded-2xl p-4 border border-app shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle size={16} />
            </div>
            <span className="text-xs font-bold text-app">Aplicación instalada y lista en tu dispositivo</span>
          </motion.div>
        )}

        {/* ─── MODO ASISTENCIA ─────────────────────────────────────────── */}
        {guidedModeEnabled && (
          <motion.div variants={itemVariants} className="bg-surface rounded-2xl p-4 border border-app shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-app text-sm leading-tight">Asistencia de Compra</h3>
                  <p className="text-xs text-muted mt-1 max-w-[200px]">
                    Muestra mensajes emergentes para guiarte paso a paso.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button 
                onClick={toggleAssistance}
                className={`w-14 h-8 rounded-full flex items-center px-1 transition-colors duration-300 shrink-0 ${isAssistanceMode ? 'bg-primary' : 'bg-surface-2 border border-app'}`}
              >
                <motion.div 
                  layout
                  className={`w-6 h-6 rounded-full bg-white shadow-sm ${!isAssistanceMode && 'bg-muted'}`}
                  initial={false}
                  animate={{ x: isAssistanceMode ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </motion.div>
        )}

        {/* Banner Cotización Premium (Glassmorphism + Shimmer) */}
        {(developerPhone || true) && (
          <motion.div 
            variants={itemVariants} 
            className="relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-md border border-primary/20 p-4 shadow-sm"
          >
            {/* Gradiente animado de fondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-shimmer-infinite pointer-events-none" />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-app text-sm leading-tight">¿Quieres una app para tu negocio?</h3>
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">PRO</span>
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Creamos aplicaciones móviles y herramientas digitales personalizadas para ayudarte a vender y organizar tu negocio de forma inteligente.
                </p>
                <button
                  onClick={handleContactDeveloper}
                  className="mt-3 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  style={{ borderRadius: 'var(--radius-base)' }}
                >
                  <Smartphone size={14} />
                  Cotizar mi Aplicación
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── CONFIANZA Y SALIDA ──────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="bg-primary/4 rounded-2xl p-4 flex gap-3 border border-primary/5">
          <Info size={20} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-app/80 leading-relaxed font-medium">
            {CLIENT_LOGIN_TRUST_MESSAGE}
          </p>
        </motion.div>

        <motion.button
          variants={itemVariants}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-500/10 transition-all active:scale-95"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </motion.button>

      </motion.div>
    </div>
  )
}
