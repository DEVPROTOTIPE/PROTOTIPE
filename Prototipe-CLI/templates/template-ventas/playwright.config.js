import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/unit/**',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Ejecutar secuencial para evitar conflictos de base de datos en local/dev
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5180', // Puerto por defecto de Vite configurado en vite.config.js
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'cmd /c npm run dev',
    url: 'http://localhost:5180',
    reuseExistingServer: true,
    timeout: 30 * 1000,
  },
});
