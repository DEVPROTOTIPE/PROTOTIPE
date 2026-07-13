import { z } from 'zod';

// Expresión regular para validar kebab-case estricto
const kebabCaseRegex = /^[a-z0-9-]+$/;

// Expresión regular para validar semver simple (X.Y.Z)
const semverRegex = /^\d+\.\d+\.\d+$/;

// Esquema para validar implementation.manifest.json
export const implementationManifestSchema = z.object({
  schemaVersion: z.number().int().min(1).max(1),
  featureId: z.string().regex(kebabCaseRegex, {
    message: 'El featureId debe estar en minúsculas y formato kebab-case estricto (ej. customer-loyalty).'
  }),
  displayName: z.string().min(1, 'El displayName no puede estar vacío.'),
  version: z.string().regex(semverRegex, {
    message: 'La versión debe seguir el formato semver estándar X.Y.Z (ej. 1.0.0).'
  }),
  entry: z.string().min(1, 'La ruta de entrada entry es obligatoria.'),
  dependencies: z.array(z.string().regex(kebabCaseRegex)),
  navigation: z.object({
    adminMenu: z.array(z.object({
      label: z.string().min(1),
      path: z.string().startsWith('/admin/'),
      icon: z.string().min(1),
      permissionRequired: z.string().optional()
    })).optional(),
    clientMenu: z.array(z.object({
      label: z.string().min(1),
      path: z.string().startsWith('/tienda/')
    })).optional()
  }).optional()
});

// Esquema para validar security/feature-security.json
export const featureSecuritySchema = z.object({
  schemaVersion: z.number().int().min(1).max(1),
  featureId: z.string().regex(kebabCaseRegex),
  firestore: z.object({
    collections: z.array(z.object({
      path: z.string().refine(p => {
        // Validación obligatoria de aislamiento multi-tenant
        return p.startsWith('tenants/{tenantId}/');
      }, {
        message: 'Aislamiento de Seguridad: El path de la colección debe comenzar obligatoriamente con "tenants/{tenantId}/" para garantizar el multi-tenant.'
      }),
      readPermissions: z.array(z.string()),
      createPermissions: z.array(z.string()),
      updatePermissions: z.array(z.string()),
      deletePermissions: z.array(z.string()),
      requiredFields: z.array(z.string()).optional(),
      immutableFields: z.array(z.string()).optional()
    })).optional(),
    indexes: z.array(z.object({
      collectionGroup: z.string().min(1),
      fields: z.array(z.object({
        fieldPath: z.string().min(1),
        order: z.enum(['ASCENDING', 'DESCENDING'])
      }))
    })).optional()
  }).optional()
});
