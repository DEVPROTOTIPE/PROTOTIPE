<!--
{
  "technicalName": "useLocalStorageState",
  "targetPath": "src/hooks/useLocalStorageState.js",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# Hook de Estado Auto Persistente (useLocalStorageState)

## Propósito y Casos de Uso
El hook `useLocalStorageState` es una utilidad reactiva que funciona idénticamente a `useState` pero sincroniza y persiste automáticamente el estado en el almacenamiento local del navegador (`localStorage`). Es ideal para guardar configuraciones del sistema, credenciales de sesión temporal, datos de carritos de compra locales, preferencias del usuario (ej: sidebar colapsado, orden de filtros) y estados de formularios multipasos para resiliencia ante recargas.

## Características Clave
* **Sincronización Multitestaña:** Escucha el evento global `storage` del navegador para sincronizar los cambios de estado en tiempo real entre múltiples pestañas del mismo dominio.
* **Manejo de Errores Robust:** Envuelve las operaciones de lectura y escritura en bloques `try/catch` para evitar fallos si el almacenamiento local está lleno (quota exceeded) o deshabilitado por el navegador (modo incógnito estricto).
* **Compatibilidad de Inicialización:** Soporta paso de funciones perezosas (lazy initializers) como valor por defecto.

---

## Código React Completo y 100% Funcional

```javascript
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook para gestionar un estado sincronizado con localStorage.
 * 
 * @param {string} key - Clave de localStorage bajo la cual guardar el valor.
 * @param {*} defaultValue - Valor por defecto si no existe registro previo en disco.
 * @returns {[*, Function]} Retorna el valor actual y la función actualizadora.
 */
export function useLocalStorageState(key, defaultValue) {
  // Inicialización perezosa (Lazy initialization) para optimizar accesos a disco
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
      // Si no existe, verificar si defaultValue es una función inicializadora
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    } catch (error) {
      console.warn(`[useLocalStorageState] Error al leer la clave "${key}":`, error);
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
  });

  // Mantener la clave en una referencia para evitar subscripciones redundantes
  const keyRef = useRef(key);
  keyRef.current = key;

  // Envoltura de setState para escribir en localStorage
  const setPersistedState = useCallback((value) => {
    try {
      setState((prevState) => {
        // Resolver valor en caso de paso de función funcional actualizadora: setState(prev => prev + 1)
        const newValue = typeof value === 'function' ? value(prevState) : value;
        window.localStorage.setItem(keyRef.current, JSON.stringify(newValue));
        return newValue;
      });
    } catch (error) {
      console.warn(`[useLocalStorageState] Error al guardar la clave "${keyRef.current}":`, error);
    }
  }, []);

  // Escuchar eventos globales de storage para sincronizar pestañas concurrentes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === keyRef.current && e.newValue !== null) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`[useLocalStorageState] Error al sincronizar storage:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return [state, setPersistedState];
}
```

---

## Lógica de Estado y Ciclo de Vida
1. **Montaje:** Se lee el valor de `localStorage` de forma síncrona en el hilo inicializador de React.
2. **Actualización:** Al invocarse la función actualizadora, se computa el valor, se escribe en disco mediante `setItem` y se actualiza el estado local del componente para disparar el renderizado.
3. **Sincronización:** Si otra pestaña del mismo origen realiza una actualización bajo la misma clave, se dispara la función de escucha, actualizando el estado de forma reactiva e instantánea.
