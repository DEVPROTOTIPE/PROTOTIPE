# Manual de Desarrollo: Monitor de Alertas de Stock Crítico y Reabastecimiento

## 1. Propósito y Visión General
El módulo **AdminStockAlerts** implementa una consola ejecutiva exclusiva del administrador que actúa como un escudo reactivo frente a las pérdidas de ventas por falta de inventario (Stockouts). Su función es filtrar y consolidar en tiempo real todas las variantes de productos cuyos inventarios disponibles sean menores o iguales al **umbral de alerta mínimo** parametrizado individualmente por producto.

---

## 2. Arquitectura de Datos y Lógica de Negocio

El cálculo e identificación del stock crítico se computa mediante un filtrado dinámico en memoria de la colección de productos.

### Modelo de Datos del Producto en Firestore
El inventario opera bajo un esquema anidado de variantes para garantizar transacciones atómicas rápidas:

```json
{
  "id": "PROD-1029",
  "nombre": "Camiseta Deportiva Elite",
  "umbralAlerta": 5,
  "imageUrl": "https://...",
  "variantes": [
    { "id": "var-azul-s", "color": "Azul", "talla": "S", "stock": 2 },
    { "id": "var-azul-m", "color": "Azul", "talla": "M", "stock": 12 },
    { "id": "var-rojo-s", "color": "Rojo", "talla": "S", "stock": 1 }
  ]
}
```

### Algoritmo de Identificación de Alertas (Fórmula Técnica)
El widget recorre y aplana la estructura de variantes del catálogo de la siguiente manera:

$$\text{Variante Crítica} \iff \text{Variante.stock} \le \text{Producto.umbralAlerta}$$

En nuestro JSON de ejemplo, la consola generará de forma automática **2 Alertas de Stock**:
1. Variante `Azul / S` (Stock 2 $\le$ Umbral 5).
2. Variante `Rojo / S` (Stock 1 $\le$ Umbral 5).
*(La variante Azul / M se omite ya que tiene 12 unidades disponibles).*

---

## 3. Guía de Integración Paso a Paso

### Paso 1: Mapear y Pasar las Alertas al Componente
En la página de administración, se consume la base de datos y se aplanan los registros para inyectarlos al componente declarativo:

```javascript
const alerts = products.flatMap(p => 
  (p.variantes || []).filter(v => v.stock <= p.umbralAlerta).map(v => ({
    productId: p.id,
    productName: p.nombre,
    variantId: v.id,
    variantName: `${v.color || ''} / ${v.talla || ''}`.replace(/^\s*\/|\/\s*$/g, '') || 'Estándar',
    stock: v.stock,
    umbral: p.umbralAlerta,
    imageUrl: p.imageUrl,
    variantes: p.variantes // Se inyecta para la transacción posterior
  }))
);
```

### Paso 2: Abastecer Inventario mediante Transacciones Atómicas
Cuando el administrador inyecta stock adicional, el callback asíncrono mapea y actualiza la matriz en Firestore:

```javascript
const handleUpdateStock = async (alertItem, qtyToAdd) => {
  const updatedVariantes = alertItem.variantes.map(v => {
    if (v.id === alertItem.variantId) {
      return { ...v, stock: v.stock + qtyToAdd };
    }
    return v;
  });

  // Ejecuta la actualización atómica
  await firestore.doc(`products/${alertItem.productId}`).update({
    variantes: updatedVariantes
  });
};
```

---

## 4. Preguntas Frecuentes y Solución de Problemas (Troubleshooting)

#### ❓ ¿Cómo configuro el umbral de alerta de un producto?
El umbral de alerta es un parámetro configurable individualmente para cada producto en la sección de creación/edición de inventario. Si no se define, se toma por defecto un umbral de `5 unidades`.

#### ❓ ¿Qué pasa si múltiples administradores cargan stock al mismo tiempo?
Para mitigar colisiones o sobreescrituras accidentales en la base de datos (race conditions), la capa de mutación utiliza transacciones de Firestore, garantizando que el stock se sume de manera secuencial y segura.
