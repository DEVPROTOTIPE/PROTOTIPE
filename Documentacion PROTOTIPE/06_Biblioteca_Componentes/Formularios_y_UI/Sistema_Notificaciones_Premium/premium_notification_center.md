<!--
{
  "resource": "PremiumNotificationCenter",
  "technicalName": "PremiumNotificationCenter",
  "targetPath": "src/components/common/PremiumNotificationCenter.jsx",
  "type": "component",
  "niches": [
    "retail_clothing",
    "technical_services",
    "refrigeration_ac",
    "contractors",
    "machinery_rental",
    "carpentry",
    "laundry",
    "furniture_repair",
    "wellness_podology",
    "grocery_food",
    "insumos-agricolas",
    "alimentos-artesanales",
    "ferreteria-rural",
    "repuestos-motos",
    "distribuidoras-beauty",
    "petshops-locales",
    "repuestos-lineablanca",
    "moda-local-calzado",
    "alimentacion-saludable",
    "home-office-ergonomia",
    "licores-cocteleria",
    "coleccionismo-geek",
    "distribucion-horeca"
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

# PremiumNotificationCenter — Centro de Notificaciones Premium

## 1. Propósito y Casos de Uso

Módulo de notificaciones interactivo premium que resuelve la visualización e interacción de notificaciones de sistema y negocio. 

**Resolución Crítica de Eventos (BUG-002):**
Mitiga los bloqueos de cierre en dispositivos móviles ocasionados por la detención de propagación de eventos en las transiciones de Framer Motion. Utiliza manejadores de fase de captura (`{ capture: true }`) en `mousedown` y `touchstart` para asegurar el cierre de la bandeja al hacer clic o tocar fuera de ella en smartphones.

---

## 2. Especificación Visual y Estilos

| Clase/Elemento | Estilo |
|---|---|
| Contenedor general | `relative` |
| Bandeja de notificaciones | Mobile: `fixed inset-0`, Desktop: `absolute right-0 top-12 w-96` con `backdrop-blur-xl bg-[var(--color-surface)]/85` |
| Scroll | `scrollbar-thin` para navegadores modernos, con holgura de clipping (`p-2 gap-1.5`) |
| Iconos Semánticos | Colores HSL adaptativos para tipos `success` (emerald), `warning` (amber), `info` (blue), `event` (primary) |

---

## 3. Código React Completo

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, X, Info, CheckCircle, AlertTriangle, Package } from 'lucide-react';

// MOCK DE DATOS
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'success', title: 'Pedido #4029 Listo', message: 'El pedido ha sido marcado como empacado.', time: 'Hace 2 min', read: false },
  { id: 2, type: 'warning', title: 'Stock Crítico', message: 'La resina epóxica (Galón) está por agotarse.', time: 'Hace 15 min', read: false },
  { id: 3, type: 'info', title: 'Cierre de Caja', message: 'Se ha generado el reporte Z del día exitosamente.', time: 'Hace 2 horas', read: true },
  { id: 4, type: 'event', title: 'Nuevo Cliente', message: 'Carlos Gómez se ha registrado en la plataforma.', time: 'Ayer', read: true },
];

const getNotificationStyles = (type) => {
  switch (type) {
    case 'success': return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    case 'warning': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    case 'event': return { icon: Package, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' };
    default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' };
  }
};

export default function PremiumNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const triggerRef = useRef(null);
  const trayRef = useRef(null);

  // FIX BUG-002: Cierre al hacer clic fuera usando fase de captura para evadir a Framer Motion
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        trayRef.current && !trayRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick, { capture: true });
    document.addEventListener('touchstart', handleOutsideClick, { capture: true, passive: true });

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, { capture: true });
      document.removeEventListener('touchstart', handleOutsideClick, { capture: true });
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearTray = () => {
    setNotifications([]);
  };

  return (
    <div className="relative">
      
      {/* BOTÓN TRIGGER */}
      <motion.button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors outline-none focus:outline-none"
        aria-label="Abrir notificaciones"
      >
        <Bell size={20} strokeWidth={2} />
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              key={unreadCount}
              className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-soft-sm"
            >
              {unreadCount > 99 ? '+99' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* BANDEJA DE NOTIFICACIONES */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={trayRef}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex flex-col w-full sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-96 sm:rounded-2xl sm:shadow-soft-2xl bg-[var(--color-surface)]/85 backdrop-blur-xl border-x border-t sm:border border-[var(--color-border)] overflow-hidden"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <h3 className="font-display text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    {unreadCount} nuevas
                  </span>
                )}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 sm:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface-2)] active:scale-95 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Controles Rápidos */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]/50 bg-[var(--color-surface-2)]/30">
              <button 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
              >
                <CheckCheck size={14} /> Leídas
              </button>
              <button 
                onClick={clearTray}
                disabled={notifications.length === 0}
                className="flex items-center gap-1.5 text-xs font-medium text-red-500/80 hover:text-red-500 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
              >
                <Trash2 size={14} /> Vaciar
              </button>
            </div>

            {/* Lista */}
            <div className="flex-1 sm:max-h-[60vh] p-2 overflow-y-auto scrollbar-thin flex flex-col gap-1.5">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center opacity-70">
                  <Bell size={40} className="text-[var(--color-text-muted)] mb-3 opacity-20" />
                  <p className="text-sm font-medium text-[var(--color-text)]">Bandeja vacía</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">No tienes nuevas notificaciones</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Style = getNotificationStyles(notif.type);
                  const Icon = Style.icon;

                  return (
                    <motion.div
                      layout
                      key={notif.id}
                      className={`relative flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer group ${
                        notif.read ? 'hover:bg-[var(--color-surface-2)]' : 'bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10'
                      }`}
                    >
                      <div className={`flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full ${Style.bg} ${Style.color}`}>
                        <Icon size={18} strokeWidth={2.5} />
                      </div>

                      <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-[var(--color-text)] truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.read && (
                        <div className="absolute top-1/2 right-3 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]" />
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
            
            {/* Pie */}
            <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]/90 text-center">
              <button className="text-xs font-semibold text-[var(--color-primary)] hover:underline active:scale-95 transition-transform">
                Ver historial completo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 4. Lógica de Estado y Ciclo de Vida

- Cierre de bandeja de notificaciones robustecido usando detectores de clics fuera en fase de captura (`mousedown`, `touchstart`), evitando drifts ocasionados por la cancelación de propagación de eventos táctiles.
- Scroll de alto rendimiento usando clases nativas `scrollbar-thin` y márgenes holgados para evitar cortes visuales de los efectos de sombreado y foco en el renderizado.
