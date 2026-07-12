# 📊 Modelo de Base de Datos - Firestore Core Ventas v2.0

El Core Ventas v2.0 utiliza Firestore como base de datos NoSQL documental y en tiempo real. Este documento detalla el esquema lógico de las colecciones principales y las relaciones entre ellas.

---

## 📂 Esquema de Colecciones Principales

### 1. Pedidos (`orders`)
Guarda la información de cada transacción/compra iniciada por un cliente o vendedor.

```typescript
interface Order {
  id: string;                  // Autogenerado por Firestore
  orderNumber: string;         // Prefijo "OR-" seguido de 8 dígitos aleatorios
  estado: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'completado' | 'cancelado' | 'credito_aprobado';
  stockDescontado: boolean;    // Flag para evitar doble descuento/restauración de stock
  total: number;               // Sumatoria de (precio * cantidad) + costoEnvio
  costoEnvio: number;          // Costo del delivery
  metodoEntrega: 'delivery' | 'pickup';
  metodoPago: 'efectivo' | 'transferencia' | 'credito';
  trackingToken: string;       // SHA-256 seguro para tracking público sin auth
  cliente: {
    nombre: string;
    celular: string;           // PII (normalizado a dígitos)
    direccion?: string;
  };
  items: Array<{
    productId: string;         // Prefijo "custom-" si es un ítem libre del POS
    variantId?: string;
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  vendedorId?: string;         // ID del vendedor (POS)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 2. Créditos (`credits`)
Almacena las cuentas por cobrar y deudas activas de los clientes.

```typescript
interface Credit {
  id: string;                  // ID con formato `credit_${orderId}`
  orderId: string;             // Relación 1:1 con la colección orders
  orderNumber: string;
  clienteNombre: string;
  clienteCelular: string;
  total: number;               // Monto original de la deuda
  montoTotal: number;          // Copia de total para compatibilidad
  saldoPendiente: number;      // Saldo que resta por pagar
  estado: 'activo' | 'pagado';
  abonos: Array<{
    monto: number;
    fecha: string;             // ISOString
    nota: string;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3. Histórico de Ventas (`sales`)
Consolida cada pedido completado con fines contables e históricos.

```typescript
interface Sale {
  id: string;                  // ID de la orden original para consistencia
  orderNumber: string;
  total: number;
  metodoPago: string;
  vendedorId: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  createdAt: Timestamp;
}
```

---

### 4. Seguimiento Público (`order_tracking`)
Colección de acceso público de bajo privilegio para el cliente final, sin exponer información personal sensible (PII).

```typescript
interface OrderTracking {
  id: string;                  // Token SHA-256 seguro (usado en URL)
  orderId: string;             // ID de la orden
  orderNumber: string;
  estado: string;
  itemsSummary: string;        // Resumen formateado para mostrar en la interfaz
  total: number;
  metodoEntrega: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 5. Índice de Búsqueda de Clientes (`user_order_index`)
Estructura optimizada para consultar pedidos del cliente utilizando hashes SHA-256 de celular en lugar de números planos, protegiendo la privacidad de los usuarios.

* **Estructura:** `/user_order_index/{hashedCelular}/orders/{trackingToken}`
* **Documento:** `{ orderId: string, trackingToken: string, createdAt: Timestamp }`
