import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, MessageSquare, Megaphone, Plus, Trash2, ChevronDown } from 'lucide-react'
import { updateAppConfig } from '../../../../services/appConfigService'
import { subscribeToAllMovements } from '../../../../services/stockMovementService'

export default function StoreSettings({ 
  formData, 
  setFormData, 
  config, 
  setSaveMessage, 
  activeSubSection,
  setActiveSubSection 
}) {
  const [allStockMovements, setAllStockMovements] = useState([])
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('todos')
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('todos')

  useEffect(() => {
    let unsub = null
    if (activeSubSection === 'movimientos') {
      unsub = subscribeToAllMovements(setAllStockMovements)
    }
    return () => {
      if (unsub) unsub()
    }
  }, [activeSubSection])

  return (
    <div className="bg-surface rounded-3xl border border-app shadow-sm flex flex-col relative text-left">


      {/* HISTORIAL AJUSTES STOCK */}
      {activeSubSection === 'movimientos' && (
        <div className="p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-app">Auditoría de Ajustes de Stock</h3>
            <p className="text-xs text-muted mt-1">Historial completo de modificaciones manuales de inventario realizadas por el equipo.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-2 rounded-2xl border border-app shadow-sm flex flex-col justify-between">
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Ajustes Totales</p>
              <p className="text-2xl font-black text-app mt-1">{allStockMovements.length}</p>
            </div>
            <div className="p-4 bg-surface-2 rounded-2xl border border-app shadow-sm flex flex-col justify-between">
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Incrementos (Entradas)</p>
              <p className="text-2xl font-black text-green-500 mt-1">
                {allStockMovements.filter(m => m.type === 'addition').length}
              </p>
            </div>
            <div className="p-4 bg-surface-2 rounded-2xl border border-app shadow-sm flex flex-col justify-between">
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Reducciones (Salidas)</p>
              <p className="text-2xl font-black text-red-500 mt-1">
                {allStockMovements.filter(m => m.type === 'reduction').length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface-2 rounded-2xl border border-app">
            <div>
              <label className="block text-xs font-bold text-muted mb-1.5">Filtrar por Rol</label>
              <select
                value={selectedRoleFilter}
                onChange={(e) => {
                  setSelectedRoleFilter(e.target.value)
                  setSelectedEmployeeFilter('todos')
                }}
                className="w-full h-11 px-3.5 rounded-xl bg-surface border border-app text-app text-sm focus:outline-none focus:border-primary transition-colors bg-transparent"
              >
                <option value="todos">Todos los Roles</option>
                <option value="admin">Administradores</option>
                <option value="empleado">Empleados</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted mb-1.5">Filtrar por Responsable</label>
              <select
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-surface border border-app text-app text-sm focus:outline-none focus:border-primary transition-colors bg-transparent"
              >
                <option value="todos">Todos los Responsables</option>
                {Array.from(new Set(allStockMovements
                  .filter(m => selectedRoleFilter === 'todos' || m.createdByRole === selectedRoleFilter)
                  .map(m => m.createdByName || m.createdByEmail || 'Sistema')
                )).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {allStockMovements.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <p className="text-sm">No hay registro de ajustes de stock aún.</p>
              </div>
            ) : (() => {
              const filtered = allStockMovements.filter(m => {
                const matchRole = selectedRoleFilter === 'todos' || m.createdByRole === selectedRoleFilter
                const matchEmployee = selectedEmployeeFilter === 'todos' || 
                  (m.createdByName || m.createdByEmail || 'Sistema') === selectedEmployeeFilter
                return matchRole && matchEmployee
              })

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-8 text-muted">
                    <p className="text-sm">Ningún movimiento coincide con los filtros aplicados.</p>
                  </div>
                )
              }

              return filtered.map((mov) => {
                const isAddition = mov.type === 'addition'
                const dateStr = mov.createdAt?.toDate ? mov.createdAt.toDate().toLocaleString('es-CO') : 
                  mov.createdAt ? new Date(mov.createdAt).toLocaleString('es-CO') : 'Sin fecha'

                return (
                  <div key={mov.id} className="p-4 bg-surface-2 rounded-2xl border border-app shadow-sm hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${isAddition ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isAddition ? <Plus size={16} /> : <Trash2 size={16} />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-bold text-app">{mov.productName}</p>
                          {mov.variantName && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-app/10 text-muted">
                              {mov.variantName}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          Cantidad: <span className={isAddition ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                            {isAddition ? '+' : ''}{mov.quantity} uds
                          </span>
                        </p>
                        <p className="text-xs text-muted mt-1 italic">
                          "{mov.reason || 'Sin motivo especificado'}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 text-xs shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-app">{mov.createdByName || 'Sistema'}</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                          mov.createdByRole === 'admin' 
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                          {mov.createdByRole === 'admin' ? 'Admin' : 'Empleado'}
                        </span>
                      </div>
                      <span className="text-muted text-[10px]">{dateStr}</span>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}



      {/* VENTAS AL POR MAYOR */}
      {activeSubSection === 'mayorista' && (
        <>
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
              <div>
                <p className="text-sm font-bold text-app">Activar Solicitudes al por Mayor</p>
                <p className="text-xs text-muted mt-0.5">Permite a los clientes solicitar cotizaciones y precios mayoristas en el catálogo</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer"
                  checked={formData.wholesaleSettings?.enabled ?? true}
                  onChange={(e) => setFormData({
                    ...formData,
                    wholesaleSettings: {
                      ...(formData.wholesaleSettings || {}),
                      enabled: e.target.checked
                    }
                  })} />
                <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>

          <div className="p-5 border-t border-app bg-surface-2/30">
            <button
              onClick={async () => {
                try {
                  await updateAppConfig({ 
                    wholesaleSettings: {
                      enabled: formData.wholesaleSettings?.enabled ?? true
                    }
                  })
                  setSaveMessage({ type: 'success', text: 'Configuración de venta al por mayor guardada correctamente.' })
                  setTimeout(() => setSaveMessage(null), 3000)
                } catch (e) {
                  setSaveMessage({ type: 'error', text: 'Error al guardar la configuración.' })
                }
              }}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer border-none"
            >
              <Save size={18} /> Guardar Configuración de Mayoreo
            </button>
          </div>
        </>
      )}

      {/* EVENTOS POR TEMPORADA */}
      {activeSubSection === 'temporada' && (
        <>
          <div className="p-5 sm:p-6 space-y-6">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-app uppercase tracking-wider">Selecciona una Temporada Activa</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto p-2.5 pr-2">
                {[
                  { id: 'none', label: 'Ninguno (Tema normal)', desc: 'Desactiva efectos visuales extras', emoji: '✨', colors: [] },
                  { id: 'navidad', label: 'Navidad', desc: 'Rojos y verdes navideños', emoji: '🎄', colors: ['#d32f2f', '#388e3c'] },
                  { id: 'halloween', label: 'Halloween', desc: 'Naranjas y morados mágicos', emoji: '🎃', colors: ['#f57c00', '#7b1fa2'] },
                  { id: 'madre', label: 'Día de la Madre', desc: 'Rosados y fucsias maternales', emoji: '🌸', colors: ['#ec407a', '#ab47bc'] },
                  { id: 'padre', label: 'Día del Padre', desc: 'Azul clásico y gris cuero', emoji: '👔', colors: ['#0288d1', '#455a64'] },
                  { id: 'nino', label: 'Día del Niño', desc: 'Amarillo alegre y celeste pastel', emoji: '🧸', colors: ['#fbc02d', '#29b6f6'] },
                  { id: 'amistad', label: 'Amor y Amistad', desc: 'Rojos pasión y rosa suave', emoji: '❤️', colors: ['#e91e63', '#f48fb1'] },
                  { id: 'verano', label: 'Verano', desc: 'Amarillo brillante y turquesa playa', emoji: '☀️', colors: ['#ffeb3b', '#00bcd4'] },
                  { id: 'semanasanta', label: 'Semana Santa', desc: 'Morados litúrgicos y blanco lino', emoji: '🌾', colors: ['#673ab7', '#eae6df'] },
                  { id: 'mascota', label: 'Día de la Mascota', desc: 'Cafés y beige cálidos', emoji: '🐾', colors: ['#8d6e63', '#d7ccc8'] }
                ].map((evt) => {
                  const isActive = (formData.activeSeasonalEvent || 'none') === evt.id
                  return (
                    <motion.button
                      key={evt.id}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, activeSeasonalEvent: evt.id })}
                      className={`p-4 rounded-2xl text-left flex gap-4 items-start transition-all duration-300 relative outline-none focus:outline-none ${
                        isActive 
                          ? 'bg-primary/[0.04]' 
                          : 'bg-surface-2 hover:bg-surface-2/60'
                      }`}
                      style={{ 
                        border: 'none', 
                        outline: 'none', 
                        boxShadow: isActive ? '0 0 16px 2px color-mix(in srgb, var(--color-primary) 35%, transparent)' : 'none' 
                      }}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isActive ? 'bg-primary/10' : 'bg-surface'
                      }`}>
                        <span className="text-xl">{evt.emoji}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-8">
                        <p className={`font-bold text-xs mb-0.5 transition-colors ${isActive ? 'text-primary' : 'text-app'}`}>
                          {evt.label}
                        </p>
                        <p className="text-[10px] text-muted leading-relaxed line-clamp-2">
                          {evt.desc}
                        </p>
                      </div>

                      <div className="absolute right-4 top-4 flex gap-1">
                        {evt.colors.map((c, i) => (
                          <span 
                            key={i} 
                            className="w-3.5 h-3.5 rounded-full border border-app/30 shadow-sm shrink-0"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {formData.activeSeasonalEvent && formData.activeSeasonalEvent !== 'none' && (
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3.5 items-start">
                <div className="text-xl mt-0.5">ℹ️</div>
                <div className="text-xs text-muted leading-relaxed">
                  <p className="font-bold text-primary mb-0.5">Modo de Temporada Activo</p>
                  Esta opción aplica una paleta de colores especial a toda la aplicación para tus clientes sin modificar tu tema base. Al desactivarlo, tu tienda volverá a sus colores predefinidos.
                </div>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-app bg-surface-2/30">
            <button
              onClick={async () => {
                try {
                  await updateAppConfig({ 
                    activeSeasonalEvent: formData.activeSeasonalEvent || 'none'
                  })
                  config.setConfig({
                    activeSeasonalEvent: formData.activeSeasonalEvent || 'none'
                  })
                  setSaveMessage({ type: 'success', text: 'Evento por temporada guardado y aplicado correctamente.' })
                  setTimeout(() => setSaveMessage(null), 3000)
                } catch (e) {
                  setSaveMessage({ type: 'error', text: 'Error al guardar la temporada.' })
                }
              }}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer border-none"
            >
              <Save size={18} /> Guardar Cambios de Temporada
            </button>
          </div>
        </>
      )}

      {/* GARANTÍAS Y RECLAMOS */}
      {activeSubSection === 'garantias' && (
        <>
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
              <div>
                <p className="text-sm font-bold text-app">Activar Garantías y Reclamos</p>
                <p className="text-xs text-muted mt-0.5">Permite a tus clientes iniciar reclamos o solicitar cambios sobre sus pedidos completados</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer"
                  checked={formData.claimsEnabled ?? false}
                  onChange={(e) => setFormData({ ...formData, claimsEnabled: e.target.checked })} />
                <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>

          <div className="p-5 border-t border-app bg-surface-2/30">
            <button
              onClick={async () => {
                try {
                  await updateAppConfig({ 
                    claimsEnabled: formData.claimsEnabled ?? false
                  })
                  config.setConfig({
                    claimsEnabled: formData.claimsEnabled ?? false
                  })
                  setSaveMessage({ type: 'success', text: 'Configuración de garantías guardada correctamente.' })
                  setTimeout(() => setSaveMessage(null), 3000)
                } catch (e) {
                  setSaveMessage({ type: 'error', text: 'Error al guardar.' })
                }
              }}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer border-none"
            >
              <Save size={18} /> Guardar Configuración de Garantías
            </button>
          </div>
        </>
      )}

      {/* SEGUIMIENTO DE PEDIDOS */}
      {activeSubSection === 'seguimiento' && (
        <>
          <div className="p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app shadow-xs">
              <div>
                <p className="text-sm font-bold text-app">Activar Seguimiento de Pedidos</p>
                <p className="text-xs text-muted mt-0.5">Habilita un portal público y genera enlaces de WhatsApp automáticos para que los clientes sigan sus pedidos en tiempo real</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer"
                  checked={formData.orderTrackingEnabled ?? false}
                  onChange={(e) => setFormData({ ...formData, orderTrackingEnabled: e.target.checked })} />
                <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            {formData.orderTrackingEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-surface rounded-2xl border border-app shadow-xs space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-app pb-2">
                  <MessageSquare size={16} className="text-primary" />
                  <h4 className="text-xs font-bold text-app uppercase tracking-wider">Mensaje de WhatsApp para Clientes</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-muted">Plantilla de Mensaje de Seguimiento</label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          trackingWaTemplate: "¡Hola {cliente}! Muchas gracias por tu compra. 😊\n\nTu pedido *{pedido}* está en estado *{estado}* (Total: {total}).\n\nPuedes consultar su preparación y envío en tiempo real ingresando a nuestra aplicación, en la sección de *'Mis Pedidos'* y presionando el botón *'🚀 Ver Seguimiento en Tiempo Real'* en la tarjeta de tu compra.\n\n¡Gracias por confiar en *{tienda}*!"
                        })
                      }}
                      className="text-[10px] font-black text-primary hover:underline cursor-pointer border-none bg-transparent"
                    >
                      🔄 Restablecer Predeterminada
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={formData.trackingWaTemplate}
                    onChange={(e) => setFormData({ ...formData, trackingWaTemplate: e.target.value })}
                    placeholder="Escribe el mensaje de WhatsApp usando {cliente} y {pedido}"
                    className="w-full p-3 rounded-xl border border-app bg-surface-2 focus:border-primary/40 outline-none text-xs text-app leading-relaxed transition-colors resize-none bg-transparent"
                  />
                  
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Etiquetas dinámicas disponibles (Toca para insertar):</p>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: '{cliente}', desc: 'Nombre cliente', val: '{cliente}' },
                        { label: '{pedido}', desc: '# Pedido', val: '{pedido}' },
                        { label: '{estado}', desc: 'Estado', val: '{estado}' },
                        { label: '{tienda}', desc: 'Nombre Tienda', val: '{tienda}' },
                        { label: '{total}', desc: 'Total Pedido', val: '{total}' },
                        { label: '{enlace}', desc: 'URL Seguimiento', val: '{enlace}' }
                      ].map(tag => (
                        <button
                          key={tag.label}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              trackingWaTemplate: (formData.trackingWaTemplate || '') + tag.val
                            })
                          }}
                          className="px-2.5 py-1 bg-surface-2 hover:bg-surface-3 border border-app rounded-lg text-[10px] font-mono font-bold text-muted hover:text-app transition-colors cursor-pointer"
                          title={tag.desc}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {formData.orderTrackingEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-surface rounded-2xl border border-app shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-app pb-2">
                  <div className="flex items-center gap-2">
                    <Megaphone size={16} className="text-primary" />
                    <h4 className="text-xs font-bold text-app uppercase tracking-wider">Promoción de Aplicación PWA (Instalación Directa)</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" className="sr-only peer"
                      checked={formData.appPromo?.enabled ?? false}
                      onChange={(e) => setFormData({
                        ...formData,
                        appPromo: { ...(formData.appPromo || {}), enabled: e.target.checked }
                      })} />
                    <div className="w-9 h-5 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                  </label>
                </div>

                {formData.appPromo?.enabled && (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1">Título del Banner</label>
                        <input
                          type="text"
                          value={formData.appPromo?.title || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            appPromo: { ...(formData.appPromo || {}), title: e.target.value }
                          })}
                          placeholder="Ingresa el título del banner de instalación"
                          className="w-full h-10 px-3 rounded-xl bg-surface-2 border border-app text-xs text-app focus:outline-none focus:border-primary transition-colors bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1">Imagen del Banner (URL)</label>
                        <input
                          type="text"
                          value={formData.appPromo?.promoImageUrl || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            appPromo: { ...(formData.appPromo || {}), promoImageUrl: e.target.value }
                          })}
                          placeholder="Ingresa el enlace web (http/https)"
                          className="w-full h-10 px-3 rounded-xl bg-surface-2 border border-app text-xs text-app focus:outline-none focus:border-primary transition-colors bg-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">Mensaje Comercial</label>
                      <textarea
                        rows={2.5}
                        value={formData.appPromo?.message || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            appPromo: { ...(formData.appPromo || {}), message: e.target.value }
                        })}
                        placeholder="Escribe los beneficios clave de instalar la aplicación"
                        className="w-full p-3 rounded-xl border border-app bg-surface-2 focus:border-primary/40 outline-none text-xs text-app leading-snug transition-colors resize-none bg-transparent"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="p-5 border-t border-app bg-surface-2/30">
            <button
              onClick={async () => {
                try {
                  const payload = { 
                    orderTrackingEnabled: formData.orderTrackingEnabled ?? false,
                    trackingWaTemplate: formData.trackingWaTemplate || '',
                    appPromo: formData.appPromo || null
                  }
                  await updateAppConfig(payload)
                  config.setConfig(payload)
                  setSaveMessage({ type: 'success', text: 'Configuración de seguimiento y fidelización guardada correctamente.' })
                  setTimeout(() => setSaveMessage(null), 3000)
                } catch (e) {
                  setSaveMessage({ type: 'error', text: 'Error al guardar la configuración.' })
                }
              }}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer border-none"
            >
              <Save size={18} /> Guardar Configuración de Seguimiento
            </button>
          </div>
        </>
      )}

    </div>
  )
}
