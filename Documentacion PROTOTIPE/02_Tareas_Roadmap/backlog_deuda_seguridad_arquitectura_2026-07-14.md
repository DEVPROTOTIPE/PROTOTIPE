# Backlog propuesto — deuda de seguridad, arquitectura y operación

**Estado: `PROPUESTO`, no activado.** Ninguno de los tickets de este documento
es una tarea `IN_PROGRESS`; son candidatos a registrar formalmente en
`tareas_pendientes.md` (esquema `CORE-3xx`) cuando el fundador decida
priorizarlos. No confundir con el roadmap activo.

**Procedencia:** curado desde
`D:\RESPALDO_PROTOTIPE\Continuidad\2026-07-14\02_DOCUMENTOS_CENTRALES\11_BACKLOG_PRIORIZADO_CON_CRITERIOS_DE_CIERRE.md`
(auditoría externa, 2026-07-14). Traído a `Documentacion PROTOTIPE` el
2026-07-15 (tarea `CORE-346`) porque ninguno de estos tickets (prefijos
SEC/ARC/OPS/REP/LEG/BIZ) existe en `tareas_pendientes.md` — verificado por
búsqueda antes de crear este archivo. Se omiten deliberadamente los tickets
`Gate 0` (`ENV-010/011/012`, `CLAUDE-002/003`) del documento origen porque ya
están cubiertos, con más detalle y evidencia, por las tareas equivalentes ya
cerradas en `tareas_pendientes.md`.

**Advertencia de vigencia:** el estado de cada ticket es el de la auditoría
origen (2026-07-14); ninguno fue tocado por `CORE-341` a `CORE-345`. Ver
`registro_riesgos_deuda_tecnica_2026-07-14.md` para el registro de riesgos
asociado y el detalle de qué se reverificó de forma independiente.

## Reglas de ejecución (heredadas del documento origen, siguen aplicando)

- Una rama por lote coherente; no `git add .`; no mezclar saneamiento,
  refactor y feature en un mismo cambio.
- Pruebas que fallen antes de la corrección y pasen después.
- Sin commit/push/deploy automático sin autorización expresa (coherente con
  `.agents/AI_WORKFLOW.md`).
- Sin secretos en logs, patches o documentos.
- Estados: `PENDING → READY → IN_PROGRESS → AWAITING_REVIEW → VERIFIED_COMPLETE`.

## Epic SEC — Contención e identidad

| Ticket | Prioridad | Acciones | Cierre |
|---|---|---|---|
| SEC-010 | P0 | Rotar/retirar token Telegram (`notification_config.json`); reemplazar config real por template; escanear HEAD/historial | Token viejo falla, nuevo no está en Git, scanner CI bloquea fixture completa |
| SEC-011 | P0 | Sanear `auth_users.json`: invalidar/recrear usuario afectado, retirar del tracking, fixture sintético | Ningún email/hash/salt real rastreado |
| SEC-012 | P0 | Suite de ataques Firestore con Emulator (admin, usuarios, pedidos, productos, stock, tokens, notificaciones, empleados, entregas, analytics) | Cada vulnerabilidad actual tiene prueba roja reproducible; no toca proyectos reales |
| SEC-013 | P0 (dep. SEC-012) | Retirar `isFirstStart()` público; crear admin con Admin SDK/CLI privilegiado; bootstrap server-side | Anónimo/autenticado normal nunca crea roles/admin/config inicial |
| SEC-014 | P0 | Identidad real de clientes: OTP/email link/passkey, UID canónico, anti-enumeración | Conocer teléfono/nombre no inicia sesión; cliente A no accede a B |
| SEC-015 | P0 | Identidad de empleados server-side, KDF lento, rate limit, retirar autorización por `localStorage` | Editar almacenamiento local no concede acceso |
| SEC-016 | P0 (dep. SEC-013/014/015) | Reescribir reglas Core/Moni: deny-by-default, helpers tenant/role, transiciones, App Check | Suite positiva/negativa verde; reglas primero a proyecto canario |
| SEC-017 | P0 | Claim/allowlist de operador del Dashboard Central, MFA para acciones críticas | Usuario Firebase sin claim no lee/escribe control central |
| SEC-018 | P0 | Sustituir token Google del browser: eliminar scope amplio/interceptor/localStorage | No aparece `developer_google_token`; ningún access token global |
| SEC-019 | P0 | Proteger Bridge por capacidades: inventario de rutas, middleware obligatorio, CSRF/rate limit | 100% de rutas mutables con capacidad declarada y pruebas negativas |
| SEC-020 | P0/P1 | Telemetría v2: token aleatorio/hasheado, schema, idempotencia, redacción | Token inactivo/expirado/replayed se rechaza |

## Epic REP — Reproducibilidad y CI

| Ticket | Prioridad | Acciones | Cierre |
|---|---|---|---|
| REP-010 | P0/P1 | Reparar lock de Moni bajo runtime fijado | `npm ci` pasa dos veces desde cero |
| REP-011 | P1 | Build autónomo del Dashboard (extraer/opcionalizar dependencia documental) | Repo independiente instala y construye |
| REP-012 | P0/P1 | Corregir falsos verdes del CLI: paths relativos, fixtures propios, exit codes | Faltar template/fixture falla el test |
| REP-013 | P1 | Registrar formato AJV `blueprint-semver` | Knowledge validator rechaza versiones inválidas |
| REP-014 | P1 | CI Core y Moni: triggers, runtime fijo, lint/validate/unit/rules/E2E/build | Pipelines reales verdes; prueba rota los deja rojos |
| REP-015 | P1 | CI Dashboard/Functions/CLI independiente | Cada unidad certifica su clon sin depender de rutas `D:` |
| REP-016 | P1 | Baseline de lint: bloquear regresión en archivos tocados | Cero errores en SEC/auth/billing/bridge |
| REP-017 | P1 | Cobertura por riesgo (thresholds por dominio) | Auth/billing/manifests/reglas cumplen objetivos definidos |

## Epic ARC — Fuente de verdad y upgrades

| Ticket | Prioridad | Acciones | Cierre |
|---|---|---|---|
| ARC-010 | P0/P1 | ADR de topología Git (monorepo/polyrepo, sin doble tracking) — **nota 2026-07-15: verificado que hoy no hay doble tracking de repos anidados (ver chequeos operativos en bitácora `CORE-346`); confirmar si el ADR formal sigue pendiente** | Cada archivo pertenece a una sola historia |
| ARC-011 | P1 | Una plantilla Ventas canónica (fuente única + mirror generado) — relacionado con la determinación de fuente de verdad ya hecha en `ADR-0001` §6 para el código de features, pendiente extender a la plantilla completa | Editar fuente y generar mirror produce cero drift |
| ARC-012 | P1 | Schema de feature completo (capacidades, dependencias, hash, reglas, lifecycle) | Las 8 features cumplen schema |
| ARC-013 | P0/P1 | Reconciliador de verdad (Knowledge/registry/físico/manifest/lock) | Estado actual falla con reporte; estado corregido pasa |
| ARC-014 | P1 | Plan de generación puro y determinista antes de escribir | Mismas entradas producen mismo plan/hash |
| ARC-015 | P1 | Apply transaccional (staging, backup, atomic promotion) | Fallo inyectado deja instancia original intacta |
| ARC-016 | P1 | Manifest de instancia/overrides | Cada diferencia Moni está clasificada |
| ARC-017 | P0/P1 (dep. ARC-011-016, SEC) | Upgrade Core→Moni con dry-run/diff/rollback | N→N+1 y rollback demostrados dos veces sin pérdida |
| ARC-018 | P1/P2 | Extraer adapters Firebase (auth, pedidos, empleados, billing) — **coherente con la doctrina permanente de `CORE-345` (ADR-0001): Repository como única frontera de Firebase**; empezar por las features aún no migradas (`inventory` completo, resto de componentes) | UI crítica no importa Firebase |
| ARC-019 | P2 | Modularizar God files (`App.jsx`, `server.js`) por dominio con caracterización | `App.jsx`/`server.js` son shells/orquestadores |

## Epic OPS — Operación y dinero

| Ticket | Prioridad | Acciones | Cierre |
|---|---|---|---|
| OPS-010 | P0/P1 | Ledger de billing (periodos, eventos inmutables, conciliación) | Resultado se reproduce desde eventos |
| OPS-011 | P1 (dep. OPS-010) | Corregir UI y PDF financiero para reflejar el ledger | UI/PDF coinciden con ledger en fixtures |
| OPS-012 | P0 comercial | Decidir DIAN: retirar claim, integrar proveedor, o implementar flujo completo | Oferta y feature usan el mismo nombre/capacidad |
| OPS-013 | P0/P1 | Backup y restore con RPO/RTO definidos | Restauración completa en proyecto de prueba, con evidencia |
| OPS-014 | P1 | Observabilidad y SLO (journeys, alertas, runbooks) | Incidente sintético se detecta, alerta y resuelve |
| OPS-015 | P1 | Offboarding (export, revocación, retención, certificado) | Simulacro end-to-end sin datos residuales |

## Epic DOC/LEGAL — Verdad y contratos

| Ticket | Prioridad | Acciones | Cierre |
|---|---|---|---|
| DOC-010 | P0/P1 | Marcar certificaciones obsoletas con status/commit/supersession | Búsqueda no devuelve claim vigente falso |
| DOC-011 | P1 | Canónicos pequeños (≤10 documentos para entender el proyecto) — **coherente con el sistema de context-packaging ya existente en `00_Continuidad/`** | Otra IA identifica estado/arquitectura/seguridad/roadmap cargando ≤10 documentos |
| LEG-010 | P1 antes de vender | Contrato y orden de servicio (jurisdicción, SLA, responsabilidad) | Revisión de abogado |
| LEG-011 | P0/P1 | Privacidad/DPA (roles, finalidades, derechos, retención) | Revisión legal y flujo técnico de consentimiento |

## Epic BIZ — Validación empresarial

| Ticket | Prioridad | Acciones | Cierre |
|---|---|---|---|
| BIZ-010 | P1 | Elegir ICP inicial (propuesta origen: retail local con inventario/pedidos repetitivos, sin DIAN en alcance inicial) | Perfil/dolor/alternativas/presupuesto/disparador en una página |
| BIZ-011 | P1 | Oferta mínima verificable | Cada claim tiene demo/prueba |
| BIZ-012 | P1 | Unit economics (precio mínimo, margen por escenario) | Precio protege margen en escenarios conservador/base/alto uso |
| BIZ-013 | P1 tras gates técnicos | Design partner (acuerdo de piloto) | Problema/baseline/target/periodo acordados |
| BIZ-014 | P1 tras ARC-017/SEC/OPS | Piloto pago Moni | Activación/uso/valor/soporte medidos |
| BIZ-015 | P2 | Repetibilidad (3 clientes del mismo ICP sin fork) | Onboarding con esfuerzo decreciente |

## Secuencia de ejecución recomendada por la auditoría origen

```text
SEC-010, SEC-011 (secretos)
  → SEC-012 (pruebas rojas)
  → SEC-013 a SEC-016 (identidad y reglas)
  → REP-010 a REP-015 (reproducibilidad/CI)
  → SEC-017 a SEC-020 (central, Bridge, telemetría)
  → ARC-010 a ARC-017 (verdad y upgrade Moni)
  → OPS-010 a OPS-015 (dinero/operación)
  → LEG y BIZ (piloto)
```

Trabajar fuera de este orden provoca re-trabajo (ver
`registro_riesgos_deuda_tecnica_2026-07-14.md` §6 para el razonamiento
completo).

## Definition of Done universal (heredada del documento origen)

Cambio aislado y revisable; pruebas negativas y positivas; clon limpio
reproducible; sin secretos ni drift generado; rollback definido/probado según
riesgo; documentación canónica actualizada; bitácora actualizada; evidencia
con comandos/resultados; revisión humana para seguridad, dinero, deploy y
legal.
