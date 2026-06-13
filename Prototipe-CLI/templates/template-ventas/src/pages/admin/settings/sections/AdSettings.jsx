import { Plus, X, Save, Paintbrush, Trash2, Megaphone, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CustomSelect from '../../../../components/ui/CustomSelect'

// Let's define the calendar component internally or import CustomDatePicker from where it is.
// Wait! In AdminSettings.jsx, is CustomDatePicker defined locally? Yes, it's defined on lines 41-104!
// But wait! Is CustomDatePicker exported or can we just define a simple picker or use the one from AdminSettings?
// Let's define CustomDatePicker inside a shared place or just define it locally inside the files or import it from a shared component.
// Wait, is there a DatePicker component in src/components/ui/DatePicker.jsx?
// Yes! The map of application says: `* **`/src/components/ui/DatePicker.jsx`**: Componente selector de fecha premium que renderiza el calendario en un portal centered modal con backdrop oscuro translúcido.`
// Let's check D:\PROTOTIPE\Plantillas Core\App Ventas\src\components\ui\DatePicker.jsx!
// Let's see if we can use that instead or define the local CustomDatePicker.
// Let's define the local one to be 100% consistent with the original design in the scratch file. Let's see how CustomDatePicker was defined inside sec_publicidad.jsx or if it was expected to be defined.
// Actually, let's define it inside AdSettings.jsx or pass it as a prop from AdminSettings.jsx.
// Passing it as a prop (or rendering it or defining it locally) is extremely safe. Let's define CustomDatePicker locally inside AdSettings and CouponSettings to avoid any import resolution problems.

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

import { useState, useRef } from 'react'

export default function AdSettings({
  ads,
  isLoadingAds,
  products,
  showAdForm,
  setShowAdForm,
  editingAdId,
  setEditingAdId,
  adFormData,
  setAdFormData,
  adToDelete,
  setAdToDelete,
  updateMutation,
  deleteMutation,
  handleSaveAd,
  showAlert
}) {
  return (
    <div className="space-y-6">
      {/* BOTÓN AGREGAR Y HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Crea y gestiona tus campañas híbridas y de inventario</p>
        </div>
        {!showAdForm && (
          <button
            onClick={() => {
              setEditingAdId(null)
              setAdFormData({
                type: 'inventory',
                active: true,
                productId: '',
                discountType: 'percentage',
                discountValue: 0,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
                customTitle: '',
                customBanner: '',
                glowEffect: false,
                title: '',
                description: '',
                image: '',
                banner: '',
                colors: { bg: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', text: '#ffffff' },
                ctaText: 'Ver promoción',
                ctaAction: 'modal',
                ctaValue: '',
                category: '',
                isTemporalProduct: false,
                price: 0,
                promoPrice: 0,
              })
              setShowAdForm(true)
            }}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border-0"
            style={{ borderRadius: 'var(--radius-base)' }}
          >
            <Plus size={16} /> Nuevo Anuncio
          </button>
        )}
      </div>

      {/* FORMULARIO DE CREAR/EDITAR */}
      {showAdForm && (
        <div className="bg-surface rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-app bg-surface-2/30 flex justify-between items-center">
            <p className="font-bold text-app text-sm">
              {editingAdId ? 'Editar Anuncio' : 'Nuevo Anuncio / Promoción'}
            </p>
            <button
              onClick={() => setShowAdForm(false)}
              className="w-7 h-7 rounded-full bg-surface-2 hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center text-muted transition-colors cursor-pointer border-0"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Selector de Tipo */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
                Tipo de Promoción
              </label>
              <div className="flex bg-surface-2 border border-app rounded-xl overflow-hidden p-1">
                <button
                  type="button"
                  onClick={() => setAdFormData({ ...adFormData, type: 'inventory' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                    adFormData.type === 'inventory' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-surface bg-transparent'
                  }`}
                >
                  Producto del Inventario
                </button>
                <button
                  type="button"
                  onClick={() => setAdFormData({ ...adFormData, type: 'custom' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                    adFormData.type === 'custom' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-surface bg-transparent'
                  }`}
                >
                  Promoción Personalizada
                </button>
              </div>
            </div>

            {/* FORMULARIO: INVENTARIO */}
            {adFormData.type === 'inventory' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-app mb-1 block">Seleccionar Producto</label>
                  <CustomSelect
                    value={adFormData.productId}
                    placeholder="Elige un producto de la lista"
                    onChange={(val) => {
                      const prod = products.find(p => p.id === val)
                      setAdFormData({ ...adFormData, productId: val, customTitle: prod ? prod.nombre : '' })
                    }}
                    options={products.map(prod => ({
                      value: prod.id,
                      label: `${prod.nombre} ($${prod.precioBase.toLocaleString()})`
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-app mb-1 block">Tipo Descuento</label>
                    <CustomSelect
                      value={adFormData.discountType}
                      onChange={(val) => setAdFormData({ ...adFormData, discountType: val })}
                      options={[
                        { value: 'percentage', label: 'Porcentaje (%)' },
                        { value: 'amount', label: 'Monto Fijo ($)' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-app mb-1 block">Valor Descuento</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Ingresa la cantidad"
                      value={adFormData.discountValue === 0 ? '' : String(adFormData.discountValue)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = raw.split('.');
                        const cleaned = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw;
                        setAdFormData({ ...adFormData, discountValue: cleaned === '' ? 0 : cleaned });
                      }}
                      onBlur={(e) => {
                        const num = parseFloat(e.target.value);
                        setAdFormData(prev => ({ ...prev, discountValue: isNaN(num) ? 0 : num }));
                      }}
                      className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Vista Previa del Descuento */}
                {adFormData.productId && (
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-xs text-primary font-bold">
                    {(() => {
                      const prod = products.find(p => p.id === adFormData.productId)
                      if (!prod) return ''
                      const desc = adFormData.discountType === 'percentage'
                        ? (prod.precioBase * adFormData.discountValue) / 100
                        : adFormData.discountValue
                      const finalPrice = Math.max(0, prod.precioBase - desc)
                      return `Precio Base: $${prod.precioBase.toLocaleString()} | Descuento: -$${desc.toLocaleString()} | Precio Final: $${finalPrice.toLocaleString()}`
                    })()}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-app mb-1 block">Título Personalizado (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Opcional (se usará el nombre del producto si se deja vacío)"
                    value={adFormData.customTitle}
                    onChange={(e) => setAdFormData({ ...adFormData, customTitle: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-app mb-1 block">Imagen Banner Opcional (URL)</label>
                  <input
                    type="url"
                    placeholder="Ingresa el enlace web (http/https)"
                    value={adFormData.customBanner}
                    onChange={(e) => setAdFormData({ ...adFormData, customBanner: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-app">
                  <div>
                    <p className="text-xs font-bold text-app">Efecto Brillo (Glow visual)</p>
                    <p className="text-[10px] text-muted">Añade un brillo animado premium a la tarjeta del producto</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={adFormData.glowEffect}
                    onChange={(e) => setAdFormData({ ...adFormData, glowEffect: e.target.checked })}
                    className="w-5 h-5 rounded text-primary focus:ring-primary border-app cursor-pointer"
                  />
                </div>

                {/* Preview en vivo para Producto de Inventario */}
                {adFormData.productId && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold">Vista Previa del Anuncio (Inventario)</p>
                    {(() => {
                      const prod = products.find(p => p.id === adFormData.productId)
                      if (!prod) return null
                      
                      const desc = adFormData.discountType === 'percentage'
                        ? (prod.precioBase * adFormData.discountValue) / 100
                        : adFormData.discountValue
                      const finalPrice = Math.max(0, prod.precioBase - desc)
                      const hasDiscount = desc > 0

                      const imageToShow = adFormData.customBanner || prod.imagen || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'
                      const titleToShow = adFormData.customTitle || prod.nombre

                      const glowStyle = adFormData.glowEffect
                        ? {
                            boxShadow: '0 0 15px 3px rgba(var(--color-primary-rgb, 233, 30, 140), 0.5)',
                            border: '1px solid var(--color-primary, #e91e8c)'
                          }
                        : {
                            border: '1px solid var(--color-border, rgba(255, 255, 255, 0.1))'
                          }

                      return (
                        <div 
                          className="relative overflow-hidden rounded-2xl bg-surface transition-all duration-300 flex flex-col md:flex-row items-center gap-4 p-4"
                          style={glowStyle}
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-2 shrink-0 border border-app relative flex items-center justify-center">
                            {adFormData.customBanner || prod.imagen || prod.imageUrl ? (
                              <>
                                <img 
                                  src={adFormData.customBanner || prod.imagen || prod.imageUrl} 
                                  alt={titleToShow} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    const sibling = e.target.nextSibling
                                    if (sibling) sibling.style.display = 'flex'
                                  }}
                                />
                                <div className="hidden absolute inset-0 flex items-center justify-center text-muted text-[10px] font-bold bg-surface-2">
                                  Imagen
                                </div>
                              </>
                            ) : (
                              <span className="text-muted text-[10px] font-bold">Imagen</span>
                            )}
                            {hasDiscount && (
                              <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-md z-10">
                                {adFormData.discountType === 'percentage' ? `-${adFormData.discountValue}%` : `-$${adFormData.discountValue.toLocaleString()}`}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 text-center md:text-left min-w-0">
                            <span className="inline-block bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">
                              {prod.categoria || 'Promoción'}
                            </span>
                            <h4 className="font-bold text-sm text-app truncate">{titleToShow}</h4>
                            
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                              {hasDiscount && (
                                <span className="text-xs text-muted line-through">
                                  ${prod.precioBase.toLocaleString()}
                                </span>
                              )}
                              <span className="text-sm font-extrabold text-primary">
                                ${finalPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 w-full md:w-auto">
                            <div className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold text-center shadow-lg shadow-primary/20">
                              Ver Producto
                            </div>
                          </div>

                          {adFormData.glowEffect && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* FORMULARIO: PERSONALIZADO */}
            {adFormData.type === 'custom' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-app">
                  <div>
                    <p className="text-xs font-bold text-app">¿Es un Producto Temporal?</p>
                    <p className="text-[10px] text-muted">Permite vender un combo o producto que no está en el inventario real</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={adFormData.isTemporalProduct}
                    onChange={(e) => setAdFormData({ ...adFormData, isTemporalProduct: e.target.checked })}
                    className="w-5 h-5 rounded text-primary focus:ring-primary border-app cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-app mb-1 block">Título</label>
                    <input
                      type="text"
                      required
                      value={adFormData.title}
                      onChange={(e) => setAdFormData({ ...adFormData, title: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-app mb-1 block">Categoría Visual (ej: Combos, Ofertas)</label>
                    <input
                      type="text"
                      value={adFormData.category}
                      onChange={(e) => setAdFormData({ ...adFormData, category: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                      placeholder="Ingresa el nombre de la promoción"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-app mb-1 block">Descripción</label>
                  <textarea
                    rows={2}
                    value={adFormData.description}
                    onChange={(e) => setAdFormData({ ...adFormData, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {adFormData.isTemporalProduct && (
                  <div className="grid grid-cols-2 gap-4 bg-surface-2 p-4 rounded-2xl border border-app shadow-inner">
                    <div>
                      <label className="text-xs font-bold text-app mb-1 block">Precio Original ($)</label>
                      <input
                        type="number"
                        value={adFormData.price}
                        onChange={(e) => setAdFormData({ ...adFormData, price: Number(e.target.value) })}
                        className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-app mb-1 block">Precio Promoción ($)</label>
                      <input
                        type="number"
                        value={adFormData.promoPrice}
                        onChange={(e) => setAdFormData({ ...adFormData, promoPrice: Number(e.target.value) })}
                        className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-app mb-1 block">Imagen Cuadrada URL</label>
                    <input
                      type="url"
                      placeholder="Ingresa el enlace web (http/https)"
                      value={adFormData.image}
                      onChange={(e) => setAdFormData({ ...adFormData, image: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-app mb-1 block">Banner Horizontal URL</label>
                    <input
                      type="url"
                      placeholder="Ingresa el enlace web (http/https)"
                      value={adFormData.banner}
                      onChange={(e) => setAdFormData({ ...adFormData, banner: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* ── Fondo y Color ── */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-app">Colores del Anuncio</p>

                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-2">Fondo (Degradado o Color Sólido)</p>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[
                        { label: 'Rosa', bg: 'linear-gradient(135deg, #e91e8c, #ff4081)' },
                        { label: 'Púrpura', bg: 'linear-gradient(135deg, #7c3aed, #c026d3)' },
                        { label: 'Azul', bg: 'linear-gradient(135deg, #1565c0, #2979ff)' },
                        { label: 'Verde', bg: 'linear-gradient(135deg, #1b5e20, #43a047)' },
                        { label: 'Naranja', bg: 'linear-gradient(135deg, #e65100, #ff9800)' },
                        { label: 'Negro', bg: 'linear-gradient(135deg, #0f0f0f, #37474f)' },
                        { label: 'Dorado', bg: 'linear-gradient(135deg, #b8860b, #f5c518)' },
                        { label: 'App', bg: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' },
                      ].map(({ label, bg }) => (
                        <button
                          key={label}
                          type="button"
                          title={label}
                          onClick={() => setAdFormData({ ...adFormData, colors: { ...adFormData.colors, bg } })}
                          className={`h-10 rounded-xl border-2 transition-all cursor-pointer ${adFormData.colors.bg === bg ? 'border-white shadow-lg scale-105' : 'border-transparent hover:border-white/40'}`}
                          style={{ background: bg }}
                        >
                          {adFormData.colors.bg === bg && (
                            <span className="text-white text-xs font-bold drop-shadow">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-app">
                      <input
                        type="color"
                        value={(() => {
                          const m = adFormData.colors.bg.match(/#[0-9a-fA-F]{6}/)
                          return m ? m[0] : '#e91e8c'
                        })()}
                        onChange={(e) => setAdFormData({ ...adFormData, colors: { ...adFormData.colors, bg: e.target.value } })}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-app">Color personalizado</p>
                        <p className="text-[10px] text-muted">Selecciona un color sólido exacto</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-app">
                    <input
                      type="color"
                      value={adFormData.colors.text || '#ffffff'}
                      onChange={(e) => setAdFormData({ ...adFormData, colors: { ...adFormData.colors, text: e.target.value } })}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-app">Color del texto</p>
                      <p className="text-[10px] text-muted">Color de títulos y descripción sobre el fondo</p>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setAdFormData({ ...adFormData, colors: { ...adFormData.colors, text: '#ffffff' } })}
                        className={`w-7 h-7 rounded-lg border-2 bg-white transition-all cursor-pointer ${adFormData.colors.text === '#ffffff' ? 'border-primary scale-110' : 'border-app'}`}
                        title="Blanco"
                      />
                      <button
                        type="button"
                        onClick={() => setAdFormData({ ...adFormData, colors: { ...adFormData.colors, text: '#111111' } })}
                        className={`w-7 h-7 rounded-lg border-2 bg-black transition-all cursor-pointer ${adFormData.colors.text === '#111111' ? 'border-primary scale-110' : 'border-app'}`}
                        title="Negro"
                      />
                    </div>
                  </div>

                  <div
                    className="w-full h-16 rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{ background: adFormData.colors.bg }}
                  >
                    <p className="font-bold text-sm px-4 text-center drop-shadow" style={{ color: adFormData.colors.text }}>
                      {adFormData.title || 'Vista previa del anuncio'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-app mb-1 block">Texto del Botón CTA</label>
                  <input
                    type="text"
                    value={adFormData.ctaText}
                    onChange={(e) => setAdFormData({ ...adFormData, ctaText: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                    placeholder="Ingresa el texto de llamado a la acción (ej: Ver promoción)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-app mb-1 block">Comportamiento Clic (Acción)</label>
                    <CustomSelect
                      value={adFormData.ctaAction}
                      onChange={(val) => setAdFormData({ ...adFormData, ctaAction: val })}
                      options={[
                        { value: 'modal', label: 'Abrir Detalle en Modal' },
                        { value: 'whatsapp', label: 'Abrir WhatsApp' },
                        { value: 'url', label: 'Abrir Enlace Externo' },
                        { value: 'category', label: 'Filtrar por Categoría' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-app mb-1 block">Valor de la Acción</label>
                    <input
                      type="text"
                      value={adFormData.ctaValue}
                      onChange={(e) => setAdFormData({ ...adFormData, ctaValue: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors"
                      placeholder={
                        adFormData.ctaAction === 'whatsapp' ? '+57300...' :
                        adFormData.ctaAction === 'category' ? 'Nombre o ID Categoría' :
                        adFormData.ctaAction === 'url' ? 'https://...' :
                        'Texto descriptivo largo para el modal...'
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-app">
                  <div>
                    <p className="text-xs font-bold text-app">Efecto Brillo (Glow visual)</p>
                    <p className="text-[10px] text-muted">Añade un brillo animado premium a la tarjeta del anuncio</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={adFormData.glowEffect}
                    onChange={(e) => setAdFormData({ ...adFormData, glowEffect: e.target.checked })}
                    className="w-5 h-5 rounded text-primary focus:ring-primary border-app cursor-pointer"
                  />
                </div>

              </div>
            )}

            {/* Fechas de Vigencia Comunes */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-app mb-1 block">Fecha Inicio</label>
                <CustomDatePicker
                  value={adFormData.startDate}
                  onChange={(e) => setAdFormData({ ...adFormData, startDate: e.target.value })}
                  placeholder="Elige una fecha (día/mes/año)"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-app mb-1 block">Fecha Fin</label>
                <CustomDatePicker
                  value={adFormData.endDate}
                  onChange={(e) => setAdFormData({ ...adFormData, endDate: e.target.value })}
                  placeholder="Elige una fecha (día/mes/año)"
                />
              </div>
            </div>
          </div>

          {/* Botones de Guardar/Cancelar */}
          <div className="p-4 border-t border-app bg-surface-2/30 flex gap-3">
            <button
              type="button"
              onClick={() => setShowAdForm(false)}
              className="flex-1 py-3 bg-surface border border-app text-app font-bold text-xs rounded-xl active:scale-95 transition-all hover:bg-surface-2 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAd}
              className="flex-1 py-3 bg-primary text-white font-bold text-xs rounded-xl active:scale-95 transition-all hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer border-0"
              style={{ borderRadius: 'var(--radius-base)' }}
            >
              <Save size={16} /> Guardar
            </button>
          </div>
        </div>
      )}

      {/* LISTADO DE ANUNCIOS */}
      {!showAdForm && (
        <div className="bg-surface rounded-3xl shadow-sm overflow-hidden border border-app">
          {isLoadingAds ? (
            <div className="p-8 text-center text-muted">Cargando anuncios...</div>
          ) : ads.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm bg-transparent">
              No hay anuncios creados. ¡Crea el primero usando el botón de arriba!
            </div>
          ) : (
            <div className="divide-y divide-app">
              {ads.map(ad => {
                const linkedProduct = ad.type === 'inventory' ? products.find(p => p.id === ad.productId) : null
                return (
                  <div key={ad.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-surface-2/30 transition-colors">
                    <div className="flex gap-3 items-start">
                      <div className="w-12 h-12 rounded-xl bg-surface-2 border border-app overflow-hidden shrink-0 flex items-center justify-center">
                        {(ad.type === 'inventory' ? (linkedProduct?.imageUrl || ad.customBanner) : (ad.image || ad.banner)) ? (
                          <img
                            src={ad.type === 'inventory' ? (linkedProduct?.imageUrl || ad.customBanner) : (ad.image || ad.banner)}
                            alt=""
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <Megaphone size={20} className="text-muted" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            ad.type === 'inventory' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                          }`}>
                            {ad.type === 'inventory' ? 'Inventario' : ad.isTemporalProduct ? 'Prod. Temporal' : 'Personalizado'}
                          </span>
                          <span className={`text-[10px] font-bold ${ad.active ? 'text-green-600' : 'text-muted'}`}>
                            {ad.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-app mt-1">
                          {ad.type === 'inventory' ? (ad.customTitle || linkedProduct?.nombre || 'Producto Desvinculado') : ad.title}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          Vigencia: {ad.startDate} al {ad.endDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          if (!ad.active) {
                            const activeCount = ads.filter(a => a.active).length
                            if (activeCount >= 5) {
                              showAlert({ title: 'Límite alcanzado', message: 'Solo puedes tener un máximo de 5 publicidades activas de forma simultánea. Desactiva otra publicidad para poder activar esta.', variant: 'warning' })
                              return
                            }
                          }
                          updateMutation.mutate({ id: ad.id, data: { active: !ad.active } })
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          ad.active
                            ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20'
                            : 'bg-surface border-app text-muted hover:bg-surface-2'
                        }`}
                      >
                        {ad.active ? 'Desactivar' : 'Activar'}
                      </button>

                      <button
                        onClick={() => {
                          setEditingAdId(ad.id)
                          setAdFormData({
                            type: ad.type || 'inventory',
                            active: ad.active ?? true,
                            productId: ad.productId || '',
                            discountType: ad.discountType || 'percentage',
                            discountValue: ad.discountValue || 0,
                            startDate: ad.startDate || new Date().toISOString().split('T')[0],
                            endDate: ad.endDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
                            customTitle: ad.customTitle || '',
                            customBanner: ad.customBanner || '',
                            glowEffect: ad.glowEffect || false,
                            title: ad.title || '',
                            description: ad.description || '',
                            image: ad.image || '',
                            banner: ad.banner || '',
                            colors: ad.colors || { bg: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', text: '#ffffff' },
                            ctaText: ad.ctaText || 'Ver promoción',
                            ctaAction: ad.ctaAction || 'modal',
                            ctaValue: ad.ctaValue || '',
                            category: ad.category || '',
                            isTemporalProduct: ad.isTemporalProduct || false,
                            price: ad.price || 0,
                            promoPrice: ad.promoPrice || 0,
                          })
                          setShowAdForm(true)
                        }}
                        className="p-2 rounded-lg bg-surface-2 border border-app text-app hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        <Paintbrush size={14} />
                      </button>

                      <button
                        onClick={() => setAdToDelete(ad)}
                        className="p-2 rounded-lg bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN PREMIUM */}
      {adToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-[3px] transition-opacity duration-300"
            onClick={() => setAdToDelete(null)}
          />
          
          <div 
            className="relative bg-surface rounded-3xl border border-app shadow-2xl p-6 w-full max-w-sm text-center overflow-hidden z-10"
          >
            <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
              <Trash2 size={24} className="animate-pulse" />
            </div>

            <h3 className="text-base font-bold text-app mb-2">¿Eliminar promoción?</h3>
            
            <p className="text-xs text-muted leading-relaxed mb-6">
              Esta acción es permanente. El anuncio seleccionado se retirará de la tienda del cliente inmediatamente.
            </p>

            <div className="bg-surface-2 p-3 rounded-2xl border border-app text-left mb-6">
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Nombre del Anuncio</p>
              <p className="text-xs font-extrabold text-app mt-0.5 truncate">
                {adToDelete.type === 'inventory' 
                  ? (adToDelete.customTitle || products.find(p => p.id === adToDelete.productId)?.nombre || 'Producto de Inventario')
                  : (adToDelete.title || 'Promoción Personalizada')
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAdToDelete(null)}
                className="flex-1 py-3 bg-surface border border-app text-app font-bold text-xs rounded-xl active:scale-95 transition-all hover:bg-surface-2 cursor-pointer"
              >
                No, Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMutation.mutate(adToDelete.id)
                  setAdToDelete(null)
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
