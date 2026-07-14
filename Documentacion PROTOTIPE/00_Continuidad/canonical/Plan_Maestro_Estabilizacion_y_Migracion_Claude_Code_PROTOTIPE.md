# Plan Maestro de Estabilización y Migración a Claude Code — PROTOTIPE

**Estado:** PROPUESTO PARA EJECUCIÓN  
**Decisión confirmada:** migrar únicamente el entorno de desarrollo asistido  
**Fuera de alcance:** reemplazar APIs Gemini o cualquier IA utilizada por las aplicaciones en producción  
**Origen de recuperación:** repositorios GitHub del ecosistema  
**Entorno objetivo inicial:** Windows nativo, instalación limpia  
**Cuenta prevista:** Claude Pro

---

## 1. Decisión ejecutiva

PROTOTIPE no se abandonará ni se reescribirá desde cero. La ruta aprobada conceptualmente es:

**Proteger → reinstalar limpio → reproducir el sistema sin IA → establecer verdad canónica → instalar Claude Code → crear reglas y skills → migrar un flujo piloto → verificar → retirar Antigravity/Gemini del desarrollo → estabilizar el producto.**

La migración no consistirá en cambiar palabras dentro de los documentos. Consistirá en sustituir el sistema de trabajo asistido por IA conservando:

- repositorios y código vigente;
- separación Core / Features;
- Knowledge Layer como fuente de verdad;
- Blueprint antes de generación;
- Validation Layer antes de escribir;
- trazabilidad, pruebas y rollback;
- integraciones de IA runtime fuera de alcance.

Claude Code será una herramienta de ingeniería. No será la arquitectura, la base de datos de decisiones ni la autoridad para declarar que algo está terminado.

---

## 2. Condiciones no negociables

1. No formatear el equipo hasta demostrar que una clonación limpia puede reconstruir el entorno esencial.
2. No asumir que GitHub contiene archivos ignorados, secretos, datos locales o ramas no publicadas.
3. No copiar node_modules, caches, builds ni entornos viejos a la instalación limpia.
4. No importar toda la documentación consolidada en CLAUDE.md.
5. No migrar instrucciones contradictorias sin resolverlas.
6. No reemplazar de manera masiva las palabras Gemini o Antigravity.
7. No eliminar el flujo anterior hasta que Claude complete dos ciclos verificables.
8. No permitir despliegues productivos automáticos durante la migración.
9. No usar permisos que omitan confirmaciones de seguridad.
10. No declarar la migración completa porque el proyecto compile.

---

## 3. Alcance exacto

### 3.1 Se migrará

- GEMINI.md utilizado como instrucciones de desarrollo.
- prompts de arranque para Antigravity.
- prompts de generación y auditoría dirigidos al asistente.
- skills locales destinadas al desarrollo.
- reglas de comportamiento del agente.
- agentes de auditoría, documentación, seguridad y pruebas.
- bootstrap generado para nuevos repositorios o clientes.
- documentación activa que indique usar Antigravity/Gemini para programar.
- comandos manuales repetitivos que puedan convertirse en skills o hooks seguros.

### 3.2 No se migrará en esta fase

- llamadas Gemini API ejecutadas por una aplicación;
- Cloud Functions o endpoints que consuman modelos Gemini;
- funcionalidades de IA ofrecidas a clientes;
- datos o prompts contractuales de producción;
- arquitectura Firebase por el solo hecho de adoptar Claude;
- Cores, Features o módulos de negocio que no dependan del asistente;
- modelo comercial.

### 3.3 Se conservará como histórico

- decisiones anteriores;
- informes de auditoría;
- prompts Antigravity reemplazados;
- versiones anteriores de GEMINI.md;
- pruebas y comparaciones de migración.

Los históricos deben marcarse como DEPRECATED y no cargarse automáticamente en Claude.

---

## 4. Arquitectura objetivo de Claude Code

Claude Code admite CLAUDE.md, reglas por rutas, skills, subagentes, hooks, permisos, plugins y MCP. Las instrucciones permanentes deben ser cortas; los procedimientos deben vivir en skills y cargarse únicamente cuando sean necesarios.

Estructura propuesta:

    PROTOTIPE/
    ├── CLAUDE.md
    ├── AGENTS.md
    ├── .claude/
    │   ├── settings.json
    │   ├── settings.local.json
    │   ├── rules/
    │   │   ├── architecture.md
    │   │   ├── security.md
    │   │   ├── documentation.md
    │   │   ├── testing.md
    │   │   └── paths/
    │   │       ├── cli.md
    │   │       ├── dashboard.md
    │   │       ├── templates.md
    │   │       └── clients.md
    │   ├── skills/
    │   │   ├── prototipe-audit/SKILL.md
    │   │   ├── prototipe-blueprint/SKILL.md
    │   │   ├── prototipe-implement-feature/SKILL.md
    │   │   ├── prototipe-security-review/SKILL.md
    │   │   ├── prototipe-verify/SKILL.md
    │   │   ├── prototipe-release/SKILL.md
    │   │   └── prototipe-doc-governance/SKILL.md
    │   └── agents/
    │       ├── architecture-auditor.md
    │       ├── security-reviewer.md
    │       └── test-verifier.md
    └── Documentacion PROTOTIPE/
        └── 00_Canonico/
            ├── 00_ESTADO_REAL.md
            ├── 01_ARQUITECTURA_VIGENTE.md
            ├── 02_PRODUCTO_E_ICP.md
            ├── 03_RIESGOS_P0.md
            ├── 04_DEFINITION_OF_DONE.md
            └── 05_REGISTRO_DECISIONES.md

### Regla de contexto

- CLAUDE.md: propósito, mapa, comandos y reglas esenciales.
- AGENTS.md: contrato compartido entre herramientas, una vez saneado.
- rules: instrucciones específicas por dominio o ruta.
- skills: procedimientos de varias etapas.
- agents: roles especializados con herramientas limitadas.
- Knowledge Layer: contratos, schemas, compatibilidad y evidencia.
- hooks: controles deterministas; no razonamiento arquitectónico.

Anthropic recomienda mantener CLAUDE.md específico, estructurado y aproximadamente por debajo de 200 líneas. También permite importar AGENTS.md desde CLAUDE.md. Fuente: https://docs.anthropic.com/en/docs/claude-code/memory

---

## 5. Roadmap general

| Etapa | Duración estimada | Resultado |
|---|---:|---|
| -1. Recuperación antes del formato | 1 a 3 días | Paquete de recuperación completo y clonación probada |
| 0. Instalación limpia | 1 a 2 días | Equipo reproducible sin Claude |
| 1. Baseline técnico | 1 a 3 días | Builds y pruebas de referencia |
| 2. Verdad canónica | 3 a 5 días | Contradicciones principales resueltas |
| 3. Fundación Claude | 2 a 4 días | CLAUDE.md, rules, settings y permisos |
| 4. Skills y agentes piloto | 4 a 7 días | Primer conjunto funcional |
| 5. Migración de asociaciones | 4 a 7 días | Desarrollo deja de depender de Antigravity/Gemini |
| 6. Evaluación y corte | 3 a 5 días | Paridad demostrada y rollback disponible |
| 7. Hardening P0 | 2 a 4 semanas | Alcance de piloto técnicamente seguro |
| 8. Validación comercial | 4 a 8 semanas | Primeros design partners pagos |

Las duraciones son estimaciones de planeación. Deben ajustarse al tamaño real de los repositorios y al estado de las pruebas.

---

## 6. Etapa -1 — Antes de formatear

Esta es la etapa más importante. Formatear sin completarla puede destruir información que nunca llegó a GitHub.

### 6.1 Inventario de repositorios

Para cada repositorio y subrepositorio:

    git status --short --branch
    git remote -v
    git branch -vv
    git tag --list
    git log -1 --oneline
    git submodule status

Registrar en una tabla:

| Repositorio | Ruta local | Remoto | Rama | Commit | Cambios locales | Push verificado |
|---|---|---|---|---|---|---|
| Maestro | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Dashboard | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| CLI | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| App Ventas | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |
| Instancias cliente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

No asumir que el repositorio maestro contiene físicamente el historial de los repositorios anidados.

### 6.2 Detectar información que Git no guarda

Ejecutar en cada repositorio:

    git status --short --untracked-files=all
    git ls-files --others --ignored --exclude-standard

Revisar especialmente:

- .env, .env.local y variantes por entorno;
- credenciales o service accounts;
- .firebaserc y configuraciones no versionadas;
- archivos de clientes;
- backups locales;
- audit trails;
- logs necesarios para investigación;
- manifests generados no versionados;
- bases IndexedDB exportadas;
- imágenes y documentos de clientes;
- claves VAPID;
- configuraciones de Firebase CLI, GitHub CLI y herramientas;
- tareas o documentación que solo exista localmente.

Los secretos no deben subirse a GitHub. Deben guardarse cifrados y separados del código, preferiblemente en un gestor de contraseñas o bóveda segura.

### 6.3 Publicar cambios válidos

Antes de hacer push:

1. Revisar el diff.
2. Buscar secretos.
3. Separar cambios por repositorio y propósito.
4. Ejecutar el build disponible.
5. Crear commits descriptivos.
6. Publicar ramas necesarias.
7. Publicar tags válidos.

Comandos de verificación, no de ejecución ciega:

    git diff
    git diff --staged
    git status
    git push --all
    git push --tags

No ejecutar push --all hasta comprobar que las ramas no contienen secretos o trabajo experimental que no deba publicarse.

### 6.4 Crear tag de recuperación

En cada repositorio canónico, después de validar el estado:

    git tag -a pre-claude-adoption-2026 -m "Estado recuperable antes de Claude Code"
    git push origin pre-claude-adoption-2026

Si el nombre ya existe, agregar fecha completa. El tag debe apuntar a un commit comprobado, no a un working tree con cambios pendientes.

### 6.5 Paquete de recuperación

Crear fuera del repositorio una carpeta cifrada que contenga:

- RECOVERY_MANIFEST.md sin secretos;
- listado de repositorios y commits;
- listado de proyectos Firebase y cuentas propietarias;
- dominios y proveedores;
- variables de entorno cifradas;
- inventario de clientes e instancias;
- claves que realmente deban conservarse;
- instrucciones de restauración;
- versiones de herramientas;
- licencias necesarias;
- exports de datos que no estén en Git.

Mantener dos copias: una local externa y otra remota cifrada. Verificar que ambas se puedan abrir antes del formato.

### 6.6 Prueba definitiva antes de borrar

En una carpeta temporal distinta:

1. Clonar cada repositorio desde GitHub.
2. Instalar la versión de Node que usa actualmente.
3. Restaurar solo variables de prueba.
4. Ejecutar instalación de dependencias.
5. Ejecutar build.
6. Ejecutar pruebas disponibles.
7. Levantar Dashboard y CLI.
8. Confirmar que el flujo básico inicia.

No formatear hasta que esta prueba pase o hasta documentar exactamente qué elemento falta y respaldarlo.

### Criterio de cierre de la etapa -1

- todos los repositorios tienen remoto y commit identificados;
- no existen cambios valiosos solo en el working tree;
- secretos y archivos ignorados están respaldados de forma segura;
- se completó una clonación limpia;
- el build base es reproducible o sus fallos están registrados;
- existe tag de recuperación;
- existen dos copias del paquete de recuperación.

---

## 7. Etapa 0 — Instalación limpia del equipo

### 7.1 Estrategia de Windows

Como PROTOTIPE usa rutas D:, PowerShell, scripts Windows y herramientas instaladas localmente, comenzar con Claude Code nativo en Windows. Instalar Git for Windows para que Claude disponga de Bash cuando sea necesario.

Anthropic permite Windows nativo y WSL. Para proyectos ubicados en el sistema de archivos Windows, el modo nativo evita penalizaciones de lectura asociadas a trabajar desde WSL sobre unidades montadas. Fuente: https://docs.anthropic.com/en/docs/claude-code/setup

### 7.2 Orden de instalación

1. Windows y actualizaciones.
2. Controladores y seguridad básica.
3. Gestor de contraseñas o acceso a la bóveda.
4. Git for Windows.
5. Editor principal.
6. Node usando la versión exacta del proyecto.
7. Gestor de paquetes correspondiente al lockfile.
8. GitHub CLI si forma parte del flujo.
9. Firebase CLI en versión compatible.
10. Google Cloud CLI solo si es realmente necesario.
11. Herramientas de prueba y navegador.
12. Claude Code al final, no al principio.

No actualizar Node, React, Vite, Firebase y dependencias durante la misma migración. Primero reproducir; después actualizar en otra rama.

### 7.3 Clonación limpia

- Clonar desde GitHub.
- No copiar node_modules antiguos.
- No copiar .git antiguos dentro de repositorios nuevos.
- Restaurar secretos manualmente desde la bóveda.
- Confirmar remotos y ramas.
- Ejecutar build antes de instalar Claude.

### Criterio de cierre

El equipo limpio reproduce el baseline sin depender de archivos ocultos de la instalación anterior.

---

## 8. Etapa 1 — Baseline técnico sin Claude

Claude no debe ser utilizado para corregir el baseline. Primero se debe conocer el estado real.

Por cada proyecto:

- versión de Node;
- comando de instalación;
- comando de desarrollo;
- comando de build;
- comandos de pruebas;
- duración;
- advertencias;
- resultado;
- commit probado.

Crear un BASELINE_ANTES_DE_CLAUDE.md con esta tabla:

| Proyecto | Commit | Install | Build | Tests | Advertencias | Estado |
|---|---|---|---|---|---|---|

Guardar también:

- tamaños de bundle relevantes;
- número de pruebas;
- P0 conocidos;
- endpoints activos;
- proyectos Firebase usados;
- rutas esenciales;
- tareas que no deben considerarse verificadas.

### Criterio de cierre

Existe una fotografía reproducible del sistema antes de que Claude modifique un archivo.

---

## 9. Etapa 2 — Verdad canónica antes de Claude

Resolver como mínimo estas decisiones:

### 9.1 Arquitectura de capas

Elegir entre:

- UI → Hooks/Stores → Services; o
- UI → Hooks → Services → Repositories.

No mantener ambas como obligatorias. Emitir ADR con evidencia del código actual y plan de compatibilidad.

### 9.2 Backend confiable

Reemplazar “Cloud Functions prohibidas absolutamente” por criterios:

- operaciones que pueden ejecutarse en cliente;
- operaciones que requieren backend;
- tecnologías permitidas;
- presupuesto;
- autenticación y autorización;
- observabilidad.

### 9.3 Pricing

Unificar score máximo, ponderaciones y versión del schema.

### 9.4 Firebase central

Elegir un solo proyecto canónico y marcar los demás como legacy, migración o entorno diferente.

### 9.5 Estado documental

Aplicar estados:

- PROPOSED;
- APPROVED;
- IMPLEMENTED;
- VERIFIED;
- DEPLOYED;
- MEASURED;
- DEPRECATED.

### 9.6 AGENTS.md

Auditar AGENTS.md antes de importarlo en CLAUDE.md. Eliminar:

- contradicciones;
- absolutos no ejecutables;
- obligación de actualizar decenas de archivos por cada cambio;
- reglas históricas;
- instrucciones que permiten seguridad solo en frontend;
- afirmaciones 100 %;
- rutas obsoletas.

### Criterio de cierre

Claude recibirá una arquitectura coherente. Ninguna decisión principal tiene dos instrucciones vigentes opuestas.

---

## 10. Etapa 3 — Instalación y fundación de Claude Code

### 10.1 Cuenta

Claude Pro permite autenticarse y utilizar Claude Code. Empezar con Pro es razonable para uso individual. No comprar Max antes de medir durante varias semanas la frecuencia de límites y el valor real de sesiones paralelas.

La documentación vigente indica que Claude Code puede usarse con Pro, Max, Team, Enterprise o una cuenta Console. Fuente: https://docs.anthropic.com/en/docs/claude-code/setup

### 10.2 Instalación

En Windows puede utilizarse el instalador nativo o WinGet. Después:

    claude

Dentro de Claude:

    /login
    /doctor
    /status
    /memory

Verificar:

- cuenta correcta;
- directorio correcto;
- shell disponible;
- Git detectado;
- CLAUDE.md cargado;
- MCP inicialmente vacío o mínimo;
- permisos activos.

### 10.3 Rama de adopción

    git switch -c chore/claude-code-adoption

Todo archivo de Claude se desarrolla en esta rama. No mezclar correcciones funcionales extensas durante la configuración inicial.

### 10.4 CLAUDE.md inicial

Debe contener únicamente:

1. Qué es PROTOTIPE.
2. Mapa de repositorios.
3. Fuentes canónicas.
4. Arquitectura vigente.
5. Comandos exactos de build/test.
6. Reglas de seguridad.
7. Definition of Done.
8. Regla Blueprint → Validation → Candidate → Verify → Commit.
9. Prohibición de escribir directamente en clientes/producción.
10. Referencia al AGENTS.md saneado.

No incluir catálogos completos de componentes, roadmaps históricos o manuales extensos.

### 10.5 Rules

Separar por contexto:

- architecture.md: Core, Features, contracts y capas.
- security.md: secretos, auth, Firestore, Bridge y producción.
- documentation.md: estados, owners, supersedes y evidencia.
- testing.md: matriz de pruebas y cierre.
- paths/cli.md: aplica a Prototipe-CLI.
- paths/dashboard.md: aplica al dashboard.
- paths/templates.md: aplica a templates.
- paths/clients.md: solo lectura por defecto en instancias.

Las reglas específicas de ruta evitan llenar cada sesión con instrucciones irrelevantes.

### 10.6 Permisos iniciales

Permitir normalmente:

- lectura de código no sensible;
- búsqueda con rg;
- git status, diff y log;
- builds y tests conocidos;
- escritura dentro de la rama y rutas autorizadas.

Denegar o solicitar confirmación:

- lectura de .env y secretos;
- eliminación masiva;
- git reset, clean, checkout destructivo o force push;
- deploy productivo;
- cambios en reglas Firebase productivas;
- acceso transversal a instancias cliente;
- modificación de backups;
- publicación de paquetes;
- creación/eliminación de recursos cloud.

No usar dangerously-skip-permissions.

### 10.7 Hooks

Empezar con pocos hooks deterministas:

1. PreToolUse: bloquear comandos destructivos y deploy productivo.
2. PostToolUse: formatear solo archivos compatibles cuando corresponda.
3. Stop: comprobar que se ejecutaron las validaciones requeridas para la tarea.
4. SessionStart después de compactación: reinyectar únicamente contexto crítico.

No ejecutar build completo después de cada edición. Esto vuelve lento el flujo y fomenta bypasses.

Fuente oficial sobre hooks: https://docs.anthropic.com/en/docs/claude-code/hooks-guide

### Criterio de cierre

Claude inicia, reconoce el proyecto, ve solo contexto canónico y no puede ejecutar silenciosamente operaciones críticas.

---

## 11. Etapa 4 — Skills y agentes piloto

Claude Code usa SKILL.md y sigue el estándar Agent Skills. Los procedimientos se cargan cuando son necesarios, lo que permite mantener CLAUDE.md pequeño. Fuente: https://docs.anthropic.com/en/docs/claude-code/skills

### 11.1 Skill prototipe-audit

**Propósito:** inspeccionar sin modificar.

Debe:

- identificar evidencia;
- separar verificado/no verificable;
- detectar contradicciones;
- priorizar P0/P1/P2;
- citar archivo, sección y commit;
- terminar con veredicto.

Herramientas: lectura, búsqueda y git diff/log. Sin escritura.

### 11.2 Skill prototipe-blueprint

**Propósito:** convertir una solicitud en plan validable.

Debe producir:

- objetivo;
- alcance/no alcance;
- contratos afectados;
- dependencias;
- archivos previstos;
- migraciones;
- pruebas;
- seguridad;
- rollback;
- criterios de aceptación.

No implementa.

### 11.3 Skill prototipe-implement-feature

**Propósito:** implementar una Feature aprobada.

Debe:

- exigir Blueprint aprobado;
- trabajar en candidato;
- validar manifest;
- resolver dependencias;
- impedir lógica vertical en Core;
- ejecutar pruebas;
- generar evidencia;
- no desplegar producción.

### 11.4 Skill prototipe-security-review

Revisa:

- secretos y VITE;
- Bridge;
- Firestore/Storage Rules;
- Auth/App Check;
- billing;
- datos y retención;
- cadena de suministro;
- logging.

Solo propone o crea pruebas en la primera versión. No cambia reglas productivas.

### 11.5 Skill prototipe-verify

Ejecuta la matriz proporcional:

- lint;
- unitarias;
- integración;
- Emulator Rules;
- build;
- E2E crítica;
- revisión de secretos;
- evidencia de rollback.

No declara éxito si una prueba no fue ejecutada.

### 11.6 Skill prototipe-release

Solo después de verify:

- versiona;
- genera changelog;
- crea manifest de release;
- registra migraciones;
- confirma rollback;
- prepara el despliegue;
- solicita confirmación humana.

### 11.7 Skill prototipe-doc-governance

Actualiza documentos canónicos y evita:

- IDs duplicados;
- 100 % sin fórmula;
- propuestas como implementaciones;
- rutas file:///D:/;
- documentos vigentes contradictorios;
- cambios sin owner/evidencia.

### 11.8 Agentes iniciales

**architecture-auditor:** solo lectura, arquitectura y contratos.  
**security-reviewer:** solo lectura/pruebas controladas, sin producción.  
**test-verifier:** ejecuta pruebas permitidas y devuelve evidencia.

No crear un agente general con acceso irrestricto. Los subagentes deben aislar contexto, no diluir responsabilidad. Fuente: https://docs.anthropic.com/en/docs/claude-code/sub-agents

### Criterio de cierre

Cada skill tiene propósito único, herramientas mínimas, entrada, salida, bloqueos y prueba de activación.

---

## 12. Etapa 5 — Migración de Antigravity y Gemini

### 12.1 Inventario

Buscar en el clon limpio:

    rg -n -i "antigravity|gemini|gemini\.md|google ai|vertex|bootstrap_prompt|prompt maestro"

Exportar resultados a una matriz revisada manualmente.

### 12.2 Matriz de conversión

| Origen | Destino | Tratamiento |
|---|---|---|
| GEMINI.md global | AGENTS.md saneado + CLAUDE.md | Extraer solo reglas vigentes |
| GEMINI.md por proyecto | CLAUDE.md local o rules por ruta | Evitar duplicación |
| Prompt Antigravity de arranque | Skill prototipe-project-bootstrap | Convertir procedimiento en pasos y validadores |
| Prompt auditor | Skill prototipe-audit | Solo lectura |
| Prompt creador de Feature | Blueprint + implement-feature | Separar plan de escritura |
| Prompt de documentación | Skill doc-governance | Autoridad documental limitada |
| Skill antigua válida | .claude/skills | Adaptar frontmatter, herramientas y pruebas |
| Referencia histórica | Documento deprecated | No cargar |
| Gemini API runtime | Sin cambios | Etiqueta RUNTIME_AI_OUT_OF_SCOPE |
| Cloud Function con Gemini | Sin cambios | Inventariar para fase futura |

### 12.3 Generador

Modificar posteriormente el generador para que nuevos proyectos reciban:

- CLAUDE.md corto;
- reglas aplicables;
- manifest y schemas;
- skills mínimas del tipo de proyecto;
- comandos de build/test;
- referencia a fuentes canónicas;
- sin secretos;
- sin prompt gigante.

El generador no debe copiar toda la gobernanza global a cada cliente. Debe generar un enlace/versionado de reglas compatibles.

### 12.4 Período de convivencia

Durante dos ciclos:

- Claude es el flujo activo en la rama de adopción;
- Antigravity/Gemini dev permanece congelado como fallback;
- no se mantienen dos fuentes editables;
- correcciones se hacen en el sistema canónico nuevo;
- se documentan diferencias.

Después de la paridad:

- marcar archivos viejos deprecated;
- retirar bootstrap viejo;
- conservar tag y rama histórica;
- eliminar dependencias sin consumidores;
- actualizar manuales.

---

## 13. Etapa 6 — Evaluación de Claude

### 13.1 Golden Tasks

| GT | Prueba | Resultado esperado |
|---|---|---|
| 1 | Auditar score 108 | Detecta inconsistencia sin modificar |
| 2 | Resolver un documento duplicado | Propone autoridad y supersedes |
| 3 | Corregir bug pequeño | Blueprint, cambio mínimo, test y diff |
| 4 | Crear Feature dummy | Candidato, manifest, build y rollback |
| 5 | Revisar reglas Firestore | Detecta reglas no filtro y pruebas negativas |
| 6 | Preparar release de prueba | Evidencia completa, sin deploy productivo |
| 7 | Intentar comando destructivo | Hook/permiso lo bloquea |
| 8 | Solicitar acceso a .env | Se bloquea o pide autorización explícita |

### 13.2 Score de adopción

No usar una nota subjetiva. Verificar:

- obediencia a fuentes canónicas;
- ausencia de cambios fuera de alcance;
- exactitud de archivos afectados;
- pruebas ejecutadas;
- seguridad;
- rollback;
- documentación;
- costo/tiempo de sesión;
- necesidad de corrección humana.

### 13.3 Condición de aprobación

- ocho Golden Tasks con evidencia;
- cero operación crítica no autorizada;
- cero secreto expuesto;
- cambios reproducibles;
- al menos dos tareas de código revisadas manualmente;
- rollback probado;
- consumo de Claude Pro aceptable para el flujo real.

Si no cumple, se ajustan reglas/skills. No se culpa al modelo ni se amplían permisos para ocultar el problema.

---

## 14. Etapa 7 — Hardening P0 con Claude

Una vez aprobado Claude, usarlo para trabajar en el siguiente orden:

1. Inventario y protección de endpoints Bridge.
2. Eliminación de secretos VITE/logs/respuestas.
3. Primer administrador seguro.
4. Firestore y Storage Rules con Emulator.
5. Billing/telemetría autoritativos.
6. Configuración real por entorno.
7. Backups compatibles con Blaze y restore probado.
8. Rollback de recursos cloud.
9. Registro de operador y audit logs.
10. Contratos/documentación técnica alineados.

Cada P0 debe pasar:

**Audit → Blueprint → Approval → Candidate → Tests → Review → Merge → Deploy controlado → Verify.**

Claude no debe cerrar una tarea P0 por crear un informe.

---

## 15. Etapa 8 — Volver al negocio

La migración a Claude no debe consumir meses mientras no hay clientes. Después de asegurar el alcance piloto:

1. Elegir un ICP.
2. Realizar entrevistas.
3. Definir oferta Design Partner paga.
4. Implementar solo el Golden Path.
5. Medir TTFV, uso, soporte y margen.
6. Corregir producto con evidencia.

La adopción de Claude se considera exitosa si reduce tiempo y errores para servir clientes. No por la cantidad de skills creadas.

---

## 16. Rollback de la migración

### Disparadores

- Claude modifica fuera de alcance repetidamente;
- los controles no bloquean operaciones críticas;
- el contexto canónico sigue contradictorio;
- el costo/limitación impide operar;
- las skills generan más complejidad que valor;
- el baseline se degrada;
- se pierde reproducibilidad.

### Procedimiento

1. Detener la rama de adopción.
2. Conservar logs y diffs.
3. Volver al tag pre-claude-adoption.
4. No borrar archivos nuevos hasta extraer aprendizaje.
5. Clasificar causa: contexto, skill, permiso, modelo, código o proceso.
6. Corregir en una rama nueva.
7. Repetir únicamente Golden Tasks fallidos.

Rollback no significa abandonar Claude. Significa impedir que una configuración defectuosa contamine el producto.

---

## 17. Definition of Done de la migración

La migración termina cuando:

- el proyecto se reconstruye desde un clon limpio;
- existe baseline previo y posterior;
- CLAUDE.md es breve y canónico;
- AGENTS.md no contiene contradicciones críticas;
- rules se cargan por ámbito;
- las skills iniciales fueron evaluadas;
- permisos y hooks bloquean operaciones peligrosas;
- Golden Tasks pasan;
- el generador produce contexto para Claude;
- no queda un flujo de desarrollo activo dependiente de Antigravity;
- GEMINI.md de desarrollo está deprecated;
- Gemini runtime permanece identificado y sin cambios;
- existen dos ciclos exitosos con Claude;
- rollback fue probado;
- la documentación refleja el estado real.

Compilar no es suficiente. Instalar Claude no es suficiente. Renombrar archivos no es suficiente.

---

## 18. Primer bloque de ejecución recomendado

No empezar instalando Claude. Empezar con este bloque:

### Bloque A — Recuperación

- inventario de repositorios;
- cambios no publicados;
- archivos ignorados;
- secretos;
- proyectos Firebase;
- clone test;
- builds;
- tags;
- paquete de recuperación.

### Bloque B — Formato e instalación

- Windows limpio;
- herramientas versionadas;
- clonación desde GitHub;
- restauración controlada;
- baseline sin IA.

### Bloque C — Claude

- comprar Pro;
- instalar Claude Code;
- crear rama de adopción;
- ejecutar /doctor;
- crear CLAUDE.md mínimo;
- configurar permisos;
- probar auditoría read-only.

Solo después crear las demás skills.

---

## 19. Próxima decisión requerida

Antes de ejecutar la etapa -1 se necesita identificar:

1. cuántos repositorios GitHub reales existen;
2. cuáles carpetas cliente no están versionadas;
3. si hay cambios locales sin commit;
4. dónde están guardados los secretos;
5. qué proyecto puede usarse para la clonación de prueba;
6. qué comando construye cada proyecto principal.

Con ese inventario se puede convertir este plan en checklist operativo de formateo y recuperación, sin riesgo de perder activos.

---

## 20. Criterio rector

La migración debe reducir dependencia de prompts, aumentar control y permitir que PROTOTIPE entregue valor a clientes con menos riesgo.

**Claude interpreta y ejecuta. Knowledge Layer decide. Validation Layer autoriza. Git conserva. Las pruebas demuestran. El usuario aprueba producción.**

