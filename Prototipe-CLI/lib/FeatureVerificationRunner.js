import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { FeatureArtifactGenerator } from './FeatureArtifactGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_ROOT = path.join(__dirname, '..');
const WORKSPACES_DIR = path.join(CLI_ROOT, '.prototipe', 'workspaces');

export class FeatureVerificationRunner {
  /**
   * Crea un Workspace Candidato, inyecta la feature y compila para verificar la estabilidad.
   * @param {string} operationId - ID único de la transacción
   * @param {string} featureId - ID de la feature en staging
   * @param {string} featureStagingDir - Ruta física de la feature en staging temporal
   * @param {Object} payload - Metadatos de la feature
   * @returns {Promise<{ success: boolean, error?: string, buildOutput?: string }>}
   */
  static async verify(operationId, featureId, featureStagingDir, payload) {
    const candidateWorkspacePath = path.join(WORKSPACES_DIR, operationId);
    const templateAppVentas = path.join(CLI_ROOT, '..', 'Plantillas Core', 'App Ventas');
    
    console.log(`[VerificationRunner] Inicializando workspace candidato en: ${candidateWorkspacePath}`);
    
    try {
      // 1. Clonar estructura limpia de la plantilla base en el workspace candidato
      await fs.ensureDir(candidateWorkspacePath);
      // Copiar todos los archivos omitiendo node_modules y dist para velocidad y espacio
      await fs.copy(templateAppVentas, candidateWorkspacePath, {
        filter: (src) => {
          const normalized = src.replace(/\\/g, '/');
          return !normalized.includes('/node_modules') && !normalized.includes('/dist') && !normalized.includes('/.git');
        }
      });

      // Creación del enlace simbólico o copia física de node_modules del padre para resolver importaciones y build
      const parentNodeModules = path.join(templateAppVentas, 'node_modules');
      const candidateNodeModules = path.join(candidateWorkspacePath, 'node_modules');
      
      console.log('[VerificationRunner] Creando enlace simbólico a node_modules...');
      try {
        await fs.symlink(parentNodeModules, candidateNodeModules, 'dir');
      } catch (symLinkErr) {
        // Fallback en Windows si no tiene permisos de symlink (Modo Desarrollador desactivado)
        console.warn(`[VerificationRunner] Fallback: Copiando node_modules físicamente debido a restricciones de enlace: ${symLinkErr.message}`);
        // Para evitar copia física masiva (muy lenta), igual podemos intentar junction en Windows
        if (process.platform === 'win32') {
          await fs.symlink(parentNodeModules, candidateNodeModules, 'junction');
        } else {
          throw symLinkErr;
        }
      }

      // 2. Inyectar la feature scaffold en el workspace candidato
      const destFeaturePath = path.join(candidateWorkspacePath, 'src', 'features', featureId);
      await fs.copy(featureStagingDir, destFeaturePath);

      // 3. Simular la actualización del feature-registry.json y correr el Generador de Artefactos local
      const localRegistryPath = path.join(candidateWorkspacePath, 'feature-registry.simulated.json');
      const baseRegistryPath = path.join(CLI_ROOT, 'knowledge', 'feature-registry.json');
      const registryData = await fs.readJson(baseRegistryPath);
      
      // Añadir la feature simulada al registro temporal
      registryData.features.push({
        id: featureId,
        displayName: payload.displayName,
        version: payload.version || '1.0.0',
        category: payload.category || 'commerce',
        description: payload.description || '',
        dependencies: payload.dependencies || [],
        tags: payload.tags || [],
        status: 'stable'
      });

      await fs.writeJson(localRegistryPath, registryData, { spaces: 2 });

      console.log('[VerificationRunner] Generando artefactos en el workspace candidato...');
      const generator = new FeatureArtifactGenerator(localRegistryPath);
      await generator.generate(candidateWorkspacePath);

      // 4. Ejecutar el build de Vite en el workspace candidato
      console.log('[VerificationRunner] Ejecutando compilación del build candidato (Vite)...');
      
      const buildResult = await this.runBuildCommand(candidateWorkspacePath);
      
      if (!buildResult.success) {
        return {
          success: false,
          error: `Fallo de compilación o linter en el workspace candidato. Detalle:\n${buildResult.output}`,
          buildOutput: buildResult.output
        };
      }

      console.log('[VerificationRunner] Certificación de build completada exitosamente.');
      return {
        success: true,
        buildOutput: buildResult.output
      };

    } catch (err) {
      console.error('[VerificationRunner] Error en el runner de verificación:', err);
      return {
        success: false,
        error: `Fallo durante el flujo de verificación: ${err.message}`
      };
    } finally {
      // Limpieza segura del workspace candidato
      console.log('[VerificationRunner] Limpiando el workspace candidato...');
      try {
        await fs.remove(candidateWorkspacePath);
      } catch (cleanErr) {
        console.warn(`[VerificationRunner] Advertencia: No se pudo eliminar completamente ${candidateWorkspacePath}: ${cleanErr.message}`);
      }
    }
  }

  /**
   * Corre el build mediante spawn de forma multiplataforma y asíncrona.
   */
  static runBuildCommand(cwd) {
    return new Promise((resolve) => {
      const isWin = process.platform === 'win32';
      const command = isWin ? 'npm.cmd' : 'npm';
      
      // stdio: pipe para capturar outputs sin bloquear buffers
      const child = spawn(command, ['run', 'build'], {
        cwd,
        shell: isWin,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          output
        });
      });

      child.on('error', (err) => {
        resolve({
          success: false,
          output: `Error al iniciar el subproceso de compilación: ${err.message}`
        });
      });
    });
  }
}
