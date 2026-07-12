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