# 🔌 Estándar de Repositorios y Capa de Adaptación (Base de Datos Agnóstica)

Define las pautas de desacoplamiento arquitectónico para la persistencia física en el ecosistema, asegurando que la UI React sea 100% independiente del motor de datos.

---

## 1. Arquitectura de 3 Capas
Los Cores se estructuran en capas estrictas:
1.  **Capa de Vista (UI):** Componentes React puros. Prohibido invocar consultas o APIs directamente.
2.  **Capa de Estado (Hooks & Stores):** Zustand o TanStack Query para gestionar el flujo de datos.
3.  **Capa de Infraestructura (Services / Repositories):** Contiene las llamadas físicas de base de datos.

---

## 2. Contrato de la Capa Repository
El dominio debe hablar en base a promesas de Javascript y objetos de datos planos (Plain Old JavaScript Objects). 

*Ejemplo de Interfaz Estándar:*

```javascript
export class ProductRepository {
  /**
   * Obtener producto por ID
   * @param {string} productId 
   * @returns {Promise<Product>}
   */
  async getById(productId) {
    throw new Error("Method not implemented");
  }

  /**
   * Guardar o actualizar producto
   * @param {Product} product 
   * @returns {Promise<void>}
   */
  async save(product) {
    throw new Error("Method not implemented");
  }
}
```;

---

## 3. Aislamiento contra strictMode
Los repositorios que utilicen realtime listeners (`onSnapshot` de Firebase) deben controlar la apertura de listeners recurrentes mediante una caché de consultas, permitiendo desmontajes idempotentes al desmontar vistas concurrentes.
