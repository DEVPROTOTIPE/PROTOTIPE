# Reporte de Auditoría Comparativa y Alineación Documental 2026

Este informe técnico analiza y compara la consistencia de los **29 archivos de documentación** indicados frente a la realidad actual del código de la aplicación central, los estándares lógicos de persistencia (Dexie/IndexedDB), y la desactivación absoluta de Cloud Functions en el monorepo de PROTOTIPE.

---

## 📊 Tabla de Comparación y Estado de Alineación

| # | Archivo | Ubicación en Disco | Estado de Alineación | Causa de Desviación / Observación | Acción Requerida |
|---|---|---|---|---|---|
| 1 | **auditoria_final_prototipe.md** | `03_Auditorias_y_Faro_Core/` | 🟢 Alineado | Consistente con las pautas de color HSL y la prohibición de bordes negros en el dashboard. | Ninguna |
| 2 | **auditoria_tecnica_completa_maestra_2026.md** | `03_Auditorias_y_Faro_Core/` | 🟢 Alineado | Cubre los parches de seguridad de path traversal inyectados en `server.js`. | Ninguna |
| 3 | **briefing_maestro_cliente.md** | `05_Estrategia_Comercial_Ecosistema/Plantillas_de_Levantamiento/` | 🟢 Alineado | Mapea las preguntas utilizadas en el wizard del onboarding del cliente en `App.jsx`. | Ninguna |
| 4 | **calculadora_cotizacion_prototipe.md** | `05_Estrategia_Comercial_Ecosistema/` | 🔴 Desalineado | Estructura cobros genéricos pero no los mapea con los tres modos técnicos del Wizard (`percentage`, `fixed_per_service`, `flat_monthly`). | **Modificar:** Agregar anexo técnico sobre asignación de base de datos. |
| 5 | **centralizacion_ganancias_desarrollador.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Describe la distribución comisional y comisiones de desarrollador. | Ninguna |
| 6 | **changelog_general.md** | `01_Control_Versiones/` | 🟡 Parcialmente Desalineado | Menciona el uso de `LocalStorage` para almacenar el outbox offline de WhatsApp, lo cual choca con la directiva estricta de usar IndexedDB/Dexie. | **Alinear:** Precisar que simples pre-llenados usan LocalStorage, pero transacciones usan Dexie. |
| 7 | **contexto_maestro_prototipe.md** | `08_Plan_Escalabilidad_Negocio/` | 🟢 Alineado | Contextualiza la escalabilidad SaaS multi-instancia del ecosistema. | Ninguna |
| 8 | **contrato_maestro_servicios.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Consistente con los términos legales de soporte mutuo. | Ninguna |
| 9 | **diagrama_flujo_ecosistema.md** | `07_Manuales_Desarrollo/` | 🟢 Alineado | Cubre la secuencia de los 11 pasos de aprovisionamiento del CLI. | Ninguna |
| 10 | **diccionario_tecnico_completo.md** | `07_Manuales_Desarrollo/` | 🟢 Alineado | Documenta correctamente las variables del store y la metadata central. | Ninguna |
| 11 | **estado_actual_ecosistema.md** | `03_Auditorias_y_Faro_Core/` | 🟢 Alineado | Describe el estado real del monorepo y reglas de visualización. | Ninguna |
| 12 | **estandar_arquitectonico_ecosistema.md** | `04_Estandares_y_Skills/` | 🔴 Desalineado | Aunque prohíbe Cloud Functions para imágenes, no deja explícito que **todo el proyecto tiene desactivadas las Cloud Functions** en producción. | **Modificar:** Explicitación de prohibición de deploy de funciones. |
| 13 | **manejo_objeciones_cierre_ventas.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Consistente con el chatbot del dashboard y la skill de resolución de objeciones. | Ninguna |
| 14 | **manual_contratacion_clientes.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Describe los términos y condiciones de integración del software. | Ninguna |
| 15 | **manual_marca.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Contiene las especificaciones estéticas que el generator inyecta. | Ninguna |
| 16 | **mapa_dependencias_y_riesgos.md** | `07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/` | 🟢 Alineado | Detalla el desacoplamiento de dependencias físicas del core. | Ninguna |
| 17 | **matriz_precios_oficial.md** | `05_Estrategia_Comercial_Ecosistema/` | 🔴 Desalineado | No mapea los precios de los niveles (Nivel 1, 2, 3) con los campos de cobro del API del Bridge. | **Modificar:** Inyectar campos técnicos del Bridge en la tabla de cobros. |
| 18 | **modelo_operativo_y_negocio.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Consistente con la gobernanza de instancias SaaS actuales. | Ninguna |
| 19 | **oferta_comercial_oficial.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Mapea las cláusulas de soporte y escalabilidad. | Ninguna |
| 20 | **plan_comercial_marketing.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Pautas comerciales consistentes con la captación B2B. | Ninguna |
| 21 | **plantilla_analisis_post_descubrimiento.md** | `05_Estrategia_Comercial_Ecosistema/Plantillas_de_Levantamiento/` | 🟢 Alineado | Consistente con la entrada de manifiesto JSON del dashboard. | Ninguna |
| 22 | **politica_proteccion_datos.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Alineado con la ley de protección y seguridad de datos de Firebase. | Ninguna |
| 23 | **proceso_comercial_prototipe.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Flujo consistente con los paneles comerciales. | Ninguna |
| 24 | **propuesta_comercial_prototipe.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Plantilla de exportación pdf de cotizaciones del dashboard. | Ninguna |
| 25 | **registro_decisiones_arquitectura.md** | `07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/` | 🟢 Alineado | Documenta la paridad y desacoplamiento físico de instancias. | Ninguna |
| 26 | **registro_decisiones_estrategicas.md** | `04_Estandares_y_Skills/` | 🔴 Desalineado | Menciona las Cloud Functions como opción de desactivación de IA, pero no restringe su deploy a nivel general. | **Modificar:** Declarar prohibición formal de deploy de funciones. |
| 27 | **roadmap_empresarial_2026_2029.md** | `08_Plan_Escalabilidad_Negocio/` | 🟢 Alineado | Consistente con la línea de tiempo de escalamiento. | Ninguna |
| 28 | **sistema_precios_licenciamiento.md** | `05_Estrategia_Comercial_Ecosistema/` | 🔴 Desalineado | Divide las tarifas en "Comisión por ventas/servicio/suscripción" pero omite los nombres de variables del schema (`percentage`, `fixed_per_service`, `flat_monthly`). | **Modificar:** Alinear la nomenclatura con el esquema técnico de la base de datos. |
| 29 | **sistema_ventas_prototipe.md** | `05_Estrategia_Comercial_Ecosistema/` | 🟢 Alineado | Mapea las fases de captación de leads. | Ninguna |

---

## 🔧 Acciones de Alineación Propuestas

### 1. Alineación de Modos de Facturación (Comercial → Técnico)
*   **Archivos Afectados:**
    *   [calculadora_cotizacion_prototipe.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/calculadora_cotizacion_prototipe.md)
    *   [matriz_precios_oficial.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/matriz_precios_oficial.md)
    *   [sistema_precios_licenciamiento.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_precios_licenciamiento.md)
*   **Inconsistencia:** Definen términos como "Mensualidad fija" y "Comisión por venta" de forma abstracta comercial.
*   **Corrección:** Se agregará la equivalencia técnica explícita en cada archivo:
    *   *Comisión por venta* = `billingMode: 'percentage'` (requiere variable `comisionPorcentaje`).
    *   *Comisión por servicio/transacción* = `billingMode: 'fixed_per_service'` (requiere variable `montoFijoServicio`).
    *   *Suscripción mensual* = `billingMode: 'flat_monthly'` (requiere variable `pagoMensualFijo`).

### 2. Prohibición Absoluta de Cloud Functions
*   **Archivos Afectados:**
    *   [estandar_arquitectonico_ecosistema.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md)
    *   [registro_decisiones_estrategicas.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/registro_decisiones_estrategicas.md)
*   **Inconsistencia:** Mencionan la desactivación de Cloud Functions como algo opcional o acotado a IA/imágenes.
*   **Corrección:** Declarar explícitamente:
    > "Queda prohibido el empaquetado, compilación o despliegue de Cloud Functions en la arquitectura del ecosistema PROTOTIPE. El aprovisionamiento de clientes se realiza de forma exclusiva mediante compilación de Hosting estático y reglas físicas. La carpeta `functions/` del repositorio representa código legacy en desuso."

### 3. Aclaración de Almacenamiento Local (LocalStorage vs Dexie)
*   **Archivos Afectados:**
    *   [changelog_general.md](file:///d:/PROTOTIPE/Documentacion%20PROTOTIPE/01_Control_Versiones/changelog_general.md)
*   **Inconsistencia:** Refiere que `LocalStorage` guarda el outbox/caché offline del formulario express.
*   **Corrección:** Precisar la regla técnica:
    > "El uso de `localStorage` está limitado única y exclusivamente a estados de UI de cara al cliente (ej. recordar datos de pre-llenado de inputs en el navegador). Cualquier flujo que involucre persistencia de base de datos transaccional, cola de cambios, o sincronización de base de datos local para modo sin conexión, DEBE implementarse utilizando de forma obligatoria IndexedDB mediante la biblioteca Dexie.js para evitar bloqueos y race conditions."
