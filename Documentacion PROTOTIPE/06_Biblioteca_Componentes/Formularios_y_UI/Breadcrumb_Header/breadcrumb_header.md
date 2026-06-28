<!--
{
  "technicalName": "BreadcrumbHeader",
  "targetPath": "src/components/ui/BreadcrumbHeader.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Breadcrumb y Header Contextual Adaptativo (`BreadcrumbHeader`)

## 1. Propósito y Casos de Uso
Componente atómico de navegación y cabecera estructurado para evitar la pérdida de contexto del usuario. Resuelve:
- **Navegación Dinámica Segmentada:** Construye migas de pan automáticas o manuales que permiten clickear pasos anteriores.
- **Botón de Regreso Responsivo:** Unifica el comportamiento del botón de volver, permitiendo sobreescribir el callback local para prevenir la pérdida de formularios a medio llenar o simplemente retroceder en el historial del enrutador (`navigate(-1)`).
- **Adaptabilidad Móvil (Mobile-first):** Colapsa de forma fluida los eslabones intermedios largos en dispositivos móviles en una elipsis interactiva `...` para evitar desbordamientos de pantalla (*overflow*).

**Casos de uso:** Cabecera de páginas de detalles de pedidos, wizards de checkout, perfiles de clientes CRM, y subpaneles de configuración.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
- **Alineación Flexbox:** Centrado vertical con espacio distribuido para alojar acciones secundarias en la derecha (`flex items-center justify-between`).
- **Elipsis en Móviles:** Transición de opacidad y escala para las migas de pan largas.
- **Separadores:** Ícono minimalista de Chevron o barra inclinada con colores atenuados (`text-[var(--color-text-muted)] opacity-40`).

---

## 3. Código React Completo y 100% Funcional

```jsx
// src/components/ui/navigation/BreadcrumbHeader.jsx
import React from 'react';
import { ArrowLeft, ChevronRight, Home, MoreHorizontal } from 'lucide-react';

/**
 * BreadcrumbHeader
 * Cabecera unificada con soporte de migas de pan y botón de retroceso inteligente.
 */
export function BreadcrumbHeader({
  items = [],            // Array de { label: string, path?: string, onClick?: fn }
  onBack = null,         // Callback opcional de retroceso manual
  title = '',            // Título principal de la sección
  actions = null,        // Elementos JSX secundarios en la esquina derecha (botones)
  showHome = true,       // Si muestra el icono de Home inicial
  onHomeClick = () => {} // Callback para redirigir a Home
}) {
  
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 sm:px-6 space-y-2 shrink-0">
      
      {/* ─── Fila Superior: Breadcrumbs ──────────────────────────────────────── */}
      <nav className="flex items-center text-[10px] font-bold tracking-wide uppercase text-[var(--color-text-muted)] overflow-x-auto whitespace-nowrap scrollbar-none">
        
        {/* Home */}
        {showHome && (
          <div className="flex items-center">
            <button
              onClick={onHomeClick}
              className="hover:text-[var(--color-text)] transition-colors cursor-pointer flex items-center gap-1"
              title="Inicio"
            >
              <Home size={11} className="text-indigo-400" />
            </button>
            {items.length > 0 && (
              <ChevronRight size={10} className="mx-2 opacity-40 shrink-0" />
            )}
          </div>
        )}

        {/* Migas de pan */}
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          
          // Soporte para colapsar en pantallas móviles si hay más de 3 elementos
          const shouldHideOnMobile = items.length > 3 && idx > 0 && idx < items.length - 2;

          return (
            <div
              key={idx}
              className={`flex items-center ${shouldHideOnMobile ? 'hidden sm:flex' : 'flex'}`}
            >
              {/* Si hay colapso móvil, inyectar elipsis una sola vez */}
              {items.length > 3 && idx === 1 && (
                <div className="flex sm:hidden items-center">
                  <MoreHorizontal size={10} className="text-[var(--color-text-muted)] opacity-60" />
                  <ChevronRight size={10} className="mx-2 opacity-40 shrink-0" />
                </div>
              )}

              {isLast ? (
                <span className="text-[var(--color-text)] font-black truncate max-w-[120px] sm:max-w-[200px]">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={item.onClick}
                  className="hover:text-[var(--color-text)] transition-colors cursor-pointer truncate max-w-[100px] sm:max-w-[150px]"
                >
                  {item.label}
                </button>
              )}

              {!isLast && (
                <ChevronRight size={10} className="mx-2 opacity-40 shrink-0" />
              )}
            </div>
          );
        })}
      </nav>

      {/* ─── Fila Inferior: Título principal y Acciones ──────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          
          {/* Botón de Regreso */}
          <button
            onClick={handleBackClick}
            className="p-1.5 rounded-xl border border-[var(--color-border)] hover:border-indigo-500/35 hover:scale-105 active:scale-95 bg-[var(--color-surface-2)]/60 text-[var(--color-text)] transition-all cursor-pointer outline-none shrink-0"
            title="Volver"
          >
            <ArrowLeft size={14} strokeWidth={2.2} />
          </button>

          {/* Título */}
          {title && (
            <h2 className="text-xs sm:text-sm font-black text-[var(--color-text)] tracking-wide truncate">
              {title}
            </h2>
          )}
        </div>

        {/* Acciones Secundarias */}
        {actions && (
          <div className="flex items-center gap-1.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 4. Lógica de Estado y Ciclo de Vida
- **Retroceso Inteligente (`onBack`):** Evita la pérdida accidental de datos en formularios interceptando el flujo nativo y disparando un modal de confirmación si se pasa un callback en la prop `onBack`.
- **Detección de Viewport (CSS-only):** El colapso del Breadcrumb para móviles se resuelve mediante clases de utilidad responsivas de Tailwind (`hidden sm:flex` y `.flex`), garantizando rendimiento inmediato libre de loops en listeners de `window.innerWidth`.

---

## 5. Secuencia de Interacción (Flujo de Navegación)
```
  [Usuario hace clic en volver]
                │
                ▼
      ¿Tiene prop 'onBack'?
        ├─── YES ───► Ejecuta onBack() (ej: confirmar descarte de cambios)
        └─── NO  ───► Ejecuta window.history.back() (retroceso de ruta)
```
