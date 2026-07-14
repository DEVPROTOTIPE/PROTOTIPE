const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('=== RUNNING SECURE ROBUSTNESS VALIDATION SUITE ===\n');

const scriptPath = 'Documentacion PROTOTIPE/00_Continuidad/tools/build-context-package.mjs';
const selectionsDir = 'Documentacion PROTOTIPE/00_Continuidad/selections';
const packagesDir = 'Documentacion PROTOTIPE/00_Continuidad/packages';
const indexDir = 'Documentacion PROTOTIPE/00_Continuidad/index';
const pilotDir = path.join(packagesDir, 'migracion-claude-code');

function getFileSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// 1. Capture BEFORE state
const gitStatusBefore = execSync('git status --porcelain=v1', { encoding: 'utf8' });
const gitDiffCachedBefore = execSync('git diff --cached --binary', { encoding: 'utf8' });
const extractorHashBefore = getFileSha256(scriptPath);
const indexHashBefore = getFileSha256(path.join(indexDir, 'context-index.json'));

const outputsBefore = {
  leeme: getFileSha256(path.join(pilotDir, '00_LEEME.md')),
  contexto: getFileSha256(path.join(pilotDir, '01_CONTEXTO_MINIMO.md')),
  fuentes: getFileSha256(path.join(pilotDir, '02_FUENTES_SELECCIONADAS.md')),
  referencias: getFileSha256(path.join(pilotDir, '03_REFERENCIAS_NO_INCLUIDAS.md')),
  alertas: getFileSha256(path.join(pilotDir, '04_ALERTAS_SEGURIDAD.md')),
  manifiesto: getFileSha256(path.join(pilotDir, '05_MANIFIESTO.json')),
  paquete: getFileSha256(path.join(pilotDir, 'PAQUETE_CONTEXTO_MIGRACION_CLAUDE_CODE.md'))
};

function assertFailure(description, command, expectedError, testTheme = null) {
  if (testTheme) {
    const tPath = path.join(packagesDir, testTheme);
    if (fs.existsSync(tPath)) {
      fs.rmSync(tPath, { recursive: true, force: true });
    }
  }

  try {
    execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    throw new Error(`TEST FAILED: ${description} (Expected failure, but it succeeded)`);
  } catch (err) {
    const output = err.stdout + '\n' + err.stderr;
    if (output.includes(expectedError)) {
      console.log(`✅ TEST PASSED: ${description}`);
      if (testTheme) {
        const tPath = path.join(packagesDir, testTheme);
        if (fs.existsSync(tPath)) {
          throw new Error(`TEST FAILED: residual directory left behind at ${tPath}`);
        }
      }
    } else {
      throw new Error(`TEST FAILED: ${description}\nExpected error containing: "${expectedError}"\nActual output:\n${output}`);
    }
  }
}

function assertSuccess(description, command) {
  try {
    execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ TEST PASSED: ${description}`);
  } catch (err) {
    const output = err.stdout + '\n' + err.stderr;
    throw new Error(`TEST FAILED: ${description}\nCommand failed with output:\n${output}`);
  }
}

// Top level error logging
let executionError = null;

try {
  // Test T01
  assertFailure(
    'T01 — Path traversal check in --selection filename',
    `node "${scriptPath}" --selection "../../../passwd"`,
    'absolute paths or \'..\' traversal not allowed'
  );

  // Test T02
  const t02Path = path.join(selectionsDir, 't02.selection.json');
  try {
    fs.writeFileSync(t02Path, JSON.stringify({ theme: '../../escaped-theme', generatedAtUtc: '2026-07-13T19:03:16Z', selections: [] }, null, 2), 'utf8');
    assertFailure(
      'T02 — Theme slug path traversal rejection',
      `node "${scriptPath}" --selection "${t02Path}"`,
      'Invalid theme slug format'
    );
  } finally {
    if (fs.existsSync(t02Path)) {
      fs.rmSync(t02Path, { force: true });
    }
  }

  // Test T03
  const t03Path = path.join(selectionsDir, 't03.selection.json');
  try {
    fs.writeFileSync(t03Path, JSON.stringify({
      theme: 't03-escape-source',
      generatedAtUtc: '2026-07-13T19:03:16Z',
      selections: [{ sourcePath: '../escape-root.md', sourceSha256: 'abc123def456', headingPath: ['Heading'], startLine: 1, endLine: 10, relevance: 3, handling: 'include_full', reason: 'Should fail' }]
    }, null, 2), 'utf8');
    assertFailure(
      'T03 — Source path escaping Git root check',
      `node "${scriptPath}" --selection "${t03Path}"`,
      'absolute paths or \'..\' traversal not allowed',
      't03-escape-source'
    );
  } finally {
    if (fs.existsSync(t03Path)) {
      fs.rmSync(t03Path, { force: true });
    }
  }

  // Test T04
  const t04Path = path.join(selectionsDir, 't04.selection.json');
  try {
    fs.writeFileSync(t04Path, JSON.stringify({
      theme: 't04-continuity-check',
      generatedAtUtc: '2026-07-13T19:03:16Z',
      selections: [{ sourcePath: 'Documentacion PROTOTIPE/00_Continuidad/README.md', sourceSha256: 'abc123def456', headingPath: ['Heading'], startLine: 1, endLine: 10, relevance: 3, handling: 'include_full', reason: 'Should fail' }]
    }, null, 2), 'utf8');
    assertFailure(
      'T04 — Source path under 00_Continuidad check',
      `node "${scriptPath}" --selection "${t04Path}"`,
      'source under 00_Continuidad is not in allowed canonicals list',
      't04-continuity-check'
    );
  } finally {
    if (fs.existsSync(t04Path)) {
      fs.rmSync(t04Path, { force: true });
    }
  }

  // Test T05
  const t05Path = path.join(selectionsDir, 't05.selection.json');
  try {
    fs.writeFileSync(t05Path, JSON.stringify({
      theme: 't05-untracked-source',
      generatedAtUtc: '2026-07-13T19:03:16Z',
      selections: [{ sourcePath: 'scratch/unindexed_file_test.md', sourceSha256: 'abc123def456', headingPath: ['Heading'], startLine: 1, endLine: 10, relevance: 3, handling: 'include_full', reason: 'Should fail' }]
    }, null, 2), 'utf8');
    assertFailure(
      'T05 — Untracked / unindexed source file rejection',
      `node "${scriptPath}" --selection "${t05Path}"`,
      'no matching section found in context-index.json',
      't05-untracked-source'
    );
  } finally {
    if (fs.existsSync(t05Path)) {
      fs.rmSync(t05Path, { force: true });
    }
  }

  // Test T06
  const idx = JSON.parse(fs.readFileSync(path.join(indexDir, 'context-index.json'), 'utf8'));
  const reviewReqSec = idx.find(sec => sec.sensitivity === 'REVIEW_REQUIRED');
  if (reviewReqSec) {
    const t06Path = path.join(selectionsDir, 't06.selection.json');
    const t06Dir = path.join(packagesDir, 't06-degrade-sens');
    try {
      fs.writeFileSync(t06Path, JSON.stringify({
        theme: 't06-degrade-sens',
        generatedAtUtc: '2026-07-13T19:03:16Z',
        selections: [{
          sourcePath: reviewReqSec.sourcePath,
          sourceSha256: reviewReqSec.sourceSha256,
          headingPath: reviewReqSec.headingPath,
          startLine: reviewReqSec.startLine,
          endLine: reviewReqSec.endLine,
          relevance: 3,
          handling: 'include_full',
          reason: 'Attempting to degrade',
          sensitivity: 'CLEAR',
          documentStatus: reviewReqSec.documentStatus,
          classificationReviewStatus: 'PENDING_HUMAN_REVIEW'
        }]
      }, null, 2), 'utf8');

      fs.mkdirSync(t06Dir, { recursive: true });
      fs.writeFileSync(path.join(t06Dir, '00_LEEME.md'), 'LEEME', 'utf8');
      fs.writeFileSync(path.join(t06Dir, '01_CONTEXTO_MINIMO.md'), 'CONTEXTO', 'utf8');

      assertSuccess(
        'T06 — Degrade sensitivity execution (generation)',
        `node "${scriptPath}" --selection "${t06Path}"`
      );

      const fsMdContent = fs.readFileSync(path.join(t06Dir, '02_FUENTES_SELECCIONADAS.md'), 'utf8');
      if (fsMdContent.includes('CONTENIDO BLOQUEADO POR SEGURIDAD / REVISIÓN REQUERIDA')) {
        console.log('✅ TEST PASSED: T06 — Degrade sensitivity block prevented text copy');
      } else {
        throw new Error('TEST FAILED: T06 — Degrade sensitivity allowed text copy of REVIEW_REQUIRED section!');
      }
    } finally {
      if (fs.existsSync(t06Dir)) {
        fs.rmSync(t06Dir, { recursive: true, force: true });
      }
      if (fs.existsSync(t06Path)) {
        fs.rmSync(t06Path, { force: true });
      }
    }
  }

  // Test T07: Pure unit test of the scanner logic extracted from build-context-package.mjs
  const scriptText = fs.readFileSync(scriptPath, 'utf8');
  const scanFunctionMatch = scriptText.match(/function scanForSecrets\([\s\S]*?\n\}/);
  if (!scanFunctionMatch) {
    throw new Error("Could not extract scanForSecrets function from build script");
  }
  const scanForSecrets = new Function('text', scanFunctionMatch[0] + '\nreturn scanForSecrets(text);');

  const testSecrets = [
    { text: 'My github token is ' + ['ghp_', '123456789012345678901234567890123456'].join('') + ' here', expected: 'githubToken' },
    { text: 'npm token value ' + ['npm_', 'abcdefghijklmnopqrstuvwxyz0123456789'].join(''), expected: 'npmToken' },
    { text: 'AWS_KEY is ' + ['AKIA', '1234567890123456'].join(''), expected: 'awsAccessKey' },
    { text: 'Slack URL: ' + ['https://hooks.slack.com', 'services', 'T12345678', 'B12345678', '123456789012345678901234'].join('/'), expected: 'slackWebhook' },
    { text: 'Database: ' + ['http://', 'admin', ':', 'supersecretpasswd', '@', 'localhost:5432/db'].join(''), expected: 'urlAuth' },
    { text: ['db_password', ' = ', '"', 'verysecretstring', '"'].join(''), expected: 'credentialAssign' },
    { text: ['client_secret', ': ', '"', 'anothersecretvalue', '"'].join(''), expected: 'credentialAssign' },
    { text: ['private_key', ': ', '"', 'some_key_here', '"'].join(''), expected: 'credentialAssign' },
    { text: 'This is a clean line of code with no secrets.', expected: null }
  ];

  for (const t of testSecrets) {
    const res = scanForSecrets(t.text);
    if (t.expected) {
      if (res.found && res.type === t.expected) {
        console.log(`✅ TEST PASSED: T07 — Scanner correctly identified ${t.expected}`);
      } else {
        throw new Error(`TEST FAILED: T07 — Scanner failed to identify secret: "${t.text}". Got: ${JSON.stringify(res)}`);
      }
    } else {
      if (!res.found) {
        console.log(`✅ TEST PASSED: T07 — Scanner correctly allowed clean text`);
      } else {
        throw new Error(`TEST FAILED: T07 — Scanner flagged clean text as secret: "${t.text}". Got: ${JSON.stringify(res)}`);
      }
    }
  }

  // Test T08
  const t08Path = path.join(selectionsDir, 't08.selection.json');
  try {
    fs.writeFileSync(t08Path, JSON.stringify({
      theme: 't08-invalid-enum',
      generatedAtUtc: '2026-07-13T19:03:16Z',
      selections: [{
        sourcePath: '.agents/AGENTS.md',
        sourceSha256: '35d249acdb4e79173fa7e78e89eb214cdefd80e77551623b9bcbb0fd3d055aa5',
        headingPath: ['AGENTS.md — Reglas de Proyecto: PROTOTIPE', 'PROHIBICIÓN ABSOLUTA DE RESTAURAR O DESCARTAR CAMBIOS FÍSICOS (CRÍTICO - OBLIGATORIO)'],
        startLine: 3,
        endLine: 6,
        relevance: 99,
        handling: 'include_full',
        reason: 'Invalid enum'
      }]
    }, null, 2), 'utf8');
    assertFailure(
      'T08 — Invalid relevance enum check',
      `node "${scriptPath}" --selection "${t08Path}"`,
      'Invalid relevance: 99',
      't08-invalid-enum'
    );
  } finally {
    if (fs.existsSync(t08Path)) {
      fs.rmSync(t08Path, { force: true });
    }
  }

  // Test T09: Incorrect canonical hash check using a temp script copy
  const canonFile = 'Documentacion PROTOTIPE/00_Continuidad/canonical/00_REANUDAR_PROTOTIPE_CONTINUIDAD_2026-07-13.md';
  const canonHashOnDisk = getFileSha256(canonFile);
  const t09Path = path.join(selectionsDir, 't09.selection.json');
  const tempScriptPath = 'Documentacion PROTOTIPE/00_Continuidad/tools/build-context-package-temp.mjs';
  try {
    fs.writeFileSync(t09Path, JSON.stringify({
      theme: 't09-canonical-hash-mismatch',
      generatedAtUtc: '2026-07-13T19:03:16Z',
      selections: [{
        sourcePath: canonFile,
        sourceSha256: canonHashOnDisk,
        headingPath: ['Reanudar PROTOTIPE: Continuidad y Recuperación Operativa Post-Formateo 2026'],
        startLine: 1,
        endLine: 2,
        relevance: 3,
        handling: 'include_full',
        reason: 'Hash mismatch'
      }]
    }, null, 2), 'utf8');

    fs.copyFileSync(scriptPath, tempScriptPath);
    const scriptContent = fs.readFileSync(tempScriptPath, 'utf8');
    const alteredScriptContent = scriptContent.replace(
      "'31136bb2b3e70912a367439f8f5aa601db0036a51b13f96ad2609322b51797da'",
      "'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'"
    );
    fs.writeFileSync(tempScriptPath, alteredScriptContent, 'utf8');

    assertFailure(
      'T09 — Canonical file hash mismatch check',
      `node "${tempScriptPath}" --selection "${t09Path}"`,
      'CANONICAL_SOURCE_HASH_MISMATCH',
      't09-canonical-hash-mismatch'
    );
  } finally {
    if (fs.existsSync(tempScriptPath)) {
      fs.rmSync(tempScriptPath, { force: true });
    }
    if (fs.existsSync(t09Path)) {
      fs.rmSync(t09Path, { force: true });
    }
  }

  // Test T10
  const t10Path = path.join(selectionsDir, 't10.selection.json');
  try {
    fs.writeFileSync(t10Path, JSON.stringify({
      theme: 't10-missing-leeme',
      generatedAtUtc: '2026-07-13T19:03:16Z',
      selections: [{
        sourcePath: '.agents/AGENTS.md',
        sourceSha256: '35d249acdb4e79173fa7e78e89eb214cdefd80e77551623b9bcbb0fd3d055aa5',
        headingPath: ['AGENTS.md — Reglas de Proyecto: PROTOTIPE', 'PROHIBICIÓN ABSOLUTA DE RESTAURAR O DESCARTAR CAMBIOS FÍSICOS (CRÍTICO - OBLIGATORIO)'],
        startLine: 3,
        endLine: 6,
        relevance: 3,
        handling: 'include_full',
        reason: 'Should fail due to missing LEEME'
      }]
    }, null, 2), 'utf8');
    assertFailure(
      'T10 — Missing required LEEME / CONTEXTO_MINIMO check',
      `node "${scriptPath}" --selection "${t10Path}"`,
      'missing required files 00_LEEME.md or 01_CONTEXTO_MINIMO.md',
      't10-missing-leeme'
    );
  } finally {
    if (fs.existsSync(t10Path)) {
      fs.rmSync(t10Path, { force: true });
    }
  }

  // Test T11
  const t11Selection = {
    theme: 't11-wordcount-overflow',
    generatedAtUtc: '2026-07-13T19:03:16Z',
    selections: []
  };
  const fullIdx = JSON.parse(fs.readFileSync(path.join(indexDir, 'context-index.json'), 'utf8'));
  fullIdx.forEach(sec => {
    if (
      sec.sourcePath.includes('GEMINI.md') ||
      sec.sourcePath.includes('Plan_Maestro') ||
      sec.sourcePath.includes('00_REANUDAR') ||
      sec.sourcePath.includes('Auditoria_Integral')
    ) {
      t11Selection.selections.push({
        sourcePath: sec.sourcePath,
        sourceSha256: sec.sourceSha256,
        headingPath: sec.headingPath,
        startLine: sec.startLine,
        endLine: sec.endLine,
        relevance: 3,
        handling: 'include_full',
        reason: 'Exceeding word count',
        sensitivity: 'CLEAR',
        documentStatus: 'INTERNAL_CLAIM',
        classificationReviewStatus: 'PENDING_HUMAN_REVIEW'
      });
    }
  });
  const t11Path = path.join(selectionsDir, 't11.selection.json');
  const t11Dir = path.join(packagesDir, 't11-wordcount-overflow');
  try {
    fs.writeFileSync(t11Path, JSON.stringify(t11Selection, null, 2), 'utf8');
    fs.mkdirSync(t11Dir, { recursive: true });
    fs.writeFileSync(path.join(t11Dir, '00_LEEME.md'), 'LEEME', 'utf8');
    fs.writeFileSync(path.join(t11Dir, '01_CONTEXTO_MINIMO.md'), 'CONTEXTO', 'utf8');

    assertFailure(
      'T11 — Assembled package word count overflow check (> 25,000 words)',
      `node "${scriptPath}" --selection "${t11Path}"`,
      'exceeds 25,000 words limit'
    );
  } finally {
    if (fs.existsSync(t11Dir)) {
      fs.rmSync(t11Dir, { recursive: true, force: true });
    }
    if (fs.existsSync(t11Path)) {
      fs.rmSync(t11Path, { force: true });
    }
  }

  // Test T12
  const pilotSelectionPath = 'Documentacion PROTOTIPE/00_Continuidad/selections/migracion-claude-code.selection.json';
  const pilotPackageDir = 'Documentacion PROTOTIPE/00_Continuidad/packages/migracion-claude-code';
  if (fs.existsSync(pilotSelectionPath)) {
    console.log('Running T12 — Bitwise determinism test...');

    const sevenFiles = [
      '00_LEEME.md',
      '01_CONTEXTO_MINIMO.md',
      '02_FUENTES_SELECCIONADAS.md',
      '03_REFERENCIAS_NO_INCLUIDAS.md',
      '04_ALERTAS_SEGURIDAD.md',
      '05_MANIFIESTO.json',
      'PAQUETE_CONTEXTO_MIGRACION_CLAUDE_CODE.md'
    ];

    const originalBuffers = {};
    const originalHashesBeforeT12 = {};
    for (const file of sevenFiles) {
      const filePath = path.join(pilotPackageDir, file);
      if (fs.existsSync(filePath)) {
        originalBuffers[file] = fs.readFileSync(filePath);
        originalHashesBeforeT12[file] = crypto.createHash('sha256').update(originalBuffers[file]).digest('hex');
      } else {
        originalBuffers[file] = null;
        originalHashesBeforeT12[file] = null;
      }
    }

    let determinismError = null;

    try {
      execSync(`node "${scriptPath}" --selection "${pilotSelectionPath}"`, { stdio: 'ignore' });
      const hash1 = getFileSha256(path.join(pilotPackageDir, 'PAQUETE_CONTEXTO_MIGRACION_CLAUDE_CODE.md'));

      execSync(`node "${scriptPath}" --selection "${pilotSelectionPath}"`, { stdio: 'ignore' });
      const hash2 = getFileSha256(path.join(pilotPackageDir, 'PAQUETE_CONTEXTO_MIGRACION_CLAUDE_CODE.md'));

      if (hash1 !== hash2) {
        throw new Error(`Bitwise determinism mismatch!\nRun 1: ${hash1}\nRun 2: ${hash2}`);
      }
      console.log(`✅ TEST PASSED: T12 — Bitwise determinism matches perfectly (Hash: ${hash1})`);
    } catch (err) {
      determinismError = err;
    } finally {
      // Restore byte-by-byte
      for (const file of sevenFiles) {
        const filePath = path.join(pilotPackageDir, file);
        const buf = originalBuffers[file];
        if (buf !== null) {
          fs.writeFileSync(filePath, buf);
        } else if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Verify after restoration
    for (const file of sevenFiles) {
      const filePath = path.join(pilotPackageDir, file);
      const restoredHash = getFileSha256(filePath);
      const originalHash = originalHashesBeforeT12[file];
      if (restoredHash !== originalHash) {
        throw new Error(`Restoration integrity check failed for ${file}! Expected: ${originalHash}, Got: ${restoredHash}`);
      }
    }

    if (determinismError) {
      throw determinismError;
    }
  }

  // Test T13: Deliberate failure residue check
  const t13Dir = path.join(packagesDir, 't13-residue-failure');
  const t13Path = path.join(selectionsDir, 't13.selection.json');
  let t13FailedCleanup = false;
  try {
    fs.mkdirSync(t13Dir, { recursive: true });
    fs.writeFileSync(path.join(t13Dir, 'temp.md'), 'temp content', 'utf8');
    fs.writeFileSync(t13Path, '{}', 'utf8');

    throw new Error("Deliberate test failure");
  } catch (err) {
    if (err.message !== "Deliberate test failure") {
      throw err;
    }
  } finally {
    if (fs.existsSync(t13Dir)) {
      fs.rmSync(t13Dir, { recursive: true, force: true });
    }
    if (fs.existsSync(t13Path)) {
      fs.rmSync(t13Path, { force: true });
    }
    if (fs.existsSync(t13Dir) || fs.existsSync(t13Path)) {
      t13FailedCleanup = true;
    }
  }

  if (t13FailedCleanup) {
    throw new Error("T13 FAILED: Residues left behind after failure!");
  } else {
    console.log("✅ TEST PASSED: T13 — Deliberate failure residue check verified (no residues left)");
  }

  console.log('\n=== ALL SECURE ROBUSTNESS VALIDATION SUITE PASSED ===\n');

} catch (err) {
  executionError = err;
} finally {
  // Idempotently clean up any possible leftover files
  const leftFiles = ['t02.selection.json', 't03.selection.json', 't04.selection.json', 't05.selection.json', 't06.selection.json', 't08.selection.json', 't09.selection.json', 't10.selection.json', 't11.selection.json', 't13.selection.json'];
  leftFiles.forEach(f => {
    const p = path.join(selectionsDir, f);
    if (fs.existsSync(p)) {
      try { fs.rmSync(p, { force: true }); } catch(e) {}
    }
  });

  const leftDirs = ['t03-escape-source', 't04-continuity-check', 't05-untracked-source', 't06-degrade-sens', 't08-invalid-enum', 't09-canonical-hash-mismatch', 't10-missing-leeme', 't11-wordcount-overflow', 't13-residue-failure'];
  leftDirs.forEach(d => {
    const p = path.join(packagesDir, d);
    if (fs.existsSync(p)) {
      try { fs.rmSync(p, { recursive: true, force: true }); } catch(e) {}
    }
  });

  const tempScriptPath = 'Documentacion PROTOTIPE/00_Continuidad/tools/build-context-package-temp.mjs';
  if (fs.existsSync(tempScriptPath)) {
    try { fs.rmSync(tempScriptPath, { force: true }); } catch(e) {}
  }

  // 2. Capture AFTER state
  const gitStatusAfter = execSync('git status --porcelain=v1', { encoding: 'utf8' });
  const gitDiffCachedAfter = execSync('git diff --cached --binary', { encoding: 'utf8' });
  const extractorHashAfter = getFileSha256(scriptPath);
  const indexHashAfter = getFileSha256(path.join(indexDir, 'context-index.json'));

  const outputsAfter = {
    leeme: getFileSha256(path.join(pilotDir, '00_LEEME.md')),
    contexto: getFileSha256(path.join(pilotDir, '01_CONTEXTO_MINIMO.md')),
    fuentes: getFileSha256(path.join(pilotDir, '02_FUENTES_SELECCIONADAS.md')),
    referencias: getFileSha256(path.join(pilotDir, '03_REFERENCIAS_NO_INCLUIDAS.md')),
    alertas: getFileSha256(path.join(pilotDir, '04_ALERTAS_SEGURIDAD.md')),
    manifiesto: getFileSha256(path.join(pilotDir, '05_MANIFIESTO.json')),
    paquete: getFileSha256(path.join(pilotDir, 'PAQUETE_CONTEXTO_MIGRACION_CLAUDE_CODE.md'))
  };

  let hasDiff = false;

  // Log execution error if exists
  if (executionError) {
    console.error('❌ SUITE EXECUTION FAILED WITH ERROR:', executionError.message);
    console.error(executionError.stack);
    hasDiff = true;
  }

  if (gitStatusBefore !== gitStatusAfter) {
    console.error('❌ INTEGRITY CHECK FAILED: Git status (porcelain=v1) has changed!');
    console.error('BEFORE:\n', gitStatusBefore);
    console.error('AFTER:\n', gitStatusAfter);
    hasDiff = true;
  }
  if (gitDiffCachedBefore !== gitDiffCachedAfter) {
    console.error('❌ INTEGRITY CHECK FAILED: Git cached diff has changed!');
    hasDiff = true;
  }
  if (extractorHashBefore !== extractorHashAfter) {
    console.error(`❌ INTEGRITY CHECK FAILED: Extractor file hash changed! Before: ${extractorHashBefore}, After: ${extractorHashAfter}`);
    hasDiff = true;
  }
  if (indexHashBefore !== indexHashAfter) {
    console.error(`❌ INTEGRITY CHECK FAILED: Index file hash changed! Before: ${indexHashBefore}, After: ${indexHashAfter}`);
    hasDiff = true;
  }

  // Verify outputs
  for (const [key, hashBefore] of Object.entries(outputsBefore)) {
    const hashAfter = outputsAfter[key];
    if (hashBefore !== hashAfter) {
      console.error(`❌ INTEGRITY CHECK FAILED: Output ${key} hash changed! Before: ${hashBefore}, After: ${hashAfter}`);
      hasDiff = true;
    }
  }

  if (hasDiff) {
    console.error('❌ Integrity verification failed: residual modifications or drifts detected!');
    process.exitCode = 1;
  } else {
    console.log('✅ INTEGRITY VERIFICATION SUCCESSFUL: No drifts or residual changes detected!');
  }
}
