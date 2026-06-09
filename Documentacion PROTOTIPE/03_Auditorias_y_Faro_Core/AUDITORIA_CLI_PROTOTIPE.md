# Auditoría Técnica del Sistema de Aprovisionamiento (Prototipe CLI y API Bridge)

Este documento presenta una auditoría detallada de la arquitectura, flujos, nivel de automatización y dependencias del sistema de aprovisionamiento de PROTOTIPE (`cli.js`, `generator.js` y `server.js`).

---

## 1. Flujo Oficial de Aprovisionamiento: Estado de Implementación

### Pasos Implementados (100% Automatizados)
* **Paso 1: Duplicación de Plantilla Base:** Creación del directorio destino (`targetDir`) y copiado recursivo de archivos desde `/templates/[template]` (`generator.js` L31-37).
* **Paso 2: Inyección de Marca (HSL):** Asignación y mapeo dinámico de colores primario, secundario y de tema en variables CSS (`generator.js` L39-55).
* **Paso 3: Generación Criptográfica FCM VAPID:** Creación automática de llaves públicas/privadas VAPID utilizando la librería `web-push` (`generator.js` L57-66).
* **Paso 4: Inyección de Configuración de Entorno (.env.local):** Creación y sanitización en caliente del archivo `.env.local` con credenciales de Firebase del cliente, variables comisionales Ecosistema de telemetría y llaves VAPID (`generator.js` L68-117).
* **Paso 5: Vinculación Nativa Firebase (.firebaserc):** Generación automática del archivo JSON de vinculación para direccionar el proyecto por defecto al CLI de Firebase (`generator.js` L119-126).
* **Paso 6: Configuración de Nicho (niche.json):** Creación y escritura de atributos específicos y toggles lógicos del nicho (ej. ropa, supermercados, servicios técnicos) en `src/config/niche.json` (`generator.js` L128-164).
* **Paso 7: Ajuste de Service Worker (firebase-messaging-sw.js):** Reemplazo dinámico de credenciales del SDK de Firebase y la VAPID key inyectada en el service worker del cliente (`generator.js` L166-188).
* **Paso 8: Configuración SEO en index.html:** Inyección de títulos, metatags de descripción, palabras clave y open graph en el HTML principal (`generator.js` L190-230).
* **Paso 9: Generador de Logos y Favicons SVG:** Si no se suministra un path de logo personalizado, genera automáticamente un logo vectorizado en base a las iniciales del proyecto usando el color primario HSL de la marca (`generator.js` L232-277).
* **Paso 10: Inyección de Entorno de Desarrollo y Mapeo IA:** Creación del directorio `/scratch/`, inyección de `generate_ia_map.js`, inyección de directivas globales de desarrollo local (`GEMINI.md` adaptado) y mapeo de npm scripts (`npm run map`, `npm run build`) (`generator.js` L279-348).
* **Paso 11: Prompt de Arranque para Antigravity:** Generación automática de `antigravity_bootstrap_prompt.md` en la raíz del proyecto, sirviendo como guía de entrada directa para la IA con todo el briefing de cliente (`generator.js` L350-447).
* **Paso 12: Instalación de Dependencias e Indexado Inicial:** Ejecución síncrona de `npm install` e indexación del primer mapa físico de código del proyecto mediante `npm run map` (`generator.js` L449-460).
* **Paso 13: Auto-detección y Creación de Web Apps (API Bridge):** Consulta de configuraciones de Firebase SDK y creación automática de la Web App en el proyecto remoto mediante Firebase CLI (`server.js` L52-131).
* **Paso 14: Expansión de Requerimientos mediante IA:** Expansión cognitiva de requerimientos básicos de clientes utilizando Gemini 2.5 Flash mediante llamadas REST directas antes de aprovisionar (`server.js` L144-197).

### Pasos Parcialmente Implementados
* **Publicación en Repositorio GitHub:** Inicializa git local, realiza el commit inicial e intenta crear el repositorio remoto privado y hacer push usando la GitHub CLI (`gh repo create`) (`generator.js` L462-476). Es parcial porque depende críticamente del estado de autenticación y disponibilidad de la herramienta `gh` en el host.
* **Despliegue de Reglas e Índices Firestore:** Ejecuta el comando `firebase deploy --only firestore:rules,firestore:indexes` apuntando al Project ID del cliente (`generator.js` L478-484). Es parcial porque depende del login previo de la máquina.
* **Sembrado de Base de Datos (Seeding):** Ejecuta `node scratch/seed_brand.js` (`generator.js` L485-498) si encuentra el archivo de credenciales de cuenta de servicio de Google Cloud (`firebase-service-account.json`). Al requerir que el desarrollador descargue este archivo manualmente a `/scratch/`, no es un flujo 100% automático.

### Pasos No Existentes
* **Creación del Proyecto Firebase:** El CLI no tiene la capacidad de crear el contenedor del proyecto en Google Cloud / Firebase. El ID del proyecto debe existir previamente.
* **Habilitación de Servicios Cloud (Auth, Firestore, Storage, Cloud Messaging):** No se inicializan ni activan los recursos en caliente; el CLI asume que ya están habilitados en el proyecto Firebase.
* **Despliegue de Cloud Functions:** No existe ninguna rutina de compilación e instalación automática de funciones en la nube (Cloud Functions) asociadas al ecosistema.
* **Asociación de Llaves VAPID en Consola:** Genera e inyecta la llave localmente, pero no la registra en el dashboard de configuración de notificaciones de la consola de Firebase.

---

## 2. Dependencias Externas e Intervención Manual

### Dependencias que Requieren Intervención Manual
1. **Instalación de Entorno Local:** Se requiere Node.js, npm, Git, Firebase CLI (`npm install -g firebase-tools`) y GitHub CLI (`gh`).
2. **Autenticación en Servicios:** 
   * Firebase CLI requiere autenticación interactiva (`firebase login`).
   * GitHub CLI requiere autenticación interactiva (`gh auth login`).
3. **Inicialización de Credenciales de Cuenta de Servicio:** Descarga obligatoria del JSON de credenciales de Google Cloud desde la consola de Firebase para guardarla en la subcarpeta local `/scratch/` si se desea sembrar la base de datos de manera automatizada.

### Procesos que Dependen de Firebase Console (100% Manuales)
1. **Creación del Proyecto:** Acceder al portal web de Firebase, nombrar el proyecto y aceptar los términos de Google Cloud.
2. **Inicialización de Firestore Database:** Creación del recurso de base de datos seleccionando la ubicación geográfica (ej. `us-central1`) y el modo (Producción).
3. **Inicialización de Firebase Storage:** Creación de las reglas básicas del bucket y la ubicación de almacenamiento de assets.
4. **Habilitación de Auth Providers:** Activación manual de los métodos de inicio de sesión requeridos (Email/Password y Teléfono).
5. **Configuración de Notificaciones (FCM):** Registro del certificado Web Push (VAPID key pública) en la sección de configuración de mensajería del proyecto.

### Procesos que Dependen de Firebase CLI Interactivo
* Autenticación local mediante `firebase login` (abre el navegador del host).
* Consulta y extracción dinámica del SDK config web mediante `firebase apps:sdkconfig --json` (usado por el API Bridge en `server.js` L60).
* Despliegue de reglas e índices compuestos mediante subprocesos shell (`generator.js` L482).

### Procesos que Dependen de GitHub Manual
* Autenticación inicial del desarrollador (`gh auth login`).
* Mantenimiento de límites de cuenta y claves SSH/GPG para permitir empujar repositorios privados creados localmente.

---

## 3. Diagnóstico de Automatización y Brecha Técnica

### Porcentaje Real de Automatización del CLI
* **Scaffolding y Configuración Local:** **100%** (Copia, inyección de variables, metadatos, temas, SEO, scripting de IA y prompts de arranque).
* **Despliegue y Control de Versiones:** **75%** (Subida a GitHub y despliegue de reglas dependientes del login local del host).
* **Aprovisionamiento de Infraestructura Cloud (Backend):** **0%** (Creación del proyecto, habilitación de Firestore, Storage, Auth y FCM).
* **Porcentaje de Automatización Promedio del Sistema:** **~60% a 65%**. El sistema es altamente eficiente para armar el software localmente y conectarlo, pero sigue estando fuertemente acoplado a la preparación manual de la infraestructura en la nube de Firebase.

### Qué construir para lograr un aprovisionamiento de un solo clic
Para eliminar las dependencias manuales y lograr un despliegue de "un solo clic" desde el dev-dashboard, es necesario implementar:

1. **Integración con la REST API de Firebase Management:**
   * Utilizar OAuth2 para autenticar la Consola Central con Google Cloud.
   * Realizar llamadas HTTP POST a la API `https://firebase.googleapis.com/v1beta1/projects` para crear el proyecto programáticamente.
2. **API de Inicialización de Recursos de GCP:**
   * Habilitar Firestore mediante la API de Firestore Admin (`projects.databases.create`).
   * Habilitar Firebase Storage programáticamente.
   * Habilitar Auth Providers mediante la Identity Platform API.
3. **Flujo de Autenticación Unificado (OAuth 2.0 en Dashboard):**
   * Sustituir el uso del CLI local de Firebase/GitHub. El Dashboard de Control debe autenticar las cuentas de GitHub y Firebase de los desarrolladores y enviar tokens de portador (Bearer tokens) al CLI Bridge, permitiendo que el servidor realice las acciones usando APIs HTTP con Axios/Fetch en lugar de ejecutar comandos de consola (`execSync`).
4. **Registro Automatizado de FCM VAPID:**
   * Registrar la llave pública FCM generada en la configuración de la Web App en Google Cloud mediante API HTTP, eliminando la necesidad de asociar el certificado en la Firebase Console de manera manual.
5. **Creación Automática de Cuenta de Servicio:**
   * Solicitar la llave de cuenta de servicio de forma programática a través de la IAM API de GCP y depositarla directamente en `/scratch/firebase-service-account.json` antes de iniciar la siembra de la base de datos.
