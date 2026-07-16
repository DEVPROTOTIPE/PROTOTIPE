# Estándares de UI/UX y Componentes del Dashboard Central

Este conjunto de reglas rige el desarrollo de interfaces y componentes dentro del proyecto **Dashboard Central** (`Central PROTOTIPE/dev-dashboard/`).

## 1. ESTÁNDAR DE TAGS Y FILTRABILIDAD DE BIBLIOTECA (OBLIGATORIO)

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

## 2. ESTÁNDAR DE LAYOUT — BIBLIOTECA DE COMPONENTES (DASHBOARD)

- Layout: **2 columnas** → Panel lateral (30%, `lg:col-span-4`) + Workspace detalle (70%, `lg:col-span-8`)
- Toggler de ampliación: El workspace puede expandirse a 100% (`xl:col-span-12`) ocultando el panel lateral
- Botones de filtrado: **Inline horizontal** (`flex-row`), NO en columna vertical. Altura reducida al mínimo.
- Nube de etiquetas: **Scroll horizontal** (`overflow-x-auto`) con `shrink-0` en cada tag. NO `flex-wrap`
- Búsqueda: Atajo de teclado `/` para enfocar el buscador global

---

## 3. ESTÁNDAR DE PLAYGROUNDS Y "STORYBOOK" (SANDBOX DE COMPONENTES)

- **Equivalencia de Storybook:** En el ecosistema PROTOTIPE, el Dashboard Central y sus Sandbox de Componentes aislados en `dev-dashboard` hacen la función de **Storybook**.
- **Creación de Sandbox de Componentes:** Todo componente visual interactivo debe contar con su archivo de sandbox en `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard\src\components\admin\sandboxes\[NombreComponente]Sandbox.jsx`.
- **Estructura Requerida del Sandbox:** Debe usar `<SandboxLayout>` exponiendo controles interactivos de tipo `toggle`, `select`, `text` o `number` para configurar visualmente las propiedades del componente.
- **Resolución en Caliente:** No intentes importar ni declarar el playground en `ComponentSandbox.jsx` de forma manual; el Dashboard Central escanea automáticamente la carpeta usando `import.meta.glob`.
- **Componentes No Simulables:** Los servicios sin UI o hooks de Firebase se declaran en `COMPONENT_META` de `ComponentSandbox.jsx` con una nota aclaratoria detallada de su funcionamiento.

---

## 4. ESTÁNDAR DE MODULARIZACIÓN DEL DASHBOARD CENTRAL (`App.jsx`)

Para mantener la mantenibilidad y evitar regresiones en el archivo principal `App.jsx` (el cual excede las 11,000 líneas), se establece la siguiente regla obligatoria:

- **Prohibición de Código de Interfaz Ad-hoc:** Queda estrictamente prohibido inyectar bloques extensos de JSX, lógica de estado compleja o formularios directamente dentro de `App.jsx` para nuevas funcionalidades o pestañas.
- **Creación de Componentes Modulares:** Todo nuevo módulo, pestaña, panel de control o vista para mejorar el Dashboard Central debe crearse como un componente React independiente dentro de `src/components/admin/` o subcarpetas correspondientes.
- **Modificaciones Mínimas en App:** Los cambios en `App.jsx` se limitarán única y exclusivamente a:
  1. Registrar e importar el nuevo componente modular.
  2. Agregar la condición lógica en la navegación/enrutamiento (`activeTab === '...'`).
  3. Mapear estados compartidos estrictamente obligatorios, delegando el estado y efectos locales al componente hijo.

---

## 5. ESTÁNDAR DE CONTROLES VISUALES Y LISTAS DESPLEGABLES (DROPDOWNS)

- **Prohibición de selectores nativos:** Queda terminantemente prohibido utilizar el elemento `<select>` nativo de HTML en cualquier sandbox, módulo, vista o componente del Dashboard Central o plantillas.
- **Uso obligatorio de CustomSelect:** Se debe emplear de manera obligatoria el componente `CustomSelect.jsx` (ubicado en `src/components/ui/CustomSelect.jsx`), pasándole el array de opciones en formato `[{ value, label }]` y capturando los cambios mediante su propiedad `onChange(value)` (la cual devuelve el valor directamente, no un evento sintético de React).
