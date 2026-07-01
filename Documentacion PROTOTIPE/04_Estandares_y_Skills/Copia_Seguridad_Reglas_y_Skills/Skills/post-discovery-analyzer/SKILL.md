---
name: post-discovery-analyzer
description: >-
  Genera el plan de inyección detallado, mapeo de dependencias físicas y NPM,
  y variables de entorno para configurar el cliente post-descubrimiento en
  el dashboard. Se activa con @post-discovery-analyzer.
trigger: "@post-discovery-analyzer"
aliases:
  - "@analizar-post-discovery"
  - "@plan-inyeccion"
---

# Skill: Post-Discovery Analyzer (Diseño del Plan de Inyección)

Esta skill analiza la viabilidad del Briefing Studio y estructura el plan de inyección de componentes detallado paso a paso para el cliente, sirviendo de puente con la API de inyección del CLI.

---

## 📁 Variables del Entorno Portables

> **Variable `[CLIENTE_WIZARD]`:** Nombre de la instancia destino (ej. `ventas-smartfix`).
> **Variable `[BRIEFING_JSON]`:** Snapshot del JSON de respuestas de preventa.

---

## ⚙️ Flujo Operativo de la Skill

Al activarse con el trigger `@post-discovery-analyzer`, la IA debe realizar los siguientes pasos de forma estrictamente secuencial:

### Paso 1: Mapear Módulos a Fichas Físicas de Componentes
1. Identificar qué fichas `.md` de la carpeta [Biblioteca de Componentes](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/) cubren las necesidades del cliente.
2. Resolver el árbol de dependencias físicas internas (`dependencies.internal`) y dependencias de paquetes de Node (`dependencies.npm`) declaradas en las cabeceras JSON de cada ficha.

### Paso 2: Diseño de Variables de Entorno (.env.local)
1. Detectar todas las variables de entorno (`import.meta.env.VITE_*`) necesarias para habilitar la lógica en caliente de los componentes sugeridos:
   - ej. `VITE_ENABLE_DIAN_BILLING`, `VITE_CREDITS_ENABLED`, `VITE_MAPS_API_KEY`.
2. Generar el snippet exacto del bloque de variables de entorno para inyectar al cliente.

### Paso 3: Plan de Integración en el Cliente
1. Estructurar el orden secuencial de inyección de dependencias para evitar colisiones:
   - **Nivel 1:** Componentes atómicos de UI y hooks sin dependencias de base de datos.
   - **Nivel 2:** Servicios de Firebase y adaptadores de Firestore.
   - **Nivel 3:** Módulos de lógica y controladores de estado (Zustand/Contexts).
   - **Nivel 4:** Vistas y dashboards de administrador.
2. Escribir el plan de ejecución y autocuración cromática (CSS Doctor) del archivo `index.css`.

---

## 📄 Formato del Plan de Inyección Técnico

La skill debe emitir el plan de inyección en el siguiente formato markdown:

```markdown
# PLAN DE INYECCIÓN TÉCNICA: [Nombre Cliente]
**Proyecto Destino:** [Ruta del Cliente] | **Estado de Preflight:** [Validado | Requiere Ajustes]

## 📋 Resumen de Dependencias NPM Requeridas
*Correr antes del despliegue:*
```bash
cmd /c npm install [paquete1] [paquete2]
```

## 🪜 Secuencia de Inyección de Archivos
1. **[UI] `CustomSelect`** -> Destino: `/src/components/ui/CustomSelect.jsx`
2. **[Hook] `useFirestoreCollection`** -> Destino: `/src/hooks/useFirestoreCollection.js`
3. **[Módulo] `CajaDiariaPOS`** -> Destino: `/src/components/admin/inventory/CajaDiariaPOS.jsx`

## 🔑 Variables a Inyectar en `.env.local`
```env
# Mapeado por Post-Discovery:
VITE_CREDITS_ENABLED=true
VITE_ENABLE_DIAN_BILLING=false
```

## 🎨 Tokenización de Marca (HSL)
```css
/* Inyectar mediante CSS Doctor al final de index.css: */
:root {
  --color-primary: [Color Primario HSL];
  --color-surface: [Color Superficie HSL];
}
```
```
