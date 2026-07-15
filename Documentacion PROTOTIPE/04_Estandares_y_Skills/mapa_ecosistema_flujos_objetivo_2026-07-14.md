# Mapa de ecosistema — flujos objetivo y planos de arquitectura

**Procedencia:** curado desde
`D:\RESPALDO_PROTOTIPE\Continuidad\2026-07-14\02_DOCUMENTOS_CENTRALES\14_MAPA_COMPLETO_DEL_ECOSISTEMA_PROTOTIPE.md`
(auditoría externa, 2026-07-14). Traído a `Documentacion PROTOTIPE` el
2026-07-15 (tarea `CORE-346`).

**Relación con `mapa_aplicacion.md`:** ese archivo es un índice de rutas
físicas (qué carpeta contiene qué). Este documento es complementario: describe
**flujos** (cómo se mueven los datos y las decisiones entre las piezas) y
**planos de responsabilidad** (quién controla qué). No hay solapamiento de
contenido — se referencian entre sí.

**Se omite deliberadamente** del documento origen: la sección de hashes de
commit por unidad Git (ya obsoleta, cambia con cada commit — usar `git log`
directamente) y la sección de "punto de verdad para reanudar" (ya cubierta,
con más rigor, por `.agents/AI_WORKFLOW.md` y
`00_Continuidad/canonical/00_REANUDAR_PROTOTIPE_CONTINUIDAD_2026-07-13.md`).

## 1. Vista ejecutiva del ecosistema

```text
                         ┌──────────────────────────┐
                         │ Fundador / Operador      │
                         └────────────┬─────────────┘
                                      │
                        ┌─────────────▼─────────────┐
                        │ Dashboard Central         │
                        │ clientes, health, billing │
                        └──────┬───────────┬────────┘
                               │           │
                  HTTP/SSE local           │ Firestore Central
                               │           │
                    ┌──────────▼───┐   ┌───▼────────────────┐
                    │ PROTOTIPE CLI│   │ Plano de control    │
                    │ Bridge       │   │ tokens/telemetría   │
                    └──────┬───────┘   └────────────────────┘
                           │
          ┌────────────────┼───────────────────┐
          │                │                   │
   ┌──────▼──────┐  ┌──────▼──────┐   ┌──────▼─────────┐
   │ Knowledge   │  │ Generator   │   │ Git/Filesystem │
   │ + Blueprint │  │ + Validation│   │ Firebase CLI   │
   └──────┬──────┘  └──────┬──────┘   └────────────────┘
          │                │
          └────────┬───────┘
                   │
          ┌────────▼─────────┐
          │ Plantilla Ventas │
          └────────┬─────────┘
                   │ aprovisionar/actualizar
          ┌────────▼─────────┐
          │ Instancia Moni   │
          │ Firebase propio  │
          └──────────────────┘
```

El mapa describe la intención. Las fronteras de seguridad y las fuentes de
verdad aún no cumplen completamente esa separación — ver
`registro_riesgos_deuda_tecnica_2026-07-14.md` para los hallazgos P0
asociados (Bridge sin protección uniforme, fuentes de verdad contradictorias).

## 2. Plano de runtime por instancia — identidad por actor

`RESULTADO INFORMADO NO REAUDITADO` (2026-07-14, no reverificado):

```text
Cliente final ─────┐
Empleado/Portal ───┼─> React/PWA ─> Firebase Auth ─> Firestore/Storage del cliente
Administrador ─────┘                    │
                                       └─> Functions/servicios si se implementan
```

| Actor | Identidad actual | Problema reportado |
|---|---|---|
| Admin | Firebase email/password + bootstrap browser | carrera de primer admin (ver R-001) |
| Cliente | teléfono/nombre + `localStorage` | no prueba posesión (ver R-004) |
| Empleado | PIN hash + `localStorage` | contrato de reglas roto/rol editable (ver R-005) |
| Operador central | cualquier Firebase Auth central | no hay claim específico (ver R-010) |
| Instancia | token de telemetría | predecible/no uniforme (ver R-011) |
| CLI local | token propio/Firebase CLI/Google | protocolos fragmentados |

## 3. Plano central — colecciones y telemetría

Colecciones observadas (2026-07-14, no reverificado): `clientes_control`,
`tokens`, `reportesBilling`, `app_failures`, `whatsappTemplates`,
`configuracion_sistema`, `briefings`, `cotizaciones`, `dashboard_config`,
`health_checks`.

```text
Instancia
  └─ Bearer telemetry token
       └─ Cloud Function reportTelemetry
            ├─ tokens/{token}
            ├─ reportesBilling/{client_period}
            ├─ app_failures
            └─ clientes_control/{clientId}.billingTelemetry
```

Problemas reportados: token predecible/crudo, estado no validado por la
Function, schema incompleto, operador central genérico (ver SEC-020, SEC-017
en el backlog).

## 4. Plano local privilegiado — el Bridge como control plane

```text
Dashboard browser
  └─ HTTP/SSE localhost
       └─ Bridge server.js
            ├─ filesystem
            ├─ repos Git
            ├─ Generator
            ├─ plantillas/instancias
            ├─ Firebase CLI/GCP
            ├─ documentación
            └─ deploy/rollback
```

El Bridge (`Prototipe-CLI/server.js`) es equivalente a un control plane local
y debe tratarse con la misma disciplina que un backend administrativo — ver
P0-D en `registro_riesgos_deuda_tecnica_2026-07-14.md` (141 rutas, 82
mutables, hallazgo no reverificado) y SEC-019 en el backlog.

## 5. Flujo de Knowledge y generación (estado actual, no objetivo)

```text
knowledge/features/*.json ─┐
feature-registry.json ─────┤
template directories ──────┼─> Generator ─> manifest generado ─> instancia
core-manifest.json ─────────┤                         └─────────> lock
prototipe.lock.json ────────┘
```

El flujo actual no establece precedencia obligatoria entre estas fuentes —
relacionado con P0-F (fuentes de verdad contradictorias) y el ticket ARC-013
(reconciliador de verdad) del backlog.

## 6. Flujo de aprovisionamiento objetivo (no implementado, es la meta)

```text
Discovery aprobado
→ Quote/Order firmada
→ Blueprint de tenant
→ Validation (schema, costos, compatibilidad, seguridad)
→ Generation plan (sin escribir)
→ Revisión humana
→ Apply a staging
→ Pruebas
→ Crear Firebase/identidades/reglas
→ Seed sintético o migración autorizada
→ Smoke
→ Go-live gate
→ Lock/manifest/evidencia
```

Ningún secreto debe formar parte del Blueprint versionado.

## 7. Flujo de actualización objetivo (Core → instancia)

```text
Core release firmada
→ identificar instancias compatibles
→ dry-run por instancia
→ backup verificable
→ aplicar a staging/canary
→ migrations + tests
→ health window
→ promover
→ nuevo lock
→ rollback si gate falla
```

Moni se propone como la primera instancia canaria. **Nota 2026-07-15:** el
mecanismo de propagación `Core → template` construido en `CORE-345`
(`Prototipe-CLI/publish_core_to_template.js`) es un primer paso concreto
hacia este flujo objetivo — cubre `Plantilla Core → template`, no todavía
`template → instancia canaria` con dry-run/health-window/rollback formal.

## 8. Ciclo de vida de cliente objetivo

| Etapa | Entrada | Salida/evidencia | Owner futuro |
|---|---|---|---|
| Segmentación | ICP definido | lista priorizada | fundador/marketing |
| Discovery | lead calificado | problema/baseline | founder sales |
| Solution fit | dolor cuantificado | Blueprint preliminar | producto |
| Cotización | alcance validado | oferta con costos | ventas/finanzas |
| Contrato | términos aceptados | firma + DPA | legal/ventas |
| Provisioning | pago/gate técnico | instancia staging | ingeniería |
| Migración | datos autorizados | reconciliación | implementación |
| Onboarding | usuarios listos | journeys completados | customer success |
| Go-live | gates verdes | aceptación | cliente+PROTOTIPE |
| Operación | uso real | SLO/health/billing | soporte/ops |
| Adopción | baseline | valor medido | customer success |
| Renovación | health y valor | renovación/expansión | ventas/CS |
| Offboarding | terminación | export/revoke/delete | ops/legal |

## 9. Artefactos canónicos objetivo

| Artefacto | Fuente | Derivados |
|---|---|---|
| Feature contract | Knowledge aprobado | registry, catálogo |
| Blueprint tenant | order/config validada | generation plan |
| Template source | repo/paquete único | Core builds |
| Core release | tag + artifact | upgrade inputs |
| Instance manifest | apply result | lock/changelog |
| Rules contract | schemas/invariants | rules/tests |
| Billing ledger | eventos server-side | report/PDF/invoice |
| Continuity | bitácora/canónicos | paquetes temáticos |

## 10. Límites de ownership (roles, no personas)

Aunque una sola persona ocupe varios roles hoy, los roles deben existir:
Product owner (alcance/prioridad), Architecture owner (contratos y ADRs —
hoy ejercido vía `ADR-0001` y este mismo proceso de documentación), Security
owner (threat model y gates), Release owner (CI, artifacts, promoción),
Data/privacy owner (tratamiento y retención), Commercial owner (ICP, oferta,
pipeline), Customer owner (onboarding, health, renovación).

**Una IA puede asistir cualquier rol, pero no firmar aceptación legal, rotar
credenciales externamente, aprobar un deploy de producción, ni asumir el
riesgo del propietario.** Esto es coherente con — y refuerza — las
prohibiciones ya vigentes en `CLAUDE.md` y `.agents/AI_WORKFLOW.md`.
