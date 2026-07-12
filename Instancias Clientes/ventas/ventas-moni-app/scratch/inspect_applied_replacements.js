import fs from 'fs';

const currentLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';
const targetFile = 'd:\\Aplicaciones\\App Ventas\\src\\pages\\admin\\AdminSettings.jsx';

let currentContent = fs.readFileSync(targetFile, 'utf8').replace(/\r\n/g, '\n');

function cleanValue(val) {
  if (typeof val !== 'string') return '';
  let str = val.trim();
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.substring(1, str.length - 1);
  }
  str = str.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  return str;
}

function loadOperations(logPath) {
  const lines = fs.readFileSync(logPath, 'utf8').split('\n');
  let ops = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content' || tc.name === 'write_to_file') {
            const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
            const file = args.TargetFile;
            if (file && file.includes('AdminSettings.jsx')) {
              ops.push({
                step: obj.step_index,
                type: tc.name,
                args: args
              });
            }
          }
        }
      }
    } catch (e) {}
  }
  return ops;
}

let operations = loadOperations(currentLogPath);
operations.sort((a, b) => a.step - b.step);

for (const op of operations) {
  if (op.type === 'replace_file_content') {
    const targetVal = cleanValue(op.args.TargetContent).replace(/\r\n/g, '\n');
    const replacementVal = cleanValue(op.args.ReplacementContent).replace(/\r\n/g, '\n');
    
    const idx = currentContent.indexOf(targetVal);
    if (idx !== -1) {
      currentContent = currentContent.substring(0, idx) + replacementVal + currentContent.substring(idx + targetVal.length);
      console.log(`Step ${op.step} applied. Length now: ${currentContent.length}`);
      if (currentContent.includes(')"')) {
        console.log(`-> Corruption DETECTED after Step ${op.step}!`);
        // print context around )"
        const cIdx = currentContent.indexOf(')"');
        console.log(JSON.stringify(currentContent.substring(cIdx - 100, cIdx + 100)));
        break;
      }
    }
  }
}
