# 💼 Contexto del Negocio de Aplicaciones Personalizadas a la Medida — PROTOTIPE

**Propósito:** Este documento define el ADN comercial, modelo operativo y contexto estratégico para cualquier desarrollador o Inteligencia Artificial que colabore en el ecosistema PROTOTIPE. Su asimilación es obligatoria para garantizar la alineación con la propuesta de valor del negocio.

---

## 1. Misión, Visión y Propuesta de Valor

### 1.1 Misión
Impulsar la productividad y rentabilidad de emprendedores, microempresas, trabajadores independientes y pymes en Latinoamérica que necesitan dar el salto digital pero no cuentan con el presupuesto o el soporte para acceder a desarrollos de software tradicionales. Democratizamos la tecnología mediante el suministro de **aplicaciones personalizadas a la medida de cada negocio**, facilitando el incremento de sus ventas, la administración ágil de sus inventarios, la gestión organizada de sus servicios y la creación de programas eficientes de lealtad y fidelidad con sus clientes.

### 1.2 Visión
Posicionar a PROTOTIPE como el motor de desarrollo rápido de aplicaciones a la medida líder en la región. Lograr que la creación de software personalizado no requiera meses de codificación desde cero, sino que se industrialice mediante una infraestructura core sumamente flexible, permitiendo inyectar valor técnico robusto y flujos operativos adaptados a cualquier modelo comercial tradicional (ej: talleres mecánicos, tornerías, servicios profesionales, comercios locales, etc.) en menos de 1 hora.

### 1.3 Pilares de Valor (Qué nos diferencia)
* **Empatía con el Comerciante:** Diseñamos herramientas para personas reales que necesitan ayuda inmediata para ordenar su operación y flujo de caja (ej: control de fiados y cobros).
* **Flexibilidad Absoluta (Agnóstico por Diseño):** El sistema no es un Ecosistema rígido con flujos fijos. Se adapta dinámicamente tanto a verticales comerciales estructuradas (marca blanca) como a lógicas libres y personalizadas a la medida de cada cliente.
* **Optimización Extrema:** Aplicaciones de alto rendimiento (PWA, soporte offline/cache) con coste de hosting de $0 USD iniciales por cliente para resguardar las finanzas de los comercios.

---

## 2. Modelo Operativo y de Arquitectura de Software

PROTOTIPE opera bajo una arquitectura híbrida multitenant que permite maximizar la reutilización de código y minimizar los tiempos de aprovisionamiento:

```
[Cliente Nuevo] ── (CLI Script) ──> [Copia Core Seed] ──> [Inyección de Marca HSL] ──> [Despliegue a Firebase Aislado]
                                                                        │
                                                                        └───> [Programación de Lógica a la Medida]
```

### 2.1 La Base Técnica Unificada (`template-core-seed`)
Cada aplicación cliente se aprovisiona desde una plantilla base optimizada que hereda de manera automática:
* Autenticación rápida sin contraseñas (Auth).
* Service Workers para PWA y soporte offline.
* Inyector dinámico de temas visuales basados en variables de color HSL de Tailwind v4 (cero estilos hardcodeados o bordes negros toscos).
* Enrutador y sistema de estado reactivo global (Zustand).
* **Módulo de telemetría de cobros y facturación** (para cobros automáticos basados en facturación plana, por uso o porcentaje de ventas).

### 2.2 Desarrollo y Adaptación a la Medida (Lienzo Limpio)
Cuando el negocio del cliente tiene lógicas no contempladas en las plantillas comunes (por ejemplo, el control de trabajos en metalmecánica de un tornero, el control de historial de pacientes en una clínica veterinaria, o reservas complejas de un taller):
* La IA o desarrollador no reescribe la infraestructura base de autenticación ni de despliegue.
* Diseña **las pantallas operativas específicas del negocio del cliente, los flujos del checkout y las colecciones de base de datos personalizadas en Firestore** para el cliente.
* Mantiene la consistencia del diseño premium utilizando la paleta HSL e inyectando las lógicas requeridas de forma aislada.

---

## 3. Problema que Resolvemos en el Mercado

Los pequeños negocios en Colombia y Latinoamérica carecen de herramientas digitales viables:
1. **Software Contable/ERP Rígido (Siigo, Alegra, Bsale):** Exigen conocimientos técnicos y contables estructurados y fuerzan al negocio a adaptarse al software en lugar de que el software se adapte al negocio.
2. **Costo Elevado de Desarrollo Web:** Las agencias cobran sumas inviables por software a medida y demoran meses en entregarlo.
3. **Falta de Acompañamiento Técnico:** Los emprendedores no saben configurar servidores, dominios o aplicaciones progresivas. PROTOTIPE automatiza esto en un clic.

---

## 4. Áreas Clave de Impacto Funcional

Toda aplicación construida dentro del ecosistema PROTOTIPE debe centrarse en cubrir o potenciar uno o más de los siguientes objetivos del cliente:

1. **Incrementar Ventas:** Catálogos interactivos, carros de compras, integración de notificaciones y pedidos rápidos por WhatsApp/QR.
2. **Gestionar Inventarios y Stock:** Control de alertas críticas de bajo inventario, transacciones concurrentes seguras de stock y seguimiento de materias primas.
3. **Gestionar Prestación de Servicios:** Control de turnos, agendas de citas, órdenes de trabajo, seguimiento de estados de producción o reparaciones (ej. tornerías, mecánicos).
4. **Fidelización y Lealtad:** Registro de cupos de crédito local (fiados/deudas de clientes), cupones de descuento interactivos e historial de compras.

---

## 5. Análisis FODA del Ecosistema

### Fortalezas
* **Aprovisionamiento automatizado:** Estructuración y configuración técnica inicial de un proyecto de Firebase, DNS y variables de entorno mediante el CLI.
* **Diseño Premium Agnóstico:** Sistema visual HSL dinámico que cambia de marca al instante sin recompilar.
* **Aislamiento físico y seguridad:** Cada cliente cuenta con su propia base de datos (proyecto de Firebase separado), lo que reduce el CAC del servidor a $0 USD iniciales y garantiza la soberanía de los datos.

### Oportunidades
* **Masificación informal:** Enormes sectores productivos tradicionales en Latinoamérica siguen utilizando cuadernos o planillas de Excel para gestionar inventarios y servicios.
* **Estrategias de Retención:** Ofrecer microinteracciones y recuperación de carritos por WhatsApp para aumentar la recompra.

### Debilidades
* **Dependencia de configuración externa de DNS:** La asignación de dominios personalizados de los clientes requiere interacción directa con los registradores de dominios.

### Amenazas
* **Modificación de cuotas de Firebase:** Cambios restrictivos en los límites gratuitos del plan Spark de Firebase.

---

## 6. Protocolo de Onboarding y Lectura Obligatoria para IAs

Antes de codificar, es mandatorio consultar los estándares correspondientes en `04_Estandares_y_Skills`:
* **Para diseño visual y UI:** Lee [Guía de Diseño Premium](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_disenio_premium.md).
* **Para Firebase y base de datos:** Lee [Firebase Listeners Clean](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Firebase_Listeners_Clean.md) y [Seguridad Firestore](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/seguridad_firestore_ecosistema.md).
* **Para el inventario de recursos:** Lee [Mapa Semántico de Documentación](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md).
* **Para componentes de UI listos:** Consulta [Biblioteca de Componentes](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/).
