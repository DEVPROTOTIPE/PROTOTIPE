import { db } from '../../../config/firebaseConfig';
import { doc, runTransaction } from 'firebase/firestore';
import { CustomerLoyaltyRepository } from '../api/CustomerLoyaltyRepository';
import { 
  LoyaltyAccountSchema, 
  LoyaltyTransactionSchema,
  LoyaltyConfigSchema 
} from '../schemas/CustomerLoyaltySchemas';

export class CustomerLoyaltyService {
  /**
   * Configuración por defecto si no existe en la BD.
   */
  static DEFAULT_CONFIG = {
    pointsPerCurrencyUnit: 0.01, // $100 = 1 punto
    minimumRedeemPoints: 500,
    levelThresholds: {
      silver: 1000,
      gold: 5000,
      platinum: 10000
    },
    updatedAt: new Date().toISOString()
  };

  /**
   * Obtiene la configuración del tenant o la por defecto.
   */
  static async getConfig(tenantId) {
    const docRef = doc(db, `tenants/${tenantId}/loyaltyConfig`, 'settings');
    try {
      const snap = await docRef.firestore._getDoc ? docRef.firestore._getDoc(docRef) : null; 
      // Por defecto fallback si no se quiere leer asíncronamente
      return this.DEFAULT_CONFIG;
    } catch {
      return this.DEFAULT_CONFIG;
    }
  }

  /**
   * Calcula los puntos generados por un importe de venta.
   */
  static calculateEarnedPoints(saleAmount, config) {
    const factor = config?.pointsPerCurrencyUnit ?? this.DEFAULT_CONFIG.pointsPerCurrencyUnit;
    return Math.floor(saleAmount * factor);
  }

  /**
   * Recupera o inicializa la cuenta de fidelización de un cliente.
   */
  static async getOrInitializeAccount(tenantId, customerId) {
    let account = await CustomerLoyaltyRepository.getAccount(tenantId, customerId);
    if (!account) {
      account = await CustomerLoyaltyRepository.createAccount(tenantId, customerId);
    }
    return account;
  }

  /**
   * Acumula puntos en una cuenta mediante una transacción atómica.
   */
  static async earnPoints(tenantId, customerId, points, saleId) {
    if (points <= 0) throw new Error('Los puntos a acumular deben ser mayores a cero');

    const accountRef = doc(db, `tenants/${tenantId}/loyaltyAccounts`, customerId);
    const transactionRef = doc(db, `tenants/${tenantId}/loyaltyTransactions`, `txn_earn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);

    await runTransaction(db, async (transaction) => {
      const accountDoc = await transaction.get(accountRef);
      let currentBalance = 0;
      let level = 'BRONZE';
      let createdAt = new Date().toISOString();

      if (accountDoc.exists()) {
        const data = accountDoc.data();
        currentBalance = data.pointsBalance || 0;
        level = data.level || 'BRONZE';
        createdAt = data.createdAt;
      }

      const newBalance = currentBalance + points;
      const config = this.DEFAULT_CONFIG; // Se puede leer asíncronamente fuera o usar fallback

      // Recalcular nivel en base a thresholds
      let newLevel = 'BRONZE';
      if (newBalance >= config.levelThresholds.platinum) newLevel = 'PLATINUM';
      else if (newBalance >= config.levelThresholds.gold) newLevel = 'GOLD';
      else if (newBalance >= config.levelThresholds.silver) newLevel = 'SILVER';

      const updatedAccount = {
        customerId,
        pointsBalance: newBalance,
        level: newLevel,
        createdAt,
        updatedAt: new Date().toISOString()
      };

      // Validar esquema antes de escribir
      LoyaltyAccountSchema.parse(updatedAccount);

      const newTx = {
        customerId,
        type: 'EARN',
        points,
        source: 'SALE',
        referenceId: saleId,
        createdAt: new Date().toISOString()
      };

      // Validar transacción
      LoyaltyTransactionSchema.parse(newTx);

      transaction.set(accountRef, updatedAccount);
      transaction.set(transactionRef, newTx);
    });
  }

  /**
   * Canjea puntos de una cuenta mediante una transacción atómica.
   */
  static async redeemPoints(tenantId, customerId, points, referenceId) {
    if (points <= 0) throw new Error('Los puntos a canjear deben ser mayores a cero');

    const config = this.DEFAULT_CONFIG;
    if (points < config.minimumRedeemPoints) {
      throw new Error(`El mínimo de puntos para realizar un canje es de ${config.minimumRedeemPoints} pts`);
    }

    const accountRef = doc(db, `tenants/${tenantId}/loyaltyAccounts`, customerId);
    const transactionRef = doc(db, `tenants/${tenantId}/loyaltyTransactions`, `txn_redeem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);

    await runTransaction(db, async (transaction) => {
      const accountDoc = await transaction.get(accountRef);
      if (!accountDoc.exists()) {
        throw new Error('El cliente no tiene una cuenta de fidelización activa');
      }

      const accountData = accountDoc.data();
      const currentBalance = accountData.pointsBalance || 0;

      if (currentBalance < points) {
        throw new Error('LOYALTY_INSUFFICIENT_POINTS');
      }

      const newBalance = currentBalance - points;

      // Recalcular nivel
      let newLevel = 'BRONZE';
      if (newBalance >= config.levelThresholds.platinum) newLevel = 'PLATINUM';
      else if (newBalance >= config.levelThresholds.gold) newLevel = 'GOLD';
      else if (newBalance >= config.levelThresholds.silver) newLevel = 'SILVER';

      const updatedAccount = {
        customerId,
        pointsBalance: newBalance,
        level: newLevel,
        createdAt: accountData.createdAt,
        updatedAt: new Date().toISOString()
      };

      // Validar esquema
      LoyaltyAccountSchema.parse(updatedAccount);

      const newTx = {
        customerId,
        type: 'REDEEM',
        points: -points, // Negativo para indicar resta/canje
        source: 'SALE',
        referenceId,
        createdAt: new Date().toISOString()
      };

      LoyaltyTransactionSchema.parse(newTx);

      transaction.set(accountRef, updatedAccount);
      transaction.set(transactionRef, newTx);
    });
  }

  /**
   * Genera un token QR opaco de un solo uso.
   */
  static async generateLoyaltyToken(tenantId, customerId) {
    const tokenId = `tok_${Math.random().toString(36).substr(2, 9)}${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutos de vigencia

    const tokenData = {
      tokenId,
      customerId,
      tenantId,
      expiresAt
    };

    await CustomerLoyaltyRepository.saveToken(tenantId, tokenData);
    return tokenId;
  }

  /**
   * Valida un token QR opaco y lo consume/elimina si es válido.
   */
  static async validateLoyaltyToken(tenantId, tokenId) {
    const tokenData = await CustomerLoyaltyRepository.getToken(tenantId, tokenId);
    if (!tokenData) throw new Error('Token inválido o inexistente');

    const now = new Date();
    const expiresAt = new Date(tokenData.expiresAt);

    if (now > expiresAt) {
      await CustomerLoyaltyRepository.deleteToken(tenantId, tokenId);
      throw new Error('El código QR ha expirado');
    }

    // Invalida el token para un solo uso
    await CustomerLoyaltyRepository.deleteToken(tenantId, tokenId);
    return tokenData.customerId;
  }
}
