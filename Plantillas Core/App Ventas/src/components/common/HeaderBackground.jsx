import React from 'react'
import { motion } from 'framer-motion'

export default function HeaderBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0B111E]">
      {/* Orbe amorfo 1 (Color Primario - Posicionamiento centrado en Y, lado izquierdo) */}
      <motion.div
        className="absolute -left-16 top-1/2 w-64 h-64 rounded-[40%_60%_70%_30%/_50%_60%_30%_50%] blur-2xl opacity-[0.48]"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, var(--color-primary) 30%, var(--color-primary-light) 65%, transparent 100%)',
          transform: 'translateY(-50%)',
          willChange: 'transform'
        }}
        animate={{
          x: [0, 25, -15, 0],
          y: ["-50%", "-40%", "-60%", "-50%"],
          rotate: [0, 120, 240, 360],
          borderRadius: [
            "40% 60% 70% 30% / 50% 60% 30% 50%",
            "70% 30% 50% 50% / 30% 60% 70% 40%",
            "50% 60% 30% 70% / 60% 40% 50% 50%",
            "40% 60% 70% 30% / 50% 60% 30% 50%"
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Orbe amorfo 2 (Color de Acento - Posicionamiento centrado en Y, lado derecho) */}
      <motion.div
        className="absolute -right-20 top-1/2 w-72 h-72 rounded-[50%_50%_30%_70%/_60%_40%_60%_40%] blur-2xl opacity-[0.42]"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, var(--color-accent) 35%, var(--color-primary-light) 70%, transparent 100%)',
          transform: 'translateY(-50%)',
          willChange: 'transform'
        }}
        animate={{
          x: [0, -20, 15, 0],
          y: ["-50%", "-60%", "-40%", "-50%"],
          rotate: [360, 240, 120, 0],
          borderRadius: [
            "50% 50% 30% 70% / 60% 40% 60% 40%",
            "30% 70% 60% 40% / 50% 50% 30% 70%",
            "60% 40% 50% 50% / 40% 60% 70% 30%",
            "50% 50% 30% 70% / 60% 40% 60% 40%"
          ]
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Orbe amorfo 3 (Mezcla - Zona Central, centrado en Y) */}
      <motion.div
        className="absolute left-1/3 top-1/2 w-52 h-52 rounded-[60%_40%_50%_50%/_40%_60%_50%_50%] blur-2xl opacity-[0.28]"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, var(--color-accent) 40%, var(--color-primary) 75%, transparent 100%)',
          transform: 'translateY(-50%)',
          willChange: 'transform'
        }}
        animate={{
          x: [0, 15, -15, 0],
          y: ["-50%", "-45%", "-55%", "-55%"],
          rotate: [0, -180, -360],
          borderRadius: [
            "60% 40% 50% 50% / 40% 60% 50% 50%",
            "40% 60% 70% 30% / 50% 30% 70% 50%",
            "50% 50% 30% 70% / 60% 40% 60% 40%",
            "60% 40% 50% 50% / 40% 60% 50% 50%"
          ]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
