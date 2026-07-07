<!--
{
  "resource": "ConsentimientoFirmaDigital",
  "technicalName": "ConsentimientoFirmaDigital",
  "targetPath": "src/components/common/ConsentimientoFirmaDigital.jsx",
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

# Consentimiento Clínico y Firma Digital (`ConsentimientoFirmaDigital`)

Formulario digital legal que presenta los términos del consentimiento informado del tratamiento podológico o estético, complementado con un lienzo Canvas interactivo para capturar la firma manuscrita digitalizada del paciente.

## 1. Propósito y Casos de Uso
- **Protección Legal (Consentimiento Informado):** Firma digital obligatoria antes de realizar tratamientos invasivos o de podología clínica (ej: remoción de helomas, onicocriptosis, tratamientos con láser).
- **Proceso Ecológico y sin Papel:** Eliminación del papel en el flujo de recepción.

## 2. Especificación Visual y Estilos
- **Caja de Términos Desplazable:** Contenedor con `overflow-y-auto` y padding de holgura para evitar truncamiento.
- **Canvas de Firma Premium:** Panel de dibujo táctil y mouse con fondo contrastado y borde redondeado.
- **Microinteracciones:** Botones de limpieza ("Borrar Firma") y guardado que reaccionan a eventos táctiles.

## 3. Código React Completo

```jsx
import React, { useRef, useState, useEffect } from 'react';
import { Shield, FileText, RefreshCw, CheckCircle, Download, AlertCircle } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';

export default function ConsentimientoFirmaDigital({ onSign, docTitle, termsText }) {
  const { alertConfirm } = useAlertConfirm();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [nombreFirmante, setNombreFirmante] = useState('');
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const defaultTerms = termsText || `Por medio de la presente, declaro que he sido informado de forma clara y detallada acerca del tratamiento podológico que se me realizará. Entiendo que los procedimientos clínicos incluyen el corte de uñas, desbridamiento de helomas (callosidades), fresado mecánico e instrumental punzante esterilizado.

Acepto que se me han explicado los posibles riesgos menores asociados (leves laceraciones, enrojecimiento temporal) y declaro bajo juramento que no he ocultado patologías críticas como pie diabético, hemofilia o problemas de coagulación severos en mi ficha de historial clínico.

Doy mi autorización libre y voluntaria para que el profesional staff a cargo realice el procedimiento indicado.`;

  // Inicializar el Canvas con soporte de escala Retina
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Configuración de trazo
    ctx.strokeStyle = 'var(--color-primary, #6366f1)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Controladores de dibujo
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Obtener coordenadas de mouse o touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevenir scroll en móviles
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Acción Destructiva: Requiere confirmación obligatoria useAlertConfirm
  const clearCanvas = async () => {
    const confirm = await alertConfirm({
      title: '¿Borrar Firma?',
      message: '¿Está seguro de que desea limpiar el panel de firma? Perderá el trazo actual.',
      variant: 'warning'
    });

    if (confirm) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSigned(false);
      setIsSaved(false);
    }
  };

  const handleSaveSignature = (e) => {
    e.preventDefault();
    if (!hasSigned) {
      alert('Por favor dibuje su firma antes de aceptar.');
      return;
    }
    if (!nombreFirmante) {
      alert('Por favor introduzca su nombre completo.');
      return;
    }

    setIsSaved(true);
    if (onSign) {
      const canvas = canvasRef.current;
      const signatureDataUrl = canvas.toDataURL();
      onSign({
        nombre: nombreFirmante,
        firma: signatureDataUrl,
        fecha: new Date().toLocaleDateString()
      });
    }
  };

  const handleScroll = (e) => {
    const target = e.target;
    // Si falta menos de 10px para llegar al final, consideramos lectura completada
    const reachedBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    if (reachedBottom) {
      setScrolledToBottom(true);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden transition-all duration-300">
      
      {/* Cabecera */}
      <div className="p-5 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary-light)] to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">{docTitle || 'Consentimiento Informado'}</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Firma de autorización de procedimientos</p>
          </div>
        </div>
        <Shield className="w-5 h-5 text-[var(--color-primary)]" />
      </div>

      {isSaved ? (
        <div className="p-8 text-center flex flex-col items-center justify-center gap-4 animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-[var(--color-text)]">Documento Firmado y Aceptado</h4>
          <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">
            El consentimiento legal ha sido sellado digitalmente para el paciente <strong>{nombreFirmante}</strong> el {new Date().toLocaleDateString()}.
          </p>
          
          <button
            onClick={() => setIsSaved(false)}
            className="mt-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Firmar de Nuevo
          </button>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          
          {/* Caja de Términos */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">
              Términos del Acuerdo (Deslice para leer completo)
            </label>
            <div 
              onScroll={handleScroll}
              className="h-32 overflow-y-auto p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[11px] text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line"
            >
              {defaultTerms}
            </div>
            
            {!scrolledToBottom && (
              <span className="text-[9px] text-amber-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Debe deslizar los términos al final para habilitar la firma.
              </span>
            )}
          </div>

          <div className={`space-y-4 transition-all duration-300 ${!scrolledToBottom ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* Nombre Firmante */}
            <div>
              <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase mb-1">Nombre Completo del Paciente</label>
              <input
                type="text"
                value={nombreFirmante}
                onChange={(e) => setNombreFirmante(e.target.value)}
                placeholder="Ej. Juan Carlos Restrepo"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all"
              />
            </div>

            {/* Canvas de Dibujo */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase">Lienzo de Firma Manuscrita</label>
                {hasSigned && (
                  <button 
                    type="button" 
                    onClick={clearCanvas}
                    className="text-[9px] font-black uppercase text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Borrar Firma
                  </button>
                )}
              </div>

              <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-white relative">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[150px] cursor-crosshair touch-none"
                />
                {!hasSigned && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-[var(--color-text-muted)]/80 font-bold uppercase tracking-wider">
                    Dibuje su firma aquí
                  </div>
                )}
              </div>
            </div>

            {/* Envío */}
            <button
              onClick={handleSaveSignature}
              disabled={!hasSigned || !nombreFirmante}
              className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] !text-[var(--color-text)] text-xs font-black uppercase tracking-wider shadow-md hover:bg-[var(--color-primary-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Aceptar y Firmar Acuerdo
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
```

## 4. Lógica de Estado y Ciclo de Vida
- **`scrolledToBottom`:** Bloqueador de seguridad que impide la firma hasta que el usuario haya deslizado el acuerdo hasta el final.
- **`hasSigned`:** Controla si el Canvas contiene trazos para activar el botón de guardado y de limpieza de firma.
- **`isDrawing`:** Booleano local que define el ciclo mousedown/mousemove/mouseup en el Canvas.

## 5. Flujo Operativo y Secuencia de Interacción

```mermaid
sequenceDiagram
  participant Paciente as Paciente
  participant Comp as ConsentimientoFirma Component
  participant Conf as useAlertConfirm Modal

  Paciente->{bracket}Comp: Desliza los términos al final del acuerdo
  Comp->{bracket}Comp: Habilita sección de firma y nombre
  Paciente->{bracket}Comp: Escribe su nombre y dibuja firma en Canvas
  Paciente->{bracket}Comp: Da clic en "Borrar Firma"
  Comp->{bracket}Conf: Despliega confirmación de limpieza de firma
  Conf--{bracket}Comp: Confirmado "Sí, limpiar"
  Comp->{bracket}Comp: Resetea el Canvas a blanco
```
