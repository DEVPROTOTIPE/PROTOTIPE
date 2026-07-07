# 🏗️ Especificación y Requisitos para Nuevos Cores de Oro

Este estándar define los requisitos estructurales obligatorios que debe cumplir cualquier nueva plantilla de aplicación (Core) para ser compatible con el motor de aprovisionamiento del CLI y el dashboard central.

---

## 1. Estructura Física Requerida
Toda plantilla Core en `Plantillas Core/` debe poseer de forma mandatoria los siguientes archivos y carpetas:

```
[CoreName]/
├── .env.example              # Plantilla de variables de entorno (sin secretos)
├── core-manifest.json        # Archivo de configuración técnica de la plantilla
├── package.json              # Configuración NPM y scripts base
├── firestore.rules           # Reglas de seguridad locales
├── firestore.indexes.json    # Índices compuestos
├── vite.config.js            # Configuración de empaquetado Vite
└── src/
    ├── main.jsx              # Punto de entrada de la aplicación
    ├── App.jsx               # Layout y enrutamiento reactivo
    ├── components/
    │   ├── ui/
    │   │   └── CustomSelect.jsx  # Selector estándar del sistema
    │   └── common/
    │       └── AlertConfirmContext.jsx # Modal promesificado de confirmación
    ├── hooks/
    ├── services/
    ├── store/
    └── utils/
```;

---

## 2. Contrato del core-manifest.json
El archivo de metadatos debe declarar de forma explícita el comportamiento del Core:

```json
{
  "coreKey": "app-reservas",
  "coreName": "App Reservas y Citas",
  "version": "1.0.0",
  "requiredEnv": [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET"
  ],
  "pwa": {
    "name": "Prototype Reservas",
    "shortName": "Reservas",
    "themeColor": "#4f46e5"
  }
}
```;

---

## 3. Sanitización de Código de Oro
Queda prohibida la persistencia de API Keys reales en la plantilla. El script de compilación del CLI reemplaza los tokens reales por placeholders. Todo conector del SDK de Firebase debe inicializarse consumiendo variables `import.meta.env`.
