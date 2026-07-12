import fs from 'fs';

const currentLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(currentLogPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  const obj = JSON.parse(line);
  if (obj.step_index === 824) {
    const tc = obj.tool_calls[0];
    const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
    console.log("Step 824 TargetContent:", JSON.stringify(args.TargetContent));
    console.log("Step 824 ReplacementContent:", JSON.stringify(args.ReplacementContent));
  }
}
