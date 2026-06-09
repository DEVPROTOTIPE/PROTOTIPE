const fs = require('fs');
const path = require('path');

const CORES_DIR = 'D:\\PROTOTIPE\\Plantillas Core';

const standardFiles = [
  {
    name: 'tareas_pendientes.md',
    title: 'Control de Tareas y Estado de Implementación',
    desc: 'Roadmap local y backlog de tareas pendientes y completadas para este core.'
  },
  {
    name: 'bitacora_cambios.md',
    title: 'Bitácora de Cambios y Control de Versiones',
    desc: 'Historial detallado de cambios técnicos, bugs resueltos y refactorizaciones.'
  },
  {
    name: 'mapa_aplicacion.md',
    title: 'Mapa de la Aplicación (Arquitectura Física)',
    desc: 'Descripción estructurada de módulos, vistas, layouts e integraciones de Firebase.'
  },
  {
    name: 'esquema_colecciones.md',
    title: 'Esquema y Propósito de Colecciones de Base de Datos (Firestore)',
    desc: 'Modelado de datos, propósito de cada colección e índices requeridos.'
  },
  {
    name: 'plan_implementacion_ia.md',
    title: 'Plan de Implementación y Roadmaps de Inteligencia Artificial',
    desc: 'Propuestas de integraciones cognitivas y automatizaciones con IAs en este core.'
  },
  {
    name: 'manual_migracion.md',
    title: 'Manual de Despliegue y Configuraciones Locales',
    desc: 'Especificaciones locales de migración, feature flags de Firebase y Vertex AI.'
  },
  {
    name: 'flujos_aplicacion.md',
    title: 'Flujos Operativos y Diagramas de Secuencia',
    desc: 'Memoria operativa de los flujos de datos críticos y secuencia de interacción.'
  },
  {
    name: 'mapa_arquitectura.md',
    title: 'Mapa de Arquitectura Física y Árbol de Código',
    desc: 'Árbol completo de directorios y responsabilidades por capa del proyecto.'
  },
  {
    name: 'mapa_arquitectura_ia.md',
    title: 'Mapa Semántico de Rutas para Inteligencia Artificial',
    desc: 'Mapa estructurado de archivos de código con dependencias críticas y accesos directos.'
  },
  // ─── ARCHIVOS NUEVOS: CRÍTICOS PARA CONTEXTO DE IA ───────────────────────────
  {
    name: 'contexto_negocio.md',
    title: 'Contexto de Negocio y Reglas Operativas del Dominio',
    desc: 'Descripción del usuario final, flujos de negocio en lenguaje natural, reglas de dominio implícitas y KPIs del cliente. CRÍTICO para que la IA genere lógica semánticamente correcta y no solo técnicamente válida.'
  },
  {
    name: 'restricciones_tecnicas.md',
    title: 'Restricciones Técnicas y Patrones Prohibidos',
    desc: 'Versiones fijadas de dependencias críticas con su justificación, patrones de código prohibidos en este core, limitaciones de infraestructura conocidas y decisiones de arquitectura no negociables.'
  },
  {
    name: 'guia_estilos_ui.md',
    title: 'Guía de Estilos de UI y Sistema de Diseño del Core',
    desc: 'Paleta HSL de colores del core, tokens de diseño (tipografía, spacing, breakpoints), componentes atómicos disponibles en /src/components/ui/ y convenciones de naming de clases e IDs que la IA debe respetar obligatoriamente.'
  }
];

function initializeCoreDocs(corePath) {
  const coreName = path.basename(corePath);
  const docDirName = `Documentacion ${coreName}`;
  const docPath = path.join(corePath, docDirName);

  if (!fs.existsSync(docPath)) {
    fs.mkdirSync(docPath, { recursive: true });
    console.log(`📁 Creado directorio de documentación: ${docPath}`);
  } else {
    console.log(`ℹ️ El directorio de documentación ya existe: ${docPath}`);
  }

  standardFiles.forEach(fileSpec => {
    const filePath = path.join(docPath, fileSpec.name);
    if (!fs.existsSync(filePath)) {
      const content = `# 📑 ${fileSpec.title} — ${coreName}

Este documento contiene el ${fileSpec.title.toLowerCase()} específico para la plantilla core **${coreName}**.

---

## ℹ️ Propósito
${fileSpec.desc}

---

## 🗂️ Registro Inicial (${new Date().toISOString().split('T')[0]})
* Estado inicial creado y estandarizado mediante script de control de ecosistema.
`;
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  📄 Creado archivo: ${fileSpec.name}`);
    } else {
      console.log(`  ⚠️ El archivo ya existe (omitido): ${fileSpec.name}`);
    }
  });
}

function run() {
  console.log('🏁 Iniciando aprovisionamiento de documentación estandarizada en Cores...');
  if (!fs.existsSync(CORES_DIR)) {
    console.error(`❌ Directorio de cores no encontrado: ${CORES_DIR}`);
    process.exit(1);
  }

  const dirs = fs.readdirSync(CORES_DIR, { withFileTypes: true });
  dirs.forEach(dirent => {
    if (dirent.isDirectory()) {
      const corePath = path.join(CORES_DIR, dirent.name);
      console.log(`\n⚙️ Procesando: ${dirent.name}`);
      initializeCoreDocs(corePath);
    }
  });

  console.log('\n🎉 Aprovisionamiento de documentación core finalizado con éxito.');
}

run();
