# 💰 Sistema de Precios y Licenciamiento — PROTOTIPE

## Filosofía de precios

PROTOTIPE busca ofrecer soluciones accesibles para emprendedores, microempresas, pequeñas empresas y negocios en crecimiento.

Los precios se determinan según:

*   Complejidad.
*   Alcance.
*   Módulos requeridos.
*   Integraciones.
*   Usuarios.
*   Impacto operativo.

---

## Fase 1 — Implementación Inicial

Todo proyecto requiere un pago inicial.

Objetivos:

*   Análisis del negocio.
*   Diseño de la solución.
*   Configuración.
*   Personalización.
*   Desarrollo.
*   Capacitación inicial.

### Valor referencial

Desde $100.000 COP.

El valor final depende de la complejidad de cada proyecto.

---

## Fase 2 — Operación

### Modalidad A — Comisión por ventas

Aplicable a:

*   Tiendas.
*   Ferreterías.
*   Restaurantes.
*   Distribuidores.
*   Catálogos.

Rango estimado:

Entre 1% y 5% de las ventas gestionadas mediante la plataforma.

---

### Modalidad B — Comisión por servicio

Aplicable a:

*   Sistemas de citas.
*   Reservas.
*   Turnos.
*   Pedidos.
*   Operaciones de servicio.

Se define un valor por transacción o servicio ejecutado.

---

### Modalidad C — Suscripción mensual

Aplicable a:

*   Herramientas administrativas.
*   Gestión interna.
*   Inventarios.
*   Reportes.
*   CRM.

Se establece una mensualidad fija según el alcance.

---

## Evolución del sistema

### Incluido

*   Corrección de errores.
*   Soporte operativo.
*   Actualizaciones generales.
*   Mejoras compartidas del Core.

---

### No incluido

*   Nuevos módulos exclusivos.
*   Integraciones especiales.
*   Funcionalidades privadas.
*   Rediseños profundos.
*   Cambios arquitectónicos.

Estas solicitudes se cotizan por separado.

---

## Propiedad intelectual

PROTOTIPE conserva la propiedad de:

*   Código fuente.
*   Arquitectura.
*   Framework.
*   Cores.
*   Componentes.
*   Módulos reutilizables.

---

## Propiedad del cliente

El cliente conserva la propiedad de:

*   Base de datos.
*   Información operativa.
*   Marca.
*   Usuarios.
*   Configuración personalizada.

---

## Licencia de uso

El cliente recibe una licencia de uso mientras exista una relación contractual activa.

---

## Licencia perpetua

Opcionalmente el cliente puede adquirir una licencia perpetua para una instancia específica.

Esta modalidad:

*   No incluye soporte permanente.
*   No incluye evolución futura.
*   No incluye mejoras automáticas.

Los servicios posteriores se cotizan de forma independiente.

---

## Política de cancelación

El cliente podrá finalizar la relación contractual notificando con la anticipación definida en el contrato.

Al finalizar:

*   Podrá exportar sus datos.
*   Podrá solicitar copia de seguridad de su información.
*   Podrá disponer de un período temporal para migrar a otra solución.

La propiedad intelectual del software seguirá perteneciendo a PROTOTIPE.

---

## Suspensión por falta de pago

Proceso recomendado (automatizado mediante las banderas de telemetría de facturación `telemetryActive` y `billingSuspended` controladas desde el `RecaudoPanel` en el Dashboard Central):

1.  Notificación de vencimiento (recordatorio interactivo automático vía WhatsApp desde el RecaudoPanel).
2.  Recordatorio de pago (segundo aviso en pantalla de administración del cliente).
3.  Restricción parcial del servicio (bloqueo de accesos de administrador).
4.  Suspensión temporal (bloqueo total de la instancia cliente con cartelera informativa).
5.  Archivado de datos (exportación de base de datos a Storage Central).
6.  Eliminación definitiva según plazos establecidos contractualmente.
