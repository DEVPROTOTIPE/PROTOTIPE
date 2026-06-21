# 🏗️ Arquitectura Oficial de la Plataforma PROTOTIPE 2.0

Este documento constituye la especificación arquitectónica definitiva y oficial de la plataforma **PROTOTIPE**, consolidando la visión del ecosistema, su flujo de aprovisionamiento, su diseño modular, y la estrategia de nichos, branding, monetización y roadmap.

---

## 1. Visión del Ecosistema

### ¿Qué es PROTOTIPE?
**PROTOTIPE** es una plataforma de desarrollo y aprovisionamiento acelerado de aplicaciones web a la medida (ventas, inventario, CRM y servicios) concebida bajo una filosofía híbrida: la velocidad de despliegue de un SaaS modular combinada con la flexibilidad de personalización extrema de un desarrollo a medida (marca blanca).

### ¿Qué problema resuelve?
* **Costos elevados de desarrollo a medida:** Reduce los tiempos de codificación inicial de semanas a minutos mediante automatización.
* **Rigidez de los SaaS tradicionales:** A diferencia de Shopify, Wix o plataformas similares, que imponen plantillas fijas y limitaciones de código cerradas, PROTOTIPE permite la inyección ilimitada de código personalizado directamente sobre la instancia del cliente.
* **Complejidad operativa multi-tenant:** Facilita la telemetría, facturación y control unificado de múltiples clientes independientes sin necesidad de entrar individualmente en cada panel.

### Diferencia clave con un SaaS tradicional
Un SaaS tradicional funciona como un entorno multi-tenant puro (mismo código, misma base de datos compartida y particionada por ID). PROTOTIPE implementa una arquitectura de **Sharding Multitenant Híbrido**: cada cliente recibe una instancia de base de datos Firebase aislada y un código físico copiado de forma independiente en disco. Esto permite refactorizaciones personalizadas y adaptaciones atípicas para clientes prémium sin poner en riesgo la estabilidad del ecosistema global.

### "Marca Blanca a la Medida"
Significa que el sistema visual no posee logotipos, textos fijos ni marcas de agua de PROTOTIPE en el lado del cliente o vendedor. Todo se adapta dinámicamente utilizando variables HSL inyectadas en tiempo de ejecución, SEO customizado y assets dinámicos provistos desde una colección de configuración inicial.

---

## 2. Arquitectura General

El ecosistema se distribuye en 7 pilares fundamentales:

```
                  ┌─────────────────────────────────────┐
                  │          Dev Dashboard              │
                  │ (Consola central del desarrollador) │
                  └──────────────────┬──────────────────┘
                                     │ HTTP (localhost:3001)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │           Prototipe CLI             │
                  │   (Bridge API HTTP / generator)     │
                  └──────────────────┬──────────────────┘
                                     │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Plantillas    │         │Firebase Cliente │         │Firebase Central │
│(Ventas o Seed)  │         │ (Datos aislados)│         │(Comisiones/CRM) │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

* **Dev Dashboard**: Consola web independiente (Proyecto aislado en `/dev-dashboard/`) conectada al Firebase Central. Permite auditar comisiones, CRM de clientes, telemetría y visualizar el catálogo dinámico de componentes y sandboxes interactivos.
* **Prototipe CLI**: Bridge API en Node.js (`cli.js`, `server.js` y `generator.js`). Funciona como motor de aprovisionamiento físico que orquesta la generación de nuevos proyectos e interactúa con herramientas de sistema (Firebase CLI, GitHub CLI, npm).
* **Plantillas**: Esqueletos base de aplicaciones web optimizadas.
  * `template-ventas`: Catalogo responsivo, POS, checkout y fidelización pre-integrados.
  * `template-core-seed`: Plantilla limpia component-first para desarrollo libre desde cero.
* **Firebase Cliente**: Base de datos (Firestore, Auth, Storage y Messaging) exclusiva y dedicada para cada cliente.
* **Firebase Central**: Base de datos centralizada (`prototipe-saas-control`) donde se consolidan los tokens de activación, estadísticas de facturación, telemetría de Spark/Blaze y cobros acumulados.
* **Telemetría**: Flujo asíncrono e imperceptible de sincronización contable. Mide transacciones, métodos de pago, facturas DIAN y volumen comercial de los shards de clientes, transmitiendo a Firestore Central sin penalizar la latencia del usuario final.
* **Biblioteca de Componentes**: Catálogo de módulos portables, agnósticos (marca blanca) y documentados exhaustivamente con código completo libre de placeholders, organizados con diseño atómico bajo variables HSL de Tailwind.

### Flujo Completo de Aprovisionamiento (11 Pasos del CLI)
1. **Creación en Firebase Console:** Se crea un proyecto vacío en la nube (prerrequisito manual).
2. **Copiado de Plantilla:** El CLI copia la carpeta semilla (`template-ventas` o `template-core-seed`) a la ruta destino asignada en disco.
3. **Cálculo de Variables HSL:** Configuración de la paleta de colores de marca del cliente.
4. **Generación VAPID:** Creación automática de llaves criptográficas VAPID para notificaciones push.
5. **Configuración de Variables de Entorno:** Creación de `.env.local` con las variables de Firebase local del cliente y del Firebase Central.
6. **Vinculación Firebase CLI:** Generación de `.firebaserc` asignando el ID de proyecto Firebase del cliente.
7. **Service Worker e Index:** Inyección de credenciales en `firebase-messaging-sw.js`, metadatos SEO en `index.html` y generación del logo/favicon SVG a partir de iniciales.
8. **Inyección de Estándares de IA:** Copiado automático del archivo maestro de directivas `GEMINI.md` al nuevo proyecto.
9. **Preparación de Scripts y Mapas:** Configuración de scripts de build en `package.json` para auto-generar mapas de código de IA en compilación.
10. **Generación de Bootstrap Prompt:** Creación de `antigravity_bootstrap_prompt.md` que contiene el contexto inicial optimizado para el chatbot de IA.
11. **Instalación de Dependencias:** Ejecución de `npm install` y ejecución de `npm run map` para generar el mapa semántico inicial.
12. **GitHub y Firebase (Opcionales):** Inicialización de git, creación del repositorio privado en GitHub y despliegue automático de reglas de seguridad Firestore e índices compuestos en la nube del cliente.

---

## 3. Definición del CORE

El núcleo obligatorio (Mandatory Core) que debe residir en toda aplicación del ecosistema para asegurar conectividad, monetización y estabilidad:

| Módulo | Responsabilidad | Dependencias | Razón por la que es Core |
| :--- | :--- | :--- | :--- |
| **Facturación Comisional** | Muestra el balance y registro de cobros mensuales del desarrollador, habilitando firma táctil digital y descarga de recibos PDF. | React, Canvas | Permite auditar e informar al cliente el estado de sus deudas comerciales directamente desde su propio panel de ajustes. |
| **Telemetría Centralizada** | Reporta de forma asíncrona datos de facturación consolidada, uso de almacenamiento y estadísticas de rendimiento a Firestore Central. | Firebase Client SDK | Asegura el control de licencias, monitoreo de Spark/Blaze y cálculo de cobros sin bloquear los hilos principales de la UI. |
| **ThemeManager (Sistema de Temas)** | Inyecta las variables HSL correspondientes al tema corporativo activo y gestiona el switch reactivo de modo claro/oscuro. | CSS Variables | Garantiza la personalización de marca blanca instantánea sin necesidad de recompilar código estático. |
| **useFirestoreCollection** | Hook de sincronización y subscripción a colecciones con caché offline y optimización de listeners de Firebase. | Firebase SDK, LocalStorage | Previene lecturas duplicadas e innecesarias (ahorro de costos en Firebase) y asegura operatividad offline temporal en el POS. |
| **AlertConfirmContext** | Reemplaza los diálogos de `alert()` y `confirm()` nativos del navegador por modales HSL premium del tema. | React Context, ModalTemplate | Mantiene la coherencia visual prémium de marca blanca del ecosistema e impide la interrupción tosca del flujo de usuario. |
| **ErrorBoundaryFallback** | Captura excepciones runtime de React, evita pantallas en blanco y provee un flujo elegante de reintento/restauración de estado. | React Component | Aumenta la robustez de la aplicación ante errores imprevistos en producción. |

---

## 4. Definición de Módulos Opcionales

Clasificación de los componentes catalogados de la biblioteca en base a su propósito comercial:

### Ecommerce
* `compra_rapida_qr.md`: Vista pública de productos parametrados desde QR.
* `stock_heatmap.md`: Chips de semáforo HSL para abundancia/escasez de stock.
* `carrito_completo.md` / `cart_drawer.md`: Sistema de carrito reactivo con Zustand.
* `variant_selector.md`: Panel de selección de tallas, colores y combinaciones de productos.
* `quantity_selector.md`: Control táctil de cantidades de compra con topes lógicos.
* `checkout_modal.md`: Modal multipaso wizard para formalizar la transacción.
* `tarjeta_producto.md` / `rejilla_catalogo.md`: Layouts de catálogo premium de productos.

### Reservas
* `selector_reservas_agenda.md`: Calendario semanal y cuadrícula de asignación de turnos.

### Fidelización
* `ruleta_fortuna_premios.md`: Ruleta animada con física de inercia e inyección de cupones.
* `interactive_coupon_badge.md`: Sistema y validador visual de cupones de descuento.
* `guided_toast.md`: Notificaciones inteligentes en base a la experiencia de compra.

### Domicilios
* `gestion_domicilios.md`: Asignación de repartidores, cálculo de rutas e incidencias.
* `mapa_interactivo.md` / `mapa_desplegable.md`: Visualizadores Leaflet/OpenStreetMap.

### Marketing
* `catalog_banner.md`: Carrusel de anuncios temporales vigentes del catálogo.
* `developer_promo_card.md`: Banner publicitario del desarrollador inyectado en el panel.

### Analítica
* `qrAnalytics`: Telemetría contable y conteo de escaneos de códigos QR.
* `trackingAnalytics`: Embudo de conversión en la vista de tracking de pedidos.

### Inteligencia Artificial (IA)
* `analisis_viabilidad_ia.md`: Algoritmos para auto-describir imágenes con Vertex AI (Gemini).

### Otros (Utilidades UI / Modales / Soporte)
* `modal_template.md` / `modal_confirmacion.md`: Modales con portales e inhabilitación de scroll.
* `bento_grid.md`: Cuadrícula asimétrica premium para dashboards de analíticas.
* `marquesina_marcas.md`: Marquesina infinita para social proof.
* `tarjeta_3d_holografica.md` / `mazo_tarjetas_deslizables.md`: Animaciones premium e interacciones 3D.
* `fondo_luces_organicas.md` / `cursor_personalizado.md`: Visual candy de alto impacto para entradas.
* `use_inactivity_timer.md`: Cierre de sesión automático por inactividad de pantalla.
* `caja_diaria_pos.md`: Cuadrícula responsiva de arqueo de caja con firmas táctiles.
* `pdf_service.md` / `generacion_pdf.md`: Exportadores jsPDF vectoriales A4.
* `otp_input_field.md`: Entradas de PIN de seguridad con salto de foco inteligente.
* `command_palette_kbar.md`: Buscador universal flotante de comandos rápidos.

---

## 5. Arquitectura de Nichos

La verticalización de PROTOTIPE para industrias fuera del retail textil (como talleres de servicio, consultorios, veterinarias o manufactura) se resuelve sin tocar el código fuente principal de las plantillas gracias a tres capas de configuración en caliente:

```
                ┌──────────────────────────────┐
                │         niche.json           │
                │ (Configuración estructural)  │
                └───────────────┬──────────────┘
                                │
         ┌──────────────────────┴──────────────────────┐
         ▼                                             ▼
┌──────────────────────────────┐             ┌──────────────────────────────┐
│      Atributos Dinámicos     │             │        Feature Flags         │
│ (Campos técnicos inyectados) │             │ (Activación/Ocultación de UI)│
└──────────────────────────────┘             └──────────────────────────────┘
```

* **`niche.json`**: Contiene la definición de la vertical de negocio (ej: `servicio_tecnico`). Modifica el comportamiento de la UI de forma declarativa.
* **Atributos dinámicos**: Esquemas de propiedades de productos o servicios (ej: para taller automotriz: placa, modelo, kilometraje; para veterinaria: nombre mascota, especie). Se inyectan dinámicamente en formularios y listados, evitando campos fijos en base de datos.
* **Feature flags**: Variables de configuración reactiva (ej: `couponsEnabled`, `creditsEnabled`, `sizesAndColorsEnabled`). Si una bandera está desactivada, la UI y la lógica de negocio purgan físicamente los inputs, reportes, botones y métodos de pago correspondientes del flujo operacional.

---

## 6. Arquitectura de Branding

La personalización visual se automatiza durante el paso 7 del aprovisionamiento:

* **Tokens HSL**: En lugar de definir colores HEX estáticos, se inyectan variables en la hoja de estilos de Tailwind CSS (`var(--color-primary)`, `var(--color-primary-accent)`). Esto permite que cambie la tonalidad completa, los bordes de neón y los sombreados manipulando únicamente 3 variables en el root del DOM.
* **Tipografías**: Importación automatizada de fuentes de Google Fonts (ej: Inter, Outfit, Outfit Sans) según el briefing del cliente, inyectándolas en el CSS principal.
* **Logos y Favicon**: Si el cliente aporta assets, se reemplazan físicamente en el directorio público. En caso contrario, el CLI corre un generador gráfico que procesa las iniciales del nombre de marca y dibuja un logo SVG y favicon vectorizados coloreados con el HSL primario inyectado.
* **SEO**: Reemplazo recursivo de metadatos en `index.html` (`<meta name="description">`, `<title>`, etiquetas OpenGraph y Twitter Cards) utilizando el JSON del briefing de preventa del desarrollador.

---

## 7. Arquitectura de Monetización

La telemetría contable consolida de forma segura el retorno financiero del desarrollador mediante 4 modalidades comisionales configuradas en `config/settings`:

1. **Comisión por ventas**: Porcentaje cobrado por cada pedido exitoso liquidado (ej: `1.5%` de la base imponible).
2. **Tarifa fija**: Cobro fijo por cada pedido procesado por el sistema.
3. **Tarifa mensual**: Suscripción de arrendamiento fijo recurrente de software.
4. **Facturación DIAN**: Tarifa de amortización por procesamiento y timbrado de cada documento de facturación electrónica (ej: `$150` COP por factura emitida).

### Flujo de Telemetría Contable
```
[ Pedido Completado ]
        │
        ▼
[ billingService.js ]  ───▶  Calcula tasa comisional y DIAN
        │
        ▼
[ telemetryService.js] ───▶  Genera payload de telemetría
        │
        ▼
[ Firestore Central ]  ───▶  Escribe en /clientes_saas/{id}/telemetria
                             y actualiza el saldo de la deuda en caliente
```
* **Aislamiento**: Todo el flujo ocurre en segundo plano de manera asíncrona. Si el envío a Firestore Central falla, se almacena de forma persistente en caché local para su retransmisión diferida en el siguiente arranque del sistema.

---

## 8. Roadmap Oficial PROTOTIPE 2.0

```
┌──────────────────────────┐     ┌──────────────────────────┐     ┌──────────────────────────┐
│ Fase 1: Org. Documental  │ ──▶ │   Fase 2: Arquitectura   │ ──▶ │Fase 3: Herr. Escalabilidad│
└──────────────────────────┘     └──────────────────────────┘     └──────────────────────────┘
                                                                                │
                                                                                ▼
┌──────────────────────────┐     ┌──────────────────────────┐     ┌──────────────────────────┐
│ Fase 5: Escalamiento Com.│ ◀── │   Fase 4: Automatización │ ◀── │                          │
└──────────────────────────┘     └──────────────────────────┘     └──────────────────────────┘
```

### 📅 Fase 1: Organización Documental (Completado)
* Estandarización de carpetas de documentación.
* Purga de manuales obsoletos y clasificación de dificultad técnica.
* Creación del mapa semántico unificado para IAs (`mapa_documentacion_ia.md`).

### 📅 Fase 2: Arquitectura (Completado)
* Diseño del Sharding Multitenant Híbrido.
* Elaboración del estándar de seguridad Firestore rules para SaaS.
* Catalogación física de los 88 componentes y utilidades reutilizables.
* Creación del Inventario Maestro unificado.

### 📅 Fase 3: Herramientas de Escalabilidad (En Progreso)
* Consolidación de ComponentSandbox en el Dev Dashboard para pruebas interactivas.
* Integración del CLI Bridge API (`server.js`) con el Dashboard de control del desarrollador.
* Pruebas de simulación e inyección HSL en caliente.

### 📅 Fase 4: Automatización con IA (Q3 2026)
* Optimización de la skill `component-creator` para la generación de código sin refactorizaciones manuales.
* Integración de Vertex AI para auto-escribir archivos de configuración de nichos (`niche.json`).
* Desarrollo del motor de auto-corrección de bugs en compilación.

### 📅 Fase 5: Escalamiento Comercial (Q4 2026)
* Lanzamiento de la campaña de onboarding de 50 marcas piloto.
* Integración de pasarelas de cobro automáticas para deudas comisionales.
* Automatización de facturación electrónica DIAN a través de API Bridge.

---

## 9. Riesgos Técnicos

* **Dependencias críticas de paquetes externos:** Versiones de `jspdf`, `framer-motion` y `leaflet` no alineadas en plantillas pueden romper el empaquetado final de Vite.
* **Riesgos de Firebase (Cuotas y Spark):** Un bucle infinito de renderizado de React en listeners `onSnapshot` sin cleanup puede superar la cuota diaria gratuita de Firestore Spark de un cliente en minutos.
* **Seguridad (List Leaks):** Fugas de datos en Firestore si no se auditan rigurosamente las reglas en base a límites de query (`request.query.limit`).
* **Escalabilidad de Shards:** Dificultad para propagar parches críticos de seguridad a 100+ repositorios de clientes individuales de forma síncrona.
* **Documentación faltante:** Esquemas detallados de transacciones de caja de la colección `wholesaleOrders` aún pendientes de diagramación y pruebas de estrés concurrentes.

---

## 10. Próximas Acciones Recomendadas (Checklist Priorizado)

- [ ] **1. Robustez de Sharding:** Desarrollar un script global para propagar de manera automatizada parches de seguridad de `firestore.rules` a todos los repositorios activos de clientes.
- [ ] **2. Pruebas de Carga en Telemetría:** Simular 10,000 peticiones simultáneas de telemetría de Spark/Blaze a la base de datos central para medir picos de consumo y prevenir denegaciones de servicio.
- [ ] **3. Desacoplamiento de WholesaleOrders:** Diseñar y documentar la ficha de componentes para la colección de compras mayoristas B2B, parametrizando los límites y el flujo comisional.
- [ ] **4. Control del Bundle Size:** Habilitar el plugin de análisis visual de bundle (`rollup-plugin-visualizer`) inyectado en el build de producción del CLI para restringir que los templates carguen dependencias redundantes.
- [ ] **5. Sanitización de Inputs:** Auditar e inyectar de forma sistemática el validador atómico `CurrencyInput` en todos los formularios de egresos e ingresos del POS para mitigar corrupciones de datos en Firestore.
