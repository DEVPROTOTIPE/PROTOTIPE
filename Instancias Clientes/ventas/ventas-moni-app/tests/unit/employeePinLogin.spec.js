import { describe, test, beforeAll, beforeEach, afterAll } from 'vitest';
import { initializeTestEnvironment, assertFails } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'test-prototipe-rules-moni';

let testEnv;

beforeAll(async () => {
  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: rulesContent,
      host: '127.0.0.1',
      port: 8085,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  if (testEnv) await testEnv.cleanup();
});

// SEC-015: en su momento confirmó que authenticateEmployeeByIdAndPin
// (src/services/employeeService.js) estaba rota en producción (leía
// employees/{id}/secrets/{hash} directamente, pero la regla exigía
// isAdmin(), que un empleado normal nunca tiene). Ya no es esa función la
// que hace login — se reemplazó por Firebase Auth real (ver
// employeeAuthEmulator.spec.js) — pero esta colección de secrets legacy
// debe seguir bloqueada PARA SIEMPRE, sin importar el mecanismo de auth
// vigente. Esta prueba ahora es guardia de regresión de esa colección
// muerta, no diagnóstico de un bug activo.
describe('SEC-015 — employees/{id}/secrets legacy permanece bloqueado (guardia de regresión)', () => {
  test('Un empleado real (sesión anónima, sin rol admin) NO puede leer su propio hash de PIN', async () => {
    const employeeId = 'empleado-real-123';
    const hashedPin = 'a'.repeat(64); // formato válido de hash SHA-256 hex

    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('employees').doc(employeeId).set({
        nombre: 'Empleado de Prueba',
        activo: true,
      });
      await ctx.firestore().collection('employees').doc(employeeId).collection('secrets').doc(hashedPin).set({
        createdAt: new Date(),
      });
    });

    // Esto es EXACTAMENTE lo que hace authenticateEmployeeByIdAndPin: una
    // sesión de cliente (hoy anónima tras SEC-014, antes ni siquiera eso)
    // intenta leer employees/{id}/secrets/{hash} directamente.
    const employeeSession = testEnv.authenticatedContext('empleado-anon-uid').firestore();
    const secretRef = employeeSession
      .collection('employees')
      .doc(employeeId)
      .collection('secrets')
      .doc(hashedPin);

    // Si esto falla (como se espera), authenticateEmployeeByIdAndPin
    // recibe un permission-denied, lo captura en su catch, y devuelve null
    // — exactamente el mismo resultado que "PIN incorrecto". Confirma el
    // bug sospechado: un empleado real, con el PIN correcto, no puede
    // iniciar sesión porque su propia lectura de verificación es denegada.
    await assertFails(secretRef.get());
  });
});
