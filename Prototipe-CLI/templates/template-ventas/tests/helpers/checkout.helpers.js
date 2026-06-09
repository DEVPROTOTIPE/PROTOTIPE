/**
 * HELPERS REUTILIZABLES PARA TESTS E2E - PROTOTIPE Framework
 * -----------------------------------------------------------
 * Cada función recibe el objeto `page` de Playwright y el `APP_CONFIG`
 * del cliente activo. Esto garantiza que el mismo helper funcione en
 * cualquier instancia sin modificar lógica de negocio.
 */

/**
 * Navega a la app y supera la pantalla de bienvenida si existe.
 * @param {import('@playwright/test').Page} page
 * @param {object} config - APP_CONFIG del cliente
 */
export async function passWelcomePage(page, config) {
  await page.goto('/');

  if (config.hasWelcomePage) {
    const welcomeButton = page.locator(`text=${config.welcomeButtonText}`);
    await welcomeButton.waitFor({ state: 'visible', timeout: 10000 });
    await welcomeButton.click();
  }
}

/**
 * Ejecuta el flujo completo de login de cliente:
 * 1. Ingresa el teléfono
 * 2. Si es usuario nuevo (aleatorio), completa el nombre
 * @param {import('@playwright/test').Page} page
 * @param {object} config - APP_CONFIG del cliente
 * @returns {string} El teléfono usado (útil para reusarlo en checkout)
 */
export async function loginAsClient(page, config) {
  const { login, testUser } = config;

  await page.waitForURL(/\/login/, { timeout: 10000 });

  // Generar o usar teléfono fijo
  const phone = testUser.generateRandomPhone
    ? `${testUser.phonePrefix}${Math.floor(1000000 + Math.random() * 9000000)}`
    : testUser.fixedPhone;

  const phoneInput = page.locator(login.phoneInputSelector);
  await phoneInput.waitFor({ state: 'visible', timeout: 8000 });
  await phoneInput.fill(phone);

  const submitBtn = page.locator(login.submitButtonSelector);
  await submitBtn.click();

  // Usuario nuevo → aparece paso de nombre
  try {
    const nameInput = page.locator(`input[placeholder*="${login.nameInputPlaceholder}"]`);
    await nameInput.waitFor({ state: 'visible', timeout: 4000 });
    await nameInput.fill(testUser.name);
    await submitBtn.click();
  } catch {
    // Usuario ya registrado o sin paso de nombre → continúa directo al catálogo
  }

  return phone;
}

/**
 * Selecciona el primer producto disponible en el catálogo que coincida
 * con el texto configurado y navega a su detalle.
 * @param {import('@playwright/test').Page} page
 * @param {object} config - APP_CONFIG del cliente
 */
export async function selectProductFromCatalog(page, config) {
  const { catalog } = config;

  await page.waitForURL(catalog.urlPattern, { timeout: 15000 });

  const productCard = page.locator(`text=${catalog.targetProductText}`).first();
  await productCard.waitFor({ state: 'visible', timeout: 10000 });
  await productCard.click();

  await page.waitForURL(catalog.productDetailUrlPattern, { timeout: 15000 });
}

/**
 * En la página de detalle de producto:
 * 1. Selecciona variantes (color/talla) si están disponibles
 * 2. Hace clic en el botón de compra directa
 * @param {import('@playwright/test').Page} page
 * @param {object} config - APP_CONFIG del cliente
 */
export async function triggerBuyNow(page, config) {
  const { productDetail } = config;

  // Dar tiempo al render de variantes dinámicas
  await page.waitForTimeout(1500);

  // Color (opcional)
  const colorBtn = page.locator(productDetail.colorSectionSelector).first();
  if (await colorBtn.count() > 0) {
    await colorBtn.click();
    await page.waitForTimeout(500);
  }

  // Talla (opcional)
  const tallaBtn = page.locator(productDetail.tallaSectionSelector).first();
  if (await tallaBtn.count() > 0) {
    await tallaBtn.click();
    await page.waitForTimeout(500);
  }

  // Comprar Ahora
  const buyBtn = page.locator(`button:has-text("${productDetail.buyNowButtonText}")`).first();
  await buyBtn.waitFor({ state: 'visible', timeout: 10000 });
  await buyBtn.waitFor({ state: 'attached' });
  await buyBtn.click();
}

/**
 * Completa el modal de Checkout paso a paso según la configuración del cliente.
 * Cada paso es opcional y se adapta a si el negocio lo tiene habilitado o no.
 * @param {import('@playwright/test').Page} page
 * @param {object} config - APP_CONFIG del cliente
 * @param {string} clientPhone - Teléfono del cliente (para pre-llenar si hace falta)
 */
export async function completeCheckout(page, config, clientPhone) {
  const { checkout } = config;

  // ── Paso 1: Método de Entrega ──────────────────────────────────────────────
  if (checkout.deliveryStep.enabled) {
    const deliveryBtn = page.locator(
      `button:has-text("${checkout.deliveryStep.preferredOptionText}")`
    );
    // Solo interactúa si el paso está visible (algunos negocios lo omiten automáticamente)
    try {
      await deliveryBtn.waitFor({ state: 'visible', timeout: 3000 });
      await deliveryBtn.click();
    } catch {
      // Paso omitido por el modal (solo un método activo)
    }
  }

  // ── Paso 2: Datos de Contacto ──────────────────────────────────────────────
  const phoneInput = page.locator(checkout.contactStep.phoneInputSelector);
  await phoneInput.waitFor({ state: 'visible', timeout: 8000 });
  const currentPhone = await phoneInput.inputValue();
  if (!currentPhone) {
    await phoneInput.fill(clientPhone);
  }

  const continueBtn = page.locator(`button:has-text("${checkout.contactStep.continueButtonText}")`);
  await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
  await continueBtn.click();

  // ── Paso 3: Método de Pago ─────────────────────────────────────────────────
  const paymentOption = page.locator(`text=${checkout.paymentStep.preferredMethodText}`);
  await paymentOption.waitFor({ state: 'visible', timeout: 8000 });
  await paymentOption.click();

  const reviewBtn = page.locator(`button:has-text("${checkout.paymentStep.reviewButtonText}")`);
  await reviewBtn.waitFor({ state: 'visible', timeout: 5000 });
  await reviewBtn.click();

  // ── Paso 4: Confirmar Pedido ───────────────────────────────────────────────
  const confirmBtn = page.locator(`button:has-text("${checkout.confirmStep.confirmButtonText}")`);
  await confirmBtn.waitFor({ state: 'visible', timeout: 8000 });
  await confirmBtn.click();

  // ── Paso 5: Éxito ──────────────────────────────────────────────────────────
  const successMsg = page.locator(`text=${checkout.successStep.successText}`);
  await successMsg.waitFor({
    state: 'visible',
    timeout: checkout.successStep.successTimeout,
  });
}
