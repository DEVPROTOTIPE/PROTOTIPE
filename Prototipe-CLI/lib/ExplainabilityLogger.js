import fs from 'fs-extra';
import path from 'path';

export class ExplainabilityLogger {
  constructor(instanceId) {
    this.instanceId = instanceId;
    this.logs = [];
  }

  /**
   * Agrega un conjunto de registros de auditoría al rastro.
   * @param {Array<Object>} auditEntries
   */
  addEntries(auditEntries) {
    if (!auditEntries) return;
    auditEntries.forEach(entry => {
      this.logs.push({
        timestamp: new Date().toISOString(),
        instanceId: this.instanceId,
        ...entry
      });
    });
  }

  /**
   * Persiste el rastro de auditoría en disco en formato JSONL y Markdown.
   * @param {string} targetDirectory Directorio de destino de la app
   */
  async persist(targetDirectory) {
    const jsonlPath = path.join(targetDirectory, '.prototipe-audit-trail.jsonl');
    const mdPath = path.join(targetDirectory, `historial_${this.instanceId}.md`);

    console.log(`📝 [ExplainabilityLogger] Guardando bitácora de auditoría en: ${jsonlPath}`);

    // 1. Guardar JSONL
    const jsonlContent = this.logs.map(log => JSON.stringify(log)).join('\n') + '\n';
    await fs.outputFile(jsonlPath, jsonlContent);

    // 2. Guardar Markdown amigable
    let mdContent = `# Historial de Aprovisionamiento Inteligente (Trazabilidad de Decisiones)\n\n`;
    mdContent += `* **Instancia:** \`${this.instanceId}\`\n`;
    mdContent += `* **Fecha de Generación:** ${new Date().toLocaleDateString()}\n\n`;
    mdContent += `## 🧠 Decisiones y Justificaciones Técnicas Deducidas:\n\n`;

    this.logs.forEach((log, index) => {
      mdContent += `### ${index + 1}. ${log.decision}\n`;
      mdContent += `- **Fuente:** \`${log.source}\`\n`;
      mdContent += `- **Motivo:** ${log.reason}\n`;
      mdContent += `- **Confianza:** \`${(log.confidence * 100).toFixed(0)}%\`\n\n`;
    });

    await fs.outputFile(mdPath, mdContent);
  }
}
