import fs from 'fs';

const currentLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(currentLogPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  const obj = JSON.parse(line);
  if (obj.tool_calls) {
    for (const tc of obj.tool_calls) {
      if (tc.name.includes('replace') || tc.name === 'write_to_file') {
        const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
        if (args.TargetFile && args.TargetFile.includes('AdminSettings.jsx')) {
          console.log(`Step: ${obj.step_index}, Type: ${tc.name}, Description: ${args.Description || args.Instruction}`);
        }
      }
    }
  }
}
