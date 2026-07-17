# Baseline antes de Claude — PROTOTIPE

**Fecha:** 14 de julio de 2026  
**Clasificación:** evidencia técnica local; sin commit, push ni deploy  
**Producción:** `NO-GO`

## Resultado ejecutivo

El workspace limpio fue recuperado y el runtime quedó reproducible antes de
autenticar Claude. Las familias ejecutables instalaron y compilaron; los lint
aplicables quedaron sin errores bloqueantes y se aprobaron 198 pruebas en el
baseline inicial. Después del hardening RBAC se aprobaron cinco ejecuciones de 65
pruebas (325 ejecuciones) y el build integral quedó verde en modo normal de solo
lectura.

Esto constituye un baseline útil, no una certificación de producción ni el cierre
de la migración a Claude.

## Unidades Git verificadas

| Unidad | Rama | HEAD inicial | Alcance del clon |
|---|---|---|---|
| `PROTOTIPE` | `docs/context-packaging` | `919bdc...` | historial completo |
| `dev-dashboard` | `develop` | `a33bc8...` | historial completo |
| `App Ventas_limpio` | `develop` | `b24561...` | superficial |
| `ventas-moni-app` | `cliente/ventas-moni-app` | `ead11e...` | superficial |

Los árboles iniciales coincidieron con la copia preservada. REC-002 no fue aplicado.

## Rutas definitivas

- Coordinador oficial: `D:\PROTOTIPE`.
- Copia anterior preservada: `D:\PROTOTIPE_PRESERVADO_ANTES_DE_RECUPERACION_2026-07-14`.
- Clones independientes: `D:\PROTOTIPE_WORKSPACE`.
- Documentación canónica fuera de Git: `D:\RESPALDO_PROTOTIPE`.
- Intento incompleto en cuarentena: `D:\PROTOTIPE_RECUPERACION_INCOMPLETA_2026-07-14`.

Se conservó `D:\PROTOTIPE` como raíz canónica porque generadores, herramientas y
documentación histórica dependen de ella. Los puntos operativos encontrados fueron
convertidos a resolución dinámica cuando era seguro hacerlo.

## Herramientas comprobadas

- Node.js `22.23.0` y npm `10.9.8`, declarados mediante `.nvmrc`, `.node-version`,
  `.npmrc`, `engines` y `packageManager`.
- `node verify-runtime.mjs` pasa con esas versiones y falla deliberadamente ante
  Node 20 o npm 9.
- Git `2.53.0.windows.3`; Git Bash disponible.
- Claude Code nativo `2.1.210` en `C:\Users\Sergio Agudelo\.local\bin`, primero en
  el PATH del usuario, con autoactualizaciones habilitadas en `latest`; `claude
  doctor` sin problemas de instalación. La autenticación con Claude Pro fue
  realizada por el fundador y verificada después en `CORE-343`, sin registrar
  credenciales ni identificadores.
- Claude Desktop `1.21459.0.0` detectado.

## Validación reproducible

- Los 11 pares `package.json`/`package-lock.json` quedaron reconciliados con npm
  `10.9.8`.
- `npm ci` pasó en las siete superficies ejecutables revisadas.
- Builds directos pasaron en CLI/plantillas/instancias y en las dos copias del
  dashboard.
- Functions ejecuta ESLint moderno mediante `eslint.config.cjs` y pasa con cero
  errores.
- Dashboard pasó ESLint con cero errores y 413 advertencias visibles. Las reglas
  exclusivas de React Compiler son advertencias porque el compilador no está
  habilitado; las reglas base siguen bloqueando errores.
- Pruebas: 65 de template ventas, 65 de App Ventas, 65 de ventas Moni y 3 de core
  seed; total: 198 aprobadas.
- La validación de conocimiento pasa después de registrar los formatos
  `blueprint-semver` y `hsl-color` y migrar cinco ejemplos al esquema vigente.

## Fallos encontrados y tratamiento

1. Una prueba de ventas esperaba el nombre base y no la variante vigente; se
   corrigió la expectativa, no el comportamiento correcto.
2. Functions usaba una configuración ESLint incompatible con flat config; se migró
   a una configuración actual y ejecutable.
3. Dashboard inició con 133 errores y 338 advertencias; se corrigieron 54 errores de
   código restantes y el lint quedó con cero errores.
4. El verificador de biblioteca dependía de `D:\Documentacion PROTOTIPE`; ahora
   resuelve el coordinador recuperado o `PROTOTIPE_ROOT`.
5. El verificador podía escribir mientras “verificaba”; la ruta normal quedó en
   solo lectura y exige `PROTOTIPE_ALLOW_INTEGRITY_SYNC=1` para sincronizar.

## Bloqueos resueltos y restricciones vigentes

- Los 18 pares de skills del baseline fueron comparados por SHA-256. Durante
  `CLAUDE-003` se añadieron dos pilotos y se actualizó `bitacora-recorder`; los 20
  pares actuales quedaron idénticos y la verificación posterior reportó 20 `noop`,
  cero conflictos y ninguna escritura.
- `AdminCustomerLoyalty.jsx`, `AdminView.jsx` y `AdminHelloModule.jsx` recibieron
  guards reales de rol antes de ejecutar lógica administrativa.
- CORE-342 enumera el alcance local y el gate de trazabilidad pasa.
- El build integral pasa desde `D:\PROTOTIPE`.

Siguen prohibidos REC-002 automático, commit, push y deploy sin tarea, revisión y
autorización separadas. Producción continúa en `NO-GO`.

## Dependencias

Se actualizaron revisiones compatibles dentro de los rangos actuales después de
establecer el baseline. Los saltos mayores no se forzaron. Requieren migraciones
separadas, entre otros: Express 5, Firebase Admin 14, Inquirer 14, Babel 8, Vite 8,
plugin-react 6 y jsdom 29.

La política vigente es “última estable compatible y verificada”, no “última versión
sin considerar compatibilidad”.

## Reconciliación con el Plan Maestro

| Etapa | Estado al 14 de julio | Evidencia / deuda |
|---|---|---|
| Recuperación | verificada | cuatro clones, ramas, HEAD, cápsula y ZIP diferenciados |
| Entorno limpio | verificada | Git, Git Bash, Node/npm fijados y lockfiles reproducibles |
| Baseline sin Claude | verificado técnicamente | instalaciones, build integral, lint, integridad, RBAC y pruebas pasan |
| Verdad canónica | parcial | documentación sincronizada; quedan decisiones de producto/arquitectura |
| Fundación Claude | verificada localmente | `CLAUDE-003` cerrada después de golden queries, sincronización limpia y dos handoffs independientes con correcciones documentadas |
| Skills y pilotos | gobernados | 48 capacidades clasificadas; 15 internas activas, 3 restringidas y 2 pilotos; no se instaló el catálogo externo |
| Convivencia y cierre | verificada para la fundación | terminal y Desktop Code retomaron el contexto; cada nueva tarea mantiene su propio preflight y handoff |

Desviación controlada: el Plan Maestro pedía no actualizar dependencias durante la
migración. Primero se reprodujo el baseline; después, por decisión del fundador, se
actualizaron únicamente versiones compatibles y se repitieron las validaciones. Los
saltos mayores quedaron aplazados.

## Próximo paso seguro

1. Preservar el cierre `VERIFIED_COMPLETE` de `CLAUDE-003` y seleccionar explícitamente la próxima tarea real antes de editar.
2. Antes de cada nueva tarea, registrar objetivo, archivos permitidos, evidencia y criterio de cierre; comprobar rama, HEAD y working tree.
3. Usar `route-capabilities` y activar únicamente el conjunto mínimo permitido. Buscar herramientas externas solo si el registro responde `DISCOVERY_REVIEW_REQUIRED` y el fundador autoriza la red.
4. Iniciar Claude Code desde `D:\PROTOTIPE`; Claude Desktop, Codex y Antigravity deben obedecer el mismo contrato en `.agents/AI_WORKFLOW.md`.
5. Mantener un solo escritor por worktree físico y registrar ejecutor, evidencia y cambios preexistentes en cada handoff.
6. Mantener bloqueados REC-002, despliegues, commit y push salvo autorización
   explícita separada.
7. No ampliar rules, hooks, agentes o skills hasta que una necesidad real demuestre el vacío y la nueva capacidad sea auditada.
