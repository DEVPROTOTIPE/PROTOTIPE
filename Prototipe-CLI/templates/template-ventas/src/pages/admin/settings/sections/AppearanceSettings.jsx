import { useState, useEffect } from 'react'
import { Sun, Moon, Paintbrush, Save, Type, X, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ADVANCED_PALETTES, getActiveColors } from '../../../../constants/palettes'
import { FONTS, FONT_CATEGORIES, FONTS_BY_CATEGORY } from '../../../../constants/fonts'
import MobilePreview from '../components/MobilePreview'

// Componente helper para bloquear el scroll en el body cuando un modal está abierto
function ThemeModalLock({ children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])
  return <>{children}</>
}

export default function AppearanceSettings({ 
  formData, 
  setFormData, 
  config, 
  setSaveMessage, 
  isSaving,
  handleSaveConfig
}) {
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)

  const toggleCustomMode = () => {
    if (typeof formData.theme === 'object') {
      setFormData({ ...formData, theme: 'zafiro-moderno' })
    } else {
      const basePalette = ADVANCED_PALETTES[formData.theme] || ADVANCED_PALETTES['zafiro-moderno']
      setFormData({
        ...formData,
        theme: {
          light: { ...basePalette.light },
          dark: { ...basePalette.dark }
        }
      })
    }
  }

  const handleCustomColorChange = (key, value) => {
    const mode = config.isDarkMode ? 'dark' : 'light'
    setFormData({
      ...formData,
      theme: {
        ...formData.theme,
        [mode]: { ...formData.theme[mode], [key]: value }
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="bg-surface rounded-3xl shadow-sm overflow-hidden lg:col-span-7 flex flex-col">
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* ── Modo Oscuro ── */}
          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
            <div>
              <p className="text-sm font-bold text-app">Modo Oscuro</p>
              <p className="text-xs text-muted mt-0.5">Cambia entre tema claro y oscuro</p>
            </div>
            <button
              type="button"
              onClick={() => config.toggleDarkMode()}
              className="flex items-center justify-center gap-2 w-14 h-10 rounded-xl border border-app hover:bg-surface transition-colors text-app bg-transparent cursor-pointer"
              title={config.isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {config.isDarkMode ? <Sun size={20} className="text-warning"/> : <Moon size={20} className="text-primary"/>}
            </button>
          </div>

          {/* ── Animaciones ── */}
          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
            <div>
              <p className="text-sm font-bold text-app">Animaciones de la App</p>
              <p className="text-xs text-muted mt-0.5">Activar transiciones suaves</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input type="checkbox" className="sr-only peer"
                checked={formData.animationsEnabled}
                onChange={(e) => setFormData({ ...formData, animationsEnabled: e.target.checked })} />
              <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner animate-all"></div>
            </label>
          </div>

          {/* ── Sistema de Compra Guiada ── */}
          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
            <div>
              <p className="text-sm font-bold text-app">Sistema de Compra Guiada</p>
              <p className="text-xs text-muted mt-0.5">Asistencia flotante para clientes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input type="checkbox" className="sr-only peer"
                checked={formData.guidedModeEnabled}
                onChange={(e) => setFormData({ ...formData, guidedModeEnabled: e.target.checked })} />
              <div className="w-11 h-6 bg-app/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner animate-all"></div>
            </label>
          </div>

          {/* ── Tema de Colores ── */}
          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-app">
            <div>
              <p className="text-sm font-bold text-app">Tema Principal</p>
              <p className="text-xs text-muted mt-0.5">
                Paleta: <span className="font-bold text-primary">{typeof formData.theme === 'object' ? 'Personalizado' : (ADVANCED_PALETTES[formData.theme]?.name || 'Modern Purple')}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold shadow-md active:scale-95 transition-all hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer border-0"
            >
              <Paintbrush size={16} /> Cambiar
            </button>
          </div>

          {/* ── Color de Acción ── */}
          <div className="p-4 bg-surface-2 rounded-2xl border border-app">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm font-bold text-app">Color de Botones de Compra</p>
                <p className="text-xs text-muted mt-0.5">Sobrescribe el color primario en el carrito y pago</p>
              </div>
              {formData.actionColor && (
                <button type="button" onClick={() => setFormData({ ...formData, actionColor: '' })} className="text-xs text-primary hover:underline font-medium bg-transparent border-0 cursor-pointer">Restablecer</button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={formData.actionColor || getActiveColors(formData.theme, config.isDarkMode)['--color-primary']} 
                onChange={(e) => setFormData({ ...formData, actionColor: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
              />
              <div className="flex-1 px-4 py-3 text-white font-bold text-center rounded-xl text-sm transition-colors shadow-sm" style={{ backgroundColor: formData.actionColor || getActiveColors(formData.theme, config.isDarkMode)['--color-primary'] }}>
                Agregar al Carrito
              </div>
            </div>
          </div>

          {/* ── Tipografía ── */}
          <div className="p-4 bg-surface-2 rounded-2xl border border-app">
            <div className="flex items-center gap-2 mb-1">
              <Type size={16} className="text-primary shrink-0" />
              <p className="text-sm font-bold text-app">Tipografía</p>
            </div>
            <p className="text-xs text-muted mb-4">Fuente principal de toda la aplicación — {FONTS[formData.appFont]?.name || 'Inter'} ({FONTS[formData.appFont]?.category || 'Modernas'})</p>

            {/* Precargar todas las fuentes para preview */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            {FONT_CATEGORIES.map(cat =>
              FONTS_BY_CATEGORY[cat].map(f => (
                <link key={f.key} rel="stylesheet" href={f.url} />
              ))
            )}

            <div className="space-y-4">
              {FONT_CATEGORIES.map(cat => (
                <div key={cat}>
                  {/* Etiqueta de categoría */}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">{cat}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS_BY_CATEGORY[cat].map(({ key, name, description }) => {
                      const isSelected = formData.appFont === key
                      return (
                        <motion.button
                          key={key}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setFormData({ ...formData, appFont: key })}
                          className={`relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center overflow-hidden cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-app bg-surface hover:border-primary/30 hover:bg-surface-2'
                          }`}
                        >
                          {/* Indicador de seleccionado */}
                          {isSelected && (
                            <motion.div
                              layoutId="font-selected"
                              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"
                            />
                          )}
                          {/* Preview de la fuente */}
                          <span
                            className="text-2xl font-bold leading-none"
                            style={{
                              fontFamily: `'${name}', serif`,
                              color: isSelected ? 'var(--color-primary)' : 'var(--color-text)'
                            }}
                          >
                            Aa
                          </span>
                          {/* Nombre de la fuente */}
                          <span className={`text-[11px] font-bold leading-tight ${
                            isSelected ? 'text-primary' : 'text-app'
                          }`}>
                            {name.split(' ')[0]}
                          </span>
                          {/* Descripción */}
                          <span className="text-[9px] text-muted leading-tight">{description}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Radio de Bordes ── */}
          <div className="p-4 bg-surface-2 rounded-2xl border border-app">
            <p className="text-sm font-bold text-app mb-1">Estilo de Bordes</p>
            <p className="text-xs text-muted mb-3">Redondez de tarjetas de productos</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'squared', label: 'Cuadrado', radius: '4px' },
                { id: 'rounded', label: 'Suave', radius: '12px' },
                { id: 'pill', label: 'Redondo', radius: '32px' }
              ].map((border) => (
                <button
                  key={border.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, appRadius: border.id })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer bg-transparent ${
                    formData.appRadius === border.id ? 'border-primary bg-primary/5' : 'border-app bg-surface hover:border-primary/30'
                  }`}
                >
                  <div className="w-full h-8 border-2 border-primary/40 bg-surface-2" style={{ borderRadius: border.radius }} />
                  <span className={`text-xs font-semibold ${formData.appRadius === border.id ? 'text-primary' : 'text-muted'}`}>{border.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Modo de Vista del Catálogo ── */}
          <div className="p-4 bg-surface-2 rounded-2xl border border-app">
            <p className="text-sm font-bold text-app mb-1">Diseño del Catálogo</p>
            <p className="text-xs text-muted mb-3">Columnas en la vista del cliente</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'list', label: 'Lista' },
                { id: 'grid2', label: '2 Columnas' }
              ].map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, catalogLayout: layout.id })}
                  className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer bg-transparent ${
                    formData.catalogLayout === layout.id ? 'border-primary bg-primary/5 text-primary' : 'border-app bg-surface text-muted hover:border-primary/30'
                  }`}
                >
                  <div className="flex gap-1 h-5">
                    {layout.id === 'list' && <div className="w-10 h-full bg-current rounded-sm opacity-50" />}
                    {layout.id === 'grid2' && <><div className="w-4 h-full bg-current rounded-sm opacity-50"/><div className="w-4 h-full bg-current rounded-sm opacity-50"/></>}
                  </div>
                  <span className="text-xs font-semibold">{layout.label}</span>
                </button>
              ))}
            </div>
          </div>
          
        </div>
        
        {/* Botón Guardar */}
        <div className="p-5 sm:p-6 border-t border-app bg-surface-2/30">
          <button onClick={handleSaveConfig} disabled={isSaving}
            className="w-full min-h-[52px] py-3 px-6 bg-primary text-white rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 hover:opacity-90 flex items-center justify-center gap-3 shadow-lg shadow-primary/30 disabled:opacity-50 cursor-pointer">
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} className="shrink-0" /> Guardar Cambios</>}
          </button>
        </div>
      </div>
      <MobilePreview formData={formData} isDarkMode={config.isDarkMode} />

      {/* ─── MODAL DEL SELECTOR DE TEMAS ─── */}
      <AnimatePresence>
        {isThemeModalOpen && (
          <ThemeModalLock>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-surface w-full max-w-4xl max-h-[90vh] rounded-3xl border border-app shadow-2xl flex flex-col overflow-hidden text-left"
              >
                <div className="p-5 border-b border-app bg-surface flex justify-between items-center shrink-0">
                  <h3 className="text-lg font-bold text-app flex items-center gap-2">
                    <Paintbrush size={20} className="text-primary" />
                    Selector de Tema Inteligente
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsThemeModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 text-muted hover:text-app transition-colors border-0 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-y-contain">
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-sm text-muted">Selecciona una paleta predefinida o crea tu propia combinación exacta.</p>
                    <button 
                      type="button"
                      onClick={toggleCustomMode}
                      className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors shrink-0 cursor-pointer ${typeof formData.theme === 'object' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface-2 border-app text-app hover:bg-app hover:text-surface'}`}
                    >
                      {typeof formData.theme === 'object' ? 'Volver a Predefinidas' : 'Crear Personalizado'}
                    </button>
                  </div>

                  {typeof formData.theme === 'object' ? (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-surface-2 rounded-2xl border border-app shadow-inner">
                       <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-surface border border-app">
                         {config.isDarkMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-warning" />}
                         <p className="text-sm font-medium text-app">
                           Estás editando la paleta para el modo <strong className="text-primary">{config.isDarkMode ? 'Oscuro' : 'Claro'}</strong>.
                         </p>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                       {Object.entries(config.isDarkMode ? formData.theme.dark : formData.theme.light).map(([key, val]) => (
                          <div key={key} className="flex flex-col">
                            <label className="block text-xs font-bold text-app mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                            <div className="flex items-center gap-3 bg-surface p-2 rounded-xl border border-app shadow-sm">
                              <input 
                                type="color" 
                                value={val} 
                                onChange={(e) => handleCustomColorChange(key, e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 shadow-inner"
                              />
                              <span className="text-sm font-mono font-medium text-muted uppercase">{val}</span>
                            </div>
                          </div>
                       ))}
                       </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-8">
                      {Object.entries(
                        Object.values(ADVANCED_PALETTES).reduce((acc, palette) => {
                          const cat = palette.category || 'General';
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(palette);
                          return acc;
                        }, {})
                      ).map(([categoryName, palettes]) => (
                        <div key={categoryName} className="space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-primary border-b border-app pb-2">{categoryName}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {palettes.map((palette) => {
                              const isSelected = formData.theme === palette.id;
                              const colors = config.isDarkMode ? palette.dark : palette.light;
                              
                              return (
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={palette.id}
                                  onClick={() => setFormData({ ...formData, theme: palette.id })}
                                  className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between h-28 cursor-pointer ${
                                    isSelected 
                                      ? 'border-primary shadow-[0_0_20px_rgba(var(--color-primary),0.15)] ring-2 ring-primary/20 bg-surface' 
                                      : 'border-app hover:border-primary/50 bg-surface'
                                  }`}
                                  style={{ backgroundColor: colors.surface }}
                                >
                                  {isSelected && (
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                                  )}
                                  <span className="block text-xs font-bold truncate pr-3" style={{ color: colors.text }}>{palette.name}</span>
                                  <div className="flex gap-2 mt-auto">
                                    <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: colors.primary }} />
                                    <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: colors.secondary }} />
                                    <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: colors.accent }} />
                                    <div className="w-6 h-6 rounded-full shadow-sm border border-app" style={{ backgroundColor: colors.bg }} />
                                  </div>
                                </motion.button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-5 border-t border-app bg-surface flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsThemeModalOpen(false)}
                    className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95 shadow-md flex items-center gap-2 border-0 cursor-pointer"
                  >
                    <CheckCircle size={18} />
                    Confirmar y Cerrar
                  </button>
                </div>
              </motion.div>
            </div>
          </ThemeModalLock>
        )}
      </AnimatePresence>
    </div>
  )
}
