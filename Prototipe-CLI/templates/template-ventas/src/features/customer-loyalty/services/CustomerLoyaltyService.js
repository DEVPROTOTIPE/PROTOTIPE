import { CustomerLoyaltyRepository } from '../api/CustomerLoyaltyRepository';

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
   *
   * DEUDA TÉCNICA PRE-EXISTENTE (ver ADR-0001 §20 y bitácora CORE-344): la
   * lectura delegada al Repository nunca se completa (comportamiento
   * preservado sin modificar); esta función siempre retorna `DEFAULT_CONFIG`.
   */
  static async getConfig(tenantId) {
    await CustomerLoyaltyRepository.getConfigDoc(tenantId);
    return this.DEFAULT_CONFIG;
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
   * La mecánica de Firestore vive en el Repository; este método solo decide
   * el nuevo estado del dominio (regla de negocio pura, sin SDK de Firebase).
   */
  static async earnPoints(tenantId, customerId, points, saleId) {
    if (points <= 0) throw new Error('Los puntos a acumular deben ser mayores a cero');

    const config = this.DEFAULT_CONFIG;

    await CustomerLoyaltyRepository.runAccountTransaction(tenantId, customerId, (currentAccount) => {
      const currentBalance = currentAccount?.pointsBalance || 0;
      const createdAt = currentAccount?.createdAt || new Date().toISOString();

      const newBalance = currentBalance + points;

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

      const newTx = {
        customerId,
        type: 'EARN',
        points,
        source: 'SALE',
        referenceId: saleId,
        createdAt: new Date().toISOString()
      };

      return { updatedAccount, newTx };
    });
  }

  /**
   * Canjea puntos de una cuenta mediante una transacción atómica.
   * La mecánica de Firestore vive en el Repository; este método solo decide
   * el nuevo estado del dominio (regla de negocio pura, sin SDK de Firebase).
   */
  static async redeemPoints(tenantId, customerId, points, referenceId) {
    if (points <= 0) throw new Error('Los puntos a canjear deben ser mayores a cero');

    const config = this.DEFAULT_CONFIG;
    if (points < config.minimumRedeemPoints) {
      throw new Error(`El mínimo de puntos para realizar un canje es de ${config.minimumRedeemPoints} pts`);
    }

    await CustomerLoyaltyRepository.runAccountTransaction(tenantId, customerId, (currentAccount) => {
      if (!currentAccount) {
        throw new Error('El cliente no tiene una cuenta de fidelización activa');
      }

      const currentBalance = currentAccount.pointsBalance || 0;

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
        createdAt: currentAccount.createdAt,
        updatedAt: new Date().toISOString()
      };

      const newTx = {
        customerId,
        type: 'REDEEM',
        points: -points, // Negativo para indicar resta/canje
        source: 'SALE',
        referenceId,
        createdAt: new Date().toISOString()
      };

      return { updatedAccount, newTx };
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
