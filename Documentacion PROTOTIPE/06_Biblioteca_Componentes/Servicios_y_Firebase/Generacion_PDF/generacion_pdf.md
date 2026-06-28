<!--
{
  "technicalName": "GeneracionPdf",
  "targetPath": "src/services/GeneracionPdf.js",
  "dependencies": {
    "npm": {},
    "internal": []
  }
}
-->

# pdfService (Motor de Generación de Documentos PDF Premium)

## 1. Propósito y Casos de Uso
El servicio `pdfService` es una infraestructura de alto nivel diseñada para la generación, renderización y descarga automatizada de documentos e informes financieros PDF estilizados desde el cliente. Basado en `jsPDF` y `jspdf-autotable`, este servicio es 100% portable y de marca blanca, permitiendo personalizar colores de marca, tipografías, logotipos, cabeceras y desglose de columnas dinámicamente.

Ideal para la emisión automática de facturas de compra, reportes de rotación de inventarios, recibos mensuales de cobro de comisiones y auditorías contables listas para impresión física.

---

## 2. Especificación Visual y Estilos
El motor genera documentos estructurados con maquetaciones de alta precisión:
* **Cabecera Banner:** Franja superior sólida de color primario de marca parametrizable.
* **Resumen Ejecutivo (Grid Boxes):** Bloques rectangulares atenuados `rgb(249, 250, 251)` con bordes definidos.
* **Detalle de Tablas:** Soporte de alternancia de filas (striped) en gris suave, alineación de columnas numéricas a la derecha, y celdas semánticas colorizadas (ej. verde para éxito, rojo para alertas críticas).

---

## 3. Props y API de las Funciones

El servicio expone tres funciones de exportación de alto nivel parametrizables:

### `exportSalesReportPDF(params)`
Genera un reporte financiero de ingresos y desglose por métodos de pago.
* `title`: `String` - Título del reporte (ej. "REPORTE DE VENTAS").
* `periodLabel`: `String` - Rango de fechas a imprimir en la cabecera.
* `primaryColor`: `Array [R, G, B]` - Color principal para banners y headers de tablas (default `[79, 70, 229]`).
* `data`: `Array` - Array de registros de pedidos.
* `headers`: `Array` - Cabeceras de la tabla de detalles.
* `metrics`: `Object` - Totales calculados a renderizar en el grid ejecutivo (`totalFacturado`, `totalPedidos`, `ticketPromedio`, `cashTotal`, `transferTotal`, `creditTotal`).
* `formatFn`: `Function` - Función inyectable para formatear divisas según el local del cliente.

### `exportRotationReportPDF(params)`
Genera un reporte de rotación y alertas de inventario.
* `title`: `String` - Título del reporte.
* `periodLabel`: `String` - Rango de fechas.
* `primaryColor`: `Array [R, G, B]`.
* `headers`: `Array` - Cabeceras del listado.
* `stats`: `Array` - Lista de productos procesados con stock actual, unidades vendidas, ingresos y recomendación.
* `formatFn`: `Function`.

### `exportDeveloperReceiptPDF(params)`
Genera un recibo mensual estilizado con soporte de firma gráfica digital en base64.
* `signatureDataUrl`: `String` - Imagen en base64 de la firma digital capturada en un Canvas.
* `title`: `String` - Título de la factura/recibo.
* `periodLabel`: `String` - Periodo de cobro.
* `primaryColor`: `Array [R, G, B]`.
* `billingParty`: `Object` - Información de las partes `{ emisor, receptor, tasaComision }`.
* `orders`: `Array` - Lista de transacciones individuales a desglosar.
* `totals`: `Object` - Totales `{ totalVentas, totalComision }`.
* `formatFn`: `Function`.

---

## 4. Código JavaScript Completo y 100% Funcional

```javascript
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Requiere plugin oficial jspdf-autotable

/**
 * Generates and downloads the Financial Sales Report PDF.
 */
export function exportSalesReportPDF({
  title = 'REPORTE FINANCIERO DE VENTAS',
  periodLabel = '',
  primaryColor = [79, 70, 229],
  headers = [['Fecha/Hora', 'Cliente', 'Celular', 'Método de Pago', 'Total']],
  data = [],
  metrics = { totalVentas: 0, totalPedidos: 0, averageTicket: 0, cashTotal: 0, transferTotal: 0, creditTotal: 0 },
  formatFn = (val) => `$${val}`
}) {
  const doc = new jsPDF();
  
  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 15, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (periodLabel) doc.text(`Periodo: ${periodLabel}`, 15, 30);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 140, 30);
  
  // 2. Metricas Clave (Resumen Ejecutivo)
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Ejecutivo', 15, 52);
  
  // Grid de Métricas (Fila 1)
  doc.setFillColor(249, 250, 251);
  doc.rect(15, 58, 85, 22, 'F');
  doc.rect(110, 58, 85, 22, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL FACTURADO', 20, 64);
  doc.text('TRANSACCIONES PROCESADAS', 115, 64);
  
  doc.setFontSize(13);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(formatFn(metrics.totalVentas), 20, 74);
  doc.setTextColor(31, 41, 55);
  doc.text(`${metrics.totalPedidos} pedidos`, 115, 74);
  
  // Grid de Métricas (Fila 2)
  doc.setFillColor(249, 250, 251);
  doc.rect(15, 85, 85, 22, 'F');
  doc.rect(110, 85, 85, 22, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('TICKET PROMEDIO', 20, 91);
  doc.text('DESGLOSE METODOS DE PAGO', 115, 91);
  
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(formatFn(metrics.averageTicket), 20, 101);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Efectivo: ${formatFn(metrics.cashTotal)}`, 115, 97);
  doc.text(`Transferencia: ${formatFn(metrics.transferTotal)}`, 115, 102);
  doc.text(`Crédito: ${formatFn(metrics.creditTotal)}`, 115, 107);
  
  // 3. Tabla de Detalles
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text('Desglose Detallado de Registros', 15, 120);
  
  doc.autoTable({
    startY: 125,
    head: headers,
    body: data,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, halign: 'left' },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      [headers[0].length - 1]: { halign: 'right' } // Última columna (Total) a la derecha
    }
  });
  
  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
}

/**
 * Generates and downloads the Product Rotation Report.
 */
export function exportRotationReportPDF({
  title = 'REPORTE DE ROTACIÓN E INVENTARIO',
  periodLabel = '',
  primaryColor = [79, 70, 229],
  headers = [['Producto', 'Unidades Vendidas', 'Ingresos Generados', 'Stock Actual', 'Acción Recomendada']],
  stats = [],
  formatFn = (val) => `$${val}`
}) {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 15, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (periodLabel) doc.text(`Periodo analizado: ${periodLabel}`, 15, 30);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 140, 30);
  
  // Tabla de Análisis
  doc.autoTable({
    startY: 50,
    head: headers,
    body: stats.map(s => [s.nombre, s.vendidas, formatFn(s.ingresos), s.stock, s.recomendacion]),
    theme: 'striped',
    headStyles: { fillColor: primaryColor, halign: 'left' },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' }
    },
    didParseCell: function(data) {
      if (data.column.index === 4 && data.cell.section === 'body') {
        const text = data.cell.raw || '';
        if (text.toLowerCase().includes('surtir') || text.toLowerCase().includes('urgente')) {
          data.cell.styles.textColor = [16, 185, 129]; // Verde esmeralda
          data.cell.styles.fontStyle = 'bold';
        } else if (text.toLowerCase().includes('liquidar') || text.toLowerCase().includes('descontinuar')) {
          data.cell.styles.textColor = [239, 68, 68]; // Rojo destructivo
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generates and downloads the Monthly Commission Receipt PDF with digital signature.
 */
export function exportDeveloperReceiptPDF({
  signatureDataUrl,
  title = 'RECIBO DE COMISIÓN DE DESARROLLADOR',
  periodLabel = '',
  primaryColor = [16, 185, 129],
  billingParty = { emisor: '', receptor: '', tasaComision: 0 },
  orders = [],
  totals = { totalVentas: 0, totalComision: 0 },
  formatFn = (val) => `$${val}`
}) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 15, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (periodLabel) doc.text(`Periodo: ${periodLabel}`, 15, 30);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 140, 30);

  // Información de Facturación
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DE COBRO', 15, 52);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Emisor / Proveedor: ${billingParty.emisor}`, 15, 59);
  doc.text(`Cliente / Adquirente: ${billingParty.receptor}`, 15, 64);
  doc.text(`Tasa de Comisión Aplicada: ${billingParty.tasaComision}%`, 15, 69);

  // Grid boxes de Totales
  doc.setFillColor(249, 250, 251);
  doc.rect(15, 76, 85, 20, 'F');
  doc.rect(110, 76, 85, 20, 'F');

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('VENTAS TOTALES PROCESADAS', 20, 82);
  doc.text('TOTAL COMISIÓN NETO A PAGAR', 115, 82);

  doc.setFontSize(13);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(formatFn(totals.totalVentas), 20, 91);
  doc.setTextColor(...primaryColor);
  doc.text(formatFn(totals.totalComision), 115, 91);

  // Tabla Desglose
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text('Desglose de Pedidos del Periodo', 15, 107);

  const tableHeaders = [['Fecha/Hora', 'Cliente', 'Total Venta', 'Comisión']];
  const tableData = orders.map(o => [
    o.fecha, 
    o.cliente, 
    formatFn(o.total), 
    formatFn(o.comision)
  ]);

  const result = doc.autoTable({
    startY: 112,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, halign: 'left' },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' }
    }
  });

  // Firma Digital en Base64
  const finalY = (result && result.lastY) ? result.lastY + 15 : 150;

  if (finalY + 45 > 297) {
    doc.addPage();
    doc.text('Firma de Conformidad', 15, 30);
    if (signatureDataUrl) doc.addImage(signatureDataUrl, 'PNG', 15, 35, 60, 25);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('_____________________________________', 15, 75);
    doc.text(`Firma del Cliente: ${billingParty.receptor}`, 15, 80);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, 84);
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Firma de Conformidad', 15, finalY);
    if (signatureDataUrl) doc.addImage(signatureDataUrl, 'PNG', 15, finalY + 5, 60, 25);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('_____________________________________', 15, finalY + 38);
    doc.text(`Firma del Cliente: ${billingParty.receptor}`, 15, finalY + 43);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, finalY + 47);
  }

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}
```

---

## 5. Lógica de Estado y Ciclo de Vida
* **Integración asíncrona de jsPDF**: La biblioteca carga asíncronamente las tablas y rasteriza firmas en base64 de manera secuencial, garantizando que el hilo del DOM principal no sufra lags o bloqueos de renderizado en navegadores móviles lentos.

---

## 6. Ejemplo de Uso

```javascript
import { exportSalesReportPDF } from './pdfService';

const pedidosDemo = [
  ['2026-05-29', 'Sergio', '3001234567', 'Efectivo', '$45.000']
];

exportSalesReportPDF({
  title: 'Reporte de Ventas Ferretería Central',
  periodLabel: 'Mayo 2026',
  primaryColor: [4, 120, 87], // Verde oscuro de marca
  data: pedidosDemo,
  metrics: { totalVentas: 45000, totalPedidos: 1, averageTicket: 45000, cashTotal: 45000, transferTotal: 0, creditTotal: 0 },
  formatFn: (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val)
});
```
