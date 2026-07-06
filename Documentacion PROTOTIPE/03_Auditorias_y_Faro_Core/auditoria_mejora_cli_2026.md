# Informe de Auditoría Técnica: Puntos de Mejora y Optimización en Prototipe-CLI

Este reporte detalla los cuellos de botella lógicos, brechas de automatización y vulnerabilidades remanentes en la carpeta `Prototipe-CLI`, proponiendo mejoras arquitectónicas concretas para lograr una generación de aplicaciones (desde Core o desde 0) con el mínimo esfuerzo humano y la máxima precisión semántica.

---

## ⚡ 1. Diagnóstico y Oportunidades de Automatización (Brecha Técnica)

### [MEDIO] Dependencia de Logins Locales y Fallos Silenciosos (Preflight Check)
* **Ubicación:** [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L65-L109) (`checkEnvironment`)
* **Causa Raíz:** El generador valida que las herramientas CLI estén en el PATH (`firebase`, `gh`), pero no verifica la sesión de Firebase hasta que se ejecuta el scaffold. Si las credenciales locales han expirado, el proceso falla a mitad de camino y deja el disco en un estado inconsistente.
* **Solución Concreta:** Implementar un endpoint `/api/cli/preflight` que devuelva un estado completo de conectividad (Firebase login, GitHub token, git config, espacio libre en disco). El Dashboard bloqueará el envío de creación si detecta estados en rojo.

### [MEDIO] Semillado Genérico de Base de Datos (Falta de Contextualización Real)
* **Ubicación:** [generator.js](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L485-L498) (`seed_brand.js`)
* **Causa Raíz:** El script de siembra lee `niche.json` y carga artículos hardcodeados de ejemplo (ej. si es retail, inyecta productos planos de ropa). Si el cliente real vende calzado deportivo o comida orgánica, la app requiere edición manual de inventario inmediatamente.
* **Solución Concreta:** Conectar el generador con la API de Gemini. La IA interpretará los "requerimientos especiales" del briefing y generará un JSON estructurado con **15 registros de negocio 100% realistas** (categorías, nombres, descripciones de productos y precios específicos para ese cliente). El inyector escribirá este payload directamente a Firestore.

---

## 🛠️ 2. Propuesta de Motores Avanzados (Exact-Fit Engine)

Para reducir a cero la escritura de código en desarrollos a medida (desde cero o adaptando cores), se propone integrar tres micro-servicios en el pipeline de `generator.js`:

### Módulo A: Auto-Inyector de la Biblioteca (Dependency Resolver)
* **Mecánica:** En el Onboarding, el desarrollador selecciona módulos necesarios (ej: `Caja_Diaria_POS`, `Stepper_Pedidos`).
* **Automatización:** El CLI copia de forma recursiva los archivos desde `/Documentacion PROTOTIPE/06_Biblioteca_Componentes/[Componente]/` hacia el subproyecto del cliente, actualiza su `package.json` si tiene librerías externas (ej: `jspdf` o `lucide-react`) y auto-registra las rutas físicas en `src/routes/AppRoutes.jsx` mediante inserción ast o regex controladas.

### Módulo B: Schema and CRUD Builder (Creación desde Semilla)
* **Mecánica:** Para apps creadas desde `core-seed`, el asistente permite declarar colecciones y campos con sus respectivos tipos de datos.
* **Automatización:** El CLI compilará estos inputs y escribirá en la instancia del cliente:
  1. Esquemas de validación Zod en `/src/schemas/`.
  2. Hooks CRUD de consulta en `/src/hooks/` vinculados a TanStack Query y Firestore.
  3. Pantallas CRUD reactivas básicas para gestionar dichos registros desde el panel administrativo.

### Módulo C: Sanitizador de Seguridad & Command Arguments (Protección ante Inyección)
* **Mecánica:** Sustituir la concatenación de strings en las llamadas de consola por arrays estructurados en la función `spawn` o mediante el uso de librerías especializadas en sanitización de argumentos.
* **Automatización:** Evita la necesidad de usar `sanitizeShellArgument` manuales al eliminar la invocación de `cmd.exe` / `/bin/sh` como envoltorio de ejecución de herramientas del sistema.

---

## 📋 3. Matriz de Prioridad para Implementación

| Módulo | Tipo | Severidad / Impacto | Causa Raíz a Mitigar | Esfuerzo de Código |
|---|---|---|---|---|
| **AI Data Seeder** | Automatización | 🟢 Alta (UX Premium) | App inicial con productos falsos o vacía | Bajo (Llamada HTTP a Gemini + REST Firestore) |
| **Biblioteca Injector** | Productividad | 🟢 Alta (Cero copy/paste) | Copiar componentes de la biblioteca manualmente | Medio (Copia recursiva y regex en router) |
| **Preflight API** | Estabilidad | 🟡 Media (Evita crash) | Scaffolding fallido por falta de credenciales de red | Bajo (Comandos rápidos JSON en server.js) |
| **CRUD Auto-Builder** | Productividad | 🔴 Alta (Cero código) | Escribir pantallas de gestión manuales en apps de cero | Alto (Compilador de código dinámico React) |
