import { test, expect } from '@playwright/test';
import { APP_CONFIG } from './config/proyecto-cliente-saas.config.js';
import { passWelcomePage } from './helpers/checkout.helpers.js';

test.describe('Pruebas de Servicios Críticos', () => {

  test.beforeEach(async ({ page }) => {
    // Cargar la página para inicializar el contexto del navegador e IndexedDB
    await page.goto('/');
    await passWelcomePage(page, APP_CONFIG);
  });

  test('orderService - hashCelular genera hash SHA-256 válido', async ({ page }) => {
    const isHashValid = await page.evaluate(async () => {
      const { hashCelular } = await import('/src/features/orders/index.js');
      const phone = '3001234567';
      const hash = await hashCelular(phone);
      
      // Debe ser una cadena hexadecimal de 64 caracteres (SHA-256)
      const hexRegex = /^[a-f0-9]{64}$/;
      return hexRegex.test(hash);
    });

    expect(isHashValid).toBe(true);
  });

  test('orderService - syncOfflineSales sincroniza correctamente ventas de IndexedDB a Firestore', async ({ page }) => {
    const syncResult = await page.evaluate(async () => {
      const { addOfflineSale, getOfflineSales } = await import('/src/services/offlineDB.js');
      const { syncOfflineSales } = await import('/src/features/sales/index.js');

      // 1. Limpiar ventas offline previas si las hay
      const initialSales = await getOfflineSales();
      for (const sale of initialSales) {
        const { removeOfflineSale } = await import('/src/services/offlineDB.js');
        await removeOfflineSale(sale.id);
      }

      // 2. Crear una venta offline mock
      const mockSaleId = 'sale_offline_test_' + Math.random().toString(36).slice(2);
      const mockSale = {
        id: mockSaleId,
        adminId: 'admin_test',
        orderData: {
          cliente: {
            nombre: 'Cliente Sincronizacion Offline',
            celular: '3009999999',
            direccion: 'Calle Falsa 123',
          },
          items: [
            {
              productId: '3ghoEutXcSNpuiepaKH3',
              variantId: '4a0c5c47-a815-4ce0-92a8-6da6fc5c1cfd',
              nombre: 'HAMBURGUESA DE RES',
              cantidad: 1,
              precio: 13500
            }
          ],
          tipoEntrega: 'domicilio',
          metodoPago: 'efectivo',
          total: 13500,
          subtotal: 13500,
          costoEnvio: 0,
          descuento: 0,
          offline: true
        }
      };

      await addOfflineSale(mockSale);

      // 3. Confirmar que está en IndexedDB
      const storedSalesBefore = await getOfflineSales();
      const hasSaleBefore = storedSalesBefore.some(s => s.id === mockSaleId);
      if (!hasSaleBefore) return { error: 'No se guardó el pedido en IndexedDB' };

      // 4. Ejecutar sincronización
      const result = await syncOfflineSales();

      // 5. Confirmar que se eliminó de IndexedDB tras sincronizarse
      const storedSalesAfter = await getOfflineSales();
      const hasSaleAfter = storedSalesAfter.some(s => s.id === mockSaleId);

      return {
        success: result.success,
        count: result.count,
        deletedFromIndexedDB: !hasSaleAfter,
        errors: result.conflicts.map(c => c.error)
      };
    });

    expect(syncResult.error).toBeUndefined();
    expect(syncResult.success).toBe(true);
    expect(syncResult.count).toBe(1);
    expect(syncResult.deletedFromIndexedDB).toBe(true);
  });

});
