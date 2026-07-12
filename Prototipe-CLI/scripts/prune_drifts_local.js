import fs from 'fs-extra';
import path from 'path';

const GIT_ROOT = 'd:/PROTOTIPE';
const docRoot = path.join(GIT_ROOT, 'Documentacion PROTOTIPE');
const roadmapPath = path.join(docRoot, '02_Tareas_Roadmap', 'tareas_pendientes.md');

const filesToPrune = [
  { id: 'CLI-392', file: 'Instancias Clientes/seed/App-clinic-e2e-app/prototipe.lock.json' },
  { id: 'CLI-392', file: 'Instancias Clientes/seed/App-clinica-veterinaria-sanitas/prototipe.lock.json' },
  { id: 'CLI-392', file: 'Instancias Clientes/seed/App-crm-e2e-app/prototipe.lock.json' },
  { id: 'CLI-392', file: 'Instancias Clientes/seed/App-e2e-test-clinic/prototipe.lock.json' },
  { id: 'CLI-392', file: 'Instancias Clientes/seed/App-e2e-test-empty/prototipe.lock.json' },
  { id: 'CLI-392', file: 'Instancias Clientes/seed/App-empty-e2e-app/prototipe.lock.json' },
  { id: 'CLI-392', file: 'Instancias Clientes/seed/App-restaurante-e2e-app/prototipe.lock.json' },
  { id: 'CLI-392', file: 'Instancias Clientes/seed/App-retail-e2e-app/prototipe.lock.json' },
  { id: 'CLI-367', file: 'Instancias Clientes/seed/App-clinic-e2e-app/prototipe.lock.json' },
  { id: 'CLI-367', file: 'Instancias Clientes/seed/App-clinica-veterinaria-sanitas/prototipe.lock.json' },
  { id: 'CLI-367', file: 'Instancias Clientes/seed/App-crm-e2e-app/prototipe.lock.json' },
  { id: 'CLI-367', file: 'Instancias Clientes/seed/App-e2e-test-clinic/prototipe.lock.json' },
  { id: 'CLI-367', file: 'Instancias Clientes/seed/App-e2e-test-empty/prototipe.lock.json' },
  { id: 'CLI-367', file: 'Instancias Clientes/seed/App-empty-e2e-app/prototipe.lock.json' },
  { id: 'CLI-367', file: 'Instancias Clientes/seed/App-restaurante-e2e-app/prototipe.lock.json' },
  { id: 'CLI-367', file: 'Instancias Clientes/seed/App-retail-e2e-app/prototipe.lock.json' },
  { id: 'CORE-328', file: 'Plantillas Core/App Ventas/src/services/orderService.js' }
];

async function run() {
  console.log('🧹 Iniciando purga local de referencias obsoletas en tareas_pendientes.md...');
  try {
    if (!await fs.pathExists(roadmapPath)) {
      throw new Error('No se encontró tareas_pendientes.md');
    }

    let roadmapContent = await fs.readFile(roadmapPath, 'utf8');
    let updatedRoadmap = roadmapContent;
    let prunedCount = 0;

    for (const item of filesToPrune) {
      const idRegex = /(?:[a-zA-Z]+)-(\d+)|Tarea[- ](\d+)/i;
      const match = item.id.match(idRegex);
      if (!match) continue;
      const taskNum = match[1] || match[2];

      const blockRegex = new RegExp(`(\\*\\s*\\*\\*\\[[ x]\\]\\s*(?:~~)?(?:Tarea\\s+)?(?:[a-zA-Z]+-)?${taskNum}:[\\s\\S]+?)(?=\\n\\*\\s*\\*\\*\\[[ x]\\]|$)`, 'i');
      const blockMatch = updatedRoadmap.match(blockRegex);
      if (blockMatch) {
        let taskBlock = blockMatch[1];
        const lines = taskBlock.split(/\r?\n/);
        const updatedLines = lines.map(line => {
          const trimmed = line.trim();

          // Caso A: Línea con formato "- Archivos: ..."
          if (trimmed.startsWith('- Archivos:')) {
            const inlineRest = line.replace(/^\s*-\s*Archivos:\s*/i, '').trim();
            const inlineFileRegex = /\[`?([^`\]]+)`?\]\(([^)]+)\)(?:\s*\[[A-Z/]+\])?/g;
            let fm;
            const remainingFiles = [];
            while ((fm = inlineFileRegex.exec(inlineRest)) !== null) {
              const fileName = fm[1];
              if (fileName.trim() !== item.file.trim()) {
                remainingFiles.push(fm[0]);
              }
            }
            if (remainingFiles.length > 0) {
              const indent = line.match(/^\s*/)[0];
              return `${indent}- Archivos: ${remainingFiles.join(', ')}`;
            } else {
              return null;
            }
          }

          // Caso B: Línea que es una viñeta individual de archivo
          const bulletFileMatch = line.match(/^\s*-\s*\[`?([^`\]]+)`?\]\(([^)]+)\)(?:\s*\[[A-Z/]+\])?/);
          if (bulletFileMatch) {
            const fileName = bulletFileMatch[1];
            if (fileName.trim() === item.file.trim()) {
              return null;
            }
          }

          return line;
        }).filter(line => line !== null);

        const newTaskBlock = updatedLines.join('\n');
        updatedRoadmap = updatedRoadmap.replace(taskBlock, newTaskBlock);
        prunedCount++;
        console.log(`   - Purgada referencia obsoleta de task ${item.id}: ${item.file}`);
      }
    }

    if (prunedCount > 0) {
      await fs.writeFile(roadmapPath, updatedRoadmap, 'utf8');
      console.log(`✅ Purga completada. Se limpiaron ${prunedCount} registros rotos.`);
    } else {
      console.log('ℹ️ No se encontraron referencias para purgar.');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

run();
