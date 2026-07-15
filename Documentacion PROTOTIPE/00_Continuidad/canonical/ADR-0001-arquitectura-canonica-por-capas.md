# ADR-0001 — Arquitectura canónica por capas de PROTOTIPE

## 1. Título

Arquitectura canónica por capas para las aplicaciones React/Firebase de PROTOTIPE
(`UI → Hooks → Services/Casos de uso → Repositories → Firebase/HTTP/IndexedDB`).

## 2. Estado

`APPROVED`. El piloto de `customer-loyalty` fue implementado y verificado
localmente (24 pruebas de caracterización + 9 nuevas del Repository, 98/98 de la
suite completa sin regresión, build y lint limpios en los archivos tocados). El
fundador aprobó explícitamente el resultado ("YO LO APRUEBO", 2026-07-15).
Conforme a `.agents/AI_WORKFLOW.md` §6, las decisiones de arquitectura requieren
revisión independiente **o** aprobación humana (condición disyuntiva); este cierre
se sustenta en la aprobación humana del fundador, no en una revisión independiente
de otra sesión de IA (Codex u otra) — no se declara ni se finge que esa revisión
ocurrió. La propagación a `template-ventas`/`ventas-moni-app` (§21-22) permanece
como trabajo futuro separado, no incluido en esta aprobación.

## 3. Contexto

El Plan Maestro de Estabilización y Migración (§9.1) dejó pendiente, como parte de
la "verdad canónica antes de Claude", la elección entre:

- `UI → Hooks/Stores → Services`, o
- `UI → Hooks → Services → Repositories`.

`AGENTS.md` §22 ya describe una arquitectura de 3 capas (Repository / Service /
Hook) como estándar obligatorio, pero la auditoría de CORE-344 (Fase 1, 2026-07-15)
demostró que el código real la implementa de forma parcial y contradictoria. Este
ADR resuelve la ambigüedad con evidencia medida del repositorio, no por intuición
ni por preferencia de estilo.

## 4. Problema

- Solo 2 de ~226 archivos fuente de `Plantillas Core/App Ventas` son Repositories
  reales, mientras 27 archivos (7 services de feature + 20 services globales)
  importan el SDK de Firebase directamente.
- `customer-loyalty` mezcla las tres capas: el Service ejecuta `runTransaction`, el
  Hook abre `onSnapshot` y construye queries, y ambos importan `firebase/firestore`.
  El `index.js` de la feature expone el Repository, rompiendo el aislamiento de la
  frontera de infraestructura.
- No existe ningún guard automatizado que impida que un componente, página o Service
  importe el SDK de Firebase. El único guard arquitectónico ejecutable hoy es
  `no-restricted-imports` contra importaciones profundas entre features.
- AGENTS.md §22.2 exige `RealtimeQueryRegistry` y `queryKeyFactory`, pero ninguno de
  los dos existe físicamente en el código (`grep` no encontró coincidencias).
- Sin una decisión formal y un mecanismo de verificación, cada feature nueva puede
  repetir el patrón de `customer-loyalty` en vez del de `hello-module`.

## 5. Evidencia del repositorio

Medida sobre `Plantillas Core/App Ventas` (226 archivos `.js/.jsx` en `src/`,
rama `docs/context-packaging`, HEAD `919bdc9`):

| Área | Archivos con `firebase/*` |
|---|---|
| Services de feature | 7 |
| Services globales (`src/services/`) | 20 |
| Componentes / páginas / layouts | 10 |
| Config / providers / kernel / guard (infraestructura autorizada) | 4 |
| Hooks | 3 |
| **Repositories (`api/`)** | **2** |
| **Total** | **~42** |

Operaciones Firestore detectadas en `src/`: `onSnapshot` 52 · `runTransaction` 26 ·
`writeBatch` 13 · `getDoc`/`getDocs` 105 · `setDoc`/`updateDoc`/`addDoc`/`deleteDoc` 129.

Comparación de features representativas:

- **`hello-module`** (patrón de referencia): `HelloModuleService` solo importa el
  Repository y el schema Zod; `useHelloModule` solo importa el Service. Ningún
  archivo fuera de `api/HelloModuleRepository.js` toca `firebase/firestore`.
- **`customer-loyalty`** (piloto): `CustomerLoyaltyService.js` importa `db` y
  `runTransaction` de `firebase/firestore` y ejecuta dos transacciones completas
  (`earnPoints`, `redeemPoints`) fuera del Repository. `useCustomerLoyalty.js`
  importa `db`, `onSnapshot`, `collection`, `query`, `where`, `orderBy` y abre dos
  listeners directos. `index.js` exporta `CustomerLoyaltyRepository` junto con el
  Service y el Hook.
- Cero pruebas (`*.test.*`/`*.spec.*`) cubren `customer-loyalty` ni `hello-module`
  en `Plantillas Core/App Ventas` (0 resultados en `src/`; los 9 archivos de
  `tests/` cubren sales, orders, inventory, credits, billing y checkout).
- El guard ESLint `no-restricted-imports` (líneas 25-38 de
  `Plantillas Core/App Ventas/eslint.config.js`) ya bloquea imports profundos entre
  features (`*/features/*/*` salvo `index`). No existe una regla equivalente para
  el SDK de Firebase.

## 6. Decisión arquitectónica

Se adopta `UI/Componentes → Hooks → Services/Casos de uso → Repositories (api/) →
Firebase/HTTP/IndexedDB` como arquitectura canónica para las aplicaciones React de
clientes de PROTOTIPE, con `hello-module` como implementación de referencia. La
regla rectora es **la dirección de las dependencias**, no una plantilla rígida: una
feature trivial puede omitir un Service vacío, pero nunca puede invertir la
dirección de las dependencias (p. ej. un Hook nunca puede ser importado por un
Service).

## 7. Dirección de dependencias

```
UI/Componentes → Hooks → Services/Casos de uso → Repositories (api/) → Firebase/HTTP/IndexedDB
```

Ninguna capa puede importar hacia "arriba" en esta cadena. Las capas superiores
consumen exclusivamente la API pública de la capa inmediatamente inferior.

## 8. Responsabilidad de cada capa

- **UI/Componentes/páginas**: renderizan, capturan interacciones, consumen hooks o
  API pública de features. No importan Firebase, no construyen queries, no ejecutan
  persistencia/transacciones/listeners, no usan reglas de autorización de UI como
  única defensa.
- **Hooks**: adaptan lógica a React (loading/error/ciclo de vida/composición).
  Consumen Services o suscripciones expuestas por Repositories. No construyen
  referencias, queries o transacciones Firestore; no duplican listeners.
- **Services/Casos de uso**: validaciones, cálculos, políticas, reglas de negocio.
  Orquestan uno o varios Repositories con objetos y contratos del dominio. No
  conocen React, `DocumentSnapshot`/`QuerySnapshot`/referencias Firebase, ni
  importan el SDK.
- **Repositories (`api/`)**: frontera de infraestructura. Construyen consultas;
  ejecutan lecturas, escrituras, transacciones y suscripciones; pueden importar
  Firebase; transforman resultados a objetos del dominio; devuelven datos planos,
  resultados semánticos o funciones de cancelación. No contienen lógica visual ni
  dependen de componentes/hooks.

## 9. Excepciones permitidas

- `src/config/**`, `src/core/providers/**`, `src/core/kernel/**`,
  `src/utils/firestoreAuthGuard.js`: infraestructura de arranque/autenticación
  autorizada a importar Firebase.
- `**/api/**` (Repositories): frontera legítima del SDK.
- Una feature trivial puede omitir el Service (Hook → Repository directo) sin
  invertir la dirección de dependencias.
- Lista de excepciones pequeña, explícita, temporal y revisable — no un mecanismo
  para eludir la regla general.

## 10. Fronteras diferentes por runtime

- **Apps React de clientes**:
  `UI → Hooks → Services/Casos de uso → Repositories → Firebase/HTTP/IndexedDB`.
- **Dashboard Central**:
  `UI → Hooks/controladores de vista → API Client → CLI Bridge o servicios autorizados`.
  El Dashboard no accede a infraestructura de clientes sin una frontera explícita.
- **CLI Bridge**: `Routes/Controllers → Use Cases/Services → Adapters/Repositories`.
  Este ADR **solo documenta** el perfil del CLI; CORE-344 no migra el CLI ni crea
  dependencias nuevas contrarias a esta dirección.

## 11. Estado de Zustand

Reservado para estado local, de sesión o de interfaz (carrito, navegación, filtros,
conectividad, estado visual). No es una copia general de Firestore, no reemplaza
reglas de seguridad, no almacena secretos.

## 12. Estado de TanStack Query

Para consultas remotas puntuales, caché, mutaciones, invalidación y paginación. No
duplica innecesariamente el mismo estado que Zustand. Los listeners realtime
requieren una estrategia explícita y no deben multiplicarse por componente — hoy
`useCustomerLoyalty` abre listeners directos sin registro compartido; el piloto de
CORE-344 no introduce TanStack Query nuevo, solo mueve los listeners existentes al
Repository sin cambiar su tecnología.

## 13. Estrategia de listeners realtime

AGENTS.md §22.2 exige un `RealtimeQueryRegistry` con `queryHash`/`refCount`/
`subscribers`, pero **no existe físicamente en el código** (verificado por
búsqueda: cero coincidencias). Se clasifica como `PROPOSED`, no `IMPLEMENTED`. Este
ADR **no** implementa el registry: el piloto solo mueve los `onSnapshot` existentes
de `useCustomerLoyalty` al Repository, conservando su comportamiento actual
(idempotencia vía `unsubscribe` en el cleanup del `useEffect`). Implementar el
registry compartido queda fuera de alcance de CORE-344 y se registra como trabajo
futuro (§20).

## 14. Estrategia de transacciones

Los "documentos calientes" (saldos, contadores, cambios de estado) se actualizan
exclusivamente vía `runTransaction`, pero **la transacción debe vivir en el
Repository**, no en el Service. El Service valida reglas de negocio (umbrales,
mínimos, permisos) y le pasa al Repository los datos ya validados; el Repository
ejecuta la transacción y devuelve el resultado. Esto es lo que corrige el piloto de
`customer-loyalty` (`earnPoints`/`redeemPoints`).

## 15. Estrategia de seguridad

Este ADR no sustituye las reglas de seguridad de Firestore/Storage; formaliza dónde
vive el código que las invoca. La UI nunca es la única defensa de autorización. El
piloto no modifica `firestore.rules`. La validación real de reglas (permitido/
denegado) requiere Firebase Emulator; si no está disponible en el entorno de
verificación, queda como evidencia pendiente y se declara explícitamente como tal
(ver §24), nunca como "seguridad verificada" por inferencia.

## 16. API pública de features

Cada feature expone su API mediante `index.js`. Otros módulos consumen solo esa API
pública; están prohibidas las importaciones profundas (ya bloqueado por
`no-restricted-imports` en ESLint). El Repository **no** se expone fuera de la
feature salvo necesidad demostrada — hoy `customer-loyalty/index.js` exporta el
Repository sin consumidor externo conocido; el piloto lo retira de la API pública.

## 17. Alternativas evaluadas

1. `UI → Hooks/Stores → Services` (sin Repository explícito).
2. `UI → Hooks → Services → Repositories` (la elegida).
3. Mantener el estado mixto actual sin decisión formal.

## 18. Alternativas rechazadas y motivo

- **(1) Sin Repository**: rechazada. Acoplaría los Services al SDK de Firebase de
  forma permanente (el estado actual, ya identificado como problema), impediría
  testear el dominio sin Firebase y no resuelve la mezcla de capas observada en
  `customer-loyalty`.
- **(3) No decidir**: rechazada. El Plan Maestro exige explícitamente cerrar esta
  decisión (§9.1) antes de continuar; no decidir perpetúa la contradicción ya
  detectada entre AGENTS.md §22 y el código real.

## 19. Consecuencias positivas

- Los Services y Hooks del piloto quedan testeables sin mockear el SDK de Firebase
  directamente en cada capa (solo el Repository necesita el mock de
  `firebase/firestore`).
- Un guard ESLint reproducible detecta nuevas violaciones sin exigir refactor
  inmediato del legado completo.
- `customer-loyalty` queda alineado con el patrón ya probado de `hello-module`,
  reduciendo la superficie de arquitecturas divergentes.

## 20. Costos y riesgos

- El guard progresivo, si se configura mal, podría generar ruido (`warn`) que se
  ignore con el tiempo — mitigado limitando el alcance de `error` a las dos
  features ya alineadas (`hello-module`, `customer-loyalty`) y revisando la lista de
  excepciones periódicamente.
- La ausencia de `RealtimeQueryRegistry` sigue siendo una brecha frente a AGENTS.md
  §22.2; este ADR la declara `PROPOSED` en vez de fingir que está resuelta.
- La propagación a `template-ventas` y `ventas-moni-app` queda pendiente (§21) y
  requiere definir un mecanismo `Core → template` que hoy no existe verificado.
- Bugs preexistentes en `customer-loyalty` (`getConfig`, `deleteToken`, ver
  bitácora) no se corrigen en este ADR ni en el piloto; quedan como deuda técnica
  separada.

## 21. Compatibilidad con código heredado

El guard es progresivo: `error` solo en `hello-module` y `customer-loyalty`
(componentes/hooks/services no pueden importar `firebase/*`, solo `api/**` puede);
`warn`/reporte para el resto de `src/features/**`, `src/services/**`,
`src/components/**`, `src/pages/**`. Ningún archivo legado se rompe por este ADR.

`Prototipe-CLI/templates/template-ventas` y `Instancias Clientes/ventas/ventas-moni-app`
**no se modifican** en esta fase. Se verificó que el flujo de sincronización
automatizado existente (`sync_clients.js`) copia `template → clientes`, y que la
única ruta Core↔template verificada es la promoción gobernada `cliente → Core/template`
(`save_as_core.js` + `lib/CorePromotion*`). **No se encontró** un mecanismo
automatizado y verificable para propagar cambios de autoría desde
`Plantillas Core/App Ventas` hacia `template-ventas`. Esta ausencia se registra como
**brecha pendiente**: una tarea posterior deberá definir y demostrar ese mecanismo
(o formalizar que la única vía es la promoción inversa) antes de propagar el piloto.

## 22. Plan progresivo

1. **Fase A (CORE-344, este ADR)**: piloto `customer-loyalty` + guard progresivo,
   solo en `Plantillas Core/App Ventas`.
2. **Fase B**: definir/demostrar el mecanismo Core→template (§21) y propagar el
   piloto ya validado a `template-ventas` y `ventas-moni-app`.
3. **Fase C**: aplicar el patrón a los 5 services de feature restantes con tests
   existentes (sales, orders, inventory, credits, billing).
4. **Fase D**: mover los 20 services globales y los componentes/páginas/hooks que
   aún importan Firebase directamente.
5. **Fase E**: evaluar si `RealtimeQueryRegistry`/`queryKeyFactory` son
   verdaderamente necesarios; si se aprueban, implementarlos y actualizar este ADR.

## 23. Piloto propuesto

`customer-loyalty`, exclusivamente en `Plantillas Core/App Ventas`:

- `CustomerLoyaltyRepository.js` incorpora `earnPoints`/`redeemPoints`
  (transacciones) y las suscripciones de cuenta/transacciones (con `unsubscribe`).
- `CustomerLoyaltyService.js` deja de importar `firebase/firestore`; conserva
  reglas de negocio y delega en el Repository.
- `useCustomerLoyalty.js` deja de importar `firebase/firestore`; consume las
  suscripciones expuestas por el Repository vía el Service.
- `index.js` deja de exportar el Repository.
- No se toca ningún componente con cambios preexistentes de CORE-342.

## 24. Matriz de pruebas

| Prueba | Cobertura |
|---|---|
| Unitarias Service (Repository simulado) | Local — a implementar |
| Unitarias Repository (Firebase mockeado con `vi.mock`) | Local — a implementar |
| Transacciones earn/redeem (saldo insuficiente, umbrales) | Local — a implementar |
| Suscripciones y cancelación (`unsubscribe`) | Local — a implementar |
| Construcción de queries y aislamiento por `tenantId` (código) | Local — a implementar |
| Reglas Firestore permitido/denegado con Emulator | **Pendiente** si no hay Emulator disponible — no se declara seguridad verificada sin esta evidencia |
| API pública (`index.js` no expone Repository) | Local — a implementar |
| Guard arquitectónico (ESLint boundary) | Local |
| ESLint general | Local |
| Unitarias existentes (no regresión) | Local (`tests/unit/*.spec.js`) |
| Build de producción | Local |
| `git diff --check` | Local |
| Verificador integral (solo lectura) | Local |

## 25. Estrategia de reversión no destructiva

Todos los cambios del piloto quedan en el working tree de `docs/context-packaging`
sin commit hasta autorización separada. Revertir es tan simple como descartar los
archivos modificados listados en la bitácora de cierre (acción que requiere
autorización explícita del fundador, conforme a AI_WORKFLOW.md §5). No se toca
`firestore.rules` ni datos; no hay migración de datos que revertir.

## 26. Criterio de cierre

CORE-344 (Fase 2) cierra en `READY_FOR_INDEPENDENT_REVIEW` cuando: el piloto está
implementado solo en `Plantillas Core/App Ventas`; el guard progresivo está activo
y no rompe el build; las pruebas de la matriz de §24 marcadas como "Local" pasan o
sus resultados están documentados literalmente; la documentación (tareas, bitácora,
mapas) está actualizada; y no se declaró `VERIFIED_COMPLETE` sin revisión
independiente humana o de otra IA.

## 27. Revisión independiente requerida

Conforme a `.agents/capabilities/registry.json` (`independentReviewFor:
["security", "architecture", ...]`) y AI_WORKFLOW.md §6, esta decisión es de
**arquitectura** y por tanto requiere revisión independiente (Codex u otra sesión)
antes de cualquier promoción a `APPROVED`/`VERIFIED_COMPLETE`. Quien implementa el
piloto no puede autoaprobar el cierre.
