# Módulo de Pantalla de Cocina KDS (Kitchen Display System)

## 1. Propósito y Casos de Uso
El Kitchen Display System (KDS) es un módulo administrativo diseñado para optimizar el flujo de trabajo en cocinas de restaurantes, pizzerías y negocios de comida integrados a la plataforma **PROTOTIPE**. 

Sus objetivos centrales son:
1. **Visualización en Tiempo Real:** Eliminar las comandas en papel mediante una pantalla digital interactiva que muestra las órdenes pendientes en una cuadrícula segmentada por estados.
2. **Priorización Cronológica:** Mostrar un contador dinámico que refleja los segundos/minutos transcurridos desde que se realizó el pedido, coloreando la tarjeta en verde (tiempo óptimo), amarillo (límite de retraso) y rojo parpadeante (retraso crítico).
3. **Control del Flujo de Trabajo:** Permitir a los cocineros y preparadores transicionar de forma táctil y veloz el estado de cada pedido (Cola de Entrada → En Preparación → Listo para Despacho → Entregado).
4. **Alertas Sonoras de Comanda:** Emitir un pitido de alerta sintético mediante Web Audio API cada vez que entra un nuevo pedido a la cola.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
* **Layout Responsivo:** Cuadrícula de 3 columnas para viewports de escritorio (`grid grid-cols-1 lg:grid-cols-3 gap-4 h-full`) y colapsable a 1 columna en pantallas de cocina táctiles pequeñas.
* **Semáforo Cronológico:** 
  - Tiempo menor a 5 min: Verde suave (`text-emerald-400 bg-emerald-500/10 border-emerald-500/20`).
  - Tiempo de 5 a 10 min: Amarillo suave (`text-amber-400 bg-amber-500/10 border-amber-500/20`).
  - Tiempo mayor a 10 min: Rojo parpadeante (`text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse`).
* **Tarjetas Glassmorphic:** Tarjetas con backdrop blur (`bg-surface-2/60 backdrop-blur-md border-[var(--color-border)]`) y sombra suave, con esquinas redondeadas de 18px.
* **Diferenciación de Íconos:** Lucide Icons oficiales (`Clock` para tiempos, `Play` para iniciar preparación, `Check` para marcar listo y `Bell` para alerta visual).

---

## 3. Código React Completo y 100% Funcional
El código de producción del módulo, incluyendo la suscripción a Firestore en tiempo real y el sintetizador de audio para comandas entrantes:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, query, where, onSnapshot, doc, updateDoc, orderBy 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Play, Check, Clock, Bell, AlertTriangle } from 'lucide-react';

export default function PantallaCocinaKDS() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState({});
  const previousOrdersCount = useRef(0);

  // 1. Sintetizador de audio local (Web Audio API) para alertas no invasivas
  const playAlertSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime); // Tono de alerta intermedio
      gain.gain.setValueAtTime(0.04, ctx.currentTime); // Volumen bajo
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15); // Duración corta
    } catch (e) {
      console.warn('AudioContext no soportado o bloqueado por el navegador:', e.message);
    }
  };

  // 2. Suscripción en tiempo real a las comandas activas
  useEffect(() => {
    const q = query(
      collection(db, 'pedidos'),
      where('status', 'in', ['pending', 'preparing', 'ready']),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      
      setOrders(docs);
      setLoading(false);

      // Reproducir sonido si entra una nueva comanda pendiente
      if (previousOrdersCount.current > 0 && docs.length > previousOrdersCount.current) {
        // Verificar si la comanda nueva está en estado 'pending'
        const hasNewPending = docs.some(o => o.status === 'pending' && !orders.some(old => old.id === o.id));
        if (hasNewPending) {
          playAlertSound();
        }
      }
      previousOrdersCount.current = docs.length;
    }, (error) => {
      console.error("Error cargando comandas de cocina:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orders]);

  // 3. Orquestador de temporizadores de retraso en segundo plano
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newTimers = {};
      orders.forEach(order => {
        if (order.createdAt) {
          const createdMs = order.createdAt.seconds 
            ? order.createdAt.seconds * 1000 
            : order.createdAt;
          newTimers[order.id] = Math.floor((now - createdMs) / 1000);
        }
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  // 4. Cambios de estado en caliente hacia Firestore
  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const orderRef = doc(db, 'pedidos', id);
      await updateDoc(orderRef, { status: nextStatus });
    } catch (err) {
      console.error("Error al actualizar estado en cocina:", err);
    }
  };

  // Formateador de segundos a mm:ss
  const formatTime = (totalSeconds) => {
    if (!totalSeconds && totalSeconds !== 0) return '--:--';
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (sec) => {
    if (!sec && sec !== 0) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (sec < 300) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'; // < 5 min
    if (sec < 600) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'; // < 10 min
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse'; // > 10 min (alerta)
  };

  const columns = {
    pending: { title: 'Cola de Entrada', list: orders.filter(o => o.status === 'pending') },
    preparing: { title: 'En Preparación', list: orders.filter(o => o.status === 'preparing') },
    ready: { title: 'Listo para Despacho', list: orders.filter(o => o.status === 'ready') }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 h-full">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Cargando Monitor de Cocina...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] text-[var(--color-text)] p-4 space-y-4">
      {/* Cabecera */}
      <div className="flex justify-between items-center bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-2xl p-4">
        <div>
          <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
            <Bell size={16} className="text-indigo-400 animate-bounce" />
            Kitchen Display System (KDS)
          </h2>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            Total de comandas activas: <span className="font-bold text-white">{orders.length}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Monitor en Vivo</span>
        </div>
      </div>

      {/* Grid de Columnas KDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden min-h-[500px]">
        {Object.entries(columns).map(([colKey, col]) => (
          <div key={colKey} className="flex flex-col bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl p-3 h-full overflow-hidden">
            {/* Cabecera de Columna */}
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2 mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                {col.title}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                {col.list.length}
              </span>
            </div>

            {/* Lista de Comandas */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {col.list.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center h-48 opacity-40">
                  <span className="text-xl">🍳</span>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mt-2">Sin pedidos en esta fila</p>
                </div>
              ) : (
                col.list.map(order => {
                  const elapsed = timers[order.id] || 0;
                  return (
                    <div 
                      key={order.id} 
                      className="bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] rounded-2xl p-4 space-y-3 flex flex-col hover:border-indigo-500/40 transition-colors"
                    >
                      {/* Cabecera de tarjeta */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-xs font-black text-indigo-400">#{order.orderNum}</span>
                          <span className="text-[9px] text-[var(--color-text-muted)] ml-2">ID: {order.id.slice(-4)}</span>
                        </div>
                        {/* Temporizador */}
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border ${getTimerColor(elapsed)}`}>
                          <Clock size={11} />
                          {formatTime(elapsed)}
                        </div>
                      </div>

                      {/* Ítems del pedido */}
                      <div className="border-t border-[var(--color-border)]/40 pt-2.5 space-y-1.5 flex-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px]">
                            <span className="text-[var(--color-text)] font-semibold">{item.name}</span>
                            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/15 rounded-md text-[10px] font-black text-indigo-400">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Notas de cocina */}
                      {order.notes && (
                        <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-2.5 flex items-start gap-1.5 text-[9px] text-rose-400">
                          <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                          <p className="leading-normal font-medium"><span className="font-bold">NOTAS:</span> {order.notes}</p>
                        </div>
                      )}

                      {/* Botón de cambio de estado */}
                      <div className="pt-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'preparing')}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            <Play size={11} />
                            Iniciar Preparación
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'ready')}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            <Check size={11} />
                            Marcar como Listo
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[var(--color-surface-2)] hover:bg-indigo-600/10 border border-[var(--color-border)] hover:border-indigo-500/40 text-indigo-400 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <Check size={11} />
                            Entregar al Cliente
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
