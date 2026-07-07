# Guía Maestra Unificada 2026: Estándar Oficial de Desarrollo
## Construcción de Aplicaciones Modernas (React + Firebase + Antigravity)

Este documento establece el estándar técnico definitivo, arquitectónico y metodológico para el desarrollo de aplicaciones web de alta calidad, robustas, escalables y libres de mantenimiento, utilizando el stack moderno de React y Firebase.

El objetivo de esta guía es que cualquier Inteligencia Artificial o desarrollador del equipo interprete requerimientos, flujos y diseños, y los transforme de manera consistente en código de nivel de producción sin errores estructurales ni redundancia técnica.

---

## FASE 1 — CONTRATO DE INICIALIZACIÓN: STACK OFICIAL Y REGLAS BASE

Antes de escribir una sola línea de código, la aplicación debe ajustarse estrictamente a este stack y conjunto de reglas arquitectónicas.

### 1.1 Stack Principal Oficial

La infraestructura tecnológica autorizada para el desarrollo de todos los proyectos consta de:

* **React (Frontend):** Biblioteca base para la construcción de interfaces interactivas orientadas a componentes declarativos.
* **Vite:** Motor de desarrollo y empaquetador ultrarrápido para una compilación ágil en entornos locales y de producción.
* **Firebase SDK Modular:** Backend-as-a-Service para autenticación, base de datos en tiempo real (Firestore) y hosting, utilizando la sintaxis modular de la versión 9+.
* **Tailwind CSS v4:** Framework de diseño utilitario para un estilado cohesivo, rápido y mantenible directo en el marcado.
* **TanStack Query (React Query):** Gestor del estado asíncrono para la consulta, almacenamiento en caché, sincronización y mutación de datos del backend de forma eficiente.
* **Zustand:** Gestor de estado global ligero y reactivo para coordinar el estado de la UI o lógica compartida entre componentes independientes.
* **Framer Motion:** Biblioteca de animación avanzada para dar fluidez y transiciones premium a la interfaz.
* **Lucide React:** Set de íconos vectoriales consistentes y optimizados para web.
* **Zod:** Biblioteca de declaración y validación de esquemas de datos en tiempo de ejecución.
* **React Error Boundary:** Manejo de excepciones y fallos a nivel de UI para evitar caídas totales de la aplicación.

---

### 1.2 Regla de Cero CSS Externo

Para evitar colisiones de estilos, prevenir el uso de la directiva destructiva `!important` y facilitar el análisis de código, queda **estrictamente prohibido**:
* Crear archivos CSS personalizados (`.css` o similares).
* Implementar CSS Modules (`.module.css`).
* Incorporar preprocesadores como SCSS o SASS.
* Utilizar estilos en línea (`style={{...}}`) salvo para valores dinámicos calculados en tiempo de ejecución (ej. posiciones de animaciones o cálculos matemáticos dinámicos).

**Directiva única:** Todo el estilado visual debe manejarse única y exclusivamente mediante las clases utilitarias de **Tailwind CSS** aplicadas directamente sobre las etiquetas del JSX. Esto centraliza la estructura del componente junto con su representación visual, facilitando el mantenimiento masivo y consistente.

---

### 1.3 Separación Estricta de Responsabilidades

La arquitectura de código del proyecto exige la separación de los componentes visuales de la lógica de negocio a través de tres capas diferenciadas:

#### A. Componentes Visuales (Presentational Components)
Son componentes "tontos" orientados únicamente a la representación visual.
* **Responsabilidades:**
  * Renderizar elementos HTML o UI.
  * Estructurar el diseño visual mediante clases utilitarias de Tailwind.
  * Recibir datos y manejadores de eventos (callbacks) exclusivamente a través de `props`.
* **Prohibiciones:** No deben contener lógica compleja, llamados directos a servicios de Firebase, inicialización de peticiones asíncronas, ni suscripciones a estados globales (Zustand).

#### B. Hooks Personalizados (Custom Hooks)
Centralizan la lógica de negocio reutilizable y el comportamiento dinámico.
* **Responsabilidades:**
  * Manejo del estado local (`useState`, `useReducer`).
  * Ejecución de efectos secundarios (`useEffect`).
  * Conexión con los almacenes de Zustand o las consultas de TanStack Query.
  * Reutilización de flujos funcionales complejos.
* **Ejemplos:** `useAuth`, `useOrders`, `useUsers`, `useFirestoreQuery`.

#### C. Servicios (Services)
Son la única capa autorizada para comunicarse con APIs externas y el ecosistema de Firebase.
* **Responsabilidades:**
  * Configuración y comunicación con Firestore, Firebase Auth y Firebase Storage.
  * Llamado a Cloud Functions.
  * Retornar promesas o flujos de datos limpios para ser consumidos por los Custom Hooks.
* **Regla estricta:** Ningún componente visual o página puede interactuar con Firebase directamente; toda interacción debe estar completamente aislada en la carpeta `src/services/`.

---

## FASE 2 — ESTRUCTURA DEL PROYECTO: ORGANIZACIÓN, NOMENCLATURA Y MAPA VIVO

### 2.1 Estructura de Carpetas Oficial

El código fuente de la aplicación dentro del directorio `src/` debe seguir estrictamente esta estructura de directorios:

```text
src/
 ├── assets/          # Recursos estáticos (imágenes, fuentes, ilustraciones)
 ├── components/      # Componentes UI atómicos y reutilizables
 ├── pages/           # Vistas completas del sistema (pantallas)
 ├── layouts/         # Plantillas de estructura de página (Admin, Cliente, Auth)
 ├── routes/          # Configuración de rutas y navegación de la app
 ├── hooks/           # Lógica reutilizable y comportamiento (Custom Hooks)
 ├── services/        # Clientes y consultas a Firebase/APIs
 ├── store/           # Stores globales de Zustand
 ├── config/          # Constantes y configuraciones generales del sistema
 ├── constants/       # Valores inmutables globales (roles, estados, límites)
 ├── schemas/         # Esquemas de validación Zod
 ├── types/           # Tipados y contratos de datos (TypeScript/JSDoc)
 └── providers/       # Proveedores de contexto global (React Query, Auth, Temas)
```

---

### 2.2 Significado y Contenido de las Carpetas Clave

* **`src/components`:** Alberga componentes puramente reutilizables de UI en múltiples páginas de la aplicación.
  * *Contenido:* `Button.jsx`, `Input.jsx`, `Card.jsx`, `Table.jsx`, `Modal.jsx`, `Badge.jsx`, `Loader.jsx`.
* **`src/pages`:** Vistas de página completa asociadas directamente al enrutador.
  * *Contenido:* `Dashboard.jsx`, `Login.jsx`, `Orders.jsx`, `Settings.jsx`.
* **`src/hooks`:** Almacena la lógica de estado y de ciclos de vida.
  * *Contenido:* `useAuth.js`, `useFirestore.js`, `useRealtimeNotifications.js`.
* **`src/store`:** Centralización de estados globales accesibles desde cualquier nodo del árbol de renderizado.
  * *Contenido:* `authStore.js`, `uiStore.js`, `notificationsStore.js`.
* **`src/services`:** Aislamiento absoluto de consultas y llamadas asíncronas.
  * *Contenido:* `firestore.js`, `auth.js`, `storage.js`, `cloudFunctions.js`.
* **`src/utils`:** Funciones puras de utilidad sin efectos secundarios.
  * *Contenido:* `formatCurrency.js`, `formatDate.js`, `validators.js`, `helpers.js`.
* **`src/layouts`:** Envolturas de diseño estructural para agrupar vistas bajo un mismo formato de rejilla o navegación.
  * *Contenido:* `AdminLayout.jsx`, `AuthLayout.jsx`, `DashboardLayout.jsx`.
* **`src/providers`:** Componentes proveedores de contextos esenciales globales.
  * *Contenido:* `QueryProvider.jsx`, `ThemeProvider.jsx`, `AuthProvider.jsx`.

---

### 2.3 Nomenclatura Predictiva Oficial

Para garantizar la legibilidad y evitar inconsistencias en el mantenimiento del proyecto, la nomenclatura debe seguir estas convenciones estrictas:

* **Páginas y Vistas (`src/pages/`):**
  * *Formato:* PascalCase.
  * *Ejemplos:* `Home.jsx`, `Dashboard.jsx`, `UserProfile.jsx`, `OrdersPage.jsx`.
* **Componentes de UI (`src/components/`):**
  * *Formato:* PascalCase descriptivo.
  * *Ejemplos:* `PrimaryButton.jsx`, `ProductCard.jsx`, `ConfirmModal.jsx`, `SidebarNavigation.jsx`.
* **Hooks Personalizados (`src/hooks/`):**
  * *Formato:* camelCase, comenzando obligatoriamente con el prefijo `use`.
  * *Ejemplos:* `useAuth.js`, `useOrders.js`, `useRealtimeData.js`.
* **Servicios (`src/services/`):**
  * *Formato:* camelCase descriptivo, agregando el sufijo `Service` (opcional excepto para evitar conflictos).
  * *Ejemplos:* `firebaseConfig.js`, `orderService.js`, `uploadService.js`.
* **Stores Globales (`src/store/`):**
  * *Formato:* camelCase, con el sufijo `Store`.
  * *Ejemplos:* `authStore.js`, `appStore.js`.

---

### 2.4 Metodología de Sondeo y Comprensión Profunda (Fase de Diseño)

Antes de generar o modificar cualquier componente, ruta, colección o lógica en Firebase, la IA o el desarrollador debe comprender obligatoriamente el contexto global de la aplicación. **Queda prohibido asumir comportamientos.**

#### Proceso Obligatorio de Comprensión:
1. **Analizar:** El objetivo principal de la aplicación, el tipo de usuarios (roles), los flujos internos de información, la lógica de negocio crítica, el modelo de permisos, la estructura de la base de datos y la navegación global.
2. **Formular Preguntas de Sondeo:** Se debe indagar detalladamente al usuario para delimitar el alcance técnico antes del desarrollo.
   * *Preguntas clave:* ¿Qué problema resuelve esta funcionalidad?, ¿Qué roles de usuario interactúan aquí?, ¿Cuál es el flujo principal de estados?, ¿Qué información exacta se debe almacenar en Firestore?, ¿Qué validaciones son requeridas mediante Zod o Firestore Rules?, ¿Qué datos necesitan actualización en tiempo real?, ¿Qué pantallas y relaciones entre colecciones se verán afectadas?

---

### 2.5 Archivo Maestro de Flujos de la Aplicación (`flujos_aplicacion.md`)

Cada aplicación debe contener en su raíz el archivo obligatorio `flujos_aplicacion.md`, el cual sirve como la memoria operativa de lógica y comportamiento del sistema.

#### A. Contenido Requerido del Archivo de Flujos:
* Explicación de cómo funciona cada módulo de negocio.
* Acciones que desencadena cada botón o evento de usuario.
* El proceso completo (entrada, procesamiento y salida), detallando permisos involucrados y validaciones en frontend y backend.
* Las pantallas que participan y las colecciones de Firestore relacionadas.

#### B. Estructura Estándar de cada Flujo Documentado:
```markdown
### [Nombre del Flujo de Negocio] (Ej: Creación de Orden de Servicio)
* **Objetivo:** Qué problema de negocio resuelve este flujo específico.
* **Roles Involucrados:** Los usuarios autorizados (ej: admin, tecnico, cliente).
* **Pantallas Involucradas:** Páginas participantes (ej: Dashboard, Crear Orden, Historial).
* **Colecciones Relacionadas:** Colecciones de Firestore modificadas o consultadas (ej: usuarios, ordenes, notificaciones).
* **Secuencia Operativa:** Paso a paso cronológico del flujo (ej: 1. Usuario envía formulario -> 2. Sistema valida mediante Zod -> 3. Escritura en Firestore -> 4. Disparo de listener en tiempo real -> 5. Técnico recibe notificación).
* **Validaciones:** Campos obligatorios, validación de formatos, control de permisos y estados válidos.
* **Estados Posibles:** Lista de transiciones permitidas (ej: `pendiente` -> `asignada` -> `en proceso` -> `finalizada` -> `cancelada`).
```

#### C. Regla de Actualización Obligatoria:
Cada vez que se añada una función, cambie una lógica, se altere una colección de Firestore o se modifique el comportamiento de un rol, el desarrollador debe actualizar el archivo `flujos_aplicacion.md` **antes de dar la tarea por concluida.**

---

### 2.6 Sistema del "Mapa Vivo" de Arquitectura (`mapa_arquitectura.md`)

Para evitar la creación de archivos innecesarios, prevenir la duplicidad de lógica y asegurar la coherencia arquitectónica, es obligatorio mantener el archivo `mapa_arquitectura.md` en la raíz del proyecto.

1. **Creación y Contenido Inicial:** El mapa vivo debe contener el árbol completo del proyecto de forma detallada, junto con una explicación de una sola línea indicando la responsabilidad e interrelación de cada archivo.
2. **Lectura Obligatoria:** Antes de proceder a cualquier modificación de código en páginas, componentes, hooks o servicios, es obligatorio leer el mapa vivo para entender dónde insertar la lógica nueva sin romper dependencias existentes.
3. **Actualización en Tiempo Real:** Cualquier archivo nuevo que se cree o archivo que se elimine debe ser inmediatamente registrado o removido del archivo `mapa_arquitectura.md`.

---

### 2.7 Persistencia Estricta del Mapa de Documentación (`mapa_documentacion_ia.md`)

Para garantizar que la Inteligencia Artificial navegue por la base de conocimientos con precisión milimétrica sin saturar su contexto de lectura:

1. **Sincronización Obligatoria:** Cada vez que se agregue, modifique o elimine un archivo dentro del directorio de documentación del proyecto (ya sean manuales, catálogos de la biblioteca de componentes o bitácoras de tareas), es mandatorio actualizar, registrar o remover su entrada con su respectivo "Criterio de Decisión" en [`mapa_documentacion_ia.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_documentacion_ia.md) y en [`mapa_aplicacion.md`](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/Estandar%20de%20Desarrollo/mapa_aplicacion.md) en el mismo paso que se realiza el cambio.
2. **Actualización Semántica:** Las descripciones y roles técnicos de las entradas de documentación deben detallar explícitamente el caso de uso preciso bajo el cual la IA debe invocar ese recurso.

---

## FASE 3 — ESTÁNDAR UX/UI PREMIUM: DISEÑO DE VANGUARDIA Y MOBILE FIRST

El diseño visual debe cautivar al usuario final desde el primer segundo. La interfaz debe sentirse fluida, rápida, moderna, táctil, limpia y con características nativas para dispositivos móviles.

### 3.1 Sistema Visual Avanzado

* **Íconos:** Queda prohibido el uso de imágenes PNG para íconos o la importación de múltiples librerías pesadas e inconsistentes. El estándar obligatorio y único es la biblioteca vectorial **`lucide-react`**.
* **Emojis:** Su uso está estrictamente restringido a estados de interacción amigables, pantallas vacías (empty states) o mensajes de éxito específicos para dar calidez humana a la interfaz.
  * *Ejemplos permitidos:* 🎉 Pedido completado, 👻 No hay registros en esta sección.

---

### 3.2 Animaciones y Microinteracciones Sensoriales

* **Transiciones Base:** Todo elemento interactivo (botones, enlaces, tarjetas, pestañas) debe contar con una transición suave utilizando la clase base obligatoria de Tailwind CSS:
  ```css
  transition-all duration-300 ease-in-out
  ```
* **Estados de Click (Feedback Táctil):** Todo botón, botón de navegación inferior o elemento interactivo debe reaccionar al click reduciendo sutilmente su escala mediante:
  ```css
  active:scale-95
  ```
* **Estados Hover:** Los elementos interactivos deben reaccionar al cursor de forma elegante y sutil en escritorio:
  ```css
  hover:bg-gray-50 hover:shadow-sm
  ```
* **Animaciones Complejas:** La apertura de modales, la navegación de páginas, la entrada de listas de datos y la aparición de tarjetas informativas debe usar obligatoriamente **Framer Motion** para transiciones fluidas.
  * *Ejemplo de animación base:*
    ```jsx
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    ```

---

### 3.3 Estructura Premium de Modales y Cabeceras

* **Cabecera Flotante (Header):** Debe mantenerse fija en la parte superior, permitiendo ver el contenido inferior sutilmente mediante efectos de desenfoque modernos:
  ```css
  sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100
  ```
* **Modales de UI:** Para garantizar la accesibilidad y un comportamiento limpio en dispositivos móviles, los modales deben cumplir con:
  * Utilizar **React Portals** para inyectar el modal directamente en la raíz del documento (`body`).
  * Bloquear el scroll del fondo mientras el modal esté abierto.
  * Usar un overlay de fondo oscuro con desenfoque elegante:
    ```css
    backdrop-blur-sm bg-black/40
    ```

---

### 3.4 Mobile First Absoluto y Touch Targets

La aplicación debe construirse pensando primero en pantallas móviles y luego escalar a pantallas de escritorio (Directiva Mobile First).

* **Regla de Clases en Tailwind:** Primero se escriben las clases genéricas enfocadas en teléfonos móviles, y posteriormente se usan los prefijos de breakpoint (`md:`, `lg:`, `xl:`) para ajustar el diseño en pantallas de computadoras.
* **Touch Targets (Áreas de Clic Seguras):** Para evitar errores de interacción con los dedos en teléfonos inteligentes, todo elemento táctil o botón debe tener un tamaño mínimo de **`48x48px`** (equivalente a `h-12 w-12` o espaciados internos proporcionales).

---

### 3.5 Espaciados, Tipografías, Z-Index y Contenedores

#### A. Escala de Z-Index Oficial:
Para evitar superposiciones incorrectas o desordenadas de capas, se prohibe el uso de valores aleatorios de `z-index`. Se debe respetar estrictamente esta jerarquía:
* `z-0` → Fondos generales de página.
* `z-10` → Tarjetas, cabeceras locales, elementos flotantes de UI.
* `z-40` → Navegación principal y Headers de página completa.
* `z-50` → Backdrop o fondos de modales.
* `z-60` → Caja del modal activa o elementos de diálogo.
* `z-100` → Notificaciones emergentes (toasts) globales.

#### B. Contenedores Fluidos y Responsivos:
* Está **estrictamente prohibido** forzar anchos rígidos (ej: `width: 300px` o clases Tailwind como `w-[320px]`).
* En su lugar, se deben usar anchos responsivos y fluidos para adaptarse a cualquier pantalla:
  ```css
  w-full max-w-md flex-wrap gap-4
  ```

#### C. Escala de Espaciados Oficiales:
Utilizar espaciados estándar y consistentes:
* Rellenos internos grandes: `p-4` o `p-6`.
* Separación entre columnas/filas en cuadrículas y flexbox: `gap-3` o `gap-4`.
* Separación vertical entre bloques de texto o inputs: `space-y-6` o `space-y-8`.

#### D. Tipografías Consistentes:
* **Títulos:** Negrita, legibilidad compacta y tamaños proporcionales al dispositivo:
  ```css
  text-2xl md:text-4xl font-bold leading-tight
  ```
* **Texto de Contenido/Párrafos:** Lectura relajada y colores suaves para evitar fatiga visual:
  ```css
  text-base leading-relaxed text-gray-600
  ```

#### E. Reglas de Imágenes:
Toda imagen utilizada en la aplicación debe renderizarse de forma responsiva mediante las clases obligatorias:
```css
w-full object-cover aspect-video rounded-2xl shadow-sm
```

---

### 3.6 Navegación Dual e Interacción Móvil

La aplicación debe contar con un sistema inteligente de navegación optimizado para ambos mundos:

* **Escritorio (Sidebar Desktop):** Un menú lateral fijo e interactivo de ancho estándar en pantallas grandes:
  ```css
  hidden md:flex flex-col fixed left-0 top-0 h-screen w-64
  ```
* **Móvil (NavBottom Mobile):** Una barra de navegación táctil fija en la parte inferior de la pantalla para teléfonos móviles:
  ```css
  flex md:hidden fixed bottom-0 left-0 right-0 h-16
  ```
* **Exclusión Mutua:** Está estrictamente prohibido mostrar la navegación lateral de escritorio y la barra inferior de navegación móvil al mismo tiempo en el mismo tamaño de pantalla.
* **Regla de Opciones en NavBottom:** La barra inferior móvil debe contener un mínimo de **3** y un máximo de **5** opciones de navegación prioritarias.
* **Anatomía del Botón Móvil:** Para optimizar el espacio en pantallas pequeñas, cada botón de la barra inferior debe apilar el ícono arriba de un texto corto y centrado:
  ```css
  w-full h-full flex flex-col items-center justify-center gap-1
  ```
* **Estado Activo Visual:**
  * En escritorio (Sidebar): Resaltar la opción activa mediante un fondo suave y texto de color:
    ```css
    bg-blue-50 text-blue-600
    ```
  * En móvil (NavBottom): Resaltar la opción activa incorporando una píldora visual en el ícono, un indicador sutil y microanimaciones que denoten reactividad táctil.

---

## FASE 4 — LÓGICA AVANZADA: PETICIONES INTELIGENTES Y BACKEND LIGERO

### 4.1 Peticiones Inteligentes mediante TanStack Query

Queda estrictamente prohibido abusar de `useEffect` para el llamado de datos o inicialización de peticiones API. El estándar del proyecto exige el uso de **TanStack Query (React Query)** para todos los llamados de red asíncronos.

* **Beneficios Obligatorios:** Aprovechar el almacenamiento en caché automático, políticas de reintento automático (retry) ante fallos de conexión, invalidación y sincronización de datos en segundo plano mediante mutaciones, estados declarativos de carga (`isLoading`, `isError`) y optimización del tráfico de red.

---

### 4.2 Control de Estado Global con Zustand

El estado de la aplicación debe ser limpio y ágil.
* **Uso Obligatorio:** Zustand para estados globales como la sesión del usuario (`authStore`), configuraciones de la interfaz (`uiStore`), o control de flujos específicos que cruzan múltiples rutas.
* **Prohibición:** No usar Redux innecesariamente debido a su sobrecarga de código repetitivo (boilerplate). Evitar el uso excesivo de Context API nativo de React, limitándolo únicamente para temas visuales estáticos (como cambio de tema de color claro/oscuro).

---

### 4.3 Estrategia de Backend compatible con Firebase Spark (Plan Gratuito)

Para minimizar los costes operativos del negocio de tus clientes y garantizar la viabilidad del proyecto, la arquitectura debe estar diseñada prioritariamente para funcionar correctamente en el plan gratuito **Firebase Spark**.

#### Directivas Técnicas Obligatorias:
* **No depender de Cloud Functions:** Las funciones de servidor de Firebase requieren la activación del plan de pago Blaze (para acceder a Cloud Build). Por ende, la aplicación debe procesar y resolver toda su lógica directamente desde el Frontend de manera segura.
* **Aprovechar Firestore Rules:** Toda la validación de seguridad de datos, restricciones de modificación y control de accesos debe recaer directamente en las **Reglas de Seguridad de Firestore (`firestore.rules`)** y validarse localmente mediante **Zod** antes del envío.
* **Suscripción en Tiempo Real (Listeners):** Utilizar `onSnapshot` de Firestore para escuchar de forma interactiva cambios en la base de datos y actualizar la UI inmediatamente, reduciendo la necesidad de peticiones repetitivas HTTP o lógica pesada de polling en el cliente.
* **Procesamiento Cliente Optimizado:** Cálculos numéricos y de analítica simples deben realizarse directamente en el navegador del usuario final, optimizando la UI para que la experiencia sea instantánea y no sature la base de datos de lecturas.

---

## FASE 5 — FIRESTORE PROFESIONAL: MODELADO Y SEGURIDAD

### 5.1 Reglas de Seguridad como Código

Queda estrictamente prohibido editar las reglas de base de datos directamente en la consola web de Firebase. 

* **Estándar:** Toda regla debe estar escrita localmente en el archivo **`firestore.rules`** de la raíz del proyecto.
* **Despliegue:** Las reglas se despliegan automáticamente al servidor de Firebase a través del comando CLI correspondiente, asegurando que todo cambio arquitectónico quede respaldado en el control de versiones (Git).

---

### 5.2 Modelado de Datos Orientado a UI

Firestore es una base de datos NoSQL donde la prioridad número uno es optimizar la velocidad de lectura y reducir los costes de consumo.

* **Regla de Oro:** **Guarda los datos tal y como los vas a leer en la pantalla.** 
* **Optimización:** Es preferible duplicar sutilmente algunos datos estáticos (desnormalización de datos) en lugar de realizar múltiples consultas cruzadas lentas y costosas a diferentes colecciones para armar una sola pantalla de la aplicación. Menos lecturas se traduce en mayor velocidad de carga y coste de $0 USD para tu cliente.

---

### 5.3 Gestión Profesional de Subcolecciones

Para mantener la base de datos escalable e impedir que los documentos de Firestore crezcan de forma descontrolada (excediendo el límite de 1MB por documento), es obligatorio usar **Subcolecciones** para almacenar datos de crecimiento ilimitado.

* **Es de uso obligatorio para:** Historiales de transacciones, registros de pagos, notificaciones del usuario, y logs o bitácoras del sistema.
* **Estructura jerárquica de ejemplo:**
  ```text
  usuarios/ (Colección raíz)
    └── {idUsuario}/ (Documento de usuario)
          └── pagos/ (Subcolección de pagos individuales del usuario)
  ```

---

### 5.4 Aprovechar Consultas Superficiales (Shallow Queries)

Se debe tener en cuenta que en Firestore las consultas son superficiales: al consultar un documento principal (ej. un usuario), Firestore **no descarga automáticamente las subcolecciones** del mismo (ej. su subcolección de pagos). 
* **Ventaja:** Esta propiedad física debe ser aprovechada al máximo para estructurar el modelo de datos de forma que la UI pueda consultar de forma ágil datos básicos ligeros sin consumir ancho de banda o lecturas de registros pesados o históricos que el usuario aún no ha solicitado ver.

---

### 5.5 Declaración y Despliegue de Índices Compuestos
Para cualquier aplicación del ecosistema que implemente consultas con múltiples filtros combinados o clasificaciones complejas que Firestore no pueda resolver por defecto:
* **Cero Configuración Manual:** Queda prohibido crear índices compuestos de forma manual directamente en la consola web de Firebase.
* **Modelo en JSON Local:** Los índices deben declararse y mantenerse sincronizados dentro del archivo `firestore.indexes.json` en la raíz del proyecto correspondiente.
* **Flujo de Auditoría de Código:** Antes de cada despliegue, es obligatorio auditar todos los archivos de lógica API (`src/services/` o hooks) para identificar llamadas que usen de manera concurrente múltiples filtros `where` u ordenamientos `orderBy`, agregando la estructura JSON correspondiente si el índice compuesto no existe localmente.
* **Despliegue proactivo:** La IA ejecutará de forma autónoma el comando `firebase deploy --only firestore:indexes -P [id-proyecto]` para propagar las configuraciones compuestas de forma masiva a la base de datos de producción.

---

## FASE 6 — ESTRATEGIA DE DESPLIEGUE Y COMPILACIÓN SEGURO

### 6.1 Compilación para Producción (Build)

Antes de realizar cualquier despliegue, es obligatorio generar la compilación de optimización en la carpeta local `dist/` a través de:
```bash
npm run build
```
* **Verificaciones Técnicas de Calidad (Pre-deployment Checklist):** El desarrollador debe validar que la compilación no arroje errores de empaquetado, que la UI sea responsiva mobile-first, que no se reporten fugas de memoria o errores en consola durante pruebas de navegación local, que se respete la accesibilidad y que se haya configurado el lazy loading de rutas.

---

### 6.2 Despliegue Oficial en Hosting

El despliegue de las aplicaciones terminadas se realizará única y exclusivamente a través de **Firebase Hosting**, utilizando el comando seguro optimizado para el stack de tu equipo.

---

## FASE 7 — PROTOCOLO ESTRICTO DE DESARROLLO E IA: REGLAS ANTI-PEREZA

Para que las aplicaciones construidas con Antigravity sean perfectas desde su nacimiento y no requieran soporte post-venta, la IA debe seguir con rigor este protocolo ético de programación:

### 7.1 Regla del Código 100% Completo (Cero Lazy Code)

Queda **absolutamente prohibido** que la IA actúe de manera perezosa y genere código incompleto, modifique archivos dejando comentarios evasivos o promesas vacías tales como:
* `// El resto de la lógica va aquí...`
* `// ... (código existente sin cambios) ...`
* `// TODO: Implementar después...`

**Directiva única:** Todo archivo que cree o edite la IA debe ser entregado en su estado **100% funcional y completo**, escribiendo de forma explícita cada función, variable, validación y enrutador. No se permiten parches temporales que obliguen al desarrollador a rellenar lógica manual posterior.

---

### 7.2 Un Paso de Desarrollo por Respuesta

Para evitar desbordamiento de contexto o introducciones de bugs accidentales:
* La IA trabajará de forma granular y atómica: **componente por componente, vista por vista.**
* No se debe intentar programar 3 páginas diferentes al mismo tiempo en una sola interacción. Se completa una pieza de forma perfecta, se valida su ejecución y luego se procede con la siguiente.

---

### 7.3 Mock Data Primero (Simulación de Datos)

Antes de integrar bases de datos de Firebase reales:
* La UI debe ser maquetada y probada utilizando **datos simulados (Mock Data)** realistas.
* Esto permite validar la robustez estética del diseño, los comportamientos de overflow, los estados vacíos y la interactividad en el navegador antes de forzar escrituras de registros en la base de datos de desarrollo.

---

### 7.4 Control Obligatorio de Errores (Error Handling)

Toda función asíncrona, interacción con bases de datos o parseo de variables complejas debe estar encapsulado en bloques **`try / catch`**.
* **Integración con la UI:** Los errores capturados por el bloque `catch` no deben morir silenciosamente en la consola (`console.error`). Deben ser notificados sutilmente en la interfaz del usuario final a través de componentes de alertas, banners o notificaciones contextuales para que el usuario sepa qué falló y cómo reintentarlo de forma clara.

---

## FASE 8 — SEGURIDAD, ACCESIBILIDAD (A11Y) Y DOCUMENTACIÓN TÉCNICA

### 8.1 Seguridad de Entorno (.env.local)

* **Uso Obligatorio de Variables de Entorno:** Es obligatorio mantener todas las llaves de Firebase, dominios de autenticación y tokens de APIs de terceros en el archivo **`.env.local`**.
* **Prohibiciones:** Queda estrictamente prohibido exponer credenciales de Firebase en el código del repositorio o "hardcodear" llaves de seguridad directamente en componentes o servicios que se suben al control de versiones Git.

---

### 8.2 Estándar de Accesibilidad Universal (A11Y)

Toda aplicación construida debe ser utilizable por cualquier persona. Se debe asegurar el cumplimiento de accesibilidad en la UI:
* Uso de atributos **`aria-label`** descriptivos en botones que contengan únicamente íconos vectoriales.
* Maquetación utilizando **HTML Semántico** (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<button>`) en lugar del uso excesivo e indiscriminado de etiquetas genéricas `<div>`.
* Asegurar un contraste de colores óptimo para la lectura bajo luz intensa del sol.
* Mantener la navegación por teclado activa y formularios completamente accesibles.

---

### 8.3 Documentación de Código Estándar JSDoc

Toda función, hook personalizado o utilidad compleja que sea de uso general del proyecto debe contar obligatoriamente con documentación JSDoc explicativa:
* **Estructura básica:** Utilizar `@param` para detallar las variables de entrada y su tipado, y `@returns` para explicar la estructura o el dato retornado por la función.

---

## FASE 9 — SEGURIDAD MULTIROL Y CONTROL DE ACCESOS (RBAC)

### 9.1 Control de Accesos Basado en Roles (RBAC)

* **Asignación de Roles:** Cada documento en la colección de `usuarios/` debe contener una propiedad obligatoria llamada **`rol`** (ejemplo de valores: `'admin'`, `'empleado'`, `'cliente'`).
* **Protección de Rutas (Frontend):** Las rutas de la aplicación deben estar validadas por enrutadores condicionales que bloqueen a los usuarios que no tengan el rol correspondiente.
* **Protección de Datos (Backend):** Las Reglas de Firestore deben auditar activamente el rol de quien realiza la petición antes de autorizar la lectura o escritura:
  ```javascript
  allow write: if request.auth.token.admin == true;
  ```

---

## FASE 10 — TIEMPO REAL Y RESILIENCIA: SNAPSHOT LISTENERS Y ZOD

### 10.1 Escucha Activa en Tiempo Real (Snapshot Listeners)

* **Recomendación:** Utilizar la función `onSnapshot` de Firestore para establecer canales en tiempo real en secciones donde los datos fluctúan constantemente (notificaciones, alertas de stock, chat de soporte).
* **Experiencia de Usuario:** La interfaz debe responder inmediatamente con microanimaciones, contadores dinámicos (badges de notificación) e indicadores visuales de actualización fluida de forma interactiva en la UI.

---

### 10.2 Validación y Blindaje de Datos con Zod

Para garantizar la estabilidad a largo plazo y que la aplicación nunca colapse por inconsistencias o tipos de datos corruptos provenientes de formularios o APIs:
* **Uso Obligatorio:** Validar los campos de entrada de todos los formularios de la aplicación y las respuestas de red críticas mediante esquemas de **Zod**.
* **Blindaje:** Esto previene la inyección de tipos incorrectos (ej. recibir un string cuando se esperaba un número en un cálculo contable) y mantiene la coherencia total de datos en Firestore.

---

### 10.3 Separación Física de Entornos (Environments)

Queda estrictamente prohibido desarrollar, probar o hacer maquetaciones en local conectados directamente a la base de datos de producción de tus clientes.
* **Estándar:** Se debe contar con entornos perfectamente separados (`development` y `production`), con variables de configuración aisladas en sus respectivos archivos `.env`.

---

### 10.4 Carga Perezosa (Lazy Loading) y Error Boundaries

* **Optimización de Rendimiento:** Cargar bajo demanda las diferentes páginas del enrutador de React utilizando `React.lazy()` y envolverlas en componentes `<Suspense>` para mantener el peso inicial del empaquetado al mínimo.
* **Resiliencia UI:** Envolver componentes críticos propensos a fallos imprevistos o con integraciones externas en componentes `<ErrorBoundary>` utilizando la biblioteca estándar `react-error-boundary` para mostrar pantallas amigables de recuperación en lugar de congelar o bloquear la visualización completa de la pantalla.

---

## FASE 11 — REGLAS DE INTERPRETACIÓN Y COMPORTAMIENTO ABSOLUTO PARA IA

La Inteligencia Artificial que participe en el desarrollo de la aplicación debe operar bajo estas pautas éticas y de comportamiento absoluto. **Cualquier desviación es inaceptable.**

### 11.1 Reglas de Interpretación
* **Interpretar ideas vagas:** Convertir requerimientos humanos imprecisos en arquitectura técnica profesional y limpia basada en este estándar.
* **No destruir código existente:** Al realizar una modificación, conservar intactas todas las funcionalidades y lógicas previas que no tengan relación con el cambio solicitado.
* **Mantener coherencia visual y de nombres:** Respetar de forma milimétrica las convenciones de estilo de Tailwind, las reglas de navegación dual, los espaciados, y las reglas de nomenclatura (PascalCase y camelCase).

---

### 11.2 Acciones Absolutamente Prohibidas

La IA **nunca** debe:
* Romper componentes funcionales existentes o inhabilitar lógicas de negocio previamente aprobadas.
* Duplicar lógica existente (en su lugar, debe refactorizar y modularizar en un Hook, Utilidad o Servicio).
* Crear archivos redundantes o CSS externos.
* Importar librerías pesadas o innecesarias sin consentimiento explícito.
* Generar bloques de código parciales o truncados (Regla del Código Completo).
* Ignorar los principios de Mobile First, Accesibilidad (A11Y), control de excepciones en UI, y estados de carga o error.

---

## FASE 12 — CONFIGURACIÓN DE PWAs Y ESTRATEGIA DE AUTO-ACTUALIZACIÓN INSTANTÁNEA

### 12.1 Estandarización del Control de Caché
Para evitar que los clientes finales o administradores visualicen código desactualizado, archivos corruptos del DOM o dependencias antiguas tras un despliegue en producción (lo que requería tradicionalmente borrar la caché del navegador o recargar la página múltiples veces), es mandatorio forzar la toma de control de los Service Workers.

### 12.2 Directivas Obligatorias de Workbox
Cualquier archivo de empaquetado de proyectos (`vite.config.js` o similar) debe definir explícitamente el tipo de registro de PWA como `autoUpdate` e inyectar las directivas del Service Worker dentro de Workbox:
* `skipWaiting: true`: Hace que el nuevo Service Worker pase de inmediato al estado activo, descartando al antiguo sin esperar a que el usuario cierre sus pestañas abiertas.
* `clientsClaim: true`: Permite que el Service Worker activo tome el control de todas las pestañas abiertas bajo su alcance de forma inmediata.
* `cleanupOutdatedCaches: true`: Elimina de forma automática y transparente las bases de datos de caché obsoletas de compilaciones anteriores.

### 12.3 Registro y Recarga Síncrona en el Frontend
El punto de entrada del frontend (`main.jsx` o su correspondiente inicializador) debe suscribirse a los eventos del Service Worker a través de `virtual:pwa-register`. Al capturar `onNeedRefresh`, se debe invocar el método de actualización asíncrono y, una vez resuelto, ejecutar una recarga síncrona de la ventana:
```javascript
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true).then(() => {
      window.location.reload()
    })
  }
})
```

---

## OBJETIVO FINAL

El fin supremo de este estándar es que cualquier Inteligencia Artificial comprenda especificaciones básicas y las transforme de manera autónoma, robusta y con criterio de alto nivel en **soluciones de software premium**, de escalabilidad infinita, de mantenimiento nulo y que cautiven al usuario final en rendimiento, estética y usabilidad táctil.
