import fs from 'fs';

const prevLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\0a452bbd-1eb3-4e87-b991-5994099795cb\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(prevLogPath, 'utf8').split('\n');
let count = 0;
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        if (tc.name.includes('replace') || tc.name === 'write_to_file') {
          const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
          if (args.TargetFile && args.TargetFile.includes('AdminSettings.jsx')) {
            console.log(`Step: ${obj.step_index}, Type: ${tc.name}, Description: ${args.Description || args.Instruction}`);
            count++;
            if (count > 10) break;
          }
        }
      }
    }
    if (count > 10) break;
  } catch (e) {}
}
