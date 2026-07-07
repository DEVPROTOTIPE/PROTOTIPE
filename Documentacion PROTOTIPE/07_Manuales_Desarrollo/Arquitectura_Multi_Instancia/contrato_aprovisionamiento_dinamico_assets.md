# 🚢 Contrato de Aprovisionamiento Dinámico de Assets, PWA y Marca Blanca

Define las reglas de inyección automática de identidad visual, generación de PWAs multi-tenant y configuraciones por lotes del ecosistema.

---

## 1. Carga e Inyección Cromática HSL
El generator toma la paleta HSL definida en el manifest de la instancia y re-escribe el bloque de variables de la hoja de estilos global:

```css
:root {
  --color-primary: 220 89% 56%;   /* Inyectado dinámicamente */
  --color-secondary: 200 40% 40%;
  --color-radius: 1rem;
}
```;

---

## 2. Aprovisionamiento PWA
El script de aprovisionamiento lee el logo base cargado en `/api/upload-logo`, ejecuta una compresión y redimensionamiento multiescala en Node.js, y genera el conjunto de assets obligatorios en la carpeta pública del cliente:
*   `favicon.ico`
*   `icon-192.png`
*   `icon-512.png`
*   `manifest.json` (con nombre, temas y categorías autoinyectadas).

---

## 3. Variables de Entorno y Configuración de Firebase
El backend del CLI Bridge autogenera el archivo de entorno definitivo `.env.local` inyectando los tokens correspondientes al proyecto de Firebase del cliente seleccionado en el Wizard.
