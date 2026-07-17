import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';

const expectedNode = '22.23.0';
const expectedNpm = '10.9.8';
const testValuesIndex = process.argv.indexOf('--test-values');
const isTestValues = testValuesIndex >= 0;

let actualNpm = 'unavailable';
let actualNode = process.versions.node;
if (isTestValues) {
  actualNode = process.argv[testValuesIndex + 1] ?? 'unavailable';
  actualNpm = process.argv[testValuesIndex + 2] ?? 'unavailable';
} else {
  try {
    const npmCli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
    actualNpm = execFileSync(process.execPath, [npmCli, '--version'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    // Keep the explicit unavailable marker for the failure report below.
  }
}

const failures = [];
if (actualNode !== expectedNode) {
  failures.push(`Node ${expectedNode} required; found ${actualNode}.`);
}
if (actualNpm !== expectedNpm) {
  failures.push(`npm ${expectedNpm} required; found ${actualNpm}.`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Runtime verified: Node ${expectedNode}, npm ${expectedNpm}.`);
}
