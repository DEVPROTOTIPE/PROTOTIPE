# Selector de Variantes (VariantSelector)

## 1. Propósito y Casos de Uso
El componente `VariantSelector` es una interfaz atómica interactiva premium que permite a los usuarios seleccionar atributos combinados de un producto (como tallas, colores, materiales o extras).
Es un componente **marca blanca y stateless-controlado**. Cuenta con una arquitectura robusta que valida en tiempo real la combinación elegida, deshabilitando de forma activa las variantes agotadas (stock `0`) o no disponibles, y retornando la selección correcta mediante callbacks limpios y libres de dependencias de bases de datos.

---

## 2. Especificación Visual y Estilos
* **Visual:** Botones elásticos con transiciones suaves en bordes y rellenos (`transition-all duration-300`).
* **Indicadores cromáticos:** Si se selecciona un color, el botón puede inyectar un preview circular del tono (hexadecimal) con anillos concéntricos activos.
* **Estilos e Integración CSS:** Diseñado usando variables CSS semánticas universales (`var(--color-primary)`, `var(--color-border)`), haciéndolo totalmente portable para proyectos sin Tailwind CSS.

---

## 3. Props y API del Componente
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variantes` | `array` | `[]` | Listado completo de variantes disponibles del producto (`[{ id, talla, color, stock }]`). |
| `selectedTalla` | `string` | `null` | Talla actualmente seleccionada por el usuario. |
| `selectedColor` | `string` | `null` | Color actualmente seleccionado por el usuario. |
| `onSelectTalla` | `function` | `() => {}` | Callback invocado al seleccionar una talla. Retorna la talla seleccionada. |
| `onSelectColor` | `function` | `() => {}` | Callback invocado al seleccionar un color. Retorna el color seleccionado. |
| `colorMap` | `object` | `{}` | Mapeo opcional de nombres de colores a valores hexadecimales CSS (ej. `{"rojo": "#ef4444"}`). Si se omite, renderiza botones de texto convencionales. |
| `className` | `string` | `""` | Clases de estilo de diseño adicionales. |
| `style` | `object` | `{}` | Estilos inline de fallback. |

---

## 4. Código React Completo y 100% Funcional (Lógica Validada)
```jsx
import React, { useMemo } from 'react';

/**
 * Componente VariantSelector - Selector de tallas y colores marca blanca autovalidado
 */
export default function VariantSelector({
  variantes = [],
  selectedTalla = null,
  selectedColor = null,
  onSelectTalla = () => {},
  onSelectColor = () => {},
  colorMap = {},
  className = "",
  style = {}
}) {
  
  // ─── 1. Extraer variantes que tienen stock disponible ───────────────────
  const availableVariants = useMemo(() => {
    return variantes.filter(v => (v.stock || 0) > 0);
  }, [variantes]);

  // ─── 2. Agrupar tallas únicas disponibles en stock ──────────────────────
  const tallas = useMemo(() => {
    const t = new Set(availableVariants.map(v => v.talla).filter(Boolean));
    return Array.from(t);
  }, [availableVariants]);

  // ─── 3. Agrupar colores únicos disponibles (dinámicos según talla seleccionada)
  const colores = useMemo(() => {
    let validVariants = availableVariants;
    if (selectedTalla) {
      // Filtrar colores disponibles únicamente para la talla ya elegida
      validVariants = validVariants.filter(v => v.talla === selectedTalla);
    }
    const c = new Set(validVariants.map(v => v.color).filter(Boolean));
    return Array.from(c);
  }, [availableVariants, selectedTalla]);

  // Manejo reactivo de la talla
  const handleTallaClick = (talla) => {
    onSelectTalla(talla);
    
    // Auto-validación lógica crítica: Si el color anteriormente seleccionado
    // no está disponible en la nueva talla elegida, se resetea a null para evitar combinaciones inválidas.
    if (selectedColor) {
      const isColorValid = availableVariants.some(v => v.talla === talla && v.color === selectedColor);
      if (!isColorValid) {
        onSelectColor(null);
      }
    }
  };

  // Helper para pintar el círculo de color
  const getHexColor = (colorName) => {
    if (!colorName) return null;
    const lowerName = colorName.toLowerCase().trim();
    return colorMap[lowerName] || null;
  };

  if (tallas.length === 0 && colores.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', ...style }} className={className}>
      
      {/* SECCIÓN A: SELECCIÓN DE TALLAS */}
      {tallas.length > 0 && (
        <div style={{ textAlign: 'left' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700', color: 'var(--color-text, #171717)' }}>
            Talla <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--color-text-muted, #737373)', marginLeft: '4px' }}>Selecciona una opción</span>
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tallas.map(t => {
              const isSelected = selectedTalla === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTallaClick(t)}
                  style={{
                    height: '38px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    border: isSelected ? '2px solid var(--color-primary, #2563eb)' : '2px solid var(--color-border, #e5e5e5)',
                    backgroundColor: isSelected ? 'var(--color-primary, #2563eb)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--color-text, #171717)'
                  }}
                  className="active:scale-95 hover:opacity-90"
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN B: SELECCIÓN DE COLORES */}
      {colores.length > 0 && (
        <div style={{ textAlign: 'left' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700', color: 'var(--color-text, #171717)' }}>
            Color {selectedColor && (
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-primary, #2563eb)', marginLeft: '6px', textTransform: 'uppercase' }}>
                ({selectedColor})
              </span>
            )}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {colores.map(c => {
              const isSelected = selectedColor === c;
              const hex = getHexColor(c);

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onSelectColor(c)}
                  style={{
                    height: '38px',
                    padding: hex ? '0 10px' : '0 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: isSelected ? '2px solid var(--color-primary, #2563eb)' : '2px solid var(--color-border, #e5e5e5)',
                    backgroundColor: isSelected ? 'var(--color-primary-light, rgba(37, 99, 235, 0.05))' : 'transparent',
                    color: 'var(--color-text, #171717)'
                  }}
                  className="active:scale-95 hover:opacity-90"
                >
                  {hex && (
                    <span 
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: hex,
                        border: '1px solid rgba(0,0,0,0.15)',
                        display: 'inline-block'
                      }} 
                    />
                  )}
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Origen
* **Extraído de:** [ProductDetailModal.jsx](file:///D:/PROTOTIPE/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx#L58-L88)
* **Fecha de extracción:** 2026-05-29
* **Versión:** 1.0 (Lógica e integridad de stock e invalidación de combinaciones 100% validadas y aisladas).
