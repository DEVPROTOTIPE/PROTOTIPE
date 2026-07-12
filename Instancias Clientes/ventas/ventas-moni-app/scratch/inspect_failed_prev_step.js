import fs from 'fs';

const prevLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\0a452bbd-1eb3-4e87-b991-5994099795cb\\.system_generated\\logs\\transcript.jsonl';
const targetFile = 'd:\\Aplicaciones\\App Ventas\\src\\pages\\admin\\AdminSettings.jsx';
const content = fs.readFileSync(targetFile, 'utf8').replace(/\r\n/g, '\n');

function cleanValue(val) {
  if (typeof val !== 'string') return '';
  let str = val.trim();
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.substring(1, str.length - 1);
  }
  str = str.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  return str;
}

const lines = fs.readFileSync(prevLogPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  const obj = JSON.parse(line);
  if (obj.step_index === 4854) {
    const tc = obj.tool_calls[0];
    const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
    const target = cleanValue(args.TargetContent).replace(/\r\n/g, '\n');
    console.log("Step 4854 TargetContent length:", target.length);
    console.log("IndexOf result in current file:", content.indexOf(target));
    console.log("Target content value:", JSON.stringify(target));
  }
}
