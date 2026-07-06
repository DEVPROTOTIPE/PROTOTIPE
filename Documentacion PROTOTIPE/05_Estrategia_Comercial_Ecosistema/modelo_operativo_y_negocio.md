# 💼 Modelo Operativo y de Negocio — Ecosistema PROTOTIPE

Este documento detalla el funcionamiento conceptual, comercial y operativo de **PROTOTIPE** como empresa de software de marca blanca (multitenant SaaS), describiendo la interacción de sus flujos comerciales y de desarrollo.

---

## 1. Modelo de Negocio

PROTOTIPE opera bajo una estrategia híbrida de **Software de Marca Blanca (Multitenant Sharding)** orientada a la digitalización exprés de comercios tradicionales (talleres, tiendas de comanda, e-commerce, rifas). Su monetización se estructura en tres capas transaccionales:

1.  **Tarifa de Setup (Aprovisionamiento):** Pago único inicial por la configuración de la identidad visual de la marca (branding HSL), aprovisionamiento de Shards en Firebase y despliegue del PWA productivo.
2.  **Suscripción SaaS (Recurrente Mensual):** Cuota mensual fija por el licenciamiento de uso de la consola administrativa del cliente (Caja POS, gestión de inventario, alertas).
3.  **Micro-tasas Transaccionales (Comisiones de Desarrollo):** Cobro porcentual o valor fijo cobrado de manera automática por el uso del motor tecnológico en cada transacción completada (ventas completadas, boletas reservadas, o créditos desembolsados). Estas comisiones se consolidan mediante telemetría asíncrona en la base de datos central.

---

## 2. Flujos Operativos de la Empresa

### 2.1 Flujo Comercial (Onboarding de Clientes)
*   ** wizard de Briefing:** El equipo comercial recopila el nicho del cliente, el logotipo corporativo y los colores de la marca.
*   **Configuración Visual:** Los datos de color se traducen a coordenadas HSL contrastadas mediante el validador del backend Express.
*   **Aprovisionamiento Automatizado:** El CLI clona la plantilla core correspondiente, inyecta el branding, asocia las credenciales dedicadas de Firebase y publica el repositorio privado en GitHub en un proceso de un solo clic.

### 2.2 Flujo de Ventas (Operación del Cliente)
*   **Acceso Multicanal:** Los consumidores finales compran interactuando con la PWA del cliente, accediendo mediante códigos QR físicos colocados en mesas/productos o enlaces web directos.
*   **Formalización del Pedido:** La PWA permite compras asíncronas offline-first con redirección a pasarelas o enlaces directos de WhatsApp para confirmación.
*   **Deducción Comisional:** Cada pedido exitoso genera de forma transparente un registro de comisión de desarrollo a favor de PROTOTIPE en base a la modalidad comisional configurada.

### 2.3 Flujo de Desarrollo (Evolución de Plantillas)
*   **Mejoras en el Core:** El equipo de ingeniería desarrolla nuevas integraciones, optimizaciones de velocidad y componentes visuales exclusivamente en las **Plantillas Core** de desarrollo.
*   **Modularización en Biblioteca:** Los componentes estables y agnósticos desarrollados para requerimientos de negocio se extraen formalmente al catálogo de la biblioteca reutilizable para evitar duplicaciones de código.

### 2.4 Flujo de Soporte y Diagnóstico
*   **Telemetría de Excepciones:** Errores no controlados de React en la PWA del cliente disparan volcados de memoria JSON (stacktrace, variables locales) enviados de forma asíncrona al Developer Cockpit central de PROTOTIPE.
*   **Monitoreo del Servidor Local:** El bridge API Express registra accesos, consumos y logs SSE de tests de integración de forma persistente en logs de auditoría para revisiones preventivas.

### 2.5 Flujo de Mantenimiento y Resguardo
*   **Backups Automatizados:** El operador técnico lanza respaldos rutinarios utilizando el panel `GitBackupPanel.jsx` en el Dashboard Central o mediante el menú interactivo. Los scripts y la UI controlan los cambios en caliente, descartan modificaciones no deseadas y excluyen variables de entorno privadas de los commits públicos.
*   **Paridad de Versiones:** El motor de pruebas valida de manera automatizada las versiones de paquetes críticos (React, Firebase, Tailwind) en los templates contra una lista blanca estable para evitar drift de dependencias.

### 2.6 Flujo de Actualización Downstream (Clientes Activos)
*   **Parcheo en Lote:** Cuando el Core evoluciona, el operador ejecuta la cola de sincronización. El sistema compara firmas MD5 de archivos e inyecta los cambios en cascada en las instancias.
*   **Aseguramiento de Calidad:** Tras inyectar el código, se ejecuta un build de producción y smoke tests headless de Playwright. Si la compilación falla, el sincronizador ejecuta un rollback inmediato restaurando la versión anterior desde un backup temporal sin afectar al cliente en producción.

---

## 3. Roles y Responsabilidades

*   **Ingeniero de Software Principal (Arquitecto):** Diseña y mantiene el motor CLI, el backend de la API Bridge local, la estructura de Shards de Firebase y las pautas del estándar arquitectónico.
*   **Desarrollador Core (Desarrollo Frontend):** Implementa características operativas en la plantilla base (Core) y refactoriza componentes para inyectarlos en el catálogo de componentes reutilizables.
*   **Operador Técnico (Aprovisionador / Soporte):** Ejecuta el CLI para crear nuevos clientes, gestiona colas de sincronización downstream, realiza rollbacks de emergencia, monitorea fallas en la consola central de telemetría y ejecuta scripts de backups locales.
*   **Socio Comercial (Inquilino / Tenant):** Propietario de la marca blanca. Administra su inventario, POS, créditos de clientes y retiros de caja diaria en su dominio y base de datos propia.
*   **Cliente Final:** Consumidor de la marca blanca. Compra productos, realiza abonos a deudas y realiza el seguimiento del progreso de sus pedidos.
