import fs from 'fs';

const prevLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\0a452bbd-1eb3-4e87-b991-5994099795cb\\.system_generated\\logs\\transcript.jsonl';
const currentLogPath = 'C:\\Users\\Sergio\\.gemini\\antigravity\\brain\\6bc9fae4-15cc-4e0c-9d5c-86fb0899ce8a\\.system_generated\\logs\\transcript.jsonl';

function searchLog(logPath) {
  if (!fs.existsSync(logPath)) return;
  const lines = fs.readFileSync(logPath, 'utf8').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
          const str = JSON.stringify(args);
          if (str.includes(')"') && str.includes(')}')) {
            console.log(`Log: ${logPath}, Step: ${obj.step_index}, Desc: ${args.Description || args.Instruction}`);
          }
        }
      }
    } catch (e) {}
  }
}

searchLog(prevLogPath);
searchLog(currentLogPath);
console.log("Done.");
