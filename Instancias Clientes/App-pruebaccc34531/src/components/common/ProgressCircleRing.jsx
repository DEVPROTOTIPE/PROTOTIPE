import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressCircleRing({
  value = 0, // Porcentaje 0 a 100
  size = 64, // Ancho y alto en px
  strokeWidth = 6,
  className = ''
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Limitar valor entre 0 y 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        {/* Anillo de fondo (inactivo) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-[var(--color-border)] fill-transparent"
          strokeWidth={strokeWidth}
        />

        {/* Anillo activo con animación de trazo */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-[var(--color-primary)] fill-transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>

      {/* Texto de porcentaje central */}
      <span className="absolute text-[10px] font-extrabold text-[var(--color-text)] tracking-tight">
        {Math.round(normalizedValue)}%
      </span>
    </div>
  );
}