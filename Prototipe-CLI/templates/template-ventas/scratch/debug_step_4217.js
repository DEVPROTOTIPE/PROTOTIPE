import fs from 'fs';

const currentLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';
const targetFile = 'd:\\Aplicaciones\\App Ventas\\src\\pages\\admin\\AdminSettings.jsx';

function cleanValue(val) {
  if (typeof val !== 'string') return '';
  let str = val.trim();
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.substring(1, str.length - 1);
  }
  str = str.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  return str;
}

const lines = fs.readFileSync(currentLogPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  const obj = JSON.parse(line);
  if (obj.step_index === 4217) {
    const tc = obj.tool_calls[0];
    const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
    console.log("Step 4217 Description:", args.Description);
    const chunks = args.ReplacementChunks;
    console.log("Number of chunks:", chunks.length);
    
    const fileContent = fs.readFileSync(targetFile, 'utf8').replace(/\r\n/g, '\n');
    for (let i = 0; i < chunks.length; i++) {
      const target = cleanValue(chunks[i].TargetContent).trim().replace(/\r\n/g, '\n');
      const hasTarget = fileContent.includes(target);
      console.log(`Chunk ${i} present in file?`, hasTarget);
      if (!hasTarget) {
        console.log("Chunk TargetContent:");
        console.log(JSON.stringify(target));
      }
    }
  }
}
