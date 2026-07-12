/**
 * test_lifecycle_observability.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Suite de pruebas RED — Fase P0.4: Lifecycle & Observability
 *
 * Metodología: análisis estático de código fuente.
 * Ningún archivo productivo es modificado.
 * Cada prueba verifica la AUSENCIA de un mecanismo de protección.
 * Si el mecanismo no existe → PRODUCT_BEHAVIOR_FAILURE (estado esperado en RED).
 * Si el mecanismo ya existe → PASSED (vulnerabilidad previamente mitigada).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const CLI_ROOT   = path.resolve(__dirname, '../../..');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Carga un archivo fuente como string para análisis estático.
 * @param {string} relPath Ruta relativa al CLI_ROOT
 */
async function readSource(relPath) {
  const fullPath = path.join(CLI_ROOT, relPath);
  return readFile(fullPath, 'utf-8');
}

/**
 * Construye un objeto de resultado estándar.
 * @param {boolean} passed    true si el mecanismo protector ya existe (vulnerabilidad mitigada)
 * @param {string}  id        ID del hallazgo (ej. 'P04-01')
 * @param {string}  name      Nombre corto del test
 * @param {string}  message   Detalle del hallazgo
 * @param {string}  [type]    Tipo de resultado (por defecto PRODUCT_BEHAVIOR_FAILURE)
 */
function makeResult(passed, id, name, message, type = 'PRODUCT_BEHAVIOR_FAILURE') {
  return { passed, id, name, message, type: passed ? 'PASSED' : type };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 1 — P04-01: Lock de concurrencia volátil en memoria
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * El lock de concurrencia DEBE sobrevivir un reinicio del proceso.
 * El mecanismo correcto es un archivo de lock (file-based) con PID + timestamp.
 * Actualmente projectSyncLocks es un objeto JS plano en RAM → PRODUCT_BEHAVIOR_FAILURE
 */
export async function testVolatileConcurrencyLock() {
  const src = await readSource('server.js');

  // Confirmar que el lock es un objeto JS plano en memoria
  const isPlainInMemory = /const\s+projectSyncLocks\s*=\s*\{\s*\}/.test(src);

  // Verificar ausencia de mecanismo file-based persistente
  const hasFileLock = /ProvisioningStateManager\.acquireLock/i.test(src);

  if (isPlainInMemory && !hasFileLock) {
    return makeResult(false, 'P04-01', 'Lock de concurrencia volátil en memoria',
      'projectSyncLocks = {} es un objeto JS puro en RAM. ' +
      'Un reinicio del servidor entre peticiones destruye el lock. ' +
      'No existe mecanismo de lock basado en archivo (file-based) con PID + timestamp. ' +
      'Dos instancias del servidor pueden aprovisionar el mismo clientId en paralelo.'
    );
  }

  return makeResult(true, 'P04-01', 'Lock de concurrencia file-based detectado',
    'ProvisioningStateManager o mecanismo file-based detectado en server.js. Vulnerabilidad mitigada.'
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 2 — P04-02: Ausencia de lifecycle persistente
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Los estados de tarea (pending/provisioning/completed/failed/rollback)
 * deben persistirse en disco para sobrevivir reinicios del servidor.
 * Actualmente activeCreationTasks es un objeto JS plano en RAM → PRODUCT_BEHAVIOR_FAILURE
 */
export async function testNoLifecyclePersistence() {
  const src = await readSource('server.js');

  // Confirmar que activeCreationTasks es un objeto plano sin persistencia
  const isPlainInMemory = /const\s+activeCreationTasks\s*=\s*\{\s*\}/.test(src);

  // Buscar persistencia de estado en disco
  const hasDiskPersistence = /ProvisioningStateManager\.(?:transitionTo|createState|writeState)/i.test(src);

  // Buscar estados de lifecycle semánticos
  const hasSemanticStates = /status.*['"](pending|provisioning|completed|rollback)['"]|PROVISIONING_STATE\.(PENDING|PROVISIONING|COMPLETED|ROLLBACK)/i.test(src);

  if (isPlainInMemory && !hasDiskPersistence && !hasSemanticStates) {
    return makeResult(false, 'P04-02', 'Lifecycle de aprovisionamiento sin persistencia',
      'activeCreationTasks = {} vive exclusivamente en RAM. ' +
      'No existe ProvisioningStateManager ni escritura de estados en disco. ' +
      'Los estados pending/provisioning/completed/failed/rollback no están definidos. ' +
      'Un reinicio del servidor mid-provisioning borra todo historial y deja la instancia huérfana.'
    );
  }

  return makeResult(true, 'P04-02', 'Lifecycle persistente detectado',
    'ProvisioningStateManager con estados en disco detectado. Vulnerabilidad mitigada.'
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 3 — P04-03a: Rollback correcto para directorio nuevo (!existedBefore)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * COMPORTAMIENTO CORRECTO: si el provisioning falla sobre un directorio nuevo
 * (existedBefore=false), el directorio debe eliminarse para dejar el sistema limpio.
 * Este test DEBE pasar (mecanismo ya existe) y documenta el comportamiento correcto.
 */
export async function testRollbackNewDirectory() {
  const src = await readSource('generator.js');

  // Verificar rollback de directorio nuevo en el catch
  const hasCorrectRollback = /if\s*\(!existedBefore\)[\s\S]{0,400}fs\.remove\s*\(\s*targetDir\s*\)/.test(src);

  if (hasCorrectRollback) {
    return makeResult(true, 'P04-03a', 'Rollback de directorio nuevo — COMPORTAMIENTO CORRECTO',
      'El catch de createProject verifica !existedBefore antes de ejecutar fs.remove(targetDir). ' +
      'El rollback funciona correctamente para directorios nuevos. Este comportamiento debe preservarse.',
      'CORRECT_BEHAVIOR'
    );
  }

  return makeResult(false, 'P04-03a', 'Rollback de directorio nuevo AUSENTE',
    'No se encontró el bloque !existedBefore → fs.remove(targetDir) en el catch de createProject. ' +
    'Regresión crítica: el mecanismo de rollback para directorios nuevos fue eliminado.'
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 4 — P04-03b: Rollback incompleto en re-provisión (existedBefore=true)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Cuando el directorio YA existía (existedBefore=true), el rollback no actúa.
 * Archivos parciales (node_modules incompleto, .git a medias) quedan en disco.
 * No existe limpieza condicional para este caso → PRODUCT_BEHAVIOR_FAILURE
 */
export async function testRollbackExistingDirectory() {
  const src = await readSource('generator.js');

  // Buscar limpieza específica cuando existedBefore=true en el bloque catch
  const hasExistingDirCleanup =
    /existedBefore[\s\S]{0,800}(?:node_modules|\.git)[\s\S]{0,400}(?:remove|unlink)/i.test(src) ||
    /existedBefore\s*===\s*true[\s\S]{0,400}(?:remove|cleanup|git)/i.test(src);

  if (!hasExistingDirCleanup) {
    return makeResult(false, 'P04-03b', 'Sin rollback para re-provisión (existedBefore=true)',
      'El catch de createProject no limpia artefactos parciales cuando existedBefore=true. ' +
      'Una re-provisión fallida deja node_modules incompleto o .git/ a medias en el directorio. ' +
      'El sistema queda en estado inconsistente sin posibilidad de recuperación automática.'
    );
  }

  return makeResult(true, 'P04-03b', 'Rollback de re-provisión detectado',
    'Limpieza condicional para existedBefore=true detectada. Vulnerabilidad mitigada.'
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 5 — P04-03c: Rollback de recursos Firebase cloud incompleto
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Cuando Firebase Auto crea proyecto + Firestore + WebApp pero el worker falla,
 * no existe tracking ni cleanup de esos recursos en la nube → PRODUCT_BEHAVIOR_FAILURE
 */
export async function testFirebaseCloudRollback() {
  const src = await readSource('server.js');

  // Aislar la función executeCreationTaskInBackground
  const funcIdx = src.indexOf('async function executeCreationTaskInBackground');
  if (funcIdx === -1) {
    return makeResult(false, 'P04-03c', 'executeCreationTaskInBackground no localizada',
      'La función executeCreationTaskInBackground no fue encontrada en server.js.'
    );
  }

  // Extraer bloque de ~5000 chars (suficiente para cubrir toda la función)
  const funcBlock = src.substring(funcIdx, funcIdx + 5000);

  // Verificar si el catch registra o limpia recursos Firebase creados
  const hasFbCleanupOrTracking =
    /firebase.*delete|projects:delete|cloudResources(?:Created|Pending)|ProvisioningStateManager.*(?:fail|rollback)|rollbackCloud/i.test(funcBlock);

  if (!hasFbCleanupOrTracking) {
    return makeResult(false, 'P04-03c', 'Rollback de recursos Firebase cloud ausente',
      'El catch de executeCreationTaskInBackground no registra ni limpia los recursos Firebase ' +
      '(proyecto, Firestore, WebApp) creados antes de que fallara el worker. ' +
      'Si Firebase Auto crea el proyecto y el worker falla luego, esos recursos quedan huérfanos en la nube. ' +
      'El próximo intento absorbe el error 409 de ALREADY_EXISTS pero no hay auditoría del estado cloud.'
    );
  }

  return makeResult(true, 'P04-03c', 'Tracking/rollback de recursos Firebase detectado',
    'Mecanismo de tracking o limpieza de recursos cloud detectado. Vulnerabilidad mitigada.'
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 6 — P04-05: temp_uploads sin limpieza post-aprovisionamiento
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * El archivo de logo copiado desde temp_uploads debe eliminarse después del aprovisionamiento.
 * No existe ninguna operación fs.remove(answers.logoPath) en generator ni worker → PRODUCT_BEHAVIOR_FAILURE
 */
export async function testTempUploadsNotCleaned() {
  const generatorSrc = await readSource('generator.js');
  const workerSrc    = await readSource('worker_create_project.js');

  // Buscar limpieza del logoPath en generator
  const generatorCleansLogo =
    /fs\.remove\s*\(\s*(?:answers\.)?logoPath\s*\)|fs\.unlink\s*\(\s*(?:answers\.)?logoPath|temp_uploads.*remove|remove.*temp_uploads/i.test(generatorSrc);

  // Buscar limpieza del logoPath en worker
  const workerCleansLogo =
    /fs\.remove\s*\(\s*(?:answers\.)?logoPath\s*\)|fs\.unlink\s*\(\s*(?:answers\.)?logoPath|temp_uploads.*remove/i.test(workerSrc);

  if (!generatorCleansLogo && !workerCleansLogo) {
    return makeResult(false, 'P04-05', 'temp_uploads sin limpieza post-aprovisionamiento',
      'Ni generator.js ni worker_create_project.js ejecutan fs.remove(answers.logoPath) ' +
      'en ningún bloque finally o post-copia. Los archivos de logo cargados vía /api/upload-logo ' +
      'se acumulan indefinidamente en temp_uploads/. ' +
      'Con nombres predecibles (path.basename), esto también supone un vector de acumulación de datos.'
    );
  }

  return makeResult(true, 'P04-05', 'Limpieza de temp_uploads detectada',
    'fs.remove(logoPath) detectado en generator.js o worker. Vulnerabilidad mitigada.'
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 7 — P04-06: Extensión de archivo no validada antes de guardar
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * El endpoint /api/upload-logo debe rechazar extensiones no permitidas ANTES de guardar.
 * Actualmente path.basename(filename) previene traversal pero no valida extensión → PRODUCT_BEHAVIOR_FAILURE
 */
export async function testUploadExtensionNotValidated() {
  const src = await readSource('server.js');

  // Aislar el bloque del endpoint upload-logo
  const uploadIdx = src.indexOf("'/api/upload-logo'");
  if (uploadIdx === -1) {
    return makeResult(false, 'P04-06', 'Endpoint /api/upload-logo no encontrado',
      'No se localizó el endpoint /api/upload-logo en server.js.'
    );
  }

  // Extraer los ~1200 chars del endpoint (antes del cierre del handler)
  const uploadBlock = src.substring(uploadIdx, uploadIdx + 1200);

  // Buscar whitelist de extensión ANTES de fs.writeFile
  const writeFileIdx   = uploadBlock.indexOf('writeFile');
  const extCheckBefore = writeFileIdx !== -1
    ? /validExtensions|allowedExt|\.includes.*\.(svg|png|jpg|jpeg|webp)|ext.*whitelist/i.test(uploadBlock.substring(0, writeFileIdx))
    : false;

  if (!extCheckBefore) {
    return makeResult(false, 'P04-06', 'Extensión de archivo no validada antes de guardar',
      'El endpoint /api/upload-logo ejecuta fs.writeFile() antes de validar la extensión del archivo. ' +
      'path.basename(filename) solo previene directory traversal. ' +
      'Extensiones como .exe, .sh, .php, .bat pueden ser subidas y quedan guardadas en temp_uploads/ sin restricción.'
    );
  }

  return makeResult(true, 'P04-06', 'Validación de extensión pre-guardado detectada',
    'Whitelist de extensión verificada antes de fs.writeFile en /api/upload-logo. Vulnerabilidad mitigada.'
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 8 — P04-07: adminPassword expuesto en el objeto result de createProject
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * El resultado de createProject NO debe exponer adminPassword en plaintext.
 * Actualmente el return incluye `adminPassword` como propiedad directa → PRODUCT_BEHAVIOR_FAILURE
 */
export async function testAdminPasswordExposedInResult() {
  const src = await readSource('generator.js');

  // Buscar el comentario identificativo del campo en el return de createProject
  // Línea conocida: adminPassword, // Exponer para que el wizard lo muestre al usuario al finalizar
  const hasRawPasswordInReturn =
    /adminPassword\s*,?\s*\/\/\s*Exponer/.test(src) ||
    /return\s*\{[\s\S]{0,1500}adminPassword(?!Set|Hash|IsSet|Exists)\s*[,}]/.test(src);

  if (hasRawPasswordInReturn) {
    return makeResult(false, 'P04-07', 'adminPassword expuesto en resultado de createProject',
      'El objeto retornado por createProject incluye adminPassword en plaintext. ' +
      'Si este objeto se serializa en logs SSE, en el canal IPC o en la respuesta HTTP, ' +
      'la contraseña de administrador queda comprometida. ' +
      'Debe retornarse solo un flag: adminPasswordSet: true.'
    );
  }

  return makeResult(true, 'P04-07', 'adminPassword no expuesto en result',
    'adminPassword no detectado como propiedad directa en el return de createProject. Vulnerabilidad mitigada.'
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 9 — P04-08: taskId no propagado al generator
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * El taskId de la tarea debe propagarse a answers (__taskId) para que el generator
 * pueda prefijarlo en sus logs y hacerlos correlacionables con el Dashboard.
 * Actualmente no existe esta propagación → PRODUCT_BEHAVIOR_FAILURE
 */
export async function testTaskIdNotPropagated() {
  const serverSrc    = await readSource('server.js');
  const generatorSrc = await readSource('generator.js');

  // Buscar propagación de taskId a answers en executeCreationTaskInBackground
  const funcIdx = serverSrc.indexOf('async function executeCreationTaskInBackground');
  const funcBlock = funcIdx !== -1 ? serverSrc.substring(funcIdx, funcIdx + 4000) : '';
  const serverPropagates = /answers\.__taskId|answers\[['"]__taskId['"]\]|answers\.taskId\s*=\s*taskId/i.test(funcBlock);

  // Verificar uso de __taskId en generator
  const generatorUsesTaskId = /__taskId|answers\.__taskId/.test(generatorSrc);

  if (!serverPropagates && !generatorUsesTaskId) {
    return makeResult(false, 'P04-08', 'taskId no propagado al generator',
      'executeCreationTaskInBackground no añade taskId a answers antes de llamar al worker. ' +
      'generator.js tampoco lee o utiliza un campo __taskId. ' +
      'Los logs del proceso de generación física son opacas y no correlacionables con el ' +
      'taskId visible en el Dashboard. Imposible trazar un aprovisionamiento end-to-end.'
    );
  }

  return makeResult(true, 'P04-08', 'Propagación de taskId al generator detectada',
    'answers.__taskId o lectura de __taskId en generator detectados. Vulnerabilidad mitigada.'
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 10 — P04-09: TTL de limpieza de tareas hardcoded
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * El TTL de limpieza de tareas en memoria debe ser configurable vía env.
 * Actualmente está hardcoded a 1800000ms (30 min) sin variable de entorno → PRODUCT_BEHAVIOR_FAILURE
 */
export async function testTtlHardcoded() {
  const src = await readSource('server.js');

  // Detectar el valor hardcoded en registerTaskCleanup
  const hasHardcoded = /setTimeout\s*\([^)]*1800000[^)]*\)|setTimeout[\s\S]{0,200}1800000/m.test(src);

  // Verificar si existe configuración por env variable
  const hasEnvTtl = /TASK_CLEANUP_TTL_MS|TASK_TTL_MS|CLEANUP_TTL/i.test(src);

  if (hasHardcoded && !hasEnvTtl) {
    return makeResult(false, 'P04-09', 'TTL de limpieza de tareas hardcoded a 30 minutos',
      'registerTaskCleanup usa setTimeout con 1800000ms (30 min) hardcoded sin variable de entorno. ' +
      'Proyectos con npm install lento o conexión débil tardan más de 30 min. ' +
      'La tarea se purga de memoria antes de completarse, haciendo imposible la reconexión SSE. ' +
      'Debe leerse process.env.TASK_CLEANUP_TTL_MS con fallback a 1800000.'
    );
  }

  return makeResult(true, 'P04-09', 'TTL configurable vía env',
    'TASK_CLEANUP_TTL_MS o equivalente detectado. Vulnerabilidad mitigada.'
  );
}
