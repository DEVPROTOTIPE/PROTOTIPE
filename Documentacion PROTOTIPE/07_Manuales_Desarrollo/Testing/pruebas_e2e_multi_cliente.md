# Estándar de Pruebas E2E Multi-Cliente con Playwright (Propuesta de Escalabilidad)

Para hacer que nuestra suite de pruebas Playwright escale de manera transparente a múltiples clientes independientes y se adapte al contexto específico de cada aplicación (Retail, Gastronomía, Servicios, etc.) sin tener que escribir o modificar código de pruebas a mano, se propone la siguiente arquitectura basada en **Parametrización por Nicho** y **Page Object Model (POM)**.

---

## 1. Arquitectura de Datos de Contexto (`test-context.json`)

En lugar de tener textos quemados (como `"Producto de prueba"` o `"Retiro en Tienda"`), cada aplicación local tendrá un archivo de metadatos de prueba autogenerado por el CLI de PROTOTIPE en la raíz del proyecto:

```json
{
  "niche": "retail_clothing",
  "selectors": {
    "welcomeButton": "text=Comencemos",
    "targetProduct": "text=Producto de prueba",
    "deliveryOption": "button:has-text(\"Retiro en Tienda\")",
    "paymentOption": "text=Efectivo"
  },
  "testData": {
    "phone": "3001234567",
    "clientName": "Cliente de Pruebas Playwright"
  }
}
```

### Automatización del CLI ( generator.js )
Cuando el CLI aprovisiona un nuevo cliente para una vertical de negocio específica, inyectará en caliente este archivo leyendo el `niche.json` seleccionado, garantizando que el test nazca sabiendo exactamente qué botones buscar y qué productos clickear.

---

## 2. Abstracción por Page Object Model (POM)

Se propone estructurar la carpeta `tests/` con la arquitectura estándar de Playwright:

```
tests/
  ├── pages/
  │    ├── CatalogPage.js       # Abstracción de clicks e imágenes del catálogo
  │    ├── ProductDetailPage.js # Gestión de cantidad, variantes y "Comprar Ahora"
  │    └── CheckoutModalPage.js # Control de inputs, tabs de entrega y confirmación
  ├── checkout.spec.js          # Archivo de ejecución limpio
  └── test-context.json         # Configuración contextual del cliente
```

### Ejemplo de Implementación del Test Limpio (`checkout.spec.js`)

```javascript
import { test, expect } from '@playwright/test';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutModalPage } from './pages/CheckoutModalPage';
import context from './test-context.json'; // Carga de contexto dinámica

test('Flujo de compra parametrizado', async ({ page }) => {
  const catalog = new CatalogPage(page, context);
  const detail = new ProductDetailPage(page, context);
  const checkout = new CheckoutModalPage(page, context);

  await page.goto('/');
  await catalog.enterStore();
  await catalog.selectProduct();
  
  await detail.selectVariantsIfPresent();
  await detail.buyNow();

  await checkout.fillDelivery();
  await checkout.fillContactInfo();
  await checkout.selectPaymentMethod();
  await checkout.confirmPurchase();

  await expect(page.locator('text=¡Pedido Exitoso!')).toBeVisible();
});
```

---

## 3. Integración en el Pipeline del CLI (`test_templates.js`)

Para asegurar la calidad global del ecosistema, el runner de pruebas del CLI (`test_templates.js`) ejecutará el test de integración completo antes de compilar o empaquetar una plantilla:

```javascript
// Ejecutar pruebas en el directorio temporal aislado del CLI
const { execSync } = require('child_process');
try {
  console.log('Ejecutando pruebas Playwright de integración...');
  execSync('npx playwright test', { cwd: tempDirPath, stdio: 'inherit' });
  console.log('✓ Pruebas Playwright APROBADAS');
} catch (error) {
  console.error('✗ Fallo en las pruebas Playwright. Cancelando compilación.');
  process.exit(1);
}
```

---

## Beneficios de la Propuesta
* **Cero código repetido**: El mismo código de pruebas sirve para una zapatería, un restaurante o un taller de servicios.
* **Autonomía**: Playwright detecta dinámicamente si los módulos (como cupones o domicilios) están encendidos o apagados leyendo el store o la interfaz antes de interactuar.
* **Inmunidad ante Regresiones**: Cualquier cambio en el motor core que rompa la lógica del carrito o de la base de datos abortará el despliegue del CLI de forma automática.
