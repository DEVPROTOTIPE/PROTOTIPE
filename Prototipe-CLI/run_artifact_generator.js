import path from 'path';
import { fileURLToPath } from 'url';
import { FeatureArtifactGenerator } from './lib/FeatureArtifactGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    const registryPath = path.join(__dirname, 'knowledge', 'feature-registry.json');
    const targetProjectDir = path.join(__dirname, '..', 'Plantillas Core', 'App Ventas');
    
    console.log('Resolviendo rutas...');
    console.log('- Registry:', registryPath);
    console.log('- Target:', targetProjectDir);

    const generator = new FeatureArtifactGenerator(registryPath);
    await generator.generate(targetProjectDir);
    
    // Y también en la plantilla template-ventas de CLI
    const templateProjectDir = path.join(__dirname, 'templates', 'template-ventas');
    console.log('- Template Target:', templateProjectDir);
    await generator.generate(templateProjectDir);

    console.log('¡Generación de artefactos completada con éxito!');
  } catch (err) {
    console.error('Error en la generación:', err);
  }
}

main();
