/**
 * test_templates.js — Runner de Pruebas de Integración del CLI PROTOTIPE
 * -------------------------------------------------------------------------
 * Valida que cada plantilla registrada en `plantillas_registro.json` compile
 * sin errores en un directorio temporal aislado. No toca ninguna app activa.
 *
 * Uso:
 *   node test_templates.js                    # Prueba todas las plantillas activas
 *   node test_templates.js --all              # Incluye plantillas inactivas
 *   node test_templates.js --template ventas  # Prueba solo una plantilla
 *   node test_templates.js --keep-temp        # Conserva los directorios temporales
 *   node test_templates.js --no-install       # Omite npm install (usa cache existente)
 *   node test_templates.js --verbose          # Muestra stdout/stderr del build
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import pc from 'picocolors';
import { execSync } from 'child_process';

// ─── Constantes ─────────────────────────────────────────────────────────────

const REGISTRO_PATH = path.join(process.cwd(), 'plantillas_registro.json');
const TEMP_PREFIX   = 'prototipe-test-';
const TIMEOUT_MS    = 5 * 60 * 1000; // 5 min por plantilla

// ─── Helpers ─────────────────────────────────────────────────────────────────

function printBanner(text, color = pc.cyan) {
  const line = '═'.repeat(58);
  console.log('\n' + color(pc.bold(`╔${line}╗`)));
  console.log(color(pc.bold(`║  ${text.padEnd(56)}║`)));
  console.log(color(pc.bold(`╚${line}╝`)) + '\n');
}

function printSection(text) {
  console.log(pc.bold(pc.white(`\n  ▸ ${text}`)));
}

function ms(duration) {
  if (duration < 1000) return `${duration}ms`;
  return `${(duration / 1000).toFixed(1)}s`;
}

function validarRegistro(registro) {
  const errors = [];
  if (!registro || typeof registro !== 'object') {
    errors.push('El registro debe ser un objeto JSON válido.');
    return errors;
  }
  if (!registro.plantillas || typeof registro.plantillas !== 'object') {
    errors.push('Falta el objeto "plantillas" en el JSON de registro.');
    return errors;
  }
  const semverRegex = /^\d+\.\d+\.\d+$/;
  for (const [key, config] of Object.entries(registro.plantillas)) {
    if (!config || typeof config !== 'object') {
      errors.push(`La entrada "${key}" debe ser un objeto.`);
      continue;
    }
    const required = ['fuente', 'destino', 'nicho', 'activo', 'version'];
    required.forEach(f => {
      if (!(f in config)) {
        errors.push(`La plantilla "${key}" no contiene el campo requerido "${f}".`);
      }
    });
    if (config.version && !semverRegex.test(config.version)) {
      errors.push(`La versión de "${key}" ("${config.version}") no es SemVer válido.`);
    }
  }
  return errors;
}

/**
 * Audita consistencia de dependencias en package.json de la plantilla contra las versiones de oro del Core
 * @param {Object} pkg Contenido de package.json
 * @param {string} name Nombre de la plantilla
 */
function auditarDependencias(pkg, name) {
  const goldenDependencies = {
    'react': '^19.2.6',
    'react-dom': '^19.2.6',
    'firebase': '^12.13.0',
    'zustand': '^5.0.13',
    'framer-motion': '^12.40.0',
    'tailwindcss': '^4.3.0',
    'vite': '^8.0.12'
  };

  const warnings = [];
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  for (const [depName, goldenVersion] of Object.entries(goldenDependencies)) {
    if (depName in allDeps) {
      const currentVersion = allDeps[depName];
      const currentMatch = currentVersion.match(/\d+/);
      const goldenMatch = goldenVersion.match(/\d+/);
      
      if (currentMatch && goldenMatch) {
        const currentMajor = parseInt(currentMatch[0], 10);
        const goldenMajor = parseInt(goldenMatch[0], 10);
        
        if (currentMajor !== goldenMajor) {
          warnings.push(`Diferencia de versión en "${depName}": plantilla usa ${currentVersion}, Core recomienda ${goldenVersion}`);
        }
      }
    }
  }
  return warnings;
}

/**
 * Copia la plantilla (destino del registro) a un directorio temporal aislado.
 * @param {string} templateDir  Ruta al template en el CLI (ya sincronizado).
 * @param {string} tempDir      Ruta temporal de destino.
 */
async function copiarPlantillaATemporal(templateDir, tempDir) {
  await fs.ensureDir(tempDir);
  await fs.copy(templateDir, tempDir, {
    overwrite: true,
    filter: (src) => {
      const rel = path.relative(templateDir, src);
      // Excluir node_modules y artefactos de build previos para ahorrar tiempo
      return !rel.startsWith('node_modules') && !rel.startsWith('dist') && !rel.startsWith('.vite');
    }
  });
}

/**
 * Ejecuta un comando con timeout y retorna { success, stdout, stderr, duration }.
 */
function runCmd(cmd, cwd, verbose = false) {
  const start = Date.now();
  try {
    const output = execSync(cmd, {
      cwd,
      timeout: TIMEOUT_MS,
      stdio: verbose ? 'inherit' : 'pipe',
      shell: true,
      encoding: 'utf8'
    });
    return { success: true, stdout: output || '', stderr: '', duration: Date.now() - start };
  } catch (err) {
    return {
      success: false,
      stdout: err.stdout || '',
      stderr: err.stderr || err.message || '',
      duration: Date.now() - start
    };
  }
}

// ─── Test Runner ─────────────────────────────────────────────────────────────

async function testPlantilla(name, config, opts) {
  const { keepTemp, noInstall, verbose } = opts;
  const { fuente, destino, nicho, version, activo } = config;

  const result = {
    name,
    nicho,
    version,
    activo,
    passed: false,
    skipped: false,
    skipReason: null,
    steps: [],
    tempDir: null,
    totalDuration: 0,
  };

  const startTotal = Date.now();
  const tempDir = path.join(os.tmpdir(), `${TEMP_PREFIX}${name}-${Date.now()}`);
  result.tempDir = tempDir;

  console.log(pc.bold(pc.white(`\n  Plantilla: ${pc.cyan(name)} (${nicho}) — v${version}${activo ? '' : pc.yellow(' [INACTIVA]')}`)));

  // ── Paso 1: Verificar que existe el template en CLI (destino) ──────────────
  printSection('Verificando existencia del template en CLI...');
  if (!await fs.pathExists(destino)) {
    result.skipped = true;
    result.skipReason = `Template no sincronizado. Carpeta destino no existe: ${destino}`;
    console.log(pc.yellow(`    ⚠️ OMITIDA: ${result.skipReason}`));
    console.log(pc.gray(`    💡 Ejecuta: node sync_templates.js ${name} --yes`));
    result.totalDuration = Date.now() - startTotal;
    return result;
  }

  // ── Paso 2: Verificar package.json en el template ──────────────────────────
  const pkgPath = path.join(destino, 'package.json');
  if (!await fs.pathExists(pkgPath)) {
    result.skipped = true;
    result.skipReason = 'No existe package.json en la carpeta del template. ¿Ya fue sincronizado?';
    console.log(pc.yellow(`    ⚠️ OMITIDA: ${result.skipReason}`));
    result.totalDuration = Date.now() - startTotal;
    return result;
  }

  const pkg = await fs.readJson(pkgPath);
  
  // ── Paso 2.5: Auditar dependencias críticas ───────────────────────────────
  printSection('Auditando consistencia de dependencias...');
  const warnings = auditarDependencias(pkg, name);
  if (warnings.length > 0) {
    warnings.forEach(w => console.log(pc.yellow(`    ⚠️ ADVERTENCIA: ${w}`)));
  } else {
    console.log(pc.green('    ✓ Todas las dependencias críticas coinciden con el Core de Oro.'));
  }

  if (!pkg.scripts || !pkg.scripts.build) {
    result.skipped = true;
    result.skipReason = 'El package.json del template no define un script "build".';
    console.log(pc.yellow(`    ⚠️ OMITIDA: ${result.skipReason}`));
    result.totalDuration = Date.now() - startTotal;
    return result;
  }

  // ── Paso 3: Copiar template a directorio temporal ──────────────────────────
  printSection('Copiando template a directorio temporal...');
  try {
    await copiarPlantillaATemporal(destino, tempDir);
    console.log(pc.gray(`    ✓ Temporal: ${tempDir}`));
    result.steps.push({ step: 'copy', success: true });
  } catch (err) {
    result.steps.push({ step: 'copy', success: false, error: err.message });
    console.log(pc.red(`    ✗ Error al copiar: ${err.message}`));
    result.totalDuration = Date.now() - startTotal;
    await cleanupTemp(tempDir, keepTemp);
    return result;
  }

  // ── Paso 4: npm install ────────────────────────────────────────────────────
  if (!noInstall) {
    printSection('Instalando dependencias (npm install)...');
    const installResult = runCmd('npm install --no-audit --no-fund --prefer-offline', tempDir, verbose);
    result.steps.push({ step: 'install', ...installResult });

    if (!installResult.success) {
      console.log(pc.red(`    ✗ npm install falló (${ms(installResult.duration)})`));
      if (!verbose && installResult.stderr) {
        const preview = installResult.stderr.split('\n').slice(0, 6).join('\n');
        console.log(pc.gray(`    ${preview}`));
      }
      result.totalDuration = Date.now() - startTotal;
      await cleanupTemp(tempDir, keepTemp);
      return result;
    }
    console.log(pc.gray(`    ✓ Dependencias instaladas (${ms(installResult.duration)})`));
  } else {
    // Si se omite install, asegurarse de que node_modules exista
    if (!await fs.pathExists(path.join(tempDir, 'node_modules'))) {
      result.skipped = true;
      result.skipReason = 'Flag --no-install activo pero no existe node_modules en el temporal.';
      console.log(pc.yellow(`    ⚠️ OMITIDA: ${result.skipReason}`));
      result.totalDuration = Date.now() - startTotal;
      await cleanupTemp(tempDir, keepTemp);
      return result;
    }
    console.log(pc.gray('    ✓ npm install omitido (--no-install)'));
    result.steps.push({ step: 'install', success: true, skipped: true });
  }

  // ── Paso 5: npm run build ──────────────────────────────────────────────────
  printSection('Compilando bundle de producción (npm run build)...');
  const buildResult = runCmd('npm run build', tempDir, verbose);
  result.steps.push({ step: 'build', ...buildResult });

  if (!buildResult.success) {
    console.log(pc.red(`    ✗ Build FALLIDO (${ms(buildResult.duration)})`));
    if (!verbose) {
      // Mostrar las últimas líneas del error para diagnóstico rápido
      const errLines = (buildResult.stderr || buildResult.stdout || '')
        .split('\n')
        .filter(l => l.trim())
        .slice(-12)
        .join('\n');
      if (errLines) {
        console.log(pc.gray('\n    ── Últimas líneas del error: ──'));
        console.log(pc.red(errLines.split('\n').map(l => `    ${l}`).join('\n')));
      }
    }
    result.totalDuration = Date.now() - startTotal;
    await cleanupTemp(tempDir, keepTemp);
    return result;
  }

  console.log(pc.green(`    ✓ Build exitoso (${ms(buildResult.duration)})`));

  // ── Paso 6: Verificar artefactos generados ────────────────────────────────
  printSection('Verificando artefactos generados...');
  const distPath = path.join(tempDir, 'dist');
  const distExists = await fs.pathExists(distPath);

  if (!distExists) {
    result.steps.push({ step: 'verify-dist', success: false, error: 'Carpeta dist/ no generada.' });
    console.log(pc.yellow(`    ⚠️ La compilación no generó una carpeta dist/. Revisar vite.config.js`));
  } else {
    const distFiles = await fs.readdir(distPath);
    const hasIndex  = distFiles.includes('index.html');
    const assetDir  = path.join(distPath, 'assets');
    const hasAssets = await fs.pathExists(assetDir);

    result.steps.push({ step: 'verify-dist', success: hasIndex && hasAssets, files: distFiles });

    if (hasIndex && hasAssets) {
      const assets = await fs.readdir(assetDir);
      console.log(pc.gray(`    ✓ dist/ generado: index.html + ${assets.length} asset(s)`));
    } else {
      console.log(pc.yellow(`    ⚠️ dist/ incompleto (index.html: ${hasIndex}, assets/: ${hasAssets})`));
    }
  }

  // ── Limpieza y resultado ──────────────────────────────────────────────────
  result.passed = true;
  result.totalDuration = Date.now() - startTotal;
  await cleanupTemp(tempDir, keepTemp);
  return result;
}

async function cleanupTemp(tempDir, keepTemp) {
  if (!keepTemp && tempDir) {
    try {
      await fs.remove(tempDir);
    } catch (_) { /* silencioso */ }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  const includeAll  = args.includes('--all')        || args.includes('-a');
  const keepTemp    = args.includes('--keep-temp')   || args.includes('-k');
  const noInstall   = args.includes('--no-install');
  const verbose     = args.includes('--verbose')     || args.includes('-v');

  // Extraer nombre de plantilla específica
  const templateIdx = args.findIndex(a => a === '--template' || a === '-t');
  const targetName  = templateIdx !== -1 ? args[templateIdx + 1] : null;

  printBanner('PROTOTIPE CLI — TEST DE INTEGRACIÓN DE PLANTILLAS', pc.cyan);

  if (keepTemp)   console.log(pc.yellow('  ⚠️ Modo --keep-temp: los directorios temporales NO serán eliminados.'));
  if (noInstall)  console.log(pc.yellow('  ⚠️ Modo --no-install: se omitirá npm install.'));
  if (verbose)    console.log(pc.yellow('  ⚠️ Modo --verbose: se mostrará salida completa de builds.'));
  if (includeAll) console.log(pc.yellow('  ⚠️ Modo --all: se incluirán plantillas inactivas.'));

  // Cargar y validar registro
  if (!await fs.pathExists(REGISTRO_PATH)) {
    console.error(pc.red(`\n❌ No se encontró el registro: ${REGISTRO_PATH}\n`));
    process.exit(1);
  }

  const registro = await fs.readJson(REGISTRO_PATH);
  const schemaErrors = validarRegistro(registro);
  if (schemaErrors.length > 0) {
    console.error(pc.red('\n❌ El archivo plantillas_registro.json contiene errores de esquema:'));
    schemaErrors.forEach(e => console.error(pc.red(`   - ${e}`)));
    process.exit(1);
  }

  const plantillas = registro.plantillas;

  // Filtrar plantillas a probar
  let toTest = Object.entries(plantillas);

  if (targetName) {
    if (!plantillas[targetName]) {
      console.error(pc.red(`\n❌ La plantilla "${targetName}" no existe en el registro.\n`));
      console.log(pc.cyan('Disponibles: ') + Object.keys(plantillas).join(', '));
      process.exit(1);
    }
    toTest = [[targetName, plantillas[targetName]]];
  } else if (!includeAll) {
    toTest = toTest.filter(([, cfg]) => cfg.activo === true);
  }

  if (toTest.length === 0) {
    console.log(pc.yellow('\n⚠️ No hay plantillas activas para probar. Usa --all para incluir inactivas.\n'));
    process.exit(0);
  }

  console.log(pc.gray(`\n  Plantillas a probar: ${toTest.map(([n]) => n).join(', ')}\n`));
  console.log(pc.gray('─'.repeat(62)));

  // Ejecutar tests secuencialmente (builds son intensivos en CPU)
  const results = [];
  for (const [name, config] of toTest) {
    const res = await testPlantilla(name, config, { keepTemp, noInstall, verbose });
    results.push(res);
  }

  // ── Reporte final ─────────────────────────────────────────────────────────
  printBanner('REPORTE DE RESULTADOS', pc.white);

  const passed   = results.filter(r => r.passed);
  const failed   = results.filter(r => !r.passed && !r.skipped);
  const skipped  = results.filter(r => r.skipped);
  const totalMs  = results.reduce((a, r) => a + r.totalDuration, 0);

  console.log(pc.bold('  Plantilla'.padEnd(20) + 'Estado'.padEnd(14) + 'Duración'.padEnd(12) + 'Notas'));
  console.log(pc.gray('  ' + '─'.repeat(58)));

  results.forEach(r => {
    let status, color;
    if (r.skipped) {
      status = '⊘ OMITIDA';
      color = pc.yellow;
    } else if (r.passed) {
      status = '✓ PASSED';
      color = pc.green;
    } else {
      status = '✗ FAILED';
      color = pc.red;
    }

    const failedStep = r.steps.find(s => !s.success && !s.skipped);
    const notes = r.skipped
      ? (r.skipReason || '').slice(0, 38)
      : failedStep
        ? `Fallo en: ${failedStep.step}`
        : r.passed ? `v${r.version}` : '';

    console.log(
      '  ' +
      color(r.name.padEnd(20)) +
      color(status.padEnd(14)) +
      pc.gray(ms(r.totalDuration).padEnd(12)) +
      pc.gray(notes)
    );
  });

  console.log(pc.gray('\n  ' + '─'.repeat(58)));
  console.log(
    `\n  ${pc.green(`${passed.length} pasaron`)}` +
    (failed.length  ? `   ${pc.red(`${failed.length} fallaron`)}` : '') +
    (skipped.length ? `   ${pc.yellow(`${skipped.length} omitidas`)}` : '') +
    `   ${pc.gray(`Tiempo total: ${ms(totalMs)}`)}\n`
  );

  if (failed.length > 0) {
    console.log(pc.red(pc.bold('  ❌ RESULTADO: FALLIDO — Hay plantillas que no compilan.\n')));
    console.log(pc.gray('  Sugerencias:'));
    console.log(pc.gray('    • Sincroniza primero con: node sync_templates.js [nombre] --yes'));
    console.log(pc.gray('    • Revisa errores con:     node test_templates.js --template [nombre] --verbose'));
    console.log(pc.gray('    • Conserva el temporal:   node test_templates.js --template [nombre] --keep-temp\n'));
    process.exit(1);
  }

  if (passed.length > 0) {
    console.log(pc.green(pc.bold('  ✅ RESULTADO: OK — Todas las plantillas probadas compilan correctamente.\n')));
  }

  process.exit(0);
}

main().catch(err => {
  console.error(pc.red(`\n❌ Error inesperado: ${err.message}\n`));
  process.exit(1);
});
