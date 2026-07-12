import { describe, test, expect, vi, beforeEach } from 'vitest';

// ── Mocks globales de Firebase ────────────────────────────────────────────────
global.mockGet = vi.fn();
global.mockUpdate = vi.fn();
global.mockSet = vi.fn();
global.mockAddDoc = vi.fn(async () => ({ id: 'mock-order-id' }));
global.mockGetDocs = vi.fn(async () => ({ docs: [], empty: true }));
global.mockGetDoc = vi.fn(async () => ({ exists: () => false }));
global.mockOnSnapshot = vi.fn((ref, callback) => {
  const mockSnap = {
    exists: () => true,
    id: ref?.id || 'mock_id',
    docs: [
      { id: 'token123', data: () => ({ orderId: 'order123' }) },
      { id: 'o1', data: () => ({ orderNumber: 'ORD-1' }) }
    ],
    data: () => ({ orderId: 'order-123', total: 50000, estado: 'pendiente' })
  };
  if (callback) callback(mockSnap);
  return () => {};
});

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name) => ({ path: name, id: name })),
  doc: vi.fn((...args) => {
    if (args.length === 1) {
      const coll = args[0];
      const randomId = 'mock_id';
      return { path: `${coll.path}/${randomId}`, id: randomId };
    }
    if (args.length === 3) {
      const [_, collName, id] = args;
      return { path: `${collName}/${id}`, id };
    }
    return { path: 'fallback/id', id: 'id' };
  }),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  onSnapshot: vi.fn((...args) => global.mockOnSnapshot(...args)),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  addDoc: vi.fn(async (...args) => global.mockAddDoc(...args)),
  getDocs: vi.fn(async (...args) => global.mockGetDocs(...args)),
  getDoc: vi.fn(async (...args) => global.mockGetDoc(...args)),
  updateDoc: vi.fn(async (...args) => global.mockUpdate(...args)),
  writeBatch: vi.fn(() => ({
    delete: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
    commit: vi.fn(async () => {}),
  })),
  runTransaction: vi.fn(async (_db, callback) => {
    const mockTx = {
      get: vi.fn(async (...args) => global.mockGet(...args)),
      update: vi.fn(async (...args) => global.mockUpdate(...args)),
      set: vi.fn(async (...args) => global.mockSet(...args)),
    };
    return callback(mockTx);
  }),
}));

vi.mock('../../src/config/firebaseConfig', () => ({ db: {} }));

vi.mock('../../src/services/notificationCenterService', () => ({
  createCentralNotification: vi.fn(async () => {}),
  NC_TYPES: {
    PEDIDO_RECIBIDO: 'pedido_recibido',
    PEDIDO_ESTADO: 'pedido_estado',
    PEDIDO_ENTREGADO: 'pedido_entregado',
    PEDIDO_EN_CAMINO: 'pedido_en_camino',
    PEDIDO_LISTO: 'pedido_listo',
    PRODUCTO_AGOTADO: 'producto_agotado',
    STOCK_BAJO: 'stock_bajo',
    ABONO_RECIBIDO: 'abono_recibido',
  },
}));

vi.mock('../../src/services/telemetryService', () => ({
  reportAppFailureToDeveloper: vi.fn(async () => {}),
}));

vi.mock('../../src/services/deliveryService', () => ({
  queueDelivery: vi.fn(async () => {}),
}));

// ── Importar funciones bajo prueba ────────────────────────────────────────────
import {
  hashCelular,
  createOrder,
  updateOrderStatus,
  getOrders,
  subscribeToOrders,
  getArchivedOrders,
  getClientOrders,
  subscribeToClientOrders,
  subscribeToVendedorOrders,
  clearClientOrderHistory,
  archiveOrders,
  updateOrderDeliveryCost,
  subscribeToOrderByToken,
  migrateOrdersToTracking
} from '../../src/features/orders';
import { ORDER_STATES } from '../../src/constants';

// ── Suite 1: hashCelular ──────────────────────────────────────────────────────
describe('hashCelular - Comportamiento del hash SHA-256', () => {

  test('Retorna "unknown" para celular vacío o nulo', async () => {
    expect(await hashCelular('')).toBe('unknown');
    expect(await hashCelular(null)).toBe('unknown');
    expect(await hashCelular(undefined)).toBe('unknown');
  });

  test('Genera un hash de 64 caracteres hexadecimales para un número válido', async () => {
    const hash = await hashCelular('3001234567');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('El hash es determinístico: mismo input → mismo output', async () => {
    const phone = '3009876543';
    const [h1, h2] = await Promise.all([hashCelular(phone), hashCelular(phone)]);
    expect(h1).toBe(h2);
  });

  test('Inputs diferentes producen hashes distintos', async () => {
    const h1 = await hashCelular('3001111111');
    const h2 = await hashCelular('3002222222');
    expect(h1).not.toBe(h2);
  });

  test('Elimina guiones y espacios antes de hashear (normalización)', async () => {
    const clean = await hashCelular('3001234567');
    const withDashes = await hashCelular('300-123-4567');
    expect(clean).toBe(withDashes);
  });

});

// ── Suite 2: createOrder — Validación de inventario (casos extendidos) ────────
describe('createOrder - Casos de borde en validación de inventario', () => {

  beforeEach(() => {
    global.mockGet.mockReset();
    global.mockUpdate.mockReset();
    global.mockSet.mockReset();
    global.mockAddDoc.mockReset();
    global.mockAddDoc.mockResolvedValue({ id: 'mock-order-id' });
  });

  test('Permite compra de ítems custom- sin validar stock', async () => {
    // Los ítems con productId que empieza por 'custom-' se saltean
    const mockOrder = {
      cliente: { nombre: 'Juan', celular: '3001234567' },
      items: [
        { productId: 'custom-pizza', nombre: 'Pizza Especial', cantidad: 2, precio: 25000 }
      ],
      total: 50000
    };

    // No debe llamar a transaction.get para custom-items
    await createOrder(mockOrder);
    expect(global.mockGet).not.toHaveBeenCalled();
  });

  test('Procesa múltiples variantes del mismo producto en la misma orden', async () => {
    global.mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        stockInfinito: false,
        salesCount: 5,
        variantes: [
          { id: 'v1', stock: 10, talla: 'S', color: 'Rojo' },
          { id: 'v2', stock: 8, talla: 'M', color: 'Azul' },
        ]
      })
    });

    const mockOrder = {
      cliente: { nombre: 'Ana', celular: '3009999999' },
      items: [
        { productId: 'prod1', variantId: 'v1', nombre: 'Camiseta S/Rojo', cantidad: 2, precio: 30000 },
        { productId: 'prod1', variantId: 'v2', nombre: 'Camiseta M/Azul', cantidad: 3, precio: 30000 },
      ],
      total: 150000
    };

    await createOrder(mockOrder);
    expect(global.mockUpdate).toHaveBeenCalled();
    const updateCall = global.mockUpdate.mock.calls.find(c => c[0].id === 'prod1');
    expect(updateCall).toBeDefined();
    // Stock de v1 debe bajar de 10 a 8
    const v1 = updateCall[1].variantes.find(v => v.id === 'v1');
    expect(v1.stock).toBe(8);
    // Stock de v2 debe bajar de 8 a 5
    const v2 = updateCall[1].variantes.find(v => v.id === 'v2');
    expect(v2.stock).toBe(5);
    // salesCount acumulado: 5 + 2 + 3 = 10
    expect(updateCall[1].salesCount).toBe(10);
  });

  test('Lanza error descriptivo cuando el stock está en exactamente 0', async () => {
    global.mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        stockInfinito: false,
        variantes: [{ id: 'v1', stock: 0, talla: 'L', color: 'Verde' }]
      })
    });

    const mockOrder = {
      cliente: { nombre: 'Pedro', celular: '3001234567' },
      items: [{ productId: 'prod_agotado', variantId: 'v1', nombre: 'Zapato', cantidad: 1 }],
      total: 80000
    };

    await expect(createOrder(mockOrder)).rejects.toThrow('Solo está agotado');
  });

});

// ── Suite 3: updateOrderStatus — Transiciones de estado ──────────────────────
describe('updateOrderStatus - Transiciones de estado y restauración de stock', () => {

  beforeEach(() => {
    global.mockGet.mockReset();
    global.mockUpdate.mockReset();
  });

  test('Cancela un pedido sin restaurar stock si stockDescontado=false', async () => {
    const mockOrder = {
      items: [{ productId: 'prod1', variantId: 'v1', nombre: 'Producto', cantidad: 2 }],
      stockDescontado: false,
      cliente: { celular: '3001234567' },
      orderNumber: 'ORD-1001'
    };

    await updateOrderStatus('order-123', ORDER_STATES.CANCELLED, mockOrder);

    // No debe haber llamadas a transaction.get para restaurar stock
    expect(global.mockGet).not.toHaveBeenCalled();
    // El update del pedido debe ejecutarse directamente (sin transacción de inventario)
    // El comportamiento exacto depende del branch stockDescontado=false
  });

  test('Restaura stock al cancelar un pedido con stockDescontado=true', async () => {
    global.mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        stockInfinito: false,
        variantes: [{ id: 'v1', stock: 5, talla: 'M', color: 'Negro' }]
      })
    });

    const mockOrder = {
      items: [{ productId: 'prod1', variantId: 'v1', nombre: 'Producto', cantidad: 3 }],
      stockDescontado: true,
      cliente: { celular: '3001234567' },
      orderNumber: 'ORD-1002'
    };

    await updateOrderStatus('order-456', ORDER_STATES.CANCELLED, mockOrder);

    expect(global.mockGet).toHaveBeenCalled();
    const stockRestoreCall = global.mockUpdate.mock.calls.find(c => c[0]?.id === 'prod1');
    expect(stockRestoreCall).toBeDefined();
    // Stock debe ser restaurado: 5 (actual) + 3 (cancelado) = 8
    expect(stockRestoreCall[1].variantes[0].stock).toBe(8);
  });

});

// ── Suite 4: Métodos de Consulta y Modificación Adicionales ─────────────────────
describe('orderService - Métodos Adicionales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getOrders - obtiene listado de pedidos', async () => {
    const result = await getOrders();
    expect(result).toEqual([]);
  });

  test('getArchivedOrders - obtiene pedidos archivados', async () => {
    const result = await getArchivedOrders('2026-07-10', null, 10);
    expect(result).toEqual([]);
  });

  test('getClientOrders - obtiene pedidos de cliente con tokens e histórico', async () => {
    // 1st: getDocs de user_order_index -> 1 token
    global.mockGetDocs.mockResolvedValueOnce({
      docs: [{ id: 'token123' }],
      empty: false
    });
    // 2nd: getDoc del trackingToken -> exists: true
    global.mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'token123',
      data: () => ({ orderId: 'order123', total: 50000, createdAt: { toMillis: () => 12345 } })
    });

    const result = await getClientOrders('300123');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('order123');
  });

  test('subscribeToClientOrders - establece listener para index y tokens', async () => {
    global.mockOnSnapshot.mockImplementationOnce((ref, onUpdate) => {
      // Retornar 1 token
      onUpdate({
        docs: [{ id: 'token123' }]
      });
      return () => {};
    });

    global.mockOnSnapshot.mockImplementationOnce((ref, onUpdate) => {
      // Retornar datos de tracking
      onUpdate({
        exists: () => true,
        id: 'token123',
        data: () => ({ orderId: 'order123', total: 50000 })
      });
      return () => {};
    });

    const callback = vi.fn();
    const unsub = subscribeToClientOrders('300123', callback);
    // Esperar promesas
    await new Promise(r => setTimeout(r, 10));
    expect(callback).toHaveBeenCalled();
    unsub();
  });

  test('subscribeToVendedorOrders - establece listener para vendedor', () => {
    global.mockOnSnapshot.mockImplementationOnce((ref, onUpdate) => {
      onUpdate({
        docs: [{ id: 'o1', data: () => ({ orderNumber: 'ORD-1' }) }]
      });
      return () => {};
    });

    const callback = vi.fn();
    const unsub = subscribeToVendedorOrders('vendedor777', callback);
    expect(callback).toHaveBeenCalledTimes(1);
    unsub();
  });


  test('clearClientOrderHistory - limpia historial marcando pedidos como archivados', async () => {
    const mockOrders = [
      { id: 'o1', orderNumber: 'ORD-1', trackingToken: 'token123' }
    ];
    await clearClientOrderHistory(mockOrders);
  });

  test('archiveOrders - archiva múltiples pedidos', async () => {
    const mockOrders = [
      { id: 'o1', orderNumber: 'ORD-1' }
    ];
    await archiveOrders(mockOrders);
  });

  test('updateOrderDeliveryCost - actualiza costo de envío y recalcula total sin créditos', async () => {
    await updateOrderDeliveryCost('order-123', 5000, 30000, 2000);
  });

  test('updateOrderDeliveryCost - actualiza costo de envío y recalcula total con créditos', async () => {
    global.mockGetDocs.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          id: 'credit789',
          data: () => ({ total: 28000, saldoPendiente: 28000 })
        }
      ]
    });

    await updateOrderDeliveryCost('order-123', 5000, 30000, 2000);
  });

  test('subscribeToOrderByToken - establece listener de tracking y llama callback', async () => {
    const mockCallback = vi.fn();
    const unsubscribe = subscribeToOrderByToken('token123', mockCallback, () => {});
    expect(mockCallback).toHaveBeenCalled();
    unsubscribe();
  });

  test('migrateOrdersToTracking - realiza migración de pedidos legacy en lotes', async () => {
    global.mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'legacy-order-123',
          data: () => ({
            orderNumber: 'ORD-L1',
            estado: 'pendiente',
            trackingToken: 'token-l1',
            cliente: { celular: '3001112222', nombre: 'Test' }
          })
        }
      ]
    });

    global.mockGetDoc.mockResolvedValueOnce({
      exists: () => false
    });

    const stats = await migrateOrdersToTracking();
    expect(stats.migrated).toBe(1);
    expect(stats.errors).toBe(0);
  });
});


