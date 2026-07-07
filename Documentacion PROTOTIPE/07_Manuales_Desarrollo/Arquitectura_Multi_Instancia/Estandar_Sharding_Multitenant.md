# 📡 Estándar de Escalabilidad Multi-tenant (Sharding)

> **Ubicación:** `D:\PROTOTIPE\Documentacion PROTOTIPE\07_Manuales_Desarrollo\Arquitectura_Multi_Instancia\Estandar_Sharding_Multitenant.md`  
> **Propósito:** Definir el protocolo de operación para el escalamiento horizontal mediante Sharding (fragmentación de bases de datos Firebase), garantizando la portabilidad del código y previniendo regresiones o dependencias estáticas en el core de la aplicación.

---

## 1. Concepto de Sharding Híbrido en Prototipe

Para mantener el ecosistema ligero, con costo de operación $0 en fases tempranas y velocidad extrema de onboarding, la plataforma implementa un esquema híbrido:
1. **Consola Central (Base de Datos de Control):** Ubicada en el proyecto central `prototipe-multi-instancia-control`. Aquí reside el directorio general de clientes, tokens de telemetría y facturas de comisiones consolidadas de todo el ecosistema.
2. **Shards de Operación (Proyectos Firebase del POS):** Grupos de clientes operando en bases de datos aisladas.
   * *Shard 1 (Base):* `ventas-smartfix` (Clientes 1 a 50)
   * *Shard 2:* `ventas-shard-2` (Clientes 51 a 100)
   * *Shard 3:* `ventas-shard-3` (Clientes 101 a 150)

Cada cliente tiene su propia carpeta física en el disco local de desarrollo, pero se comunica con el Shard que le fue asignado de forma 100% dinámica gracias a las variables inyectadas por el CLI.

---

## 2. Protocolo para Iniciar un Nuevo Shard (Ej. Shard 2)

Cuando un Shard actual alcance su capacidad óptima (por rendimiento o límites de capa gratuita de Firebase), sigue estos pasos estructurados:

### Paso 1: Inicialización del Proyecto en la Nube
1. Ve a la consola web de Firebase y crea un nuevo proyecto (ej. `ventas-shard-2`).
2. Habilita los servicios requeridos de forma manual en la consola:
   * **Firestore Database** (en modo producción).
   * **Authentication** (habilita el proveedor de Correo y Contraseña).
   * **Storage** (crea el bucket para comprobantes y fotos de productos).

### Paso 2: Creación de la Web App en Firebase
No es necesario crear manualmente la Web App ni copiar las credenciales. El daemon CLI lo hará por ti de forma automática:
1. Asegúrate de tener sesión iniciada en la Firebase CLI local ejecutando `firebase login` en tu terminal.

### Paso 3: Aprovisionamiento y Registro desde el Dashboard Dev
Al registrar al nuevo cliente (el primero del nuevo Shard) en el Dashboard Administrativo:
1. Abre el modal de **Registro de Cliente**.
2. En el input de **Firebase Project ID**, escribe el ID del nuevo proyecto (ej. `ventas-shard-2`).
3. Haz clic en **Auto-detectar**.
   * *El CLI de Node ejecutará `firebase apps:create web` bajo ese nuevo proyecto, extraerá las claves de configuración del SDK correspondientes e inyectará de forma automática los inputs en la UI.*
4. Completa la clave VAPID y los datos del cliente, y haz clic en **Registrar y Crear**.

---

## 3. Reglas Técnicas de Consistencia (Para Agentes y Desarrolladores)

Para evitar romper la compatibilidad multitenant, se deben respetar de forma estricta las siguientes reglas en cualquier cambio del código base:

1. **Bypass de Referencias Estáticas:**
   * ❌ **Prohibido:** `const db = getFirestore(initializeApp({ projectId: 'ventas-smartfix' }))`
   *  **Correcto:** `const db = getFirestore(initializeApp(firebaseConfig))` (leído dinámicamente de `import.meta.env`).
2. **Propagación Automática de Cambios (Multi-Tenant Updates):**
   * Al modificar reglas de Firestore en el código base (`firestore.rules` o `firestore.indexes.json`), recuerda que al desplegar con el CLI a una instancia específica, el CLI utilizará el flag `-P` (proyecto activo de esa instancia) leído desde el `.firebaserc` autogenerado de forma aislada. No intentes desplegar reglas globales que hardcodeen el alias `default` de producción del core.
3. **Persistencia Central de Telemetría:**
   * La telemetría comisional (los reportes de facturación de cada venta) de todos los Shards se consolidan en el mismo Firestore de control central (`prototipe-multi-instancia-control`). Asegúrate de que las variables `VITE_DEVELOPER_CENTRAL_*` en el archivo `.env.local` apunten siempre a la base de datos de control central, independientemente del Shard de operación POS en el que corra la tienda del cliente.

---

## 4. Decisión Arquitectural Final (Junio 2026): Aislamiento Total por Cliente

Tras el análisis de escalabilidad y aislamiento de datos, se resolvió adoptar el modelo de **un proyecto Firebase por cliente** en lugar del Sharding Multi-inquilino en bases de datos compartidas.

### Comparativa y Justificación

| Aspecto | Sharding Compartido (50 clientes/proyecto) | Aislamiento Total (1 proyecto/cliente) (Elegido) |
| :--- | :--- | :--- |
| **Aislamiento de Auth** | ❌ Muy complejo (Mismos usuarios en el mismo pool de Auth) |  Excelente (Cada cliente tiene su propio pool de Auth y contraseñas) |
| **Límites de Cuota Gratis** | ❌ Consumido rápidamente por ráfagas concurrentes |  Multiplicado (Cada cliente tiene su propia capa gratuita individual de Firebase) |
| **Personalización PWA/SSL** | ❌ Complejo para dominios personalizados en Hosting |  Nativo (Cada cliente gestiona su propio dominio y certificado SSL) |
| **Seguridad de Datos** | ⚠️ Depende al 100% de reglas de Firestore |  Física (No hay posibilidad física de filtración cruzada de datos) |
| **Consolidación Operativa** | Centralizada nativa | Híbrida mediante Telemetría Cruzada a `prototipe-multi-instancia-control` |

### Funcionamiento de la Telemetría Cruzada
Para mantener el control centralizado de comisiones y auditorías sin comprometer la independencia de cada base de datos, las aplicaciones de cada cliente implementan una doble conexión en caliente:
1. **Conexión Principal (Local Store):** Utiliza las credenciales `VITE_FIREBASE_*` para inicializar el SDK y dar soporte a las operaciones cotidianas del cliente (catálogo, carritos, ventas, inventario).
2. **Conexión Central (Ecosistema Telemetry):** Utiliza las credenciales `VITE_DEVELOPER_CENTRAL_*` para inicializar una aplicación secundaria de Firebase (`centralDevApp`) que escribe reportes de auditoría en la colección `reportesBilling` del proyecto central `prototipe-multi-instancia-control`. Este envío está validado y securizado mediante el token único `VITE_DEVELOPER_TELEMETRY_TOKEN` configurado en el `.env.local` de la aplicación del cliente.

