import { z } from 'zod';

export const SALE_COMPLETED_V1 = {
  name: 'SALE_COMPLETED',
  version: 1,
  schema: z.object({
    id: z.string(),
    total: z.number(),
    paymentMethod: z.string(),
    items: z.array(z.object({
      productId: z.string(),
      nombre: z.string(),
      cantidad: z.number(),
      precio: z.number(),
      varianteId: z.string().optional()
    }))
  })
};
