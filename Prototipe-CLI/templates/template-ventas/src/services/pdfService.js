// jsPDF y jspdf-autotable se importan dinámicamente en cada función para reducir el bundle inicial del cliente
import { formatCurrency } from '../utils/formatters'
import { ORDER_STATES, PAYMENT_METHODS, ORDER_TYPES, COLLECTIONS } from '../constants'
import useAppConfigStore from '../store/appConfigStore'

// Helper to convert Firestore timestamp or other date representation to a local Date object
function toLocalDate(ts) {
  if (!ts) return null
  if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate()
  if (ts instanceof Date) return ts
  if (typeof ts === 'object' && ts.seconds !== undefined) {
    return new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1000000))
  }
  const parsed = new Date(ts)
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Generates and downloads the Financial Sales Report PDF.
 */
export async function exportSalesReportPDF({ dateFrom, dateTo, orders, products = [] }) {
  const { jsPDF } = await import('jspdf')
  const { autoTable } = await import('jspdf-autotable')
  const { creditsEnabled } = useAppConfigStore.getState()
  const from = new Date(dateFrom + 'T00:00:00')
  const to = new Date(dateTo + 'T23:59:59')

  // Obtener créditos para mapear saldos reales
  const creditsMap = new Map()
  if (creditsEnabled) {
    try {
      const { collection, getDocs } = await import('firebase/firestore')
      const { db } = await import('../config/firebaseConfig')
      const snap = await getDocs(collection(db, COLLECTIONS.CREDITS))
      snap.forEach(docSnap => {
        const data = docSnap.data()
        if (data.orderId) {
          creditsMap.set(data.orderId, data)
        }
      })
    } catch (err) {
      console.error('[pdfService] Error al cargar créditos:', err)
    }
  }

  const filtered = orders.filter(o => {
    if (o.estado !== ORDER_STATES.COMPLETED) return false
    const fecha = toLocalDate(o.createdAt)
    if (!fecha) return false
    if (!creditsEnabled && o.metodoPago === PAYMENT_METHODS.CREDIT) return false
    return fecha >= from && fecha <= to
  })

  // Build product lookup map
  const productMap = new Map()
  products.forEach(p => {
    productMap.set(p.id, p)
  })

  // Totales de Caja y financieros
  let totalBrutoProductos = 0
  let totalDescuentos = 0
  let totalEnvios = 0

  let cashTotal = 0
  let transferTotal = 0
  let creditTotal = 0
  let totalCost = 0

  // Analizar si hay información de empleados en este lote
  const hasEmployees = filtered.some(o => o.vendedorNombre || o.vendedorId)

  // Acumulador para rendimiento de empleados
  const employeeSales = {}

  const orderCalculations = filtered.map(o => {
    let orderCost = 0
    if (o.items && Array.isArray(o.items)) {
      o.items.forEach(item => {
        let itemCost = 0
        let prod = item.productoId ? productMap.get(item.productoId) : null
        if (!prod && item.nombre) {
          prod = products.find(p => p.nombre === item.nombre)
        }

        if (prod) {
          let variant = null
          if (item.varianteId && prod.variantes) {
            variant = prod.variantes.find(v => v.id === item.varianteId)
          }
          
          if (variant && variant.precioCosto !== undefined && variant.precioCosto !== null && variant.precioCosto !== '') {
            itemCost = Number(variant.precioCosto) || 0
          } else if (prod.precioCosto !== undefined && prod.precioCosto !== null && prod.precioCosto !== '') {
            itemCost = Number(prod.precioCosto) || 0
          }
        }
        orderCost += itemCost * (item.cantidad || 1)
      })
    }

    totalCost += orderCost

    // Calcular valores a nivel de pedido
    const costoEnvio = Number(o.costoEnvio) || 0
    const descuento = Number(o.descuento) || 0
    const totalPedido = Number(o.total) || 0

    // Sumas para el Resumen Financiero
    totalEnvios += costoEnvio
    totalDescuentos += descuento
    totalBrutoProductos += (totalPedido + descuento - costoEnvio)

    // Agrupación por método de pago
    if (o.metodoPago === PAYMENT_METHODS.CASH) {
      cashTotal += totalPedido
    } else if (o.metodoPago === PAYMENT_METHODS.TRANSFER) {
      transferTotal += totalPedido
    } else if (o.metodoPago === PAYMENT_METHODS.CREDIT) {
      const credit = creditsMap.get(o.id)
      let saldo = 0
      if (credit) {
        saldo = Number(credit.saldoPendiente) ?? 0
      } else {
        saldo = o.estado === ORDER_STATES.COMPLETED ? 0 : totalPedido
      }
      const abonos = Math.max(0, totalPedido - saldo)
      creditTotal += saldo
      cashTotal += abonos
    }

    // Registro de ventas de empleados si aplica
    if (hasEmployees) {
      const vNombre = o.vendedorNombre || 'Sin Vendedor Asignado'
      if (!employeeSales[vNombre]) {
        employeeSales[vNombre] = { cantidad: 0, total: 0 }
      }
      employeeSales[vNombre].cantidad += 1
      employeeSales[vNombre].total += totalPedido
    }

    const orderProfit = totalPedido - orderCost

    return {
      order: o,
      cost: orderCost,
      profit: orderProfit
    }
  })

  const totalVentas = cashTotal + transferTotal + creditTotal
  const totalProfit = totalVentas - totalCost
  const averageTicket = filtered.length > 0 ? totalVentas / filtered.length : 0

  const doc = new jsPDF()
  const primaryColor = [79, 70, 229]
  
  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('REPORTE FINANCIERO DE VENTAS Y CAJA', 15, 25)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Periodo: ${dateFrom} al ${dateTo}`, 15, 33)
  doc.text(`Generado: ${new Date().toLocaleString()}`, 140, 33)
  
  // Resumen Ejecutivo Titulo
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen Financiero', 15, 52)
  
  // Grid boxes
  doc.setDrawColor(243, 244, 246)
  
  // Bloque 1: Resumen de Ventas
  doc.setFillColor(249, 250, 251)
  doc.rect(15, 58, 85, 35, 'F')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('RESUMEN DE FACTURACIÓN', 20, 64)
  doc.setTextColor(31, 41, 55)
  doc.text(`Subtotal Productos: ${formatCurrency(totalBrutoProductos)}`, 20, 71)
  doc.text(`Descuentos Aplicados: -${formatCurrency(totalDescuentos)}`, 20, 76)
  doc.text(`Recaudo Domicilios: +${formatCurrency(totalEnvios)}`, 20, 81)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(79, 70, 229)
  doc.text(`TOTAL FACTURADO: ${formatCurrency(totalVentas)}`, 20, 88)
  
  // Bloque 2: Conciliación de Caja
  doc.setFillColor(249, 250, 251)
  doc.rect(110, 58, 85, 35, 'F')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('CONCILIACIÓN DE CAJA', 115, 64)
  doc.setTextColor(31, 41, 55)
  doc.text(`Efectivo Recaudado: ${formatCurrency(cashTotal)}`, 115, 71)
  doc.text(`Transferencias: ${formatCurrency(transferTotal)}`, 115, 76)
  if (creditsEnabled) {
    doc.setTextColor(220, 38, 38)
    doc.text(`Crédito / Fiado (Por cobrar): ${formatCurrency(creditTotal)}`, 115, 81)
  }
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(22, 163, 74)
  const cajaDisponible = cashTotal + transferTotal
  doc.text(`CAJA LIQUIDA REAL: ${formatCurrency(cajaDisponible)}`, 115, 88)

  // Bloque 3: Costos y Rentabilidad
  doc.setFillColor(249, 250, 251)
  doc.rect(15, 98, 85, 25, 'F')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('COSTO TOTAL DE VENTAS (COGS)', 20, 104)
  doc.setFontSize(12)
  doc.setTextColor(220, 38, 38)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(totalCost), 20, 115)

  // Bloque 4: Ganancia Neta Estimada
  doc.setFillColor(249, 250, 251)
  doc.rect(110, 98, 85, 25, 'F')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('GANANCIA NETA ESTIMADA', 115, 104)
  doc.setFontSize(12)
  doc.setTextColor(22, 163, 74)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(totalProfit), 115, 115)

  // Bloque 5: Métricas Adicionales
  doc.setFillColor(249, 250, 251)
  doc.rect(15, 128, 180, 15, 'F')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text(`Transacciones Exitosas: ${filtered.length} pedidos`, 20, 137)
  doc.text(`Ticket Promedio: ${formatCurrency(averageTicket)}`, 115, 137)
  
  // Tabla Detalle de Ventas
  doc.setFontSize(13)
  doc.setTextColor(31, 41, 55)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalle de Ventas del Periodo', 15, 153)
  
  // Construir cabeceras según presencia de empleados
  const tableHeaders = hasEmployees
    ? [['Fecha/Hora', 'Cliente', 'Tipo', 'Vendedor', 'Pago', 'Subtotal', 'Desc/Env', 'Total', 'Ganancia']]
    : [['Fecha/Hora', 'Cliente', 'Tipo', 'Pago', 'Subtotal', 'Desc/Env', 'Total', 'Ganancia']]

  const tableData = orderCalculations.map(item => {
    const o = item.order
    const fecha = toLocalDate(o.createdAt)?.toLocaleString('es-ES') || 'N/A'
    const cliente = o.cliente?.nombre || 'Cliente General'
    
    // Identificar tipo de venta
    let tipoVenta = 'Detal'
    if (o.tipoVenta === ORDER_TYPES.WHOLESALE) {
      tipoVenta = 'Mayorista'
    } else if (o.tipoVenta === 'encargo' || o.esEncargo) {
      tipoVenta = 'Encargo'
    }

    const pago = o.metodoPago === PAYMENT_METHODS.CASH 
      ? 'Efectivo' 
      : o.metodoPago === PAYMENT_METHODS.TRANSFER 
      ? 'Transferencia' 
      : 'Crédito'

    const subtotal = o.total + (Number(o.descuento) || 0) - (Number(o.costoEnvio) || 0)
    
    let descEnvStr = ''
    if (o.descuento > 0) descEnvStr += `Desc: -${formatCurrency(o.descuento)}\n`
    if (o.costoEnvio > 0) descEnvStr += `Envío: +${formatCurrency(o.costoEnvio)}`
    if (!descEnvStr) descEnvStr = 'N/A'

    if (hasEmployees) {
      const vendedor = o.vendedorNombre || 'N/A'
      return [
        fecha, 
        cliente, 
        tipoVenta, 
        vendedor, 
        pago, 
        formatCurrency(subtotal), 
        descEnvStr, 
        formatCurrency(o.total), 
        formatCurrency(item.profit)
      ]
    } else {
      return [
        fecha, 
        cliente, 
        tipoVenta, 
        pago, 
        formatCurrency(subtotal), 
        descEnvStr, 
        formatCurrency(o.total), 
        formatCurrency(item.profit)
      ]
    }
  })
  
  autoTable(doc, {
    startY: 158,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, halign: 'left' },
    styles: { fontSize: 7, cellPadding: 2, cellWidth: 'wrap' },
    columnStyles: hasEmployees 
      ? {
          5: { halign: 'right' },
          7: { halign: 'right' },
          8: { halign: 'right' }
        }
      : {
          4: { halign: 'right' },
          6: { halign: 'right' },
          7: { halign: 'right' }
        }
  })

  let nextY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 15 : 175

  // Si hay empleados, agregar la tabla de consolidado de ventas por empleado al final
  if (hasEmployees) {
    const employeeRows = Object.entries(employeeSales).map(([nombre, stats]) => [
      nombre,
      `${stats.cantidad} pedido(s)`,
      formatCurrency(stats.total)
    ])

    // Verificar si cabe en la página actual o requiere nueva página
    if (nextY + 35 > 297) {
      doc.addPage()
      nextY = 20
    }

    doc.setFontSize(12)
    doc.setTextColor(31, 41, 55)
    doc.setFont('helvetica', 'bold')
    doc.text('Rendimiento y Ventas por Empleado', 15, nextY)

    autoTable(doc, {
      startY: nextY + 5,
      head: [['Vendedor / Empleado', 'Cantidad Ventas', 'Total Facturado']],
      body: employeeRows,
      theme: 'grid',
      headStyles: { fillColor: [100, 116, 139] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' }
      }
    })
  }
  
  doc.save(`Reporte_Ventas_${dateFrom}_a_${dateTo}.pdf`)
}

/**
 * Genera y descarga el PDF de Reporte de Cuentas por Cobrar y Deudas.
 */
export async function exportCreditsReportPDF({ orders }) {
  const { jsPDF } = await import('jspdf')
  const { autoTable } = await import('jspdf-autotable')
  const { collection, getDocs } = await import('firebase/firestore')
  const { db } = await import('../config/firebaseConfig')

  let credits = []
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.CREDITS))
    credits = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
  } catch (err) {
    console.error('[pdfService] Error al obtener créditos para reporte:', err)
  }

  // Ordenar por fecha de creación (los más recientes primero)
  credits.sort((a, b) => {
    const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0)
    const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0)
    return tB - tA
  })

  // Activos y deudores únicos
  const activeCredits = credits.filter(c => c.estado === 'activo')
  const totalCartera = activeCredits.reduce((sum, c) => sum + (Number(c.saldoPendiente) || 0), 0)
  
  const deudoresSet = new Set(activeCredits.map(c => c.cliente?.celular).filter(Boolean))
  const totalDeudores = deudoresSet.size

  // Histórico de créditos otorgados y abonos totales
  const totalOtorgado = credits.reduce((sum, c) => sum + (Number(c.total || c.montoTotal) || 0), 0)
  const totalAbonos = credits.reduce((sum, c) => {
    const abonosMonto = (c.abonos || []).reduce((s, a) => s + (Number(a.monto) || 0), 0)
    return sum + abonosMonto
  }, 0)

  const doc = new jsPDF()
  const primaryColor = [79, 70, 229]

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('REPORTE DE CUENTAS POR COBRAR Y CARTERA', 15, 25)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generado: ${new Date().toLocaleString()}`, 15, 33)

  // Resumen Ejecutivo
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen de Cartera y Cobros', 15, 52)

  // Caja 1: Cartera Activa (Por Cobrar)
  doc.setFillColor(254, 242, 242)
  doc.rect(15, 58, 85, 35, 'F')
  doc.setFontSize(8)
  doc.setTextColor(153, 27, 27)
  doc.setFont('helvetica', 'normal')
  doc.text('CARTERA TOTAL ACTIVA', 20, 64)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(totalCartera), 20, 75)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text(`Deudores Activos: ${totalDeudores} clientes`, 20, 85)

  // Caja 2: Resumen General
  doc.setFillColor(249, 250, 251)
  doc.rect(110, 58, 85, 35, 'F')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('RESUMEN DE CRÉDITOS HISTÓRICOS', 115, 64)
  doc.setTextColor(31, 41, 55)
  doc.text(`Total Otorgado: ${formatCurrency(totalOtorgado)}`, 115, 71)
  doc.text(`Total Abonos Recaudados: ${formatCurrency(totalAbonos)}`, 115, 78)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(22, 163, 74)
  const efectividadRecaudo = totalOtorgado > 0 ? (totalAbonos / totalOtorgado) * 100 : 0
  doc.text(`Efectividad: ${efectividadRecaudo.toFixed(1)}%`, 115, 86)

  // Tabla Cuentas por Cobrar
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Cuentas por Cobrar (Créditos Activos)', 15, 107)

  const headers = [['# Pedido', 'Cliente', 'Celular', 'Fecha Emisión', 'Total Crédito', 'Saldo Pendiente']]
  const tableRows = activeCredits.map(c => {
    const orderNum = c.orderNumber ? `#${c.orderNumber}` : 'N/A'
    const name = c.clienteNombre || c.cliente?.nombre || 'Cliente General'
    const phone = c.clienteCelular || c.cliente?.celular || 'N/A'
    const dateStr = c.createdAt?.toMillis 
      ? new Date(c.createdAt.toMillis()).toLocaleDateString()
      : (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A')
    return [
      orderNum,
      name,
      phone,
      dateStr,
      formatCurrency(c.total || c.montoTotal || 0),
      formatCurrency(c.saldoPendiente || 0)
    ]
  })

  autoTable(doc, {
    startY: 112,
    head: headers,
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [220, 38, 38], halign: 'left' },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  })

  // Listar todos los abonos en la base para auditoría
  let nextY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 15 : 130
  
  // Extraer todos los abonos individuales de todos los créditos
  const allPayments = []
  credits.forEach(c => {
    if (c.abonos && Array.isArray(c.abonos)) {
      c.abonos.forEach(p => {
        allPayments.push({
          orderNumber: c.orderNumber,
          cliente: c.clienteNombre || c.cliente?.nombre || 'General',
          monto: p.monto,
          fecha: p.fecha,
          nota: p.nota
        })
      })
    }
  })

  // Ordenar abonos por fecha (más recientes primero)
  allPayments.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  if (allPayments.length > 0) {
    if (nextY + 35 > 297) {
      doc.addPage()
      nextY = 20
    }

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Historial de Abonos Recibidos', 15, nextY)

    const paymentHeaders = [['# Pedido', 'Cliente', 'Fecha Abono', 'Monto Abono', 'Nota']]
    const paymentRows = allPayments.map(p => [
      p.orderNumber ? `#${p.orderNumber}` : 'N/A',
      p.cliente,
      p.fecha ? new Date(p.fecha).toLocaleDateString() : 'N/A',
      formatCurrency(p.monto),
      p.nota || 'Sin observaciones'
    ])

    autoTable(doc, {
      startY: nextY + 5,
      head: paymentHeaders,
      body: paymentRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        3: { halign: 'right' }
      }
    })
  }

  doc.save('Reporte_Cuentas_Por_Cobrar.pdf')
}

/**
 * Generates and downloads the Product Rotation and Inventory Report PDF.
 */
export async function exportRotationReportPDF({ dateFrom, dateTo, orders, products }) {
  const { jsPDF } = await import('jspdf')
  const { autoTable } = await import('jspdf-autotable')
  const { variantsEnabled } = useAppConfigStore.getState()
  const from = new Date(dateFrom + 'T00:00:00')
  const to = new Date(dateTo + 'T23:59:59')

  const filtered = orders.filter(o => {
    if (o.estado !== ORDER_STATES.COMPLETED) return false
    const fecha = toLocalDate(o.createdAt)
    if (!fecha) return false
    return fecha >= from && fecha <= to
  })

  // 1. Mapear ventas de productos y variantes en el periodo
  // Clave: nombreProducto o nombreProducto|varianteId
  const ventasConteo = {}
  let totalIngresosVentas = 0
  const diasPeriodo = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)))

  filtered.forEach(order => {
    (order.items || []).forEach(item => {
      const cantidad = item.cantidad || 1
      const precio = item.precio || 0
      const totalFila = precio * cantidad
      totalIngresosVentas += totalFila

      if (variantsEnabled && item.varianteId) {
        const key = `${item.nombre}|${item.varianteId}`
        if (!ventasConteo[key]) ventasConteo[key] = { cantidad: 0, total: 0 }
        ventasConteo[key].cantidad += cantidad
        ventasConteo[key].total += totalFila
      } else {
        const key = item.nombre || 'Sin nombre'
        if (!ventasConteo[key]) ventasConteo[key] = { cantidad: 0, total: 0 }
        ventasConteo[key].cantidad += cantidad
        ventasConteo[key].total += totalFila
      }
    })
  })

  // 2. Aplanar inventario físico (dinámico según variantsEnabled)
  const itemsInventario = []
  let valorTotalCostoInv = 0
  let valorTotalVentaInv = 0
  let totalVariantesCriticas = 0

  products.forEach(p => {
    const umbral = p.umbralAlerta || 5

    if (variantsEnabled && p.variantes && p.variantes.length > 0 && p.variantes.some(v => v.id !== 'default')) {
      p.variantes.forEach(v => {
        const key = `${p.nombre}|${v.id}`
        const ventas = ventasConteo[key] || { cantidad: 0, total: 0 }
        const stock = v.stock || 0
        const costo = Number(v.precioCosto) || Number(p.precioCosto) || 0
        const venta = Number(v.precio) || Number(p.precio) || 0

        valorTotalCostoInv += (costo * stock)
        valorTotalVentaInv += (venta * stock)
        if (stock <= umbral) totalVariantesCriticas++

        // Generar nombre de variante descriptivo
        let descVariante = ''
        if (v.color) descVariante += `${v.color.nombre || v.color} `
        if (v.talla) descVariante += v.talla
        descVariante = descVariante.trim()

        itemsInventario.push({
          nombre: `${p.nombre}${descVariante ? ` (${descVariante})` : ''}`,
          stock,
          costo,
          precioVenta: venta,
          vendidas: ventas.cantidad,
          ingresos: ventas.total,
          umbral
        })
      })
    } else {
      // Si las variantes están desactivadas globalmente, o el producto es de estructura simple (sin variantes reales)
      // Buscamos si posee la variante 'default' en base de datos para extraer el stock real, o usamos p.stock como fallback
      const defaultVariant = p.variantes?.find(v => v.id === 'default')
      let stock = defaultVariant ? (defaultVariant.stock || 0) : (p.stock || 0)
      if (stock === 0 && p.variantes && p.variantes.length > 0) {
        stock = p.variantes.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
      }
      
      const key = p.nombre
      const ventas = ventasConteo[key] || { cantidad: 0, total: 0 }
      let costo = Number(p.precioCosto) || Number(defaultVariant?.precioCosto) || 0
      let venta = Number(p.precio) || Number(p.precioBase) || 0

      if (costo === 0 && p.variantes && p.variantes.length > 0) {
        costo = Number(p.variantes[0].precioCosto) || 0
      }
      if (venta === 0 && p.variantes && p.variantes.length > 0) {
        venta = Number(p.variantes[0].precio) || Number(p.variantes[0].precioBase) || 0
      }

      valorTotalCostoInv += (costo * stock)
      valorTotalVentaInv += (venta * stock)
      if (stock <= umbral) totalVariantesCriticas++

      itemsInventario.push({
        nombre: p.nombre,
        stock,
        costo,
        precioVenta: venta,
        vendidas: ventas.cantidad,
        ingresos: ventas.total,
        umbral
      })
    }
  })

  // 3. Clasificación ABC de Inventario (80/20 de Ingresos)
  // Ordenar de mayor a menor por ingresos generados
  itemsInventario.sort((a, b) => b.ingresos - a.ingresos)
  let ingresosAcumulados = 0
  itemsInventario.forEach(item => {
    ingresosAcumulados += item.ingresos
    const porcentajeAcumulado = totalIngresosVentas > 0 ? (ingresosAcumulados / totalIngresosVentas) * 100 : 100
    
    if (porcentajeAcumulado <= 80 && item.ingresos > 0) {
      item.categoriaABC = 'A (Estrella)'
    } else if (porcentajeAcumulado <= 95 && item.ingresos > 0) {
      item.categoriaABC = 'B (Medio)'
    } else {
      item.categoriaABC = 'C (Hueso)'
    }
  })

  // Calcular Tasa de Sell-Through, Runway y Acción Recomendada
  itemsInventario.forEach(item => {
    const totalDisponible = item.stock + item.vendidas
    item.sellThrough = totalDisponible > 0 ? (item.vendidas / totalDisponible) * 100 : 0

    // Promedio ventas diarias
    const ventasDiarias = item.vendidas / diasPeriodo
    item.runway = ventasDiarias > 0 ? Math.round(item.stock / ventasDiarias) : 999 // 999 significa indefinido

    // Acción sugerida
    if (item.stock <= 0 && item.vendidas > 0) {
      item.accion = 'Surtir Urgente'
    } else if (item.stock <= item.umbral && item.sellThrough > 50) {
      item.accion = 'Surtir Urgente'
    } else if (item.sellThrough > 70 && item.stock > 0) {
      item.accion = 'Alta Rotación'
    } else if (item.vendidas === 0 && item.stock > item.umbral) {
      item.accion = 'Sobre-Stock'
    } else {
      item.accion = 'Estable'
    }
  })

  // Ordenar por unidades vendidas para presentar en el PDF
  itemsInventario.sort((a, b) => b.vendidas - a.vendidas)

  const doc = new jsPDF()
  const primaryColor = [79, 70, 229]
  
  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('REPORTE DE ROTACIÓN E INVENTARIO 360°', 15, 25)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Periodo analizado: ${dateFrom} al ${dateTo} (${diasPeriodo} días)`, 15, 33)
  doc.text(`Generado: ${new Date().toLocaleString()}`, 140, 33)
  
  // Resumen Ejecutivo Titulo
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen Ejecutivo de Bodega y Stock', 15, 52)

  // Grid boxes
  doc.setDrawColor(243, 244, 246)

  // Bloque 1: Valoración Inventario Costo
  doc.setFillColor(249, 250, 251)
  doc.rect(15, 58, 85, 22, 'F')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('VALOR INVENTARIO (COSTO COGS)', 20, 64)
  doc.setFontSize(11)
  doc.setTextColor(31, 41, 55)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(valorTotalCostoInv), 20, 74)

  // Bloque 2: Valoración Inventario Venta
  doc.setFillColor(249, 250, 251)
  doc.rect(110, 58, 85, 22, 'F')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('VALOR ESTIMADO VENTA (DETAL)', 115, 64)
  doc.setFontSize(11)
  doc.setTextColor(22, 163, 74)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(valorTotalVentaInv), 115, 74)

  // Bloque 3: Variantes críticas
  doc.setFillColor(249, 250, 251)
  doc.rect(15, 85, 85, 22, 'F')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('PRODUCTOS / VARIANTES CRÍTICAS', 20, 91)
  doc.setFontSize(11)
  doc.setTextColor(220, 38, 38)
  doc.setFont('helvetica', 'bold')
  doc.text(`${totalVariantesCriticas} en alerta`, 20, 101)

  // Bloque 4: Margen Potencial
  doc.setFillColor(249, 250, 251)
  doc.rect(110, 85, 85, 22, 'F')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('MARGEN DE GANANCIA POTENCIAL', 115, 91)
  doc.setFontSize(11)
  doc.setTextColor(79, 70, 229)
  doc.setFont('helvetica', 'bold')
  const margenInventario = valorTotalVentaInv > 0 ? ((valorTotalVentaInv - valorTotalCostoInv) / valorTotalVentaInv) * 100 : 0
  doc.text(`${margenInventario.toFixed(1)}%`, 115, 101)

  // Titulo Tabla
  doc.setFontSize(13)
  doc.setTextColor(31, 41, 55)
  doc.setFont('helvetica', 'bold')
  doc.text('Tabla de Rotación y Auditoría de Stock', 15, 120)
  
  const tableHeaders = [[
    'Producto / Variante', 
    'Stock', 
    'Vendidas', 
    'Sell-Through', 
    'Runway (Días)', 
    'ABC', 
    'Acción Sugerida'
  ]]

  const tableData = itemsInventario.map(item => [
    item.nombre,
    item.stock,
    item.vendidas,
    `${item.sellThrough.toFixed(1)}%`,
    item.runway === 999 ? '∞' : `${item.runway} d`,
    item.categoriaABC,
    item.accion
  ])
  
  autoTable(doc, {
    startY: 125,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, halign: 'left' },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' }
    },
    didParseCell: function(data) {
      if (data.column.index === 6 && data.cell.section === 'body') {
        const text = data.cell.raw
        if (text.includes('Surtir')) {
          data.cell.styles.textColor = [220, 38, 38]
          data.cell.styles.fontStyle = 'bold'
        } else if (text.includes('Alta')) {
          data.cell.styles.textColor = [22, 163, 74]
          data.cell.styles.fontStyle = 'bold'
        } else if (text.includes('Sobre-Stock')) {
          data.cell.styles.textColor = [100, 116, 139]
        }
      }
      if (data.column.index === 5 && data.cell.section === 'body') {
        const text = data.cell.raw
        if (text.includes('A (Estrella)')) {
          data.cell.styles.textColor = [245, 158, 11]
          data.cell.styles.fontStyle = 'bold'
        }
      }
    }
  })
  
  doc.save(`Reporte_Rotacion_${dateFrom}_a_${dateTo}.pdf`)
}

/**
 * Generates and downloads the Developer Monthly Commission Receipt PDF.
 */
export async function exportDeveloperReceiptPDF({ signatureDataUrl, orders, config, billingMetrics }) {
  const { jsPDF } = await import('jspdf')
  const { autoTable } = await import('jspdf-autotable')
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const MONTH_NAMES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  const monthLabel = `${MONTH_NAMES_ES[currentMonth]} ${currentYear}`

  const currentPercent = billingMetrics?.commissionPercent ?? 1

  const currentMonthOrders = orders.filter(o => {
    if (o.estado !== ORDER_STATES.COMPLETED) return false
    if (!o.createdAt) return false
    const fecha = toLocalDate(o.createdAt)
    return fecha && fecha.getFullYear() === currentYear && fecha.getMonth() === currentMonth
  })

  const totalVentas = currentMonthOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalComision = (totalVentas * currentPercent) / 100

  const doc = new jsPDF()
  const primaryColor = [16, 185, 129]

  // Header banner
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RECIBO DE COMISIÓN DE DESARROLLADOR', 15, 22)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Periodo: ${monthLabel}`, 15, 30)
  doc.text(`Generado: ${new Date().toLocaleString()}`, 140, 30)

  // Detalle de las Partes
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMACIÓN DE COBRO', 15, 52)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Desarrollador: Soporte Técnico / Administrador del Sistema`, 15, 59)
  doc.text(`Cliente: ${config.sellerName || 'Propietaria de la Tienda'} (Dueña de la Tienda)`, 15, 64)
  doc.text(`Porcentaje de Comisión: ${currentPercent}%`, 15, 69)

  // Grid boxes
  doc.setDrawColor(243, 244, 246)
  doc.setFillColor(249, 250, 251)
  doc.rect(15, 76, 85, 20, 'F')
  doc.rect(110, 76, 85, 20, 'F')

  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('VENTAS TOTALES PROCESADAS', 20, 82)
  doc.text('TOTAL COMISIÓN NETO A PAGAR', 115, 82)

  doc.setFontSize(13)
  doc.setTextColor(31, 41, 55)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(totalVentas), 20, 91)
  doc.setTextColor(16, 185, 129)
  doc.text(formatCurrency(totalComision), 115, 91)

  // Table de Detalle
  doc.setFontSize(11)
  doc.setTextColor(31, 41, 55)
  doc.text('Desglose de Pedidos del Periodo', 15, 107)

  const tableHeaders = [['Fecha/Hora', 'Cliente Venta', 'Total Venta', 'Comisión']]
  const tableData = currentMonthOrders.map(o => {
    const fecha = toLocalDate(o.createdAt)?.toLocaleString('es-ES') || 'N/A'
    const clienteVenta = o.cliente?.nombre || 'Cliente General'
    const comisionIndividual = (o.total * currentPercent) / 100
    return [
      fecha, 
      clienteVenta, 
      formatCurrency(o.total || 0), 
      formatCurrency(comisionIndividual)
    ]
  })

  const result = autoTable(doc, {
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
  })

  // Seccion de Firma
  const finalY = (result && result.lastY) ? result.lastY + 15 : 150;

  if (finalY + 45 > 297) {
    doc.addPage()
    doc.text('Firma de Conformidad', 15, 30)
    doc.addImage(signatureDataUrl, 'PNG', 15, 35, 60, 30)
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text('_____________________________________', 15, 75)
    doc.text(`Firma del Cliente: ${config.sellerName || 'Propietaria de la Tienda'}`, 15, 80)
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, 84)
  } else {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Firma de Conformidad', 15, finalY)
    doc.addImage(signatureDataUrl, 'PNG', 15, finalY + 5, 60, 30)
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text('_____________________________________', 15, finalY + 40)
    doc.text(`Firma del Cliente: ${config.sellerName || 'Propietaria de la Tienda'}`, 15, finalY + 45)
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, finalY + 49)
  }

  doc.save(`Recibo_Comision_${monthLabel.replace(' ', '_')}.pdf`)
}
