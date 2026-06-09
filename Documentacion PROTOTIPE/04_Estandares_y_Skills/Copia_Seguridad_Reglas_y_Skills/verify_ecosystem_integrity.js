const fs = require('fs');
const path = require('path');

// Rutas base
const WORKSPACE_DIR = 'D:\\PROTOTIPE';
const CORES_DIR = path.join(WORKSPACE_DIR, 'Plantillas Core');
const DOCS_DIR = path.join(WORKSPACE_DIR, 'Documentacion PROTOTIPE');
const SOURCE_GEMINI = path.join(__dirname, 'GEMINI.md');

const MAPA_DOC_IA_PATH = path.join(DOCS_DIR, '04_Estandares_y_Skills', 'mapa_documentacion_ia.md');
const MAPA_APP_PATH = path.join(DOCS_DIR, '04_Estandares_y_Skills', 'mapa_aplicacion.md');

// Listado de los 12 archivos de documentación obligatorios por core (estándar v2)
const standardFiles = [
  { name: 'tareas_pendientes.md', title: 'Control de Tareas y Estado de Implementación', desc: 'Roadmap local y backlog de tareas pendientes y completadas para este core.' },
  { name: 'bitacora_cambios.md', title: 'Bitácora de Cambios y Control de Versiones', desc: 'Historial detallado de cambios técnicos, bugs resueltos y refactorizaciones.' },
  { name: 'mapa_aplicacion.md', title: 'Mapa de la Aplicación (Arquitectura Física)', desc: 'Descripción estructurada de módulos, vistas, layouts e integraciones de Firebase.' },
  { name: 'esquema_colecciones.md', title: 'Esquema y Propósito de Colecciones de Base de Datos (Firestore)', desc: 'Modelado de datos, propósito de cada colección e índices requeridos.' },
  { name: 'plan_implementacion_ia.md', title: 'Plan de Implementación y Roadmaps de Inteligencia Artificial', desc: 'Propuestas de integraciones cognitivas y automatizaciones con IAs en este core.' },
  { name: 'manual_migracion.md', title: 'Manual de Despliegue y Configuraciones Locales', desc: 'Especificaciones locales de migración, feature flags de Firebase y Vertex AI.' },
  { name: 'flujos_aplicacion.md', title: 'Flujos Operativos y Diagramas de Secuencia', desc: 'Memoria operativa de los flujos de datos críticos y secuencia de interacción.' },
  { name: 'mapa_arquitectura.md', title: 'Mapa de Arquitectura Física y Árbol de Código', desc: 'Árbol completo de directorios y responsabilidades por capa del proyecto.' },
  { name: 'mapa_arquitectura_ia.md', title: 'Mapa Semántico de Rutas para Inteligencia Artificial', desc: 'Mapa estructurado de archivos de código con dependencias críticas y accesos directos.' },
  // ─── NUEVOS: CRÍTICOS PARA CONTEXTO DE IA ───────────────────────────────────
  { name: 'contexto_negocio.md', title: 'Contexto de Negocio y Reglas Operativas del Dominio', desc: 'Descripción del usuario final, flujos de negocio en lenguaje natural, reglas de dominio implícitas y KPIs del cliente. CRÍTICO para que la IA genere lógica semánticamente correcta.' },
  { name: 'restricciones_tecnicas.md', title: 'Restricciones Técnicas y Patrones Prohibidos', desc: 'Versiones fijadas de dependencias críticas con su justificación, patrones de código prohibidos en este core, limitaciones de infraestructura conocidas y decisiones de arquitectura no negociables.' },
  { name: 'guia_estilos_ui.md', title: 'Guía de Estilos de UI y Sistema de Diseño del Core', desc: 'Paleta HSL del core, tokens de diseño (tipografía, spacing, breakpoints), componentes atómicos disponibles en /src/components/ui/ y convenciones de naming que la IA debe respetar obligatoriamente.' }
];

console.log('🏁 INICIANDO VERIFICACIÓN DE INTEGRIDAD Y REGLAS DE IA...');

// ==========================================
// 1. AUTOSINCRONIZACIÓN DE REGLAS DE IA (GEMINI.md)
// ==========================================
console.log('\n🔄 Sincronizando GEMINI.md...');
const sourceGeminiContent = fs.readFileSync(SOURCE_GEMINI, 'utf8');
const geminiTargets = [];

function scanForGeminiTargets(baseDir) {
  if (!fs.existsSync(baseDir)) return;
  try {
    const dirs = fs.readdirSync(baseDir, { withFileTypes: true });
    dirs.forEach(dirent => {
      if (dirent.isDirectory()) {
        const dirPath = path.join(baseDir, dirent.name);
        if (dirent.name !== 'Documentacion PROTOTIPE' && 
            (fs.existsSync(path.join(dirPath, '.git')) || fs.existsSync(path.join(dirPath, 'package.json')))) {
          geminiTargets.push(path.join(dirPath, 'GEMINI.md'));
        }
      }
    });
  } catch (err) {
    console.error(`⚠️ Advertencia al escanear targets para GEMINI: ${err.message}`);
  }
}

// Escanear ubicaciones
scanForGeminiTargets(WORKSPACE_DIR);
scanForGeminiTargets('D:\\Aplicaciones');
scanForGeminiTargets(CORES_DIR);
scanForGeminiTargets(path.join(WORKSPACE_DIR, 'Central PROTOTIPE'));
if (fs.existsSync(path.join(WORKSPACE_DIR, 'Prototipe-CLI', 'templates'))) {
  scanForGeminiTargets(path.join(WORKSPACE_DIR, 'Prototipe-CLI', 'templates'));
}

let geminiUpdated = 0;
geminiTargets.forEach(targetPath => {
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) return;
  
  let currentContent = '';
  if (fs.existsSync(targetPath)) {
    currentContent = fs.readFileSync(targetPath, 'utf8');
  }
  
  if (currentContent !== sourceGeminiContent) {
    fs.writeFileSync(targetPath, sourceGeminiContent, 'utf8');
    console.log(`  ✅ Sincronizado GEMINI.md en: ${targetPath}`);
    geminiUpdated++;
  }
});
console.log(`- GEMINI.md verificado en ${geminiTargets.length} destinos (${geminiUpdated} actualizados).`);


// ==========================================
// 2. ESTANDARIZACIÓN DE DOCUMENTACIÓN EN CORES
// ==========================================
console.log('\n📂 Verificando carpetas de documentación en plantillas core...');
const activeCores = [];

if (fs.existsSync(CORES_DIR)) {
  const cores = fs.readdirSync(CORES_DIR, { withFileTypes: true });
  cores.forEach(dirent => {
    if (dirent.isDirectory()) {
      const corePath = path.join(CORES_DIR, dirent.name);
      const docDirName = `Documentacion ${dirent.name}`;
      const docPath = path.join(corePath, docDirName);
      
      activeCores.push({
        name: dirent.name,
        docPath,
        docDirName
      });

      // Crear directorio si no existe
      if (!fs.existsSync(docPath)) {
        fs.mkdirSync(docPath, { recursive: true });
        console.log(`  🆕 Creado directorio de documentación local: ${docDirName}`);
      }

      // Validar cada uno de los 9 archivos obligatorios
      standardFiles.forEach(fileSpec => {
        const filePath = path.join(docPath, fileSpec.name);
        if (!fs.existsSync(filePath)) {
          const content = `# 📑 ${fileSpec.title} — ${dirent.name}

Este documento contiene el ${fileSpec.title.toLowerCase()} específico para la plantilla core **${dirent.name}**.

---

## ℹ️ Propósito
${fileSpec.desc}

---

## 🗂️ Registro Inicial (${new Date().toISOString().split('T')[0]})
* Estado inicial creado y estandarizado mediante script de control de ecosistema.
`;
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`  📄 Inicializado archivo faltante: ${docDirName}/${fileSpec.name}`);
        }
      });
    }
  });
}
console.log(`- Carpetas de documentación verificado para ${activeCores.length} cores.`);


// ==========================================
// 3. AUTOINDEXACIÓN EN MAPA DE DOCUMENTACIÓN (mapa_documentacion_ia.md)
// ==========================================
console.log('\n🗺️ Sincronizando mapa semántico global (mapa_documentacion_ia.md)...');
if (fs.existsSync(MAPA_DOC_IA_PATH)) {
  let docIaContent = fs.readFileSync(MAPA_DOC_IA_PATH, 'utf8');
  
  // Localizar el inicio y fin de la sección autogenerada de Cores
  const startMark = '<!-- START_AUTO_CORES_DOCS -->';
  const endMark = '<!-- END_AUTO_CORES_DOCS -->';
  
  let newCoreLines = `${startMark}\n`;
  activeCores.forEach(core => {
    newCoreLines += `### 📂 Documentación local para ${core.name}\n`;
    newCoreLines += `| Archivo | Rol Técnico | Cuándo Usarlo (Criterio de Decisión IA) | Ruta de Acceso Directo |\n`;
    newCoreLines += `| :--- | :--- | :--- | :--- |\n`;
    standardFiles.forEach(fileSpec => {
      const relativeLink = `file:///D:/PROTOTIPE/Plantillas%20Core/${core.name}/${core.docDirName}/${fileSpec.name}`;
      newCoreLines += `| **${fileSpec.name} (${core.name})** | ${fileSpec.title} | Consultar tareas, bitácora o flujos específicos de este core. | [Ver Documento](${relativeLink}) |\n`;
    });
    newCoreLines += `\n`;
  });
  newCoreLines += endMark;

  if (docIaContent.includes(startMark) && docIaContent.includes(endMark)) {
    const regex = new RegExp(`${startMark}[\\s\\S]*?${endMark}`);
    docIaContent = docIaContent.replace(regex, newCoreLines);
  } else {
    // Si no tiene los tags, los insertamos en la Sección 1 (antes de Sección 2)
    const splitIndex = docIaContent.indexOf('## 📂 Sección 2');
    if (splitIndex !== -1) {
      docIaContent = docIaContent.slice(0, splitIndex) + '\n' + newCoreLines + '\n\n' + docIaContent.slice(splitIndex);
    } else {
      docIaContent += '\n\n' + newCoreLines;
    }
  }

  fs.writeFileSync(MAPA_DOC_IA_PATH, docIaContent, 'utf8');
  console.log('  ✅ Mapa semántico de documentación de IA actualizado.');
} else {
  console.warn('  ⚠️ No se encontró mapa_documentacion_ia.md para indexar.');
}


// ==========================================
// 4. AUTOINDEXACIÓN EN MAPA DE APLICACIÓN (mapa_aplicacion.md)
// ==========================================
console.log('\n🗺️ Sincronizando mapa de aplicación global (mapa_aplicacion.md)...');
if (fs.existsSync(MAPA_APP_PATH)) {
  let appMapContent = fs.readFileSync(MAPA_APP_PATH, 'utf8');

  const startMark = '<!-- START_AUTO_CORES_APP -->';
  const endMark = '<!-- END_AUTO_CORES_APP -->';

  let newCoreLines = `${startMark}\n`;
  activeCores.forEach(core => {
    newCoreLines += `### 📂 Carpeta del Core de ${core.name}\n`;
    standardFiles.forEach(fileSpec => {
      newCoreLines += `* **\`/Plantillas Core/${core.name}/${core.docDirName}/${fileSpec.name}\`**: ${fileSpec.title}.\n`;
    });
    newCoreLines += `\n`;
  });
  newCoreLines += endMark;

  if (appMapContent.includes(startMark) && appMapContent.includes(endMark)) {
    const regex = new RegExp(`${startMark}[\\s\\S]*?${endMark}`);
    appMapContent = appMapContent.replace(regex, newCoreLines);
  } else {
    const splitIndex = appMapContent.indexOf('## 📂 Estructura de Módulos');
    if (splitIndex !== -1) {
      appMapContent = appMapContent.slice(0, splitIndex) + '\n' + newCoreLines + '\n\n' + appMapContent.slice(splitIndex);
    } else {
      appMapContent += '\n\n' + newCoreLines;
    }
  }

  fs.writeFileSync(MAPA_APP_PATH, appMapContent, 'utf8');
  console.log('  ✅ Mapa de aplicación global actualizado.');
} else {
  console.warn('  ⚠️ No se encontró mapa_aplicacion.md para indexar.');
}

console.log('\n🎉 CONTROL DE INTEGRIDAD FINALIZADO CON ÉXITO.');
