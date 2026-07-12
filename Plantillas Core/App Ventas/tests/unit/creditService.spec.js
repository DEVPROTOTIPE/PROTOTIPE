import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mocks de Firebase
const mockUpdate = vi.fn();
const mockGet = vi.fn();
const mockGetDocs = vi.fn();
const mockOnSnapshot = vi.fn(() => () => {});

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((_db, name) => ({ path: name, id: name })),
    doc: vi.fn((_db, coll, id) => ({ path: `${coll}/${id}`, id })),
    query: vi.fn((...args) => ({ q: args })),
    where: vi.fn((f, op, val) => ({ filter: { f, op, val } })),
    onSnapshot: vi.fn((q, callback, errorCallback) => global.mockOnSnapshot(q, callback, errorCallback)),
    orderBy: vi.fn((f, dir) => ({ order: { f, dir } })),
    limit: vi.fn((n) => ({ limit: n })),
    startAfter: vi.fn((doc) => ({ startAfter: doc })),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    getDocs: vi.fn(async (...args) => global.mockGetDocs(...args)),
    runTransaction: vi.fn(async (_db, callback) => {
      const mockTx = {
        get: mockGet,
        update: mockUpdate,
      };
      return callback(mockTx);
    }),
  };
});

vi.mock('../../src/config/firebaseConfig', () => {
  return {
    db: {},
  };
});

vi.mock('../../src/services/notificationCenterService', () => {
  return {
    createCentralNotification: vi.fn(async () => {}),
    subscribeToAdminNotifications: vi.fn(() => () => {}),
    NC_TYPES: {
      ABONO_RECIBIDO: 'abono_recibido',
    },
  };
});

// Importar servicio bajo prueba
import {
  addPaymentToCredit,
  getCredits,
  getClientCredits,
  subscribeToCredits,
  subscribeToClientCredits,
  getCreditsPaged,
  reportCreditPayment,
  createCreditNotification,
  subscribeToNotifications
} from '../../src/features/credits/services/creditService';

import { createCentralNotification, subscribeToAdminNotifications } from '../../src/services/notificationCenterService';

describe('creditService - Consultas y Listado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.mockGetDocs = mockGetDocs;
    global.mockGet = mockGet;
    global.mockOnSnapshot = mockOnSnapshot;
  });

  test('getCredits - obtiene créditos por estado ordenados por fecha', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { id: 'c1', data: () => ({ estado: 'activo', createdAt: { toMillis: () => 100 } }) },
        { id: 'c2', data: () => ({ estado: 'activo', createdAt: { toMillis: () => 200 } }) }
      ]
    });

    const result = await getCredits('activo');
    expect(result).toHaveLength(2);
    // Orden descendente (c2 con 200 antes de c1 con 100)
    expect(result[0].id).toBe('c2');
  });

  test('getClientCredits - obtiene créditos de cliente ordenados por fecha', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { id: 'c1', data: () => ({ cliente: { celular: '300123' }, createdAt: { toMillis: () => 100 } }) }
      ]
    });

    const result = await getClientCredits('300123');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });

  test('getClientCredits - retorna vacío si no se provee celular', async () => {
    const result = await getClientCredits(null);
    expect(result).toEqual([]);
  });

  test('getCreditsPaged - obtiene página de créditos paginados', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { id: 'c1', data: () => ({ estado: 'activo', createdAt: { toMillis: () => 100 } }) },
        { id: 'c2', data: () => ({ estado: 'activo', createdAt: { toMillis: () => 200 } }) }
      ]
    });

    const result = await getCreditsPaged('activo', 1, null);
    // Solicitamos 1 pero devolvemos 2 mockeados, así que hasNextPage debe ser true
    expect(result.credits).toHaveLength(1);
    expect(result.hasNextPage).toBe(true);
    expect(result.lastDoc.id).toBe('c1');
  });
});

describe('creditService - addPaymentToCredit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Lanza un error si el crédito no existe', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => false,
    });

    await expect(addPaymentToCredit('credit123', { monto: 5000 }))
      .rejects.toThrow('Crédito no encontrado');
  });

  test('Lanza un error si la deuda ya está totalmente pagada', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        estado: 'pagado',
        saldoPendiente: 0,
        montoTotal: 10000,
      }),
    });

    await expect(addPaymentToCredit('credit123', { monto: 5000 }))
      .rejects.toThrow('Esta deuda ya se encuentra totalmente pagada.');
  });

  test('Abono parcial - reduce el saldo pendiente, mantiene el estado activo y registra el abono', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        estado: 'activo',
        saldoPendiente: 15000,
        montoTotal: 20000,
        abonos: [],
        cliente: { celular: '3001234567', nombre: 'Juan' },
        orderId: 'order777',
        orderNumber: 'ORD-1010'
      }),
    });

    await addPaymentToCredit('credit123', { monto: 5000, nota: 'Abono quincenal' });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const updateCall = mockUpdate.mock.calls[0];
    
    expect(updateCall[0].path).toBe('credits/credit123');
    expect(updateCall[1].saldoPendiente).toBe(10000);
    expect(updateCall[1].estado).toBe('activo');
    expect(updateCall[1].abonos).toHaveLength(1);
    expect(updateCall[1].abonos[0].monto).toBe(5000);
    expect(updateCall[1].abonos[0].nota).toBe('Abono quincenal');
  });

  test('Abono total - liquida el saldo, cambia el estado a pagado y completa el pedido original', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        estado: 'activo',
        saldoPendiente: 10000,
        montoTotal: 20000,
        abonos: [{ monto: 10000, fecha: 'fecha-anterior' }],
        cliente: { celular: '3001234567', nombre: 'Juan' },
        orderId: 'order777',
        orderNumber: 'ORD-1010'
      }),
    });

    await addPaymentToCredit('credit123', { monto: 10000, nota: 'Pago final' });

    expect(mockUpdate).toHaveBeenCalledTimes(2);
    
    const creditUpdate = mockUpdate.mock.calls.find(call => call[0].path === 'credits/credit123');
    expect(creditUpdate).toBeDefined();
    expect(creditUpdate[1].saldoPendiente).toBe(0);
    expect(creditUpdate[1].estado).toBe('pagado');
    expect(creditUpdate[1].abonos).toHaveLength(2);

    const orderUpdate = mockUpdate.mock.calls.find(call => call[0].path === 'orders/order777');
    expect(orderUpdate).toBeDefined();
    expect(orderUpdate[1].estado).toBe('completado');
  });
});

describe('creditService - Suscripciones y Reportes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('subscribeToCredits - establece listener en Firestore', () => {
    subscribeToCredits('activo', () => {});
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
  });

  test('subscribeToClientCredits - establece listener de cliente', () => {
    subscribeToClientCredits('300123', () => {});
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
  });

  test('subscribeToClientCredits - retorna cleanup vacío sin celular', () => {
    const unsubscribe = subscribeToClientCredits(null, () => {});
    expect(mockOnSnapshot).not.toHaveBeenCalled();
    expect(unsubscribe).toBeInstanceOf(Function);
  });

  test('reportCreditPayment - crea una notificación central para el administrador', async () => {
    await reportCreditPayment({
      monto: 5000,
      clienteNombre: 'Pepe',
      clienteCelular: '300',
      orderNumber: 'ORD-123',
      orderId: 'id123'
    });
    expect(createCentralNotification).toHaveBeenCalledTimes(1);
  });

  test('createCreditNotification - crea notificación de abono', async () => {
    await createCreditNotification({
      clienteNombre: 'Pepe',
      monto: 3000,
      orderId: 'id123',
      orderNumber: 'ORD-123'
    });
    expect(createCentralNotification).toHaveBeenCalledTimes(1);
  });

  test('subscribeToNotifications - suscribe a notificaciones de admin', () => {
    subscribeToNotifications(() => {});
    expect(subscribeToAdminNotifications).toHaveBeenCalledTimes(1);
  });
});
