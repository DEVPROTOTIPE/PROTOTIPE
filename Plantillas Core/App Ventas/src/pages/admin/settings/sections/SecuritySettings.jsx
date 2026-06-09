import { useState } from 'react'
import { KeyRound, Mail, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Save } from 'lucide-react'
import { updateAdminCredentials } from '../../../../services/authService'
import { auth } from '../../../../config/firebaseConfig'

export default function SecuritySettings({ setSaveMessage }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState(null)

  const handleUpdateCredentials = async (e) => {
    e.preventDefault()
    if (!currentPassword) {
      setAuthMessage({ type: 'error', text: 'Debes ingresar tu contraseña actual por seguridad.' })
      return
    }
    if (!newEmail && !newPassword) {
      setAuthMessage({ type: 'error', text: 'Ingresa un nuevo correo o contraseña para actualizar.' })
      return
    }

    setAuthLoading(true)
    setAuthMessage(null)

    try {
      await updateAdminCredentials({ currentPassword, newEmail, newPassword })
      setAuthMessage({ type: 'success', text: 'Credenciales actualizadas exitosamente.' })
      setCurrentPassword('')
      setNewEmail('')
      setNewPassword('')
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthMessage({ type: 'error', text: 'La contraseña actual es incorrecta.' })
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthMessage({ type: 'error', text: 'El nuevo correo ya está registrado.' })
      } else if (err.code === 'auth/invalid-email') {
        setAuthMessage({ type: 'error', text: 'El formato del nuevo correo es inválido.' })
      } else {
        setAuthMessage({ type: 'error', text: err.message || 'Error al actualizar credenciales.' })
      }
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="bg-surface rounded-3xl shadow-sm overflow-hidden text-left">
      <div className="p-5 md:p-6 bg-surface-2">
        <div className="bg-surface border border-orange-500/20 rounded-2xl p-5 md:p-6">
          <form onSubmit={handleUpdateCredentials} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-app mb-2 flex items-center gap-2">
                <KeyRound size={16} className="text-orange-500" />
                Contraseña Actual (Requerida por seguridad)
              </label>
              <div className="relative">
                <input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Tu contraseña actual"
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-orange-500 transition-colors bg-transparent text-sm" />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-app bg-transparent border-none cursor-pointer">
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="border-t border-app"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-app mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-primary" /> Nuevo Correo (Opcional)
                </label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={auth.currentUser?.email || "correo@ejemplo.com"}
                  className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors bg-transparent text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-app mb-2 flex items-center gap-2">
                  <Lock size={16} className="text-primary" /> Nueva Contraseña (Opcional)
                </label>
                <div className="relative">
                  <input type={showNewPassword ? 'text' : 'password'} value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors bg-transparent text-sm" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-app bg-transparent border-none cursor-pointer">
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            {authMessage && (
              <div className={`p-4 rounded-xl flex items-start gap-3 border ${authMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                {authMessage.type === 'error' ? <AlertTriangle size={20} className="shrink-0" /> : <CheckCircle size={20} className="shrink-0" />}
                <p className="text-sm font-bold mt-0.5">{authMessage.text}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={authLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer border-none shadow-sm">
                {authLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> Actualizar Credenciales</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
