# 📝 Guía Rápida de Estándares, Reglas de Interfaz y Calidad (Resumen AGENTS.md)

Este documento resume las directrices obligatorias de calidad, desarrollo frontend, diseño responsivo, prevención de conflictos CSS, persistencia local y gobernanza del código del ecosistema **PROTOTIPE**.

---

## 🏛️ 1. Reglas Generales de Comportamiento
*   **Prohibición de Reversión Física:** Queda estrictamente prohibido revertir cambios, descartar código o ejecutar comandos destructivos de git (`git restore`, `git checkout --`, `git reset`, `git clean`) sin confirmación explícita por escrito del usuario.
*   **Zero Placeholders:** Queda prohibido inyectar bloques o tags de prueba ("TODO", marcadores vacíos, etc.). Toda lógica debe ser 100% funcional.

---

## 🎨 2. Estándares Visuales y Prevención de Conflictos CSS (Modo Claro/Oscuro)
*   **Fondo Blanco Forzado en divs con Bordes:** El stylesheet global aplica `!important` de fondo blanco a elementos con clase de borde y `rounded-2xl`/`rounded-3xl`. 
    *   *Solución:* Para muestrarios de color con estilos inline dinámicos, nunca combines estas clases de borde y esquinas en el mismo elemento, o fuerza el color usando `!important`.
*   **Contraste de Texto sobre Botones de Marca:** Los textos blancos sobre botones que consumen variables cromáticas (`bg-[var(--color-primary)]`) deben usar la clase `!text-white` para evitar que las reglas globales los oscurezcan en Modo Claro.
*   **Z-Index en Steppers:** La línea de progreso absoluta debe renderizarse por debajo de los círculos/hitos de estado. Aplica siempre `relative z-10 bg-[var(--color-surface)]` en los círculos y `z-[-1]` en la línea física.

---

## 📱 3. Estándar de Diseño Responsivo y Prevención de Desbordamientos
*   **Layout Apilado por Defecto:** Los formularios y paneles deben estructurarse usando `flex flex-col` por defecto (mobile-first) y cambiar a horizontal (`sm:flex-row`) solo en pantallas grandes.
*   **Contenedor en Tablas:** Toda tabla (`<table>`) debe estar envuelta en un contenedor con `w-full overflow-x-auto scrollbar-thin` para permitir scroll horizontal en móviles.
*   **Evitar Anchos Rígidos:** Prohibido usar anchos fijos en píxeles (ej. `w-[400px]`) en contenedores responsivos. Usa combinaciones adaptativas como `w-full max-w-md`.
*   **Clamping de Altura Variacional:** Prohibido usar alturas fijas estáticas (`h-10`/`h-11`) en botones o alertas con texto dinámico susceptible de saltar a dos líneas en móviles. Usa paddings verticales explícitos y altura mínima: `py-2.5 px-4 min-h-[44px] h-auto`.
*   **Estilo Deshabilitado Correcto:** Prohibido usar la escala Slate fija (`bg-slate-200 text-slate-400`) para estados deshabilitados (disabled) para evitar inversiones cromáticas erróneas en Modo Claro. Usa variables semánticas:
    `bg-[var(--color-surface-3)] text-[var(--color-text-muted)]/50 border border-[var(--color-border)] cursor-not-allowed`

---

## 🔌 4. Gobernanza del Dashboard y Controles Comunes
*   **Selectores de Opciones:** Queda prohibido usar el elemento nativo `<select>` de HTML. Debe emplearse obligatoriamente `CustomSelect.jsx`, manejando el valor directo en el handler de retorno.
*   **Confirmación de Acciones Destructivas:** Las eliminaciones o purgas del sistema deben pasar obligatoriamente por el modal promesificado del hook `useAlertConfirm()` con `variant: 'error'`.
*   **Rutas Canónicas (targetPath):** Los componentes deben registrar su ruta final en el manifiesto JSON de biblioteca según su tipo:
    *   `atom`: `src/components/ui/[Nombre].jsx`
    *   `component`: `src/components/common/[Nombre].jsx`
    *   `feature`: `src/features/[featureName]/components/[Nombre].jsx`
    *   `repository`: `src/features/[featureName]/api/[Nombre]Repository.js`

---

## 🗄️ 5. Resiliencia de Datos y Firebase Offline
*   **Listeners onSnapshot Únicos:** Prohibido instanciar múltiples listeners concurrentes. Utilizar el `RealtimeQueryRegistry` basado en hash y contador de referencias.
*   **Persistencia Local con Dexie:** Queda estrictamente prohibido usar `localStorage` para colas de cambios locales, telemetría u operaciones sin conexión. Para transacciones atómicas se debe usar exclusivamente IndexedDB con Dexie.js.
