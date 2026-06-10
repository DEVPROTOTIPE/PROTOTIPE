const http = require('http');
const fs = require('fs');
const path = require('path');

const clientId = 'ventas-smartfix';
const relativePath = 'CategoriasView.jsx';
const url = `http://localhost:3001/api/project/file?clientId=${encodeURIComponent(clientId)}&relativePath=${encodeURIComponent(relativePath)}`;

http.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync(path.join(__dirname, 'project_file_response.json'), data);
    console.log('Saved project file response to project_file_response.json');
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
