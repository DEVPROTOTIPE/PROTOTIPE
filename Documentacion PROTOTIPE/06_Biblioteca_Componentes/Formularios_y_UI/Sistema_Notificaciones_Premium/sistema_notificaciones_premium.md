# Sistema de Notificaciones Premium

## 1. Propósito y Casos de Uso

Sistema de notificaciones **100% agnóstico** compuesto por 3 capas independientes y orquestadas por un único store Zustand:

| Capa | Componente | Descripción |
|---|---|---|
| 1 | `NotificationBell` | Ícono de campana flotante en esquina con badge de conteo |
| 2 | `NotificationTray` | Bandeja desplegable tipo panel con listado histórico, filtros y acciones |
| 3 | `ToastStack` | Sistema de toasts flotantes apilados, configurable por instancia |

**Casos de uso:** E-commerce (nuevo pedido), CRM (acción requerida), apps Ecosistema (alertas del sistema), apps de servicios (estado de tarea/orden).

---

## 2. Especificación Visual y Estilos

### Tokens de Diseño
```css
/* Se integra en cualquier sistema HSL vía variables CSS */
--notification-success: hsl(145 65% 42%);
--notification-error:   hsl(0 75% 55%);
--notification-warning: hsl(38 90% 50%);
--notification-info:    hsl(220 80% 60%);
--notification-event:   hsl(270 80% 65%);
--notification-mention: hsl(195 80% 50%);
```

### Jerarquía Visual
- **Bell:** Botón circular glassmorphism + badge pulsante rojo cuando hay no-leídas
- **Tray:** Panel 380px, borde suave, blur de fondo, scroll interno, pestañas Todas/No-leídas
- **Toast:** Píldora `max-w-sm`, borde izquierdo de 3px del color semántico, barra de progreso, sombra de color

---

## 3. Código React Completo y 100% Funcional

### 3.1 — Store de Notificaciones (Zustand)

```javascript
// src/stores/useNotificationStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

let toastIdCounter = 0;

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      // ── Notificaciones persistidas (historial) ──────────────────────────────
      notifications: [],

      // ── Toasts efímeros (solo en memoria, no persistidos) ─────────────────
      toasts: [],

      // ── Panel de bandeja ───────────────────────────────────────────────────
      isTrayOpen: false,

      // ─── Acciones de Notificaciones ────────────────────────────────────────

      /** Añadir notificación al historial + disparar toast automáticamente */
      addNotification: ({ type = 'info', title, message, action, duration }) => {
        const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const notification = {
          id,
          type,
          title,
          message,
          action,     // { label: string, onClick: fn } opcional
          read: false,
          createdAt: Date.now(),
        };

        set(state => ({
          notifications: [notification, ...state.notifications].slice(0, 100),
        }));

        // Dispara toast automáticamente
        get().addToast({ id, type, title, message, action, duration });
      },

      markRead: (id) => set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),

      markAllRead: () => set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      })),

      removeNotification: (id) => set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),

      clearAll: () => set({ notifications: [] }),

      // ─── Acciones de Toasts ────────────────────────────────────────────────

      /**
       * Añadir un toast manualmente (sin registrar en historial)
       * Configuración por instancia:
       *   - duration: milisegundos (0 = no auto-descartar)
       *   - pauseOnHover: boolean
       *   - showProgress: boolean
       *   - action: { label, onClick }
       */
      addToast: ({
        id,
        type = 'info',
        title,
        message,
        action,
        duration = 4500,
        pauseOnHover = true,
        showProgress = true,
      }) => {
        const toastId = id || `toast-${++toastIdCounter}`;
        const toast = {
          id: toastId,
          type,
          title,
          message,
          action,
          duration,
          pauseOnHover,
          showProgress,
          createdAt: Date.now(),
        };
        set(state => ({
          toasts: [...state.toasts, toast].slice(-5), // máximo 5 apilados
        }));
      },

      removeToast: (id) => set(state => ({
        toasts: state.toasts.filter(t => t.id !== id),
      })),

      // ─── Tray ─────────────────────────────────────────────────────────────
      openTray: () => set({ isTrayOpen: true }),
      closeTray: () => set({ isTrayOpen: false }),
      toggleTray: () => set(state => ({ isTrayOpen: !state.isTrayOpen })),
    }),
    {
      name: 'app-notifications',
      partialize: (state) => ({ notifications: state.notifications }), // solo historial persiste
    }
  )
);

// ── Selector derivado ─────────────────────────────────────────────────────────
export const useUnreadCount = () =>
  useNotificationStore(state => state.notifications.filter(n => !n.read).length);
```

---

### 3.2 — Íconos semánticos por tipo

```javascript
// src/components/ui/notifications/notificationUtils.js
import {
  CheckCircle2, XCircle, AlertTriangle, Info,
  ShoppingBag, AtSign
} from 'lucide-react';

export const NOTIFICATION_CONFIG = {
  success: {
    Icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    barColor: 'bg-emerald-500',
    label: 'Éxito',
  },
  error: {
    Icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    barColor: 'bg-red-500',
    label: 'Error',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    barColor: 'bg-amber-500',
    label: 'Advertencia',
  },
  info: {
    Icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    barColor: 'bg-blue-500',
    label: 'Info',
  },
  event: {
    Icon: ShoppingBag,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
    barColor: 'bg-purple-500',
    label: 'Evento',
  },
  mention: {
    Icon: AtSign,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/40',
    barColor: 'bg-cyan-500',
    label: 'Mención',
  },
};

export function timeAgo(ts) {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return 'Ahora';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  return `${Math.floor(secs / 86400)}d`;
}
```

---

### 3.3 — NotificationBell (campana + badge)

```jsx
// src/components/ui/notifications/NotificationBell.jsx
import React, { useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore, useUnreadCount } from '../../../stores/useNotificationStore';
import { NotificationTray } from './NotificationTray';
import { createPortal } from 'react-dom';

export function NotificationBell() {
  const { isTrayOpen, toggleTray, closeTray } = useNotificationStore();
  const unread = useUnreadCount();
  const bellRef = useRef(null);

  // Cerrar al clic fuera
  useEffect(() => {
    if (!isTrayOpen) return;
    const handler = (e) => {
      if (!document.getElementById('notification-tray-portal')?.contains(e.target) &&
          !bellRef.current?.contains(e.target)) {
        closeTray();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isTrayOpen, closeTray]);

  return (
    <>
      {/* Campana */}
      <motion.button
        ref={bellRef}
        onClick={toggleTray}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className={`relative p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
          isTrayOpen
            ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-400'
            : 'bg-[var(--color-surface-2)]/60 border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-indigo-500/30'
        }`}
        aria-label={`Notificaciones${unread > 0 ? ` (${unread} sin leer)` : ''}`}
        aria-expanded={isTrayOpen}
      >
        <motion.div
          animate={unread > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
        >
          <Bell size={17} strokeWidth={1.8} />
        </motion.div>

        {/* Badge */}
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full shadow-lg shadow-red-500/30 pointer-events-none"
            >
              {unread > 99 ? '99+' : unread}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulso cuando hay no-leídas */}
        {unread > 0 && !isTrayOpen && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-400 rounded-full opacity-40 animate-ping pointer-events-none" />
        )}
      </motion.button>

      {/* Portal de la bandeja */}
      {createPortal(<NotificationTray bellRef={bellRef} />, document.body)}
    </>
  );
}
```

---

### 3.4 — NotificationTray (bandeja desplegable)

```jsx
// src/components/ui/notifications/NotificationTray.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Trash2, CheckCheck, X, ChevronRight } from 'lucide-react';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { NOTIFICATION_CONFIG, timeAgo } from './notificationUtils';

export function NotificationTray({ bellRef }) {
  const {
    notifications, isTrayOpen, closeTray,
    markRead, markAllRead, removeNotification, clearAll,
  } = useNotificationStore();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unread = notifications.filter(n => !n.read).length;

  // Posición relativa a la campana
  const bellRect = bellRef?.current?.getBoundingClientRect();
  const style = bellRect
    ? {
        position: 'fixed',
        top: bellRect.bottom + 8,
        right: window.innerWidth - bellRect.right,
        zIndex: 9999,
      }
    : { position: 'fixed', top: 72, right: 16, zIndex: 9999 };

  return (
    <AnimatePresence>
      {isTrayOpen && (
        <>
          {/* Backdrop invisible para cerrar */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={closeTray}
          />

          <motion.div
            id="notification-tray-portal"
            initial={{ opacity: 0, scale: 0.94, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={style}
            className="w-[380px] max-h-[520px] flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/40 shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-indigo-400" />
                <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wide">
                  Notificaciones
                </h3>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[9px] font-black rounded-full">
                    {unread} nuevas
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Marcar todas como leídas"
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-emerald-400 transition-all cursor-pointer"
                  >
                    <CheckCheck size={13} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    title="Limpiar todo"
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <button
                  onClick={closeTray}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-1 px-3 py-2 border-b border-[var(--color-border)]/50 shrink-0">
              {['all', 'unread'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    filter === f
                      ? 'bg-indigo-600 text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                  }`}
                >
                  {f === 'all' ? 'Todas' : `Sin leer (${unread})`}
                </button>
              ))}
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-[var(--color-text-muted)]">
                  <BellOff size={28} strokeWidth={1.2} className="opacity-30" />
                  <p className="text-xs font-bold opacity-50">
                    {filter === 'unread' ? 'Todo al día ✓' : 'Sin notificaciones'}
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markRead}
                      onRemove={removeNotification}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NotificationItem({ notification, onRead, onRemove }) {
  const cfg = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.info;
  const Icon = cfg.Icon;

  const handleClick = () => {
    onRead(notification.id);
    if (notification.action?.onClick) notification.action.onClick();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`group border-b border-[var(--color-border)]/40 transition-colors ${
        !notification.read
          ? 'bg-indigo-500/[0.04] hover:bg-indigo-500/[0.07]'
          : 'hover:bg-[var(--color-surface-2)]/40'
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Indicador no-leído */}
        <div className="flex items-start gap-2 shrink-0 mt-0.5">
          {!notification.read && (
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
          )}
          <div className={`p-1.5 rounded-xl ${cfg.bg} ${notification.read ? 'ml-3.5' : ''}`}>
            <Icon size={13} className={cfg.color} />
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
          <p className={`text-[11px] font-bold leading-snug truncate ${
            !notification.read ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
          }`}>
            {notification.title}
          </p>
          {notification.message && (
            <p className="text-[10px] text-[var(--color-text-muted)] opacity-80 line-clamp-2 mt-0.5 leading-relaxed">
              {notification.message}
            </p>
          )}
          {notification.action && (
            <button
              onClick={(e) => { e.stopPropagation(); notification.action.onClick?.(); onRead(notification.id); }}
              className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold ${cfg.color} hover:opacity-80 transition-opacity cursor-pointer`}
            >
              {notification.action.label}
              <ChevronRight size={10} />
            </button>
          )}
          <span className="text-[9px] text-[var(--color-text-muted)] opacity-50 mt-1 block">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        {/* Eliminar */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(notification.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-[var(--color-text-muted)] transition-all cursor-pointer shrink-0"
        >
          <X size={11} />
        </button>
      </div>
    </motion.div>
  );
}
```

---

### 3.5 — ToastStack (toasts flotantes apilados)

```jsx
// src/components/ui/notifications/ToastStack.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNotificationStore } from '../../../stores/useNotificationStore';
import { NOTIFICATION_CONFIG } from './notificationUtils';

export function ToastStack() {
  const { toasts, removeToast } = useNotificationStore();
  return createPortal(
    <div
      className="fixed bottom-5 right-5 z-[10000] flex flex-col-reverse gap-2.5 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="sync">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            index={index}
            total={toasts.length}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

function ToastItem({ toast, index, total, onDismiss }) {
  const cfg = NOTIFICATION_CONFIG[toast.type] || NOTIFICATION_CONFIG.info;
  const Icon = cfg.Icon;
  const [progress, setProgress] = useState(100);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);
  const remainingRef = useRef(toast.duration);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!toast.duration || toast.duration === 0) return;

    const tick = 50; // ms
    const decrement = (tick / toast.duration) * 100;

    const start = () => {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const next = prev - decrement;
          if (next <= 0) {
            clearInterval(intervalRef.current);
            onDismiss();
            return 0;
          }
          return next;
        });
      }, tick);
    };

    if (!paused) start();

    return () => clearInterval(intervalRef.current);
  }, [paused, toast.duration]);

  const handleMouseEnter = () => {
    if (toast.pauseOnHover) {
      clearInterval(intervalRef.current);
      remainingRef.current = (progress / 100) * toast.duration;
      setPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (toast.pauseOnHover) setPaused(false);
  };

  // Apilamiento visual: los más viejos se reducen de tamaño
  const scale = index === total - 1 ? 1 : 1 - (total - 1 - index) * 0.03;
  const opacity = index === total - 1 ? 1 : 1 - (total - 1 - index) * 0.15;
  const translateY = index === total - 1 ? 0 : (total - 1 - index) * -6;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.85 }}
      animate={{
        opacity,
        x: 0,
        scale,
        y: translateY,
        transition: { type: 'spring', damping: 24, stiffness: 260 },
      }}
      exit={{ opacity: 0, x: 80, scale: 0.85, transition: { duration: 0.2 } }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="pointer-events-auto w-[340px] max-w-[calc(100vw-2.5rem)]"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border ${cfg.border} bg-[var(--color-surface)] shadow-xl shadow-black/20`}
        style={{ borderLeftWidth: 3, borderLeftColor: `var(--notification-${toast.type}, currentColor)` }}
      >
        {/* Barra de progreso */}
        {toast.showProgress && toast.duration > 0 && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--color-border)]">
            <motion.div
              className={`h-full ${cfg.barColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-start gap-3 p-3.5 pt-4">
          {/* Ícono */}
          <div className={`p-1.5 rounded-xl shrink-0 ${cfg.bg}`}>
            <Icon size={14} className={cfg.color} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="text-[11px] font-black text-[var(--color-text)] leading-tight">
                {toast.title}
              </p>
            )}
            {toast.message && (
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            )}
            {toast.action && (
              <button
                onClick={() => { toast.action.onClick?.(); onDismiss(); }}
                className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold ${cfg.color} hover:opacity-80 cursor-pointer`}
              >
                {toast.action.label}
                <ChevronRight size={9} />
              </button>
            )}
          </div>

          {/* Cerrar */}
          <button
            onClick={onDismiss}
            className="shrink-0 p-1 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
```

---

### 3.6 — Punto de montaje en App.jsx

```jsx
// En el componente raíz de la aplicación (App.jsx o Layout.jsx)
import { NotificationBell } from './components/ui/notifications/NotificationBell';
import { ToastStack } from './components/ui/notifications/ToastStack';

function App() {
  return (
    <>
      {/* En el header/topbar */}
      <header>
        {/* ... otros elementos ... */}
        <NotificationBell />
      </header>

      {/* Globalmente en el root, fuera de cualquier contenedor */}
      <ToastStack />

      {/* Rutas y contenido principal */}
    </>
  );
}
```

---

### 3.7 — API de Uso (Hook simplificado)

```javascript
// Hook de fachada para uso en cualquier componente/servicio
import { useNotificationStore } from '../stores/useNotificationStore';

function useNotify() {
  const { addNotification, addToast } = useNotificationStore();

  return {
    // Toast + registro en historial
    success: (title, message, options) =>
      addNotification({ type: 'success', title, message, ...options }),
    error: (title, message, options) =>
      addNotification({ type: 'error', title, message, ...options }),
    warning: (title, message, options) =>
      addNotification({ type: 'warning', title, message, ...options }),
    info: (title, message, options) =>
      addNotification({ type: 'info', title, message, ...options }),
    event: (title, message, options) =>
      addNotification({ type: 'event', title, message, ...options }),
    mention: (title, message, options) =>
      addNotification({ type: 'mention', title, message, ...options }),

    // Solo toast efímero (sin historial)
    toast: (options) => addToast(options),
  };
}

// Ejemplo de uso en cualquier componente:
// const notify = useNotify();
// notify.success('Pedido confirmado', 'Tu pedido #1234 fue procesado.');
// notify.error('Error de pago', 'Tarjeta rechazada.', { duration: 0 }); // No auto-descarta
// notify.event('Nuevo pedido', 'Mesa 4 acaba de ordenar.', { action: { label: 'Ver pedido', onClick: () => navigate('/orders') } });
```

---

## 4. Lógica de Estado y Ciclo de Vida

```
useNotificationStore (Zustand + persist)
├── notifications[]      ← Persiste en localStorage (historial)
├── toasts[]             ← Solo memoria (efímero)
├── isTrayOpen           ← Solo memoria
│
├── addNotification()    → Registra en historial + llama addToast()
├── addToast()           → Agrega efímero al stack (máx. 5)
├── markRead(id)         → Marca individual
├── markAllRead()        → Marca todas
├── removeNotification() → Elimina del historial
├── clearAll()           → Limpia historial completo
└── removeToast(id)      → Elimina toast del stack
```

**Auto-descarte de toasts:**
- Timer con setInterval de 50ms → decrementa barra de progreso CSS
- `pauseOnHover`: clearInterval en mouseEnter, reinicia en mouseLeave
- `duration: 0` = toast permanente hasta clic en X

---

## 5. Flujo Operativo y Secuencia de Interacción

```
[Evento en negocio]
        │
        ▼
useNotify().success / error / event...
        │
        ├──────────────────────┐
        ▼                      ▼
notifications[]         ToastStack
(historial BD local)    (flota 4.5s)
        │                      │
        ▼                      ▼
NotificationBell        Se auto-descarta
badge pulsante +        (o al hacer clic X)
campana anima
        │
        ▼
Usuario abre Tray
        │
        ├── Filtro: Todas / Sin leer
        ├── Acción: Marcar leída
        ├── Acción: Eliminar
        ├── Acción: Navegar (si tiene action)
        └── Acción: Limpiar todo
```

---

## Dependencias

| Paquete | Versión | Uso |
|---|---|---|
| `zustand` | ^5.x | Store de estado |
| `framer-motion` | ^12.x | Animaciones de entrada/salida |
| `lucide-react` | ^0.x | Íconos semánticos |

*Nota: Todas las dependencias ya están instaladas en el ecosistema PROTOTIPE.*
