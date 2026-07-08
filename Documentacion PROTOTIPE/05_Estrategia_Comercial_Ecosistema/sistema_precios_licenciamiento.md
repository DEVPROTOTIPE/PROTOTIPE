# 💰 Sistema de Precios y Licenciamiento — PROTOTIPE

## 1. FILOSOFÍA DE PRECIOS Y PRINCIPIO GENERAL

PROTOTIPE busca ofrecer soluciones accesibles para emprendedores, microempresas, pequeñas empresas y negocios en crecimiento. Los precios de las soluciones no son fijos, sino que reflejan el impacto en la operación del negocio, no solo las horas de desarrollo.

Se determinan según:
- Complejidad del negocio y cantidad de módulos.
- Nivel de personalización con respecto al Core base.
- Integraciones externas necesarias.
- Cantidad de usuarios concurrentes.
- Impacto operativo del sistema y rentabilidad generada.

---

## 2. ESTRUCTURA DE COBRO

Todo proyecto PROTOTIPE se compone de tres fases o capas financieras:

### 2.1 Fase 1 — Implementación Inicial (Setup)
Pago único obligatorio por diseño, análisis del negocio, configuración de infraestructura de base de datos, personalización de marca HSL, desarrollo de integraciones y capacitación inicial.
- **Precio base:** Desde $100.000 COP (el valor final se determina mediante el sistema de puntos de la calculadora de complejidad).

### 2.2 Fase 2 — Operación (Recurrente)
Modalidad de cobro continuo para asegurar el mantenimiento del servidor, hosting y soporte. Se define bajo uno de los siguientes tres esquemas:
- **Modalidad A (Comisión por ventas — Firestore: `billingMode: 'percentage'`):** Aplicable a tiendas, ferreterías, restaurantes o catálogos donde la facturación es medible de forma digital. Rango estimado: **1% al 5%** (registrado en el campo `comisionPorcentaje`).
- **Modalidad B (Comisión por servicio — Firestore: `billingMode: 'fixed_per_service'`):** Aplicable a sistemas transaccionales, agendamiento de citas, reservas o turnos. Se cobra un fee fijo transaccional (ej. $100 – $500 COP, registrado en el campo `montoFijoServicio`).
- **Modalidad C (Suscripción mensual — Firestore: `billingMode: 'flat_monthly'`):** Aplicable a herramientas puramente administrativas de gestión interna, control de inventario o CRM sin pasarela de ventas directa. Se establece una tarifa fija mensual (registrada en el campo `pagoMensualFijo`).

### 2.3 Evolución del Sistema (Opcional)
- **Incluido en soporte:** Corrección de errores (bugs), soporte operativo diario, actualizaciones de seguridad generales y mejoras globales compartidas en el Core base.
- **No incluido:** Desarrollo de nuevos módulos exclusivos para un cliente, integraciones especiales con APIs heredadas no estándar o rediseños de UI profundos. Estas solicitudes se cotizan de forma independiente.

---

## 3. MATRIZ DE PRECIOS POR TIPO DE SOLUCIÓN

### 🟢 NIVEL 1 — HERRAMIENTAS SIMPLES
- **Ejemplos:** Calculadoras de negocio internas, formularios avanzados, utilidades sencillas de captura de leads.
- **Implementación:** Desde $100.000 COP
- **Operación:** Tarifa mensual baja o exenta según volumen de datos. Sin comisiones.

### 🟡 NIVEL 2 — GESTIÓN DE NEGOCIO
- **Ejemplos:** Inventarios sencillos de sedes únicas, gestión de bases de clientes, agendas o reservas planas.
- **Implementación:** $300.000 – $1.000.000 COP
- **Operación:** Suscripción mensual media. Comisiones opcionales si hay pasarela.

### 🟠 NIVEL 3 — OPERACIÓN COMPLETA
- **Ejemplos:** Puntos de venta (POS) para restaurantes, ferreterías, talleres mecánicos o comercios minoristas locales.
- **Implementación:** $1.000.000 – $5.000.000 COP
- **Operación:** Mensualidad fija obligatoria + comisión del 1% al 5% si opera canales de venta directa (QR / WhatsApp).

### 🔴 NIVEL 4 — SISTEMAS AVANZADOS
- **Ejemplos:** Sistemas multisucursal en tiempo real, integraciones complejas de API (ERPs externos, facturación DIAN masiva) y alta concurrencia.
- **Implementación:** Desde $5.000.000+ COP (cotización personalizada mediante cotizador interactivo).
- **Operación:** Mensualidad de infraestructura dedicada + comisiones transaccionales adaptadas.

---

## 4. PROPIEDAD INTELECTUAL Y LICENCIAMIENTO

### 4.1 Propiedad de PROTOTIPE
PROTOTIPE conserva de forma exclusiva la propiedad de:
- El código fuente del monorepo, plantillas, frameworks y scripts.
- Todos los Cores de desarrollo y componentes visuales reutilizables de la biblioteca.

### 4.2 Propiedad del Cliente
El cliente es propietario exclusivo de:
- Su base de datos física de registros e información operativa (Firestore / backups).
- Su marca registrada, logotipos e identidad visual.
- Sus datos de usuarios y clientes finales.

### 4.3 Licencia de Uso
El cliente recibe una licencia de uso no exclusiva e intransferible mientras mantenga activa su relación contractual y al día sus obligaciones de pago.

### 4.4 Licencia Perpetua (Opcional)
Un cliente puede adquirir la licencia perpetua para independizar una instancia específica de la Consola Central:
- No incluye soporte permanente gratuito.
- No incluye evolución, parches ni actualizaciones automáticas downstream del Core de desarrollo.
- Cualquier servicio técnico posterior se cotizará por separado.

---

## 5. CANCELACIÓN Y SUSPENSIÓN POR FALTA DE PAGO

### 5.1 Política de Cancelación
El cliente puede finalizar la relación contractual notificando previamente de acuerdo a las cláusulas de su contrato. Al cancelarse el servicio, el cliente tiene derecho a exportar toda su base de datos operativa y dispondrá de un periodo temporal de gracia acordado para realizar la migración.

### 5.2 Protocolo de Suspensión por Mora
Flujo técnico estructurado y automatizado mediante las variables de telemetría de facturación (`telemetryActive` y `billingSuspended`) controladas desde el `RecaudoPanel` en el Dashboard Central:

1. **Notificación de vencimiento:** Envío de recordatorio interactivo automático vía WhatsApp desde el dashboard.
2. **Aviso en pantalla:** Advertencia sutil en la interfaz de administración del software del cliente.
3. **Restricción parcial:** Bloqueo de accesos de edición para roles de administrador (`billingSuspended = true` parcial).
4. **Suspensión total:** Bloqueo total de la visualización web de la instancia cliente con un banner de soporte técnico.
5. **Respaldo preventivo:** Exportación final y archivado de los datos a Firebase Storage Central.
6. **Eliminación definitiva:** Purgado seguro de la instancia según los plazos máximos contractuales.

---

## 🔌 ANEXO TÉCNICO: MAPEO DE MODELOS ECONÓMICOS A BASE DE DATOS

Para mantener la integridad con el onboarding wizard y la configuración de Firestore, los modelos económicos calculados arriba deben traducirse a la base de datos mediante las siguientes equivalencias de campos en `billingMode`:

1. **Comisión por Venta (Modalidad Variable / Porcentaje):**
   - Parámetro técnico: `billingMode: 'percentage'`
   - Campo a rellenar: `comisionPorcentaje` (ej. `1.5`)
2. **Comisión por Servicio (Tarifas por Transacción):**
   - Parámetro técnico: `billingMode: 'fixed_per_service'`
   - Campo a rellenar: `montoFijoServicio` (ej. `200` COP)
3. **Suscripción Mensual (Tarifa Plana):**
   - Parámetro técnico: `billingMode: 'flat_monthly'`
   - Campo a rellenar: `pagoMensualFijo` (ej. `30000` COP)
