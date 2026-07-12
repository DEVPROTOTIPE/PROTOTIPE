import { test, expect } from '@playwright/test';

test.describe('App Health Smoke Test', () => {
  test('should load the welcome page and navigate to login', async ({ page }) => {
    // 1. Ir a la ruta raíz
    await page.goto('/');

    // 2. Verificar que se renderiza el botón "Comencemos"
    const startButton = page.locator('button:has-text("Comencemos")');
    await expect(startButton).toBeVisible();

    // 3. Hacer clic en el botón y validar que redirige a /login
    await startButton.click();
    await expect(page).toHaveURL(/.*login/);

    // 4. Verificar que se renderiza el formulario de inicio de sesión
    const loginHeader = page.locator('h2, h1');
    await expect(loginHeader.first()).toBeVisible();
  });
});
