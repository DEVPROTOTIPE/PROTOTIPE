import fs from 'fs';

const currentLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';
const targetFile = 'd:\\Aplicaciones\\App Ventas\\src\\pages\\admin\\AdminSettings.jsx';

const lines = fs.readFileSync(currentLogPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  const obj = JSON.parse(line);
  if (obj.step_index === 820) {
    const tc = obj.tool_calls[0];
    const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
    console.log("TargetContent from Step 820:");
    console.log(JSON.stringify(args.TargetContent));
    
    const fileContent = fs.readFileSync(targetFile, 'utf8');
    const hasTarget = fileContent.replace(/\r\n/g, '\n').includes(args.TargetContent.replace(/\r\n/g, '\n'));
    console.log("Does current file contain it?", hasTarget);
  }
}
