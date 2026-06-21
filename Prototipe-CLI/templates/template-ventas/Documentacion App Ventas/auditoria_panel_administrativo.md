# Auditoría de Reorganización y Jerarquización del Panel Administrativo

**Documento Técnico de Arquitectura y Auditoría**  
**Fecha:** 2026-06-01  
**Responsable:** Arquitecto de Producto Senior  

---

## 1. Introducción y Estado Actual

La plataforma ha experimentado un crecimiento acelerado con la adición de múltiples características. Actualmente, el componente principal de configuración ([AdminSettings.jsx](file:///d:/Aplicaciones/App%20Ventas/src/pages/admin/AdminSettings.jsx)) y las vistas administrativas asociadas carecen de una separación clara de responsabilidades entre el Propietario de Negocio (cliente final), el Operario/Empleado y el Desarrollador (administrador Ecosistema). 

Esta auditoría inspecciona exhaustivamente cada módulo actual, identifica problemas organizacionales y propone una arquitectura estructurada en 5 niveles para garantizar escalabilidad, seguridad y una experiencia premium.

---

## 2. Inventario Completo y Auditoría de Elementos Administrativos

A continuación se detallan todos los elementos identificados en el panel administrativo:

| Elemento / Configuración | Ubicación Actual | Propósito / Funcionalidad | Usuario Responsable | Nivel de Acceso Correcto | Justificación Técnica |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Identidad de Marca** | `AdminSettings.jsx` (Marca) | Configurar nombre de la app, del vendedor e ícono. | Propietario de Negocio | **Nivel 1: Mi Negocio** | Datos informativos sencillos de marca blanca que el cliente final debe poder cambiar en cualquier momento sin riesgo técnico. |
| **Apariencia y Temas HSL** | `AdminSettings.jsx` (Apariencia) | Cambiar el tema de color HSL, modo oscuro y activar eventos de temporada. | Propietario de Negocio | **Nivel 1: Mi Negocio** | Control estético directo del negocio que no compromete la base de datos ni los flujos operativos. |
| **Contacto y WhatsApp** | `AdminSettings.jsx` (Ventas) | Configurar número de celular del administrador para redirecciones del checkout. | Propietario de Negocio | **Nivel 1: Mi Negocio** | Clave para la recepción directa de pedidos. Uso sencillo. |
| **Datos Bancarios** | `AdminSettings.jsx` (Ventas) | Configurar cuentas bancarias (Banco, cuenta, titular, QR) para transferencias. | Propietario de Negocio | **Nivel 1: Mi Negocio** | Configuración básica de recepción de cobros por parte de la tienda. |
| **Toggles de Módulos Operativos** | `AdminSettings.jsx` (Personalizar) | Toggles rápidos para habilitar/deshabilitar Créditos, Cupones, Reclamos y Mayoreo en la UI local. | Propietario de Negocio (Básico) / Desarrollador (Global) | **Nivel 1: Mi Negocio** (Toggles simples) / **Nivel 3: Panel Maestro** (Activación Ecosistema) | Algunos toggles operativos básicos deben ser de libre uso, pero la activación contractual de características premium pertenece al Panel Maestro. |
| **Métodos de Entrega** | `AdminSettings.jsx` (Personalizar) | Configurar costos y tiempos de envíos, retiro físico y dirección de entrega. | Propietario de Negocio | **Nivel 1: Mi Negocio** | Regulación directa de la operación básica diaria de despacho. |
| **Configuración de Empleados (Ficha)** | `AdminSettings.jsx` (Personalizar) | Listar personal, configurar salarios, frecuencia de pago y PIN de acceso. | Propietario de Negocio / Administrador | **Nivel 1: Mi Negocio** / **Nivel 2: Herramientas** | La configuración de la ficha del empleado va en Nivel 1. El control de nómina y turnos va en Nivel 2. |
| **Instrucciones PWA** | `AdminSettings.jsx` (PWA) | Explicar cómo instalar la aplicación nativa/PWA en el dispositivo local. | Todos los usuarios | **Nivel 1: Mi Negocio** | Funcionalidad informativa simple y segura. |
| **Gestión de Cupones** | `AdminSettings.jsx` (Cupones) | Crear, listar, editar y deshabilitar cupones de descuento. | Propietario de Negocio / Vendedor | **Nivel 2: Herramientas Administrativas** | No es una configuración de la app, es una herramienta comercial operativa y recurrente de mercadeo. |
| **Gestión de Publicidad** | `AdminSettings.jsx` (Publicidad) | Subir y calendarizar banners promocionales en el inicio de la tienda. | Propietario de Negocio / Vendedor | **Nivel 2: Herramientas Administrativas** | Herramienta comercial y dinámica de marketing de uso diario/semanal. |
| **Gestión de Clientes** | `AdminSettings.jsx` (Clientes) | Base de datos de clientes, historial de compras, obsequios y WhatsApp rápido. | Propietario de Negocio / Vendedor | **Nivel 2: Herramientas Administrativas** | Herramienta de fidelización de la operación diaria. No pertenece a "Configuraciones". |
| **Filtros y Atributos de Catálogo** | `AdminSettings.jsx` (Developer) | Crear campos de variantes personalizados (Ej: Talla, Color, Marca) y toggles de filtros. | Desarrollador | **Nivel 3: Panel Maestro** | Define la estructura relacional de los productos. Un error aquí deforma el catálogo y rompe validaciones. |
| **Facturación Comisional** | `AdminSettings.jsx` (Developer) | Visualizar ventas acumuladas, comisiones calculadas para el Ecosistema y firma de conformidad. | Desarrollador / Propietario (Lectura) | **Nivel 3: Panel Maestro** | Relación contractual y de monetización entre el desarrollador y el cliente. Debe protegerse de manipulaciones. |
| **Restablecer Aplicación** | `AdminSettings.jsx` (Developer) | Borrado físico absoluto de la base de datos Firestore y carga de semillas de fábrica. | Desarrollador | **Nivel 3: Panel Maestro** / **Nivel 5: Sistema** | Acción altamente destructiva que altera de forma irreversible la base de datos de producción. |
| **Gestión de Pedidos** | `AdminOrders.jsx` | Control de estados de envío, asignación de costos de domicilio y navegación GPS. | Propietario / Vendedor / Despachador | **Nivel 2: Herramientas Administrativas** | Núcleo de la operación diaria de ventas. |
| **Gestión de Inventario** | `AdminInventory.jsx` | CRUD de productos, control de stock por variante y CategoryManager. | Propietario / Administrador | **Nivel 2: Herramientas Administrativas** | Operación logística clave de la tienda. |
| **Gestión de Créditos** | `AdminCredits.jsx` | Control de saldos, deudores y registro transaccional de abonos. | Propietario / Administrador | **Nivel 2: Herramientas Administrativas** | Módulo de gestión financiera de deudas operativas. |
| **Análisis de Ventas y Balance** | `AdminSales.jsx` / `AdminSalesDetail.jsx` | Dashboard de caja diaria, egresos fijos, nómina e ingresos netos. | Propietario de Negocio | **Nivel 2: Herramientas Administrativas** | Reportes de rentabilidad de la tienda. |
| **Gastos y Pagos Fijos** | `AdminSalesDetail.jsx` (Gastos) | Crear y conciliar balance real del negocio contra gastos fijos. | Propietario de Negocio | **Nivel 2: Herramientas Administrativas** | Módulo financiero básico. |
| **Alertas de Stock** | `AdminStockAlerts.jsx` | Visualizar productos con existencias por debajo del límite mínimo. | Propietario / Administrador | **Nivel 2: Herramientas Administrativas** | Monitoreo logístico diario. |
| **Panel de Domicilio** | `panel_domicilio.md` (Biblioteca) | Módulo específico para que el domiciliario gestione sus asignaciones. | Domiciliario | **Nivel 4: Laboratorio** (Como módulo industrial) | Módulo vertical optimizado para una industria/operación específica. |

---

## 3. Detección de Problemas Organizativos y Usabilidad

1. **Configuraciones Mal Ubicadas y Redundantes:**
   * **Gestión de Cupones y Publicidad:** Están ubicados en `AdminSettings.jsx`. Esto obliga al usuario a entrar al menú de configuración profunda de la tienda para hacer acciones operativas comunes como subir una foto promocional o crear un código de descuento.
   * **Gestión de Clientes y Empleados:** Se encuentran incrustados en la interfaz de configuraciones en vez de ser secciones de gestión directa (como Inventario o Pedidos).
   * **Gastos y Nómina:** Mezclados en la vista de detalle de ventas, lo que dificulta la carga aislada de egresos sin tener que ver el reporte contable global.

2. **Funciones Demasiado Técnicas para Clientes:**
   * **Restauración de Aplicación:** Aunque tiene doble validación, un botón destructivo de reseteo total de base de datos no debe estar al alcance del cliente final en ningún menú compartido, ni siquiera bajo un texto simple.
   * **Atributos Personalizados:** La creación de campos de base de datos (`customAttributes`) es muy técnica y debería estar resguardada para configurarse al momento del levantamiento/despliegue por el desarrollador.

3. **Funciones que Deben Ocultarse / Protegerse:**
   * **Facturación Comisional:** El panel de cobro del desarrollador debe estar blindado por la contraseña maestra (`DEV_PASSWORD`), asegurando que solo el desarrollador y el dueño del negocio en sesión autorizada firmen el recibo.

---

## 4. Nueva Arquitectura Propuesta (5 Niveles)

```mermaid
graph TD
    subgraph Nivel 1: Mi Negocio (Cliente Final)
        N1_1[Identidad del Negocio]
        N1_2[Información de Contacto]
        N1_3[Horarios de Atención]
        N1_4[Experiencia del Cliente]
        N1_5[Ventas y Marketing - Configs]
        N1_6[Operación Básica - Configs]
    end

    subgraph Nivel 2: Herramientas Administrativas (Operación Diaria)
        N2_1[Gestión de Pedidos]
        N2_2[Gestión de Productos/Inventario]
        N2_3[Gestión de Clientes]
        N2_4[Gestión de Empleados y Nómina]
        N2_5[Gestión de Cupones y Publicidad]
        N2_6[Gestión de Créditos y Fiados]
        N2_7[Gastos y Conciliación Contable]
    end

    subgraph Nivel 3: Panel Maestro (Desarrollador - Acceso Protegido)
        N3_1[Activación de Módulos]
        N3_2[Facturación Comisional & Telemetría]
        N3_3[Configuración Estructural Filtros]
        N3_4[WhatsApp del Desarrollador]
        N3_5[Logs & Diagnóstico de Sistema]
    end

    subgraph Nivel 4: Laboratorio (Innovación y Pruebas Beta)
        N4_1[Funciones Beta]
        N4_2[Motores predictivos & Asistentes IA]
        N4_3[Módulos Verticales: Barbería / etc.]
    end

    subgraph Nivel 5: Sistema (Infraestructura Interna Oculta)
        N5_1[Variables de Entorno]
        N5_2[Reglas de Seguridad Firestore]
        N5_3[Restablecimiento de Fábrica]
        N5_4[Tokens y APIs de Proveedores]
    end
```

---

## 5. Plan de Reubicación e Implementación

### Fase 1: Separación e Identificación Lógica (Esta Fase)
* Crear la estructura conceptual de la documentación y los criterios de diseño.
* Planificar las refactorizaciones de las rutas en `AppRoutes.jsx` y del menú lateral en `AdminLayout.jsx`.

### Fase 2: Refactorización y Modularización de Vistas
* **Crear `/src/pages/admin/MaestroPanel.jsx`:** Vista independiente protegida por contraseña maestra para centralizar la configuración de filtros, facturación comisional, telemetría y logs.
* **Crear `/src/pages/admin/LaboratorioPanel.jsx`:** Vista protegida que listará funciones experimentales (como paneles de diagnóstico e integración beta).
* **Limpiar `AdminSettings.jsx`:** Dejar exclusivamente configuraciones básicas e intuitivas para el cliente final (Identidad, Contacto, Métodos de pago, etc.).
* **Migrar Operaciones a Módulos Propios:**
  * Separar la lógica de Cupones y Publicidad a archivos de gestión operativa dedicados, accesibles desde la barra lateral bajo la jerarquía de "Herramientas".
  * Separar la gestión de Clientes y Empleados de los Ajustes y colocarlos en la barra lateral operativa.

---

## 6. Recomendaciones de Escalabilidad

1. **Uso Estricto de Feature Flags:** Cada módulo en el Laboratorio o Panel Maestro debe ser controlado por una variable de estado en el `appConfigStore` y Firestore, de forma que el enrutador y la barra lateral los rendericen de manera reactiva.
2. **Modularización Extrema:** Mantener las vistas administrativas puras y encapsuladas. Las lógicas de Firebase deben consumirse a través de Hooks (ej: `useCoupons`, `useAds`, `useBilling`).
3. **Control de Acceso mediante Roles y PINs:** Consolidar el acceso a los niveles 3 y 4 a través de tokens encriptados en `sessionStorage` para evitar saltos accidentales de empleados o clientes.
