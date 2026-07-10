<!--
{
  "resource": "PremiumWelcomeSplash",
  "technicalName": "WelcomePage",
  "targetPath": "src/pages/WelcomePage.jsx",
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
      "lucide-react": "^0.400.x"
    },
    "internal": []
  }
}
-->

# PremiumWelcomeSplash — Pantalla de Bienvenida con Animación Sonar (Welcome Page)

## 1. Propósito y Casos de Uso

El componente `PremiumWelcomeSplash` actúa como la pantalla inicial (Splash Screen/Onboarding) de la PWA. Su objetivo es recibir al usuario de forma elegante, aplicar de forma dinámica las variables HSL corporativas del tema para teñir la interfaz, y guiar el flujo de navegación de entrada:
- **Iniciar Sesión**: Acceso autenticado (Login) para clientes y personal.
- **Explorar como Invitado**: Acceso público sin fricción (Catálogo).

---

## 2. Especificación Visual y Estilos

| Clase/Elemento | Estilo |
|---|---|
| Fondos Ambientales | Dos orbes desenfocados en esquinas opuestas (`blur-[100px] bg-[var(--color-primary)]/15`) para un look neón glassmorphic. |
| Ondas Sonar | Anillos circulares concéntricos animados por hardware que se expanden a escala `2.5x` con opacidad `0` simulando un pulso vivo. |
| Botón Primario | Fondo HSL de marca blanca con shimmer de brillo interno e icono de usuario. |
| Botón Secundario | Fondo translúcido acrílico con borde HSL sutil. |

---

## 3. Props y API del Componente

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `brandName` | `string` | `"Mi Negocio"` | Nombre comercial de la instancia de marca a destacar. |
| `tagline` | `string` | `"Organización, control y crecimiento digital."` | Eslogan secundario o propuesta de valor. |
| `onNavigateLogin` | `function` | `() => {}` | Callback gatillado al pulsar "Iniciar Sesión". |
| `onNavigateCatalog` | `function` | `() => {}` | Callback gatillado al pulsar "Explorar como invitado". |

---

## 4. Código React Completo

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Store, UserCircle } from 'lucide-react';

export default function PremiumWelcomeSplash({ 
  brandName = "Mi Negocio", 
  tagline = "Organización, control y crecimiento digital.",
  onNavigateLogin = () => console.log("Redirigiendo a Login..."),
  onNavigateCatalog = () => console.log("Redirigiendo a Catálogo...")
}) {
  
  // Variantes para la animación escalonada (Stagger) del contenido
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] w-full px-6 py-12 overflow-hidden bg-[var(--color-bg)] selection:bg-[var(--color-primary)]/30 rounded-[24px] border border-[var(--color-border)]">
      
      {/* 1. FONDOS AMBIENTALES ORGANICOS (Glow) */}
      <div className="absolute top-[-15%] left-[-10%] w-[40vw] h-[40vw] bg-[var(--color-primary)]/15 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-[var(--color-secondary)]/15 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center w-full max-w-sm"
      >
        
        {/* 2. ANIMACIÓN SONAR Y LOGOTIPO */}
        <motion.div variants={itemVariants} className="relative flex items-center justify-center mb-10">
          
          {/* Ondas Sonar (Concéntricas) */}
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeOut",
                delay: ring * 0.8,
              }}
              className="absolute inset-0 rounded-full border border-[var(--color-primary)]/40"
            />
          ))}

          {/* Contenedor del Logo Glassmorphic */}
          <div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full shadow-soft-2xl bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)]">
            <Store className="w-10 h-10 text-[var(--color-primary)]" strokeWidth={2} />
            
            {/* Insignia Sparkle flotante */}
            <motion.div 
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm text-[var(--color-primary)]"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>
        </motion.div>

        {/* 3. TEXTOS Y BIENVENIDA */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold text-[var(--color-text)] tracking-tight mb-3">
            Bienvenido a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              {brandName}
            </span>
          </h1>
          <p className="text-base text-[var(--color-text-muted)] leading-relaxed px-4">
            {tagline}
          </p>
        </motion.div>

        {/* 4. BOTONES DE ACCIÓN */}
        <motion.div variants={itemVariants} className="flex flex-col w-full gap-4">
          
          {/* Botón Primario: Login */}
          <button
            onClick={onNavigateLogin}
            className="group relative flex items-center justify-between w-full h-14 px-6 font-bold text-white transition-all duration-200 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 active:scale-95 shadow-soft-md overflow-hidden outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] cursor-pointer"
          >
            {/* Shimmer interno hover */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            
            <span className="flex items-center gap-3 relative z-10 !text-white">
              <UserCircle size={20} />
              Iniciar Sesión
            </span>
            <ArrowRight size={20} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* Botón Secundario: Explorar Catálogo */}
          <button
            onClick={onNavigateCatalog}
            className="flex items-center justify-center w-full h-14 px-6 font-semibold text-[var(--color-text)] transition-all duration-200 rounded-2xl bg-[var(--color-surface-2)]/50 backdrop-blur-md border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-primary)]/30 active:scale-95 shadow-sm outline-none cursor-pointer"
          >
            Explorar como invitado
          </button>

        </motion.div>

      </motion.div>

      {/* Footer / Metadatos */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 text-[10px] font-medium tracking-widest uppercase text-[var(--color-text-muted)] opacity-60"
      >
        Tecnología por PROTOTIPE
      </motion.div>
    </div>
  );
}
```

---

## 5. Origen
* **Diseño e Integridad:** Ecosistema PROTOTIPE - Welcome Splash Screen.
* **Fecha:** 2026-07-09
