/**
 * E2E Test: Flujo Completo de Compra
 * ====================================
 * Prueba de extremo a extremo del flujo principal de un cliente:
 *   Bienvenida → Login → Catálogo → Detalle Producto → Checkout → Éxito
 *
 * Este spec es AGNÓSTICO al cliente. Toda la configuración de la instancia
 * a testear se importa desde `./config/app-ventas.config.js`.
 * Para testear otro cliente, simplemente cambia esa importación.
 */

import { test, expect } from '@playwright/test';
import { APP_CONFIG } from './config/app-ventas.config.js';
import {
  passWelcomePage,
  loginAsClient,
  selectProductFromCatalog,
  triggerBuyNow,
  completeCheckout,
} from './helpers/checkout.helpers.js';

test.describe(`[${APP_CONFIG.name}] Flujo de compra completo`, () => {

  test('Bienvenida → Login → Catálogo → Producto → Checkout → Confirmación', async ({ page }) => {
    // ── 1. Bienvenida ──────────────────────────────────────────────────────
    await passWelcomePage(page, APP_CONFIG);

    // ── 2. Login de Cliente ────────────────────────────────────────────────
    const clientPhone = await loginAsClient(page, APP_CONFIG);

    // ── 3. Catálogo → Selección de Producto ───────────────────────────────
    await selectProductFromCatalog(page, APP_CONFIG);

    // ── 4. Detalle Producto → Comprar Ahora ───────────────────────────────
    await triggerBuyNow(page, APP_CONFIG);

    // ── 5. Modal Checkout completo ─────────────────────────────────────────
    await completeCheckout(page, APP_CONFIG, clientPhone);

    // ── Verificación final ─────────────────────────────────────────────────
    await expect(
      page.locator(`text=${APP_CONFIG.checkout.successStep.successText}`)
    ).toBeVisible();
  });

});
