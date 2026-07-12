import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Search, ShoppingBag, User } from 'lucide-react';

// Opciones de navegación por defecto (Regla de 3 a 5 opciones)
const DEFAULT_ITEMS = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'catalog', label: 'Catálogo', icon: Search },
  { id: 'cart', label: 'Carrito', icon: ShoppingBag },
  { id: 'profile', label: 'Perfil', icon: User },
];

/**
 * AnimatedNavbarMobile — Barra de navegación inferior animada para móviles.
 * 
 * @param {string} [activeTab] - ID de la pestaña activa (controlado externamente).
 * @param {function} [onChange] - Callback disparado al cambiar de pestaña.
 * @param {Array} [items] - Opciones personalizadas de navegación.
 */
export default function AnimatedNavbarMobile({ 
  activeTab: externalActiveTab, 
  onChange, 
  items = DEFAULT_ITEMS 
}) {
  const [localActiveTab, setLocalActiveTab] = useState('home');
  
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : localActiveTab;

  const handleTabChange = (itemId) => {
    if (externalActiveTab === undefined) {
      setLocalActiveTab(itemId);
    }
    if (onChange) {
      onChange(itemId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-[var(--color-surface)]/85 backdrop-blur-xl border-t border-[var(--color-border)] pb-safe sm:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center w-full h-full min-h-[48px] min-w-[48px] active:scale-95 transition-all duration-200 ease-in-out cursor-pointer ${
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {/* Burbuja elástica de fondo */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-bubble"
                  className="absolute inset-0 w-12 h-12 mx-auto mt-1 bg-[var(--color-primary)]/15 rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                    mass: 0.8
                  }}
                />
              )}
              
              <Icon 
                className="w-[22px] h-[22px] z-10" 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className="text-[10px] font-bold z-10 mt-1 truncate max-w-full px-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}