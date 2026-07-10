#!/usr/bin/env node
/**
 * validate_bitacora.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Valida la integridad estructural de cualquier bitacora_cambios.md del
 * ecosistema PROTOTIPE. Detecta entradas malformadas: sin archivos, sin
 * cambios documentados o con secciones faltantes.
 *
 * Uso:
 *   node validate_bitacora.js                           → valida la bitácora global
 *   node validate_bitacora.js "ruta\a\bitacora.md"     → valida la bitácora indicada
 *
 * Códigos de salida:
 *   0 → Todo correcto
 *   1 → Se encontraron entradas malformadas (ver reporte)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── Configuración ─────────────────────────────────────────────────────────────

const DEFAULT_BITACORA = resolve(
  'D:\\PROTOTIPE\\Documentacion PROTOTIPE\\03_Auditorias_y_Faro_Core\\bitacora_cambios.md'
);

const TARGET_FILE = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_BITACORA;

// Patrón de cabecera de entrada válida
// Acepta: CLI-NNN, COMP-NNN, BUG-NNN, SYNC-NNN, o cualquier prefijo-NNN
const ENTRY_HEADER_REGEX = /^##\s+([A-Z]+-\d+)\s+[—–-]\s+(\d{4}-\d{2}-\d{2})/;

// Tags especiales que no requieren "Archivos modificados"
const BYPASS_TAGS = ['[MINOR]', '[BUILD_FAILED]', '[SYNC_FAILED]'];

// ── Colores de consola ────────────────────────────────────────────────────────
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

// ── Leer el archivo ───────────────────────────────────────────────────────────

if (!existsSync(TARGET_FILE)) {
  console.error(`${RED}✗ Archivo no encontrado: ${TARGET_FILE}${RESET}`);
  process.exit(1);
}

const content = readFileSync(TARGET_FILE, 'utf-8');
const lines = content.split('\n');

// ── Parser de entradas ────────────────────────────────────────────────────────

/**
 * Extrae todas las entradas del archivo como bloques de líneas.
 * Cada entrada comienza en un ## con patrón de ID.
 */
function parseEntries(lines) {
  const entries = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(ENTRY_HEADER_REGEX);

    if (headerMatch) {
      if (current) entries.push(current);
      current = {
        id: headerMatch[1],
        date: headerMatch[2],
        headerLine: i + 1,
        rawLines: [line],
        titleLine: '',
      };
    } else if (current) {
      current.rawLines.push(line);
      // La primera línea de texto después del header es el título
      if (!current.titleLine && line.trim().startsWith('**')) {
        current.titleLine = line.trim();
      }
    }
  }

  if (current) entries.push(current);
  return entries;
}

/**
 * Valida una entrada individual. Retorna un array de problemas encontrados.
 */
function validateEntry(entry) {
  const issues = [];
  const body = entry.rawLines.join('\n');

  // Verificar si es una entrada con tag de bypass
  const hasBypassTag = BYPASS_TAGS.some(tag => body.includes(tag));
  if (hasBypassTag) return issues; // Las entradas [MINOR] etc. son válidas sin secciones completas

  // 1. Verificar que tiene título descriptivo
  if (!entry.titleLine) {
    issues.push({
      severity: 'ERROR',
      msg: 'Falta la línea de título (**Tipo: Descripción**) inmediatamente después del header.'
    });
  }

  // 2. Verificar sección "Cambios realizados"
  const hasCambios = body.includes('### Cambios realizados') || body.includes('### Cambios realizados:');
  if (!hasCambios) {
    issues.push({
      severity: 'ERROR',
      msg: 'Falta la sección "### Cambios realizados:"'
    });
  } else {
    // Verificar que tiene al menos un ítem numerado
    const hasItem = /^\d+\.\s+\*\*/m.test(body);
    if (!hasItem) {
      issues.push({
        severity: 'WARNING',
        msg: 'La sección "Cambios realizados" no tiene ítems numerados (1. **Componente:**).'
      });
    }
  }

  // 3. Verificar sección "Archivos modificados"
  const hasArchivos = body.includes('### Archivos modificados') || body.includes('### Archivos modificados:');
  if (!hasArchivos) {
    issues.push({
      severity: 'ERROR',
      msg: 'Falta la sección "### Archivos modificados:". CRÍTICO: sin esta sección el sistema de tareas agrupa archivos incorrectamente.'
    });
  } else {
    // Verificar que tiene al menos un archivo listado
    const hasFile = /^-\s+\[`[^`]+`\]/m.test(body);
    if (!hasFile) {
      issues.push({
        severity: 'WARNING',
        msg: 'La sección "Archivos modificados" no tiene archivos con formato [`nombre`](ruta) [TAG].'
      });
    }

    // Verificar que los archivos tienen tags de operación
    const fileLines = body.split('\n').filter(l => l.match(/^-\s+\[`[^`]+`\]/));
    for (const fileLine of fileLines) {
      const hasTag = /\[(NEW|MODIFY|DELETE|DEPLOY|MODIFY \+ DEPLOY)\]/.test(fileLine);
      if (!hasTag) {
        issues.push({
          severity: 'WARNING',
          msg: `Archivo sin tag de operación: "${fileLine.trim()}". Debe terminar en [NEW], [MODIFY], [DELETE] o [DEPLOY].`
        });
      }
    }
  }

  return issues;
}

// ── Ejecutar validación ───────────────────────────────────────────────────────

console.log(`\n${BOLD}${CYAN}📋 Validador de Bitácora PROTOTIPE${RESET}`);
console.log(`${CYAN}Archivo: ${TARGET_FILE}${RESET}\n`);

const entries = parseEntries(lines);

if (entries.length === 0) {
  console.log(`${YELLOW}⚠ No se encontraron entradas con formato ## [ID] — [fecha].${RESET}`);
  process.exit(0);
}

console.log(`Entradas encontradas: ${BOLD}${entries.length}${RESET}\n`);

let errorCount = 0;
let warningCount = 0;
const failedEntries = [];

for (const entry of entries) {
  const issues = validateEntry(entry);
  if (issues.length > 0) {
    failedEntries.push({ entry, issues });
    for (const issue of issues) {
      if (issue.severity === 'ERROR') errorCount++;
      else warningCount++;
    }
  }
}

// ── Reporte ───────────────────────────────────────────────────────────────────

if (failedEntries.length === 0) {
  console.log(`${GREEN}${BOLD}✓ Todas las entradas son válidas (${entries.length}/${entries.length})${RESET}\n`);
  process.exit(0);
}

console.log(`${RED}${BOLD}✗ Se encontraron ${failedEntries.length} entrada(s) con problemas:${RESET}\n`);

for (const { entry, issues } of failedEntries) {
  console.log(`  ${BOLD}${entry.id} — ${entry.date}${RESET} (línea ${entry.headerLine})`);
  if (entry.titleLine) {
    console.log(`  ${entry.titleLine.substring(0, 80)}${entry.titleLine.length > 80 ? '...' : ''}`);
  }
  for (const issue of issues) {
    const icon = issue.severity === 'ERROR' ? `${RED}  ✗` : `${YELLOW}  ⚠`;
    console.log(`${icon} [${issue.severity}] ${issue.msg}${RESET}`);
  }
  console.log('');
}

console.log(`─────────────────────────────────────────────`);
console.log(`${RED}Errores:   ${errorCount}${RESET}`);
console.log(`${YELLOW}Warnings:  ${warningCount}${RESET}`);
console.log(`${GREEN}Correctas: ${entries.length - failedEntries.length}/${entries.length}${RESET}`);
console.log('');
console.log(`${BOLD}Acción requerida:${RESET} Corregir las entradas marcadas con ERROR antes de continuar.`);
console.log(`Consulta la skill bitacora-recorder para el template correcto.\n`);

process.exit(errorCount > 0 ? 1 : 0);
