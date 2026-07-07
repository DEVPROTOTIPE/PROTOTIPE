import fs from 'fs';
import path from 'path';

const GIT_ROOT = 'd:\\PROTOTIPE';
const docRoot = path.join(GIT_ROOT, 'Documentacion PROTOTIPE');
const roadmapPath = path.join(docRoot, '02_Tareas_Roadmap', 'tareas_pendientes.md');
const bitacoraCurrentPath = path.join(docRoot, '03_Auditorias_y_Faro_Core', 'bitacora_cambios.md');
const bitacoraHeadPath = path.join(GIT_ROOT, 'scratch', 'bitacora_head.md');

async function run() {
  // Regenerar el bitacora_head.md para asegurar consistencia
  try {
    const { execSync } = await import('child_process');
    execSync('git show "HEAD:Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md" > scratch/bitacora_head.md', { cwd: GIT_ROOT });
  } catch (err) {
    console.error("Fallo al obtener HEAD de la bitacora:", err.message);
  }

  if (!fs.existsSync(roadmapPath) || !fs.existsSync(bitacoraCurrentPath) || !fs.existsSync(bitacoraHeadPath)) {
    console.log("No se encontraron los archivos necesarios.");
    return;
  }

  const roadmapContent = fs.readFileSync(roadmapPath, 'utf8');
  const bitacoraCurrentContent = fs.readFileSync(bitacoraCurrentPath, 'utf8');
  const bitacoraHeadContent = fs.readFileSync(bitacoraHeadPath, 'utf8');

  // 1. Obtener todas las tareas del roadmap
  const allRoadmapTasks = [];
  const roadmapLines = roadmapContent.split('\n');
  
  for (let i = 0; i < roadmapLines.length; i++) {
    const line = roadmapLines[i];
    const match = /^\s*[-*]\s+(?:\*\*)?\[([ x])\]\s+(?:~~)?(?:Tarea\s+)?((?:CORE|CLI|DASH|TPL|PLT|INST|DOC|LND|BIZ)-\d+):\s*(.*?)(?:~~)?(?:\*\*|$)/i.exec(line);
    if (match) {
      const completed = match[1].toLowerCase() === 'x';
      const id = match[2].toUpperCase();
      const title = match[3].replace(/~~/g, '').trim();
      const details = [];
      
      let j = i + 1;
      while (j < roadmapLines.length) {
        const nextLine = roadmapLines[j];
        if (/^\s*[-*]\s+(?:\*\*)?\[[ x]\]/i.test(nextLine)) {
          break;
        }
        if (nextLine.trim()) {
          details.push(nextLine.trim());
        }
        j++;
      }
      allRoadmapTasks.push({ id, title, completed, details });
    }
  }

  // 2. Parsear las entradas de la bitácora original (del HEAD de Git)
  const headEntries = [];
  const headerText = bitacoraHeadContent.split('### [')[0];
  
  const entryRegex = /###\s+\[([0-9-]+)\]\s+-\s+([^\n]+)([\s\S]*?)(?=\n###\s+\[|$)/gi;
  let em;
  while ((em = entryRegex.exec(bitacoraHeadContent)) !== null) {
    const date = em[1];
    const rawTitle = em[2].trim();
    const body = em[3].trim();
    
    const idMatch = /^((?:CORE|CLI|DASH|TPL|PLT|INST|DOC|LND|BIZ)-\d+)\s*:\s*(.*)/i.exec(rawTitle);
    let id = null;
    let cleanTitle = rawTitle;
    if (idMatch) {
      id = idMatch[1].toUpperCase();
      cleanTitle = idMatch[2].trim();
    }
    
    headEntries.push({ date, id, rawTitle, cleanTitle, body });
  }

  // Mapear entradas del HEAD a tareas del roadmap si no tienen ID
  headEntries.forEach(entry => {
    if (!entry.id) {
      const cleanEntryTitle = entry.cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchedTask = allRoadmapTasks.find(t => {
        const cleanTaskTitle = t.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanEntryTitle.includes(cleanTaskTitle) || cleanTaskTitle.includes(cleanEntryTitle);
      });
      
      if (matchedTask) {
        entry.id = matchedTask.id;
      }
    }
  });

  // 3. Obtener las entradas de la bitácora actual (del archivo físico actual)
  const currentEntries = [];
  let cm;
  while ((cm = entryRegex.exec(bitacoraCurrentContent)) !== null) {
    const date = cm[1];
    const rawTitle = cm[2].trim();
    const body = cm[3].trim();
    const idMatch = /^((?:CORE|CLI|DASH|TPL|PLT|INST|DOC|LND|BIZ)-\d+)\s*:\s*(.*)/i.exec(rawTitle);
    let id = null;
    if (idMatch) {
      id = idMatch[1].toUpperCase();
    }
    currentEntries.push({ date, id, rawTitle, body });
  }

  // 4. Consolidar
  const finalEntriesMap = new Map();

  // A. Cargar primero las entradas del HEAD (con su cuerpo original)
  headEntries.forEach(entry => {
    const titleWithId = entry.id ? `${entry.id}: ${entry.cleanTitle}` : entry.rawTitle;
    const rawContent = `### [${entry.date}] - ${titleWithId}\n\n${entry.body}`;
    const key = entry.id || `NOID-${entry.date}-${entry.cleanTitle}`;
    finalEntriesMap.set(key, { date: entry.date, id: entry.id, rawContent });
  });

  // B. Cargar con las entradas nuevas del archivo actual (ej: CORE-266, CORE-267)
  currentEntries.forEach(entry => {
    if (entry.id) {
      const rawContent = `### [${entry.date}] - ${entry.rawTitle}\n\n${entry.body}`;
      finalEntriesMap.set(entry.id, { date: entry.date, id: entry.id, rawContent });
    }
  });

  // C. Encontrar tareas completadas en el roadmap que aún no tengan entrada en el mapa
  const completedTasks = allRoadmapTasks.filter(t => t.completed);
  completedTasks.forEach(task => {
    if (!finalEntriesMap.has(task.id)) {
      console.log(`Generando entrada para: ${task.id} (${task.title})`);
      
      let date = '2026-07-06'; // default
      const fechaRegLine = task.details.find(d => /fecha/i.test(d));
      if (fechaRegLine) {
        const dateMatch = /(\d{4}-\d{2}-\d{2})/.exec(fechaRegLine);
        if (dateMatch) {
          date = dateMatch[1];
        }
      }

      let desc = '';
      const descLine = task.details.find(d => /descripci[oó]n:/i.test(d));
      if (descLine) {
        desc = descLine.replace(/^-?\s*descripci[oó]n:\s*/i, '').trim();
      } else {
        desc = `Finalización de la tarea: ${task.title}.`;
      }

      const fileLines = [];
      const filesLine = task.details.find(d => /archivo/i.test(d));
      if (filesLine) {
        const cleanFiles = filesLine.replace(/^-?\s*archivos?:\s*/i, '').trim();
        const filesArray = cleanFiles.split(',').map(f => f.trim()).filter(Boolean);
        filesArray.forEach(f => {
          let cleanName = f.replace(/[`'"]/g, '');
          const linkMatch = /\[(.*?)\]\((.*?)\)/.exec(cleanName);
          if (linkMatch) {
            cleanName = linkMatch[1];
          }
          fileLines.push(cleanName);
        });
      }

      const isCli = task.id.startsWith('CLI');
      const tipo = isCli ? 'CLI / Automatización / Bridge Server' : 'Core / UI / Optimización';
      const cleanId = task.id.replace(/-/g, '');
      const cleanTitleSlug = task.title.toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .split(/\s+/)
        .slice(0, 5)
        .join('-');
      const firma = `${cleanId}-${cleanTitleSlug}`;

      let filesMarkdown = '    - Registro de documentación física.';
      if (fileLines.length > 0) {
        filesMarkdown = fileLines.map(f => `    - \`${f.replace(/[\[\]]/g, '')}\``).join('\n');
      }

      const rawContent = `### [${date}] - ${task.id}: ${task.title}

* **Tipo:** ${tipo}
* **Firma:** ${firma}
* **Descripción:**
  - **Causa:** Evolución y estabilidad de la plataforma bajo la tarea registrada en la hoja de ruta.
  - **Solución:**
    1. ${desc}
  - **Archivos:**
${filesMarkdown}`;

      finalEntriesMap.set(task.id, { date, id: task.id, rawContent });
    }
  });

  // 5. Ordenar todas las entradas unificadas por fecha descendente
  const finalEntriesList = Array.from(finalEntriesMap.values());
  finalEntriesList.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    if (a.id && b.id) {
      const numA = parseInt(a.id.split('-')[1]);
      const numB = parseInt(b.id.split('-')[1]);
      return numB - numA;
    }
    return 0;
  });

  // 6. Escribir el nuevo archivo consolidado en UTF-8
  const newContent = headerText.trim() + '\n\n' + finalEntriesList.map(e => e.rawContent).join('\n\n') + '\n';
  fs.writeFileSync(bitacoraCurrentPath, newContent, 'utf8');
  console.log("¡Consolidación exitosa! Bitácora unificada con CORE-267.");
}

run();
