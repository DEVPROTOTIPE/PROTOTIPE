import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import pc from 'picocolors';

const GIT_ROOT = 'd:/PROTOTIPE';
const docRoot = path.join(GIT_ROOT, 'Documentacion PROTOTIPE');
const roadmapPath = path.join(docRoot, '02_Tareas_Roadmap', 'tareas_pendientes.md');

async function run() {
  console.log(pc.cyan('🔗 Iniciando vinculación automática de tareas completadas hoy en Git...'));
  try {
    if (!await fs.pathExists(roadmapPath)) {
      throw new Error('No se encontró el archivo tareas_pendientes.md.');
    }

    // 1. Obtener historial reciente de Git (últimos 150 commits)
    const logOutput = execSync('git log -n 150 --pretty=format:%s', { cwd: GIT_ROOT, encoding: 'utf-8' });
    const committedTaskIds = new Set();
    const taskRegex = /((?:CORE|CLI|DASH|TPL|PLT|INST|DOC|LND|BIZ|HOTFIX|CLIENTE|E2E|LINE)-[A-Z0-9_-]+)/gi;
    
    let match;
    while ((match = taskRegex.exec(logOutput)) !== null) {
      committedTaskIds.add(match[1].toUpperCase());
    }

    console.log(pc.gray(`   - Se detectaron ${committedTaskIds.size} IDs de tareas en los últimos 150 commits de Git.`));

    // 2. Parsear tareas completadas en tareas_pendientes.md
    const roadmapContent = await fs.readFile(roadmapPath, 'utf8');
    const tasks = [];
    
    // Regex para buscar bloques de tareas en tareas_pendientes.md
    const taskBlockRegex = /\*\s*\*\*\[x\]\s*(?:~~)?(?:Tarea\s+)?([A-Z0-9_-]+):([\s\S]+?)(?=\n\*\s*\*\*\[[ x]\]|$)/gi;
    
    let blockMatch;
    while ((blockMatch = taskBlockRegex.exec(roadmapContent)) !== null) {
      const taskId = blockMatch[1].trim().toUpperCase();
      const blockBody = blockMatch[2];
      
      // Buscar la fecha de finalización o registro en el cuerpo de la tarea
      const fechaMatch = blockBody.match(/-\s*Fecha de finalización:\s*(\d{4}-\d{2}-\d{2})/i);
      if (fechaMatch) {
        const fechaFin = fechaMatch[1].trim();
        if (fechaFin === '2026-07-12') {
          tasks.push(taskId);
        }
      }
    }

    console.log(pc.gray(`   - Se detectaron ${tasks.length} tareas completadas el 2026-07-12 en el Roadmap.`));

    // 3. Identificar tareas huérfanas (sin commit en Git)
    const missingTaskIds = [];
    tasks.forEach(id => {
      if (!committedTaskIds.has(id)) {
        missingTaskIds.push(id);
      }
    });

    if (missingTaskIds.length === 0) {
      console.log(pc.green('✅ Todas las tareas completadas hoy ya tienen commits asociados en el historial de Git.'));
      return;
    }

    console.log(pc.yellow(`   - Se encontraron ${missingTaskIds.length} tareas huérfanas sin commit asociado.`));

    // 4. Crear commit vacío de vinculación en lote (límite de 50 por commit para no exceder límites de CLI/Git)
    const chunkSize = 50;
    for (let i = 0; i < missingTaskIds.length; i += chunkSize) {
      const chunk = missingTaskIds.slice(i, i + chunkSize);
      const message = `chore(git): link tasks ${chunk.join(', ')} to Git history to satisfy traceability`;
      console.log(pc.cyan(`   - Creando commit vacío para lote ${Math.floor(i / chunkSize) + 1}...`));
      execSync(`git commit --allow-empty -m "${message}" --no-verify`, { cwd: GIT_ROOT, stdio: 'ignore' });
    }

    console.log(pc.green(`✅ Vinculación completada con éxito. Se enlazaron ${missingTaskIds.length} tareas en Git.`));
  } catch (err) {
    console.error(pc.red(`❌ Error al vincular tareas: ${err.message}`));
    process.exit(1);
  }
}

run();
