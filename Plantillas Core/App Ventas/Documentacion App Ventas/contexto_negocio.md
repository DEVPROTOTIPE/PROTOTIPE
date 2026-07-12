# 📑 Contexto de Negocio y Reglas Operativas del Dominio — App Ventas

Este documento establece el modelo de negocio, reglas de dominio y flujos operativos para la plantilla Core **App Ventas**. Es obligatorio que cualquier agente de IA o desarrollador siga estas directivas para mantener la consistencia operativa.

---

## 1. PROPÓSITO DEL CORE
El Core de **App Ventas** es un sistema omnicanal modular diseñado para la administración integral de microempresas y comercios minoristas locales (retail, alimentación, servicios). Permite la gestión unificada de:
- **Punto de Venta (POS):** Registro de ventas rápidas mediante códigos de barra, productos rápidos e impuestos.
- **Control de Inventarios:** Control de existencias físicas en tiempo real, alertas de stock mínimo y registro de entradas y salidas de bodega.
- **Créditos y Fiados (Cuentas por Cobrar):** Sistema interno de balances financieros por cliente final para compras a crédito, control de límites de fiado y abonos.
- **Gestión de Caja (Turnos):** Control físico del dinero en caja mediante flujos de apertura, arqueo, ingresos/egresos de efectivo, y cierre de turnos.
- **Telemetría y Facturación de Soporte:** Reportes observacionales de actividad para la centralización comisional del desarrollador ($0 USD infra).

---

## 2. REGLAS OPERATIVAS Y LÓGICA DE DOMINIO

### 2.1 Flujo de Apertura y Cierre de Caja
- **Apertura Requerida:** La interfaz del POS y la facturación deben estar bloqueadas si no existe un turno de caja abierto para el día operativo en la colección `/cajas/`.
- **Diferencia de Arqueo:** Al cerrar caja, el sistema debe registrar el efectivo esperado (calculado mediante: `efectivo_apertura + ventas_efectivo + ingresos_caja - egresos_caja`) contra el efectivo físico declarado por el operario. Cualquier descuadre genera un incidente de alerta registrado en el balance de caja.

### 2.2 Control de Créditos y Fiados
- **Límite de Crédito:** Un cliente no puede recibir fiado si la venta actual hace que su saldo deudor acumulado supere el límite asignado en su ficha de `/customers/{id}/creditLimit`.
- **Abonos:** Todo abono a un crédito genera una transacción de ingreso con tipo `abono_credito` en la caja activa y actualiza síncronamente el campo `currentDebt` del cliente.

### 2.3 Inventario y Transacciones
- **Actualización Atómica:** El stock físico de productos (`stock`) se actualiza mediante transacciones físicas o transacciones atómicas de Firestore (`increment`) al confirmar la venta para evitar race conditions concurrentes.
- **Alertas de Stock:** Los listados de productos deben marcar visualmente en amarillo/rojo los ítems donde `stock <= minStock`.

---

## 3. KPIs Y MÉTRICAS CLAVE (Consola de Administración)
- **Ticket Medio:** `total_ventas / total_ordenes` en el período activo.
- **Venta Neta vs Bruta:** Diferenciación en el dashboard de los ingresos excluyendo impuestos (`totalImpuestos`) para la contabilidad del negocio.
- **Índice de Fiados:** Porcentaje de ventas del mes realizadas bajo modalidad de crédito.
