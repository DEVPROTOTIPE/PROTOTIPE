import { z } from 'zod';

/**
 * Esquema de validación para la cuenta de puntos del cliente.
 */
export const LoyaltyAccountSchema = z.object({
  customerId: z.string().min(1, 'El customerId es obligatorio'),
  pointsBalance: z.number().int().nonnegative('El saldo de puntos no puede ser negativo'),
  level: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).default('BRONZE'),
  createdAt: z.any(),
  updatedAt: z.any()
});

/**
 * Esquema de validación para transacciones de puntos (inmutables).
 */
export const LoyaltyTransactionSchema = z.object({
  transactionId: z.string().optional(),
  customerId: z.string().min(1, 'El customerId es obligatorio'),
  type: z.enum(['EARN', 'REDEEM', 'ADJUSTMENT', 'EXPIRED']),
  points: z.number().int('Los puntos deben ser un número entero').refine(val => val !== 0, 'Los puntos no pueden ser cero'),
  source: z.enum(['SALE', 'MANUAL', 'SYSTEM']),
  referenceId: z.string().optional(),
  reason: z.string().optional(),
  createdAt: z.any()
});

/**
 * Esquema de validación para la configuración del sistema de fidelidad.
 */
export const LoyaltyConfigSchema = z.object({
  pointsPerCurrencyUnit: z.number().positive('El factor de conversión debe ser mayor a cero'),
  minimumRedeemPoints: z.number().int().nonnegative('El mínimo de puntos a canjear no puede ser negativo'),
  levelThresholds: z.object({
    silver: z.number().int().nonnegative(),
    gold: z.number().int().nonnegative(),
    platinum: z.number().int().nonnegative()
  }),
  updatedAt: z.any()
});

/**
 * Esquema para tokens opacos de QR de fidelización.
 */
export const LoyaltyTokenSchema = z.object({
  tokenId: z.string().min(1),
  customerId: z.string().min(1),
  tenantId: z.string().min(1),
  expiresAt: z.any()
});
