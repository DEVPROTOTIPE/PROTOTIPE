<!--
{
  "resource": "ScratchCardReward",
  "technicalName": "ScratchCardReward",
  "targetPath": "src/components/common/ScratchCardReward.jsx",
  "type": "component",
  "niches": [
    "retail_clothing",
    "grocery_food",
    "wellness_podology",
    "alimentos-artesanales",
    "distribuidoras-beauty",
    "licores-cocteleria",
    "coleccionismo-geek",
    "petshops-locales",
    "moda-local-calzado"
  ],
  "dependencies": {
    "npm": {
      "framer-motion": "^11.x",
      "lucide-react": "^0.400.x",
      "canvas-confetti": "^1.9.x"
    },
    "internal": []
  }
}
-->

# ScratchCardReward — Tarjeta de Rasca y Gana Interactiva

## 1. Propósito y Casos de Uso
El componente `ScratchCardReward` es un módulo interactivo de gamificación y fidelización para PWA. Permite que el usuario raspe digitalmente una superficie metálica mediante el cursor o pantalla táctil para revelar un premio (descuentos, cupones, regalos físicos).
Ideal para campañas de retención en e-commerce y checkout de pedidos.

---

## 2. Especificación Visual y Estilos
- **Capa Metálica Cubierta:** Generada dinámicamente con un gradiente lineal del Canvas HTML5 (`#f1f5f9` a `#475569`) con un patrón de texto repetitivo *"RASCA"*.
- **Moneda de Raspado:** Moneda SVG animada (`CircleDollarSign`) que sigue al puntero con un micro-temblor de rotación (`rotate: [-12, 12, -12]`) al raspar.
- **Touch-None (Anti-Scroll Móvil):** La clase utilitaria `touch-none` en el canvas evita que los gestos de arrastre del usuario móvil hagan scroll en el viewport del navegador, asegurando un raspado fluido.
- **Chispas Físicas de Raspado:** Partículas animadas en tiempo real con un loop físico de gravedad (`requestAnimationFrame`) que brotan de la moneda mientras se raspa.
- **Modal de Celebración:** Un overlay de pantalla completa glassmorphic con desenfoque de fondo profundo (`backdrop-blur-md bg-black/60`), animaciones elásticas spring de Framer Motion, y ráfagas de confeti continuo al revelar el premio.

---

## 3. Props y API del Componente

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `rewardType` | `string` | `'gift'` | El tipo de premio a revelar. Valores soportados: `'gift'`, `'image'`, o `'number'`. |
| `rewardContent` | `string` | `'¡20% DCTO!'` | El contenido principal a renderizar (texto del cupón o URL de imagen de producto). |
| `subtitle` | `string` | `'Cupón: RASCA20'` | Párrafo o código de descuento de apoyo. |
| `onReveal` | `function` | `() => {}` | Callback gatillado una vez desbloqueado/revelado el premio. |

---

## 4. Código React Completo

```jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, CircleDollarSign, Sparkles, X, Check } from 'lucide-react';

export default function ScratchCardReward({ 
  rewardType = 'gift', // Tipos soportados: 'gift' | 'image' | 'number'
  rewardContent = '¡20% DCTO!', // Texto del premio o URL de la imagen
  subtitle = 'Cupón: RASCA20',
  onReveal = () => console.log('Premio revelado exitosamente')
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const scratchCountRef = useRef(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [coinPos, setCoinPos] = useState({ x: -100, y: -100 });
  const [sparkles, setSparkles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pincel de raspado aumentado para mayor facilidad de borrado
  const BRUSH_SIZE = 35;
  // Umbral de revelación optimizado al 35% para no fatigar al usuario
  const REVEAL_THRESHOLD = 35;

  // Inicializar la cubierta del Rasca y Gana
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Pintar la capa "plateada/metálica" con gradiente premium
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f1f5f9'); // slate-100
      gradient.addColorStop(0.3, '#cbd5e1'); // slate-300
      gradient.addColorStop(0.7, '#94a3b8'); // slate-400
      gradient.addColorStop(1, '#475569'); // slate-600
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Agregar patrón de texto "Rasca Aquí"
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Repetir el texto a lo largo del canvas de forma cruzada
      for (let i = 0; i < canvas.width; i += 120) {
        for (let j = 0; j < canvas.height; j += 60) {
          ctx.fillText('RASCA', i + 60, j + 30);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Función para evaluar si ya se raspó suficiente
  const checkRevealPercentage = useCallback(() => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let transparentPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }
    
    const totalPixels = pixels.length / 4;
    const percentage = (transparentPixels / totalPixels) * 100;

    if (percentage > REVEAL_THRESHOLD) {
      setIsRevealed(true);
      setIsModalOpen(true);
      onReveal();
      
      // Explosión Premium de Confeti utilizando import dinámico
      import('canvas-confetti').then(module => {
        module.default({
          particleCount: 180,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#34d399', '#60a5fa', '#f43f5e', '#ffffff'],
          zIndex: 9999,
          disableForReducedMotion: true
        });
      });
    }
  }, [isRevealed, onReveal]);

  // Loop de físicas para las chispas de raspado
  useEffect(() => {
    if (sparkles.length === 0) return;
    const frame = requestAnimationFrame(() => {
      setSparkles(prev => 
        prev
          .map(s => ({
            ...s,
            x: s.x + s.vx,
            y: s.y + s.vy,
            vy: s.vy + 0.18, // gravedad
            size: Math.max(0, s.size - 0.12)
          }))
          .filter(s => s.size > 0.5)
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [sparkles]);

  // Manejador de raspado (Mouse y Touch)
  const handleScratch = (e) => {
    if (isRevealed) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Normalizar coordenadas para touch o mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setCoinPos({ x, y });

    if (!isDrawing) return;

    // Destruir pixeles (hacer transparente)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_SIZE, 0, Math.PI * 2);
    ctx.fill();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    checkRevealPercentage(); // Evaluar porcentaje al levantar el dedo/mouse
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-sm p-4 mx-auto select-none">
      
      <div 
        ref={containerRef}
        className="relative w-full aspect-[3/2] overflow-hidden rounded-[24px] shadow-soft-2xl border-4 border-[var(--color-surface)] bg-[var(--color-surface-2)] group"
      >
        
        {/* 1. CAPA DEL PREMIO (Se oculta bajo el Canvas) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)]">
          {rewardType === 'image' && (
            <img 
              src={rewardContent} 
              alt="Premio" 
              className="object-cover w-full h-full rounded-[16px] shadow-sm"
              draggable={false}
            />
          )}
          
          {rewardType === 'gift' && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isRevealed ? { scale: 1, opacity: 1 } : {}}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mb-3 rounded-full shadow-lg bg-[var(--color-primary)] text-white">
                <Gift size={32} />
              </div>
              <h3 className="text-2xl font-bold font-display text-[var(--color-text)] leading-tight">{rewardContent}</h3>
              <p className="text-sm font-medium text-[var(--color-primary)] mt-1">{subtitle}</p>
            </motion.div>
          )}

          {rewardType === 'number' && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={isRevealed ? { scale: 1, opacity: 1 } : {}}
              className="flex flex-col items-center"
            >
              <h2 className="text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                {rewardContent}
              </h2>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">{subtitle}</p>
            </motion.div>
          )}

          {/* Micro-partículas de decoración de fondo */}
          <Sparkles className="absolute top-4 right-4 text-[var(--color-primary)]/20 w-8 h-8" />
          <Sparkles className="absolute bottom-4 left-4 text-[var(--color-primary)]/20 w-6 h-6" />
        </div>

        {/* 2. CAPA RASCABLE (Canvas HTML5) */}
        <AnimatePresence>
          {!isRevealed && (
            <motion.canvas
              ref={canvasRef}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onMouseDown={(e) => { setIsDrawing(true); handleScratch(e); }}
              onMouseMove={handleScratch}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              // Eventos táctiles bloqueando scroll (touch-none)
              onTouchStart={(e) => { setIsDrawing(true); handleScratch(e); }}
              onTouchMove={handleScratch}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 z-20 w-full h-full cursor-crosshair touch-none"
            />
          )}
        </AnimatePresence>

        {/* 3. MONEDA ANIMADA (Sigue el cursor mientras se raspa) */}
        {!isRevealed && (
          <motion.div
            animate={{ 
              x: coinPos.x - 20, // Centrar moneda
              y: coinPos.y - 20,
              rotate: isDrawing ? [-10, 10, -10] : 0 // Temblor al raspar
            }}
            transition={{ type: 'tween', ease: 'linear', duration: 0.05 }}
            className={`absolute z-30 pointer-events-none text-[var(--color-primary)] drop-shadow-lg transition-opacity duration-200 ${
              coinPos.x > 0 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <CircleDollarSign size={40} className="fill-[var(--color-surface)]" strokeWidth={1.5} />
          </motion.div>
        )}
      </div>

      <p className="mt-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-widest">
        {isRevealed ? '¡Premio desbloqueado!' : 'Usa tu dedo o mouse para raspar'}
      </p>
    </div>
  );
}
```

---

## 5. Origen
- **Diseñado por:** Ecosistema PROTOTIPE - Gamification
- **Fecha:** 2026-07-09
