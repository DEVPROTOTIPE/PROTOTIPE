# 📖 Manual Maestro de Aprovisionamiento de Clientes (Paso a Paso)

Este manual detalla de forma exhaustiva el flujo de trabajo completo para registrar, configurar, aprovisionar y levantar localmente un cliente en el ecosistema **PROTOTIPE**, utilizando el **Briefing Studio** y el **Asistente de Aprovisionamiento** de la Consola Central.

---

## 🛠️ Fase 1: Briefing Studio (Wizard de Descubrimiento de 20 Pasos)
El Wizard de Descubrimiento sirve para capturar la lógica operativa y comercial cualitativa del cliente. Ningún paso debe omitirse, ya que el motor de IA (`BiResolver`) usa este texto estructurado para mapear las capacidades técnicas exactas.

### 📋 Detalle de los 20 Pasos del Wizard:

1. **Información General:** 
   * Captura: *Nombre Comercial de la Empresa*, *NIT / Identificación Fiscal*, *Ciudad / Municipio*, y *Sitio Web / Redes*.
   * Propósito: Define la identidad legal y geográfica para facturación.
2. **Contacto Principal:**
   * Captura: *Representante Legal*, *Cargo*, *Canales de Contacto* (Email, Teléfono).
3. **Contexto Empresarial:**
   * Captura: *Historia de la empresa*, *Número de empleados* y *Número de sedes*.
4. **Modelo de Negocio:**
   * Captura: *Canales de venta* (Físico, online, mayorista) y *Estructura del catálogo*.
5. **Flujo Operativo:**
   * Captura: *Flujo de captación*, *Flujo de venta* y *Proceso de entrega físico/digital*.
6. **Usuarios y Roles:**
   * Captura: *Roles requeridos* (Administrador, cajero, repartidor, doctor) y *Volumen diario operativo*.
7. **Problemas y Dolores:**
   * Captura: *Fugas detectadas* (Descuadres de caja, robos hormiga de stock, cuellos de botella en tiempos).
8. **Impacto Económico:**
   * Captura: *Dinero perdido estimado* y *Horas perdidas al mes* por procesos manuales.
9. **Oportunidades:**
   * Captura: *Automatizaciones prioritarias* que el cliente desea ver en el software.
10. **Escalabilidad:**
    * Captura: *Planes de expansión* (Nuevas sucursales, franquicias, e-commerce internacional).
11. **Tecnología Actual:**
    * Captura: *Software actual* en uso (Excel, POS legacy, SAP) y *Pros / Contras* identificados.
12. **Reportes e Indicadores:**
    * Captura: *Métricas clave* necesarias (Margen de ganancias neto, comisiones por staff, rotación de inventario).
13. **Integraciones:**
    * Captura: *Servicios de terceros* requeridos (WhatsApp API, DIAN Facturación, Pasarelas de Pago como Wompi).
14. **Branding e Identidad:**
    * Captura: *Ruta de logotipos*, *Colores sugeridos* y *Tipografía corporativa*.
15. **Requerimientos:**
    * Captura: *Listado de obligatorios* (Must-Have) y *Deseables* (Nice-to-Have).
16. **Parametrización Core:**
    * Captura: *Configuración inicial del negocio* (Moneda, zonas horarias, impuestos base).
17. **Resumen del Analista:**
    * Captura: *Síntesis del dolor principal* y la *Solución recomendada* por el consultor.
18. **Diagnóstico Preliminar:**
    * Captura: *Complejidad estimada del proyecto* y *Madurez tecnológica* del cliente.
19. **Componentes Reutilizables:**
    * Captura: *Mapeo inicial manual* contra el catálogo de componentes existentes.
20. **Feature Flags:**
    * Captura: *Flags iniciales sugeridas* para pre-configurar o limitar el Core.

Al completar el Wizard, haz clic en **"Exportar a Notas del Briefing"** para precargar estos requerimientos lógicos en la memoria de aprovisionamiento del CLI.

---

## 🖥️ Fase 2: Asistente de Aprovisionamiento (Campos y Pestañas)
El asistente se divide en tres secciones críticas: **Servidor**, **Branding** y **Módulos**.

### 1. Pestaña: Servidor (Infraestructura y Datos de Instancia)
* **Nombre del Cliente:** El nombre comercial del negocio (Ej: `App Prueba`).
* **ID de Cliente (Auto-generado):** Slug en minúsculas y sin espacios (Ej: `app-prueba`). Se usa como nombre de subcarpeta y base de datos.
* **Modelo de Facturación:** Define cómo cobrará el SaaS (Comisión %, Pago Fijo, o Híbrido).
* **Tasa de Comisión (%):** Si aplica, porcentaje por cada venta procesada (Ej: `1.5`).
* **Costo de Setup Inicial ($ COP):** El costo cobrado por el despliegue técnico inicial.
* **Token de Telemetría (Auto-generado):** Clave segura única para sincronizar configuraciones offline y reportar logs del cliente a la Consola Central.
* **Ruta Física en Disco:** Ubicación donde se creará físicamente la base de código. Por defecto: `D:\PROTOTIPE\Instancias Clientes\seed\App-[clientId]`.
* **Email de Administrador Inicial:** Correo para la cuenta máster (Ej: `admin@app-prueba.com`).
* **Contraseña de Administrador:** Casilla para ingresar una contraseña o marcar "Autogenerar contraseña segura".
* **Puerto Local de Vite (Opcional):** Asigna un puerto libre de forma determinista para desarrollo local (Ej: `3161`).
* **Plantilla Base:** Selecciona la plantilla universal de origen (por defecto `template-core-seed` o una plantilla comercial como `template-ventas`).
* **Aprovisionar Firebase Automáticamente:**
  * **Habilitado:** El daemon creará el proyecto en Google Cloud, registrará la Web App, habilitará Firestore/Auth e inyectará las credenciales resultantes directamente en el archivo `.env.local` del cliente sin intervención manual.
  * **Deshabilitado:** Requiere que ingreses manualmente las variables API Key, Auth Domain, Project ID, Storage Bucket y App ID provistas por tu consola de Firebase.

### 2. Pestaña: Branding (Aesthetics, CSS Tokens & Layout)
* **Logo Corporativo de Marca:** Selector de archivos locales (PNG/SVG/JPG) o campo de ruta absoluta. El CLI lo escalará, creará el set de iconos de PWA y Favicon de forma automática.
* **WhatsApp del Negocio:** Número de teléfono internacional para enrutar pedidos (Ej: `573001234567`).
* **Dirección de la Sucursal:** Dirección física principal para recogida o despacho de pedidos.
* **Paleta Cromática (Primary, Secondary, Background, Text):** Colores de marca en Hex/HSL. El motor validará defensivamente el contraste antes de inyectarlos.
* **bgType (Fondo del Lienzo):**
  * *Sólido:* Color plano limpio.
  * *Malla Mesh / Aurora:* Degradados animados fluidos.
  * *Rejilla 3D:* Patrón reticular de estilo ciberpunk/tech.
  * *Partículas:* Canvas interactivo que reacciona al cursor.
* **Spotlight (Cursor Tracking):** Iluminación radial que persigue el cursor del usuario.
* **Curvas (Border Radius):** Define la propiedad `--radius-card` (`Sharp` = 0px, `Soft` = 8px, `Rounded` = 12px, `Extra` = 20px, `Pill` = 9999px).
* **Efectos Premium (Checkboxes):**
  * *Borde Láser XOR:* Línea animada RGB/Láser alrededor de las tarjetas al hacer hover.
  * *Efecto 3D Tilt:* Inclinación de tarjetas en base a la perspectiva del mouse.
  * *Vidrio Esmerilado (Frosted Glass):* Activa filtros de backdrop blur y opacidades.
* **Transiciones (Velocidad):** Define la propiedad `--motion-duration` (`0ms`, `150ms`, `250ms`, `400ms`).
* **Google Font Seleccionada:** Selecciona la tipografía para el sistema de diseño (Ej: `Inter`, `Outfit`, `Roboto`).

### 3. Pestaña: Módulos (Catálogo y Marketplace de Features)
* **Vertical de Negocio:** Nicho de mercado que define el contexto del cliente (ej: `retail_clothing`, `wellness_podology`, `grocery_food`).
* **Funcionalidades Core y Flags:** Casillas de verificación para inyectar features del core (ej: `sales`, `inventory`, `orders`, `billing`, `credits`, `delivery`).
* **Recomendaciones de Biblioteca:** Selección fina de componentes específicos (Atom, UI, Hooks, Services) para ser copiados de la Biblioteca Central.
* **Requerimientos Especiales (Briefing/Notas):** El texto cargado desde el Wizard que servirá para la inferencia inteligente.
* **SEO & Metadatos:**
  * *Meta Description:* Resumen que leerán los motores de búsqueda en Google.
  * *Keywords SEO:* Listado de palabras clave separadas por comas.

---

## 🚦 Fase 3: Lógica y Bifurcación del Generador (Estrategias de Copiado)
Cuando se inicia el aprovisionamiento, el motor toma una de dos rutas arquitectónicas en base a la **Plantilla Base** seleccionada:

### Ruta A: A base de `template-core-seed` (Composición Dinámica por IA)
Esta estrategia se utiliza para construir una aplicación modular a la medida, inyectando solo lo que el cliente realmente necesita:

1. **Lienzo Limpio:** Se copia únicamente la base ultra-liviana y desacoplada de `template-core-seed/` (el shell del sistema, capas de infraestructura y configuración).
2. **Inferencia de Capacidades (`BiResolver` + `CapabilityResolver`):** El motor analiza el Briefing y deduce las capacidades operativas (`capabilities`).
3. **Mapeo a Features (`FeatureRecommender`):** Traduce las capacidades en módulos de software específicos, resolviendo dependencias transitivas (ej: si requiere `delivery` se jala automáticamente `orders` e `inventory`).
4. **Copiado Dinámico:** El CLI escanea el directorio de plantillas en busca de los directorios de features resueltos y los copia uno por uno en la carpeta `src/features/` del cliente. Si la feature es nueva o no física, genera un módulo modular mockeado.
5. **Dashboard Bento (`ExperienceComposer`):** Diseña y compone la cuadrícula Bento del dashboard, ordenando los widgets por Capability Match.
6. **Fusión de Dependencias (`PackageMerger`):** Combina y valida las dependencias de NPM de cada feature y componente inyectado en el `package.json` base del proyecto.

### Ruta B: A base de una Plantilla Comercial (Ej: `template-ventas` - Réplica Directa)
Esta estrategia se utiliza cuando se desea clonar un módulo vertical pre-configurado y completo:

1. **Clonación Directa del Core:** El motor copia el 100% de la carpeta del template (`templates/template-ventas/` u otra seleccionada) directamente en la carpeta de destino (`Instancias Clientes/seed/App-[clientId]/`), excluyendo únicamente archivos temporales de desarrollo (`node_modules`, `.git`, `.vite`, etc.).
2. **Features Pre-Empaquetadas:** Todas las páginas, componentes y flujos de negocio ya construidos en la plantilla base se copian íntegramente de inmediato.
3. **Bypass del Pipeline de Inferencia:** Se omiten los pasos de resolución de dependencias NPM y copiado modular de features, ya que la plantilla ya los posee nativamente en su estructura física.
4. **Customización Cosmética y de Entorno:** Se inyectan de inmediato los tokens de branding, HSL, logo, favicon y variables Firebase sobre el clon completo.

### 📊 Tabla Comparativa de Comportamiento:

| Característica | Ruta A: `template-core-seed` | Ruta B: `template-ventas` / Cores |
| :--- | :--- | :--- |
| **Enfoque** | Modular a la medida (Composición en caliente) | Réplica de suite completa (Clonación y White-Label) |
| **Origen de Features** | Copiado dinámico filtrado desde monorepo | Copiado directo heredado de la plantilla base |
| **Resolución de Dependencias** | Activa (PackageMerger y Zod Validation) | Estática (Se conservan las declaradas en la plantilla) |
| **Configuración de Dashboard** | Dinámica Bento por Capability Match | Heredada de la plantilla base |
| **Branding y HSL** | Inyectado dinámicamente | Inyectado dinámicamente |
| **Creación de Firebase** | Soportada (Manual o Automática) | Soportada (Manual o Automática) |

---

## 🚀 Fase 4: Procesamiento de Assets, Firebase e Integridad
Tras resolver la bifurcación física de archivos, el generador ejecuta de forma unificada:

1. **Inyección de CSS HSL:** Genera el bloque `:root` en `src/index.css` aplicando los contrastes HSL calculados y las variables avanzadas (`--radius-card`, `--motion-duration`, `--shadow-default`).
2. **Generación de Logos e Iconos:** Copia el logo de marca, genera los assets PWA (favicons, manifest.json, service worker) e iniciales usando el color primario de la marca.
3. **Conexión de Entornos (.env.local):** Escribe el archivo `.env.local` con las variables de Firebase (API Key, Project ID, App ID, etc.) y puertos asignados.
4. **Provisionamiento en la Nube (Firebase CLI):** Si está activo, despliega los índices (`firestore.indexes.json`) y las reglas de seguridad (`firestore.rules` y `storage.rules`) a la base de datos de desarrollo.
5. **Auditoría e Integridad:** Escribe la bitácora de Explainability en `.prototipe-audit-trail.jsonl`, registra el mapa inicial y genera el lockfile `prototipe.lock.json` de seguridad con los hashes SHA-256 de todos los archivos inyectados.

---

## 🏃 Fase 5: Inicialización y Puesta en Marcha Local
Una vez que el streaming SSE del Dashboard imprima **`¡PROYECTO CREADO CON ÉXITO!`**:

1. Abre la terminal en tu máquina local.
2. Navega al directorio creado:
   ```bash
   cd "D:\PROTOTIPE\Instancias Clientes\seed\App-[client-id]"
   ```
3. Ejecuta el comando para encender el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
4. Navega a la URL local (Ej: `http://localhost:[puerto-asignado]`).
5. Inicia sesión en el login usando las credenciales autogeneradas en el log del paso anterior:
   * **Email:** `admin@[client-id].com`
   * **Contraseña:** Impresa en el log final del instalador.
6. Corre el seed inicial si el cliente requiere datos de prueba para facturar o vender:
   ```bash
   npm run seed:admin
   ```
