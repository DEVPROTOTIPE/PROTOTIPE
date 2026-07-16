import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..');

async function run() {
  console.log('🧪 Iniciando Verificación de Compatibilidad Multiplataforma...');
  
  const filesToScan = [
    path.join(CLI_ROOT, 'generator.js'),
    path.join(CLI_ROOT, 'server.js'),
    path.join(CLI_ROOT, 'config.js'),
    path.join(CLI_ROOT, 'lib', 'CoreCandidateBuilder.js')
  ];

  const results = [];
  function recordResult(testName, passed, error = null) {
    results.push({ name: testName, passed, error: error ? String(error.message || error) : null });
    if (passed) {
      console.log(`  🟢 [PASS] ${testName}`);
    } else {
      console.error(`  🔴 [FAIL] ${testName}`);
      if (error) console.error(`     Motivo: ${error}`);
    }
  }

  // 1. Verificar que no haya hardcodeo de la ruta D:\PROTOTIPE en los fuentes principales (evitando falsos positivos en comentarios o expresiones regulares)
  let hasHardcodedPaths = false;
  for (const file of filesToScan) {
    if (await fs.pathExists(file)) {
      const content = await fs.readFile(file, 'utf8');
      // Buscar asignaciones de strings literales a variables
      if (content.includes('\'D:\\\\PROTOTIPE\'') || content.includes('"D:\\\\PROTOTIPE"') || content.includes('\'D:/PROTOTIPE\'') || content.includes('"D:/PROTOTIPE"')) {
        hasHardcodedPaths = true;
        console.error(`  🔴 Encontrado string literal rígido de Windows en: ${file}`);
      }
    }
  }
  recordResult('multiplatform: Ausencia de rutas absolutas hardcodeadas de Windows (D:\\PROTOTIPE)', !hasHardcodedPaths);

  // 2. Verificar que se use import.meta.url para la resolución dinámica de __dirname en ESM
  let usesDynamicPathResolution = true;
  const configContent = await fs.readFile(path.join(CLI_ROOT, 'config.js'), 'utf8');
  if (!configContent.includes('import.meta.url') && !configContent.includes('fileURLToPath')) {
    usesDynamicPathResolution = false;
  }
  recordResult('multiplatform: Uso de import.meta.url para resolución dinámica de paths bajo ESM', usesDynamicPathResolution);

  // 3. Verificar que la ejecución de comandos externos en generator.js y CoreCandidateBuilder.js no use comandos Windows puros sin chequear OS
  let isMultiplatformShellSafe = true;
  for (const file of [path.join(CLI_ROOT, 'generator.js'), path.join(CLI_ROOT, 'lib', 'CoreCandidateBuilder.js')]) {
    if (await fs.pathExists(file)) {
      const content = await fs.readFile(file, 'utf8');
      // Buscar exec o spawn con cmd /c estricto sin control de plataforma (process.platform)
      if (content.includes('cmd /c') && !content.includes('platform') && !content.includes('win32')) {
        isMultiplatformShellSafe = false;
        console.error(`  🔴 Encontrada llamada rígida a cmd /c en: ${file}`);
      }
    }
  }
  recordResult('multiplatform: Ejecución de procesos portable (no rígida a cmd.exe de Windows)', isMultiplatformShellSafe);

  const failedTests = results.filter(r => !r.passed);
  console.log(`\n======================================================`);
  console.log(`📊  RESULTADOS DE COMPATIBILIDAD MULTIPLATAFORMA:`);
  console.log(`    Pasados:  ${results.length - failedTests.length}`);
  console.log(`    Fallados: ${failedTests.length}`);
  console.log(`======================================================`);

  const scratchDir = path.join(CLI_ROOT, 'scratch');
  await fs.ensureDir(scratchDir);
  await fs.writeJson(path.join(scratchDir, 'multiplatform-results.json'), {
    passed: results.length - failedTests.length,
    failed: failedTests.length,
    total: results.length,
    assertions: results
  }, { spaces: 2 });

  if (failedTests.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch(err => {
  console.error('🔴 Error fatal no controlado durante la suite multiplataforma:', err);
  process.exit(1);
});
