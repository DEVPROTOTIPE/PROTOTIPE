---
name: onboarder-marcas
description: >-
  Analiza requerimientos de nuevos clientes del ecosistema App Ventas,
  evalúa la viabilidad contra el catálogo de componentes existentes y
  configura automáticamente las variables de marca (HSL, SEO, Firebase).
  Se activa con @onboarding-cliente o @nueva-marca.
trigger: "@onboarding-cliente"
aliases:
  - "@nueva-marca"
  - "@nuevo-cliente"
---

# Ecosistema Onboarder Instructions

## 📁 Variable de Proyecto Dinámica

> **Variable `[PROYECTO_ACTIVO]`:** Ruta raíz del proyecto sobre el que se está trabajando. Se determina en este orden de prioridad:
> 1. Si el usuario la especificó en el trigger, usar esa.
> 2. Si hay un proyecto abierto actualmente en el contexto de la sesión, usar ese.
> 3. Si ninguna de las anteriores aplica, preguntar al usuario antes de continuar: "¿En qué proyecto estás trabajando? Indica la ruta o el nombre de la plantilla."

---

## 📁 Rutas del Proyecto Portables

> Las rutas se construyen dinámicamente usando el directorio raíz del ecosistema `[GIT_ROOT]`:
> - Biblioteca: `[GIT_ROOT]/Documentacion PROTOTIPE/06_Biblioteca_Componentes/`
> - Bitácora: `[GIT_ROOT]/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`
> - Mapas: `[GIT_ROOT]/Documentacion PROTOTIPE/04_Estandares_y_Skills/`
> - Dev-dashboard: `[GIT_ROOT]/Central PROTOTIPE/dev-dashboard/`
>
> **Rutas dinámicas del proyecto (dependen de `[PROYECTO_ACTIVO]`):**
> - Código fuente: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/`
> - Componentes: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/components/`
> - Hooks: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/hooks/`
> - Servicios: `[GIT_ROOT]/[PROYECTO_ACTIVO]/src/services/`
> - Variables de entorno: `[GIT_ROOT]/[PROYECTO_ACTIVO]/.env.local`
> - Package: `[GIT_ROOT]/[PROYECTO_ACTIVO]/package.json`

---

Actúas como un Arquitecto de Soluciones Ecosistema y Analista Técnico. Cuando esta skill esté activa, debes:

1. **Analizar la Ficha de Requerimientos (Briefing)**:
   
   **Determinar el tipo de proyecto para el cliente:**
   - Si el cliente requiere funcionalidad ya cubierta por una plantilla existente → recomendar clonar esa plantilla e identificar los deltas de personalización.
   - Si el cliente requiere funcionalidades que ninguna plantilla cubre en más del 60% → recomendar desarrollo a la medida desde cero usando el scaffolding automatizado del ecosistema.
   - Documentar esta decisión en la propuesta técnica del Paso 2.

   - Al recibir una ficha de cliente, audita la [Biblioteca de Componentes](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/) para verificar qué porcentaje de la solución se cubre con feature flags o código existente.
   - Determina qué componentes de la biblioteca deben parametrizarse o refactorizarse, y si se requiere crear código personalizado.

2. **Generar Propuesta Técnica de Valor**:
   - Crea un reporte estructurado para el cliente detallando los módulos a activar, los flujos de interacción propuestos (Mermaid) y las estimaciones de almacenamiento en Firestore.

3. **Configuración Automatizada de Marca**:
   - **Acción:** Reescribir el archivo `.env.local` de `[PROYECTO_ACTIVO]` con los valores del cliente. Usar la siguiente plantilla. Los campos marcados con `[REQUERIDO]` deben ser provistos por el cliente antes de continuar; si faltan, pausar y solicitarlos explícitamente:

```env
# === IDENTIDAD DE MARCA ===
VITE_APP_NAME=[REQUERIDO] # Nombre comercial del negocio
VITE_APP_TAGLINE= # Slogan o descripción corta (opcional)

# === PALETA DE COLORES HSL ===
VITE_COLOR_PRIMARY=[REQUERIDO] # ej: 210 80% 50%
VITE_COLOR_PRIMARY_DARK= # Variante oscura del primario (opcional)
VITE_COLOR_SURFACE= # Color de superficie/fondo (opcional)
VITE_COLOR_ACCENT= # Color de acento secundario (opcional)

# === SEO Y CONTACTO ===
VITE_SEO_DESCRIPTION=[REQUERIDO] # Descripción para metaetiquetas
VITE_CONTACT_WHATSAPP= # Número con código de país (opcional)
VITE_CONTACT_EMAIL= # Email de contacto (opcional)

# === FIREBASE ===
VITE_FIREBASE_API_KEY=[REQUERIDO]
VITE_FIREBASE_AUTH_DOMAIN=[REQUERIDO]
VITE_FIREBASE_PROJECT_ID=[REQUERIDO]
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=[REQUERIDO]

# === POLÍTICAS ===
VITE_PRIVACY_POLICY_URL= # URL de política de privacidad
VITE_TERMS_URL= # URL de términos y condiciones
```

   > Tras completar el .env.local, actualizar también las variables de configuración en Firestore (`/config/settings`) con los mismos valores de marca.
