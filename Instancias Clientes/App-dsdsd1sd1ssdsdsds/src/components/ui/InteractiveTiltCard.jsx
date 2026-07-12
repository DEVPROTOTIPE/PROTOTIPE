import React, { useRef } from 'react';

export default function InteractiveTiltCard({ 
  children, 
  enabled = false, 
  primaryColor = '#6366f1',
  className = '', 
  style = {} 
}) {
  const cardRef = useRef(null);
  const rectRef = useRef(null);

  // Guardar dimensiones al entrar para evitar layout thrashing
  const handlePointerEnter = () => {
    const card = cardRef.current;
    if (!card) return;
    rectRef.current = card.getBoundingClientRect();
  };

  const handlePointerMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    let rect = rectRef.current;
    if (!rect) {
      rect = card.getBoundingClientRect();
      rectRef.current = rect;
    }

    const width = rect.width;
    const height = rect.height;
    
    // Coordenadas relativas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Inclinación física (máx 16 grados)
    const rotateX = ((y / height) - 0.5) * -16;
    const rotateY = ((x / width) - 0.5) * 16;

    // Coordenadas del glare
    const glareX = (x / width) * 100;
    const glareY = (y / height) * 100;

    card.style.setProperty('--tilt-x', `${rotateX}deg`);
    card.style.setProperty('--tilt-y', `${rotateY}deg`);
    card.style.setProperty('--glare-x', `${glareX}%`);
    card.style.setProperty('--glare-y', `${glareY}%`);
    card.style.setProperty('--glare-opacity', '0.42');
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    
    rectRef.current = null; // Limpiar rect
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--glare-opacity', '0');
  };

  // Render plano si no está habilitado el Tilt
  if (!enabled) {
    return (
      <div 
        className={`fx-card-shell ${className}`} 
        style={{
          overflow: 'visible',
          isolation: 'isolate',
          boxShadow: 'var(--shadow-card)',
          borderRadius: 'var(--radius-card)',
          transition: 'all 250ms ease',
          ...style
        }}
      >
        <div 
          className="fx-card-clip"
          style={{
            borderRadius: 'inherit',
            overflow: 'hidden',
            background: style.background || 'var(--glass-bg, transparent)',
            backdropFilter: style.backdropFilter || 'var(--glass-blur, none)',
            WebkitBackdropFilter: style.WebkitBackdropFilter || 'var(--glass-blur, none)',
            border: style.border || '1px solid var(--color-border)',
            padding: style.padding || '0.75rem',
            height: '100%',
            width: '100%'
          }}
        >
          <div className="fx-card-content relative z-10 w-full h-full">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`fx-card-shell cursor-default ${className}`}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-card)',
        overflow: 'visible',
        isolation: 'isolate',
        boxShadow: 'var(--shadow-card)',
        transition: 'box-shadow 350ms cubic-bezier(0.25, 1, 0.5, 1)',
        ...style
      }}
    >
      <div 
        className="fx-card-tilt-plane"
        style={{
          position: 'relative',
          borderRadius: 'inherit',
          transformStyle: 'preserve-3d',
          transform: 'perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateZ(0)',
          transition: 'transform 100ms cubic-bezier(0.25, 1, 0.5, 1)',
          height: '100%',
          width: '100%'
        }}
      >
        <div 
          className="fx-card-clip"
          style={{
            position: 'relative',
            borderRadius: 'inherit',
            overflow: 'hidden',
            background: style.background || 'var(--glass-bg, transparent)',
            backdropFilter: style.backdropFilter || 'var(--glass-blur, none)',
            WebkitBackdropFilter: style.WebkitBackdropFilter || 'var(--glass-blur, none)',
            border: style.border || '1px solid var(--color-border)',
            padding: style.padding || '0.75rem',
            height: '100%',
            width: '100%'
          }}
        >
          {/* Glare reflectivo interno */}
          <div 
            className="fx-card-glare"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              pointerEvents: 'none',
              opacity: 'var(--glare-opacity, 0)',
              background: `radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.45), rgba(255,255,255,0.1) 22%, transparent 48%)`,
              mixBlendMode: 'screen',
              transition: 'opacity 250ms ease'
            }}
          />

          {/* Contenido */}
          <div className="fx-card-content relative z-10 w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
