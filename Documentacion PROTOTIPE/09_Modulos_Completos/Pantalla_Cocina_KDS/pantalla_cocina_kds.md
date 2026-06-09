# Módulo de Pantalla de Cocina (KDS) en Vivo

## 1. Propósito y Casos de Uso
El KDS (Kitchen Display System) optimiza el flujo de preparación de alimentos y bebidas en restaurantes, reposterías y cafeterías, reemplazando las comandas físicas impresas por pantallas dinámicas ordenadas cronológicamente y por estado de prioridad.

### Casos de Uso:
- Visualizar pedidos pendientes en columnas (Entrante, Preparación, Listo para Entregar).
- Notificar acústicamente la entrada de nuevas comandas.
- Medir los tiempos de preparación mediante timers en vivo.
- Marcar platos individuales o comandas completas como listas.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
El módulo utiliza un tema oscuro de alto contraste y tamaño de fuente optimizado para tablets u monitores táctiles en cocinas:
- Tarjetas con bordes elásticos (`active:scale-98`).
- Timers con semáforo HSL (Verde `< 5 min`, Amarillo `5-10 min`, Rojo `> 10 min`).
- Columna con scroll amortiguado (`scrollbar-thin`).

---

## 3. Código React Completo y Funcional
A continuación, se detalla el componente principal `KitchenDisplaySystem.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { Play, Check, Clock, AlertCircle } from 'lucide-react';

export default function KitchenDisplaySystem({ orders = [], onUpdateStatus }) {
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newTimers = {};
      orders.forEach(order => {
        if (order.status !== 'delivered' && order.createdAt) {
          const diffSec = Math.floor((now - order.createdAt) / 1000);
          newTimers[order.id] = diffSec;
        }
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const getTimerColor = (sec) => {
    if (sec < 300) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (sec < 600) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse';
  };

  const formatTime = (totalSeconds) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const columns = {
    pending: { title: 'Cola de Entrada', list: orders.filter(o => o.status === 'pending') },
    preparing: { title: 'En Preparación', list: orders.filter(o => o.status === 'preparing') },
    ready: { title: 'Listo para Despacho', list: orders.filter(o => o.status === 'ready') }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full min-h-[500px]">
      {Object.entries(columns).map(([statusKey, col]) => (
        <div key={statusKey} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">{col.title}</h3>
            <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {col.list.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {col.list.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 italic text-[11px]">
                Sin comandas en esta sección
              </div>
            ) : (
              col.list.map(order => (
                <div key={order.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2.5 shadow-md">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-black text-indigo-400">#{order.orderNum}</span>
                    {timers[order.id] !== undefined && (
                      <span className={`flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${getTimerColor(timers[order.id])}`}>
                        <Clock size={10} />
                        {formatTime(timers[order.id])}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-200">
                        <span><strong className="text-indigo-300">{item.quantity}x</strong> {item.name}</span>
                        {item.variant && <span className="text-[10px] text-slate-400 font-mono">({item.variant})</span>}
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="text-[10px] bg-amber-500/5 border border-amber-500/10 text-amber-300/80 p-1.5 rounded-lg italic">
                      Nota: {order.notes}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1.5 border-t border-slate-900">
                    {statusKey === 'pending' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'preparing')}
                        className="w-full flex items-center justify-center gap-1 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        <Play size={10} /> Preparar
                      </button>
                    )}
                    {statusKey === 'preparing' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'ready')}
                        className="w-full flex items-center justify-center gap-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        <Check size={10} /> Terminar
                      </button>
                    )}
                    {statusKey === 'ready' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'delivered')}
                        className="w-full flex items-center justify-center gap-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Despachar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Lógica de Estado y Ciclo de Vida
Este módulo se conecta a una suscripción en tiempo real (`useFirestoreCollection`) filtrando la colección `orders` por estados no completados (`['pending', 'preparing', 'ready']`).

---

## 5. Flujo Operativo y Secuencia de Interacción
1. El cliente genera un pedido en el POS o Web Pública.
2. Firestore recibe el pedido, el KDS emite un sonido de campana acústico.
3. El operario de cocina hace clic en "Preparar" (el pedido pasa a la segunda columna).
4. Al terminar los platos, el operario hace clic en "Terminar" (el pedido pasa a despacho).
5. El mesero entrega la orden y pulsa "Despachar" (desaparece de la cocina).
