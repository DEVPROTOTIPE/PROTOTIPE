# 🛠️ Manual de Integración: Creación de Módulos y Componentes (Dashboard y Biblioteca)

Este manual documenta la estructura, el comportamiento y las reglas físicas de integración del ecosistema **PROTOTIPE**. Su propósito es permitir a cualquier desarrollador construir módulos para la consola de administración (`dev-dashboard`) o componentes de interfaz portables para la biblioteca, asegurando que se acoplen de manera automática y transparente al sistema de visualización, sandboxing y validación.

---

## 1. Definición Real de Módulo y Componente

### A. ¿Qué es un Módulo en este Proyecto?
Un **módulo** (referido en el código como Vista, Panel o Panel de Control) es una sección funcional autónoma que compone una pestaña completa dentro del Dashboard Central (`dev-dashboard`).
- **Ubicación física:** `dev-dashboard/src/components/admin/`.
- **Estructura lógica:** Es un componente React exportado por defecto que encapsula la lógica operativa de una herramienta del cockpit (ej: auditorías, backups, facturación, pasarela de cobro, etc.).
- **Integración:** Se importa en `src/App.jsx` y se renderiza condicionalmente según el estado de la navegación global (`activeTab === 'id_modulo'`).

### B. ¿Qué es un Componente en este Proyecto?
Un **componente** es un elemento visual de menor granularidad, modular y portable, diseñado para ser reutilizado. Existen dos clases:
1. **Componentes Atómicos del Dashboard:** Guardados en `src/components/ui/` (ej: `CustomSelect.jsx`, `DarkModeToggle.jsx`, `Pagination.jsx`) o `src/components/common/` (alertas, layouts) para el uso exclusivo del cockpit.
2. **Componentes Reutilizables de la Biblioteca:** Fichas documentales ubicadas en `Documentacion PROTOTIPE/06_Biblioteca_Componentes/[Categoría]/[Nombre]/` que contienen el manifiesto JSON de autoinyección y el código fuente React puro para ser exportados a proyectos de clientes mediante el motor CLI.

### C. Diferencias Clave
| Característica | Módulo (View / Panel) | Componente (UI / Biblioteca) |
| :--- | :--- | :--- |
| **Propósito** | Herramienta administrativa del Dashboard Central. | Interfaz de usuario portable o control visual atómico. |
| **Instanciación** | Directa en `App.jsx` mediante tabs condicionales. | Inyectado o consumido dentro de vistas o apps clientes. |
| **Carga de Estado** | Conectado a Firestore centralizado y APIs locales del CLI. | Estado local o stores Zustand/Firebase genéricos parametrizables. |
| **Playground (Sandbox)** | No requiere simulación (se ejecuta en producción). | Requiere sandbox individual de prueba interactivo. |

---

## 2. Estructura Real de un Módulo Existente

Un módulo operativo en `dev-dashboard/src/components/admin/` sigue esta estructura física y de dependencias:

```
dev-dashboard/src/components/admin/
  ├── [NombreModulo]View.jsx  (o [NombreModulo]Panel.jsx)
  └── ...
```

### Archivos Internos y Nomenclatura
- **Naming:** PascalCase terminado en `View`, `Panel` o `Manager` (ej: `BriefingStudioView.jsx`, `FeatureFlagManager.jsx`, `RecaudoPanel.jsx`).
- **Imports Comunes:**
  - Lucide React (`lucide-react`) para consistencia iconográfica.
  - SDK de Firebase Firestore / Auth (`firebase/firestore`, `firebase/auth`).
  - Constantes globales del CLI Bridge (`import { CLI_URL } from '../../config'`).
  - Contextos compartidos (ej: `useAlertConfirm` para modales de confirmación, `useToast` para alertas efímeras).

---

## 3. Estructura Real de un Componente (Biblioteca y Playground)

Para que un componente visual externo sea reconocido por el ecosistema y se previsualice interactivamente, consta de tres elementos obligatorios:

```
[GIT_ROOT]/
  ├── Documentacion PROTOTIPE/06_Biblioteca_Componentes/[Categoría]/[Nombre_Español]/
  │     └── [nombre_en_serpiente].md  <-- Ficha técnica con código React
  └── Central PROTOTIPE/dev-dashboard/
        └── src/components/admin/sandboxes/
              └── [NombreComponente]Sandbox.jsx  <-- Playground interactivo
```

### A. Ficha Técnica Markdown (`.md`)
Cada componente cuenta con un documento markdown estructurado que define su comportamiento. Debe comenzar estrictamente con el comentario HTML del manifiesto JSON de dependencias:

```markdown
<!--
{
  "resource": "NombreTecnico",
  "technicalName": "NombreTecnico",
  "targetPath": "src/components/ui/NombreTecnico.jsx",
  "dependencies": {
    "npm": {
      "lucide-react": "^0.300.0",
      "framer-motion": "^11.0.0"
    },
    "internal": []
  }
}
-->

# Nombre del Componente

## 1. Propósito y Casos de Uso
...
## 2. Especificación Visual y Estilos (Tailwind CSS)
...
## 3. Código React Completo
```jsx
// Código 100% funcional y autónomo
```
```

### B. Playground del Sandbox (`*Sandbox.jsx`)
Es el panel interactivo que simula el componente en caliente en el dashboard central.
- **Ruta:** `dev-dashboard/src/components/admin/sandboxes/[NombreComponente]Sandbox.jsx`.
- **Estructura:** Debe importar `SandboxLayout` de `./SandboxLayout` y exportar un componente por defecto que exponga la interfaz y configure sus propiedades a través de controles (`select`, `toggle`, `text`, `number`).

---

## 4. Reglas Actuales para Crear Módulos Nuevos

Para crear e integrar una nueva pestaña o panel administrativo en el Dashboard Central:

1. **Creación del Archivo:** Añadir el archivo `.jsx` en `dev-dashboard/src/components/admin/[NombreModulo]View.jsx`.
2. **Definición de Props:** Debe recibir al menos `{ dbInstance, showToast }` si requiere conectarse al Firestore centralizado del cockpit y emitir alertas.
3. **Registro en App.jsx:**
   - Importar el nuevo archivo en las cabeceras de `src/App.jsx`.
   - Buscar el contenedor principal de pestañas (`activeTab`) en el JSX.
   - Insertar la renderización condicional:
     ```jsx
     {activeTab === 'mi_modulo' && (
       <MiModuloView dbInstance={getCentralFirestore()} showToast={showToast} />
     )}
     ```
4. **Navegación:** Agregar la opción en el sidebar o menú de navegación en `App.jsx` asignando la ID correspondiente a la pestaña (`mi_modulo`).
5. **Control de Calidad:**
   - Registrar la tarea en `02_Tareas_Roadmap/tareas_pendientes.md`.
   - Registrar el módulo en `03_Auditorias_y_Faro_Core/bitacora_cambios.md`.
   - Ejecutar compilación de prueba (`npm run build`).

---

## 5. Reglas Actuales para Crear e Integrar Componentes
*(Flujo de la skill `@crear-componente`)*

Si se recibe una carpeta o archivo con un nuevo componente visual, debe seguir estos pasos exactos para autoadaptarse a la biblioteca existente:

1. **Guardar Ficha Técnica:** Colocar la especificación en markdown con su manifiesto JSON en `Documentacion PROTOTIPE/06_Biblioteca_Componentes/[Categoría]/[Nombre_Español]/[nombre_en_serpiente].md`.
2. **Crear Playground Individual:** Agregar su sandbox interactivo en `dev-dashboard/src/components/admin/sandboxes/[NombreComponente]Sandbox.jsx` consumiendo `<SandboxLayout>`.
3. **Mapear en ComponentSandbox.jsx (Condicional):**
   - El sandbox se importa dinámicamente mediante `import.meta.glob('./sandboxes/*.jsx')`.
   - Si la clave en minúsculas inferida del nombre del componente difiere del nombre físico del archivo sandbox, debe agregarse su equivalencia en el mapeo `COMPONENT_SANDBOX_MAP` de `ComponentSandbox.jsx` (ej. `'mi boton': 'boton_premium'`).
4. **🔴 Registro Obligatorio en el Catálogo (Bloqueante):**
   - **Archivo:** `Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`.
   - **Acción:** Buscar la sección de la categoría del componente y añadirlo a la lista viñetada en formato markdown:
     ```markdown
     * [Nombre Visual (NombreTecnico)](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/[Categoria]/[Nombre_Español]/[nombre_en_serpiente].md): Breve descripción de una línea.
     ```
     > ⚠️ **CRÍTICO:** Si se omite este registro en el `README.md`, el CLI Server (`server.js`) no lo leerá del índice, por lo que el componente **no será visible en el árbol lateral del Dashboard**.
5. **GPS Semántico:** Registrar la entrada técnica en `Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`.
6. **Compilación de Paridad:** Correr `npm run build` en `dev-dashboard`. Esto ejecutará `verify_library_integrity.cjs` y detectará si hay archivos markdown huérfanos o playgrounds no declarados.

---

## 6. Interacción entre Módulos y Componentes

La comunicación y flujo de datos se gestiona bajo los siguientes mecanismos:

- **Props de Estilo HSL (Marca Blanca):** Los componentes no definen colores quemados. Reciben o consumen las variables de color del entorno Tailwind (`bg-[var(--color-bg)]`, `border-[var(--color-border)]`, `text-[var(--color-primary)]`).
- **Callback Handlers:** Los componentes notifican eventos a través de callbacks (ej. `onChange`, `onClick`).
- **Contextos y Hooks Globales:**
  - `useToast()` / `<GuidedToast>` para mensajería de estado efímera en la UI.
  - `useAlertConfirm()` para invocar modales confirmatorios con flujos basados en Promesas.
- **REST APIs y Server Sent Events (SSE):** Los componentes de administración consumen el puerto `3001` de Express mediante peticiones tradicionales o streams SSE (`/api/create-project/stream`, `/api/cli/logs/stream`) para reportar logs de operaciones en caliente a través de terminales de texto.

---

## 7. Ejemplo Real Completo

### A. Módulo del Dashboard Central (`src/components/admin/FeatureFlagManager.jsx`)
*(Ejemplo de módulo que maneja Firestore centralizado y consume APIs del CLI)*

```jsx
import React, { useState, useEffect } from 'react';
import { ToggleRight, ToggleLeft, AlertCircle } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { CLI_URL } from '../../config';

export default function FeatureFlagManager({ dbInstance, showToast }) {
  const [clientes, setClientes] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');

  // Escuchar clientes en tiempo real
  useEffect(() => {
    if (!dbInstance) return;
    const q = collection(dbInstance, 'clientes_control');
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setClientes(list);
    });
    return () => unsubscribe();
  }, [dbInstance]);

  const handleToggle = async (flagId, value) => {
    showToast(`Guardando Feature Flag: ${flagId}`, 'info');
  };

  return (
    <div className="p-6 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)]">
      <h3 className="text-xs font-black uppercase text-[var(--color-text)]">Feature Flag Manager</h3>
      <div className="mt-4 space-y-2">
        {clientes.map(client => (
          <button
            key={client.id}
            onClick={() => setSelectedClientId(client.id)}
            className="p-2 border rounded-xl text-xs"
          >
            {client.id}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### B. Componente Portable (`OtpInputField.jsx`)
*(Ejemplo de componente de interfaz reactivo)*

```jsx
import React, { useRef, useState, useEffect } from 'react';

export default function OTPInputField({
  length = 4,
  onComplete = () => {},
  disabled = false
}) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, length);
  }, [length]);

  const handleChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue) return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtp(newOtp);

    const combinedOtp = newOtp.join('');
    if (combinedOtp.length === length) {
      onComplete(combinedOtp);
    }

    if (cleanValue && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index] === '') {
        if (index > 0) {
          newOtp[index - 1] = '';
          setOtp(newOtp);
          inputsRef.current[index - 1]?.focus();
        }
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').substring(0, length);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < length; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
      if (pastedData.length === length) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="flex justify-center gap-3 w-full max-w-xs mx-auto">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[idx]}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-lg font-black bg-[var(--color-surface-2)] border rounded-2xl outline-none text-[var(--color-text)] transition-all select-all focus:scale-105 ${
            otp[idx] ? 'border-indigo-500/60 ring-2 ring-indigo-500/10' : 'border-[var(--color-border)]'
          } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}
```

### C. Sandbox Individual (`OtpInputFieldSandbox.jsx`)
*(Playground interactivo para simular el componente)*

```jsx
import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import OTPInputField from '../../../components/ui/OTPInputField';

export default function OtpInputFieldSandbox() {
  const [length, setLength] = useState('4');
  const [disabled, setDisabled] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  return (
    <SandboxLayout
      title="OTPInputField"
      description="Campo de entrada especializado de 4 o 6 dígitos numéricos. Maneja pegado directo y retroceso inteligente."
      controls={[
        { label: 'Dígitos', type: 'select', value: length, options: ['4', '6'], onChange: setLength },
        { label: 'Deshabilitado', type: 'toggle', value: disabled, onChange: setDisabled }
      ]}
    >
      <div className="space-y-5 w-full">
        <OTPInputField
          key={`${length}-${disabled}`}
          length={Number(length)}
          disabled={disabled}
          onComplete={(code) => setOtpCode(code)}
        />
        <div className="text-center">
          {otpCode ? (
            <p className="text-xs text-emerald-400 font-bold">Código Completado: {otpCode}</p>
          ) : (
            <p className="text-xs text-slate-500 font-medium">Ingresa el código OTP para verificar</p>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}
```
