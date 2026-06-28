<!--
{
  "technicalName": "PWAInstallBanner",
  "targetPath": "src/components/ui/PWAInstallBanner.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Banner de Instalación PWA (PWAInstallBanner)

## 1. Propósito y Casos de Uso
El componente `PWAInstallBanner` es una interfaz flotante premium e interactiva que detecta si el navegador web del usuario permite instalar la aplicación de forma nativa como una PWA (Progressive Web App) y le ofrece un flujo directo de instalación.
Para garantizar su **marca blanca y portabilidad absoluta**, se han removido los hooks propietarios y las dependencias duras de stores o librerías de iconos. El componente se encarga puramente de pintar la interfaz responsiva, recibiendo las acciones y estados lógicos a través de callbacks.

---

## 2. Especificación Visual y Estilos
* **Visual:** Tarjeta translúcida con fondo difuminado y micro-sombra para dar sensación de flotación premium.
* **Layout:** Adaptable a móviles ( Bottom Sheet flotante de ancho completo) y escritorio (caja lateral fija alineada a la derecha).
* **Animaciones:** Animación de rebote discreta en el botón de descarga para incentivar el click.

---

## 3. Props y API del Componente
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isInstallable` | `boolean` | `false` | Indica si el banner debe mostrarse (se calcula en base al evento `beforeinstallprompt`). |
| `onInstall` | `function` | `() => {}` | Callback invocado cuando el usuario confirma la instalación nativa. |
| `onDismiss` | `function` | `() => {}` | Callback invocado al descartar temporalmente o de forma permanente el banner. |
| `title` | `string` | `"Instalar Aplicación"` | Título de cabecera configurable. |
| `subtitle` | `string` | `"Accede al instante a la tienda desde tu pantalla..."` | Texto descriptivo del banner. |
| `className` | `string` | `""` | Clases utilitarias adicionales. |
| `style` | `object` | `{}` | Estilos inline de fallback. |
| `downloadIcon` | `ReactNode` | `null` | Ícono decorativo para el botón de descarga. Si se omite, renderiza un SVG nativo con rebote animado. |

---

## 4. Código React Completo y 100% Funcional
```jsx
import React from 'react';

/**
 * Ícono de Descarga SVG Nativo (Evita dependencia obligatoria de Lucide/Heroicons)
 */
const DefaultDownloadIcon = ({ size = 20 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);

/**
 * Ícono X SVG Nativo para cerrar
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
 * Componente PWAInstallBanner - Banner premium para disparar la instalación nativa de PWA
 */
export default function PWAInstallBanner({
  isInstallable = false,
  onInstall = () => {},
  onDismiss = () => {},
  title = "Instalar Aplicación",
  subtitle = "Accede al instante a la tienda desde tu pantalla de inicio y navega de forma más rápida y fluida.",
  className = "",
  style = {},
  downloadIcon = null
}) {
  
  if (!isInstallable) return null;

  const renderedIcon = downloadIcon || <DefaultDownloadIcon />;

  // Estilos de fallback inline
  const defaultStyles = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    left: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    borderRadius: '24px',
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-border, rgba(229, 229, 229, 1))',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    boxSizing: 'border-box',
    animation: 'pwaSlideUp 0.3s ease-out forwards',
    ...style
  };

  return (
    <div 
      style={className ? style : defaultStyles} 
      className={`md:left-auto md:right-6 md:w-[360px] ${className}`}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pwaSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes downloadBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}} />

      {/* A. Fila Cabecera */}
      <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
        <div 
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-primary-light, rgba(37, 99, 235, 0.1))',
            color: 'var(--color-primary, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            animation: 'downloadBounce 2.5s infinite ease-in-out'
          }}
        >
          {renderedIcon}
        </div>

        <div style={{ flex: 1, minWidth: 0, paddingRight: '24px', textAlign: 'left' }}>
          <h4 style={{ margin: 0, fontWeight: '800', fontSize: '14px', color: 'var(--color-text, #171717)', lineHeight: '1.2' }}>{title}</h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--color-text-muted, #737373)', lineHeight: '1.4' }}>{subtitle}</p>
        </div>

        {/* Botón Cerrar */}
        <button
          onClick={() => onDismiss(false)} // false representa descarte permanente
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted, #737373)',
            transition: 'background-color 0.2s'
          }}
          className="hover:bg-neutral-100"
          aria-label="Cerrar permanentemente"
        >
          <DefaultCloseIcon />
        </button>
      </div>

      {/* B. Acciones (Botones) */}
      <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
        <button
          onClick={() => onDismiss(true)} // true representa Recordar más tarde
          style={{
            flex: 1,
            height: '38px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '700',
            color: 'var(--color-text-muted, #737373)',
            backgroundColor: 'var(--color-surface-2, #f5f5f5)',
            border: '1px solid var(--color-border, rgba(229, 229, 229, 1))',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          className="hover:opacity-80 active:scale-95"
        >
          Recordar más tarde
        </button>
        <button
          onClick={onInstall}
          style={{
            flex: 1,
            height: '38px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '900',
            color: '#ffffff',
            backgroundColor: 'var(--color-primary, #2563eb)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
          }}
          className="hover:opacity-90 active:scale-95"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}
```

---

## 5. Lógica del Custom Hook de Respaldo (`usePWAInstall`)
Para operar de forma limpia con los eventos del sistema operativo del cliente, se recomienda utilizar el siguiente custom hook en el componente contenedor principal:
```javascript
import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    const permanentDismiss = localStorage.getItem('pwa-dismissed') === 'true';
    if (permanentDismiss) return true;

    const graceTime = localStorage.getItem('pwa-remind-later');
    if (graceTime) {
      const hoursPassed = (Date.now() - Number(graceTime)) / (1000 * 60 * 60);
      if (hoursPassed < 24) return true; // Período de gracia de 24 horas activo
    }
    return false;
  });

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstallable(false);
    }
  };

  const dismissPrompt = (remindLater = false) => {
    if (remindLater) {
      localStorage.setItem('pwa-remind-later', Date.now().toString());
    } else {
      localStorage.setItem('pwa-dismissed', 'true');
    }
    setIsDismissed(true);
  };

  return { isInstallable: isInstallable && !isDismissed, handleInstall, dismissPrompt };
}
```

---

## 6. Origen
* **Extraído de:** [PWAInstallBanner.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/components/ui/PWAInstallBanner.jsx)
* **Fecha de extracción:** 2026-05-29
* **Versión:** 1.0 (Desacoplado de hooks específicos y Lucide Icons).
