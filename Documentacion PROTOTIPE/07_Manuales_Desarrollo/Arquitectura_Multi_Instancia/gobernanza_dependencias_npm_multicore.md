# 📦 Gobernanza de Dependencias NPM y Gestión de Drift Multi-Core

Este manual especifica las políticas de control y paridad de paquetes NPM para mantener la cohesión en el monorepo y evitar regresiones en builds de producción.

---

## 1. Bloqueo de Versiones y Dependencias Comunes
Las librerías core comunes del sistema (React, Vite, Tailwind CSS, Framer Motion) deben sincronizar su versión de forma estricta en el monorepo.
*   **React:** ^19.2.6
*   **Vite:** ^8.0.12

---

## 2. Aislamiento de Dependencias Específicas
Si un Core requiere un paquete de NPM exclusivo (ej. Leaflet en una app de entregas), este debe instalarse únicamente en el subdirectorio de la plantilla correspondiente, quedando prohibida su inyección en la raíz del monorepo.

---

## 3. Operación del NPM Drift Analyzer
El endpoint `/api/project/drift` evalúa:
1.  `missingDeps`: Dependencias exigidas por la plantilla ausentes en el package.json de la instancia.
2.  `mismatchDeps`: Desajuste de versiones SemVer de librerías comunes.
3.  `addedDeps`: Dependencias de terceros agregadas localmente por el cliente no avaladas.
