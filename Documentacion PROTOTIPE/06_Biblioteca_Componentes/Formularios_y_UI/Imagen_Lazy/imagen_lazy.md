## Versión: 1.1.0
## Changelog:
  - v1.1.0: Robustecido con useRef y la propiedad complete nativa del objeto Image para resolver de inmediato la renderización en imágenes cacheadas por el navegador.
  - v1.0.0: Versión inicial con shimmer animado de carga, transición de fade-in y control de errores de carga.
## Instancias conocidas:
  - [App Ventas](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/ui/LazyImage.jsx)
  - [Prototipe-CLI (Ventas Template)](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/components/ui/LazyImage.jsx)

---

## 1. Propósito y Casos de Uso
El componente `LazyImage` ofrece una experiencia visual premium para la carga de recursos de imágenes en el cliente. Muestra un esqueleto de carga animado (shimmer) en lo que se descarga la imagen, y realiza una transición de opacidad suave (fade-in) al completarse. 

Está diseñado específicamente para evitar el **bug de shimmer infinito por caché**, el cual ocurre cuando el navegador carga de forma instantánea una imagen de su caché interna antes de que React logre asociar el listener `onLoad`, causando que el shimmer se muestre indefinidamente.

**Casos de uso principales:**
* Tarjetas de producto en catálogos y listas.
* Galería de imágenes y carruseles interactivos.
* Portales de ventas y visualización de comprobantes.
* Avatares de usuario y logotipos de marca.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
* **Contenedor base:** `relative overflow-hidden w-full h-full bg-surface-2` para respetar el espacio asignado por el layout.
* **Shimmer animado:** Un gradiente en HSL lineal que simula un barrido de luz mediante la animación `@keyframes shimmer` integrada.
* **Fallback de error:** Layout flex centrado con color de texto atenuado (`text-muted`), mostrando un icono de imagen roto (`lucide-react/Image`) y la leyenda `"ERROR DE CARGA"`.
* **Imagen Real:** Propiedades de ajuste de cobertura completa (`w-full h-full object-cover`) y una transición suave de opacidad (`transition-opacity duration-500 ease-out`) que cambia de `opacity-0` (oculto) a `opacity-100` (visible).

---

## 3. Código React Completo y 100% Funcional
```jsx
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
    // Si la imagen ya está almacenada en caché, el navegador activa .complete de inmediato.
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
          <span className="text-[9px] font-bold tracking-wider text-red-500">ERROR DE CARGA</span>
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

      {/* Inyección de keyframes locales para soporte universal */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
```

---

## 4. Lógica de Estado y Ciclo de Vida
* **`isLoaded` (Boolean):** Bandera reactiva que controla si el shimmer de fondo se mantiene o se oculta y si se inicia la transición de opacidad en la etiqueta `<img>`.
* **`hasError` (Boolean):** Captura fallos de red o URL rotas y cambia el renderizado a la vista de error.
* **`imgRef` (Ref):** Enlace directo al nodo DOM de la imagen para inspeccionar sus propiedades no reactivas nativas.
* **`useEffect` con dependencia `[src]`:** Se ejecuta en cuanto cambia la dirección de la imagen. Verifica si `complete` ya es `true` (caso de caché del navegador), evitando que la imagen se quede invisible al no disparar el callback de `onLoad` posterior al renderizado reactivo.

---

## 5. Flujo Operativo y Secuencia de Interacción
```
[Inicio de renderizado con nuevo src]
            │
            ▼
┌─────────────────────────┐
│     useEffect (src)     │
└───────────┬─────────────┘
            │
            ├──────► ¿imgRef.current.complete es true? (Caché detectado)
            │        │
            │        ▼
            │     [setIsLoaded(true)] ────► [Ocultar shimmer e iniciar fade-in (opacidad 100)]
            │
            └──────► No (Descargando recurso)
                     │
                     ▼
                  [setIsLoaded(false)] ───► [Mostrar shimmer animado y ocultar imagen (opacidad 0)]
                     │
                     ▼
                  (Espera a evento de red)
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
    [onLoad exitoso]       [onError fallido]
         │                       │
         ▼                       ▼
    [setIsLoaded(true)]    [setHasError(true)]
         │                       │
         ▼                       ▼
   [Mostrar imagen con     [Mostrar icono error
     efecto fade-in]         y leyenda de aviso]
```
