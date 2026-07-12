import fs from 'fs';

const currentLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';
const targetFile = 'd:\\Aplicaciones\\App Ventas\\src\\pages\\admin\\AdminSettings.jsx';
const content = fs.readFileSync(targetFile, 'utf8');

function cleanValue(val) {
  if (typeof val !== 'string') return '';
  let str = val.trim();
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.substring(1, str.length - 1);
  }
  str = str.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  return str;
}

function makeRegex(targetStr) {
  let cleanStr = cleanValue(targetStr).trim();
  let escaped = cleanStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  let pattern = escaped.replace(/\s+/g, '\\s+');
  return new RegExp(pattern);
}

const lines = fs.readFileSync(currentLogPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  const obj = JSON.parse(line);
  if (obj.step_index === 820) {
    const tc = obj.tool_calls[0];
    const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
    
    console.log("Original TargetContent from JSON:", JSON.stringify(args.TargetContent));
    console.log("Cleaned TargetContent:", JSON.stringify(cleanValue(args.TargetContent)));
    
    const regex = makeRegex(args.TargetContent);
    console.log("Regex pattern:", regex.source);
    
    const match = content.match(regex);
    console.log("Match found?", !!match);
  }
}
