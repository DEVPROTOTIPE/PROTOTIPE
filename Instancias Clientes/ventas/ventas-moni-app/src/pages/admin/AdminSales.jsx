import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import NumberInput from '../../components/ui/NumberInput'
import CurrencyInput from '../../components/ui/CurrencyInput'
import LazyImage from '../../components/ui/LazyImage'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Scan,
  ShoppingCart,
  User,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Check,
  CheckCircle2,
  Printer,
  ChevronRight,
  CreditCard,
  Wallet,
  Coins,
  FileText,
  X,
  Package,
  CalendarDays,
  ShoppingBag,
  Store,
  RefreshCw,
  WifiOff
} from 'lucide-react'
import ReactDOM from 'react-dom'
import { useProducts, useCategories } from '../../features/inventory'
import { useCreatePhysicalOrder, usePOSCart, usePOSCheckout, POSVariantModal, POSReceiptModal, POSCustomItemForm } from '../../features/sales'
import { getClientByPhone, saveClientProfile, getAllClients } from '../../services/userService'
import useAuthStore from '../../store/authStore'
import useAppConfigStore from '../../store/appConfigStore'
import { formatCurrency } from '../../utils/formatters'
import { ORDER_STATES, PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../constants'
import { useConnectivityStore } from '../../store/connectivityStore'
import { 
  getOfflineProducts, 
  saveOfflineProducts, 
  getOfflineCategories, 
  saveOfflineCategories, 
  addOfflineSale, 
  updateOfflineProductStock,
  getOfflineClient,
  saveOfflineClient,
  saveOfflineClients
} from '../../services/offlineDB'

// Mapeador de colores visual
import { getCssColor } from '../../utils/colors'
import { useAlertConfirm } from '../../components/common/AlertConfirmContext'

export default function AdminSales() {
  const navigate = useNavigate()
  const isOnline = useConnectivityStore((state) => state.isOnline)
  const { showAlert } = useAlertConfirm()
  const { data: products = [], isLoading: loadingProducts } = useProducts(true)
  const { data: categories = [] } = useCategories()
  const { user: currentAdmin } = useAuthStore()
  const { appName, appIcon, whatsappAdmin, bankInfo, bankInfo2, creditsEnabled, posExpressScanner } = useAppConfigStore()

  // Respaldo de datos offline
  const [offlineProducts, setOfflineProducts] = useState([])
  const [offlineCategories, setOfflineCategories] = useState([])

  // Sincronizar catálogo local a IndexedDB cuando esté online (dependencia por longitud)
  useEffect(() => {
    if (isOnline && products.length > 0) {
      saveOfflineProducts(products).catch(console.error)
    }
  }, [products.length, isOnline])

  useEffect(() => {
    if (isOnline && categories.length > 0) {
      saveOfflineCategories(categories).catch(console.error)
    }
  }, [categories.length, isOnline])

  // Sincronizar clientes a IndexedDB para búsqueda offline instantánea
  useEffect(() => {
    if (isOnline) {
      getAllClients().then(clients => {
        if (clients.length > 0) {
          saveOfflineClients(clients).catch(console.error)
        }
      }).catch(console.error)
    }
  }, [isOnline])

  // Cargar catálogo local desde IndexedDB únicamente cuando estemos offline
  useEffect(() => {
    if (!isOnline) {
      getOfflineProducts().then(setOfflineProducts).catch(console.error)
      getOfflineCategories().then(setOfflineCategories).catch(console.error)
    }
  }, [isOnline])

  // Catálogo a visualizar en base al estado de conexión
  const displayProducts = isOnline ? products : offlineProducts
  const displayCategories = isOnline ? categories : offlineCategories

  // Selector de Categorías y Buscador
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [activeTab, setActiveTab] = useState('products') // 'products' o 'cart' en mobile
  
  // Cliente
  const [celular, setCelular] = useState('')
  const [clientName, setClientName] = useState('')
  const [foundClient, setFoundClient] = useState(null)
  const [clientSearchStatus, setClientSearchStatus] = useState('') // 'searching', 'found', 'not_found', ''
  const [isRegisteringClient, setIsRegisteringClient] = useState(false)

  // Checkout
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH)
  const [notes, setNotes] = useState('')
  
  // Modales / Alertas / QR
  const [selectedProductForModal, setSelectedProductForModal] = useState(null)
  const [expandedQrUrl, setExpandedQrUrl] = useState(null)
  const [stockAlert, setStockAlert] = useState(null)

  // ─── HOOKS DE COMPORTAMIENTO (Fase 3 - Sales Feature) ──────────────
  const { cart, addToCart, updateCartQty, clearCart, getCartTotal, setCart } = usePOSCart()

  const { isSubmitting, finalizeSale, lastOrderDetails, setLastOrderDetails } = usePOSCheckout({
    cart,
    getCartTotal,
    foundClient,
    paymentMethod,
    notes,
    currentAdmin,
    isOnline,
    showAlert,
    setStockAlert,
    onSaleSuccess: () => {
      clearCart()
      setCelular('')
      setClientName('')
      setFoundClient(null)
      setClientSearchStatus('')
      setNotes('')
    },
    onOfflineProductsUpdate: (updatedOfflineProducts) => {
      setOfflineProducts(updatedOfflineProducts)
    }
  })



  // ─── MODO DE VENTA ────────────────────────────────────────────────────────
  // null = aún no elegido (muestra selector), 'inventory' = catálogo, 'custom' = producto libre
  const [saleMode, setSaleMode] = useState(null)
  const [customItem, setCustomItem] = useState({ nombre: '', precio: '', cantidad: '1', descripcion: '' })

  const addCustomItemToCart = () => {
    const precio = parseFloat(customItem.precio)
    const cantidad = parseInt(customItem.cantidad)
    if (!customItem.nombre.trim() || isNaN(precio) || precio <= 0 || isNaN(cantidad) || cantidad <= 0) {
      setStockAlert({ message: 'Completa nombre, precio y cantidad válidos.' })
      return
    }
    setCart(prev => [...prev, {
      productId: `custom-${Date.now()}`,
      variantId: `custom-${Date.now()}`,
      nombre: customItem.nombre.trim(),
      descripcion: customItem.descripcion?.trim() || '',
      precio,
      talla: null,
      color: null,
      cantidad,
      maxStock: 99999,
      imageUrl: null
    }])
    setCustomItem({ nombre: '', precio: '', cantidad: '1', descripcion: '' })
  }

  // Búsqueda en tiempo real de cliente
  useEffect(() => {
    const cleanCelular = celular.replace(/\D/g, '')
    if (cleanCelular.length < 10) {
      setFoundClient(null)
      setClientSearchStatus('')
      return
    }

    const performSearch = async () => {
      setClientSearchStatus('searching')
      try {
        let client = null
        if (isOnline) {
          try {
            // Carrera de promesas con timeout de 800ms para evitar cuelgues offline
            const networkPromise = getClientByPhone(cleanCelular)
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout de red')), 800)
            )

            client = await Promise.race([networkPromise, timeoutPromise])

            if (client) {
              // Guardar respaldo local
              await saveOfflineClient(client)
            }
          } catch (netError) {
            console.warn('[performSearch] Error o timeout de red, consultando IndexedDB:', netError)
            client = await getOfflineClient(cleanCelular)
          }
        } else {
          client = await getOfflineClient(cleanCelular)
        }

        if (client) {
          setFoundClient(client)
          setClientName(client.nombre)
          setClientSearchStatus('found')
        } else {
          setFoundClient(null)
          setClientSearchStatus('not_found')
          setClientName('')
        }
      } catch (e) {
        console.error(e)
        setClientSearchStatus('')
      }
    }

    const timer = setTimeout(performSearch, 350)
    return () => clearTimeout(timer)
  }, [celular, isOnline])

  // Registro rápido de cliente
  const handleRegisterClient = async () => {
    const cleanCelular = celular.replace(/\D/g, '')
    if (!cleanCelular || !clientName.trim()) return
    setIsRegisteringClient(true)
    try {
      const clientData = { id: cleanCelular, nombre: clientName.trim(), celular: cleanCelular }
      
      if (isOnline) {
        // Ejecutar de forma asíncrona sin bloquear la UI local
        saveClientProfile(cleanCelular, clientName.trim()).catch(err => {
          console.warn('[handleRegisterClient] Error al registrar en Firestore central:', err)
        })
      }
      
      // Guardar localmente siempre
      await saveOfflineClient(clientData)
      
      setFoundClient(clientData)
      setClientSearchStatus('found')
    } catch (e) {
      console.error(e)
      setStockAlert({ message: 'Error al registrar el cliente.' })
    } finally {
      setIsRegisteringClient(false)
    }
  }

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    return displayProducts.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'Todos' || p.categoriaId === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [displayProducts, searchTerm, selectedCategory])

  // Helpers de variantes
  const hasMultipleVariants = (product) => {
    if (!product.variantes || product.variantes.length === 0) return false
    if (product.variantes.length === 1) {
      const v = product.variantes[0]
      return !!(v.talla || v.color)
    }
    return true
  }

  const getProductTotalStock = (product) => {
    if (!product.variantes) return 0
    return product.variantes.reduce((sum, v) => sum + (v.stock || 0), 0)
  }

  // Agregar al carrito
  const handleAddProductClick = (product) => {
    if (hasMultipleVariants(product)) {
      setSelectedProductForModal(product)
    } else {
      const variant = product.variantes?.[0] || { id: 'default', stock: 9999, talla: null, color: null }
      if (variant.stock <= 0) {
        setStockAlert({ message: 'Este producto no tiene stock disponible.' })
        return
      }
      addToCart(product, variant, 1, setStockAlert)
    }
  }

  const playBeep = (freq = 800, dur = 0.08) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {
      console.warn('Audio Context block:', e.message);
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    let matchedProduct = null;
    let matchedVariant = null;

    for (const p of displayProducts) {
      // 1. Buscar coincidencia exacta en las variantes (prioridad)
      if (Array.isArray(p.variantes)) {
        const foundVar = p.variantes.find(v => v.barcode === code || v.sku === code);
        if (foundVar) {
          matchedProduct = p;
          matchedVariant = foundVar;
          break;
        }
      }
      // 2. Buscar coincidencia a nivel raíz si no se encontró en variantes
      if (p.barcode === code || p.sku === code) {
        matchedProduct = p;
        matchedVariant = p.variantes?.[0] || null;
        break;
      }
    }

    if (matchedProduct) {
      playBeep(880, 0.08); // Bip de éxito
      
      // Si se encontró variante específica por SKU, agregar esa variante directamente
      if (matchedVariant) {
        const stockNum = parseInt(matchedVariant.stock);
        if (stockNum <= 0) {
          setStockAlert({ 
            title: 'Stock insuficiente', 
            message: `La variante del producto "${matchedProduct.nombre}" no tiene stock disponible.` 
          });
          return;
        }
        addToCart(matchedProduct, matchedVariant, 1, setStockAlert);
      } else if (hasMultipleVariants(matchedProduct)) {
        setSelectedProductForModal(matchedProduct);
      } else {
        const defaultVariant = matchedProduct.variantes?.[0] || { id: 'default', stock: 9999, talla: null, color: null };
        if (defaultVariant.stock <= 0) {
          setStockAlert({ 
            title: 'Stock insuficiente', 
            message: `El producto "${matchedProduct.nombre}" no tiene stock disponible.` 
          });
          return;
        }
        addToCart(matchedProduct, defaultVariant, 1, setStockAlert);
      }
    } else {
      playBeep(220, 0.25); // Sonido grave de error
      setStockAlert({ 
        title: 'Producto no encontrado', 
        message: `El código de barras o SKU "${code}" no corresponde a ningún producto registrado.` 
      });
    }
    setBarcodeInput('');
  };

  const handleUpdateCartQty = (idx, delta) => {
    updateCartQty(idx, delta, setStockAlert)
  }

  // Imprimir Comprobante
  const handlePrintReceipt = (order) => {
    if (!order) return
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    const selectedMethod = order.metodoPago || paymentMethod
    const paymentLabel = selectedMethod === PAYMENT_METHODS.CREDIT 
      ? 'Crédito (Fiado)' 
      : selectedMethod === PAYMENT_METHODS.TRANSFER 
      ? 'Transferencia' 
      : 'Efectivo'

    const deliveryLabel = order.tipoEntrega === 'retiro'
      ? 'Física (En Tienda)'
      : order.tipoEntrega === 'domicilio'
      ? 'Domicilio a domicilio'
      : 'Venta Física (POS)'

    const subtotal = order.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    const { bankInfo } = useAppConfigStore.getState()

    const bankDetailsHtml = (selectedMethod === PAYMENT_METHODS.TRANSFER && bankInfo && bankInfo.numeroCuenta)
      ? `
        <div class="info-box" style="margin-top: 10px;">
          <h3>Datos para Transferencia Bancaria</h3>
          <p><strong>Banco:</strong> ${bankInfo.banco || ''} (${bankInfo.tipoCuenta === 'ahorros' ? 'Ahorros' : 'Corriente'})</p>
          <p><strong>Número de Cuenta:</strong> ${bankInfo.numeroCuenta || ''}</p>
          <p><strong>Titular:</strong> ${bankInfo.titular || ''}</p>
          ${bankInfo.cedulaNit ? `<p><strong>Cédula/NIT:</strong> ${bankInfo.cedulaNit}</p>` : ''}
        </div>
      `
      : ''

    const notesHtml = order.notas
      ? `
        <div style="margin-top: 10px; padding: 8px; background-color: #f9f9f9; border-left: 3px solid #ccc; font-size: 11px; font-style: italic; border-radius: 4px;">
          <strong>Notas:</strong> ${order.notas}
        </div>
      `
      : ''

    iframe.contentDocument.write(`
      <html>
        <head>
          <title>Comprobante #${order.orderNumber}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; color: #111; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 15px; margin-bottom: 15px; }
            .logo { max-width: 70px; border-radius: 12px; margin-bottom: 8px; }
            h1 { font-size: 20px; margin: 0 0 5px 0; }
            p { font-size: 13px; margin: 2px 0; color: #555; }
            .order-meta { margin-top: 10px; font-weight: bold; font-family: monospace; }
            .info-box { font-size: 13px; margin-bottom: 15px; background: #f9f9f9; padding: 8px; border-radius: 8px; }
            .info-box h3 { margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; color: #777; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th { text-align: left; border-bottom: 1px solid #ddd; padding: 6px 0; color: #666; font-size: 11px; text-transform: uppercase; }
            td { padding: 8px 0; border-bottom: 1px solid #f1f1f1; vertical-align: top; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; font-size: 15px; border-top: 2px dashed #ccc; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          ${order.offline ? `
            <div style="background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 10px; border-radius: 8px; text-align: center; font-size: 11px; font-weight: bold; margin-bottom: 15px; font-family: sans-serif;">
              ⚠️ COMPROBANTE PROVISIONAL (MODO OFFLINE)<br/>
              La venta se sincronizará automáticamente al conectar la red.
            </div>
          ` : ''}
          <div class="header">
            ${appIcon ? `<img src="${appIcon}" alt="Logo" class="logo" />` : ''}
            <h1>${appName || 'Factura de Venta'}</h1>
            ${whatsappAdmin ? `<p>WhatsApp: ${whatsappAdmin}</p>` : ''}
            <div class="order-meta">
              <p>Comprobante POS #${order.orderNumber}</p>
              <p>Fecha: ${order.createdAt.toLocaleString()}</p>
            </div>
          </div>
          
          <div class="info-box">
            <h3>Datos del Cliente</h3>
            <p><strong>Nombre:</strong> ${order.cliente?.nombre || 'N/A'}</p>
            <p><strong>Celular:</strong> ${order.cliente?.celular || 'N/A'}</p>
            ${order.tipoEntrega === 'domicilio' && order.cliente?.direccion
              ? `<p><strong>Dirección:</strong> ${order.cliente.direccion}</p>
                 <p><strong>Barrio/Ciudad:</strong> ${order.cliente.barrio || ''} ${order.cliente.ciudad || ''}</p>`
              : ''
            }
          </div>

          <div class="info-box">
            <h3>Detalles de Pago y Entrega</h3>
            <p><strong>Método:</strong> ${paymentLabel}</p>
            <p><strong>Entrega:</strong> ${deliveryLabel}</p>
          </div>

          ${bankDetailsHtml}

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right">Cant.</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.nombre}</strong><br/>
                    <small style="color: #666;">
                      ${item.atributos && Object.values(item.atributos).length > 0
                        ? Object.entries(item.atributos).map(([key, val]) => {
                            if (typeof val === 'string' && val.startsWith('#')) {
                              return `${key}: <span style="display:inline-block; width:10px; height:10px; border-radius:50%; border:1px solid #ccc; background-color:${val}; vertical-align:middle; margin-right:4px;"></span> ${val}`
                            }
                            return `${key}: ${val}`
                          }).join(' • ')
                        : (item.talla || item.color)
                          ? [
                              item.talla ? `Talla: ${item.talla}` : '',
                              item.color ? (item.color.startsWith('#') 
                                ? `Color: <span style="display:inline-block; width:10px; height:10px; border-radius:50%; border:1px solid #ccc; background-color:${item.color}; vertical-align:middle; margin-right:4px;"></span> ${item.color}`
                                : `Color: ${item.color}`) : ''
                            ].filter(Boolean).join(' • ')
                          : ''}
                    </small>
                  </td>
                  <td class="text-right">${item.cantidad}</td>
                  <td class="text-right">${formatCurrency(item.precio * item.cantidad)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="text-right" style="padding-top: 8px; font-size: 11px;">Subtotal:</td>
                <td class="text-right" style="padding-top: 8px; font-size: 11px;">${formatCurrency(subtotal)}</td>
              </tr>
              ${order.costoEnvio > 0
                ? `<tr>
                    <td colspan="2" class="text-right" style="font-size: 11px;">Envío:</td>
                    <td class="text-right" style="font-size: 11px;">+${formatCurrency(order.costoEnvio)}</td>
                   </tr>`
                : ''
              }
              ${order.descuento > 0
                ? `<tr>
                    <td colspan="2" class="text-right" style="font-size: 11px;">Descuento:</td>
                    <td class="text-right" style="font-size: 11px;">-${formatCurrency(order.descuento)}</td>
                   </tr>`
                : ''
              }
              <tr class="total-row">
                <td colspan="2" class="text-right" style="padding-top: 8px; font-size: 15px;">TOTAL:</td>
                <td class="text-right" style="padding-top: 8px; font-size: 15px;">${formatCurrency(order.total)}</td>
              </tr>
            </tfoot>
          </table>

          ${notesHtml}

          <div class="footer">
            <p>¡Gracias por tu visita!</p>
            <p>Venta registrada correctamente en el sistema.</p>
          </div>
        </body>
      </html>
    `)
    iframe.contentDocument.close()

    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => document.body.removeChild(iframe), 2000)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-app flex flex-col p-4 md:p-6 w-full max-w-[100vw]">

      {/* ─── SELECTOR DE MODO DE VENTA (Bottom Sheet) ──────────────────────── */}
      <AnimatePresence>
        {saleMode === null && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 99998, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative z-10 bg-surface rounded-t-3xl w-full max-w-lg p-6 pb-8 space-y-4 shadow-2xl"
            >
              <button 
                onClick={() => {
                  if (!isOnline) {
                    setSaleMode('inventory')
                  } else {
                    navigate(-1)
                  }
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-app transition-colors shadow-sm hover:scale-105 active:scale-95"
              >
                <X size={16} />
              </button>
              <div className="w-10 h-1 rounded-full bg-app/20 mx-auto mb-2" />
              <p className="text-sm font-bold text-app text-center">¿Qué tipo de venta vas a realizar?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSaleMode('inventory')}
                  className="flex flex-col items-center gap-3 p-5 bg-surface-2 hover:bg-primary/10 border border-app hover:border-primary rounded-2xl transition-all active:scale-95 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Store size={24} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-app">Inventario</p>
                    <p className="text-[10px] text-muted">Productos del catálogo</p>
                  </div>
                </button>
                <button
                  onClick={() => setSaleMode('custom')}
                  className="flex flex-col items-center gap-3 p-5 bg-surface-2 hover:bg-emerald-500/10 border border-app hover:border-emerald-500 rounded-2xl transition-all active:scale-95 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText size={24} className="text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-app">Personalizado</p>
                    <p className="text-[10px] text-muted">Producto libre / sin stock</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* ─── ENCABEZADO ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-app">Ventas Directas</h1>
              {!isOnline && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/25 animate-pulse">
                  <WifiOff size={10} /> Offline
                </span>
              )}
            </div>
            <p className="text-xs text-muted">{saleMode === 'custom' ? 'Modo: Producto personalizado' : 'POS Inteligente de Mostrador'}</p>
          </div>
        </div>
        {/* Toggle de modo */}
        {saleMode !== null && (
          <button
            onClick={() => setSaleMode(null)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 border border-app text-xs font-bold text-muted hover:text-app transition-colors"
          >
            <RefreshCw size={12} /> Cambiar modo
          </button>
        )}
        
        {/* Toggle de pestañas en Mobile */}
        <div className="flex md:hidden bg-surface rounded-2xl p-1 border border-app w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products' ? 'bg-primary text-white shadow-sm' : 'text-muted'
            }`}
          >
            Productos ({filteredProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'cart' ? 'bg-primary text-white shadow-sm' : 'text-muted'
            }`}
          >
            Resumen
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {cart.reduce((sum, item) => sum + item.cantidad, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* ─── PANEL IZQUIERDO: CATÁLOGO o FORMULARIO PERSONALIZADO ────── */}
        <div className={`md:col-span-7 xl:col-span-8 flex flex-col gap-4 ${activeTab !== 'products' ? 'hidden md:flex' : 'flex'}`}>

          {/* ── MODO PERSONALIZADO ───────────────────────────────────────── */}
          {saleMode === 'custom' && (
            <POSCustomItemForm
              onAddItem={(item) => setCart(prev => [...prev, item])}
              setStockAlert={setStockAlert}
            />
          )}
          
          {/* Buscador y categorías */}
          {saleMode !== 'custom' && (
            <>
              <div className="bg-surface rounded-3xl p-5 border border-app shadow-sm space-y-4">
                <div className={`grid ${posExpressScanner ? 'grid-cols-1 md:grid-cols-3 gap-3' : 'grid-cols-1'}`}>
                  {/* Buscador normal */}
                  <div className={`relative ${posExpressScanner ? 'md:col-span-2' : ''}`}>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Escribe nombre, talla o color para buscar"
                      className="w-full h-11 pl-10 pr-4 rounded-2xl bg-surface-2 border border-app text-sm text-app placeholder-muted focus:outline-none focus:border-primary transition-colors"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-surface-2 flex items-center justify-center text-muted hover:text-app"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Input de Escáner Dedicado */}
                  {posExpressScanner && (
                    <form onSubmit={handleBarcodeSubmit} className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 animate-pulse">
                        <Scan size={18} />
                      </span>
                      <input
                        type="text"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        placeholder="Escanear código [Bip]"
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-surface-2 border border-emerald-500/20 focus:border-emerald-500 text-sm text-app placeholder-muted focus:outline-none transition-colors"
                      />
                      {barcodeInput && (
                        <button
                          type="button"
                          onClick={() => setBarcodeInput('')}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-surface-2 flex items-center justify-center text-muted hover:text-app"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </form>
                  )}
                </div>

                {/* Categorías */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                  <button
                    onClick={() => setSelectedCategory('Todos')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                      selectedCategory === 'Todos'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-surface-2 text-app border-app hover:bg-surface-2/75'
                    }`}
                  >
                    Todos
                  </button>
                  {displayCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-surface-2 text-app border-app hover:bg-surface-2/75'
                      }`}
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grilla de productos */}
              {loadingProducts ? (
                <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-3xl border border-app shadow-sm">
                  <Loader2 className="animate-spin text-primary mb-3" size={32} />
                  <p className="text-xs text-muted">Cargando catálogo...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-3xl border border-app shadow-sm">
                  <Package className="text-muted mb-3 animate-pulse" size={40} />
                  <p className="text-sm font-semibold text-app">No se encontraron productos</p>
                  <p className="text-xs text-muted">Prueba con otra palabra clave o categoría.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map(product => {
                    const stock = getProductTotalStock(product)
                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAddProductClick(product)}
                        className="bg-surface rounded-3xl border border-app overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col group relative"
                      >
                        {/* Imagen */}
                        <div className="aspect-square bg-surface-2 flex items-center justify-center overflow-hidden relative">
                          {product.imageUrl ? (
                            <LazyImage
                              src={product.imageUrl}
                              alt={product.nombre}
                              className="group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <Package size={32} className="text-muted/65" />
                          )}
                          
                          {/* Stock Badge */}
                          <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm border ${
                            stock <= 0
                              ? 'bg-red-500 text-white border-red-600'
                              : stock <= 5
                              ? 'bg-warning text-white border-warning'
                              : 'bg-surface text-app border-app'
                          }`}>
                            {stock <= 0 ? 'Agotado' : `${stock} und.`}
                          </span>
                        </div>

                        {/* Contenido */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <p className="font-bold text-sm text-app line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                            {product.nombre}
                          </p>
                          <div>
                            <p className="text-[10px] text-muted mb-1">
                              {product.variantes?.length || 1} variante(s)
                            </p>
                            <p className="font-black text-primary text-base">
                              {formatCurrency(product.precioBase)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── PANEL DERECHO: CLIENTE Y CHECKOUT UNIFICADO (visible en desktop o si activeTab === 'cart') ─── */}
        <div className={`md:col-span-5 xl:col-span-4 ${activeTab !== 'cart' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-surface rounded-3xl border border-app shadow-sm flex flex-col divide-y divide-app w-full overflow-hidden">
            {/* ─── CLIENTE ─── */}
            <div className="p-5 space-y-4">
            <h3 className="font-bold text-sm text-app flex items-center gap-2">
              <User size={16} className="text-primary" />
              Búsqueda / Registro de Cliente
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Número de Celular</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    placeholder="Ej. 3001234567"
                    className="w-full h-11 pl-4 pr-10 rounded-2xl bg-surface-2 border border-app text-sm text-app placeholder-muted focus:outline-none focus:border-primary transition-colors"
                  />
                  {clientSearchStatus === 'searching' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <Loader2 size={16} className="animate-spin text-primary" />
                    </span>
                  )}
                  {clientSearchStatus === 'found' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-success">
                      <CheckCircle2 size={16} />
                    </span>
                  )}
                </div>
              </div>

              {/* Mensajes contextuales del cliente */}
              <AnimatePresence mode="wait">
                {clientSearchStatus === 'found' && foundClient && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-success-soft rounded-xl p-3"
                  >
                    <p className="text-xs font-bold text-success">Cliente encontrado correctamente.</p>
                    <p className="text-sm font-black text-app mt-1">{foundClient.nombre}</p>
                    <p className="text-xs text-muted">Celular: {foundClient.celular}</p>
                  </motion.div>
                )}

                {clientSearchStatus === 'not_found' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-warning-soft rounded-xl p-3 space-y-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-warning">El cliente no está registrado.</p>
                      <p className="text-[10px] text-muted">Ingresa su nombre para registrarlo ahora mismo:</p>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ingresa el nombre y apellido del cliente"
                        className="w-full h-11 px-4 rounded-xl bg-surface border border-app text-sm text-app placeholder-muted focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleRegisterClient}
                      disabled={!clientName.trim() || isRegisteringClient}
                      className="w-full h-10 rounded-xl bg-primary text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isRegisteringClient ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      Registrar Cliente
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </div>

            {/* ─── CARRITO DE LA VENTA ─── */}
            <div className="p-5 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-app flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-primary" />
                Resumen de Venta
              </span>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  Vaciar
                </button>
              )}
            </h3>

            {/* Listado de ítems */}
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart size={32} className="text-muted/65 mb-2 animate-bounce" />
                <p className="text-xs text-muted">Agrega productos del catálogo para iniciar la venta.</p>
              </div>
            ) : (
              <div className="divide-y divide-app max-h-[300px] overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={`${item.productId}-${item.variantId}`} className="py-3 flex gap-3 first:pt-0 last:pb-0">
                    {/* Imagen miniatura */}
                    <div className="w-10 h-10 rounded-lg bg-surface-2 border border-app overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <LazyImage src={item.imageUrl} alt={item.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={16} className="text-muted/65" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-app truncate">{item.nombre}</p>
                      {item.descripcion && (
                        <p className="text-[10px] text-muted italic">Detalle: {item.descripcion}</p>
                      )}
                      <p className="text-[10px] text-muted">
                        {[item.talla, item.color].filter(Boolean).join(' • ') || 'Estándar'}
                      </p>
                      <p className="text-xs font-black text-primary mt-1">
                        {formatCurrency(item.precio)}
                      </p>
                    </div>

                    {/* Controles de Cantidad */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateCartQty(idx, -1)}
                        className="w-7 h-7 rounded-lg bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-app active:scale-90 transition-all border border-app"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-mono font-bold w-5 text-center text-app">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => handleUpdateCartQty(idx, 1)}
                        className="w-7 h-7 rounded-lg bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-app active:scale-90 transition-all border border-app"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totales */}
            <div className="border-t border-app pt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted">
                <span>Items agregados</span>
                <span>{cart.reduce((sum, item) => sum + item.cantidad, 0)} und.</span>
              </div>
              <div className="flex justify-between items-end border-b border-app pb-3">
                <span className="text-sm font-bold text-app">Total de la venta</span>
                <span className="text-xl font-black text-primary">{formatCurrency(getCartTotal())}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest block">Método de Pago</label>
              <div className={`grid ${creditsEnabled ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                <button
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.CASH)}
                  className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === PAYMENT_METHODS.CASH
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-2 text-app border-app hover:bg-surface-2/80'
                  }`}
                >
                  <Coins size={16} />
                  <span className="text-[10px] font-bold">Efectivo</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.TRANSFER)}
                  className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === PAYMENT_METHODS.TRANSFER
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-2 text-app border-app hover:bg-surface-2/80'
                  }`}
                >
                  <Wallet size={16} />
                  <span className="text-[10px] font-bold">Transf.</span>
                </button>

                {creditsEnabled && (
                  <button
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.CREDIT)}
                    className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === PAYMENT_METHODS.CREDIT
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-surface-2 text-app border-app hover:bg-surface-2/80'
                    }`}
                  >
                    <CreditCard size={16} />
                    <span className="text-[10px] font-bold">Fiado</span>
                  </button>
                )}
              </div>
            </div>

            {paymentMethod === PAYMENT_METHODS.TRANSFER && (
              <div className="space-y-4 p-5 bg-gradient-to-br from-surface to-primary/[0.03] rounded-3xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-transparent pb-2">
                  Cuentas para Transferencia
                </p>
                <div className="space-y-4">
                  {bankInfo?.banco && (
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <div className="space-y-1.5 flex-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary text-white shadow-sm">
                          {bankInfo.banco}
                        </span>
                        <p className="text-[11px] text-muted">
                          Tipo: <span className="font-extrabold text-app">{bankInfo.tipoCuenta === 'ahorros' ? 'Ahorros' : bankInfo.tipoCuenta === 'corriente' ? 'Corriente' : 'Digital'}</span>
                        </p>
                        <p className="font-mono text-xs text-muted">
                          Número: <span className="font-black text-app bg-surface-2 px-2 py-1 rounded-lg">{bankInfo.numeroCuenta}</span>
                        </p>
                        <p className="text-[11px] text-muted">
                          Titular: <span className="font-bold text-app">{bankInfo.titular}</span>
                        </p>
                      </div>
                      {bankInfo.qrUrl && (
                        <div 
                          onClick={() => setExpandedQrUrl(bankInfo.qrUrl)}
                          className="w-24 h-24 rounded-2xl shadow-sm bg-white p-1.5 flex items-center justify-center shrink-0 hover:scale-105 transition-transform duration-300 cursor-pointer"
                        >
                          <img src={bankInfo.qrUrl} alt="QR Pago" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  )}
                  {bankInfo2?.activa && bankInfo2?.banco && (
                    <div className="flex items-center justify-between gap-4 text-xs pt-4 border-t border-app/50">
                      <div className="space-y-1.5 flex-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                          {bankInfo2.banco}
                        </span>
                        <p className="text-[11px] text-muted">
                          Tipo: <span className="font-extrabold text-app">{bankInfo2.tipoCuenta === 'ahorros' ? 'Ahorros' : bankInfo2.tipoCuenta === 'corriente' ? 'Corriente' : 'Digital'}</span>
                        </p>
                        <p className="font-mono text-xs text-muted">
                          Número: <span className="font-black text-app bg-surface-2 px-2 py-1 rounded-lg">{bankInfo2.numeroCuenta}</span>
                        </p>
                        <p className="text-[11px] text-muted">
                          Titular: <span className="font-bold text-app">{bankInfo2.titular}</span>
                        </p>
                      </div>
                      {bankInfo2.qrUrl && (
                        <div 
                          onClick={() => setExpandedQrUrl(bankInfo2.qrUrl)}
                          className="w-24 h-24 rounded-2xl shadow-sm bg-white p-1.5 flex items-center justify-center shrink-0 hover:scale-105 transition-transform duration-300 cursor-pointer"
                        >
                          <img src={bankInfo2.qrUrl} alt="QR Pago 2" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  )}
                  {!bankInfo?.banco && (!bankInfo2?.activa || !bankInfo2?.banco) && (
                    <p className="text-xs text-muted text-center py-4">No hay cuentas bancarias configuradas.</p>
                  )}
                </div>
              </div>
            )}

            {/* Notas opcionales */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Notas de la Venta (Opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ingresa indicaciones de despacho o referencias del lugar"
                rows={2}
                className="w-full p-3 rounded-xl bg-surface-2 border border-app text-xs text-app placeholder-muted focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Botón Finalizar */}
            <button
              onClick={finalizeSale}
              disabled={cart.length === 0 || !foundClient || isSubmitting}
              className="w-full h-12 rounded-2xl bg-primary text-white font-bold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Procesando venta...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Finalizar Venta
                </>
              )}
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL DE COMPILACIÓN DE VARIANTES ─────────────────────────── */}
      <POSVariantModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onSelectVariant={(variant) => {
          addToCart(selectedProductForModal, variant, 1, setStockAlert)
          setSelectedProductForModal(null)
        }}
      />

      {/* ─── MODAL DE COMPROBANTE / ÉXITO DE VENTA ──────────────────────── */}
      <POSReceiptModal
        orderDetails={lastOrderDetails}
        onClose={() => setLastOrderDetails(null)}
        onPrint={() => handlePrintReceipt(lastOrderDetails)}
      />
      {/* ─── MODAL PARA AMPLIAR EL QR ───────────────────────────────────── */}
      <AnimatePresence>
        {expandedQrUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedQrUrl(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white p-6 rounded-[2rem] shadow-2xl z-10 max-w-sm w-full flex flex-col items-center gap-4"
            >
              <button
                onClick={() => setExpandedQrUrl(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X size={14} />
              </button>
              <p className="text-sm font-bold text-center mt-2 text-slate-800">Escanea para Pagar</p>
              <div className="w-64 h-64 border border-slate-100 rounded-2xl overflow-hidden p-3 bg-white flex items-center justify-center shadow-inner">
                <img src={expandedQrUrl} alt="Código QR Ampliado" className="w-full h-full object-contain" />
              </div>
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                Presenta este código al cliente para realizar la transferencia de forma directa.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal de alerta de stock ─────────────────────────────────────── */}
      <AnimatePresence>
        {stockAlert && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStockAlert(null)}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative bg-surface rounded-3xl shadow-2xl p-6 max-w-xs w-full flex flex-col items-center gap-4 z-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                <Package size={28} className="text-amber-500" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-app">{stockAlert.title || 'Stock insuficiente'}</p>
                <p className="text-xs text-muted leading-relaxed">{stockAlert.message}</p>
              </div>
              <button
                onClick={() => setStockAlert(null)}
                className="w-full h-11 rounded-2xl font-bold text-sm text-white active:scale-95 transition-all"
                style={{ background: 'var(--color-primary)' }}
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
