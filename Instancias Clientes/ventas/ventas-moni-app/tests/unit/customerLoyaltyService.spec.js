import { describe, test, expect, vi, beforeEach } from 'vitest';

// Caracterización de CustomerLoyaltyService después del refactor de capas
// (CORE-344 / ADR-0001): el Service ya no importa el SDK de Firebase; delega
// la mecánica transaccional al Repository vía `runAccountTransaction`
// (patrón reducer puro). El mock de `runAccountTransaction` invoca el
// reducer recibido con el `currentAccount` fijado por cada prueba, tal como
// haría la transacción real de Firestore, preservando las mismas reglas de
// negocio verificadas antes del refactor (ver historial de este archivo).
const mockRepoGetAccount = vi.fn();
const mockRepoCreateAccount = vi.fn();
const mockRepoSaveToken = vi.fn();
const mockRepoGetToken = vi.fn();
const mockRepoDeleteToken = vi.fn();
const mockRunAccountTransaction = vi.fn();
const mockGetConfigDoc = vi.fn();

vi.mock('../../src/features/customer-loyalty/api/CustomerLoyaltyRepository', () => {
  return {
    CustomerLoyaltyRepository: {
      getAccount: (...args) => mockRepoGetAccount(...args),
      createAccount: (...args) => mockRepoCreateAccount(...args),
      saveToken: (...args) => mockRepoSaveToken(...args),
      getToken: (...args) => mockRepoGetToken(...args),
      deleteToken: (...args) => mockRepoDeleteToken(...args),
      runAccountTransaction: (...args) => mockRunAccountTransaction(...args),
      getConfigDoc: (...args) => mockGetConfigDoc(...args),
    },
  };
});

import { CustomerLoyaltyService } from '../../src/features/customer-loyalty/services/CustomerLoyaltyService';

describe('CustomerLoyaltyService — caracterización de reglas de negocio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateEarnedPoints', () => {
    test('calcula puntos con el factor por defecto (1% del monto)', () => {
      expect(CustomerLoyaltyService.calculateEarnedPoints(10000, null)).toBe(100);
    });

    test('usa el factor de la config recibida si está presente', () => {
      expect(
        CustomerLoyaltyService.calculateEarnedPoints(10000, { pointsPerCurrencyUnit: 0.02 })
      ).toBe(200);
    });
  });

  describe('getOrInitializeAccount', () => {
    test('crea la cuenta si no existe', async () => {
      mockRepoGetAccount.mockResolvedValueOnce(null);
      mockRepoCreateAccount.mockResolvedValueOnce({ customerId: 'cust1', pointsBalance: 0, level: 'BRONZE' });

      const result = await CustomerLoyaltyService.getOrInitializeAccount('tenant1', 'cust1');

      expect(mockRepoCreateAccount).toHaveBeenCalledWith('tenant1', 'cust1');
      expect(result.level).toBe('BRONZE');
    });

    test('retorna la cuenta existente sin crear una nueva', async () => {
      mockRepoGetAccount.mockResolvedValueOnce({ customerId: 'cust1', pointsBalance: 500, level: 'SILVER' });

      const result = await CustomerLoyaltyService.getOrInitializeAccount('tenant1', 'cust1');

      expect(mockRepoCreateAccount).not.toHaveBeenCalled();
      expect(result.pointsBalance).toBe(500);
    });
  });

  describe('earnPoints', () => {
    test('rechaza puntos menores o iguales a cero', async () => {
      await expect(CustomerLoyaltyService.earnPoints('tenant1', 'cust1', 0, 'sale1'))
        .rejects.toThrow('mayores a cero');
      expect(mockRunAccountTransaction).not.toHaveBeenCalled();
    });

    test('inicializa la cuenta en BRONZE cuando no existe y acumula los puntos', async () => {
      let capturedAccount;
      let capturedTx;
      mockRunAccountTransaction.mockImplementationOnce(async (tenantId, customerId, reducer) => {
        const { updatedAccount, newTx } = reducer(null);
        capturedAccount = updatedAccount;
        capturedTx = newTx;
        return updatedAccount;
      });

      await CustomerLoyaltyService.earnPoints('tenant1', 'cust1', 100, 'sale1');

      expect(mockRunAccountTransaction).toHaveBeenCalledWith('tenant1', 'cust1', expect.any(Function));
      expect(capturedAccount.pointsBalance).toBe(100);
      expect(capturedAccount.level).toBe('BRONZE');
      expect(capturedTx.type).toBe('EARN');
      expect(capturedTx.points).toBe(100);
      expect(capturedTx.referenceId).toBe('sale1');
    });

    test('sube de nivel al cruzar el umbral SILVER (1000 puntos)', async () => {
      let capturedAccount;
      mockRunAccountTransaction.mockImplementationOnce(async (tenantId, customerId, reducer) => {
        const { updatedAccount } = reducer({
          pointsBalance: 950,
          level: 'BRONZE',
          createdAt: '2026-01-01T00:00:00.000Z',
        });
        capturedAccount = updatedAccount;
        return updatedAccount;
      });

      await CustomerLoyaltyService.earnPoints('tenant1', 'cust1', 100, 'sale2');

      expect(capturedAccount.pointsBalance).toBe(1050);
      expect(capturedAccount.level).toBe('SILVER');
    });
  });

  describe('redeemPoints', () => {
    test('rechaza puntos menores o iguales a cero', async () => {
      await expect(CustomerLoyaltyService.redeemPoints('tenant1', 'cust1', 0, 'ref1'))
        .rejects.toThrow('mayores a cero');
      expect(mockRunAccountTransaction).not.toHaveBeenCalled();
    });

    test('rechaza canjes por debajo del mínimo (500 puntos)', async () => {
      await expect(CustomerLoyaltyService.redeemPoints('tenant1', 'cust1', 100, 'ref1'))
        .rejects.toThrow('mínimo de puntos para realizar un canje es de 500');
      expect(mockRunAccountTransaction).not.toHaveBeenCalled();
    });

    test('rechaza el canje si la cuenta no existe', async () => {
      // El reducer real lanza dentro del callback; una transacción real de
      // Firestore propaga ese throw fuera de runTransaction.
      mockRunAccountTransaction.mockImplementationOnce(async (tenantId, customerId, reducer) => {
        return reducer(null).updatedAccount;
      });

      await expect(CustomerLoyaltyService.redeemPoints('tenant1', 'cust1', 500, 'ref1'))
        .rejects.toThrow('no tiene una cuenta de fidelización activa');
    });

    test('rechaza el canje si el saldo es insuficiente', async () => {
      mockRunAccountTransaction.mockImplementationOnce(async (tenantId, customerId, reducer) => {
        return reducer({
          pointsBalance: 400,
          level: 'BRONZE',
          createdAt: '2026-01-01T00:00:00.000Z',
        }).updatedAccount;
      });

      await expect(
        CustomerLoyaltyService.redeemPoints(
          'tenant1',
          'cust1',
          500,
          'ref1'
        )
      ).rejects.toThrow('LOYALTY_INSUFFICIENT_POINTS');
    });

    test('canjea puntos y registra la transacción como negativa', async () => {
      let capturedAccount;
      let capturedTx;
      mockRunAccountTransaction.mockImplementationOnce(async (tenantId, customerId, reducer) => {
        const { updatedAccount, newTx } = reducer({
          pointsBalance: 1000,
          level: 'SILVER',
          createdAt: '2026-01-01T00:00:00.000Z',
        });
        capturedAccount = updatedAccount;
        capturedTx = newTx;
        return updatedAccount;
      });

      await CustomerLoyaltyService.redeemPoints('tenant1', 'cust1', 500, 'ref1');

      expect(capturedAccount.pointsBalance).toBe(500);
      expect(capturedTx.type).toBe('REDEEM');
      expect(capturedTx.points).toBe(-500);
    });
  });

  describe('generateLoyaltyToken / validateLoyaltyToken', () => {
    test('genera un token con expiración de 10 minutos y lo persiste vía el Repository', async () => {
      mockRepoSaveToken.mockResolvedValueOnce();

      const tokenId = await CustomerLoyaltyService.generateLoyaltyToken('tenant1', 'cust1');

      expect(typeof tokenId).toBe('string');
      expect(mockRepoSaveToken).toHaveBeenCalledTimes(1);
      const [, tokenData] = mockRepoSaveToken.mock.calls[0];
      expect(tokenData.tokenId).toBe(tokenId);
      expect(tokenData.customerId).toBe('cust1');
      expect(tokenData.tenantId).toBe('tenant1');
    });

    test('rechaza un token inexistente', async () => {
      mockRepoGetToken.mockResolvedValueOnce(null);

      await expect(CustomerLoyaltyService.validateLoyaltyToken('tenant1', 'tok_x'))
        .rejects.toThrow('Token inválido o inexistente');
    });

    test('rechaza y borra un token expirado', async () => {
      mockRepoGetToken.mockResolvedValueOnce({
        customerId: 'cust1',
        expiresAt: new Date(Date.now() - 60_000).toISOString(),
      });

      await expect(CustomerLoyaltyService.validateLoyaltyToken('tenant1', 'tok_1'))
        .rejects.toThrow('El código QR ha expirado');

      expect(mockRepoDeleteToken).toHaveBeenCalledWith('tenant1', 'tok_1');
    });

    test('valida un token vigente, lo invalida de un solo uso y retorna el customerId', async () => {
      mockRepoGetToken.mockResolvedValueOnce({
        customerId: 'cust1',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      });

      const result = await CustomerLoyaltyService.validateLoyaltyToken('tenant1', 'tok_1');

      expect(result).toBe('cust1');
      expect(mockRepoDeleteToken).toHaveBeenCalledWith('tenant1', 'tok_1');
    });
  });
});
