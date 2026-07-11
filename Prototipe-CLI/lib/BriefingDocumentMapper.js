import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.join(__dirname, '..');

const DOCS_ROOT = path.join(CLI_ROOT, '..', 'Documentacion PROTOTIPE');

export class BriefingDocumentMapper {
  /**
   * Genera los 12 documentos maestros de gobernanza para el nuevo Core en la carpeta de documentación
   */
  static generateCoreGovernance(blueprint) {
    const coreFolderName = `Documentacion App ${blueprint.targetCoreName}`;
    const coreDocsPath = path.join(DOCS_ROOT, '09_Modulos_Completos', coreFolderName);

    console.log(`[BriefingDocumentMapper] Generando documentación de gobernanza en: ${coreDocsPath}`);
    fs.ensureDirSync(coreDocsPath);

    const docTemplates = {
      'README.md': {
        title: 'Introducción y Guía Rápida del Core',
        content: `Este documento describe la especificación operativa y de negocio del Core.
- **Nombre:** ${blueprint.targetCoreName}
- **Clave:** ${blueprint.targetCoreKey}
- **Nicho Comercial:** ${blueprint.nicho}
- **ID Promoción:** ${blueprint.promotionId}

### Características del Core
<!-- PENDIENTE DE DEFINICIÓN -->`
      },
      'arquitectura_fisica.md': {
        title: 'Arquitectura Física, Capas y Features',
        content: `Mapeo de la estructura física del Core y su linaje.
- **Entrypoint:** \`src/main.jsx\`
- **Modo:** Multi-tenant / Multi-instancia

### Features Integradas
${blueprint.features.required.map(f => `- **${f.featureId}** (Versión: ${f.version})`).join('\n')}

### Features Opcionales Soportadas
${blueprint.features.optional.length > 0 
  ? blueprint.features.optional.map(f => `- **${f.featureId}** (Versión: ${f.version})`).join('\n')
  : '<!-- PENDIENTE DE DEFINICIÓN -->'}`
      },
      'reglas_seguridad.md': {
        title: 'Reglas de Seguridad Firestore y Storage',
        content: `Contrato de seguridad perimetral de base de datos.
- **Base de Datos:** Firestore (Google Cloud)
- **Modo:** Bloqueo predeterminado con bypass por claims de Auth

### Reglas compuestas
<!-- PENDIENTE DE DEFINICIÓN -->`
      },
      'modelo_datos.md': {
        title: 'Modelo de Datos, Colecciones y Tipos',
        content: `Esquemas de colecciones de base de datos.
- **Colección Local:** \`.prototipe.json\`
- **Colección Firebase:** \`users\`, \`logs_promociones\`

### Definición de esquemas Zod
<!-- PENDIENTE DE DEFINICIÓN -->`
      },
      'flujo_estados.md': {
        title: 'Flujos de Estados y Máquinas de Negocio',
        content: `Máquina de estados operativos de la aplicación.
- **Estados del Pipeline de Promoción:**
  - PENDING_PREFLIGHT
  - PREFLIGHT_APPROVED
  - RUNNING_SANITIZATION
  - CANDIDATE_READY
  - ACTIVE

### Transiciones de negocio
<!-- PENDIENTE DE DEFINICIÓN -->`
      },
      'estandar_codigo.md': {
        title: 'Estándar de Código, Clean Code y Linter',
        content: `Reglas de estilo y desarrollo para desarrolladores.
- **Linter:** ESLint / Prettier
- **Estilo:** ES Modules, Zero Shell

### Naming Conventions
<!-- PENDIENTE DE DEFINICIÓN -->`
      },
      'guia_despliegue.md': {
        title: 'Guía de Despliegue, Staging y Hosting',
        content: `Rutina de compilación y publicación.
- **Build Command:** \`npm run build\`
- **Staging Output:** \`dist/\`

### Pipelines de CI/CD
<!-- PENDIENTE DE DEFINICIÓN -->`
      },
      'pruebas_smoke.md': {
        title: 'Checklist de Pruebas y Smoke Testing',
        content: `Procedimiento de validación previa a producción.
- **Pre-requisitos:** Compilación libre de errores de linter.

### Checklist de aceptación
- \`[ ]\` Build exitoso en staging
- \`[ ]\` Sin credenciales en logs
- \`[ ]\` Seeds anonimizados
<!-- PENDIENTE DE DEFINICIÓN -->`
      },
      'gobernanza_features.md': {
        title: 'Manual de Gobernanza de Features Externas',
        content: `Inyección desacoplada de features.
- **Registro Único:** \`knowledge/feature-registry.json\`

### Reglas de importación
<!-- PENDIENTE DE DEFINICIÓN -->`
      },
      'estrategia_seeds.md': {
        title: 'Estrategia de Seeds y Anonimización',
        content: `Directivas de poblamiento de bases de datos.
- **Filtro de colecciones:** Excluidos pedidos y usuarios.

### Script de Sembrado
<!-- PENDIENTE DE DEFINICIÓN -->`
      },
      'manual_operador.md': {
        title: 'Manual del Operador y Consola CLI',
        content: `Monitoreo de la salud de las instancias.
- **Daemon Port:** 3001

### Consola de incidentes
<!-- PENDIENTE DE DEFINICIÓN -->`
      },
      'analisis_riesgos.md': {
        title: 'Análisis de Riesgos, PII y Disaster Recovery',
        content: `Garantía de confidencialidad de datos.
- **Secret Scan:** Redacción activa \`[REDACTED]\`

### Políticas de Backup
<!-- PENDIENTE DE DEFINICIÓN -->`
      }
    };

    const createdFiles = [];

    for (const [fileName, doc] of Object.entries(docTemplates)) {
      const filePath = path.join(coreDocsPath, fileName);
      const markdown = `# 📘 ${doc.title}

${doc.content}
`;
      fs.writeFileSync(filePath, markdown, 'utf-8');
      createdFiles.push(filePath);
      console.log(`[BriefingDocumentMapper] Creado: ${filePath}`);
    }

    // Retornar las rutas absolutas para sincronizarlas en el mapa semántico
    return createdFiles;
  }
}
