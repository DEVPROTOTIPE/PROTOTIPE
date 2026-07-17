# Estado del roadmap y tareas activas — 2026-07-15

**Repositorio / rama / HEAD:** `D:\PROTOTIPE` / `docs/context-packaging` / `a8f3048`
**Generado por:** Claude Code (terminal), a partir de `tareas_pendientes.md` y
`bitacora_cambios.md` — no es una fuente nueva, es una fotografía del estado
ya documentado en esos dos archivos a esta fecha/hora.

**Cómo leer los porcentajes:** miden avance de la serie de continuidad activa
(`CORE-341` en adelante, iniciada tras la reinstalación del 14 de julio de
2026), no del histórico completo del proyecto (`CLI-4xx`/`CORE-3xx` anteriores
a esa fecha ya están cerrados y no forman parte del trabajo en curso).

---

## 1. Resumen ejecutivo

- **Fase del roadmap maestro en la que se está trabajando:** Fase 1 —
  "Cierre P0" (`roadmap_tecnico_por_fases_y_gates_2026-07-14.md`), con la
  Fase 0 (baseline) ya cerrada.
- **Avance de la serie de continuidad activa (`CORE-341`→`CORE-358` +
  `CLAUDE-003`):** **15 de 19 tareas cerradas por checkbox = 79 %**. De las 4
  restantes, 2 están funcionalmente resueltas y solo falta un commit/decisión
  del fundador (ver tabla abajo) — si se cuentan como "listas para cerrar", el
  avance práctico sube a **17/19 = 89 %**.
- **Gate 1 (cierre de seguridad P0):** aún no cumplido al 100 % — el criterio
  "cero secretos en HEAD" sigue pendiente de un commit con autorización
  explícita (`CORE-347`, ya preparado, sin commitear).
- **Estado de producción:** `NO-GO` (declarado en `CLAUDE.md`, sin cambios).
  No hay nada de esta serie desplegado a un proyecto Firebase real todavía.

---

## 2. Roadmap maestro por fases — dónde estamos

Fuente: `Documentacion PROTOTIPE/00_Continuidad/canonical/roadmap_tecnico_por_fases_y_gates_2026-07-14.md`
(fechas/horizontes de ese documento son de la auditoría origen, no actualizadas;
el estado de abajo sí es el real).

| Fase | Objetivo | Estado |
|---|---|---|
| **Fase 0 — Preservación y baseline** | Saber qué se puede reconstruir sin memoria humana | ✅ **Cerrada** (`CORE-341`, `CORE-342`, `CORE-343`) |
| **Fase 1 — Cierre P0** | Eliminar toma de control, exposición y mutación sin autorización | 🟡 **En curso, ~85 %** — `SEC-012` a `SEC-017` cerrados; falta commitear `CORE-347` (secretos fuera de Git) para cumplir Gate 1 completo |
| **Fase 2 — Reproducibilidad** | Cada repo se construye igual en máquina limpia y CI | 🟡 **Parcial** — `CORE-352` (build autónomo del Dashboard) y `CORE-358` (falsos verdes del CLI) ya cerrados; no hay CI real configurado todavía |
| **Fase 3 — Producto canónico** | Una sola cadena Core→plantilla→instancia | ⚪ No iniciada como fase formal (existen piezas: `publish_core_to_template.js`, pero `distribute_rules.js` está desactualizado — riesgo abierto) |
| **Fase 4 — Operación confiable** | Billing, backup/restore, observabilidad | ⚪ No iniciada |
| **Fase 5 — Oferta mínima y piloto** | Primer cliente real paga y usa el flujo | ⚪ No iniciada |
| **Fase 6 en adelante** | Repetibilidad y escala | ⚪ No iniciada |

**Gate 1 — criterios uno por uno (evidencia, no solo intención):**

| Criterio | Estado | Evidencia |
|---|---|---|
| Cero pruebas P0 rojas | ✅ `HECHO VERIFICADO` | `firestoreRules.spec.js` cerró sus 16 casos tras `SEC-012`–`015` (`CORE-355`) |
| Cero secretos en HEAD | 🟡 `PENDIENTE` | `CORE-347`: `auth_users.json`/`notification_config.json` ya sin seguimiento en el índice de Git, pero el commit no se ha hecho — requiere autorización explícita del fundador antes de commitear |
| 100 % de rutas mutables con capacidad (regla que exige identidad real) | ✅ `HECHO VERIFICADO` | `isAdmin()`/`isEmployee()`/`ownerUid` cubren `users`, `favorites`, `credits`, `wholesaleOrders`, `claims`, `clientNotifications`, `stockMovements`, `accessLogs`, `orders`, `deliveries` (Core); `isOperator()` cubre el Dashboard Central (`CORE-357`) |
| Token inactivo se rechaza (Bridge) | ⚪ `NO EVALUADO` en esta serie — fuera del alcance de `SEC-012`–`017` |
| No hay producción real con reglas antiguas | ✅ `HECHO VERIFICADO` | Nada de esta serie está desplegado; estado `NO-GO` vigente |

---

## 3. Lista de tareas de la serie de continuidad activa (`CORE-341` en adelante)

Orden cronológico. `✅` = checkbox `[x]` en `tareas_pendientes.md`. `🟡` =
`[ ]` pero con trabajo sustancial ya hecho. `⚪` = `[ ]` sin iniciar.

| Tarea | Objetivo | Estado |
|---|---|---|
| `CORE-341` | Fijar runtime Node/npm reproducible tras reinstalación | ✅ Cerrada |
| `CORE-342` | Remediar fallos baseline post-reinstalación | ✅ Cerrada |
| `CORE-343` | Validar fundación operativa de Claude sobre la raíz canónica | ✅ Cerrada |
| `CLAUDE-003` | Gobernar capacidades y colaboración multi-IA | ✅ Cerrada (`VERIFIED_COMPLETE`, 2 handoffs independientes) |
| `CORE-344` | Definir arquitectura canónica por capas | ✅ Cerrada |
| `CORE-345` | Doctrina de arquitectura por features + migración de 6 features pendientes | ✅ Cerrada |
| `CORE-346` | Reconciliar `D:\RESPALDO_PROTOTIPE\Continuidad` con `Documentacion PROTOTIPE` | ✅ Cerrada |
| `CORE-347` | Dejar de rastrear en Git `auth_users.json`/`notification_config.json` | 🟡 `AWAITING_REVIEW` — cambio preparado en el índice de Git, **falta commit con autorización explícita del fundador** |
| `CORE-348` | Reestructurar `AGENTS.md` en reglas por ruta (`.claude/rules/`) | ⚪ `PENDING` — diagnosticado (474 líneas, 2 contradicciones con el contrato vigente detectadas), split no iniciado; requiere sesión con presupuesto completo |
| `CORE-349` | Activar `SEC-012` — suite de pruebas rojas contra Firestore Emulator real | 🟡 `READY_FOR_INDEPENDENT_REVIEW` — suite escrita y corriendo, checkbox sin marcar |
| `CORE-350` | Activar `SEC-013` — retirar `isFirstStart()`, bootstrap server-side | ✅ Cerrada |
| `CORE-351` | Activar `SEC-014` — identidad real de clientes (Anonymous Auth + `ownerUid`) | ✅ Cerrada |
| `CORE-352` | Activar `REP-011` — build autónomo del Dashboard Central | ✅ Cerrada |
| `CORE-353` | Diagnóstico de `SEC-015` (bug de login por PIN confirmado) | 🟡 Checkbox sin marcar, pero **superada** por `CORE-354` (que diseñó e implementó la solución completa) |
| `CORE-354` | Activar `SEC-015` — identidad real de empleados (email/password sintético) | ✅ Cerrada |
| `CORE-355` | Completar `SEC-012` — `claims`/`clientNotifications`/`fcmTokens` | ✅ Cerrada |
| `CORE-356` | Propagar `SEC-012`–`015` a `template-ventas` | ✅ Cerrada — commit `ff809a8` |
| `CORE-357` | `SEC-017` — claim/allowlist real de operador del Dashboard Central | ✅ Cerrada — commit `6525993` |
| `CORE-358` | `REP-012` — corregir falsos verdes del CLI | ✅ Cerrada — commit `a8f3048` |

**Total:** 19 tareas · 15 cerradas (79 %) · 2 listas para cerrar solo con
commit/checkbox (`CORE-347`, `CORE-349`) · 1 superada por otra ya cerrada
(`CORE-353`) · 1 sin iniciar (`CORE-348`).

---

## 4. Qué falta para que Gate 1 quede 100 % cerrado

1. **Decisión del fundador:** autorizar el commit de `CORE-347` (`git rm
   --cached` ya preparado en el índice, sin tocar el valor de ningún
   secreto). Sin esto, "cero secretos en HEAD" sigue en rojo.
2. **Marcar checkbox de `CORE-349`** en `tareas_pendientes.md` — el trabajo
   ya está `READY_FOR_INDEPENDENT_REVIEW`, solo falta el gesto documental.
3. **`CORE-348`** (reestructurar `AGENTS.md`) no bloquea Gate 1 — es deuda de
   gobernanza documental, no un hallazgo de seguridad explotable.
4. **Riesgo abierto sin tarea asignada todavía:** `distribute_rules.js`
   sigue componiendo `firestore.rules` desde `knowledge/firestore/core.rules`
   desactualizado (no ejecutar hasta sincronizarlo) — señalado en `CORE-356`,
   no convertido aún en tarea propia.
5. **Riesgo abierto sin tarea asignada todavía:** `template-ventas/vite.config.js`
   usa el patrón obsoleto `return 'vendor'` — señalado en `CORE-358`, no
   convertido aún en tarea propia.

---

## 5. Próximo paso recomendado

Con Gate 1 al 85-89 % y solo bloqueado por una decisión del fundador
(`CORE-347`) y un gesto documental (`CORE-349`), el siguiente trabajo de
mayor valor es: (a) decidir `CORE-347`, y (b) evaluar si abrir Fase 2
(reproducibilidad/CI real) o cerrar primero `CORE-348` (deuda de gobernanza)
antes de avanzar de fase.
