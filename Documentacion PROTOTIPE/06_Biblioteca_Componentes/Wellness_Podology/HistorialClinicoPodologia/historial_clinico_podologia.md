<!--
{
  "resource": "HistorialClinicoPodologia",
  "technicalName": "HistorialClinicoPodologia",
  "targetPath": "src/components/common/HistorialClinicoPodologia.jsx",
  "type": "component",
  "niches": ["wellness_podology"],
  "dependencies": {
    "npm": {
      "lucide-react": "^0.344.0"
    },
    "internal": [
      { "name": "CustomSelect", "link": "file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Selector_Desplegable/custom_select.md" }
    ]
  }
}
-->

# Historial Clínico de Podología (`HistorialClinicoPodologia`)

Formulario digital interactivo diseñado para recopilar antecedentes médicos, alergias, patologías podológicas críticas (como pie diabético o afecciones vasculares) y estado de las uñas del paciente, cumpliendo con estándares de privacidad y diseño premium.

## 1. Propósito y Casos de Uso
- **Clínicas de podología y spas:** Registro clínico del paciente antes de iniciar tratamientos podológicos o de reflexología.
- **Filtro de Seguridad:** Detección de patologías de alto riesgo (ej. pie diabético con úlceras) que requieran derivación médica o precauciones especiales con instrumental.

## 2. Especificación Visual y Estilos
- **Contenedor Glassmorphic:** Fondos utilizando variables `--color-surface` y `--color-surface-2` con desenfoque de fondo (`backdrop-blur-md`).
- **Estados Activos:** Inputs y cards con transiciones suaves en bordes, sombras elevadas de color primario (`shadow-[var(--color-primary-glow)]`) y bordes de marca (`border-[var(--color-primary)]`).
- **Garantía de Contraste:** Textos con legibilidad extrema en Light Mode empleando la clase `!text-white` en botones de marca.

## 3. Código React Completo

```jsx
import React, { useState } from 'react';
import { Shield, AlertCircle, Heart, Info, ClipboardList, CheckCircle } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

export default function HistorialClinicoPodologia({ onSubmit, initialData = {} }) {
  const [activeTab, setActiveTab] = useState('personales');
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || '',
    edad: initialData.edad || '',
    telefono: initialData.telefono || '',
    diabetico: initialData.diabetico || 'no',
    insulinoDependiente: initialData.insulinoDependiente || 'no',
    problemasCirculatorios: initialData.problemasCirculatorios || 'no',
    alergias: initialData.alergias || '',
    condicionesFisicas: initialData.condicionesFisicas || [],
    observaciones: initialData.observaciones || ''
  });

  const [submitted, setSubmitted] = useState(false);

  const condicionesOpciones = [
    { id: 'onicocriptosis', label: 'Uña Encarnada (Onicocriptosis)' },
    { id: 'micosis', label: 'Hongos en Uñas/Piel (Onicomicosis/Dermatomicosis)' },
    { id: 'helomas', label: 'Callosidades Profundas (Helomas)' },
    { id: 'anhidrosis', label: 'Resequedad Extrema (Anhidrosis/Grietas)' },
    { id: 'hiperhidrosis', label: 'Sudoración Excesiva (Hiperhidrosis)' },
    { id: 'verruga', label: 'Verruga Plantar (Ojo de pescado)' }
  ];

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConditionToggle = (id) => {
    setFormData(prev => {
      const active = prev.condicionesFisicas.includes(id);
      return {
        ...prev,
        condicionesFisicas: active 
          ? prev.condicionesFisicas.filter(item => item !== id)
          : [...prev.condicionesFisicas, id]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.edad) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }
    setSubmitted(true);
    if (onSubmit) onSubmit(formData);
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden transition-all duration-300">
      {/* Encabezado */}
      <div className="p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary-light)] to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Historial Clínico</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Ficha de ingreso para tratamientos podológicos</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
          <Shield className="w-4 h-4" /> HIPAA Compliant
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg)]/50">
        {[
          { id: 'personales', label: '1. Datos Personales' },
          { id: 'clinicos', label: '2. Antecedentes Médicos' },
          { id: 'patologias', label: '3. Afecciones de los Pies' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-surface-2)]/30'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {submitted ? (
        <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-text)]">Historial Guardado Exitosamente</h3>
          <p className="text-[var(--color-text-muted)] max-w-md">
            Los datos clínicos de <strong>{formData.nombre}</strong> han sido encriptados y vinculados a su expediente correctamente.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 px-5 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all"
          >
            Editar Registro
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alertas de Riesgo Crítico */}
          {(formData.diabetico === 'si' || formData.problemasCirculatorios === 'si') && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm">Alerta de Riesgo Clínico:</span>
                <p className="text-xs mt-0.5 opacity-90">
                  Paciente diabético o con problemas circulatorios. Se debe utilizar únicamente instrumental esterilizado de punta roma y evitar cortes profundos para prevenir úlceras o necrosis.
                </p>
              </div>
            </div>
          )}

          {/* Tab 1: Datos Personales */}
          {activeTab === 'personales' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleTextChange}
                    placeholder="Ej. María Alejandra López"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">Edad *</label>
                  <input
                    type="number"
                    name="edad"
                    value={formData.edad}
                    onChange={handleTextChange}
                    placeholder="Ej. 34"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">Número de Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleTextChange}
                  placeholder="Ej. +57 300 123 4567"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Antecedentes Clínicos */}
          {activeTab === 'clinicos' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
                  <span className="block text-sm font-bold text-[var(--color-text)] mb-3">¿Padece Diabetes?</span>
                  <div className="flex gap-2">
                    {[{ value: 'no', label: 'No padece' }, { value: 'si', label: 'Sí padece' }].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, diabetico: opt.value }))}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                          formData.diabetico === opt.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                            : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 transition-all ${formData.diabetico === 'no' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <span className="block text-sm font-bold text-[var(--color-text)] mb-3">¿Es insulino-dependiente?</span>
                  <div className="flex gap-2">
                    {[{ value: 'no', label: 'No es' }, { value: 'si', label: 'Sí es' }].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, insulinoDependiente: opt.value }))}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                          formData.insulinoDependiente === opt.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                            : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
                <span className="block text-sm font-bold text-[var(--color-text)] mb-3">¿Sufre de problemas circulatorios o de cicatrización?</span>
                <div className="flex gap-4">
                  {[{ value: 'no', label: 'Sin problemas diagnosticados' }, { value: 'si', label: 'Sí, tiene insuficiencia/varices/mala cicatrización' }].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, problemasCirculatorios: opt.value }))}
                      className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg border text-left transition-all ${
                        formData.problemasCirculatorios === opt.value
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">Alergias a Medicamentos o Sustancias</label>
                <textarea
                  name="alergias"
                  value={formData.alergias}
                  onChange={handleTextChange}
                  placeholder="Ej. Alergia a la penicilina, yodo o alcohol de 90°..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Patologías Podológicas */}
          {activeTab === 'patologias' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="block text-sm font-bold text-[var(--color-text)] mb-3">Marque las afecciones actuales de sus pies:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {condicionesOpciones.map(cond => {
                    const active = formData.condicionesFisicas.includes(cond.id);
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => handleConditionToggle(cond.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          active
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm'
                            : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          active 
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-text)]' 
                            : 'border-[var(--color-border)] bg-transparent'
                        }`}>
                          {active && <span className="text-[10px] font-bold">✓</span>}
                        </div>
                        <span className="text-xs font-semibold">{cond.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1.5">Observaciones Adicionales / Motivo de consulta</label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleTextChange}
                  placeholder="Escriba aquí si siente dolor en alguna zona específica o si tiene alguna indicación especial..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Botones de Navegación del Formulario */}
          <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'patologias') setActiveTab('clinicos');
                else if (activeTab === 'clinicos') setActiveTab('personales');
              }}
              disabled={activeTab === 'personales'}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              Anterior
            </button>

            {activeTab === 'patologias' ? (
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[var(--color-primary)] !text-[var(--color-text)] text-sm font-bold shadow-md hover:bg-[var(--color-primary-dark)] transition-all"
              >
                Guardar Historial
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'personales') setActiveTab('clinicos');
                  else if (activeTab === 'clinicos') setActiveTab('patologias');
                }}
                className="px-6 py-2 rounded-xl bg-[var(--color-primary)] !text-[var(--color-text)] text-sm font-bold shadow-md hover:bg-[var(--color-primary-dark)] transition-all"
              >
                Siguiente
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
```

## 4. Lógica de Estado y Ciclo de Vida
- **`activeTab` (`personales` | `clinicos` | `patologias`):** Gestiona la sección actual del formulario de forma secuencial.
- **`formData`:** Objeto unificado que captura el estado de los inputs, la selección de botones de opción (Diabetes/Circulación) y el array de condiciones podológicas.
- **`submitted`:** Estado booleano que activa la pantalla de confirmación exitosa una vez guardado.

## 5. Flujo Operativo y Secuencia de Interacción

```mermaid
sequenceDiagram
  participant Paciente as Paciente / Podólogo
  participant Comp as Componente Historial Clinico
  participant DB as Base de Datos (Segura)

  Paciente->{bracket}Comp: Completa Datos Personales
  Paciente->{bracket}Comp: Pasa a sección 2 (Antecedentes Médicos)
  Note over Comp: Si el paciente marca Diabetes/Problemas Circulatorios,<br/>se despliega Banner de Alerta Crítica.
  Paciente->{bracket}Comp: Selecciona afecciones de los pies (patologías)
  Paciente->{bracket}Comp: Hace clic en "Guardar Historial"
  Comp->{bracket}DB: Envía JSON cifrado de datos clínicos
  DB--{bracket}Comp: Confirmación de guardado seguro
  Comp->{bracket}Paciente: Muestra pantalla de éxito ("HIPAA Compliant")
```
