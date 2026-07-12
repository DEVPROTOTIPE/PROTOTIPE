import { useState, useEffect, useRef } from 'react'
import { Image as ImageIcon } from 'lucide-react'

/**
 * Componente de Imagen Premium con soporte para carga perezosa (Lazy Load),
 * efecto de esqueleto animado (shimmer) y transición de entrada suave (fade-in).
 */
export default function LazyImage({ src, alt, className = '', style = {}, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true)
    } else {
      setIsLoaded(false)
    }
  }, [src])

  return (
    <div className={`relative overflow-hidden w-full h-full bg-surface-2 ${className}`}>
      {/* 1. Esqueleto de Carga (Shimmer Effect) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-surface-2 via-surface/30 to-surface-2 bg-[length:200%_100%] animate-pulse" 
          style={{
            backgroundImage: 'linear-gradient(90deg, var(--color-surface-2) 25%, var(--color-bg) 50%, var(--color-surface-2) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear'
          }}
        />
      )}

      {/* 2. Fallback de Error */}
      {hasError ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-muted p-2 bg-surface-2">
          <ImageIcon size={20} className="opacity-30 mb-1" />
          <span className="text-[9px] font-bold tracking-wider">ERROR DE CARGA</span>
        </div>
      ) : (
        /* 3. Imagen Real */
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={style}
          {...props}
        />
      )}

      {/* Inyectar la keyframe de shimmer si no existe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
