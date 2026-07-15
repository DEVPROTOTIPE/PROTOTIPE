# Registro de riesgos y deuda técnica — PROTOTIPE

**Procedencia:** contenido curado y adaptado desde la auditoría profunda
externa fechada 2026-07-14, conservada fuera de Git en
`D:\RESPALDO_PROTOTIPE\Continuidad\2026-07-14\02_DOCUMENTOS_CENTRALES\`
(`00_RESUMEN_EJECUTIVO_Y_VEREDICTO_GLOBAL.md` y
`10_DEUDA_TECNICA_CUELLOS_DE_BOTELLA_Y_RIESGOS.md`). Traído a
`Documentacion PROTOTIPE` el 2026-07-15 (tarea `CORE-346`) porque no existía
ningún registro equivalente en el repositorio — verificado por búsqueda antes
de crear este archivo.

**Advertencia de vigencia:** este documento describe el estado del código en
la fecha de la auditoría (2026-07-14). Ninguno de los P0/P1 aquí listados fue
tocado por `CORE-341` a `CORE-345` (esas tareas cubrieron runtime, gobernanza
de Claude y arquitectura por capas de una feature piloto — no seguridad de
reglas Firestore, ni el Bridge, ni secretos rastreados). **Dos hallazgos
fueron reverificados de forma independiente el 2026-07-15** (ver §3); el
resto se presenta como `RESULTADO INFORMADO NO REAUDITADO` — confirmar contra
el código real antes de actuar, no asumir que sigue exactamente igual.

---

## 1. Veredicto de la auditoría origen

PROTOTIPE no está bloqueado por una sola falla, sino por la interacción de
cuatro sistemas sin gates suficientes: (1) seguridad e identidad, (2) verdad
de arquitectura/artefactos, (3) reproducibilidad y calidad, (4) promesa
comercial/operación. Veredicto por uso: análisis/diseño local `GO`; demo
controlada con Emulator `GO CONDICIONADO`; piloto con negocio real `NO-GO`;
producción y cobro por comisión `NO-GO`.

## 2. Cuellos de botella (CB-01 a CB-08)

| ID | Cuello de botella | Mejora propuesta |
|---|---|---|
| CB-01 | El fundador es el integrador manual de toda la verdad (intención dispersa en chats, docs, Dashboard, CLI, registry, locks) | Canónicos pequeños, ADRs, reconciliador automático, bitácora |
| CB-02 | "God files" (`Dashboard/App.jsx`, `CLI/server.js`) dificultan revisión y ownership | Extraer por dominio con tests de caracterización; no reescribir |
| CB-03 | Plantillas duplicadas (raíz, template CLI, Core, Moni) sin master único | Una plantilla fuente + artefactos versionados + instancia delgada |
| CB-04 | Pruebas con falsos verdes (omisiones, paths locales) | Fail closed, clones limpios, pruebas conductuales |
| CB-05 | Identidad inconsistente (Firebase Auth, teléfono/nombre, PIN local, token CLI, Google access token) sin modelo unificado | Modelo de identidad por actor/tenant, claims, sesiones server-side |
| CB-06 | Facturación sin ledger (métricas en vivo usadas como comisión histórica) | Ledger, periodos, ajustes, conciliación, idempotencia |
| CB-07 | Backup/restore/soporte prometidos como texto, no como runbook probado | Ejercicios y evidencia antes de prometer |
| CB-08 | Alcance comercial multi-nicho antes de demostrar PMF en uno | Un ICP, un problema, una métrica, una cohorte |

## 3. Hallazgos P0 — estado reverificado el 2026-07-15

Los seis bloqueos P0 originales de la auditoría, con verificación
independiente donde fue posible sin abrir contenido sensible:

| ID | Hallazgo | Estado verificado 2026-07-15 |
|---|---|---|
| P0-A | `firestore.rules` permite tomar el primer admin cuando falta `config/settings` | `RESULTADO INFORMADO NO REAUDITADO` — requiere revisar `firestore.rules` directamente, fuera de alcance de esta tarea documental |
| P0-B | Identidad de cliente/empleado por `localStorage`, sin OTP, PIN validado contra reglas contradictorias | `RESULTADO INFORMADO NO REAUDITADO` |
| P0-C | Firestore permite lectura/escritura pública en pedidos, productos, favoritos, tracking, notificaciones, inventario | `RESULTADO INFORMADO NO REAUDITADO` |
| P0-D | Bridge (`Prototipe-CLI/server.js`): 141 rutas Express, 82 mutables, solo 12 con middleware de seguridad nominal, 70 mutables sin control identificable | `RESULTADO INFORMADO NO REAUDITADO` — el archivo ha cambiado desde entonces (ver `save_as_core.js`, `server.js` modificados en working tree actual); recontar antes de actuar |
| P0-E | Secretos rastreados: `Prototipe-CLI/notification_config.json` (token de bot Telegram) y `Prototipe-CLI/auth_users.json` (usuario + hash/salt de contraseña Firebase) | **`HECHO VERIFICADO` el 2026-07-15 — AMBOS ARCHIVOS SIGUEN TRACKEADOS EN GIT HOY** (`git ls-files` confirmó `Prototipe-CLI/notification_config.json` y `Prototipe-CLI/auth_users.json`; no se abrió el contenido de ninguno). Es un P0 vigente, no un hallazgo obsoleto. |
| P0-F | Fuentes de verdad contradictorias: registro dice 8 features, Knowledge 7, `template-core-seed` 1 física, locks Core/Moni 6 instaladas | `RESULTADO INFORMADO NO REAUDITADO` |

**Nota de alcance:** `cli-token.json` (un secreto rastreado *distinto*,
mencionado en los archivos de seguridad del respaldo pero no en este
registro P0) sí fue confirmado remediado — commit `919bdc9 security(cli):
stop tracking ephemeral local token`. Eso no cubre `notification_config.json`
ni `auth_users.json`, que son hallazgos separados y siguen abiertos.

## 4. Registro consolidado de riesgos (R-001 a R-045)

Probabilidad = evaluación cualitativa por exposición del código, no
frecuencia estadística. `RESULTADO INFORMADO NO REAUDITADO` salvo R relativo
a P0-E (ver §3).

| ID | Riesgo | Prob. | Impacto | Prioridad | Control inmediato |
|---|---|---|---|---:|---|
| R-001 | Toma del primer admin | Alta | Crítico | P0 | No publicar; bootstrap server-side |
| R-002 | Lectura pública de pedidos/PII | Alta | Crítico | P0 | Reglas deny + pruebas |
| R-003 | Mutación pública de producto/pedido/stock | Alta | Crítico | P0 | Cerrar reglas y transiciones |
| R-004 | Suplantación de cliente por teléfono | Alta | Alto | P0 | OTP/identidad real |
| R-005 | Sesión/rol empleado manipulable | Alta | Crítico | P0 | Auth server-side/claims |
| R-006 | Bridge mutable desde proceso/origen local | Media/Alta | Crítico | P0 | auth por capacidad |
| R-007 | Token Telegram expuesto | Alta si vigente | Alto | P0 | rotar y sanear |
| R-008 | Material de usuario en Git | Media | Alto | P0/P1 | invalidar y desrastrear |
| R-009 | Google token exfiltrado por XSS/wrapper | Media | Crítico | P0 | retirar localStorage/interceptor |
| R-010 | Usuario Firebase no operador controla central | Media | Crítico | P0 | claims/allowlist |
| R-011 | Token telemetría adivinado/filtrado | Alta | Alto | P0 | aleatorio, hash, expiry |
| R-012 | Token inactivo sigue aceptado por Function | Alta tras revocación | Alto | P0 | validar estado |
| R-013 | Payload telemetría inyecta PII/costo | Media/Alta | Alto | P1 | schema/size/rate |
| R-014 | Comisión histórica incorrecta | Alta >6 meses | Alto | P0/P1 | ledger/corregir UI |
| R-015 | Cobro mensual subestimado | Alta | Medio/Alto | P1 | contrato/ledger |
| R-016 | Vender DIAN sin implementación | Alta si se ofrece | Crítico legal/comercial | P0 | retirar claim/integrar |
| R-017 | Lock Moni impide recuperación | Alta | Alto | P0/P1 | regenerar y probar npm ci |
| R-018 | Drift borra personalización | Media/Alta | Alto | P0/P1 | manifest overrides/upgrade dry-run |
| R-019 | Dos plantillas producen versiones distintas | Alta | Alto | P1 | una master |
| R-020 | Registry/Knowledge/lock divergen | Alta | Alto | P0/P1 | reconciliador bloqueante |
| R-021 | Build Dashboard falla standalone | Alta | Alto | P1 | eliminar dependencia externa |
| R-022 | CI verde sin pruebas | Alta | Alto | P0/P1 | minimum tests/fail closed |
| R-023 | CI Moni nunca ejecuta | Alta | Alto | P1 | trigger por rama/PR |
| R-024 | Playwright Windows en Ubuntu | Alta | Medio | P1 | comando portable |
| R-025 | Runtime Node inconsistente | Alta | Medio/Alto | P1 | matriz fijada |
| R-026 | Vulnerabilidades Functions/admin | Media | Alto | P1 | upgrade probado |
| R-027 | God files ralentizan cada cambio | Alta | Alto acumulativo | P1 | modularización incremental |
| R-028 | Imports Firebase en UI rompen aislamiento | Alta | Medio/Alto | P1 | ports/adapters |
| R-029 | Backup no restaurable | Media | Crítico | P0/P1 | restore drill |
| R-030 | Costos Firestore/backups no modelados | Alta al crecer | Alto | P1 | budgets/unit economics |
| R-031 | Contrato no exigible/ambiguo | Alta al vender | Alto | P1 | revisión legal/anexos |
| R-032 | Consentimiento privacidad insuficiente | Alta con datos reales | Crítico | P0/P1 | flujo y DPA |
| R-033 | Incidente sin plazo/runbook | Media | Alto | P1 | IR plan |
| R-034 | Offboarding no elimina/exporta verificablemente | Media | Alto | P1 | runbook/certificado |
| R-035 | Cápsula subida no es autosuficiente | Alta si se usa sola | Alto | P0/P1 | conservar cápsula completa D |
| R-036 | GitHub ZIP no prueba commits/ramas | Alta | Medio | P1 | bundles/manifest de refs |
| R-037 | D y C están en el mismo disco físico | Baja/Media | Crítico | Riesgo aceptado | no tocar D; copia externa deseable |
| R-038 | Cuenta ChatGPT compartida pierde contexto | Media | Medio | P1 | archivos/Library/Git |
| R-039 | Claude ejecuta acción destructiva por contexto | Media | Crítico | P0/P1 | deny/hooks/confirmación |
| R-040 | Migración masiva borra reglas históricas útiles | Alta si se hace | Medio/Alto | P1 | migración selectiva |
| R-041 | Documentación obsoleta guía a IA | Alta | Alto | P1 | states/supersession |
| R-042 | Expansión multivertical antes de PMF | Alta | Alto financiero | P1 | freeze/ICP único |
| R-043 | Soporte supera ingreso | Alta sin costos | Alto | P1 | límites/precio/health |
| R-044 | Comisión genera disputa | Media/Alta | Alto | P1 | definición y conciliación |
| R-045 | Seed/fixtures contienen datos reales | Desconocida | Alto | P1 | scanner y datos sintéticos |

## 5. Cifras de calidad verificadas en la auditoría origen (2026-07-14)

`RESULTADO INFORMADO NO REAUDITADO` — cambian con cada commit, no recontadas
en esta tarea:

- `Dashboard/src/App.jsx`: 16.825 líneas. `Prototipe-CLI/server.js`: 15.900
  líneas. `generator.js`: 4.114 líneas.
- Lint: Dashboard 133 errores/338 advertencias (sin tests); Core (App Ventas)
  641 errores/22 advertencias; Moni 897 errores/28 advertencias.
- Core presentaba 44 archivos con imports directos de Firebase (componentes,
  páginas, layouts) — nota: `CORE-344`/`CORE-345` (2026-07-15) atacaron
  exactamente esta clase de problema para `customer-loyalty`, `hello-module`,
  `credits`, `billing`, `orders`, `sales` y parcialmente `inventory`, ver
  `ADR-0001-arquitectura-canonica-por-capas.md`. Las cifras aquí son
  anteriores a ese trabajo; no reflejan el estado post-CORE-345.
- Moni no podía ejecutar `npm ci` (desajuste `package.json`/lock); CI en
  Node 18, Functions en Node 20, auditoría corrida en Node 24, sin política
  de runtime — nota: esto sí se abordó en el baseline `ENV-011`
  (`VERIFIED_COMPLETE`, Node `22.23.0`/npm `10.9.8` fijados), ver
  `BASELINE_ANTES_DE_CLAUDE_2026-07-14.md`.

## 6. Dependencias de remediación (orden recomendado por la auditoría origen)

```text
secretos + freeze
       ↓
tests de ataque
       ↓
identidad + reglas + Bridge
       ↓
build/CI reproducible
       ↓
fuente única + manifests/locks
       ↓
Core→Moni upgrade/rollback
       ↓
billing + backup/restore
       ↓
contrato/oferta/piloto
       ↓
escala
```

Trabajar fuera de este orden provoca re-trabajo: modularizar UI antes de
fijar seguridad puede mover vulnerabilidades sin cerrarlas; vender comisión
antes de ledger genera disputas.

## 7. Criterio de salida de la fase de estabilización

PROTOTIPE podrá pasar a un piloto real solo cuando se cumplan
simultáneamente: cero rutas P0 reproducibles en reglas/autenticación; cero
secretos rastreados en HEAD (**hoy incumplido — ver §3, P0-E**); `npm ci`,
lint, tests y build verdes en clones limpios; CI ejecutándose para
Dashboard/Core/Moni; contrato Core→instancia probado con upgrade y rollback;
fuente de verdad reconciliada para features y locks; telemetría autenticada
sin tokens crudos; backup/restore probados con RPO/RTO; contrato/privacidad/
oferta corregidos; alcance de piloto, precio y métrica de éxito firmados.
