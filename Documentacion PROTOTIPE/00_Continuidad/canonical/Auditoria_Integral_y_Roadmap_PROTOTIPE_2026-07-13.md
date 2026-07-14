# Auditoría integral del ciclo de vida y roadmap de empresa — PROTOTIPE / Facture Flex

**Fecha de corte:** 13 de julio de 2026  
**Alcance:** documentación entregada por el fundador  
**Veredicto:** APROBACIÓN CONDICIONADA PARA PILOTOS CONTROLADOS; NO LISTO PARA ESCALA COMERCIAL AMPLIA  
**Horizonte del plan:** 0 a 24 meses

---

## 1. Respuesta ejecutiva

PROTOTIPE tiene una base valiosa: una visión modular, automatización de aprovisionamiento, separación entre Core y Features, una biblioteca amplia, un intento serio de trazabilidad y una preocupación real por convertir conocimiento repetible en una fábrica de soluciones. Eso no es poco. La documentación muestra mucha capacidad de construcción y velocidad.

El problema central no es falta de ideas ni de trabajo técnico. Es de secuencia y de evidencia: se está optimizando una fábrica multivertical antes de demostrar de forma repetible qué producto compra un tipo concreto de cliente, qué resultado obtiene, cuánto cuesta atenderlo y cuánto permanece pagando. En otras palabras, la fábrica está más avanzada que la validación del negocio.

Mi lectura más honesta es esta:

1. **Hoy PROTOTIPE se parece más a un servicio productizado de implementación de software, soportado por una plataforma interna, que a un SaaS probado.** Eso no es un defecto. Puede ser la mejor vía para empezar a facturar y aprender. El error sería venderlo internamente como una plataforma escalada antes de tener repetibilidad comercial y operativa.
2. **El documento llamado ciclo de vida describe principalmente el aprovisionamiento técnico.** No contiene de forma integrada el ciclo completo del cliente: captación, calificación, línea base, oferta, contrato, tratamiento de datos, pago, UAT, puesta en marcha, adopción, soporte, renovación, expansión y salida.
3. **La mayor amenaza inmediata es la falta de una verdad única.** Hay documentos que declaran 100 % de avance mientras otros, del mismo período, registran vulnerabilidades críticas, propuestas pendientes y tareas todavía no implementadas. Esto puede producir decisiones empresariales equivocadas.
4. **La seguridad tiene asuntos de prioridad cero.** La documentación contiene o conserva patrones como contraseñas en variables VITE, creación del primer administrador por el primer visitante, reglas de listado público en Firestore, escrituras financieras desde clientes y endpoints destructivos abiertos en el Bridge. Algunas tareas posteriores dicen corregir parte de ello, pero el código no fue entregado y no se puede certificar el estado real.
5. **La premisa “Firebase gratis por cliente” ya no es una base segura de escalabilidad.** Cloud Storage exige Blaze desde el 3 de febrero de 2026, las exportaciones administradas de Firestore requieren facturación y la creación de proyectos Spark suele tener una cuota pequeña. La infraestructura puede seguir siendo económica, pero no debe presupuestarse como cero ni como ilimitada.
6. **Los precios no están conectados con los costos reales.** El score ayuda a clasificar complejidad, pero no calcula horas de descubrimiento, migración, QA, capacitación, soporte, incidencias, nube, cobranzas ni margen. Los precios bajos documentados pueden convertir cada venta en deuda operativa.
7. **Hay demasiada amplitud temprana.** Se mezclan 7, 13 y 23 nichos, múltiples Cores, marketplace, DIAN, pagos, WhatsApp, offline, IA y crecimiento a 200 clientes. La oportunidad real es elegir una sola “cabeza de playa” y dominar un flujo crítico antes de abrir un segundo vertical.
8. **La mejor apuesta inicial, según la evidencia entregada, es App Ventas para un comercio minorista de una sola sede**, con un alcance estrecho: catálogo, ventas/caja, inventario y, solo si se valida, cuentas por cobrar. DIAN, pagos integrados, omnicanalidad compleja y marketplace deben quedar fuera del primer producto repetible salvo obligación contractual específica.
9. **El diferenciador defendible no será generar código.** En 2026 esa capacidad se abarata rápidamente. El valor acumulable será: conocimiento vertical probado, implementación rápida y confiable, migración de datos, adopción, soporte, resultados económicos medidos, seguridad, integraciones y distribución.
10. **La meta de los próximos 90 días no debe ser 200 clientes ni otro Core.** Debe ser conseguir y retener un pequeño grupo de clientes de pago del mismo perfil, demostrar valor, hacer rentable la implementación y cerrar todas las brechas críticas de seguridad y operación.

### Decisión recomendada

Continuar, pero cambiar el orden de ejecución:

**Seguridad y verdad documental → un ICP → oferta estrecha → pilotos pagados → resultado medido → repetibilidad → economía unitaria → canal comercial → segundo vertical → plataforma/marketplace.**

---

## 2. Qué revisé y qué no puedo certificar

### 2.1 Evidencia revisada

Se revisaron los 12 archivos entregados: mapa de consolidación, control de versiones, roadmap de tareas, auditorías, estándares, estrategia comercial, biblioteca, manuales, plan de escalabilidad, módulos, historial de inyecciones y ciclo de vida de Facture Flex.

El material contiene **40.181 líneas y 377.862 palabras**. El mapa de consolidación registra **452 documentos de origen**, distribuidos principalmente entre biblioteca de componentes, auditorías, estándares, manuales y estrategia.

### 2.2 Clasificación de evidencia usada en este informe

- **Hecho documental:** aparece explícitamente en los archivos entregados.
- **Afirmación interna no verificada:** la documentación dice que está implementado, probado o en producción, pero no hay código, ejecución ni evidencia externa para comprobarlo.
- **Riesgo inferido:** consecuencia razonable de una arquitectura o proceso descrito.
- **Recomendación:** diseño propuesto; no representa el estado actual.
- **Hecho externo actualizado:** contrastado con una fuente oficial vigente al 13 de julio de 2026.

### 2.3 Límites importantes

No se entregaron el repositorio de código, los proyectos Firebase, reglas desplegadas, logs, resultados originales de CI, despliegues, facturas, métricas de uso, cartera de clientes, extractos de ingresos ni entrevistas con clientes.

Por tanto, **no puedo confirmar**:

- que las tareas marcadas como completadas estén efectivamente desplegadas;
- que las vulnerabilidades históricas estén cerradas en el código actual;
- que los 259 componentes o los 10 módulos funcionen como se afirma;
- que exista un cliente activo, ingresos recurrentes o una landing operativa;
- que los backups se estén ejecutando y restaurando correctamente;
- que las métricas de 100 %, 8,8/10, WCAG AAA o PWA 100 sean reproducibles;
- que el contrato sea suficiente para Colombia o para otra jurisdicción.

Los consolidados de Biblioteca y Módulos indican expresamente que omiten el código fuente y las especificaciones completas. El Historial de Inyecciones no contiene clientes registrados. Por ello, “documentado” no debe interpretarse como “implementado”, y “implementado” tampoco debe interpretarse como “verificado en producción”.

---

## 3. Diagnóstico de madurez

| Dominio | Estado según la evidencia | Lectura ejecutiva |
|---|---|---|
| Visión y ambición | Fuerte | Hay una visión coherente de reutilización, automatización y marca blanca. |
| Definición del producto | Débil | Se mezclan plataforma, agencia a medida, SaaS, marketplace, facturación y múltiples verticales. |
| ICP y problema prioritario | Débil | Hay muchos nichos y dolores, pero no un segmento dominante validado. |
| Descubrimiento y cotización | Parcial | Existen Briefing Studio y score, pero faltan línea base, costo de servir y evidencia de disposición a pagar. |
| Automatización de entrega | Prometedora, no verificada | La documentación describe un pipeline sofisticado; hace falta comprobarlo con el código y ejecuciones reproducibles. |
| Seguridad | Crítica | Hay contradicciones y patrones que serían bloqueantes para producción si aún existen. |
| Calidad y pruebas | Parcial | Predominan build, smoke y pruebas del pipeline; faltan pruebas de negocio, reglas, recuperación y clientes reales. |
| Operación y soporte | Débil | Hay manuales, pero no evidencia de SLO, guardias, restauraciones, incidentes ni capacidad por cliente. |
| Customer Success | Muy débil | La adopción, el valor realizado, la retención y la renovación no están gobernados como sistema. |
| Economía unitaria | No demostrada | No hay costo completo por implementación o cuenta ni margen comprobado. |
| Legal y privacidad | Incompleta | Existen plantillas generales, no un paquete contractual operativo y validado. |
| Gobernanza documental | Crítica | Hay varias fuentes de verdad, estados incompatibles, duplicados y absolutos no demostrados. |
| Preparación para escala | No lista | Escalar ahora multiplicaría variaciones, soporte, riesgo y deuda documental. |

### Veredicto por etapa

- **Piloto interno o design partner controlado:** sí, después de cerrar el mínimo de seguridad del alcance.
- **Venta limitada y acompañada por el fundador:** sí, con contrato y alcance estrecho.
- **Venta autoservicio o despliegue masivo:** no.
- **Segundo o tercer vertical:** no hasta superar las puertas de repetibilidad.
- **Marketplace público:** no hasta tener gobernanza de cadena de suministro, licencias y seguridad.
- **Meta de 200 clientes:** aspiración válida, pero todavía no es un plan financiado ni operable.

---

## 4. Lo que está bien y conviene conservar

### 4.1 Arquitectura conceptual

La separación **Core → Features → configuración de cliente** es una buena dirección. También lo son:

- manifiestos y contratos explícitos;
- preflight antes de escribir;
- Blueprint y dry-run antes de generar;
- staging transaccional y rollback;
- lockfile e historial de linaje;
- independencia de datos por cliente cuando el caso lo justifique;
- separación entre cambios comunes y cambios privados;
- telemetría y trazabilidad como requisitos del sistema;
- una biblioteca reutilizable en vez de reconstruir todo desde cero.

La secuencia recomendada del ecosistema debe mantenerse como regla de arquitectura:

**Knowledge Layer → Blueprint → Validation Layer → Candidate Workspace → Tests → Generation/Commit → Deployment → Observability.**

La IA puede ayudar a proponer y componer, pero no debe sustituir contratos, validación determinista, aprobación humana ni control de cambios.

### 4.2 Capacidad de sistematizar

El proyecto ya piensa en manuales, ADR, tareas, auditorías, preflight, rollback y estándares. Esa disciplina puede convertirse en una ventaja importante si se reduce el ruido y se vincula cada afirmación con evidencia reproducible.

### 4.3 Proceso comercial existente

La estrategia comercial ya contiene piezas útiles: briefing, análisis post-descubrimiento, propuesta, contrato, pago inicial, implementación, capacitación y seguimientos D7/D30/D90. El trabajo correcto no es desecharlo, sino integrarlo en un único ciclo con dueños, estados, entradas, salidas y puertas.

### 4.4 Mercado potencial

Colombia tenía cerca de 1,56 millones de empresas formales activas en 2024 y las microempresas representaban el 94,2 %. Es un mercado amplio para soluciones simples y de bajo costo. Sin embargo, ese tamaño **no demuestra demanda para PROTOTIPE**. La fragmentación, el bajo presupuesto, el soporte intensivo y la baja madurez digital hacen todavía más importante escoger un subsegmento estrecho y medir disposición a pagar.

### 4.5 Mapa del ciclo actual entregado

El archivo de ciclo de vida describe nueve fases técnicas. Este es el diagnóstico fase por fase:

| Fase actual | Qué resuelve | Valor | Vacío o riesgo principal |
|---|---|---|---|
| 1. Briefing Studio | Captura 20 secciones de requerimientos | Buena base de discovery estructurado | No exige baseline, evidencia del dolor, consentimiento, owner ni criterios de aceptación |
| 2. Motor de reglas | Clasifica complejidad, tier, precio y Features | Reduce arbitrariedad | Score incoherente, pricing sin costo de servir y falta de versionado de decisión |
| 3. Wizard | Firebase auto/manual, preflight, branding y módulos | Estandariza configuración | Mezcla viabilidad, estética e infraestructura; no hay gate legal/seguridad/datos |
| 4. generator.js | Crea archivos, entornos, admin, PWA y proyecto | Puede reducir tiempo de setup | Manejo de secretos, configuración production inferida y reescrituras frágiles |
| 5. Lockfile | Hash SHA-256 de archivos inyectados | Trazabilidad de integridad | No cubre por sí solo schema, datos, dependencias cloud, migraciones ni estado de deploy |
| 6. SSE y pausa Spark | Muestra progreso y permite pasos manuales | Mejor experiencia de operador | Un stream no reemplaza job persistente, recuperación, idempotencia y compensación cloud |
| 7. Checklist y onboarding | Presenta accesos, token y acciones de cierre | Hace visible la entrega | Expone o distribuye secretos; no equivale a QA, UAT, formación ni aceptación |
| 8. Prompt bootstrap | Entrega contexto para continuar con IA | Acelera trabajo asistido | Puede introducir drift si el prompt sustituye contratos, schemas y revisión determinista |
| 9. Feature Flags/Marketplace | Activa y promueve módulos | Base de extensibilidad | Falta gobernanza de licencia, provenance, PII, seguridad, compatibilidad y soporte |

La estrategia comercial, en otro archivo, sí agrega lead, propuesta, contrato, 50 % inicial, implementación, entrega y seguimientos D7/D30/D90. El problema es que ambos ciclos no comparten una máquina de estados, owners, gates ni evidencia. El resultado es un “ciclo comercial narrativo” y un “ciclo técnico automatizado” que pueden avanzar de forma independiente.

**Entradas ausentes antes de la fase 1:** ICP y no-encaje, calificación, consentimiento/base legal, baseline, autoridad/presupuesto, análisis build-buy-partner, capacidad y margen.

**Salidas ausentes después de la fase 9:** QA de riesgos, UAT, Go/No-Go, migración/conciliación, formación, adopción, soporte, incidentes, salud, renovación, expansión, churn, portabilidad, purga y aprendizaje.

---

## 5. Problemas raíz y cuellos de botella

### 5.1 Se está escalando la solución antes del problema

La documentación dedica mucho más detalle a Cores, componentes, prompts, iconos, inyección, verticales y automatización que a:

- quién compra;
- qué problema urgente compra;
- qué alternativa usa hoy;
- cuánto pierde de verdad;
- quién decide y paga;
- por qué permanece;
- cuánto cuesta servirlo;
- qué comportamiento de uso predice renovación.

**Consecuencia:** mucha producción técnica puede no convertirse en ingresos o puede generar una agencia de personalizaciones difícil de mantener.

**Corrección:** congelar expansión y realizar una validación concentrada en un ICP y un flujo crítico.

### 5.2 El ciclo técnico suplanta al ciclo del cliente

El ciclo principal termina en aprovisionamiento, prompt de arranque y marketplace. El valor para el cliente realmente empieza después: migración, UAT, salida, capacitación, adopción, uso habitual, soporte, renovación y expansión.

**Consecuencia:** se puede celebrar un despliegue exitoso aunque el cliente nunca adopte ni renueve.

**Corrección:** la definición de “hecho” debe llegar a valor realizado y aceptación del cliente, no al build.

### 5.3 El fundador y el Bridge local son un cuello de botella

El proceso depende de una máquina Windows, rutas D:, credenciales locales, CLIs, un Bridge en localhost y pasos manuales en Firebase. Ese diseño puede ser aceptable para los primeros pilotos, pero no para una operación con decenas de clientes o varios operadores.

**Consecuencia:** capacidad limitada, riesgo de punto único de fallo, difícil auditoría y alta dependencia de la persona que conoce el sistema.

**Corrección:** primero medir el flujo; después mover operaciones privilegiadas a un control plane autenticado y auditable. No se necesita una reescritura inmediata para iniciar pilotos.

### 5.4 Demasiados mecanismos de actualización

La documentación combina ramas por cliente, repositorios independientes, copias físicas, sincronización MD5, lockfiles SHA-256, VersionManager, promoción de Core y migraciones de linaje.

**Consecuencia:** no queda claro cuál mecanismo manda, qué cambios pertenecen al Core, cómo se resuelven modificaciones del cliente ni cuál es el rollback canónico.

**Corrección:** elegir un modelo único: Core y paquetes versionados, manifiesto por cliente y una excepción formal para forks privados.

### 5.5 La frontera de confianza está en el navegador

Telemetría, billing, roles, ciertas actualizaciones de stock y tokens aparecen resueltos en el cliente. Un navegador está bajo control del usuario y no puede ser la autoridad final para dinero, privilegios, auditoría ni secretos.

**Consecuencia:** manipulación de comisiones, escalamiento de privilegios, eventos duplicados y datos no reconciliables.

**Corrección:** toda operación privilegiada o financiera debe pasar por un backend confiable, idempotente y auditable. App Check complementa la autenticación; no la reemplaza.

### 5.6 La economía de Firebase está mal modelada

El proyecto presupone múltiples proyectos Spark y costo cercano a cero. En la realidad actual:

- Cloud Storage requiere Blaze para mantener acceso desde febrero de 2026;
- export/import administrado de Firestore exige facturación;
- Cloud Functions productivas exigen Blaze;
- la cuota de creación de proyectos Spark suele estar alrededor de 5 a 10;
- alertas presupuestarias no son topes de gasto;
- backups, PITR y restores no forman parte de la cuota gratuita de Firestore.

**Consecuencia:** aprovisionamiento bloqueado, backups que no corren, costos sorpresa y promesas comerciales incumplidas.

**Corrección:** presupuesto por cliente, cuenta de facturación, alertas, límites operativos, inventario de recursos y conciliación mensual.

### 5.7 La prueba dominante es “compila”

El material enfatiza builds, Playwright smoke, hashes y pipeline. Eso prueba una parte pequeña. No demuestra:

- reglas Firestore seguras;
- aislamiento y autorización;
- conciliación offline;
- recuperación real;
- exactitud financiera;
- cargas concurrentes;
- usabilidad de empleados;
- resultados del negocio;
- actualización de versiones en clientes activos.

**Corrección:** pirámide de pruebas por riesgos y un paquete de evidencia por versión.

### 5.8 El pricing no incorpora costo de servir

El score clasifica complejidad, pero no existe una fórmula económica completa. Además, el ciclo de vida usa ponderaciones distintas a la calculadora comercial.

**Consecuencia:** se puede vender mucho y perder más dinero con cada cliente.

**Corrección:** costeo por horas y actividad, margen de implementación, soporte reservado y revisión trimestral de precios.

### 5.9 Promesas comerciales más fuertes que la evidencia

Se prometen tres horas diarias ahorradas, errores casi en cero, adaptación exacta, alta disponibilidad, respaldo diario, soporte al instante, 45 minutos de formación y 100 % de adopción. No se entregó evidencia que soporte esos absolutos.

**Consecuencia:** riesgo contractual, reputacional y de devolución.

**Corrección:** convertir toda promesa en hipótesis, rango o SLA medible; publicar casos reales con línea base y permiso.

### 5.10 El marketplace abre una cadena de suministro de software

Promover código creado para un cliente a un registro global requiere revisar propiedad intelectual, licencia, secretos, PII, dependencias, vulnerabilidades, compatibilidad, semver y pruebas.

**Consecuencia:** fuga de datos o lógica privada, contaminación del Core y vulnerabilidades a todos los clientes.

**Corrección:** marketplace interno y en cuarentena hasta que exista un proceso formal de promoción.

---

## 6. Riesgos de prioridad cero antes de una producción amplia

| P0 | Riesgo | Acción mínima | Criterio de salida |
|---|---|---|---|
| 1 | Endpoints destructivos del Bridge abiertos | Bind exclusivo a loopback, autenticación fuerte, RBAC, CORS estricto, allowlist de rutas y auditoría | Inventario de endpoints; ninguna mutación sin identidad, permiso y registro; pentest básico aprobado |
| 2 | Secretos en VITE, respuestas o logs | Eliminar contraseñas/tokens privados del bundle; usar secretos de servidor e invitación/rotación | Escaneo de bundle, repo y logs sin secretos; credenciales rotables |
| 3 | Primer visitante puede crear al administrador | Preaprovisionar identidad o usar invitación de un solo uso, expirable y ligada a cuenta | Un usuario anónimo nunca puede reclamar administración |
| 4 | Reglas Firestore públicas o permisivas | Privacidad por defecto, validación de esquema/campos/tamaño, ownership y pruebas en Emulator | Suite negativa y positiva reproducible para cada colección sensible |
| 5 | Billing/telemetría financiera desde navegador | Ledger autoritativo en backend con eventos firmados, idempotencia, ajustes y conciliación | Un cliente modificado no puede alterar el monto facturable |
| 6 | No hay rollback cloud completo | Inventario de recursos, compensaciones idempotentes y reconciliador de huérfanos | Fallo simulado deja cero recursos no registrados |
| 7 | Backups no compatibles con Spark y restore no probado | Adoptar plan facturable donde aplique, política RPO/RTO y simulacro de restauración | Restauración completa documentada con checksum y tiempo real |
| 8 | Configuración de producción derivada por sufijo | Obtener y validar la configuración real de cada app/proyecto | Ningún despliegue usa IDs/configuración inferidos |
| 9 | Marketplace sin cuarentena | SBOM, licencia, escaneo, revisión, tests, provenance y eliminación de secretos/PII | Solo artefactos aprobados y firmados pueden promoverse |
| 10 | Contrato y DPA incompletos | Revisión de abogado colombiano; anexos de servicio, seguridad y tratamiento de datos | Paquete contractual firmado antes de procesar datos reales |

### Regla de operación

No hace falta resolver toda la visión de plataforma para vender un piloto. Sí hace falta que **el alcance exacto del piloto** no tenga riesgos críticos abiertos. El resto puede ir a backlog con límites explícitos.

---

## 7. Registro de inconsistencias y corrección propuesta

Esta matriz diferencia contradicciones reales de simples cambios históricos. Cuando una decisión fue reemplazada, el problema no es haber cambiado: el problema es que el documento anterior sigue presentándose como vigente.

### 7.1 Estado, avance y evidencia

| ID | Severidad | Inconsistencia encontrada | Impacto | Corrección concreta |
|---|---|---|---|---|
| E-01 | Alta | El Roadmap declara 486 tareas únicas completadas. El archivo contiene 518 encabezados de tarea, 489 IDs únicos y 29 IDs repetidos. | El porcentaje de avance no es reproducible. | Regenerar el índice desde un parser; impedir IDs duplicados; publicar numerador, denominador, exclusiones y fecha. |
| E-02 | Alta | Los 518 encabezados de tarea aparecen marcados como completados, incluso cuando el entregable fue solo diseño, auditoría o una suite RED con fallos esperados. | Se confunde actividad con resultado. | Separar estados: propuesta, aprobada, implementada, verificada, desplegada y medida. |
| E-03 | Crítica | CLI-429 figura completada porque se creó el informe P0.7, pero el propio informe dice DESIGN PROPOSAL / AWAITING REVIEW y enumera endpoints abiertos, ausencia de auditoría, observabilidad y rollback cloud. | Puede interpretarse que el hardening fue ejecutado cuando solo fue diagnosticado. | Renombrar la tarea a “auditoría P0.7”; crear tareas distintas para cada remediación y evidencia. |
| E-04 | Crítica | Una auditoría califica el sistema con 8,8/10 y otras secciones lo declaran 100 % funcional/estable; el informe P0.7 contemporáneo registra brechas críticas. | Falsa confianza para vender o desplegar. | Sustituir puntuaciones globales por controles verificables y un registro de riesgos abierto/cerrado. |
| E-05 | Alta | La Biblioteca declara 259 elementos “documentados e indexados”, pero omite el código y especificaciones de los 259. | No se puede inferir disponibilidad o calidad funcional. | Mantener tres campos separados: documentación, implementación y verificación; vincular commit y tests. |
| E-06 | Alta | Módulos Completos enumera 10 módulos, todos solo “documentados e indexados”, con código omitido. | El nombre “completos” induce a error. | Renombrar a Catálogo de Especificaciones hasta que exista evidencia de aceptación por módulo. |
| E-07 | Alta | El Historial de Inyecciones describe un registro inmutable, pero la tabla de clientes está vacía. | No hay evidencia entregada de una inyección real o rollback exitoso. | Ejecutar un caso canónico, conservar audit trail, hashes, build, rollback y cliente de prueba. |
| E-08 | Alta | Plan de Escalabilidad afirma cliente activo, pipeline y landing; más adelante Moni sigue como cliente número 1 pendiente y la landing aparece como acción futura. | El estado comercial no es confiable. | Definir cliente activo como contrato firmado, pago y uso; registrar URL y fecha de landing o marcarla no activa. |
| E-09 | Media | Hay varios documentos que se autodenominan maestro, contexto maestro o fuente de verdad. | Las decisiones se bifurcan. | Crear un índice canónico de autoridades por dominio y marcar documentos reemplazados como deprecated. |
| E-10 | Media | IDs como CORE-281 y CORE-282 aparecen duplicados con trabajos distintos en fechas diferentes. | Se rompe trazabilidad entre tarea, commit y decisión. | Usar IDs monotónicos e inmutables; migrar duplicados con sufijos y mapa de equivalencias. |

### 7.2 Arquitectura, seguridad y operación

| ID | Severidad | Inconsistencia encontrada | Impacto | Corrección concreta |
|---|---|---|---|---|
| A-01 | Alta | El ciclo afirma score máximo 108, pero sus máximos suman 111. Además, los ítems de complejidad técnica descritos suman 22, no 25. | Cotizaciones distintas para el mismo caso. | Adoptar una única matriz versionada y una prueba de suma/rangos. |
| A-02 | Alta | La calculadora comercial usa 32/22/17/17/20 = 108, mientras el ciclo usa 32/25/18/18/18. | El frontend, Bridge y propuesta pueden discrepar. | Un solo esquema de pricing en Knowledge Layer consumido por todos los canales. |
| A-03 | Alta | CORE-281 dice que la arquitectura real no tiene clases Repository; el ciclo y varios estándares exigen Repository-Service-Hook. | Generadores y desarrolladores producirán estructuras incompatibles. | Emitir un ADR definitivo; migrar plantillas y deprecar el patrón perdedor. |
| A-04 | Crítica | DEC-006 prohíbe absolutamente Cloud Functions; otra sección obliga a conectar toda app a reportTelemetry Gen 2 y manuales soportan modo Blaze con Functions. | No existe una arquitectura ejecutable coherente. | Reemplazar la prohibición por una política de backend confiable con criterios de uso y presupuesto. |
| A-05 | Alta | El motor de análisis se describe como determinista y sin IA externa; el plan de escalabilidad propone Gemini para producir niche.json. | No se sabe qué proceso es explicable, opcional o dependiente de terceros. | IA solo como asistente de propuesta; decisión y Blueprint final validados determinísticamente. |
| A-06 | Crítica | Se presupone Storage en proyectos Spark, pero Cloud Storage exige Blaze desde el 3 de febrero de 2026. | Nuevos clientes pueden no aprovisionar o perder acceso. | Actualizar preflight, contrato, pricing y billing account; retirar “costo cero”. |
| A-07 | Crítica | El manual llama gratuita a una exportación gcloud de Firestore en Spark. El servicio administrado de export/import exige billing y Blaze. | Los backups prometidos pueden no existir. | Diseñar backup compatible con plan facturable, verificar destino y ejecutar restauraciones. |
| A-08 | Alta | El modelo uno-proyecto-por-cliente presupone creación ilimitada; Firebase documenta una cuota Spark usual de 5 a 10 proyectos. | El crecimiento puede bloquearse con pocos clientes. | Gestionar organización GCP, solicitar cuotas justificadas y modelar alternativa multitenant/shards. |
| A-09 | Crítica | El ciclo escribe VITE_DEVELOPER_ADMIN_PASSWORD. Vite incorpora todas las variables VITE al bundle del navegador. | Exposición de credenciales administrativas. | Nunca enviar una contraseña al frontend; crear usuario desde backend e invitar a rotarla. |
| A-10 | Crítica | CLI-421 afirma que la contraseña dejó de serializarse; manuales posteriores aún ordenan imprimirla en el log y el ciclo la muestra en el onboarding. | El comportamiento y la documentación de seguridad se contradicen. | Eliminar toda impresión y retorno; añadir test de no filtración y actualizar todos los manuales. |
| A-11 | Crítica | Un manual permite que el primer visitante de /admin cree la cuenta cuando adminRegistered es false. | Toma de control si alguien accede antes que el dueño. | Seed seguro o invitación expirable vinculada a identidad; flag no público y no autoritativo. |
| A-12 | Alta | La configuración production se deriva cambiando el ID con sufijo -prod. Cada app/proyecto Firebase tiene configuración completa propia. | Despliegue contra recursos incorrectos. | Aprovisionar cada entorno y extraer su configuración real; validarla antes del build. |
| A-13 | Crítica | CLI-404 dice haber retirado tokens estáticos de bundles; ciclo y manuales aún usan telemetryToken en payload, lockfile o credenciales. | Un token del navegador puede tratarse erróneamente como secreto. | Token público solo como identificador; autenticación real con identidad, App Check y autorización backend. |
| A-14 | Alta | Aparecen tres proyectos centrales: prototipe-ecosistema-control, prototipe-multi-instancia-control y prototipe-saas-control. | Escrituras, reglas y reportes pueden ir a bases distintas. | Elegir ID canónico, documentar migración y bloquear IDs antiguos en CI. |
| A-15 | Alta | Telemetría productiva se redirige a localhost:3001 como fallback. Un navegador desplegado no alcanza la máquina del proveedor. | Telemetría perdida o apuntando al equipo del cliente. | Endpoint cloud autenticado; localhost solo en desarrollo explícito. |
| A-16 | Crítica | Estándares tratan App Check como parte suficiente del blindaje. La documentación oficial dice que App Check y Authentication son complementarios. | Peticiones desde una app legítima todavía podrían carecer de permiso de usuario. | Exigir autenticación, autorización, reglas/IAM y App Check; cada capa con pruebas propias. |
| A-17 | Crítica | El estándar presenta allow list: if isAdmin() or true como solución porque la query filtra por teléfono. Firestore declara que las reglas no son filtros. | Descarga transversal de pedidos. | Eliminar el bypass y obligar query y reglas a probar la misma condición de ownership. |
| A-18 | Crítica | Orders y clientNotifications permiten create público sin esquema, límites ni defensa de abuso. | Spam, costo, datos falsos y potencial inyección de contenido. | Auth o endpoint controlado, validación de campos, tamaño, rate limit, App Check y antifraude. |
| A-19 | Alta | El manual junior permite escribir en cualquier ruta de Storage a cualquier autenticado. Otro estándar lo prohíbe para rutas sensibles. | Sobrescritura o almacenamiento abusivo. | Reglas por prefijo, owner, contentType, tamaño y rol; suite de Emulator. |
| A-20 | Crítica | Comisiones y reportes centrales pueden calcularse y escribirse directamente desde el cliente. | Facturación manipulable y disputas sin evidencia. | Ledger append-only en backend, eventos idempotentes y conciliación con ventas/pagos. |
| A-21 | Alta | Aplicar una actualización se documenta como GET /api/project/update/apply. GET no debe mutar estado. | Reintentos, caches o escáneres pueden disparar cambios. | POST con idempotency key, autorización y confirmación. |
| A-22 | Alta | Planes de actualización y rate limits aparecen en memoria. | Reinicios pierden estado y varias instancias no comparten límites. | Persistencia duradera y control distribuido o aclarar límite de operación monoproceso. |
| A-23 | Media | Sincronización usa MD5 en unos manuales y SHA-256 en lockfiles/migraciones. | Dos definiciones de integridad y drift. | Estandarizar SHA-256 o superior; versionar formato y migrar MD5. |
| A-24 | Alta | Control de versiones mezcla ramas por cliente, repositorios por producto, copias por cliente y migración por lockfile. | Conflictos y costo exponencial de actualización. | Core/paquetes versionados y manifiesto por cliente; fork solo por excepción aprobada. |
| A-25 | Alta | CORS de Storage permite origen * y GET/POST/PUT/DELETE/HEAD. | Superficie de abuso innecesaria. | Allowlist de dominios y solo métodos/cabeceras requeridos. |
| A-26 | Alta | “Modo mantenimiento” se activa cambiando .env.local del hosting. En Vite las variables se fijan al compilar. | La app desplegada puede seguir operando durante restauración. | Feature flag remoto o reverse proxy; procedimiento de bloqueo verificado. |
| A-27 | Alta | El backup se describe como exportación a GCS y luego copia a D:, pero no se documenta el mecanismo de descarga, verificación o retención local. | Sensación de doble copia sin evidencia. | Job explícito, checksum, cifrado, retención, alertas y prueba de lectura. |
| A-28 | Alta | La política offline fuerza stock negativo al reconectar, pero no especifica una clave idempotente global, orden causal ni deduplicación de ventas. | Doble venta y diferencias de inventario. | Ledger de movimientos, UUID de operación, idempotencia, vector/versión y conciliación supervisada. |
| A-29 | Alta | Se afirma “aislamiento absoluto” por proyecto Firebase. La separación reduce blast radius, pero IAM, claves, reglas, soporte y exportaciones aún pueden filtrar datos. | Promesa de seguridad imposible de garantizar. | Hablar de aislamiento físico por proyecto más controles y evidencia; nunca “absoluto”. |
| A-30 | Media | generator.js se describe con 11 pasos, pero la tabla enumera 0 a 12 y pasos 6.2, 6.3 y 7.5. Otro lugar habla de 12 pasos. | Runbooks, progress bar y recuperación no comparten el mismo estado. | Definir máquina de estados con IDs, no números narrativos; generar documentación desde ella. |
| A-31 | Alta | Se promete WCAG AAA y contraste 7:1, mientras el estándar usa “delta de luminosidad 30 %”, que no es el criterio WCAG. | Certificación de accesibilidad falsa. | Usar ratio WCAG por tipo/tamaño de texto, pruebas automatizadas y revisión manual. |
| A-32 | Media | Lucide aparece prohibido en parte de la biblioteca, permitido en estándares y optimizado activamente por tareas. | Linter y generadores pueden dar instrucciones opuestas. | Política única: permitido con imports selectivos o SVG según el tipo de paquete. |

### 7.3 Negocio, producto, legal y crecimiento

| ID | Severidad | Inconsistencia encontrada | Impacto | Corrección concreta |
|---|---|---|---|---|
| B-01 | Alta | Se documentan 7 nichos en el mapa, 13 en investigación y 23 en el wizard. El mapa de 7 incluso salta del número 1 al 3. | No hay catálogo comercial canónico. | Definir taxonomía única y separar ICP activo de nichos exploratorios. |
| B-02 | Alta | App Ventas se declara 85 % lista para cualquier vertical sin evidencia de cobertura ni aceptación. | Se subestima el último 15 %, que suele contener reglas críticas del negocio. | Matriz de capacidades por ICP y gaps medidos en pilotos. |
| B-03 | Media | Se mezclan PROTOTIPE, Prototipe, Prototype CLI, PROTOTIPE 2.0 y Facture Flex. | Confusión de marca, producto y herramienta interna. | Arquitectura de marca: empresa, plataforma interna, producto y ediciones. |
| B-04 | Alta | “No es software genérico” y “adaptación exacta” conviven con una estrategia de plantillas y configuración reusable. | Promesa de personalización ilimitada. | Posicionarlo como software vertical configurable con límites claros. |
| B-05 | Crítica | Los rangos de precio no incorporan costo de descubrimiento, migración, QA, capacitación, soporte, nube y riesgo. | Margen negativo oculto. | Fórmula de costo completo y mínimo de contribución antes de cotizar. |
| B-06 | Alta | Se confunde “infraestructura $0” con CAC $0 en investigación comercial. | El plan financiero subestima adquisición y operación. | Separar CAC, COGS cloud, soporte, implementación, I+D y gastos generales. |
| B-07 | Alta | Una venta mensual procesada superior a 500.000 COP se usa como métrica de éxito de validación. | Procesar ventas no demuestra valor, retención ni rentabilidad. | Exigir pago, activación, uso repetido, resultado, retención y margen. |
| B-08 | Alta | El roadmap pretende tres verticales al llegar a unos 10 clientes. | Fragmenta aprendizaje y producto demasiado pronto. | Permanecer en un ICP hasta superar puertas de repetibilidad. |
| B-09 | Alta | La meta de 200 clientes no tiene modelo de capacidad, ingresos, soporte, churn, contratación o capital. | Es aspiración, no roadmap. | Modelo por escenarios con clientes, ARPA, margen, horas de soporte y contratación. |
| B-10 | Alta | Se prometen ahorro de 3 horas/día, errores casi 0 %, soporte al instante, disponibilidad, 45 minutos de formación y 100 % de adopción. | Riesgo legal y reputacional. | Baseline por cliente, rangos, SLA y casos verificables; eliminar absolutos. |
| B-11 | Crítica | El contrato no identifica plenamente partes, jurisdicción concreta, vigencia, aceptación, SLA, cambios, impuestos, mora, confidencialidad, límite monetario de responsabilidad ni resolución de disputas. | Cobro y ejecución contractual débiles. | Contrato maestro y orden de servicio revisados por abogado. |
| B-12 | Crítica | La política dice que PROTOTIPE es “proveedor de infraestructura”, pero no define Responsable/Encargado, instrucciones, subencargados, finalidades, derechos, incidentes o transmisiones. | Incumplimiento potencial de Ley 1581 y falta de responsabilidades. | DPA/anexo de transmisión, inventario de datos y procedimiento de titulares. |
| B-13 | Alta | El cliente es dueño de sus datos, mientras el manual dice que PROTOTIPE es dueño exclusivo del proyecto GCP/Firebase. | Dependencia y disputa de salida. | Contrato debe definir titularidad de cuenta, acceso, portabilidad, costos y transferencia. |
| B-14 | Alta | El manual fija purga a 30 días, pero contrato y política solo hablan de un período limitado o razonable. | Retención no consensuada. | Un único calendario de exportación, retención, legal hold y eliminación verificable. |
| B-15 | Crítica | Se cobra comisión sobre eventos reportados por la propia app cliente. | Subdeclaración, duplicados o disputas. | Fuente autoritativa, cierre firmado, estados de reverso y derecho de auditoría. |
| B-16 | Alta | Promover una Feature de cliente al registro global no exige consentimiento contractual, licencia ni revisión de PII. | Apropiación o filtración de trabajo del cliente. | Cláusula de reutilización y pipeline de sanitización/provenance. |
| B-17 | Alta | Documentos CRO proponen cifras de conversión, pérdidas y prueba social como “14 ferreterías” sin evidencia entregada. | Marketing engañoso si se publica. | Solo estadísticas reales, fuente y fecha; etiquetar simulaciones como ejemplos. |
| B-18 | Alta | Se ofrecen respaldos diarios automáticos y alta disponibilidad sin SLO, RPO, RTO ni prueba. | Obligación difícil de cumplir. | Anexo de servicio con métricas, exclusiones y créditos/solución pactada. |
| B-19 | Alta | enableDianBilling aparece como flag comercial, pero no hay evidencia entregada de habilitación, proveedor tecnológico, pruebas de validación ni soporte normativo. | Riesgo fiscal si se vende como facturación autorizada. | Venderlo solo mediante integración certificada y revisión DIAN vigente. |
| B-20 | Media | Marketing pretende muchos canales y verticales a la vez, sin presupuesto, owner, hipótesis o criterio de corte. | Dispersión y CAC incalculable. | Un canal primario por ciclo de 4 semanas y experimentos con meta/costo. |

### 7.4 Calidad documental

| ID | Severidad | Inconsistencia encontrada | Impacto | Corrección concreta |
|---|---|---|---|---|
| D-01 | Media | Hay mojibake y caracteres rotos en secciones consolidadas. | Búsqueda, parsing y credibilidad disminuyen. | Normalización UTF-8 y test de caracteres inválidos en CI. |
| D-02 | Media | Muchos vínculos usan file:///D:/ y no son portables. | Revisores y automatizaciones externas no pueden abrir evidencia. | Rutas relativas de repositorio y enlaces a commit/artefacto. |
| D-03 | Alta | Los documentos no usan de forma consistente owner, estado, vigencia, commit verificado ni “supersede”. | Una decisión vieja parece actual. | Front matter obligatorio y validador documental. |
| D-04 | Alta | Se usa 100 % como estado recurrente sin definir el universo, la prueba o la fecha. | Métricas vacías. | Prohibir porcentajes sin fórmula y evidencia enlazada. |
| D-05 | Media | Propuestas, manuales, auditorías y estado real se consolidan como si tuvieran igual autoridad. | Una IA o persona puede ejecutar una propuesta como estándar. | Tipo documental obligatorio y precedencia canónica. |

### Orden sugerido para corregir inconsistencias

1. A-09 a A-20 y E-03/E-04: seguridad y falsos estados.
2. A-06 a A-08: costos, Storage, cuotas y backups.
3. B-11 a B-19: contrato, privacidad, facturación y promesas.
4. A-01 a A-05 y A-23/A-24: arquitectura y cotización canónicas.
5. E-01/E-02/E-09/E-10 y D-01 a D-05: gobernanza documental.
6. B-01 a B-10/B-20: enfoque comercial y crecimiento.

---

## 8. Ciclo de vida objetivo de punta a punta

El ciclo técnico actual debe convertirse en un subproceso dentro del ciclo del cliente. Cada fase necesita una entrada, un dueño, un resultado verificable y una puerta de decisión.

| Fase | Estado de cuenta | Dueño principal | Entregable obligatorio | Puerta para avanzar |
|---|---|---|---|---|
| 0. Estrategia | ICP definido | Fundador/Producto | ICP, problema, flujo crítico, exclusiones y meta del trimestre | Segmento accesible, dolor frecuente y disposición a entrevistar/pagar |
| 1. Captación | Lead | Ventas fundador | Fuente, contacto, consentimiento y motivo | Encaja con ICP básico |
| 2. Calificación | Qualified | Ventas | BANT ligero: dolor, autoridad, urgencia, proceso actual y presupuesto orientativo | Dolor urgente, decisor involucrado y fecha real |
| 3. Descubrimiento | Discovery | Producto/Implementación | Briefing, mapa de proceso actual y línea base cuantificada | Problema validado por evidencia, no solo opinión |
| 4. Viabilidad | Feasibility | Tech + Producto | Riesgos, datos, integraciones, seguridad, compliance, dependencias y exclusiones | No hay P0 sin mitigación y el alcance cabe en el producto |
| 5. Solución y oferta | Proposal | Producto + Finanzas | Blueprint comercial, demo, alcance, aceptación, precio y business case | Margen proyectado y criterios de aceptación claros |
| 6. Contrato y pago | Contracted | Fundador + Legal/Finanzas | MSA, orden de servicio, DPA, anticipo, responsables y calendario | Firma y pago confirmados antes de trabajo personalizado |
| 7. Kickoff y datos | Ready | Implementación | Plan, RACI, inventario/mapeo de datos, accesos y plan de cambio | Datos limpios, dueño del cliente y fecha de UAT |
| 8. Blueprint técnico | Blueprinted | Plataforma | Blueprint versionado generado desde Knowledge Layer | Validación de schema, compatibilidad, costo y seguridad aprobada |
| 9. Candidate/Staging | Built | Plataforma | Workspace candidato, manifiesto, SBOM, migraciones y artefacto | Compila, no contiene secretos y es reproducible |
| 10. QA y UAT | Accepted | QA + Cliente | Pruebas funcionales, reglas, accesibilidad, rendimiento, restore y UAT firmado | Cero P0/P1 y criterios de aceptación cumplidos |
| 11. Go-live | Live | Implementación/Ops | Deploy, rollback, monitoreo, runbook, formación y soporte inicial | Checklist Go/No-Go y responsable de incidente disponible |
| 12. Activación | Activated | Customer Success | Primer valor, usuarios activos, flujo crítico completado y línea base comparada | Cliente logra el evento de valor dentro del plazo objetivo |
| 13. Operación | Healthy/At risk | Customer Success + Ops | WBR de uso, incidentes, soporte, costos y resultado | Salud verde o plan de recuperación con fecha |
| 14. Renovación/expansión | Renewed/Expanded | CS + Ventas | QBR, ROI, renovación, expansión o downgrade | Valor probado y margen sano |
| 15. Salida y aprendizaje | Offboarded | Ops + Legal + Producto | Exportación, revocación, retención, eliminación, cierre financiero y lecciones | Evidencia de entrega/purga y backlog actualizado |

### 8.1 El subciclo técnico correcto

Dentro de las fases 8 a 11, la secuencia debe ser obligatoria:

1. **Snapshot de Knowledge Layer:** versiones exactas de Core, Features, pricing, schemas, políticas y compatibilidad.
2. **Blueprint determinista:** qué se instalará, por qué, dependencias, migraciones, costo y riesgos.
3. **Validation Layer:** schema, compatibilidad, seguridad, licencia, presupuesto cloud y precondiciones.
4. **Workspace candidato:** nunca escribir directamente en el destino productivo.
5. **Verificación:** unitarias, integración, reglas Firebase, E2E crítica, accesibilidad, seguridad, build y migración.
6. **Aprobación:** humana para producción y contractual para cambios de alcance.
7. **Commit transaccional:** artefacto firmado, manifiesto, changelog y rollback.
8. **Deploy:** identidad de operador, deployment ID, entorno y timestamp.
9. **Observación:** métricas, errores, costos y evento de negocio.
10. **Cierre:** aceptación, evidencia y aprendizaje devuelto al Knowledge Layer.

### 8.2 Definición de “hecho” por tipo de trabajo

| Tipo | No es suficiente | Se considera hecho cuando |
|---|---|---|
| Documento | Archivo creado | Está aprobado, vigente, tiene owner y reemplaza explícitamente versiones anteriores |
| Código | Build exitoso | Tests de riesgo pasan, revisión aprobada y artefacto trazable |
| Feature | Componente renderiza | Cumple flujo, seguridad, accesibilidad, migración, rollback y telemetría |
| Despliegue | Hosting devuelve 200 | Smoke productivo, monitoreo, rollback y UAT listos |
| Cliente | Proyecto generado | Pagó, activó, usa el flujo crítico y recibió valor |
| Hardening | Auditoría escrita | Control remediado y verificado con evidencia negativa/positiva |
| Backup | Export job exitoso | Se restauró una copia y se comprobó integridad dentro del RTO |

### 8.3 Estados canónicos recomendados

No usar solamente pendiente/completada. Usar:

- **PROPOSED:** idea o diseño sin aprobación.
- **APPROVED:** decisión aceptada y financiada.
- **IN_PROGRESS:** implementación activa.
- **IMPLEMENTED:** existe código/configuración, aún sin evidencia completa.
- **VERIFIED:** pruebas reproducibles aprobadas.
- **DEPLOYED:** versión identificable en un entorno.
- **MEASURED:** impacto productivo observado.
- **DEPRECATED:** ya no debe ejecutarse.
- **BLOCKED:** depende de una decisión o recurso explícito.

---

## 9. Arquitectura objetivo para escalar sin reescribir demasiado pronto

### 9.1 Posicionamiento arquitectónico

Durante los primeros clientes, PROTOTIPE puede conservar el Bridge local y proyectos separados si se cierran los P0. Pero debe evolucionar hacia cinco zonas claras:

| Zona | Responsabilidad | Nunca debe contener |
|---|---|---|
| Knowledge Layer | Cores, Features, schemas, compatibilidad, pricing, políticas y decisiones vigentes | Secretos, PII de clientes o afirmaciones sin estado |
| Control Plane | CRM, briefing, blueprints, jobs, versiones, clientes, permisos y auditoría | Lógica financiera confiada al navegador |
| Trusted Backend | Identidad, operaciones privilegiadas, billing, webhooks, integraciones y reconciliación | Credenciales expuestas en bundles |
| Client Data Plane | UI, cache offline, datos del negocio y ejecución del flujo del cliente | Acceso transversal a otros clientes o secretos del proveedor |
| Observability Plane | Logs, métricas, trazas, costos, incidentes y SLO | Datos personales innecesarios o logs sin retención |

### 9.2 Decisiones que conviene tomar ahora

1. **Un monorepo canónico para Core y Features.** Las instancias consumen versiones y manifiestos; no son copias libres que evolucionan sin control.
2. **Configuración como datos.** Branding, módulos, límites y contenido van en manifest/configuración validada. Evitar reescritura frágil de strings en index.html y archivos fuente.
3. **Fork privado como excepción comercial.** Debe tener precio, owner, fecha de reintegración o decisión de mantenimiento permanente.
4. **Backend confiable para privilegios.** Puede ser Cloud Functions, Cloud Run u otra tecnología; la elección depende de costo y operación, no de una prohibición absoluta.
5. **Entornos reales.** Configuración extraída por entorno, datos sintéticos en staging y promoción del mismo artefacto a producción.
6. **Manifiesto de release firmado.** Incluye versiones, hashes, migraciones, SBOM, tests, deployment ID y rollback.
7. **Migraciones primero.** Todo cambio de schema necesita up, validación, compatibilidad hacia atrás y estrategia de rollback/roll-forward.
8. **Observabilidad por cuenta.** Latencia, errores, consumo, costo, uso y salud, sin mezclar PII innecesaria.

### 9.3 Proyecto Firebase por cliente: conservar, cambiar o combinar

| Etapa | Recomendación | Motivo |
|---|---|---|
| 1 a 5 pilotos | Proyecto productivo dedicado por cliente si simplifica aislamiento; staging común sin PII para validar releases | Evita una migración prematura y limita riesgo entre pilotos |
| 5 a 20 clientes | Medir costo y carga; organización GCP, billing, budgets, IAM por rol e inventario automatizado | La cuota y operación empiezan a importar |
| Más de 20 o expansión acelerada | Evaluar con datos tres opciones: dedicado, shards por grupos o multitenant lógico | La decisión depende de regulación, costo, consultas, soporte y requisitos enterprise |

No recomiendo migrar inmediatamente a multitenancy. Recomiendo dejar de asumir que un proyecto por cliente es gratis e ilimitado, y crear desde ahora una interfaz de persistencia que permita cambiar la estrategia sin tocar el dominio.

### 9.4 Modelo de repositorios y versiones

Modelo recomendado:

- **Core:** paquetes/versiones inmutables y semver.
- **Feature:** paquete con manifest, contratos, migraciones, owner, licencia, pruebas y compatibilidad.
- **Vertical:** conjunto curado de Features y configuración; no un fork completo.
- **Cliente:** manifiesto que fija versiones, configuración, excepciones y migraciones aplicadas.
- **Release:** artefacto promovido de candidato a producción.

Eliminar progresivamente:

- sincronización paralela por MD5;
- ramas de cliente que sustituyen paquetes/versiones;
- modificación directa de Core dentro de una instancia;
- múltiples registries que afirman ser canónicos;
- promoción automática de código cliente sin cuarentena.

### 9.5 Seguridad mínima por capa

| Capa | Control mínimo |
|---|---|
| Identidad | MFA para operadores, invitación segura para admins, sesiones revocables |
| Autorización | RBAC/ABAC en backend y reglas; denegar por defecto |
| Bridge | Loopback, autenticación, permiso por endpoint, validación de ruta, CSRF/CORS y audit log |
| Datos | Minimización, cifrado, retención, exportación y borrado verificable |
| Firebase | Emulator tests, App Check enforced después de monitoreo, IAM mínimo y budgets |
| Software supply chain | lockfile, SBOM, escaneo, firma y provenance |
| Operación | backups restaurables, incident response, rotación de secretos y simulacros |
| Cliente | no confiar en flags, roles, montos o tokens enviados por navegador |

---

## 10. Estrategia de negocio recomendada

### 10.1 Qué empresa construir primero

Construir una **empresa de software vertical configurable con implementación acompañada**, no una agencia ilimitada y todavía no un marketplace abierto.

La promesa inicial debe ser una sola:

> Ayudamos a un tipo concreto de comercio a controlar un flujo concreto, entrar en operación rápidamente y demostrar un resultado medible, sin obligarlo a adoptar un sistema empresarial complejo.

### 10.2 ICP recomendado como hipótesis inicial

Con la evidencia disponible, la hipótesis más avanzada es:

- comercio minorista independiente;
- una sola sede;
- dueño todavía involucrado en la operación;
- 2 a 10 empleados;
- catálogo e inventario manejables;
- ventas frecuentes;
- desorden visible en caja, stock o cuentas por cobrar;
- acceso directo al decisor;
- no requiere inicialmente integración fiscal compleja ni ERP.

Puede ser ropa/accesorios, porque App Ventas y Moni aparecen como base más madura. Ferretería también muestra un dolor fuerte, pero suele aumentar complejidad por unidades, variantes, listas de precios, crédito y volumen de catálogo. La decisión final debe salir de entrevistas y pagos, no de preferencia técnica.

### 10.3 Cómo elegir entre ropa, ferretería y otro nicho

Puntuar cada nicho de 1 a 5 con evidencia de entrevistas:

| Criterio | Peso sugerido |
|---|---:|
| Dolor frecuente y costoso | 20 % |
| Disposición a pagar | 20 % |
| Acceso a decisores y referidos | 15 % |
| Repetibilidad del flujo | 15 % |
| Tiempo de implementación | 10 % |
| Carga de soporte esperada | 10 % |
| Riesgo regulatorio/integraciones | 5 % |
| Competencia y diferenciación | 5 % |

No elegir por tamaño de mercado. Elegir por velocidad de aprendizaje pagado y capacidad de generar un caso repetible.

### 10.4 Producto inicial y exclusiones

**Producto inicial sugerido:** operación diaria de tienda de una sede.

Incluye como máximo:

- catálogo básico;
- ventas/POS y cierre de caja;
- inventario y movimientos auditables;
- usuarios/roles esenciales;
- reporte diario simple;
- importación inicial acotada;
- formación y acompañamiento de 30 días.

Opcional solo si tres clientes lo exigen de forma similar:

- cuentas por cobrar/fiado;
- catálogo QR;
- lector de códigos.

Fuera del primer alcance repetible:

- DIAN nativa;
- pasarela integrada;
- WhatsApp API automatizada;
- IA predictiva;
- múltiples sedes;
- offline con conciliación financiera compleja;
- marketplace público;
- personalizaciones sin límite;
- segundo vertical.

### 10.5 Oferta comercial

Crear tres ofertas, no decenas de combinaciones:

| Oferta | Para quién | Incluye | Límite |
|---|---|---|---|
| Design Partner pagado | Primeros 3 a 5 clientes del mismo ICP | Setup reducido, producto estándar, sesiones semanales y precio preferencial temporal | Feedback, permiso de métricas y cero desarrollo exclusivo no cotizado |
| Standard | ICP validado | Setup, importación acotada, capacitación, soporte y suscripción | Una sede, límites de usuarios/datos y SLA definido |
| Pro | Cliente que ya obtiene valor | Integraciones o módulos aprobados, mayor soporte y analítica | Precio basado en costo/valor; no rompe Core |

No recomendaría comisión porcentual en la primera etapa. Una mensualidad fija es más simple de explicar, cobrar y auditar. La comisión puede reabrirse cuando exista un ledger confiable y cuando el modelo aumente de forma comprobable los ingresos del cliente.

### 10.6 Fórmula de precio que sí protege la empresa

**Piso de setup:**

Horas de descubrimiento + configuración + migración + QA + formación + gestión, multiplicadas por el costo cargado por hora, más servicios de terceros, contingencia por incertidumbre y margen de implementación.

**Piso mensual:**

Infraestructura + monitoreo + backup + reserva de soporte + Customer Success + herramientas + riesgo de impago, dividido por uno menos el margen bruto objetivo.

**Desarrollo exclusivo:**

Estimación independiente, anticipo, mantenimiento futuro y decisión expresa sobre propiedad/reutilización.

Los rangos actuales pueden servir como hipótesis comercial, pero no deben publicarse como precios finales hasta medir al menos cinco implementaciones.

### 10.7 Economía unitaria obligatoria por cliente

Registrar desde el primer piloto:

- horas de venta y descubrimiento;
- horas de setup, migración, QA y formación;
- horas de soporte en D7, D30 y cada mes;
- costo cloud y herramientas;
- devoluciones/descuentos;
- ingreso de setup reconocido;
- MRR cobrado, no solo facturado;
- margen de setup;
- margen de contribución mensual;
- meses para recuperar CAC;
- motivo de churn o expansión.

Sin esos datos, no contratar vendedores ni invertir fuerte en anuncios. Primero hay que demostrar que una venta adicional produce capacidad financiera, no más carga.

### 10.8 Go-to-market inicial

1. Venta liderada por el fundador.
2. Una landing para un solo nicho y un solo resultado.
3. Demostración con datos ficticios del nicho, claramente etiquetados.
4. Diagnóstico corto que termina en una llamada, no en una cotización automática definitiva.
5. Alianzas locales y referidos después de tener un caso real.
6. Contenido basado en problemas y resultados verificados, no en cantidad de Features.
7. Paid media solo cuando el embudo orgánico demuestre conversión y payback.

### 10.9 Ventaja competitiva acumulable

Cada implementación debe producir activos reutilizables:

- mapa de proceso del nicho;
- diccionario de datos;
- objeciones y lenguaje de venta;
- plantilla de migración;
- métricas de línea base;
- configuración estándar;
- pruebas de aceptación;
- runbooks de soporte;
- benchmarks anónimos y autorizados;
- casos de éxito verificables.

Eso es el verdadero Knowledge Layer. Una biblioteca grande de UI sin evidencia de uso es inventario técnico, no todavía una ventaja competitiva.

---

## 11. Oportunidades de mejora con mayor retorno

### 11.1 Convertir la automatización interna en margen

La automatización del CLI solo crea valor empresarial si reduce de forma medible:

- horas de setup;
- errores de despliegue;
- tiempo hasta primer valor;
- costo de soporte;
- tiempo de actualización;
- variación entre clientes.

Medir esos seis indicadores por release. Si una automatización no mejora uno, no debe desplazar trabajo de clientes o seguridad.

### 11.2 Vender implementación y adopción, no código “a medida”

Las microempresas no compran una arquitectura. Compran control, tranquilidad, ahorro o crecimiento. Empaquetar:

- diagnóstico;
- configuración;
- migración;
- capacitación;
- acompañamiento;
- resultado medido.

Esto permite cobrar setup de forma legítima, aprender cerca del cliente y evitar competir solo por la mensualidad más baja.

### 11.3 Hacer de la migración una ventaja

Para negocios tradicionales, cargar productos, saldos, clientes y stock suele ser más difícil que usar el software. Una plantilla robusta de importación, limpieza, preview, validación, rollback y conciliación puede ser un diferenciador más fuerte que muchos componentes visuales.

### 11.4 Crear un “Golden Path” de un solo vertical

Un camino dorado contiene:

- demo;
- checklist de venta;
- briefing corto;
- plantilla de datos;
- Blueprint preaprobado;
- configuración estándar;
- suite de aceptación;
- formación;
- health score;
- runbooks;
- caso de éxito.

El objetivo es que el 80 a 90 % del trabajo sea idéntico. El porcentaje exacto debe medirse; no declararse antes.

### 11.5 Asociaciones en vez de integraciones propias tempranas

Para DIAN, pagos y WhatsApp, asociarse inicialmente con proveedores establecidos puede reducir riesgo y tiempo. PROTOTIPE debe dominar el workflow y la experiencia; no necesita ser desde el día uno proveedor fiscal, procesador de pagos y plataforma de mensajería.

### 11.6 Datos de uso como sistema de Customer Success

Con consentimiento y minimización, usar eventos para detectar:

- cuenta que no completó configuración;
- empleados que no ingresan;
- cierre de caja omitido;
- inventario sin actualizar;
- errores repetidos;
- caída de uso.

Esto permite intervenir antes del churn. No usar datos del negocio para fines no autorizados.

### 11.7 Marketplace interno antes que marketplace comercial

El registry de Features puede generar valor primero como catálogo interno curado. La apertura externa debe esperar a que existan:

- contratos de API;
- semver;
- licencias;
- escaneo de seguridad;
- soporte por versión;
- revenue share;
- proceso de retiro;
- reputación y revisión.

### 11.8 Casos de éxito como activo comercial

Cada caso debe tener:

1. línea base;
2. fecha y alcance;
3. métrica antes/después;
4. fuente del dato;
5. período de observación;
6. testimonio autorizado;
7. limitaciones.

Un caso real bien probado vale más que veinte testimonios genéricos.

---

## 12. Sistema de métricas y gobierno de decisiones

### 12.1 North Star

**Cuentas pagas que completan semanalmente su flujo crítico y alcanzan el resultado prometido.**

No usar como North Star número de componentes, tareas cerradas, builds o proyectos generados. Son medios, no valor.

### 12.2 Árbol de métricas

| Dimensión | Métrica | Definición mínima | Frecuencia | Dueño |
|---|---|---|---|---|
| Demanda | Leads ICP | Leads que cumplen segmento y problema | Semanal | Ventas |
| Conversión | Discovery a piloto pago | Pilotos pagados / discoveries calificadas | Semanal | Fundador |
| Velocidad | Ciclo de venta | Días desde primera conversación hasta pago | Semanal | Ventas |
| Activación | Time to First Value | Días desde pago hasta primer flujo crítico completo | Por cuenta | Implementación |
| Activación | Activation rate | Cuentas que alcanzan evento de valor dentro del plazo / cuentas live | Semanal | CS |
| Uso | Critical workflow WAU | Cuentas con al menos N flujos válidos por semana | Semanal | Producto |
| Resultado | Outcome delta | Diferencia contra línea base acordada | Mensual | CS + Cliente |
| Retención | Retención de cuentas pagas | Cohorte que continúa pagando y usando | Mensual | CS |
| Soporte | Horas por cuenta | Tiempo humano total por cuenta y causa | Semanal | Soporte |
| Calidad | First-pass provisioning | Aprovisionamientos que pasan sin retrabajo / total | Por release | Plataforma |
| Calidad | Change failure rate | Deploys con rollback/incidente / deploys totales | Mensual | Tech |
| Resiliencia | Restore success | Simulacros restaurados íntegramente / simulacros | Mensual/trimestral | Ops |
| Fiabilidad | MTTR | Tiempo desde detección hasta restauración | Por incidente | Ops |
| Finanzas | Setup margin | Ingreso de setup menos costo directo / ingreso | Por cliente | Finanzas |
| Finanzas | Monthly contribution | MRR cobrado menos cloud, soporte y COGS directo | Por cuenta | Finanzas |
| Finanzas | Gross margin | Ingresos menos COGS / ingresos | Mensual | Finanzas |
| Adquisición | CAC | Gasto comercial y horas imputadas / nuevos clientes | Mensual | Finanzas/Ventas |
| Caja | Runway | Caja disponible / burn neto mensual | Semanal | Fundador |

### 12.3 Health score de cliente

Puntuar con señales observables, no con intuición:

- activación completada;
- frecuencia del flujo crítico;
- número de usuarios activos;
- errores/incidentes;
- tickets y tiempo de respuesta;
- resultado contra línea base;
- pago al día;
- sponsor comprometido.

Estados recomendados: onboarding, healthy, attention, at risk, renewal due, churned. Cada estado necesita playbook y owner.

### 12.4 Puertas numéricas propuestas

Estos umbrales son **criterios iniciales de decisión, no pronósticos ni benchmarks universales**. Deben ajustarse con datos reales.

| Puerta | Condición propuesta | Si no se cumple |
|---|---|---|
| Abrir piloto | Cero P0 en alcance, contrato/DPA, baseline y responsable cliente | No usar datos reales |
| Repetir oferta | Al menos 3 clientes de pago del mismo ICP completan el mismo flujo | Refinar producto/segmento, no abrir vertical |
| Declarar señal inicial | 5 clientes pagos; al menos 3 siguen activos tras 8 semanas; TTFV de 14 días o menos | Entrevistar churn/no adopción y reducir alcance |
| Productizar | Al menos 80 % de pasos de implementación son estándar y la variación de horas es menor a 20 % | No automatizar más; eliminar excepciones |
| Escalar adquisición | Contribución mensual positiva, soporte por cuenta controlado y canal con payback aceptable | No aumentar ads ni contratar ventas |
| Abrir segundo vertical | Primer ICP tiene retención, caso verificable, Core estable y capacidad operativa | Permanecer enfocado |
| Abrir marketplace | 10 o más Features internas han pasado el pipeline de promoción y soporte por varias versiones | Mantenerlo interno |

### 12.5 Reuniones operativas

- **Diaria, 15 minutos durante pilotos:** bloqueos, incidentes y clientes en riesgo.
- **Semanal de negocio:** embudo, activación, uso, soporte, caja y decisiones.
- **Quincenal de producto:** aprendizaje de clientes, cambios estándar y backlog.
- **Mensual de riesgo:** seguridad, costos cloud, backups, accesos y contratos.
- **Trimestral:** seguir, acelerar, enfocar, subir precio, contratar o detener un vertical.

Cada reunión termina con decisión, owner, fecha y evidencia. No crear tareas por crear.

---

## 13. Roadmap ejecutable de 0 a 24 meses

### 13.1 Principios del roadmap

1. Seguridad antes de datos reales.
2. Pago antes de personalización sustancial.
3. Un ICP antes de un segundo vertical.
4. Valor y retención antes de adquisición pagada.
5. Margen antes de contratar para crecer.
6. Evidencia antes de declarar completitud.
7. Plataforma después de repetir manualmente un proceso sano.

### 13.2 Primeros 14 días: salir del modo documento y entrar al modo evidencia

| Día | Acción | Resultado observable |
|---|---|---|
| 1 | Congelar nuevas Features, Cores y verticales durante 30 días | Decisión publicada y backlog en pausa |
| 1 | Nombrar un owner para Producto, Tecnología, Operación y Comercial, aunque una persona tenga varios roles | RACI visible |
| 2 | Crear registro único de riesgos P0 y detener despliegues reales del alcance afectado | Lista con owner, prueba y fecha |
| 2-3 | Definir documentos canónicos y marcar los demás como reemplazados | Índice de autoridad |
| 3 | Corregir score 108, catálogo de nichos, proyectos centrales y modelo Repository | ADR y schemas únicos |
| 3-5 | Auditar código real de secretos, Bridge, Firestore/Storage, primer admin, telemetry y billing | Informe reproducible contra commit |
| 4-6 | Reparar P0 del piloto y crear tests negativos | Evidencia verde en CI/emulador |
| 5 | Crear costeo por actividad y hoja de economía unitaria | Precio piso por oferta |
| 5-7 | Preparar MSA, Order Form, SLA y DPA para revisión jurídica | Paquete listo para abogado |
| 6-8 | Elegir dos nichos candidatos y reclutar entrevistas | Agenda de al menos 10 conversaciones |
| 8-11 | Realizar entrevistas sin vender primero; cuantificar proceso, dolor, alternativas y presupuesto | Matriz de evidencia por nicho |
| 10-12 | Elegir un ICP y diseñar oferta Design Partner pagada | One-pager con alcance y exclusiones |
| 11-13 | Preparar demo y dataset ficticio del nicho; definir evento de valor y baseline | Demo segura y guion |
| 12-14 | Presentar oferta a prospectos calificados y solicitar compromiso pago | Primeras decisiones reales de mercado |

### 13.3 Días 15 a 30: habilitar el primer piloto sano

**Objetivos:** una verdad operativa, producto estrecho, seguridad del alcance y primeros compromisos pagados.

Entregables:

- repositorio y commit auditado;
- cero P0 abiertos dentro del alcance del piloto;
- score/precio canónico;
- un ICP y un flujo crítico;
- oferta y contrato revisados;
- presupuesto cloud por cliente;
- backup y restore probados en entorno no productivo;
- dashboard mínimo de activación y uso;
- 2 a 3 design partners dispuestos a pagar;
- calendario de onboarding y baseline.

**Puerta día 30:** si nadie paga, no construir más funcionalidades. Revisar dolor, segmento, propuesta, confianza y precio mediante entrevistas de pérdida.

### 13.4 Días 31 a 60: entregar y aprender con pocos clientes

**Objetivos:** llevar a valor a los primeros clientes y medir costo real.

Acciones:

1. Onboardear clientes de uno en uno con el mismo Golden Path.
2. Registrar tiempo por actividad y toda excepción.
3. Importar datos con preview, validación, conciliación y rollback.
4. Ejecutar UAT con guion y aceptación firmada.
5. Medir TTFV, uso semanal, errores, soporte y resultado.
6. Realizar reuniones semanales de 20 minutos con cada design partner.
7. No incorporar una solicitud al Core porque un solo cliente la pida.
8. Clasificar solicitudes: bug, configuración, Feature compartida, integración o desarrollo privado.
9. Ejecutar primer simulacro de incidente y segundo restore.
10. Ajustar precio con las horas reales del primer piloto.

**Puerta día 60:** al menos dos clientes deben haber completado el evento de valor. Si no, reducir el flujo y solucionar adopción antes de vender más.

### 13.5 Días 61 a 90: demostrar repetibilidad inicial

**Objetivos:** cinco clientes de pago del mismo ICP como meta de aprendizaje, tres con uso sostenido y una implementación cada vez más estándar.

Acciones:

- cerrar los pilotos restantes solo del mismo ICP;
- comparar cohortes de activación;
- eliminar Features no usadas;
- automatizar únicamente los pasos repetidos y estables;
- escribir runbooks a partir de incidentes reales;
- obtener un caso de éxito autorizado y verificable;
- implementar health score y playbooks de at risk;
- revisar margen por cuenta;
- decidir continuar, reposicionar o detener.

**Puerta día 90:** avanzar a productización si existe pago, uso sostenido, valor medido, contribución positiva o una ruta clara a ella, y ningún P0 abierto. De lo contrario, no abrir un segundo nicho.

### 13.6 Meses 4 a 6: productizar el primer vertical

Prioridades:

- convertir excepciones frecuentes en configuración o Feature curada;
- estabilizar un release train mensual;
- panel de observabilidad técnica y de Customer Success;
- backend confiable para billing, integraciones y operaciones privilegiadas;
- automatizar provisioning con jobs persistentes y reconciliación cloud;
- formalizar soporte, severidades, SLO, RPO y RTO;
- cerrar alianzas de referidos;
- publicar uno o dos casos reales;
- revisar precios y retirar descuentos de design partner;
- asegurar que el margen mensual sea positivo y mejore.

**No hacer todavía:** marketplace público, tercer Core, IA autónoma que modifique producción o campañas amplias de pago.

### 13.7 Meses 6 a 12: construir una máquina comercial pequeña

Solo si se superaron las puertas anteriores:

- estandarizar demo, discovery, propuesta y onboarding;
- crear un canal primario repetible: referidos, asociaciones o outbound vertical;
- medir CAC y payback completos;
- contratar implementación/Customer Success cuando el fundador dedique más de 40 % de su tiempo a entrega o el soporte ponga en riesgo ventas/producto;
- contratar ingeniería cuando el backlog comprometido supere la capacidad y el beneficio bruto recurrente pueda sostener el costo con runway;
- no contratar vendedor hasta que el fundador haya cerrado suficientes ventas para documentar un proceso repetible;
- probar expansión dentro del mismo cliente antes de otro vertical: usuarios, sede, módulo o volumen;
- evaluar arquitectura dedicada versus shards con datos reales de costo y operación;
- preparar auditoría de seguridad independiente.

Resultado esperado, no garantizado: una empresa con oferta clara, cohortes medibles, operación repetible y primeras señales de canal. El número de clientes debe ser consecuencia de capacidad y economía, no una cuota arbitraria.

### 13.8 Meses 12 a 24: expansión controlada

Abrir un segundo vertical solo si el primero cumple:

- retención de cohortes;
- uso sostenido;
- margen sano;
- TTFV predecible;
- soporte controlado;
- al menos un canal repetible;
- Core con pocas excepciones;
- equipo capaz de operar sin depender de una sola persona.

El segundo vertical debe reutilizar el Core y cambiar un conjunto acotado de Features. Tratarlo como una prueba, no como lanzamiento masivo.

En esta etapa sí puede evaluarse:

- marketplace para partners aprobados;
- API pública y webhooks;
- programa de implementadores;
- expansión regional;
- certificaciones de seguridad;
- productos de datos agregados y anónimos con base legal;
- capital externo si acelera una máquina demostrada.

### 13.9 La meta de 200 clientes

No hay datos suficientes para poner una fecha responsable a 200 clientes. Faltan ARPA, churn, CAC, payback, horas por cuenta, capacidad de soporte y caja. Convertir 200 en una fecha ahora sería inventar.

Use estas puertas antes de perseguirla:

1. 5 clientes: señal de problema y entrega.
2. 10 clientes: señal de repetibilidad operativa.
3. 25 clientes: señal de retención y soporte.
4. 50 clientes: señal de canal y estructura de equipo.
5. 100 clientes: señal de plataforma y control financiero.
6. 200 clientes: resultado de canal, capital, confiabilidad y liderazgo, no solo de automatización técnica.

En cada puerta se decide si acelerar o reparar. No saltar una puerta porque el dashboard pueda generar proyectos rápidamente.

### 13.10 Priorización del backlog

Usar este orden:

1. Riesgo legal/seguridad crítico.
2. Bloqueo de activación o ingreso.
3. Retención y resultado del ICP.
4. Reducción de soporte/costo.
5. Repetibilidad de implementación.
6. Adquisición y conversión.
7. Expansión.
8. Exploración.

Regla de entrada al Core: una Feature debe ser necesaria para el flujo crítico o solicitada de forma comparable por al menos tres clientes pagos, tener contrato estable y no degradar el Core. El número tres es una regla operativa inicial, no una ley; documentar excepciones.

---

## 14. Organización, caja y capacidad

### 14.1 Roles mínimos, aunque al comienzo sean la misma persona

| Rol | Responsabilidad no delegable | Indicador principal |
|---|---|---|
| Fundador/CEO | ICP, ventas, caja, contratación y prioridades | Clientes pagos retenidos y runway |
| Producto | Descubrimiento, alcance, resultado y backlog | Activación y outcome |
| Tech/Plataforma | Arquitectura, seguridad, release y fiabilidad | Change failure, MTTR y P0 |
| Implementación/CS | Datos, onboarding, formación, salud y renovación | TTFV, soporte y retención |
| Finanzas/Ops | Cobro, costos, margen, contratos y proveedores | Contribución y cartera |
| Legal/Privacidad | Contrato, DPA, incidentes y cumplimiento | Riesgos/obligaciones cerrados |

Una sola persona puede cubrir varios roles, pero cada decisión debe tener un sombrero explícito. Eso evita priorizar lo técnicamente interesante sobre lo comercialmente necesario.

### 14.2 Orden de contratación sugerido

1. **Apoyo fraccional legal y de seguridad:** antes de manejar datos y cobros de varios clientes.
2. **Implementación/Customer Success:** cuando la entrega y soporte consuman más del 40 % del tiempo del fundador o retrasen ventas y producto.
3. **Ingeniería de producto/plataforma:** cuando haya demanda pagada y un backlog repetible, no para abrir más nichos especulativos.
4. **QA/soporte operativo:** cuando releases o tickets superen la capacidad de una persona y ya existan runbooks.
5. **Ventas:** después de que el fundador haya probado el proceso, objeciones, precio y win/loss.

No contratar por número de clientes solamente. Contratar por carga observada, margen y riesgo.

### 14.3 Disciplina de caja

- Mantener forecast de caja de 13 semanas, actualizado cada semana.
- Cobrar un anticipo que cubra el trabajo comprometido antes de personalizar.
- Vincular el segundo pago a UAT/go-live, no a promesas informales.
- Suspender trabajo fuera de alcance hasta aprobar change request.
- Cobrar la suscripción por adelantado.
- Registrar cartera vencida y política de suspensión con avisos.
- Separar dinero de impuestos, infraestructura y operación.
- Asignar costo cloud por cliente desde el primer día.
- No financiar desarrollos exclusivos con la mensualidad futura esperada.
- Conservar runway antes de una contratación fija.

### 14.4 Cuándo buscar inversión

Capital externo tiene sentido si acelera un sistema que ya muestra:

- retención;
- margen;
- canal;
- mercado suficientemente grande;
- uso repetido;
- un equipo capaz de absorber capital.

Antes de eso, pilotos pagados, setup y servicios productizados son una forma más sana de financiar aprendizaje y preservar control.

---

## 15. Sistema documental que debe reemplazar el actual

### 15.1 Fuentes de verdad por dominio

| Dominio | Documento canónico | Qué contiene |
|---|---|---|
| Estado ejecutivo | STATE_OF_COMPANY | clientes, ingresos, riesgos, hitos y decisiones verificadas |
| Producto | PRODUCT_STRATEGY | ICP, problema, propuesta, exclusiones y puertas |
| Arquitectura | ADR_INDEX | decisiones vigentes y reemplazadas |
| Contratos técnicos | KNOWLEDGE_REGISTRY | schemas, Cores, Features, compatibilidad y owners |
| Roadmap | OUTCOME_ROADMAP | resultados, métricas, owner y fecha; no lista infinita de actividad |
| Seguridad | RISK_REGISTER | riesgo, exposición, control, evidencia y aceptación |
| Releases | RELEASE_REGISTRY | commit, artefacto, entorno, tests, deploy y rollback |
| Clientes | CUSTOMER_LIFECYCLE | estado, contrato, activación, salud, soporte y renovación |
| Métricas | METRIC_DICTIONARY | fórmula, fuente, owner, frecuencia y calidad |
| Legal | LEGAL_PACK_INDEX | MSA, Order Form, SLA, DPA, privacidad y versiones |

### 15.2 Encabezado obligatorio en todo documento

- ID único;
- título;
- tipo: proposal, standard, runbook, audit, decision o evidence;
- estado;
- owner;
- fecha de creación;
- última revisión;
- versión;
- commit o evidencia verificada;
- reemplaza a;
- reemplazado por;
- próxima revisión.

### 15.3 Reglas automáticas de calidad documental

El CI debe fallar cuando detecte:

- IDs de tarea duplicados;
- palabras 100 %, absoluto, garantizado o cero costo sin evidencia;
- documentos vigentes que apuntan a decisiones deprecated;
- proyecto Firebase no canónico;
- score que no suma al máximo;
- enlaces file:///D:/;
- mojibake;
- secretos o patrones de token;
- Features sin owner, versión, licencia o pruebas;
- tareas cerradas sin evidencia;
- documentos sin revisión vencida;
- números comerciales sin fuente y fecha.

### 15.4 Migración documental en cuatro pasos

1. **Congelar:** no seguir consolidando hasta definir autoridad.
2. **Clasificar:** vigente, histórico, propuesta, evidencia o duplicado.
3. **Resolver contradicciones:** ADR y decisiones comerciales explícitas.
4. **Archivar:** conservar historia, pero fuera del contexto operativo por defecto.

No borrar la historia. Evitar que la historia se ejecute como instrucción presente.

### 15.5 Cómo medir avance de verdad

Reemplazar “486/486 tareas” por un tablero pequeño:

- clientes ICP entrevistados;
- pilotos pagos;
- cuentas activadas;
- cuentas retenidas;
- P0 abiertos;
- TTFV;
- horas de implementación;
- soporte por cuenta;
- restore drills aprobados;
- margen de contribución;
- runway.

---

## 16. Paquete contractual y de privacidad mínimo

Este apartado no sustituye asesoría jurídica. Debe revisarlo un abogado con experiencia en tecnología y protección de datos en Colombia.

### 16.1 Documentos

1. Master Services Agreement.
2. Orden de servicio por cliente.
3. Anexo de alcance y criterios de aceptación.
4. SLA/SLO y soporte.
5. DPA o contrato de transmisión de datos.
6. Política de tratamiento de datos.
7. Aviso de privacidad y autorizaciones cuando corresponda.
8. Anexo de seguridad y respuesta a incidentes.
9. Lista de subencargados/proveedores.
10. Plan de salida, portabilidad, retención y eliminación.

### 16.2 Cláusulas que faltan o necesitan precisión

- identidad y domicilio de las partes;
- vigencia y renovación;
- alcance, exclusiones y change control;
- aceptación y rechazo;
- precios, impuestos, mora y suspensión;
- propiedad del Core, configuración, desarrollos exclusivos y feedback;
- permiso o prohibición de reutilizar Features;
- confidencialidad;
- roles Responsable/Encargado;
- instrucciones y finalidades;
- seguridad y notificación de incidentes con plazo;
- subencargados y transferencias/transmisiones;
- SLA, mantenimiento y soporte;
- RPO/RTO y backups;
- límites y exclusiones de responsabilidad equilibrados;
- indemnidad cuando aplique;
- fuerza mayor;
- resolución de disputas y ley colombiana concreta;
- exportación, retención, eliminación y certificación;
- firma electrónica y avisos.

### 16.3 Principio de datos

No basta decir que “los datos son del cliente”. Debe quedar definido quién decide finalidades y medios, quién procesa por cuenta de quién, qué datos se recogen, por cuánto tiempo, dónde se alojan, quién accede y cómo ejerce sus derechos el titular.

---

## 17. Realidad externa verificada al 13 de julio de 2026

### Firebase y arquitectura

- Desde el **3 de febrero de 2026**, mantener acceso a Cloud Storage for Firebase requiere el plan Blaze. Los buckets antiguos appspot.com pueden conservar una franja sin costo de uso, pero el proyecto debe tener facturación vinculada. Fuente oficial: [Firebase — cambios de requisitos de Cloud Storage](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024).
- En Spark, la cuota de creación de proyectos suele estar alrededor de **5 a 10**; incluso Blaze conserva cuota, aunque puede aumentar con una cuenta de facturación en buen estado. Fuente oficial: [Firebase — comprender los proyectos](https://firebase.google.com/docs/projects/learn-more).
- La exportación/importación administrada de Firestore requiere billing y, para proyectos Firebase, Blaze. Fuente oficial: [Firestore — exportar e importar datos](https://firebase.google.com/docs/firestore/manage-data/export-import).
- Firestore conserva una cuota gratuita de 50.000 lecturas y 20.000 escrituras diarias para una base, pero backups, restores, PITR y clones no tienen uso gratuito. Fuente oficial: [Firestore — precios y cuota gratuita](https://firebase.google.com/docs/firestore/pricing).
- Desplegar Cloud Functions requiere Blaze. Esto no significa necesariamente una factura alta, pero sí facturación, presupuestos y control. Fuente oficial: [Cloud Functions for Firebase — inicio](https://firebase.google.com/docs/functions/get-started).
- Las variables con prefijo VITE se incluyen en el código cliente y no deben contener información sensible. Fuente oficial: [Vite — variables de entorno y modos](https://vite.dev/guide/env-and-mode).
- Firestore Rules **no son filtros**: la query debe demostrar que sus resultados potenciales cumplen la regla. Fuente oficial: [Firestore — consultas seguras](https://firebase.google.com/docs/firestore/security/rules-query).
- App Check y Firebase Authentication son controles complementarios: App Check acredita app/dispositivo; Authentication identifica usuarios. Fuente oficial: [Firebase App Check](https://firebase.google.com/docs/app-check).

### Colombia, mercado y cumplimiento

- El Ministerio de Comercio informó cerca de **1,56 millones de empresas formales activas** en 2024, de las cuales 94,2 % eran microempresas. Esto demuestra amplitud, no demanda validada para este producto. Fuente: [MinCIT — tejido empresarial colombiano](https://www.mincit.gov.co/prensa/noticias/industria/colombia-mayor-cifra-empresas-formales-activas).
- La SIC distingue Responsable del Tratamiento, que decide sobre la base o tratamiento, y Encargado, que trata datos por cuenta del Responsable. También exige alcances, actividades, obligaciones y garantías de seguridad en la relación. Fuente: [SIC — Política de Tratamiento de Datos Personales](https://sedeelectronica.sic.gov.co/politica-de-tratamiento-de-datos-personales).
- La SIC enfatiza responsabilidad demostrada, gestión de riesgos, documentación de decisiones y medidas correctivas. Fuente: [SIC — instrucciones sobre responsabilidad demostrada](https://sedeelectronica.sic.gov.co/comunicado/la-superintendencia-de-industria-y-comercio-emite-instrucciones-para-la-proteccion-de-datos-personales-en-procesos-de-transferencia-de).
- La DIAN mantiene requisitos y calendario para generar y transmitir documento equivalente electrónico. Un flag de software no equivale a cumplimiento fiscal. Fuente: [DIAN — calendario del documento equivalente electrónico](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/calendario-de-implementacion/).

### Implicación estratégica

La oportunidad de microempresas es real, pero la infraestructura, seguridad y cumplimiento ya no permiten una narrativa de “gratis, absoluto y automático”. PROTOTIPE puede seguir siendo muy eficiente si cobra de forma transparente, limita alcance, usa proveedores donde corresponde y convierte confiabilidad en parte del producto.

---

## 18. Decisiones que yo tomaría mañana como fundador

1. **Pausar durante 30 días todo nuevo vertical, Core o Feature no ligado a un piloto pago.**
2. **No desplegar datos reales hasta auditar el código contra los P0 de este informe.**
3. **Declarar una única verdad:** estado, arquitectura, score, proyectos centrales y número de nichos.
4. **Elegir un ICP en dos semanas mediante entrevistas y compromisos de pago.**
5. **Vender una oferta Design Partner con alcance muy estrecho y contrato.**
6. **Medir cada hora y costo para descubrir el precio real.**
7. **Hacer que el evento de éxito sea valor del cliente, no proyecto generado.**
8. **Mantener marketplace e IA autónoma internos hasta que la operación sea segura y repetible.**
9. **Invertir primero en migración, adopción, soporte y fiabilidad.**
10. **Abrir el segundo vertical solo cuando los datos obliguen, no porque la plataforma pueda hacerlo.**

---

## 19. Checklist de cierre de la auditoría

### Para autorizar un piloto con datos reales

- [ ] Código y despliegue exactos identificados.
- [ ] Bridge protegido y limitado a loopback/control plane.
- [ ] No hay secretos en VITE, bundle, logs o respuestas.
- [ ] Primer administrador seguro.
- [ ] Reglas Firestore/Storage con suite de Emulator aprobada.
- [ ] Billing y telemetría autoritativos o fuera de alcance.
- [ ] Presupuesto y alertas cloud configurados.
- [ ] Backup restaurado con éxito.
- [ ] Contrato, orden de servicio y DPA firmados.
- [ ] Baseline y criterio de aceptación acordados.
- [ ] UAT y rollback preparados.
- [ ] Owner de soporte e incidente asignado.

### Para autorizar crecimiento comercial

- [ ] Un ICP y una oferta canónicos.
- [ ] Clientes pagos, activados y retenidos.
- [ ] Caso de éxito real.
- [ ] Setup y mensualidad con margen.
- [ ] TTFV y horas de soporte dentro de objetivo.
- [ ] Canal de adquisición medido.
- [ ] Runbooks y operación sin dependencia total del fundador.
- [ ] Cero P0 y riesgo legal controlado.

---

## 20. Conclusión

PROTOTIPE no está condenado por sus inconsistencias; al contrario, tiene algo difícil de construir: ambición, conocimiento acumulado y una base de automatización. Pero hoy su principal riesgo es creerle a sus propios documentos antes que a la evidencia.

La empresa puede crecer si hace tres cambios de mentalidad:

1. de **muchos nichos** a **un problema dominado**;
2. de **tareas y builds** a **clientes con resultado y margen**;
3. de **absolutos documentales** a **controles verificados**.

El camino para ser grande no es agregar todo desde ya. Es construir una unidad pequeña que funcione, se cobre, se use, se renueve y se pueda repetir sin heroísmo. Después se convierte esa repetición en plataforma. Ese orden preserva caja, reputación y capacidad de aprender.

**Veredicto final:** continuar con foco y disciplina. Autorizar pilotos controlados una vez cerrados los P0 del alcance. No autorizar todavía expansión multivertical, autoservicio masivo ni marketplace público. Revisar la estrategia a los 30, 60 y 90 días con las puertas definidas en este informe.
