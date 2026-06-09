# Propuesta de Centralización de Facturación y Comisiones (Multitenancy Ecosistema)

Para evitar la necesidad de ingresar individualmente a las bases de datos o paneles de administración de cada cliente a fin de mes, proponemos una arquitectura de **Notificación Distribuida (Push-based Consolidation)**. Esta solución permite a cada aplicación reportar sus métricas de manera autónoma a un único panel de control centralizado propiedad del desarrollador.

---

## 🏛️ Diseño de Arquitectura

```mermaid
graph TD
    subgraph Proyectos de Clientes (Independientes)
        A[App Cliente A - Firestore] -->|Trigger: Cierre/Venta/Pago| E[Servicio de Billing del Cliente A]
        B[App Cliente B - Firestore] -->|Trigger: Cierre/Venta/Pago| F[Servicio de Billing del Cliente B]
        C[App Cliente C - Firestore] -->|Trigger: Cierre/Venta/Pago| G[Servicio de Billing del Cliente C]
    end

    subgraph Infraestructura Central del Desarrollador
        E -->|HTTPS POST + API Key| H[API Gateway / Cloud Function Central]
        F -->|HTTPS POST + API Key| H
        G -->|HTTPS POST + API Key| H
        
        H -->|Escribe consolidado| I[(Firestore Central - DB Dev)]
        I -->|Consume datos| J[Panel Privado del Desarrollador]
    end
```

---

## 🛠️ Componentes Clave de la Solución

### 1. Endpoint Receptor Central (Cloud Function en Proyecto Central de Firebase)
Se crea un único microservicio centralizado (Cloud Function HTTP) bajo tu control directo. Este endpoint es el encargado de:
* Recibir las solicitudes HTTP `POST` de las aplicaciones de los clientes.
* Validar que la petición contenga un `API_KEY` o Token único y válido que asocie el request a un cliente registrado en la base de datos de control.
* Registrar o actualizar el acumulado en una base de datos centralizada de proyectos:
  ```json
  // Colección centralizada: /clientesBilling
  {
    "id": "cliente-marca-x",
    "nombreCliente": "Tienda de Calzado X",
    "ultimoReporte": "2026-05-29T12:00:00Z",
    "periodos": {
      "2026-05": {
        "totalVentas": 4500000,
        "comisionPorcentaje": 1.5,
        "comisionValor": 67500,
        "estadoPago": "pendiente", // pendiente | pagado
        "reciboUrl": null
      }
    }
  }
  ```

### 2. Emisor del Cliente (Trigger e Integración en la App del Cliente)
Cada aplicación cliente reporta de manera automática sus métricas de facturación al endpoint central. Existen dos momentos óptimos para disparar la transmisión:
* **Opción A (En tiempo real - Recomendada):** Al confirmarse un pago de pedido, se realiza una llamada asíncrona no bloqueante (a través de un hook o servicio) que suma la transacción al acumulado del mes del cliente en la base de datos central.
* **Opción B (Diferida):** El panel de ajustes del administrador de cada cliente, al calcular las métricas mensuales con `useBilling`, realiza un push periódico de telemetría a tu API central, o bien cuando el cliente firma digitalmente la aprobación de su recibo mensual en la pantalla de facturación.

### 3. Panel de Control del Desarrollador (Dashboard Central)
Una pequeña interfaz web progresiva (PWA) de uso estrictamente privado, construida con React y Tailwind CSS, conectada a tu base de datos central de Firestore. En este panel visualizas en un solo lugar:
* La lista completa de tus clientes activos.
* El estatus de comisiones generadas por cada uno en el mes actual e históricos.
* Indicador visual de quién ha pagado y quién tiene saldos pendientes.
* Alertas rápidas de aplicaciones inactivas o que lleven días sin registrar transacciones.

---

## 🔒 Seguridad y Aislamiento

* **Sin Acceso Cruzado a Bases de Datos:** El proyecto central no necesita credenciales maestras de los clientes ni acceso a sus proyectos de Firebase. Esto protege la privacidad de los datos de tus clientes y mitiga riesgos de seguridad masivos.
* **Tokens de API Unidireccionales:** Cada cliente tiene un token UUID secreto en su base de datos local que envía en las cabeceras HTTP de autenticación (`Authorization: Bearer <TOKEN>`). Si un cliente se da de baja, simplemente revocas su token en el panel central y su aplicación dejará de reportar telemetría.
