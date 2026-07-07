# Auditoría Crítica y Análisis del Ecosistema PROTOTIPE (2026)

Este informe presenta un análisis profundo, crítico y funcional de todo el ecosistema PROTOTIPE, enfocado en la detección de fallos de seguridad graves, inconsistencias de código, cuellos de botella de rendimiento, áreas de mejora en la automatización de la CLI y el Dashboard, y estrategias de ampliación.

---

## 🔐 1. Diagnóstico Crítico de Seguridad y Reglas de Firestore

### 🚨 1.1 Escalada de Privilegios Administrativos (Admin Bypass)
* **Archivo:** [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) (Líneas 6-8, 11-14, 33-39)
* **Gravedad:** Crítica
* **Causa Raíz:** La función de detección de administrador verifica únicamente que el usuario esté autenticado:
  ```javascript
  function isAdmin() {
    return request.auth != null;
  }
  ```
* **Impacto:** Si la aplicación habilita registro de clientes (e.g. inicio de sesión de clientes por email/contraseña en `LoginPage.jsx`), **cualquier cliente autenticado es tratado como Administrador** por las reglas de Firestore. Un atacante puede reescribir la configuración del negocio (`/config`), alterar precios de productos (`/products`), borrar categorías, manipular los balances financieros de fiados (`/credits`) y alterar registros de personal (`/employees`).
* **Propuesta de Solución:** Restringir la verificación de administrador validando su registro en la colección de usuarios `/users/{uid}` con el atributo `role == 'admin'` (comportamiento implementado en la plantilla Core):
  ```javascript
  function isAdmin() {
    return request.auth != null && 
      exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  }
  ```

### 🚨 1.2 Exposición de PINs de Empleados, Salarios y Teléfonos
* **Archivo:** [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) (Líneas 127-130)
* **Gravedad:** Crítica
* **Causa Raíz:** La regla permite a cualquier usuario no autenticado (anónimo) leer los documentos de empleados activos:
  ```javascript
  match /employees/{employeeId} {
    allow read: if isAdmin() || (resource != null && resource.data.activo == true);
    allow write: if isAdmin();
  }
  ```
* **Impacto:** Un cliente o un tercero puede descargar por la consola de Firestore la lista completa de empleados, incluyendo sus números telefónicos, salarios reales (brecha de confidencialidad de datos) y sus PINs de inicio de sesión hasheados en SHA-256. Al ser PINs simples de 4 a 6 dígitos numéricos, son susceptibles a descifrado inmediato por fuerza bruta offline.
* **Propuesta de Solución:** Separar la información pública de los empleados (nombre, foto, rol) de los metadatos sensibles (PIN, salario). Los datos sensibles deben moverse a una subcolección privada `/employees/{employeeId}/private/data` accesible únicamente por administradores y por el propio empleado autenticado mediante reglas estrictas.

### 🚨 1.3 Evasión del Bloqueo de Empleado Desactivado (Auth Guard Bypass)
* **Archivo:** [RequirePortalAuth.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/portal/RequirePortalAuth.jsx) (Líneas 47-50)
* **Gravedad:** Alta
* **Causa Raíz:** Al desactivar a un empleado en el panel (`activo == false`), el listener de Firestore (`onSnapshot`) genera un error de permisos insuficientes (gracias a las reglas de seguridad). Sin embargo, el callback de error en el hook reactivo de autenticación solo desactiva la pantalla de carga (`setChecking(false)`), pero **no limpia la sesión activa**:
  ```javascript
  }, (error) => {
    console.error("Error validando empleado:", error)
    setChecking(false) // Falla aquí: el estado de sesión sigue siendo válido
  })
  ```
* **Impacto:** Si un empleado es despedido o desactivado en tiempo real, puede eludir su salida del sistema y continuar ejecutando cobros o alterando inventario en el POS, ya que la aplicación en memoria no lo desloguea.
* **Propuesta de Solución:** Limpiar explícitamente los estados del store de Zustand al dispararse el error:
  ```javascript
  }, (error) => {
    console.error("Error validando empleado:", error);
    clearPortalEmployee();
    setIsValid(false);
    setChecking(false);
  })
  ```

### 🚨 1.4 Exposición de Datos del CRM Central (Clientes y comisiones)
* **Archivo:** [firestore.rules](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) (Líneas 44-47)
* **Gravedad:** Alta
* **Causa Raíz:** Se permite lectura abierta (`allow read: if true`) sobre la colección `/clientes_control/`.
* **Impacto:** Cualquier persona con acceso a la red local o a la URL pública puede listar la facturación consolidada de todos los comercios del ecosistema, comisiones totales del desarrollador y tokens de enlace de Firebase.
* **Propuesta de Solución:** Limitar las lecturas utilizando validaciones basadas en el ID de cliente y su token de telemetría por query filters.

### 🚨 1.5 Exposición de Puertos y Ejecución Remota de Código (RCE) en CLI
* **Archivo:** [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) (Líneas 42-43)
* **Gravedad:** Crítica
* **Causa Raíz:** El servidor Express local se monta sin delimitar la interfaz de bucle de retorno local (`127.0.0.1`):
  ```javascript
  app.listen(PORT, () => { ... });
  ```
* **Impacto:** Al levantar Express en `0.0.0.0` por defecto, cualquier dispositivo dentro del mismo segmento de red Wi-Fi o local (o de internet si se redireccionan puertos) puede ejecutar peticiones de API Bridge. Dado que el Bridge no tiene mecanismos de autenticación (API Key/JWT), cualquier atacante remoto puede leer/guardar variables de entorno locales, crear proyectos que corren scripts de aprovisionamiento o invocar la suite de tests que ejecuta subprocesos Bash (`npm run test:ci`).
* **Propuesta de Solución:** Vincular el servidor estrictamente a localhost:
  ```javascript
  app.listen(PORT, '127.0.0.1', () => { ... });
  ```

---

## ⚙️ 2. Fallos del Motor de Aprovisionamiento y Automatización (CLI)

### 🐛 2.1 Prompt Crasher en el Asistente Interactivo
* **Archivo:** [cli.js](file:///d:/PROTOTIPE/Prototipe-CLI/cli.js) (Líneas 90-97)
* **Gravedad:** Alta
* **Causa Raíz:** El prompt de selección de ruta define el tipo como `'targetPath'`:
  ```javascript
  {
    type: 'targetPath',
    name: 'targetPath',
    message: 'Ruta absoluta donde se creará el proyecto:',
  }
  ```
  Inquirer no incluye un tipo de input llamado `'targetPath'` de forma nativa. Esto provoca un crash de excepción inmediata al arrancar el CLI.
* **Propuesta de Solución:** Cambiar el tipo de pregunta a `'input'`.

### 🐛 2.2 Variables no Declaradas en Aprovisionamiento (ReferenceError)
* **Archivo:** [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) (Líneas 235, 289, 425)
* **Gravedad:** Alta
* **Causa Raíz:** La función principal `createProject` utiliza en múltiples bloques las variables `primaryColor`, `accentColor` y `themeName` (e.g. al inyectar CSS o escribir metadatos), pero **nunca fueron declaradas en el scope local** de la función.
* **Impacto:** El script de aprovisionamiento falla con un error `ReferenceError: primaryColor is not defined` a la mitad del proceso, dejando archivos corruptos a medio generar.
* **Propuesta de Solución:** Desestructurar las variables de color correspondientes de acuerdo a la paleta seleccionada al inicio del flujo:
  ```javascript
  let primaryColor, accentColor, themeName;
  if (answers.paletteChoice === 'custom') {
    primaryColor = answers.customPrimary;
    accentColor = answers.customAccent;
    themeName = 'custom';
  } else {
    const selected = PALETTES[answers.paletteChoice] || PALETTES.ruby;
    primaryColor = selected.primary;
    accentColor = selected.accent;
    themeName = selected.theme;
  }
  ```

---

## 📈 3. Cuellos de Botella de Rendimiento y Firebase

### 📉 3.1 Procesamiento de Redundancias O(N) en Facturación
* **Archivo:** [billingService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/billingService.js) (Líneas 211-268)
* **Gravedad:** Media
* **Causa Raíz:** La consulta de historial comisional recopila todas las transacciones de ventas sin límites ni paginaciones desde el inicio de los tiempos de la base de datos, realizando la suma y consolidación de ganancias del desarrollador directamente en el navegador del cliente en tiempo real.
* **Impacto:** Conforme el volumen de ventas del comercio aumente a miles de transacciones, el tráfico de red de Firebase y el consumo de memoria del navegador se degradarán exponencialmente, elevando las tarifas de lectura de Firebase y provocando congelamiento (jank) en la UI.
* **Propuesta de Solución:** Implementar agregaciones precalculadas del lado del servidor (Firebase Cloud Functions) o restringir las lecturas comisionales mediante queries paginadas por periodos cerrados (meses consolidados).

---

## 🚀 4. Propuestas de Ampliación y Mejoras de Eficiencia

### 🌐 4.1 CLI Centralizado en la Nube (Web-based CLI)
* **Problema Actual:** El Bridge Server depende de que el desarrollador tenga el CLI y NodeJS instalados de forma local para compilar y desplegar a Firebase.
* **Propuesta:** Mudar el aprovisionamiento y build a un pipeline CI/CD en la nube (ej. GitHub Actions o Google Cloud Build). El Dashboard Central de control podrá enviar peticiones a este servicio para aprovisionar, configurar colores y desplegar clientes de forma remota, sin requerir una máquina local encendida.

### 📱 4.2 Modularización de Plantillas Core por Micro-frontends (Vite Federation)
* **Problema Actual:** Las plantillas de Agendamiento, Gastronomía y Ventas residen como aplicaciones completas monolíticas duplicadas en gran medida en el CLI.
* **Propuesta:** Utilizar Module Federation. Mantener una aplicación Shell de marca blanca (`template-core-seed`) y cargar de forma dinámica en caliente el módulo del nicho (`SalesApp`, `BookingApp`, `KitchenPanel`) según el perfil del cliente, reduciendo drásticamente la duplicación de código base del framework.
