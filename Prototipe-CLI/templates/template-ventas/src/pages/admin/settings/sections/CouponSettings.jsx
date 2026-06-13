import { Plus, X, Save, Trash2, AlertTriangle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'

const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function CustomDatePicker({ value, onChange, placeholder="Elige una fecha del calendario" }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  const today = new Date()
  const selected = value ? new Date(value + 'T12:00:00') : null

  const [viewYear, setViewYear] = useState(selected ? selected.getFullYear() : today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected ? selected.getMonth() : today.getMonth())

  const display = selected
    ? `${String(selected.getDate()).padStart(2,'0')}/${String(selected.getMonth()+1).padStart(2,'0')}/${selected.getFullYear()}`
    : ''

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectDay = (d) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    onChange({ target: { value: `${viewYear}-${mm}-${dd}` } })
    setOpen(false)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isSelected = (d) => selected &&
    selected.getDate() === d && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear
  const isToday = (d) =>
    today.getDate() === d && today.getMonth() === viewMonth && today.getFullYear() === viewYear

  return (
    <div className="relative w-full">
      <div
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app flex items-center justify-between cursor-pointer"
      >
        <span>{display || placeholder}</span>
      </div>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[9998] bg-black/30"
          />
          <div
            className="fixed inset-0 flex items-center justify-center z-[9999]"
          >
            <div className="bg-surface rounded-2xl border border-app shadow-2xl p-4 w-72 max-w-full">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={prevMonth} className="p-1 rounded bg-surface-2 hover:bg-surface-3 text-app cursor-pointer border-0">◀</button>
                <span className="text-xs font-bold text-app uppercase">{MONTHS_ES[viewMonth]} {viewYear}</span>
                <button type="button" onClick={nextMonth} className="p-1 rounded bg-surface-2 hover:bg-surface-3 text-app cursor-pointer border-0">▶</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted mb-1">
                {DAYS_ES.map(d => <span key={d}>{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, idx) => {
                  if (day === null) return <span key={`empty-${idx}`} />
                  const sel = isSelected(day)
                  const tod = isToday(day)
                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => selectDay(day)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer border-0 ${
                        sel ? 'bg-primary text-white' : tod ? 'bg-primary/20 text-primary' : 'bg-surface-2 hover:bg-surface-3 text-app'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function CouponSettings({
  couponsEnabled,
  isLoadingCoupons,
  coupons,
  couponUsageMap,
  showCouponForm,
  setShowCouponForm,
  editingCouponId,
  setEditingCouponId,
  couponFormData,
  setCouponFormData,
  couponToDelete,
  setCouponToDelete,
  updateCouponMutation,
  deleteCouponMutation,
  handleSaveCoupon,
  showAlert,
  formatCurrency
}) {
  if (!couponsEnabled) return null

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-3xl border border-app shadow-sm p-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/10">
              Fidelización de Clientes
            </span>
            <h3 className="text-lg font-bold text-app mt-1">Cupones de Descuento</h3>
            <p className="text-xs text-muted">Crea incentivos de compra y cupones de descuento para tus clientes</p>
          </div>
          <button
            onClick={() => {
              setEditingCouponId(null)
              setCouponFormData({
                code: '',
                type: 'percentage',
                value: '',
                minPurchase: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
                active: true
              })
              setShowCouponForm(true)
            }}
            className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer border-0"
          >
            <Plus size={16} />
            Nuevo Cupón
          </button>
        </div>

        {/* Listado de Cupones */}
        {isLoadingCoupons ? (
          <div className="text-center py-10 text-muted">Cargando cupones...</div>
        ) : coupons.length === 0 ? (
          <div className="py-12 text-center bg-surface-2 rounded-2xl border border-dashed border-app">
            <p className="text-3xl mb-2">🎫</p>
            <p className="text-xs text-muted font-medium">No has creado cupones de descuento aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map(coupon => {
              const today = new Date().toISOString().split('T')[0]
              const isExpired = today > coupon.endDate
              const isCouponActive = coupon.active && !isExpired
              const usageCount = couponUsageMap[coupon.code.toUpperCase()] || 0

              return (
                <div 
                  key={coupon.id}
                  className="bg-surface-2 border border-app rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between"
                  style={{ borderLeftWidth: '4px', borderLeftColor: isCouponActive ? 'var(--color-primary)' : 'var(--color-border)' }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-app tracking-wide bg-surface border border-app px-2 py-0.5 rounded-lg">
                          {coupon.code}
                        </span>
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10 shrink-0">
                          {usageCount === 1 ? 'Usado 1 vez' : `Usado ${usageCount} veces`}
                        </span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                        isCouponActive 
                          ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                          : isExpired 
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-surface border-app text-muted'
                      }`}>
                        {isCouponActive ? 'Activo' : isExpired ? 'Expirado' : 'Inactivo'}
                      </span>
                    </div>

                    <p className="text-sm font-black text-app">
                      Descuento: <span className="text-primary">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toLocaleString()}`}
                      </span>
                    </p>
                    
                    {coupon.minPurchase > 0 && (
                      <p className="text-[11px] text-muted mt-0.5">
                        Compra mínima: <strong className="text-app">{formatCurrency(coupon.minPurchase)}</strong>
                      </p>
                    )}
                    
                    <p className="text-[11px] text-muted mt-1">
                      Vigencia: {coupon.startDate} al {coupon.endDate}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4.5 border-t border-app pt-3.5">
                    <button
                      onClick={() => {
                        if (!coupon.active) {
                          if (today > coupon.endDate) {
                            showAlert({ title: 'Cupón expirado', message: 'Este cupón está expirado. Modifica la fecha de fin si deseas activarlo.', variant: 'warning' })
                            return
                          }
                        }
                        updateCouponMutation.mutate({ id: coupon.id, data: { active: !coupon.active } })
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        coupon.active
                          ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20'
                          : 'bg-surface border-app text-muted hover:bg-surface-2'
                      }`}
                    >
                      {coupon.active ? 'Desactivar' : 'Activar'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingCouponId(coupon.id)
                          setCouponFormData({
                            code: coupon.code,
                            type: coupon.type,
                            value: coupon.value,
                            minPurchase: coupon.minPurchase || '',
                            startDate: coupon.startDate,
                            endDate: coupon.endDate,
                            active: coupon.active
                          })
                          setShowCouponForm(true)
                        }}
                        className="px-2.5 py-1.5 text-xs text-muted hover:text-app bg-surface border border-app rounded-lg transition-colors active:scale-95 cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setCouponToDelete(coupon)}
                        className="p-1.5 text-xs text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors active:scale-95 cursor-pointer bg-transparent"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Formulario Modal de Cupón */}
      <AnimatePresence>
        {showCouponForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCouponForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl p-6 border border-app z-10"
            >
              <button
                onClick={() => setShowCouponForm(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-2 border border-app text-muted hover:text-app flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="text-lg font-bold text-app mb-1">
                {editingCouponId ? 'Editar Cupón' : 'Nuevo Cupón de Descuento'}
              </h3>
              <p className="text-xs text-muted mb-5">Configura las opciones y restricciones del cupón</p>

              <div className="space-y-4">
                {/* Código con Autogenerador */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Código del Cupón *</label>
                  <div className="flex flex-row gap-2 max-w-full">
                    <input
                      type="text"
                      value={couponFormData.code}
                      onChange={(e) => setCouponFormData(p => ({ ...p, code: e.target.value.toUpperCase().trim() }))}
                      className="flex-1 min-w-0 h-11 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary text-sm font-bold tracking-wider uppercase"
                      placeholder="Ingresa el código del cupón de descuento"
                      maxLength={15}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                        let randomCode = 'FLASH-'
                        for (let i = 0; i < 5; i++) {
                          randomCode += chars.charAt(Math.floor(Math.random() * chars.length))
                        }
                        setCouponFormData(p => ({ ...p, code: randomCode }))
                      }}
                      className="h-11 px-3 sm:px-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap cursor-pointer"
                      title="Generar código aleatorio"
                    >
                      <Sparkles size={14} /> Generar
                    </button>
                  </div>
                </div>

                {/* Plantillas de Ofertas Rápidas */}
                <div className="p-3 bg-surface-2 rounded-2xl border border-app">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles size={11} className="text-primary" /> Plantillas de Configuración Rápida
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCouponFormData(p => ({
                          ...p,
                          code: 'BIENVENIDA10',
                          type: 'percentage',
                          value: '10',
                          minPurchase: '0'
                        }))
                      }}
                      className="px-2.5 py-1.5 bg-surface hover:bg-primary/5 hover:border-primary/30 border border-app rounded-xl text-[10px] font-bold text-app transition-colors cursor-pointer"
                    >
                      🎁 Bienvenida 10%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponFormData(p => ({
                          ...p,
                          code: 'MEGAPROMO20',
                          type: 'percentage',
                          value: '20',
                          minPurchase: '80000'
                        }))
                      }}
                      className="px-2.5 py-1.5 bg-surface hover:bg-primary/5 hover:border-primary/30 border border-app rounded-xl text-[10px] font-bold text-app transition-colors cursor-pointer"
                    >
                      🔥 Mega Promo 20%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponFormData(p => ({
                          ...p,
                          code: 'DESCUENTAZO',
                          type: 'fixed',
                          value: '15000',
                          minPurchase: '50000'
                        }))
                      }}
                      className="px-2.5 py-1.5 bg-surface hover:bg-primary/5 hover:border-primary/30 border border-app rounded-xl text-[10px] font-bold text-app transition-colors cursor-pointer"
                    >
                      ⚡ Ahorro $15.000
                    </button>
                  </div>
                </div>

                {/* Tipo de Descuento */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Tipo de Descuento *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCouponFormData(p => ({ ...p, type: 'percentage' }))}
                      className={`h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        couponFormData.type === 'percentage'
                          ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                          : 'bg-surface border-app text-app hover:bg-surface-2'
                      }`}
                    >
                      Porcentaje (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCouponFormData(p => ({ ...p, type: 'fixed' }))}
                      className={`h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        couponFormData.type === 'fixed'
                          ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                          : 'bg-surface border-app text-app hover:bg-surface-2'
                      }`}
                    >
                      Monto Fijo ($)
                    </button>
                  </div>
                </div>

                {/* Valor & Compra Mínima */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                      {couponFormData.type === 'percentage' ? 'Porcentaje (%) *' : 'Descuento ($) *'}
                    </label>
                    <input
                      type="number"
                      value={couponFormData.value}
                      onChange={(e) => setCouponFormData(p => ({ ...p, value: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary text-sm font-bold"
                      placeholder={couponFormData.type === 'percentage' ? 'Ej: 10' : 'Ej: 15000'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Compra Mínima ($)</label>
                    <input
                      type="number"
                      value={couponFormData.minPurchase}
                      onChange={(e) => setCouponFormData(p => ({ ...p, minPurchase: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary text-sm font-bold"
                      placeholder="Ingresa información adicional (opcional)"
                    />
                  </div>
                </div>

                {/* Fechas de Vigencia */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Fecha Inicio</label>
                    <CustomDatePicker
                      value={couponFormData.startDate}
                      onChange={(e) => setCouponFormData(p => ({ ...p, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Fecha Fin</label>
                    <CustomDatePicker
                      value={couponFormData.endDate}
                      onChange={(e) => setCouponFormData(p => ({ ...p, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Checkbox de Activo */}
                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="couponActiveCheckbox"
                    checked={couponFormData.active}
                    onChange={(e) => setCouponFormData(p => ({ ...p, active: e.target.checked }))}
                    className="w-4.5 h-4.5 text-primary border-app rounded focus:ring-primary/20 accent-primary"
                  />
                  <label htmlFor="couponActiveCheckbox" className="text-xs font-bold text-app select-none cursor-pointer">
                    Habilitar cupón inmediatamente
                  </label>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCouponForm(false)}
                    className="flex-1 py-3 bg-surface border border-app text-app font-bold text-xs rounded-xl active:scale-95 transition-all hover:bg-surface-2 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCoupon}
                    className="flex-1 py-3 bg-primary text-white font-bold text-xs rounded-xl active:scale-95 transition-all hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer border-0"
                  >
                    <Save size={14} />
                    Guardar Cupón
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Eliminación */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCouponToDelete(null)}
          />
          <div className="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl p-6 border border-app z-10 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertTriangle size={24} />
            </div>
            <h4 className="text-lg font-bold text-app mb-1">¿Eliminar Cupón?</h4>
            <p className="text-xs text-muted mb-6">
              Esta acción es permanente. ¿Seguro de eliminar el cupón <strong>{couponToDelete.code}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCouponToDelete(null)}
                className="flex-1 py-3 bg-surface border border-app text-app font-bold text-xs rounded-xl active:scale-95 transition-all hover:bg-surface-2 cursor-pointer"
              >
                No, Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCouponMutation.mutate(couponToDelete.id)
                  setCouponToDelete(null)
                }}
                className="flex-1 py-3 bg-red-500 text-white font-bold text-xs rounded-xl active:scale-95 transition-all hover:bg-red-600 shadow-lg shadow-red-500/20 cursor-pointer border-0"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
