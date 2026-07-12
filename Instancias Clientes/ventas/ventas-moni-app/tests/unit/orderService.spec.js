import { describe, test, expect, vi, beforeEach } from 'vitest';

// Configurar mocks globales antes de que se evalúe el mock hoisted
global.mockGet = vi.fn();
global.mockUpdate = vi.fn();
global.mockSet = vi.fn();
global.mockAddDoc = vi.fn(async () => ({ id: 'mock-doc-id' }));

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(() => ({ id: 'mock-coll-id' })),
    doc: vi.fn((_db, coll, id) => ({ path: `${coll}/${id}`, id })),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
    orderBy: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    addDoc: vi.fn(async (...args) => global.mockAddDoc(...args)),
    runTransaction: vi.fn(async (_db, callback) => {
      const mockTx = {
        get: vi.fn(async (...args) => global.mockGet(...args)),
        update: vi.fn(async (...args) => global.mockUpdate(...args)),
        set: vi.fn(async (...args) => global.mockSet(...args)),
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

// Importar servicios
import { buildTrackingDoc, hashCelular, createOrder } from '../../src/features/orders';

describe('orderService - buildTrackingDoc & hashCelular', () => {

  test('buildTrackingDoc - aísla la PII del cliente y conserva la información logística y financiera', () => {
    const mockOrderData = {
      cliente: {
        nombre: 'Juan Pérez García',
        celular: '3001234567',
        direccion: 'Calle 45 # 12-34',
        notasInternas: 'Dejar en recepción'
      },
      items: [
        { productId: 'prod1', nombre: 'HAMBURGUESA', cantidad: 2, precio: 12000 }
      ],
      subtotal: 24000,
      costoEnvio: 3000,
      descuento: 2000,
      total: 25000,
      metodoPago: 'efectivo',
      tipoEntrega: 'domicilio',
      notas: 'Llamar al llegar'
    };

    const trackingDoc = buildTrackingDoc('token123', 'ORD-5000', 'pendiente', mockOrderData);

    expect(trackingDoc.trackingToken).toBe('token123');
    expect(trackingDoc.orderNumber).toBe('ORD-5000');
    expect(trackingDoc.estado).toBe('pendiente');
    expect(trackingDoc.tipoEntrega).toBe('domicilio');
    expect(trackingDoc.clienteDireccion).toBe('Calle 45 # 12-34');
    expect(trackingDoc.clienteNombre).toBe('Juan Pérez García');
    expect(trackingDoc.notas).toBe('Llamar al llegar');
    expect(trackingDoc.subtotal).toBe(24000);
    expect(trackingDoc.costoEnvio).toBe(3000);
    expect(trackingDoc.descuento).toBe(2000);
    expect(trackingDoc.total).toBe(25000);
    expect(trackingDoc.items).toHaveLength(1);
    expect(trackingDoc.items[0].nombre).toBe('HAMBURGUESA');
    expect(trackingDoc.clienteCelular).toBeUndefined();
    expect(trackingDoc.cliente?.celular).toBeUndefined();
    expect(trackingDoc.notasInternas).toBeUndefined();
    expect(trackingDoc.cliente?.notasInternas).toBeUndefined();
  });

  test('hashCelular - genera hash SHA-256 válido y consistente', async () => {
    const phone = '3001234567';
    const hash = await hashCelular(phone);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    const hash2 = await hashCelular(phone);
    expect(hash2).toBe(hash);
  });

});

describe('orderService - createOrder y Validación de Inventario', () => {

  beforeEach(() => {
    global.mockGet.mockReset();
    global.mockUpdate.mockReset();
    global.mockSet.mockReset();
    global.mockAddDoc.mockReset();
  });

  test('Lanza un error si el producto no existe en la base de datos', async () => {
    global.mockGet.mockResolvedValueOnce({
      exists: () => false
    });

    const mockOrder = {
      cliente: { nombre: 'Juan', celular: '3001234567' },
      items: [
        { productId: 'prod_inexistente', variantId: 'v1', nombre: 'HAMBURGUESA', cantidad: 1 }
      ],
      total: 12000
    };

    await expect(createOrder(mockOrder))
      .rejects.toThrow('Producto no encontrado: HAMBURGUESA');
  });

  test('Lanza un error si hay stock insuficiente para la cantidad solicitada', async () => {
    global.mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        stockInfinito: false,
        variantes: [
          { id: 'v1', stock: 2, talla: 'Grande', color: 'Azul' }
        ]
      })
    });

    const mockOrder = {
      cliente: { nombre: 'Juan', celular: '3001234567' },
      items: [
        { productId: 'prod1', variantId: 'v1', nombre: 'HAMBURGUESA', cantidad: 5 }
      ],
      total: 60000
    };

    await expect(createOrder(mockOrder))
      .rejects.toThrow('Stock insuficiente para "HAMBURGUESA (Grande / Azul)". Solo quedan 2 unidades.');
  });

  test('Descuenta stock correctamente si hay suficiente inventario disponible', async () => {
    global.mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        stockInfinito: false,
        salesCount: 10,
        variantes: [
          { id: 'v1', stock: 15, talla: 'Grande', color: 'Rojo' }
        ]
      })
    });

    const mockOrder = {
      cliente: { nombre: 'Juan', celular: '3001234567' },
      items: [
        { productId: 'prod1', variantId: 'v1', nombre: 'HAMBURGUESA', cantidad: 3, precio: 12000 }
      ],
      total: 36000
    };

    await createOrder(mockOrder);

    expect(global.mockUpdate).toHaveBeenCalled();
    const updateCall = global.mockUpdate.mock.calls.find(call => call[0].id === 'prod1');
    expect(updateCall).toBeDefined();
    expect(updateCall[1].variantes[0].stock).toBe(12);
    expect(updateCall[1].salesCount).toBe(13);
  });

  test('Permite la compra sin descontar stock si stockInfinito está activo', async () => {
    global.mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        stockInfinito: true,
        variantes: [
          { id: 'v1', stock: 5 }
        ]
      })
    });

    const mockOrder = {
      cliente: { nombre: 'Juan', celular: '3001234567' },
      items: [
        { productId: 'prod1', variantId: 'v1', nombre: 'HAMBURGUESA', cantidad: 10, precio: 12000 }
      ],
      total: 120000
    };

    await createOrder(mockOrder);

    const productUpdate = global.mockUpdate.mock.calls.find(call => call[0].id === 'prod1');
    if (productUpdate) {
      expect(productUpdate[1].variantes[0].stock).toBe(5);
    }
  });

});
