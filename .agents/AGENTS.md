# AGENTS.md — Reglas de Proyecto: PROTOTIPE

## PROHIBICIÓN ABSOLUTA DE RESTAURAR O DESCARTAR CAMBIOS FÍSICOS (CRÍTICO - OBLIGATORIO)

Queda estrictamente prohibido a la IA realizar cualquier tipo de restauración de archivos, descarte de cambios en el directorio de trabajo, o reversión de código (incluyendo de forma enunciativa pero no limitativa: `git restore`, `git checkout --`, `git reset --hard`, `git clean`) sin la confirmación explícita previa y por escrito del usuario. Esta regla es absoluta, de nivel general y aplica a cualquier comando local o interacción con repositorios remotos como GitHub.

## ESTÁNDAR DE TAGS Y FILTRABILIDAD DE BIBLIOTECA (OBLIGATORIO)

Todo componente o módulo registrado en la **Biblioteca de Componentes de PROTOTIPE** (`README.md` en `06_Biblioteca_Componentes/`) DEBE ser filtrable en el Dashboard Central. Para garantizarlo, se aplican las siguientes reglas:

### Regla 1: Todo componente DEBE tener al menos un tag funcional

La API Bridge (`Prototipe-CLI/server.js`) genera automáticamente los tags al leer el `README.md` mediante la función `buildTags()`. Esta función infiere los tags a partir del nombre, nombre técnico, descripción y categoría del componente.

**NINGÚN componente puede quedar con un array de tags vacío.** El tag de categoría siempre se garantiza como fallback.

### Regla 2: Los tags deben estar deduplicados

La función `buildTags` usa un `Set` internamente para garantizar unicidad. No se permiten tags duplicados en el array final.

### Regla 3: Al registrar un nuevo componente en el README, usar descripciones ricas en keywords

La descripción de cada componente en el `README.md` es la fuente primaria para la inferencia de tags. Deben incluir keywords funcionales que correspondan a los dominios y a las verticales de negocio de PROTOTIPE:

#### Dominios Técnicos (Categorías Funcionales de Componentes)

| Dominio | Keywords recomendadas en descripción |
|---|---|
| E-commerce | `carrito`, `producto`, `catálogo`, `tienda`, `shop` |
| POS/Caja | `pos`, `caja`, `scanner`, `código de barras`, `venta` |
| Pedidos | `pedido`, `order`, `tracking`, `seguimiento` |
| Facturación | `factura`, `comisión`, `invoice`, `billing` |
| Inventario | `inventario`, `stock`, `bodega`, `almacén` |
| Agenda | `agenda`, `reserva`, `cita`, `calendario`, `fecha` |
| Auth | `login`, `sesión`, `guard`, `perfil`, `usuario` |
| Firebase | `firebase`, `firestore`, `auth` |
| Hooks | `use`, `hook`, `custom hook` |
| Animaciones | `animación`, `framer`, `motion`, `tilt`, `glow` |
| Formularios | `form`, `input`, `selector`, `picker`, `otp`, `currency` |
| PWA | `pwa`, `install`, `offline`, `manifest` |
| Notificaciones | `toast`, `notifica`, `alert`, `sistema de notificaciones` |
| WhatsApp | `whatsapp`, `omnicanal`, `chat` |
| Domicilios | `domicilio`, `delivery`, `reparto`, `repartidor` |
| KDS Cocina | `cocina`, `kds`, `kitchen` |
| Gamificación | `ruleta`, `rifa`, `boleta`, `cupón`, `descuento`, `suerte` |

#### Verticales de Negocio Oficiales (Nichos de Clientes - `niches.json`)

Toda instancia de cliente en el ecosistema debe configurarse bajo una de las siguientes 23 verticales de negocio oficiales definidas en `niches.json`:

1. **🛍️ Ropa y Retail Tradicional (`retail_clothing`)**
2. **⚙️ Tornerías y Mecanizado de Precisión (`technical_services`)**
3. **❄️ Refrigeración y Climatización (`refrigeration_ac`)**
4. **📐 Contratistas y Construcción (`contractors`)**
5. **🚜 Alquiler de Maquinaria y Equipos (`machinery_rental`)**
6. **🪚 Carpinterías y Muebles (`carpentry`)**
7. **🧺 Lavanderías y Tintorerías (`laundry`)**
8. **🛋️ Restauración y Tapicería de Muebles (`furniture_repair`)**
9. **💆 Estética, Podología y Bienestar (`wellness_podology`)**
10. **🍎 Minimarkets y Alimentos (`grocery_food`)**
11. **🚜 Insumos y Repuestos Agrícolas (`insumos-agricolas`)**
12. **🎂 Alimentos Artesanales y Repostería (`alimentos-artesanales`)**
13. **🛠️ Ferretería y Construcción Rural (`ferreteria-rural`)**
14. **🏍️ Repuestos y Accesorios de Motos (`repuestos-motos`)**
15. **💅 Suministros de Belleza Profesional (`distribuidoras-beauty`)**
16. **🐶 Alimentos y Accesorios para Mascotas (`petshops-locales`)**
17. **⚙️ Repuestos de Electrodomésticos (`repuestos-lineablanca`)**
18. **👞 Calzado y Confección Local (`moda-local-calzado`)**
19. **🥗 Alimentación Orgánica y Saludable (`alimentacion-saludable`)**
20. **💻 Equipamiento Home Office (`home-office-ergonomia`)**
21. **🍹 Bodega de Licores y Coctelería (`licores-cocteleria`)**
22. **🧸 Artículos Geek y Coleccionismo (`coleccionismo-geek`)**
23. **📦 Insumos Horeca B2B (`distribucion-horeca`)**

### Regla 4: El buscador del Dashboard Central indexa nombres + descripción + categoría + tags

El filtrado textual en `ComponentLibraryView.jsx` busca en los campos: `name`, `technicalName`, `description`, `category` y `tags` concatenados. Un componente es filtrable si aparece en cualquiera de esos campos.

### Regla 5: Al añadir nuevos keywords de nicho al CLI, documentar aquí

Si se decteta un nuevo nicho comercial no cubierto por `buildTags`, se debe:
1. Añadir el bloque `if (text.includes(...)) tags.add('...')` en `server.js`
2. Agregar el caso en la tabla de la Regla 3 de este archivo
3. Registrar en `bitacora_cambios.md`

---

## ESTÁNDAR DE LAYOUT — BIBLIOTECA DE COMPONENTES (DASHBOARD)

- Layout: **2 columnas** → Panel lateral (30%, `lg:col-span-4`) + Workspace detalle (70%, `lg:col-span-8`)
- Toggler de ampliación: El workspace puede expandirse a 100% (`xl:col-span-12`) ocultando el panel lateral
- Botones de filtrado: **Inline horizontal** (`flex-row`), NO en columna vertical. Altura reducida al mínimo.
- Nube de etiquetas: **Scroll horizontal** (`overflow-x-auto`) con `shrink-0` en cada tag. NO `flex-wrap`
- Búsqueda: Atajo de teclado `/` para enfocar el buscador global

---

## ESTÁNDAR DE PLAYGROUNDS Y "STORYBOOK" (SANDBOX DE COMPONENTES)

- **Equivalencia de Storybook:** En el ecosistema PROTOTIPE, el Dashboard Central y sus Sandbox de Componentes aislados en `dev-dashboard` hacen la función de **Storybook**.
- **Creación de Sandbox de Componentes:** Todo componente visual interactivo debe contar con su archivo de sandbox en `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\[NombreComponente]Sandbox.jsx`.
- **Estructura Requerida del Sandbox:** Debe usar `<SandboxLayout>` exponiendo controles interactivos de tipo `toggle`, `select`, `text` o `number` para configurar visualmente las propiedades del componente.
- **Resolución en Caliente:** No intentes importar ni declarar el playground en `ComponentSandbox.jsx` de forma manual; el Dashboard Central escanea automáticamente la carpeta usando `import.meta.glob`.
- **Componentes No Simulables:** Los servicios sin UI o hooks de Firebase se declaran en `COMPONENT_META` de `ComponentSandbox.jsx` con una nota aclaratoria detallada de su funcionamiento.

---

## ESTÁNDAR DE MODULARIZACIÓN DEL DASHBOARD CENTRAL (`App.jsx`)

Para mantener la mantenibilidad y evitar regresiones en el archivo principal `App.jsx` (el cual excede las 11,000 líneas), se establece la siguiente regla obligatoria:

- **Prohibición de Código de Interfaz Ad-hoc:** Queda estrictamente prohibido inyectar bloques extensos de JSX, lógica de estado compleja o formularios directamente dentro de `App.jsx` para nuevas funcionalidades o pestañas.
- **Creación de Componentes Modulares:** Todo nuevo módulo, pestaña, panel de control o vista para mejorar el Dashboard Central debe crearse como un componente React independiente dentro de `src/components/admin/` o subcarpetas correspondientes.
- **Modificaciones Mínimas en App:** Los cambios en `App.jsx` se limitarán única y exclusivamente a:
  1. Registrar e importar el nuevo componente modular.
  2. Agregar la condición lógica en la navegación/enrutamiento (`activeTab === '...'`).
  3. Mapear estados compartidos estrictamente obligatorios, delegando el estado y efectos locales al componente hijo.

---

## ESTÁNDAR DE CONTROLES VISUALES Y LISTAS DESPLEGABLES (DROPDOWNS)

- **Prohibición de selectores nativos:** Queda terminantemente prohibido utilizar el elemento `<select>` nativo de HTML en cualquier sandbox, módulo, vista o componente del Dashboard Central o plantillas.
- **Uso obligatorio de CustomSelect:** Se debe emplear de manera obligatoria el componente `CustomSelect.jsx` (ubicado en `src/components/ui/CustomSelect.jsx`), pasándole el array de opciones en formato `[{ value, label }]` y capturando los cambios mediante su propiedad `onChange(value)` (la cual devuelve el valor directamente, no un evento sintético de React).

---

## ESTÁNDAR DE CONFIRMACIONES Y ACCIONES DE ELIMINACIÓN

- **Confirmación Obligatoria:** Ningún flujo que realice eliminación, limpieza o alteración irreversible de registros (como cancelar/eliminar citas, limpiar base de datos, purgar logs) puede ejecutarse de forma directa.
- **Uso obligatorio de useAlertConfirm:** Es obligatorio utilizar la ventana modal de confirmación promesificada de la plataforma mediante el hook `useAlertConfirm()` (de `src/components/common/AlertConfirmContext.jsx`) con `variant: 'error'` o `variant: 'warning'`, impidiendo la ejecución de la acción destructiva si el usuario no hace clic en el botón de confirmación correspondiente.

---

## PROHIBICIÓN DE COMPONENTES INVENTADOS Y DEPENDENCIAS HUÉRFANAS

- **Importaciones Válidas:** Queda estrictamente prohibido importar y utilizar componentes o utilidades imaginarias que no existan en el sistema o no estén declarados en `package.json` (ej: no usar clases o componentes de soporte ficticios como `TapShield` o wrappers ad-hoc externos no pre-aprobados).
- **Consistencia en Manifiestos:** Si un nuevo componente depende de otros recursos lógicos de la biblioteca o de utilidades del sistema, estas deben registrarse obligatoriamente en el array `internal` de la sección `dependencies` del manifiesto JSON (Frontmatter de metadatos del markdown `.md`), garantizando la trazabilidad durante la inyección.

---

## ESTÁNDAR DE targetPath EN MANIFIESTOS DE BIBLIOTECA

- **Prohibición de rutas Sandbox y Legacy:** Queda estrictamente prohibido que la propiedad `"targetPath"` del manifiesto JSON (comentario inicial `<!-- { ... } -->` en los markdown de la biblioteca) apunte a:
  - Directorios de Sandbox de Componentes o directorios de dev-dashboard (como `src/components/admin/sandboxes/...` o `dev-dashboard/...`).
  - Directorios legacy genéricos `src/hooks/*` o `src/services/*` para nueva lógica de negocio de features.
- **Rutas Canónicas por Tipo:** El `"targetPath"` debe definir la ubicación definitiva y limpia del componente en la base de código del cliente:
  - **Atom (`atom`):** Presentacionales puros -> `src/components/ui/[NombreTécnico].jsx`
  - **Component común (`component`):** Layouts o componentes reusables compartidos -> `src/components/common/[NombreTécnico].jsx`
  - **Feature UI (`feature`):** Acoplados a dominios de negocio -> `src/features/[featureName]/components/[NombreComponente].jsx`
  - **Repository Firebase (`repository`):** Lógica exclusiva de persistencia física -> `src/features/[featureName]/api/[featureName]Repository.js`
  - **Service / UseCase (`service`):** Lógica de negocio y validación -> `src/features/[featureName]/services/[featureName]Service.js`
  - **Hook UI State (`hook`):** Hooks que exponen estados reactivos de la feature -> `src/features/[featureName]/hooks/use[FeatureName].js`
  - **Entrypoint obligatorio:** Toda feature debe tener su API pública en `src/features/[featureName]/index.js`, desde donde se debe importar externamente de forma exclusiva.
- **Generación de Imports:** De esta ruta depende que la sentencia de "IMPORTACIÓN RECOMENDADA" en el Dashboard Central se indexe y muestre de manera limpia y correcta para el cliente final.

---

## ESTÁNDAR DE PREVENCIÓN DE CONFLICTOS CSS Y CONTRASTE EN MODO CLARO (LIGHT MODE)

1. **Evitación de Conflictos de Fondo (Color Swatches):**
   - El stylesheet global del Dashboard Central (`index.css`) aplica una regla con `!important` a cualquier `div` que contenga tanto la clase `rounded-2xl` (o `rounded-3xl`) como una clase de borde (`border`). Esto sobrescribe cualquier estilo inline de `backgroundColor` con un fondo blanco/glassmorphic.
   - **Solución Obligatoria:** Cuando implementes selectores/muestrarios de colores interactivos con fondos dinámicos definidos en `style={{ backgroundColor: ... }}`, **nunca** combines `rounded-2xl`/`rounded-3xl` con clases de borde en el mismo elemento, o fuerza el inline style usando `!important` (ej. `style={{ backgroundColor: \`${color} !important\` }}`).

2. **Garantía de Contraste de Texto en Botones de Marca:**
   - La regla global del Dashboard Central sobrescribe la clase `.text-white` a negro (`!important`) cuando se encuentra dentro de contenedores oscuros si no se emplean clases nativas de fondo específicas de Tailwind.
   - **Solución Obligatoria:** Al renderizar textos blancos sobre botones que usen variables HSL cromáticas como fondo (ej. `bg-[var(--color-primary)]`), utiliza siempre de forma explícita la clase `!text-white` para garantizar la legibilidad y evitar que el texto cambie a negro en Light Mode.

3. **Z-Index y Superposición en Steppers / Líneas de Tiempo:**
   - La línea de progreso absoluta nunca debe superponerse visualmente por encima de los iconos o números de los hitos/círculos de estado.
   - **Solución Obligatoria:** Aplica `relative z-10` y un fondo sólido `bg-[var(--color-surface)]` en todos los círculos/hitos para que actúen como máscara, y asigna `z-[-1]` o `z-[-10]` absoluto al elemento que dibuja la línea de progreso para obligarlo a renderizarse por debajo.

---

## ESTÁNDAR DE DISEÑO RESPONSIVO MÓVIL Y PREVENCIÓN DE DESBORDAMIENTOS

Para asegurar que todo componente sea perfectamente responsivo tanto en móvil (smartphones) como en PC, se deben seguir obligatoriamente estas reglas de maquetación:

1. **Apilamiento Vertical por Defecto (Mobile-First):**
   - Las filas de formularios, paneles de botones y barras de acciones deben estructurarse usando `flex flex-col` por defecto (móvil).
   - Solo se debe cambiar a diseño horizontal (`sm:flex-row` o `md:flex-row`) en pantallas medianas/grandes, y únicamente cuando los textos o inputs individuales no colisionen.

2. **Tabla Responsiva y Protección contra Saltos de Línea:**
   - Toda tabla (`<table>`) debe estar obligatoriamente envuelta en un contenedor con `w-full overflow-x-auto scrollbar-thin` para permitir el scroll horizontal en dispositivos móviles.
   - Aplica siempre la clase `whitespace-nowrap` en:
     - Cabeceras de tabla (`<th>`).
     - Fechas e identificadores (`L001`, `2026-07-02`).
     - Badges de estado (`span` de alertas, estados de pago).
     - Valores monetarios y cantidades (`45 und`, `$ 12.500`).

3. **Espaciados y Paddings Adaptativos:**
   - Evita el uso de paddings rígidos elevados en pantallas móviles. En su lugar, usa clases adaptativas (ej: `p-3 sm:p-5`, `gap-2 sm:gap-4`). Un padding estático de `p-6` en pantallas de 320px reduce a la mitad el área útil y causa desbordamiento de hijos.

4. **Tratamiento de Nombres y Textos Largos (Fuga de Caja):**
   - Cuando renderices nombres de productos, categorías u observaciones al lado de precios o botones en una misma fila, el texto debe estar envuelto en un contenedor con `min-w-0` y tener la clase `truncate` o `break-words` para evitar empujar los controles fuera de la pantalla.

5. **Prohibición de Anchos Rígidos en Píxeles:**
   - Queda estrictamente prohibido usar clases de ancho fijo en píxeles (como `w-[400px]` o `style={{ width: '400px' }}`) para tarjetas, formularios o modales. Usa siempre `w-full max-w-[ancho]` (ej: `w-full max-w-md`) para que se ajuste dinámicamente al viewport del móvil.

6. **Alineación Vertical de Labels en Grids:**
   - En grids horizontales con controles (`input` / `CustomSelect`), los `label` que los encabezan DEBEN tener una altura fija mínima unificada (`flex items-end h-8 mb-2 leading-tight`) para evitar desalineación cuando uno de los labels se envuelva en múltiples líneas.

7. **Espaciado Mínimo en Diseños con mt-auto:**
   - Si se usa `mt-auto` para empujar botones de acción al fondo de tarjetas flex, el contenedor padre DEBE declarar un `gap-3` o `gap-4` de seguridad para prevenir colapso de margen en pantallas pequeñas.

8. **Ocultamiento de Spinners en Campos Numéricos:**
   - En inputs de tipo `number`, se debe aplicar el reseteo `[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none` para evitar las flechas nativas invasivas y desalineadas del navegador.

9. **Prohibición de Alturas Rígidas con Texto Variable (Clamping de Altura):**
   - Queda estrictamente prohibido usar clases de altura fija exclusiva (como `h-10` o `h-11`) en botones, inputs, alertas o tarjetas que contengan texto variable susceptible de envolverse a múltiples líneas en viewports pequeños o columnas estrechas.
   - En su lugar, usa paddings verticales explícitos combinados con una altura mínima (ej: `py-2.5 px-4 min-h-[44px] h-auto` en vez de `h-11`) para que el contenedor crezca de forma segura si el texto se envuelve, protegiendo los márgenes internos y evitando colisiones de texto.

10. **Prohibición de Slate Fijo para Estados Deshabilitados (Evitación de Inversión de Contraste):**
    - Debido a la inversión semántica de la escala `slate` en Modo Claro (donde `slate-200` se vuelve oscuro y `slate-400` se vuelve claro/medio), queda estrictamente prohibido usar clases fijas como `bg-slate-200 text-slate-400` para estados deshabilitados (disabled).
    - En su lugar, usa variables semánticas de tema que respeten la luminosidad correcta en ambos modos. La combinación estándar de referencia para elementos deshabilitados (como botones y inputs) es:
      `bg-[var(--color-surface-3)] text-[var(--color-text-muted)]/50 border border-[var(--color-border)] cursor-not-allowed`
      Esto garantiza una perfecta visualización y contraste tanto en Modo Oscuro como en Modo Claro sin colisión de tonos.

11. **Tamaño Mínimo de Botones y Estados Interactivos (Touch Target WCAG):**
    - Todos los elementos interactivos o botones de acción deben tener un tamaño táctil mínimo de **44x44 CSS px** (WCAG 2.2). Si un icono mide `w-8 h-8`, se debe envolver en un botón de tamaño superior o agregar padding.
    - Se deben declarar explícitamente en Tailwind los 5 estados interactivos: Normal, `hover:opacity-90 transition-opacity`, `focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] focus:outline-none`, `active:scale-[0.98] transition-all`, y Loading (deshabilitar clic + spinner con aria-live).

12. **Jerarquía de Sombras y Elevación Tonal Semántica:**
    - *Light Mode:* Utiliza sombras multi-capa sutiles translúcidas: `shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]` (dropdowns/menús) y `shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]` (tarjetas).
    - *Dark Mode:* Queda prohibido el uso de sombras negras. Se debe aplicar la elevación tonal de Material Design 3 aclarando progresivamente los fondos de superficie: base (`bg-[var(--color-bg)]`) -> tarjetas (`bg-[var(--color-surface)]`) -> popovers (`bg-[var(--color-surface-2)]`) -> modales en primer plano (`bg-[var(--color-surface-3)]`).

13. **Resiliencia en Dropdowns y Prevención de Clipping:**
    - Todo dropdown customizado debe ser accesible vía teclado (Tab, flechas, Esc, Enter) y declarar roles ARIA (`role="listbox"`, `aria-expanded`).
    - Para evitar que los desplegables se corten visualmente en contenedores con `overflow-hidden` o `overflow-y-auto`, se deben renderizar usando **React Portals** (`createPortal`) al final del body o utilizando posicionamiento dinámico absoluto con ajuste automático (`placement: 'top'` si hay colisión inferior).
    - En viewports móviles (`sm` o inferior), los desplegables de más de 6 opciones se deben renderizar obligatoriamente como un **Bottom Sheet** deslizable.

14. **Usabilidad en Formularios y Disparadores Móviles (inputmode):**
    - Todo input interactivo debe estar enlazado explícitamente a un `label` visible utilizando `htmlFor` e `id` coincidentes (para ocultar visualmente usar `sr-only`). Queda prohibido delegar la descripción únicamente al `placeholder`.
    - Los inputs numéricos deben declarar obligatoriamente la propiedad `inputmode` para forzar el teclado óptimo en móviles: cantidades enteras -> `inputmode="numeric" pattern="[0-9]*"`, decimales/precios -> `inputmode="decimal"`.
    - En viewports móviles, se prefiere `<input type="date">` nativo para aprovechar las ruletas de fecha optimizadas del SO móvil, estilizando el indicador de calendario vía `-webkit-calendar-picker-indicator` con opacidades suaves.

---

## AUTOMATIZACIÓN OBLIGATORIA DEL PROTOCOLO DE INTEGRIDAD DE CÓDIGO (POST-CHANGE)

Para asegurar que todo cambio de código, inyección de componentes o portabilidad de módulos mantenga la estabilidad y consistencia al 100% de manera transparente para el usuario, se establece la siguiente directiva:

1. **Activación Transparente y Autónoma:** Siempre que la IA cree, edite, refactorice o porte cualquier archivo de código o componente en el ecosistema, **DEBE ejecutar inmediatamente y de manera 100% autónoma en segundo plano** el protocolo de integridad física y documental, sin necesidad de que el usuario lo solicite explícitamente ni escriba `@postchange`.
2. **Validación por Compilación local:** Se debe ejecutar la compilación de producción del proyecto en el cual se realizó la intervención:
   `cmd /c npm run build`
   Si el build genera advertencias, errores de linter o fallos de compilación, la IA los corregirá de forma proactiva en ese mismo turno antes de dar por completado el trabajo.
3. **Sincronización Documental Obligatoria:** En el mismo paso del cambio físico de código, la IA actualizará de forma obligatoria y proactiva antes de enviar su respuesta:
   - **`bitacora_cambios.md`**: Registrando el código de tarea y el impacto técnico.
   - **`mapa_aplicacion.md`**: Reflejando cualquier nueva ruta o reestructuración física.
   - **`tareas_pendientes.md`**: Marcando la tarea realizada como completada e identificando cualquier re-trabajo o revisión histórica. *Evitación de Drifts:* Si mueves, renombras o eliminas un archivo físico en el monorepo que previamente estaba declarado en la lista de archivos de cualquier tarea en `tareas_pendientes.md`, DEBES corregir, actualizar o remover inmediatamente la referencia a dicho archivo en la tarea correspondiente para prevenir advertencias de consistencia de disco (`FILE_NOT_FOUND`).
   - **`mapa_documentacion_ia.md`**: Registrando o actualizando el mapa semántico si se crearon, modificaron o archivaron documentos.
   - **OBLIGACIÓN ABSOLUTA DE CIERRE**: Queda estrictamente prohibido responder al usuario informando de la finalización de un cambio sin haber editado y guardado físicamente estos archivos de documentación en el disco y Git en ese mismo turno. Este paso no requiere confirmación del usuario y debe ejecutarse de forma automática.

---

## ESTÁNDAR DE IMPORTACIONES Y LINTER PREBUILD (React)

Para prevenir errores en tiempo de ejecución causados por variables no importadas u hooks huérfanos (como `ReferenceError: useMemo is not defined`), se establece la siguiente regla obligatoria:

1. **Validación Prebuild:** Toda nueva pantalla, componente o playground inyectado debe validarse obligatoriamente ejecutando `npm run build` en el entorno local del proyecto.
2. **Auto-Corrección Inmediata:** Si el build devuelve un error de linter o compilación de React, la IA debe analizar las variables importadas, inyectar los hooks omitidos (`useState`, `useEffect`, `useMemo`, `useCallback`, etc.), y corregir los fallos proactivamente en ese mismo turno antes de reportar la tarea como finalizada.

---

## ESTÁNDAR DE ARQUITECTURA DESACOPLADA Y RESILIENCIA FIREBASE (OBLIGATORIO)

Para garantizar la mantenibilidad y modularidad de las aplicaciones a largo plazo, se establece el siguiente estándar obligatorio de arquitectura desacoplada, gobernanza de concurrencia y resiliencia de datos:

### 22.1 Arquitectura de 3 Capas para Firebase (Feature-Sliced Design / Clean Architecture)
- **Repository:** Capa de infraestructura física. Contiene conectores exclusivos de Firebase SDK. Retorna promesas de JS o payloads planos. Queda estrictamente prohibido instanciar o invocar operaciones CRUD directas en componentes de React.
- **Service (UseCase):** Capa de dominio y lógica de negocio. Valida inputs con esquemas (Zod/JS), ejecuta orquestación y transformaciones.
- **Hook de Adaptación (UI State):** Capa reactiva que expone datos y acciones. Consume la capa de servicios e interactúa con el Registry de realtime.
- **Garantía de Contratos:** El dominio debe hablar en términos semánticos de entidades (ej: `Product`, `Order`, `BrandTheme`), no en términos de infraestructura Firebase (ej: no usar `DocumentSnapshot`, `QueryDocumentSnapshot`).

### 22.2 Gobernanza de Listeners en Tiempo Real (onSnapshot)
- **Evitación de Listeners Duplicados:** Se prohíbe abrir `onSnapshot` directamente dentro de múltiples hooks o componentes concurrentes. Se debe emplear un registry observable compartido (`RealtimeQueryRegistry` con queryHash, refCount y subscribers) para evitar cobros de lecturas Firestore redundantes.
- **Pre-requisito Auth con queryKey parametrizada:** Todo listener activo debe requerir de forma obligatoria sesión de Auth activa y su `queryKey`/`queryHash` debe parametrizarse obligatoriamente con el identificador del contexto (`uid`, `tenantId`, `brandId`, `role` y filtros de búsqueda) para mitigar fugas de datos y race conditions.
- **Idempotencia contra StrictMode:** Debido a los montajes dobles de React StrictMode en desarrollo, el desmonte del listener debe ser 100% idempotente basado en `refCount`, asegurando que no ocurra un `unsubscribe` prematuro si hay otros suscriptores activos.

### 22.3 Caché Local Offline, Zustand y TanStack Query
- **Activación de Persistencia Local:** Es obligatorio inicializar la persistencia offline en el cliente Firestore configurando `persistentLocalCache({ tabManager: persistentMultipleTabManager() })` para permitir transiciones sin conexión elásticas.
- **Zustand vs TanStack Query:**
  - **Zustand:** Exclusivo para estados UI/Locales (drawer abierto, modal, filtros activos, sesión derivada).
  - **TanStack Query (Persistido con IndexedDB):** Fuente primaria para hidratación, caché de red y listados. Úsenlo para hidratar las pantallas antes de que se conecte el listener realtime, evaluando la metadata del snapshot (`fromCache` y `hasPendingWrites`) para control de sincronización.
  - **Prohibición de localStorage para Persistencia:** Queda estrictamente prohibido usar localStorage para almacenar colas offline de operaciones (outbox), datos de auditoría local, telemetría o tablas transaccionales. Se debe utilizar exclusivamente Dexie.js / IndexedDB para asegurar transacciones atómicas de almacenamiento, evitar race conditions y soportar grandes volúmenes de datos.


### 22.4 Concurrencia y Transacciones Firestore
- Inventarios, saldos de crédito, contadores y cambios de estado de orden son considerados **documentos calientes**. Queda prohibido actualizarlos usando escrituras directas desde el cliente. Deben realizarse exclusivamente a través de transacciones concurrentes robustas (`runTransaction`) para mitigar fallas por concurrencia optimista (`ABORTED`).

### 22.5 Carga Progresiva Resiliente (Skeletons contra Layout Shift)
- Ninguna vista dinámica debe cargar datos asíncronos mostrando únicamente pantallas en blanco o spinners toscos que alteren la geometría del diseño al renderizar.
- Se deben emplear obligatoriamente componentes de tipo *Skeleton* con animación de shimmer lineal (`ProductCardSkeleton`, `OrderTrackingSkeleton`) que respeten las dimensiones exactas del componente real final.

### 22.6 API Pública Modular (Feature Gatekeeper) y Restricciones ESLint
- Cada feature expone sus entrypoints en un archivo `index.js`.
- Se prohíben las importaciones profundas desde otros módulos (ej. prohibido: `import X from '@/features/Y/components/Z'`).
- **Restricciones de Pre-commit (AST y Linter):**
  - Prohibir `<select>` nativos de HTML en favor de `CustomSelect.jsx`.
  - Prohibir onSnapshot/getDocs/setDoc/etc. fuera de la carpeta `/repositories`.
  - Prohibir clases dinámicas construidas (`className={bg-${color}-...}`) ya que Tailwind exige clases estáticas completas legibles en código fuente para ser empaquetadas.
  - Exigir `useAlertConfirm` en acciones destructivas.
  - Exigir queryKeyFactory tipada por feature.

---

## ESTÁNDAR DE DESIGN INTEGRITY GUARD (OBLIGATORIO)

Toda nueva clase, componente o layout inyectado o modificado en el ecosistema debe pasar la verificación del Design Integrity Guard a través del script `validate-core-integrity.js`.

### Prohibiciones Críticas (Causan fallo de validación / exit 1):
1. **Anchos fijos en píxeles en layouts/cards/grids**: Queda prohibido usar clases de ancho fijo como `w-[300px]` hasta `w-[999px]`. Usa `w-full`, `max-w-*`, `minmax()`, `clamp()` o container queries.
2. **Colores Hexadecimales Hardcodeados**: Queda prohibido el uso de valores hexadecimales hardcodeados (como `bg-[#ef4444]`, `text-[#333]`) en clases de Tailwind. Todo el color debe consumirse de los tokens HSL del tema: `var(--color-*)`.
3. **Sombras sucias/negras planas**: Queda prohibido usar clases de sombra negra por defecto como `shadow-black`, `shadow-black/*` o sombras duras arbitrarias con opacidad negra. Usa los tokens de sombras HSL suaves: `shadow-soft-sm`, `shadow-soft-md` y `shadow-soft-lg`.

### Advertencias y Sugerencias de Diseño (Warnings no bloqueantes):
1. **Colores Tailwind Estáticos**: Se desaconseja el uso de colores Tailwind estáticos (como `bg-red-500`, `text-blue-600`) fuera de los componentes de feedback autorizados (alerta, toast, badges). Utiliza variables del tema `var(--color-surface)`, `var(--color-on-surface)`, etc.
2. **Grids móviles unsafe**: Queda prohibido declarar `grid-cols-2` de forma directa en móvil sin breakpoint responsivo. Utiliza la utilidad responsiva `.grid-responsive-2` (que aplica `minmax(min(100%, 150px), 1fr)`) para evitar desbordamientos.

### Tipografías y Carga de Fuentes:
1. Las fuentes *Outfit* (para títulos) e *Inter* (para cuerpo) se cargan en el HTML central mediante preconnect y `display=swap`.
2. Las variables de tipografía a usar en Tailwind v4 son `var(--font-sans)` y `var(--font-display)`. Se define la utilidad `.font-display` para títulos.

---

## DISPARADOR OBLIGATORIO DE COLABORACIÓN IA (`@colaborar`)

1. **Activación:** Siempre que el usuario escriba la palabra **`@colaborar`** en su mensaje, la IA debe interrumpir cualquier cambio físico de código y preparar de inmediato el **Context Pack** estructurado.
2. **Formato:** El Context Pack debe encapsularse entre delimitadores claros (`===== BEGIN CONTEXT PACK [id] =====` y `===== END CONTEXT PACK [id] =====`) para que el usuario pueda copiarlo directamente al LLM externo (Claude, DeepSeek, GPT, Gemini).
3. **Filtro Crítico de Sugerencias:** Al recibir el feedback del LLM externo, la IA debe contrastarlo contra los archivos locales antes de codificar, documentando la clasificación de decisiones (Aceptada/Adaptada/Rechazada).

---

## PROTOCOLO DE TOMA DE DECISIONES DE COMPONENTES (HÍBRIDO - PROACTIVO)

Para mantener la biblioteca de componentes como un ecosistema en constante crecimiento y evitar redundancia o spaghetti code, la IA debe seguir estrictamente este flujo de decisión ante cada requerimiento de UI:

1. **Fase de Descubrimiento (Mapeo):**
   * Antes de codificar cualquier vista o formulario del cliente, la IA debe consultar de forma obligatoria el listado de `06_Biblioteca_Componentes` y el `mapa_aplicacion.md`.
   * Si el componente ya existe en el core, la IA ejecutará la inyección mediante la skill `portar-componente`.

2. **Fase de Programación de Deltas (Lineamientos AGENTS.md):**
   * Si no existe un componente base adecuado, la IA lo desarrollará localmente dentro del proyecto cliente en `src/components/common/` o en su feature correspondiente.
   * La programación debe acatar rigurosamente todas las restricciones críticas de la sección **`ESTÁNDAR DE DESIGN INTEGRITY GUARD`** (HSL semántico, sin píxeles rígidos, responsividad responsiva mobile-first, sin colores hardcodeados).

3. **Fase de Retorno al Core (Proactividad de Extracción):**
   * Al finalizar un delta personalizado, la IA debe evaluar con ojo clínico si el componente cumple con: (a) Lógica desacoplada de variables quemadas del cliente, (b) Utilidad potencial en al menos 2 verticales de las 23 oficiales del ecosistema.
   * Si cumple con estos criterios de reutilización, la IA **DEBE proponer de manera 100% autónoma y proactiva** su extracción en el cierre de su respuesta mediante el siguiente bloque descriptivo:
     ```markdown
     💡 [PROPUESTA DE EXTRACTOR]: He detectado que el componente '[NombreComponente]' es genérico e independiente del dominio. Te sugiero ejecutar la skill '@extraer-componente' en el siguiente turno para catalogarlo en la biblioteca y habilitar su inyección automática en el CLI.
     ```
   * Si el usuario confirma o escribe la palabra clave `@extraer-componente`, la IA activará de inmediato la skill correspondiente.


---

## PROTOCOLO OBLIGATORIO DE RASTREO DE TAREAS (CRÍTICO — INVIOLABLE)

Este protocolo se aplica a **TODO cambio de código o documentación** en el ecosistema PROTOTIPE, sin excepción. Aplica al CLI, al dashboard, a plantillas, a instancias de clientes, a documentación y a cualquier otro componente del proyecto.

### Paso 1 — ANTES de escribir código: Pre-registrar la tarea

Antes de modificar cualquier archivo, la IA DEBE:

1. Determinar el **dominio** del cambio según esta tabla:

| Prefijo | Dominio | Archivos principales |
|---|---|---|
| `CORE` | Cambios transversales, arquitectura, proceso global | Múltiples dominios simultáneos |
| `CLI` | API Bridge / Motor de Aprovisionamiento (server.js, generator.js, workers) | `d:\PROTOTIPE\Prototipe-CLI\` |
| `DASH` | Dashboard Central (components, views, hooks) | `d:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\` |
| `TPL` | Plantillas Core inyectables (template-ventas, template-core-seed) | `d:\PROTOTIPE\Prototipe-CLI\templates\` |
| `PLT` | Instancias de Clientes base (App Ventas, etc.) | `d:\PROTOTIPE\Plantillas Core\` |
| `INST` | Instancias de clientes específicas | `d:\PROTOTIPE\Instancias Clientes\` |
| `DOC` | Documentación exclusivamente (sin cambios de código) | `d:\PROTOTIPE\Documentacion PROTOTIPE\` |
| `LND` | Landing Page pública, embudos de venta y marketing | `d:\PROTOTIPE\Landing Page\`, `public/`, `marketing/` |
| `BIZ` | Estrategia de negocio, decisiones comerciales y de marca corporativa | `Documentacion PROTOTIPE/05_Estrategia_.../`, `08_Plan_.../` |

2. Llamar al endpoint `POST /api/roadmap/add` con `{ text: "descripción concisa", domain: "PREFIJO" }` para insertar la tarea en `tareas_pendientes.md` con estado `[ ] Pendiente` y el ID autoincrementado correspondiente.

3. Usar el ID generado (ej: `DASH-015`) en todos los registros de la sesión (bitácora, mapa, commits).

> **Si el CLI Bridge no está activo**, insertar manualmente el bloque de tarea al inicio de `tareas_pendientes.md` antes de continuar.

### Paso 2 — AL FINALIZAR el cambio: Cerrar la tarea

Una vez completado y verificado el cambio (build limpio, sin errores):

1. Llamar a `POST /api/roadmap/toggle` con el `lineIndex` de la tarea para marcarla como `[x] Completada` con tachado.
2. Actualizar el campo `Estatus` de la tarea a `Completado.` y añadir la `Fecha de finalización` si aplica.
3. Registrar en `bitacora_cambios.md` usando el mismo ID de tarea como encabezado.
4. Actualizar `mapa_aplicacion.md` si el cambio altera la estructura física o lógica.

### Paso 3 — Formato estándar del bloque de tarea

Todo bloque de tarea registrado en `tareas_pendientes.md` DEBE seguir este formato:

```markdown
* **[ ] Tarea PREFIJO-XXX: Título conciso del cambio**
  - Estatus: Pendiente.
  - Fecha: YYYY-MM-DD
  - Descripción: Resumen técnico de qué se va a implementar y por qué.
  - Archivos:
    - [`ruta/archivo.ext`](file:///ruta/completa) [MODIFY|NEW|DELETE]
```

Al completar:

```markdown
* **[x] ~~Tarea PREFIJO-XXX: Título conciso del cambio~~**
  - Estatus: Completado.
  - Fecha: YYYY-MM-DD
  - Descripción: Lo que se implementó, correcciones incluidas.
  - Archivos:
    - [`ruta/archivo.ext`](file:///ruta/completa) [MODIFY|NEW|DELETE]
```

### Penalización

Omitir la pre-creación de tarea antes de modificar código es una **violación crítica de consistencia** equivalente a omitir la actualización de bitácora. Se penaliza con la misma severidad que el estándar de documentación ya vigente.


---

## ESTÁNDAR DE SEGURIDAD Y GOBERNANZA DE FIREBASE (OBLIGATORIO)

Para garantizar la estabilidad presupuestaria (costo $0 USD) y la robustez transaccional de PROTOTIPE, todo agente IA debe obedecer estrictamente las siguientes directivas de seguridad, API y base de datos:

### 23.1 Prohibición Absoluta de Cloud Functions (DEC-006)
- **Directiva:** Queda estrictamente prohibido al agente proponer, codificar, inicializar o desplegar servicios basados en Firebase Cloud Functions en entornos de desarrollo, staging o producción.
- **Razón:** Toda lógica operativa debe resolverse del lado del cliente (React) o mediante el motor local del CLI Bridge. Los reportes de telemetría y cobros mensuales deben persistirse de forma directa a Firestore Central (`reportesBilling` y `app_failures`) a través de `centralFirebaseService.js`, apuntando localmente en modo desarrollo a `http://localhost:3001` únicamente para diagnósticos visuales.

### 23.2 Preflight Check y Control CORS en Storage (DEC-003 y DEC-005)
- **Storage Preflight Check:** Antes de inyectar o compilar componentes que requieran subida de imágenes o adjuntos (como selectores de productos, firmas digitales, mermas con fotos), la IA debe validar preventivamente la disponibilidad y permisos del bucket del cliente mediante peticiones HTTP HEAD silenciosas y seguras. Si el bucket no responde, se debe suspender la acción y notificar al usuario.
- **Configuración CORS Resiliente:** En scripts del CLI que configuren buckets, se debe automatizar la inyección CORS vía `gsutil` soportando tanto el bucket `.appspot.com` principal como el fallback `.firebasestorage.app`. El JSON exacto de la política CORS obligatoria que se debe inyectar es:
  ```json
  [
    {
      "origin": ["*"],
      "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
      "responseHeader": ["Content-Type", "Authorization", "x-goog-meta-filename", "x-goog-meta-uuid"],
      "maxAgeSeconds": 3600
    }
  ]
  ```

### 23.3 Restricción Estricta RBAC de Escrituras (Firestore y Storage)
- **Regla Firestore de Acceso Admin:** Todo flujo administrativo sensible (eliminar registros, purgar logs, modificar saldos base de clientes) debe exigir de forma mandatoria que el `uid` autenticado del usuario exista en el documento `/users/{uid}` con el atributo exacto `role: 'admin'`. No se permite confiar en parámetros o banderas booleanas del lado del cliente.
- **Regla Storage de Acceso Admin:** Se prohíbe el uso de políticas de Storage abiertas del tipo `allow write: if request.auth != null;` para directorios sensibles del sistema (ej: carpetas de configuración, logos de marca, recursos del core). La subida a estas ubicaciones requiere obligatoriamente verificar el rol admin mediante un cruce de reglas físicas Firestore (ej. `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'`).

### 23.4 Privacidad y Aislamiento Multitenant (clientes_control)
- **Directiva:** Queda terminantemente prohibido configurar reglas de Firestore Central abiertas del tipo `allow read: if true;` sobre colecciones multitenant críticas como `/clientes_control/`.
- **Implementación Física:** El acceso a la telemetría, facturación y esquemas de HSL de cada cliente se debe restringir a nivel de base de datos obligando a que la consulta valide de forma atómica:
  1. El ID del cliente (`clientId`).
  2. El token secreto del desarrollador (`telemetryToken`).
  Ninguna aplicación cliente debe poder listar transversalmente registros de otros inquilinos.

