import { createProject } from '../generator.js';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, '..');

async function runTest() {
  console.log('🏁 Iniciando Prueba de Integración de Aprovisionamiento (CORE-217)...');

  // Payload de prueba realista basado en el briefing y branding customizado
  const testPayload = {
    template: 'template-core-seed',
    projectName: 'Test Solid App',
    targetPath: path.join(CLI_ROOT, '..', 'Instancias Clientes'),
    paletteChoice: 'custom',
    customPrimary: 'hsl(142, 70%, 45%)',
    customAccent: 'hsl(210, 80%, 55%)',
    niche: 'grocery_food',
    billingMode: 'percentage',
    comisionPorcentaje: 1.8,
    pagoMensualFijo: 0,
    enableDianBilling: true,
    costoPorFacturaDian: 120,
    whatsappAdmin: '573001234567',
    storeAddress: 'Calle 10 # 5-20, Bogotá',
    autoProvisionFirebase: false,
    // Credenciales de Firebase (SmartFix dev)
    firebaseApiKey: 'AIzaSyBsgNQt3rqfSBobKslVpCr5D-pbmaetU3c',
    firebaseAuthDomain: 'ventas-smartfix.firebaseapp.com',
    firebaseProjectId: 'ventas-smartfix',
    firebaseStorageBucket: 'ventas-smartfix.firebasestorage.app',
    firebaseMessagingSenderId: '519490711107',
    firebaseAppId: '1:519490711107:web:368ff682e1f9b4877eeef6',
    firebaseVapidKey: 'BBDourdsNRV6kqRLm52FcPagPlDo99IJ3VdUP8NTERFXwXdJ8Pt7e7zbw82xE4O3f5ImVvebprW9_lVZ--fmnac',
    // Credenciales de Consola Central
    centralApiKey: 'AIzaSyCBkdokIpGqWlfFiU_i83o7GmV1ZTqXYJE',
    centralAppId: '1:703542009613:web:00f9363de11a908c991a44',
    // SEO
    seoTitle: 'Test Solid App Supermercado',
    seoDescription: 'Prueba unitaria de la plataforma de aprovisionamiento solidificada',
    seoKeywords: 'prueba, supermercado, provisión, solidificación, test',
    customRequirements: 'Requerimiento Especial A: El supermercado vende al granel.\nRequerimiento Especial B: Control de peso con balanza.',
    flags: {
      enableGithub: false, // Desactivar para no pushear
      enableFirebaseDeploy: false, // Desactivar para no desplegar
      enablePwa: true,
      enablePush: true,
      enableBilling: true,
      enableDianBilling: true,
      enableCitas: true
    },
    branding: {
      primaryColor: 'hsl(142, 70%, 45%)',
      secondaryColor: 'hsl(210, 80%, 55%)',
      bgColor: 'hsl(224, 71%, 6%)',
      textColor: 'hsl(213, 31%, 90%)',
      surfaceColor: 'hsl(222, 47%, 9%)',
      surface2Color: 'hsl(220, 40%, 14%)',
      borderColor: 'hsl(215, 28%, 18%)',
      textMutedColor: 'hsl(215, 16%, 48%)',
      radiusBase: '0.8rem',
      googleFont: 'Outfit'
    },
    selectedRecomendations: []
  };

  const clientId = 'test-solid-app';
  const targetDir = path.join(testPayload.targetPath, 'seed', `App-${clientId}`);

  // Limpiar residuo anterior si existe
  if (await fs.pathExists(targetDir)) {
    console.log(`🧹 Limpiando directorio de prueba previo: ${targetDir}`);
    await fs.remove(targetDir);
  }

  let result;
  try {
    result = await createProject(testPayload);
    console.log('🟢 Aprovisionamiento físico completado. Iniciando validación...');
  } catch (err) {
    console.error('❌ Error ejecutando createProject:', err);
    process.exit(1);
  }

  // --- VALIDACIONES DE INTEGRIDAD ---
  const validations = [];

  const check = (desc, condition) => {
    if (condition) {
      console.log(`   ✅ [PASS] ${desc}`);
      validations.push({ desc, pass: true });
    } else {
      console.error(`   ❌ [FAIL] ${desc}`);
      validations.push({ desc, pass: false });
    }
  };

  // 1. Verificar .env.local
  const envPath = path.join(targetDir, '.env.local');
  check('Existe el archivo .env.local', await fs.pathExists(envPath));
  if (await fs.pathExists(envPath)) {
    const envContent = await fs.readFile(envPath, 'utf-8');
    check('.env.local tiene VITE_INITIAL_THEME=custom', envContent.includes('VITE_INITIAL_THEME=custom'));
    check('.env.local tiene VITE_FIREBASE_PROJECT_ID=ventas-smartfix', envContent.includes('VITE_FIREBASE_PROJECT_ID=ventas-smartfix'));
    check('.env.local tiene VITE_DEVELOPER_CLIENT_ID=test-solid-app', envContent.includes('VITE_DEVELOPER_CLIENT_ID=test-solid-app'));
    check('.env.local tiene VITE_DEV_PIN generado de 4 dígitos', envContent.match(/VITE_DEV_PIN=\d{4}/) !== null);
    check('.env.local tiene VITE_DEVELOPER_CENTRAL_API_KEY', envContent.includes('VITE_DEVELOPER_CENTRAL_API_KEY='));
  }

  // 2. Verificar index.html (SEO & Metatags)
  const indexPath = path.join(targetDir, 'index.html');
  check('Existe index.html', await fs.pathExists(indexPath));
  if (await fs.pathExists(indexPath)) {
    const indexContent = await fs.readFile(indexPath, 'utf-8');
    check('index.html tiene el título SEO personalizado', indexContent.includes('<title>Test Solid App Supermercado</title>'));
    check('index.html contiene meta description personalizada', indexContent.includes('content="Prueba unitaria de la plataforma de aprovisionamiento solidificada"'));
    check('index.html contiene meta keywords personalizada', indexContent.includes('content="prueba, supermercado, provisión, solidificación, test"'));
  }

  // 3. Verificar contexto_negocio.md
  const docsDir = path.join(targetDir, 'Documentacion Test Solid App');
  const contextPath = path.join(docsDir, 'contexto_negocio.md');
  check('Existe contexto_negocio.md en la carpeta de documentación del cliente', await fs.pathExists(contextPath));
  if (await fs.pathExists(contextPath)) {
    const contextContent = await fs.readFile(contextPath, 'utf-8');
    check('contexto_negocio.md incluye el nicho del briefing', contextContent.includes('grocery_food'));
    check('contexto_negocio.md incluye requerimientos especiales del briefing', contextContent.includes('Requerimiento Especial A'));
    check('contexto_negocio.md lista módulos de forma detallada', contextContent.includes('enableDianBilling:** ✅ Activo'));
  }

  // 4. Verificar guia_estilos_ui.md
  const stylesPath = path.join(docsDir, 'guia_estilos_ui.md');
  check('Existe guia_estilos_ui.md', await fs.pathExists(stylesPath));
  if (await fs.pathExists(stylesPath)) {
    const stylesContent = await fs.readFile(stylesPath, 'utf-8');
    check('guia_estilos_ui.md lista el color primario custom', stylesContent.includes('hsl(142, 70%, 45%)'));
    check('guia_estilos_ui.md lista el color acento custom', stylesContent.includes('hsl(210, 80%, 55%)'));
    check('guia_estilos_ui.md lista la tipografía custom', stylesContent.includes('Outfit'));
  }

  // 4.5 Verificar src/config/niche.json
  const nichePath = path.join(targetDir, 'src', 'config', 'niche.json');
  check('Existe src/config/niche.json', await fs.pathExists(nichePath));
  if (await fs.pathExists(nichePath)) {
    const nicheContent = await fs.readJson(nichePath);
    check('niche.json tiene el nicho correcto', nicheContent.niche === 'grocery_food');
    check('niche.json tiene attributes no vacíos', Array.isArray(nicheContent.attributes) && nicheContent.attributes.length > 0);
  }

  // 5. Verificar index.css (Inyección cromática)
  // [A7 FIX] Como convertimos dinámicamente HSL a Hex para evitar colisiones de Tailwind,
  // validamos que los colores se inyecten en formato hexadecimal válido.
  const cssPath = path.join(targetDir, 'src', 'index.css');
  check('Existe src/index.css', await fs.pathExists(cssPath));
  if (await fs.pathExists(cssPath)) {
    const cssContent = await fs.readFile(cssPath, 'utf-8');
    check('src/index.css inyecta el token --color-primary en formato hex', cssContent.match(/--color-primary:\s*#[0-9a-f]{6}/i) !== null);
    check('src/index.css inyecta el token --color-accent en formato hex', cssContent.match(/--color-accent:\s*#[0-9a-f]{6}/i) !== null);
  }

  // 6. Verificar prompt de arranque
  const promptPath = path.join(targetDir, 'antigravity_bootstrap_prompt.md');
  check('Existe antigravity_bootstrap_prompt.md', await fs.pathExists(promptPath));
  if (await fs.pathExists(promptPath)) {
    const promptContent = await fs.readFile(promptPath, 'utf-8');
    check('Prompt incluye descripción semántica de PWA', promptContent.includes('PWA instalable'));
    check('Prompt incluye descripción semántica de DIAN', promptContent.includes('Facturación electrónica DIAN'));
    check('Prompt incluye la tabla completa de tokens HSL', promptContent.includes('| `--color-primary` | `hsl(142, 70%, 45%)` |'));
  }

  // 7. Verificar firestore.rules (Reglas de citas inyectadas)
  const rulesPath = path.join(targetDir, 'firestore.rules');
  check('Existe firestore.rules', await fs.pathExists(rulesPath));
  if (await fs.pathExists(rulesPath)) {
    const rulesContent = await fs.readFile(rulesPath, 'utf-8');
    check('firestore.rules inyecta reglas de citas', rulesContent.includes('/appointments/'));
  }

  // 8. Verificar firestore.indexes.json (Índice de citas inyectado)
  const indexesPath = path.join(targetDir, 'firestore.indexes.json');
  check('Existe firestore.indexes.json', await fs.pathExists(indexesPath));
  if (await fs.pathExists(indexesPath)) {
    const indexesContent = await fs.readJson(indexesPath);
    const hasApp = indexesContent.indexes.some(idx => idx.collectionGroup === 'appointments');
    check('firestore.indexes.json inyecta índice de citas', hasApp);
  }

  // --- RESULTADOS ---
  const failed = validations.filter(v => !v.pass);
  console.log('\n=======================================');
  if (failed.length === 0) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON AL 100%! El aprovisionador está totalmente solidificado.');
  } else {
    console.error(`❌ La prueba falló con ${failed.length} errores. Revisa los registros arriba.`);
  }
  console.log('=======================================');

  // Limpieza del proyecto generado para no dejar basura
  console.log(`🧹 Removiendo directorio de prueba generado: ${targetDir}`);
  await fs.remove(targetDir);
}

runTest();
