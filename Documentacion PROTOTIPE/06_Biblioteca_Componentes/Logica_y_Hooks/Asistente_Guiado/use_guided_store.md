<!--
{
  "technicalName": "useGuidedStore",
  "targetPath": "src/hooks/useGuidedStore.js",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Hook de Control del Asistente Guiado (useGuidedStore)

Store global de Zustand diseñado para orquestar la lógica del **Sistema de Compra Guiada Inteligente** en aplicaciones de comercio electrónico. Permite monitorear el progreso del usuario, almacenar de forma persistente qué tooltips/ayudas ya han sido visualizadas (evitando repetir guías redundantes) e identificar de forma autónoma el nivel de experiencia del comprador basado en su historial de pedidos.

---

## 1. Propósito y Casos de Uso
* **Curva de Aprendizaje Progresiva:** Reduce la fricción en primeros clientes presentando sugerencias visuales (hints) únicamente en pasos del checkout o catálogo que el usuario aún no conoce.
* **Aislamiento de Ayuda Redundante:** Utiliza persistencia local para que las ayudas completadas se recuerden en futuras visitas.
* **Auto-detección de Experiencia:** Si el cliente ya completó al menos 2 pedidos exitosos, el sistema lo califica como usuario experto y suprime de forma automática la asistencia visual básica, protegiendo la velocidad y limpieza de la UI.
* **Casos de Uso:**
  * Tours interactivos de bienvenida y tutoriales guiados en PWAs comerciales.
  * Disparadores contextuales de inactividad o asistencia en checkout.

---

## 2. Props y API del Estado (Zustand Store)
### Estado (`State`)
* `isAssistanceMode`: Boolean que indica si el modo asistencia visual global está activado por el cliente.
* `completedSteps`: Mapa estructurado de pasos aprendidos: `{ welcome: true, catalog: true, checkout: true }`.
* `orderCount`: Entero que almacena el total de pedidos completados por este usuario en el navegador.

### Acciones y Getters
* `toggleAssistance()`: Alterna el estado del Modo Asistencia global.
* `enableAssistance()` / `disableAssistance()`: Enciende o apaga la asistencia explícitamente.
* `markStepCompleted(stepId)`: Almacena en el mapa que el hito descriptivo con ID `stepId` ya fue visualizado.
* `incrementOrderCount()`: Incrementa el recuento de pedidos realizados.
* `isExperiencedUser()`: Getter reactivo. Retorna `true` si `orderCount` es mayor o igual a `2`.
* `shouldShowHint(stepId)`: Validador de lógica inteligente. Evalúa de forma concurrente si la asistencia está activa y el paso no ha sido marcado como completado. Aplica bypass automático si el usuario es experimentado (excepto para alertas críticas de checkout).

---

## 3. Código React Fuente Completo (`guidedStore.js`)
```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store del Sistema de Compra Guiada Inteligente.
 * Registra qué pasos ya aprendió el usuario para no repetir ayudas innecesariamente.
 * Controla el Modo Asistencia (activado/desactivado).
 */
const useGuidedStore = create(
  persist(
    (set, get) => ({
      // ─── Estado ───
      isAssistanceMode: false,   // Toggle del Modo Asistencia
      completedSteps: {},        // { 'catalog': true, 'cart': true, ... }
      orderCount: 0,             // Número de pedidos realizados por el usuario

      // ─── Acciones Básicas ───
      toggleAssistance: () => set((state) => ({
        isAssistanceMode: !state.isAssistanceMode,
      })),

      enableAssistance: () => set({ isAssistanceMode: true }),
      disableAssistance: () => set({ isAssistanceMode: false }),

      resetProgress: () => set({ completedSteps: {}, orderCount: 0 }),

      // ─── Acciones de Seguimiento ───
      /**
       * Marca un paso como aprendido para no repetir la ayuda.
       * @param {string} step - Nombre del paso (ej: 'welcome', 'catalog', 'cart', 'payment')
       */
      markStepCompleted: (step) => set((state) => ({
        completedSteps: { ...state.completedSteps, [step]: true },
      })),

      incrementOrderCount: () => set((state) => ({
        orderCount: state.orderCount + 1,
      })),

      // ─── Lógica Inteligente ───
      /**
       * Si el usuario ya realizó varios pedidos, se considera experto y 
       * se reducen automáticamente las ayudas de primer nivel.
       * @returns {boolean}
       */
      isExperiencedUser: () => get().orderCount >= 2,

      /**
       * Verifica de forma inteligente si un hint debe mostrarse.
       * Se muestra SI el Modo Asistencia está encendido Y el paso NO ha sido completado.
       * @param {string} stepId
       * @returns {boolean}
       */
      shouldShowHint: (stepId) => {
        const state = get();
        if (!state.isAssistanceMode) return false;
        
        // Excepción: Hay pasos que se completan siempre si es experimentado
        if (state.isExperiencedUser() && !['payment_inactivity', 'checkout_confirm'].includes(stepId)) {
          return false;
        }
        
        return !state.completedSteps[stepId];
      }
    }),
    { name: 'guided-storage' }
  )
);

export default useGuidedStore;
```

---

## 4. Ejemplo de Uso (Inyección de Hints Contextuales)
```jsx
import React from 'react';
import useGuidedStore from '../store/guidedStore';

export default function CheckoutButton({ handleCheckout }) {
  const shouldShow = useGuidedStore(state => state.shouldShowHint('cart_checkout'));
  const markDone = useGuidedStore(state => state.markStepCompleted);

  return (
    <div className="relative">
      <button onClick={handleCheckout} className="btn-primary">
        Finalizar Pedido
      </button>

      {shouldShow && (
        <div className="absolute -top-12 left-0 bg-indigo-600 text-white p-3 rounded-lg text-xs shadow-lg animate-bounce z-50">
          <p>¡Haz clic aquí para enviar tu pedido a WhatsApp! 📱</p>
          <button 
            onClick={() => markDone('cart_checkout')} 
            className="underline mt-1 font-bold block"
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Origen
* **Extraído de:** [guidedStore.js](file:///d:/Aplicaciones/App%20Ventas/src/store/guidedStore.js)
* **Fecha de extracción:** 2026-06-06
* **Versión:** 1.0 (Store global persistente para guías interactivas).
