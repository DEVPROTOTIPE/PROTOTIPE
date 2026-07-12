import { useState, useEffect } from 'react';
import useAppConfigStore from '../store/appConfigStore';

/**
 * Hook utilitario que lee una variable de color CSS del DOM y calcula
 * la luminancia relativa para retornar la clase de contraste óptima (text-white o text-black).
 */
export default function useColorContrast(cssVarName = '--color-primary') {
  const [textClass, setTextClass] = useState('text-white');
  const theme = useAppConfigStore((state) => state.theme);
  const actionColor = useAppConfigStore((state) => state.actionColor);

  useEffect(() => {
    const root = document.documentElement;
    let colorValue = getComputedStyle(root).getPropertyValue(cssVarName).trim();
    
    // Fallback de seguridad si está vacío
    if (!colorValue) {
      if (cssVarName === '--color-primary') colorValue = '#0ea5e9';
      else return;
    }

    const getContrast = (colorStr) => {
      if (!colorStr) return 'text-white';

      // 1. Si es formato RGB/RGBA
      if (colorStr.startsWith('rgb')) {
        const match = colorStr.match(/\d+/g);
        if (match && match.length >= 3) {
          const r = parseInt(match[0]);
          const g = parseInt(match[1]);
          const b = parseInt(match[2]);
          const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          const l = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
          return l > 0.179 ? 'text-black' : 'text-white';
        }
      }

      // 2. Si es formato Hexadecimal
      let cleanHex = colorStr.replace('#', '').trim();
      if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
      }
      if (cleanHex.length === 6) {
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        const a = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        const l = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
        return l > 0.179 ? 'text-black' : 'text-white';
      }

      // Default fallback
      return 'text-white';
    };

    setTextClass(getContrast(colorValue));
  }, [theme, actionColor, cssVarName]);

  return textClass;
}
