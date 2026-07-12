import React from 'react'

export default function ProductCardSkeleton() {
  return (
    <div className="relative flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)]/40 rounded-[var(--radius-base)] p-4 shadow-sm overflow-hidden min-h-[320px]">
      {/* Glow Effect / Shimmer Overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer-infinite bg-gradient-to-r from-transparent via-[var(--color-border)]/10 to-transparent" />

      {/* Imagen Shimmer */}
      <div className="w-full aspect-square rounded-[calc(var(--radius-base)-0.25rem)] bg-[var(--color-surface-2)] mb-4" />

      {/* Título Shimmer */}
      <div className="h-5 bg-[var(--color-surface-2)] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[var(--color-surface-2)] rounded w-1/2 mb-4" />

      {/* Precio y Botón Shimmer en la parte inferior */}
      <div className="mt-auto flex items-center justify-between gap-3">
        <div className="h-6 bg-[var(--color-surface-2)] rounded w-1/3" />
        <div className="h-9 bg-[var(--color-surface-2)] rounded-[calc(var(--radius-base)-0.25rem)] w-1/3" />
      </div>
    </div>
  )
}
