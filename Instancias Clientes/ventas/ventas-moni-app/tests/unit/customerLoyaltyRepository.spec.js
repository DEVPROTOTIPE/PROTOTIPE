import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mocks de Firebase — mismo patrón que tests/unit/salesService.spec.js
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockTxGet = vi.fn();
const mockTxSet = vi.fn();
const mockOnSnapshot = vi.fn();

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((_db, name) => ({ path: name, id: name })),
    doc: vi.fn((...args) => {
      if (args.length === 3) {
        const [, collName, id] = args;
        return { path: `${collName}/${id}`, id };
      }
      return { path: 'fallback/id', id: 'id' };
    }),
    query: vi.fn((colRef, ...clauses) => ({ colRef, clauses })),
    where: vi.fn((field, op, value) => ({ type: 'where', field, op, value })),
    orderBy: vi.fn((field, dir) => ({ type: 'orderBy', field, dir })),
    getDoc: (...args) => mockGetDoc(...args),
    setDoc: (...args) => mockSetDoc(...args),
    updateDoc: (...args) => mockUpdateDoc(...args),
    getDocs: (...args) => mockGetDocs(...args),
    runTransaction: vi.fn(async (_db, callback) => {
      const mockTx = { get: mockTxGet, set: mockTxSet };
      return callback(mockTx);
    }),
    onSnapshot: (...args) => mockOnSnapshot(...args),
  };
});

vi.mock('../../src/config/firebaseConfig', () => {
  return { db: {} };
});

import { CustomerLoyaltyRepository } from '../../src/features/customer-loyalty/api/CustomerLoyaltyRepository';

describe('CustomerLoyaltyRepository — caracterización (frontera de infraestructura)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccount', () => {
    test('retorna null si la cuenta no existe', async () => {
      mockGetDoc.mockResolvedValueOnce({ exists: () => false });
      const result = await CustomerLoyaltyRepository.getAccount('tenant1', 'cust1');
      expect(result).toBeNull();
    });

    test('retorna los datos de la cuenta si existe', async () => {
      const accountData = { customerId: 'cust1', pointsBalance: 500, level: 'BRONZE' };
      mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => accountData });
      const result = await CustomerLoyaltyRepository.getAccount('tenant1', 'cust1');
      expect(result).toEqual(accountData);
    });
  });

  describe('createAccount', () => {
    test('crea una cuenta BRONZE con saldo cero y persiste vía setDoc', async () => {
      const result = await CustomerLoyaltyRepository.createAccount('tenant1', 'cust1');
      expect(result.customerId).toBe('cust1');
      expect(result.pointsBalance).toBe(0);
      expect(result.level).toBe('BRONZE');
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      const [, payload] = mockSetDoc.mock.calls[0];
      expect(payload.customerId).toBe('cust1');
    });
  });

  describe('getTransactions', () => {
    test('consulta por customerId ordenando por createdAt desc y mapea transactionId', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: [
          { id: 'tx1', data: () => ({ customerId: 'cust1', type: 'EARN', points: 100 }) },
        ],
      });
      const result = await CustomerLoyaltyRepository.getTransactions('tenant1', 'cust1');
      expect(result).toEqual([
        { transactionId: 'tx1', customerId: 'cust1', type: 'EARN', points: 100 },
      ]);
    });
  });

  describe('saveToken / getToken / deleteToken', () => {
    test('saveToken valida el esquema y persiste vía setDoc', async () => {
      const tokenData = {
        tokenId: 'tok_1',
        customerId: 'cust1',
        tenantId: 'tenant1',
        expiresAt: new Date().toISOString(),
      };
      await CustomerLoyaltyRepository.saveToken('tenant1', tokenData);
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    test('getToken retorna null si el token no existe', async () => {
      mockGetDoc.mockResolvedValueOnce({ exists: () => false });
      const result = await CustomerLoyaltyRepository.getToken('tenant1', 'tok_x');
      expect(result).toBeNull();
    });

    test('getToken retorna los datos si el token existe', async () => {
      const tokenData = { tokenId: 'tok_1', customerId: 'cust1' };
      mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => tokenData });
      const result = await CustomerLoyaltyRepository.getToken('tenant1', 'tok_1');
      expect(result).toEqual(tokenData);
    });

    test('deleteToken invalida el token vía updateDoc (comportamiento actual, ver deuda técnica registrada)', async () => {
      await CustomerLoyaltyRepository.deleteToken('tenant1', 'tok_1');
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      const [, payload] = mockUpdateDoc.mock.calls[0];
      expect(payload).toHaveProperty('expiresAt');
    });
  });

  describe('runAccountTransaction (movida desde el Service en CORE-344 / ADR-0001)', () => {
    test('lee la cuenta actual, invoca el reducer y persiste cuenta + transacción en una sola escritura atómica', async () => {
      mockTxGet.mockResolvedValueOnce({ exists: () => false });

      const reducer = vi.fn(() => ({
        updatedAccount: {
          customerId: 'cust1',
          pointsBalance: 100,
          level: 'BRONZE',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        newTx: {
          customerId: 'cust1',
          type: 'EARN',
          points: 100,
          source: 'SALE',
          referenceId: 'sale1',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      }));

      const result = await CustomerLoyaltyRepository.runAccountTransaction('tenant1', 'cust1', reducer);

      expect(mockTxGet).toHaveBeenCalledTimes(1);
      expect(reducer).toHaveBeenCalledWith(null);
      expect(mockTxSet).toHaveBeenCalledTimes(2);
      expect(result.pointsBalance).toBe(100);
    });

    test('pasa la cuenta existente (objeto plano) al reducer cuando la cuenta ya existe', async () => {
      const existingAccount = { customerId: 'cust1', pointsBalance: 500, level: 'SILVER', createdAt: '2026-01-01T00:00:00.000Z' };
      mockTxGet.mockResolvedValueOnce({ exists: () => true, data: () => existingAccount });

      const reducer = vi.fn((currentAccount) => ({
        updatedAccount: { ...currentAccount, pointsBalance: 600, updatedAt: '2026-01-02T00:00:00.000Z' },
        newTx: {
          customerId: 'cust1',
          type: 'EARN',
          points: 100,
          source: 'SALE',
          referenceId: 'sale2',
          createdAt: '2026-01-02T00:00:00.000Z',
        },
      }));

      await CustomerLoyaltyRepository.runAccountTransaction('tenant1', 'cust1', reducer);

      expect(reducer).toHaveBeenCalledWith(existingAccount);
    });

    test('propaga el error lanzado por el reducer (p. ej. saldo insuficiente) sin escribir', async () => {
      mockTxGet.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ customerId: 'cust1', pointsBalance: 100, level: 'BRONZE' }),
      });

      const reducer = vi.fn(() => {
        throw new Error('LOYALTY_INSUFFICIENT_POINTS');
      });

      await expect(
        CustomerLoyaltyRepository.runAccountTransaction('tenant1', 'cust1', reducer)
      ).rejects.toThrow('LOYALTY_INSUFFICIENT_POINTS');

      expect(mockTxSet).not.toHaveBeenCalled();
    });

    test('rechaza si el reducer retorna una cuenta o transacción que no cumple el esquema Zod', async () => {
      mockTxGet.mockResolvedValueOnce({ exists: () => false });

      const reducer = vi.fn(() => ({
        updatedAccount: { customerId: 'cust1', pointsBalance: -1, level: 'BRONZE' }, // saldo negativo: inválido
        newTx: { customerId: 'cust1', type: 'EARN', points: 100, source: 'SALE', createdAt: '2026-01-01T00:00:00.000Z' },
      }));

      await expect(
        CustomerLoyaltyRepository.runAccountTransaction('tenant1', 'cust1', reducer)
      ).rejects.toThrow();
    });
  });

  describe('subscribeToAccount / subscribeToTransactions (movidas desde el Hook en CORE-344 / ADR-0001)', () => {
    test('subscribeToAccount invoca onData con los datos de la cuenta y retorna la función de cancelación', () => {
      const unsubscribe = vi.fn();
      mockOnSnapshot.mockImplementationOnce((ref, onNext) => {
        onNext({ exists: () => true, data: () => ({ pointsBalance: 300 }) });
        return unsubscribe;
      });

      const onData = vi.fn();
      const onError = vi.fn();
      const result = CustomerLoyaltyRepository.subscribeToAccount('tenant1', 'cust1', onData, onError);

      expect(onData).toHaveBeenCalledWith({ pointsBalance: 300 });
      expect(result).toBe(unsubscribe);
    });

    test('subscribeToAccount invoca onData con null si la cuenta no existe', () => {
      mockOnSnapshot.mockImplementationOnce((ref, onNext) => {
        onNext({ exists: () => false });
        return vi.fn();
      });

      const onData = vi.fn();
      CustomerLoyaltyRepository.subscribeToAccount('tenant1', 'cust1', onData, vi.fn());

      expect(onData).toHaveBeenCalledWith(null);
    });

    test('subscribeToTransactions mapea los documentos con transactionId y retorna la función de cancelación', () => {
      const unsubscribe = vi.fn();
      mockOnSnapshot.mockImplementationOnce((query, onNext) => {
        onNext({
          docs: [{ id: 'tx1', data: () => ({ customerId: 'cust1', type: 'EARN', points: 100 }) }],
        });
        return unsubscribe;
      });

      const onData = vi.fn();
      const result = CustomerLoyaltyRepository.subscribeToTransactions('tenant1', 'cust1', onData, vi.fn());

      expect(onData).toHaveBeenCalledWith([
        { transactionId: 'tx1', customerId: 'cust1', type: 'EARN', points: 100 },
      ]);
      expect(result).toBe(unsubscribe);
    });

    test('propaga errores del listener a onError', () => {
      mockOnSnapshot.mockImplementationOnce((ref, onNext, onErrorCb) => {
        onErrorCb(new Error('permission-denied'));
        return vi.fn();
      });

      const onError = vi.fn();
      CustomerLoyaltyRepository.subscribeToAccount('tenant1', 'cust1', vi.fn(), onError);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getConfigDoc (deuda técnica pre-existente preservada, ver ADR-0001 §20)', () => {
    test('retorna null porque la lectura nunca se completa (comportamiento actual sin modificar)', async () => {
      const result = await CustomerLoyaltyRepository.getConfigDoc('tenant1');
      expect(result).toBeNull();
    });
  });
});
