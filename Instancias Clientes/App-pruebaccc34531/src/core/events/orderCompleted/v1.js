import { z } from 'zod';

export const ORDER_COMPLETED_V1 = {
  name: 'ORDER_COMPLETED',
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
