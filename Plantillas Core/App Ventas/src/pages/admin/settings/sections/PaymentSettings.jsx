import { AlertTriangle, Lock, ChevronDown } from 'lucide-react'
import { updateAppConfig } from '../../../../services/appConfigService'

export default function PaymentSettings({ 
  formData, 
  setFormData, 
  config, 
  setSaveMessage, 
  isSaving,
  setIsSaving,
  setCriticalConfirmText,
  setCriticalConfirmModal
}) {

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateAppConfig({
        bankInfo: formData.bankInfo,
        bankInfo2: formData.bankInfo2
      })
      config.setConfig({
        bankInfo: formData.bankInfo,
        bankInfo2: formData.bankInfo2
      })
      setSaveMessage({ type: 'success', text: 'Datos de pago actualizados correctamente.' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (e) {
      console.error(e)
      setSaveMessage({ type: 'error', text: 'Error al actualizar los datos de pago.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-surface rounded-3xl shadow-sm overflow-hidden text-left">
      <div className="p-5 sm:p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-app text-sm uppercase tracking-wider">Cuentas Bancarias para Transferencia</h3>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">El cliente elige</span>
          </div>

          {/* ── Cuenta Principal ── */}
          <div className="rounded-2xl border border-app bg-surface-2/50 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-surface-2 border-b border-app">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-black">1</span>
              </div>
              <div>
                <p className="text-xs font-black text-app">Cuenta Principal</p>
                <p className="text-[10px] text-muted">Siempre visible para el cliente</p>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-muted mb-1.5">Entidad Bancaria</label>
                <input type="text" value={formData.bankInfo.banco}
                  onChange={(e) => setFormData({ ...formData, bankInfo: { ...formData.bankInfo, banco: e.target.value } })}
                  placeholder="Ingresa el nombre del banco o billetera"
                  className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-app focus:outline-none focus:border-primary transition-colors bg-transparent text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-1.5">Tipo de Cuenta</label>
                <div className="relative">
                  <select value={formData.bankInfo.tipoCuenta}
                    onChange={(e) => setFormData({ ...formData, bankInfo: { ...formData.bankInfo, tipoCuenta: e.target.value } })}
                    className="w-full h-11 pl-4 pr-10 rounded-xl bg-surface border border-app text-app focus:outline-none focus:border-primary transition-colors appearance-none bg-transparent text-sm"
                    style={{ borderRadius: 'var(--radius-base)' }}>
                    <option value="ahorros">Ahorros</option>
                    <option value="corriente">Corriente</option>
                    <option value="digital">Billetera Digital</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted mb-1.5">Número de Cuenta</label>
                <input type="text" value={formData.bankInfo.numeroCuenta}
                  onChange={(e) => setFormData({ ...formData, bankInfo: { ...formData.bankInfo, numeroCuenta: e.target.value } })}
                  placeholder="Ingresa el número de la cuenta bancaria"
                  className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-app focus:outline-none focus:border-primary transition-colors font-mono bg-transparent text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-1.5">Titular</label>
                <input type="text" value={formData.bankInfo.titular}
                  onChange={(e) => setFormData({ ...formData, bankInfo: { ...formData.bankInfo, titular: e.target.value } })}
                  placeholder="Ingresa el nombre del titular de la cuenta"
                  className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-app focus:outline-none focus:border-primary transition-colors bg-transparent text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-1.5">Cédula / NIT (Opcional)</label>
                <input type="text" value={formData.bankInfo.cedulaNit}
                  onChange={(e) => setFormData({ ...formData, bankInfo: { ...formData.bankInfo, cedulaNit: e.target.value } })}
                  placeholder="Ingresa el documento de identidad del titular"
                  className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-app focus:outline-none focus:border-primary transition-colors bg-transparent text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted mb-1.5">URL del Código QR de Pago</label>
                <input type="text" value={formData.bankInfo.qrUrl || ''}
                  onChange={(e) => setFormData({ ...formData, bankInfo: { ...formData.bankInfo, qrUrl: e.target.value } })}
                  placeholder="Ingresa el enlace del código QR de pago"
                  className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-app focus:outline-none focus:border-primary transition-colors bg-transparent text-sm" />
              </div>
            </div>
          </div>

          {/* ── Cuenta Secundaria ── */}
          <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${formData.bankInfo2.activa ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-dashed border-app bg-surface-2/30'}`}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-app/50 bg-surface-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${formData.bankInfo2.activa ? 'bg-emerald-500 font-bold text-white' : 'bg-app/30'}`}>
                <span className="text-white text-xs font-black">2</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-app">Cuenta Secundaria</p>
                <p className="text-[10px] text-muted">El cliente podrá elegir entre las dos cuentas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer"
                  checked={formData.bankInfo2.activa}
                  onChange={(e) => setFormData({ ...formData, bankInfo2: { ...formData.bankInfo2, activa: e.target.checked } })} />
                <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
              </label>
            </div>
            {formData.bankInfo2.activa && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Entidad Bancaria</label>
                  <input type="text" value={formData.bankInfo2.banco}
                    onChange={(e) => setFormData({ ...formData, bankInfo2: { ...formData.bankInfo2, banco: e.target.value } })}
                    placeholder="Ingresa el nombre del banco o billetera"
                    className="w-full h-11 px-4 rounded-xl bg-surface border border-emerald-500/30 text-app focus:outline-none focus:border-emerald-500 transition-colors bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Tipo de Cuenta</label>
                  <div className="relative">
                    <select value={formData.bankInfo2.tipoCuenta}
                      onChange={(e) => setFormData({ ...formData, bankInfo2: { ...formData.bankInfo2, tipoCuenta: e.target.value } })}
                      className="w-full h-11 pl-4 pr-10 rounded-xl bg-surface border border-emerald-500/30 text-app focus:outline-none focus:border-emerald-500 transition-colors appearance-none bg-transparent text-sm"
                      style={{ borderRadius: 'var(--radius-base)' }}>
                      <option value="ahorros">Ahorros</option>
                      <option value="corriente">Corriente</option>
                      <option value="digital">Billetera Digital</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1.5">Número de Cuenta</label>
                  <input type="text" value={formData.bankInfo2.numeroCuenta}
                    onChange={(e) => setFormData({ ...formData, bankInfo2: { ...formData.bankInfo2, numeroCuenta: e.target.value } })}
                    placeholder="Ingresa el número de la cuenta bancaria"
                    className="w-full h-11 px-4 rounded-xl bg-surface border border-emerald-500/30 text-app focus:outline-none focus:border-emerald-500 transition-colors font-mono bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Titular</label>
                  <input type="text" value={formData.bankInfo2.titular}
                    onChange={(e) => setFormData({ ...formData, bankInfo2: { ...formData.bankInfo2, titular: e.target.value } })}
                    placeholder="Ingresa el nombre del titular de la cuenta"
                    className="w-full h-11 px-4 rounded-xl bg-surface border border-emerald-500/30 text-app focus:outline-none focus:border-emerald-500 transition-colors bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">Cédula / NIT (Opcional)</label>
                  <input type="text" value={formData.bankInfo2.cedulaNit}
                    onChange={(e) => setFormData({ ...formData, bankInfo2: { ...formData.bankInfo2, cedulaNit: e.target.value } })}
                    placeholder="Ingresa el documento de identidad del titular"
                    className="w-full h-11 px-4 rounded-xl bg-surface border border-emerald-500/30 text-app focus:outline-none focus:border-emerald-500 transition-colors bg-transparent text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1.5">URL del Código QR de Pago</label>
                  <input type="text" value={formData.bankInfo2.qrUrl || ''}
                    onChange={(e) => setFormData({ ...formData, bankInfo2: { ...formData.bankInfo2, qrUrl: e.target.value } })}
                    placeholder="Ingresa el enlace del código QR de pago"
                    className="w-full h-11 px-4 rounded-xl bg-surface border border-emerald-500/30 text-app focus:outline-none focus:border-emerald-500 transition-colors bg-transparent text-sm" />
                </div>
              </div>
            )}
            {!formData.bankInfo2.activa && (
              <div className="px-4 py-5 text-center">
                <p className="text-xs text-muted">Activa el toggle para agregar una segunda cuenta bancaria</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6 border-t border-app bg-surface-2/30 space-y-3">
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-500/90 leading-relaxed">
            <strong>Dato crítico:</strong> La cuenta bancaria es visible para tus clientes en el checkout. Verifica la información antes de guardar.
          </p>
        </div>
        <button onClick={() => {
          setCriticalConfirmText('')
          setCriticalConfirmModal({
            title: '⚠️ Cambio en Datos de Pago',
            desc: 'Estás a punto de modificar la cuenta bancaria. Tus clientes usarán estos datos para realizar transferencias. Un dato incorrecto puede causar pérdidas.\n\nEscribe CONFIRMAR para continuar.',
            onConfirm: handleSave
          })
        }} disabled={isSaving}
          className="w-full min-h-[52px] py-3 px-6 bg-amber-500 text-white rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 hover:opacity-90 flex items-center justify-center gap-3 shadow-lg shadow-amber-500/30 disabled:opacity-50 cursor-pointer border-none">
          {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Lock size={18} className="shrink-0" /> Guardar Datos Críticos</>}
        </button>
      </div>
    </div>
  )
}
