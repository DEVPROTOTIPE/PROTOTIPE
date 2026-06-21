import { ShoppingBag, Heart, Tag, Package, CreditCard } from 'lucide-react'
import { getActiveColors } from '../../../../constants/palettes'
import { FONTS } from '../../../../constants/fonts'

export default function MobilePreview({ formData, isDarkMode }) {
  const currentThemeColors = getActiveColors(formData.theme, isDarkMode)
  const primaryColor = currentThemeColors['--color-primary']
  const actionBtnColor = formData.actionColor || primaryColor
  const fontName = FONTS[formData.appFont]?.name || 'Inter'

  return (
    <div 
      className="flex flex-col items-center justify-start lg:col-span-5 sticky top-6 bg-surface-2 p-6 rounded-3xl border border-app h-[580px] w-full mt-6 lg:mt-0"
      style={{ fontFamily: `'${fontName}', sans-serif` }}
    >
      {/* Enlace para cargar la tipografía de Google Fonts para la vista previa */}
      <link href={`https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;700;900&display=swap`} rel="stylesheet" />

      <div className="text-center mb-4">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">Vista Previa del Cliente</span>
      </div>

      {/* Armazón del Celular */}
      <div className="w-[270px] h-[480px] rounded-[40px] border-[8px] border-slate-800 bg-app shadow-2xl relative overflow-hidden flex flex-col">
        {/* Altavoz/Notch del Celular */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* 1. Header de la Tienda */}
        <div className="h-12 bg-surface/75 backdrop-blur-md border-b border-app flex items-center justify-between px-3 pt-3 shrink-0 z-40">
          <div className="flex items-center gap-1.5 text-left">
            {formData.appIcon ? (
              <img src={formData.appIcon} alt="Logo" className="w-6 h-6 rounded-md object-cover" onError={(e) => { e.target.style.display = 'none' }} />
            ) : (
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-white text-[10px] font-bold">
                S
              </div>
            )}
            <span className="text-xs font-black text-app truncate max-w-[100px]">{formData.appName || 'Mi Tienda'}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center">
            <ShoppingBag size={14} className="text-primary" />
          </div>
        </div>

        {/* 2. Cuerpo Simulador Catálogo */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-app select-none">
          {/* Banner de Bienvenida */}
          <div className="h-24 rounded-xl bg-gradient-to-r from-primary/20 to-primary-focus/10 border border-primary/10 p-3 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-primary/10 blur-lg" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-wide">Colección Nueva</p>
            <p className="text-xs font-black text-app mt-0.5 leading-tight">¡Envíos gratis en compras hoy!</p>
          </div>

          {/* Fila de Tarjetas Ficticias */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface rounded-xl border border-app overflow-hidden p-2 flex flex-col">
              <div className="h-20 bg-surface-2 rounded-lg mb-2 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=150&auto=format&fit=crop" alt="P" className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] font-black text-app truncate">Camiseta Pro</p>
              <p className="text-[10px] text-muted">$45.000</p>
              <button 
                type="button"
                className="mt-2 w-full h-6 rounded-md text-[9px] font-bold text-white flex items-center justify-center transition-colors"
                style={{ backgroundColor: actionBtnColor }}
              >
                Agregar
              </button>
            </div>

            <div className="bg-surface rounded-xl border border-app overflow-hidden p-2 flex flex-col">
              <div className="h-20 bg-surface-2 rounded-lg mb-2 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=150&auto=format&fit=crop" alt="P" className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] font-black text-app truncate">Cargo Pant</p>
              <p className="text-[10px] text-muted">$120.000</p>
              <button 
                type="button"
                className="mt-2 w-full h-6 rounded-md text-[9px] font-bold text-white flex items-center justify-center transition-colors"
                style={{ backgroundColor: actionBtnColor }}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>

        {/* 3. Barra Navegación Inferior Simulada */}
        <div className="h-12 bg-surface border-t border-app flex items-center justify-around px-2 z-40 shrink-0 select-none pb-1">
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <ShoppingBag size={14} className="text-muted" />
            <span className="text-[8px] font-medium mt-0.5 scale-90">Catálogo</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <Heart size={14} className="text-muted" />
            <span className="text-[8px] font-medium mt-0.5 scale-90">Favoritos</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-start relative">
            <div className="flex flex-col items-center justify-center -translate-y-2 relative">
              <div className="absolute w-10 h-10 rounded-full bg-primary/20 animate-ping" />
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-surface bg-primary text-white shadow-md">
                <Tag size={16} />
              </div>
              <span className="text-[7px] font-black uppercase tracking-wider text-primary scale-90 mt-0.5">
                Ofertas
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <Package size={14} className="text-muted" />
            <span className="text-[8px] font-medium mt-0.5 scale-90">Pedidos</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <CreditCard size={14} className="text-muted" />
            <span className="text-[8px] font-medium mt-0.5 scale-90">Créditos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
