const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

const SYNC_EXCLUDED_PATHS = [
  '.env.local', '.firebaserc', 'firebase.json',
  'src/config/firebaseConfig.js', 'src/config/niche.json',
  'index.html', 'public', 'package-lock.json',
  'node_modules', '.git', '.git-backup-temp', '.vite', 'dist',
  'playwright-report', 'test-results', '.prototipe.json', 'scratch'
];

function getSyncFilesRecursive(dir, baseDir = dir) {
  let results = [];
  let list;
  try { list = fs.readdirSync(dir); } catch (_) { return results; }
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const rel = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    const isExcluded = SYNC_EXCLUDED_PATHS.some(ex => rel === ex || rel.startsWith(ex + '/'))
      || rel.startsWith('Documentacion ') || rel.split('/').some(p => p.startsWith('Documentacion '));
    if (isExcluded) continue;
    let stat;
    try { stat = fs.statSync(fullPath); } catch (_) { continue; }
    if (stat.isDirectory()) {
      results = results.concat(getSyncFilesRecursive(fullPath, baseDir));
    } else {
      results.push(rel);
    }
  }
  return results;
}

function getSyncFileHash(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(buf).digest('hex');
  } catch (_) { return null; }
}

const corePath = 'd:/PROTOTIPE/Plantillas Core/App Ventas';
const clientPath = 'd:/PROTOTIPE/Instancias Clientes/ventas-moni-app';

console.log('Escaneando archivos del Core...');
const coreFiles = getSyncFilesRecursive(corePath);
console.log('Archivos escaneados:', coreFiles.length);

let diffCount = 0;
for (const relFile of coreFiles) {
  const coreHash   = getSyncFileHash(path.join(corePath, relFile));
  const clientHash = getSyncFileHash(path.join(clientPath, relFile));
  if (coreHash !== clientHash) {
    console.log(`Diferencia encontrada en: ${relFile}`);
    console.log(`  Core hash:   ${coreHash}`);
    console.log(`  Client hash: ${clientHash}`);
    diffCount++;
  }
}
console.log(`Total diferencias: ${diffCount}`);
