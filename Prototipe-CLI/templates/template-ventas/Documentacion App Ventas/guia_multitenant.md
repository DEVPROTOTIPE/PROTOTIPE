# 🎨 Guía de Personalización y Multi-Tenant - Core Ventas v2.0

El Core Ventas v2.0 está diseñado como una plantilla marca blanca (White Label) reutilizable y multitenant. Permite desplegar instancias independientes para múltiples clientes (ej. Barbería, App Ventas, App Moni) a partir de una única base lógica de código.

---

## ⚙️ 1. Configuración de Variables de Entorno (`.env.local`)

Cada instancia cliente se conecta a su propio backend o base de datos Firebase mediante variables de entorno configuradas en el archivo `.env.local` (o variables del hosting de producción):

```bash
# Identificación de la Instancia
VITE_TENANT_ID=app-moni
VITE_APP_NAME="Moni App"

# Configuración de Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

---

## 🎨 2. Personalización Visual y Sistema de Diseño (HSL)

El sistema de diseño de la aplicación está unificado mediante CSS con variables semánticas HSL. Esto permite alterar los colores de marca instantáneamente sin romper el contraste en modo claro/oscuro ni requerir refactorizaciones de CSS.

Para personalizar la marca, se configuran las variables en `index.css`:

```css
:root {
  /* Color Primario (ej. Verde Esmeralda para App Moni, Azul para Ventas) */
  --color-primary-hue: 142;        /* Tono HSL (0-360) */
  --color-primary-saturation: 70%; /* Saturación */
  --color-primary-lightness: 45%;  /* Luminosidad */

  /* Colores de Fondo y Superficie */
  --color-background: hsl(0, 0%, 98%);
  --color-surface: hsl(0, 0%, 100%);
  --color-border: hsl(0, 0%, 90%);
}
```

---

## 📂 3. Reemplazo de Recursos Físicos (Assets)

Cada cliente cuenta con sus propios recursos visuales en la carpeta `public/`:
1. **Logos:** Reemplazar `logo.png` y `logo-dark.png` con la identidad visual del tenant.
2. **Favicon:** Reemplazar `favicon.ico` y `apple-touch-icon.png`.
3. **PWA Manifest:** Editar `public/manifest.json` para ajustar el `short_name`, `name`, y los colores del tema de la aplicación móvil.

---

## 🛠️ 4. Feature Toggles (Configuración del Tenant)

El comportamiento y los flujos activos de la aplicación (ej. si se habilita el carrito de compras, costos de envío, o recomendaciones dinámicas) se administran en la base de datos Firestore dentro del documento de configuración del tenant (`tenants/{tenantId}`):

* **`deliveryEnabled`:** Activa/desactiva la opción de envío a domicilio en el checkout.
* **`creditEnabled`:** Habilita el pago mediante deudas/crédito personal de confianza ("fiar").
* **`cartRecsEnabled`:** Activa las recomendaciones automáticas de productos cruzados en el carrito de compras.
* **`deliveryCost`:** Costo base de entrega a domicilio.
