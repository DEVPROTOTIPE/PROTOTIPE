# 🚀 Hoja de Ruta Maestra: Escalabilidad del Ecosistema PROTOTIPE

> **Estado del documento:** Vivo y actualizable. Este es el núcleo estratégico de la visión empresarial de Prototipe.
> **Dueño:** Sergio Agudelo — Chat Central de App Ventas (Antigravity)
> **Última revisión:** Junio 2026

> [!IMPORTANT]
> **REGLAS DE SINCRONIZACIÓN AUTOMÁTICA PARA LA IA (OBLIGATORIO)**
> Este documento es un documento vivo. La IA debe actualizarlo de forma **proactiva y autónoma** (sin que el usuario tenga que pedirlo) cada vez que detecte uno de estos hitos en la conversación:
> 1. 🟢 **Nuevo cliente activo en producción** → Marcar la tarea correspondiente en Fase 1 como `[x]` y actualizar el contador de clientes.
> 2. ⚙️ **Nueva Feature Flag o módulo construido** → Registrarlo en la tabla de capacidades del Core con su nombre y descripción.
> 3. 💡 **Nueva idea estratégica o nicho identificado** → Añadirlo al Backlog Estratégico con la fecha y el origen de la idea.
> 4. ❌ **Nicho o funcionalidad descartada** → Registrarla tachada con el motivo técnico o comercial.
> 5. 🔨 **Inicio de construcción de un vertical** → Cambiar su estado de `📋 Planificado` a `🔨 En construcción`.
> 6. ✅ **Fase de crecimiento alcanzada** → Marcar sus tareas como `[x]` y añadir la fecha de logro.

---

## 🎯 Visión del Negocio

Construir un ecosistema de **aplicaciones multi-instancia verticalizadas por nicho de mercado**, basadas en una arquitectura reutilizable y modular, donde cada nueva implementación se despliega en semanas en lugar de meses, garantizando márgenes operativos altos y deuda técnica mínima.

El modelo de negocio se basa en:
- **Licenciamiento mensual** por cliente (cobro por uso de plataforma).
- **Comisiones de éxito** por ventas procesadas a través del sistema.
- **Servicios de configuración y onboarding** como ingreso por proyecto.
- **Upselling modular:** El cliente comienza con el plan base y activa features avanzadas conforme crece.

---

## 🧱 El Core: La Plantilla Base Universal

La **App Ventas** es la plantilla de mayor madurez y será el motor de todos los verticales. Su arquitectura modular (Feature Flags en Firestore, Biblioteca de Componentes reutilizables, sistema HSL de marca blanca) permite que cada nuevo cliente arranque con una base funcional del **85% lista** desde el primer día.

### Capacidades Core Activables por Feature Flag

| Feature Flag | Módulo | Descripción |
|---|---|---|
| `creditsEnabled` | Fiado / Crédito | Venta a crédito con historial de deudas por cobrar |
| `couponsEnabled` | Cupones | Sistema de descuentos por código |
| `claimsEnabled` | Garantías y Reclamos | Flujo de posventa y devoluciones |
| `wholesaleEnabled` | Mayoreo | Precios diferenciados por cantidad |
| `deliveryEnabled` | Domicilios | Seguimiento de pedidos a domicilio |
| `commissionsEnabled` | Comisiones | Reportes de comisiones por vendedor |
| `enableDianBilling` | Facturación DIAN | Emisión de documentos electrónicos DIAN con cobro por volumen |
| `reservasEnabled` | Reservas y Citas | Agenda interactiva semanal y cuadrícula de horarios asignables para servicios |
| `posExpressScanner` | POS Exprés Scanner | Checkout rápido interpretando eventos de lectores de códigos de barra físicos |
| `ordenesTrabajo` | Órdenes de Trabajo | Ficha de recepción de maquinaria y diagnóstico con cálculo de repuestos y firma digital |

---

## 🗺️ Mapa de Nichos de Mercado

Cada nicho tiene una **App Base Especializada** derivada del core, con su propia configuración de Feature Flags, componentes específicos y diseño visual adaptado.

### Nichos Identificados y Estado

| # | Nicho | App Base | Estado | Prioridad |
|---|---|---|---|---|
| 1 | 🛍️ Tiendas de Ropa y Calzado | App Ventas (Core) | ✅ **Producción** | Alta |
| 3 | 💈 Barberías y Salones de Belleza | App Servicios | 📋 **Planificado** | Media |
| 4 | 🛒 Tiendas de Barrio y Abarrotes | App Tendero | 📋 **Planificado** | Alta |
| 5 | 🔧 Talleres y Servicios Técnicos | App Taller | 📋 **Planificado** | Media |
| 6 | 💊 Farmacias y Droguerías | App Farmacia | 💡 **Idea** | Baja |
| 7 | 🏋️ Gimnasios y Centros Deportivos | App Fitness | 💡 **Idea** | Baja |
| 8 | 🎓 Academias y Cursos Presenciales | App Academia | 💡 **Idea** | Baja |

---

## 📱 Apps Base Planificadas

---

### 3. App Servicios (Barberías / Salones) 💈

**Descripción:** Plataforma de gestión de citas, servicios y ventas de productos para negocios de servicios personales.

**Diferenciadores del Core:**
- Agenda de citas por barbero/estilista con control de disponibilidad.
- Perfil de cada profesional con su historial de servicios y comisiones.
- Venta de productos (gel, champú, tintes) integrada junto a los servicios.
- Recordatorio automático de citas vía WhatsApp.

**Feature Flags activadas por defecto:**
`commissionsEnabled`

**Feature Flags opcionales:**
`couponsEnabled` (membresías con descuento), `creditsEnabled`

---

### 4. App Tendero (Tiendas de Barrio) 🛒

**Descripción:** La solución más simple, rápida y accesible del ecosistema. Orientada a tiendas de barrio, panaderías y minimercados donde la velocidad de cobro y el control de fiados son críticos.

**Diferenciadores del Core:**
- Buscador de productos ultrarrápido con código de barras (cámara del celular).
- Fiado por cliente con historial de deuda y abonos.
- Cuadre de caja al cierre de día.
- Alertas de stock bajo en productos críticos (sal, aceite, etc.).

**Feature Flags activadas por defecto:**
`creditsEnabled`

**Feature Flags opcionales:**
`couponsEnabled`, `wholesaleEnabled`

---

### 5. App Taller (Talleres y Servicios Técnicos) 🔧

**Descripción:** Gestión de órdenes de trabajo para talleres de reparación, mecánicas automotrices y técnicos en electrónica.

**Diferenciadores del Core:**
- Orden de Trabajo (OT) con estado: Recibido → En diagnóstico → Reparando → Listo → Entregado.
- Registro de equipos o vehículos por cliente con historial de reparaciones.
- Presupuesto digital con firma de aprobación del cliente.
- Control de repuestos e insumos utilizados por OT.

**Feature Flags activadas por defecto:**
`claimsEnabled`, `commissionsEnabled`

---

## 🧭 Fases de Crecimiento del Negocio

### Fase 1 — Validación (Actual)
- **Objetivo:** Conseguir los primeros 3-5 clientes de pago con la App Core (tiendas de ropa/calzado).
- **Métricas de éxito:** Al menos 1 cliente con >$500K COP en ventas mensuales procesadas por la app.
- **Acciones clave:**
  - [ ] Cerrar y desplegar el e-commerce piloto para el negocio Moni (Ropa interior y accesorios) como cliente N°1.
  - [ ] Refinar el proceso de onboarding usando el briefing.
  - [ ] Documentar el primer caso de uso exitoso como material de ventas.

### Fase 2 — Primer Vertical Nuevo (3-6 meses)
- **Objetivo:** Lanzar la App Servicios (Barberías / Salones) como el segundo vertical, con al menos 2 clientes pagos.
- **Acciones clave:**
  - [ ] Adaptar el onboarding para el nicho de servicios y turnos.
  - [ ] Conseguir un salón/barbería piloto para validar el flujo en producción.

### Fase 3 — Escala Multitenant (6-18 meses)
- **Objetivo:** Superar los 10 clientes activos en al menos 3 verticales distintos.
- **Acciones clave:**
  - [x] **Automatizar el proceso de despliegue de nuevos clientes mediante CLI interactivo con preflight checks, conversión HSL y spinners.**
  - [x] **Implementar panel de control central (dev-dashboard) con reportes financieros consolidados y CRM.**
  - [ ] Escalar App Tendero y App Servicios.

### Fase 4 — Producto de Mercado (18+ meses)
- **Objetivo:** Convertir Prototipe en una marca reconocida en la región con >50 clientes activos.
- **Acciones clave:**
  - [ ] Crear landing page pública de Prototipe con demos en vivo por vertical.
  - [ ] Implementar sistema de auto-onboarding (el cliente llena su briefing en un formulario web y la app se configura automáticamente).
  - [ ] Evaluar contratación de primer comercial o aliado de ventas.

---

## 💡 Ideas de Funcionalidades Futuras (Backlog Estratégico)

> Estas son ideas que aún no tienen prioridad definida pero que agregan valor al ecosistema.

- **App Móvil Nativa (React Native):** Versión nativa en iOS y Android para vendedores en campo, con soporte offline robusto.
- **Portal del Cliente (B2C):** Que el cliente final pueda rastrear su pedido, ver su historial de compras y pagar deudas de fiado en línea.
- **Módulo de Analíticas Avanzadas (BI):** Tablero con tendencias de venta, productos estrella, horarios pico y proyecciones de inventario con IA.
- **Integración con WhatsApp Business API:** Notificaciones automáticas de pedidos, alertas de stock y confirmaciones de citas directamente al número oficial del negocio.
- **Pasarela de Pagos Integrada:** Integración con Wompi, Mercado Pago o Bold para procesar pagos con tarjeta directamente desde la app.

---

## 📌 Reglas de este Documento

1. **Este archivo se actualiza cuando:** Se define un nuevo nicho, se alcanza una fase, se descarta una idea o se agrega una funcionalidad al backlog.
2. **Quién puede modificarlo:** Solo el chat central de App Ventas (este chat). Los chats de cliente no tienen permiso de escritura aquí.
3. **Frecuencia de revisión:** Al menos una vez por mes o cuando el negocio tome una decisión estratégica relevante.
