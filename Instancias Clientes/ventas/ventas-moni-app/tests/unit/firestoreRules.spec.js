import { describe, test, beforeAll, beforeEach, afterAll } from 'vitest';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
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

// SEC-012 — suite de ataques contra firestore.rules (Plantillas Core / App Ventas).
// Cada test documenta el hallazgo verificado en analisis_seguridad_firestore.md.
// Varios de estos tests FALLAN hoy a propósito (rojo): prueban que la regla
// vigente permite el ataque. Pasarán (verde) cuando SEC-013/SEC-016 cierren
// la brecha correspondiente — no se corrige la regla en esta tarea.

describe('SEC-012 — Escalada de privilegios vía isFirstStart (foco SEC-013)', () => {
  test('Un usuario anónimo NO debe poder crearse como admin cuando config/settings no existe', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    const action = anon.collection('users').doc('atacante-uid').set({
      role: 'admin',
      activo: true,
    });
    await assertFails(action);
  });

  test('Un usuario anónimo NO debe poder escribir config/settings cuando la base está vacía', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    const action = anon.collection('config').doc('settings').set({
      maliciousFlag: true,
    });
    await assertFails(action);
  });
});

describe('SEC-012 — Deny-by-default en colecciones mutables (foco SEC-016)', () => {
  test('Un usuario anónimo NO debe poder crear un stockMovement (sabotaje de inventario)', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    const action = anon.collection('stockMovements').doc('fake-movement').set({
      productoId: 'prod-123',
      cantidad: -100,
      tipo: 'ajuste_manual',
    });
    await assertFails(action);
  });

  test('Un usuario anónimo NO debe poder crear una notificación falsa', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    const action = anon.collection('notifications').doc('fake-notif').set({
      recipientRole: 'client',
      title: 'Cuenta suspendida',
    });
    await assertFails(action);
  });

  test('Un usuario anónimo NO debe poder crear una wholesaleOrder arbitraria', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    const action = anon.collection('wholesaleOrders').doc('fake-wholesale').set({
      empresa: 'Falsa SAS',
    });
    await assertFails(action);
  });
});

describe('SEC-012 — Lectura pública de datos transaccionales (foco SEC-012/SEC-014)', () => {
  test('Un usuario anónimo NO debe poder leer wholesaleOrders ajenas', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('wholesaleOrders').doc('real-order').set({ empresa: 'Cliente Real SAS' });
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(anon.collection('wholesaleOrders').doc('real-order').get());
  });

  test('Un usuario anónimo NO debe poder leer credits (fiados) ajenos', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('credits').doc('cliente-real').set({ saldo: 500000 });
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(anon.collection('credits').doc('cliente-real').get());
  });

  test('Un usuario anónimo NO debe poder leer orders (pedidos) ajenos', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('orders').doc('pedido-real').set({ telefono: '3000000000' });
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(anon.collection('orders').doc('pedido-real').get());
  });
});

describe('SEC-012 — Aislamiento entre usuarios en subcolecciones (foco SEC-014)', () => {
  test('Un cliente NO debe poder leer los favoritos de otro cliente', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc('user-target').collection('favorites').doc('fav-1').set({
        productId: 'prod-abc',
      });
    });
    const otherClient = testEnv.authenticatedContext('user-legit').firestore();
    const targetFavRef = otherClient.collection('users').doc('user-target').collection('favorites').doc('fav-1');
    await assertFails(targetFavRef.get());
  });

  test('Un cliente NO debe poder escribir en los favoritos de otro cliente', async () => {
    const otherClient = testEnv.authenticatedContext('user-legit').firestore();
    const targetFavRef = otherClient.collection('users').doc('user-target').collection('favorites').doc('fav-1');
    await assertFails(targetFavRef.set({ productId: 'prod-abc' }));
  });

  test('Un cliente autenticado SÍ debe poder leer y escribir sus propios favoritos', async () => {
    const clientUid = 'client-user-id';
    // SEC-014: favorites valida ownerUid del documento padre users/{uid},
    // no una comparación directa de uid == doc id (en producción ese id es
    // el celular, no el uid) — sembramos el padre con ownerUid == clientUid
    // para probar el mecanismo real, no una coincidencia de string.
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc(clientUid).set({
        role: 'client',
        ownerUid: clientUid,
      });
    });
    const clientDb = testEnv.authenticatedContext(clientUid).firestore();
    const favRef = clientDb.collection('users').doc(clientUid).collection('favorites').doc('fav-1');
    await assertSucceeds(favRef.set({ productId: 'prod-abc' }));
    await assertSucceeds(favRef.get());
  });
});

// SEC-012 (completado 2026-07-15): claims, clientNotifications y fcmTokens
// quedaron fuera del alcance original de esta suite (CORE-349) — su
// vulnerabilidad se descubrió después, completando el alcance que el
// ticket SEC-012 siempre declaró ("productos, tokens, notificaciones...").
describe('SEC-012 — claims, clientNotifications y fcmTokens (completado)', () => {
  test('Un usuario anónimo NO debe poder crear un reclamo (claims)', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(anon.collection('claims').doc('fake-claim').set({ clientCelular: '3000000000' }));
  });

  test('Un cliente NO debe poder leer el reclamo de otro cliente', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc('3000000000').set({ role: 'client', ownerUid: 'owner-uid-real' });
      await ctx.firestore().collection('claims').doc('claim-1').set({ clientCelular: '3000000000' });
    });
    const otherClient = testEnv.authenticatedContext('otro-cliente-uid').firestore();
    await assertFails(otherClient.collection('claims').doc('claim-1').get());
  });

  test('El dueño del reclamo SÍ puede leerlo', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('users').doc('3000000001').set({ role: 'client', ownerUid: 'owner-uid-real-2' });
      await ctx.firestore().collection('claims').doc('claim-2').set({ clientCelular: '3000000001' });
    });
    const owner = testEnv.authenticatedContext('owner-uid-real-2').firestore();
    await assertSucceeds(owner.collection('claims').doc('claim-2').get());
  });

  test('Un usuario anónimo NO debe poder crear una notificación de cliente (clientNotifications)', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      anon.collection('clientNotifications').doc('fake-notif').set({ clienteCelular: '3000000002', message: 'hola' })
    );
  });

  test('Un usuario anónimo NO debe poder registrar/pisar un token FCM', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(anon.collection('fcmTokens').doc('fake-token').set({ userId: 'victima', token: 'xyz' }));
  });
});
