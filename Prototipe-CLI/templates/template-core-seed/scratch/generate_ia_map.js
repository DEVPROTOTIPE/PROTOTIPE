/**
 * 🗺️ GENERADOR AUTOMATIZADO DE MAPAS DE ARQUITECTURA PARA INTELIGENCIA ARTIFICIAL
 * Ubicación: D:\PROTOTIPE\Prototipe-CLI\templates\template-core-seed\scratch\generate_ia_map.js
 * 
 * Este script escanea de forma recursiva la carpeta /src/ del proyecto,
 * analiza los imports y estructura de los archivos, y compila un mapa semántico
 * optimizado para que cualquier IA asimile la arquitectura del proyecto instantáneamente.
 */

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, basename, relative, extname } from 'path';

// Leer argumentos de consola para portabilidad en cualquier proyecto
const args = process.argv.slice(2);
const srcArg = args.find(arg => arg.startsWith('--src='));
const outputArg = args.find(arg => arg.startsWith('--output='));

const srcFolder = srcArg ? srcArg.split('=')[1] : 'src';
const outputName = outputArg ? outputArg.split('=')[1] : 'mapa_arquitectura_ia.md';

const SRC_DIR = join(process.cwd(), srcFolder);
const OUTPUT_FILE = join(process.cwd(), outputName);
const IGNORE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.ico', '.webp', '.woff', '.woff2'];

function getFilesRecursively(dir) {
  let results = [];
  const list = readdirSync(dir);
  list.forEach(file => {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else {
      if (!IGNORE_EXTENSIONS.includes(extname(fullPath))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileBaseName = basename(filePath);
  
  // 1. Extraer primer comentario largo o línea de documentación (Propósito)
  let purpose = 'Componente o módulo funcional de la aplicación.';
  const firstLines = lines.slice(0, 15).join('\n');
  const commentMatch = firstLines.match(/\/\*\*?([\s\S]*?)\*\//) || firstLines.match(/\/\/\s*(.*)/);
  if (commentMatch) {
    const cleanComment = commentMatch[1]
      .replace(/\*+/g, '')
      .replace(/\n\s*/g, ' ')
      .trim();
    if (cleanComment && cleanComment.length > 5 && !cleanComment.includes('import')) {
      purpose = cleanComment;
    }
  }

  // 2. Identificar el Rol técnico en base a la ubicación y contenido
  let rol = 'Utilidad/Helper';
  if (filePath.includes('pages')) rol = 'Página / Vista (Vistas principales de navegación)';
  else if (filePath.includes('components')) rol = 'Componente UI (Interfaz de usuario reusable)';
  else if (filePath.includes('store')) rol = 'Estado Global (Zustand Store de sincronización)';
  else if (filePath.includes('hooks')) rol = 'Hook Custom (Lógica reactiva modular)';
  else if (filePath.includes('services')) rol = 'Servicio de Backend / API (Integración de persistencia)';
  else if (filePath.includes('routes')) rol = 'Enrutador (Navegación de vistas)';

  // 3. Rastrear dependencias clave (Imports de la biblioteca o de src)
  const imports = [];
  lines.forEach(line => {
    if (line.startsWith('import ')) {
      const match = line.match(/from\s+['"](.*)['"]/);
      if (match) {
        const importPath = match[1];
        if (importPath.startsWith('.') || importPath.startsWith('@') || importPath.includes('store') || importPath.includes('services')) {
          imports.push(basename(importPath));
        }
      }
    }
  });

  return {
    name: fileBaseName,
    relPath: relative(process.cwd(), filePath).replace(/\\/g, '/'),
    absPath: filePath.replace(/\\/g, '/'),
    rol,
    purpose,
    imports: imports.slice(0, 6) // Limitar a las 6 primeras dependencias críticas
  };
}

function generateMarkdownMap() {
  console.log('⏳ Iniciando escaneo e indexación de archivos de código...');
  
  if (!existsSync(SRC_DIR)) {
    console.error(`❌ ERROR: No se encontró la carpeta /src/ en: ${SRC_DIR}`);
    process.exit(1);
  }

  const allFiles = getFilesRecursively(SRC_DIR);
  const analyzedFiles = allFiles.map(file => analyzeFile(file));

  // Agrupar por rol
  const grouped = {};
  analyzedFiles.forEach(file => {
    if (!grouped[file.rol]) grouped[file.rol] = [];
    grouped[file.rol].push(file);
  });

  let mdContent = `# 🗺️ Mapa de Arquitectura y Rutas Semánticas para Inteligencia Artificial\n\n`;
  mdContent += `> [!IMPORTANT]\n`;
  mdContent += `> **INSTRUCCIONES PARA LA IA:** Lee este archivo para comprender instantáneamente la estructura física, los roles de los módulos y las dependencias de este proyecto. Utiliza los enlaces directos en formato URL absoluta para abrir o editar archivos directamente sin realizar búsquedas recursivas (grep) innecesarias en el espacio de trabajo.\n\n`;
  mdContent += `---\n\n`;
  mdContent += `## 📂 Directorio de Archivos y Roles Técnicos\n\n`;

  // Compilar secciones
  Object.keys(grouped).sort().forEach(rol => {
    mdContent += `### ⚙️ ${rol}\n\n`;
    mdContent += `| Nombre del Archivo | Propósito del Módulo | Dependencias Críticas | Ruta de Acceso Directo |\n`;
    mdContent += `| :--- | :--- | :--- | :--- |\n`;
    
    grouped[rol].forEach(file => {
      const deps = file.imports.length > 0 ? file.imports.map(d => `\`${d}\``).join(', ') : 'Ninguna';
      mdContent += `| **${file.name}** | ${file.purpose} | ${deps} | [Abrir Archivo](file:///${file.absPath}) |\n`;
    });
    mdContent += '\n';
  });

  // Agregar Prompt de Asimilación al final
  mdContent += `---\n\n`;
  mdContent += `## 📐 Prompt de Asimilación del Entorno (Para la IA)\n`;
  mdContent += `Cuando te sea provisto este mapa:\n`;
  mdContent += `1. **Asimila el Dominio:** Identifica qué páginas de negocio interactúan con qué servicios o almacenes de Zustand.\n`;
  mdContent += `2. **Navegación Directa:** Cuando debas modificar código, utiliza estrictamente las rutas absolutas indicadas en la tabla anterior en tus herramientas de edición o lectura de archivos para ahorrar ciclos de búsqueda.\n`;
  mdContent += `3. **Análisis de Impacto:** Antes de refactorizar un archivo, revisa la columna "Dependencias Críticas" para prevenir regresiones en componentes que lo consuman.\n`;

  writeFileSync(OUTPUT_FILE, mdContent, 'utf8');
  console.log(`✅ MAPA SEMÁNTICO PARA IA GENERADO EXITOSAMENTE.`);
  console.log(`   Ubicación: ${OUTPUT_FILE}`);
}

generateMarkdownMap();
