/**
 * SparkQuotaBanner.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Componente UI global que se renderiza ante un error de cuota agotada de Firebase.
 * Permite al sistema POS y catálogo conmutar visualmente a modo "Solo Lectura Local".
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, WifiOff } from 'lucide-react';

export default function SparkQuotaBanner() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Escuchar el evento de cuota agotada emitido por los servicios
    const handleQuotaError = () => {
      setQuotaExceeded(true);
      console.warn('[Telemetry] Degradación activada: Firestore reportó Resource Exhausted (Spark Limit).');
    };

    const handleConnectionChange = () => {
      setOffline(!navigator.onLine);
    };

    window.addEventListener('firestore-quota-exceeded', handleQuotaError);
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    return () => {
      window.removeEventListener('firestore-quota-exceeded', handleQuotaError);
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, []);

  if (!quotaExceeded && !offline) return null;

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500 animate-pulse">
          {offline ? <WifiOff size={16} /> : <ShieldAlert size={16} />}
        </div>
        <div className="text-left">
          <p className="text-[11px] font-black text-amber-500 uppercase tracking-wider leading-none">
            {offline ? 'Modo Sin Conexión' : 'Modo Solo Lectura Local Activo'}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-medium leading-tight">
            {offline 
              ? 'No tienes conexión a internet. Los cambios se sincronizarán al restablecer la red.'
              : 'Se agotó la cuota diaria de base de datos en la nube. Operando localmente desde IndexedDB.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 py-1 px-2.5 min-h-[28px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 hover:text-amber-400 !text-white text-[10px] font-black uppercase tracking-wider rounded-md active:scale-95 transition-all cursor-pointer border border-amber-500/10 shadow-sm"
        >
          <RefreshCw size={10} />
          Verificar
        </button>
      </div>
    </div>
  );
}
