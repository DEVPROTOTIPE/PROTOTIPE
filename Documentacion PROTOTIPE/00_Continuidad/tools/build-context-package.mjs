import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

// Get Git Top-Level root path
let gitRoot;
try {
  gitRoot = path.resolve(execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim());
} catch (err) {
  console.error('Error finding git root:', err.message);
  process.exit(1);
}

const DOCS_DIR = 'Documentacion PROTOTIPE';
const CONTINUIDAD_DIR = path.join(DOCS_DIR, '00_Continuidad');

// Allowed canonical files within 00_Continuidad
const ALLOWED_CANONICALS = [
  'Documentacion PROTOTIPE/00_Continuidad/canonical/00_REANUDAR_PROTOTIPE_CONTINUIDAD_2026-07-13.md',
  'Documentacion PROTOTIPE/00_Continuidad/canonical/Auditoria_Integral_y_Roadmap_PROTOTIPE_2026-07-13.md',
  'Documentacion PROTOTIPE/00_Continuidad/canonical/Plan_Maestro_Estabilizacion_y_Migracion_Claude_Code_PROTOTIPE.md'
];

const ALLOWED_CANONICAL_HASHES = {
  'Documentacion PROTOTIPE/00_Continuidad/canonical/00_REANUDAR_PROTOTIPE_CONTINUIDAD_2026-07-13.md': '31136bb2b3e70912a367439f8f5aa601db0036a51b13f96ad2609322b51797da',
  'Documentacion PROTOTIPE/00_Continuidad/canonical/Auditoria_Integral_y_Roadmap_PROTOTIPE_2026-07-13.md': 'caf330958ea83a15783068fc0e534314dfc8b207ecec9a369d700f0ddaf7e88e',
  'Documentacion PROTOTIPE/00_Continuidad/canonical/Plan_Maestro_Estabilizacion_y_Migracion_Claude_Code_PROTOTIPE.md': 'e1d9289c5ad7c2969e475b48fe6f4e4e06047c236d70f8fb4cf64bbdeddaa624'
};

// Enums
const ENUMS = {
  relevance: [3, 2, 1, 0],
  handling: ['include_full', 'include_excerpt', 'reference_only', 'exclude'],
  sensitivity: ['CLEAR', 'REVIEW_REQUIRED', 'BLOCKED'],
  documentStatus: ['VERIFIED', 'INTERNAL_CLAIM', 'PROPOSED', 'RISK', 'DEPRECATED', 'UNKNOWN'],
  classificationReviewStatus: ['PENDING_HUMAN_REVIEW', 'APPROVED']
};

// Bytewise sorting function
function bytewiseSort(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// Normalize path to '/'
function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

// Compute file SHA-256
function getFileSha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Securely validate file path
function validateSourcePath(p, isSourceFile = false) {
  // 1. Reject absolute or containing '..'
  if (path.isAbsolute(p) || p.includes('..') || p.includes('\\..') || p.includes('/..')) {
    throw new Error(`Path validation failed: absolute paths or '..' traversal not allowed: ${p}`);
  }

  // 2. Resolve relative to Git root
  const resolved = path.resolve(gitRoot, p);
  if (!resolved.startsWith(gitRoot)) {
    throw new Error(`Path validation failed: target path escapes Git root: ${p}`);
  }

  const normalized = normalizePath(p);

  // 3. Reject any source under 00_Continuidad, unless it is in the allowed canonical list
  if (isSourceFile && normalized.startsWith('Documentacion PROTOTIPE/00_Continuidad/')) {
    if (!ALLOWED_CANONICALS.includes(normalized)) {
      throw new Error(`Path validation failed: source under 00_Continuidad is not in allowed canonicals list: ${p}`);
    }
  }

  return normalized;
}

// Get Git-tracked files using NUL output
function getGitTrackedMarkdownFiles() {
  try {
    const stdout = execSync('git ls-files -z -- "*.md" "*.MD"', { encoding: 'utf8' });
    const files = stdout
      .split('\0')
      .map(f => f.trim())
      .filter(f => f && f.toLowerCase().endsWith('.md'))
      .map(normalizePath)
      .sort(bytewiseSort);
    return files;
  } catch (err) {
    console.error('Error executing git ls-files:', err.message);
    process.exit(1);
  }
}

// Secrets scanner
function scanForSecrets(text) {
  const patterns = {
    privateKey: /-----BEGIN[A-Z ]*PRIVATE KEY-----/i,
    jwtToken: /\bey[J-l][a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_.+/=]*\b/,
    githubToken: /\bghp_[A-Za-z0-9]{36}\b/,
    npmToken: /\bnpm_[A-Za-z0-9]{36}\b/,
    awsAccessKey: /\bAKIA[0-9A-Z]{16}\b/,
    slackWebhook: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]{8}\/B[A-Z0-9]{8}\/[A-Za-z0-9]{24}/,
    urlAuth: /https?:\/\/[a-zA-Z0-9_.-]+:[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+/,
    firebaseApiKey: /\bAIzaSy[A-Za-z0-9_-]{35}\b/,
    serviceAccount: /"type"\s*:\s*"service_account"/i,
    credentialAssign: /\b(client[_-]?secret|private[_-]?key|db[_-]?password|api[_-]?key|passwd|contrase[nñ]a|password)\s*[:=]\s*["'][^"']{8,}["']/i
  };

  for (const [key, regex] of Object.entries(patterns)) {
    if (regex.test(text)) {
      return { found: true, type: key };
    }
  }
  return { found: false };
}

// Parse markdown sections
function parseMarkdownSections(filePath, mappings, shaMap) {
  const normalizedFile = validateSourcePath(filePath, true);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const fileSha = getFileSha256(filePath);
  const lines = fileContent.split(/\r?\n/);
  const sections = [];

  // Check duplicateOf at file level
  let duplicateOf = null;
  if (shaMap.has(fileSha)) {
    duplicateOf = shaMap.get(fileSha);
  } else {
    shaMap.set(fileSha, normalizedFile);
  }

  let currentHeadingPath = [];
  let currentStartLine = 1;
  let sectionLines = [];

  // Helper to resolve metadata mappings for a section
  function resolveMetadata(hPath, start, end) {
    // Default metadata
    let topics = [];
    let documentStatus = 'UNKNOWN';
    let sensitivity = 'REVIEW_REQUIRED';

    // Find if there is a mapping in context-metadata.json
    // Support file-level or section-level mapping
    const fileMappings = mappings.filter(m => m.sourcePath === normalizedFile);
    for (const mapping of fileMappings) {
      // If mapping has headingPath, check match
      if (mapping.headingPath) {
        const matchesHeading = mapping.headingPath.every((h, idx) => hPath[idx] === h);
        if (!matchesHeading) continue;
      }
      // If mapping has lineRange
      if (mapping.lineRange) {
        if (start < mapping.lineRange.startLine || end > mapping.lineRange.endLine) {
          continue;
        }
      }
      
      // Override default
      if (mapping.topics) topics = mapping.topics;
      if (mapping.documentStatus) documentStatus = mapping.documentStatus;
      if (mapping.sensitivity) sensitivity = mapping.sensitivity;
      break;
    }

    return { topics, documentStatus, sensitivity };
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#{1,2})\s+(.+)$/);

    if (match) {
      if (i > 0 || sectionLines.length > 0) {
        const text = sectionLines.join('\n');
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const headingArr = currentHeadingPath.length > 0 ? [...currentHeadingPath] : ['(Intro)'];
        const metadata = resolveMetadata(headingArr, currentStartLine, i);

        sections.push({
          sourcePath: normalizedFile,
          sourceSha256: fileSha,
          headingPath: headingArr,
          startLine: currentStartLine,
          endLine: i,
          wordCount: words,
          topics: metadata.topics,
          documentStatus: metadata.documentStatus,
          sensitivity: metadata.sensitivity,
          classificationReviewStatus: 'PENDING_HUMAN_REVIEW',
          duplicateOf
        });
      }

      const level = match[1].length;
      const headingText = match[2].trim();
      currentHeadingPath = currentHeadingPath.slice(0, level - 1);
      while (currentHeadingPath.length < level - 1) {
        currentHeadingPath.push('');
      }
      currentHeadingPath[level - 1] = headingText;
      currentStartLine = i + 1;
      sectionLines = [line];
    } else {
      sectionLines.push(line);
    }
  }

  if (sectionLines.length > 0) {
    const text = sectionLines.join('\n');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const headingArr = currentHeadingPath.length > 0 ? [...currentHeadingPath] : ['(Intro)'];
    const metadata = resolveMetadata(headingArr, currentStartLine, lines.length);

    sections.push({
      sourcePath: normalizedFile,
      sourceSha256: fileSha,
      headingPath: headingArr,
      startLine: currentStartLine,
      endLine: lines.length,
      wordCount: words,
      topics: metadata.topics,
      documentStatus: metadata.documentStatus,
      sensitivity: metadata.sensitivity,
      classificationReviewStatus: 'PENDING_HUMAN_REVIEW',
      duplicateOf
    });
  }

  return { sections, fileSha };
}

// Generate index
function runIndexMode() {
  const metadataPath = path.join(CONTINUIDAD_DIR, 'index', 'context-metadata.json');
  if (!fs.existsSync(metadataPath)) {
    console.error('Metadata mappings file not found:', metadataPath);
    process.exit(1);
  }

  const { mappings } = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const gitFiles = getGitTrackedMarkdownFiles();
  
  // Explicitly add allowed canonical files if they exist on disk, even if not yet tracked in git
  ALLOWED_CANONICALS.forEach(f => {
    if (!gitFiles.includes(f) && fs.existsSync(f)) {
      gitFiles.push(f);
    }
  });

  const shaMap = new Map();

  console.log(`Scanning ${gitFiles.length} versioned markdown files...`);
  
  const allSections = [];
  const fileStats = { docs: 0, others: 0 };
  const missingFiles = [];

  for (const f of gitFiles) {
    if (!fs.existsSync(f)) {
      missingFiles.push(f);
      continue;
    }
    
    // Validate canonical file hashes on scan
    if (ALLOWED_CANONICALS.includes(f)) {
      const actualHash = getFileSha256(f);
      const expectedHash = ALLOWED_CANONICAL_HASHES[f];
      if (actualHash !== expectedHash) {
        console.error(`CANONICAL_SOURCE_HASH_MISMATCH for ${f}. Expected: ${expectedHash}, Found: ${actualHash}`);
        process.exit(1);
      }
    }

    try {
      const { sections } = parseMarkdownSections(f, mappings, shaMap);
      allSections.push(...sections);

      if (f.startsWith('Documentacion PROTOTIPE/')) {
        fileStats.docs++;
      } else {
        fileStats.others++;
      }
    } catch (err) {
      console.error(`Error parsing file ${f}:`, err.message);
      process.exit(1);
    }
  }

  // Sort sections alphabetically by sourcePath, then startLine
  allSections.sort((a, b) => {
    if (a.sourcePath !== b.sourcePath) return bytewiseSort(a.sourcePath, b.sourcePath);
    return a.startLine - b.startLine;
  });

  const indexPath = path.join(CONTINUIDAD_DIR, 'index', 'context-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(allSections, null, 2).replace(/\r\n/g, '\n'), 'utf8');
  console.log(`Saved context-index.json. Total indexed sections: ${allSections.length}`);
  console.log(`- Documentacion PROTOTIPE files: ${fileStats.docs}`);
  console.log(`- Other instruction directories: ${fileStats.others}`);
  console.log(`- Missing expected files (deleted in working dir): ${missingFiles.length}`);

  // Write context-index.md
  let mdContent = `# Índice Temático de Documentación PROTOTIPE\n\n`;
  mdContent += `* **Archivos Documentales (Documentacion PROTOTIPE/):** ${fileStats.docs}\n`;
  mdContent += `* **Otros Directorios de Instrucciones/Reglas:** ${fileStats.others}\n`;
  mdContent += `* **Archivos Esperados No Encontrados (Borrados en Disco):** ${missingFiles.length}\n`;
  mdContent += `* **Total Secciones Indexadas:** ${allSections.length}\n\n`;

  if (missingFiles.length > 0) {
    mdContent += `## ⚠️ Archivos Esperados No Encontrados (Borrados en Disco)\n\n`;
    for (const mf of missingFiles) {
      mdContent += `- \`${mf}\`\n`;
    }
    mdContent += `\n---\n\n`;
  }

  mdContent += `## Secciones Indexadas\n\n`;
  mdContent += `| Ruta del Archivo | Encabezado | Líneas | Palabras | Sensibilidad | Estado | Tópicos | Revisión | Duplicado de |\n`;
  mdContent += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const sec of allSections) {
    const headings = sec.headingPath.join(' > ');
    const topics = sec.topics.join(', ') || '-';
    const dup = sec.duplicateOf ? `\`${sec.duplicateOf}\`` : '-';
    mdContent += `| \`${sec.sourcePath}\` | ${headings} | ${sec.startLine}-${sec.endLine} | ${sec.wordCount} | ${sec.sensitivity} | ${sec.documentStatus} | ${topics} | ${sec.classificationReviewStatus} | ${dup} |\n`;
  }

  const indexMdPath = path.join(CONTINUIDAD_DIR, 'index', 'context-index.md');
  fs.writeFileSync(indexMdPath, mdContent.replace(/\r\n/g, '\n'), 'utf8');
  console.log(`Saved context-index.md`);
}

// Generate Package Mode
function runPackageMode(selectionFilePath) {
  // Validate path traversal on selectionFilePath FIRST
  validateSourcePath(selectionFilePath, false);

  if (!fs.existsSync(selectionFilePath)) {
    console.error('Selection manifest not found:', selectionFilePath);
    process.exit(1);
  }

  const selectionManifest = JSON.parse(fs.readFileSync(selectionFilePath, 'utf8'));
  const theme = selectionManifest.theme;
  const selections = selectionManifest.selections;
  const staticTimestamp = selectionManifest.generatedAtUtc;

  if (!theme || !selections || !staticTimestamp) {
    console.error('Selection manifest is missing required fields (theme, selections, generatedAtUtc).');
    process.exit(1);
  }

  // Validate theme slug
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(theme)) {
    console.error(`Invalid theme slug format: ${theme}`);
    process.exit(1);
  }

  const packageDir = path.join(CONTINUIDAD_DIR, 'packages', theme);
  const resolvedPackageDir = path.resolve(packageDir);
  const resolvedPackagesParent = path.resolve(CONTINUIDAD_DIR, 'packages');
  
  if (!resolvedPackageDir.startsWith(resolvedPackagesParent)) {
    console.error(`Security breach: Output directory escapes continuity packages root: ${packageDir}`);
    process.exit(1);
  }

  // Check required LEEME and CONTEXTO_MINIMO paths
  const leemePath = path.join(packageDir, '00_LEEME.md');
  const ctxMinPath = path.join(packageDir, '01_CONTEXTO_MINIMO.md');

  // Load context-index.json
  const indexPath = path.join(CONTINUIDAD_DIR, 'index', 'context-index.json');
  if (!fs.existsSync(indexPath)) {
    console.error('Build failed: context-index.json must be generated first. Run script with --index');
    process.exit(1);
  }
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

  const extractedSections = [];
  const referenceOnlyEntries = [];
  const securityAlerts = [];
  const duplicateFiles = [];

  // Track ranges to prevent overlaps
  const fileRanges = new Map();

  // Sort selections stably
  const sortedSelections = [...selections].sort((a, b) => {
    if (a.sourcePath !== b.sourcePath) return bytewiseSort(a.sourcePath, b.sourcePath);
    return a.startLine - b.startLine;
  });

  for (const sel of sortedSelections) {
    // 1. Path validations
    const normalizedSource = validateSourcePath(sel.sourcePath, true);

    if (ALLOWED_CANONICALS.includes(normalizedSource)) {
      const actualHash = getFileSha256(normalizedSource);
      const expectedHash = ALLOWED_CANONICAL_HASHES[normalizedSource];
      if (actualHash !== expectedHash) {
        console.error(`CANONICAL_SOURCE_HASH_MISMATCH for ${normalizedSource}. Expected: ${expectedHash}, Found: ${actualHash}`);
        process.exit(1);
      }
    }

    // 2. Validate enum constraints
    if (!ENUMS.relevance.includes(sel.relevance)) {
      console.error(`Invalid relevance: ${sel.relevance} in selection for ${normalizedSource}`);
      process.exit(1);
    }
    if (!ENUMS.handling.includes(sel.handling)) {
      console.error(`Invalid handling: ${sel.handling} in selection for ${normalizedSource}`);
      process.exit(1);
    }
    if (sel.sensitivity && !ENUMS.sensitivity.includes(sel.sensitivity)) {
      console.error(`Invalid sensitivity: ${sel.sensitivity} in selection for ${normalizedSource}`);
      process.exit(1);
    }
    if (sel.documentStatus && !ENUMS.documentStatus.includes(sel.documentStatus)) {
      console.error(`Invalid documentStatus: ${sel.documentStatus} in selection for ${normalizedSource}`);
      process.exit(1);
    }

    // 3. Relevance / Handling alignment check
    if (sel.relevance === 3 && sel.handling !== 'include_full') {
      console.error(`Alignment error: Relevance 3 must have handling include_full.`);
      process.exit(1);
    }
    if (sel.relevance === 2 && sel.handling !== 'include_full' && sel.handling !== 'include_excerpt') {
      console.error(`Alignment error: Relevance 2 must have handling include_full or include_excerpt.`);
      process.exit(1);
    }
    if (sel.relevance === 1 && sel.handling !== 'reference_only') {
      console.error(`Alignment error: Relevance 1 must have handling reference_only.`);
      process.exit(1);
    }
    if (sel.relevance === 0) {
      // Skip relevance 0
      continue;
    }

    // 4. Match exactly with context-index.json
    const matchingSection = index.find(idx => 
      idx.sourcePath === normalizedSource &&
      idx.startLine === sel.startLine &&
      idx.endLine === sel.endLine &&
      idx.sourceSha256 === sel.sourceSha256 &&
      idx.headingPath.length === sel.headingPath.length &&
      idx.headingPath.every((h, i) => h === sel.headingPath[i])
    );

    if (!matchingSection) {
      console.error(`Selection validation failed: no matching section found in context-index.json for:\n` +
        `Path: ${normalizedSource}, Range: ${sel.startLine}-${sel.endLine}, Hash: ${sel.sourceSha256}`);
      process.exit(1);
    }

    // 5. Prevent overlaps
    if (!fileRanges.has(normalizedSource)) {
      fileRanges.set(normalizedSource, []);
    }
    const ranges = fileRanges.get(normalizedSource);
    for (const r of ranges) {
      if (sel.startLine <= r.endLine && sel.endLine >= r.startLine) {
        console.error(`Overlap error: Selection range [${sel.startLine}-${sel.endLine}] overlaps with existing selection [${r.startLine}-${r.endLine}] in ${normalizedSource}`);
        process.exit(1);
      }
    }
    ranges.push({ startLine: sel.startLine, endLine: sel.endLine });

    if (matchingSection.duplicateOf) {
      duplicateFiles.push({
        sourcePath: normalizedSource,
        duplicateOf: matchingSection.duplicateOf,
        sha256: sel.sourceSha256
      });
    }

    // 6. Resolve effective sensitivity (CLEAR < REVIEW_REQUIRED < BLOCKED)
    const sensMap = { CLEAR: 0, REVIEW_REQUIRED: 1, BLOCKED: 2 };
    const sensArr = ['CLEAR', 'REVIEW_REQUIRED', 'BLOCKED'];

    const indexSens = matchingSection.sensitivity || 'REVIEW_REQUIRED';
    const selectionSens = sel.sensitivity || 'CLEAR';
    
    let effectiveSensVal = Math.max(sensMap[indexSens], sensMap[selectionSens]);
    
    // Read source lines
    const lines = fs.readFileSync(normalizedSource, 'utf8').split(/\r?\n/);
    const startLine = sel.startLine;
    const endLine = sel.endLine;
    const sectionText = lines.slice(startLine - 1, endLine).join('\n');

    // Run secrets scan
    const secretsResult = scanForSecrets(sectionText);
    if (secretsResult.found) {
      effectiveSensVal = Math.max(effectiveSensVal, sensMap['BLOCKED']);
      securityAlerts.push({
        sourcePath: normalizedSource,
        headingPath: sel.headingPath,
        startLine,
        endLine,
        riskType: `POSSIBLE_SECRET_${secretsResult.type.toUpperCase()}`
      });
    }

    const effectiveSensitivity = sensArr[effectiveSensVal];
    const reviewStatus = sel.classificationReviewStatus || matchingSection.classificationReviewStatus || 'PENDING_HUMAN_REVIEW';

    // 7. Apply content copy or block based on sensitivity
    if (sel.relevance === 3 || sel.relevance === 2) {
      if (effectiveSensitivity !== 'CLEAR') {
        extractedSections.push({
          sourcePath: normalizedSource,
          sourceSha256: sel.sourceSha256,
          headingPath: sel.headingPath,
          startLine,
          endLine,
          documentStatus: sel.documentStatus || matchingSection.documentStatus || 'UNKNOWN',
          reason: sel.reason,
          sensitivity: effectiveSensitivity,
          conflictGroup: sel.conflictGroup,
          classificationReviewStatus: reviewStatus,
          content: `> [!CAUTION]\n> **CONTENIDO BLOQUEADO POR SEGURIDAD / REVISIÓN REQUERIDA**\n> Esta sección no fue copiada debido a políticas de sensibilidad de datos (Sensibilidad: ${effectiveSensitivity}).`
        });
      } else {
        extractedSections.push({
          sourcePath: normalizedSource,
          sourceSha256: sel.sourceSha256,
          headingPath: sel.headingPath,
          startLine,
          endLine,
          documentStatus: sel.documentStatus || matchingSection.documentStatus || 'UNKNOWN',
          reason: sel.reason,
          sensitivity: effectiveSensitivity,
          conflictGroup: sel.conflictGroup,
          classificationReviewStatus: reviewStatus,
          content: sectionText
        });
      }
    } else if (sel.relevance === 1) {
      referenceOnlyEntries.push({
        sourcePath: normalizedSource,
        headingPath: sel.headingPath,
        startLine,
        endLine,
        reason: sel.reason
      });
    }
  }

  // Verify LEEME and CONTEXTO_MINIMO exist before proceeding to write outputs
  if (!fs.existsSync(leemePath) || !fs.existsSync(ctxMinPath)) {
    console.error(`Build failed: missing required files 00_LEEME.md or 01_CONTEXTO_MINIMO.md in output folder: ${packageDir}`);
    process.exit(1);
  }

  // Create output directory ONLY after all validations have completely succeeded
  if (!fs.existsSync(packageDir)) {
    fs.mkdirSync(packageDir, { recursive: true });
  }

  // 1. Write 02_FUENTES_SELECCIONADAS.md
  let fsMd = `# Fuentes Seleccionadas — Tema: ${theme}\n\n`;
  for (const sec of extractedSections) {
    const headings = sec.headingPath.join(' > ');
    const reviewWarning = sec.classificationReviewStatus === 'PENDING_HUMAN_REVIEW'
      ? `> [!WARNING]\n> **REVISIÓN DE CLASIFICACIÓN PENDIENTE:** La veracidad canónica de esta sección no ha sido validada por un humano.\n\n`
      : '';

    fsMd += `## Fuente: \`${sec.sourcePath}\` (Líneas ${sec.startLine}-${sec.endLine})\n`;
    fsMd += `- **SHA-256:** \`${sec.sourceSha256}\`\n`;
    fsMd += `- **Ruta de Encabezados:** ${headings}\n`;
    fsMd += `- **Estado Documental:** ${sec.documentStatus}\n`;
    fsMd += `- **Estatus de Revisión:** ${sec.classificationReviewStatus}\n`;
    fsMd += `- **Motivo de Inclusión:** ${sec.reason}\n`;
    if (sec.conflictGroup) {
      fsMd += `- **Grupo de Conflicto:** ${sec.conflictGroup}\n`;
    }
    fsMd += `- **Sensibilidad:** ${sec.sensitivity}\n\n`;
    fsMd += reviewWarning;
    fsMd += `### Contenido Extraído:\n\n\`\`\`markdown\n${sec.content}\n\`\`\`\n\n---\n\n`;
  }
  const fsMdPath = path.join(packageDir, '02_FUENTES_SELECCIONADAS.md');
  fs.writeFileSync(fsMdPath, fsMd.replace(/\r\n/g, '\n'), 'utf8');
  console.log(`Saved 02_FUENTES_SELECCIONADAS.md`);

  // 2. Write 03_REFERENCIAS_NO_INCLUIDAS.md
  let refMd = `# Referencias No Incluidas (Relevancia 1) — Tema: ${theme}\n\n`;
  refMd += `| Archivo Fuente | Encabezado | Líneas | Motivo |\n`;
  refMd += `| :--- | :--- | :--- | :--- |\n`;
  for (const ref of referenceOnlyEntries) {
    refMd += `| \`${ref.sourcePath}\` | ${ref.headingPath.join(' > ')} | ${ref.startLine}-${ref.endLine} | ${ref.reason} |\n`;
  }
  const refMdPath = path.join(packageDir, '03_REFERENCIAS_NO_INCLUIDAS.md');
  fs.writeFileSync(refMdPath, refMd.replace(/\r\n/g, '\n'), 'utf8');
  console.log(`Saved 03_REFERENCIAS_NO_INCLUIDAS.md`);

  // 3. Write 04_ALERTAS_SEGURIDAD.md
  let secMd = `# Alertas de Seguridad — Tema: ${theme}\n\n`;
  if (securityAlerts.length === 0) {
    secMd += `El escáner configurado no detectó patrones candidatos en las secciones procesadas. Este resultado no garantiza la ausencia total de secretos ni sustituye la revisión humana y el escaneo independiente del repositorio.\n`;
  } else {
    secMd += `> [!WARNING]\n> Se identificaron los siguientes candidatos sensibles. Las secciones han sido bloqueadas y no se copiaron sus textos:\n\n`;
    secMd += `| Archivo Fuente | Encabezado | Líneas | Tipo de Alerta |\n`;
    secMd += `| :--- | :--- | :--- | :--- |\n`;
    for (const alert of securityAlerts) {
      secMd += `| \`${alert.sourcePath}\` | ${alert.headingPath.join(' > ')} | ${alert.startLine}-${alert.endLine} | ${alert.riskType} |\n`;
    }
  }
  const secMdPath = path.join(packageDir, '04_ALERTAS_SEGURIDAD.md');
  fs.writeFileSync(secMdPath, secMd.replace(/\r\n/g, '\n'), 'utf8');
  console.log(`Saved 04_ALERTAS_SEGURIDAD.md`);

  // Deduplicate sources by sourcePath + sha256
  const seenSources = new Set();
  const uniqueSources = [];
  for (const s of sortedSelections) {
    const key = `${s.sourcePath}:${s.sourceSha256}`;
    if (!seenSources.has(key)) {
      seenSources.add(key);
      uniqueSources.push({
        sourcePath: s.sourcePath,
        sha256: s.sourceSha256
      });
    }
  }

  // Find missing expected files in workspace
  const gitFiles = getGitTrackedMarkdownFiles();
  const missingExpectedFiles = gitFiles.filter(f => !fs.existsSync(f));

  // Collect unique non-null conflictGroups
  const conflictGroups = [...new Set(sortedSelections.map(s => s.conflictGroup).filter(Boolean))];

  // Deduplicate files in duplicates array
  const seenDuplicates = new Set();
  const uniqueDuplicates = [];
  for (const d of duplicateFiles) {
    const key = `${d.sourcePath}:${d.duplicateOf}`;
    if (!seenDuplicates.has(key)) {
      seenDuplicates.add(key);
      uniqueDuplicates.push(d);
    }
  }

  // 4. Generate outputs manifest (without selfHash)
  const outputsManifest = {
    formatVersion: "1.1",
    generator: "build-context-package.mjs v1.1",
    theme: theme,
    selectionUsed: normalizePath(path.relative(CONTINUIDAD_DIR, selectionFilePath)),
    generatedAtUtc: staticTimestamp,
    commitOrigin: execSync('git log -1 --format=%H', { encoding: 'utf8' }).trim(),
    worktreeState: execSync('git status --porcelain', { encoding: 'utf8' }).trim() ? 'dirty' : 'clean',
    hashes: {
      index: getFileSha256(indexPath),
      metadata: getFileSha256(path.join(CONTINUIDAD_DIR, 'index', 'context-metadata.json')),
      selection: getFileSha256(selectionFilePath)
    },
    sources: uniqueSources,
    outputs: {
      "00_LEEME.md": getFileSha256(leemePath),
      "01_CONTEXTO_MINIMO.md": getFileSha256(ctxMinPath),
      "02_FUENTES_SELECCIONADAS.md": getFileSha256(fsMdPath),
      "03_REFERENCIAS_NO_INCLUIDAS.md": getFileSha256(refMdPath),
      "04_ALERTAS_SEGURIDAD.md": getFileSha256(secMdPath)
    },
    counts: {
      includeFull: extractedSections.filter(s => s.sensitivity === 'CLEAR').length,
      includeBlocked: extractedSections.filter(s => s.sensitivity !== 'CLEAR').length,
      referenceOnly: referenceOnlyEntries.length
    },
    pendingIncludedReviewsCount: extractedSections.filter(s => s.classificationReviewStatus === 'PENDING_HUMAN_REVIEW').length,
    pendingReferenceReviewsCount: sortedSelections.filter(s => s.handling === 'reference_only' && s.classificationReviewStatus === 'PENDING_HUMAN_REVIEW').length,
    pendingReviewsCount: sortedSelections.filter(s => s.classificationReviewStatus === 'PENDING_HUMAN_REVIEW').length,
    securityAlertsCount: securityAlerts.length,
    duplicates: uniqueDuplicates,
    conflictGroups,
    missingExpectedFiles,
    assembledWordCount: 0,
    selfHash: null
  };

  // Helper to build the assembled content string
  function buildAssembled(manifestObj) {
    let content = `# PAQUETE CONSOLIDADO DE CONTEXTO: ${theme.toUpperCase().replace(/-/g, '_')}\n\n`;
    content += `> Generado en: ${staticTimestamp}\n`;
    content += `> Manifiesto Origen: ${normalizePath(path.relative(CONTINUIDAD_DIR, selectionFilePath))}\n\n`;

    content += `<!-- SECTION: 00_LEEME.md -->\n${fs.readFileSync(leemePath, 'utf8')}\n\n`;
    content += `<!-- SECTION: 01_CONTEXTO_MINIMO.md -->\n${fs.readFileSync(ctxMinPath, 'utf8')}\n\n`;
    content += `<!-- SECTION: 02_FUENTES_SELECCIONADAS.md -->\n${fs.readFileSync(fsMdPath, 'utf8')}\n\n`;
    content += `<!-- SECTION: 03_REFERENCIAS_NO_INCLUIDAS.md -->\n${fs.readFileSync(refMdPath, 'utf8')}\n\n`;
    content += `<!-- SECTION: 04_ALERTAS_SEGURIDAD.md -->\n${fs.readFileSync(secMdPath, 'utf8')}\n\n`;
    
    content += `<!-- SECTION: 05_MANIFIESTO.json SUMMARY -->\n# Resumen del Manifiesto\n\n\`\`\`json\n`;
    content += JSON.stringify(manifestObj, null, 2);
    content += `\n\`\`\`\n`;
    return content;
  }

  // Pass 1: Build temporary content
  const tempAssembled = buildAssembled(outputsManifest);
  const wordCount = tempAssembled.trim().split(/\s+/).filter(Boolean).length;
  console.log(`Assembled package words (Pass 1): ${wordCount}`);

  // Pass 2: Update manifest with exact word count and write to disk
  outputsManifest.assembledWordCount = wordCount;
  const manifestPath = path.join(packageDir, '05_MANIFIESTO.json');
  fs.writeFileSync(manifestPath, JSON.stringify(outputsManifest, null, 2).replace(/\r\n/g, '\n'), 'utf8');
  console.log(`Saved 05_MANIFIESTO.json`);

  // Pass 2: Build final content
  const finalAssembled = buildAssembled(outputsManifest);
  const assembledFilename = `PAQUETE_CONTEXTO_${theme.toUpperCase().replace(/-/g, '_')}.md`;
  const assembledPath = path.join(packageDir, assembledFilename);
  fs.writeFileSync(assembledPath, finalAssembled.replace(/\r\n/g, '\n'), 'utf8');

  if (wordCount > 25000) {
    fs.unlinkSync(assembledPath);
    console.error(`Build failed: Assembled package exceeds 25,000 words limit. Word count: ${wordCount}`);
    process.exit(1);
  }

  console.log(`Saved ${assembledFilename}`);
}

// CLI
const args = process.argv.slice(2);
if (args.includes('--index')) {
  runIndexMode();
} else if (args.includes('--selection')) {
  const selectionIdx = args.indexOf('--selection');
  if (selectionIdx === -1 || selectionIdx === args.length - 1) {
    console.error('Error: Please specify the selection JSON file path.');
    process.exit(1);
  }
  const selectionPath = args[selectionIdx + 1];
  runPackageMode(selectionPath);
} else {
  console.log(`PROTOTIPE Context Packaging System CLI
Usage:
  node build-context-package.mjs --index
  node build-context-package.mjs --selection <path-to-selection-json>`);
}
