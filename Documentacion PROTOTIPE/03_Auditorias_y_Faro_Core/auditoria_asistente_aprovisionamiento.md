# 🔍 Auditoría y Plan de Evolución: Asistente de Aprovisionamiento
## Ecosistema PROTOTIPE

Este reporte contiene un diagnóstico exhaustivo basado en la realidad física del código del **Asistente de Aprovisionamiento** (Onboarding Wizard en `Central PROTOTIPE/dev-dashboard/src/App.jsx` y Motor de Aprovisionamiento en `Prototipe-CLI/server.js` y `Prototipe-CLI/generator.js`). Se identifican bugs lógicos, cuellos de botella de E/S de red y oportunidades de mejora para garantizar un flujo de creación de instancias exacto, robusto y automatizado.

---

## 1. Inventario Técnico de Archivos Clave
- **Frontend Interfaz:** [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx#L4420-L5970) - Renderiza el formulario del asistente en 3 pestañas ("Servidor", "Branding", "Módulos") y controla el Mockup interactivo lateral derecho.
- **Backend Bridge API:** [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L326-L600) - Expone los endpoints de validación, carga de logos y arranque del worker de creación.
- **Worker de Creación:** [worker_create_project.js](file:///d:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) - Script secundario (fork) que corre en segundo plano para realizar el test de humo de Playwright y el scaffolding.
- **Motor Generador:** [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) - Lógica dura de copia física, inyección HSL en index.css, creación de manifest, SEO, `.env.local` y auto-registro en la Consola Central.

---

## 2. Diagnóstico de Pestañas (Bugs y Limitaciones Reales)

### A. Pestaña: Servidor (Server)
1. **Falsa Validación de Credenciales Firebase (Bug de Lógica y Seguridad):**
   - **Ubicación:** [server.js:L326-353](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L326-L353) en `/api/firebase/validate`.
   - **El Error:** El endpoint recibe `apiKey` y `projectId`, pero solo valida la `apiKey` intentando crear un usuario ficticio en Google Auth REST API (`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`). **El parámetro `projectId` es ignorado por completo.**
   - **Consecuencia:** Si el desarrollador escribe mal el `projectId` (ej: un typo como `ventas-smrtfix` en lugar de `ventas-smartfix`) pero provee una API Key válida de *cualquier* proyecto Firebase, el botón **"Comprobar Conexión"** retornará éxito (`valid: true`). Sin embargo, minutos después, al procesar la creación, la inicialización física del proyecto fallará catastróficamente al intentar desplegar reglas o reglas de Firestore.
2. **Cuello de Botella Crítico de Timeouts HTTP (Arquitectura Síncrona):**
   - **Ubicación:** [App.jsx:L5894-5929](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx#L5894-L5929) y [server.js:L545-563](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L545-L563).
   - **El Error:** La petición de creación se hace mediante un único `fetch` POST a `/api/create-project` que bloquea la conexión HTTP hasta que el worker termina. Este proceso incluye preflights, creación en la nube de Firebase, copia de archivos, `npm install` (operación pesada en disco de minutos), compilación de producción (`npm run build`), y despliegue a hosting.
   - **Consecuencia:** La cadena tarda entre **3 y 8 minutos** dependiendo de la red. Los navegadores y proxies locales cancelan peticiones HTTP tras 2 minutos de inactividad (Gateway Timeout). El frontend reportará error de red y se desbloqueará, incitando al usuario a hacer click en "Registrar" de nuevo, mientras en segundo plano el worker sigue escribiendo y corrupting carpetas concurrentemente.

### B. Pestaña: Branding
1. **Doble Renderizado del Smartphone Mockup (Glitch de UI/UX):**
   - **Ubicación:** [App.jsx:L4748-5430](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx#L4748-L5430) y [App.jsx:L5974-6370](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx#L5974-L6370).
   - **El Error:** La página de Onboarding está diseñada en dos columnas (cols 1-7: formulario, cols 8-12: Mockup interactivo). Sin embargo, dentro de la pestaña `branding` (columna izquierda), se declara un sub-grid de 12 columnas que introduce *otro* smartphone mockup en su columna derecha (cols 8-12 internas).
   - **Consecuencia:** Cuando el usuario entra a "Branding", la pantalla muestra **dos smartphones idénticos lado a lado** (uno pequeño interno a la izquierda, y otro grande interactivo a la derecha). Esto reduce el área de trabajo y deteriora el aspecto visual premium de la aplicación.
2. **Falta de Previsualización Real de Favicon y PWA Icons:**
   - La subida del logo base64 se optimiza con Jimp y se guarda en temporal, pero el simulador de teléfono solo muestra el logo SVG por defecto o las iniciales del nombre del cliente, sin dar una vista previa de cómo se verán los iconos de la app (192x192 / 512x512) tras la optimización.

### C. Pestaña: Módulos (Modules)
1. **Omisión de Entrada de Costo por Factura DIAN:**
   - **Ubicación:** [App.jsx:L5521-5532](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx#L5521-L5532).
   - **El Error:** Existe el flag `enableDianBilling` y se pasa al payload como `costoPorFacturaDian` (con un default de 150 COP en el state inicial). Sin embargo, en el formulario no hay ningún input numérico para cambiar este costo. El desarrollador no puede configurar el costo unitario DIAN del cliente durante el aprovisionamiento, y debe ir obligatoriamente al modal de ajustes del cliente posterior a la creación.
2. **Recomendaciones de Biblioteca Inactivas (No Funcionales):**
   - **Ubicación:** [generator.js:L1463-1467](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L1463-L1467).
   - **El Error:** Las recomendaciones que el usuario selecciona en la biblioteca (ej: `Formulario_Pago`, `OTP_Verification`) **no se copian ni se inyectan en el código del nuevo proyecto**. Solo se listan en formato de texto dentro del archivo `antigravity_bootstrap_prompt.md`. El desarrollador debe pedirle manualmente a la IA portar cada componente después.

---

## 3. Plan de Evolución y Propuestas de Mejora

### Propuesta 1: Servidor de Aprovisionamiento Asíncrono (SSE)
- **Implementación:** Cambiar la petición POST `/api/create-project` para que inicialice el proceso asíncronamente con un UUID de tarea y retorne de inmediato `{ success: true, taskId }`.
- **UX:** El frontend abre una conexión SSE a `/api/create-project/stream?taskId=...`. Se elimina el bloqueo HTTP y se muestra una barra de progreso real y una consola de logs de fondo en vivo de lo que el worker CLI está ejecutando (checks, git init, npm install, build, deploy).

### Propuesta 2: Validación Completa de Firebase (REST API Audit)
- **Implementación:** Corregir el endpoint `/api/firebase/validate` para que realice un fetch a:
  ```javascript
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/config?key=${apiKey}`;
  ```
  Esto valida tanto la validez de la API Key como la existencia y activación del proyecto en Firestore.

### Propuesta 3: Fusión y Saneamiento del Layout del Simulador
- **Implementación:** Remover el smartphone mockup interno del tab `branding`.
- **Layout:** Mantener el panel lateral izquierdo exclusivamente para los selectores de color, fuentes, e inputs HSL. Ubicar los paneles de **Estudio de Accesibilidad WCAG 2.1** de forma ordenada en el panel derecho, justo debajo del gran smartphone mockup unificado.

### Propuesta 4: Entrada Dinámica de Costo DIAN
- **Implementación:** Agregar un input de número atenuado que aparezca condicionalmente al marcar "Facturación Electrónica DIAN Directa":
  ```jsx
  {enableDianBilling && (
    <div className="space-y-1 mt-2 animate-fade-in">
      <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Costo por Factura DIAN ($ COP)</label>
      <input 
        type="number" 
        value={costoPorFacturaDian} 
        onChange={(e) => setCostoPorFacturaDian(Number(e.target.value) || 0)}
        className="..."
      />
    </div>
  )}
  ```

### Propuesta 5: Auto-Inyección de Biblioteca en Lote (Post-Onboarding)
- **Implementación:** Tras finalizar el scaffolding exitoso en el backend (o en el paso de post-creación en el frontend), el sistema debe ir iterando sobre el array `selectedRecomendations` y mandar peticiones automáticas al endpoint `/api/library/inject` (o `/api/library/inject/stream`) para copiar el código, resolver sus imports y ejecutar la instalación NPM de librerías en cascada para cada uno de los componentes de la biblioteca elegidos. El nuevo cliente estará 100% listo para programarse y compilar con sus componentes integrados.

### Propuesta 6: Visualización de Puerto Local y Cuotas Firebase
- **Implementación:** Mostrar en la pestaña "Servidor" el puerto local que el CLI le asignará dinámicamente al proyecto (ej: `http://localhost:5124`) y una advertencia sobre la cuota máxima del plan Spark de Firebase.

