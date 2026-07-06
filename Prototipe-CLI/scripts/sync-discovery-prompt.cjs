const fs = require('fs');
const path = require('path');

// Rutas base
const DOCS_ROOT = 'd:\\PROTOTIPE\\Documentacion PROTOTIPE';
const LIBRARY_README = path.join(DOCS_ROOT, '06_Biblioteca_Componentes', 'README.md');
const PROMPT_FILE = path.join(DOCS_ROOT, '04_Estandares_y_Skills', 'prompt_maestro_descubrimiento.md');

async function syncPrompt() {
  console.log('🔄 Iniciando sincronización del catálogo de componentes en el Prompt Maestro...');

  if (!fs.existsSync(LIBRARY_README)) {
    console.error(`❌ No se encontró el catálogo de componentes en: ${LIBRARY_README}`);
    process.exit(1);
  }
  if (!fs.existsSync(PROMPT_FILE)) {
    console.error(`❌ No se encontró el Prompt Maestro en: ${PROMPT_FILE}`);
    process.exit(1);
  }

  try {
    const readmeContent = fs.readFileSync(LIBRARY_README, 'utf-8');
    const lines = readmeContent.split('\n');

    const categories = [];
    let currentCategory = null;

    // Procesar README.md exactamente igual que lo hace el CLI Core
    for (const line of lines) {
      // Detectar categoría: ### 0. 📂 Nombre... (`folder`)
      const catMatch = line.match(/^###\s+\d+\.\s+\S+\s+(.+?)\s+\(`([^)]+)`\)/u);
      if (catMatch) {
        const catName = catMatch[1].trim();
        const folder = catMatch[2].trim();
        currentCategory = { name: catName, folder, components: [] };
        categories.push(currentCategory);
        continue;
      }

      // Detectar categoría sin paréntesis: ### 0. 📂 Nombre
      const catMatchSimple = line.match(/^###\s+\d+\.\s+\S+\s+(.+)/u);
      if (catMatchSimple && !catMatch) {
        const cleanName = catMatchSimple[1].replace(/\s*\(.*/, '').trim();
        currentCategory = { name: cleanName, folder: '', components: [] };
        categories.push(currentCategory);
        continue;
      }

      // Detectar componente: * [Nombre (ComponentName)](link): descripción
      const compMatch = line.match(/^\*\s+\[(.+?)\]\(([^)]+)\):\s*(.+)/);
      if (compMatch && currentCategory) {
        const fullName = compMatch[1].trim();
        const description = compMatch[3].trim();
        const techMatch = fullName.match(/^(.+?)\s*\(([^)]+)\)$/);
        const displayName = techMatch ? techMatch[1].trim() : fullName;
        const technicalName = techMatch ? techMatch[2].trim() : '';

        if (technicalName) {
          currentCategory.components.push({
            displayName,
            technicalName,
            description
          });
        }
      }
    }

    // Filtrar categorías que contengan componentes válidos para inyección
    const validCategories = categories.filter(cat => 
      cat.components.length > 0 && 
      !cat.name.includes('Core Obligatorios')
    );

    // 1. Construir el fragmento de texto Markdown del catálogo
    let catalogMarkdown = '';
    const allTechnicalNames = [];

    for (const cat of validCategories) {
      catalogMarkdown += `\n${cat.name}:\n`;
      for (const comp of cat.components) {
        catalogMarkdown += `- ${comp.technicalName}: ${comp.description}\n`;
        allTechnicalNames.push(comp.technicalName);
      }
    }

    // 2. Construir la cadena de nombres técnicos para la sección de ejemplos del JSON
    const jsonKeysList = allTechnicalNames.map(name => `"${name}"`).join(', ');

    // 3. Leer y actualizar el Prompt Maestro
    let promptContent = fs.readFileSync(PROMPT_FILE, 'utf-8');

    // Reemplazar Catálogo de Componentes
    const catalogStartMarker = '<!-- START_COMPONENT_CATALOG -->';
    const catalogEndMarker = '<!-- END_COMPONENT_CATALOG -->';
    const catalogStartIndex = promptContent.indexOf(catalogStartMarker);
    const catalogEndIndex = promptContent.indexOf(catalogEndMarker);

    if (catalogStartIndex === -1 || catalogEndIndex === -1) {
      throw new Error('No se encontraron los marcadores de catálogo <!-- START_COMPONENT_CATALOG --> en el Prompt Maestro.');
    }

    promptContent = 
      promptContent.substring(0, catalogStartIndex + catalogStartMarker.length) +
      catalogMarkdown +
      promptContent.substring(catalogEndIndex);

    // Reemplazar lista de llaves de ejemplos JSON
    const jsonStartMarker = '<!-- START_JSON_KEYS_EX -->';
    const jsonEndMarker = '<!-- END_JSON_KEYS_EX -->';
    const jsonStartIndex = promptContent.indexOf(jsonStartMarker);
    const jsonEndIndex = promptContent.indexOf(jsonEndMarker);

    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      throw new Error('No se encontraron los marcadores de llaves JSON <!-- START_JSON_KEYS_EX --> en el Prompt Maestro.');
    }

    promptContent =
      promptContent.substring(0, jsonStartIndex + jsonStartMarker.length) +
      jsonKeysList +
      promptContent.substring(jsonEndIndex);

    // Escribir cambios
    fs.writeFileSync(PROMPT_FILE, promptContent, 'utf-8');
    console.log(`✅ Sincronización exitosa. Se listaron ${allTechnicalNames.length} componentes de forma dinámica.`);

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
    process.exit(1);
  }
}

syncPrompt();
