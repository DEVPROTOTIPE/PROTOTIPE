import fs from 'fs';
import path from 'path';

const logPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(logPath)) {
  console.error("Log file not found at " + logPath);
  process.exit(1);
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
console.log(`Total lines in log: ${lines.length}`);

// We want to find tool calls to replace_file_content or write_to_file on AdminSettings.jsx
let found = [];
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
            found.push({
              step: obj.step_index,
              type: tc.name,
              args: args,
              created_at: obj.created_at
            });
          }
        }
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
}

console.log(`Found ${found.length} operations on AdminSettings.jsx`);
found.forEach((f, idx) => {
  console.log(`[${idx}] Step: ${f.step}, Type: ${f.type}, Created: ${f.created_at}, Description: ${f.args.Description || f.args.Instruction}`);
});
