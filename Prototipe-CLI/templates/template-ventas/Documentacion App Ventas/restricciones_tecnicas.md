# 📑 Restricciones Técnicas y Patrones Prohibidos — App Ventas

Este documento establece las limitaciones técnicas obligatorias, dependencias restringidas y patrones de código prohibidos dentro del Core **App Ventas**.

---

## 1. LIMITACIONES DE INFRAESTRUCTURA Y BASE DE DATOS (FIREBASE)
- **Prohibición de Cloud Functions en Producción (`DEC-006`):** Todo cálculo financiero y procesamiento de comisiones debe realizarse directo en el cliente o mediante el Dashboard Central. No se autoriza el despliegue de Cloud Functions en producción.
- **Acceso Desacoplado a Firestore:** Queda estrictamente prohibido invocar operaciones CRUD directas de Firebase (como `setDoc`, `addDoc`, `collection`) dentro de componentes de React. Toda persistencia física de datos debe encapsularse exclusivamente en la capa de Repositorios (`src/features/[feature]/api/`) y consumirse a través de Servicios.
- **Gobernanza de Listeners (`onSnapshot`):** No se permiten listeners múltiples abiertos simultáneamente sobre la misma colección. Se debe utilizar el sistema unificado de listeners reactivos o el hook de realtime estructurado con Auth verificado.

---

## 2. RESTRICCIONES VISUALES Y MAQUETACIÓN (CSS / UI)
- **Prohibición de selectores nativos (`<select>`):** Es obligatorio utilizar el componente personalizado `CustomSelect` para todas las listas desplegables del panel y los sandboxes.
- **Modo Claro (Light Mode) - Contraste en Botones cromáticos:** Al pintar textos sobre fondos que usen variables cromáticas (ej. `bg-[var(--color-primary)]`), se debe forzar siempre la clase `!text-white` para prevenir que las reglas del stylesheet global sobrescriban el texto a negro.
- **Prevención de Fuga de Caja (Desbordamiento Móvil):**
  - Toda tabla (`<table>`) debe estar envuelta obligatoriamente en un contenedor flex/block con `w-full overflow-x-auto`.
  - Queda estrictamente prohibido el uso de anchos rígidos en píxeles (como `w-[400px]`) en tarjetas, inputs o modales. Se debe emplear `w-full max-w-[ancho]` adaptativo.
  - No se permiten alturas fijas rígidas (como `h-10`) en botones o inputs que contengan texto susceptible de envolverse a múltiples líneas en móviles.

---

## 3. COMPORTAMIENTO DE CAMPOS NUMÉRICOS
  Esto evita las flechas nativas desalineadas del navegador.

---

## 4. REGLAS DE ARQUITECTURA BASADA EN FEATURES (FDD)
- **Flujo de Dependencias Unidireccional:**
  - `features/sales` (canal POS) puede depender de `features/inventory` (catálogo y stock) y `features/orders` (creación de órdenes/checkout).
  - `features/credits` (cartera) no puede depender de ninguna otra feature. Se comunica con `orders` exclusivamente mediante la estructura de colecciones de base de datos Firestore y constantes compartidas.
  - Queda estrictamente prohibido que cualquier feature dependa de `features/billing` (Dian/Telemetría).
- **Encapsulación por Barrel Exports:**
  - Todo import desde fuera de una feature debe realizarse obligatoriamente a través de su archivo barrel `index.js` en la raíz de la feature (ej: `import { ... } from '@/features/orders'`).
  - Queda estrictamente prohibido realizar imports profundos hacia subcarpetas internas de las features (ej: `import ... from '../../features/orders/services/orderService'`).
- **Contratos Públicos con JSDoc:**
  - Todos los métodos expuestos públicamente en los barrels `index.js` deben contar obligatoriamente con anotaciones de tipo JSDoc que describan sus parámetros, retornos y excepciones.

