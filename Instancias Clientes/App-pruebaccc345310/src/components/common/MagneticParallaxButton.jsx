import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function MagneticParallaxButton({
  children,
  onClick,
  disabled = false,
  className = ''
}) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values para el botón
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Motion values para el texto interno (paralaje de la mitad de velocidad)
  const textX = useMotionValue(0);
  const textY = useMotionValue(0);

  // Físicas elásticas (Springs) de suavizado
  const springConfig = { damping: 15, stiffness: 150, mass: 0.6 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springTextX = useSpring(textX, springConfig);
  const springTextY = useSpring(textY, springConfig);

  const handleMouseMove = (e) => {
    if (disabled || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Calcular vector de distancia entre el puntero y el centro del botón
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Atracción magnética limitada a un delta máximo de 30px
    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);

    // Paralaje interno de texto a la mitad (15px máximo)
    textX.set(distanceX * 0.15);
    textY.set(distanceY * 0.15);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    textX.set(0);
    textY.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.94 }}
      className={`relative flex items-center justify-center rounded-full bg-[var(--color-primary)] !text-[var(--color-text)] px-8 py-3.5 font-bold shadow-lg shadow-[var(--color-primary)]/20 transition-shadow select-none outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <motion.span
        style={{ x: springTextX, y: springTextY }}
        className="relative block pointer-events-none"
      >
        {children}
      </motion.span>
    </motion.button>
  );
}