import { z } from 'zod';

export const HelloModuleSchema = z.object({
  id: z.string().optional(),
  createdAt: z.string().or(z.date()).optional(),
  tenantId: z.string()
});
