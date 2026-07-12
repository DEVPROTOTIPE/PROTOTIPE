import React from 'react'

export default function OrderTrackingSkeleton() {
  return (
    <div className="relative flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)]/40 rounded-[var(--radius-base)] p-5 shadow-sm overflow-hidden w-full max-w-3xl mx-auto gap-6 mt-6">
      {/* Glow Effect / Shimmer Overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer-infinite bg-gradient-to-r from-transparent via-[var(--color-border)]/10 to-transparent" />

      {/* Cabecera del pedido (Orden ID, Fecha) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[var(--color-border)]/30 pb-4 gap-3">
        <div className="flex flex-col gap-2 w-1/2">
          <div className="h-5 bg-[var(--color-surface-2)] rounded w-3/4" />
          <div className="h-3 bg-[var(--color-surface-2)] rounded w-1/2" />
        </div>
        <div className="h-8 bg-[var(--color-surface-2)] rounded-full w-24" />
      </div>

      {/* Timeline de Seguimiento Shimmer (Hitos verticales) */}
      <div className="flex flex-col gap-5 my-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex gap-4 relative">
            {/* Círculo del hito */}
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex-shrink-0 z-10" />
            {/* Línea de progreso vertical */}
            {step < 3 && (
              <div className="absolute left-[15px] top-8 w-[2px] h-10 bg-[var(--color-surface-2)] z-0" />
            )}
            {/* Texto del hito */}
            <div className="flex flex-col gap-1.5 w-full pt-1">
              <div className="h-4 bg-[var(--color-surface-2)] rounded w-1/3" />
              <div className="h-3 bg-[var(--color-surface-2)] rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>

      {/* Resumen del Pedido (Productos) */}
      <div className="border-t border-[var(--color-border)]/30 pt-4 flex flex-col gap-4">
        <div className="h-4 bg-[var(--color-surface-2)] rounded w-1/4 mb-1" />
        {[1, 2].map((item) => (
          <div key={item} className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-2/3">
              <div className="w-10 h-10 rounded bg-[var(--color-surface-2)] flex-shrink-0" />
              <div className="flex flex-col gap-1.5 w-full">
                <div className="h-3 bg-[var(--color-surface-2)] rounded w-3/4" />
                <div className="h-2.5 bg-[var(--color-surface-2)] rounded w-1/3" />
              </div>
            </div>
            <div className="h-3 bg-[var(--color-surface-2)] rounded w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}
