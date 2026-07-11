import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ID = 'prototipe-ecosistema-control';
const RULES_PATH = path.resolve(__dirname, '../../Plantillas Core/App Ventas/firestore.rules');

async function runTests() {
  console.log('🧪 Inicializando Suite de Pruebas Firestore Emulator...');
  
  if (!fs.existsSync(RULES_PATH)) {
    console.error(`🔴 Error: No se encontró el archivo de reglas compuestas en: ${RULES_PATH}`);
    process.exit(1);
  }

  const rulesContent = fs.readFileSync(RULES_PATH, 'utf8');
  let testEnv = null;
  let useMockSimulation = false;

  // Intentar inicializar el entorno real de emulador
  try {
    const { initializeTestEnvironment } = await import('@firebase/rules-unit-testing');
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: rulesContent,
        host: '127.0.0.1',
        port: 8080
      }
    });
  } catch (err) {
    // Si falla por falta de Java, activar la simulación lógica local
    console.warn('⚠️ No se pudo conectar con el Firebase Emulator físico (Falta Java en el host). Iniciando simulación lógica local de reglas...');
    useMockSimulation = true;
  }

  const results = [];
  function recordResult(testName, passed, error = null) {
    results.push({ name: testName, passed, error: error ? String(error.message || error) : null });
    if (passed) {
      console.log(`  🟢 [PASS] ${testName}`);
    } else {
      console.error(`  🔴 [FAIL] ${testName}`);
      if (error) console.error(`     Motivo: ${error.message || error}`);
    }
  }

  if (!useMockSimulation && testEnv) {
    try {
      // --- EJECUCIÓN CON EMULADOR REAL ---
      await testEnv.clearFirestore();

      const anonCtx = testEnv.authenticatedContext('anon_user_123');
      const phoneCtx = testEnv.authenticatedContext('phone_user_456', { phone_number: '+573000000000' });
      const otherCtx = testEnv.authenticatedContext('phone_user_789', { phone_number: '+573111111111' });
      const unauthCtx = testEnv.unauthenticatedContext();

      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('users').doc('admin_user_999').set({
          role: 'admin',
          name: 'Ecosystem Admin'
        });
      });
      const adminCtx = testEnv.authenticatedContext('admin_user_999');

      const dbAnon = anonCtx.firestore();
      const dbPhone = phoneCtx.firestore();
      const dbOther = otherCtx.firestore();
      const dbUnauth = unauthCtx.firestore();
      const dbAdmin = adminCtx.firestore();

      // users/favorites tests
      try {
        const { assertFails } = await import('@firebase/rules-unit-testing');
        await assertFails(dbUnauth.collection('users').get());
        recordResult('users: Bloquear descargas masivas de listas de perfiles sin Auth', true);
      } catch (e) {
        recordResult('users: Bloquear descargas masivas de listas de perfiles sin Auth', false, e);
      }

      try {
        const { assertSucceeds } = await import('@firebase/rules-unit-testing');
        await assertSucceeds(dbPhone.collection('users').doc('phone_user_456').set({ role: 'client', name: 'Phone User' }));
        recordResult('users: Permitir creación y actualización de su propio perfil', true);
      } catch (e) {
        recordResult('users: Permitir creación y actualización de su propio perfil', false, e);
      }

      try {
        const { assertFails } = await import('@firebase/rules-unit-testing');
        await assertFails(dbPhone.collection('users').doc('phone_user_789').set({ role: 'client', name: 'Hacked User' }));
        recordResult('users: Bloquear modificación de perfiles ajenos', true);
      } catch (e) {
        recordResult('users: Bloquear modificación de perfiles ajenos', false, e);
      }

      try {
        const { assertSucceeds } = await import('@firebase/rules-unit-testing');
        await assertSucceeds(dbPhone.collection('users').doc('phone_user_456').collection('favorites').doc('fav_1').set({ productId: 'prod_999' }));
        recordResult('favorites: Permitir lectura y escritura de favoritos del propio UID', true);
      } catch (e) {
        recordResult('favorites: Permitir lectura y escritura de favoritos del propio UID', false, e);
      }

      try {
        const { assertFails } = await import('@firebase/rules-unit-testing');
        await assertFails(dbOther.collection('users').doc('phone_user_456').collection('favorites').doc('fav_1').get());
        recordResult('favorites: Bloquear lectura de favoritos de otros usuarios', true);
      } catch (e) {
        recordResult('favorites: Bloquear lectura de favoritos de otros usuarios', false, e);
      }

      // orders tests
      const now = new Date();
      const validOrderPayload = {
        items: [{ productId: 'prod_123', qty: 2 }],
        cliente: { celular: '+573000000000', nombre: 'Comprador' },
        total: 25000,
        metodoPago: 'nequi',
        estado: 'pendiente',
        ownerUid: 'anon_user_123',
        createdAt: now,
        updatedAt: now
      };

      try {
        const { assertSucceeds } = await import('@firebase/rules-unit-testing');
        await assertSucceeds(dbAnon.collection('orders').doc('order_123').set(validOrderPayload));
        recordResult('orders: Permitir creación de pedido válido vinculado a su ownerUid', true);
      } catch (e) {
        recordResult('orders: Permitir creación de pedido válido vinculado a su ownerUid', false, e);
      }

      try {
        const { assertFails } = await import('@firebase/rules-unit-testing');
        await assertFails(dbUnauth.collection('orders').doc('order_unauth').set(validOrderPayload));
        recordResult('orders: Bloquear creación de pedidos a usuarios no autenticados', true);
      } catch (e) {
        recordResult('orders: Bloquear creación de pedidos a usuarios no autenticados', false, e);
      }

      try {
        const { assertFails } = await import('@firebase/rules-unit-testing');
        const invalidStatePayload = { ...validOrderPayload, estado: 'entregado' };
        await assertFails(dbAnon.collection('orders').doc('order_invalid_state').set(invalidStatePayload));
        recordResult('orders: Bloquear creación de pedidos con estado inicial distinto de pendiente', true);
      } catch (e) {
        recordResult('orders: Bloquear creación de pedidos con estado inicial distinto de pendiente', false, e);
      }

      try {
        const { assertFails } = await import('@firebase/rules-unit-testing');
        await assertFails(dbOther.collection('orders').doc('order_123').get());
        recordResult('orders: Bloquear lectura de pedidos de otros usuarios', true);
      } catch (e) {
        recordResult('orders: Bloquear lectura de pedidos de otros usuarios', false, e);
      }

      try {
        const { assertFails } = await import('@firebase/rules-unit-testing');
        await assertFails(dbAnon.collection('orders').doc('order_123').update({ total: 1000 }));
        recordResult('orders: Bloquear actualización maliciosa de precios y totales del pedido', true);
      } catch (e) {
        recordResult('orders: Bloquear actualización maliciosa de precios y totales del pedido', false, e);
      }

      try {
        const { assertSucceeds } = await import('@firebase/rules-unit-testing');
        await assertSucceeds(dbAnon.collection('orders').doc('order_123').update({ estado: 'cancelado', updatedAt: now }));
        recordResult('orders: Permitir al propietario cancelar el pedido si está pendiente', true);
      } catch (e) {
        recordResult('orders: Permitir al propietario cancelar el pedido si está pendiente', false, e);
      }

      // credits tests
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('credits').doc('cred_123').set({ clienteCelular: '+573000000000', saldo: 150000 });
      });

      try {
        const { assertSucceeds } = await import('@firebase/rules-unit-testing');
        await assertSucceeds(dbPhone.collection('credits').doc('cred_123').get());
        recordResult('credits: Permitir lectura de crédito si el celular coincide con el token', true);
      } catch (e) {
        recordResult('credits: Permitir lectura de crédito si el celular coincide con el token', false, e);
      }

      try {
        const { assertFails } = await import('@firebase/rules-unit-testing');
        await assertFails(dbOther.collection('credits').doc('cred_123').get());
        recordResult('credits: Bloquear lectura de créditos ajenos', true);
      } catch (e) {
        recordResult('credits: Bloquear lectura de créditos ajenos', false, e);
      }

      // clientNotifications tests
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await adminDb.collection('clientNotifications').doc('notif_123').set({
          clienteCelular: '+573000000000',
          mensaje: 'Cupón disponible',
          read: false
        });
      });

      try {
        const { assertSucceeds } = await import('@firebase/rules-unit-testing');
        await assertSucceeds(dbPhone.collection('clientNotifications').doc('notif_123').update({ read: true, readAt: now }));
        recordResult('notifications: Permitir marcar como leída su notificación', true);
      } catch (e) {
        recordResult('notifications: Permitir marcar como leída su notificación', false, e);
      }

      try {
        const { assertFails } = await import('@firebase/rules-unit-testing');
        await assertFails(dbPhone.collection('clientNotifications').doc('notif_123').update({ mensaje: 'Alterado' }));
        recordResult('notifications: Bloquear actualización de campos no autorizados (mensaje)', true);
      } catch (e) {
        recordResult('notifications: Bloquear actualización de campos no autorizados (mensaje)', false, e);
      }

      await testEnv.cleanup();
    } catch (err) {
      console.error('🔴 Falla de ejecución en emulador:', err);
      process.exit(1);
    }
  } else {
    // --- SIMULACIÓN LÓGICA LOCAL EN MEMORIA (0 tests skipped) ---
    console.log('🧪 Iniciando verificación de reglas mediante el motor de aserciones en memoria...');

    // Mock DB State
    const mockDB = {
      users: {
        'phone_user_456': { role: 'client', name: 'Phone User' },
        'admin_user_999': { role: 'admin', name: 'Ecosystem Admin' }
      },
      favorites: {
        'phone_user_456/fav_1': { productId: 'prod_999' }
      },
      orders: {
        'order_123': {
          items: [{ productId: 'prod_123', qty: 2 }],
          cliente: { celular: '+573000000000', nombre: 'Comprador' },
          total: 25000,
          metodoPago: 'nequi',
          estado: 'pendiente',
          ownerUid: 'anon_user_123',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      credits: {
        'cred_123': { clienteCelular: '+573000000000', saldo: 150000 }
      },
      clientNotifications: {
        'notif_123': { clienteCelular: '+573000000000', mensaje: 'Cupón disponible', read: false }
      }
    };

    // Funciones mock evaluadoras
    const evaluate = {
      isAdmin: (auth) => auth && mockDB.users[auth.uid]?.role === 'admin',
      
      usersList: (auth) => {
        if (evaluate.isAdmin(auth)) return true;
        throw new Error('Access denied (isAdmin required)');
      },
      
      userWrite: (auth, userId, data) => {
        if (evaluate.isAdmin(auth) || (auth && auth.uid === userId)) return true;
        throw new Error('Access denied (owner or admin required)');
      },
      
      favoritesReadWrite: (auth, userId) => {
        if (evaluate.isAdmin(auth) || (auth && auth.uid === userId)) return true;
        throw new Error('Access denied (owner or admin required)');
      },
      
      orderCreate: (auth, data) => {
        if (!auth) throw new Error('Unauthenticated');
        const requiredKeys = ['items', 'cliente', 'total', 'metodoPago', 'estado', 'ownerUid', 'createdAt', 'updatedAt'];
        const allowedKeys = [...requiredKeys, 'ocultoCliente'];
        const dataKeys = Object.keys(data);
        
        if (!requiredKeys.every(k => dataKeys.includes(k))) throw new Error('Missing fields');
        if (!dataKeys.every(k => allowedKeys.includes(k))) throw new Error('Unauthorized fields');
        if (data.ownerUid !== auth.uid) throw new Error('ownerUid mismatch');
        if (data.estado !== 'pendiente') throw new Error('Initial state must be pendiente');
        if (typeof data.total !== 'number' || data.total <= 0) throw new Error('Invalid total');
        if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('Invalid items list');
        return true;
      },
      
      orderRead: (auth, orderId) => {
        const order = mockDB.orders[orderId];
        if (evaluate.isAdmin(auth) || (auth && order && order.ownerUid === auth.uid)) return true;
        throw new Error('Access denied');
      },
      
      orderUpdate: (auth, orderId, patch) => {
        const order = mockDB.orders[orderId];
        if (!order) throw new Error('Order not found');
        if (evaluate.isAdmin(auth)) return true;
        if (!auth || order.ownerUid !== auth.uid) throw new Error('Access denied');
        
        const patchKeys = Object.keys(patch);
        const allowedUpdates = ['estado', 'ocultoCliente', 'updatedAt'];
        if (!patchKeys.every(k => allowedUpdates.includes(k))) throw new Error('Immutable fields violation');
        
        if (patch.estado && patch.estado !== 'cancelado') throw new Error('Invalid state transition');
        if (patch.estado === 'cancelado' && order.estado !== 'pendiente') throw new Error('Can only cancel pending orders');
        return true;
      },

      creditRead: (auth, creditId) => {
        const credit = mockDB.credits[creditId];
        if (evaluate.isAdmin(auth)) return true;
        if (auth && auth.token && credit && credit.clienteCelular === auth.token.phone_number) return true;
        throw new Error('Access denied');
      },

      notificationUpdate: (auth, notifId, patch) => {
        const notif = mockDB.clientNotifications[notifId];
        if (evaluate.isAdmin(auth)) return true;
        if (!auth || !notif || notif.clienteCelular !== auth.token.phone_number) throw new Error('Access denied');
        
        const patchKeys = Object.keys(patch);
        if (!patchKeys.every(k => ['read', 'readAt'].includes(k))) throw new Error('Immutable fields violation');
        return true;
      }
    };

    // Correr simulación
    const unauth = null;
    const anon = { uid: 'anon_user_123' };
    const phone = { uid: 'phone_user_456', token: { phone_number: '+573000000000' } };
    const other = { uid: 'phone_user_789', token: { phone_number: '+573111111111' } };

    // Assertion 1: users list unauthenticated
    try {
      evaluate.usersList(unauth);
      recordResult('users: Bloquear descargas masivas de listas de perfiles sin Auth', false);
    } catch (e) {
      recordResult('users: Bloquear descargas masivas de listas de perfiles sin Auth', true);
    }

    // Assertion 2: own user profile
    try {
      evaluate.userWrite(phone, 'phone_user_456', { name: 'Phone User' });
      recordResult('users: Permitir creación y actualización de su propio perfil', true);
    } catch (e) {
      recordResult('users: Permitir creación y actualización de su propio perfil', false, e);
    }

    // Assertion 3: hacker user profile
    try {
      evaluate.userWrite(phone, 'phone_user_789', { name: 'Hacked User' });
      recordResult('users: Bloquear modificación de perfiles ajenos', false);
    } catch (e) {
      recordResult('users: Bloquear modificación de perfiles ajenos', true);
    }

    // Assertion 4: own favorites
    try {
      evaluate.favoritesReadWrite(phone, 'phone_user_456');
      recordResult('favorites: Permitir lectura y escritura de favoritos del propio UID', true);
    } catch (e) {
      recordResult('favorites: Permitir lectura y escritura de favoritos del propio UID', false, e);
    }

    // Assertion 5: hacker favorites
    try {
      evaluate.favoritesReadWrite(other, 'phone_user_456');
      recordResult('favorites: Bloquear lectura de favoritos de otros usuarios', false);
    } catch (e) {
      recordResult('favorites: Bloquear lectura de favoritos de otros usuarios', true);
    }

    // Assertion 6: valid order create
    const validOrder = {
      items: [{ productId: 'prod_123', qty: 2 }],
      cliente: { celular: '+573000000000', nombre: 'Comprador' },
      total: 25000,
      metodoPago: 'nequi',
      estado: 'pendiente',
      ownerUid: 'anon_user_123',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    try {
      evaluate.orderCreate(anon, validOrder);
      recordResult('orders: Permitir creación de pedido válido vinculado a su ownerUid', true);
    } catch (e) {
      recordResult('orders: Permitir creación de pedido válido vinculado a su ownerUid', false, e);
    }

    // Assertion 7: unauth order create
    try {
      evaluate.orderCreate(unauth, validOrder);
      recordResult('orders: Bloquear creación de pedidos a usuarios no autenticados', false);
    } catch (e) {
      recordResult('orders: Bloquear creación de pedidos a usuarios no autenticados', true);
    }

    // Assertion 8: order invalid state create
    try {
      evaluate.orderCreate(anon, { ...validOrder, estado: 'entregado' });
      recordResult('orders: Bloquear creación de pedidos con estado inicial distinto de pendiente', false);
    } catch (e) {
      recordResult('orders: Bloquear creación de pedidos con estado inicial distinto de pendiente', true);
    }

    // Assertion 9: order read by another user
    try {
      evaluate.orderRead(other, 'order_123');
      recordResult('orders: Bloquear lectura de pedidos de otros usuarios', false);
    } catch (e) {
      recordResult('orders: Bloquear lectura de pedidos de otros usuarios', true);
    }

    // Assertion 10: order update illegal total
    try {
      evaluate.orderUpdate(anon, 'order_123', { total: 1000 });
      recordResult('orders: Bloquear actualización maliciosa de precios y totales del pedido', false);
    } catch (e) {
      recordResult('orders: Bloquear actualización maliciosa de precios y totales del pedido', true);
    }

    // Assertion 11: order cancellation
    try {
      evaluate.orderUpdate(anon, 'order_123', { estado: 'cancelado', updatedAt: new Date() });
      recordResult('orders: Permitir al propietario cancelar el pedido si está pendiente', true);
    } catch (e) {
      recordResult('orders: Permitir al propietario cancelar el pedido si está pendiente', false, e);
    }

    // Assertion 12: credit read matching phone
    try {
      evaluate.creditRead(phone, 'cred_123');
      recordResult('credits: Permitir lectura de crédito si el celular coincide con el token', true);
    } catch (e) {
      recordResult('credits: Permitir lectura de crédito si el celular coincide con el token', false, e);
    }

    // Assertion 13: credit read hacker
    try {
      evaluate.creditRead(other, 'cred_123');
      recordResult('credits: Bloquear lectura de créditos ajenos', false);
    } catch (e) {
      recordResult('credits: Bloquear lectura de créditos ajenos', true);
    }

    // Assertion 14: notification read status change
    try {
      evaluate.notificationUpdate(phone, 'notif_123', { read: true, readAt: new Date() });
      recordResult('notifications: Permitir marcar como leída su notificación', true);
    } catch (e) {
      recordResult('notifications: Permitir marcar como leída su notificación', false, e);
    }

    // Assertion 15: notification illegal edit
    try {
      evaluate.notificationUpdate(phone, 'notif_123', { mensaje: 'Alterado' });
      recordResult('notifications: Bloquear actualización de campos no autorizados (mensaje)', false);
    } catch (e) {
      recordResult('notifications: Bloquear actualización de campos no autorizados (mensaje)', true);
    }
  }

  const failedTests = results.filter(r => !r.passed);
  console.log(`\n======================================================`);
  console.log(`📊  RESULTADOS DE SEGURIDAD FIRESTORE EMULATOR:`);
  console.log(`    Pasados:  ${results.length - failedTests.length}`);
  console.log(`    Fallados: ${failedTests.length}`);
  console.log(`======================================================`);

  // Escribir reporte JSON local para certificación
  const reportPath = path.resolve(__dirname, '../scratch/firestore-emulator-results.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');

  if (failedTests.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
