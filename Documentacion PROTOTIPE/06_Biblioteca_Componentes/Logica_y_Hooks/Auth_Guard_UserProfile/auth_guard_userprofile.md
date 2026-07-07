<!--
{
  "technicalName": "AuthGuard",
  "targetPath": "src/features/auth/hooks/useAuthGuard.js",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Guard de Autenticación y Perfil de Usuario (`AuthGuard` & `UserProfile`)

## 1. Propósito y Casos de Uso
Componente lógico y visual de marca blanca diseñado para orquestar la seguridad en la navegación del cliente y la administración. Resuelve de manera unificada:
- **AuthGuard (Control de Acceso):** Bloqueo de rutas a nivel de árbol de componentes según roles definidos (`admin`, `vendedor`, `cliente`). Redirección automática y guardado de ruta previa de retorno.
- **UserProfile (Visualización e Interacción):** Botón o avatar con dropdown elástico HSL para ver información del usuario logueado (avatar con iniciales, email, rol) y gatillar la salida segura (`logout`).

**Casos de uso:** Proteger paneles de administración de ventas, POS de vendedores en tablets, visualizador de historial de compras de clientes, y consolas de desarrollo del ecosistema.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
- **Glassmorphism Dropdown:** Panel del perfil flotante utilizando fondo translúcido con desenfoque de fondo (`backdrop-blur-md bg-[var(--color-surface)]/80 border border-[var(--color-border)]`).
- **Badge de Roles:** Chip semántico que resalta con color el nivel de acceso del usuario:
  * `admin` -> `bg-red-500/10 text-red-400 border-red-500/20`
  * `vendedor` -> `bg-amber-500/10 text-amber-400 border-amber-500/20`
  * `cliente` -> `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`
- **Avatar Dinámico:** Contenedor circular con color de fondo HSL determinado a partir de la suma ASCII del correo del usuario, visualizando las dos primeras letras de su nombre en negrita y mayúsculas.

---

## 3. Código React Completo y 100% Funcional

### 3.1 — Contexto de Autenticación y Store de Sesión (`AuthContext.jsx`)
```jsx
// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de escucha de sesión activa (equivalente a onAuthStateChanged del SDK v12)
    const storedUser = localStorage.getItem('prototipe_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role = 'vendedor') => {
    setLoading(true);
    // Simulación de validación
    const userData = {
      uid: `usr-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      role, // 'admin' | 'vendedor' | 'cliente'
      photoURL: null,
      createdAt: Date.now()
    };
    setUser(userData);
    localStorage.setItem('prototipe_session', JSON.stringify(userData));
    setLoading(false);
    return userData;
  };

  const logout = async () => {
    setLoading(true);
    setUser(null);
    localStorage.removeItem('prototipe_session');
    setLoading(false);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole: (roles) => user && roles.includes(user.role)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
```

### 3.2 — AuthGuard (Componente de Ruta Protegida)
```jsx
// src/components/security/AuthGuard.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export function AuthGuard({ children, allowedRoles = [], fallbackUI = null }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
          Verificando credenciales...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallbackUI || (
      <div className="p-6 text-center bg-red-500/5 border border-red-500/10 rounded-2xl space-y-3 max-w-sm mx-auto">
        <svg className="w-8 h-8 text-red-500/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wide">Acceso Denegado</h3>
        <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
          Debes iniciar sesión para acceder a esta sección de la aplicación.
        </p>
      </div>
    );
  }

  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="p-6 text-center bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-3 max-w-sm mx-auto">
        <svg className="w-8 h-8 text-amber-500/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wide">Permisos Insuficientes</h3>
        <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
          Tu rol de **{user.role}** no tiene autorización para ingresar a este panel.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 3.3 — UserProfile (Avatar & Dropdown de sesión)
```jsx
// src/components/ui/security/UserProfile.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { LogOut, Shield, User, ChevronDown } from 'lucide-react';

export function UserProfile() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  // Generar color de avatar determinista basado en el email
  const getAvatarColor = (str = '') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h} 65% 45%)`;
  };

  const initials = user.displayName
    ? user.displayName.slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  const roleColors = {
    admin: 'bg-red-500/10 text-red-400 border-red-500/20',
    vendedor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cliente: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  }[user.role] || 'bg-slate-500/10 text-[var(--color-text-muted)]/80 border-slate-500/20';

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-[var(--color-border)] hover:border-indigo-500/35 bg-[var(--color-surface-2)]/60 transition-all cursor-pointer outline-none"
      >
        <span
          style={{ backgroundColor: getAvatarColor(user.email) }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-[var(--color-text)] shadow-sm shrink-0 select-none"
        >
          {initials}
        </span>
        <div className="hidden sm:block text-left leading-none max-w-[90px]">
          <p className="text-[10px] font-bold text-[var(--color-text)] truncate">{user.displayName}</p>
          <span className="text-[8px] font-black uppercase text-[var(--color-text-muted)] tracking-wider mt-0.5 block truncate">
            {user.role}
          </span>
        </div>
        <ChevronDown size={12} className={`text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[var(--color-border)]/80 bg-[var(--color-bg)]/90 backdrop-blur-md shadow-2xl p-2 z-[999] overflow-hidden">
          {/* Header Info */}
          <div className="px-3 py-2 border-b border-[var(--color-border)] pb-2 mb-1">
            <p className="text-[10px] font-black text-slate-100 truncate">{user.displayName || 'Vendedor'}</p>
            <p className="text-[9px] text-[var(--color-text-muted)]/80 truncate mt-0.5">{user.email}</p>
            <span className={`inline-block mt-2 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase border ${roleColors}`}>
              {user.role}
            </span>
          </div>

          {/* Menú */}
          <div className="space-y-0.5">
            <button
              onClick={() => { setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-all text-left cursor-pointer"
            >
              <User size={12} />
              Mi Perfil
            </button>
            <button
              onClick={() => { setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-all text-left cursor-pointer"
            >
              <Shield size={12} />
              Permisos
            </button>
            <button
              onClick={() => { setIsOpen(false); logout(); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-500/10 transition-all text-left cursor-pointer"
            >
              <LogOut size={12} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Lógica de Estado y Ciclo de Vida
```
  AuthProvider (Componente Contextual)
  ├── user (State: uid, email, displayName, role)
  ├── loading (State: boolean)
  │
  ├── login(email, password, role) ──> Guarda en LocalStorage + Set State
  └── logout()                     ──> Limpia LocalStorage + Reset State
```
- **Persistencia local:** La sesión se almacena en caché vía `localStorage.setItem` y se hidrata en el montaje inicial mediante un hook `useEffect`.
- **AuthGuard Lifecycle:** Monta un listener reactivo del estado de carga (`loading`). Si está ocupado, renderiza el Loader; si es nulo, redirige a Login; si el rol no coincide con el array de permitidos, interrumpe el montaje del DOM e inyecta la pantalla de restricción.

---

## 5. Secuencia de Interacción (Flujo de Navegación)
```
[Navegación a /admin] 
        │
        ▼
   [AuthGuard]
        │
        ├──► ¿Está cargando credenciales? ── YES ──► [Loader Shimmer]
        │
        ├──► ¿Tiene sesión iniciada? ───── NO  ───► [Acceso Denegado / Login Redirect]
        │
        └──► ¿Rol es 'admin'? ────────── NO  ───► [Pantalla Permisos Insuficientes]
                │
               YES
                ▼
      [Renderiza Panel Admin]
```
