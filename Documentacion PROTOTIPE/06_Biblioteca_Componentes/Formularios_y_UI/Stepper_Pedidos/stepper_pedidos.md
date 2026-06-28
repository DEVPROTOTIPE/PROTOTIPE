<!--
{
  "technicalName": "Stepper_Pedidos",
  "targetPath": "src/components/common/Stepper_Pedidos.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Stepper de Seguimiento de Pedidos (`Stepper_Pedidos`)

Este módulo proporciona un Stepper o línea de tiempo interactiva de seguimiento de orden comercial (`OrderTrackingTimeline`). Está programado de forma modular, portable y responsiva, transicionando entre 4 estados clave del ciclo de facturación y despacho, soportando variables CSS dinámicas y micro-animaciones fluidas aceleradas por hardware en dispositivos móviles.

---

## 1. Propósito y Casos de Uso

El componente visualiza el flujo y estado de despacho del pedido de forma clara y accesible para el cliente final, reduciendo la ansiedad y el soporte post-venta.

### Casos de Uso:
* **Línea de Tiempo de Pedido Táctil:** Presentación visual lineal de los 4 hitos operativos: (1) Pedido Recibido, (2) Preparando tu Pedido, (3) Pedido en Ruta, y (4) Pedido Entregado.
* **Feature Flags de Progreso Reactivo:** Adaptación instantánea de color, escala e íconos en base al estado registrado atómicamente en Firestore (`pendiente`, `aceptado`, `en_ruta`, `entregado`).
* **Seguimiento Integrado (Marca Blanca):** Ideal para ser embebido en páginas de consulta pública mediante tokens sin necesidad de autenticaciones robustas de sesión del cliente.

---

## 2. Especificación Visual y Estilos

La interfaz gráfica es sumamente premium, adaptada para smartphones en disposición vertical (columna flex) y pantallas anchas en disposición horizontal:
* **Hitos Activos:** Color primario HSL de la marca con anillo de sombra brillante (*glow ring shadow*) y micro-animación pulsante.
* **Hitos Completados:** Fondo de tono verde esmeralda con ícono de verificación de check.
* **Hitos Pendientes/Inactivos:** Tono neutral atenuado con íconos vectoriales atenuados para delimitar los pasos futuros.
* **Barra de Conexión:** Línea de progreso interactiva que se colorea dinámicamente según el paso activo alcanzado.

### Variables CSS y Extensiones Tailwind Requeridas

> [!IMPORTANT]
> Este componente usa clases Tailwind extendidas. Sin la configuración indicada, los hitos activos no mostrarán el color de marca correcto.

**Variables CSS (`:root`):**
```css
:root {
  --color-primary-hsl: 262 83% 58%; /* HSL de tu color primario de marca */
}
```

**`tailwind.config.js`:**
```js
theme: {
  extend: {
    colors: {
      primary: ({ opacityValue }) =>
        opacityValue ? `hsl(var(--color-primary-hsl) / ${opacityValue})` : 'hsl(var(--color-primary-hsl))',
      neutral: { 850: '#1c1c1c' }
    }
  }
}
```

**Dependencias:** `npm install framer-motion`

---

## 3. Código React Completo y 100% Funcional

### Componente de Seguimiento: `OrderTrackingTimeline.jsx`
Implementación portable, stateless y paramétrica.

```jsx
import React from 'react'
import { motion } from 'framer-motion'

// ─── Íconos SVG inline (fallbacks portables — no requieren lucide-react) ─────
const _IconClock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const _IconBox = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)
const _IconTruck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const _IconCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const _IconX = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// Mapeo físico de estados de pedido
export const ORDER_STATES = {
  PENDIENTE: 'pendiente',
  ACEPTADO: 'aceptado',
  EN_RUTA: 'en_ruta',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado'
}

// Define los pasos con íconos SVG default. Para usar lucide u otra librería,
// pasa el array `steps` personalizado como prop.
const DEFAULT_TIMELINE_STEPS = [
  {
    state: ORDER_STATES.PENDIENTE,
    title: 'Pedido Recibido',
    description: 'Hemos recibido tu orden y está en espera de validación.',
    Icon: _IconClock
  },
  {
    state: ORDER_STATES.ACEPTADO,
    title: 'Preparando Pedido',
    description: 'Estamos seleccionando tus variantes y alistando el empaque.',
    Icon: _IconBox
  },
  {
    state: ORDER_STATES.EN_RUTA,
    title: 'Pedido en Ruta',
    description: 'El repartidor lleva tu pedido directo a la dirección indicada.',
    Icon: _IconTruck
  },
  {
    state: ORDER_STATES.ENTREGADO,
    title: 'Pedido Entregado',
    description: '¡Disfruta tu compra! Gracias por elegir nuestra tienda.',
    Icon: _IconCheck
  }
]

export default function OrderTrackingTimeline({
  currentState = 'pendiente', // 'pendiente' | 'aceptado' | 'en_ruta' | 'entregado' | 'cancelado'
  estimatedDelivery = '30 a 60 min',
  cancelReason = '',
  formatDate = (val) => val ? new Date(val).toLocaleDateString() : '',
  // ─── Íconos inyectables ────────────────────────────────────────────────────
  // cancelIcon: ReactNode — ícono para la vista de cancelación (default: X SVG)
  cancelIcon = null,
  // steps: array — pasos del timeline con { state, title, description, Icon }
  // Permite personalizar íconos usando lucide u otras librerías:
  // steps={[{ state: 'pendiente', title: 'Recibido', description: '...', Icon: ClockIcon }]}
  steps = DEFAULT_TIMELINE_STEPS
}) {
  const ICancelIcon = cancelIcon ?? <_IconX size={24} />
  
  // Si el pedido está cancelado
  if (currentState === ORDER_STATES.CANCELADO) {
    return (
      <div className="p-5 bg-red-500/10 border border-red-500/25 rounded-3xl text-center select-none animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-3">
          {ICancelIcon}
        </div>
        <h3 className="text-sm font-bold text-red-500 leading-none">Pedido Cancelado</h3>
        <p className="text-xs text-neutral-450 mt-2 max-w-sm leading-relaxed mx-auto">
          {cancelReason || 'Tu pedido ha sido cancelado por políticas internas o quiebre de stock.'}
        </p>
      </div>
    );
  }

  // Encuentra el índice del paso activo actual
  const activeIndex = TIMELINE_STEPS.findIndex(s => s.state === currentState)
  
  return (
    <div className="w-full bg-neutral-900 border border-neutral-850 rounded-[32px] p-6 space-y-6 select-none">
      {/* Cabecera / Info de Entrega */}
      <div className="flex items-center justify-between border-b border-neutral-850 pb-4">
        <div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Estado de Entrega</p>
          <h3 className="text-sm font-extrabold text-white mt-1.5 leading-none">
            {TIMELINE_STEPS[Math.max(0, activeIndex)]?.title || 'Buscando estado...'}
          </h3>
        </div>
        {currentState !== ORDER_STATES.ENTREGADO && estimatedDelivery && (
          <div className="text-right">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Tiempo Estimado</p>
            <p className="text-xs font-black text-primary mt-1.5 leading-none">{estimatedDelivery}</p>
          </div>
        )}
      </div>

      {/* Línea de Tiempo Flex Vertical */}
      <div className="flex flex-col relative space-y-8 pl-4">
        {/* Barra de progreso de fondo */}
        <div className="absolute left-[30px] top-4 bottom-4 w-0.5 bg-neutral-800" />
        
        {/* Barra de progreso activa coloreada */}
        <div 
          className="absolute left-[30px] top-4 w-0.5 bg-emerald-500 transition-all duration-700 ease-in-out" 
          style={{ 
            height: `${activeIndex <= 0 ? 0 : activeIndex === 1 ? '33%' : activeIndex === 2 ? '66%' : '100%'}` 
          }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex
          const isActive = idx === activeIndex
          const { Icon: StepIcon } = step

          return (
            <div key={step.state} className="flex gap-4 items-start relative z-10">
              {/* Círculo Indicador */}
              <div 
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-500 shrink-0 ${
                  isActive 
                    ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30' 
                    : isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                }`}
              >
                <StepIcon size={14} className={isActive ? 'animate-pulse' : ''} />
              </div>

              {/* Textos Informativos */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h4 className={`text-xs font-bold transition-colors duration-500 ${isActive ? 'text-primary' : isCompleted ? 'text-white' : 'text-neutral-400'}`}>
                  {step.title}
                </h4>
                <p className={`text-[10px] leading-relaxed mt-1 transition-colors duration-500 ${isActive || isCompleted ? 'text-neutral-400' : 'text-neutral-550'}`}>
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

## 4. Lógica de Estado y Ciclo de Vida

La línea de tiempo se basa en un flujo de datos limpio de tipo push y sin estados locales:

1. **Resolución Automática de Paso:** Compara el String `currentState` contra los estados mapeados de la base de datos de producción (`ORDER_STATES`).
2. **Cálculo Físico de Progreso:** La barra de progreso de color verde esmeralda ajusta su propiedad CSS `height` de forma fluida (`0% -> 33% -> 66% -> 100%`) utilizando transiciones nativas CSS acopladas al cambio de la prop `currentState`.
3. **Manejo de Cancelación Excepcional:** Si el estado conmuta a `CANCELADO`, suspende la carga del stepper estándar y despliega inmediatamente una alerta destructiva atenuada informando los motivos concretos, optimizando la claridad del flujo.

---

## 5. Flujo Operativo e Interacción

El siguiente diagrama detalla cómo se gestiona y despliega de forma reactiva la transición de estados en el frontend:

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant Stepper as OrderTrackingTimeline View
    participant Page as OrderTracking Page
    participant DB as Firestore (onSnapshot)

    Page->>DB: Escucha cambios en /orders/ID
    DB-->>Page: { estado: "pendiente" }
    Page->>Stepper: Inyecta currentState="pendiente"
    Stepper-->>Cliente: Hito 1 brilla en color primario con pulso

    Note over DB: Admin acepta pedido en Dashboard POS
    DB-->>Page: { estado: "aceptado" }
    Page->>Stepper: Inyecta currentState="aceptado"
    Stepper-->>Cliente: Hito 1 se marca check verde; Hito 2 brilla en primario
    Note over Stepper: Barra verde esmeralda avanza suave a 33% de altura
```

---

## 6. Origen en la Aplicación

Los componentes de esta especificación se extrajeron y mejoraron a partir de los archivos de origen de la aplicación de producción:
* **Página de Tracking original:** [`OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/pages/client/ClientOrders.jsx) (Líneas 1-120 aprox.)
* **Componente de Stepper original:** [`OrderTracking.jsx`](file:///d:/Aplicaciones/App%20Ventas/src/components/client/checkout/CheckoutModal.jsx) (Líneas 806-875)
