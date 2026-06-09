# 📦 Catálogo de Repositorios y Librerías Útiles — Prototipe Ecosistema

**Propósito:** Repositorio vivo de librerías open source, repos de GitHub y herramientas externas evaluadas como recursos de referencia para el desarrollo del ecosistema Prototipe y sus verticales.

**Uso para agentes IA:**
- Consultar estratégicamente cuando se necesite implementar una funcionalidad específica.
- No copiar código directamente. Usar como **guía de adaptación** al stack y contexto del proyecto.
- Verificar siempre compatibilidad con el stack activo: React 19 · Vite · Tailwind CSS v4 · Firebase SDK v12 · Zustand v5.

---

## 🗂️ ÍNDICE POR CATEGORÍA

1. [Componentes UI](#-1-componentes-ui-de-alta-calidad)
2. [Gestión de Estado y Formularios](#-2-gestión-de-estado-y-formularios)
3. [Animaciones y Microinteracciones](#-3-animaciones-y-microinteracciones)
4. [Generación de PDFs y Reportes](#-4-generación-de-pdfs-y-reportes)
5. [Pasarelas de Pago](#-5-pasarelas-de-pago)
6. [PWA, Performance y Offline-First](#-6-pwa-performance-y-offline-first)
7. [Feature Flags y Configuración](#-7-feature-flags-y-configuración)
8. [Notificaciones y Comunicación](#-8-notificaciones-y-comunicación)
9. [Visualización de Datos](#-9-visualización-de-datos)
10. [Onboarding y UX Guiada](#-10-onboarding-y-ux-guiada)
11. [Herramientas de Diseño y Tokens](#-11-herramientas-de-diseño-y-tokens)

---

## 🎨 1. Componentes UI de Alta Calidad

### shadcn/ui
- **Repositorio:** https://github.com/shadcn-ui/ui
- **Instalación:** `npx shadcn@latest add [component]`
- **Compatibilidad stack:** ✅ React 19 + Tailwind CSS v4
- **Descripción:** CLI que copia el código fuente de componentes directamente en el repo (no es una librería npm tradicional). Construido sobre Radix UI (accesibilidad) + Tailwind. Al poseer el código fuente, se pueden aplicar los tokens de marca sin dependencias externas.
- **Uso estratégico:** Base de referencia para componentes atómicos (botones, inputs, dropdowns, modals, toasts). Guiarse de su código para crear componentes equivalentes en la Biblioteca del proyecto.

---

### HeroUI (ex-NextUI)
- **Repositorio:** https://github.com/heroui-inc/heroui
- **Instalación:** `npm install @heroui/react`
- **Compatibilidad stack:** ✅ Tailwind v4 + React 19
- **Descripción:** Librería de componentes de alto rendimiento basada en Tailwind CSS y React Aria. Énfasis en accesibilidad y animaciones fluidas out-of-the-box. Soporte nativo para temas mediante CSS variables.
- **Uso estratégico:** Referencia para componentes POS complejos: tablas de inventario, selectores de productos, modales de pago. Su arquitectura de temas via CSS variables es análoga al sistema de paletas del proyecto.

---

### daisyUI
- **Repositorio:** https://github.com/saadeghi/daisyui
- **Instalación:** `npm install daisyui`
- **Compatibilidad stack:** ✅ Plugin CSS puro, sin conflicto con React 19
- **Descripción:** Plugin de Tailwind CSS que agrega clases semánticas (`.btn`, `.card`, `.badge`). Agnóstico al framework, opera a nivel CSS puro.
- **Uso estratégico:** Prototipado rápido de nuevos verticales. Permite construir UI funcional en horas sin sacrificar identidad visual. Referencia para clases semánticas al diseñar el sistema de componentes propio.

---

## 🧠 2. Gestión de Estado y Formularios

### TanStack Query v5
- **Repositorio:** https://github.com/TanStack/query
- **Instalación:** `npm install @tanstack/react-query`
- **Compatibilidad stack:** ✅ React 19
- **Descripción:** Estándar 2025 para estado de servidor. Maneja caché, re-fetching automático y estados de carga/error. Se complementa con Zustand (ya instalado) para separar estado servidor del estado UI.
- **Uso estratégico:** Referencia para patrones de caché inteligente de Firestore. Guiarse de su API para implementar caché local sin necesidad de instalar la librería si Firestore SDK ya cubre el caso.

---

### React Hook Form + Zod
- **Repositorios:** https://github.com/react-hook-form/react-hook-form · https://github.com/colinhacks/zod
- **Instalación:** `npm install react-hook-form zod @hookform/resolvers`
- **Compatibilidad stack:** ✅ Total
- **Descripción:** Estándar de industria para formularios tipados y validación declarativa. Zod define el esquema; `zodResolver` lo conecta con RHF.
- **Uso estratégico:** Referencia para validación robusta en formularios de onboarding de clientes, registro de productos y checkout. Los schemas Zod pueden reutilizarse en Cloud Functions para validación server-side.

---

## ✨ 3. Animaciones y Microinteracciones

### Framer Motion (Motion)
- **Repositorio:** https://github.com/framer/motion
- **Instalación:** `npm install framer-motion`
- **Compatibilidad stack:** ✅ React 19 — **YA INSTALADO EN App Ventas**
- **Descripción:** Librería declarativa de animaciones para React. API prop-based (`animate`, `initial`, `exit`). Soporte para drag-and-drop, layout animations y AnimatePresence.
- **Uso estratégico:** Ya en uso en el proyecto. Referencia para animaciones de carrito, transiciones de checkout multipaso, toasts de confirmación y hover en tarjetas de producto.

---

### React Spring
- **Repositorio:** https://github.com/pmndrs/react-spring
- **Instalación:** `npm install @react-spring/web`
- **Compatibilidad stack:** ✅ React 19
- **Descripción:** Animaciones basadas en física (mass, tension, friction). Produce movimientos más orgánicos. API hook-driven.
- **Uso estratégico:** Alternativa a Framer Motion para componentes críticos de rendimiento que necesiten movimiento físico preciso (sliders de precio, contadores animados de ventas).

---

## 📄 4. Generación de PDFs y Reportes

### @react-pdf/renderer
- **Repositorio:** https://github.com/diegomura/react-pdf
- **Instalación:** `npm install @react-pdf/renderer`
- **Compatibilidad stack:** ✅ React 19
- **Descripción:** Genera PDFs con componentes React nativos (`Document`, `Page`, `View`, `Text`). Texto seleccionable, layout preciso, fuentes personalizadas.
- **Uso estratégico:** Referencia para facturas/recibos en PDF, reportes de ventas, reportes de inventario exportables. Preferir sobre jsPDF para documentos multipágina con requisitos de accesibilidad.

---

### jsPDF + html2canvas
- **Repositorios:** https://github.com/parallax/jsPDF · https://github.com/niklasvh/html2canvas
- **Instalación:** `npm install jspdf html2canvas` — **YA INSTALADO EN App Ventas**
- **Descripción:** Captura el DOM como canvas y lo embebe en un PDF. Rápido para capturas simples.
- **Uso estratégico:** Ya en uso. Adecuado para tickets de venta y comprobantes simples. No usar para documentos con requisitos legales o de accesibilidad.

---

## 💳 5. Pasarelas de Pago

### @mercadopago/sdk-react
- **Repositorio:** https://github.com/mercadopago/sdk-react
- **Instalación:** `npm install @mercadopago/sdk-react`
- **Compatibilidad stack:** ✅ React 19
- **Descripción:** SDK oficial de Mercado Pago para React. Componentes "Bricks" pre-construidos. Tokeniza datos de tarjeta en el cliente.
- **Uso estratégico:** Módulo de cobro con tarjeta/débito para verticales de ropa, restaurantes, barberías.

---

### Stripe (react-stripe-js)
- **Repositorios:** https://github.com/stripe/react-stripe-js · https://github.com/stripe/stripe-js
- **Instalación:** `npm install @stripe/stripe-js @stripe/react-stripe-js`
- **Descripción:** SDKs oficiales de Stripe. `Elements` garantiza PCI compliance.
- **Uso estratégico:** Clientes que requieren pagos internacionales o procesamiento en USD.

---

### Wompi Widget (integración manual)
- **Documentación:** https://docs.wompi.co/
- **Instalación:** Carga dinámica del script `https://checkout.wompi.co/widget.js` en `useEffect`. No tiene npm.
- **Descripción:** Wompi (Bancolombia). Acepta PSE, Nequi, tarjetas, Efecty.
- **Uso estratégico:** ⭐ **Primera opción recomendada para Colombia.** Integración nativa con PSE y Nequi — métodos con mayor adopción en pequeños negocios.

---

## ⚡ 6. PWA, Performance y Offline-First

### vite-plugin-pwa
- **Repositorio:** https://github.com/vite-pwa/vite-plugin-pwa
- **Instalación:** `npm install vite-plugin-pwa -D` — **YA INSTALADO EN App Ventas**
- **Compatibilidad stack:** ✅ Diseñado específicamente para Vite
- **Descripción:** Plugin oficial de Vite para generar Service Workers con Workbox. Background Sync para operaciones offline.
- **Uso estratégico:** Ya en uso. Crítico para conectividad inestable en Colombia. Ventas offline se sincronizan automáticamente cuando vuelve la conexión.

---

### Workbox Background Sync
- **Repositorio:** https://github.com/GoogleChrome/workbox
- **Descripción:** Librería de Google para Service Workers. `BackgroundSyncPlugin` encola requests fallidos y los reintenta al recuperar conexión.
- **Uso estratégico:** Encolamiento de transacciones de venta sin internet. El tendero puede registrar ventas toda la jornada y sincronizar al final.

---

## 🚩 7. Feature Flags y Configuración

### GrowthBook (open source)
- **Repositorio:** https://github.com/growthbook/growthbook
- **Instalación:** `npm install @growthbook/growthbook-react`
- **Compatibilidad stack:** ✅ React 19
- **Descripción:** Plataforma open source de feature flags y A/B testing. Auto-hosteable con Docker. Hook `useFeatureIsOn('feature-name')`.
- **Uso estratégico:** Evaluar a partir de 30+ clientes activos. Para la arquitectura multitenant actual (Firestore), el sistema propio es suficiente. GrowthBook agrega valor cuando se quiera medir impacto de features con A/B testing real.

---

### Flagsmith (open source)
- **Repositorio:** https://github.com/Flagsmith/flagsmith
- **Instalación:** `npm install flagsmith`
- **Descripción:** Plataforma de feature flags con remote config. Auto-hosteable. SDK ligero.
- **Uso estratégico:** Gestión centralizada de feature flags cuando Prototipe supere los 20+ clientes activos.

---

## 🔔 8. Notificaciones y Comunicación

### Firebase Cloud Messaging (FCM)
- **Documentación:** https://firebase.google.com/docs/cloud-messaging
- **Descripción:** Sistema de push notifications de Google. Web (Service Worker), Android e iOS. **YA INTEGRADO EN App Ventas.**
- **Uso estratégico:** Alertas de stock crítico, nueva venta en tiempo real, resumen nocturno de ventas.

---

### Green API para WhatsApp
- **Instalación:** `npm install @green-api/whatsapp-api-client`
- **Descripción:** Cliente para Green API — envío de mensajes WhatsApp Business via REST desde Cloud Functions.
- **Uso estratégico:** Recibos de venta por WhatsApp al cliente final, recuperación de carritos abandonados, confirmación de pedidos. Arquitectura: `Cloud Function (Firestore trigger) → Green API → WhatsApp del cliente`.

---

## 📊 9. Visualización de Datos

### Recharts
- **Repositorio:** https://github.com/recharts/recharts
- **Instalación:** `npm install recharts`
- **Compatibilidad stack:** ✅ React 19
- **Descripción:** Librería de gráficos composable para React basada en SVG. La más popular para dashboards. shadcn/ui la usa internamente.
- **Uso estratégico:** Dashboard de ventas diarias/semanales/mensuales, gráfico de productos más vendidos, distribución de métodos de pago.

---

### Nivo
- **Repositorio:** https://github.com/plouc/nivo
- **Instalación:** `npm install @nivo/core @nivo/bar @nivo/line`
- **Descripción:** Suite de visualización SVG/Canvas/HTML. Mayor variedad que Recharts. Excelente estética out-of-the-box.
- **Uso estratégico:** Reportes avanzados: heatmaps de ventas por hora del día, gráficos de embudo de conversión.

---

## 🧭 10. Onboarding y UX Guiada

### Driver.js
- **Repositorio:** https://github.com/kamranahmedse/driver.js
- **Instalación:** `npm install driver.js`
- **Descripción:** Librería minimalista (~5KB) para tours guiados y highlights de elementos DOM. Sin dependencias. MIT License.
- **Uso estratégico:** Tour de primer uso para nuevos vendedores, highlights de nuevas features al actualizar la app.

---

### React Joyride
- **Repositorio:** https://github.com/gilbarbara/react-joyride
- **Instalación:** `npm install react-joyride`
- **Descripción:** Librería React-nativa para tours guiados paso a paso. Control total del estado del tour.
- **Uso estratégico:** Flujo de onboarding de configuración inicial: Paso 1 → Agrega tu primer producto · Paso 2 → Configura método de pago · Paso 3 → Realiza tu primera venta de prueba.

---

## 🎨 11. Herramientas de Diseño y Tokens

### Style Dictionary (Amazon)
- **Repositorio:** https://github.com/amzn/style-dictionary
- **Descripción:** Herramienta para sincronizar design tokens desde Figma hacia código (CSS, JS, Android, iOS). Compatible con la arquitectura de 3 capas de tokens del proyecto.
- **Uso estratégico:** Cuando el proyecto escale a un equipo de diseño con Figma como fuente de verdad para la paleta de colores.

---

## 📌 INSTRUCCIONES PARA AGENTES IA

> **Cómo usar este catálogo:**
> 1. Identifica la categoría de funcionalidad que necesitas implementar.
> 2. Consulta el repositorio listado como **referencia técnica**, no como dependencia directa.
> 3. Verifica si la librería ya está instalada en `package.json` del proyecto antes de proponer instalarla.
> 4. Adapta la lógica al stack existente (React 19, Tailwind v4, Firebase, Zustand).
> 5. **Nunca** copies código de un repositorio externo sin adaptarlo al sistema de diseño y arquitectura del proyecto.
> 6. Si un repositorio resuelve perfectamente una necesidad y se decide instalarlo, documentar la decisión en `bitacora_cambios.md`.
