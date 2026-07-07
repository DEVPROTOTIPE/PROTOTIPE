<!--
{
  "technicalName": "GuidedToast",
  "targetPath": "src/components/ui/GuidedToast.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "component",
  "niches": []
}
-->

# Notificación Toast Interactiva (GuidedToast)

## 1. Propósito y Casos de Uso
El componente `GuidedToast` es un sistema de notificaciones flotantes premium diseñado para mostrar avisos informativos, sugerencias contextuales o alertas con micro-animaciones interactivas.
Está diseñado de forma **marca blanca**, removiendo cualquier dependencia estricta de stores de Zustand específicos o enrutadores rígidos, permitiendo recibir el texto y la lógica de cierre mediante callbacks e interactuar con gestores de estado externos al instante.

---

## 2. Especificación Visual y Estilos
* **Diseño e Interacción:** Tarjeta flotante compacta, posicionada en la esquina inferior del viewport.
* **Micro-interacciones:** Escala suave de entrada y salida (`scale-95` a `scale-100`) y transición elástica controlada nativamente por CSS en caso de no utilizar `framer-motion`.
* **Tokens de Color:** Adaptación nativa a variables CSS como `var(--color-primary)` y soporte claro/oscuro adaptativo.

---

## 3. Props y API del Componente
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isVisible` | `boolean` | `false` | Indica si el toast debe renderizarse en pantalla. |
| `message` | `string` | `""` | Texto principal del aviso. |
| `onClose` | `function` | `() => {}` | Callback gatillado al presionar la X de descarte. |
| `onActionClick` | `function` | `null` | Callback opcional para disparar un botón de acción secundario en la parte inferior. |
| `actionText` | `string` | `""` | Texto a renderizar dentro del botón de acción opcional. |
| `className` | `string` | `""` | Clases utilitarias de Tailwind/CSS adicionales para ajustar el layout. |
| `style` | `object` | `{}` | Estilos en línea de fallback para proyectos limpios. |
| `icon` | `ReactNode` | `null` | Ícono representativo decorativo. Si se omite, renderiza un destello (Sparkles) SVG nativo. |
| `animate` | `boolean` | `true` | Habilita las micro-transiciones de entrada/salida y pulsación elástica. |

---

## 4. Código React Completo y 100% Funcional
```jsx
import React, { useEffect } from 'react';

/**
 * Ícono Sparkles SVG Nativo (Evita dependencia obligatoria de Lucide/Heroicons)
 */
const DefaultSparklesIcon = ({ size = 20 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

/**
 * Ícono X SVG Nativo para botón de cerrar
 */
const DefaultCloseIcon = ({ size = 14 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/**
 * Componente GuidedToast - Notificación flotante e interactiva premium
 */
export default function GuidedToast({
  isVisible = false,
  message = "",
  onClose = () => {},
  onActionClick = null,
  actionText = "",
  className = "",
  style = {},
  icon = null,
  animate = true
}) {
  
  if (!isVisible || !message) return null;

  const renderedIcon = icon || <DefaultSparklesIcon size={18} />;

  // Estilos de fallback inline marca blanca
  const defaultStyles = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    width: '100%',
    maxWidth: '340px',
    backgroundColor: 'var(--color-primary, #2563eb)',
    color: '#ffffff',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.25), 0 8px 10px -6px rgba(37, 99, 235, 0.25)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    boxSizing: 'border-box',
    animation: animate ? 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
    ...style
  };

  return (
    <div style={className ? style : defaultStyles} className={className}>
      {/* Inyección de keyframes CSS nativos de respaldo */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes toastSlideIn {
          from { transform: translateY(40px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}} />

      {/* A. Contenedor del Icono Flotante Decorativo */}
      <div 
        style={{
          position: 'absolute',
          top: '-12px',
          left: '-12px',
          width: '36px',
          height: '36px',
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          color: 'var(--color-primary, #2563eb)'
        }}
      >
        {renderedIcon}
      </div>

      {/* B. Botón de Cerrar */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255, 255, 255, 0.7)',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'background-color 0.2s'
        }}
        className="hover:bg-white/10"
        aria-label="Cerrar notificación"
      >
        <DefaultCloseIcon />
      </button>

      {/* C. Mensaje */}
      <p 
        style={{
          margin: '0 20px 0 16px',
          fontSize: '13px',
          fontWeight: '700',
          lineHeight: '1.5',
          textAlign: 'left'
        }}
      >
        {message}
      </p>

      {/* D. Acción Secundaria Opcional */}
      {onActionClick && actionText && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            onClick={onActionClick}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '800',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'opacity 0.2s'
            }}
            className="hover:opacity-80"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Lógica de Estado y Ciclo de Vida
* **Controlled Component:** Recibe todas sus directivas a través de props, permitiendo controlar su descarte temporizado desde el componente que la instancia mediante un `setTimeout` o por disparadores reactivos del sistema.

---

## 6. Ejemplo de Uso (Importación y Consumo)
### Caso A: Consumo Básico en proyectos Vanilla
```jsx
import React, { useState } from 'react';
import GuidedToast from './ui/GuidedToast';

export function Catalog() {
  const [showToast, setShowToast] = useState(true);

  return (
    <div>
      <GuidedToast 
        isVisible={showToast} 
        message="¡Hola! Agrega productos a tu lista y procesaremos el envío."
        onClose={() => setShowToast(false)}
        onActionClick={() => setShowToast(false)}
        actionText="Entendido"
      />
    </div>
  );
}
```

---

## 7. Origen
* **Extraído de:** [GuidedToast.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/components/ui/GuidedToast.jsx)
* **Fecha de extracción:** 2026-05-29
* **Versión:** 1.0 (Desacoplado de `GuidedStore` e iconos externos).
