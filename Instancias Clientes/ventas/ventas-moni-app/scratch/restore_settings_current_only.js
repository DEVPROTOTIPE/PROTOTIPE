import fs from 'fs';
import path from 'path';

const currentLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';
const targetFile = 'd:\\Aplicaciones\\App Ventas\\src\\pages\\admin\\AdminSettings.jsx';

// Start with clean file from D:\Aplicaciones\App Ventas\src\pages\admin\AdminSettings.jsx (which is checked out to 2ac4423)
let currentContent = fs.readFileSync(targetFile, 'utf8');

function loadOperations(logPath) {
  if (!fs.existsSync(logPath)) {
    console.log(`Log path not found: ${logPath}`);
    return [];
  }
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
                args: args,
                created_at: obj.created_at
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
console.log(`Loaded ${operations.length} operations from current log.`);

// Sort chronologically by step index and created_at
operations.sort((a, b) => {
  if (a.step !== b.step) return a.step - b.step;
  return new Date(a.created_at) - new Date(b.created_at);
});

function normalize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\r\n/g, '\n').trim();
}

let appliedCount = 0;
for (const op of operations) {
  console.log(`Applying Step ${op.step} (${op.type}) - ${op.args.Description || op.args.Instruction}`);
  
  if (op.type === 'write_to_file') {
    currentContent = op.args.CodeContent;
    appliedCount++;
    console.log(`-> File fully overwritten.`);
  } else if (op.type === 'replace_file_content') {
    const target = normalize(op.args.TargetContent);
    const replacement = normalize(op.args.ReplacementContent);
    const currentNorm = normalize(currentContent);
    
    if (!currentNorm.includes(target)) {
      console.warn(`WARNING: TargetContent not found in step ${op.step}. Skipping.`);
      continue;
    }
    
    // Replace in currentContent maintaining exact formatting
    const idx = currentNorm.indexOf(target);
    currentContent = currentNorm.substring(0, idx) + replacement + currentNorm.substring(idx + target.length);
    appliedCount++;
  } else if (op.type === 'multi_replace_file_content') {
    const chunks = op.args.ReplacementChunks;
    let currentNorm = normalize(currentContent);
    let success = true;
    for (const chunk of chunks) {
      const target = normalize(chunk.TargetContent);
      const replacement = normalize(chunk.ReplacementContent);
      if (!currentNorm.includes(target)) {
        console.warn(`WARNING: Chunk TargetContent not found in step ${op.step}.`);
        success = false;
        break;
      }
      const idx = currentNorm.indexOf(target);
      currentNorm = currentNorm.substring(0, idx) + replacement + currentNorm.substring(idx + target.length);
    }
    if (success) {
      currentContent = currentNorm;
      appliedCount++;
    }
  }
}

console.log(`Replay finished. Applied ${appliedCount}/${operations.length} operations.`);

// Save back
fs.writeFileSync(targetFile, currentContent, 'utf8');
console.log(`File reconstructed and saved.`);
