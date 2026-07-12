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
  
  // ── 11. INSUMOS Y REPUESTOS AGRÍCOLAS ──
  'green-cultivo': {
    id: 'green-cultivo',
    name: 'Green Cultivo',
    category: 'Insumos y Repuestos Agrícolas',
    light: {
      primary: '#15803d', secondary: '#86efac', accent: '#166534',
      bg: '#f4faf5', surface: '#ffffff', surface2: '#e8f5e9',
      text: '#0c2310', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#15803d', secondary: '#86efac', accent: '#86efac',
      bg: '#051608', surface: '#0a2410', surface2: '#12371b',
      text: '#f0fdf4', textMuted: '#a7f3d0', border: '#114421'
    }
  },
  'earth-fertilizer': {
    id: 'earth-fertilizer',
    name: 'Earth Fertilizer',
    category: 'Insumos y Repuestos Agrícolas',
    light: {
      primary: '#b45309', secondary: '#fde047', accent: '#78350f',
      bg: '#fffdf6', surface: '#ffffff', surface2: '#fef3c7',
      text: '#3c1800', textMuted: '#78350f', border: '#fcd34d'
    },
    dark: {
      primary: '#b45309', secondary: '#fbbf24', accent: '#fbbf24',
      bg: '#160e03', surface: '#281a07', surface2: '#3d280b',
      text: '#fffbeb', textMuted: '#fdba74', border: '#4c2602'
    }
  },
  'harvest-gold': {
    id: 'harvest-gold',
    name: 'Harvest Gold',
    category: 'Insumos y Repuestos Agrícolas',
    light: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#854d0e',
      bg: '#fdfcf7', surface: '#ffffff', surface2: '#fef9c3',
      text: '#3a2e05', textMuted: '#715809', border: '#fef08a'
    },
    dark: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#fef08a',
      bg: '#141203', surface: '#242008', surface2: '#35300d',
      text: '#fefdf0', textMuted: '#fde047', border: '#4f440a'
    }
  },
  'coffee-plantation': {
    id: 'coffee-plantation',
    name: 'Coffee Plantation',
    category: 'Insumos y Repuestos Agrícolas',
    light: {
      primary: '#78350f', secondary: '#d97706', accent: '#4f1a00',
      bg: '#fdfaf7', surface: '#ffffff', surface2: '#f6ede2',
      text: '#2d0f00', textMuted: '#6b3718', border: '#f5d0a9'
    },
    dark: {
      primary: '#4f1a00', secondary: '#d97706', accent: '#d97706',
      bg: '#0f0701', surface: '#1c0f04', surface2: '#2f1b0b',
      text: '#fef6f0', textMuted: '#fdba74', border: '#4a2503'
    }
  },
  'fresh-eucalyptus': {
    id: 'fresh-eucalyptus',
    name: 'Fresh Eucalyptus',
    category: 'Insumos y Repuestos Agrícolas',
    light: {
      primary: '#0f766e', secondary: '#99f6e4', accent: '#115e59',
      bg: '#f2faf8', surface: '#ffffff', surface2: '#e6f4f2',
      text: '#042f2e', textMuted: '#0f766e', border: '#99f6e4'
    },
    dark: {
      primary: '#0f766e', secondary: '#99f6e4', accent: '#99f6e4',
      bg: '#031210', surface: '#0a231f', surface2: '#123731',
      text: '#f0fdfa', textMuted: '#99f6e4', border: '#114a42'
    }
  },
  'tractor-orange': {
    id: 'tractor-orange',
    name: 'Tractor Orange',
    category: 'Insumos y Repuestos Agrícolas',
    light: {
      primary: '#ea580c', secondary: '#ffedd5', accent: '#c2410c',
      bg: '#fffaf8', surface: '#ffffff', surface2: '#ffebe0',
      text: '#3b1202', textMuted: '#853208', border: '#ffd8c2'
    },
    dark: {
      primary: '#ea580c', secondary: '#ffedd5', accent: '#ffedd5',
      bg: '#150802', surface: '#2b1005', surface2: '#3f180a',
      text: '#fff7ed', textMuted: '#ffedd5', border: '#5c1d07'
    }
  },
  'mud-clay': {
    id: 'mud-clay',
    name: 'Mud Clay',
    category: 'Insumos y Repuestos Agrícolas',
    light: {
      primary: '#7c2d12', secondary: '#ffedd5', accent: '#9a3412',
      bg: '#fffbf9', surface: '#ffffff', surface2: '#ffede5',
      text: '#2e0b02', textMuted: '#6b200b', border: '#ffdac9'
    },
    dark: {
      primary: '#7c2d12', secondary: '#ffedd5', accent: '#ffedd5',
      bg: '#140905', surface: '#28130b', surface2: '#3b1e13',
      text: '#fff8f6', textMuted: '#ffedd5', border: '#4f1a0a'
    }
  },
  'silos-steel': {
    id: 'silos-steel',
    name: 'Silos Steel',
    category: 'Insumos y Repuestos Agrícolas',
    light: {
      primary: '#475569', secondary: '#cbd5e1', accent: '#334155',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#475569', secondary: '#cbd5e1', accent: '#cbd5e1',
      bg: '#0f172a', surface: '#1e293b', surface2: '#334155',
      text: '#f8fafc', textMuted: '#94a3b8', border: '#334155'
    }
  },
  'amazonas-moss': {
    id: 'amazonas-moss',
    name: 'Amazonas Moss',
    category: 'Insumos y Repuestos Agrícolas',
    light: {
      primary: '#166534', secondary: '#bbf7d0', accent: '#14532d',
      bg: '#f5faf6', surface: '#ffffff', surface2: '#e8f7ed',
      text: '#0b2e17', textMuted: '#166534', border: '#bbf7d0'
    },
    dark: {
      primary: '#166534', secondary: '#bbf7d0', accent: '#bbf7d0',
      bg: '#041107', surface: '#0d2412', surface2: '#163a1e',
      text: '#f0fdf4', textMuted: '#bbf7d0', border: '#1b4d27'
    }
  },
  'tropical-sun': {
    id: 'tropical-sun',
    name: 'Tropical Sun',
    category: 'Insumos y Repuestos Agrícolas',
    light: {
      primary: '#eab308', secondary: '#fef9c3', accent: '#ca8a04',
      bg: '#fffef6', surface: '#ffffff', surface2: '#fefcd6',
      text: '#3b2f02', textMuted: '#eab308', border: '#fef9c3'
    },
    dark: {
      primary: '#eab308', secondary: '#fef9c3', accent: '#fef9c3',
      bg: '#141103', surface: '#282207', surface2: '#3c340d',
      text: '#fefdf0', textMuted: '#fde047', border: '#574c0a'
    }
  },

  // ── 12. ALIMENTOS ARTESANALES Y REPOSTERÍA ──
  'sweet-berry': {
    id: 'sweet-berry',
    name: 'Sweet Berry',
    category: 'Alimentos Artesanales y Repostería',
    light: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#be123c',
      bg: '#fffafc', surface: '#ffffff', surface2: '#ffeef5',
      text: '#37061a', textMuted: '#9d174d', border: '#fbcfe8'
    },
    dark: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#fbcfe8',
      bg: '#190410', surface: '#2a0a1d', surface2: '#3d122b',
      text: '#fff1f2', textMuted: '#fbcfe8', border: '#5c0f3c'
    }
  },
  'honey-glaze': {
    id: 'honey-glaze',
    name: 'Honey Glaze',
    category: 'Alimentos Artesanales y Repostería',
    light: {
      primary: '#d97706', secondary: '#fde047', accent: '#b45309',
      bg: '#fffdf9', surface: '#ffffff', surface2: '#fef7d5',
      text: '#331b00', textMuted: '#854d0e', border: '#fde047'
    },
    dark: {
      primary: '#d97706', secondary: '#fde047', accent: '#fde047',
      bg: '#140d04', surface: '#241a0b', surface2: '#372914',
      text: '#fefdf5', textMuted: '#fde047', border: '#4c2d08'
    }
  },
  'warm-cocoa': {
    id: 'warm-cocoa',
    name: 'Warm Cocoa',
    category: 'Alimentos Artesanales y Repostería',
    light: {
      primary: '#7c2d12', secondary: '#fdba74', accent: '#451a03',
      bg: '#fdfcfb', surface: '#ffffff', surface2: '#f6ede2',
      text: '#270e00', textMuted: '#78350f', border: '#fed7aa'
    },
    dark: {
      primary: '#7c2d12', secondary: '#fdba74', accent: '#fdba74',
      bg: '#140803', surface: '#281309', surface2: '#3b1e12',
      text: '#fffbeb', textMuted: '#fdba74', border: '#4f1a0a'
    }
  },
  'vanilla-cream': {
    id: 'vanilla-cream',
    name: 'Vanilla Cream',
    category: 'Alimentos Artesanales y Repostería',
    light: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#a16207',
      bg: '#fffef9', surface: '#ffffff', surface2: '#fefad7',
      text: '#332301', textMuted: '#715005', border: '#fde047'
    },
    dark: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#fef08a',
      bg: '#161305', surface: '#25200b', surface2: '#373013',
      text: '#fffbeb', textMuted: '#fde047', border: '#4f430c'
    }
  },
  'strawberry-glaze': {
    id: 'strawberry-glaze',
    name: 'Strawberry Glaze',
    category: 'Alimentos Artesanales y Repostería',
    light: {
      primary: '#e11d48', secondary: '#ffe4e6', accent: '#be123c',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffe4e6',
      text: '#3f000b', textMuted: '#9f1239', border: '#ffd3d8'
    },
    dark: {
      primary: '#e11d48', secondary: '#ffe4e6', accent: '#ffe4e6',
      bg: '#1c0307', surface: '#350b14', surface2: '#4e1422',
      text: '#fff1f2', textMuted: '#fda4af', border: '#6e1124'
    }
  },
  'mint-frosting': {
    id: 'mint-frosting',
    name: 'Mint Frosting',
    category: 'Alimentos Artesanales y Repostería',
    light: {
      primary: '#0d9488', secondary: '#ccfbf1', accent: '#0f766e',
      bg: '#f2fbf9', surface: '#ffffff', surface2: '#e2faf5',
      text: '#032a26', textMuted: '#0d9488', border: '#ccfbf1'
    },
    dark: {
      primary: '#0d9488', secondary: '#ccfbf1', accent: '#ccfbf1',
      bg: '#021110', surface: '#092522', surface2: '#113b37',
      text: '#f2fbf9', textMuted: '#99f6e4', border: '#114a42'
    }
  },
  'caramel-crepe': {
    id: 'caramel-crepe',
    name: 'Caramel Crepe',
    category: 'Alimentos Artesanales y Repostería',
    light: {
      primary: '#b45309', secondary: '#ffedd5', accent: '#92400e',
      bg: '#fffdfb', surface: '#ffffff', surface2: '#ffe9cd',
      text: '#2f1201', textMuted: '#7c3a0b', border: '#fed7aa'
    },
    dark: {
      primary: '#b45309', secondary: '#ffedd5', accent: '#ffedd5',
      bg: '#170b02', surface: '#2e1809', surface2: '#452613',
      text: '#fffcf9', textMuted: '#fdba74', border: '#5c2a08'
    }
  },
  'blueberry-custard': {
    id: 'blueberry-custard',
    name: 'Blueberry Custard',
    category: 'Alimentos Artesanales y Repostería',
    light: {
      primary: '#2563eb', secondary: '#dbeafe', accent: '#1d4ed8',
      bg: '#f7faff', surface: '#ffffff', surface2: '#e5efff',
      text: '#0b2053', textMuted: '#2563eb', border: '#dbeafe'
    },
    dark: {
      primary: '#2563eb', secondary: '#dbeafe', accent: '#dbeafe',
      bg: '#070c1e', surface: '#121b36', surface2: '#1d2b54',
      text: '#f0f5ff', textMuted: '#93c5fd', border: '#1e3e7f'
    }
  },
  'pastel-pistachio': {
    id: 'pastel-pistachio',
    name: 'Pastel Pistachio',
    category: 'Alimentos Artesanales y Repostería',
    light: {
      primary: '#16a34a', secondary: '#dcfce7', accent: '#15803d',
      bg: '#f5fbf7', surface: '#ffffff', surface2: '#e2fbe9',
      text: '#0b3517', textMuted: '#16a34a', border: '#dcfce7'
    },
    dark: {
      primary: '#16a34a', secondary: '#dcfce7', accent: '#dcfce7',
      bg: '#061208', surface: '#0e2513', surface2: '#173a20',
      text: '#f0fdf4', textMuted: '#86efac', border: '#155c27'
    }
  },
  'gourmet-plum': {
    id: 'gourmet-plum',
    name: 'Gourmet Plum',
    category: 'Alimentos Artesanales y Repostería',
    light: {
      primary: '#701a75', secondary: '#fdf4ff', accent: '#4a044e',
      bg: '#fcf8fd', surface: '#ffffff', surface2: '#fae8ff',
      text: '#220025', textMuted: '#701a75', border: '#f3d8ff'
    },
    dark: {
      primary: '#701a75', secondary: '#fdf4ff', accent: '#fdf4ff',
      bg: '#140316', surface: '#280c2b', surface2: '#3d1641',
      text: '#fdf4ff', textMuted: '#f5d0fe', border: '#581a5e'
    }
  },

  // ── 13. FERRETERÍA Y CONSTRUCCIÓN RURAL ──
  'steel-tool': {
    id: 'steel-tool',
    name: 'Steel Tool',
    category: 'Ferretería y Construcción Rural',
    light: {
      primary: '#475569', secondary: '#cbd5e1', accent: '#334155',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#475569', secondary: '#cbd5e1', accent: '#cbd5e1',
      bg: '#0f172a', surface: '#1e293b', surface2: '#334155',
      text: '#f8fafc', textMuted: '#94a3b8', border: '#334155'
    }
  },
  'oxide-rust-rural': {
    id: 'oxide-rust-rural',
    name: 'Oxide Rust',
    category: 'Ferretería y Construcción Rural',
    light: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#a16207',
      bg: '#fffef9', surface: '#ffffff', surface2: '#fef9c3',
      text: '#332301', textMuted: '#715005', border: '#fde047'
    },
    dark: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#fef08a',
      bg: '#141103', surface: '#25200b', surface2: '#373013',
      text: '#fefdf0', textMuted: '#fde047', border: '#4f430c'
    }
  },
  'safety-zinc': {
    id: 'safety-zinc',
    name: 'Safety Zinc',
    category: 'Ferretería y Construcción Rural',
    light: {
      primary: '#0284c7', secondary: '#bae6fd', accent: '#0369a1',
      bg: '#f4faff', surface: '#ffffff', surface2: '#e0f2fe',
      text: '#032c45', textMuted: '#0284c7', border: '#bae6fd'
    },
    dark: {
      primary: '#0284c7', secondary: '#bae6fd', accent: '#bae6fd',
      bg: '#060f1b', surface: '#0f1c30', surface2: '#1a2e4e',
      text: '#f0f9ff', textMuted: '#bae6fd', border: '#103a61'
    }
  },
  'brick-mortar': {
    id: 'brick-mortar',
    name: 'Brick Mortar',
    category: 'Ferretería y Construcción Rural',
    light: {
      primary: '#b91c1c', secondary: '#fca5a5', accent: '#991b1b',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffebeb',
      text: '#3b0606', textMuted: '#991b1b', border: '#fca5a5'
    },
    dark: {
      primary: '#b91c1c', secondary: '#fca5a5', accent: '#fca5a5',
      bg: '#1a0505', surface: '#2f0f0f', surface2: '#471a1a',
      text: '#fff5f5', textMuted: '#fecdd3', border: '#701c1c'
    }
  },
  'asphalt-matte-rural': {
    id: 'asphalt-matte-rural',
    name: 'Asphalt Matte',
    category: 'Ferretería y Construcción Rural',
    light: {
      primary: '#1f2937', secondary: '#9ca3af', accent: '#111827',
      bg: '#f9fafb', surface: '#ffffff', surface2: '#f3f4f6',
      text: '#111827', textMuted: '#4b5563', border: '#cbd5e1'
    },
    dark: {
      primary: '#1f2937', secondary: '#9ca3af', accent: '#d1d5db',
      bg: '#090d16', surface: '#151e2b', surface2: '#222f42',
      text: '#f9fafb', textMuted: '#9ca3af', border: '#1e293b'
    }
  },
  'industrial-amber-rural': {
    id: 'industrial-amber-rural',
    name: 'Industrial Amber',
    category: 'Ferretería y Construcción Rural',
    light: {
      primary: '#f59e0b', secondary: '#fef3c7', accent: '#d97706',
      bg: '#fffdf6', surface: '#ffffff', surface2: '#fef3c7',
      text: '#3a2200', textMuted: '#b45309', border: '#fcd34d'
    },
    dark: {
      primary: '#f59e0b', secondary: '#fef3c7', accent: '#fef3c7',
      bg: '#151004', surface: '#281f0b', surface2: '#3c3014',
      text: '#fefdf0', textMuted: '#fcd34d', border: '#5c450c'
    }
  },
  'copper-oxide-rural': {
    id: 'copper-oxide-rural',
    name: 'Copper Oxide',
    category: 'Ferretería y Construcción Rural',
    light: {
      primary: '#ea580c', secondary: '#ffedd5', accent: '#c2410c',
      bg: '#fffbf9', surface: '#ffffff', surface2: '#ffede5',
      text: '#3b1202', textMuted: '#a33d0b', border: '#ffd8c2'
    },
    dark: {
      primary: '#ea580c', secondary: '#ffedd5', accent: '#ffedd5',
      bg: '#170a04', surface: '#2d150b', surface2: '#432314',
      text: '#fff7ed', textMuted: '#ffedd5', border: '#5c2409'
    }
  },
  'forest-fence': {
    id: 'forest-fence',
    name: 'Forest Fence',
    category: 'Ferretería y Construcción Rural',
    light: {
      primary: '#15803d', secondary: '#bbf7d0', accent: '#166534',
      bg: '#f5faf6', surface: '#ffffff', surface2: '#e8f7ed',
      text: '#0b2e17', textMuted: '#15803d', border: '#bbf7d0'
    },
    dark: {
      primary: '#15803d', secondary: '#bbf7d0', accent: '#bbf7d0',
      bg: '#041207', surface: '#0d2514', surface2: '#173c21',
      text: '#f0fdf4', textMuted: '#bbf7d0', border: '#1b4d29'
    }
  },
  'clay-tile': {
    id: 'clay-tile',
    name: 'Clay Tile',
    category: 'Ferretería y Construcción Rural',
    light: {
      primary: '#c2410c', secondary: '#fdba74', accent: '#9a3412',
      bg: '#fffaf8', surface: '#ffffff', surface2: '#ffebd9',
      text: '#2e0a01', textMuted: '#9a3412', border: '#fdd0a2'
    },
    dark: {
      primary: '#c2410c', secondary: '#fdba74', accent: '#fdba74',
      bg: '#170a04', surface: '#2e160e', surface2: '#452317',
      text: '#fffaf0', textMuted: '#fdba74', border: '#5c2512'
    }
  },
  'concrete-core': {
    id: 'concrete-core',
    name: 'Concrete Core',
    category: 'Ferretería y Construcción Rural',
    light: {
      primary: '#374151', secondary: '#d1d5db', accent: '#1f2937',
      bg: '#f9fafb', surface: '#ffffff', surface2: '#f3f4f6',
      text: '#111827', textMuted: '#4b5563', border: '#cbd5e1'
    },
    dark: {
      primary: '#374151', secondary: '#d1d5db', accent: '#d1d5db',
      bg: '#0b0f19', surface: '#151b29', surface2: '#222c41',
      text: '#f3f4f6', textMuted: '#d1d5db', border: '#222f42'
    }
  },

  // ── 14. REPUESTOS Y ACCESORIOS DE MOTOS ──
  'moto-racing': {
    id: 'moto-racing',
    name: 'Moto Racing',
    category: 'Repuestos y Accesorios de Motos',
    light: {
      primary: '#ef4444', secondary: '#fca5a5', accent: '#b91c1c',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffebeb',
      text: '#3d0909', textMuted: '#b91c1c', border: '#ffd2d2'
    },
    dark: {
      primary: '#ef4444', secondary: '#fca5a5', accent: '#fca5a5',
      bg: '#150505', surface: '#2b0f0f', surface2: '#411919',
      text: '#fff5f5', textMuted: '#fca5a5', border: '#611a1a'
    }
  },
  'carbon-fiber-moto': {
    id: 'carbon-fiber-moto',
    name: 'Carbon Fiber',
    category: 'Repuestos y Accesorios de Motos',
    light: {
      primary: '#3f3f46', secondary: '#a1a1aa', accent: '#18181b',
      bg: '#fafafa', surface: '#ffffff', surface2: '#f4f4f5',
      text: '#18181b', textMuted: '#71717a', border: '#e4e4e7'
    },
    dark: {
      primary: '#3f3f46', secondary: '#a1a1aa', accent: '#a1a1aa',
      bg: '#09090b', surface: '#18181b', surface2: '#27272a',
      text: '#fafafa', textMuted: '#a1a1aa', border: '#3f3f46'
    }
  },
  'nitrous-blue': {
    id: 'nitrous-blue',
    name: 'Nitrous Blue',
    category: 'Repuestos y Accesorios de Motos',
    light: {
      primary: '#2563eb', secondary: '#93c5fd', accent: '#1d4ed8',
      bg: '#f6faff', surface: '#ffffff', surface2: '#e5efff',
      text: '#0b2053', textMuted: '#2563eb', border: '#dbeafe'
    },
    dark: {
      primary: '#2563eb', secondary: '#93c5fd', accent: '#93c5fd',
      bg: '#0a1128', surface: '#132145', surface2: '#1d3263',
      text: '#f0fdfb', textMuted: '#93c5fd', border: '#1e3f88'
    }
  },
  'slick-asphalt': {
    id: 'slick-asphalt',
    name: 'Slick Asphalt',
    category: 'Repuestos y Accesorios de Motos',
    light: {
      primary: '#18181b', secondary: '#71717a', accent: '#09090b',
      bg: '#fafafa', surface: '#ffffff', surface2: '#f4f4f5',
      text: '#09090b', textMuted: '#52525b', border: '#e4e4e7'
    },
    dark: {
      primary: '#18181b', secondary: '#71717a', accent: '#71717a',
      bg: '#040405', surface: '#121215', surface2: '#1d1d22',
      text: '#f4f4f5', textMuted: '#a1a1aa', border: '#27272a'
    }
  },
  'neon-brake': {
    id: 'neon-brake',
    name: 'Neon Brake',
    category: 'Repuestos y Accesorios de Motos',
    light: {
      primary: '#f97316', secondary: '#fed7aa', accent: '#ea580c',
      bg: '#fffcf9', surface: '#ffffff', surface2: '#ffefe0',
      text: '#3b1201', textMuted: '#ea580c', border: '#ffd8b3'
    },
    dark: {
      primary: '#f97316', secondary: '#fed7aa', accent: '#fed7aa',
      bg: '#160c04', surface: '#2b1a0e', surface2: '#3f2817',
      text: '#fffaf0', textMuted: '#fed7aa', border: '#5c2d09'
    }
  },
  'chain-lubricant': {
    id: 'chain-lubricant',
    name: 'Chain Lubricant',
    category: 'Repuestos y Accesorios de Motos',
    light: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#854d0e',
      bg: '#fffef9', surface: '#ffffff', surface2: '#fefad7',
      text: '#332301', textMuted: '#715005', border: '#fde047'
    },
    dark: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#fef08a',
      bg: '#161305', surface: '#2d250d', surface2: '#3f3517',
      text: '#fefdf0', textMuted: '#fde047', border: '#57480a'
    }
  },
  'chassis-gray': {
    id: 'chassis-gray',
    name: 'Chassis Gray',
    category: 'Repuestos y Accesorios de Motos',
    light: {
      primary: '#52525b', secondary: '#d4d4d8', accent: '#3f3f46',
      bg: '#fbfbfb', surface: '#ffffff', surface2: '#f4f4f5',
      text: '#18181b', textMuted: '#52525b', border: '#e4e4e7'
    },
    dark: {
      primary: '#52525b', secondary: '#d4d4d8', accent: '#d4d4d8',
      bg: '#0e0e11', surface: '#1b1b21', surface2: '#272730',
      text: '#f4f4f5', textMuted: '#d4d4d8', border: '#3f3f46'
    }
  },
  'laser-exhaust': {
    id: 'laser-exhaust',
    name: 'Laser Exhaust',
    category: 'Repuestos y Accesorios de Motos',
    light: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#be123c',
      bg: '#fffafc', surface: '#ffffff', surface2: '#ffeef5',
      text: '#37061a', textMuted: '#9d174d', border: '#fbcfe8'
    },
    dark: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#fbcfe8',
      bg: '#180410', surface: '#2c0c1e', surface2: '#3f162e',
      text: '#fff1f2', textMuted: '#fbcfe8', border: '#5c0f41'
    }
  },
  'chrome-rim': {
    id: 'chrome-rim',
    name: 'Chrome Rim',
    category: 'Repuestos y Accesorios de Motos',
    light: {
      primary: '#64748b', secondary: '#e2e8f0', accent: '#475569',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
      text: '#0f172a', textMuted: '#64748b', border: '#e2e8f0'
    },
    dark: {
      primary: '#64748b', secondary: '#e2e8f0', accent: '#e2e8f0',
      bg: '#0f1524', surface: '#1d2639', surface2: '#2b3852',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#253556'
    }
  },
  'yamaha-cyan': {
    id: 'yamaha-cyan',
    name: 'Yamaha Cyan',
    category: 'Repuestos y Accesorios de Motos',
    light: {
      primary: '#06b6d4', secondary: '#a5f3fc', accent: '#0891b2',
      bg: '#f0fdfd', surface: '#ffffff', surface2: '#dcfafc',
      text: '#022d35', textMuted: '#06b6d4', border: '#a5f3fc'
    },
    dark: {
      primary: '#06b6d4', secondary: '#a5f3fc', accent: '#a5f3fc',
      bg: '#031316', surface: '#0d252b', surface2: '#163b45',
      text: '#ecfeff', textMuted: '#67e8f9', border: '#124855'
    }
  },

  // ── 15. SUMINISTROS DE BELLEZA PROFESIONAL ──
  'glam-pink': {
    id: 'glam-pink',
    name: 'Glam Pink',
    category: 'Suministros de Belleza Profesional',
    light: {
      primary: '#ec4899', secondary: '#fbcfe8', accent: '#db2777',
      bg: '#fffafc', surface: '#ffffff', surface2: '#ffeef5',
      text: '#3c0022', textMuted: '#c084fc', border: '#fce7f3'
    },
    dark: {
      primary: '#ec4899', secondary: '#fbcfe8', accent: '#fbcfe8',
      bg: '#170511', surface: '#2e0d23', surface2: '#431934',
      text: '#fdf2f8', textMuted: '#fbcfe8', border: '#5c1240'
    }
  },
  'orchid-violet': {
    id: 'orchid-violet',
    name: 'Orchid Violet',
    category: 'Suministros de Belleza Profesional',
    light: {
      primary: '#a855f7', secondary: '#e9d5ff', accent: '#7c3aed',
      bg: '#fbf9ff', surface: '#ffffff', surface2: '#f3e8ff',
      text: '#220038', textMuted: '#7c3aed', border: '#e9d5ff'
    },
    dark: {
      primary: '#a855f7', secondary: '#e9d5ff', accent: '#e9d5ff',
      bg: '#0f0518', surface: '#200d30', surface2: '#311947',
      text: '#faf5ff', textMuted: '#d8b4fe', border: '#4f1a6f'
    }
  },
  'ruby-lipstick': {
    id: 'ruby-lipstick',
    name: 'Ruby Lipstick',
    category: 'Suministros de Belleza Profesional',
    light: {
      primary: '#e11d48', secondary: '#ffe4e6', accent: '#be123c',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffe4e6',
      text: '#3f000b', textMuted: '#9f1239', border: '#ffd3d8'
    },
    dark: {
      primary: '#e11d48', secondary: '#ffe4e6', accent: '#ffe4e6',
      bg: '#1c0307', surface: '#350b14', surface2: '#4e1422',
      text: '#fff1f2', textMuted: '#fda4af', border: '#6e1124'
    }
  },
  'golden-glow': {
    id: 'golden-glow',
    name: 'Golden Glow',
    category: 'Suministros de Belleza Profesional',
    light: {
      primary: '#ca8a04', secondary: '#fde047', accent: '#854d0e',
      bg: '#fffdf5', surface: '#ffffff', surface2: '#fff9cf',
      text: '#3a2a00', textMuted: '#854d0e', border: '#fcd34d'
    },
    dark: {
      primary: '#ca8a04', secondary: '#fde047', accent: '#fde047',
      bg: '#161205', surface: '#2d240d', surface2: '#3f3417',
      text: '#fffdf5', textMuted: '#fde047', border: '#57470a'
    }
  },
  'soft-lavender-beauty': {
    id: 'soft-lavender-beauty',
    name: 'Soft Lavender',
    category: 'Suministros de Belleza Profesional',
    light: {
      primary: '#c084fc', secondary: '#f3e8ff', accent: '#a855f7',
      bg: '#fbf9ff', surface: '#ffffff', surface2: '#f5edff',
      text: '#2d004d', textMuted: '#a855f7', border: '#e9d5ff'
    },
    dark: {
      primary: '#c084fc', secondary: '#f3e8ff', accent: '#f3e8ff',
      bg: '#150b24', surface: '#281640', surface2: '#3c245c',
      text: '#faf5ff', textMuted: '#d8b4fe', border: '#4c256e'
    }
  },
  'ocean-nail': {
    id: 'ocean-nail',
    name: 'Ocean Nail',
    category: 'Suministros de Belleza Profesional',
    light: {
      primary: '#06b6d4', secondary: '#cffafe', accent: '#0891b2',
      bg: '#f0fdfd', surface: '#ffffff', surface2: '#dcfafc',
      text: '#022d35', textMuted: '#06b6d4', border: '#a5f3fc'
    },
    dark: {
      primary: '#06b6d4', secondary: '#cffafe', accent: '#cffafe',
      bg: '#021113', surface: '#0d252a', surface2: '#163941',
      text: '#ecfeff', textMuted: '#cffafe', border: '#124653'
    }
  },
  'matte-nude': {
    id: 'matte-nude',
    name: 'Matte Nude',
    category: 'Suministros de Belleza Profesional',
    light: {
      primary: '#b45309', secondary: '#ffedd5', accent: '#7c2d12',
      bg: '#fffbf7', surface: '#ffffff', surface2: '#ffede2',
      text: '#2e0f00', textMuted: '#7c2d12', border: '#ffd8c2'
    },
    dark: {
      primary: '#b45309', secondary: '#ffedd5', accent: '#ffedd5',
      bg: '#190d06', surface: '#2f1b10', surface2: '#452b1b',
      text: '#fffbeb', textMuted: '#fdba74', border: '#5c2d14'
    }
  },
  'rose-gold': {
    id: 'rose-gold',
    name: 'Rose Gold',
    category: 'Suministros de Belleza Profesional',
    light: {
      primary: '#fb7185', secondary: '#ffe4e6', accent: '#e11d48',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffebeb',
      text: '#3f0612', textMuted: '#f43f5e', border: '#ffd3d8'
    },
    dark: {
      primary: '#fb7185', secondary: '#ffe4e6', accent: '#ffe4e6',
      bg: '#1c060b', surface: '#351017', surface2: '#4e1925',
      text: '#fff1f2', textMuted: '#fca5a5', border: '#6e1e30'
    }
  },
  'premium-emerald': {
    id: 'premium-emerald',
    name: 'Premium Emerald',
    category: 'Suministros de Belleza Profesional',
    light: {
      primary: '#0d9488', secondary: '#ccfbf1', accent: '#0f766e',
      bg: '#f2fbf9', surface: '#ffffff', surface2: '#e2faf5',
      text: '#032a26', textMuted: '#0d9488', border: '#ccfbf1'
    },
    dark: {
      primary: '#0d9488', secondary: '#ccfbf1', accent: '#ccfbf1',
      bg: '#021210', surface: '#0b2622', surface2: '#153b36',
      text: '#f2fbf9', textMuted: '#99f6e4', border: '#114a43'
    }
  },
  'night-blush': {
    id: 'night-blush',
    name: 'Night Blush',
    category: 'Suministros de Belleza Profesional',
    light: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#be123c',
      bg: '#fffafc', surface: '#ffffff', surface2: '#ffeef5',
      text: '#37061a', textMuted: '#db2777', border: '#fbcfe8'
    },
    dark: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#fbcfe8',
      bg: '#13030c', surface: '#280b1c', surface2: '#3d122b',
      text: '#fff5f7', textMuted: '#fbcfe8', border: '#5c0f3c'
    }
  },

  // ── 16. ALIMENTOS Y ACCESORIOS PARA MASCOTAS ──
  'happy-dog': {
    id: 'happy-dog',
    name: 'Happy Dog',
    category: 'Alimentos y Accesorios para Mascotas',
    light: {
      primary: '#f97316', secondary: '#fed7aa', accent: '#ea580c',
      bg: '#fffcf9', surface: '#ffffff', surface2: '#ffefe0',
      text: '#3b1201', textMuted: '#ea580c', border: '#ffd8b3'
    },
    dark: {
      primary: '#f97316', secondary: '#fed7aa', accent: '#fed7aa',
      bg: '#170c04', surface: '#2d1a0e', surface2: '#452b1a',
      text: '#fffaf0', textMuted: '#fed7aa', border: '#5c2a07'
    }
  },
  'pet-care-blue': {
    id: 'pet-care-blue',
    name: 'Pet Care Blue',
    category: 'Alimentos y Accesorios para Mascotas',
    light: {
      primary: '#06b6d4', secondary: '#a5f3fc', accent: '#0891b2',
      bg: '#f0fdfd', surface: '#ffffff', surface2: '#dcfafc',
      text: '#022d35', textMuted: '#06b6d4', border: '#a5f3fc'
    },
    dark: {
      primary: '#06b6d4', secondary: '#a5f3fc', accent: '#a5f3fc',
      bg: '#021214', surface: '#0d262b', surface2: '#163c45',
      text: '#ecfeff', textMuted: '#a5f3fc', border: '#124754'
    }
  },
  'grass-fetch': {
    id: 'grass-fetch',
    name: 'Grass Fetch',
    category: 'Alimentos y Accesorios para Mascotas',
    light: {
      primary: '#16a34a', secondary: '#bbf7d0', accent: '#15803d',
      bg: '#f5faf6', surface: '#ffffff', surface2: '#e8f7ed',
      text: '#0b2e17', textMuted: '#16a34a', border: '#bbf7d0'
    },
    dark: {
      primary: '#16a34a', secondary: '#bbf7d0', accent: '#bbf7d0',
      bg: '#051508', surface: '#0e2b17', surface2: '#174025',
      text: '#f0fdf4', textMuted: '#bbf7d0', border: '#175c2b'
    }
  },
  'puppy-yellow': {
    id: 'puppy-yellow',
    name: 'Puppy Yellow',
    category: 'Alimentos y Accesorios para Mascotas',
    light: {
      primary: '#eab308', secondary: '#fef9c3', accent: '#ca8a04',
      bg: '#fffef6', surface: '#ffffff', surface2: '#fefcd6',
      text: '#3b2f02', textMuted: '#eab308', border: '#fef9c3'
    },
    dark: {
      primary: '#eab308', secondary: '#fef9c3', accent: '#fef9c3',
      bg: '#141103', surface: '#282307', surface2: '#3c340d',
      text: '#fefdf0', textMuted: '#fde047', border: '#574c0a'
    }
  },
  'cat-purr': {
    id: 'cat-purr',
    name: 'Cat Purr',
    category: 'Alimentos y Accesorios para Mascotas',
    light: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#be123c',
      bg: '#fffafc', surface: '#ffffff', surface2: '#ffeef5',
      text: '#37061a', textMuted: '#db2777', border: '#fbcfe8'
    },
    dark: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#fbcfe8',
      bg: '#190410', surface: '#2a0a1d', surface2: '#3d122b',
      text: '#fff1f2', textMuted: '#fbcfe8', border: '#5c0f3c'
    }
  },
  'water-splash-pets': {
    id: 'water-splash-pets',
    name: 'Water Splash',
    category: 'Alimentos y Accesorios para Mascotas',
    light: {
      primary: '#0ea5e9', secondary: '#bae6fd', accent: '#0284c7',
      bg: '#f4faff', surface: '#ffffff', surface2: '#e0f2fe',
      text: '#032c45', textMuted: '#0ea5e9', border: '#bae6fd'
    },
    dark: {
      primary: '#0ea5e9', secondary: '#bae6fd', accent: '#bae6fd',
      bg: '#040f1a', surface: '#0e1c31', surface2: '#1a2e4e',
      text: '#f0f9ff', textMuted: '#bae6fd', border: '#103a61'
    }
  },
  'gentle-olive-pets': {
    id: 'gentle-olive-pets',
    name: 'Gentle Olive',
    category: 'Alimentos y Accesorios para Mascotas',
    light: {
      primary: '#84cc16', secondary: '#d9f99d', accent: '#65a30d',
      bg: '#fafdf5', surface: '#ffffff', surface2: '#f1fbd9',
      text: '#223c03', textMuted: '#84cc16', border: '#d9f99d'
    },
    dark: {
      primary: '#84cc16', secondary: '#d9f99d', accent: '#d9f99d',
      bg: '#0e1405', surface: '#1b260f', surface2: '#2b3b19',
      text: '#f7fee7', textMuted: '#d9f99d', border: '#3f5e12'
    }
  },
  'feather-purple': {
    id: 'feather-purple',
    name: 'Feather Purple',
    category: 'Alimentos y Accesorios para Mascotas',
    light: {
      primary: '#8b5cf6', secondary: '#ddd6fe', accent: '#6d28d9',
      bg: '#fbfaff', surface: '#ffffff', surface2: '#f5f2fe',
      text: '#21004a', textMuted: '#8b5cf6', border: '#ddd6fe'
    },
    dark: {
      primary: '#8b5cf6', secondary: '#ddd6fe', accent: '#ddd6fe',
      bg: '#0d051a', surface: '#1c0f33', surface2: '#2b194f',
      text: '#f5f3ff', textMuted: '#ddd6fe', border: '#4a2588'
    }
  },
  'bone-chew': {
    id: 'bone-chew',
    name: 'Bone Chew',
    category: 'Alimentos y Accesorios para Mascotas',
    light: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#854d0e',
      bg: '#fffdf5', surface: '#ffffff', surface2: '#fff9cf',
      text: '#3a2a00', textMuted: '#854d0e', border: '#fcd34d'
    },
    dark: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#fef08a',
      bg: '#161305', surface: '#2d250d', surface2: '#3f3517',
      text: '#fefdf0', textMuted: '#fde047', border: '#57480a'
    }
  },
  'red-collar': {
    id: 'red-collar',
    name: 'Red Collar',
    category: 'Alimentos y Accesorios para Mascotas',
    light: {
      primary: '#ef4444', secondary: '#fca5a5', accent: '#b91c1c',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffebeb',
      text: '#3d0909', textMuted: '#ef4444', border: '#ffd2d2'
    },
    dark: {
      primary: '#ef4444', secondary: '#fca5a5', accent: '#fca5a5',
      bg: '#1a0505', surface: '#2b0f0f', surface2: '#411919',
      text: '#fff5f5', textMuted: '#fca5a5', border: '#611a1a'
    }
  },

  // ── 17. REPUESTOS DE ELECTRODOMÉSTICOS ──
  'electric-blue-repuestos': {
    id: 'electric-blue-repuestos',
    name: 'Electric Blue',
    category: 'Repuestos de Electrodomésticos',
    light: {
      primary: '#2563eb', secondary: '#93c5fd', accent: '#1d4ed8',
      bg: '#f6faff', surface: '#ffffff', surface2: '#e5efff',
      text: '#0b2053', textMuted: '#2563eb', border: '#dbeafe'
    },
    dark: {
      primary: '#2563eb', secondary: '#93c5fd', accent: '#93c5fd',
      bg: '#0a1128', surface: '#132145', surface2: '#1d3263',
      text: '#f0f7ff', textMuted: '#93c5fd', border: '#1e3f88'
    }
  },
  'titanium-matte': {
    id: 'titanium-matte',
    name: 'Titanium Matte',
    category: 'Repuestos de Electrodomésticos',
    light: {
      primary: '#52525b', secondary: '#cbd5e1', accent: '#3f3f46',
      bg: '#fbfbfb', surface: '#ffffff', surface2: '#f4f4f5',
      text: '#18181b', textMuted: '#52525b', border: '#cbd5e1'
    },
    dark: {
      primary: '#52525b', secondary: '#cbd5e1', accent: '#cbd5e1',
      bg: '#0f1219', surface: '#1c222e', surface2: '#283142',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#334155'
    }
  },
  'safety-amber-repuestos': {
    id: 'safety-amber-repuestos',
    name: 'Safety Amber',
    category: 'Repuestos de Electrodomésticos',
    light: {
      primary: '#ca8a04', secondary: '#fde047', accent: '#854d0e',
      bg: '#fffdf5', surface: '#ffffff', surface2: '#fff9cf',
      text: '#3a2a00', textMuted: '#854d0e', border: '#fcd34d'
    },
    dark: {
      primary: '#ca8a04', secondary: '#fde047', accent: '#fde047',
      bg: '#161205', surface: '#2d240d', surface2: '#3f3417',
      text: '#fffdf5', textMuted: '#fde047', border: '#57470a'
    }
  },
  'valve-teal': {
    id: 'valve-teal',
    name: 'Valve Teal',
    category: 'Repuestos de Electrodomésticos',
    light: {
      primary: '#0d9488', secondary: '#99f6e4', accent: '#115e59',
      bg: '#f2faf8', surface: '#ffffff', surface2: '#e6f4f2',
      text: '#042f2e', textMuted: '#0d9488', border: '#99f6e4'
    },
    dark: {
      primary: '#0d9488', secondary: '#99f6e4', accent: '#99f6e4',
      bg: '#031110', surface: '#0a2320', surface2: '#123832',
      text: '#f0fdfa', textMuted: '#99f6e4', border: '#114a42'
    }
  },
  'coil-red': {
    id: 'coil-red',
    name: 'Coil Red',
    category: 'Repuestos de Electrodomésticos',
    light: {
      primary: '#b91c1c', secondary: '#fca5a5', accent: '#991b1b',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffebeb',
      text: '#3b0606', textMuted: '#b91c1c', border: '#fca5a5'
    },
    dark: {
      primary: '#b91c1c', secondary: '#fca5a5', accent: '#fca5a5',
      bg: '#170505', surface: '#2f0f0f', surface2: '#471a1a',
      text: '#fff5f5', textMuted: '#fca5a5', border: '#701c1c'
    }
  },
  'copper-coil': {
    id: 'copper-coil',
    name: 'Copper Coil',
    category: 'Repuestos de Electrodomésticos',
    light: {
      primary: '#d97706', secondary: '#fcd34d', accent: '#b45309',
      bg: '#fffdf6', surface: '#ffffff', surface2: '#fef3c7',
      text: '#3c1a00', textMuted: '#b45309', border: '#fcd34d'
    },
    dark: {
      primary: '#d97706', secondary: '#fcd34d', accent: '#fcd34d',
      bg: '#140f06', surface: '#28200d', surface2: '#3c3014',
      text: '#fffdf5', textMuted: '#fdba74', border: '#5c4610'
    }
  },
  'clean-white-repuestos': {
    id: 'clean-white-repuestos',
    name: 'Clean White',
    category: 'Repuestos de Electrodomésticos',
    light: {
      primary: '#64748b', secondary: '#cbd5e1', accent: '#475569',
      bg: '#ffffff', surface: '#fdfdfd', surface2: '#f8fafc',
      text: '#0f172a', textMuted: '#64748b', border: '#cbd5e1'
    },
    dark: {
      primary: '#64748b', secondary: '#cbd5e1', accent: '#cbd5e1',
      bg: '#0e1320', surface: '#1b233a', surface2: '#283457',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#253356'
    }
  },
  'logic-green': {
    id: 'logic-green',
    name: 'Logic Green',
    category: 'Repuestos de Electrodomésticos',
    light: {
      primary: '#16a34a', secondary: '#86efac', accent: '#15803d',
      bg: '#f5faf6', surface: '#ffffff', surface2: '#e8f7ed',
      text: '#0b2e17', textMuted: '#16a34a', border: '#86efac'
    },
    dark: {
      primary: '#16a34a', secondary: '#86efac', accent: '#86efac',
      bg: '#051408', surface: '#0d2514', surface2: '#163d21',
      text: '#f0fdf4', textMuted: '#86efac', border: '#1b4d2c'
    }
  },
  'laser-purple-repuestos': {
    id: 'laser-purple-repuestos',
    name: 'Laser Purple',
    category: 'Repuestos de Electrodomésticos',
    light: {
      primary: '#7c3aed', secondary: '#c084fc', accent: '#6d28d9',
      bg: '#fbfaff', surface: '#ffffff', surface2: '#f5f2fe',
      text: '#21004a', textMuted: '#7c3aed', border: '#c084fc'
    },
    dark: {
      primary: '#7c3aed', secondary: '#c084fc', accent: '#c084fc',
      bg: '#0b051a', surface: '#1c0e35', surface2: '#2b1652',
      text: '#f5f3ff', textMuted: '#c084fc', border: '#4c21a4'
    }
  },
  'aqua-split': {
    id: 'aqua-split',
    name: 'Aqua Split',
    category: 'Repuestos de Electrodomésticos',
    light: {
      primary: '#06b6d4', secondary: '#a5f3fc', accent: '#0891b2',
      bg: '#f0fdfd', surface: '#ffffff', surface2: '#dcfafc',
      text: '#022d35', textMuted: '#06b6d4', border: '#a5f3fc'
    },
    dark: {
      primary: '#06b6d4', secondary: '#a5f3fc', accent: '#a5f3fc',
      bg: '#021114', surface: '#0c2227', surface2: '#17363e',
      text: '#ecfeff', textMuted: '#67e8f9', border: '#134752'
    }
  },

  // ── 18. CALZADO Y CONFECCIÓN LOCAL ──
  'classic-leather': {
    id: 'classic-leather',
    name: 'Classic Leather',
    category: 'Calzado y Confección Local',
    light: {
      primary: '#7c2d12', secondary: '#ea580c', accent: '#451a03',
      bg: '#fdfcfb', surface: '#ffffff', surface2: '#f6ede2',
      text: '#270e00', textMuted: '#78350f', border: '#fed7aa'
    },
    dark: {
      primary: '#7c2d12', secondary: '#ea580c', accent: '#ea580c',
      bg: '#140905', surface: '#28120b', surface2: '#3d1b11',
      text: '#fff7ed', textMuted: '#fdba74', border: '#4e1b0a'
    }
  },
  'minimal-linen': {
    id: 'minimal-linen',
    name: 'Minimal Linen',
    category: 'Calzado y Confección Local',
    light: {
      primary: '#d97706', secondary: '#fcd34d', accent: '#b45309',
      bg: '#fffdf6', surface: '#ffffff', surface2: '#fef3c7',
      text: '#3c1800', textMuted: '#d97706', border: '#cbd5e1'
    },
    dark: {
      primary: '#d97706', secondary: '#fcd34d', accent: '#fcd34d',
      bg: '#17130a', surface: '#2c2517', surface2: '#413723',
      text: '#fefdf5', textMuted: '#fde047', border: '#5c4515'
    }
  },
  'rose-fabric': {
    id: 'rose-fabric',
    name: 'Rose Fabric',
    category: 'Calzado y Confección Local',
    light: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#be123c',
      bg: '#fffafc', surface: '#ffffff', surface2: '#ffeef5',
      text: '#37061a', textMuted: '#9d174d', border: '#fbcfe8'
    },
    dark: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#fbcfe8',
      bg: '#1a0410', surface: '#2b0b1c', surface2: '#3e112a',
      text: '#fff1f2', textMuted: '#fbcfe8', border: '#5c0e3c'
    }
  },
  'olive-tweed': {
    id: 'olive-tweed',
    name: 'Olive Tweed',
    category: 'Calzado y Confección Local',
    light: {
      primary: '#65a30d', secondary: '#d9f99d', accent: '#4d7c0f',
      bg: '#fafdf5', surface: '#ffffff', surface2: '#f1fbd9',
      text: '#223c03', textMuted: '#65a30d', border: '#d9f99d'
    },
    dark: {
      primary: '#65a30d', secondary: '#d9f99d', accent: '#d9f99d',
      bg: '#0d1405', surface: '#1b260f', surface2: '#2a3b19',
      text: '#f7fee7', textMuted: '#bef264', border: '#3e5814'
    }
  },
  'deep-indigo-calzado': {
    id: 'deep-indigo-calzado',
    name: 'Deep Indigo',
    category: 'Calzado y Confección Local',
    light: {
      primary: '#312e81', secondary: '#818cf8', accent: '#1e1b4b',
      bg: '#f7f7ff', surface: '#ffffff', surface2: '#eaeaff',
      text: '#0e0e3c', textMuted: '#312e81', border: '#c7c7ff'
    },
    dark: {
      primary: '#312e81', secondary: '#818cf8', accent: '#818cf8',
      bg: '#050516', surface: '#0d0d2b', surface2: '#161645',
      text: '#e0e7ff', textMuted: '#a5b4fc', border: '#1e1e63'
    }
  },
  'gold-buckle': {
    id: 'gold-buckle',
    name: 'Gold Buckle',
    category: 'Calzado y Confección Local',
    light: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#854d0e',
      bg: '#fffdf5', surface: '#ffffff', surface2: '#fff9cf',
      text: '#3a2a00', textMuted: '#854d0e', border: '#fcd34d'
    },
    dark: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#fef08a',
      bg: '#141103', surface: '#282207', surface2: '#3c340d',
      text: '#fefdf0', textMuted: '#fde047', border: '#574c0a'
    }
  },
  'sand-canvas': {
    id: 'sand-canvas',
    name: 'Sand Canvas',
    category: 'Calzado y Confección Local',
    light: {
      primary: '#b45309', secondary: '#ffedd5', accent: '#7c2d12',
      bg: '#fffbf7', surface: '#ffffff', surface2: '#ffede2',
      text: '#2e0f00', textMuted: '#7c2d12', border: '#ffd8c2'
    },
    dark: {
      primary: '#b45309', secondary: '#ffedd5', accent: '#ffedd5',
      bg: '#170d04', surface: '#2d1b0f', surface2: '#432a1b',
      text: '#fffbeb', textMuted: '#fdba74', border: '#5c2a11'
    }
  },
  'forest-boot': {
    id: 'forest-boot',
    name: 'Forest Boot',
    category: 'Calzado y Confección Local',
    light: {
      primary: '#065f46', secondary: '#34d399', accent: '#042f2e',
      bg: '#f3faf8', surface: '#ffffff', surface2: '#e6f6f2',
      text: '#012920', textMuted: '#065f46', border: '#a7f3d0'
    },
    dark: {
      primary: '#065f46', secondary: '#34d399', accent: '#34d399',
      bg: '#030f0c', surface: '#09251f', surface2: '#123a31',
      text: '#f2fbf9', textMuted: '#86efac', border: '#114a3f'
    }
  },
  'royal-velvet': {
    id: 'royal-velvet',
    name: 'Royal Velvet',
    category: 'Calzado y Confección Local',
    light: {
      primary: '#6b21a8', secondary: '#e9d5ff', accent: '#581c87',
      bg: '#fbf9ff', surface: '#ffffff', surface2: '#f3e8ff',
      text: '#1a0030', textMuted: '#6b21a8', border: '#e9d5ff'
    },
    dark: {
      primary: '#6b21a8', secondary: '#e9d5ff', accent: '#e9d5ff',
      bg: '#10051a', surface: '#220b33', surface2: '#35124d',
      text: '#faf5ff', textMuted: '#d8b4fe', border: '#521d7a'
    }
  },
  'crimson-suede': {
    id: 'crimson-suede',
    name: 'Crimson Suede',
    category: 'Calzado y Confección Local',
    light: {
      primary: '#991b1b', secondary: '#fca5a5', accent: '#7f1d1d',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffebeb',
      text: '#3b0606', textMuted: '#991b1b', border: '#fca5a5'
    },
    dark: {
      primary: '#991b1b', secondary: '#fca5a5', accent: '#fca5a5',
      bg: '#180404', surface: '#2f0f0f', surface2: '#471818',
      text: '#fff5f5', textMuted: '#fca5a5', border: '#701a1a'
    }
  },

  // ── 19. ALIMENTACIÓN ORGÁNICA Y SALUDABLE ──
  'avocado-green': {
    id: 'avocado-green',
    name: 'Avocado Green',
    category: 'Alimentación Orgánica y Saludable',
    light: {
      primary: '#65a30d', secondary: '#bef264', accent: '#4d7c0f',
      bg: '#fafdf5', surface: '#ffffff', surface2: '#f1fbd9',
      text: '#223c03', textMuted: '#65a30d', border: '#d9f99d'
    },
    dark: {
      primary: '#65a30d', secondary: '#bef264', accent: '#bef264',
      bg: '#0d1405', surface: '#1b260f', surface2: '#2a3b19',
      text: '#f7fee7', textMuted: '#bef264', border: '#3e5814'
    }
  },
  'almond-white': {
    id: 'almond-white',
    name: 'Almond White',
    category: 'Alimentación Orgánica y Saludable',
    light: {
      primary: '#d97706', secondary: '#fef08a', accent: '#b45309',
      bg: '#fffdf6', surface: '#ffffff', surface2: '#fef3c7',
      text: '#3c1800', textMuted: '#d97706', border: '#fcd34d'
    },
    dark: {
      primary: '#d97706', secondary: '#fef08a', accent: '#fef08a',
      bg: '#141005', surface: '#27200c', surface2: '#3c3214',
      text: '#fefdf0', textMuted: '#fde047', border: '#5c480d'
    }
  },
  'berry-beet': {
    id: 'berry-beet',
    name: 'Berry Beet',
    category: 'Alimentación Orgánica y Saludable',
    light: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#be123c',
      bg: '#fffafc', surface: '#ffffff', surface2: '#ffeef5',
      text: '#37061a', textMuted: '#db2777', border: '#fbcfe8'
    },
    dark: {
      primary: '#db2777', secondary: '#fbcfe8', accent: '#fbcfe8',
      bg: '#180410', surface: '#2c0c1e', surface2: '#3f162e',
      text: '#fff1f2', textMuted: '#fbcfe8', border: '#5c0f41'
    }
  },
  'matcha-calm': {
    id: 'matcha-calm',
    name: 'Matcha Calm',
    category: 'Alimentación Orgánica y Saludable',
    light: {
      primary: '#0d9488', secondary: '#a7f3d0', accent: '#0f766e',
      bg: '#f2faf7', surface: '#ffffff', surface2: '#dcfaf0',
      text: '#032a26', textMuted: '#0d9488', border: '#a7f3d0'
    },
    dark: {
      primary: '#0d9488', secondary: '#a7f3d0', accent: '#a7f3d0',
      bg: '#02110e', surface: '#092520', surface2: '#113b33',
      text: '#ecfdf5', textMuted: '#a7f3d0', border: '#114a40'
    }
  },
  'citrus-punch': {
    id: 'citrus-punch',
    name: 'Citrus Punch',
    category: 'Alimentación Orgánica y Saludable',
    light: {
      primary: '#f97316', secondary: '#fed7aa', accent: '#ea580c',
      bg: '#fffcf9', surface: '#ffffff', surface2: '#ffefe0',
      text: '#3b1201', textMuted: '#ea580c', border: '#ffd8b3'
    },
    dark: {
      primary: '#f97316', secondary: '#fed7aa', accent: '#fed7aa',
      bg: '#170c04', surface: '#2d1a0e', surface2: '#452b1a',
      text: '#fffaf0', textMuted: '#fed7aa', border: '#5c2a07'
    }
  },
  'chia-seed': {
    id: 'chia-seed',
    name: 'Chia Seed',
    category: 'Alimentación Orgánica y Saludable',
    light: {
      primary: '#475569', secondary: '#cbd5e1', accent: '#334155',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#475569', secondary: '#cbd5e1', accent: '#cbd5e1',
      bg: '#0f1524', surface: '#1c2436', surface2: '#28344e',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#25334d'
    }
  },
  'turmeric-glow': {
    id: 'turmeric-glow',
    name: 'Turmeric Glow',
    category: 'Alimentación Orgánica y Saludable',
    light: {
      primary: '#eab308', secondary: '#fef9c3', accent: '#ca8a04',
      bg: '#fffef6', surface: '#ffffff', surface2: '#fefcd6',
      text: '#3b2f02', textMuted: '#eab308', border: '#fef9c3'
    },
    dark: {
      primary: '#eab308', secondary: '#fef9c3', accent: '#fef9c3',
      bg: '#141103', surface: '#282207', surface2: '#3c340d',
      text: '#fefdf0', textMuted: '#fde047', border: '#574c0a'
    }
  },
  'spinach-leaf': {
    id: 'spinach-leaf',
    name: 'Spinach Leaf',
    category: 'Alimentación Orgánica y Saludable',
    light: {
      primary: '#16a34a', secondary: '#86efac', accent: '#15803d',
      bg: '#f5faf6', surface: '#ffffff', surface2: '#e8f7ed',
      text: '#0b2e17', textMuted: '#16a34a', border: '#86efac'
    },
    dark: {
      primary: '#16a34a', secondary: '#86efac', accent: '#86efac',
      bg: '#051408', surface: '#0d2514', surface2: '#163d21',
      text: '#f0fdf4', textMuted: '#86efac', border: '#1b4d2c'
    }
  },
  'sweet-pumpkin': {
    id: 'sweet-pumpkin',
    name: 'Sweet Pumpkin',
    category: 'Alimentación Orgánica y Saludable',
    light: {
      primary: '#ea580c', secondary: '#ffedd5', accent: '#c2410c',
      bg: '#fffaf8', surface: '#ffffff', surface2: '#ffebe0',
      text: '#3b1202', textMuted: '#ea580c', border: '#ffd8c2'
    },
    dark: {
      primary: '#ea580c', secondary: '#ffedd5', accent: '#ffedd5',
      bg: '#150802', surface: '#2b1005', surface2: '#3f180a',
      text: '#fff7ed', textMuted: '#ffedd5', border: '#5c1d07'
    }
  },
  'acai-purple': {
    id: 'acai-purple',
    name: 'Acai Purple',
    category: 'Alimentación Orgánica y Saludable',
    light: {
      primary: '#701a75', secondary: '#f5d0fe', accent: '#4a044e',
      bg: '#fcf8fd', surface: '#ffffff', surface2: '#fae8ff',
      text: '#220025', textMuted: '#701a75', border: '#f5d0fe'
    },
    dark: {
      primary: '#701a75', secondary: '#f5d0fe', accent: '#f5d0fe',
      bg: '#120316', surface: '#260a2d', surface2: '#3a1344',
      text: '#fdf4ff', textMuted: '#f5d0fe', border: '#5c166d'
    }
  },

  // ── 20. EQUIPAMIENTO HOME OFFICE ──
  'desk-slate': {
    id: 'desk-slate',
    name: 'Desk Slate',
    category: 'Equipamiento Home Office',
    light: {
      primary: '#334155', secondary: '#94a3b8', accent: '#1e293b',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
      text: '#0f172a', textMuted: '#475569', border: '#e2e8f0'
    },
    dark: {
      primary: '#334155', secondary: '#94a3b8', accent: '#94a3b8',
      bg: '#0f172a', surface: '#1e293b', surface2: '#334155',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#334155'
    }
  },
  'eco-wood': {
    id: 'eco-wood',
    name: 'Eco Wood',
    category: 'Equipamiento Home Office',
    light: {
      primary: '#854d0e', secondary: '#fbbf24', accent: '#713f12',
      bg: '#fdfdfa', surface: '#ffffff', surface2: '#fef3c7',
      text: '#3c2401', textMuted: '#854d0e', border: '#fbe285'
    },
    dark: {
      primary: '#854d0e', secondary: '#fbbf24', accent: '#fbbf24',
      bg: '#130e05', surface: '#271b0b', surface2: '#3a2b13',
      text: '#fefcf0', textMuted: '#fde047', border: '#5c410e'
    }
  },
  'cyber-punk-office': {
    id: 'cyber-punk-office',
    name: 'Cyber Punk',
    category: 'Equipamiento Home Office',
    light: {
      primary: '#db2777', secondary: '#38bdf8', accent: '#a21caf',
      bg: '#fffaff', surface: '#ffffff', surface2: '#e0f2fe',
      text: '#37003c', textMuted: '#db2777', border: '#fbcfe8'
    },
    dark: {
      primary: '#db2777', secondary: '#38bdf8', accent: '#38bdf8',
      bg: '#0e031a', surface: '#210b38', surface2: '#351259',
      text: '#fdf4ff', textMuted: '#f472b6', border: '#4c127f'
    }
  },
  'studio-white': {
    id: 'studio-white',
    name: 'Studio White',
    category: 'Equipamiento Home Office',
    light: {
      primary: '#64748b', secondary: '#cbd5e1', accent: '#475569',
      bg: '#ffffff', surface: '#fafafa', surface2: '#f3f4f6',
      text: '#0f172a', textMuted: '#64748b', border: '#cbd5e1'
    },
    dark: {
      primary: '#64748b', secondary: '#cbd5e1', accent: '#cbd5e1',
      bg: '#0e111a', surface: '#1b2031', surface2: '#283049',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#252e46'
    }
  },
  'minimal-steel': {
    id: 'minimal-steel',
    name: 'Minimal Steel',
    category: 'Equipamiento Home Office',
    light: {
      primary: '#18181b', secondary: '#a1a1aa', accent: '#09090b',
      bg: '#fafafa', surface: '#ffffff', surface2: '#f4f4f5',
      text: '#09090b', textMuted: '#71717a', border: '#e4e4e7'
    },
    dark: {
      primary: '#18181b', secondary: '#a1a1aa', accent: '#a1a1aa',
      bg: '#09090b', surface: '#18181b', surface2: '#27272a',
      text: '#f4f4f5', textMuted: '#a1a1aa', border: '#3f3f46'
    }
  },
  'active-lime': {
    id: 'active-lime',
    name: 'Active Lime',
    category: 'Equipamiento Home Office',
    light: {
      primary: '#84cc16', secondary: '#bef264', accent: '#4d7c0f',
      bg: '#fafdf5', surface: '#ffffff', surface2: '#f1fbd9',
      text: '#223c03', textMuted: '#84cc16', border: '#d9f99d'
    },
    dark: {
      primary: '#84cc16', secondary: '#bef264', accent: '#bef264',
      bg: '#0f1405', surface: '#1c260f', surface2: '#293a19',
      text: '#f7fee7', textMuted: '#bef264', border: '#3f5d14'
    }
  },
  'soft-leather': {
    id: 'soft-leather',
    name: 'Soft Leather',
    category: 'Equipamiento Home Office',
    light: {
      primary: '#7c2d12', secondary: '#fdba74', accent: '#451a03',
      bg: '#fdfcfb', surface: '#ffffff', surface2: '#f6ede2',
      text: '#270e00', textMuted: '#7c2d12', border: '#fed7aa'
    },
    dark: {
      primary: '#7c2d12', secondary: '#fdba74', accent: '#fdba74',
      bg: '#160803', surface: '#2d1309', surface2: '#412014',
      text: '#fffbeb', textMuted: '#fdba74', border: '#5c1f0e'
    }
  },
  'deep-focus': {
    id: 'deep-focus',
    name: 'Deep Focus',
    category: 'Equipamiento Home Office',
    light: {
      primary: '#1d4ed8', secondary: '#93c5fd', accent: '#172554',
      bg: '#f6faff', surface: '#ffffff', surface2: '#e5efff',
      text: '#0b1d3a', textMuted: '#1d4ed8', border: '#dbeafe'
    },
    dark: {
      primary: '#1d4ed8', secondary: '#93c5fd', accent: '#93c5fd',
      bg: '#080d22', surface: '#111a43', surface2: '#1b2a63',
      text: '#f0f7ff', textMuted: '#93c5fd', border: '#1e388c'
    }
  },
  'mint-workspace': {
    id: 'mint-workspace',
    name: 'Mint Workspace',
    category: 'Equipamiento Home Office',
    light: {
      primary: '#0d9488', secondary: '#5eead4', accent: '#115e59',
      bg: '#f2faf9', surface: '#ffffff', surface2: '#dcfaf4',
      text: '#032a26', textMuted: '#0d9488', border: '#ccfbf1'
    },
    dark: {
      primary: '#0d9488', secondary: '#5eead4', accent: '#5eead4',
      bg: '#021110', surface: '#092523', surface2: '#123b37',
      text: '#f2fbf9', textMuted: '#99f6e4', border: '#114a42'
    }
  },
  'terracotta-office': {
    id: 'terracotta-office',
    name: 'Terracotta Office',
    category: 'Equipamiento Home Office',
    light: {
      primary: '#c2410c', secondary: '#ffedd5', accent: '#9a3412',
      bg: '#fffaf8', surface: '#ffffff', surface2: '#ffebd9',
      text: '#2e0a01', textMuted: '#c2410c', border: '#ffd8c2'
    },
    dark: {
      primary: '#c2410c', secondary: '#ffedd5', accent: '#ffedd5',
      bg: '#160a03', surface: '#2d160c', surface2: '#452316',
      text: '#fffbf0', textMuted: '#fdba74', border: '#5c2410'
    }
  },

  // ── 21. BODEGA DE LICORES Y COCTELERÍA ──
  'neon-night': {
    id: 'neon-night',
    name: 'Neon Night',
    category: 'Bodega de Licores y Coctelería',
    light: {
      primary: '#a855f7', secondary: '#f472b6', accent: '#7c3aed',
      bg: '#fbf9ff', surface: '#ffffff', surface2: '#f3e8ff',
      text: '#220038', textMuted: '#a855f7', border: '#e9d5ff'
    },
    dark: {
      primary: '#a855f7', secondary: '#f472b6', accent: '#f472b6',
      bg: '#0b0312', surface: '#1b0c25', surface2: '#2b163a',
      text: '#faf5ff', textMuted: '#d8b4fe', border: '#4c1e6a'
    }
  },
  'amber-barrel': {
    id: 'amber-barrel',
    name: 'Amber Barrel',
    category: 'Bodega de Licores y Coctelería',
    light: {
      primary: '#d97706', secondary: '#fbbf24', accent: '#b45309',
      bg: '#fffdf6', surface: '#ffffff', surface2: '#fdf5e0',
      text: '#3b1f02', textMuted: '#d97706', border: '#fcd34d'
    },
    dark: {
      primary: '#d97706', secondary: '#fbbf24', accent: '#fbbf24',
      bg: '#140d04', surface: '#271c0d', surface2: '#3b2c19',
      text: '#fffbeb', textMuted: '#fdba74', border: '#5c3d14'
    }
  },
  'lime-mojito': {
    id: 'lime-mojito',
    name: 'Lime Mojito',
    category: 'Bodega de Licores y Coctelería',
    light: {
      primary: '#65a30d', secondary: '#bef264', accent: '#4d7c0f',
      bg: '#fafdf5', surface: '#ffffff', surface2: '#f1fbd9',
      text: '#223c03', textMuted: '#65a30d', border: '#d9f99d'
    },
    dark: {
      primary: '#65a30d', secondary: '#bef264', accent: '#bef264',
      bg: '#0d1405', surface: '#1b260f', surface2: '#2a3b19',
      text: '#f7fee7', textMuted: '#bef264', border: '#3e5814'
    }
  },
  'blue-lagoon': {
    id: 'blue-lagoon',
    name: 'Blue Lagoon',
    category: 'Bodega de Licores y Coctelería',
    light: {
      primary: '#06b6d4', secondary: '#a5f3fc', accent: '#0891b2',
      bg: '#f0fdfd', surface: '#ffffff', surface2: '#dcfafc',
      text: '#022d35', textMuted: '#06b6d4', border: '#a5f3fc'
    },
    dark: {
      primary: '#06b6d4', secondary: '#a5f3fc', accent: '#a5f3fc',
      bg: '#021114', surface: '#0c2227', surface2: '#17363e',
      text: '#ecfeff', textMuted: '#67e8f9', border: '#134752'
    }
  },
  'rubi-cocktail': {
    id: 'rubi-cocktail',
    name: 'Rubi Cocktail',
    category: 'Bodega de Licores y Coctelería',
    light: {
      primary: '#e11d48', secondary: '#ffe4e6', accent: '#be123c',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffe4e6',
      text: '#3f000b', textMuted: '#e11d48', border: '#ffd3d8'
    },
    dark: {
      primary: '#e11d48', secondary: '#ffe4e6', accent: '#ffe4e6',
      bg: '#1d040a', surface: '#380d19', surface2: '#531b2c',
      text: '#fff1f2', textMuted: '#fda4af', border: '#781c34'
    }
  },
  'gold-tequila': {
    id: 'gold-tequila',
    name: 'Gold Tequila',
    category: 'Bodega de Licores y Coctelería',
    light: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#854d0e',
      bg: '#fffdf5', surface: '#ffffff', surface2: '#fff9cf',
      text: '#3a2a00', textMuted: '#854d0e', border: '#fcd34d'
    },
    dark: {
      primary: '#ca8a04', secondary: '#fef08a', accent: '#fef08a',
      bg: '#151203', surface: '#282208', surface2: '#3c3510',
      text: '#fefdf0', textMuted: '#fde047', border: '#574d11'
    }
  },
  'gin-tonic': {
    id: 'gin-tonic',
    name: 'Gin Tonic',
    category: 'Bodega de Licores y Coctelería',
    light: {
      primary: '#0ea5e9', secondary: '#93c5fd', accent: '#0284c7',
      bg: '#f0f9ff', surface: '#ffffff', surface2: '#e0f2fe',
      text: '#032a45', textMuted: '#0ea5e9', border: '#cbd5e1'
    },
    dark: {
      primary: '#0ea5e9', secondary: '#93c5fd', accent: '#93c5fd',
      bg: '#060f1b', surface: '#0e1c31', surface2: '#1a2e4e',
      text: '#f0f9ff', textMuted: '#93c5fd', border: '#103a61'
    }
  },
  'plum-liquor': {
    id: 'plum-liquor',
    name: 'Plum Liquor',
    category: 'Bodega de Licores y Coctelería',
    light: {
      primary: '#701a75', secondary: '#f5d0fe', accent: '#4a044e',
      bg: '#fcf8fd', surface: '#ffffff', surface2: '#fae8ff',
      text: '#220025', textMuted: '#701a75', border: '#f5d0fe'
    },
    dark: {
      primary: '#701a75', secondary: '#f5d0fe', accent: '#f5d0fe',
      bg: '#140316', surface: '#280c2b', surface2: '#3d1641',
      text: '#fdf4ff', textMuted: '#f5d0fe', border: '#581a5e'
    }
  },
  'dry-martini': {
    id: 'dry-martini',
    name: 'Dry Martini',
    category: 'Bodega de Licores y Coctelería',
    light: {
      primary: '#16a34a', secondary: '#86efac', accent: '#15803d',
      bg: '#f5faf6', surface: '#ffffff', surface2: '#e8f7ed',
      text: '#0b2e17', textMuted: '#16a34a', border: '#86efac'
    },
    dark: {
      primary: '#16a34a', secondary: '#86efac', accent: '#86efac',
      bg: '#051408', surface: '#0d2514', surface2: '#163d21',
      text: '#f0fdf4', textMuted: '#86efac', border: '#1b4d2c'
    }
  },
  'spiced-rum': {
    id: 'spiced-rum',
    name: 'Spiced Rum',
    category: 'Bodega de Licores y Coctelería',
    light: {
      primary: '#7c2d12', secondary: '#fdba74', accent: '#451a03',
      bg: '#fdfcfb', surface: '#ffffff', surface2: '#f6ede2',
      text: '#270e00', textMuted: '#7c2d12', border: '#fed7aa'
    },
    dark: {
      primary: '#7c2d12', secondary: '#fdba74', accent: '#fdba74',
      bg: '#140702', surface: '#281106', surface2: '#3d1c10',
      text: '#fffbeb', textMuted: '#fdba74', border: '#511b0b'
    }
  },

  // ── 22. ARTÍCULOS GEEK Y COLECCIONISMO ──
  'geek-violet': {
    id: 'geek-violet',
    name: 'Geek Violet',
    category: 'Artículos Geek y Coleccionismo',
    light: {
      primary: '#7c3aed', secondary: '#c084fc', accent: '#6d28d9',
      bg: '#fbfaff', surface: '#ffffff', surface2: '#f5f2fe',
      text: '#21004a', textMuted: '#7c3aed', border: '#c084fc'
    },
    dark: {
      primary: '#7c3aed', secondary: '#c084fc', accent: '#c084fc',
      bg: '#0e051a', surface: '#1c0e35', surface2: '#2b1652',
      text: '#faf5ff', textMuted: '#d8b4fe', border: '#4c21a4'
    }
  },
  'laser-cyan-geek': {
    id: 'laser-cyan-geek',
    name: 'Laser Cyan',
    category: 'Artículos Geek y Coleccionismo',
    light: {
      primary: '#06b6d4', secondary: '#22d3ee', accent: '#0891b2',
      bg: '#f0fdfd', surface: '#ffffff', surface2: '#dcfafc',
      text: '#022d35', textMuted: '#06b6d4', border: '#a5f3fc'
    },
    dark: {
      primary: '#06b6d4', secondary: '#22d3ee', accent: '#22d3ee',
      bg: '#021114', surface: '#0c2227', surface2: '#17363e',
      text: '#ecfeff', textMuted: '#67e8f9', border: '#134752'
    }
  },
  'retro-arcade': {
    id: 'retro-arcade',
    name: 'Retro Arcade',
    category: 'Artículos Geek y Coleccionismo',
    light: {
      primary: '#db2777', secondary: '#fde047', accent: '#be123c',
      bg: '#fffdfb', surface: '#ffffff', surface2: '#fef7d5',
      text: '#37061a', textMuted: '#db2777', border: '#fde047'
    },
    dark: {
      primary: '#db2777', secondary: '#fde047', accent: '#fde047',
      bg: '#11031c', surface: '#280f3b', surface2: '#3f1c5c',
      text: '#fff1f2', textMuted: '#fcd34d', border: '#5c1782'
    }
  },
  'card-border': {
    id: 'card-border',
    name: 'Card Border',
    category: 'Artículos Geek y Coleccionismo',
    light: {
      primary: '#b45309', secondary: '#fbbf24', accent: '#7c2d12',
      bg: '#fffdf7', surface: '#ffffff', surface2: '#ffede2',
      text: '#2e0f00', textMuted: '#b45309', border: '#fcd34d'
    },
    dark: {
      primary: '#b45309', secondary: '#fbbf24', accent: '#fbbf24',
      bg: '#140f05', surface: '#28200d', surface2: '#3d3017',
      text: '#fffbeb', textMuted: '#fdba74', border: '#5c3d14'
    }
  },
  'cyber-green-geek': {
    id: 'cyber-green-geek',
    name: 'Cyber Green',
    category: 'Artículos Geek y Coleccionismo',
    light: {
      primary: '#10b981', secondary: '#86efac', accent: '#059669',
      bg: '#f0fdf4', surface: '#ffffff', surface2: '#d1fae5',
      text: '#064e3b', textMuted: '#10b981', border: '#86efac'
    },
    dark: {
      primary: '#10b981', secondary: '#86efac', accent: '#86efac',
      bg: '#03150d', surface: '#0a2c1d', surface2: '#123f2b',
      text: '#ecfdf5', textMuted: '#86efac', border: '#125c3e'
    }
  },
  'fire-red-geek': {
    id: 'fire-red-geek',
    name: 'Fire Red',
    category: 'Artículos Geek y Coleccionismo',
    light: {
      primary: '#e11d48', secondary: '#fda4af', accent: '#be123c',
      bg: '#fffafb', surface: '#ffffff', surface2: '#ffebeb',
      text: '#3b0606', textMuted: '#e11d48', border: '#fda4af'
    },
    dark: {
      primary: '#e11d48', secondary: '#fda4af', accent: '#fda4af',
      bg: '#1b0307', surface: '#350b14', surface2: '#4e1422',
      text: '#fff1f2', textMuted: '#fda4af', border: '#6e1124'
    }
  },
  'mecha-gray': {
    id: 'mecha-gray',
    name: 'Mecha Gray',
    category: 'Artículos Geek y Coleccionismo',
    light: {
      primary: '#475569', secondary: '#94a3b8', accent: '#334155',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#475569', secondary: '#94a3b8', accent: '#94a3b8',
      bg: '#0f131c', surface: '#1e2637', surface2: '#2b384f',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#25334d'
    }
  },
  'mana-potion': {
    id: 'mana-potion',
    name: 'Mana Potion',
    category: 'Artículos Geek y Coleccionismo',
    light: {
      primary: '#2563eb', secondary: '#60a5fa', accent: '#1d4ed8',
      bg: '#f7faff', surface: '#ffffff', surface2: '#e5efff',
      text: '#0b2053', textMuted: '#2563eb', border: '#cbd5e1'
    },
    dark: {
      primary: '#2563eb', secondary: '#60a5fa', accent: '#60a5fa',
      bg: '#050a22', surface: '#0d1840', surface2: '#152861',
      text: '#eff6ff', textMuted: '#93c5fd', border: '#1e3f94'
    }
  },
  'toxic-slime-geek': {
    id: 'toxic-slime-geek',
    name: 'Toxic Slime',
    category: 'Artículos Geek y Coleccionismo',
    light: {
      primary: '#84cc16', secondary: '#d9f99d', accent: '#65a30d',
      bg: '#fafdf5', surface: '#ffffff', surface2: '#f1fbd9',
      text: '#223c03', textMuted: '#84cc16', border: '#d9f99d'
    },
    dark: {
      primary: '#84cc16', secondary: '#d9f99d', accent: '#d9f99d',
      bg: '#0e1405', surface: '#1b260f', surface2: '#293a19',
      text: '#f7fee7', textMuted: '#bef264', border: '#3f5d14'
    }
  },
  'galaxy-purple': {
    id: 'galaxy-purple',
    name: 'Galaxy Purple',
    category: 'Artículos Geek y Coleccionismo',
    light: {
      primary: '#c084fc', secondary: '#fbcfe8', accent: '#a855f7',
      bg: '#fcf9ff', surface: '#ffffff', surface2: '#f5edff',
      text: '#2d004d', textMuted: '#c084fc', border: '#fbcfe8'
    },
    dark: {
      primary: '#c084fc', secondary: '#fbcfe8', accent: '#fbcfe8',
      bg: '#120524', surface: '#250e45', surface2: '#381664',
      text: '#faf5ff', textMuted: '#f5d0fe', border: '#541c88'
    }
  },

  // ── 23. INSUMOS HORECA B2B ──
  'eco-kraft': {
    id: 'eco-kraft',
    name: 'Eco Kraft',
    category: 'Insumos Horeca B2B',
    light: {
      primary: '#d97706', secondary: '#fbbf24', accent: '#b45309',
      bg: '#fffdf6', surface: '#ffffff', surface2: '#fdf5e0',
      text: '#3b1f02', textMuted: '#d97706', border: '#cbd5e1'
    },
    dark: {
      primary: '#d97706', secondary: '#fbbf24', accent: '#fbbf24',
      bg: '#130f06', surface: '#272010', surface2: '#3a301a',
      text: '#fefdf5', textMuted: '#fdba74', border: '#5c4411'
    }
  },
  'pure-clean': {
    id: 'pure-clean',
    name: 'Pure Clean',
    category: 'Insumos Horeca B2B',
    light: {
      primary: '#2563eb', secondary: '#38bdf8', accent: '#1d4ed8',
      bg: '#f7fafdf', surface: '#ffffff', surface2: '#e5f3ff',
      text: '#0b2053', textMuted: '#2563eb', border: '#bae6fd'
    },
    dark: {
      primary: '#2563eb', secondary: '#38bdf8', accent: '#38bdf8',
      bg: '#060f1b', surface: '#121f37', surface2: '#1c2f52',
      text: '#f0f9ff', textMuted: '#93c5fd', border: '#1e3b6d'
    }
  },
  'hygiene-mint': {
    id: 'hygiene-mint',
    name: 'Hygiene Mint',
    category: 'Insumos Horeca B2B',
    light: {
      primary: '#0d9488', secondary: '#a7f3d0', accent: '#0f766e',
      bg: '#f2faf7', surface: '#ffffff', surface2: '#dcfaf0',
      text: '#032a26', textMuted: '#0d9488', border: '#a7f3d0'
    },
    dark: {
      primary: '#0d9488', secondary: '#a7f3d0', accent: '#a7f3d0',
      bg: '#02110f', surface: '#092522', surface2: '#113a35',
      text: '#ecfdf5', textMuted: '#a7f3d0', border: '#114a40'
    }
  },
  'b2b-steel': {
    id: 'b2b-steel',
    name: 'B2B Steel',
    category: 'Insumos Horeca B2B',
    light: {
      primary: '#475569', secondary: '#cbd5e1', accent: '#334155',
      bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9',
      text: '#0f172a', textMuted: '#475569', border: '#cbd5e1'
    },
    dark: {
      primary: '#475569', secondary: '#cbd5e1', accent: '#cbd5e1',
      bg: '#0f1422', surface: '#1d2338', surface2: '#2b3452',
      text: '#f8fafc', textMuted: '#cbd5e1', border: '#253155'
    }
  },
  'citrus-disinfectant': {
    id: 'citrus-disinfectant',
    name: 'Citrus Disinfectant',
    category: 'Insumos Horeca B2B',
    light: {
      primary: '#f97316', secondary: '#fed7aa', accent: '#ea580c',
      bg: '#fffcf9', surface: '#ffffff', surface2: '#ffefe0',
      text: '#3b1201', textMuted: '#ea580c', border: '#ffd8b3'
    },
    dark: {
      primary: '#f97316', secondary: '#fed7aa', accent: '#fed7aa',
      bg: '#170c04', surface: '#2d1a0e', surface2: '#452b1a',
      text: '#fffaf0', textMuted: '#fed7aa', border: '#5c2a07'
    }
  },
  'industrial-safety': {
    id: 'industrial-safety',
    name: 'Industrial Safety',
    category: 'Insumos Horeca B2B',
    light: {
      primary: '#eab308', secondary: '#fef08a', accent: '#ca8a04',
      bg: '#fffef6', surface: '#ffffff', surface2: '#fefcd6',
      text: '#3b2f02', textMuted: '#eab308', border: '#fef08a'
    },
    dark: {
      primary: '#eab308', secondary: '#fef08a', accent: '#fef08a',
      bg: '#151203', surface: '#28240b', surface2: '#3c3514',
      text: '#fdf9c3', textMuted: '#fde047', border: '#574d11'
    }
  },
  'eco-leaf': {
    id: 'eco-leaf',
    name: 'Eco Leaf',
    category: 'Insumos Horeca B2B',
    light: {
      primary: '#16a34a', secondary: '#86efac', accent: '#15803d',
      bg: '#f5faf6', surface: '#ffffff', surface2: '#e8f7ed',
      text: '#0b2e17', textMuted: '#16a34a', border: '#86efac'
    },
    dark: {
      primary: '#16a34a', secondary: '#86efac', accent: '#86efac',
      bg: '#051408', surface: '#0d2514', surface2: '#163d21',
      text: '#f0fdf4', textMuted: '#86efac', border: '#1b4d2c'
    }
  },
  'chemical-purple': {
    id: 'chemical-purple',
    name: 'Chemical Purple',
    category: 'Insumos Horeca B2B',
    light: {
      primary: '#7c3aed', secondary: '#ddd6fe', accent: '#6d28d9',
      bg: '#fbfaff', surface: '#ffffff', surface2: '#f5f2fe',
      text: '#21004a', textMuted: '#7c3aed', border: '#ddd6fe'
    },
    dark: {
      primary: '#7c3aed', secondary: '#ddd6fe', accent: '#ddd6fe',
      bg: '#0e051e', surface: '#1d0f3c', surface2: '#2c1959',
      text: '#f5f3ff', textMuted: '#ddd6fe', border: '#4a259c'
    }
  },
  'wholesale-wheat': {
    id: 'wholesale-wheat',
    name: 'Wholesale Wheat',
    category: 'Insumos Horeca B2B',
    light: {
      primary: '#b45309', secondary: '#ffedd5', accent: '#7c2d12',
      bg: '#fffbf7', surface: '#ffffff', surface2: '#ffede2',
      text: '#2e0f00', textMuted: '#b45309', border: '#ffd8c2'
    },
    dark: {
      primary: '#b45309', secondary: '#ffedd5', accent: '#ffedd5',
      bg: '#160e05', surface: '#2e190d', surface2: '#442b1a',
      text: '#fffbeb', textMuted: '#fdba74', border: '#5c2d0f'
    }
  },
  'pack-blue': {
    id: 'pack-blue',
    name: 'Pack Blue',
    category: 'Insumos Horeca B2B',
    light: {
      primary: '#0284c7', secondary: '#bae6fd', accent: '#0369a1',
      bg: '#f4faff', surface: '#ffffff', surface2: '#e0f2fe',
      text: '#032c45', textMuted: '#0284c7', border: '#bae6fd'
    },
    dark: {
      primary: '#0284c7', secondary: '#bae6fd', accent: '#bae6fd',
      bg: '#050f1a', surface: '#0e1c31', surface2: '#192e4d',
      text: '#f0f9ff', textMuted: '#bae6fd', border: '#103a61'
    }
  },
  'custom-brand': {
    id: 'custom-brand',
    name: 'Personalizado',
    category: 'Personalizado',
    light: {
      primary: 'var(--color-primary-custom, #0ea5e9)',
      secondary: 'var(--color-secondary-custom, #3b82f6)',
      accent: 'var(--color-primary-custom, #0ea5e9)',
      bg: 'var(--color-bg-custom, #ffffff)',
      surface: 'var(--color-surface-custom, #f8fafc)',
      surface2: 'var(--color-surface-2-custom, #f1f5f9)',
      text: 'var(--color-text-custom, #0f172a)',
      textMuted: 'var(--color-text-muted-custom, #64748b)',
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
      textMuted: 'var(--color-text-muted-custom-dark, #94a3b8)',
      border: 'var(--color-border-custom-dark, #1e3a5f)'
    }
  },
  'custom': {
    id: 'custom',
    name: 'Personalizado',
    category: 'Personalizado',
    light: {
      primary: 'var(--color-primary, #6366f1)',
      secondary: 'var(--color-primary-light, #818cf8)',
      accent: 'var(--color-accent, #a855f7)',
      bg: 'var(--color-bg, #f8fafc)',
      surface: 'var(--color-surface, #ffffff)',
      surface2: 'var(--color-surface-2, #f1f5f9)',
      text: 'var(--color-text, #0f172a)',
      textMuted: 'var(--color-text-muted, #475569)',
      border: 'var(--color-border, #cbd5e1)'
    },
    dark: {
      primary: 'var(--color-primary, #6366f1)',
      secondary: 'var(--color-primary-light, #818cf8)',
      accent: 'var(--color-accent, #a855f7)',
      bg: 'var(--color-bg, #0f172a)',
      surface: 'var(--color-surface, #1e293b)',
      surface2: 'var(--color-surface-2, #334155)',
      text: 'var(--color-text, #f8fafc)',
      textMuted: 'var(--color-text-muted, #cbd5e1)',
      border: 'var(--color-border, #334155)'
    }
  }
}

// Convertir las paletas estáticas a formato de inyección
export function getActiveColors(themeConfig, isDarkMode, activeSeasonalEvent = 'none') {
  if (themeConfig === 'custom' || themeConfig === 'custom-brand') {
    return {};
  }

  let baseColors = null;

  // Priorizar el evento de temporada si está activo y existe
  if (activeSeasonalEvent && activeSeasonalEvent !== 'none' && SEASONAL_EVENTS[activeSeasonalEvent]) {
    const eventPalette = SEASONAL_EVENTS[activeSeasonalEvent];
    baseColors = isDarkMode ? eventPalette.dark : eventPalette.light;
  }

  // Fallback a la paleta normal de la tienda si no hay evento activo
  if (!baseColors) {
    if (typeof themeConfig === 'string') {
      const palette = ADVANCED_PALETTES[themeConfig] || ADVANCED_PALETTES['zafiro-moderno'];
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
