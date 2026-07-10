<!--
{
  "resource": "PhoneIdLoginPage",
  "technicalName": "PhoneIdLoginPage",
  "targetPath": "src/pages/PhoneIdLoginPage.jsx",
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

# PhoneIdLoginPage — Página de Login Híbrida con Acceso Directo por Teléfono (ID)

## 1. Propósito y Casos de Uso

Módulo completo de autenticación de alta fidelidad que ofrece un inicio de sesión híbrido. A diferencia del flujo OTP clásico, el inicio de sesión de clientes se realiza de **forma directa utilizando únicamente el número telefónico como identificador único (ID)**, omitiendo el paso de verificación por código SMS. Esto es ideal para aplicaciones de punto de venta rápido (POS) o catálogos locales donde la fricción de autenticación debe ser mínima.

Mantiene el segundo flujo clásico para el Equipo mediante Correo y Contraseña.

---

## 2. Especificación Visual y Estilos

| Token/Clase | Uso |
|---|---|
| `var(--color-bg)` | Fondo general de la página |
| `var(--color-surface)` | Tarjeta con opacidad 85% y desenfoque de fondo `backdrop-blur-2xl` |
| `var(--color-primary)` | Botón de submit principal y pestaña activa |
| `var(--color-secondary)` | Orbe decorativo de fondo inferior |
| `var(--color-border)` | Borde translúcido de inputs y tarjeta |

---

## 3. Código React Completo

```jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function PhoneIdLoginPage({
  onLoginSuccess = (payload) => console.log("Login exitoso:", payload)
}) {
  // Estados de navegación y carga
  const [activeTab, setActiveTab] = useState('client'); // 'client' | 'admin'
  const [isLoading, setIsLoading] = useState(false);

  // Estados de formulario
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sanitización en vivo de número telefónico (sólo dígitos)
  const handlePhoneChange = (e) => {
    const sanitizedValue = e.target.value.replace(/\D/g, '');
    setPhone(sanitizedValue);
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === 'client') {
        // Simulación de autenticación directa por teléfono ID
        await new Promise(resolve => setTimeout(resolve, 1200));
        onLoginSuccess({ role: 'client', phone });
      } else {
        // Autenticación de equipo (Email / Password)
        await new Promise(resolve => setTimeout(resolve, 1500));
        onLoginSuccess({ role: 'admin', email });
      }
    } catch (error) {
      console.error("Error de autenticación directa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[500px] w-full p-4 bg-[var(--color-bg)] rounded-[24px] overflow-hidden border border-[var(--color-border)]">
      
      {/* Orbes decorativos glassmorphic de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[var(--color-primary)]/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[var(--color-secondary)]/20 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm p-6 bg-[var(--color-surface)]/85 backdrop-blur-2xl border border-[var(--color-border)] rounded-[24px] shadow-soft-2xl"
      >
        {/* Cabecera */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-display font-bold text-[var(--color-text)]">
            Acceso Rápido
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Ingresa tu identificador para continuar
          </p>
        </div>

        {/* Tabs de Selección */}
        <div className="flex p-1 mb-6 rounded-xl bg-[var(--color-surface-2)]">
          <button
            type="button"
            onClick={() => setActiveTab('client')}
            className={`relative flex-1 py-1.5 text-xs font-semibold transition-colors duration-200 z-10 ${
              activeTab === 'client' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Soy Cliente
            {activeTab === 'client' && (
              <motion.div 
                layoutId="activeTabIndicatorDirect"
                className="absolute inset-0 bg-[var(--color-surface)] rounded-lg shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`relative flex-1 py-1.5 text-xs font-semibold transition-colors duration-200 z-10 ${
              activeTab === 'admin' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Soy Equipo
            {activeTab === 'admin' && (
              <motion.div 
                layoutId="activeTabIndicatorDirect"
                className="absolute inset-0 bg-[var(--color-surface)] rounded-lg shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
          </button>
        </div>

        {/* Formularios con transiciones suaves */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            
            {/* Flujo Teléfono ID */}
            {activeTab === 'client' && (
              <motion.div
                key="client-form-direct"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-1.5"
              >
                <label className="text-[10px] font-semibold text-[var(--color-text)] uppercase tracking-wider pl-1">
                  Número de Teléfono (ID de Acceso)
                </label>
                <div className="relative flex items-center">
                  <Smartphone className="absolute left-3 text-[var(--color-text-muted)]" size={16} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="300 123 4567"
                    required
                    className="w-full h-10 pl-9 pr-3 text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                  />
                </div>
              </motion.div>
            )}

            {/* Flujo Credenciales clásicas */}
            {activeTab === 'admin' && (
              <motion.div
                key="admin-form-direct"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[var(--color-text)] uppercase tracking-wider pl-1">
                    Correo Electrónico
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 text-[var(--color-text-muted)]" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@empresa.com"
                      required
                      className="w-full h-10 pl-9 pr-3 text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[var(--color-text)] uppercase tracking-wider pl-1">
                    Contraseña
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 text-[var(--color-text-muted)]" size={16} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-10 pl-9 pr-3 text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || (activeTab === 'client' && phone.length < 10)}
            className="group relative flex items-center justify-center w-full h-11 mt-1 font-bold text-white text-xs transition-all duration-200 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="relative z-10">Ingresar al sistema</span>
                <ArrowRight className="absolute right-3.5 w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>
        </form>

      </motion.div>
    </div>
  );
}
```

---

## 4. Lógica de Estado y Ciclo de Vida

- Autenticación inmediata sin confirmación por SMS: cuando `activeTab === 'client'`, el submit ejecuta directamente `onLoginSuccess` pasando el rol `client` y el número sanitizado.

---

## 5. Origen
* **Diseño e Integridad:** Ecosistema PROTOTIPE - Fidelización y Acceso sin fricciones.
* **Fecha:** 2026-07-09
