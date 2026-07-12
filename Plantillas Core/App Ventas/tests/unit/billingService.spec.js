import { describe, test, expect, vi } from 'vitest';

// Mockear Firebase para evitar conexiones a base de datos real
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
    orderBy: vi.fn(),
  };
});

vi.mock('../../src/config/firebaseConfig', () => {
  return {
    db: {},
  };
});

// Importar la función bajo prueba
import { calcMetrics } from '../../src/features/billing';

describe('billingService - calcMetrics', () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed

  // Crear fechas de prueba para el mes actual
  const dateCurrent = new Date(currentYear, currentMonth, 15).toISOString();
  // Fecha fuera del desglose de los últimos 6 meses (ej: hace 8 meses)
  const datePast = new Date(currentYear, currentMonth - 8, 15).toISOString();

  const mockOrders = [
    {
      id: 'ord1',
      total: 100000,
      subtotal: 100000,
      requiereFacturaElectronica: true,
      metodoPago: 'efectivo',
      createdAt: dateCurrent,
    },
    {
      id: 'ord2',
      total: 50000,
      subtotal: 50000,
      requiereFacturaElectronica: false,
      metodoPago: 'transferencia',
      createdAt: dateCurrent,
    },
    {
      id: 'ord3',
      total: 80000,
      subtotal: 80000,
      requiereFacturaElectronica: false,
      metodoPago: 'credito',
      createdAt: datePast, // Excluido del mes actual y desglose 6 meses
    }
  ];

  test('Modo Porcentaje (percentage) - calcula comisión basándose en porcentaje de comisiones', () => {
    const config = {
      billingMode: 'percentage',
      comisionPorcentaje: 2.5, // 2.5%
      enableDianBilling: false,
    };

    const metrics = calcMetrics(mockOrders, config);

    // De las órdenes del mes actual:
    // ord1: 100000 * 2.5% = 2500
    // ord2: 50000 * 2.5% = 1250
    // Total mes comisiones = 3750
    expect(metrics.totalMes).toBe(150000);
    expect(metrics.comisionMes).toBe(3750);
    expect(metrics.pedidosMes).toBe(2);
    expect(metrics.pagoBreakdown.efectivo).toBe(100000);
    expect(metrics.pagoBreakdown.transferencia).toBe(50000);
    expect(metrics.pagoBreakdown.credito).toBe(80000);
  });

  test('Modo Fijo por Servicio (fixed_per_service) - aplica tarifa plana por cada pedido', () => {
    const config = {
      billingMode: 'fixed_per_service',
      montoFijoServicio: 1500, // 1500 por orden
      enableDianBilling: false,
    };

    const metrics = calcMetrics(mockOrders, config);

    // ord1: 1500
    // ord2: 1500
    // Total mes comisiones = 3000
    expect(metrics.comisionMes).toBe(3000);
  });

  test('Modo Tarifa Plana Mensual (flat_monthly) - cobra una mensualidad fija sin importar el volumen de ventas', () => {
    const config = {
      billingMode: 'flat_monthly',
      pagoMensualFijo: 50000,
    };

    const metrics = calcMetrics(mockOrders, config);

    expect(metrics.comisionMes).toBe(50000);
  });

  test('Integración con facturación electrónica DIAN - suma costos de procesamiento adicionales por factura', () => {
    const config = {
      billingMode: 'percentage',
      comisionPorcentaje: 1.0,
      enableDianBilling: true,
      costoPorFacturaDian: 800, // 800 pesos adicionales por factura DIAN
    };

    const metrics = calcMetrics(mockOrders, config);

    // ord1: (100000 * 1%) + 800 (requiere factura) = 1800
    // ord2: (50000 * 1%) + 0 (no requiere factura) = 500
    // Total mes comisiones = 2300
    expect(metrics.comisionMes).toBe(2300);
  });
});
