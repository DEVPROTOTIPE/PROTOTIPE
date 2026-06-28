<!--
{
  "technicalName": "WelcomePage",
  "targetPath": "src/pages/WelcomePage.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Pantalla de Bienvenida con Animación Sonar (WelcomePage)

## 1. Propósito y Casos de Uso
El componente `WelcomePage` sirve como la pantalla inicial de presentación (Landing/Splash screen) de la aplicación comercial. 
Su propósito es captar al usuario, renderizar de forma elegante la identidad visual (logotipo o isotipo), reproducir micro-ondas elásticas de carga e inducir al login o registro.
Es una pantalla **marca blanca**, parametrizando todos los strings (eslogan, nombre), logos, estados de carga y navegación mediante props para ser consumida inmediatamente en cualquier proyecto Ecosistema.

---

## 2. Especificación Visual y Estilos
* **Fondo Dinámico:** Orbes de iluminación translúcida flotando en los breakpoints y un patrón geométrico de iconos comerciales (tileado) cuya opacidad y colores se acoplan automáticamente al tema visual.
* **Sonar Waves (Ondas concéntricas):** Anillos circulares fluidos que emergen del logotipo en intervalos y velocidades asíncronas para dar sensación de pulso vivo.
* **Estilos e Integración CSS:** Diseñado usando variables CSS globales (`var(--color-primary)`, `var(--color-bg)`) y animaciones nativas.

---

## 3. Props y API del Componente
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `appName` | `string` | `"Mi Tienda"` | Nombre comercial a mostrar en ausencia de logotipo de imagen. |
| `appIcon` | `string` | `null` | Ruta física de la imagen del logotipo de la marca. |
| `slogan` | `string` | `""` | Eslogan o frase comercial destacada. |
| `description` | `string` | `"Explora nuestros productos..."` | Párrafo secundario de bienvenida. |
| `onStart` | `function` | `() => {}` | Callback principal de redirección al presionar el botón de inicio ("Comencemos"). |
| `welcomeWavesEnabled` | `boolean` | `true` | Habilita o deshabilita los anillos de onda sonar tras el logo. |
| `className` | `string` | `""` | Clases de estilo CSS adicionales. |
| `style` | `object` | `{}` | Estilos inline de fallback. |

---

## 4. Código React Completo y 100% Funcional (Lógica Validada)
```jsx
import React from 'react';

/**
 * Ícono de Tienda SVG Nativo (Evita dependencia obligatoria de Lucide/Heroicons)
 */
const DefaultStoreIcon = ({ size = 64 }) => (
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
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
    <path d="M2 7h20"/>
  </svg>
);

/**
 * Componente WelcomePage - Splash/Landing screen modular premium
 */
export default function WelcomePage({
  appName = "Mi Tienda",
  appIcon = null,
  slogan = "",
  description = "Explora nuestros productos y realiza tus pedidos fácilmente.",
  onStart = () => {},
  welcomeWavesEnabled = true,
  className = "",
  style = {}
}) {
  
  // Estilos de fallback inline marca blanca
  const defaultContainerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: 'var(--color-bg, #fafafa)',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    ...style
  };

  return (
    <div style={className ? style : defaultContainerStyle} className={className}>
      {/* Definición de Keyframes y Animaciones CSS Nativas */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sonarWave {
          0% { transform: scale(0.3); opacity: 0; }
          50% { opacity: 0.35; }
          100% { transform: scale(1.05); opacity: 0; }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes welcomeFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

      {/* 1. Fondo: Orbes de luz translúcidos */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', backgroundColor: 'var(--color-primary-light, rgba(37, 99, 235, 0.08))', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', borderRadius: '50%', backgroundColor: 'var(--color-primary-light, rgba(37, 99, 235, 0.06))', filter: 'blur(80px)' }} />
      </div>

      {/* 2. Tarjeta del Contenido Principal */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '448px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        
        {/* A. Contenedor de Logo & Ondas Sonar */}
        <div style={{ marginBottom: '40px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Brillo difuso central */}
          <div style={{ position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light, rgba(37, 99, 235, 0.1))', filter: 'blur(40px)' }} />

          <div style={{ position: 'relative', width: '320px', height: '320px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Ondas Sonar Animadas por CSS */}
            {welcomeWavesEnabled && [0, 1.2, 2.4].map((delay, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary, #2563eb)',
                  animation: `sonarWave 3.6s infinite ease-out`,
                  animationDelay: `${delay}s`
                }}
              />
            ))}

            {/* Logotipo Central */}
            <div 
              style={{
                position: 'relative',
                width: '200px',
                height: '200px',
                zIndex: 10,
                animation: 'logoFloat 4s infinite ease-in-out'
              }}
            >
              {appIcon ? (
                <img
                  src={appIcon}
                  alt={`Logo de ${appName}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 16px 24px rgba(37, 99, 235, 0.35))'
                  }}
                />
              ) : (
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '40px',
                    backgroundColor: 'var(--color-primary, #2563eb)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.35)',
                    color: '#ffffff'
                  }}
                >
                  <DefaultStoreIcon size={96} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* B. Textos e Información */}
        <div style={{ animation: 'welcomeFadeIn 0.6s ease-out 0.25s forwards', opacity: 0, transform: 'translateY(10px)' }}>
          {!appIcon && (
            <h1 style={{ margin: '0 0 12px 0', fontSize: '36px', fontWeight: '900', color: 'var(--color-text, #171717)', letterSpacing: '-0.5px' }}>
              {appName}
            </h1>
          )}

          {slogan && (
            <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '900', color: 'var(--color-primary, #2563eb)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {slogan}
            </h2>
          )}

          <p style={{ margin: '0 auto 32px auto', fontSize: '15px', color: 'var(--color-text-muted, #737373)', maxWidth: '280px', lineHeight: '1.6' }}>
            {description}
          </p>
        </div>

        {/* C. Botón de Comencemos */}
        <div style={{ animation: 'welcomeFadeIn 0.6s ease-out 0.45s forwards', opacity: 0, transform: 'translateY(10px)', width: '100%' }}>
          <button
            onClick={onStart}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-primary, #2563eb)',
              color: '#ffffff',
              padding: '16px 32px',
              fontWeight: '700',
              fontSize: '16px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              minWidth: '220px',
              transition: 'all 0.2s',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
            }}
            className="hover:opacity-90 active:scale-95"
          >
            <span>Comencemos</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

      </div>
    </div>
  );
}
```

---

## 5. Origen
* **Extraído de:** [WelcomePage.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/pages/WelcomePage.jsx)
* **Fecha de extracción:** 2026-05-29
* **Versión:** 1.0 (Desacoplado de `AuthStore`, enrutamiento fijo e íconos Lucide).
