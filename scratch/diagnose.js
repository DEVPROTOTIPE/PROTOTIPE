const fs = require('fs');
const html = fs.readFileSync('d:/PROTOTIPE/LandingPage/Index.html', 'utf8');
const js = fs.readFileSync('d:/PROTOTIPE/LandingPage/js/app.js', 'utf8');

console.log('=== DIAGNÓSTICO Index.html ===');
console.log('Modal #nicho-context-modal existe:', html.includes('id="nicho-context-modal"'));
console.log('Tarjetas .rubro-card:', (html.match(/class="rubro-card"/g) || []).length);
console.log('data-rubro encontrados:', (html.match(/data-rubro="[^"]+"/g) || []).join(', '));
console.log('app.js con version:', html.includes('app.js?v=2.5'));
console.log('styles.css con version:', html.includes('styles.css?v=2.5'));

console.log('\n=== DIAGNÓSTICO app.js ===');
console.log('Lineas totales:', js.split('\n').length);
console.log('rubroCards queryAll existe:', js.includes('querySelectorAll'));
console.log('addEventListener DOMContentLoaded existe:', js.includes("addEventListener('DOMContentLoaded'"));

// Buscar la inicializacion de rubroCards
const rubroIdx = js.indexOf('rubroCards');
const rubroLine = js.substring(Math.max(0, rubroIdx - 50), rubroIdx + 200);
console.log('\nContexto de rubroCards:\n', rubroLine);

// Buscar la inicializacion de heroCopies
const heroIdx = js.indexOf('const heroCopies');
console.log('\nPrimera aparicion de heroCopies en linea aprox:', js.substring(0, heroIdx).split('\n').length);

// Buscar la inicializacion de leadMagnets
const leadIdx = js.indexOf('const leadMagnets');
console.log('Primera aparicion de leadMagnets en linea aprox:', js.substring(0, leadIdx).split('\n').length);

// Verificar que no haya sintaxis interna rota (segunda declaracion de leadMagnets)
const leadCount = (js.match(/const leadMagnets/g) || []).length;
const heroCount = (js.match(/const heroCopies/g) || []).length;
console.log('\nDeclaraciones de leadMagnets:', leadCount);
console.log('Declaraciones de heroCopies:', heroCount);
