# MATRIZ DE PRECIOS OFICIAL PROTOTIPE

## 1. PRINCIPIO GENERAL

Los precios de PROTOTIPE no son fijos.

Se determinan según:

- Complejidad del negocio
- Cantidad de módulos
- Nivel de personalización
- Integraciones externas
- Cantidad de usuarios
- Impacto operativo del sistema

---

## 2. ESTRUCTURA DE COBRO

Todo proyecto PROTOTIPE se compone de 3 capas:

### 2.1 Implementación inicial (OBLIGATORIA)

Pago único por diseño y construcción del sistema.

Desde $100.000 COP dependiendo del tipo de solución.

---

### 2.2 Operación (RECURRENTE)

Puede incluir:

- Mensualidad
- Comisión por ventas
- Cobro por transacción
- Mantenimiento operativo

---

### 2.3 Evolución (OPCIONAL)

- Nuevos módulos
- Integraciones especiales
- Funcionalidades personalizadas
- Cambios estructurales

Se cobra por separado.

---

## 3. MATRIZ POR TIPO DE SOLUCIÓN

---

### 🟢 NIVEL 1 — HERRAMIENTAS SIMPLES

#### Ejemplos:
- Calculadoras de negocio
- Herramientas internas simples
- Formularios personalizados
- Automatizaciones básicas

#### Precio:
- Implementación: desde $100.000 COP
- Mensualidad: opcional o baja
- Comisión: no aplica

---

### 🟡 NIVEL 2 — GESTIÓN DE NEGOCIO

#### Ejemplos:
- Inventarios básicos
- Gestión de clientes
- Pedidos simples
- Citas o reservas
- Control operativo básico

#### Precio:
- Implementación: $300.000 – $1.000.000 COP
- Mensualidad: media según soporte
- Comisión: opcional

---

### 🟠 NIVEL 3 — OPERACIÓN COMPLETA

#### Ejemplos:
- Restaurantes
- Ferreterías
- Talleres mecánicos
- Tiendas de volumen medio
- Distribuidores pequeños

#### Precio:
- Implementación: $1.000.000 – $5.000.000 COP
- Mensualidad: obligatoria
- Comisión: 1% – 5% si aplica ventas

---

### 🔴 NIVEL 4 — SISTEMAS AVANZADOS

#### Ejemplos:
- Multisucursal
- Alto volumen de transacciones
- Integraciones externas
- Automatización avanzada
- Sistemas complejos de operación

#### Precio:
- Implementación: $5.000.000+ COP (cotización personalizada)
- Mensualidad: alta según infraestructura
- Comisión: según modelo de negocio

---

## 4. MODELOS DE INGRESO

### 4.1 Comisión por ventas

Aplicable a negocios de venta directa.

- Rango: 1% – 5%

---

### 4.2 Cobro por servicio

Aplicable a sistemas transaccionales.

Ejemplo:
- $100 – $500 COP por operación según negocio

---

### 4.3 Suscripción mensual

Aplicable a sistemas administrativos.

- Desde planes básicos hasta avanzados

---

## 5. REGLA DE PERSONALIZACIÓN

Si una solución:

- Solo la usa un cliente → desarrollo personalizado
- Puede reutilizarse → se convierte en Core
- Escala a varios negocios → entra al ecosistema PROTOTIPE

---

## 6. REGLA DE CRECIMIENTO

El valor de PROTOTIPE no se mide por proyectos únicos.

Se mide por:

- reutilización de Cores
- escalabilidad de módulos
- crecimiento del ecosistema
- retención de clientes

---

## 7. PRINCIPIO FINAL

PROTOTIPE no vende software.

PROTOTIPE vende sistemas operativos para negocios reales.

Cada precio refleja impacto, no solo desarrollo.


---

## 🔌 ANEXO TÉCNICO: MAPEO DE MODELOS ECONÓMICOS A BASE DE DATOS

Para mantener la integridad con el onboarding wizard y la configuración de Firestore, los modelos económicos calculados arriba deben traducirse a la base de datos mediante las siguientes equivalencias de campos en `billingMode`:

1. **Comisión por Venta (Modalidad Variable / Porcentaje):**
   * Parámetro técnico: `billingMode: 'percentage'`
   * Campo a rellenar: `comisionPorcentaje` (ej. `1.5`)
2. **Comisión por Servicio (Tarifas por Transacción):**
   * Parámetro técnico: `billingMode: 'fixed_per_service'`
   * Campo a rellenar: `montoFijoServicio` (ej. `200` COP)
3. **Suscripción Mensual (Tarifa Plana):**
   * Parámetro técnico: `billingMode: 'flat_monthly'`
   * Campo a rellenar: `pagoMensualFijo` (ej. `30000` COP)
