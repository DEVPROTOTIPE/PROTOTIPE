import { z } from 'zod';

export const {{pascalName}}Schema = z.object({
  id: z.string().optional(),
  createdAt: z.string().or(z.date()).optional(),
  tenantId: z.string()
});
