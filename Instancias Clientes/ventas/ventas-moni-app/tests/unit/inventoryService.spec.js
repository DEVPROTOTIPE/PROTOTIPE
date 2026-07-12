import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mocks de Firebase
const mockGet = vi.fn();
const mockGetDocs = vi.fn();
const mockAddDoc = vi.fn(() => ({ id: 'new-doc-id' }));
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((_db, name) => ({ path: name, id: name })),
    doc: vi.fn((_db, coll, id) => ({ path: `${coll}/${id}`, id })),
    query: vi.fn((...args) => ({ q: args })),
    where: vi.fn((f, op, val) => ({ filter: { f, op, val } })),
    onSnapshot: vi.fn(),
    orderBy: vi.fn((f, dir) => ({ order: { f, dir } })),
    limit: vi.fn((n) => ({ limit: n })),
    startAfter: vi.fn((doc) => ({ startAfter: doc })),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    getDocs: vi.fn(async (...args) => global.mockGetDocs(...args)),
    getDoc: vi.fn(async (...args) => global.mockGet(...args)),
    addDoc: vi.fn(async (...args) => global.mockAddDoc(...args)),
    updateDoc: vi.fn(async (...args) => global.mockUpdateDoc(...args)),
    deleteDoc: vi.fn(async (...args) => global.mockDeleteDoc(...args)),
    getFirestore: vi.fn(() => ({})),
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
      PRODUCTO_AGOTADO: 'producto_agotado',
      STOCK_BAJO: 'stock_bajo',
    },
  };
});

vi.mock('../../src/services/uploadService', () => {
  return {
    deleteImage: vi.fn(async () => {}),
  };
});

// Importar servicio bajo prueba
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProductsPaged,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct
} from '../../src/features/inventory/services/inventoryService';

import { createCentralNotification } from '../../src/services/notificationCenterService';

describe('inventoryService - Categorías', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.mockGetDocs = mockGetDocs;
    global.mockGet = mockGet;
    global.mockAddDoc = mockAddDoc;
    global.mockUpdateDoc = mockUpdateDoc;
    global.mockDeleteDoc = mockDeleteDoc;
  });

  test('getCategories - retorna listado de categorías ordenadas', async () => {
    const mockSnap = {
      docs: [
        { id: 'cat1', data: () => ({ nombre: 'Calzado' }) },
        { id: 'cat2', data: () => ({ nombre: 'Ropa' }) }
      ]
    };
    mockGetDocs.mockResolvedValueOnce(mockSnap);

    const cats = await getCategories();
    expect(cats).toHaveLength(2);
    expect(cats[0].id).toBe('cat1');
    expect(cats[0].nombre).toBe('Calzado');
  });

  test('createCategory - crea categoría y retorna su ID', async () => {
    mockAddDoc.mockResolvedValueOnce({ id: 'catNew' });

    const id = await createCategory({ nombre: 'Accesorios' });
    expect(id).toBe('catNew');
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
  });

  test('updateCategory - actualiza una categoría existente', async () => {
    await updateCategory('cat1', { nombre: 'Calzado Deportivo' });
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    const callArgs = mockUpdateDoc.mock.calls[0];
    expect(callArgs[0].path).toBe('categories/cat1');
    expect(callArgs[1].nombre).toBe('Calzado Deportivo');
  });

  test('deleteCategory - elimina una categoría', async () => {
    await deleteCategory('cat1');
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    expect(mockDeleteDoc.mock.calls[0][0].path).toBe('categories/cat1');
  });
});

describe('inventoryService - Productos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.mockGetDocs = mockGetDocs;
    global.mockGet = mockGet;
    global.mockAddDoc = mockAddDoc;
    global.mockUpdateDoc = mockUpdateDoc;
    global.mockDeleteDoc = mockDeleteDoc;
  });

  test('getProducts - obtiene todos los productos', async () => {
    const mockSnap = {
      docs: [
        { id: 'prod1', data: () => ({ nombre: 'Zapatos', precioBase: 50000 }) }
      ]
    };
    mockGetDocs.mockResolvedValueOnce(mockSnap);

    const prods = await getProducts();
    expect(prods).toHaveLength(1);
    expect(prods[0].id).toBe('prod1');
    expect(prods[0].nombre).toBe('Zapatos');
  });

  test('getProductById - obtiene un producto individual por ID', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => true,
      id: 'prod1',
      data: () => ({ nombre: 'Zapatos' })
    });

    const prod = await getProductById('prod1');
    expect(prod.id).toBe('prod1');
    expect(prod.nombre).toBe('Zapatos');
  });

  test('getProductById - lanza error si el producto no existe', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => false
    });

    await expect(getProductById('nonexistent')).rejects.toThrow('Producto no encontrado');
  });

  test('getProductsPaged - obtiene productos paginados mediante Firestore', async () => {
    const mockSnap = {
      docs: [
        { id: 'prod1', data: () => ({ nombre: 'A', activo: true, categoryId: 'cat1' }) },
        { id: 'prod2', data: () => ({ nombre: 'B', activo: true, categoryId: 'cat1' }) }
      ]
    };
    mockGetDocs.mockResolvedValueOnce(mockSnap);

    const result = await getProductsPaged({ onlyActive: true, categoryId: 'cat1', pageSize: 2 });
    expect(result.products).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.lastVisible.id).toBe('prod2');
  });

  test('getProductsPaged - activa fallback en caso de error de Firestore query', async () => {
    // Primera llamada getDocs falla en try block
    mockGetDocs.mockRejectedValueOnce(new Error('Index missing'));
    // Segunda llamada getDocs en catch block retorna listado completo
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { id: 'prod1', data: () => ({ nombre: 'A', activo: true, categoriaId: 'cat1', createdAt: { seconds: 100 } }) },
        { id: 'prod2', data: () => ({ nombre: 'B', activo: true, categoriaId: 'cat1', createdAt: { seconds: 200 } }) }
      ]
    });

    const result = await getProductsPaged({ onlyActive: true, categoryId: 'cat1', pageSize: 2 });
    expect(result.products).toHaveLength(2);
    // Orden descendente por createdAt.seconds (B = 200 antes de A = 100)
    expect(result.products[0].id).toBe('prod2');
    expect(result.products[1].id).toBe('prod1');
  });

  test('createProduct - crea producto y ejecuta auditoría de stock', async () => {
    mockAddDoc.mockResolvedValueOnce({ id: 'prodNew' });

    const productData = {
      nombre: 'Camisa',
      precioBase: 30000,
      variantes: [
        { id: 'v1', talla: 'M', color: 'Azul', stock: 0 } // Agotado
      ]
    };

    const id = await createProduct(productData);
    expect(id).toBe('prodNew');
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(createCentralNotification).toHaveBeenCalledTimes(1);
  });

  test('updateProduct - actualiza producto y ejecuta auditoría de stock', async () => {
    const productData = {
      nombre: 'Camisa Premium',
      variantes: [
        { id: 'v1', talla: 'M', color: 'Azul', stock: 4 } // Stock bajo (<= 5)
      ]
    };

    await updateProduct('prod1', productData);
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(createCentralNotification).toHaveBeenCalledTimes(1);
    const notificationCall = vi.mocked(createCentralNotification).mock.calls[0][0];
    expect(notificationCall.title).toBe('Alerta de Stock Bajo');
  });

  test('toggleProductStatus - cambia el estado activo de un producto', async () => {
    await toggleProductStatus('prod1', true);
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(mockUpdateDoc.mock.calls[0][1].activo).toBe(false);
  });

  test('deleteProduct - elimina el producto y su imagen si existe', async () => {
    mockGet.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ imageUrl: 'https://example.com/image.png' })
    });

    await deleteProduct('prod1');
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });
});
