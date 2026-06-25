import fs from 'fs';
import path from 'path';

const prevLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\0a452bbd-1eb3-4e87-b991-5994099795cb\\.system_generated\\logs\\transcript.jsonl';
const currentLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';
const targetFile = 'd:\\Aplicaciones\\App Ventas\\src\\pages\\admin\\AdminSettings.jsx';

// Start with clean file from git
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

function loadOperations(logPath, isCurrent) {
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
                created_at: obj.created_at,
                isCurrent: isCurrent
              });
            }
          }
        }
      }
    } catch (e) {}
  }
  return ops;
}

let operations = [
  ...loadOperations(prevLogPath, false),
  ...loadOperations(currentLogPath, true)
];

console.log(`Loaded total ${operations.length} operations from BOTH logs.`);

// Sort chronologically:
// operations from prevLogPath first, then currentLogPath.
// Within each, sort by step_index and created_at.
operations.sort((a, b) => {
  if (a.isCurrent !== b.isCurrent) {
    return a.isCurrent ? 1 : -1; // false (prev) first, true (current) second
  }
  if (a.step !== b.step) return a.step - b.step;
  return new Date(a.created_at) - new Date(b.created_at);
});

let appliedCount = 0;
let skippedCount = 0;
let alreadyAppliedCount = 0;

for (const op of operations) {
  const desc = op.args.Description || op.args.Instruction;
  const isCurrentStr = op.isCurrent ? 'CURRENT' : 'PREV';
  
  if (op.type === 'write_to_file') {
    currentContent = cleanValue(op.args.CodeContent).replace(/\r\n/g, '\n');
    appliedCount++;
    console.log(`Applying [${isCurrentStr}] Step ${op.step} (${op.type}) -> File fully overwritten.`);
  } else if (op.type === 'replace_file_content') {
    const targetVal = cleanValue(op.args.TargetContent).replace(/\r\n/g, '\n');
    const replacementVal = cleanValue(op.args.ReplacementContent).replace(/\r\n/g, '\n');
    
    // Check if already applied
    if (currentContent.includes(replacementVal)) {
      console.log(`Already Applied [${isCurrentStr}] Step ${op.step} (${op.type}) - Skipping. Desc: ${desc}`);
      alreadyAppliedCount++;
      continue;
    }
    
    const idx = currentContent.indexOf(targetVal);
    if (idx === -1) {
      console.warn(`WARNING: TargetContent not found in [${isCurrentStr}] Step ${op.step}. skipping. Desc: ${desc}`);
      skippedCount++;
      continue;
    }
    
    currentContent = currentContent.substring(0, idx) + replacementVal + currentContent.substring(idx + targetVal.length);
    appliedCount++;
    console.log(`Applied [${isCurrentStr}] Step ${op.step} (${op.type}) - ${desc}`);
  } else if (op.type === 'multi_replace_file_content') {
    const chunks = op.args.ReplacementChunks;
    let tempContent = currentContent;
    let success = true;
    let allChunksAlreadyApplied = true;
    
    for (const chunk of chunks) {
      const replacementVal = cleanValue(chunk.ReplacementContent).replace(/\r\n/g, '\n');
      if (!currentContent.includes(replacementVal)) {
        allChunksAlreadyApplied = false;
        break;
      }
    }
    
    if (allChunksAlreadyApplied) {
      console.log(`Already Applied [${isCurrentStr}] Step ${op.step} (${op.type}) - Skipping. Desc: ${desc}`);
      alreadyAppliedCount++;
      continue;
    }
    
    for (const chunk of chunks) {
      const targetVal = cleanValue(chunk.TargetContent).replace(/\r\n/g, '\n');
      const replacementVal = cleanValue(chunk.ReplacementContent).replace(/\r\n/g, '\n');
      const idx = tempContent.indexOf(targetVal);
      if (idx === -1) {
        console.warn(`WARNING: Chunk TargetContent not found in [${isCurrentStr}] Step ${op.step}. Match failed. Desc: ${desc}`);
        success = false;
        break;
      }
      tempContent = tempContent.substring(0, idx) + replacementVal + tempContent.substring(idx + targetVal.length);
    }
    if (success) {
      currentContent = tempContent;
      appliedCount++;
      console.log(`Applied [${isCurrentStr}] Step ${op.step} (${op.type}) - ${desc}`);
    } else {
      skippedCount++;
    }
  }
}

console.log(`Replay finished. Applied ${appliedCount}/${operations.length} operations. Already Applied ${alreadyAppliedCount}. Skipped ${skippedCount}.`);

// Save back using CRLF for Windows compatibility
fs.writeFileSync(targetFile, currentContent.replace(/\n/g, '\r\n'), 'utf8');
console.log(`File reconstructed and saved.`);
