import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mocks de Firebase
const mockGet = vi.fn();
const mockUpdate = vi.fn();
const mockSet = vi.fn();

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((_db, name) => ({ path: name, id: name })),
    doc: vi.fn((...args) => {
      // doc(collectionRef)
      if (args.length === 1) {
        const coll = args[0];
        const randomId = 'mock_doc_id';
        return { path: `${coll.path}/${randomId}`, id: randomId };
      }
      // doc(db, collName, id)
      if (args.length === 3) {
        const [_, collName, id] = args;
        return { path: `${collName}/${id}`, id };
      }
      return { path: 'fallback/id', id: 'id' };
    }),
    runTransaction: vi.fn(async (_db, callback) => {
      const mockTx = {
        get: mockGet,
        update: mockUpdate,
        set: mockSet,
      };
      return callback(mockTx);
    }),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
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
    NC_TYPES: {
      STOCK_BAJO: 'stock_bajo',
      PEDIDO_RECIBIDO: 'pedido_recibido',
    },
  };
});

// Mock de offlineDB
const mockGetOfflineSales = vi.fn();
const mockRemoveOfflineSale = vi.fn();

vi.mock('../../src/services/offlineDB', () => {
  return {
    getOfflineSales: () => mockGetOfflineSales(),
    removeOfflineSale: (id) => mockRemoveOfflineSale(id),
  };
});

// Importar servicio bajo prueba
import { createPhysicalOrder, syncOfflineSales } from '../../src/features/sales/services/salesService';
import { ORDER_STATES, PAYMENT_METHODS } from '../../src/constants';

describe('salesService - createPhysicalOrder (Venta POS)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock behavior for transaction.get
    mockGet.mockResolvedValue({
      exists: () => false
    });
  });

  test('Lanza error si un producto no existe en el catálogo', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => false
    });

    const orderData = {
      items: [
        { productId: 'nonexistent', nombre: 'Zapato', cantidad: 1, variantId: 'v1' }
      ],
      total: 50000,
      metodoPago: PAYMENT_METHODS.CASH
    };

    await expect(createPhysicalOrder(orderData, 'admin123'))
      .rejects.toThrow('Producto no encontrado: Zapato');
  });

  test('Lanza error si el stock es insuficiente (flujo online)', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        nombre: 'Zapato',
        variantes: [{ id: 'v1', stock: 1, talla: '38' }]
      })
    });

    const orderData = {
      items: [
        { productId: 'prod1', nombre: 'Zapato', cantidad: 5, variantId: 'v1' }
      ],
      total: 50000,
      metodoPago: PAYMENT_METHODS.CASH
    };

    await expect(createPhysicalOrder(orderData, 'admin123'))
      .rejects.toThrow('Stock insuficiente para "Zapato (38)"');
  });

  test('Registra el pedido como completado si hay stock e incrementa salesCount', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        nombre: 'Zapato',
        variantes: [{ id: 'v1', stock: 10, talla: '38' }],
        salesCount: 2
      })
    });

    const orderData = {
      items: [
        { productId: 'prod1', nombre: 'Zapato', cantidad: 3, variantId: 'v1' }
      ],
      total: 50000,
      metodoPago: PAYMENT_METHODS.CASH,
      cliente: { nombre: 'Cliente Pos', celular: '3001234567' }
    };

    const result = await createPhysicalOrder(orderData, 'admin123');

    expect(result.id).toBeDefined();
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledTimes(1);

    const setCall = mockSet.mock.calls[0];
    expect(setCall[1].estado).toBe(ORDER_STATES.COMPLETED);
    expect(setCall[1].stockDescontado).toBe(true);
  });

  test('Crea un crédito si el método de pago es Crédito/Fiado', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        nombre: 'Zapato',
        variantes: [{ id: 'v1', stock: 10, talla: '38' }],
        salesCount: 2
      })
    });

    const orderData = {
      items: [
        { productId: 'prod1', nombre: 'Zapato', cantidad: 2, variantId: 'v1' }
      ],
      total: 50000,
      metodoPago: PAYMENT_METHODS.CREDIT,
      cliente: { nombre: 'Cliente Deudor', celular: '3009998877' }
    };

    await createPhysicalOrder(orderData, 'admin123');

    expect(mockSet).toHaveBeenCalledTimes(2);
    const orderSet = mockSet.mock.calls[0];
    const creditSet = mockSet.mock.calls[1];

    expect(orderSet[1].estado).toBe(ORDER_STATES.CREDIT_APPROVED);
    expect(creditSet[0].path).toContain('credits/credit_');
    expect(creditSet[1].saldoPendiente).toBe(50000);
    expect(creditSet[1].estado).toBe('activo');
  });

  test('Maneja stock conflicto sin fallar si el pedido es offline', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        nombre: 'Zapato',
        variantes: [{ id: 'v1', stock: 1, talla: '38' }]
      })
    });

    const orderData = {
      items: [
        { productId: 'prod1', nombre: 'Zapato', cantidad: 5, variantId: 'v1' }
      ],
      total: 50000,
      metodoPago: PAYMENT_METHODS.CASH,
      offline: true,
      cliente: { nombre: 'Cliente Offline' }
    };

    const result = await createPhysicalOrder(orderData, 'admin123');

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet.mock.calls[0][1].estado).toBe(ORDER_STATES.PENDING_CONCILIATION);
    expect(mockSet.mock.calls[0][1].stockDescontado).toBe(false);
  });
});

describe('salesService - syncOfflineSales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      exists: () => false
    });
  });

  test('Retorna conteo 0 si no hay ventas pendientes de sincronizar', async () => {
    mockGetOfflineSales.mockResolvedValueOnce([]);

    const result = await syncOfflineSales();
    expect(result.success).toBe(true);
    expect(result.count).toBe(0);
  });

  test('Sincroniza y remueve del local las ventas pendientes', async () => {
    mockGetOfflineSales.mockResolvedValueOnce([
      { id: 'sale123', adminId: 'admin123', orderData: { items: [], total: 30000, metodoPago: PAYMENT_METHODS.CASH } }
    ]);
    mockRemoveOfflineSale.mockResolvedValueOnce();

    const result = await syncOfflineSales();
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    expect(mockRemoveOfflineSale).toHaveBeenCalledWith('sale123');
  });
});
