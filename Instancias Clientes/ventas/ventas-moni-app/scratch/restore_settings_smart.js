import fs from 'fs';
import path from 'path';

const currentLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';
const targetFile = 'd:\\Aplicaciones\\App Ventas\\src\\pages\\admin\\AdminSettings.jsx';

// Start with clean file from git
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

function makeRegex(targetStr) {
  if (!targetStr) return null;
  // Normalize string first (trim, clean up escapes if any)
  let cleanStr = targetStr.trim();
  // Escape regex special characters
  let escaped = cleanStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  // Replace all whitespace sequences with \s+
  let pattern = escaped.replace(/\s+/g, '\\s+');
  return new RegExp(pattern);
}

let appliedCount = 0;
for (const op of operations) {
  console.log(`Applying Step ${op.step} (${op.type}) - ${op.args.Description || op.args.Instruction}`);
  
  if (op.type === 'write_to_file') {
    currentContent = op.args.CodeContent;
    appliedCount++;
    console.log(`-> File fully overwritten.`);
  } else if (op.type === 'replace_file_content') {
    const targetVal = op.args.TargetContent;
    const replacementVal = op.args.ReplacementContent;
    
    const regex = makeRegex(targetVal);
    const match = currentContent.match(regex);
    
    if (!match) {
      console.warn(`WARNING: TargetContent not found in step ${op.step}. skipping.`);
      continue;
    }
    
    // Replace the matched portion with replacementVal
    currentContent = currentContent.substring(0, match.index) + replacementVal + currentContent.substring(match.index + match[0].length);
    appliedCount++;
  } else if (op.type === 'multi_replace_file_content') {
    const chunks = op.args.ReplacementChunks;
    let tempContent = currentContent;
    let success = true;
    for (const chunk of chunks) {
      const targetVal = chunk.TargetContent;
      const replacementVal = chunk.ReplacementContent;
      const regex = makeRegex(targetVal);
      const match = tempContent.match(regex);
      if (!match) {
        console.warn(`WARNING: Chunk TargetContent not found in step ${op.step}. Match failed.`);
        success = false;
        break;
      }
      tempContent = tempContent.substring(0, match.index) + replacementVal + tempContent.substring(match.index + match[0].length);
    }
    if (success) {
      currentContent = tempContent;
      appliedCount++;
    }
  }
}

console.log(`Replay finished. Applied ${appliedCount}/${operations.length} operations.`);

// Save back
fs.writeFileSync(targetFile, currentContent, 'utf8');
console.log(`File reconstructed and saved.`);
