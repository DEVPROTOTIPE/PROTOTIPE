import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import useAppConfigStore from '../../../store/appConfigStore'
import { useAds } from '../../../hooks/useAds'
import { useProducts } from '../../../hooks/useInventory'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CatalogBanner({ onAction }) {
  const { catalogBanner } = useAppConfigStore()
  const { data: ads = [] } = useAds()
  const { data: products = [] } = useProducts(true)

  // Filtrar anuncios activos en el rango de fechas
  const activeAds = ads.filter(ad => {
    if (!ad.active) return false
    const today = new Date().toISOString().split('T')[0]
    return today >= ad.startDate && today <= ad.endDate
  })

  // Configuración de Embla Carousel con plugin de Autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()
  const scrollTo = (index) => emblaApi && emblaApi.scrollTo(index)

  // Lógica principal de ejecución de la acción
  const handleBannerClick = (e, ad, linkedProduct) => {
    if (e) {
      e.stopPropagation()
    }
    
    console.log("[CatalogBanner] Dispatching action for ad", ad.id || ad.title, ad)
    
    if (!onAction) {
      console.warn("[CatalogBanner] onAction is not defined!")
      return
    }

    if (ad.type === 'inventory') {
      if (linkedProduct) {
        onAction({ type: 'product', value: linkedProduct, ad: ad, fromBanner: true })
      } else {
        console.warn("[CatalogBanner] linkedProduct not found for inventory ad, falling back to modal view!")
        onAction({ 
          type: 'modal', 
          ad: ad,
          fromBanner: true
        })
      }
    } else {
      onAction({ 
        type: ad.ctaAction || 'modal', 
        value: ad.ctaValue, 
        ad: ad,
        fromBanner: true
      })
    }
  }

  // Si no hay anuncios activos, mostramos el banner estático por defecto
  if (activeAds.length === 0) {
    if (!catalogBanner || catalogBanner.type === 'none') {
      return null
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        style={{ willChange: 'opacity' }}
        className="max-w-7xl mx-auto px-4 md:px-8 mt-4"
      >
        <div 
          className="w-full h-36 sm:h-44 md:h-52 rounded-3xl overflow-hidden relative shadow-sm border border-app flex items-center justify-center"
          style={
            catalogBanner.type === 'gradient' 
              ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }
              : {}
          }
        >
          {catalogBanner.type === 'image' && catalogBanner.value ? (
            <>
              <img 
                src={catalogBanner.value} 
                alt="Banner del catálogo" 
                className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-black/25" />
            </>
          ) : null}

          {catalogBanner.type === 'gradient' && (
            <h2 className="relative z-10 text-white font-bold text-xl sm:text-2xl md:text-3xl tracking-tight text-center px-4 drop-shadow-md">
              Descubre nuestra colección
            </h2>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      style={{ willChange: 'opacity' }}
      className="max-w-7xl mx-auto px-4 md:px-8 mt-4 relative group"
    >
      {/* Definición de Keyframes de Animaciones Premium */}
      <style>{`
        @keyframes shimmer-sweep {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(550%) skewX(-25deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 15px 2px color-mix(in srgb, var(--color-primary) 35%, transparent);
            border-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
          }
          50% { 
            box-shadow: 0 0 25px 6px color-mix(in srgb, var(--color-primary) 70%, transparent);
            border-color: color-mix(in srgb, var(--color-primary) 90%, transparent);
          }
        }
        .animate-shimmer-sweep {
          animation: shimmer-sweep 4s infinite linear;
        }
        .animate-glow-pulse {
          animation: glow-pulse 3s infinite ease-in-out;
        }
      `}</style>

      {/* Viewport de Embla Carousel */}
      <div className="overflow-hidden w-full rounded-3xl" ref={emblaRef}>
        {/* Contenedor de Embla (flex) */}
        <div className="flex">
          {activeAds.map((ad, idx) => {
            const linkedProduct = ad.type === 'inventory' ? products.find(p => p.id === ad.productId) : null
            
            const bgStyle = ad.type === 'custom' && ad.colors?.bg 
              ? { background: ad.colors.bg } 
              : { background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }

            const textStyle = ad.type === 'custom' && ad.colors?.text
              ? { color: ad.colors.text }
              : { color: '#ffffff' }

            const bannerImg = ad.type === 'inventory' 
              ? (ad.customBanner || linkedProduct?.imageUrl) 
              : (ad.banner || ad.image)

            return (
              <div 
                key={ad.id || idx}
                className="flex-[0_0_100%] min-w-0 group/slide"
              >
                <div 
                  onClick={(e) => handleBannerClick(e, ad, linkedProduct)}
                  className={`w-full h-40 sm:h-48 md:h-56 relative flex items-center cursor-pointer pointer-events-auto rounded-3xl overflow-hidden transition-all duration-500 border border-white/5 shadow-sm hover:shadow-[0_20px_45px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]`}
                >
                  {/* Imagen de fondo que abarca todo el anuncio de forma uniforme */}
                  {bannerImg ? (
                    <img 
                      src={bannerImg} 
                      alt={ad.title || 'Promoción'} 
                      className="absolute inset-0 w-full h-full object-cover animate-fade-in transition-transform duration-[2000ms] ease-out group-hover/slide:scale-105 z-0"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-800" />
                  )}

                  {/* Gradiente de overlay asimétrico (oscurece el lado del texto en la izquierda, deja el producto brillante en la derecha) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/40 to-transparent z-10 pointer-events-none" />

                  {/* Haz de luz de Shimmer (Incita a hacer clic) */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                    <div className="w-[30%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent absolute top-0 left-0 animate-shimmer-sweep animate-pulse pointer-events-none" />
                  </div>

                  {/* Sello Flotante de Descuento ("Sticker" 3D en la Esquina Superior Derecha) */}
                  {ad.type === 'inventory' && linkedProduct && (
                    <div 
                      className="absolute top-3.5 right-3.5 z-30 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center shadow-lg shadow-primary/20 border border-white/20 rotate-12 group-hover/slide:rotate-0 group-hover/slide:scale-110 transition-all duration-500 select-none"
                      style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
                    >
                      <span className="leading-none text-[8px] sm:text-[9px] uppercase tracking-widest opacity-90 font-black">Ahorra</span>
                      <span className="leading-none mt-1 text-xs sm:text-sm font-black tracking-tight drop-shadow-sm">
                        {ad.discountType === 'percentage' 
                          ? `${ad.discountValue}%` 
                          : `-$${ad.discountValue.toLocaleString()}`}
                      </span>
                    </div>
                  )}

                  {/* Contenido del Anuncio */}
                  <div className="relative z-30 px-6 sm:px-10 md:px-12 py-4 sm:py-5 flex flex-col justify-center gap-y-3.5 h-full text-left max-w-sm sm:max-w-md md:max-w-xl">
                    <div>
                      {ad.type === 'inventory' ? (
                        <span className="relative overflow-hidden bg-amber-400 text-black px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm w-max mb-2 flex items-center gap-1 border-none font-bold">
                          ⚡ Oferta Relámpago
                          {/* Haz de luz de destello metalizado */}
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/55 to-transparent -translate-x-full animate-[shimmer-sweep_3.5s_infinite_linear] pointer-events-none" />
                        </span>
                      ) : (
                        <span className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full text-[9px] font-black shadow-md w-max mb-2 flex items-center gap-1 uppercase text-white tracking-wider">
                          {ad.category || 'Promoción Especial'}
                          {/* Haz de luz de destello metalizado */}
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-[shimmer-sweep_4.5s_infinite_linear] pointer-events-none" />
                        </span>
                      )}
                      
                      <h2 className="font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight leading-tight text-white drop-shadow-md line-clamp-2 mt-1">
                        {ad.type === 'inventory' 
                          ? (ad.customTitle || linkedProduct?.nombre || 'Oferta Especial') 
                          : ad.title}
                      </h2>
                      
                      <p className="text-[10px] sm:text-xs tracking-normal font-medium text-neutral-200 opacity-90 mb-1 drop-shadow-md mt-1.5 line-clamp-2 max-w-xs sm:max-w-sm md:max-w-md leading-relaxed">
                        {ad.type === 'inventory' 
                          ? (linkedProduct?.descripcion || 'Descuentos increíbles por tiempo limitado.') 
                          : ad.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBannerClick(e, ad, linkedProduct)
                        }}
                        className="px-5 h-9 bg-white text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl active:scale-95 transition-all duration-300 hover:bg-neutral-100 shadow-md shadow-black/10 border-none cursor-pointer flex items-center justify-center"
                      >
                        {ad.type === 'inventory' ? 'Comprar Ahora' : (ad.ctaText || 'Aprovechar Oferta')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Controles de Navegación del Carrusel (Solo si hay más de 1) */}
      {activeAds.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              scrollPrev()
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 cursor-pointer border border-white/10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              scrollNext()
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 cursor-pointer border border-white/10"
          >
            <ChevronRight size={16} />
          </button>

          {/* Puntos de Paginación */}
          <div className="absolute bottom-4 right-10 flex gap-1.5 z-20 items-center">
            {activeAds.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  scrollTo(idx)
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none ${
                  idx === selectedIndex ? 'bg-primary w-5' : 'bg-white/40 w-1.5 hover:bg-white/70'
                }`}
                aria-label={`Ver imagen ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
