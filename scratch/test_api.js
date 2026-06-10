const http = require('http');
const fs = require('fs');
const path = require('path');

http.get('http://localhost:3001/api/library', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync(path.join(__dirname, 'api_response.json'), data);
    console.log('Saved response to api_response.json');
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
