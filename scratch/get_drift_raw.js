const fs = require('fs');
const http = require('http');

http.get('http://127.0.0.1:3001/api/project/drift?clientId=moni-app', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      fs.writeFileSync('C:/Users/Sergio/.gemini/antigravity/brain/ede9c255-756f-45e9-8b14-f54fb5d9c94b/scratch/drift_response.json', JSON.stringify(parsed, null, 2));
      console.log('JSON guardado correctamente.');
    } catch (e) {
      console.error('Error parseando JSON:', e.message);
      fs.writeFileSync('C:/Users/Sergio/.gemini/antigravity/brain/ede9c255-756f-45e9-8b14-f54fb5d9c94b/scratch/drift_response.json', data);
    }
  });
}).on('error', (err) => {
  console.error('Error de red:', err.message);
});
