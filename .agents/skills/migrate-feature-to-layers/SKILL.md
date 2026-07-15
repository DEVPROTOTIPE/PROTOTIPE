---
name: migrate-feature-to-layers
description: >-
  Migra una feature existente de PROTOTIPE (React/Firebase) hacia la
  arquitectura canónica por capas (UI → Hooks → Services → Repositories)
  decidida en ADR-0001. ACTIVA esta skill cuando el usuario pida migrar,
  refactorizar o alinear una feature con la arquitectura de capas, o cuando
  el guard ESLint (`prototipe/no-firebase-outside-repository`) reporte `warn`
  en `services/`, `hooks/` o `components/` de una feature. No decide
  arquitectura — la ejecuta. La decisión ya está aprobada en ADR-0001.
---

# Migrar una feature a la arquitectura de capas (ADR-0001)

## Propósito

`ADR-0001-arquitectura-canonica-por-capas.md` ya decidió y aprobó la
arquitectura: `UI/Componentes → Hooks → Services → Repositories (api/) →
Firebase/HTTP/IndexedDB`. Esta skill **ejecuta** esa decisión sobre una
feature concreta que hoy la viola (importa `firebase/*` fuera de `api/`), sin
volver a negociar la arquitectura cada vez. Nace de CORE-344/CORE-345, donde
migrar `customer-loyalty` sin este playbook tomó varias rondas de corrección
evitables.

Referencia canónica de "cómo se ve correcto" (no editar, solo consultar):
`Plantillas Core/App Ventas/src/features/hello-module/` (caso simple, CRUD) y
`Plantillas Core/App Ventas/src/features/customer-loyalty/` (caso con
transacciones y listeners, ya migrado en CORE-344).

## Cuándo NO usar esta skill

- Si la feature no tiene ningún import de `firebase/*` fuera de `api/`, no hay
  nada que migrar (revisa con `eslint` primero — ver Paso 6).
- Si se necesita **cambiar** la arquitectura decidida (no solo aplicarla), eso
  requiere un ADR nuevo o una enmienda a `ADR-0001`, no esta skill.
- No se propaga automáticamente a `template-ventas` ni a instancias de
  clientes — eso es responsabilidad de `Prototipe-CLI/publish_core_to_template.js`
  (mecanismo 4 de CORE-345), un paso posterior y separado.

## Paso 1 — Identificar los archivos con Firebase fuera de `api/`

```bash
grep -rlE "from ['\"]firebase/" src/features/<feature>/{components,hooks,services} --include=*.js --include=*.jsx
```

Clasifica cada import por tipo de operación: lectura puntual (`getDoc`/
`getDocs`), escritura (`setDoc`/`updateDoc`/`addDoc`/`deleteDoc`), transacción
(`runTransaction`), listener (`onSnapshot`). Esto determina qué patrón del
Paso 3 aplica a cada uno.

## Paso 2 — Tests de caracterización ANTES de tocar código

Obligatorio. Fija el comportamiento actual (aunque tenga bugs — no los
corrijas aquí, ver Paso 7) como referencia de no-regresión.

Patrón de mock ya establecido en el proyecto (ver
`tests/unit/salesService.spec.js` y `tests/unit/customerLoyaltyService.spec.js`
como referencia completa):

```js
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((...args) => { /* ... */ }),
  runTransaction: vi.fn(async (_db, callback) => callback(mockTx)),
  // getDoc, setDoc, updateDoc, getDocs, onSnapshot según lo que use la feature
}));
vi.mock('../../src/config/firebaseConfig', () => ({ db: {} }));
```

Ejecuta estos tests contra el código **sin modificar** y confirma que pasan
antes de continuar. Si no pasan, el problema es la caracterización, no el
código — corrige el test, no el código todavía.

## Paso 3 — Mover cada operación a `api/<Feature>Repository.js`

### Lecturas/escrituras puntuales
Mover tal cual, sin cambiar comportamiento. El Repository transforma
`DocumentSnapshot`/`QuerySnapshot` a objetos planos antes de devolver.

### Transacciones — patrón reducer puro
El Repository posee la mecánica de Firestore; el Service decide el nuevo
estado sin conocer el SDK. Patrón real:
`CustomerLoyaltyRepository.runAccountTransaction` (métodos genéricos también
disponibles como ejemplo comentado en
`Prototipe-CLI/templates/feature-scaffold/api/repository.js`):

```js
// Repository
static async runRecordTransaction(tenantId, recordId, reducer) {
  const recordRef = doc(db, `tenants/${tenantId}/<coleccion>`, recordId);
  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(recordRef);
    const current = snap.exists() ? snap.data() : null;
    const updated = reducer(current);
    transaction.set(recordRef, updated);
    return updated;
  });
}

// Service — conserva la regla de negocio, sin importar el SDK
static async updateRecord(tenantId, recordId, changes) {
  return Repository.runRecordTransaction(tenantId, recordId, (current) => {
    // validaciones y reglas de negocio aquí
    return { ...current, ...changes };
  });
}
```

Si el reducer lanza (ej. saldo insuficiente), el throw se propaga igual que
antes — no cambia el comportamiento de errores.

### Listeners — patrón subscribe/unsubscribe
El Repository expone la suscripción; el Hook la consume directo (no vía
Service, salvo que el Service agregue lógica real sobre los datos). Patrón
real: `CustomerLoyaltyRepository.subscribeToAccount`/`subscribeToTransactions`:

```js
// Repository
static subscribeToRecord(tenantId, recordId, onData, onError) {
  const recordRef = doc(db, `tenants/${tenantId}/<coleccion>`, recordId);
  return onSnapshot(
    recordRef,
    (snap) => onData(snap.exists() ? snap.data() : null),
    onError
  );
}

// Hook
useEffect(() => {
  if (!tenantId || !recordId) return;
  const unsubscribe = Repository.subscribeToRecord(tenantId, recordId, setData, (e) => setError(e.message));
  return () => unsubscribe();
}, [tenantId, recordId]);
```

**No** implementes `RealtimeQueryRegistry` — está `DEFERRED_UNTIL_MEASURED_NEED`
(ver `AGENTS.md` §22.2 y `ADR-0001` §13). Un listener por Hook, sin registry
compartido, es el patrón vigente.

## Paso 4 — Limpiar Service y Hook

- El Service **no** importa nada de `firebase/*` ni de `../../../config/firebaseConfig`.
- El Hook **no** construye `doc()`/`query()`/referencias — solo llama al
  Repository (directo para suscripciones) o al Service (para lógica de
  negocio).
- Si el `index.js` de la feature exporta el Repository sin consumidor externo
  demostrado (`grep -r "FeatureRepository" src/` fuera de la propia feature),
  retíralo de la API pública.

## Paso 5 — Ajustar el seam de los tests (no las aserciones de negocio)

Después del refactor, los tests del Paso 2 fallarán porque el mock apuntaba a
`firebase/firestore` directo y ahora el Service llama al Repository. Cambia
el mock a `vi.mock('.../api/<Feature>Repository', ...)` mockeando los nuevos
métodos (`runRecordTransaction`, `subscribeToRecord`), pero **conserva las
mismas aserciones de negocio** (mismos errores esperados, mismos valores).
Si una aserción de negocio cambia, es una regresión — deténte y revisa.
Agrega también tests nuevos del Repository (mockeando `firebase/firestore`)
para los métodos que se movieron ahí.

## Paso 6 — Subir la feature al bloque `error` del guard

En `Plantillas Core/App Ventas/eslint.config.js`, agrega las rutas de la
feature migrada al segundo bloque de `prototipe/no-firebase-outside-repository`
(el que ya lista `hello-module` y `customer-loyalty`). No dupliques el
registro de `plugins` — ESLint no permite redefinir el mismo namespace en dos
bloques; solo agrega las rutas nuevas al array `files` del bloque `error`
existente.

## Paso 7 — Verificación proporcional (no declares terminado sin esto)

1. Tests de la feature (Paso 5) en verde.
2. Suite completa (`npm exec --offline -- vitest run`) sin regresión.
3. `npm exec --offline -- eslint src/features/<feature>/` — cero errores;
   confirma que la feature ya no aparece en `warn` (ahora en `error`, y
   limpia).
4. `npm exec --offline -- vite build` — build de producción exitoso.
5. `git diff --check` sobre los archivos tocados.

## Reglas de negocio (restricciones de esta skill)

- No corrijas bugs preexistentes encontrados durante la migración (ver
  `ADR-0001` §20 para el precedente de `getConfig`/`deleteToken` en
  `customer-loyalty`, relocalizados sin modificar su comportamiento). Si un
  bug preexistente **impide** caracterizar o migrar, detente y pide decisión
  antes de ampliar el alcance.
- No implementes `RealtimeQueryRegistry` (diferido, ver arriba).
- No propagues a `template-ventas` ni a instancias de clientes dentro de esta
  skill — usa `Prototipe-CLI/publish_core_to_template.js` como paso separado
  y posterior.
- No toques `no-restricted-imports` ni el `no-restricted-syntax` existente en
  `eslint.config.js` — solo el bloque `prototipe/no-firebase-outside-repository`.

## Verificación post-ejecución

La feature está migrada cuando: (a) cero archivos de `services/`, `hooks/`,
`components/` importan `firebase/*`; (b) el guard la reporta en `error`, no en
`warn`; (c) los 5 checks del Paso 7 pasan; (d) los tests de caracterización
del Paso 2 siguen demostrando el mismo comportamiento de negocio, ahora contra
el Repository en vez de contra Firebase directo.
