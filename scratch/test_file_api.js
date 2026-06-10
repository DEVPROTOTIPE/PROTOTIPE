const http = require('http');
const fs = require('fs');
const path = require('path');

const fileUri = 'file:///D:/PROTOTIPE/Documentacion PROTOTIPE/09_Modulos_Completos/Creditos_y_Saldos/creditos_saldos.md';
const encoded = encodeURIComponent(fileUri);

http.get(`http://localhost:3001/api/library/file?fileUri=${encoded}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync(path.join(__dirname, 'file_response.json'), data);
    console.log('Saved file response to file_response.json');
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
