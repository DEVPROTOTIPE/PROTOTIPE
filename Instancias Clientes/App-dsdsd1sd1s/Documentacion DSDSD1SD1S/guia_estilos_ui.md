# 🎨 Guía de Estilos UI — DSDSD1SD1S

> La IA debe respetar estos tokens antes de agregar cualquier color, tipografía o espaciado.

## Paleta de Colores Completa (HSL — pre-configurada en aprovisionamiento)
| Token CSS | Valor configurado |
|---|---|
| `--color-primary` | `hsl(126, 6%, 32%)` |
| `--color-accent` | `hsl(2, 15%, 59%)` |
| `--color-bg` | `hsl(197, 54%, 97%)` |
| `--color-text` | `hsl(255, 10%, 8%)` |
| `--color-surface` | `hsl(0, 0%, 100%)` |
| `--color-surface-2` | `hsl(210, 40%, 96%)` |
| `--color-border` | `hsl(213, 27%, 84%)` |
| `--color-text-muted` | `hsl(215, 19%, 35%)` |
| `--radius-base` | `0.75rem` |

> ⚠️ Estos valores ya están inyectados en `src/index.css`. NUNCA usar colores hardcodeados fuera del sistema de tokens.

## Tipografía
- **Google Font:** `Inter`
- **Escala:** base 14px (móvil) / 16px (escritorio)

## Tokens de Diseño
| Token | Valor |
|---|---|
| Radius base | `0.75rem` |
| Radius botones | `0.5rem` |
| Shadow tarjetas | `0 4px 24px hsl(var(--color-primary)/0.15)` |
| Glassmorphism | `backdrop-blur-xl bg-[var(--color-surface)]/80` |

## Componentes Atómicos Disponibles
- `/src/components/ui/` — Consultar antes de crear nuevos elementos base
- `/src/components/common/` — Componentes de dominio reutilizables

## Convenciones de IDs y Clases
- IDs en kebab-case descriptivo: `btn-confirm-sale`, `input-product-name`
- No usar IDs genéricos como `btn1`, `div2`
- Usar siempre `var(--color-*)` en lugar de colores Tailwind directos


## 📦 Componentes de Biblioteca Pre-Instalados (¡Listos para usar!)
Los siguientes componentes ya existen físicamente en el proyecto. **Queda prohibido volver a crearlos**. Utilízalos directamente importándolos en tus vistas:

- **AccordionInteractiveFilter** (`AccordionInteractiveFilter`): Listo para importar desde:
  `import AccordionInteractiveFilter from '@/components/common/AccordionInteractiveFilter';` (o ruta relativa equivalente).
- **ToastNotification** (`ToastNotification`): Listo para importar desde:
  `import ToastNotification from '@/components/ui/ToastNotification';` (o ruta relativa equivalente).
- **ProgressCircleRing** (`ProgressCircleRing`): Listo para importar desde:
  `import ProgressCircleRing from '@/components/common/ProgressCircleRing';` (o ruta relativa equivalente).
- **BorderBeamBadge** (`BorderBeamBadge`): Listo para importar desde:
  `import BorderBeamBadge from '@/components/common/BorderBeamBadge';` (o ruta relativa equivalente).
- **AnimatedNotificationBadge** (`AnimatedNotificationBadge`): Listo para importar desde:
  `import AnimatedNotificationBadge from '@/components/common/AnimatedNotificationBadge';` (o ruta relativa equivalente).
- **AnimatedNavbarMobile** (`AnimatedNavbarMobile`): Listo para importar desde:
  `import AnimatedNavbarMobile from '@/components/common/AnimatedNavbarMobile';` (o ruta relativa equivalente).
- **PdfService** (`PdfService`): Listo para importar desde:
  `import PdfService from '@/utils/PdfService';` (o ruta relativa equivalente).
- **GeneracionPdf** (`GeneracionPdf`): Listo para importar desde:
  `import GeneracionPdf from '@/features/common/services/pdfGenerationService';` (o ruta relativa equivalente).
- **MagneticParallaxButton** (`MagneticParallaxButton`): Listo para importar desde:
  `import MagneticParallaxButton from '@/components/common/MagneticParallaxButton';` (o ruta relativa equivalente).
- **PinCodeInput** (`PinCodeInput`): Listo para importar desde:
  `import PinCodeInput from '@/components/common/PinCodeInput';` (o ruta relativa equivalente).
- **AnimatedPasswordInput** (`AnimatedPasswordInput`): Listo para importar desde:
  `import AnimatedPasswordInput from '@/components/ui/AnimatedPasswordInput';` (o ruta relativa equivalente).
- **PlaceholderVanishInput** (`PlaceholderVanishInput`): Listo para importar desde:
  `import PlaceholderVanishInput from '@/components/common/PlaceholderVanishInput';` (o ruta relativa equivalente).
- **SliderNumericInput** (`SliderNumericInput`): Listo para importar desde:
  `import SliderNumericInput from '@/components/common/SliderNumericInput';` (o ruta relativa equivalente).
- **InlineChipPickerInput** (`InlineChipPickerInput`): Listo para importar desde:
  `import InlineChipPickerInput from '@/components/common/InlineChipPickerInput';` (o ruta relativa equivalente).
- **DualSliderRange** (`DualSliderRange`): Listo para importar desde:
  `import DualSliderRange from '@/components/common/DualSliderRange';` (o ruta relativa equivalente).
- **CustomSelect** (`CustomSelect`): Listo para importar desde:
  `import CustomSelect from '@/components/ui/CustomSelect';` (o ruta relativa equivalente).
