const fs = require('fs');
const path = require('path');

const files = [
  'd:\\PROTOTIPE\\menu_backup.ps1',
  'd:\\PROTOTIPE\\git_backup.ps1',
  'd:\\PROTOTIPE\\subproject_backup.ps1'
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // La marca de orden de bytes (BOM) en UTF-8 es 0xEF, 0xBB, 0xBF
      const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
      const contentBuffer = Buffer.from(content, 'utf8');
      
      const fileBuffer = Buffer.concat([bom, contentBuffer]);
      
      fs.writeFileSync(filePath, fileBuffer);
      console.log(`[EXITO] Guardado con BOM: ${filePath}`);
    } catch (err) {
      console.error(`[ERROR] No se pudo procesar ${filePath}: ${err.message}`);
    }
  } else {
    console.warn(`[AVISO] El archivo no existe: ${filePath}`);
  }
});
