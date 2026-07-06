<!--
{
  "resource": "VisorAnalisisPisada",
  "technicalName": "VisorAnalisisPisada",
  "targetPath": "src/components/common/VisorAnalisisPisada.jsx",
  "type": "component",
  "niches": ["wellness_podology"],
  "dependencies": {
    "npm": {
      "lucide-react": "^0.344.0"
    },
    "internal": []
  }
}
-->

# Visor de Análisis de Pisada (`VisorAnalisisPisada`)

Componente clínico avanzado que visualiza el mapa de presiones plantares (estática y dinámica) mediante mapas de calor interactivos en SVG, simulando las fases del ciclo de marcha (Heel Strike, Midstance, Toe-Off).

## 1. Propósito y Casos de Uso
- **Podología Deportiva y Ortopedia:** Diseñar plantillas personalizadas y diagnosticar anomalías en la pisada (supinador, pronador, neutro).
- **Simulación del Ciclo de Marcha:** Visualizar cómo se desplaza el centro de presiones del talón a los metatarsos para análisis biomecánico detallado.

## 2. Especificación Visual y Estilos
- **Mapas de Calor Plantares SVG:** Siluetas de los pies izquierdo y derecho con gradientes de color dinámicos (Rojo: Alta Presión, Amarillo: Presión Media, Verde: Presión Baja, Azul: Sin Presión).
- **Sincronización del Gait Cycle:** Slider premium que cambia la posición y opacidad de los puntos calientes simulando el apoyo del talón hasta el despegue de dedos.
- **Métricas Biomecánicas:** Indicadores dinámicos de simetría (Izquierdo vs Derecho), centro de gravedad y puntos de presión máxima.

## 3. Código React Completo

```jsx
import React, { useState } from 'react';
import { Activity, Percent, ArrowRight, RefreshCw, Layers } from 'lucide-react';

const FASES_MARCHA = [
  { id: 'f-strike', label: 'Contacto de Talón (Heel Strike)', percent: 0 },
  { id: 'f-mid', label: 'Apoyo Medio (Midstance)', percent: 50 },
  { id: 'f-off', label: 'Despegue de Dedos (Toe-Off)', percent: 100 }
];

export default function VisorAnalisisPisada({ onChange }) {
  const [gaitPercent, setGaitPercent] = useState(0); // 0 a 100%
  const [tipoPisada, setTipoPisada] = useState('neutra'); // pronadora, supinadora, neutra
  const [analisisTipo, setAnalisisTipo] = useState('dinamico'); // estatico, dinamico

  // Calcular la posición del calor en base al porcentaje del ciclo de marcha
  // Heel Strike: Foco en Talón (y: 310)
  // Midstance: Foco en Arco/Metatarso (y: 200)
  // Toe-Off: Foco en Dedos/Metatarso Alto (y: 90)
  const getHeatCenters = () => {
    if (analisisTipo === 'estatico') {
      return {
        // Estático: Distribución uniforme de presiones normales
        left: [
          { cx: 85, cy: 90, r: 20, op: 0.4, color: 'url(#grad-blue)' }, // Dedos
          { cx: 105, cy: 150, r: 35, op: 0.8, color: 'url(#grad-red)' }, // Metatarso
          { cx: 100, cy: 310, r: 32, op: 0.7, color: 'url(#grad-orange)' } // Talón
        ],
        right: [
          { cx: 155, cy: 90, r: 20, op: 0.4, color: 'url(#grad-blue)' },
          { cx: 135, cy: 150, r: 35, op: 0.8, color: 'url(#grad-red)' },
          { cx: 140, cy: 310, r: 32, op: 0.7, color: 'url(#grad-orange)' }
        ]
      };
    }

    // Dinámico: Cambia dinámicamente según el slider de marcha
    const pct = gaitPercent / 100;
    
    // Y-coordinate shifts along the foot sole
    const yLeft = 310 - (220 * pct);
    const yRight = 310 - (220 * pct);

    // Ajustes de X según el tipo de pisada (Pronador se va hacia adentro, Supinador hacia afuera)
    let xLeftOffset = 0;
    let xRightOffset = 0;
    
    if (pct > 0.3 && pct < 0.8) {
      if (tipoPisada === 'pronadora') {
        xLeftOffset = 18; // Desviación medial
        xRightOffset = -18;
      } else if (tipoPisada === 'supinadora') {
        xLeftOffset = -15; // Desviación lateral
        xRightOffset = 15;
      }
    }

    return {
      left: [
        // Foco de calor móvil dinámico
        { cx: 100 + xLeftOffset, cy: yLeft, r: 42, op: 0.9, color: 'url(#grad-red)' },
        // Focos secundarios estáticos menores para simular realismo
        { cx: 85, cy: 90, r: 15, op: pct > 0.7 ? 0.8 : 0.1, color: 'url(#grad-orange)' },
        { cx: 100, cy: 310, r: 25, op: pct < 0.4 ? 0.7 : 0.1, color: 'url(#grad-blue)' }
      ],
      right: [
        { cx: 140 + xRightOffset, cy: yRight, r: 42, op: 0.9, color: 'url(#grad-red)' },
        { cx: 155, cy: 90, r: 15, op: pct > 0.7 ? 0.8 : 0.1, color: 'url(#grad-orange)' },
        { cx: 140, cy: 310, r: 25, op: pct < 0.4 ? 0.7 : 0.1, color: 'url(#grad-blue)' }
      ]
    };
  };

  const heats = getHeatCenters();

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-lg">
      
      {/* Columna Izquierda: Mapa de Calor SVG */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[var(--color-bg)]/50 rounded-xl p-4 border border-[var(--color-border)] relative">
        <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest absolute top-4 left-4">Mapa de Presiones Plantares</span>

        {/* SVG de Pies */}
        <div className="flex gap-6 mt-6 justify-center w-full">
          <svg className="w-full max-w-full max-w-[21.25rem] h-[360px]" viewBox="0 0 240 400">
            {/* Definición de Gradientes HSL para Mapa de Calor */}
            <defs>
              <radialGradient id="grad-red" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                <stop offset="30%" stopColor="#f97316" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#eab308" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="grad-orange" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#eab308" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="grad-blue" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* SILUETA PIE IZQUIERDO */}
            <g opacity="0.85">
              <path 
                d="M 90 40 C 65 40, 45 70, 45 110 C 45 155, 75 190, 65 240 C 55 290, 75 365, 100 365 C 115 365, 120 330, 115 290 C 110 240, 115 190, 110 145 C 110 90, 105 40, 90 40 Z" 
                fill="none" 
                stroke="var(--color-border)" 
                strokeWidth="2"
              />
              {/* Zonas de Presión Izquierda */}
              {heats.left.map((h, i) => (
                <circle key={i} cx={h.cx} cy={h.cy} r={h.r} fill={h.color} opacity={h.op} />
              ))}
            </g>

            {/* SILUETA PIE DERECHO */}
            <g opacity="0.85">
              <path 
                d="M 150 40 C 175 40, 195 70, 195 110 C 195 155, 165 190, 175 240 C 185 290, 165 365, 140 365 C 125 365, 120 330, 125 290 C 130 240, 125 190, 130 145 C 130 90, 135 40, 150 40 Z" 
                fill="none" 
                stroke="var(--color-border)" 
                strokeWidth="2"
              />
              {/* Zonas de Presión Derecha */}
              {heats.right.map((h, i) => (
                <circle key={i} cx={h.cx} cy={h.cy} r={h.r} fill={h.color} opacity={h.op} />
              ))}
            </g>

            {/* Centro de gravedad promedio dinámico */}
            <circle 
              cx={120 + (tipoPisada === 'pronadora' ? 8 : tipoPisada === 'supinadora' ? -8 : 0)} 
              cy={210} 
              r={7} 
              fill="#10b981" 
              stroke="#fff" 
              strokeWidth="2" 
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Leyenda */}
        <div className="flex gap-4 mt-2 justify-center text-[9px] font-bold text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-3 w-full">
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-red-500" /> Max Presión</div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-amber-500" /> Presión Media</div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-blue-500" /> Apoyo Leve</div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" /> COP (Gravedad)</div>
        </div>
      </div>

      {/* Columna Derecha: Controles y Biomecánica */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div>
          <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">Métricas Biomecánicas</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Ajuste de parámetros y simulación de marcha</p>
        </div>

        {/* Tipo de Análisis */}
        <div className="flex gap-2 p-1 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
          {[
            { id: 'dinamico', label: 'Dinámico (Ciclo)' },
            { id: 'estatico', label: 'Estático (Apoyo)' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAnalisisTipo(t.id)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                analisisTipo === t.id
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] shadow-sm'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Simulador Ciclo Marcha */}
        {analisisTipo === 'dinamico' && (
          <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex flex-col gap-3.5 animate-fadeIn">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Ciclo de Marcha (Gait Cycle)</span>
              <span className="text-xs font-black text-[var(--color-primary)]">{gaitPercent}%</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="100"
              value={gaitPercent}
              onChange={(e) => setGaitPercent(parseInt(e.target.value))}
              className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
            />

            <div className="flex justify-between text-[9px] font-bold text-[var(--color-text-muted)]">
              <span>Talón (0%)</span>
              <span>Medio (50%)</span>
              <span>Dedos (100%)</span>
            </div>
          </div>
        )}

        {/* Selector de Patología / Pisada */}
        <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex flex-col gap-2.5">
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Tipo de Pisada Diagnosticada</span>
          
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'neutra', label: 'Neutra' },
              { id: 'pronadora', label: 'Pronación' },
              { id: 'supinadora', label: 'Supinación' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setTipoPisada(p.id)}
                className={`py-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                  tipoPisada === p.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="text-[9px] text-[var(--color-text-muted)] leading-relaxed mt-1">
            {tipoPisada === 'pronadora' && '⚠️ Pronación: Desviación del eje de apoyo hacia la parte medial (interna) del pie. Riesgo de fascitis.'}
            {tipoPisada === 'supinadora' && '⚠️ Supinación: Mayor carga sobre el borde lateral (externo) del pie. Riesgo de esguinces.'}
            {tipoPisada === 'neutra' && '✓ Pisada Neutra: Distribución equilibrada del peso corporal a lo largo del arco y metatarsos.'}
          </p>
        </div>

        {/* Panel de Simetría */}
        <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex flex-col gap-2.5">
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Distribución de Apoyo Simétrico</span>
          <div className="flex items-center gap-4 justify-between">
            <div className="text-center">
              <span className="text-lg font-black text-[var(--color-text)]">
                {tipoPisada === 'pronadora' ? '54%' : tipoPisada === 'supinadora' ? '47%' : '50%'}
              </span>
              <p className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] mt-0.5">Pie Izquierdo</p>
            </div>
            
            <div className="flex-1 flex items-center justify-center gap-1 text-[var(--color-text-muted)]">
              <Percent className="w-4 h-4 shrink-0" />
            </div>

            <div className="text-center">
              <span className="text-lg font-black text-[var(--color-text)]">
                {tipoPisada === 'pronadora' ? '46%' : tipoPisada === 'supinadora' ? '53%' : '50%'}
              </span>
              <p className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] mt-0.5">Pie Derecho</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
```

## 4. Lógica de Estado y Ciclo de Vida
- **`gaitPercent` (0% a 100%):** Coordina en tiempo real el desplazamiento vertical y lateral de los puntos de calor plantar SVG simulando el movimiento dinámico del pie.
- **`tipoPisada`:** Altera lateralmente las coordenadas X e Y de las zonas de presión para modelar desviaciones patológicas de pronación y supinación de forma interactiva.

## 5. Flujo Operativo y Secuencia de Interacción

```mermaid
sequenceDiagram
  participant Podologo as Podólogo / Diseñador Plantillas
  participant Visor as VisorPisada Component
  participant SVG as SVG Plantar Dynamic

  Podologo->{bracket}Visor: Activa tipo de pisada "Pronación"
  Visor->{bracket}Visor: Cambia desviación de ejes en calor (X medial)
  Podologo->{bracket}Visor: Desplaza slider de marcha a 100% (Toe-Off)
  Visor->{bracket}SVG: Mueve círculos de calor del talón (y: 310) a los dedos (y: 90)
  SVG--{bracket}Podologo: Muestra resplandor en metatarso interno por pronación
  Visor->{bracket}Visor: Recalcula barra de distribución simétrica (54% Izq / 46% Der)
```
