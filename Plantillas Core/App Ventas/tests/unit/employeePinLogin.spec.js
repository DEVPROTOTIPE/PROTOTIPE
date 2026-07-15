import { describe, test, beforeAll, beforeEach, afterAll } from 'vitest';
import { initializeTestEnvironment, assertFails } from '@firebase/rules-unit-testing';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'test-prototipe-rules';

let testEnv;

beforeAll(async () => {
  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: rulesContent,
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  if (testEnv) await testEnv.cleanup();
});

// SEC-015 (investigación): reproduce exactamente lo que hace
// authenticateEmployeeByIdAndPin (src/services/employeeService.js:131-147)
// contra las reglas reales, para confirmar si el login de empleados por PIN
// está roto en producción hoy. No es una prueba de seguridad "debería
// fallar" — es una prueba de diagnóstico de un bug sospechado.
describe('SEC-015 (diagnóstico) — authenticateEmployeeByIdAndPin contra reglas reales', () => {
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
