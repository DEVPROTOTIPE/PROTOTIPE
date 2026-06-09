export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
}

// Colores base para fondos y superficies si no se especifican en la paleta
const DEFAULT_LIGHT_BG = '#ffffff'
const DEFAULT_LIGHT_SURFACE = '#f8fafc'
const DEFAULT_LIGHT_SURFACE_2 = '#f1f5f9'
const DEFAULT_LIGHT_TEXT = '#0f172a'
const DEFAULT_LIGHT_TEXT_MUTED = '#64748b'
const DEFAULT_LIGHT_BORDER = '#e2e8f0'

const DEFAULT_DARK_BG = '#0f172a'
const DEFAULT_DARK_SURFACE = '#1e293b'
const DEFAULT_DARK_SURFACE_2 = '#334155'
const DEFAULT_DARK_TEXT = '#f8fafc'
const DEFAULT_DARK_TEXT_MUTED = '#cbd5e1'
const DEFAULT_DARK_BORDER = '#334155'

// Estructura de paletas avanzadas organizadas por nicho comercial (al menos 10 por categoría)
export const ADVANCED_PALETTES = {
  // ── 1. MODA Y ACCESORIOS (RETAIL) ──
  'rosa-elegante': {
    id: 'rosa-elegante',
    name: 'Rosa Elegante',
    category: 'Moda y Accesorios',
    light: {
      primary: '#e91e8c', secondary: '#f48fb1', accent: '#ff4081',
      bg: '#fff5f9', surface: '#ffffff', surface2: '#fce4ec',
      text: '#1a0a12', textMuted: '#6d4c5e', border: '#f8bbd0'
    },
    dark: {
      primary: '#e91e8c', secondary: '#f48fb1', accent: '#ff4081',
      bg: '#0f0f0f', surface: '#1a1a1a', surface2: '#252525',
      text: '#f0f0f0', textMuted: '#a0a0a0', border: '#333333'
    }
  },
  'lila-suave': {
    id: 'lila-suave',
    name: 'Lila Suave',
    category: 'Moda y Accesorios',
    light: {
      primary: '#9c27b0', secondary: '#ce93d8', accent: '#e040fb',
      bg: '#fdf6ff', surface: '#ffffff', surface2: '#f3e5f5',
      text: '#12001a', textMuted: '#5e3570', border: '#e1bee7'
    },
    dark: {
      primary: '#9c27b0', secondary: '#ce93d8', accent: '#e040fb',
      bg: '#0f0f0f', surface: '#1a1a1a', surface2: '#252525',
      text: '#f0f0f0', textMuted: '#a0a0a0', border: '#333333'
    }
  },
  'esmeralda-chic': {
    id: 'esmeralda-chic',
    name: 'Esmeralda Chic',
    category: 'Moda y Accesorios',
    light: {
      primary: '#004d40', secondary: '#80cbc4', accent: '#00bfa5',
      bg: '#f2faf9', surface: '#ffffff', surface2: '#e0f2f1',
      text: '#002520', textMuted: '#4d8a80', border: '#b2dfdb'
    },
    dark: {
      primary: '#14b8a6', secondary: '#2dd4bf', accent: '#06b6d4',
      bg: '#030712', surface: '#0b0f19', surface2: '#1e293b',
      text: '#f3f4f6', textMuted: '#9ca3af', border: '#1e293b'
    }
  },
  'zafiro-moderno': {
    id: 'zafiro-moderno',
    name: 'Zafiro Moderno',
    category: 'Moda y Accesorios',
    light: {
      primary: '#0f172a', secondary: '#38bdf8', accent: '#0284c7',
      bg: '#f0f9ff', surface: '#ffffff', surface2: '#e0f2fe',
      text: '#030712', textMuted: '#475569', border: '#bae6fd'
    },
    dark: {
      primary: '#38bdf8', secondary: '#0ea5e9', accent: '#60a5fa',
      bg: '#0f172a', surface: '#1e293b', surface2: '#334155',
      text: '#f8fafc', textMuted: '#94a3b8', border: '#334155'
    }
  },
  'coral-vintage': {
    id: 'coral-vintage',
    name: 'Coral Vintage',
    category: 'Moda y Accesorios',
    light: {
      primary: '#dd5e45', secondary: '#f3a897', accent: '#f97316',
      bg: '#fffaf5', surface: '#ffffff', surface2: '#ffebe6',
      text: '#2b100a', textMuted: '#7c463b', border: '#fed7aa'
    },
    dark: {
      primary: '#f97316', secondary: '#fdba74', accent: '#ffedd5',
      bg: '#0f0907', surface: '#1c120e', surface2: '#2d1e18',
      text: '#ffedd5', textMuted: '#a78bfa', border: '#431407'
    }
  },
  'rosa-algodon': {
    id: 'rosa-algodon',
    name: 'Rosa Algodón',
    category: 'Moda y Accesorios',
    light: {
      primary: '#f472b6', secondary: '#fbcfe8', accent: '#db2777',
      bg: '#fff7ed', surface: '#ffffff', surface2: '#fdf2f8',
      text: '#3f0721', textMuted: '#9d174d', border: '#fce7f3'
    },
    dark: {
      primary: '#f472b6', secondary: '#fbcfe8', accent: '#ec4899',
      bg: '#0c0508', surface: '#1e0d16', surface2: '#2e1423',
      text: '#fdf2f8', textMuted: '#f472b6', border: '#4d1234'
    }
  },
  'denim-clasico': {
    id: 'denim-clasico',
    name: 'Denim Clásico',
    category: 'Moda y Accesorios',
    light: {
      primary: '#1e3a8a', secondary: '#93c5fd', accent: '#3b82f6',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#eff6ff',
      text: '#0f172a', textMuted: '#475569', border: '#dbeafe'
    },
    dark: {
      primary: '#60a5fa', secondary: '#93c5fd', accent: '#2563eb',
      bg: '#0b0f19', surface: '#162238', surface2: '#1d3254',
      text: '#f8fafc', textMuted: '#93c5fd', border: '#253e66'
    }
  },
  'monocromo-sastre': {
    id: 'monocromo-sastre',
    name: 'Monocromo Sastre',
    category: 'Moda y Accesorios',
    light: {
      primary: '#111827', secondary: '#9ca3af', accent: '#374151',
      bg: '#f9fafb', surface: '#ffffff', surface2: '#f3f4f6',
      text: '#111827', textMuted: '#4b5563', border: '#e5e7eb'
    },
    dark: {
      primary: '#f9fafb', secondary: '#9ca3af', accent: '#d1d5db',
      bg: '#030712', surface: '#0f172a', surface2: '#1e293b',
      text: '#f9fafb', textMuted: '#9ca3af', border: '#1e293b'
    }
  },
  'tierra-otono': {
    id: 'tierra-otono',
    name: 'Tierra de Otoño',
    category: 'Moda y Accesorios',
    light: {
      primary: '#78350f', secondary: '#fcd34d', accent: '#b45309',
      bg: '#fffbeb', surface: '#ffffff', surface2: '#fef3c7',
      text: '#451a03', textMuted: '#92400e', border: '#fde68a'
    },
    dark: {
      primary: '#fbbf24', secondary: '#fcd34d', accent: '#f59e0b',
      bg: '#0f0a05', surface: '#1c140c', surface2: '#2d2013',
      text: '#fffbeb', textMuted: '#fde047', border: '#5c3e09'
    }
  },
  'esmeralda-profundo': {
    id: 'esmeralda-profundo',
    name: 'Esmeralda Profundo',
    category: 'Moda y Accesorios',
    light: {
      primary: '#0f766e', secondary: '#99f6e4', accent: '#0d9488',
      bg: '#f0fdfa', surface: '#ffffff', surface2: '#ccfbf1',
      text: '#042f2e', textMuted: '#0f766e', border: '#99f6e4'
    },
    dark: {
      primary: '#2dd4bf', secondary: '#99f6e4', accent: '#14b8a6',
      bg: '#040a09', surface: '#0c1413', surface2: '#152422',
      text: '#f2fbf9', textMuted: '#99f6e4', border: '#1d3d39'
    }
  },

  // ── 2. GASTRONOMÍA Y ALIMENTOS ──
  'naranja-vibrante': {
    id: 'naranja-vibrante',
    name: 'Naranja Vibrante',
    category: 'Gastronomía y Alimentos',
    light: {
      primary: '#e65100', secondary: '#ffcc80', accent: '#ff6d00',
      bg: '#fff8f0', surface: '#ffffff', surface2: '#fff3e0',
      text: '#1a0900', textMuted: '#7c3c00', border: '#ffcc80'
    },
    dark: {
      primary: '#e65100', secondary: '#ffcc80', accent: '#ff6d00',
      bg: '#0f0f0f', surface: '#1a1a1a', surface2: '#252525',
      text: '#f0f0f0', textMuted: '#a0a0a0', border: '#333333'
    }
  },
  'cereza-picante': {
    id: 'cereza-picante',
    name: 'Cereza Picante',
    category: 'Gastronomía y Alimentos',
    light: {
      primary: '#be123c', secondary: '#fda4af', accent: '#fb7185',
      bg: '#fff5f9', surface: '#ffffff', surface2: '#ffe4e6',
      text: '#310410', textMuted: '#881337', border: '#fecdd3'
    },
    dark: {
      primary: '#fb7185', secondary: '#f43f5e', accent: '#fda4af',
      bg: '#0c0205', surface: '#1a070c', surface2: '#2d0e16',
      text: '#ffe4e6', textMuted: '#fecdd3', border: '#4c0519'
    }
  },
  'menta-cafe': {
    id: 'menta-cafe',
    name: 'Menta Café',
    category: 'Gastronomía y Alimentos',
    light: {
      primary: '#5c4033', secondary: '#a7f3d0', accent: '#10b981',
      bg: '#f4fbf7', surface: '#ffffff', surface2: '#e6f7ed',
      text: '#271811', textMuted: '#527863', border: '#a7f3d0'
    },
    dark: {
      primary: '#34d399', secondary: '#86efac', accent: '#6ee7b7',
      bg: '#0f0c0b', surface: '#1c1614', surface2: '#2d231e',
      text: '#ecfdf5', textMuted: '#a7f3d0', border: '#4b3621'
    }
  },
  'mostaza-retro': {
    id: 'mostaza-retro',
    name: 'Mostaza Retro',
    category: 'Gastronomía y Alimentos',
    light: {
      primary: '#d97706', secondary: '#fde047', accent: '#ca8a04',
      bg: '#fffbeb', surface: '#ffffff', surface2: '#fef3c7',
      text: '#2d1a00', textMuted: '#78350f', border: '#fde047'
    },
    dark: {
      primary: '#fbbf24', secondary: '#fef08a', accent: '#f59e0b',
      bg: '#0a0702', surface: '#161106', surface2: '#261d0a',
      text: '#fef9c3', textMuted: '#fef08a', border: '#5c4308'
    }
  },
  'aguacate-organico': {
    id: 'aguacate-organico',
    name: 'Aguacate Orgánico',
    category: 'Gastronomía y Alimentos',
    light: {
      primary: '#3f6212', secondary: '#bef264', accent: '#65a30d',
      bg: '#f9fbf4', surface: '#ffffff', surface2: '#f1f7e5',
      text: '#121e03', textMuted: '#4d6534', border: '#d9f99d'
    },
    dark: {
      primary: '#bef264', secondary: '#a3e635', accent: '#84cc16',
      bg: '#070c02', surface: '#121b07', surface2: '#202e0e',
      text: '#f4fcd9', textMuted: '#a3e635', border: '#3f6212'
    }
  },
  'limon-hierbabuena': {
    id: 'limon-hierbabuena',
    name: 'Limón & Hierbabuena',
    category: 'Gastronomía y Alimentos',
    light: {
      primary: '#047857', secondary: '#a7f3d0', accent: '#fbbf24',
      bg: '#f0fdf4', surface: '#ffffff', surface2: '#d1fae5',
      text: '#064e3b', textMuted: '#047857', border: '#a7f3d0'
    },
    dark: {
      primary: '#34d399', secondary: '#a7f3d0', accent: '#fbbf24',
      bg: '#022c22', surface: '#064e3b', surface2: '#0f766e',
      text: '#ecfdf5', textMuted: '#a7f3d0', border: '#047857'
    }
  },
  'cacao-profundo': {
    id: 'cacao-profundo',
    name: 'Cacao Profundo',
    category: 'Gastronomía y Alimentos',
    light: {
      primary: '#451a03', secondary: '#fed7aa', accent: '#d97706',
      bg: '#fffaf3', surface: '#ffffff', surface2: '#ffedd5',
      text: '#270e00', textMuted: '#78350f', border: '#fed7aa'
    },
    dark: {
      primary: '#fb923c', secondary: '#ffedd5', accent: '#f97316',
      bg: '#0f0805', surface: '#1c100a', surface2: '#2d1b11',
      text: '#fffeb2', textMuted: '#fdba74', border: '#431407'
    }
  },
  'vino-queso': {
    id: 'vino-queso',
    name: 'Vino & Queso',
    category: 'Gastronomía y Alimentos',
    light: {
      primary: '#881337', secondary: '#fef3c7', accent: '#b45309',
      bg: '#fffafb', surface: '#ffffff', surface2: '#fecdd3',
      text: '#4c0519', textMuted: '#9f1239', border: '#fde68a'
    },
    dark: {
      primary: '#fda4af', secondary: '#fef08a', accent: '#fb7185',
      bg: '#140206', surface: '#27050f', surface2: '#3f0717',
      text: '#fff1f2', textMuted: '#fda4af', border: '#4c0519'
    }
  },
  'trigo-dorado': {
    id: 'trigo-dorado',
    name: 'Trigo Dorado',
    category: 'Gastronomía y Alimentos',
    light: {
      primary: '#b45309', secondary: '#fde68a', accent: '#d97706',
      bg: '#fffdf6', surface: '#ffffff', surface2: '#fef3c7',
      text: '#3c1800', textMuted: '#78350f', border: '#fcd34d'
    },
    dark: {
      primary: '#f59e0b', secondary: '#fef08a', accent: '#fbbf24',
      bg: '#0f0904', surface: '#1c120a', surface2: '#2d1e11',
      text: '#fffbeb', textMuted: '#fde047', border: '#5c3e09'
    }
  },
  'mar-brasa': {
    id: 'mar-brasa',
    name: 'Mar & Brasa',
    category: 'Gastronomía y Alimentos',
    light: {
      primary: '#0284c7', secondary: '#bae6fd', accent: '#ea580c',
      bg: '#f0f9ff', surface: '#ffffff', surface2: '#e0f2fe',
      text: '#0c2340', textMuted: '#0284c7', border: '#bae6fd'
    },
    dark: {
      primary: '#38bdf8', secondary: '#fdba74', accent: '#f97316',
      bg: '#09101d', surface: '#132237', surface2: '#1d3557',
      text: '#f1f7feb', textMuted: '#93c5fd', border: '#1d3557'
    }
  },

  // ── 3. SALUD Y BELLEZA (ESTÉTICA) ──
  'morado-premium': {
    id: 'morado-premium',
    name: 'Orquídea Luxury',
    category: 'Salud y Belleza',
    light: {
      primary: '#4527a0', secondary: '#b39ddb', accent: '#7c4dff',
      bg: '#f5f3ff', surface: '#ffffff', surface2: '#ede7f6',
      text: '#0a0019', textMuted: '#3a2060', border: '#b39ddb'
    },
    dark: {
      primary: '#4527a0', secondary: '#b39ddb', accent: '#7c4dff',
      bg: '#0f0f0f', surface: '#1a1a1a', surface2: '#252525',
      text: '#f0f0f0', textMuted: '#a0a0a0', border: '#333333'
    }
  },
  'lavanda-relax': {
    id: 'lavanda-relax',
    name: 'Lavanda Relax',
    category: 'Salud y Belleza',
    light: {
      primary: '#7c3aed', secondary: '#ddd6fe', accent: '#a78bfa',
      bg: '#fbfaff', surface: '#ffffff', surface2: '#f5f3ff',
      text: '#1e004f', textMuted: '#5c469c', border: '#ddd6fe'
    },
    dark: {
      primary: '#a78bfa', secondary: '#c4b5fd', accent: '#8b5cf6',
      bg: '#0b0914', surface: '#151226', surface2: '#241e3d',
      text: '#f5f3ff', textMuted: '#c4b5fd', border: '#3b2b73'
    }
  },
  'piel-melocoton': {
    id: 'piel-melocoton',
    name: 'Piel de Melocotón',
    category: 'Salud y Belleza',
    light: {
      primary: '#f43f5e', secondary: '#ffedd5', accent: '#fb7185',
      bg: '#fffaf9', surface: '#ffffff', surface2: '#ffede9',
      text: '#37000d', textMuted: '#9f3d53', border: '#fed7aa'
    },
    dark: {
      primary: '#fb7185', secondary: '#fdba74', accent: '#fecdd3',
      bg: '#0f0709', surface: '#1d0e12', surface2: '#2e181d',
      text: '#ffe4e6', textMuted: '#fda4af', border: '#5c1126'
    }
  },
  'aqua-pure': {
    id: 'aqua-pure',
    name: 'Aqua Pure',
    category: 'Salud y Belleza',
    light: {
      primary: '#0891b2', secondary: '#cffafe', accent: '#06b6d4',
      bg: '#f0fdfa', surface: '#ffffff', surface2: '#e0f7fa',
      text: '#002a35', textMuted: '#287588', border: '#a5f3fc'
    },
    dark: {
      primary: '#22d3ee', secondary: '#67e8f9', accent: '#06b6d4',
      bg: '#030b0e', surface: '#0b1a20', surface2: '#122a33',
      text: '#ecfeff', textMuted: '#67e8f9', border: '#133845'
    }
  },
  'eucalipto-zen': {
    id: 'eucalipto-zen',
    name: 'Eucalipto Zen',
    category: 'Salud y Belleza',
    light: {
      primary: '#0f766e', secondary: '#ccfbf1', accent: '#14b8a6',
      bg: '#f4faf9', surface: '#ffffff', surface2: '#e6f4f1',
      text: '#032522', textMuted: '#2e615b', border: '#99f6e4'
    },
    dark: {
      primary: '#2dd4bf', secondary: '#99f6e4', accent: '#0d9488',
      bg: '#040a09', surface: '#0c1413', surface2: '#152422',
      text: '#f2fbf9', textMuted: '#99f6e4', border: '#1d3d39'
    }
  },
  'rosa-sakura': {
    id: 'rosa-sakura',
    name: 'Rosa Sakura',
    category: 'Salud y Belleza',
    light: {
      primary: '#f43f5e', secondary: '#fed7aa', accent: '#ec4899',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffe4e6',
      text: '#4c0519', textMuted: '#9f1239', border: '#ffd8e1'
    },
    dark: {
      primary: '#fda4af', secondary: '#f87171', accent: '#f43f5e',
      bg: '#0e0507', surface: '#1e0c10', surface2: '#2e151a',
      text: '#ffe4e6', textMuted: '#fda4af', border: '#5c1624'
    }
  },
  'arcilla-mineral': {
    id: 'arcilla-mineral',
    name: 'Arcilla Mineral',
    category: 'Salud y Belleza',
    light: {
      primary: '#7c2d12', secondary: '#fed7aa', accent: '#c2410c',
      bg: '#fafaf9', surface: '#ffffff', surface2: '#f5f5f4',
      text: '#292524', textMuted: '#78716c', border: '#e7e5e4'
    },
    dark: {
      primary: '#fdba74', secondary: '#a8a29e', accent: '#ea580c',
      bg: '#0c0a09', surface: '#1c1917', surface2: '#292524',
      text: '#f5f5f4', textMuted: '#a8a29e', border: '#44403c'
    }
  },
  'menta-aloe': {
    id: 'menta-aloe',
    name: 'Menta & Aloe',
    category: 'Salud y Belleza',
    light: {
      primary: '#059669', secondary: '#a7f3d0', accent: '#10b981',
      bg: '#f0fdf4', surface: '#ffffff', surface2: '#d1fae5',
      text: '#064e3b', textMuted: '#059669', border: '#a7f3d0'
    },
    dark: {
      primary: '#34d399', secondary: '#6ee7b7', accent: '#10b981',
      bg: '#022c22', surface: '#064e3b', surface2: '#0f766e',
      text: '#ecfdf5', textMuted: '#a7f3d0', border: '#047857'
    }
  },
  'jaspe-luxury': {
    id: 'jaspe-luxury',
    name: 'Jaspe Luxury',
    category: 'Salud y Belleza',
    light: {
      primary: '#991b1b', secondary: '#fca5a5', accent: '#d97706',
      bg: '#fffcfc', surface: '#ffffff', surface2: '#fee2e2',
      text: '#111827', textMuted: '#6b7280', border: '#fca5a5'
    },
    dark: {
      primary: '#f87171', secondary: '#fca5a5', accent: '#fbbf24',
      bg: '#0c0303', surface: '#1e0b0b', surface2: '#2f1414',
      text: '#f9fafb', textMuted: '#9ca3af', border: '#581c1c'
    }
  },
  'brisa-marina': {
    id: 'brisa-marina',
    name: 'Brisa Marina',
    category: 'Salud y Belleza',
    light: {
      primary: '#0284c7', secondary: '#bae6fd', accent: '#06b6d4',
      bg: '#f0f9ff', surface: '#ffffff', surface2: '#e0f2fe',
      text: '#0f172a', textMuted: '#475569', border: '#bae6fd'
    },
    dark: {
      primary: '#38bdf8', secondary: '#67e8f9', accent: '#06b6d4',
      bg: '#040b14', surface: '#0d1d2f', surface2: '#16314f',
      text: '#f8fafc', textMuted: '#94a3b8', border: '#1e3a5f'
    }
  },

  // ── 4. TECNOLOGÍA Y DEPORTES ──
  'azul-medianoche': {
    id: 'azul-medianoche',
    name: 'Azul Medianoche',
    category: 'Tecnología y Deportes',
    light: {
      primary: '#1565c0', secondary: '#64b5f6', accent: '#2979ff',
      bg: '#f0f4ff', surface: '#ffffff', surface2: '#e3f2fd',
      text: '#00091a', textMuted: '#2c4a7c', border: '#bbdefb'
    },
    dark: {
      primary: '#1565c0', secondary: '#64b5f6', accent: '#2979ff',
      bg: '#0f0f0f', surface: '#1a1a1a', surface2: '#252525',
      text: '#f0f0f0', textMuted: '#a0a0a0', border: '#333333'
    }
  },
  'carbon-oscuro': {
    id: 'carbon-oscuro',
    name: 'Carbón Oscuro',
    category: 'Tecnología y Deportes',
    light: {
      primary: '#90caf9', secondary: '#bbdefb', accent: '#40c4ff',
      bg: '#121212', surface: '#1e1e1e', surface2: '#2c2c2c',
      text: '#e0e0e0', textMuted: '#9e9e9e', border: '#37474f'
    },
    dark: {
      primary: '#90caf9', secondary: '#bbdefb', accent: '#40c4ff',
      bg: '#121212', surface: '#1e1e1e', surface2: '#2c2c2c',
      text: '#e0e0e0', textMuted: '#9e9e9e', border: '#37474f'
    }
  },
  'fuego-deportivo': {
    id: 'fuego-deportivo',
    name: 'Fuego Deportivo',
    category: 'Tecnología y Deportes',
    light: {
      primary: '#e11d48', secondary: '#fda4af', accent: '#f43f5e',
      bg: '#fefafb', surface: '#ffffff', surface2: '#ffe4e6',
      text: '#2b000a', textMuted: '#7c2a3f', border: '#fecdd3'
    },
    dark: {
      primary: '#f43f5e', secondary: '#fda4af', accent: '#fb7185',
      bg: '#0d0205', surface: '#1b080c', surface2: '#2e1218',
      text: '#fff1f2', textMuted: '#fda4af', border: '#5c1122'
    }
  },
  'cyber-punk': {
    id: 'cyber-punk',
    name: 'Cyber Punk',
    category: 'Tecnología y Deportes',
    light: {
      primary: '#d946ef', secondary: '#fde047', accent: '#a21caf',
      bg: '#fdf8fd', surface: '#ffffff', surface2: '#fae8ff',
      text: '#2b0035', textMuted: '#86198f', border: '#f5d0fe'
    },
    dark: {
      primary: '#f472b6', secondary: '#fde047', accent: '#e879f9',
      bg: '#0a020c', surface: '#16081c', surface2: '#250f2f',
      text: '#fdf4ff', textMuted: '#f472b6', border: '#581c78'
    }
  },
  'acido-electrico': {
    id: 'acido-electrico',
    name: 'Ácido Eléctrico',
    category: 'Tecnología y Deportes',
    light: {
      primary: '#4d7c0f', secondary: '#d9f99d', accent: '#a3e635',
      bg: '#f9fcf5', surface: '#ffffff', surface2: '#f1f7e3',
      text: '#122000', textMuted: '#3f6b00', border: '#bef264'
    },
    dark: {
      primary: '#a3e635', secondary: '#c5f870', accent: '#84cc16',
      bg: '#0a0d07', surface: '#151c0e', surface2: '#212c17',
      text: '#f4fcd9', textMuted: '#a3e635', border: '#3d5225'
    }
  },
  'nave-espacial': {
    id: 'nave-espacial',
    name: 'Nave Espacial',
    category: 'Tecnología y Deportes',
    light: {
      primary: '#0f172a', secondary: '#cbd5e1', accent: '#3b82f6',
      bg: '#f1f5f9', surface: '#ffffff', surface2: '#e2e8f0',
      text: '#0f172a', textMuted: '#64748b', border: '#cbd5e1'
    },
    dark: {
      primary: '#e2e8f0', secondary: '#94a3b8', accent: '#60a5fa',
      bg: '#020617', surface: '#0f172a', surface2: '#1e293b',
      text: '#f8fafc', textMuted: '#94a3b8', border: '#334155'
    }
  },
  'carbono-oro': {
    id: 'carbono-oro',
    name: 'Carbono & Oro',
    category: 'Tecnología y Deportes',
    light: {
      primary: '#111827', secondary: '#f59e0b', accent: '#d97706',
      bg: '#fafafa', surface: '#ffffff', surface2: '#f3f4f6',
      text: '#111827', textMuted: '#4b5563', border: '#fbbf24'
    },
    dark: {
      primary: '#fbbf24', secondary: '#d97706', accent: '#f59e0b',
      bg: '#030712', surface: '#111827', surface2: '#1f2937',
      text: '#f9fafb', textMuted: '#fde047', border: '#374151'
    }
  },
  'neon-purple': {
    id: 'neon-purple',
    name: 'Neon Purple',
    category: 'Tecnología y Deportes',
    light: {
      primary: '#8b5cf6', secondary: '#c4b5fd', accent: '#06b6d4',
      bg: '#fdfbfe', surface: '#ffffff', surface2: '#f3e8ff',
      text: '#1e004f', textMuted: '#6b21a8', border: '#ddd6fe'
    },
    dark: {
      primary: '#c4b5fd', secondary: '#a78bfa', accent: '#22d3ee',
      bg: '#0b0214', surface: '#1c082f', surface2: '#2e0e4e',
      text: '#fdf4ff', textMuted: '#c4b5fd', border: '#581c78'
    }
  },
  'acero-mate': {
    id: 'acero-mate',
    name: 'Acero Mate',
    category: 'Tecnología y Deportes',
    light: {
      primary: '#334155', secondary: '#fdba74', accent: '#f97316',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#e2e8f0',
      text: '#0f172a', textMuted: '#475569', border: '#fdba74'
    },
    dark: {
      primary: '#f97316', secondary: '#fdba74', accent: '#ea580c',
      bg: '#090d16', surface: '#1e293b', surface2: '#334155',
      text: '#f8fafc', textMuted: '#94a3b8', border: '#334155'
    }
  },
  'adrenalina-verde': {
    id: 'adrenalina-verde',
    name: 'Adrenalina Verde',
    category: 'Tecnología y Deportes',
    light: {
      primary: '#3f6212', secondary: '#bef264', accent: '#16a34a',
      bg: '#fafdf5', surface: '#ffffff', surface2: '#f1f7e3',
      text: '#111827', textMuted: '#4b5563', border: '#d9f99d'
    },
    dark: {
      primary: '#a3e635', secondary: '#bef264', accent: '#22c55e',
      bg: '#050a02', surface: '#101c05', surface2: '#1a2e0a',
      text: '#f4fcd9', textMuted: '#a3e635', border: '#3f6212'
    }
  },

  // ── 5. MASCOTAS Y NATURALEZA ──
  'verde-oliva': {
    id: 'verde-oliva',
    name: 'Verde Oliva',
    category: 'Mascotas y Naturaleza',
    light: {
      primary: '#558b2f', secondary: '#aed581', accent: '#76ff03',
      bg: '#f4f8f0', surface: '#ffffff', surface2: '#f1f8e9',
      text: '#0a1200', textMuted: '#3e5229', border: '#c5e1a5'
    },
    dark: {
      primary: '#558b2f', secondary: '#aed581', accent: '#76ff03',
      bg: '#0f0f0f', surface: '#1a1a1a', surface2: '#252525',
      text: '#f0f0f0', textMuted: '#a0a0a0', border: '#333333'
    }
  },
  'terracota-calida': {
    id: 'terracota-calida',
    name: 'Terracota Cálida',
    category: 'Mascotas y Naturaleza',
    light: {
      primary: '#c2410c', secondary: '#ffedd5', accent: '#ea580c',
      bg: '#faf7f5', surface: '#ffffff', surface2: '#fbf0e8',
      text: '#2d0a00', textMuted: '#7c3c21', border: '#fed7aa'
    },
    dark: {
      primary: '#ea580c', secondary: '#fdba74', accent: '#f97316',
      bg: '#0f0805', surface: '#1c100a', surface2: '#2d1b11',
      text: '#ffedd5', textMuted: '#fdba74', border: '#5c240b'
    }
  },
  'bosque-profundo': {
    id: 'bosque-profundo',
    name: 'Bosque Profundo',
    category: 'Mascotas y Naturaleza',
    light: {
      primary: '#065f46', secondary: '#d1fae5', accent: '#059669',
      bg: '#f4faf7', surface: '#ffffff', surface2: '#e6f4ed',
      text: '#011f15', textMuted: '#1f5f46', border: '#a7f3d0'
    },
    dark: {
      primary: '#34d399', secondary: '#6ee7b7', accent: '#059669',
      bg: '#040a08', surface: '#0b1411', surface2: '#14241e',
      text: '#ecfdf5', textMuted: '#a7f3d0', border: '#1a3f33'
    }
  },
  'miel-y-huella': {
    id: 'miel-y-huella',
    name: 'Miel y Huella',
    category: 'Mascotas y Naturaleza',
    light: {
      primary: '#b45309', secondary: '#fef3c7', accent: '#d97706',
      bg: '#faf8f5', surface: '#ffffff', surface2: '#fcf3df',
      text: '#301600', textMuted: '#78350f', border: '#fde047'
    },
    dark: {
      primary: '#f59e0b', secondary: '#fef08a', accent: '#d97706',
      bg: '#0f0a05', surface: '#1c140c', surface2: '#2d2013',
      text: '#fffbeb', textMuted: '#fde047', border: '#5c3e09'
    }
  },
  'cacao-dulce': {
    id: 'cacao-dulce',
    name: 'Cacao Dulce',
    category: 'Mascotas y Naturaleza',
    light: {
      primary: '#78350f', secondary: '#fed7aa', accent: '#92400e',
      bg: '#fdfbf7', surface: '#ffffff', surface2: '#f6ede2',
      text: '#2d0f00', textMuted: '#6b3718', border: '#f5d0a9'
    },
    dark: {
      primary: '#b45309', secondary: '#fdba74', accent: '#854d0e',
      bg: '#0f0b08', surface: '#1d140f', surface2: '#2f2018',
      text: '#fafaf9', textMuted: '#f59e0b', border: '#5c3a21'
    }
  },
  'hierba-fresca': {
    id: 'hierba-fresca',
    name: 'Hierba Fresca',
    category: 'Mascotas y Naturaleza',
    light: {
      primary: '#15803d', secondary: '#bbf7d0', accent: '#eab308',
      bg: '#f0fdf4', surface: '#ffffff', surface2: '#d1fae5',
      text: '#14532d', textMuted: '#166534', border: '#bbf7d0'
    },
    dark: {
      primary: '#22c55e', secondary: '#86efac', accent: '#facc15',
      bg: '#022c22', surface: '#052e16', surface2: '#14532d',
      text: '#ecfdf5', textMuted: '#86efac', border: '#15803d'
    }
  },
  'tierra-mojada': {
    id: 'tierra-mojada',
    name: 'Tierra Mojada',
    category: 'Mascotas y Naturaleza',
    light: {
      primary: '#451a03', secondary: '#d6d3d1', accent: '#78716c',
      bg: '#fafaf9', surface: '#ffffff', surface2: '#f5f5f4',
      text: '#1c1917', textMuted: '#44403c', border: '#e7e5e4'
    },
    dark: {
      primary: '#a8a29e', secondary: '#78716c', accent: '#d6d3d1',
      bg: '#0c0a09', surface: '#1c1917', surface2: '#292524',
      text: '#f5f5f4', textMuted: '#a8a29e', border: '#44403c'
    }
  },
  'bambu-eco': {
    id: 'bambu-eco',
    name: 'Bambú Eco',
    category: 'Mascotas y Naturaleza',
    light: {
      primary: '#16a34a', secondary: '#fef08a', accent: '#65a30d',
      bg: '#fbfdf5', surface: '#ffffff', surface2: '#f4f8e3',
      text: '#143c08', textMuted: '#4d6534', border: '#d9f99d'
    },
    dark: {
      primary: '#a3e635', secondary: '#fef08a', accent: '#84cc16',
      bg: '#070c02', surface: '#121b07', surface2: '#202e0e',
      text: '#f4fcd9', textMuted: '#a3e635', border: '#3f6212'
    }
  },
  'pluma-canario': {
    id: 'pluma-canario',
    name: 'Pluma de Canario',
    category: 'Mascotas y Naturaleza',
    light: {
      primary: '#eab308', secondary: '#e2e8f0', accent: '#facc15',
      bg: '#fffdf6', surface: '#ffffff', surface2: '#fef9c3',
      text: '#1e293b', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#facc15', secondary: '#475569', accent: '#fde047',
      bg: '#0c0b02', surface: '#1e1d0f', surface2: '#2f2e15',
      text: '#fdf9c3', textMuted: '#cbd5e1', border: '#5c5210'
    }
  },
  'coral-acuario': {
    id: 'coral-acuario',
    name: 'Coral de Acuario',
    category: 'Mascotas y Naturaleza',
    light: {
      primary: '#0ea5e9', secondary: '#ffedd5', accent: '#f43f5e',
      bg: '#f0f9ff', surface: '#ffffff', surface2: '#e0f2fe',
      text: '#0c2e4e', textMuted: '#0ea5e9', border: '#fdba74'
    },
    dark: {
      primary: '#38bdf8', secondary: '#fecdd3', accent: '#fb7185',
      bg: '#040d1a', surface: '#0d223f', surface2: '#163b65',
      text: '#ecf7ff', textMuted: '#93c5fd', border: '#1e4b8a'
    }
  },

  // ── 6. HOGAR Y DECORACIÓN ──
  'lino-escandinavo': {
    id: 'lino-escandinavo',
    name: 'Lino Escandinavo',
    category: 'Hogar y Decoración',
    light: {
      primary: '#475569', secondary: '#f1f5f9', accent: '#64748b',
      bg: '#fcfcfc', surface: '#ffffff', surface2: '#f8fafc',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#f1f5f9', secondary: '#475569', accent: '#94a3b8',
      bg: '#090d16', surface: '#1e293b', surface2: '#334155',
      text: '#f8fafc', textMuted: '#94a3b8', border: '#334155'
    }
  },
  'azul-nordico': {
    id: 'azul-nordico',
    name: 'Azul Nórdico',
    category: 'Hogar y Decoración',
    light: {
      primary: '#334155', secondary: '#e2e8f0', accent: '#ea580c',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#94a3b8', secondary: '#334155', accent: '#f97316',
      bg: '#0b0f19', surface: '#1e293b', surface2: '#334155',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#1e3a5f'
    }
  },
  'salvia-moderna': {
    id: 'salvia-moderna',
    name: 'Salvia Moderna',
    category: 'Hogar y Decoración',
    light: {
      primary: '#14532d', secondary: '#ffedd5', accent: '#c2410c',
      bg: '#fafaf9', surface: '#ffffff', surface2: '#f5f5f4',
      text: '#1c1917', textMuted: '#44403c', border: '#fed7aa'
    },
    dark: {
      primary: '#a3e635', secondary: '#7c3c21', accent: '#ea580c',
      bg: '#0c0a09', surface: '#1c1917', surface2: '#292524',
      text: '#f5f5f4', textMuted: '#a8a29e', border: '#5c240b'
    }
  },
  'mostaza-loft': {
    id: 'mostaza-loft',
    name: 'Mostaza Loft',
    category: 'Hogar y Decoración',
    light: {
      primary: '#d97706', secondary: '#e2e8f0', accent: '#111827',
      bg: '#fafafa', surface: '#ffffff', surface2: '#f3f4f6',
      text: '#111827', textMuted: '#4b5563', border: '#cbd5e1'
    },
    dark: {
      primary: '#fbbf24', secondary: '#374151', accent: '#f9fafb',
      bg: '#030712', surface: '#111827', surface2: '#1f2937',
      text: '#f9fafb', textMuted: '#9ca3af', border: '#374151'
    }
  },
  'terciopelo-luxury': {
    id: 'terciopelo-luxury',
    name: 'Terciopelo Luxury',
    category: 'Hogar y Decoración',
    light: {
      primary: '#0d9488', secondary: '#fde047', accent: '#0f766e',
      bg: '#fcfdfd', surface: '#ffffff', surface2: '#f0fdfa',
      text: '#0f172a', textMuted: '#475569', border: '#fcd34d'
    },
    dark: {
      primary: '#2dd4bf', secondary: '#fef08a', accent: '#fbbf24',
      bg: '#040c0c', surface: '#0c1f1f', surface2: '#153535',
      text: '#f2fbfb', textMuted: '#99f6e4', border: '#5c4308'
    }
  },
  'cuero-roble': {
    id: 'cuero-roble',
    name: 'Cuero & Roble',
    category: 'Hogar y Decoración',
    light: {
      primary: '#7c2d12', secondary: '#fed7aa', accent: '#451a03',
      bg: '#fdfcfb', surface: '#ffffff', surface2: '#f6ede2',
      text: '#270e00', textMuted: '#78350f', border: '#fed7aa'
    },
    dark: {
      primary: '#fb923c', secondary: '#fdba74', accent: '#f97316',
      bg: '#0f0a07', surface: '#1d130e', surface2: '#2f1f18',
      text: '#ffedd5', textMuted: '#fdba74', border: '#5c240b'
    }
  },
  'piedra-cantera': {
    id: 'piedra-cantera',
    name: 'Piedra de Cantera',
    category: 'Hogar y Decoración',
    light: {
      primary: '#334155', secondary: '#cbd5e1', accent: '#0f172a',
      bg: '#fafafa', surface: '#ffffff', surface2: '#f1f5f9',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#e2e8f0', secondary: '#475569', accent: '#94a3b8',
      bg: '#090d16', surface: '#1e293b', surface2: '#334155',
      text: '#f8fafc', textMuted: '#94a3b8', border: '#334155'
    }
  },
  'toscana-calida': {
    id: 'toscana-calida',
    name: 'Toscana Cálida',
    category: 'Hogar y Decoración',
    light: {
      primary: '#c2410c', secondary: '#fde68a', accent: '#15803d',
      bg: '#fdfcf9', surface: '#ffffff', surface2: '#fbf0e8',
      text: '#3c1800', textMuted: '#78350f', border: '#fcd34d'
    },
    dark: {
      primary: '#ea580c', secondary: '#fef08a', accent: '#22c55e',
      bg: '#0f0a05', surface: '#1c140c', surface2: '#2d2013',
      text: '#fffbeb', textMuted: '#fde047', border: '#5c3e09'
    }
  },
  'algodon-egipcio': {
    id: 'algodon-egipcio',
    name: 'Algodón Egipcio',
    category: 'Hogar y Decoración',
    light: {
      primary: '#1e293b', secondary: '#f1f5f9', accent: '#475569',
      bg: '#ffffff', surface: '#fdfdfd', surface2: '#f8fafc',
      text: '#0f172a', textMuted: '#64748b', border: '#e2e8f0'
    },
    dark: {
      primary: '#f8fafc', secondary: '#334155', accent: '#94a3b8',
      bg: '#020617', surface: '#0f172a', surface2: '#1e293b',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#1e293b'
    }
  },
  'hortensia-azul': {
    id: 'hortensia-azul',
    name: 'Hortensia Azul',
    category: 'Hogar y Decoración',
    light: {
      primary: '#2563eb', secondary: '#dbeafe', accent: '#16a34a',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#eff6ff',
      text: '#1e3a8a', textMuted: '#4b5563', border: '#bfdbfe'
    },
    dark: {
      primary: '#60a5fa', secondary: '#1e3a8a', accent: '#22c55e',
      bg: '#040b19', surface: '#0d1d3a', surface2: '#163260',
      text: '#eff6ff', textMuted: '#93c5fd', border: '#1e3a5f'
    }
  },

  // ── 7. INFANTIL Y JUGUETES ──
  'azul-pastel': {
    id: 'azul-pastel',
    name: 'Azul Pastel',
    category: 'Infantil y Juguetes',
    light: {
      primary: '#0ea5e9', secondary: '#e0f2fe', accent: '#38bdf8',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#f0f9ff',
      text: '#0369a1', textMuted: '#0284c7', border: '#bae6fd'
    },
    dark: {
      primary: '#38bdf8', secondary: '#0c4a6e', accent: '#0ea5e9',
      bg: '#03141f', surface: '#092d47', surface2: '#0e4166',
      text: '#f0f9ff', textMuted: '#38bdf8', border: '#0e4166'
    }
  },
  'rosa-pastel': {
    id: 'rosa-pastel',
    name: 'Rosa Pastel',
    category: 'Infantil y Juguetes',
    light: {
      primary: '#ec4899', secondary: '#fce4ec', accent: '#f472b6',
      bg: '#fffdfd', surface: '#ffffff', surface2: '#fff1f2',
      text: '#9d174d', textMuted: '#db2777', border: '#fbcfe8'
    },
    dark: {
      primary: '#f472b6', secondary: '#500724', accent: '#ec4899',
      bg: '#1a030d', surface: '#380a1d', surface2: '#500f2a',
      text: '#fff1f2', textMuted: '#f472b6', border: '#500f2a'
    }
  },
  'mentita-bebe': {
    id: 'mentita-bebe',
    name: 'Mentita Bebé',
    category: 'Infantil y Juguetes',
    light: {
      primary: '#10b981', secondary: '#d1fae5', accent: '#fbbf24',
      bg: '#fbfdfb', surface: '#ffffff', surface2: '#e6fdf0',
      text: '#064e3b', textMuted: '#059669', border: '#a7f3d0'
    },
    dark: {
      primary: '#34d399', secondary: '#064e3b', accent: '#fbbf24',
      bg: '#031913', surface: '#093a2c', surface2: '#0f5844',
      text: '#e6fdf0', textMuted: '#34d399', border: '#0f5844'
    }
  },
  'juguete-divertido': {
    id: 'juguete-divertido',
    name: 'Juguete Divertido',
    category: 'Infantil y Juguetes',
    light: {
      primary: '#dc2626', secondary: '#fde047', accent: '#2563eb',
      bg: '#fffefa', surface: '#ffffff', surface2: '#fef9c3',
      text: '#7f1d1d', textMuted: '#1e3a8a', border: '#fef08a'
    },
    dark: {
      primary: '#f87171', secondary: '#fef08a', accent: '#60a5fa',
      bg: '#140303', surface: '#2d0c0c', surface2: '#451616',
      text: '#fef9c3', textMuted: '#f87171', border: '#5c1d1d'
    }
  },
  'carrusel-magico': {
    id: 'carrusel-magico',
    name: 'Carrusel Mágico',
    category: 'Infantil y Juguetes',
    light: {
      primary: '#8b5cf6', secondary: '#f3e8ff', accent: '#ec4899',
      bg: '#fdfbfe', surface: '#ffffff', surface2: '#fae8ff',
      text: '#4c1d95', textMuted: '#a21caf', border: '#f3d8ff'
    },
    dark: {
      primary: '#c4b5fd', secondary: '#2e0e4e', accent: '#f472b6',
      bg: '#0e0319', surface: '#220b3a', surface2: '#351259',
      text: '#fae8ff', textMuted: '#c4b5fd', border: '#351259'
    }
  },
  'aventura-safari': {
    id: 'aventura-safari',
    name: 'Aventura Safari',
    category: 'Infantil y Juguetes',
    light: {
      primary: '#b45309', secondary: '#fef3c7', accent: '#15803d',
      bg: '#faf9f6', surface: '#ffffff', surface2: '#fdf6e2',
      text: '#451a03', textMuted: '#166534', border: '#fcd34d'
    },
    dark: {
      primary: '#f59e0b', secondary: '#3f2203', accent: '#22c55e',
      bg: '#140c03', surface: '#2b1a07', surface2: '#3f270b',
      text: '#fef6e2', textMuted: '#fde047', border: '#3f270b'
    }
  },
  'nube-caramelo': {
    id: 'nube-caramelo',
    name: 'Nube de Caramelo',
    category: 'Infantil y Juguetes',
    light: {
      primary: '#06b6d4', secondary: '#ffccd5', accent: '#e879f9',
      bg: '#fff9fa', surface: '#ffffff', surface2: '#ffe4e8',
      text: '#0891b2', textMuted: '#a21caf', border: '#ffb3c1'
    },
    dark: {
      primary: '#67e8f9', secondary: '#500a18', accent: '#f472b6',
      bg: '#160408', surface: '#310f17', surface2: '#471622',
      text: '#ffe4e8', textMuted: '#fda4af', border: '#471622'
    }
  },
  'espacio-exterior': {
    id: 'espacio-exterior',
    name: 'Espacio Exterior',
    category: 'Infantil y Juguetes',
    light: {
      primary: '#1e3a8a', secondary: '#e2e8f0', accent: '#eab308',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#eff6ff',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#60a5fa', secondary: '#1e293b', accent: '#facc15',
      bg: '#040814', surface: '#0d182e', surface2: '#162b53',
      text: '#f8fafc', textMuted: '#93c5fd', border: '#162b53'
    }
  },
  'dinoterra': {
    id: 'dinoterra',
    name: 'Dinoterra',
    category: 'Infantil y Juguetes',
    light: {
      primary: '#15803d', secondary: '#ffe4e6', accent: '#ea580c',
      bg: '#fafdf7', surface: '#ffffff', surface2: '#eaf4e3',
      text: '#14532d', textMuted: '#7c2d12', border: '#fecdd3'
    },
    dark: {
      primary: '#22c55e', secondary: '#450a0a', accent: '#f97316',
      bg: '#060f06', surface: '#142a14', surface2: '#203f20',
      text: '#ffe4e6', textMuted: '#86efac', border: '#203f20'
    }
  },
  'sirena-pastel': {
    id: 'sirena-pastel',
    name: 'Sirena Pastel',
    category: 'Infantil y Juguetes',
    light: {
      primary: '#0d9488', secondary: '#fce4ec', accent: '#a78bfa',
      bg: '#f6fdfc', surface: '#ffffff', surface2: '#e6f8f6',
      text: '#1e1b4b', textMuted: '#0d9488', border: '#fbcfe8'
    },
    dark: {
      primary: '#2dd4bf', secondary: '#3b0764', accent: '#c4b5fd',
      bg: '#0b0410', surface: '#1b0c25', surface2: '#2b143c',
      text: '#f3e8ff', textMuted: '#2dd4bf', border: '#2b143c'
    }
  },

  // ── 8. JOYERÍA Y LUJO ──
  'oro-24k': {
    id: 'oro-24k',
    name: 'Oro de 24K',
    category: 'Joyería y Lujo',
    light: {
      primary: '#111827', secondary: '#f59e0b', accent: '#b45309',
      bg: '#fafafa', surface: '#ffffff', surface2: '#f3f4f6',
      text: '#111827', textMuted: '#4b5563', border: '#fbbf24'
    },
    dark: {
      primary: '#fbbf24', secondary: '#b45309', accent: '#f59e0b',
      bg: '#030712', surface: '#111827', surface2: '#1f2937',
      text: '#f9fafb', textMuted: '#fde047', border: '#374151'
    }
  },
  'plata-esterlina': {
    id: 'plata-esterlina',
    name: 'Plata Esterlina',
    category: 'Joyería y Lujo',
    light: {
      primary: '#1f2937', secondary: '#d1d5db', accent: '#6b7280',
      bg: '#f9fafb', surface: '#ffffff', surface2: '#f3f4f6',
      text: '#111827', textMuted: '#4b5563', border: '#cbd5e1'
    },
    dark: {
      primary: '#e5e7eb', secondary: '#4b5563', accent: '#9ca3af',
      bg: '#090d16', surface: '#1f2937', surface2: '#374151',
      text: '#f9fafb', textMuted: '#d1d5db', border: '#374151'
    }
  },
  'zafiro-luxury': {
    id: 'zafiro-luxury',
    name: 'Zafiro Luxury',
    category: 'Joyería y Lujo',
    light: {
      primary: '#1e3b8b', secondary: '#dbeafe', accent: '#d97706',
      bg: '#fcfdfd', surface: '#ffffff', surface2: '#eff6ff',
      text: '#0f172a', textMuted: '#1e3a8a', border: '#fbbf24'
    },
    dark: {
      primary: '#60a5fa', secondary: '#1e3a8a', accent: '#f59e0b',
      bg: '#020512', surface: '#0d182e', surface2: '#162c53',
      text: '#eff6ff', textMuted: '#93c5fd', border: '#1e3a5f'
    }
  },
  'rubi-imperial': {
    id: 'rubi-imperial',
    name: 'Rubí Imperial',
    category: 'Joyería y Lujo',
    light: {
      primary: '#9f1239', secondary: '#fecdd3', accent: '#b45309',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffe4e6',
      text: '#4c0519', textMuted: '#9f1239', border: '#fcd34d'
    },
    dark: {
      primary: '#f43f5e', secondary: '#4c0519', accent: '#fbbf24',
      bg: '#0e0205', surface: '#23050f', surface2: '#3c0a1a',
      text: '#ffe4e6', textMuted: '#fda4af', border: '#5c0f24'
    }
  },
  'perla-silvestre': {
    id: 'perla-silvestre',
    name: 'Perla Silvestre',
    category: 'Joyería y Lujo',
    light: {
      primary: '#334155', secondary: '#f1f5f9', accent: '#d97706',
      bg: '#ffffff', surface: '#fafafa', surface2: '#f3f4f6',
      text: '#0f172a', textMuted: '#64748b', border: '#fef3c7'
    },
    dark: {
      primary: '#f1f5f9', secondary: '#334155', accent: '#fbbf24',
      bg: '#090d16', surface: '#1e293b', surface2: '#334155',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#334155'
    }
  },
  'champagne-diamante': {
    id: 'champagne-diamante',
    name: 'Champagne & Diamante',
    category: 'Joyería y Lujo',
    light: {
      primary: '#78350f', secondary: '#fef3c7', accent: '#451a03',
      bg: '#ffffff', surface: '#faf9f6', surface2: '#fdf5e6',
      text: '#1c1917', textMuted: '#78350f', border: '#fcd34d'
    },
    dark: {
      primary: '#fbbf24', secondary: '#270e00', accent: '#f59e0b',
      bg: '#0c0703', surface: '#1d120a', surface2: '#2d1d11',
      text: '#fffbeb', textMuted: '#fdba74', border: '#5c3e09'
    }
  },
  'esmeralda-real': {
    id: 'esmeralda-real',
    name: 'Esmeralda Real',
    category: 'Joyería y Lujo',
    light: {
      primary: '#064e3b', secondary: '#d1fae5', accent: '#d97706',
      bg: '#fcfdfd', surface: '#ffffff', surface2: '#e6f4ed',
      text: '#022c22', textMuted: '#064e3b', border: '#fbbf24'
    },
    dark: {
      primary: '#34d399', secondary: '#064e3b', accent: '#f59e0b',
      bg: '#020c08', surface: '#0c221a', surface2: '#163b2f',
      text: '#ecfdf5', textMuted: '#86efac', border: '#1f4d3e'
    }
  },
  'bronce-envejecido': {
    id: 'bronce-envejecido',
    name: 'Bronce Envejecido',
    category: 'Joyería y Lujo',
    light: {
      primary: '#78350f', secondary: '#ffedd5', accent: '#451a03',
      bg: '#fdfcfb', surface: '#ffffff', surface2: '#f6ede2',
      text: '#270e00', textMuted: '#78350f', border: '#fed7aa'
    },
    dark: {
      primary: '#fdba74', secondary: '#451a03', accent: '#f97316',
      bg: '#0f0a07', surface: '#1d130e', surface2: '#2d1f18',
      text: '#ffedd5', textMuted: '#fdba74', border: '#5c240b'
    }
  },
  'opalo-mistico': {
    id: 'opalo-mistico',
    name: 'Ópalo Místico',
    category: 'Joyería y Lujo',
    light: {
      primary: '#7c3aed', secondary: '#cffafe', accent: '#f472b6',
      bg: '#fbfaff', surface: '#ffffff', surface2: '#f5f3ff',
      text: '#1e004f', textMuted: '#5c469c', border: '#a5f3fc'
    },
    dark: {
      primary: '#a78bfa', secondary: '#2e0e4e', accent: '#f472b6',
      bg: '#0b0214', surface: '#1c082f', surface2: '#2e0e4e',
      text: '#fdf4ff', textMuted: '#c4b5fd', border: '#581c78'
    }
  },
  'cuarzo-rosa': {
    id: 'cuarzo-rosa',
    name: 'Cuarzo Rosa',
    category: 'Joyería y Lujo',
    light: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#93c5fd',
      bg: '#fff7f9', surface: '#ffffff', surface2: '#fdf2f8',
      text: '#3f0721', textMuted: '#c084fc', border: '#fbcfe8'
    },
    dark: {
      primary: '#f472b6', secondary: '#4d0c27', accent: '#60a5fa',
      bg: '#140409', surface: '#2e0b17', surface2: '#471124',
      text: '#fdf2f8', textMuted: '#fda4af', border: '#471124'
    }
  },

  // ── 9. AUTOMOTRIZ Y FERRETERÍA ──
  'acero-industrial': {
    id: 'acero-industrial',
    name: 'Acero Industrial',
    category: 'Automotriz y Ferretería',
    light: {
      primary: '#334155', secondary: '#fef08a', accent: '#0f172a',
      bg: '#fafafa', surface: '#ffffff', surface2: '#f1f5f9',
      text: '#0f172a', textMuted: '#475569', border: '#facc15'
    },
    dark: {
      primary: '#facc15', secondary: '#334155', accent: '#e2e8f0',
      bg: '#090d16', surface: '#1e293b', surface2: '#334155',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#334155'
    }
  },
  'rojo-motorsport': {
    id: 'rojo-motorsport',
    name: 'Rojo Motorsport',
    category: 'Automotriz y Ferretería',
    light: {
      primary: '#dc2626', secondary: '#e2e8f0', accent: '#111827',
      bg: '#fcfcfc', surface: '#ffffff', surface2: '#f3f4f6',
      text: '#111827', textMuted: '#4b5563', border: '#cbd5e1'
    },
    dark: {
      primary: '#ef4444', secondary: '#1f2937', accent: '#f9fafb',
      bg: '#080102', surface: '#1a0407', surface2: '#2d090f',
      text: '#f9fafb', textMuted: '#9ca3af', border: '#4c0505'
    }
  },
  'asfalto-gasolina': {
    id: 'asfalto-gasolina',
    name: 'Asfalto & Gasolina',
    category: 'Automotriz y Ferretería',
    light: {
      primary: '#1e3a8a', secondary: '#cbd5e1', accent: '#1d4ed8',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#e2e8f0',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#60a5fa', secondary: '#1e293b', accent: '#2563eb',
      bg: '#040814', surface: '#0d182e', surface2: '#162b53',
      text: '#f8fafc', textMuted: '#93c5fd', border: '#162b53'
    }
  },
  'verde-maquinaria': {
    id: 'verde-maquinaria',
    name: 'Verde Maquinaria',
    category: 'Automotriz y Ferretería',
    light: {
      primary: '#14532d', secondary: '#e2e8f0', accent: '#15803d',
      bg: '#fafafa', surface: '#ffffff', surface2: '#f4f8e3',
      text: '#111827', textMuted: '#4b5563', border: '#cbd5e1'
    },
    dark: {
      primary: '#22c55e', secondary: '#1f2937', accent: '#16a34a',
      bg: '#030c06', surface: '#0c2211', surface2: '#163b1e',
      text: '#f9fafb', textMuted: '#9ca3af', border: '#1e3a1e'
    }
  },
  'cobre-conductivo': {
    id: 'cobre-conductivo',
    name: 'Cobre Conductivo',
    category: 'Automotriz y Ferretería',
    light: {
      primary: '#c2410c', secondary: '#cbd5e1', accent: '#ea580c',
      bg: '#fdfcfb', surface: '#ffffff', surface2: '#e2e8f0',
      text: '#0f172a', textMuted: '#475569', border: '#fed7aa'
    },
    dark: {
      primary: '#ea580c', secondary: '#1e293b', accent: '#f97316',
      bg: '#0f0805', surface: '#1c100a', surface2: '#2d1b11',
      text: '#ffedd5', textMuted: '#fdba74', border: '#5c240b'
    }
  },
  'titanio-carbon': {
    id: 'titanio-carbon',
    name: 'Titanio & Carbón',
    category: 'Automotriz y Ferretería',
    light: {
      primary: '#1e293b', secondary: '#fdba74', accent: '#f97316',
      bg: '#f1f5f9', surface: '#ffffff', surface2: '#e2e8f0',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#f97316', secondary: '#1e293b', accent: '#ea580c',
      bg: '#090d16', surface: '#0f172a', surface2: '#1e293b',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#1e293b'
    }
  },
  'amarillo-caterpillar': {
    id: 'amarillo-caterpillar',
    name: 'Amarillo Caterpillar',
    category: 'Automotriz y Ferretería',
    light: {
      primary: '#eab308', secondary: '#1e293b', accent: '#ca8a04',
      bg: '#fafafa', surface: '#ffffff', surface2: '#fef9c3',
      text: '#0f172a', textMuted: '#4b5563', border: '#1e293b'
    },
    dark: {
      primary: '#facc15', secondary: '#1e293b', accent: '#fde047',
      bg: '#0a0a03', surface: '#17170a', surface2: '#282710',
      text: '#fdf9c3', textMuted: '#cbd5e1', border: '#57541a'
    }
  },
  'azul-hidraulico': {
    id: 'azul-hidraulico',
    name: 'Azul Hidráulico',
    category: 'Automotriz y Ferretería',
    light: {
      primary: '#1d4ed8', secondary: '#cbd5e1', accent: '#1e40af',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#e2e8f0',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#60a5fa', secondary: '#1e293b', accent: '#3b82f6',
      bg: '#040814', surface: '#0d182e', surface2: '#162b53',
      text: '#f8fafc', textMuted: '#93c5fd', border: '#162b53'
    }
  },
  'llama-soldador': {
    id: 'llama-soldador',
    name: 'Llama de Soldador',
    category: 'Automotriz y Ferretería',
    light: {
      primary: '#2563eb', secondary: '#ffedd5', accent: '#f97316',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#eff6ff',
      text: '#1e3a8a', textMuted: '#4b5563', border: '#fed7aa'
    },
    dark: {
      primary: '#38bdf8', secondary: '#451a03', accent: '#ea580c',
      bg: '#020914', surface: '#0d223f', surface2: '#163b65',
      text: '#ecf7ff', textMuted: '#93c5fd', border: '#1e4b8a'
    }
  },
  'detallado-pro': {
    id: 'detallado-pro',
    name: 'Detallado Pro',
    category: 'Automotriz y Ferretería',
    light: {
      primary: '#111827', secondary: '#bef264', accent: '#84cc16',
      bg: '#fafafa', surface: '#ffffff', surface2: '#f3f4f6',
      text: '#111827', textMuted: '#4b5563', border: '#d9f99d'
    },
    dark: {
      primary: '#bef264', secondary: '#1f2937', accent: '#a3e635',
      bg: '#030712', surface: '#111827', surface2: '#1f2937',
      text: '#f9fafb', textMuted: '#9ca3af', border: '#374151'
    }
  },

  // ── 10. ARTE Y PAPELERÍA ──
  'papiro-historico': {
    id: 'papiro-historico',
    name: 'Papiro Histórico',
    category: 'Arte y Papelería',
    light: {
      primary: '#78350f', secondary: '#f5f5f4', accent: '#451a03',
      bg: '#fdfbf7', surface: '#ffffff', surface2: '#f6ede2',
      text: '#270e00', textMuted: '#78350f', border: '#d6d3d1'
    },
    dark: {
      primary: '#fb923c', secondary: '#78716c', accent: '#fdba74',
      bg: '#0f0a07', surface: '#1d140f', surface2: '#2f2018',
      text: '#fafaf9', textMuted: '#a8a29e', border: '#5c3a21'
    }
  },
  'acuarela-creativa': {
    id: 'acuarela-creativa',
    name: 'Acuarela Creativa',
    category: 'Arte y Papelería',
    light: {
      primary: '#06b6d4', secondary: '#fbcfe8', accent: '#fbbf24',
      bg: '#fdfbfe', surface: '#ffffff', surface2: '#fae8ff',
      text: '#0891b2', textMuted: '#a21caf', border: '#f5d0fe'
    },
    dark: {
      primary: '#22d3ee', secondary: '#f472b6', accent: '#fde047',
      bg: '#0b0214', surface: '#1c082f', surface2: '#2e0e4e',
      text: '#fdf4ff', textMuted: '#c4b5fd', border: '#581c78'
    }
  },
  'cuaderno-kraft': {
    id: 'cuaderno-kraft',
    name: 'Cuaderno Kraft',
    category: 'Arte y Papelería',
    light: {
      primary: '#7c2d12', secondary: '#e7e5e4', accent: '#1c1917',
      bg: '#fcfbf9', surface: '#ffffff', surface2: '#f5f5f4',
      text: '#1c1917', textMuted: '#44403c', border: '#d6d3d1'
    },
    dark: {
      primary: '#fdba74', secondary: '#78716c', accent: '#a8a29e',
      bg: '#0c0a09', surface: '#1c1917', surface2: '#292524',
      text: '#f5f5f4', textMuted: '#a8a29e', border: '#44403c'
    }
  },
  'pluma-estilografica': {
    id: 'pluma-estilografica',
    name: 'Pluma Estilográfica',
    category: 'Arte y Papelería',
    light: {
      primary: '#1e3a8a', secondary: '#f59e0b', accent: '#111827',
      bg: '#fcfcfc', surface: '#ffffff', surface2: '#eff6ff',
      text: '#0f172a', textMuted: '#475569', border: '#fbbf24'
    },
    dark: {
      primary: '#60a5fa', secondary: '#d97706', accent: '#f9fafb',
      bg: '#040814', surface: '#0d182e', surface2: '#162b53',
      text: '#f8fafc', textMuted: '#93c5fd', border: '#162b53'
    }
  },
  'menta-escolar': {
    id: 'menta-escolar',
    name: 'Menta Escolar',
    category: 'Arte y Papelería',
    light: {
      primary: '#059669', secondary: '#fce4ec', accent: '#9ca3af',
      bg: '#f0fdf4', surface: '#ffffff', surface2: '#d1fae5',
      text: '#064e3b', textMuted: '#059669', border: '#fbcfe8'
    },
    dark: {
      primary: '#34d399', secondary: '#3b0764', accent: '#9ca3af',
      bg: '#022c22', surface: '#064e3b', surface2: '#0f766e',
      text: '#ecfdf5', textMuted: '#a7f3d0', border: '#2b143c'
    }
  },
  'pizarra-tiza': {
    id: 'pizarra-tiza',
    name: 'Pizarra & Tiza',
    category: 'Arte y Papelería',
    light: {
      primary: '#334155', secondary: '#f8fafc', accent: '#475569',
      bg: '#fafafa', surface: '#ffffff', surface2: '#f1f5f9',
      text: '#0f172a', textMuted: '#64748b', border: '#cbd5e1'
    },
    dark: {
      primary: '#f8fafc', secondary: '#334155', accent: '#94a3b8',
      bg: '#0f172a', surface: '#1e293b', surface2: '#334155',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#334155'
    }
  },
  'pincel-oleo': {
    id: 'pincel-oleo',
    name: 'Pincel de Óleo',
    category: 'Arte y Papelería',
    light: {
      primary: '#1e3a8a', secondary: '#fcd34d', accent: '#b45309',
      bg: '#fdfcfc', surface: '#ffffff', surface2: '#fef3c7',
      text: '#0f172a', textMuted: '#4b5563', border: '#fde68a'
    },
    dark: {
      primary: '#60a5fa', secondary: '#f59e0b', accent: '#fbbf24',
      bg: '#020817', surface: '#0b162f', surface2: '#13284f',
      text: '#f8fafc', textMuted: '#93c5fd', border: '#1e3a5f'
    }
  },
  'origami-pastel': {
    id: 'origami-pastel',
    name: 'Origami Pastel',
    category: 'Arte y Papelería',
    light: {
      primary: '#f43f5e', secondary: '#e0f2fe', accent: '#a78bfa',
      bg: '#fdfbfe', surface: '#ffffff', surface2: '#ffe4e6',
      text: '#4c0519', textMuted: '#0d9488', border: '#bfdbfe'
    },
    dark: {
      primary: '#fda4af', secondary: '#0c4a6e', accent: '#c4b5fd',
      bg: '#0e0507', surface: '#1e0c10', surface2: '#2e151a',
      text: '#ffe4e6', textMuted: '#fda4af', border: '#5c1624'
    }
  },
  'tinta-comic': {
    id: 'tinta-comic',
    name: 'Tinta de Cómic',
    category: 'Arte y Papelería',
    light: {
      primary: '#111827', secondary: '#ef4444', accent: '#374151',
      bg: '#ffffff', surface: '#fafafa', surface2: '#f3f4f6',
      text: '#111827', textMuted: '#4b5563', border: '#fca5a5'
    },
    dark: {
      primary: '#f9fafb', secondary: '#ef4444', accent: '#d1d5db',
      bg: '#030712', surface: '#111827', surface2: '#1f2937',
      text: '#f9fafb', textMuted: '#9ca3af', border: '#4c0505'
    }
  },
  'bosquejo-carbon': {
    id: 'bosquejo-carbon',
    name: 'Bosquejo Carbón',
    category: 'Arte y Papelería',
    light: {
      primary: '#1f2937', secondary: '#d1d5db', accent: '#4b5563',
      bg: '#f9fafb', surface: '#ffffff', surface2: '#f3f4f6',
      text: '#111827', textMuted: '#6b7280', border: '#cbd5e1'
    },
    dark: {
      primary: '#e5e7eb', secondary: '#4b5563', accent: '#9ca3af',
      bg: '#090d16', surface: '#1f2937', surface2: '#374151',
      text: '#f9fafb', textMuted: '#cbd5e1', border: '#374151'
    }
  }
}

// Paletas temáticas de eventos estacionales
export const SEASONAL_EVENTS = {
  none: {
    id: 'none',
    name: 'Sin Evento Activo'
  },
  navidad: {
    id: 'navidad',
    name: 'Navidad 🎄',
    light: {
      primary: '#d32f2f',      // Rojo navideño
      secondary: '#388e3c',    // Verde pino
      accent: '#fbc02d',       // Dorado
      bg: '#fff9f9',
      surface: '#ffffff',
      surface2: '#ffebee',
      text: '#1b0000',
      textMuted: '#5d4037',
      border: '#ffcdd2'
    },
    dark: {
      primary: '#ef5350',
      secondary: '#4caf50',
      accent: '#ffd54f',
      bg: '#0a0505',
      surface: '#180d0d',
      surface2: '#2b1616',
      text: '#ffebee',
      textMuted: '#d7ccc8',
      border: '#5c2525'
    }
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween 🎃',
    light: {
      primary: '#f57c00',      // Naranja calabaza
      secondary: '#7b1fa2',    // Morado bruja
      accent: '#212121',       // Negro
      bg: '#fffdfb',
      surface: '#ffffff',
      surface2: '#ffe0b2',
      text: '#1b0d00',
      textMuted: '#4a148c',
      border: '#ffcc80'
    },
    dark: {
      primary: '#ff9800',
      secondary: '#9c27b0',
      accent: '#eeeeee',
      bg: '#0f0a05',
      surface: '#1c130b',
      surface2: '#2d1e11',
      text: '#ffe0b2',
      textMuted: '#e1bee7',
      border: '#6d3c0c'
    }
  },
  madre: {
    id: 'madre',
    name: 'Día de la Madre 🌸',
    light: {
      primary: '#ec407a',      // Rosado maternal
      secondary: '#f48fb1',    // Rosa pastel
      accent: '#ab47bc',       // Violeta suave
      bg: '#fff8f9',
      surface: '#ffffff',
      surface2: '#fce4ec',
      text: '#2c0012',
      textMuted: '#7b1fa2',
      border: '#f8bbd0'
    },
    dark: {
      primary: '#f48fb1',
      secondary: '#fce4ec',
      accent: '#ce93d8',
      bg: '#0f0a0c',
      surface: '#1c1115',
      surface2: '#2d1a21',
      text: '#fce4ec',
      textMuted: '#e1bee7',
      border: '#5c1e34'
    }
  },
  padre: {
    id: 'padre',
    name: 'Día del Padre 👔',
    light: {
      primary: '#0288d1',      // Azul varonil
      secondary: '#455a64',    // Gris cuero
      accent: '#00796b',       // Teal profundo
      bg: '#f4faff',
      surface: '#ffffff',
      surface2: '#e1f5fe',
      text: '#001a2c',
      textMuted: '#37474f',
      border: '#b3e5fc'
    },
    dark: {
      primary: '#29b6f6',
      secondary: '#90a4ae',
      accent: '#26a69a',
      bg: '#050a0f',
      surface: '#0b131c',
      surface2: '#13212f',
      text: '#e1f5fe',
      textMuted: '#cfd8dc',
      border: '#10304a'
    }
  },
  nino: {
    id: 'nino',
    name: 'Día del Niño 🧸',
    light: {
      primary: '#fbc02d',      // Amarillo alegre
      secondary: '#29b6f6',    // Celeste infantil
      accent: '#ec407a',       // Rosa chicle
      bg: '#fffdf4',
      surface: '#ffffff',
      surface2: '#fffde7',
      text: '#2e2300',
      textMuted: '#0277bd',
      border: '#fff59d'
    },
    dark: {
      primary: '#fdd835',
      secondary: '#4fc3f7',
      accent: '#f06292',
      bg: '#0a0a04',
      surface: '#17170a',
      surface2: '#282710',
      text: '#fffde7',
      textMuted: '#81d4fa',
      border: '#57541a'
    }
  },
  amistad: {
    id: 'amistad',
    name: 'Amor y Amistad ❤️',
    light: {
      primary: '#e91e63',      // Rojo pasión / fucsia
      secondary: '#f48fb1',    // Rosa suave
      accent: '#9c27b0',       // Morado amor
      bg: '#fff5f7',
      surface: '#ffffff',
      surface2: '#ffe4e8',
      text: '#2c000b',
      textMuted: '#880e4f',
      border: '#ffccd5'
    },
    dark: {
      primary: '#f48fb1',
      secondary: '#ffccd5',
      accent: '#e040fb',
      bg: '#0f0507',
      surface: '#1c0c10',
      surface2: '#2d1419',
      text: '#ffe4e8',
      textMuted: '#f48fb1',
      border: '#5c1b27'
    }
  },
  verano: {
    id: 'verano',
    name: 'Verano ☀️',
    light: {
      primary: '#ffeb3b',      // Amarillo sol
      secondary: '#00bcd4',    // Turquesa playa
      accent: '#ff9800',       // Naranja cálido
      bg: '#fffff0',
      surface: '#ffffff',
      surface2: '#e0f7fa',
      text: '#2c2c00',
      textMuted: '#006064',
      border: '#fff9c4'
    },
    dark: {
      primary: '#fdd835',
      secondary: '#4dd0e1',
      accent: '#fb8c00',
      bg: '#0a0a00',
      surface: '#17170b',
      surface2: '#12252a',
      text: '#fffff0',
      textMuted: '#80deea',
      border: '#4a4a15'
    }
  },
  semanasanta: {
    id: 'semanasanta',
    name: 'Semana Santa 🌾',
    light: {
      primary: '#673ab7',      // Morado eclesiástico
      secondary: '#eae6df',    // Blanco lino
      accent: '#ffb300',       // Oro
      bg: '#fafafa',
      surface: '#ffffff',
      surface2: '#ede7f6',
      text: '#1a0033',
      textMuted: '#5e35b1',
      border: '#d1c4e9'
    },
    dark: {
      primary: '#9575cd',
      secondary: '#424242',
      accent: '#ffca28',
      bg: '#0c0a0f',
      surface: '#120f18',
      surface2: '#1c1725',
      text: '#ede7f6',
      textMuted: '#b39ddb',
      border: '#3c3252'
    }
  },
  mascota: {
    id: 'mascota',
    name: 'Día de la Mascota 🐾',
    light: {
      primary: '#8d6e63',      // Café cálido / Huella
      secondary: '#d7ccc8',    // Hueso / Beige suave
      accent: '#ffb74d',       // Naranja juguetón
      bg: '#faf8f6',
      surface: '#ffffff',
      surface2: '#efebe9',
      text: '#3e2723',
      textMuted: '#5d4037',
      border: '#d7ccc8'
    },
    dark: {
      primary: '#a1887f',
      secondary: '#4e342e',
      accent: '#ffa726',
      bg: '#0f0c0b',
      surface: '#1c1715',
      surface2: '#2d221e',
      text: '#efebe9',
      textMuted: '#d7ccc8',
      border: '#5c4033'
    }
  },
  'custom-brand': {
    id: 'custom-brand',
    name: 'Tema Personalizado',
    light: {
      primary: 'var(--color-primary-custom, #0ea5e9)',
      secondary: 'var(--color-secondary-custom, #3b82f6)',
      accent: 'var(--color-primary-custom, #0ea5e9)',
      bg: 'var(--color-bg-custom, #ffffff)',
      surface: 'var(--color-surface-custom, #f8fafc)',
      surface2: 'var(--color-surface-2-custom, #f1f5f9)',
      text: 'var(--color-text-custom, #0f172a)',
      textMuted: '#64748b',
      border: 'var(--color-border-custom, #e2e8f0)'
    },
    dark: {
      primary: 'var(--color-primary-custom, #0ea5e9)',
      secondary: 'var(--color-secondary-custom, #3b82f6)',
      accent: 'var(--color-primary-custom, #0ea5e9)',
      bg: 'var(--color-bg-custom-dark, #080f1e)',
      surface: 'var(--color-surface-custom-dark, #0d1a2e)',
      surface2: 'var(--color-surface-2-custom-dark, #112238)',
      text: 'var(--color-text-custom-dark, #f0f7ff)',
      textMuted: '#cbd5e1',
      border: 'var(--color-border-custom-dark, #1e3a5f)'
    }
  }
}

// Convertir las paletas estáticas a formato de inyección
export function getActiveColors(themeConfig, isDarkMode, activeSeasonalEvent = 'none') {
  let baseColors = null;

  // Priorizar el evento de temporada si está activo y existe
  if (activeSeasonalEvent && activeSeasonalEvent !== 'none' && SEASONAL_EVENTS[activeSeasonalEvent]) {
    const eventPalette = SEASONAL_EVENTS[activeSeasonalEvent];
    baseColors = isDarkMode ? eventPalette.dark : eventPalette.light;
  }

  // Fallback a la paleta normal de la tienda si no hay evento activo
  if (!baseColors) {
    if (typeof themeConfig === 'string') {
      const palette = ADVANCED_PALETTES[themeConfig] || ADVANCED_PALETTES['rosa-elegante'];
      baseColors = isDarkMode ? palette.dark : palette.light;
    } else if (themeConfig && typeof themeConfig === 'object') {
      baseColors = isDarkMode 
        ? (themeConfig.dark || themeConfig.light || themeConfig) 
        : (themeConfig.light || themeConfig);
    }
  }

  // Fallback de seguridad final
  if (!baseColors) {
    baseColors = ADVANCED_PALETTES['carbon-oscuro'].light;
  }

  return {
    '--color-primary': baseColors.primary || '#e91e8c',
    '--color-primary-light': baseColors.secondary || '#f48fb1',
    '--color-primary-dark': baseColors.accent || '#ff4081',
    '--color-secondary': baseColors.secondary || '#f8bbd9',
    '--color-accent': baseColors.accent || '#ff4081',
    '--color-bg': baseColors.bg || (isDarkMode ? DEFAULT_DARK_BG : DEFAULT_LIGHT_BG),
    '--color-surface': baseColors.surface || (isDarkMode ? DEFAULT_DARK_SURFACE : DEFAULT_LIGHT_SURFACE),
    '--color-surface-2': baseColors.surface2 || (isDarkMode ? DEFAULT_DARK_SURFACE_2 : DEFAULT_LIGHT_SURFACE_2),
    '--color-text': baseColors.text || (isDarkMode ? DEFAULT_DARK_TEXT : DEFAULT_LIGHT_TEXT),
    '--color-text-muted': baseColors.textMuted || (isDarkMode ? DEFAULT_DARK_TEXT_MUTED : DEFAULT_LIGHT_TEXT_MUTED),
    '--color-border': baseColors.border || (isDarkMode ? DEFAULT_DARK_BORDER : DEFAULT_LIGHT_BORDER)
  }
}
