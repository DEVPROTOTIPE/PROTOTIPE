# Bitácora de Cambios - Prototype CLI & Ecosistema (General)

### [2026-06-23] - CORE-051: Alineación e Integración de la Biblioteca y el Sandbox del Dashboard

* **Tipo:** Documentación / Calidad / Sandbox
* **Descripción de Cambios:**
  - **Saneamiento de la Biblioteca:** Corrección al 100% de los 29 enlaces rotos y reestructuración del catálogo general (`06_Biblioteca_Componentes/README.md`) para apuntar a las carpetas y archivos en español claro e indexar los 21 archivos markdown huérfanos que no estaban registrados.
  - **Indexación y Registro de Componentes:** Catalogación de los componentes huérfanos `variant_selector.md` y `admin_stock_alerts.md` en el índice de la biblioteca.
  - **Mapeo del Sandbox en Dashboard:** Modificación del selector de playground interactivo (`ComponentSandbox.jsx`) mapeando en `COMPONENT_META` y `COMPONENT_SANDBOX_MAP` las excepciones de visualización (consola de diagnóstico inteligente, rejilla de catálogo inteligente, hook de carrito de compras y hook de control del asistente guiado) para evitar el estado de "Playground No Configurado".
  - **Creación de Ficha Técnica KDS:** Documentación completa y detallada del Kitchen Display System (KDS) en `pantalla_cocina_kds.md` para resolver el enlace roto en el catálogo, incluyendo flujo Mermaid y código React 100% funcional.
  - **Sincronización Semántica de Mapas:** Registro e indexación de `pantalla_cocina_kds.md` en el mapa semántico global de documentación (`mapa_documentacion_ia.md`) y el mapa de aplicación (`mapa_aplicacion.md`).
  - **Verificación Automatizada:** Ejecución de scripts de control y diagnóstico certificando 0 enlaces rotos, 0 archivos huérfanos en biblioteca y consistencia total en los mapas.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/06_Biblioteca_Componentes/README.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/README.md) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentSandbox.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/09_Modulos_Completos/Pantalla_Cocina_KDS/pantalla_cocina_kds.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/09_Modulos_Completos/Pantalla_Cocina_KDS/pantalla_cocina_kds.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-050: Normalización de Iconografía en la Landing Page (Revisión v2.1 y v2.2)

* **Tipo:** UI/UX / Calidad / SVG / Documentación
* **Descripción de Cambios:**
  - **Revisión v2.1 (Completado anteriormente):** Reemplazo del path de la bombilla deforme en "La Solución PROTOTIPE" por el SVG simétrico limpio de `lightbulb` de Lucide.
  - **Revisión v2.2 (Ejecutado):** Normalización de todos los iconos de la landing page a la biblioteca Lucide SVG para garantizar consistencia y paridad:
    * Se actualizó el favicon URL-encoded para utilizar los paths estándar de Lucide `layers`.
    * Se reemplazó el path tosco del logotipo principal (en Navbar, Footer y defs) por los paths oficiales de `layers`.
    * Sección *El Problema*: Reemplazo de paths mixtos de Heroicons por Lucide oficial (`clock` para tiempo, `circle-dollar-sign` para dinero, `users` para clientes perdidos y `bar-chart-2` para puntos ciegos).
    * Sección *Beneficios*: Reemplazo sistemático por Lucide oficial (`badge-check` para control total, `check-circle-2` para menos errores, `clock` para más tiempo libre, `trending-up` para crecimiento y `bar-chart-2` para decisiones basadas en datos).
    * Sección *Modelo de Precios*: Normalización del check de viñetas al path de Lucide `check`.
    * Sección *FAQ*: Reemplazo del icono de despliegue por Lucide `plus` oficial.
    * Todas las modificaciones se realizaron inyectando `stroke-width="2"` y separando de forma explícita coordenadas y números decimales para prevenir anomalías de renderizado en Chrome.
  - **Control de Roadmap y Logs:** Registro del progreso en la bitácora física del proyecto y finalización en task.md.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-049: Alineación y Sincronización Completa del Mapa Semántico de Documentación IA

* **Tipo:** Documentación / Control de Calidad / IA GPS
* **Descripción de Cambios:**
  - **Sincronización del Mapa Semántico:** Indexación de las 12 referencias físicas y semánticas que faltaban en el archivo de control `mapa_documentacion_ia.md` (GEMINI.md, verify_ecosystem_integrity.js, boveda_obsidian_index.md, mapa_ecosistema.canvas, telemetria_ecosistema_global.md, catalogo_componentes_atomicos.md, formulario_producto_ia.md, imagen_lazy.md, diagrama_flujo_ecosistema.md, diccionario_tecnico_completo.md, etc.) definiendo sus roles técnicos precisos, criterios de decisión IA coherentes y enlaces absolutos de Windows con protocolo `file:///`.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-048: Análisis y Rediseño Premium Profesional de Landing Page

* **Tipo:** UI/UX / Diseño / SEO / Código / Documentación
* **Descripción de Cambios:**
  - **Análisis de Landing Page:** Elaboración del reporte de auditoría técnica y visual `auditoria_landing_page_2026.md` bajo `03_Auditorias_y_Faro_Core/`, diagnosticando vulnerabilidades de seguridad, SEO y diseño.
  - **Rediseño Completo de Index.html:** Implementación de variables HSL de tema, tipografías premium Outfit/Inter, glows radiales en movimiento lento, navbar interactivo con blur, tarjetas de dolor y casos con iconos SVG inline personalizados, acordeón de FAQ dinámico con detalles nativos de HTML5, footer corporativo expandido, barra CTA fija móvil en inferior y animaciones sutiles (scroll reveal, hover scale, active scale).
  - **Optimización de Contraste y Consistencia (Revisión v1.1 - v1.7):** 
    * Purga completa de emojis (🧠, 📲) y reemplazo por iconos vectoriales SVG de alta definición (favicon de engranaje y nodos, y botones con el isotipo oficial de WhatsApp integrado).
    * Corrección de especificidad CSS en el botón CTA del navbar (`.nav-links a.nav-cta-btn`) inyectando color blanco brillante `#ffffff !important` para sobrescribir la regla de herencia gris y solucionar por completo el bug de legibilidad.
    * Refactorización de contrastes en botones principales (`.btn-primary` y `.nav-cta-btn`) cambiando a un fondo de gradiente azul oscuro/violeta con texto blanco para legibilidad perfecta y cumplimiento estricto de WCAG AA.
    * Alturas mínimas estandarizadas y alineaciones flexbox en todas las tarjetas de grids (`.pain-box`, `.step-card`, `.case-card`, `.benefit-card` y `.pricing-card`) logrando un tamaño geométrico uniforme e idéntico.
    * Refinamiento en micro-interacciones hover de tarjetas y botones (rotación suave y escala en iconos SVG y números de paso).
    * Transición de despliegue animada mediante CSS keyframes en acordeón de FAQ.
    * **Revisión v1.5 (Iconos de Casos de Éxito):** Estandarización y reemplazo de los SVG vectoriales de la cuadrícula de casos de uso (Ferreterías, Restaurantes, Talleres mecánicos, Tiendas de barrio, Peluquerías, Emprendimientos) escalándolos a un tamaño uniforme de 24x24 px e inyectando un grosor de trazo stroke-width="2" con sus paths oficiales respectivos (martillo, utensilios, coche, tienda física, tijeras, cohete). Esta corrección previene de forma absoluta el empastamiento y los artefactos visuales causados por trazos anchos (2.5px) y resoluciones comprimidas (20x20px) en pantallas estándar.
    * **Revisión v1.6 (Corrección de Overflow y Trazo Fino):** Solución definitiva al recorte horizontal (mochado) de los círculos numerados 1, 2 y 3 (`.step-number`) en la sección de pasos inyectando `overflow: visible !important;` en la clase de estilos de `.step-card` para que no herede el recorte de `.glass-card`. Homologación de todos los grosores de trazo de flechas interactivas en botones y el icono de bombilla a `stroke-width="2"` (sustituyendo trazos toscos de `2.5`) para un look ultra-estilizado y premium. Robustecimiento del logotipo del footer inyectándole una definición de gradiente local para garantizar su correcto render cromático en cualquier navegador.
    * **Revisión v1.7 (Curvatura de Esquinas Glass-Card):** Corrección visual del destello de esquinas en ángulo recto (bordes rectos grises) en tarjetas con overflow deshabilitado. Se inyectó `border-radius: inherit;` en el pseudo-elemento `.glass-card::before` para que herede automáticamente la curvatura de 18px del contenedor padre, logrando un redondeado perfecto en todas las esquinas sin desborde.
    * **Revisión v1.8 (Responsividad de ROI):** Pulido responsivo final en la visualización del retorno monetario anual en la calculadora de ROI. Se removió la regla `word-break: break-all` que separaba toscamente la sigla "COP" en pantallas estrechas y se inyectó `white-space: nowrap` junto con un font-size clamp() dinámico para garantizar una visualización unificada y nítida en todos los viewports.
    * **Revisión v1.9 (Rediseño Tipográfico del Hero):** Rediseño tipográfico de alta jerarquía del titular principal (H1). Se redujo el peso de Outfit a 800 (eliminando la apariencia tosca del peso 900 anterior) y se cerró el tracking (`letter-spacing`) a -0.05em para un estilo más compacto y tecnológico. Estructuralmente se separó el titular en una frase introductoria en color blanco puro (`#ffffff`) y una propuesta de valor en gradiente animado elástico de cian a violeta de alto contraste.
    * **Revisión v2.0 (Efecto Elástico de Botón):** Inyección de animación y transición con física de resorte (Spring Physics) en el botón de Diagnóstico Gratis del navbar del encabezado. Se definieron transiciones elásticas con curvas Bezier cúbicas (`cubic-bezier(0.34, 1.56, 0.64, 1)`) al pasar el cursor (escala a 1.06 y resplandor de marca) y una respuesta de compresión táctil instantánea al hacer clic (escala a 0.94).
  - **Seguridad y SEO:** Configuración de etiquetas Open Graph, Twitter Cards, description y rel="noopener noreferrer" en enlaces de WhatsApp externos.
* **Archivos Modificados:**
  - [`LandingPage/Index.html`](file:///d:/PROTOTIPE/LandingPage/Index.html) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-047: Sincronización y Normalización de la Matriz de Precios Oficial

* **Tipo:** Documentación / Comercial / Negocio / Procesos
* **Descripción de Cambios:**
  - **Matriz de Precios Oficial:** Normalización completa del formato del archivo `matriz_precios_oficial.md` a su versión oficial definitiva con viñetas de guiones, estructura de cobros unificada por niveles (1 a 4), modelos de comisiones/transacciones, y reglas de crecimiento del ecosistema.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/matriz_precios_oficial.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/matriz_precios_oficial.md) [MODIFY]
  - [`Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-046: Integración Documental de Procesos Comerciales y de Escalabilidad

* **Tipo:** Documentación / Comercial / Negocio / Organizacional
* **Descripción de Cambios:**
  - **Manual de Contratación de Clientes:** Creación de `manual_contratacion_clientes.md` en `/05_Estrategia_Comercial_Ecosistema/` detallando el embudo y proceso comercial paso a paso de PROTOTIPE.
  - **Manual de Marca:** Creación de `manual_marca.md` en `/05_Estrategia_Comercial_Ecosistema/` consolidando la personalidad, tono de comunicación, valores y pautas visuales minimalistas de la marca.
  - **Organigrama Futuro:** Creación de `organigrama_futuro.md` en `/08_Plan_Escalabilidad_Negocio/` planificando las necesidades de contratación y equipo por fases de crecimiento de clientes activos.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando las tres nuevas piezas documentales.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando las nuevas piezas para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_contratacion_clientes.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_contratacion_clientes.md) [NEW]
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_marca.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_marca.md) [NEW]
  - [`Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/organigrama_futuro.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/organigrama_futuro.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-045: Integración Documental del Roadmap de Negocio 2026-2029

* **Tipo:** Documentación / Escalabilidad / Negocio / Procesos
* **Descripción de Cambios:**
  - **Roadmap Empresarial 2026-2029:** Creación de `roadmap_empresarial_2026_2029.md` en `/08_Plan_Escalabilidad_Negocio/` detallando los objetivos estratégicos y hitos por etapas (Consolidación, Validación Comercial, Escalamiento, Expansión) y metas de clientes activos.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza documental.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/roadmap_empresarial_2026_2029.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/08_Plan_Escalabilidad_Negocio/roadmap_empresarial_2026_2029.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-044: Integración Documental de la Oferta Comercial Oficial

* **Tipo:** Documentación / Comercial / Negocio
* **Descripción de Cambios:**
  - **Oferta Comercial Oficial:** Creación de `oferta_comercial_oficial.md` en `/05_Estrategia_Comercial_Ecosistema/` conteniendo la propuesta de valor del ecosistema, problemas comerciales resueltos, entregables estándar y principios.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza documental.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/oferta_comercial_oficial.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/oferta_comercial_oficial.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-043: Documentación del Modelo Operativo y de Negocio Comercial

* **Tipo:** Documentación / Negocio / Procesos
* **Descripción de Cambios:**
  - **Modelo Operativo y de Negocio:** Generación de `modelo_operativo_y_negocio.md` en la subcarpeta temática `/05_Estrategia_Comercial_Ecosistema/` detallando el modelo comercial (setup, SaaS, comisiones por telemetría), onboarding, flujos de venta en PWA, desarrollo core, soporte de logs de excepciones, scripts de mantenimiento y sincronizaciones downstream seguras.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza documental.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/modelo_operativo_y_negocio.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/modelo_operativo_y_negocio.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-042: Construcción del Mapa de Dependencias y Matriz de Impacto

* **Tipo:** Documentación / Calidad / Auditoría / Riesgos
* **Descripción de Cambios:**
  - **Mapa de Dependencias y Riesgos:** Generación de `mapa_dependencias_y_riesgos.md` incluyendo diagramas de acoplamiento Mermaid para los componentes CLI, workers y servicios externos, matriz de impacto operativo, y análisis detallado de riesgos en producción y puntos únicos de falla (SPOF).
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza documental.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/mapa_dependencias_y_riesgos.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/mapa_dependencias_y_riesgos.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-041: Construcción de Registro de Decisiones Arquitectónicas (ADR)

* **Tipo:** Documentación / Estándar / Arquitectura / Calidad
* **Descripción de Cambios:**
  - **Registro de Decisiones Arquitectónicas (ADR):** Generación de `registro_decisiones_arquitectura.md` detallando 5 ADRs claves sobre sharding físico, branding HSL, sincronizador downstream por MD5, workers asíncronos y telemetría desacoplada.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza estándar.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/registro_decisiones_arquitectura.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/registro_decisiones_arquitectura.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-040: Construcción del Documento Maestro de Reglas Arquitectónicas

* **Tipo:** Documentación / Estándar / Arquitectura / Calidad
* **Descripción de Cambios:**
  - **Documento Maestro de Arquitectura:** Generación de `estandar_arquitectonico_ecosistema.md` que unifica principios de arquitectura, componentes críticos, carpetas núcleo, dependencias obligatorias, tecnologías autorizadas/prohibidas, convenciones de código, patrones de diseño, reglas de sincronización, reglas de seguridad, reglas de escalabilidad, directivas obligatorias para IA, lista de acciones prohibidas y checklist de auditoría del ecosistema.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` registrando la nueva pieza estándar.
  - **Sincronización del Mapa de Documentación:** Actualización de `mapa_documentacion_ia.md` indexando la nueva pieza para su consumo optimizado por la IA.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-039: Distribución Estratégica de Informes de Auditoría Técnica y Diagrama del Ecosistema

* **Tipo:** Documentación / Calidad / Auditoría / Sincronización
* **Descripción de Cambios:**
  - **Reubicación de Auditoría:** Mapeo y corrección del error tipográfico en la carpeta de auditorías (`03_Audiorias_y_Faro_Core` → `03_Auditorias_y_Faro_Core`), reubicando físicamente el archivo `auditoria_final_prototipe.md`.
  - **Limpieza de Archivos Basura:** Eliminación física de archivos huérfanos obsoletos como `Sin título.canvas` en el directorio de documentación.
  - **Mapeo Físico y Semántico:** Sincronización de los nuevos archivos `auditoria_final_prototipe.md` y `diagrama_flujo_ecosistema.md` en el mapa de archivos de la aplicación (`mapa_aplicacion.md`) y en el mapa semántico indexador para la IA (`mapa_documentacion_ia.md`).
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_final_prototipe.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_final_prototipe.md) [NEW]
  - [`Documentacion PROTOTIPE/07_Manuales_Desarrollo/diagrama_flujo_ecosistema.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/diagrama_flujo_ecosistema.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-038: Mapeo Completo del Ecosistema y Diccionario Técnico Detallado

* **Tipo:** Documentación / Calidad / Mapeo Técnico / Arquitectura
* **Descripción de Cambios:**
  - **Diccionario Técnico Completo:** Documentación de granularidad estricta para el 100% de la lógica de los archivos raíz (scripts de backup), motor CLI (config, logger, cli, worker, generator, sync_templates, sync_clients, test_templates, server) y Consola Central (ComponentLibraryView, ComponentSandbox, CoreCard, CoreManagerPanel, CoreSyncPanel, E2EPanel, GitBackupPanel, useCopyToClipboard, useToast, pdfService, App) en `diccionario_tecnico_completo.md`.
  - **Sincronización del Mapa de la Aplicación:** Actualización de `mapa_aplicacion.md` para reflejar el nombre físico exacto `/Documentacion PROTOTIPE/07_Manuales_Desarrollo/` y el archivo `diccionario_tecnico_completo.md`.
  - **Sincronización del Mapa de Documentación:** Registro del diccionario y su respectivo criterio de decisión en `mapa_documentacion_ia.md`.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/07_Manuales_Desarrollo/diccionario_tecnico_completo.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/diccionario_tecnico_completo.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-23] - CORE-037: Auditoría Técnica Completa, Mapeo General y Plan de Limpieza

* **Tipo:** Documentación / Auditoría / Calidad
* **Descripción de Cambios:**
  - **Auditoría Técnica Completa:** Redacción del informe maestro [`auditoria_tecnica_completa_maestra_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_completa_maestra_2026.md) detallando arquitectura, flujos operativos (esquematizados en Mermaid), stack de versiones del core, análisis exhaustivo de cada archivo y función del CLI, API, scripts de respaldo PowerShell y dev-dashboard.
  - **Bugs y Soluciones:** Diagnóstico preciso de inyecciones de shell, laxitud en reglas Firestore, CORS abierto, scripts bloqueantes y colisiones, con sus respectivas soluciones técnicas.
  - **Sincronización del GPS Semántico:** Actualización de [`mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) registrando la nueva pieza documental con su criterio de decisión.
* **Archivos Modificados:**
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_completa_maestra_2026.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_completa_maestra_2026.md) [NEW]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md) [MODIFY]

---

### [2026-06-22] - CORE-036: Auditoría, Robustecimiento y Blindaje de Seguridad del Servidor CLI Bridge

* **Tipo:** Seguridad / Rendimiento / Estabilidad / Backend API
* **Descripción de Cambios:**
  - **Directory Traversal Blindado:** Se implementó y aplicó la función `isPathContained(parentPath, childPath)` de forma case-insensitive y multiplataforma en todos los endpoints que consultan archivos locales (`/api/library/file`, `/api/library/extract`, `/api/project/file`, `/api/git/status`, `/api/git/backup-stream`).
  - **Mitigación de Zombies:** Se sustituyó `ps.kill()` por la llamada a la utilidad recursiva `killProcessTree(ps.pid)` (que ejecuta `taskkill /PID {pid} /T /F`) en el cleanup de `/api/git/backup-stream` para forzar la eliminación de subprocesos PowerShell/Git huérfanos en Windows.
  - **I/O Asíncrono no Bloqueante:** Se refactorizó la lógica síncrona de lectura recursiva de archivos y hashing MD5 a métodos asíncronas basados en promesas (`getSyncFilesRecursiveAsync` y `getSyncFileHashAsync`).
  - **Desbloqueo de Event Loop:** Refactorizado el endpoint `/api/instancias/list` para procesar desviaciones de forma paralela asíncrona mediante `Promise.all()` de forma segura libre de condiciones de carrera (Race Conditions), evitando escrituras concurrentes a variables compartidas.
  - **Sanitización de Firebase Project ID:** Integrada validación estricta regex `^[a-z0-9\-]+$` en el resolutor de IDs de proyecto Firebase y en `/api/git/sync-core-to-clients-stream` para prevenir inyecciones indirectas.
  - **Preflight Checks unificados:** Movida la llamada `runPreflightChecks()` al entry point del servidor para que no se imprima repetidamente en caso de fallar la asignación de puertos y reintentos de arranque.
  - **Auditoría de Logs:** Interceptados `console.log`, `console.warn` y `console.error` para escribir de forma persistente y estructurada en `cli_bridge.log` a través de un logger interno (`logger.js`).
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

---

### [2026-06-22] - CORE-035: Refactorización Arquitectura Git — Unificación de Ramas, Nomenclatura Cliente/*, --no-verify y Deploy por Instancia

* **Tipo:** DevOps / Git / Arquitectura / Backend API
* **Descripción de Cambios:**
  - **Eliminación de rama `produccion` (Git):** Se fusionó `produccion` en `main` en `Plantillas Core/App Ventas` y se eliminó la rama local y remota. `main` es ahora la única rama de producción del Core. Commit de merge: `b312099`.
  - **Limpieza de ramas obsoletas (`cliente/moni`):** Se eliminó la rama local y remota obsoleta `cliente/moni` del Core para consolidar la nomenclatura estándar de coincidencia 1:1 con la carpeta física (`cliente/ventas-moni-app`).
  - **Remote de instancias apuntando al Core:** La instancia `ventas-moni-app` tenía su propio remote. Se reconfiguró para apuntar a `https://github.com/DEVPROTOTIPE/prototipe-core-ventas.git`.
  - **Nomenclatura estándar `cliente/*`:** Se renombró la rama local de `ventas-moni-app` de `master` → `cliente/ventas-moni-app` y se publicó en el Core con ese formato. Se purgaron refs huérfanas (`origin/master`).
  - **`--no-verify` en todos los push de backup:** Se añadió `--no-verify` a todos los comandos `git push` de `git_backup.ps1` and `subproject_backup.ps1`, desacoplando los tests E2E de Playwright del proceso de respaldo. Los tests siguen disponibles en el módulo E2E del Dashboard.
  - **Prompt interactivo de bypass eliminado:** Se eliminó el bloque `if ($Interactive)` que preguntaba si forzar el push al fallar, ya que ahora el push nunca es bloqueado por hooks.
  - **Guard `cliente/*` en auto-merge:** El auto-merge de ramas de trabajo hacia `main` ahora excluye explícitamente ramas con prefijo `cliente/`, evitando que snapshots de instancias contaminen el Core.
  - **`findProjectDir` robustecido (server.js):** Nueva lógica de 3 niveles: (1) `.prototipe.json` como fuente de verdad, (2) `package.json` como fallback, (3) nombre de carpeta normalizado. Soporta estructura `Instancias Clientes/{nicho}/{instancia}`.
  - **`defaultBase` en `/api/git/cores-and-clients`:** Prioridad cambiada de `produccion` → `main` para el cálculo de commits ahead/behind de instancias cliente.
  - **`originalBranch` fallback:** El fallback de la variable `originalBranch` en el stream SSE de sincronización cambió de `produccion` → `main`.
  - **Deploy por instancia física en `/api/git/sync-core-to-clients-stream`:** El `VITE_FIREBASE_PROJECT_ID` ahora se lee del `.env.local` de la instancia física del cliente (usando `findProjectDir`). El build y deploy se ejecutan en el directorio de la instancia, no del Core. Mantiene fallback al Core si la instancia no tiene `.env.local` propio.
* **Archivos Modificados:**
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY] — `--no-verify` en ambos push
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY] — `cliente/*` naming + `--no-verify` + guard auto-merge
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] — `findProjectDir`, `defaultBase`, `originalBranch`, deploy por instancia
* **Repositorios afectados:** `prototipe-core-ventas` (ramas: `main`, `develop`, `cliente/ventas-moni-app`)

---

### [2026-06-22] - CORE-034: Saneamiento y Robustecimiento Integral del Sistema de Backup (10 Puntos de Auditoría)

* **Tipo:** Seguridad / Calidad / DevOps / PowerShell / Git / UX
* **Descripción de Cambios:**
  - **Pre-Add Leak Checking (Punto 1 y 4):** Se movió el check de seguridad de variables de entorno `.env` antes del `git add .` en `git_backup.ps1` para evitar staging de secretos. Se excluyeron los archivos en estado `D` (deleted/desindexado) del check para evitar falsos positivos en las tareas de saneamiento.
  - **Inicialización Remota Interactiva (Punto 3):** Al ejecutar `git init` desde `menu_backup.ps1` para un subproyecto o instancia sin Git, el script solicita de manera interactiva si desea asociar un repositorio origin y la URL, evitando fallos crípticos durante la ejecución de los backups.
  - **Estados Dinámicos y Conteo de Cambios (Punto 2 y 10):** Se sustituyó el filtro rígido de profundidad fija en `menu_backup.ps1` por una búsqueda recursiva dinámica basada en firmas de proyectos (`package.json`, `.git`, `.git-backup-temp`) para detectar instancias mal anidadas. Además, se integró el conteo en tiempo real de cambios pendientes de Git (`Get-GitChangesCount`) para todos los subproyectos del menú interactivo mediante parámetros `--git-dir` y `--work-tree` que permiten la consulta rápida en repositorios inactivos.
  - **Saneamiento de Indexación y Push (Punto 5, 8 y 9):** Se agregaron validaciones de `$LASTEXITCODE` inmediatamente posteriores a la indexación (`git add .`) y subida (`git push`), deteniendo la ejecución y escribiendo el estado en `backup.log` en lugar de reportar éxito erróneamente si las operaciones de Git fallan.
  - **Mensaje de Commit Optimizado (Punto 6):** Se optimizó la generación automática del mensaje de commit en `git_backup.ps1` y `subproject_backup.ps1` filtrando subcarpetas del sistema (`dist/`, `node_modules/`, etc.) y reduciendo listas largas a formato descriptivo con la función helper `Format-CommitMessageList` (e.g. `Mod: a.js, b.js, c.js (y 4 mas)`).
  - **Historial de Backups (Punto 8):** Se creó el archivo unificado `backup.log` en el directorio raíz en donde la función compartida `Write-BackupLog` escribe con timestamp la marca de tiempo, estado de ejecución y rama de cada backup realizado.
  - **Corrección de Codificación de Caracteres y Cierre (UI/UX):** Se reemplazó el punto central Unicode (`•`) por un carácter de barra vertical (`|`) en los textos de estado de Git del menú de plantillas e instancias para corregir la codificación incorrecta (como `â€¢`) en Windows Terminal y PowerShell. Además, se solucionó el fallo del botón `Salir` del menú principal: dado que el comando `break` en PowerShell solo rompe bloques `switch` y no bucles `do-while` exteriores, se implementó una variable de control `$keepRunning` para finalizar correctamente la ejecución del script. También se corrigió el filtro del escaneo flexible de instancias, aplicando el patrón de exclusión contra `node_modules` sobre la ruta completa (`$path`) en lugar de sobre el nombre del directorio (`$name`), previniendo la detección y renderizado indeseado de carpetas internas de dependencias locales en el listado del menú.
* **Archivos Modificados:**
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]
  - [`menu_backup.ps1`](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY]
  - [`backup.log`](file:///d:/PROTOTIPE/backup.log) [NEW]

---

### [2026-06-22] - CORE-033: Corrección del Sistema de Backup para Instancias de Cliente

* **Tipo:** Bug Fix / Seguridad / Git / DevOps
* **Descripción de Cambios:**
  - **Desindexación de archivos sensibles:** Se ejecutó `git rm --cached .env.local` y `git rm --cached -r dist/ .firebase/` en el repositorio de `ventas-moni-app` para eliminar del índice de Git los archivos que nunca debieron ser tracked. Esto resuelve el bloqueo permanente del guardián de seguridad del script `subproject_backup.ps1` que abortaba el proceso por detectar `.env.local` como modificado en el staging area.
  - **Actualización de `.gitignore` (Instancia y Plantilla):** Se reforzaron los `.gitignore` de `ventas-moni-app` y `App Ventas` con entradas explícitas y comentadas para `.env`, `.env.*` (excluyendo `.env.example`), `dist/`, `.firebase/`, `firebase-debug.log` y `.vite/`. Esto previene cualquier re-indexación accidental futura.
  - **Actualización del template `.gitignore` en `generator.js`:** Se actualizó el bloque de `gitignoreContent` generado al aprovisionar nuevas instancias para que todas las instancias futuras nazcan con las mismas reglas de blindaje desde el primer commit, sin excepción.
  - **Refinamiento del Guardián de Seguridad en `subproject_backup.ps1`:** Se mejoró el loop de detección de fugas en la función de validación pre-commit. Ahora extrae el `$statusCode` (primeras 2 columnas de `git status --short`) y salta con `continue` cualquier archivo cuyo código sea `D` (deleted/desindexado). Esto evita falsos positivos: un `D .env.local` es el resultado correcto de un `git rm --cached` y nunca debe abortar el proceso.
* **Archivos Modificados:**
  - [`Instancias Clientes/ventas/ventas-moni-app/.gitignore`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/.gitignore) [MODIFY]
  - [`Plantillas Core/App Ventas/.gitignore`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.gitignore) [MODIFY]
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`subproject_backup.ps1`](file:///d:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

---

### [2026-06-22] - CORE-032: Adaptación de Pantalla de Login a Temas y Optimización del Contraste del Fondo Tecnológico

* **Tipo:** UI / UX / Temas / Consistencia Visual / Modo Claro / Modo Oscuro
* **Descripción de Cambios:**
  - **Login Adaptativo (Modo Claro/Oscuro):** Se refactorizó la pantalla de login en `App.jsx` eliminando clases de fondos oscuros fijos (`bg-[#070b13]`), tarjetas rígidas (`bg-slate-900/60 border-slate-800/80`) y textos invertidos. Ahora se utilizan variables HSL de diseño (`bg-[var(--color-bg)]`, `bg-[var(--color-surface-glass)]`, `border-[var(--color-border)]`, etc.). Los campos de entrada (tanto email como password) y el botón de visibilidad de contraseña ahora heredan los estilos del tema activo, garantizando un alto contraste y legibilidad.
  - **Fondo Tecnológico con Mayor Visibilidad:** Incrementada la opacidad y presencia de la cuadrícula de puntos y los orbs de gradiente en `index.css`. En modo oscuro, `--dot-color` subió a `0.09` y los orbs a `0.28`, `0.20` y `0.18`. En modo claro, `--dot-color` subió a `0.12` y los orbs a `0.22`, `0.16` y `0.16`.
  - **Ajuste de Viñeta y Soporte de Inputs:** En modo claro, la viñeta perimetral `--vignette-color` se suavizó de `0.5` a `0.35` para destacar los orbs decorativos de marca en los extremos de la pantalla. Además, se añadió el tipo de input `email` al override global de contraste en modo claro en `index.css` para una unificación total de la interfaz.
  - **Corrección de Borde en Botón de Tema:** Se modificó `DarkModeToggle.jsx` para reemplazar las clases de borde rígido `border-slate-200` y color hardcodeado por variables de tema adaptativas HSL (`border-[var(--color-border)]` y `text-[var(--color-primary)]`), eliminando el contorno gris oscuro en el modo claro.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/ui/DarkModeToggle.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/ui/DarkModeToggle.jsx) [MODIFY]

---

### [2026-06-21] - CORE-031: Robustecimiento, Preflight Checks y Detección Dinámica de Colisiones de Puerto en CLI Bridge

* **Tipo:** Seguridad / Robustez / Diagnóstico / Arranque / Control de Errores
* **Descripción de Cambios:**
  - **Diagnóstico Temprano (Preflight Checks):** Añadida la función asíncrona `runPreflightChecks()` ejecutada al inicializar el servidor. Realiza consultas rápidas a `git --version` y `firebase --version` emitiendo advertencias descriptivas en la consola si las herramientas no están presentes en el PATH local del desarrollador.
  - **Validación del Esquema `.prototipe.json`:** Implementada la función `validatePrototipeMetadata(meta, folderName)` que establece campos por defecto seguros (`template`, `version`, `clientId`, `projectName`). Se integró en `/api/project/drift`, `/api/project/drift/global`, `/api/instancias/list` y `/api/instancias/sync-and-deploy-stream` para prevenir de forma proactiva comportamientos indefinidos si el archivo de metadatos de un cliente está corrupto o carece de propiedades.
  - **Mitigación de Inyecciones en Git Command Execution:** Se robusteció `execGitCommand(cmd, dir)` validando la cadena `cmd` contra caracteres de inyección de consola y redirección (`|`, `;`, `&`, `$`, `` ` ``, `<`, `>`). Si se detecta una inyección, se lanza una excepción controlada previniendo la ejecución física.
  - **Resolución Dinámica de Puertos (Colisiones):** Modificado el arranque del servidor para encapsularse en `startServer(port)`. Si se captura un error de puerto ocupado (`EADDRINUSE`), se intenta enlazar de forma recursiva a puertos incrementales (`port + 1`), evitando fallos fatales de ejecución si el puerto `3001` está ocupado.
  - **Alineación de Ancho de Tarjetas de Clientes Activos:** Se corrigió la discrepancia de ancho en las tarjetas de la lista de instancias bajo Configuración. Al aplicar la clase de margen negativo `-mx-2` en conjunto con el padding `px-2` en el contenedor scrollable (`App.jsx`), se expandieron las tarjetas hacia los bordes del grid, alineándolas de forma simétrica con la tarjeta cabecera de "Instancias Activas" y la terminal, mientras se conserva el margen interno necesario para la animación en hover (`scale-[1.01]`) y la visualización de sombras sin recortes.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

---

### [2026-06-21] - CORE-030: Optimización y Blindaje de Dashboard de Desarrollador y CLI Bridge

* **Tipo:** Refactorización / Optimización / Estabilidad / API / Escalabilidad
* **Descripción de Cambios:**
  - **Unificación de URLs de API y Codificación de Parámetros:** Se declaró la constante unificada `CLI_URL = 'http://localhost:3001'` en `App.jsx` y `ComponentLibraryView.jsx`, reemplazando todas las llamadas directas hardcodeadas a localhost/127.0.0.1. Se aplicó `encodeURIComponent` en todos los parámetros dinámicos concatenados a las URL (como `clientId` o rutas de archivos `file`), eliminando fallos potenciales con caracteres especiales y nombres de carpetas.
  - **Soporte de Estructura de Directorios Anidados (2 niveles):** Se actualizó el endpoint de sincronización y despliegue `/api/instancias/sync-and-deploy-stream` y el escaneo de repositorios Git `/api/git/targets` en `server.js` para detectar y resolver directorios de clientes organizados bajo carpetas de Core (e.g. `Instancias Clientes/{coreType}/{projectName}`) mediante la función `findProjectDir`, alineándolos con la visualización del listado y el detector de drift.
  - **Exclusión de Archivos Binarios del Detector de Drift:** Implementado un juego de extensiones `BINARY_EXTENSIONS` y un helper `isBinaryFile` en `server.js`. Si un archivo es detectado como binario, se lee como Buffer en lugar de UTF-8 y se compara de forma íntegra sin invocar a `Diff.diffLines()`, retornando `{ isBinary: true }` y previniendo fugas de memoria y sobrecarga crítica de CPU en el servidor.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx) [MODIFY]
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

---

### [2026-06-21] - CORE-029: Corrección de Contornos de Enfoque, Sombras Cortadas en Instancias y Curvatura de Tarjetas Global

* **Tipo:** UI / UX / CSS / Consistencia de Interfaz / Modo Oscuro / Modo Claro
* **Descripción de Cambios:**
  - **Remoción de Contornos y Anillos de Enfoque:** Añadido un reset de CSS global en `index.css` para `button:focus` y `[role="button"]:focus` que remueve los valores de `outline` y `box-shadow` al hacer clic sobre cualquier botón o toggle de la aplicación, solucionando la aparición del contorno rígido/anillo antiestético.
  - **Espacio para Renderizado de Sombras en Lista de Instancias:** Modificado el contenedor del listado de clientes en `App.jsx` (alrededor de la línea 7770) reemplazando `pr-1` por `px-2 pb-2 pr-1.5`. Esto le provee holgura de padding horizontal e inferior suficiente para que la sombra flotante (`shadow-md`) y la escala de zoom en hover (`scale-[1.01]`) no sufran cortes en los límites del contenedor.
  - **Estandarización de Curvatura de Tarjetas (Border Radius):** Se configuró una directiva global en `index.css` dentro de los selectores de tarjeta principal y grande (`div[class*="rounded-2xl"][class*="border"]` y `div[class*="rounded-3xl"][class*="border"]`) para aplicar un `border-radius: 1.25rem !important;` (20px). Esto unifica perfectamente las curvaturas de todas las tarjetas y modales del ecosistema para asegurar una consistencia visual de primer nivel, superando el desfase existente entre el uso aleatorio de 16px y 24px en los elementos de interfaz.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

---

### [2026-06-21] - E2E-Hotfix: Control de Modal de Telemetría en Tests de Checkout

* **Tipo:** Hotfix / Tests / E2E / Playwright
* **Descripción de Cambios:**
  - **Descarte de Modal en Test Helper:** Modificado el helper de navegación inicial `passWelcomePage` en `checkout.helpers.js`. Ahora, si al iniciar el test se presenta el modal interactivo de "Prueba de Enlace de Telemetría" (el cual puede estar activo por pings recientes en la base de datos central), Playwright hace clic automáticamente en "Entendido / Aceptar" utilizando un timeout de 3000ms. Esto previene que el modal intercepte e invalide el clic del botón principal "Comencemos", asegurando la ejecución exitosa de la suite E2E y destrabando el flujo de push del script de backup sin modificar la lógica ni los listeners de telemetría de la aplicación.
* **Archivos Modificados:**
  - [`Plantillas Core/App Ventas/tests/helpers/checkout.helpers.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/tests/helpers/checkout.helpers.js) [MODIFY]

---

### [2026-06-21] - CORE-028: Fondo Tecnológico Premium Animado — Capas de Grid y Orbs GPU-Accelerated

* **Tipo:** UI / Diseño / CSS / Performance / Modo Oscuro / Modo Claro
* **Descripción de Cambios:**
  - **Capa 1 — Grid de puntos adaptivo y móvil:** Implementado patrón de puntos vía `background-image: radial-gradient` en `.tech-bg-dots` con token `--dot-color` y animación de deriva lenta (`grid-drift` de 60s, traduciendo de `0px` a `32px` de forma cíclica y fluida) sobre una capa sobredimensionada (`110vw`/`110vh`), simulando un espacio digital dinámico en movimiento continuo sin cortes ni repaints.
  - **Capa 2 — Orbs de gradiente animados:** Dos divs `.tech-bg-orb-1` y `.tech-bg-orb-2` con gradientes radiales elípticos de los colores de marca (violeta, cian, índigo) animados independientemente con drift muy lento y suave usando exclusivamente `transform` y `scale` GPU-promoted (`will-change: transform`).
  - **Capa 3 — Viñeta perimetral:** `.tech-bg-vignette` con `radial-gradient` que oscurece los bordes usando el token `--vignette-color` para resaltar la zona de trabajo central.
  - **Tokens CSS por tema:** Todos los tokens de fondo (`--dot-color`, `--orb-primary`, `--orb-accent`, `--orb-indigo`, `--vignette-color`) definidos dentro de los bloques `:root` y `:root.light` existentes. Zero tokens duplicados.
  - **Impacto en rendimiento:** Nulo. Cero JS, cero Canvas, zero repaint. Solo elementos GPU-promoted.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

---

### [2026-06-21] - CORE-027: Efecto Flotante Global de Tarjetas Glassmorphic — CSS Attribute Selector Override

* **Tipo:** UI / Diseño / CSS / Sistema de Diseño
* **Descripción de Cambios:**
  - **Tokens CSS adaptativos de sombra:** Definidos `--card-shadow` y `--card-shadow-hover` en `:root` (modo oscuro, sombras negras profundas en 3 capas) y `:root.light` (modo claro, sombras gris-pizarra sutiles).
  - **Glassmorphism y Backdrop Blur Generalizado:** Definido token `--color-surface-glass` (`rgba(15, 23, 42, 0.6)` en modo oscuro y `rgba(255, 255, 255, 0.7)` en modo claro) aplicado con un selector de atributo general (`div[class*="rounded-2xl"][class*="border"]` y `div[class*="rounded-3xl"][class*="border"]`) junto a `backdrop-filter: blur(14px)` para hacer translúcidas todas las tarjetas de la app, permitiendo visualizar los orbs y dots del fondo en movimiento sin perder legibilidad.
  - **Override global sin tocar JSX:** Exclusiones `not()` aplicadas en CSS para evitar flotación y glassmorphism en badges, elementos de tamaño fijo (`w-2` a `w-10`, `h-2` a `h-10`) y posiciones absolutas/fijas.
  - **Hover de elevación:** `transform: translateY(-2px)` + `box-shadow: var(--card-shadow-hover)` en hover para tarjetas que no sean scrollable containers.
  - **Restauración de excepciones:** `nav`, `aside`, elementos `sticky top-0`, `z-50`, `h-screen`, `min-h-screen` restaurados a `box-shadow: none; transform: none` con `!important` para evitar el float en elementos de layout estructural.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]

---

### [2026-06-21] - CORE-026: Corrección de Contraste y Colores Inválidos en Consola de Telemetría y Global

* **Tipo:** Hotfix / UI / UX / CSS / Modo Claro / Contraste
* **Descripción de Cambios:**
  - **Soporte Global para Colores Personalizados en Tailwind:**
    1. Registrados e integrados en `@theme` en `index.css` los colores de marca e interactivos personalizados no estándar (como `-650`, `-550` y `-755`) que se usaban a lo largo de la aplicación.
    2. En el tema oscuro (`:root`), se configuran con sus equivalentes tradicionales oscuros.
    3. En el tema claro (`:root.light`), se mapean a versiones con alto contraste (ej: `bg-indigo-650` pasa a ser un azul índigo muy oscuro `#4338ca` en lugar de quedar transparente por no existir en Tailwind, y `text-slate-650` pasa a ser `#334155`).
  - **Refactorización de la Consola de Telemetría:**
    1. Reemplazados los fondos y bordes de color pizarra fijos (`bg-slate-950/40`, `border-slate-900`, `bg-slate-900`) en los contenedores de filtros e inputs en `App.jsx` por variables semánticas HSL adaptativas (`bg-[var(--color-surface-2)]/60`, `border-[var(--color-border)]`).
    2. Solucionado el problema por el cual los textos y hovers en los botones de pestañas ("Todos", "Fallas", "Cobros", "Sistema") hacían blanco sobre blanco en Modo Claro. Ahora utilizan `text-[var(--color-text-muted)]` y reaccionan correctamente en hover a `text-[var(--color-text)]` y `bg-[var(--color-surface-2)]/80`.
    3. Corregida la visibilidad de los botones de borrar búsqueda ("✕") y los iconos de lupa, haciéndolos adaptativos al tema actual en lugar de fijos.
  - **Corrección de Contraste de Vista Previa:**
    1. Modificado el botón de "Demo" en vivo de componentes del CRM para usar `text-emerald-600 dark:text-emerald-400` en lugar de `text-emerald-400 hover:text-white` sobre fondos claros translúcidos, logrando un contraste del 100% en ambos modos.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Compilación limpia con Vite (`npm run build`).

---

### [2026-06-21] - CORE-025: Inversión Cromática Global y Adaptación Completa de Modo Claro

* **Tipo:** UI / UX / CSS / Modo Claro / Tailwind CSS
* **Descripción de Cambios:**
  - **Remapeo Dinámico de la Escala Slate:**
    1. Vinculada la escala completa de colores de slate de Tailwind (`slate-50` a `slate-955`) a variables CSS custom en `@theme` en `index.css`.
    2. En el tema oscuro por defecto, se mapean a los colores oscuros habituales de Tailwind.
    3. En el tema claro (`:root.light`), se invierten de forma adaptativa y equilibrada (ej: `bg-slate-900` pasa a ser fondo blanco puro `#ffffff` en vez de negro, y `text-slate-200` pasa a ser texto oscuro `#334155` en vez de gris muy claro), corrigiendo instantáneamente la legibilidad y contraste del dashboard al alternar temas.
  - **Overrides para Transparencias Hardcodeadas:**
    1. Agregadas reglas CSS específicas para elementos con bordes y fondos blancos translúcidos hardcodeados (`border-white/[0.08]`, `bg-white/5`, etc.).
    2. En modo claro, se transforman automáticamente a opacidades de negro (ej: `rgba(0,0,0,0.08)` para bordes y `rgba(0,0,0,0.03)` para fondos), asegurando que sigan siendo legibles y contrastados sobre fondos claros en lugar de desaparecer.
  - **Inversión Inteligente de Textos y Hovers Blancos (text-white):**
    1. Creados selectores CSS específicos que remapean textos y hovers en blanco (`text-white`, `hover:text-white`) a su contraparte oscura (`var(--color-text)`) cuando están ubicados dentro de contenedores de fondo claro (como tarjetas, modales o menús).
    2. Se excluyeron de forma segura a todos los botones que tienen fondos de color (como `bg-indigo-650`, `bg-violet-600`, etc.) utilizando la pseudo-clase `:not`, garantizando que mantengan su texto blanco legible.
  - **Ajustes en Componentes del Dashboard:**
    1. Refactorizado el selector DatePicker de periodos en `App.jsx` para usar la variable de texto general `text-[var(--color-text)]` en lugar de `text-white`, garantizando legibilidad perfecta del año seleccionado y las flechas de navegación en modo claro.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/index.css`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/index.css) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Compilación limpia con Vite (`npm run build`).

---

### [2026-06-21] - CORE-024: Integración de Selector de Periodo por Calendario Premium y Gráfico Consolidado

* **Tipo:** Dashboard / DatePicker / Filtros / UI / UX / Recharts
* **Descripción de Cambios:**
  - **Selector de Periodo por Calendario Premium (DatePicker):**
    1. Diseñado e implementado un selector de periodo (Mes/Año) en la barra de acciones de la cabecera del Dashboard.
    2. Cuenta con una interfaz glassmorphic con fondo translúcido blur (`backdrop-blur-xl bg-slate-950/85`), navegación interactiva de años y una cuadrícula de meses en español.
    3. Muestra un punto indicador de color violeta en los meses que contienen reportes registrados en la base de datos, facilitando la exploración.
    4. Cierre automático por clic fuera del selector mediante `useRef` + Listener global de eventos.
    5. Botón para restablecer el filtro ("Ver Histórico Completo") que regresa el Dashboard al acumulado total.
  - **Lógica de Filtrado Reactivo Multicapa:**
    1. Agregado el estado `selectedPeriod` y el React Memo `filteredPeriodReports`.
    2. Modificado el cálculo de todas las estadísticas agregadas (`totalComision`, `totalCobrado`, `clientesActivos`), acordeones de clientes, charts de BI, costos Dian y el listado de transacciones inferior para consumir `filteredPeriodReports` de forma reactiva.
    3. Integrado el filtro de periodo dentro de los modales de detalle de cada tarjeta (Acumulado, Cobrado, Pendiente), asegurando que el total visualizado coincida exactamente con las filas del sub-listado.
  - **Gráfico de Tendencia Histórica Consolidada:**
    1. Renombrado el gráfico principal a "Comisiones Generales" para reflejar el panorama histórico global.
    2. Mantiene la visualización de la tendencia de todos los tiempos para dar perspectiva histórica.
    3. Se le integró un badge animado animando la presencia de un filtro activo y un indicador visual vertical (`ReferenceLine`) discontinuo sobre el mes específico filtrado para contextualizar el periodo dentro de la línea de tiempo histórica.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Compilación limpia con Vite (`npm run build`).

---

### [2026-06-21] - CORE-023 (Hotfix/Ajustes): Solución a Hook Order Mismatch, Alturas de Recharts (-1) y Reorganización de Botones

* **Tipo:** Corrección de Errores / UI / UX / Responsive / Recharts / React Hooks
* **Descripción de Cambios:**
  - **Corrección de React Hook Order Mismatch:**
    1. Se detectó que las declaraciones de `useMemo` de proyecciones y BI (líneas 5117-5208) ocurrían después del retorno temprano de la pantalla de login (`if (!user)`). Al iniciar sesión, el número y orden de hooks cambiaba, causando un crash en tiempo de ejecución.
    2. Se movieron todos los hooks `useMemo` (`projExistingMonthly`, `projNewMonthly`, `projTotalMonthly`, `projTotalYear`, `nicheChartData`, `biMetrics`) arriba del condicional `if (!user)` (línea 2871), garantizando que se ejecuten incondicionalmente en cada render y resolviendo de raíz el error de React.
  - **Solución a Dimensiones -1 de Recharts en Mobile:**
    1. Se especificaron alturas fijas numéricas en los componentes `ResponsiveContainer` (`height={220}`, `height={112}`, `height={160}`) en lugar del valor porcentual `"100%"` que dependía del padre y fallaba en vistas adaptables.
    2. Se añadió `minWidth={0}` a los contenedores de gráficos para corregir las advertencias y asegurar el renderizado correcto del gráfico de comisiones en celulares.
  - **Reorganización de Botones de Dashboard:**
    1. El botón de estado "Conectado" se transformó en un badge interactivo premium que se muestra discretamente al lado del título principal del Dashboard, reduciendo la carga cognitiva y el desorden.
    2. Las tres acciones principales ("Test Telemetría", "Exportar Métricas", "Conciliación PDF") se agruparon en una cuadrícula responsiva limpia (`grid grid-cols-1 sm:flex`), permitiendo que en móviles se muestren apiladas a lo ancho y ordenadas, y se expandan horizontalmente en pantallas grandes.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Compilación limpia con Vite (`npm run build`).

---

### [2026-06-21] - CORE-023: Rediseño Premium del Dashboard General con Gráficos Interactivos Recharts, BI Avanzado y Reportes PDF

* **Tipo:** Dashboard / Visualización Interactiva / Inteligencia de Negocios / Telemetría / Reportes PDF
* **Descripción de Cambios:**
  - **Gráficos Interactivos Recharts & Framer Motion:**
    1. Reemplazado el listado estático de barras de progreso por una visualización premium interactiva.
    2. Implementado un gráfico `AreaChart` consolidado en la cabecera que muestra la tendencia histórica mensual de comisiones y ventas totales agregadas.
    3. Diseñado un acordeón expandible dinámicamente con animaciones fluidas de `Framer Motion` (`expandedClientId`).
    4. Cada tarjeta de cliente expandida renderiza su propio mini-gráfico `AreaChart` de tendencia histórica comisional individual, además de un panel en grilla de 3 columnas con su esquema de facturación detallado, nicho comercial y acciones.
  - **Radar de Salud de Instancias:**
    1. Integrado el widget visual `Radar de Salud de Instancias` en la columna derecha de Inicio (arriba de la consola de telemetría).
    2. Procesa en tiempo real el estado de cada cliente: Rojo (errores activos sin resolver o ping fallido), Amarillo (latencia > 3000ms o última conexión > 15m), y Verde (totalmente operativo).
    3. Los pings y latencias de telemetría están simulados con coherencia y reactividad en base Sandbox.
    4. Redireccionamiento automático condicional al hacer clic en un cliente con fallos hacia la pestaña "Consola de Errores" aplicando el filtro del cliente.
  - **Métricas de BI en Simulador:**
    1. Agregada una sección de analítica de negocio bajo las tarjetas del simulador.
    2. Muestra un gráfico de donas `PieChart` de participación comisional por nicho vertical comercial de manera proporcional.
    3. Muestra una tabla financiera de eficiencia deduciendo costos DIAN ($150 COP por reporte con facturación DIAN habilitada) del ingreso proyectado mensual y del acumulado del horizonte de meses del simulador.
  - **Modales de Métricas Completos:**
    1. Diseñados y conectados síncronamente los 3 modales de detalle para *Comisión Acumulada*, *Cobrado* y *Por Recaudar*.
    2. Muestran tablas ordenadas con buscadores y sumas de transacciones, junto a botones para registrar pagos directamente o gestionar cobros en el CRM.
  - **Suite de Exportación PDF:**
    1. Completada la funcionalidad en `pdfService.js` para generar: Conciliación Mensual Consolidada, Reporte de Métricas del Sistema, Directorio de Clientes y Ficha de Rendimiento Individual de Cliente.
    2. Vinculados los botones de exportación correspondientes en el dashboard, modales y CRM.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/services/pdfService.js`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/services/pdfService.js) [MODIFY]
* **Compilaciones:** ✅ `dev-dashboard` compila exitosamente (1.38s).

---

### [2026-06-21] - CORE-022: Auditoría y Fortalecimiento de la Gestión de Plantillas Core

* **Tipo:** CLI / Dashboard / Cores / Seguridad / Robustez
* **Descripción de Cambios:**
  - **Endpoint de Sincronización Aislado (Sync -> CLI):**
    1. Creada la función helper `performCoreSync(clave, CLI_ROOT)` en `server.js` para unificar y optimizar la copia de archivos y sanitización de credenciales.
    2. Implementado el nuevo endpoint `POST /api/cores/:clave/sync` en la API Bridge del CLI.
    3. Modificada la UI en `CoreCard.jsx` para que el botón "Sync → CLI" apunte a esta nueva ruta, evitando que se auto-active la plantilla en el wizard o se incremente su versión sin confirmación.
  - **Seguridad en Scaffolds y Entorno:**
    1. Asegurada la verificación del `baseCore` en el endpoint `/api/cores/:clave/scaffold` para prevenir path traversal.
    2. Agregada validación estricta de nombres de variables de entorno `.env.local` (regex `/^[A-Z_][A-Z0-9_]*$/`) tanto en el backend (`POST /api/project/env`) como en el frontend de `CoreCard.jsx` (mostrando un toast de error descriptivo si el usuario ingresa caracteres no permitidos).
  - **Integridad y Build:**
    1. Compilación exitosa del dashboard con Vite (`npm run build`) verificando la compatibilidad de tipos y sintaxis.
* **Archivos Modificados:**
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreCard.jsx) [MODIFY]
  - [`Documentacion PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md`](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]
* **Compilaciones:** ✅ `dev-dashboard` compila exitosamente (955ms).

---

### [2026-06-20] - CORE-021: Fortalecimiento de la Consola de Errores e Incidentes del Dashboard Central

* **Tipo:** Dashboard / Telemetría / Consola de Errores / Diagnostics Heuristics
* **Descripción de Cambios:**
  - **Filtros e Interactividad Avanzada:**
    1. Agregado el estado `selectedErrorStatusFilter` para permitir filtrar incidentes por estado (Activos, Resueltos, Todos).
    2. Agregado el estado `selectedErrorTypeFilter` para segmentar incidentes por severidad (Todos, Errores, Advertencias, Información).
    3. Vinculadas las tarjetas de resumen estadístico de la cabecera ("Fallos Activos", "Clientes Afectados", "Uptime del Motor") como filtros interactivos rápidos de un clic.
  - **De-duplicación y Colapso de Incidentes (Group-by):**
    1. Implementado el interruptor `groupErrorsByMessage` en los filtros que permite de-duplicar errores repetitivos con el mismo mensaje para un cliente.
    2. En el modo agrupado, las incidencias se colapsan a una sola tarjeta con insignia animada indicando la frecuencia de impactos (ej: `x5 Impactos`) y ordenadas por la fecha del último incidente.
  - **Registro Histórico de Notas de Solución:**
    1. Modificada la función `handleResolveFailure` para recibir múltiples IDs (resolviendo incidentes colapsados en bloque) y una nota de texto.
    2. Añadido un formulario inline bajo cada tarjeta que permite escribir una Nota de Solución al marcar el incidente como resuelto, la cual se guarda de manera persistente en Firestore Central junto a `resolvedAt` y `resolutionNote`.
    3. Si un incidente ya está resuelto, se renderiza de forma premium el historial de la solución: `✓ Resuelto (Fecha) - "Nota de Solución"`.
  - **Motor Heurístico Enriquecido:**
    1. Añadidas interpretaciones y planes de acción específicos para errores de CORS (`blocked by CORS policy`, `Access-Control-Allow-Origin`).
    2. Añadidas interpretaciones para errores de deserialización (`JSON.parse`, `Unexpected token`).
    3. Añadidas interpretaciones para permisos y cancelaciones de Firebase Storage (`storage/unauthorized`, `storage/canceled`).
    4. Añadidas interpretaciones para fallas de red de Firestore (`unavailable`, `client is offline`).
    5. Habilitado el botón directo de creación de índice compuesto cuando se detecta un enlace en la traza.
  - **Integridad y Build:**
    1. Compilada la versión de producción exitosamente con Vite sin advertencias de variables sin uso o errores de importación.
    2. Corregido el crash de ejecución (`ReferenceError: groupErrorsByMessage is not defined`) mediante la declaración formal de los 5 estados faltantes: `selectedErrorStatusFilter`, `selectedErrorTypeFilter`, `groupErrorsByMessage`, `resolutionNoteInputId` y `resolutionNoteText` en `App.jsx`.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

### [2026-06-20] - CORE-020: Arquitectura Multi-Core Escalable en template-core-seed y CLI

* **Tipo:** Ecosistema / Core / CLI / Instancias Clientes / Escalabilidad
* **Descripción de Cambios:**
  - **Desacoplamiento de template-core-seed:**
    1. Agregados placeholders `ORDER_STATES` y `COLLECTIONS.ORDERS` en `constants/index.js` para evitar errores fatales de compilación.
    2. Modificado `billingService.js` para abstraer la consulta de facturación mediante un adaptador de datos configurable (`dataAdapter`) inyectable, eliminando el acoplamiento directo con pedidos de e-commerce y añadiendo fallbacks de seguridad.
    3. Refactorizado el hook `useBilling.js` para permitir la configuración de los 4 modelos de facturación (`saveBillingConfig`).
    4. Limpiado `appConfigStore.js` y `appConfigService.js` de más de 15 campos específicos de ventas (e.g. deliverySettings, wholesaleSettings, couponsEnabled) para dejar una plantilla verdaderamente genérica.
    5. Removida la dependencia e imports de FCM/messaging y el test de VAPID en `DeveloperDiagnosticsModal.jsx`.
    6. Eliminadas las credenciales de Firebase central hardcodeadas como fallback en `centralFirebaseService.js`.
  - **Reestructuración de Instancias:**
    1. Creada la carpeta física `/ventas/` bajo `Instancias Clientes/`.
    2. Reubicada la instancia activa `ventas-moni-app` a `Instancias Clientes/ventas/ventas-moni-app/`.
    3. Actualizados los scripts de backup y automatización (`git_backup.ps1`, `menu_backup.ps1`) para soportar recursión e incrementado el escaneo a `-Depth 5` para evitar conflictos con repositorios Git en subcarpetas de cores de forma segura.
    4. Creado el archivo instructivo `Instancias Clientes/README.md`.
  - **Soporte Multi-Core en CLI:**
    1. Implementada la función dinámica `getInstancePath(coreType, projectName)` en `config.js` del CLI.
    2. Agregado el campo `coreType` a las plantillas registradas en `plantillas_registro.json` y a los metadatos de `.prototipe.json` de cada instancia.
    3. Modificado `generator.js` para inyectar automáticamente el `coreType` en la consola central, en la metadata del proyecto y validar la preexistencia de `firestore.rules` y `storage.rules` en la plantilla de origen para evitar sobreescribir las reglas de seguridad personalizadas por defecto.
    4. Actualizados `sync_templates.js` y `sync_clients.js` para operar dinámicamente con la estructura anidada de subcarpetas de cores.
  - **Validación de Compilación y Mapas de IA:**
    1. Copiado el script de generación de mapa de arquitectura semántica para IA (`generate_ia_map.js`) a la subcarpeta `scratch` de `template-core-seed` para resolver el fallo del script `npm run map` / `npm run build`.
    2. Validado el build exitoso de `template-core-seed`, `dev-dashboard` y `App Ventas` localmente.
* **Archivos Modificados:**
  - [`Prototipe-CLI/config.js`](file:///d:/PROTOTIPE/Prototipe-CLI/config.js) [MODIFY]
  - [`Prototipe-CLI/generator.js`](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [`Prototipe-CLI/plantillas_registro.json`](file:///d:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY]
  - [`Prototipe-CLI/sync_clients.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_clients.js) [MODIFY]
  - [`Prototipe-CLI/sync_templates.js`](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/package.json`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/package.json) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/scratch/generate_ia_map.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/scratch/generate_ia_map.js) [NEW]
  - [`Prototipe-CLI/templates/template-core-seed/src/constants/index.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/constants/index.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/services/billingService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/billingService.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/hooks/useBilling.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useBilling.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/store/appConfigStore.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/services/appConfigService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/appConfigService.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/components/admin/settings/DeveloperDiagnosticsModal.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js) [MODIFY]
  - [`git_backup.ps1`](file:///d:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [`menu_backup.ps1`](file:///d:/PROTOTIPE/menu_backup.ps1) [MODIFY]
  - [`Instancias Clientes/README.md`](file:///d:/PROTOTIPE/Instancias%20Clientes/README.md) [NEW]
* **Compilaciones:** ✅ `template-core-seed` (353ms), `App Ventas` (933ms) y `dev-dashboard` (789ms) compilaron exitosamente.

---

### [2026-06-20] - HMR-001: Corrección de Inicialización Duplicada de Firebase en Entornos de Desarrollo

* **Tipo:** Plantillas Core / CLI Templates / Instancias Clientes / Calidad / Desarrollo
* **Descripción de Cambios:**
  - **Evitar error de inicialización duplicada (HMR):** Corregido el bug en la carga de Firebase (`firebaseConfig.js`) que causaba `FirebaseApp named [DEFAULT] already exists` durante las recargas en caliente de Vite (HMR), interrumpiendo el flujo de desarrollo local. Se implementó una verificación síncrona `getApps().length === 0 ? initializeApp(...) : getApp()` y `getFirestore(app)` para reutilizar la instancia existente de manera segura y transparente.
* **Archivos Modificados:**
  - [`Plantillas Core/App Ventas/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/config/firebaseConfig.js) [MODIFY]
  - [`Instancias Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas/ventas-moni-app/src/config/firebaseConfig.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/config/firebaseConfig.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/config/firebaseConfig.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/config/firebaseConfig.js) [MODIFY]
* **Compilaciones:** ✅ Verificadas.

---

### [2026-06-20] - BILLING-001: Rediseño Funcional del Módulo de Facturación y Cobros

* **Tipo:** Dashboard Central / App Ventas Core / CLI Templates / Billing / Escalabilidad
* **Descripción de Cambios:**
  - **Bug del 1% resuelto:** Agregado helper `getCalculatedCommission(report, clientConfig)` en `dev-dashboard/App.jsx` que calcula la comisión real en tiempo real usando la tarifa vigente del CRM, soportando los 4 modelos de cobro: `percentage`, `fixed_per_service`, `flat_monthly` y `dian`.
  - **WhatsApp con número de destino:** `handleSendWhatsApp` ahora extrae el número del cliente desde el CRM (`whatsapp` → `telefono` fallback), limpia no-dígitos y abre `wa.me/{numero}?text={mensaje}`. Campo UI de WhatsApp de Contacto agregado con autodetección y hint visual cuando el número proviene del CRM.
  - **Persistencia de templates en localStorage:** `waTemplates` se inicializa desde `localStorage['dev_wa_templates']` y se persiste en cada edición mediante `useEffect`, sobreviviendo recargas.
  - **Botón Recalcular Historial en Nube:** Agregado `handleRecalculateClientReports(clientId)` con batch de 450 ops/escritura. Botón amber en el footer del modal CRM de configuración. Requiere confirmación antes de ejecutar. Modo sandbox: simulado sin escritura.
  - **Sincronización bidireccional de tarifas (instancia ↔ CRM central):** En `useAppConfigSync.js` (App Ventas, template-ventas, template-core-seed), el listener `onSnapshot` de `clientes_control/{CLIENT_ID}` ahora detecta cambios en `billingMode`, `comisionPorcentaje`, `montoFijoServicio`, `pagoMensualFijo`, `enableDianBilling`, `costoPorFacturaDian` y los propaga silenciosamente a Zustand + `config/settings` local mediante `updateAppConfig`. Garantiza coherencia sin intervención manual del operador de tienda.
  - **Escalabilidad:** La sincronización es automática. Nuevas instancias generadas con CLI heredarán estos comportamientos desde `template-ventas` y `template-core-seed` actualizados.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY] — `getCalculatedCommission`, `handleRecalculateClientReports`, `handleSendWhatsApp`, `waTemplates` localStorage, `waPhone` state, campo WhatsApp UI, botón Recalcular en CRM modal.
  - [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY] — Sincronización bidireccional de billing fields desde clientes_control.
  - [`Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY] — Propagado desde App Ventas.
  - [`Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY] — Mismo fix de sincronización.
* **Compilaciones:** ✅ `dev-dashboard` (1.22s) y `App Ventas` (1.22s) sin errores ni advertencias.

---

### [2026-06-20] - CORE-019: Estandarización Total del Sistema de Telemetría e Interactividad en ventas-moni-app

* **Tipo:** Instancia Cliente / Telemetría / Sincronización / Calidad
* **Descripción de Cambios:**
  - **Problema Raíz Identificado:**
    La instancia `ventas-moni-app` presentaba drift crítico respecto al Core tras la implementación de CORE-018: el hook `useAppConfigSync.js` respondía al ping de forma **automática y silenciosa** (sin mostrar el modal interactivo), y `App.jsx` carecía del estado `activePingRequest`, del listener `'ping-test-requested'` y del modal de "Prueba de Conexión". Adicionalmente, la lógica de descarte de alertas usaba la clave textual `title-message-type` en lugar del `alertId`, causando que alertas de prueba repetidas fueran ignoradas por la caché de localStorage.
  - **Correcciones Aplicadas en `App.jsx`:**
    1. Agregados `activePingRequest` (estado) y `pingTimeoutRef` (ref) para gestionar el ciclo de vida del modal de telemetría.
    2. Creado el helper `getAlertDismissKey(alert)` que prioriza `alert.alertId` sobre la clave textual, garantizando descartes únicos y correctos.
    3. Agregado `useEffect` con listener del evento `'ping-test-requested'`, autocierre en 30s y cleanup del timer al desmontar.
    4. Actualizada la fórmula de `isAlertDismissed` para usar `getAlertDismissKey()`.
    5. Actualizado el `alertKey` de `useEffect([sistemaAlerta])` para incluir `alertId` en el hash de comparación.
    6. Insertado el modal interactivo de "Prueba de Conexión" con diseño idéntico al Core (glassmorphism `rgba(5,8,16,0.82)`, Framer Motion spring, botones de confirmación y descarte).
  - **Correcciones Aplicadas en `useAppConfigSync.js`:**
    1. Reemplazada la auto-respuesta al ping (`updateDoc` inmediato) por el despacho del evento `'ping-test-requested'` con la callback `respond()`.
    2. Agregadas validaciones de expiración (>60s) y comparación `pingTs > responseTs` para evitar procesar pings viejos al recargar la página.
  - **Revisión y Corrección de Bugs Activos en Central (Faro Core):**
    1. **Click-Outside en Dropdowns**: Se agregaron referencias `useRef` y hooks `useEffect` con listeners de `mousedown` para cerrar automáticamente tanto el dropdown de plantillas en `CoreSyncPanel.jsx` como el dropdown de tipo de alerta en `App.jsx` al hacer clic en cualquier lugar fuera de su contenedor.
    2. **Desacoplamiento de ID de Alerta**: Se eliminaron los selectores frágiles `document.getElementById('alert-type-select-wrap')` del dropdown de alerta remota en `App.jsx` del dashboard, refactorizando a un estado React limpio `alertTypeDropOpen` y utilizando una referencia directa para evitar colisiones en DOM si múltiples componentes se renderizan.
  - **Build de Integridad:** ✅ `npm run build` en `ventas-moni-app` (1.15s) y `dev-dashboard` (1.14s) sin errores.
* **Archivos Modificados:**
  - [`Instancias Clientes/ventas-moni-app/src/App.jsx`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/src/App.jsx) [MODIFY]
  - [`Instancias Clientes/ventas-moni-app/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY]
* **Compilaciones:** ✅ `ventas-moni-app` y `dev-dashboard` compilaron exitosamente.


* **Tipo:** Dashboard Central / App Cliente / UI/UX / Telemetría
* **Descripción de Cambios:**
  - **Ping Test Interactivo:**
    1. Rediseñado el ciclo de validación de conexión (Ping Test). En lugar de responder de forma automática y silenciosa, el Dashboard incrementa su timeout de 5 a 30 segundos en [`App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) para dar tiempo a la acción manual.
    2. Corregido el bug de desincronización de relojes locales: modificado el listener de `onSnapshot` en el Dashboard para validar la respuesta (`lastPingResponse`) directamente contra el timestamp del gatillo (`triggerPing`) de Firestore Server, garantizando inmunidad ante cualquier desfase de reloj en la máquina local del desarrollador.
    3. Modificado [`useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) para remover la escritura automática de `lastPingResponse` y en su lugar despachar un evento personalizado `'ping-test-requested'` con una callback `respond()`.
  - **Modal de Prueba de Conexión Reutilizado:**
    3. En [`App.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx), se escucha el evento `'ping-test-requested'` y se almacena la callback en un estado `activePingRequest`.
    4. Se renderiza un modal interactivo que clona y reutiliza con precisión el diseño, tipografías, colores, Framer Motion y backdrop blur (`rgba(5, 8, 16, 0.82)`) del componente `sistemaAlerta` existente, con temática de telemetría e icono de antena.
  - **Robustez frente a Inactividad y Descarte:**
    5. Se implementó un temporizador de autocierre de 30 segundos en la aplicación cliente para ocultar el modal de prueba automáticamente y evitar molestias si el administrador está ocupado, coincidiendo con la expiración por timeout en la central.
    6. Se inyectó un botón secundario discreto de "Descartar prueba" para cerrar manualmente el modal en cualquier momento, además de permitir cerrarlo al presionar el backdrop, limpiando los temporizadores asociados de forma limpia sin lanzar errores.
  - **Despliegue de Reglas de Seguridad a Producción:**
    7. Detectada la discrepancia en las reglas de seguridad de Firestore Central en producción (que carecía del permiso de escritura no autenticada para `lastPingResponse`). Se realizó el despliegue de las reglas del desarrollador en producción en el proyecto `prototipe-ecosistema-control`, permitiendo al cliente responder al ping test con éxito.
  - **Soporte de alertId Único para Alertas Remotas:**
    8. Modificado el Dashboard Central para generar un identificador de alerta único `alertId` basado en un timestamp (`Date.now().toString()`) cada vez que se envía o actualiza una alerta de sistema (tanto en la alerta de prueba como en la manual).
    9. Actualizado el validador del descarte de alertas en `App.jsx` del cliente (y plantillas CLI) para almacenar y comparar la clave `dismissed_remote_alert` contra `alertId` en lugar del texto del título y mensaje. Esto evita que alertas repetidas del Dashboard (como la alerta de prueba) no hagan nada debido a que el cliente ya tenía guardado el descarte de una prueba anterior.
  - **Propagación en Plantillas CLI:**
    10. Replicadas exactamente las modificaciones de `useAppConfigSync.js` y `App.jsx` en los templates base de aprovisionamiento del CLI [`template-ventas`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/) y [`template-core-seed`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/) para asegurar que las nuevas instancias hereden este comportamiento interactivo premium.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/firestore.rules`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [DEPLOYED]
  - [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Plantillas Core/App Ventas/src/App.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/App.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/App.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Compilado exitosamente `dev-dashboard` y `App Ventas` (`npm run build`).

### [2026-06-20] - CORE-017: Detección por Hash MD5 de Drift de Instancias, Exclusión de Mapas de Arquitectura, Consola y Perfil Theme-Aware
* **Tipo:** Dashboard Central / CLI / Servidor / UI/UX / Calidad / Telemetría
* **Descripción de Cambios:**
  - **Detección por Hash MD5 del Drift:**
    1. Reemplazada la lógica SemVer de `isOutdated` en `/api/instancias/list` dentro de `server.js` por una comparación física de hashes MD5 en tiempo real. Ahora el dashboard detecta cambios reales en los archivos del core incluso si el número de versión no se ha incrementado.
  - **Consola de Sincronización Theme-Aware:**
    2. Modificado `getLogStyle` en `CoreSyncPanel.jsx` para reemplazar colores oscuros hardcodeados (como `text-zinc-300` o `text-zinc-400` que resultaban invisibles en modo claro) por variables CSS del sistema de diseño y modificadores de tema (`dark:text-violet-400`, `text-[var(--color-text)]`, etc.). La consola es ahora 100% legible en modo claro y oscuro.
  - **Exclusión de Mapas de Arquitectura Dinámicos:**
    3. Añadidos `mapa_arquitectura.md` y `mapa_arquitectura_ia.md` a `SYNC_EXCLUDED_PATHS` en `server.js` debido a que son archivos auto-generados localmente por instancia y alteraban la paridad del drift. Esto resolvió el estado de desactualización persistente después de sincronizar con éxito.
  - **Canal de Telemetría con Botones Separados (Ping vs Alerta de Prueba):**
    4. Implementada la función `handleSendTestAlert` en `dev-dashboard/src/App.jsx` para inyectar una alerta remota preconfigurada de tipo "info" y actualizar la UI local.
    5. Reemplazado el botón único "Verificar Conexión" por dos botones alineados estéticamente: "Enviar Alerta de Prueba" (que dispara el modal interactivo en el cliente) y "Verificar Conexión" (que realiza la comprobación de ping silenciosa en segundo plano).
  - **Prevención de Reapertura y Flicker de Alertas en App Cliente:**
    6. Modificado `App.jsx` (en `Plantillas Core/App Ventas` y `Prototipe-CLI/templates/template-ventas`) con una referencia `useRef` para comparar las propiedades de `sistemaAlerta` (`alertKey`), previniendo que la alerta cerrada por el usuario se vuelva a abrir al recibir snapshots del documento por otros campos (como `triggerPing` del ping test).
    7. Agregada la variable lógica `isAlertDismissed` para leer síncronamente el estado de localStorage durante el render, eliminando el parpadeo de la alerta al recargar el navegador en la aplicación del cliente.
  - **Traducción y Estilizado HSL de la Consola de Telemetría:**
    8. Traducidos los textos del título ("Consola de Telemetría del Sistema en Vivo") y los estados ("Red Desconectada", "Modo Sandbox", "Conectado a Firestore Central") de inglés a español.
    9. Reemplazados los fondos fijos oscuros de la consola, botones, pestañas de logs y caja de entrada de búsqueda por variables CSS (`var(--color-surface)`, `var(--color-surface-2)`, `var(--color-bg)`) y selectores interactivos adecuados, adaptándose perfectamente al tema claro y oscuro de la aplicación.
  - **Adaptación al Modo Claro/Oscuro del Perfil de Administrador:**
    10. Refactorizado el modal `isProfileModalOpen` en `dev-dashboard/src/App.jsx` para utilizar variables CSS del tema (`bg-[var(--color-surface)]`, `border-[var(--color-border)]`) en lugar de colores oscuros fijos de Slate.
    11. Corregido el contraste de los botones ("Ajustes del Sistema" y "Cerrar Sesión") y las etiquetas de base de datos/entorno utilizando clases HSL responsivas (`text-violet-600 dark:text-violet-400`, `text-red-600 dark:text-red-400`) legibles en ambos modos.
* **Archivos Modificados:**
  - [`Central PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY]
  - [`Central PROTOTIPE/dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`Prototipe-CLI/server.js`](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [`Plantillas Core/App Ventas/src/App.jsx`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/App.jsx) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/App.jsx`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/App.jsx) [MODIFY]
* **Compilaciones:** ✅ Servidor CLI reiniciado y escuchando en puerto 3001. `dev-dashboard` y `ventas-moni-app` compilaron exitosamente. Sincronización física de cores completada con éxito.

### [2026-06-20] - CORE-016: Implementación de Ping-Pong Real, Alertas Remotas Funcionales y Corrección de Token Vinculado

* **Tipo:** Dashboard Central / App Cliente / Seguridad Firestore / Telemetría
* **Descripción de Cambios:**
  - **Ping Test Real (Ping-Pong via Firestore):**
    1. Modificado `handleExecutePingTest` en [`dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) para eliminar la simulación de 1.2s con latencia aleatoria. Ahora el Dashboard escribe `triggerPing: serverTimestamp()` en `clientes_control/{clientId}` y luego abre un `onSnapshot` reactivo esperando el campo `lastPingResponse`.
    2. En el cliente (`useAppConfigSync.js`), al detectar `triggerPing` actualizado, se escribe de inmediato `lastPingResponse: serverTimestamp()` de vuelta en el mismo documento central (Ping-Pong).
    3. El Dashboard calcula la latencia real como `Date.now() - start` al recibir el evento de Firestore. Si no hay respuesta en 5s, muestra `Timeout: El cliente no responde (5s)`.
  - **Alertas Remotas Funcionales:**
    1. Creado [`centralFirebaseService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/centralFirebaseService.js) como singleton perezoso de conexión a la BD central del desarrollador (segunda app de Firebase, nombre `centralDevApp`).
    2. Añadidas variables `VITE_DEVELOPER_CENTRAL_*` al `.env.local` de la App de Ventas para habilitar la conexión secundaria.
    3. Modificado [`useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) para suscribirse en tiempo real al documento `/clientes_control/{CLIENT_ID}` de la BD central. Al detectar `sistemaAlerta`, llama `setConfig({ sistemaAlerta })` actualizando el Zustand Store y activando de inmediato el bloqueo visual en la app cliente.
  - **Token de Telemetría Vinculado (corregido):**
    1. El modal de diagnóstico del Dashboard ahora resuelve el token desde dos fuentes: `cfg.telemetryToken` (campo en Firestore) o `telemetryTokens.find(...)` como fallback dinámico. Muestra estado visual `Activo`/`Sin Registro` según resultado.
    2. Actualizado el flujo de aprovisionamiento principal (línea ~4461) y el de `CoreSyncPanel` para guardar `telemetryToken` dentro del documento de `clientes_control`, eliminando la dependencia en consultas cruzadas.
  - **Reglas de Seguridad Firestore (firestore.rules):**
    1. Modificada la regla de `clientes_control/{clientId}` para separar `create/delete` (solo autenticados) de `update` (autenticados O cualquiera que solo actualice el campo `lastPingResponse` usando `affectedKeys().hasOnly`). Esto permite que el cliente responda al Ping sin autenticación de forma segura.
  - **Propagación a CLI Templates:**
    - Propagados `centralFirebaseService.js` y `useAppConfigSync.js` actualizados a `template-ventas` y `template-core-seed`.
* **Archivos Modificados:**
  - [`dev-dashboard/src/App.jsx`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [`dev-dashboard/firestore.rules`](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/firestore.rules) [MODIFY]
  - [`Plantillas Core/App Ventas/src/services/centralFirebaseService.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/centralFirebaseService.js) [NEW]
  - [`Plantillas Core/App Ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Plantillas Core/App Ventas/.env.local`](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.env.local) [MODIFY]
  - [`Prototipe-CLI/templates/template-ventas/src/services/centralFirebaseService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/centralFirebaseService.js) [NEW]
  - [`Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/hooks/useAppConfigSync.js) [MODIFY]
  - [`Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/services/centralFirebaseService.js) [NEW]
  - [`Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js`](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-core-seed/src/hooks/useAppConfigSync.js) [MODIFY]
* **Compilaciones:** ✅ `dev-dashboard` y `App Ventas` compilaron correctamente sin errores.

### [2026-06-20] - CORE-015: Rediseño Premium de la Interfaz de Diagnósticos (Dashboard Central)
* **Tipo:** Dashboard Central / UI/UX / Calidad / Glassmorphism
* **Descripción de Cambios:**
  - **Rediseño Estético del Modal de Diagnóstico:**
    1. Eliminación total de bordes rígidos y toscos de color claro/gris sólido en contenedores principales, cuadros de Ping Test, Garantía de Reporte de Fin de Mes, Alertas Remotas, campos de formulario y botones.
    2. Adopción de diseño de tipo **glassmorphism** premium: fondo translúcido (`bg-[#0d121f]/95`), desenfoque de fondo profundo (`backdrop-blur-2xl`), borde de encapsulamiento casi invisible (`border-white/[0.06]`) y sombras tridimensionales profundas (`shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]`).
    3. Tarjetas superiores de comisiones rediseñadas con cajas adaptativas translúcidas (`bg-white/[0.02]`) y bordes suaves (`border-white/[0.03]`) que se integran de forma nativa al layout financiero.
    4. Pulido de inputs, selectores y textareas utilizando estilos planos oscuros semi-translúcidos y transiciones suaves de foco elástico en violeta.
    5. Botones reconstruidos usando gradientes de marca elásticos y sombreado envolvente (Ping Test, Guardar Alerta, Cerrar Diagnóstico).
* **Archivos Modificados:**
  - [dev-dashboard/src/App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]

### [2026-06-20] - CLI-019: Replicabilidad Automática de Alertas y Reinicio en CLI Templates (Ecosistema)
* **Tipo:** Ecosistema / CLI / Plantillas / Replicabilidad
* **Descripción de Cambios:**
  - **Sincronización a CLI Templates (`template-ventas`):**
    1. Ejecutado el script de sincronización universal `sync_templates.js` para propagar los cambios de la aplicación de ventas core (`Plantillas Core/App Ventas`) directamente a la plantilla del CLI (`Prototipe-CLI/templates/template-ventas`).
    2. Con esto se asegura que absolutamente todas las futuras aplicaciones que se creen usando el CLI hereden de forma nativa e integrada:
       - El listener en tiempo real de `sistemaAlerta` con modal de bloqueo de pago/avisos remotos.
       - El modal de confirmación visual al reportarse con éxito la telemetría mensual de facturación.
       - El soporte de reinicio automático mensual e inicialización a cero.
    3. El script de validación compila correctamente la plantilla mediante `npm run build` en el entorno de destino, garantizando la integridad sintáctica y la ausencia de errores en tiempo de ejecución.
* **Archivos Modificados:**
  - [Prototipe-CLI/templates/template-ventas/](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/) [MODIFY]

### [2026-06-19] - FIX-015: Saneamiento Definitivo de FCM, Reinicio de Comisiones y Telemetría Interactiva (Ecosistema)
* **Tipo:** Ecosistema / Core / CLI / Dashboard Central / Calidad / Remoción de FCM
* **Descripción de Cambios:**
  - **Saneamiento Definitivo de FCM (Firebase Cloud Messaging):**
    1. Eliminación física de archivos redundantes de mensajería push: `firebase-messaging-sw.js` (service worker), `useFCMPermission.js` (hook) y `SoftPushPrompt.jsx` (componente prompt) tanto del Core (`Plantillas Core/App Ventas`), del CLI (`templates/template-core-seed/` y `template-ventas/`), como de la instancia activa (`ventas-moni-app`).
    2. Limpieza de imports e infraestructura en layouts y componentes: Removidas importaciones de `firebase/messaging` y lógica de solicitud de permisos en `firebaseConfig.js`, `DeveloperDiagnosticsModal.jsx`, `AdminLayout.jsx`, `ClientLayout.jsx`, `PortalLayout.jsx` y `OrderTracking.jsx` en el Core y Moni App.
    3. Remoción del CLI: Eliminadas preguntas interactivas de variables de mensajería (`messagingSenderId` y `centralMessagingSenderId`) en `cli.js`, y omitida la generación de llaves criptográficas VAPID (`web-push`) y reemplazos automáticos de service workers en `generator.js`, `server.js` y `sync_templates.js`.
  - **Optimización de Métricas de Comisiones en Dashboard Central:**
    1. **Reinicio Automático Mensual:** Modificada la agregación del dashboard para filtrar reportes que coincidan estrictamente con el periodo actual (`currentPeriod = YYYY-MM`), logrando que al cambiar de mes las comisiones por cliente inicien automáticamente en cero sin destruir el historial en la pestaña de facturación.
    2. **Reinicio Manual a Demanda:** Creado botón de reseteo rápido en el listado del gráfico de comisiones que invoca `handleResetClientCommission`. Al presionarlo, escribe `fechaCorteComisiones: serverTimestamp()` en `clientes_control` de Firestore (o fecha local en Sandbox), ignorando de inmediato reportes antiguos en el gráfico del dashboard.
    3. **Corrección de Bugs en Barras de Progreso:** Resuelta la división por cero que producía `NaN` en `pctWidth` cuando todos los clientes tenían $0 de comisión, y corregido el ancho de la barra para renderizarse al 0% real si no hay comisiones (evitando el mínimo visual artificial del 3%).
  - **Telemetría Interactiva (Live Monitor):**
    1. Rediseñado el Live Monitor de la consola de telemetría para hacer que todos los registros sean interactivos/clickeables.
    2. Integrado modal flotante visor de eventos estilo terminal retro que detalla el cliente, severidad del evento, fecha y hora exactas, y muestra un visor JSON formateado con opción de copia al portapapeles.
    3. Conectado el flujo pasando los metadatos `docData` a las llamadas `addLog` en los listeners en tiempo real de `reportesBilling` y `app_failures`.
  - **Higiene Visual:**
    1. Eliminada comilla suelta/backtick `` ` `` que se había filtrado accidentalmente en el renderizado del listado de comisiones en `App.jsx` (línea 5350).
* **Archivos Modificados:**
  - [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [firebaseConfig.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/config/firebaseConfig.js) [MODIFY]
  - [DeveloperDiagnosticsModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/settings/DeveloperDiagnosticsModal.jsx) [MODIFY]
  - [AdminLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/AdminLayout.jsx) [MODIFY]
  - [ClientLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/ClientLayout.jsx) [MODIFY]
  - [PortalLayout.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/layouts/PortalLayout.jsx) [MODIFY]
  - [OrderTracking.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/OrderTracking.jsx) [MODIFY]
  - [.env.example](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.env.example) [MODIFY]
  - [cli.js](file:///d:/PROTOTIPE/Prototipe-CLI/cli.js) [MODIFY]
  - [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]
  - [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [sync_templates.js](file:///d:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]
  - [ventas-moni-app/.env.local](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/.env.local) [MODIFY]
  - Archivos eliminados: `firebase-messaging-sw.js` (Core, CLI Seed, CLI template-ventas, Moni App), `useFCMPermission.js` (Core, Moni App), `SoftPushPrompt.jsx` (Core, Moni App) [DELETE]

### [2026-06-19] - FIX-014: Visualización de Clientes Nuevos y Auto-configuración de Telemetría (Ecosistema)
* **Tipo:** Frontend / Dashboard Central / Corrección de Bug / Automatización
* **Descripción de Cambios:**
  - **Diagnóstico del problema:**
    1. Los clientes recién registrados (como `moni-app`) no aparecían en el "CRM de Clientes" ni eran contabilizados en el indicador de "Clientes Activos" del Dashboard General porque dependían únicamente de la existencia de reportes en `reportesBilling`.
    2. Adicionalmente, al reportar facturación desde una nueva instancia, se generaba un error fatal por falta de configuración de telemetría (`VITE_DEVELOPER_TELEMETRY_ENDPOINT` y token vacíos en el `.env.local` del cliente).
  - **Corrección en `App.jsx`**: Se modificó el cálculo de `clientesActivos` para basarse en `clientesSaas.filter(c => !c.archived).length` (el listado real de clientes en `clientes_control` de Firestore) en lugar del total de clientes con reportes.
  - **Estandarización de `clientAggregated`**: Se inicializa la agregación mapeando primero todos los clientes registrados en `clientesSaas`. Posteriormente, se acumulan las comisiones/ventas del historial de reportes.
  - **Automatización de Inyección de Telemetría (Blindaje)**: Se integró un flujo de inyección automática de variables de entorno en el handler de registro de la Consola Central (`onRegisterClient`). Tras completar el registro en Firestore, el dashboard lee el archivo `.env.local` de la instancia a través de la API local de control, inyecta las credenciales requeridas (`VITE_DEVELOPER_TELEMETRY_ENDPOINT`, `VITE_DEVELOPER_TELEMETRY_TOKEN` autogenerado y `VITE_DEVELOPER_CLIENT_ID`), y escribe de vuelta el archivo. Esto elimina el paso manual propenso a fallos y garantiza que el cliente quede pre-configurado de inmediato.
  - **Instancia Moni Configurada**: Se actualizó manualmente el archivo `.env.local` de `ventas-moni-app` con su respectivo token registrado (`moni-app-token-1781921496178`) y endpoint de telemetría para corregir el bloqueo en ejecución.
* **Archivos Modificados:**
  - [App.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [ventas-moni-app/.env.local](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/.env.local) [MODIFY]

### [2026-06-19] - CORE-013: Sincronizador Core → Instancias Clientes Desde Dashboard (Despliegue en Lote)
* **Tipo:** CLI / Backend / Frontend / Ecosistema
* **Descripción de Cambios:**
  - **Diagnóstico y corrección arquitectural:** El `CoreSyncPanel.jsx` en el dashboard estaba conectado a `/api/git/sync-core-to-clients-stream` que opera sobre ramas Git (`cliente/xxx`). Este modelo no coincide con la arquitectura real del proyecto donde los clientes son directorios físicos independientes en `Instancias Clientes/`. Se corrige implementando nuevos endpoints basados en directorios físicos.
  - **Nuevo endpoint `GET /api/instancias/list`** en `server.js`: Escanea `D:/PROTOTIPE/Instancias Clientes/`, lee `.prototipe.json` de cada carpeta, compara versión cliente vs versión real del core (leída del `package.json` del core), y retorna lista agrupada por plantilla con delta de versión (`isOutdated`, `clientVersion`, `coreVersion`).
  - **Nuevo endpoint SSE `GET /api/instancias/sync-and-deploy-stream`** en `server.js`: Sincronización física diferencial por hash MD5 en 6 fases: (1) Detección de diferencias, (2) Backup temporal de archivos a modificar, (3) Copia de archivos del core al cliente respetando `SYNC_EXCLUDED_PATHS`, (4) Build de integridad con `npm run build`, (5) Actualización de `version` en `.prototipe.json` y limpieza de backup, (6) Deploy opcional a Firebase Hosting. Rollback automático si el build falla.
  - **Nueva constante `SYNC_EXCLUDED_PATHS`** y helpers `getSyncFilesRecursive()` / `getSyncFileHash()` en `server.js` para excluir consistentemente archivos de marca del cliente (`.env.local`, `.firebaserc`, `firebase.json`, `src/config/firebaseConfig.js`, etc.).
  - **`import crypto from 'crypto'`** añadido al bloque de imports de `server.js` para soporte de hash MD5 de archivos.
  - **Reescritura completa de `CoreSyncPanel.jsx`**: Cambio de fuente de datos de `/api/git/cores-and-clients` a `/api/instancias/list`. Nuevo toggle deploy/solo-compilar. Badges de versión por cliente (verde si al día, ámbar con flecha si desactualizado). Estados por fase por cliente: `syncing` → `building` → `deploying` → `success`/`error`. Stream SSE conectado a `/api/instancias/sync-and-deploy-stream`.
* **Archivos Modificados:**
  - [server.js](file:///d:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY] (+import crypto, +SYNC_EXCLUDED_PATHS, +getSyncFilesRecursive, +getSyncFileHash, +GET /api/instancias/list, +GET /api/instancias/sync-and-deploy-stream)
  - [CoreSyncPanel.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx) [MODIFY] (Reescritura completa con nueva fuente de datos y UI mejorada)
  - [mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

### [2026-06-19] - Lanzamiento de Core Estable v1.0.3 e Inicialización de Instancia Cliente (Moni) - Ecosistema
* **Tipo:** Core / Git Release / Aprovisionamiento / Despliegue
* **Descripción de Cambios:**
  - **Fusión en Producción (Release):** Consolidación de la rama `develop` (limpia de Cloud Functions y con rediseños visuales aprobados) en la rama estable `produccion` del repositorio Core (`prototipe-core-ventas`).
  - **Empaquetado en CLI:** Ejecutada la sincronización de plantillas (`sync_templates.js`) a partir del Core estable para disponibilizar la plantilla oficial `template-ventas` higienizada y libre de tokens en la CLI.
  - **Aprovisionamiento Físico de Cliente:** Creada y configurada la primera carpeta física de cliente independiente en `D:\PROTOTIPE\Instancias Clientes\ventas-moni-app` utilizando la plantilla sanitizada de la CLI.
  - **Configuración y Seguridad Git:** Inicializado repositorio Git independiente en la instancia, inyectados Git hooks de pre-commit, configurado el archivo `.gitignore` y desindexado `node_modules` de Git.
  - **Autogestión de Base de Datos (Onboarding Nativo):** Limpiada por completo la base de datos Firestore remota del proyecto de Firebase `ventas-moni-app` para permitir que el cliente viva el flujo de onboarding nativo (registro de administrador y configuración de marca) al entrar al hosting por primera vez.
  - **Siembra Opcional en CLI:** Modificados `cli.js` y `generator.js` para añadir un prompt de confirmación interactivo que pregunta al desarrollador si desea inyectar datos de prueba iniciales en Firestore antes de ejecutar la acción, previniendo cargas accidentales de información de ejemplo.
  - **Corrección de Bug de Scroll en Modales:** Corregido comportamiento en el helper `ThemeModalLock` dentro de `AppearanceSettings.jsx` en la plantilla Core y la aplicación cliente. Se sustituyó la lectura del estilo computado de overflow (que quedaba permanentemente capturado como `hidden` por doble montaje de efectos en Strict Mode) por un restablecimiento limpio a un string vacío (`""`), asegurando que el body recupere siempre su scroll al cerrar el selector de temas.
  - **Despliegues:** Compilado e instalado localmente (`npm run dev` en `localhost:5173`) y desplegado a producción en Firebase Hosting (`https://ventas-moni-app.web.app`).
* **Archivos Modificados:**
  - [firebase.json](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firebase.json) [MODIFY] (Remoción de functions)
  - Carpeta `/functions` [DELETE] (Remoción de funciones)
  - [plantillas_registro.json](file:///d:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) [MODIFY]
  - [walkthrough.md](file:///C:/Users/Sergio/.gemini/antigravity/brain/d5d930d0-5330-4c01-acfb-b2c584983dbc/walkthrough.md) [MODIFY]
  - [Instancias Clientes/ventas-moni-app/](file:///d:/PROTOTIPE/Instancias%20Clientes/ventas-moni-app/) [NEW] (Nueva instancia independiente)

### [2026-06-19] - Auditoría de Rendimiento y Optimización de Base de Datos - Ecosistema
* **Tipo:** Core / Rendimiento / Base de Datos / Calidad / Producción
* **Descripción de Cambios:**
  - **Identificación de Fugas:** Detectada fuga de lecturas duplicadas en el montaje de hooks de React Query + listeners de Firestore (`onSnapshot` y `getDocs` ejecutados en paralelo).
  - **Falta de Límites:** Diagnóstico de lecturas desmedidas por falta de filtros en pedidos históricos del panel de administración.
  - **POS Offline Sync:** Propuesta de sincronización delta para IndexedDB para evitar el consumo de ancho de banda y lecturas completas de clientes.
  - **Documento de Auditoría:** Generado el reporte oficial de base de datos en `auditoria_rendimiento_db_2026.md` y de costos de Firebase en `analisis_costos_firebase_2026.md`, ambos sincronizados en los mapas de documentación.
* **Archivos Modificados:**
  - [auditoria_rendimiento_db_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_rendimiento_db_2026.md) [NEW]
  - [analisis_costos_firebase_2026.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/analisis_costos_firebase_2026.md) [NEW]
  - [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [mapa_aplicacion.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

### [2026-06-19] - Rediseño Premium de la Interfaz del Catálogo (Laboratorio Visual Fase 3) - App Ventas
* **Tipo:** Core / UI/UX / Animaciones / Responsividad / Catálogo
* **Descripción de Cambios:**
  - **Cabecera y Buscador Sticky Glassmorphic:** Cabecera de búsqueda con efecto glassmorphic translúcido pegajoso (`sticky top-0 z-40 bg-app/85 backdrop-blur-xl`), removiendo por completo cualquier línea de borde inferior oscura rígida (`border-none`) para que se integre elegantemente con la interfaz limpia. Se inyectaron efectos de sombreado elástico (`ring-4 ring-primary/10`) al enfocar el buscador.
  - **Chips de Categorías Bouncy:** Rediseñados los chips de categoría a pastillas flotantes redondeadas (`rounded-full`), e implementada una animación de fondo deslizante interactivo con Framer Motion (`layoutId="activeCategoryBg"`) que fluye suavemente y con rebote de una categoría a otra.
  - **Héroe Promocional Parallax (CatalogBanner):** Rediseñado el banner para abarcar la imagen de fondo uniformemente en toda la tarjeta (`object-cover`) e implementado un overlay asimétrico lateral que evita oscurecer el producto. Inyectado un sello circular flotante (sticker) que rota y escala en hover, un resplandor ambiental dinámico en hover y un barrido de destellos metalizados en las etiquetas de oferta.
  - **Tarjetas de Producto (ProductCard):** Rediseñada la tarjeta con curvaturas de 20px, sombras multicapa finas y flotantes (`shadow-[0_8px_30px_rgb(0,0,0,0.03)]`) que flotan a `y: -6` en hover. Las insignias de estado se rediseñaron como píldoras de cristal translúcidas y se agregó una microinteracción de rotación/escala en el botón de agregar (`+`).
* **Archivos Modificados:**
  - [ClientCatalog.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCatalog.jsx) [MODIFY]
  - [CatalogBanner.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/CatalogBanner.jsx) [MODIFY]
  - [ProductCard.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]

### [2026-06-19] - Stock Infinito para Productos Preparados / Ilimitados - App Ventas
* **Tipo:** Core / Inventario / Transacciones / Firebase / UI/UX
* **Descripción de Cambios:**
  - **Soporte en Esquemas:** Agregado el campo opcional `stockInfinito` de tipo booleano al esquema de validación Zod `productSchema` en `inventorySchemas.js` para asegurar consistencia e integridad de tipos.
  - **Toggle UI en Formulario:** Añadido un interruptor/checkbox premium en `ProductFormModal.jsx` dentro de `renderVariantsSection` para marcar el producto como ilimitado. Si el producto tiene stock infinito activo, los inputs de stock (tanto en vista de producto simple como en variante múltiple) se ocultan o muestran un indicador de lectura "∞ Ilimitado", y se omite la validación numérica del stock en el modal.
  - **Transformación de Datos al Guardar:** Modificada la preparación de datos del formulario en `ProductFormModal.jsx` para forzar el valor de stock de todas las variantes a `9999` cuando `stockInfinito` sea verdadero. Esto asegura compatibilidad nativa con la lógica existente de stock ilimitado en el resto del front-end.
  - **Listados de Inventario:** Modificado `AdminInventory.jsx` (tabla de escritorio y tarjetas móviles) para detectar el flag `stockInfinito` y mostrar un badge de badge visual color morado con el texto "∞ Ilimitado" en lugar del conteo de unidades y alerta de stock bajo.
  - **Excepción de Alertas:** Actualizadas las funciones de cálculo de stock bajo en `AdminStockAlerts.jsx` y en las métricas de `AdminHome.jsx` para omitir y silenciar alertas de reabastecimiento en productos marcados con stock infinito.
  - **Blindaje Transaccional de Pedidos:** Modificado `orderService.js` en todos sus métodos de alteración de stock (`createOrder`, cancelación de órdenes en `updateOrderStatus`, completado de órdenes en `updateOrderStatus` y flujo de creación offline) para que verifiquen el flag `productInfo.data.stockInfinito` y omitan cualquier validación, decremento o restauración de stock de variantes, manteniendo intacta la contabilidad de ventas `salesCount`.
  - **Visualización en Tienda de Clientes (Pulido):** Modificado `ProductDetailPage.jsx` para que muestre el badge `"Disponible"` en lugar de `"9999 disponibles"`. Modificados también `ProductCard.jsx` y `ProductDetailModal.jsx` para reescribir `isOutOfStock` (fuerza `false`), `stockConsolidado` (fuerza `9999`) y `isUnlimited` para considerar de manera proactiva el flag `stockInfinito` del producto. Se limitó el selector de cantidad máxima a `999` en productos ilimitados.
* **Archivos Modificados:**
  - [inventorySchemas.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/schemas/inventorySchemas.js) [MODIFY]
  - [ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
  - [AdminInventory.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [orderService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/orderService.js) [MODIFY]
  - [AdminStockAlerts.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY]
  - [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY]
  - [ProductDetailPage.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [ProductCard.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductCard.jsx) [MODIFY]
  - [ProductDetailModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/client/catalog/ProductDetailModal.jsx) [MODIFY]

### [2026-06-19] - Rediseño Premium de la Gestión de Pedidos (Laboratorio Visual Fase 2) - App Ventas
* **Tipo:** Core / UI/UX / Rediseño / Responsividad
* **Descripción de Cambios:**
  - **Tarjeta Comanda Asimétrica:** Refactorizado el maquetado de `OrderCard` en `AdminOrders.jsx` para adoptar la estructura responsiva asimétrica de 12 columnas en desktop, elástico y adaptado al tema. En móviles, se reordenaron los elementos estructurando una cabecera con el número de pedido y badges, un contenedor interno para agrupar los artículos con icono de paquete y un pie de página limpio con el monto y los botones interactivos (QR y Chevron) de forma simétrica sin eliminar ninguna variable ni funcionalidad.
  - **Grid de Métricas Rápidas Estilo Wallet:** Rediseñado el grid de tarjetas de métricas rápidas (Pendientes, Completados, Créditos) usando bordes finos responsivos, curvatura amplia `rounded-3xl` y hover de escala suave. La tarjeta de Créditos cuenta con una animación de brillo elástica que utiliza la variable CSS `--color-primary-light` dinámica para adaptarse a cualquier tema activo (ej. SmartFix) sin colores rígidos hardcoded.
  - **Carrusel de Filtros Planos con Contadores:** Rediseñado el carrusel de filtros de estado para mostrar tarjetas wallet compactas con contadores dinámicos alimentados por `filterCounts`. Se incorporó el espaciado `-mx-4 px-4` en móviles para que fluya hasta el borde físico de la pantalla de forma impecable sin recortes de sombras.
* **Archivos Modificados:**
  - [AdminOrders.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminOrders.jsx) [MODIFY]

### [2026-06-19] - Estabilización de UI, Correcciones y Catálogo de Estilos - App Ventas
* **Tipo:** Core / UI/UX / Bugfix / Documentación / Estilos
* **Descripción de Cambios:**
  - **Adaptabilidad de Temas HSL:** Modificada la cabecera curvada superior y la tarjeta wallet de "Caja de Hoy" en `AdminHome.jsx` para usar el degradado dinámico de marca (`from-primary to-primary-dark`) en lugar de tonos estáticos.
  - **Diseño Sobrio y Coherente:** Rediseñadas las tarjetas secundarias de balances (`Ventas Totales`, `Por Cobrar`, `Pedidos`) a un estilo de superficie neutral (`bg-surface border border-app text-app`) con badges e iconos vectoriales Lucide en colores pastel translúcidos, eliminando colisiones visuales cromáticas de marca.
  - **Soporte de Hover sin Recortes:** Añadida la propiedad `md:overflow-visible` al contenedor de tarjetas, previniendo que en computadoras se corten los bordes y las sombras en el hover.
  - **Carrusel edge-to-edge en Celulares:** Integrado el margen negativo y el padding responsivo (`-mx-4 px-4`) en móviles, permitiendo que el carrusel se desplace libremente hasta los bordes físicos de la pantalla.
  - **Fijación de Bug de Scroll:** Modificado el componente helper `ThemeModalLock` en `AppearanceSettings.jsx` para restablecer la propiedad `overflow` del body a vacío (`''`) al desmontarse, solventando el bug de congelamiento de scroll al cerrar el modal de paleta de colores.
  - **Catálogo de Estilos Visuales:** Creado y catalogado el archivo de estándares de estilos del ecosistema en `catalogo_estilos_ui.md`.
* **Archivos Modificados:**
  - [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx) [MODIFY], [AppearanceSettings.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx) [MODIFY], [catalogo_estilos_ui.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Estilos/catalogo_estilos_ui.md) [NEW], [mapa_documentacion_ia.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

### [2026-06-19] - Rediseño Premium de Inicio del Administrador (Laboratorio Visual Fase 1) - App Ventas
* **Tipo:** Core / UI/UX / Rediseño / Responsividad
* **Descripción de Cambios:**
  - **Cabecera Curva con Degradado:** Implementada una cabecera superior curvada (`rounded-b-[40px]`) con degradado elástico de color primario a índigo. Muestra un saludo contextual dinámico basado en la hora, la fecha actual formateada en español y el logo de la tienda o fallback adaptativo sin deformaciones.
  - **Carrusel de Tarjetas Financieras (Wallet Cards):** Diseñado un grid-carrusel responsivo de tarjetas financieras con solape negativo (`-mt-12`). En móviles se desplaza de forma horizontal con comportamiento snap y ocultación de scrollbars. En computadoras se adapta a una rejilla.
  - **Maquetación Premium de Tarjetas:** Las 4 tarjetas de balance (`Caja de Hoy`, `Ventas Totales`, `Por Cobrar / Cartera`, `Pedidos y Alertas`) cuentan con degradados vibrantes, sombras de elevación premium y desgloses de ingresos (efectivo, transferencia y crédito).
  - **Transacciones Recientes:** Implementado un listado interactivo con los 5 pedidos más recientes. Cada ítem incluye el nombre del cliente (o "Venta POS"), identificador del pedido, fecha relativa e iconos vectoriales Lucide dinámicos rodeados por círculos en colores pastel translúcidos según su estado, con redirección inteligente.
  - **Accesos Rápidos:** Diseñados botones minimalistas de accesos directos con animaciones framer-motion de escala e interacción fluida.
* **Archivos Modificados:**
  - [AdminHome.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminHome.jsx)

### [2026-06-19] - Auditoría y Estabilización del Sistema de Notificaciones - App Ventas
* **Tipo:** Core / UI/UX / Robustez / Notificaciones / Bugfix
* **Descripción de Cambios:**
  - **Suscripción de Conteo en Tiempo Real:** Creada la función `subscribeToUnreadCount` en `notificationCenterService.js` para escuchar los documentos con `status == 'unread'` reactivamente desde Firestore. Refactorizado el hook `useNotificationCenter.js` para consumir esta suscripción en lugar del filtrado local en memoria del primer lote paginado, solucionando el bug de desajuste del contador de no leídos.
  - **Diseño Visual Dinámico y Premium:** Actualizado `NotificationHistoryTray.jsx` para importar de manera selectiva y renderizar dinámicamente iconos premium de `lucide-react` en base a `meta.icon` (en lugar de la campana `🔔` estática), mapeados con clases literales de color del sistema de diseño Tailwind para evitar la depuración del linter y optimizar la UX.
  - **Pipeline de Toasts Robustecida:** Refactorizado el useEffect generador de Toasts en `AdminLayout.jsx`, `ClientLayout.jsx` y `PortalLayout.jsx`. Ahora itera sobre todas las notificaciones no leídas recientes (edad < 20 segundos) que no estén ya encoladas localmente, asegurando que múltiples notificaciones concurrentes (por ejemplo, pedidos y abonos que llegan juntos) muestren su respectiva ventana flotante sin omitir avisos.
  - **Limpieza de Linter:** Removida la importación no utilizada `AlertTriangle` en `PortalMensajero.jsx` para garantizar un bundle libre de variables huérfanas.
* **Archivos Modificados:**
  - `notificationCenterService.js`, `useNotificationCenter.js`, `NotificationHistoryTray.jsx`, `AdminLayout.jsx`, `ClientLayout.jsx`, `PortalLayout.jsx`, `PortalMensajero.jsx`

### [2026-06-19] - Optimización de Bundle y Depuración de Importaciones (ESLint Clean Up) - App Ventas
* **Tipo:** Mantenimiento / Optimización / Calidad de Código
* **Descripción de Cambios:**
  - **Limpieza de Importaciones y Parámetros:** Depuradas importaciones en desuso de Firestore (como `getDoc`, `orderBy`, `addDoc`, `updateDoc`, `setDoc`, `where`, `query`) en los servicios de anuncios, inventario, órdenes, créditos, analíticas de códigos QR y seguimiento.
  - **Saneamiento de Firmas:** Removido el parámetro no utilizado `creditId` en `reportCreditPayment` (`creditService.js`) y `pin` en `authenticateEmployeeByPin` (`employeeService.js`).
  - **Resolución de Warnings en PDF:** Corregido en `pdfService.js` la inicialización inútil de la variable `saldo`, reemplazando el operador nullish coalescing `??` sobre `Number(...)` por `||` para mitigar el error de expresión nullish constante en ESLint, y removida la firma no utilizada de `orders` en `exportCreditsReportPDF`.
  - **Control de Linter en PortalVendedor:** Removidas las desestructuraciones redundantes de `appIcon` y `whatsappAdmin` en `PortalVendedor.jsx`, e inyectados comentarios de desactivación de la regla `react-hooks/set-state-in-effect` sobre llamadas de estado asíncronas / debounced seguras.
* **Archivos Modificados:**
  - `adService.js`, `clientNotificationService.js`, `creditService.js`, `employeeService.js`, `inventoryService.js`, `orderService.js`, `qrAnalyticsService.js`, `trackingAnalyticsService.js`, `pdfService.js`, `inventorySchemas.js`, `PortalVendedor.jsx`

### [2026-06-19] - Auditoría y Optimización de Créditos y Saldos (Módulo 5) - App Ventas
* **Tipo:** Core / UI/UX / Rendimiento / Base de Datos / Transacciones
* **Descripción de Cambios:**
  - **Estandarización de Modales:** Refactorizados los modales de abonos en `AdminCredits.jsx` y `ClientCredits.jsx` utilizando la plantilla común `ModalTemplate` de forma consistente, unificando estilos visuales, overlays y control de scroll.
  - **Eliminación de useOrders:** Removido por completo el hook `useOrders()` en `AdminCredits.jsx` eliminando la suscripción reactiva innecesaria a todos los pedidos del comercio al consultar cartera de deudas.
  - **Optimización de PDF de Cartera:** Modificada la función `exportCreditsReportPDF` en `pdfService.js` sustituyendo la consulta completa de la colección de créditos por una consulta filtrada a créditos activos (`where('estado', '==', 'activo')`), mitigando lecturas masivas en memoria.
  - **Blindaje Transaccional de Saldos:** Asegurada la expresión de cálculo de saldo pendiente en la transacción `addPaymentToCredit` de `creditService.js` implementando precedencia lógica correcta: `const currentSaldo = data.saldoPendiente ?? data.saldoPending ?? data.montoTotal`, evitando fallos de carrera o valores nulos.
* **Archivos Modificados:**
  - [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
  - [ClientCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ClientCredits.jsx) [MODIFY]
  - [pdfService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY]
  - [creditService.js](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/creditService.js) [MODIFY]

### [2026-06-18] - Elaboración de Checklist de Auditoría del Core (App Ventas)
* **Tipo:** Mantenimiento / Auditoría / Documentación
* **Descripción de Cambios:**
  - **Creación de Checklist Técnico:** Diseñado y estructurado un checklist específico de control de calidad y blindaje técnico para la plantilla core `App Ventas`. Cubre auditoría de fugas de sesión, persistencia de lockout PIN, viewport en móvil para modales, inconsistencias de transacciones Firebase en Bodega, cuellos de botella por sincronización masiva IndexedDB en POS y condiciones de carrera en abonos de créditos.
  - **Sincronización de Mapas:** Registrada la entrada en `mapa_documentacion_ia.md` con su respectivo Criterio de Decisión y control en `tareas_pendientes.md`.
* **Archivos Modificados:**
  - [checklist_auditoria_core.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/checklist_auditoria_core.md) [NEW]
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [tareas_pendientes.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md) [MODIFY]

### [2026-06-12] - Registro Explícito de Rol 'client' en Nuevos Clientes (Ecosistema)
* **Tipo:** Consistencia de Base de Datos / Seguridad
* **Descripción de Cambios:**
  - **Inyección de Rol en Registro:** Se corrigió la discrepancia en la colección `/users` agregando de forma explícita el campo `role: 'client'` cuando se registra un cliente nuevo. Esto garantiza consistencia de esquema (ya que los administradores guardan `role: 'admin'`) y facilita validaciones en las reglas de seguridad.
* **Archivos Modificados:**
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

### [2026-06-12] - Fix de Sesión Huérfana de Administrador en App Ventas (Ecosistema)
* **Tipo:** Bugfix / Autenticación / Base de Datos
* **Descripción de Cambios:**
  - **Auto-recreación de Perfil Admin:** Se corrigió un bug en la plantilla `App Ventas` donde, al limpiar la base de datos Firestore, un administrador logueado previamente mediante Firebase Auth era redirigido directamente al dashboard debido al listener de sesión en cache, sin recrear su documento en la colección `/users` (ya que el login manual era el único que ejecutaba la escritura).
  - **Implementación en Hook:** Modificado `src/hooks/useAuthInit.js` en la plantilla base de Ventas para que compruebe la existencia del documento en Firestore cuando el listener de Auth detecte una sesión activa y la cree si falta.
* **Archivos Modificados:**
  - [useAuthInit.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY]

### [2026-06-12] - Remoción de Función de Gestión de Base de Datos
* **Tipo:** Refactorización / Remoción de código
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Se eliminaron los endpoints `/api/project/database/collections` y `/api/project/database/cleanup` junto a los imports del SDK cliente de Firebase y helpers relacionados.
  - **Eliminación en App.jsx:** Se removió el botón "Base de Datos", los estados de React para control de colecciones (`dbManageModal`, `dbCollections`, etc.), los manejadores `handleLoadDbCollections`/`handleExecuteDbCleanup` y la maquetación del modal de confirmación de borrado.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Corrección de Responsividad Móvil y Estructura en CRM de Clientes
* **Tipo:** UI/UX / Responsividad / Bugfix
* **Descripción de Cambios:**
  - **Grid de Cabecera:** Se rediseñó el contenedor de botones de acción global del CRM (`Sincronización Global`, `Despliegue Global`, `Telemetría Global`, `Nuevo Cliente`) para usar una cuadrícula responsiva de 2 columnas en mobile (`grid grid-cols-2 md:flex md:flex-wrap`) con botones de ancho completo, evitando desbordamientos de texto.
  - **Flexibilidad de Directorio:** Se reestructuraron los botones de acción del directorio de cada cliente (`Desplegar en Local`, `Base de Datos`, `Instalar Deps`, `Obtener Telemetría`, `Gestionar`) con propiedades flex-wrap, anchos mínimos (`min-w`) y alineación central, permitiendo que se acomoden simétricamente en pantallas estrechas sin truncarse.
  - **Resolución de Error de Sintaxis:** Se restauró la etiqueta contenedora de visualización de proyecciones que fue eliminada por error.
  - **Resolución de Bug de Búsqueda de Proyectos:** Se corrigió una falla lógica en la función `findProjectDir` de `server.js` que impedía resolver las rutas de proyectos de plantillas core (`Plantillas Core`) si la carpeta de instancias de clientes (`Instancias Clientes`) no estaba creada físicamente en el disco.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Arquitectura General y Agnóstica de Skills de IA
* **Tipo:** Refactorización / IA Configuración
* **Descripción de Cambios:**
  - **Agnosticismo de Proyecto:** Actualizadas las 7 skills del ecosistema (`component_creator`, `component_extractor`, `git_strategist`, `integrity_compiler`, `onboarder_marcas`, `portar_componente`, `sandbox_integrator`) para remover referencias hardcodeadas a la plantilla `App Ventas`. Se introdujo la variable dinámica `[PROYECTO_ACTIVO]` con su orden de prioridades de resolución y la sección de "Rutas del Proyecto".
  - **Triggers Dinámicos:** Configurado el soporte para que los triggers acepten el parámetro opcional de proyecto (ej: `@crear-componente [PROYECTO_ACTIVO?]`).
  - **Mejoras Específicas por Skill:**
    * `component_creator`: Mapeo fuzzy en `getSandboxKey` en Paso 3, inyección de categorías válidas de biblioteca, y build bloqueante en Paso 5.
    * `component_extractor`: Actualizada la tabla de simulabilidad, criterio objetivo para manuales, protocolo de rollback y variantes.
    * `git_strategist`: Completada la descripción y agregado Paso 6 para resolución de conflictos.
    * `integrity_compiler`: Completada la descripción y unificadas rutas.
    * `onboarder_marcas`: Agregada plantilla para `.env.local` y reglas multi-vertical de onboarding.
    * `portar_componente`: Agregado control de dependencias npm faltantes y validación de versión de `lucide-react`.
    * `sandbox_integrator`: Establecida la tabla como fuente canónica de verdad y añadidas filas de simulabilidad.
* **Archivos Modificados:**
  - Archivos `SKILL.md` bajo `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\Copia_Seguridad_Reglas_y_Skills\Skills\` [MODIFY]

### [2026-06-12] - Depuración de Rutas Obsoletas (D:\Aplicaciones)
* **Tipo:** Refactorización / Mantenimiento
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Removido el fallback redundante y obsoleto `D:\Aplicaciones` de la rutina de resolución de proyectos `findProjectDir` en el servidor del CLI (`server.js`).
  - **Drift Detector CRM:** Implementados los endpoints `/api/project/drift` y `/api/project/sync-file` para evaluar diferencias downstream entre Cores y clientes.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Optimización de Chunks de Bundle y Refinamiento de Auditor PWA
* **Tipo:** Rendimiento / Optimización / Bundles
* **Descripción de Cambios:**
  - **Falsos positivos de auditoría:** Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaño de chunks cargados dinámicamente.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Integración de Herramientas de Automatización en CLI Bridge Server
* **Tipo:** Nueva Característica / Automatización / CLI Bridge
* **Descripción de Cambios:**
  - **APIs de Automatización:** Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]


### [2026-06-13] - Reubicación de Apariencia y Colores a Ajustes de Desarrollador
* **Tipo:** Reubicación de Módulos / UI/UX / AdminSettings
* **Descripción de Cambios:**
  - **Reubicación de Módulo:** Movida la opción "Apariencia y Colores" (`apariencia`) del listado principal de ajustes del administrador al menú de herramientas internas de la "Zona de Desarrollador" (`dev-apariencia`), protegiéndola bajo el PIN maestro `DEV_PIN`.
  - **Prevención de Conflictos de Declaración:** Se renombró la propiedad del prop `handleSaveConfig` a `handleSaveThemeConfig` en la firma de `DeveloperSettings.jsx` y su correspondiente paso en `AdminSettings.jsx` para evitar la colisión de variables con la función local de guardado de configuraciones de desarrollo.
  - **Sincronización en Espejo:** Aplicada la reubicación de forma consistente tanto en el Core de la aplicación como en las plantillas empaquetadas de la CLI (`template-ventas`).
* **Archivos Modificados:**
  - [AdminSettings.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [AdminSettings.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [DeveloperSettings.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]
  - [DeveloperSettings.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx) [MODIFY]

### [2026-06-13] - Rediseño de Cabecera y Tarjeta de Perfil de Administrador en Ajustes (UI/UX)
* **Tipo:** UI/UX / AdminSettings / Rediseño Perfil
* **Descripción de Cambios:**
  - **Eliminación de Traslape de Botones:** Removido el botón "Cerrar Sesión" del encabezado superior derecho para evitar la colisión visual y el traslape con la campana de notificaciones flotante del sistema.
  - **Tarjeta de Perfil de Administrador (Standout Style Dinámico):** Implementado un contenedor de perfil interactivo (`Admin Profile Card`) antes del listado de ajustes diseñado con una estética dinámica basada en el tema activo (`bg-primary/8`, borde izquierdo acentuado `border-l-4 border-l-primary` y bordes sutiles `border-primary/15`) para diferenciarlo visualmente y adaptar su color automáticamente al tema de marca actual.
  - **Identidad de Marca Adaptativa:** El avatar renderiza dinámicamente el logo de la tienda (`appIcon`) configurado por el administrador. En caso de no existir logo cargado, muestra de manera elegante el icono de un escudo de seguridad (`Shield`) centrado en color primario, montado sobre una caja plana clara (`bg-surface` y borde `border-primary/15`).
  - **Nombre Personalizado del Administrador:** El título principal de la tarjeta se vincula a `config.sellerName` (el nombre del administrador/vendedor configurable en Identidad de Marca) con fallbacks a `user.displayName` (cuenta de autenticación) y "Administrador".
  - **Ubicación del Botón de Cierre:** Integrado de manera adaptativa el botón "Cerrar Sesión" en la esquina de la tarjeta de perfil, con colores de advertencia suaves (`text-red-500` y botón `bg-red-500/10` con hover `bg-red-500/20`), optimizando el espaciado en PC y mobile.
* **Archivos Modificados:**
  - [AdminSettings.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]
  - [AdminSettings.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSettings.jsx) [MODIFY]

### [2026-06-13] - Accesos Rápidos de Reportes en Inventario y Créditos (UI/UX)
* **Tipo:** UI/UX / Navegación / AdminInventory / AdminCredits
* **Descripción de Cambios:**
  - **Acceso Rápido a Rotación de Stock:** Integrado un nuevo botón "Exportar Rotación" en `AdminInventory.jsx` (Tanto en Core como en la plantilla CLI) posicionado al lado del botón "Nuevo Producto". Utiliza de forma automática el rango del mes actual como valor predeterminado para el análisis y consume el hook `useOrders` para calcular la tasa de Sell-Through.
  - **Acceso Rápido a Cartera de Deudas:** Integrado un botón "Exportar Cartera" en `AdminCredits.jsx` al lado de la barra de búsqueda para emitir el PDF de cuentas por cobrar directamente desde la vista del módulo.
  - **Consistencia Responsiva y Priorización Móvil:** Estilizado mediante clases Tailwind `flex-col-reverse sm:flex-row` en el inventario para asegurar que en dispositivos móviles el botón de "Nuevo Producto" aparezca de forma prioritaria arriba de "Exportar Rotación", mientras que en PC se mantengan alineados horizontalmente sin desbordamiento.
* **Archivos Modificados:**
  - [AdminInventory.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [AdminInventory.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]
  - [AdminCredits.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]
  - [AdminCredits.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]

### [2026-06-13] - Corrección de Caja y Nuevo Reporte de Cuentas por Cobrar
* **Tipo:** Caja y Reportes / Cuentas por Cobrar / pdfService / AdminSalesDetail
* **Descripción de Cambios:**
  - **Corrección de Conciliación de Caja:** Se modificó `exportSalesReportPDF` en `pdfService.js` (Tanto en Core como en la plantilla CLI) para realizar una consulta dinámica a la colección `/credits`. Los créditos pagados (cuya orden es `'completado'` pero el método de pago original es `'credito'`) ya no se sumarán a la cartera por cobrar, sino que su saldo remanente real se reportará en "Por cobrar" (0 en caso de estar pagado) y la parte abonada/liquidada sumará a la caja líquida real.
  - **Reporte de Cuentas por Cobrar y Deudas:** Se creó la función `exportCreditsReportPDF` en `pdfService.js` para generar un reporte PDF exhaustivo de cartera activa, deudores, abonos históricos y efectividad de recaudo.
  - **Botón en Interfaz de Detalle de Ventas:** Se integró un nuevo botón en la interfaz de `AdminSalesDetail.jsx` bajo la sección "Reportes y Exportación" para permitir la exportación directa del reporte de cartera si la funcionalidad de créditos está activa.
* **Archivos Modificados:**
  - [pdfService.js (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/pdfService.js) [MODIFY]
  - [pdfService.js (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/pdfService.js) [MODIFY]
  - [AdminSalesDetail.jsx (Template)](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]
  - [AdminSalesDetail.jsx (Core)](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]

### [2026-06-13] - Sincronización downstream de pdfService en la CLI de Prototype
* **Tipo:** CLI / Estructura / pdfService
* **Descripción de Cambios:**
  - Sincronización downstream de la función de exportación de PDF de ventas y rotación para la consistencia del bundle y soporte de empaquetado en caliente.
* **Archivos Modificados:**
  - [pdfService.js](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/services/pdfService.js) [MODIFY]

### [2026-06-13] - Corrección de Permisos de Firestore (Missing or insufficient permissions en listado de pedidos)
* **Tipo:** Seguridad / Base de Datos / Reglas de Firestore
* **Descripción de Cambios:**
  - **Corrección de Regla de Listado:** Se corrigió el error de permisos en tiempo de ejecución (`FirebaseError: Missing or insufficient permissions`) al ingresar a la vista de "Mis Pedidos" o cargar el historial de créditos como cliente público (no administrador).
  - **Causa Raíz:** Las reglas de seguridad de Firestore en las colecciones `/orders` y `/credits` verificaban la existencia del campo `cliente.celular` en los filtros de consulta mediante `request.query.filters['cliente.celular'] != null`. Sin embargo, `request.query.filters` es una propiedad inexistente en las reglas de producción de Firestore (las cuales solo admiten `limit`, `offset` y `orderBy` en `request.query`), lo que causaba un fallo de evaluación y el rechazo inmediato de la consulta.
  - **Solución Aplicada:** Se reemplazó la validación por la sintaxis estándar basada en `resource.data` (`resource.data.cliente.celular != null`), permitiendo a los clientes recuperar sus propios pedidos mediante el filtro `where('cliente.celular', '==', celular)` inyectado en la consulta.
* **Archivos Modificados:**
  - [firestore.rules](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/firestore.rules) [MODIFY]
  - [firestore.rules](file:///d:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/firestore.rules) [MODIFY]

### [2026-06-13] - Rediseño Visual de Modal de Producto y Ancho Completo en Reportes
* **Tipo:** UI/UX / Modal / Maquetación / Core App Ventas
* **Descripción de Cambios:**
  - **Rediseño de Modal de Producto:** En `ProductFormModal.jsx` se optimizaron las proporciones y márgenes de los campos. Los inputs se elevaron de `text-xs` a `text-sm` (evitando auto-zoom en iOS Safari), se ampliaron las dimensiones de los botones de carga a `h-11`/`h-12` para un área de contacto idónea en pantallas táctiles y se inyectó la previsualización del producto al lado de los botones de carga en la edición clásica (antes oculta).
  - **Alineación de Placeholders:** Se simplificaron los textos placeholder del panel avanzado (SEO y recomendaciones) para que no se corten en vistas de 2 columnas o móviles.
  - **Homologación de Ancho en Sub-paneles:** Se ajustó la clase contenedora en `AdminSalesDetail.jsx` (detalle de ventas), `AdminStockAlerts.jsx` (alertas de stock) y `AdminCredits.jsx` (créditos) reemplazando los contenedores estrechos (`max-w-4xl` y `max-w-6xl`) por `max-w-7xl`, logrando que todas las sub-páginas utilicen el ancho total de pantalla del panel administrativo de forma consistente.
* **Archivos Modificados:**
  - [ProductFormModal.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/components/admin/inventory/ProductFormModal.jsx) [MODIFY]
  - [AdminSalesDetail.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminSalesDetail.jsx) [MODIFY]
  - [AdminStockAlerts.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminStockAlerts.jsx) [MODIFY]
  - [AdminCredits.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminCredits.jsx) [MODIFY]

### [2026-06-13] - Incorporación de Regla de Seguridad de Git (Evitar Pérdida de Datos Locales)
* **Tipo:** Reglas de Comportamiento de IA (GEMINI.md) / Seguridad
* **Descripción de Cambios:**
  - **Regla contra Restauraciones de Git Automáticas:** Se añadió una regla mandatoria de alta prioridad en la Sección 4 de `GEMINI.md` que prohíbe de forma estricta a la IA ejecutar comandos de descarte o restauración destructivos en Git (`git checkout --`, `git restore`, `git reset`) sobre archivos locales modificados sin la confirmación y autorización explícita del usuario en el chat. Esto protege el trabajo en desarrollo y los cambios no guardados.
  - **Propagación del Prompt:** Se corrió el script de sincronización `sync_rules.js` para propagar de forma inmediata el cambio de reglas a los 5 subproyectos del ecosistema.
* **Archivos Modificados:**
  - [GEMINI.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]

### [2026-06-13] - Rediseño Compacto y Corrección de Scroll en Modal Punto de Venta QR
* **Tipo:** UI/UX / Modal / Core App Ventas / Bugfix
* **Descripción de Cambios:**
  - **Remoción de Scroll y Overflow:** Se cambió el contenedor del modal en `AdminInventory.jsx` para usar `overflow-hidden` y se compactó la tarjeta reduciendo los paddings a `p-4`, los anchos a `max-w-sm` y los espaciados verticales (`mb-x`) para asegurar que quepa 100% en pantallas pequeñas sin forzar scroll interno.
  - **Bloqueo de Scroll de Fondo (Body Scroll Lock):** Se inyectó un hook `useEffect` en `ProductQRModal` que asigna `document.body.style.overflow = 'hidden'` cuando se monta el modal y lo restablece al desmontar para evitar que la página de fondo se desplace.
  - **Refactorización de Zoom a Overlay Independiente:** Se removió el reajuste de tamaño dinámico en caliente del canvas dentro de la misma tarjeta del modal. Ahora, al hacer clic en el QR para ampliarlo, se renderiza un overlay modal independiente de pantalla completa con un backdrop oscuro (`bg-black/80`), un canvas optimizado de 260px, y controles para cerrar (`X` o clic exterior), manteniendo la consistencia de la tarjeta principal intacta.
* **Archivos Modificados:**
  - [AdminInventory.jsx](file:///d:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/admin/AdminInventory.jsx) [MODIFY]

### [2026-06-13] - Bugfix: Carga de Imagen en Detalle de Producto y Reubicación de generate_ia_map.js
* **Tipo:** Bugfix / Rendimiento / Estructura / Build
* **Descripción de Cambios:**
  - **Carga de Imagen en Caché:** Se corrigió un bug clásico en `ProductDetailPage.jsx` donde las imágenes cacheadas por el navegador disparaban el evento de carga del DOM antes de que React registrara `onLoad`, causando un shimmer gris infinito (bloqueando la visualización). Se implementó un `useRef` sobre el elemento de la imagen y se evalúa la propiedad `.complete` en el `useEffect` para resolver la carga de forma instantánea.
  - **Corrección de Inicialización Temporal:** Se movió la inicialización del `useEffect` de imagen debajo de la declaración `useMemo` de `activeImages` para resolver el error de referencia en JS.
  - **Reubicación de generate_ia_map.js:** Se movió el script generador de mapas semánticos de la IA fuera de la carpeta temporal `scratch/` a una carpeta de scripts oficial `scripts/` y se actualizó `package.json` para evitar fallos de compilación (`MODULE_NOT_FOUND`) en las plantillas de la CLI tras la limpieza de la carpeta de debug.
  - **Sincronización:** Actualizado `sync_templates.js` para propagar automáticamente `package.json` y la carpeta `scripts` en el motor de scaffolding.
* **Archivos Modificados:**
  - [ProductDetailPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/client/ProductDetailPage.jsx) [MODIFY]
  - [package.json](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/package.json) [MODIFY]
  - [generate_ia_map.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/scripts/generate_ia_map.js) [NEW]
  - [sync_templates.js](file:///D:/PROTOTIPE/Prototipe-CLI/sync_templates.js) [MODIFY]

### [2026-06-13] - Habilitación de Telemetría Real en Local y Migración a Cloud Functions Gen 2
* **Tipo:** Telemetría / Firebase / Cloud Functions / IAM / CORS
* **Descripción de Cambios:**
  - **Migración a Gen 2:** Se migró la Cloud Function `reportTelemetry` a Firebase Functions Gen 2 (`onRequest` con `cors: true`) para desplegar sobre Cloud Run y solucionar el preflight de CORS de manera nativa.
  - **Resolución de Permisos en GCP:** Se concedieron los roles de lector y escritor de Artifact Registry (`roles/artifactregistry.reader` y `roles/artifactregistry.writer`) a la cuenta de servicio de Cloud Functions y al agente de Compute Engine, solucionando los errores de compilación de contenedores en Cloud Build.
  - **Acceso Público:** Se configuró la política de IAM del servicio Cloud Run para permitir invocaciones públicas (`allUsers` -> `roles/run.invoker`), lo que previene rechazos por 403 Forbidden antes de evaluar las reglas de CORS.
  - **Habilitación de Localhost:** Se removió la interceptación de simulación en `telemetryService.js` de la App de Ventas para permitir que el cliente emita telemetría real en local.
  - **Saneamiento de Variables:** Se eliminaron las comillas dobles redundantes en `.env.local` de la aplicación de ventas y en la plantilla del generador CLI (`generator.js`) para evitar que el token de Authorization sea enviado con comillas literales y devuelva un error 401.
* **Archivos Modificados:**
  - [telemetryService.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/services/telemetryService.js) [MODIFY]
  - [index.js](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/functions/index.js) [MODIFY]
  - [.env.local](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/.env.local) [MODIFY]
  - [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

### [2026-06-12] - Simplificación de Login de Administrador (Remoción de Campos de Registro)
* **Tipo:** UI/UX / Autenticación / Configuración
* **Descripción de Cambios:**
  - **Remoción de campos redundantes:** Se eliminaron los campos de configuración inicial de nombre y WhatsApp del formulario de inicio de sesión del administrador. Esto previene confusión y errores de visualización/registro en caliente.
  - **Sincronización por defecto:** El proceso de registro del primer administrador ahora inyecta automáticamente los fallbacks de configuración global (`sellerName` y `whatsappAdmin`). Los administradores podrán ajustar sus datos en cualquier momento desde la sección de Ajustes de Identidad de Marca en el Panel de Control.
* **Archivos Modificados:**
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

### [2026-06-12] - Registro Explícito de Rol 'client' en Nuevos Clientes (Ecosistema)
* **Tipo:** Consistencia de Base de Datos / Seguridad
* **Descripción de Cambios:**
  - **Inyección de Rol en Registro:** Se corrigió la discrepancia en la colección `/users` agregando de forma explícita el campo `role: 'client'` cuando se registra un cliente nuevo. Esto garantiza consistencia de esquema (ya que los administradores guardan `role: 'admin'`) y facilita validaciones en las reglas de seguridad.
* **Archivos Modificados:**
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/pages/LoginPage.jsx) [MODIFY]
  - [LoginPage.jsx](file:///D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx) [MODIFY]

### [2026-06-12] - Fix de Sesión Huérfana de Administrador en App Ventas (Ecosistema)
* **Tipo:** Bugfix / Autenticación / Base de Datos
* **Descripción de Cambios:**
  - **Auto-recreación de Perfil Admin:** Se corrigió un bug en la plantilla `App Ventas` donde, al limpiar la base de datos Firestore, un administrador logueado previamente mediante Firebase Auth era redirigido directamente al dashboard debido al listener de sesión en cache, sin recrear su documento en la colección `/users` (ya que el login manual era el único que ejecutaba la escritura).
  - **Implementación en Hook:** Modificado `src/hooks/useAuthInit.js` en la plantilla base de Ventas para que compruebe la existencia del documento en Firestore cuando el listener de Auth detecte una sesión activa y la cree si falta.
* **Archivos Modificados:**
  - [useAuthInit.js](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/src/hooks/useAuthInit.js) [MODIFY]

### [2026-06-12] - Remoción de Función de Gestión de Base de Datos
* **Tipo:** Refactorización / Remoción de código
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Se eliminaron los endpoints `/api/project/database/collections` y `/api/project/database/cleanup` junto a los imports del SDK cliente de Firebase y helpers relacionados.
  - **Eliminación en App.jsx:** Se removió el botón "Base de Datos", los estados de React para control de colecciones (`dbManageModal`, `dbCollections`, etc.), los manejadores `handleLoadDbCollections`/`handleExecuteDbCleanup` y la maquetación del modal de confirmación de borrado.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Corrección de Responsividad Móvil y Estructura en CRM de Clientes
* **Tipo:** UI/UX / Responsividad / Bugfix
* **Descripción de Cambios:**
  - **Grid de Cabecera:** Se rediseñó el contenedor de botones de acción global del CRM (`Sincronización Global`, `Despliegue Global`, `Telemetría Global`, `Nuevo Cliente`) para usar una cuadrícula responsiva de 2 columnas en mobile (`grid grid-cols-2 md:flex md:flex-wrap`) con botones de ancho completo, evitando desbordamientos de texto.
  - **Flexibilidad de Directorio:** Se reestructuraron los botones de acción del directorio de cada cliente (`Desplegar en Local`, `Base de Datos`, `Instalar Deps`, `Obtener Telemetría`, `Gestionar`) con propiedades flex-wrap, anchos mínimos (`min-w`) y alineación central, permitiendo que se acomoden simétricamente en pantallas estrechas sin truncarse.
  - **Resolución de Error de Sintaxis:** Se restauró la etiqueta contenedora de visualización de proyecciones que fue eliminada por error.
  - **Resolución de Bug de Búsqueda de Proyectos:** Se corrigió una falla lógica en la función `findProjectDir` de `server.js` que impedía resolver las rutas de proyectos de plantillas core (`Plantillas Core`) si la carpeta de instancias de clientes (`Instancias Clientes`) no estaba creada físicamente en el disco.
* **Archivos Modificados:**
  - [App.jsx](file:///D:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/App.jsx) [MODIFY]
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-12] - Arquitectura General y Agnóstica de Skills de IA
* **Tipo:** Refactorización / IA Configuración
* **Descripción de Cambios:**
  - **Agnosticismo de Proyecto:** Actualizadas las 7 skills del ecosistema (`component_creator`, `component_extractor`, `git_strategist`, `integrity_compiler`, `onboarder_marcas`, `portar_componente`, `sandbox_integrator`) para remover referencias hardcodeadas a la plantilla `App Ventas`. Se introdujo la variable dinámica `[PROYECTO_ACTIVO]` con su orden de prioridades de resolución y la sección de "Rutas del Proyecto".
  - **Triggers Dinámicos:** Configurado el soporte para que los triggers acepten el parámetro opcional de proyecto (ej: `@crear-componente [PROYECTO_ACTIVO?]`).
  - **Mejoras Específicas por Skill:**
    * `component_creator`: Mapeo fuzzy en `getSandboxKey` en Paso 3, inyección de categorías válidas de biblioteca, y build bloqueante en Paso 5.
    * `component_extractor`: Actualizada la tabla de simulabilidad, criterio objetivo para manuales, protocolo de rollback y variantes.
    * `git_strategist`: Completada la descripción y agregado Paso 6 para resolución de conflictos.
    * `integrity_compiler`: Completada la descripción y unificadas rutas.
    * `onboarder_marcas`: Agregada plantilla para `.env.local` y reglas multi-vertical de onboarding.
    * `portar_componente`: Agregado control de dependencias npm faltantes y validación de versión de `lucide-react`.
    * `sandbox_integrator`: Establecida la tabla como fuente canónica de verdad y añadidas filas de simulabilidad.
* **Archivos Modificados:**
  - Archivos `SKILL.md` bajo `D:\PROTOTIPE\Documentacion PROTOTIPE\04_Estandares_y_Skills\Copia_Seguridad_Reglas_y_Skills\Skills\` [MODIFY]

### [2026-06-12] - Depuración de Rutas Obsoletas (D:\Aplicaciones)
* **Tipo:** Refactorización / Mantenimiento
* **Descripción de Cambios:**
  - **Eliminación en server.js:** Removido el fallback redundante y obsoleto `D:\Aplicaciones` de la rutina de resolución de proyectos `findProjectDir` en el servidor del CLI (`server.js`).
  - **Limpieza de Manuales y Mapas:** Corregidas las referencias hardcodeadas de `D:\Aplicaciones` a `D:\PROTOTIPE` en `mapa_arquitectura.md` de la plantilla ventas y de la plantilla activa, en la especificación visual de marca, en el resumen ejecutivo del negocio, y en las guías técnicas del extractor de componentes.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [mapa_arquitectura.md](file:///D:/PROTOTIPE/Plantillas%20Core/App%20Ventas/Documentacion%20App%20Ventas/mapa_arquitectura.md) [MODIFY]
  - `Prototipe-CLI/templates/template-ventas/Documentacion App Ventas/mapa_arquitectura.md` [MODIFY]
  - `Documentacion PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/Skills/component_extractor/SKILL.md` [MODIFY]
  - `Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_brand_config.md` [MODIFY]
  - `Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md` [MODIFY]
  - `Documentacion PROTOTIPE/04_Estandares_y_Skills/sincronizacion_templates_universal.md` [MODIFY]

### [2026-06-12] - Saneamiento y Estandarización de Documentación PROTOTIPE
* **Tipo:** Limpieza / Documentación / Estandarización
* **Descripción de Cambios:**
  - **Eliminación de duplicados:** Se removieron los componentes duplicados y obsoletos `ConnectivityToast` y `DatePicker` del directorio `06_Biblioteca_Componentes` para favorecer sus versiones unificadas y descriptivas en español (`Alerta_Conectividad_Red` y `Selector_Fecha`).
  - **Estandarización de Nomenclatura:** Se renombraron 6 subcarpetas y archivos en la biblioteca de inglés a español descriptivo (`CurrencyInput` -> `Entrada_Moneda`, `QuantitySelector` -> `Selector_Cantidad`, `useDebounceValue` -> `Hook_Filtro_Debounce`, `useLocalStorageState` -> `Hook_Estado_LocalStorage`, `useSavedLocation` -> `Hook_Ubicacion_Guardada`, `ModalTemplate` -> `Plantilla_Modal`).
  - **Remoción de Obsoletos:** Se eliminó el archivo de roadmap histórico `tareas_pendientes_prioritarias.md` ya completado.
  - **Integridad:** Ejecutado `verify_ecosystem_integrity.js` actualizando exitosamente `mapa_documentacion_ia.md` y `mapa_aplicacion.md`.
* **Archivos Modificados:**
  - `06_Biblioteca_Componentes/Formularios_y_UI/ConnectivityToast/` [DELETE]
  - `06_Biblioteca_Componentes/Formularios_y_UI/DatePicker/` [DELETE]
  - `02_Tareas_Roadmap/tareas_pendientes_prioritarias.md` [DELETE]
  - `06_Biblioteca_Componentes/` (6 subcarpetas renombradas) [MODIFY]
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - [mapa_aplicacion.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_aplicacion.md) [MODIFY]

### [2026-06-12] - Actualización a SYSTEM PROMPT — PROTOTIPE DEV AI v2.0
* **Tipo:** Configuración / Reglas de IA / Robustez
* **Descripción de Cambios:**
  - **SYSTEM PROMPT v2.0:** Aplicado el nuevo system prompt unificado en `GEMINI.md`. Define con precisión la matriz de severidades para auditoría técnica, la jerarquía estricta de prioridades ante conflictos de reglas, normas de protección de secretos Firebase/ENV, y protocolos claros ante fallos de build y sincronización.
  - **Sincronización:** Modificados los delimitadores de sección por-core en `sync_rules.js` para usar `## SECCIÓN 10` y `## SECCIÓN 13`. Ejecutado el script de propagación con éxito en todos los proyectos del ecosistema.
* **Archivos Modificados:**
  - [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
  - [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]

### [2026-06-12] - Reorganización Integral del Ecosistema de Documentación PROTOTIPE
* **Tipo:** Refactorización / Documentación / CLI / Integridad
* **Descripción de Cambios:**
  - **Fase 1 — Críticos:** Eliminados 3 archivos binarios residuales de `03_Auditorias_y_Faro_Core/` (trace.json 26MB, desktop_landing.png, PDF). Corregida descripción de `03_Auditorias_y_Faro_Core` en GEMINI.md para dejar claro su alcance exclusivo del CLI. Eliminadas referencias a la ruta `D:\Aplicaciones` (obsoleta) de `sync_rules.js` y `verify_ecosystem_integrity.js`. Eliminada fila de ruta rota `manual_acceso_qr_portales.md` del mapa. Eliminados archivos huérfanos: `plan_skills_desarrollador.md` y `propuesta_redisenio_dev_dashboard.md`.
  - **Fase 2 — Reorganización 07_Manuales_Desarrollo:** Movidos 5 archivos sueltos de la raíz de `07_Manuales_Desarrollo/` a `Arquitectura_Multi_Instancia/Prototipe_CLI/` (analisis_automatizacion_dashboard, auditoria_flujo_onboarding, manual_aprovisionamiento_optimo, propuestas_mejoras_robustez, propuesta_robustez_y_nuevas_funciones). Eliminado directorio duplicado `Paginas/Compra_por_QR/` (manual único en Ecommerce_y_QR).
  - **Fase 3 — Limpieza template-ventas:** Eliminado `scratch/` completo (38 archivos ~10MB de debug). Eliminadas carpetas con espacios en nombre (tareas pendientes, instrucciones de migración, instrucciones/). Eliminados 3 archivos md duplicados en raíz del template (mapa_arquitectura_ia.md, mapa_arquitectura.md, flujos_aplicacion.md). Eliminado manual_aprovisionamiento_optimo.md duplicado.
  - **Fase 4 — Mapa de documentación:** Actualizadas rutas de los 5 archivos movidos. Eliminada fila duplicada de caja_diaria_pos.md de sección Utilidades.
  - **Fase 5 — verify_ecosystem_integrity.js:** Extendido para inicializar los 12 archivos de documentación estándar también en los templates del CLI. El script creó automáticamente `template-core-seed/Documentacion App Core Seed/` con los 12 archivos.
  - **Propagación:** Ejecutados `sync_rules.js` (5 destinos actualizados) y `verify_ecosystem_integrity.js` (mapas globales sincronizados sin errores).
* **Archivos Modificados:**
  - [GEMINI.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/GEMINI.md) [MODIFY]
  - [sync_rules.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/sync_rules.js) [MODIFY]
  - [verify_ecosystem_integrity.js](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/verify_ecosystem_integrity.js) [MODIFY]
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]
  - `03_Auditorias_y_Faro_Core/trace.json` [DELETE]
  - `03_Auditorias_y_Faro_Core/desktop_landing.png` [DELETE]
  - `03_Auditorias_y_Faro_Core/Informe Completo y Definitivo App Reusable.pdf` [DELETE]
  - `04_Estandares_y_Skills/Copia_Seguridad_Reglas_y_Skills/plan_skills_desarrollador.md` [DELETE]
  - `07_Manuales_Desarrollo/Visualizacion/propuesta_redisenio_dev_dashboard.md` [DELETE]
  - `07_Manuales_Desarrollo/Paginas/Compra_por_QR/` [DELETE — duplicado]
  - `07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/` ← 5 archivos [MOVIDOS desde raíz 07]
  - `Prototipe-CLI/templates/template-ventas/scratch/` [DELETE — 38 archivos debug]
  - `Prototipe-CLI/templates/template-ventas/` ← carpetas con espacios y md duplicados raíz [DELETE]
  - `Prototipe-CLI/templates/template-core-seed/Documentacion App Core Seed/` [NEW — 12 archivos inicializados]

### [2026-06-12] - Corrección de Rutas del Mapa de Documentación

* **Tipo:** Documentación / Sincronización
* **Descripción de Cambios:**
  - **Corrección de Rutas de Auditoría:** Modificado `mapa_documentacion_ia.md` para actualizar las rutas absolutas de los documentos de auditoría de App Ventas (que fueron movidos desde `03_Auditorias_y_Faro_Core` hacia la carpeta local `D:\PROTOTIPE\Plantillas Core\App Ventas\Documentacion App Ventas`), evitando enlaces rotos e instruyendo correctamente a la IA.
* **Archivos Modificados:**
  - [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md) [MODIFY]

### [2026-06-12] - Sincronización del Ecosistema a Plan Blaze y Telemetría Centralizada
* **Tipo:** Refactorización / Seguridad / Cloud Functions / Firebase / Plan Blaze
* **Descripción de Cambios:**
  - **Limpieza de Generador CLI:** Modificado `generator.js` en `Prototipe-CLI` para no inyectar variables de entorno centralizadas secundarias en `.env.local`, inyectando por defecto el endpoint unificado `VITE_DEVELOPER_TELEMETRY_ENDPOINT` que apunta a la Cloud Function HTTPS en producción.
* **Archivos Modificados:**
  - [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

### [2026-06-12] - Habilitación de Scaffold Limpio (Core Seed) en Gestión de Cores
* **Tipo:** Nueva Característica / CLI / Dashboard
* **Descripción de Cambios:**
  - **Soporte de Scaffold Limpio:** Implementado el soporte para realizar scaffolding de nuevos Cores utilizando una plantilla limpia del sistema (`template-core-seed`). Modificado el endpoint `/api/cores/:clave/scaffold` en `server.js` (CLI).
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - `06_Biblioteca_Componentes/Formularios_y_UI/ConnectivityToast/` [DEL
### [2026-06-11] - Saneamiento de Detección Git en Ecosistema (CLI & Dashboard)
* **Tipo:** DevOps / Bugfix / Scripts
* **Descripción de Cambios:**
  - **Detección de Git por rev-parse:** Refactorizada la detección de Git en el bridge server (`server.js`) para utilizar `git rev-parse --git-dir` en lugar del chequeo físico estático de la carpeta `.git`.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-11] - Robustez en Respaldo de Subproyectos con .git-backup-temp
* **Tipo:** DevOps / Automatización
* **Descripción de Cambios:**
  - **Aislamiento de comandos de Git:** Refactorizado `subproject_backup.ps1` para detectar de forma autónoma si un subproyecto está en estado inactivo con la carpeta `.git-backup-temp` y renombrarlo temporalmente a `.git` para realizar la indexación de cambios.
  - **Fase 1 — Críticos:** Eliminados 3 archivos binarios residuales de `03_Auditorias_y_Faro_Core/` (trace.json 26MB, desktop_landing.png, PDF). Corregida descripción de `03_Auditorias_y_Faro_Core` en GEMINI.m
  - [subproject_backup.ps1](file:///D:/PROTOTIPE/subproject_backup.ps1) [MODIFY]

### [2026-06-11] - Corrección de Bugs de Referencia, Git y Bloqueo de SSE en Automatización
* **Tipo:** Corrección de Bugs / Estabilidad
* **Descripción de Cambios:**
  - **Saneamiento en generador:** Corregido en `generator.js` el ReferenceError de `initials` y `storageRulesContent`. Refactorizado `/api/create-project` en `server.js` regresando a una respuesta HTTP JSON estándar y limpia sin SSE.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [generator.js](file:///D:/PROTOTIPE/Prototipe-CLI/generator.js) [MODIFY]

### [2026-06-11] - Saneamiento de Carpetas Git Temporales y Robustez de Vite en Backups
* **Tipo:** DevOps / Estabilidad / Scripts
* **Descripción de Cambios:**
  - **Remoción de bloqueos Vite:** Corregido el bug de bloqueo y permanencia de carpetas temporales `.git-backup-temp`. Se mejoró la detención de procesos de desarrollo en `git_backup.ps1` y `menu_backup.ps1`.
* **Archivos Modificados:**
  - [git_backup.ps1](file:///D:/PROTOTIPE/git_backup.ps1) [MODIFY]
  - [menu_backup.ps1](file:///D:/PROTOTIPE/menu_backup.ps1) [MODIFY]

### [2026-06-10] - Tres Mejoras de Robustez y Carga de Logo en Onboarding Wizard
* **Tipo:** Robustez / Aprovisionamiento / Frontend / Backend
* **Descripción de Cambios:**
  - **Validación del SDK de Firebase:** Agregado el endpoint `/api/firebase/validate` para comprobar la correctitud de credenciales del cliente antes del aprovisionamiento.
  - **Compresor de Logos Jimp:** Endpoint `/api/upload-logo` para comprimir y procesar logos de marca transparentes con Jimp.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Guardián de Calidad y PWA en Deploy con Auto-Resolución y Drift Detector CRM
* **Tipo:** DevOps / Feature / Calidad
* **Descripción de Cambios:**
  - **SSE Pre-Deploy Audit:** Modificado el endpoint de deploy en `server.js` para ejecutar de forma síncrona el auditor físico antes de realizar el deploy.
  - **Drift Detector CRM:** Implementados los endpoints `/api/project/drift` y `/api/project/sync-file` para evaluar diferencias downstream entre Cores y clientes.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Optimización de Chunks de Bundle y Refinamiento de Auditor PWA
* **Tipo:** Rendimiento / Optimización / Bundles
* **Descripción de Cambios:**
  - **Falsos positivos de auditoría:** Refinamiento de la API `/api/project/audit` en `server.js` para leer el manifest de Vite y omitir las penalizaciones por tamaño de chunks cargados dinámicamente.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]

### [2026-06-10] - Integración de Herramientas de Automatización en CLI Bridge Server
* **Tipo:** Nueva Característica / Automatización / CLI Bridge
* **Descripción de Cambios:**
  - **APIs de Automatización:** Redireccionados logs en `worker_create_project.js` por IPC y agregadas APIs `/api/library/extract`, `/api/project/deploy` y getters/setters de variables de entorno en `/api/project/env`.
* **Archivos Modificados:**
  - [server.js](file:///D:/PROTOTIPE/Prototipe-CLI/server.js) [MODIFY]
  - [worker_create_project.js](file:///D:/PROTOTIPE/Prototipe-CLI/worker_create_project.js) [MODIFY]
