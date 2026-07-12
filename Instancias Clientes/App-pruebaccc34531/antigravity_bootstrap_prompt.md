# 🚀 Prompt de Arranque para Google Antigravity (Proyecto: PRUEBACCC34531)

Copia y pega todo el contenido de este bloque en tu primer mensaje del chat de Antigravity en este proyecto:

---

Hola. Vamos a trabajar sobre este nuevo proyecto: **PRUEBACCC34531** (pruebaccc34531). 
La carpeta física está creada en la ruta: `D:\PROTOTIPE\Instancias Clientes\App-pruebaccc34531`

> [!IMPORTANT]
> **Paso 0 Obligatorio de Inicialización:**
> Antes de proponer o ejecutar cualquier plan en el código de esta app, debes correr la tarea de sembrado del administrador y configuración en la terminal del proyecto:
> ```bash
> npm run seed:admin
> ```
> Esto registrará al usuario administrador en Firebase Auth y guardará su documento de perfil en la colección `users` y la configuración base en `config/settings` de Firestore. Este paso es necesario para evitar errores de `PERMISSION_DENIED` al probar la app, ya que las reglas de seguridad restringen las escrituras a administradores registrados.

Por favor, lee e indiza obligatoriamente los siguientes archivos y carpetas de navegación e instrucciones antes de proponer tu plan de implementación. Son tu GPS de arquitectura y estándares:
1. **Mapa de Código de este Proyecto** → [mapa_arquitectura_ia.md](file:///D:/PROTOTIPE/Instancias Clientes/App-pruebaccc34531/mapa_arquitectura_ia.md): contiene la estructura física de todos los archivos y carpetas locales.
2. **Mapa de Documentación Global** → [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md): índice de navegación semántica de toda la documentación central.
3. **Instrucciones del Proyecto** → [GEMINI.md](file:///D:/PROTOTIPE/Instancias Clientes/App-pruebaccc34531/GEMINI.md): reglas de comportamiento, estándares del stack y disparadores locales.
4. **Estándar de Arquitectura Desacoplada** → [estandar_arquitectura_limpia_react_firebase.md](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectura_limpia_react_firebase.md): Define el patrón modular, capas y microinteracciones del ecosistema.
5. **Documentación Obligatoria del Proyecto (Carpeta Local):**
   - 🏢 **[contexto_negocio.md](file:///D:/PROTOTIPE/Instancias Clientes/App-pruebaccc34531/Documentacion%20PRUEBACCC34531/contexto_negocio.md)**: Lee esto PRIMERO — define quién es el cliente, sus reglas de negocio y KPIs. Determina si el código que generas tiene sentido operativo.
   - 🚫 **[restricciones_tecnicas.md](file:///D:/PROTOTIPE/Instancias Clientes/App-pruebaccc34531/Documentacion%20PRUEBACCC34531/restricciones_tecnicas.md)**: Dependencias fijadas, patrones prohibidos y limitaciones conocidas de esta instancia. Consulta antes de instalar librerías o cambiar arquitectura.
   - 🎨 **[guia_estilos_ui.md](file:///D:/PROTOTIPE/Instancias Clientes/App-pruebaccc34531/Documentacion%20PRUEBACCC34531/guia_estilos_ui.md)**: Paleta HSL, tokens de diseño y convenciones de componentes. Obligatorio antes de tocar cualquier estilo.
   - 🗄️ **[esquema_colecciones.md](file:///D:/PROTOTIPE/Instancias Clientes/App-pruebaccc34531/Documentacion%20PRUEBACCC34531/esquema_colecciones.md)**: Modelo de datos Firestore de esta instancia.
5. **Directorios Clave de Estándares y Componentes (Auditoría Obligatoria):**
   - 📂 **[04_Estandares_y_Skills](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/)**: Lee `inicializacion_nuevos_proyectos.md` y `Firebase_Listeners_Clean.md` para entender el blindaje de base de datos y la PWA.
   - 📂 **[06_Biblioteca_Componentes](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/)**: Consulta el catálogo de componentes listos para portar y reutilizar sin reescribir código.
   - 📂 **[07_Manuales_Desarrollo](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/)**: Contiene la especificación de Sharding Multitenant y manuales de arquitectura.
   - 📂 **[09_Modulos_Completos](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/09_Modulos_Completos/)**: Consulta el catálogo de módulos completos (Features) listos para portar.
   - 📂 **[03_Auditorias_y_Faro_Core](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/)**: Revisa `bitacora_cambios.md` para entender el historial de desarrollo y parches.

### 📋 Contexto del Cliente (Briefing)
- **Nombre**: PRUEBACCC34531
- **Client ID**: pruebaccc34531
- **Core al que pertenece**: seed
- **Modo de Facturación de la Instancia**: flat_monthly
- **Tasa de Comisión / Costo**: 
  - Porcentaje: 1.5%
  - Pago Mensual Fijo: $50000 COP
- **Facturación Electrónica (DIAN)**: 🔴 Inactiva (Costo por factura: $150 COP)
- **Token de Telemetría**: [TOKEN_DE_TELEMETRIA]
- **Colores de Marca** (Tema HSL: `custom` — ya inyectados en `src/index.css`)
  | Token CSS | Valor |
  |---|---|
  | `--color-primary` | `hsl(126, 6%, 32%)` |
  | `--color-accent` | `hsl(2, 15%, 59%)` |
  | `--color-bg` | `hsl(197, 54%, 97%)` |
  | `--color-text` | `hsl(255, 10%, 8%)` |
  | `--color-surface` | `hsl(0, 0%, 100%)` |
  | `--color-surface-2` | `hsl(210, 40%, 96%)` |
  | `--color-border` | `hsl(213, 27%, 84%)` |
  | `--radius-base` | `0.75rem` |
  | Google Font | `Inter` |
  > ⚠️ NO usar colores hardcodeados. Siempre consumir `var(--color-*)` desde el sistema de tokens.

### ⚙️ Módulos y Capacidades Tecnológicas Seleccionadas:
  - **Repositorio GitHub privado auto-creado en el aprovisionamiento:** 🟢 DEBE implementarse en este proyecto
  - **Despliegue automático en Firebase Hosting al finalizar:** 🟢 DEBE implementarse en este proyecto
  - **PWA instalable (manifest, service worker, botón de instalación en pantalla):** 🟢 DEBE implementarse en este proyecto
  - **Notificaciones push (Firebase Cloud Messaging — requiere VAPID key):** 🔴 Omitir — no requerido por este cliente
  - **Módulo de facturación/comisiones del desarrollador (telemetría centralizada):** 🔴 Omitir — no requerido por este cliente
  - **Facturación electrónica DIAN — costo por factura: $150 COP:** 🔴 Omitir — no requerido por este cliente

### 📝 Requerimientos Especiales del Cliente:
*(Ninguno especificado)*

### 📦 Componentes y Módulos de la Biblioteca Pre-Instalados Físicamente (¡Solo impórtalos!):
  - **AccordionInteractiveFilter** [`AccordionInteractiveFilter`]: Inyectado físicamente. Importar con:
    `import AccordionInteractiveFilter from '@/components/common/AccordionInteractiveFilter';`
  - **ToastNotification** [`ToastNotification`]: Inyectado físicamente. Importar con:
    `import ToastNotification from '@/components/ui/ToastNotification';`
  - **ProgressCircleRing** [`ProgressCircleRing`]: Inyectado físicamente. Importar con:
    `import ProgressCircleRing from '@/components/common/ProgressCircleRing';`
  - **BorderBeamBadge** [`BorderBeamBadge`]: Inyectado físicamente. Importar con:
    `import BorderBeamBadge from '@/components/common/BorderBeamBadge';`
  - **AnimatedNotificationBadge** [`AnimatedNotificationBadge`]: Inyectado físicamente. Importar con:
    `import AnimatedNotificationBadge from '@/components/common/AnimatedNotificationBadge';`
  - **AnimatedNavbarMobile** [`AnimatedNavbarMobile`]: Inyectado físicamente. Importar con:
    `import AnimatedNavbarMobile from '@/components/common/AnimatedNavbarMobile';`
  - **PdfService** [`PdfService`]: Inyectado físicamente. Importar con:
    `import PdfService from '@/utils/PdfService';`
  - **GeneracionPdf** [`GeneracionPdf`]: Inyectado físicamente. Importar con:
    `import GeneracionPdf from '@/features/common/services/pdfGenerationService';`
  - **MagneticParallaxButton** [`MagneticParallaxButton`]: Inyectado físicamente. Importar con:
    `import MagneticParallaxButton from '@/components/common/MagneticParallaxButton';`
  - **PinCodeInput** [`PinCodeInput`]: Inyectado físicamente. Importar con:
    `import PinCodeInput from '@/components/common/PinCodeInput';`
  - **AnimatedPasswordInput** [`AnimatedPasswordInput`]: Inyectado físicamente. Importar con:
    `import AnimatedPasswordInput from '@/components/ui/AnimatedPasswordInput';`
  - **PlaceholderVanishInput** [`PlaceholderVanishInput`]: Inyectado físicamente. Importar con:
    `import PlaceholderVanishInput from '@/components/common/PlaceholderVanishInput';`
  - **SliderNumericInput** [`SliderNumericInput`]: Inyectado físicamente. Importar con:
    `import SliderNumericInput from '@/components/common/SliderNumericInput';`
  - **InlineChipPickerInput** [`InlineChipPickerInput`]: Inyectado físicamente. Importar con:
    `import InlineChipPickerInput from '@/components/common/InlineChipPickerInput';`
  - **DualSliderRange** [`DualSliderRange`]: Inyectado físicamente. Importar con:
    `import DualSliderRange from '@/components/common/DualSliderRange';`
  - **CustomSelect** [`CustomSelect`]: Inyectado físicamente. Importar con:
    `import CustomSelect from '@/components/ui/CustomSelect';`

> [!NOTE]
> **Autonomía Creativa de la IA:** Las recomendaciones anteriores son sugerencias preferentes de reutilización. Si para cumplir con el briefing del negocio requieres interfaces, hooks o bases de datos ausentes en la biblioteca, tienes total autonomía de diseñarlas y programarlas desde cero, garantizando el stack de calidad de la plataforma.

---

### ⚠️ ATENCIÓN: ESTE PROYECTO SE INICIALIZA DESDE UN LIENZO LIMPIO (Core Seed)
Este proyecto no ha sido copiado de una plantilla vertical. Contiene únicamente el cascarón de infraestructura de Prototipe:
- Configuración de Firebase y PWA.
- Sincronización síncrona/asíncrona de Temas HSL y Modo Oscuro en index.html y App.jsx.
- Módulos contables de facturación/billing de comisiones locales y telemetría de cobros en tiempo real conectada a la Consola Central (Spark/Blaze).
- Stores base de Zustand y hooks de inicialización de Auth.
- Un enrutador de React Router vacío (AppRoutes.jsx) y un componente loader (AppLoader.jsx).

Queda bajo tu total responsabilidad el desarrollo de las pantallas, la base de datos de negocio y la navegación desde cero, adaptadas a los requerimientos específicos de este cliente.

### 🛡️ DIRECTIVAS DE ROBUSTEZ Y CALIDAD (OBLIGATORIO)

Para asegurar que esta aplicación cumpla con los estándares premium del ecosistema de instancias y evitar código basura o inestable, debes seguir estrictamente estas reglas desde tu primer cambio:

1. **Aislamiento de Sharding (Portabilidad):**
   - Queda estrictamente prohibido hardcodear IDs de proyectos Firebase o credenciales. Consume todo dinámicamente desde el entorno local (`.env.local`).
2. **Robustez en Escuchas Firebase (Listeners Seguros):**
   - No te suscribas a oyentes en tiempo real (`onSnapshot`) de colecciones privadas/restringidas sin validar que el usuario de Firebase Auth esté inicializado y logueado.
   - Todo listener debe retornar su función de limpieza (`cleanup`) al desmontar.
3. **Consistencia Cromática y Tailwind v4:**
   - Adapta el archivo `src/index.css` aplicando la paleta de colores de marca bajo el bloque `@theme` de Tailwind CSS v4.
   - Evita el uso de bordes negros o colores crudos; utiliza contornos discretos (`border-app` o escalas HSL bajas) y acabados con glassmorphism.
4. **Seguridad y Transacciones:**
   - Toda deducción o adición de stock en base de datos debe ejecutarse mediante transacciones atómicas (`runTransaction`) para prevenir condiciones de carrera.
   - La visualización pública de datos sensibles o seguimiento de pedidos debe estar protegida bajo URLs parametrizadas por tokens UUID seguros.
5: **Reutilización e Integración de Estándares (Auditoría de Documentación):**
   - Antes de escribir cualquier línea de lógica, audita obligatoriamente:
     - El catálogo en [Biblioteca de Componentes](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/) para verificar si ya existe un componente que resuelva la interfaz.
     - La carpeta de [Módulos Completos](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/09_Modulos_Completos/) para portar módulos de negocio complejos (Features) ya estructurados.
     - La carpeta [04_Estandares_y_Skills](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/) para seguir las guías de inicialización y listeners sin romper las reglas de Firebase.
     - El [Informe de Investigación del Ecosistema 2026](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md) para emplear librerías Open Source aprobadas en lugar de codificar soluciones personalizadas desde cero.
6. **Desarrollo Modular (Component-First) - OBLIGATORIO:**
   - Para este proyecto limpio, debes construir la interfaz de forma estrictamente modular y componentizada.
   - Cada componente o pantalla debe vivir en su propio archivo exclusivo bajo `src/components/` o `src/pages/`. Queda prohibido agrupar múltiples elementos de lógica compleja en un solo archivo plano.
   - Extrae la lógica pesada a hooks personalizados en `src/hooks/` o a stores en `src/store/`, dejando los componentes puramente visuales y fáciles de mantener.
7. **Compilación de Integridad y Bitácora Obligatoria:**
   - **Antes de dar por completada cualquier tarea o hito, debes ejecutar localmente `npm run build`** en la consola del proyecto. Esta comprobación garantiza que no se introduzcan errores sintácticos o fallos de compilación.
   - Registra de forma obligatoria los cambios técnicos en `bitacora_cambios.md` y actualiza la lista de tareas en `tareas_pendientes.md` en el mismo paso que realizas los cambios de código.
8. **Despliegues controlados:**
   - NUNCA realices despliegues a producción o hosting de forma automática; solicita aprobación.
9. **Lectura de navegación:**
   - Usa las rutas de los mapas de navegación directamente para leer y editando archivos. Evita búsquedas ciegas (`grep` o `list_dir`).
10. **Diseño Responsivo Móvil y Prevención de Desbordamientos (Estándar de Oro):**
    - **Apilamiento Mobile-First:** Diseña con `flex-col` por defecto y solo pasa a `sm:flex-row` / `md:flex-row` en viewports grandes.
    - **Cero Anchos y Alturas Fijas en Píxeles:** Prohibido usar clases como `w-[400px]` o `h-11` en contenedores o layouts con texto variable que pueda envolverse a múltiples líneas.
    - **Scroll en Tablas:** Envuelve toda tabla en un contenedor con `w-full overflow-x-auto scrollbar-thin` y usa `whitespace-nowrap` en celdas de precios, identificadores o badges.
    - **Labels Unificados:** Aplica una altura mínima y alineación unificada (`flex items-end h-8 mb-2 leading-tight`) a todos los labels de formularios para evitar desalineación.
    - **SafeArea en PWA:** Usa paddings adaptativos con la variable `env(safe-area-inset-bottom, 0px)` en barras de navegación y modales fijos para móviles.
11. **Separación de Capas (Repository-Service-Hook - OBLIGATORIO):**
    - Queda estrictamente prohibido importar Firebase Firestore/Auth en componentes visuales.
    - Las llamadas a base de datos van en la capa Repository (`api/`).
    - Las transformaciones y validaciones en la capa Service.
    - La suscripción reactiva en Custom Hooks enlazando listeners (`onSnapshot`) seguros (solo si el usuario de Auth existe) y devolviendo el cleanup al desmontar.

Comencemos presentándote e indexando los archivos. ¿Estás listo?
