import fs from 'fs';
import path from 'path';

const logPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';
const targetFile = 'd:\\Aplicaciones\\App Ventas\\src\\pages\\admin\\AdminSettings.jsx';

if (!fs.existsSync(logPath)) {
  console.error("Log file not found");
  process.exit(1);
}

// 1. Read current baseline file
let currentContent = fs.readFileSync(targetFile, 'utf8');

// 2. Read transcript
const lines = fs.readFileSync(logPath, 'utf8').split('\n');
console.log(`Replaying log lines...`);

let operations = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
          const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
          const file = args.TargetFile;
          if (file && file.includes('AdminSettings.jsx')) {
            operations.push({
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

console.log(`Loaded ${operations.length} operations.`);

// Sort by step_index and created_at to ensure chronological order
operations.sort((a, b) => {
  if (a.step !== b.step) return a.step - b.step;
  return new Date(a.created_at) - new Date(b.created_at);
});

// Helper to normalize line endings
function normalize(str) {
  return str.replace(/\r\n/g, '\n');
}

// Replay
let appliedCount = 0;
for (const op of operations) {
  console.log(`Applying step ${op.step} (${op.type}) - ${op.args.Description || op.args.Instruction}`);
  if (op.type === 'replace_file_content') {
    const target = normalize(op.args.TargetContent);
    const replacement = normalize(op.args.ReplacementContent);
    currentContent = normalize(currentContent);
    
    if (!currentContent.includes(target)) {
      console.warn(`WARNING: TargetContent not found in step ${op.step}. Skipping or finding close match.`);
      // Let's see if we can do a trimmed/whitespace insensitive match if needed, but try exact first
      continue;
    }
    
    currentContent = currentContent.replace(target, replacement);
    appliedCount++;
  } else if (op.type === 'multi_replace_file_content') {
    const chunks = op.args.ReplacementChunks;
    currentContent = normalize(currentContent);
    let success = true;
    for (const chunk of chunks) {
      const target = normalize(chunk.TargetContent);
      const replacement = normalize(chunk.ReplacementContent);
      if (!currentContent.includes(target)) {
        console.warn(`WARNING: Chunk TargetContent not found in step ${op.step}.`);
        success = false;
        break;
      }
      currentContent = currentContent.replace(target, replacement);
    }
    if (success) appliedCount++;
  }
}

console.log(`Replay finished. Applied ${appliedCount}/${operations.length} operations successfully.`);

// Save back
fs.writeFileSync(targetFile, currentContent, 'utf8');
console.log(`Reconstructed file written successfully.`);
