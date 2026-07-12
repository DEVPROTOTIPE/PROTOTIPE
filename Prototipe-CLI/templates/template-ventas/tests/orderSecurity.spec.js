import { test, expect } from '@playwright/test';
import { APP_CONFIG } from './config/proyecto-cliente-saas.config.js';
import {
  passWelcomePage,
  loginAsClient,
  selectProductFromCatalog,
  triggerBuyNow,
  completeCheckout,
} from './helpers/checkout.helpers.js';

test.describe('Pruebas de Seguridad y Aislamiento de Pedidos', () => {

  test('El seguimiento público de pedidos no expone el teléfono (PII) ni permite listar la base de datos', async ({ page }) => {
    // 1. Bienvenida
    await passWelcomePage(page, APP_CONFIG);

    // 2. Login de Cliente (guardando el teléfono)
    const clientPhone = await loginAsClient(page, APP_CONFIG);

    // 3. Catálogo y compra
    await selectProductFromCatalog(page, APP_CONFIG);
    await triggerBuyNow(page, APP_CONFIG);
    await completeCheckout(page, APP_CONFIG, clientPhone);

    // 4. Capturar el enlace de seguimiento
    const successMsg = page.locator(`text=${APP_CONFIG.checkout.successStep.successText}`);
    await expect(successMsg).toBeVisible();

    const trackingLink = page.locator('a:has-text("Ver Estado")');
    await expect(trackingLink).toBeVisible();
    const trackingHref = await trackingLink.getAttribute('href');
    expect(trackingHref).toContain('/pedido/status?t=');

    // 5. Ir al seguimiento público del pedido
    await page.goto(trackingHref);

    // 6. Verificar que la página de seguimiento carga y no contiene el celular (PII)
    const orderTitle = page.locator('text=Seguimiento de Pedido');
    await expect(orderTitle).toBeVisible({ timeout: 10000 });
    
    // El texto de la página no debe contener el número celular del cliente
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain(clientPhone);

    // 7. Intentar acceder a la página de seguimiento sin token
    await page.goto('/pedido/status');
    const noTokenError = page.locator('text=Token de seguimiento no proporcionado o inválido.');
    await expect(noTokenError).toBeVisible();

    // 8. Intentar acceder con un token inválido
    await page.goto('/pedido/status?t=invalidtoken123');
    const invalidTokenError = page.locator('text=No se encontró ningún pedido con este código de seguimiento.');
    await expect(invalidTokenError).toBeVisible();
  });

});
