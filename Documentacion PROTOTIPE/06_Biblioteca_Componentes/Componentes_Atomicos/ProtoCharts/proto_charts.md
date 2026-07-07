<!--
{
  "technicalName": "ProtoCharts",
  "targetPath": "src/components/ui/ProtoCharts.jsx",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "atom",
  "niches": ["grocery_food", "retail_clothing", "technical_services", "wellness_podology", "laundry"]
}
-->

# ProtoCharts — Biblioteca de Visualización SVG (Zero Deps)

## 1. Propósito y Casos de Uso

`ProtoCharts` es una colección de componentes de visualización de datos 100% SVG nativos, sin ninguna dependencia externa (sin Recharts, sin D3, sin Victory). Diseñada para dashboards de ventas, reportes de KPIs, análisis de tendencias y comparativas por categoría en el ecosistema PROTOTIPE.

**Casos de uso:**
- Dashboards de ventas con métricas en tiempo real (KPI Cards)
- Tablas de comparativa con sparklines inline de tendencia
- Gráficas de área para evolución mensual de pedidos o ingresos
- Barras verticales para comparar categorías de productos

**Componentes exportados:**
- `Sparkline` — Línea de tendencia ultra-compacta para tablas e inline
- `AreaChart` — Gráfica de área con gradiente, tooltip y línea de promedio
- `BarChart` — Barras verticales con animación y tooltip de valor
- `KpiCard` — Tarjeta de métrica completa con sparkline, delta % y tendencia
- `formatCompact` — Utilidad: formatea números grandes (1500 → 1.5K, 2M → 2M)

## 2. Especificación Visual y Estilos

- **Zero deps:** SVG puro con `useMemo` para paths Bézier. Sin Canvas, sin WebGL.
- **Tema integrado:** Usa `var(--color-primary)`, `var(--color-surface)`, `var(--color-border)`, `var(--color-text)` del sistema de diseño.
- **Tooltips nativos:** Implementados con estado React + línea SVG de cursor, sin librerías externas.
- **Línea de promedio:** `AreaChart` y `BarChart` admiten `showAvg` para renderizar la media como línea de referencia punteada.
- **Animación de barras:** Las barras del `BarChart` se animan con CSS `@keyframes` inline al montar.
- **Sparkline con área:** El `Sparkline` admite la prop `area` para rellenar con gradiente bajo la línea.

## 3. Código React Completo y 100% Funcional

```jsx
// src/components/ui/ProtoCharts.jsx
// (ver archivo fuente completo — 435 líneas)
// Importar desde la ruta del proyecto destino:
import { Sparkline, AreaChart, BarChart, KpiCard, formatCompact } from '../ui/ProtoCharts';
```

### API de cada componente

#### `<Sparkline />`
| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `data` | `number[]` | requerido | Valores a graficar |
| `w` | `number` | `80` | Ancho en px |
| `h` | `number` | `32` | Alto en px |
| `color` | `string` | `var(--color-primary)` | Color del trazo |
| `area` | `boolean` | `false` | Relleno bajo la línea |
| `strokeWidth` | `number` | `1.5` | Grosor del trazo |

#### `<AreaChart />`
| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `data` | `number[]` | requerido | Valores del eje Y |
| `labels` | `string[]` | `[]` | Etiquetas del eje X |
| `color` | `string` | `var(--color-primary)` | Color principal |
| `h` | `number` | `160` | Alto en px |
| `showAvg` | `boolean` | `false` | Línea de promedio |
| `unit` | `string` | `''` | Prefijo del tooltip |
| `formatY` | `function` | `formatCompact` | Formato del eje Y |

#### `<BarChart />`
| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `data` | `number[]` | requerido | Valores |
| `labels` | `string[]` | `[]` | Etiquetas |
| `colors` | `string[]` | `[primary]` | Color por barra |
| `h` | `number` | `140` | Alto en px |
| `showAvg` | `boolean` | `false` | Línea de promedio |
| `rounded` | `boolean` | `false` | Bordes superiores redondeados |
| `unit` | `string` | `''` | Prefijo del tooltip |

#### `<KpiCard />`
| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | requerido | Título de la métrica |
| `value` | `number` | requerido | Valor actual |
| `prevValue` | `number` | — | Valor anterior (para delta %) |
| `trend` | `number[]` | `[]` | Datos de sparkline |
| `unit` | `string` | `''` | Prefijo (`$`) |
| `suffix` | `string` | `''` | Sufijo (`órdenes`) |
| `icon` | `string` | `''` | Emoji o texto del ícono |
| `color` | `string` | `var(--color-primary)` | Color del glow y sparkline |
| `formatVal` | `function` | `formatCompact` | Formato del valor principal |

### Ejemplo de uso

```jsx
import { KpiCard, AreaChart, BarChart, Sparkline } from '../ui/ProtoCharts';

// KPI Card con tendencia
<KpiCard
  title="Ventas del Mes"
  value={2600000}
  prevValue={2150000}
  trend={[1200000, 1450000, 1680000, 1900000, 2150000, 2600000]}
  unit="$"
  icon="💰"
  color="#6366f1"
  formatVal={(v) => `${(v / 1000000).toFixed(1)}M`}
/>

// Gráfica de área
<AreaChart
  data={[34, 28, 41, 36, 55, 62, 58, 70]}
  labels={['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago']}
  color="#10b981"
  h={130}
  showAvg={true}
/>

// Sparkline inline en tabla
<Sparkline data={[12, 15, 11, 18, 22, 19, 25]} w={80} h={24} color="#f59e0b" area />
```

## 4. Lógica de Estado y Ciclo de Vida

- **`normalizePoints(data, w, h)`:** Mapea valores al viewBox SVG. Usa min/max del array con padding vertical de 4px.
- **`smoothPath(pts)`:** Genera path Bézier cuadrático con algoritmo midpoint para líneas suaves sin esquinas.
- **Tooltips:** Estado `hoveredIdx` (AreaChart) y `hovered` (BarChart) controlados con `onMouseMove` sobre el SVG, calculando la posición X relativa al viewBox mediante `getBoundingClientRect`.
- **`KpiCard`:** Calcula el delta porcentual con `((value - prevValue) / prevValue) * 100`. Positivo = verde, negativo = rojo.

## 5. Flujo Operativo

```
data[] → normalizePoints() → smoothPath() → <path d="..." />
                                          ↘ <polygon /> (área)
onMouseMove → calcX% → hoveredIdx → <line /> tooltip + <text /> valor
showAvg=true → avg = mean(data) → <line /> punteada de referencia
```
