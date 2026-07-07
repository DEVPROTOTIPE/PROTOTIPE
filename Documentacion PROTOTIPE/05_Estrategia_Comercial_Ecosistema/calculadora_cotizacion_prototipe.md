# CALCULADORA DE COTIZACIÓN PROTOTIPE

**Versión:** 1.0  
**Estado:** Activo  
**Área:** Comercial  
**Última actualización:** 2026-06-24

---

## OBJETIVO

Establecer una metodología estándar para calcular:
* Complejidad del proyecto.
* Valor de implementación (Setup).
* Modelo económico recomendado.
* Riesgo del proyecto.
* Rentabilidad esperada.

*Esta calculadora sirve como guía interna de PROTOTIPE y **está integrada de forma interactiva en la pestaña del [CotizadorView.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CotizadorView.jsx) del Dashboard central, permitiendo cotizar en 5 pasos y descargar la propuesta comercial formal en PDF.***

---

## FILOSOFÍA DE COTIZACIÓN

**PROTOTIPE no vende horas.**  
PROTOTIPE vende:
* Soluciones.
* Automatización.
* Ahorro de tiempo.
* Control operativo.
* Crecimiento empresarial.

Por lo tanto:
1. El precio no depende únicamente de cuánto se desarrolla.
2. También depende del valor real que genera al cliente.

---

## PASO 1 — COMPLEJIDAD FUNCIONAL

Asignar la puntuación correspondiente según las características requeridas por el cliente:

### 1. Gestión de Usuarios
* [ ] Sin usuarios (0 puntos)
* [ ] Usuarios básicos (1 punto)
* [ ] Roles y permisos estándar (2 puntos)
* [ ] Roles avanzados / Multi-sucursal (3 puntos)

### 2. Inventario
* [ ] No aplica (0 puntos)
* [ ] Inventario básico (2 puntos)
* [ ] Inventario avanzado / Variantes / Alertas (4 puntos)

### 3. Ventas
* [ ] No aplica (0 puntos)
* [ ] Registro simple / POS básico (2 puntos)
* [ ] Flujo completo / Facturación DIAN / Devoluciones (4 puntos)

### 4. Reportes
* [ ] Sin reportes (0 puntos)
* [ ] Reportes básicos / Listas planas (2 puntos)
* [ ] Dashboard avanzado / Gráficos / Exportación PDF (5 puntos)

### 5. Automatizaciones
* [ ] Ninguna (0 puntos)
* [ ] Algunas (Notificaciones por WhatsApp básicas) (3 puntos)
* [ ] Muchas (Webhooks, colas, triggers en bases de datos) (6 puntos)

### 6. Integraciones
* [ ] Ninguna (0 puntos)
* [ ] Una integración simple (2 puntos)
* [ ] Varias integraciones complejas (APIs de pago, ERPs externos) (5 puntos)

### 7. Aplicación Cliente Final
* [ ] No (0 puntos)
* [ ] Sí (Portal de compra QR, PWA de cara al cliente) (5 puntos)

**TOTAL COMPLEJIDAD FUNCIONAL:** `______ / 32` puntos.

---

## PASO 2 — COMPLEJIDAD TÉCNICA

Evaluar las condiciones arquitectónicas y requerimientos técnicos del software:

### 1. Base de Datos
* [ ] Simple (Esquema plano, pocas relaciones) (1 punto)
* [ ] Media (Esquemas estructurados, colecciones anidadas) (3 puntos)
* [ ] Compleja (Transacciones concurrentes de alta demanda) (5 puntos)

### 2. Reglas de Negocio
* [ ] Simples (Operaciones CRUD normales) (1 punto)
* [ ] Medias (Cálculos de inventario de variante plana) (3 puntos)
* [ ] Complejas (Lógica comisional multi-sucursal, cálculos DIAN) (5 puntos)

### 3. Tiempo Real
* [ ] No (0 puntos)
* [ ] Sí (Sincronización en vivo KDS o alertas de stock críticas) (3 puntos)

### 4. Multiplataforma
* [ ] No (0 puntos)
* [ ] Sí (Soporte mobile nativo y responsive de alta interactividad) (4 puntos)

### 5. Offline
* [ ] No (0 puntos)
* [ ] Sí (Caja POS resiliente sin conexión y sincronización delta posterior) (5 puntos)

**TOTAL COMPLEJIDAD TÉCNICA:** `______ / 22` puntos.

---

## PASO 3 — PERSONALIZACIÓN

Evaluar la desviación con respecto al Core Base de PROTOTIPE:

### 1. Diseño
* [ ] Base (Adaptación HSL básica de marca blanca) (1 punto)
* [ ] Personalizado (Modificaciones de layouts y fuentes) (3 puntos)
* [ ] Muy personalizado (UI/UX diseñada desde cero) (5 puntos)

### 2. Flujo Operativo
* [ ] Similar al Core (Flujo POS / Restaurante / Taller estándar) (1 punto)
* [ ] Algunas modificaciones (Reordenación de pasos intermedios) (3 puntos)
* [ ] Muy diferente (Flujo operativo a la medida de procesos atípicos) (6 puntos)

### 3. Funcionalidades Exclusivas
* [ ] Ninguna (0 puntos)
* [ ] Algunas (Componentes portables nuevos menores) (3 puntos)
* [ ] Muchas (Módulos completos inexistentes en biblioteca) (6 puntos)

**TOTAL PERSONALIZACIÓN:** `______ / 17` puntos.

---

## PASO 4 — RIESGO

Evaluar el nivel de incertidumbre y la logística de cara al cliente:

### 1. Cliente
* [ ] Muy organizado (Sabe exactamente qué quiere y tiene datos listos) (0 puntos)
* [ ] Normal (Requiere cierta guía pero colabora rápido) (2 puntos)
* [ ] Poco claro (Indeciso, mala comunicación, datos desorganizados) (5 puntos)

### 2. Requerimientos
* [ ] Claros (Alcance delimitado y firmado desde el inicio) (0 puntos)
* [ ] Parcialmente claros (Pendiente de definir detalles secundarios) (3 puntos)
* [ ] Cambiantes (Altas probabilidades de solicitar cambios a mitad de desarrollo) (6 puntos)

### 3. Dependencias Externas
* [ ] Ninguna (0 puntos)
* [ ] Algunas (APIs de terceros con documentación regular) (3 puntos)
* [ ] Muchas (Hardware del cliente, integraciones heredadas sin documentar) (6 puntos)

**TOTAL RIESGO:** `______ / 17` puntos.

---

## PASO 5 — VALOR EMPRESARIAL (VALOR GENERADO)

Medir el impacto de la solución sobre la economía del cliente:

### 1. ¿Cuánto tiempo ahorra?
* [ ] Bajo (Soporte menor) (1 punto)
* [ ] Medio (Elimina tareas del administrador) (3 puntos)
* [ ] Alto (Libera horas de personal crítico en el core operativo) (5 puntos)

### 2. ¿Cuánto dinero puede ahorrar?
* [ ] Bajo (Poca reducción de desperdicio) (1 punto)
* [ ] Medio (Mitiga fugas de caja e inventario ordinario) (3 puntos)
* [ ] Alto (Control de pérdidas crítico y auditorías automatizadas) (5 puntos)

### 3. ¿Cuánto puede aumentar las ventas?
* [ ] Bajo (Herramienta puramente administrativa) (1 punto)
* [ ] Medio (Facilita el pedido rápido del cliente) (3 puntos)
* [ ] Alto (Abre canales de venta QR express y WhatsApp masivo) (5 puntos)

### 4. ¿Qué tan crítico es para el negocio?
* [ ] Poco (Si falla, el negocio puede seguir operando a mano) (1 punto)
* [ ] Importante (Afecta la velocidad de atención al cliente) (3 puntos)
* [ ] Crítico (Si el sistema cae, la operación física se detiene al 100%) (5 puntos)

**TOTAL VALOR:** `______ / 20` puntos.

---

## PUNTAJE GLOBAL

Sumar los subtotales de cada paso:

| Paso | Subtotal |
| :--- | :--- |
| Paso 1: Complejidad Funcional | `______ puntos` |
| Paso 2: Complejidad Técnica | `______ puntos` |
| Paso 3: Personalización | `______ puntos` |
| Paso 4: Riesgo | `______ puntos` |
| Paso 5: Valor Empresarial | `______ puntos` |
| **PUNTAJE GLOBAL TOTAL** | **`______ puntos`** (Máx: 108) |

---

## CLASIFICACIÓN DEL PROYECTO

Ubicar el puntaje global en el rango correspondiente:

### 🔴 0 – 20 puntos: Micro Proyecto
* **Ejemplos:** Automatizaciones básicas de WhatsApp, integraciones simples en sistemas existentes, utilidades internas sin base de datos compleja.
* **Modelo Sugerido:** Cobro de Setup único bajo y mensualidad de soporte estándar.

### 🟡 21 – 40 puntos: Proyecto Pequeño
* **Ejemplos:** Control de inventario básico con caja POS individual para comercios estándar.
* **Modelo Sugerido:** Setup moderado de marca blanca y mensualidad fija.

### 🟢 41 – 60 puntos: Proyecto Medio
* **Ejemplos:** Software de restaurante, tienda de repuestos, talleres o ferreterías con workflows específicos del rubro.
* **Modelo Sugerido:** Setup proporcional y esquema recurrente híbrido (mensualidad + pequeña comisión de transacciones).

### 🔵 61 – 80 puntos: Proyecto Grande
* **Ejemplos:** Distribuidoras mayoristas, logística de despacho complejo, multisedes en tiempo real.
* **Modelo Sugerido:** Setup robusto por fases de implantación y mensualidad con fee de infraestructura.

### ⭐ 81+ puntos: Proyecto Estratégico
* **Ejemplos:** Operaciones multitenant con alto impacto en la economía local, personalizaciones masivas con desarrollos core patentables para la biblioteca.
* **Modelo Sugerido:** Contrato de alianza estratégica (revenue share alto o cobro por comisiones transaccionales de venta).

---

## MODELO DE COBRO RECOMENDADO

### 1. Comisión por Ventas (1% - 5%)
* **Cuándo usar:** La aplicación es un canal de ventas directo (pedidos QR, tienda digital) y la facturación es medible de forma digital transparente.

### 2. Comisión por Servicio (Fee Fijo por Transacción)
* **Cuándo usar:** La aplicación opera en base a agendamiento de citas, reservas pagadas o despachos completados (ejemplo: $100 COP por ticket emitido).

### 3. Mensualidad Fija
* **Cuándo usar:** El sistema es de uso interno del personal administrativo y operativo, sin pasarela de pagos directa de cara al público.

### 4. Modelo Híbrido
* **Cuándo usar:** El cliente tiene picos de venta digital (se cobra comisión) pero requiere soporte prioritario continuo e infraestructura dedicada 24/7 (mensualidad fija base + comisión).

---

## FACTOR DE AJUSTE PROTOTIPE

* **Aplicar incremento (Markup):** Si el proyecto requiere funcionalidades completamente nuevas que demanden investigación de I+D compleja, si hay riesgos evidentes en los datos del cliente, o integraciones atípicas.
* **Aplicar descuento (Markdown):** Si el proyecto permite reutilizar componentes de la biblioteca de PROTOTIPE en un 80%+, si el cliente es estratégico para validar un nicho de negocio, o tiene alta proyección de escalabilidad.

---

## RESULTADO FINAL DE LA COTIZACIÓN

### A. Implementación Inicial (Setup)
* **Valor Recomendado:** `$ ______________`
* **Justificación:** 

### B. Modelo Recurrente
* **Tipo:** (Mensualidad / Comisión por ventas / Comisión por servicios / Híbrido)
* **Valor Estimado:** `$ ______________` o `______ %`
* **Justificación:** 

---

## REGLA DE ORO PROTOTIPE

> [!IMPORTANT]
> **Nunca cotizar únicamente por dificultad técnica.**  
> Siempre ponderar en conjunto:
> 1. El valor generado y el ahorro de tiempo real del cliente.
> 2. El nivel de dependencia del negocio respecto a nuestra infraestructura.
> 3. La reutilización futura de los componentes desarrollados para robustecer el ecosistema general de PROTOTIPE.


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
