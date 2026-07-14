# Paquete de continuidad y reanudación — PROTOTIPE

**Fecha de corte:** 13 de julio de 2026  
**Versión:** 1.0  
**Estado:** ACTIVO — FUENTE DE REANUDACIÓN  
**Propósito:** permitir que una conversación nueva, una cuenta distinta o un asistente distinto reconstruya el contexto de trabajo sin depender del historial del chat actual.  
**Responsable de actualizarlo:** fundador de PROTOTIPE o asistente autorizado.  

---

## 1. Cómo usar este archivo si se pierde el chat

1. Abrir una conversación nueva en una cuenta personal y segura.
2. Cargar este archivo.
3. Cargar también estos dos documentos:
   - `Auditoria_Integral_y_Roadmap_PROTOTIPE_2026-07-13.md`;
   - `Plan_Maestro_Estabilizacion_y_Migracion_Claude_Code_PROTOTIPE.md`.
4. Si se requiere validar los hallazgos contra las fuentes, cargar por separado los 12 consolidados documentales después de revisar y sanear cualquier credencial o dato sensible. No están incluidos en el ZIP portable.
5. Pegar el prompt de reanudación de la sección 2.
6. Informar únicamente qué cambió después del 13 de julio de 2026.
7. No compartir contraseñas, tokens, service accounts, `.env`, llaves privadas ni datos personales de clientes.

La conversación nueva debe tratar este documento como un **resumen de continuidad**, no como prueba de que el código esté implementado o desplegado. Para afirmar estados técnicos debe inspeccionar el repositorio y ejecutar verificaciones.

---

## 2. Prompt exacto para comenzar una conversación nueva

Copiar y pegar el siguiente bloque después de cargar los documentos:

> Estamos continuando el trabajo estratégico y técnico de PROTOTIPE. Lee primero `00_REANUDAR_PROTOTIPE_CONTINUIDAD_2026-07-13.md`, después `Auditoria_Integral_y_Roadmap_PROTOTIPE_2026-07-13.md` y finalmente `Plan_Maestro_Estabilizacion_y_Migracion_Claude_Code_PROTOTIPE.md`. No reinicies el análisis desde cero ni propongas reescribir el proyecto. La decisión confirmada es conservar PROTOTIPE, estabilizarlo y migrar únicamente el entorno de desarrollo asistido desde Antigravity/Gemini hacia Claude Code. Las APIs o funcionalidades Gemini utilizadas por las aplicaciones en runtime están fuera de alcance. El código está en GitHub, pero todavía no se ha demostrado una reconstrucción limpia y no se debe formatear el equipo antes de completar la Etapa -1 de recuperación. Aún no tengo Claude; planeo comprar Claude Pro después de reinstalar mi equipo. Dime qué estado entendiste, qué archivos tomas como fuentes vigentes, qué asuntos siguen sin verificar y cuál es el siguiente paso exacto. No ejecutes cambios ni declares nada completado sin evidencia.

Si ya se avanzó después de la fecha de corte, agregar:

> Desde el último corte ocurrieron estos cambios: [ESCRIBIR SOLO CAMBIOS NUEVOS, CON FECHA, REPOSITORIO, COMMIT Y EVIDENCIA].

---

## 3. Identidad y propósito del proyecto

PROTOTIPE es un ecosistema orientado a producir, configurar y operar soluciones de software reutilizables. Su documentación plantea:

- separación **Core / Features / configuración de cliente**;
- Knowledge Layer como fuente de verdad;
- Blueprint antes de generar;
- Validation Layer antes de escribir al disco;
- Generator, CLI Bridge, manifests, lockfiles, trazabilidad y rollback;
- biblioteca de componentes y módulos reutilizables;
- capacidad multivertical y marca blanca;
- automatización del aprovisionamiento con Firebase, React y herramientas relacionadas.

La secuencia arquitectónica que debe conservarse es:

**Knowledge Layer → Blueprint → Validation Layer → Candidate Workspace → Tests → Generation/Commit → Deployment → Observability.**

La IA puede interpretar, recomendar, redactar y ejecutar tareas autorizadas, pero **no debe sustituir contratos, schemas, validaciones deterministas, pruebas, aprobaciones ni control de cambios**.

---

## 4. Estado ejecutivo confirmado

### 4.1 Veredicto de auditoría

**APROBACIÓN CONDICIONADA PARA PILOTOS CONTROLADOS; NO LISTO PARA ESCALA COMERCIAL AMPLIA.**

El proyecto tiene una base conceptual y técnica valiosa. El problema principal no es falta de trabajo ni falta de visión. El problema es la secuencia: se ha avanzado mucho en una fábrica técnica multivertical antes de probar de forma repetible:

- quién compra;
- qué problema urgente compra;
- cuánto paga;
- cuánto cuesta implementar y soportar;
- qué resultado obtiene;
- cuánto permanece pagando;
- qué parte puede repetirse sin personalización excesiva.

La interpretación vigente es que PROTOTIPE se parece hoy más a un **servicio productizado de implementación de software apoyado por una plataforma interna** que a un SaaS validado y escalado. Esto no obliga a abandonarlo. Indica cuál es el modelo más realista para comenzar a facturar, aprender y productizar.

### 4.2 Alcance de la auditoría

La auditoría revisó 12 archivos consolidados, equivalentes a:

- 40.181 líneas;
- 377.862 palabras;
- 452 documentos de origen registrados en el mapa de consolidación.

No se inspeccionaron directamente en esa auditoría:

- repositorio de código;
- despliegues reales;
- proyectos y reglas Firebase activas;
- logs de producción;
- CI original;
- métricas de uso;
- facturación e ingresos;
- cartera y entrevistas de clientes.

Por ello, los estados documentales como `100 %`, `completado`, `certificado`, `producción` o `AAA` no se deben aceptar como hechos técnicos hasta reproducir la evidencia.

---

## 5. Decisiones ya tomadas

Estas decisiones no deben volver a debatirse sin evidencia nueva:

1. PROTOTIPE no se abandonará.
2. No se hará una reescritura total desde cero.
3. Se protegerá el estado actual antes de formatear el equipo.
4. El código está alojado en GitHub.
5. GitHub no se considerará respaldo completo hasta revisar ramas no publicadas, cambios locales, archivos ignorados, secretos y datos locales.
6. Se migrará **únicamente el entorno de desarrollo asistido** a Claude Code.
7. Las llamadas Gemini API o funcionalidades Gemini que formen parte del producto en runtime no se migrarán en esta fase.
8. No se hará reemplazo masivo de las palabras `Gemini` o `Antigravity`.
9. Se instalará Claude Code después de lograr una instalación limpia y reproducible.
10. La cuenta prevista es Claude Pro; todavía no se ha adquirido ni configurado.
11. Antigravity/Gemini se conservarán congelados como fallback durante dos ciclos verificables del piloto de Claude.
12. Las contradicciones documentales críticas se resolverán antes de convertir instrucciones en skills.

Ruta aprobada:

**Proteger → reinstalar limpio → reproducir sin IA → establecer verdad canónica → instalar Claude Code → crear reglas y skills → migrar un flujo piloto → verificar → retirar Antigravity/Gemini del desarrollo → estabilizar el producto → validar comercialmente.**

---

## 6. Estado actual de ejecución

### Completado

- Recepción y lectura de los 12 consolidados documentales.
- Auditoría integral de producto, arquitectura, seguridad, negocio, operación, economía, legal, escalabilidad y gobernanza documental.
- Registro de 67 inconsistencias o desalineamientos documentales y de negocio.
- Roadmap empresarial propuesto de 0 a 24 meses.
- Decisión de conservar el proyecto y estabilizarlo.
- Decisión de migrar solamente el desarrollo asistido a Claude Code.
- Elaboración del Plan Maestro de Estabilización y Migración.
- Diseño preliminar de estructura para `CLAUDE.md`, `.claude/rules`, `.claude/skills`, `.claude/agents`, settings, permisos, hooks y documentos canónicos.

### Pendiente

- Acceso directo al repositorio o clon local para auditoría del código.
- Inventario de todos los repositorios, subrepositorios y remotos.
- Revisión de ramas locales, commits sin publicar, archivos ignorados y datos no versionados.
- Paquete cifrado de secretos y recuperación.
- Clonación limpia en una carpeta independiente.
- Reproducción de instalación, build y pruebas sin Antigravity, Gemini o Claude.
- Tag de recuperación previo a la adopción de Claude.
- Formateo e instalación limpia del equipo.
- Compra y configuración de Claude Pro.
- Migración piloto y evaluación mediante Golden Tasks.
- Cierre comprobado de riesgos P0.
- Validación con design partners pagos del mismo ICP.

### Siguiente etapa autorizada

**Etapa -1 — Recuperación antes de formatear.**

No está autorizado saltar directamente a instalar Claude, modificar prompts o formatear el equipo.

---

## 7. Hallazgos prioritarios que deben preservarse

### 7.1 Problemas raíz

1. Se escala la solución antes de validar el problema y la compra.
2. El ciclo documentado es principalmente técnico y no cubre todo el ciclo del cliente.
3. El fundador y el Bridge local pueden convertirse en cuellos de botella.
4. Existen demasiados mecanismos de actualización y sincronización.
5. Parte de la frontera de confianza parece ubicada en el navegador.
6. La economía de Firebase está modelada de forma demasiado optimista.
7. La prueba predominante parece ser que el proyecto compila.
8. El pricing no está ligado al costo completo de servir.
9. Algunas promesas comerciales superan la evidencia disponible.
10. Un marketplace público abriría riesgos de cadena de suministro prematuramente.

### 7.2 Riesgos P0 documentales o técnicos por comprobar en código

- contraseñas o secretos expuestos mediante variables `VITE_*`;
- creación del primer administrador por el primer visitante;
- reglas Firestore con listados o permisos demasiado amplios;
- escrituras financieras desde el cliente;
- endpoints destructivos o privilegiados en el Bridge sin protección suficiente;
- distribución o exposición de tokens en onboarding;
- ausencia de una frontera backend confiable para operaciones privilegiadas;
- backups declarados sin pruebas documentadas de restauración;
- estados `100 %` no respaldados por fórmula y evidencia reproducible.

Estos elementos son **riesgos por verificar**, no afirmaciones de que continúen presentes en el código actual.

### 7.3 Gobernanza documental

Hay múltiples fuentes de verdad, duplicados, estados incompatibles, propuestas descritas como implementaciones, rutas locales `file:///D:/`, IDs que pueden repetirse y porcentajes sin definición uniforme.

Se debe crear un directorio canónico mínimo:

```text
Documentacion PROTOTIPE/00_Canonico/
├── 00_ESTADO_REAL.md
├── 01_ARQUITECTURA_VIGENTE.md
├── 02_PRODUCTO_E_ICP.md
├── 03_RIESGOS_P0.md
├── 04_DEFINITION_OF_DONE.md
└── 05_REGISTRO_DECISIONES.md
```

Cada documento debe distinguir:

- hecho verificado;
- afirmación interna no verificada;
- propuesta;
- riesgo;
- decisión aprobada;
- estado deprecated.

---

## 8. Orientación de negocio vigente

### 8.1 Foco recomendado

Hipótesis inicial: **App Ventas para comercio minorista de una sola sede**, con alcance estrecho:

- catálogo;
- ventas/caja;
- inventario;
- cuentas por cobrar solo si se valida como necesidad crítica.

DIAN, pagos integrados, omnicanalidad compleja, segundo vertical y marketplace público deben permanecer fuera del primer producto repetible, salvo obligación específica de un piloto pago y con alcance controlado.

### 8.2 Orden empresarial recomendado

**Seguridad y verdad documental → un ICP → oferta estrecha → pilotos pagados → resultado medido → repetibilidad → economía unitaria → canal comercial → segundo vertical → plataforma/marketplace.**

La meta inmediata no es llegar a 200 clientes. La meta de los primeros 90 días es conseguir y retener un pequeño grupo de clientes pagos del mismo perfil, demostrar valor, calcular el costo real de implementación y soporte, y cerrar los riesgos críticos.

---

## 9. Migración de desarrollo a Claude Code

### 9.1 Alcance incluido

- `GEMINI.md` cuando funcione como instrucción de desarrollo;
- prompts de arranque de Antigravity;
- prompts de generación, auditoría, documentación y pruebas;
- skills locales de desarrollo;
- reglas de comportamiento del agente;
- bootstrap generado para repositorios o clientes;
- asociaciones documentales que indiquen usar Antigravity/Gemini para programar.

### 9.2 Fuera de alcance

- Gemini API ejecutada por aplicaciones;
- endpoints o Cloud Functions que consuman Gemini;
- funciones de IA vendidas al cliente;
- migración de Firebase por adoptar Claude;
- cambios al modelo comercial por adoptar Claude;
- reescritura de Cores o Features que no dependan del asistente.

### 9.3 Estructura objetivo resumida

```text
PROTOTIPE/
├── CLAUDE.md
├── AGENTS.md
├── .claude/
│   ├── settings.json
│   ├── settings.local.json
│   ├── rules/
│   ├── skills/
│   └── agents/
└── Documentacion PROTOTIPE/00_Canonico/
```

Skills iniciales aprobadas conceptualmente:

- `prototipe-audit`;
- `prototipe-blueprint`;
- `prototipe-implement-feature`;
- `prototipe-security-review`;
- `prototipe-verify`;
- `prototipe-release`;
- `prototipe-doc-governance`.

Agentes iniciales:

- `architecture-auditor`;
- `security-reviewer`;
- `test-verifier`.

No se deben crear todos antes del piloto. Primero se implementa el mínimo necesario para una Golden Task real.

---

## 10. Controles antes de formatear

En cada repositorio:

```bash
git status --short --branch
git remote -v
git branch -vv
git tag --list
git log -1 --oneline
git submodule status
git status --short --untracked-files=all
git ls-files --others --ignored --exclude-standard
```

Se debe registrar:

- repositorio y ruta local;
- URL remota;
- rama y commit;
- cambios locales;
- ramas sin upstream;
- push verificado;
- archivos ignorados indispensables;
- comando de instalación;
- comando de build;
- comandos de pruebas;
- dependencias externas;
- ubicación segura de secretos, sin registrar su valor.

Antes de borrar el equipo debe existir una clonación totalmente nueva que pueda:

1. instalar dependencias;
2. compilar;
3. ejecutar las pruebas disponibles;
4. iniciar los servicios necesarios;
5. identificar claramente qué configuración externa falta;
6. demostrar que los archivos esenciales no dependen de la carpeta antigua.

---

## 11. Información que todavía debe aportar el fundador

No solicitar información que ya fue confirmada. Solo siguen pendientes:

1. número exacto de repositorios y sus URL;
2. existencia de cambios locales sin commit;
3. existencia de ramas locales no publicadas;
4. ubicación general de los secretos, sin revelar sus valores;
5. carpetas de clientes o evidencias fuera de Git;
6. repositorio elegido para la prueba piloto;
7. versión de Node y gestor de paquetes;
8. comandos reales de instalación, build, pruebas y ejecución;
9. estado de Firebase CLI, GitHub CLI y otras herramientas necesarias;
10. fecha en que se planea formatear el equipo.

---

## 12. Archivos fuente del paquete

### Documentos de continuidad producidos

| Archivo | Función | SHA-256 al corte |
|---|---|---|
| `00_REANUDAR_PROTOTIPE_CONTINUIDAD_2026-07-13.md` | Memoria portable y prompt de reanudación | Calcular después de cada actualización |
| `Auditoria_Integral_y_Roadmap_PROTOTIPE_2026-07-13.md` | Diagnóstico integral y roadmap empresarial | `caf330958ea83a15783068fc0e534314dfc8b207ecec9a369d700f0ddaf7e88e` |
| `Plan_Maestro_Estabilizacion_y_Migracion_Claude_Code_PROTOTIPE.md` | Ejecución de recuperación y migración | `e1d9289c5ad7c2969e475b48fe6f4e4e06047c236d70f8fb4cf64bbdeddaa624` |

### Fuentes documentales recibidas — no incluidas en el ZIP portable

1. `_MAPA_DE_CONSOLIDACION(7).md`
2. `01_Control_Versiones__CONSOLIDADO(8).md`
3. `02_Tareas_Roadmap__CONSOLIDADO(7).md`
4. `03_Auditorias_y_Faro_Core__CONSOLIDADO(6).md`
5. `04_Estandares_y_Skills__CONSOLIDADO(6).md`
6. `05_Estrategia_Comercial_Ecosistema__CONSOLIDADO(8).md`
7. `06_Biblioteca_Componentes__CONSOLIDADO(7).md`
8. `07_Manuales_Desarrollo__CONSOLIDADO(9).md`
9. `08_Plan_Escalabilidad_Negocio__CONSOLIDADO(7).md`
10. `09_Modulos_Completos__CONSOLIDADO(7).md`
11. `10_Historial_Inyecciones__CONSOLIDADO(8).md`
12. `Markdown pegado (3).md`

Varios consolidados contienen términos o cadenas que requieren revisión de seguridad. Por esa razón se conservan como fuentes recibidas, pero no se copiaron automáticamente al paquete portable. Antes de almacenarlos en un repositorio o compartirlos con otra cuenta se debe ejecutar un escaneo de secretos y sanear cualquier hallazgo real.

---

## 13. Estrategia de respaldo recomendada

No depender de una sola cuenta compartida. Mantener al menos:

- una copia local en el equipo;
- una copia cifrada fuera del equipo;
- una copia en almacenamiento personal controlado únicamente por el fundador;
- los documentos de continuidad dentro de un repositorio privado, sin secretos;
- tags y ramas de recuperación en GitHub.

La cuenta compartida no debe contener código privado, datos de clientes, credenciales ni decisiones empresariales sensibles que otras personas no deban ver. La continuidad debe depender de archivos versionados y verificables, no de la memoria informal de una conversación.

---

## 14. Protocolo para actualizar esta memoria

Al terminar cada sesión importante, agregar una entrada con:

```text
Fecha:
Decisión tomada:
Qué se modificó:
Repositorio y rama:
Commit o versión:
Pruebas ejecutadas:
Resultado verificable:
Riesgos abiertos:
Siguiente paso exacto:
```

No escribir “completado” sin indicar evidencia. No copiar secretos. Si una decisión cambia, conservar la anterior como `SUPERSEDED` y registrar el motivo.

### Registro inicial

**Fecha:** 13 de julio de 2026  
**Decisión:** conservar PROTOTIPE y migrar solo el desarrollo asistido a Claude Code.  
**Resultado:** auditoría integral y plan maestro creados.  
**Riesgo abierto:** recuperación de repositorios y archivos locales todavía no verificada.  
**Siguiente paso:** ejecutar Etapa -1 antes de formatear.  

---

## 15. Criterio rector

La continuidad de PROTOTIPE debe vivir en **Git, documentos canónicos, evidencia y respaldos controlados**, no en un chat, una computadora, un prompt, un asistente ni la memoria de una sola persona.
