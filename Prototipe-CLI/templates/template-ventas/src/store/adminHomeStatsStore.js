import { create } from 'zustand'

// Puente liviano entre AdminHome.jsx (dueño real de los datos: ya consulta
// pedidos/créditos/inventario) y el encabezado colapsable de AdminLayout.jsx
// (solo lectura). Evita que el header dispare sus propios listeners de
// Firestore duplicados solo para mostrar 3-4 cifras de un vistazo.
export const useAdminHomeStatsStore = create((set) => ({
  ventasHoy: 0,
  pedidosPendientes: 0,
  stockBajoCount: 0,
  fiado: 0,
  creditsEnabled: false,
  setAdminHomeStats: (stats) => set(stats),
}))
