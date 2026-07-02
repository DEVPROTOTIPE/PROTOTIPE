<!--
{
  "technicalName": "ErrorBoundaryFallback",
  "targetPath": "src/utils/ErrorBoundaryFallback.js",
  "dependencies": {
    "npm": {},
    "internal": []
  },
  "type": "component",
  "niches": []
}
-->

# Error Boundary y UI de Recuperación Fallback (`ErrorBoundaryFallback`)

## 1. Propósito y Casos de Uso
Componente estructural tipo clase de React diseñado como cortafuegos definitivo contra fallas fatales en el cliente. Resuelve:
- **Prevención de Pantalla en Blanco:** Si un componente de UI falla al renderizarse (por ejemplo, por propiedades nulas o no estructuradas), evita que se rompa todo el árbol de React, aislando el error y mostrando una interfaz de recuperación en su lugar.
- **Acción de Rescate Local:** Permite al usuario reintentar el renderizado (intentando re-montar el árbol una vez limpiado el state o recargado el componente) o reportar el error en caliente vía callback a la telemetría central.

**Casos de uso:** Envoltura del visor de gráficos de ventas, listas de facturación comisional, checkout multipaso, y el portal del POS.

---

## 2. Especificación Visual y Estilos (Tailwind CSS)
- **Glassmorphic Warning Card:** Tarjeta de contención con desenfoque de fondo y color de advertencia (`backdrop-blur-md bg-[var(--color-surface)]/40 border border-red-500/20 text-slate-100`).
- **Stack Trace Seguro:** Sección colapsable que oculta el error técnico a usuarios no técnicos pero permite desplegarlo mediante un botón "Ver detalles técnicos" en fuente de consola monoespaciada para depuración in situ.

---

## 3. Código React Completo y 100% Funcional

```jsx
// src/components/ui/feedback/ErrorBoundaryFallback.jsx
import React, { Component } from 'react';
import { AlertOctagon, RefreshCcw, Send, ChevronDown, ChevronUp } from 'lucide-react';

export class ErrorBoundaryFallback extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Callback para inyectar logs a telemetría central
    if (this.props.onErrorLogged) {
      this.props.onErrorLogged(error, errorInfo);
    }
    console.error('[ErrorBoundary] Capturado:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallbackTitle = 'Algo salió mal', fallbackDesc = 'El componente no se pudo renderizar correctamente.' } = this.props;

      return (
        <div className="w-full p-6 bg-[var(--color-surface)]/30 border border-[var(--color-border)] rounded-3xl backdrop-blur-md flex flex-col md:flex-row gap-5 items-start justify-between">
          <div className="flex-1 space-y-3 min-w-0">
            {/* Cabecera */}
            <div className="flex items-center gap-2 text-red-400">
              <AlertOctagon size={18} className="animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider">{fallbackTitle}</h3>
            </div>
            
            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed max-w-md">
              {fallbackDesc} Si el problema persiste, intenta recargar el sitio o repórtalo a soporte técnico.
            </p>

            {/* Detalles Técnicos */}
            <div className="space-y-1.5">
              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-indigo-400 transition-colors cursor-pointer outline-none"
              >
                {this.state.showDetails ? (
                  <>Ocultar Detalles <ChevronUp size={10} /></>
                ) : (
                  <>Ver Detalles Técnicos <ChevronDown size={10} /></>
                )}
              </button>

              {this.state.showDetails && (
                <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 overflow-x-auto max-h-[140px] overflow-y-auto">
                  <pre className="font-mono text-[9px] text-red-300 leading-normal whitespace-pre-wrap select-text">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0 pt-1">
            <button
              onClick={this.handleReset}
              className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-[10px] font-black text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
            >
              <RefreshCcw size={12} />
              Reintentar
            </button>
            
            {this.props.onReport && (
              <button
                onClick={() => this.props.onReport(this.state.error, this.state.errorInfo)}
                className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/35 hover:scale-105 active:scale-95 text-[10px] font-black text-[var(--color-text)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Send size={11} />
                Reportar Bug
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 4. Lógica de Estado y Ciclo de Vida
```
  ErrorBoundary (Componente de clase React)
  ├── State: hasError, error (JS object), errorInfo (trace stack), showDetails (boolean)
  │
  ├── getDerivedStateFromError()  ──► Captura y retorna { hasError: true } (Fase de Render)
  ├── componentDidCatch()         ──► Lanza log de depuración + callback de telemetría (Fase Commit)
  └── handleReset()               ──► Resetea estado a false + ejecuta onReset()
```

- **Captura Temprana:** Al extender la clase `Component` de React e implementar `getDerivedStateFromError`, el componente se engancha a la fase de reconciliación de la vista. Evita que la pantalla se quede en blanco, dibujando la UI de Fallback antes de que el navegador complete la renderización fallida.
- **Depuración Local:** Oculta el stack trace en un bloque colapsable interactivo mediante `state.showDetails` para mantener limpia la interfaz al usuario común, facilitando la auditoría técnica rápida a los desarrolladores al abrir la consola.

---

## 5. Secuencia de Interacción (Flujo Operativo)
```
[Crash en Componente Hijo]
           │
           ▼
[ErrorBoundaryFallback]
 ├── getDerivedStateFromError() -> Setea hasError: true
 ├── componentDidCatch() -> Envía log a telemetría
 └── Renderiza Fallback UI
           │
           ▼
 [Usuario hace clic en Reintentar]
 ├── handleReset() -> Resetea hasError: false
 └── Re-monta componente hijo
```
