<!--
{
  "technicalName": "ModalConfirm",
  "targetPath": "src/components/ui/ModalConfirm.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "component",
  "niches": []
}
-->

# Modal de Confirmación (ModalConfirm)

Componente de diálogo emergente especializado para confirmación de acciones críticas o transaccionales del usuario. Ofrece variantes visuales semánticas (eliminar, advertir, informar) y bloquea la interacción en segundo plano.

---

## 1. Propósito y Casos de Uso
* **Confirmación de Acciones Destructivas:** Solicitar confirmación antes de eliminar inventario, anular facturas o purgar bases de datos.
* **Advertencias Operativas:** Notificar sobre un cierre de caja descuadrado o un desabastecimiento de stock crítico antes de procesar la orden.
* **Mensajes Informativos / Acciones de Éxito:** Alertas de transacciones procesadas con firma táctil o aprobaciones de comisiones.

---

## 2. Especificación Visual y Estilos (Tailwind CSS HSL)
* **Backdrop (Fondo translúcido):** Capa oscura con blur suave (`bg-black/70 backdrop-blur-sm`).
* **Variantes Semánticas:**
  * **`danger`:** Píldora o icono en color rojo suave (`text-red-400` / `bg-red-600` para el botón de acción).
  * **`warning`:** Píldora o icono en color amarillo/ámbar suave (`text-amber-400` / `bg-amber-500` para el botón de acción).
  * **`info`:** Píldora o icono en color azul/violeta suave (`text-indigo-400` / `bg-indigo-600` para el botón de acción).
* **Card Container:** Caja centrada responsiva con bordes redondeados (`rounded-3xl`), sombras pronunciadas y variables HSL adaptativas.

---

## 3. Props y API del Componente
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Estado que determina si el diálogo es visible. |
| `onClose` | `function` | - | Callback invocado al cancelar o cerrar el diálogo. |
| `onConfirm` | `function` | - | Callback invocado cuando el usuario hace clic en el botón de confirmación. |
| `variant` | `'danger' \| 'warning' \| 'info'` | `'info'` | Define la semántica visual de la alerta y colores del CTA. |
| `title` | `string` | - | Título descriptivo principal. |
| `body` | `string` | - | Cuerpo descriptivo del diálogo. |
| `confirmLabel` | `string` | `""` | Texto personalizado para el botón de confirmación (si se omite, se usa el por defecto de la variante). |
| `cancelLabel` | `string` | `"Cancelar"` | Texto para el botón de cancelación. |

---

## 4. Código React Fuente Completo (`ModalConfirm.jsx`)
```jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

// Icono Trash2 SVG Nativo
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

// Icono AlertTriangle SVG Nativo
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

// Icono Info SVG Nativo
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default function ModalConfirm({
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
  variant = 'info',
  title = '',
  body = '',
  confirmLabel = '',
  cancelLabel = 'Cancelar'
}) {

  // ─── Scroll Lock del Body ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const VARIANTS = {
    danger: {
      icon: <TrashIcon />,
      bg: 'bg-red-600 hover:bg-red-500',
      label: confirmLabel || 'Eliminar',
      ring: 'focus:ring-red-500/30'
    },
    warning: {
      icon: <AlertIcon />,
      bg: 'bg-amber-500 hover:bg-amber-400',
      label: confirmLabel || 'Continuar',
      ring: 'focus:ring-amber-500/30'
    },
    info: {
      icon: <InfoIcon />,
      bg: 'bg-indigo-600 hover:bg-indigo-500',
      label: confirmLabel || 'Confirmar',
      ring: 'focus:ring-indigo-500/30'
    }
  };

  const v = VARIANTS[variant] || VARIANTS.info;

  const modalDOM = (
    <div
      style={{ zIndex: 99999 }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-[var(--color-surface, #ffffff)] border border-[var(--color-border, rgba(229, 229, 229, 0.3))] rounded-3xl p-7 max-w-sm w-full shadow-2xl animate-fade-in-up text-left`}>
        
        {/* Cuerpo e Iconografía */}
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 bg-[var(--color-surface-2, #f5f5f5)] rounded-2xl shrink-0">
            {v.icon}
          </div>
          <div>
            <h3 className="font-black text-sm text-[var(--color-text, #171717)]">{title}</h3>
            <p className="text-xs text-[var(--color-text-muted, #737373)] mt-1.5 leading-relaxed">{body}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[var(--color-surface-2, #f5f5f5)] hover:bg-[var(--color-surface-3, #e5e5e5)] text-[var(--color-text-muted, #737373)] hover:text-[var(--color-text, #171717)] text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 ${v.bg} focus:outline-none focus:ring-2 ${v.ring} text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95`}
          >
            {v.label}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalDOM, document.body);
}
```

---

## 5. Origen
* **Extraído de:** Sandbox e integración de Componentes de dev-dashboard.
* **Fecha de documentación:** 2026-06-06
* **Versión:** 1.0 (Marca blanca adaptada con variables HSL y SVGs autocontenidos).
