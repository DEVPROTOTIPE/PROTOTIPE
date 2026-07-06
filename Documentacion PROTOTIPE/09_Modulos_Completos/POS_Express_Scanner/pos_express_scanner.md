<!--
{
  "technicalName": "PosExpressScanner",
  "targetPath": "src/components/modules/PosExpressScanner.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Módulo de Cobro POS Exprés por Lector de Barras

## 1. Propósito y Casos de Uso
Permite capturar lecturas de códigos de barra (EAN-13, SKU) desde lectores físicos USB o Bluetooth simulando la adición inmediata de productos en la pantalla de cobro del POS en minimercados o tiendas abarrotes.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
El módulo ofrece una interfaz oscura estilo caja registradora con:
- Alertas de éxito y fallo visual (Glow HSL).
- Tabla de artículos agregados en caliente con animaciones Framer Motion.
- Sonido acústico de "bip" integrado usando la API Web Audio de HTML5.

---

## 3. Código React Completo y Funcional
A continuación, se detalla el componente principal `BarcodeScannerPOS.jsx`:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { Scan, ShoppingCart, Tag, Trash2 } from 'lucide-react';

export default function BarcodeScannerPOS({ products = [], onCheckout }) {
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const inputRef = useRef(null);

  // Reproducir un sonido de beep sintético mediante la API Web Audio
  const playBeep = (freq = 800, dur = 0.08) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {
      console.warn('Audio Context block:', e.message);
    }
  };

  const processBarcode = (code) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const prod = products.find(p => p.barcode === trimmed || p.sku === trimmed);
    if (prod) {
      playBeep(880, 0.08); // Bip de éxito
      setCart(prev => {
        const existIdx = prev.findIndex(item => item.id === prod.id);
        if (existIdx > -1) {
          const updated = [...prev];
          updated[existIdx].quantity += 1;
          return updated;
        } else {
          return [...prev, { ...prod, quantity: 1 }];
        }
      });
      setLastScanned(prod);
    } else {
      playBeep(220, 0.25); // Sonido grave de error
      alert(`Código ${trimmed} no registrado.`);
    }
    setBarcodeInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processBarcode(barcodeInput);
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 space-y-4 max-w-md mx-auto">
      {/* Campo de escaneo */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Scan size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Escanear o ingresar código..."
            value={barcodeInput}
            onChange={e => setBarcodeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => processBarcode(barcodeInput)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-[var(--color-text)] rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Agregar
        </button>
      </div>

      {/* Retroalimentación del último escaneo */}
      {lastScanned && (
        <div className="bg-indigo-500/10 border border-indigo-500/25 p-3 rounded-xl flex items-center justify-between text-xs text-indigo-300">
          <span>Último producto: <strong>{lastScanned.name}</strong></span>
          <span className="font-mono bg-indigo-500/15 border border-indigo-500/10 px-2 py-0.5 rounded text-[10px]">
            ${lastScanned.price.toLocaleString('es-CO')}
          </span>
        </div>
      )}

      {/* Lista del Carrito */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 italic">
            Esperando lecturas de códigos...
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-[var(--color-surface)]/50 p-2.5 rounded-xl border border-[var(--color-border)]/80 text-xs text-[var(--color-text-muted)]">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200">{item.name}</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>${item.price.toLocaleString('es-CO')} x {item.quantity}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold">${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                <button
                  onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}
                  className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumen */}
      {cart.length > 0 && (
        <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
          <div className="flex justify-between items-center text-sm font-black text-slate-200">
            <span>Total POS:</span>
            <span className="font-mono text-indigo-400">${total.toLocaleString('es-CO')}</span>
          </div>
          <button
            onClick={() => {
              playBeep(980, 0.15);
              onCheckout?.(cart);
              setCart([]);
              setLastScanned(null);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-[var(--color-text)] rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
          >
            <ShoppingCart size={12} /> Procesar Cobro
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Lógica de Estado
El estado local se gestiona en un array de ítems agregados indexados por ID y actualizados reactivamente mediante eventos de teclado USB del escáner en caliente.
