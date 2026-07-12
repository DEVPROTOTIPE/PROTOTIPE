import React, { useState, useRef } from 'react';

export default function HolographicTiltCard({
  front,
  back,
  maxTilt = 12, // Grados máximos de inclinación
  perspective = 1000, // Perspectiva 3D
  scale = 1.03, // Escala en hover
  className = '',
  style = {}
}) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePointerMove = (clientX, clientY) => {
    if (clientX === undefined || clientY === undefined) return;
    
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (!width || !height || isNaN(width) || isNaN(height)) return;

    const pointerX = clientX - rect.left;
    const pointerY = clientY - rect.top;

    const xPct = (pointerX / width) - 0.5;
    const yPct = (pointerY / height) - 0.5;

    const rotateX = (-yPct * maxTilt).toFixed(2);
    // Inclinación leve por hover
    const rotateY = ((isFlipped ? -1 : 1) * xPct * maxTilt).toFixed(2);

    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'none' // Instantáneo para hover fluido
    });

    const glareX = (pointerX / width * 100).toFixed(2);
    const glareY = (pointerY / height * 100).toFixed(2);

    setGlareStyle({
      opacity: 0.3,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.45) 0%, color-mix(in srgb, var(--color-accent) 25%, transparent) 50%, transparent 80%)`,
      mixBlendMode: 'screen',
      transition: 'none'
    });
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 0) return;
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.55s cubic-bezier(0.19, 1, 0.22, 1)'
    });

    setGlareStyle({
      opacity: 0,
      transition: 'all 0.55s cubic-bezier(0.19, 1, 0.22, 1)'
    });
  };

  return (
    <div
      ref={cardRef}
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchStart={(e) => {
        if (e.touches.length > 0) {
          handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchEnd={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', ...tiltStyle }}
      className={`relative cursor-pointer select-none overflow-visible rounded-3xl ${className}`}
    >
      {/* Contenedor interno del Flip 3D (para aislar la rotación de 180 grados del tilt de cursor) */}
      <div
        style={{
          transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
          transition: 'transform 0.65s cubic-bezier(0.19, 1, 0.22, 1)',
          transformStyle: 'preserve-3d',
          ...style
        }}
        className="w-full h-full relative rounded-3xl"
      >
        {/* Glare reflectivo holográfico */}
        <div 
          className="absolute inset-0 pointer-events-none z-20 rounded-3xl" 
          style={{
            ...glareStyle,
            backfaceVisibility: 'hidden'
          }} 
        />

        {/* CARA FRONTAL (Detalles de Crédito) */}
        <div 
          className="w-full h-full absolute inset-0 z-10 rounded-3xl overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {front}
        </div>

        {/* CARA TRASERA (Emblema de Insignia de Negocio) */}
        <div 
          className="w-full h-full absolute inset-0 z-10 rounded-3xl overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}
