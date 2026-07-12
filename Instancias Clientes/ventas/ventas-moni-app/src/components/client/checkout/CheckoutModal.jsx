import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, CreditCard, CheckCircle2, ChevronRight, Store, Truck, User, Phone, Tag, Check, AlertCircle, Copy, Calendar, ShoppingBag } from 'lucide-react'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, PAYMENT_METHOD_MESSAGES, SUPPORT_WHATSAPP } from '../../../constants'
import ModalTemplate from '../../common/ModalTemplate'
import { checkoutSchema } from '../../../schemas/orderSchemas'
import useCartStore from '../../../store/cartStore'
import useAuthStore from '../../../store/authStore'
import useAppConfigStore from '../../../store/appConfigStore'
import { useCreateOrder } from '../../../features/orders'
import { useCoupons } from '../../../hooks/useCoupons'
import { formatCurrency } from '../../../utils/formatters'
import useGuidedStore from '../../../store/guidedStore'
import useInactivityTimer from '../../../hooks/useInactivityTimer'
import SmartHint from '../guided/SmartHint'
import { openWhatsAppChat } from '../../../services/whatsappService'
import useCopyToClipboard from '../../../hooks/useCopyToClipboard'
import LeafletMapPicker from '../../ui/LeafletMapPicker'
import { getClientByPhone } from '../../../services/userService'


// Métodos de pago base
const getPaymentMethodsOptions = (creditsEnabled, onlinePaymentEnabled) => {
  const options = [
    {
      id: PAYMENT_METHODS.CASH,
      title: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.CASH],
      description: PAYMENT_METHOD_MESSAGES[PAYMENT_METHODS.CASH],
    },
    {
      id: PAYMENT_METHODS.TRANSFER,
      title: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.TRANSFER],
      description: PAYMENT_METHOD_MESSAGES[PAYMENT_METHODS.TRANSFER],
    },
  ]

  if (onlinePaymentEnabled) {
    options.push({
      id: PAYMENT_METHODS.ONLINE,
      title: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.ONLINE],
      description: PAYMENT_METHOD_MESSAGES[PAYMENT_METHODS.ONLINE],
    })
  }

  if (creditsEnabled) {
    options.push({
      id: PAYMENT_METHODS.CREDIT,
      title: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.CREDIT],
      description: PAYMENT_METHOD_MESSAGES[PAYMENT_METHODS.CREDIT],
    })
  }

  return options
}

// Opciones de entrega
const DELIVERY_OPTIONS = [
  {
    id: 'retiro',
    icon: Store,
    title: 'Retiro en Tienda',
    description: 'Recoge tu pedido directamente en nuestro local. Sin costo de envío.',
    badge: 'Gratis',
    badgeColor: 'bg-success/10 text-success',
  },
  {
    id: 'domicilio',
    icon: Truck,
    title: 'Domicilio',
    description: 'Recibe tu pedido en la comodidad de tu casa. Te contactaremos para coordinar.',
    badge: 'A tu puerta',
    badgeColor: 'bg-primary/10 text-primary',
  },
]

// Títulos del header según paso
const STEP_TITLES = {
  1: 'Método de Entrega',
  2: 'Tus Datos',
  3: 'Método de Pago',
  4: 'Resumen del Pedido',
}

export default function CheckoutModal({ isOpen, onClose }) {
  const { items, getTotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const { bankInfo, bankInfo2, whatsappAdmin, appName, deliverySettings, orderTrackingEnabled, creditsEnabled, couponsEnabled } = useAppConfigStore()
  const { mutateAsync: createOrder, isPending } = useCreateOrder()
  const { completedSteps, markStepCompleted } = useGuidedStore()
  const { data: coupons = [] } = useCoupons()

  const currentSettings = useMemo(() => {
    return deliverySettings || {
      pickup: { enabled: true, address: '', instructions: 'Recoge tu pedido directamente en nuestro local.' },
      shipping: { enabled: true, cost: 0, estimatedTime: '30 a 60 min', instructions: 'Recibe tu pedido en la comodidad de tu casa.' },
      digital: { enabled: false, instructions: '' }
    }
  }, [deliverySettings])

  // Construcción dinámica de métodos de entrega
  const activeDeliveryOptions = []
  
  if (currentSettings.pickup?.enabled !== false) {
    activeDeliveryOptions.push({
      id: 'retiro',
      icon: Store,
      title: 'Retiro en Tienda',
      description: currentSettings.pickup?.instructions || 'Recoge tu pedido directamente en nuestro local.',
      badge: 'Gratis',
      badgeColor: 'bg-success/10 text-success',
    })
  }

  if (currentSettings.shipping?.enabled !== false) {
    let shippingBadge = 'Por acordar'
    if (currentSettings.customDelivery?.enabled) {
      if (currentSettings.customDelivery.costType === 'fijo') {
        const fixed = Number(currentSettings.customDelivery.fixedCost) || 0
        shippingBadge = fixed > 0 ? `+ ${formatCurrency(fixed)}` : 'Gratis'
      } else {
        shippingBadge = 'Por acordar'
      }
    } else if (currentSettings.shipping?.cost > 0) {
      shippingBadge = `+ ${formatCurrency(currentSettings.shipping.cost)}`
    }

    activeDeliveryOptions.push({
      id: 'domicilio',
      icon: Truck,
      title: 'Domicilio',
      description: currentSettings.shipping?.instructions || 'Recibe tu pedido en la comodidad de tu casa. Te contactaremos para coordinar.',
      badge: shippingBadge,
      badgeColor: 'bg-primary/10 text-primary',
    })
  }

  if (currentSettings.digital?.enabled === true) {
    activeDeliveryOptions.push({
      id: 'digital',
      icon: CheckCircle2,
      title: 'Entrega Digital / Servicio',
      description: currentSettings.digital?.instructions || 'Servicios presenciales o productos virtuales.',
      badge: 'Sin envío',
      badgeColor: 'bg-info/10 text-info',
    })
  }

  // step: 1=Entrega, 2=Datos, 3=Pago, 4=Éxito
  const [step, setStep] = useState(1)
  const [orderNumber, setOrderNumber] = useState('')
  const [errors, setErrors] = useState({})
  const [orderSnapshot, setOrderSnapshot] = useState(null)
  const isSubmittingRef = useRef(false)
  const [showPaymentGateway, setShowPaymentGateway] = useState(false)
  const [isPaidOnline, setIsPaidOnline] = useState(false)

  // Lookup de cliente por celular
  const [phoneLookup, setPhoneLookup] = useState('idle') // 'idle' | 'loading' | 'found' | 'new'
  const [showNameField, setShowNameField] = useState(true)

  // Cupones state
  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [showCouponSelector, setShowCouponSelector] = useState(false)
  const [copied, copyLink] = useCopyToClipboard()
  const [copiedAccount, setCopiedAccount] = useState(null) // null | 1 | 2

  const copyAccountNumber = (num, accountNumber) => {
    navigator.clipboard.writeText(accountNumber).then(() => {
      setCopiedAccount(num)
      setTimeout(() => setCopiedAccount(null), 2000)
    }).catch(() => {})
  }

  const { isInactive: isShippingInactive } = useInactivityTimer(10000, step === 2 && isOpen)

  // Resetear estados de pago online al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      setIsPaidOnline(false)
      setShowPaymentGateway(false)
    }
  }, [isOpen])

  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    tipoEntrega: '',   // 'retiro' | 'domicilio' | 'digital'
    direccion: '',
    barrio: '',
    ciudad: '',
    coords: null,
    metodoPago: '',
    notas: '',
  })

  // Banco seleccionado para transferencia (cuando hay dos cuentas)
  const [selectedBank, setSelectedBank] = useState(1) // 1 | 2
  
  // Controlar visualización del mapa de recogida
  const [showPickupMap, setShowPickupMap] = useState(false)

  // Limpiar cupones si cambia el método de pago para re-validar compatibilidad
  useEffect(() => {
    if (appliedCoupon && formData.metodoPago) {
      const isCompat = isCouponCompatible(appliedCoupon, formData.metodoPago)
      if (!isCompat) {
        setAppliedCoupon(null)
        setCouponError(`El cupón aplicado no es válido para el método de pago ${PAYMENT_METHOD_LABELS[formData.metodoPago]}.`)
      }
    }
  }, [formData.metodoPago, appliedCoupon])

  // Re-validar cupón si cambian los items o el subtotal del carrito
  useEffect(() => {
    if (appliedCoupon) {
      const subtotal = getTotal()
      if (appliedCoupon.minimoCompra && subtotal < appliedCoupon.minimoCompra) {
        setAppliedCoupon(null)
        setCouponError(`El cupón se ha removido porque el subtotal actual (${formatCurrency(subtotal)}) no alcanza el mínimo requerido (${formatCurrency(appliedCoupon.minimoCompra)}).`)
      }
    }
  }, [items, appliedCoupon])

  useEffect(() => {
    if (isOpen) {
      // Recalcular dinámicamente activeDeliveryOptions al abrir para evitar closure estático
      const options = []
      if (currentSettings.pickup?.enabled !== false) options.push('retiro')
      if (currentSettings.shipping?.enabled !== false) options.push('domicilio')
      if (currentSettings.digital?.enabled === true) options.push('digital')

      const hasOnlyOneOption = options.length === 1
      const initialDeliveryType = hasOnlyOneOption ? options[0] : ''

      setStep(hasOnlyOneOption ? 2 : 1)
      setErrors({})
      setOrderSnapshot(null)
      isSubmittingRef.current = false
      setCouponCodeInput('')
      setAppliedCoupon(null)
      setCouponError('')
      setShowCouponSelector(false)
      setFormData({
        nombre: user?.nombre || '',
        celular: user?.celular || '',
        tipoEntrega: initialDeliveryType,
        direccion: '',
        barrio: '',
        ciudad: '',
        coords: null,
        metodoPago: '',
        notas: '',
      })
      setSelectedBank(1)
      setShowPickupMap(false)
      // Si ya hay usuario logueado, mostrar nombre directamente
      if (user?.nombre) {
        setPhoneLookup('found')
        setShowNameField(true)
      } else {
        setPhoneLookup('idle')
        setShowNameField(true)
      }
    }
  }, [isOpen, user, deliverySettings])

  // ── Paso 1 → 2: selección de entrega ─────────────────────────────────────
  const handleSelectDelivery = (tipo) => {
    setFormData(prev => ({
      ...prev,
      tipoEntrega: tipo,
      ...(tipo !== 'domicilio' && { coords: null })
    }))
    setErrors({})
    setStep(2)
  }

  // ── Lookup de cliente por celular en tiempo real (debounced) ──────────────
  useEffect(() => {
    const phone = formData.celular?.replace(/\D/g, '')
    if (user?.nombre || !phone || phone.length < 7) return
    setPhoneLookup('loading')
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const client = await getClientByPhone(phone)
        if (cancelled) return
        if (client?.nombre) {
          setFormData(prev => ({ ...prev, nombre: client.nombre }))
          setPhoneLookup('found')
        } else {
          setPhoneLookup('new')
        }
      } catch {
        if (!cancelled) setPhoneLookup('new')
      }
    }, 600)
    return () => { cancelled = true; clearTimeout(timer) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.celular])

  // ── Paso 2 → 3: validación de datos ──────────────────────────────────────
  const handleNextStep = () => {
    const isDomicilio = formData.tipoEntrega === 'domicilio'
    const missing = []

    if (!formData.nombre) {
      missing.push('nombre')
    } else if (formData.nombre.trim().length < 3) {
      setErrors({ global: 'El nombre debe tener al menos 3 caracteres.' })
      return
    }

    if (!formData.celular) {
      missing.push('celular')
    } else if (formData.celular.replace(/\D/g, '').length < 7) {
      setErrors({ global: 'Ingresa un número de celular válido (mínimo 7 dígitos).' })
      return
    }

    if (isDomicilio) {
      if (!formData.ciudad) missing.push('ciudad')
      if (!formData.barrio) missing.push('barrio')
      if (!formData.direccion) missing.push('dirección')
    }

    if (missing.length > 0) {
      setErrors({ global: `Por favor completa todos los campos obligatorios: ${missing.join(', ')}.` })
      return
    }
    setErrors({})
    setStep(3)
  }

  // ── Lógica de Cupones ────────────────────────────────────────────────────
  // Lanzar animación de confeti dinámicamente al aplicar cupón con éxito
  const triggerConfetti = async () => {
    try {
      const module = await import('canvas-confetti')
      const confetti = module.default || module
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.75 },
        colors: ['#7c3aed', '#0ea5e9', '#059669', '#dc2626', '#f43f5e', '#fbbf24']
      })
    } catch (e) {
      console.warn('Librería canvas-confetti no cargada:', e.message)
    }
  }

  const isCouponCompatible = (coupon, paymentMethod) => {
    if (!coupon.metodosPago || coupon.metodosPago.length === 0) return true
    return coupon.metodosPago.includes(paymentMethod)
  }

  const handleApplyCoupon = (codeToApply = couponCodeInput) => {
    setCouponError('')
    const code = codeToApply.trim().toUpperCase()
    if (!code) {
      setCouponError('Ingresa un código de cupón.')
      return
    }

    const coupon = coupons.find(c => c.codigo.toUpperCase() === code)
    
    if (!coupon) {
      setCouponError('El cupón ingresado no existe.')
      return
    }

    if (!coupon.activo) {
      setCouponError('Este cupón ya no está activo.')
      return
    }

    // Validar expiración
    if (coupon.fechaExpiracion) {
      const expirationDate = new Date(coupon.fechaExpiracion)
      if (expirationDate < new Date()) {
        setCouponError('Este cupón ha expirado.')
        return
      }
    }

    // Validar monto mínimo
    const subtotal = getTotal()
    if (coupon.minimoCompra && subtotal < coupon.minimoCompra) {
      setCouponError(`Compra mínima requerida para este cupón: ${formatCurrency(coupon.minimoCompra)} (Tienes ${formatCurrency(subtotal)}).`)
      return
    }

    // Validar método de pago (si ya seleccionó uno)
    if (formData.metodoPago && !isCouponCompatible(coupon, formData.metodoPago)) {
      setCouponError(`Este cupón no aplica para el método de pago: ${PAYMENT_METHOD_LABELS[formData.metodoPago]}.`)
      return
    }

    setAppliedCoupon(coupon)
    setCouponCodeInput('')
    setShowCouponSelector(false)
    triggerConfetti()
  }

  const calculateDiscount = () => {
    if (!couponsEnabled || !appliedCoupon) return 0
    const subtotal = getTotal()
    const raw = appliedCoupon.tipoDescuento === 'porcentaje'
      ? (subtotal * appliedCoupon.valorDescuento) / 100
      : appliedCoupon.valorDescuento
    return Math.min(raw, subtotal) // Descuento no puede superar el subtotal
  }

  const getShippingCost = () => {
    if (formData.tipoEntrega === 'domicilio') {
      if (currentSettings.customDelivery?.enabled) {
        if (currentSettings.customDelivery.costType === 'fijo') {
          return Number(currentSettings.customDelivery.fixedCost) || 0
        }
        return 0 // Personalizado, se asignará desde administración
      }
      return Number(currentSettings.shipping?.cost) || 0
    }
    return 0
  }

  const getFinalTotal = () => {
    const subtotal = getTotal()
    const discount = calculateDiscount()
    const shippingCost = getShippingCost()
    return Math.max(0, subtotal - discount + shippingCost)
  }

  // ── Paso 3: confirmar pedido ──────────────────────────────────────────────
  const handleCheckout = async () => {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true

    // Guard: carrito no puede estar vacío al confirmar
    if (!items.length) {
      setErrors({ global: 'Tu carrito está vacío. Agrega productos antes de continuar.' })
      isSubmittingRef.current = false
      return
    }

    const result = checkoutSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors = {}
      let firstMessage = ''
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0]] = issue.message
        if (!firstMessage) firstMessage = issue.message
      })
      setErrors({ ...fieldErrors, global: firstMessage || 'Por favor verifica los datos ingresados.' })
      isSubmittingRef.current = false
      return
    }

    try {
      setErrors({})
      const isDomicilio = formData.tipoEntrega === 'domicilio'
      const finalDiscount = calculateDiscount()
      const currentShippingCost = getShippingCost()

      const orderData = {
        cliente: {
          nombre: formData.nombre,
          celular: formData.celular.replace(/\D/g, ''),
          ...(isDomicilio && {
            direccion: formData.direccion,
            barrio: formData.barrio,
            ciudad: formData.ciudad,
            coords: formData.coords || null,
          }),
        },
        tipoEntrega: formData.tipoEntrega,

        costoEnvio: currentShippingCost,
        metodoPago: formData.metodoPago,
        ...(formData.metodoPago === 'transferencia' && {
          bancoElegido: selectedBank === 2 && bankInfo2?.activa ? bankInfo2.banco : bankInfo?.banco,
        }),
        notas: formData.notas,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          nombre: item.nombre,
          precio: item.precio,
          talla: item.talla,
          color: item.color,
          cantidad: item.cantidad,
          imageUrl: item.imageUrl,
        })),
        total: getFinalTotal(),
        subtotal: getTotal(),
        descuento: finalDiscount,
        ...(appliedCoupon && {
          couponCode: appliedCoupon.codigo,
          couponId: appliedCoupon.id,
        })
      }

      const currentTotal = getFinalTotal()
      const currentItems = [...items]

      const { id: newOrderId, trackingToken } = await createOrder(orderData)
      const shortId = newOrderId.slice(-8).toUpperCase()

      setOrderSnapshot({
        ...orderData,
        items: currentItems,
        total: currentTotal,
        numero: shortId,
        trackingToken,
      })

      if (!completedSteps?.['checkout']) {
        markStepCompleted('checkout')
      }

      setOrderNumber(shortId)
      clearCart()
      isSubmittingRef.current = false // ← reset también en éxito
      setStep(5)
    } catch (error) {
      console.error('Error al crear pedido:', error)
      setErrors({ global: error.message || 'Error procesando tu pedido. Intenta nuevamente.' })
      isSubmittingRef.current = false
    }
  }

  // ── Mensaje WhatsApp ──────────────────────────────────────────────────────
  const handleWhatsApp = () => {
    const snap = orderSnapshot
    const num = snap?.numero || orderNumber
    const isDomicilio = snap?.tipoEntrega === 'domicilio'
    const isDigital = snap?.tipoEntrega === 'digital'

    const e = {
      carrito:   '\uD83D\uDED2', // 🛒
      cliente:   '\uD83D\uDC64', // 👤
      celular:   '\uD83D\uDCF1', // 📱
      ubicacion: '\uD83D\uDCCD', // 📍
      tienda:    '\uD83C\uDFEA', // 🏪
      caja:      '\uD83D\uDCE6', // 📦
      item:      '\uD83C\uDFF7\uFE0F', // 🏷️
      tarjeta:   '\uD83D\uDCB3', // 💳
      dinero:    '\uD83D\uDCB0', // 💰
      nota:      '\uD83D\uDCDD', // 📝
      camion:    '\uD83D\uDE9A', // 🚚
      cupon:     '\uD83C\uDF9F\uFE0F', // 🎟️
      digital:   '\uD83D\uDCF2', // 📲
    }

    const metodosLabel = { efectivo: 'Efectivo', transferencia: 'Transferencia', credito: 'Crédito (Fiado)' }
    // Banco: usar el que quedó registrado en el snapshot (no el estado mutable selectedBank)
    const bancoName = snap?.bancoElegido
    const bancoInfo = bancoName
      ? (bankInfo2?.activa && bankInfo2?.banco === bancoName ? bankInfo2 : bankInfo)
      : null
    const itemsText = (snap?.items || []).map(item => {
      const variant = item.talla || item.color ? ` (${[item.talla, item.color].filter(Boolean).join(', ')})` : ''
      return `  ${e.item} ${item.nombre}${variant} x${item.cantidad} — ${formatCurrency(item.precio * item.cantidad)}`
    }).join('\n')

    let entregaLine = ''
    if (isDomicilio) {
      entregaLine = `${e.camion} *Entrega:* Domicilio\n${e.ubicacion} *Dirección:* ${snap?.cliente?.direccion || ''}, ${snap?.cliente?.barrio || ''}, ${snap?.cliente?.ciudad || ''}`
    } else if (isDigital) {
      entregaLine = `${e.digital} *Entrega:* Digital / Servicios`
    } else {
      const addressText = currentSettings.pickup?.address ? ` (${currentSettings.pickup.address})` : ''
      entregaLine = `${e.tienda} *Entrega:* Retiro en Tienda${addressText}`
    }

    const notasLine = snap?.notas ? `\n\n${e.nota} *Notas:* ${snap.notas}` : ''

    const couponLine = snap?.couponCode 
      ? `\n${e.cupon} *Cupón Aplicado:* ${snap.couponCode} (- ${formatCurrency(snap.descuento)})` 
      : ''

    const shippingLine = snap?.costoEnvio > 0 
      ? `\n${e.camion} *Envío:* ${formatCurrency(snap.costoEnvio)}`
      : ''

    const subtotalLine = `\nSubtotal: ${formatCurrency(snap?.subtotal || getTotal())}`

    const bancoLine = bancoInfo
      ? `\n\uD83C\uDFE6 *Banco elegido:* ${bancoInfo.banco} · ${bancoInfo.numeroCuenta}${bancoInfo.titular ? ` · ${bancoInfo.titular}` : ''}`
      : ''

    const seller = useAppConfigStore.getState().sellerName || 'el Administrador'

    const text =
`Hola ${seller} de *${appName || 'la Tienda'}*.
${e.carrito} *Nuevo Pedido #${num}*

${e.cliente} *Cliente:* ${snap?.cliente?.nombre || ''}
${e.celular} *Celular:* ${snap?.cliente?.celular || ''}
${entregaLine}

${e.caja} *Productos:*
${itemsText}
${subtotalLine}${couponLine}${shippingLine}
${e.tarjeta} *Método de pago:* ${metodosLabel[snap?.metodoPago] || snap?.metodoPago}${bancoLine}
${e.dinero} *Total:* ${formatCurrency(snap?.total || 0)}${notasLine}`

    openWhatsAppChat({ message: text })
  }

  if (!isOpen) return null

  const isDomicilio = formData.tipoEntrega === 'domicilio'
  const activeCoupons = coupons.filter(coupon => {
    if (!coupon.activo) return false
    if (coupon.fechaExpiracion && new Date(coupon.fechaExpiracion) < new Date()) return false
    if (coupon.minimoCompra && getTotal() < coupon.minimoCompra) return false
    if (formData.metodoPago && !isCouponCompatible(coupon, formData.metodoPago)) return false
    return true
  })

  const stepperSubtitle = step === 5 ? null : (
    <div className="flex items-center gap-1.5 mt-1">
      {[1, 2, 3, 4].map(s => (
        <div
          key={s}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: s === step ? '16px' : '6px',
            backgroundColor: s <= step ? 'var(--color-primary)' : 'var(--color-border)',
          }}
        />
      ))}
    </div>
  )

  const handleCloseVerify = () => {
    if (step > 1 && step < 5) {
      const confirmClose = window.confirm("¿Seguro que deseas salir del proceso de compra? Los datos ingresados se perderán.")
      if (!confirmClose) return
    }
    onClose()
  }

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={handleCloseVerify}
      title={step === 5 ? null : STEP_TITLES[step]}
      subtitle={stepperSubtitle}
      onBack={step > 1 && step < 5 ? () => setStep(step - 1) : null}
    >
      {errors.global && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-error rounded-xl text-sm font-medium">
          {errors.global}
        </div>
      )}

            {/* ══ PASO 1: SELECCIÓN DE ENTREGA ══════════════════════════════════ */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Truck size={26} className="text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-app">¿Cómo quieres recibir tu pedido?</h3>
                  <p className="text-sm text-muted mt-1">Elige el método de entrega que más te convenga</p>
                </div>

                <div className="space-y-3">
                  {activeDeliveryOptions.map(({ id, icon: Icon, title, description, badge, badgeColor }) => (
                    <motion.button
                      key={id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectDelivery(id)}
                      className="w-full p-4 rounded-2xl border-2 border-app bg-surface-2 hover:border-primary/40 hover:bg-surface transition-all text-left flex gap-4 items-start group"
                    >
                      {/* Icono */}
                      <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center shrink-0 border border-app group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                        <Icon size={22} className="text-muted group-hover:text-primary transition-colors" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-app text-sm">{title}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">{description}</p>
                      </div>

                      {/* Flecha */}
                      <ChevronRight size={18} className="text-muted shrink-0 mt-1 group-hover:text-primary transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ PASO 2: DATOS DE CONTACTO / ENVÍO ════════════════════════════ */}
            {step === 2 && (
              <motion.div data-testid="checkout-step-contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">

                {/* Badge de tipo de entrega seleccionado */}
                <div
                  className="flex items-center gap-2 p-3 rounded-xl mb-2"
                  style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}
                >
                  {formData.tipoEntrega === 'domicilio' && <Truck size={16} className="text-primary shrink-0" />}
                  {formData.tipoEntrega === 'retiro' && <Store size={16} className="text-primary shrink-0" />}
                  {formData.tipoEntrega === 'digital' && <CheckCircle2 size={16} className="text-primary shrink-0" />}
                  <span className="text-xs font-bold text-primary capitalize">
                    {formData.tipoEntrega === 'domicilio' ? 'Entrega a domicilio' : formData.tipoEntrega === 'retiro' ? 'Retiro en tienda' : 'Entrega digital / servicio'}
                  </span>
                  {activeDeliveryOptions.length > 1 && (
                    <button onClick={() => setStep(1)} className="ml-auto text-xs text-muted hover:text-primary underline underline-offset-2">
                      Cambiar
                    </button>
                  )}
                </div>

                {/* ── CELULAR (primer campo) ───────────────────────────────── */}
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
                    <Phone size={11} className="inline mr-1" />Número de contacto *
                  </label>
                  <div className="relative">
                    <input
                      data-testid="checkout-phone-input"
                      type="tel"
                      placeholder="Ingresa el número de celular (10 dígitos)"
                      value={formData.celular}
                      onChange={e => {
                        // Resetear lookup al cambiar el número
                        setPhoneLookup('idle')
                        setFormData(prev => ({ ...prev, celular: e.target.value }))
                      }}
                      className={`w-full h-12 px-4 rounded-xl bg-surface-2 border text-app focus:outline-none transition-colors ${
                        phoneLookup === 'found' ? 'border-success focus:border-success' : 'border-app focus:border-primary'
                      }`}
                    />
                    {/* Spinner de búsqueda */}
                    {phoneLookup === 'loading' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    )}
                    {/* Check verde si se encontró */}
                    {phoneLookup === 'found' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check size={16} className="text-success" />
                      </div>
                    )}
                  </div>
                  {/* Mensaje de confianza */}
                  <p className="text-[11px] text-muted mt-1.5 flex items-start gap-1 leading-snug">
                    <span className="shrink-0">🔒</span>
                    <span>Tu número es privado y solo lo usaremos para contactarte sobre tus pedidos. Nada más.</span>
                  </p>
                  {/* Badge de cliente encontrado */}
                  {phoneLookup === 'found' && formData.nombre && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent)', color: 'var(--color-success, #16a34a)' }}
                    >
                      <Check size={13} />
                      <span>¡Hola de nuevo, <strong>{formData.nombre}</strong>! 👋 Tus datos están listos.</span>
                    </motion.div>
                  )}
                </div>

                {/* ── NOMBRE (aparece animado según el lookup) ─────────────── */}
                <AnimatePresence>
                  {showNameField && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
                        <User size={11} className="inline mr-1" />Nombre completo *
                      </label>
                      <input
                        type="text"
                        placeholder={phoneLookup === 'new' ? '¿Cuál es tu nombre? 😊' : 'Tu nombre'}
                        value={formData.nombre}
                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        autoFocus={phoneLookup === 'new'}
                        className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors"
                      />
                      {phoneLookup === 'new' && (
                        <p className="text-[11px] text-muted mt-1.5 leading-snug">
                          ✨ Parece que es tu primera vez aquí. ¡Bienvenido/a! Ingresa tu nombre para que podamos atenderte mejor.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Información de Retiro en Tienda con Mapa y Estilo Premium */}
                {formData.tipoEntrega === 'retiro' && currentSettings.pickup?.coords && (
                  <div className="p-4 bg-surface-2 border border-app rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Store size={16} className="text-primary" />
                      <p className="text-xs font-bold text-muted uppercase tracking-wider">Punto de Recogida</p>
                    </div>
                    <p className="text-sm font-semibold text-app leading-tight">{currentSettings.pickup?.address || 'Nuestra Tienda Física'}</p>
                    {currentSettings.pickup?.instructions && (
                      <p className="text-xs text-muted leading-relaxed italic bg-surface-3 p-3.5 rounded-xl border-l-4 border-primary">
                        {currentSettings.pickup.instructions}
                      </p>
                    )}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPickupMap(v => !v)}
                        className="flex items-center justify-between w-full h-11 px-4 rounded-xl bg-surface hover:bg-surface-3 border border-app text-xs font-bold text-app transition-all active:scale-[0.99]"
                      >
                        <span>{showPickupMap ? '🗺️ Ocultar Mapa de Ubicación' : '🗺️ Ver Ubicación en el Mapa'}</span>
                        <span className="text-[10px] text-muted">{showPickupMap ? '▲' : '▼'}</span>
                      </button>
                      <AnimatePresence>
                        {showPickupMap && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <LeafletMapPicker
                              address={currentSettings.pickup?.address || ''}
                              coords={currentSettings.pickup?.coords}
                              readOnly={true}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Campos de dirección — SOLO para domicilio */}
                {isDomicilio && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 pt-2">
                      <MapPin size={14} className="text-primary" />
                      <p className="text-xs font-bold text-muted uppercase tracking-wider">Dirección de entrega</p>
                    </div>

                    {/* Leaflet Map Picker Integration */}
                    <div className="mb-2">
                      <LeafletMapPicker
                        address={formData.direccion}
                        coords={formData.coords}
                        onChange={({ address, barrio, ciudad, coords }) => {
                          setFormData(prev => ({
                            ...prev,
                            direccion: address || prev.direccion,
                            barrio: barrio || prev.barrio,
                            ciudad: ciudad || prev.ciudad,
                            coords
                          }))
                        }}
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Ingresa la ciudad de entrega"
                      value={formData.ciudad}
                      onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Ingresa el barrio o sector"
                      value={formData.barrio}
                      onChange={e => setFormData({ ...formData, barrio: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Ingresa la dirección detallada"
                      value={formData.direccion}
                      onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors"
                    />
                  </motion.div>
                )}

                {/* Notas */}
                <div>
                  <textarea
                    placeholder={isDomicilio ? 'Notas adicionales (ej: Casa verde de 2 pisos)' : 'Notas adicionales (opcional)'}
                    value={formData.notas}
                    onChange={e => setFormData({ ...formData, notas: e.target.value })}
                    rows={2}
                    className="w-full p-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <SmartHint
                  stepId="checkout_shipping"
                  message={isDomicilio ? 'Asegúrate de escribir tu dirección correctamente para que tu pedido llegue sin problemas.' : 'Pronto recibirás una notificación cuando tu pedido esté listo para retirar.'}
                  position="bottom"
                  inactivityTrigger={true}
                  isInactive={isShippingInactive}
                  className="mt-2"
                />

                <button
                  onClick={handleNextStep}
                  className="w-full h-14 mt-4 bg-action text-white rounded-2xl font-bold text-base transition-all duration-300 active:scale-95 hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-action/30"
                >
                  Continuar al Pago <ChevronRight size={20} />
                </button>
              </motion.div>
            )}

            {/* ══ PASO 3: MÉTODO DE PAGO ════════════════════════════════════════ */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={18} className="text-primary" />
                  <span className="font-semibold text-app">¿Cómo deseas pagar?</span>
                </div>

                <div className="relative mb-2">
                  <SmartHint
                    stepId="checkout_payment"
                    message="Puedes elegir cómo deseas pagar tu pedido. El pago lo realizarás al recibir o a las cuentas que te enviaremos."
                    position="top"
                    delay={500}
                  />
                </div>

                <div className="space-y-3">
                  {getPaymentMethodsOptions(creditsEnabled, currentSettings?.onlinePayment?.enabled).map((method) => {
                    const isSelected = formData.metodoPago === method.id
                    return (
                      <motion.div
                        key={method.id}
                        onClick={() => setFormData({ ...formData, metodoPago: method.id })}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          isSelected ? 'shadow-lg shadow-primary/5 scale-[1.01]' : 'border-app bg-surface-2 hover:border-primary/30'
                        }`}
                        style={isSelected ? {
                          borderColor: 'var(--color-primary)',
                          backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                        } : {}}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className={`font-bold text-base ${isSelected ? 'text-primary' : 'text-app'}`}
                            style={isSelected ? { color: 'var(--color-primary)' } : {}}
                          >
                            {method.title}
                          </h3>
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                            style={isSelected ? { borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary)' } : { borderColor: 'var(--color-border)' }}
                          >
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </div>
                        <p className="text-sm text-muted pr-6 leading-relaxed">{method.description}</p>

                        {isSelected && method.id === 'transferencia' && bankInfo?.banco && (() => {
                          const hasSecondBank = bankInfo2?.activa && bankInfo2?.banco
                          return (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 space-y-2"
                            >
                              {hasSecondBank ? (
                                // ─── Dos cuentas: el cliente elige ───
                                <>
                                  <p className="text-xs text-muted mb-2 flex items-center gap-1">
                                    <span>Elige a cuál cuenta transferir:</span>
                                  </p>
                                  {[{ num: 1, info: bankInfo }, { num: 2, info: bankInfo2 }].map(({ num, info }) => (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); setSelectedBank(num) }}
                                      className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-3 ${
                                        selectedBank === num
                                          ? 'border-primary/60 bg-surface shadow-sm'
                                          : 'border-app bg-surface hover:border-primary/30'
                                      }`}
                                    >
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                        selectedBank === num ? 'border-primary bg-primary' : 'border-muted'
                                      }`}>
                                        {selectedBank === num && <div className="w-2 h-2 bg-white rounded-full" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-app text-sm">{info.banco}</p>
                                        <p className="text-app font-mono text-xs">{info.numeroCuenta}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-muted text-xs capitalize">{info.tipoCuenta}</span>
                                          {info.titular && <span className="text-muted text-xs">· {info.titular}</span>}
                                        </div>
                                      </div>
                                      {/* Botón copiar número de cuenta */}
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); copyAccountNumber(num, info.numeroCuenta) }}
                                        className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                          copiedAccount === num
                                            ? 'bg-success/15 text-success'
                                            : 'bg-surface-2 text-muted hover:bg-primary/10 hover:text-primary'
                                        }`}
                                        title="Copiar número de cuenta"
                                      >
                                        {copiedAccount === num
                                          ? <><Check size={11} /> Copiado</>  
                                          : <><Copy size={11} /> Copiar</>  
                                        }
                                      </button>
                                    </button>
                                  ))}
                                </>
                              ) : (
                                // ─── Una sola cuenta ───
                                <div className="p-3 bg-surface rounded-xl border border-app text-sm space-y-1">
                                  <p className="text-muted text-xs mb-1.5">Transfiere a:</p>
                                  <p className="font-bold text-app">{bankInfo.banco}</p>
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-app font-mono font-semibold tracking-wide">{bankInfo.numeroCuenta}</p>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); copyAccountNumber(1, bankInfo.numeroCuenta) }}
                                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        copiedAccount === 1
                                          ? 'bg-success/15 text-success'
                                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                                      }`}
                                    >
                                      {copiedAccount === 1
                                        ? <><Check size={12} /> ¡Copiado!</>
                                        : <><Copy size={12} /> Copiar</>
                                      }
                                    </button>
                                  </div>
                                  {bankInfo.tipoCuenta && (
                                    <p className="text-muted text-xs capitalize">{bankInfo.tipoCuenta}{bankInfo.titular ? ` · ${bankInfo.titular}` : ''}</p>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          )
                        })()}
                      </motion.div>
                    )
                  })}
                </div>

                {errors.metodoPago && (
                  <p className="text-sm text-error font-medium mt-2 text-center">{errors.metodoPago}</p>
                )}

                {/* ── SECCIÓN DE CUPONES DE DESCUENTO PREMIUM ── */}
                {couponsEnabled && (
                  <div className="mt-4 p-4 bg-surface rounded-2xl border border-app shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Tag size={16} className="text-primary" />
                        <span className="text-xs font-bold text-app uppercase tracking-wider">Cupón de Descuento</span>
                      </div>
                      {activeCoupons.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowCouponSelector(!showCouponSelector)}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          {showCouponSelector ? 'Ocultar disponibles' : `Ver disponibles (${activeCoupons.length})`}
                        </button>
                      )}
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎫</span>
                          <div>
                            <p className="text-xs font-black text-success uppercase leading-none">
                              {appliedCoupon.codigo} aplicado
                            </p>
                            <p className="text-[10px] text-success/80 font-semibold mt-1">
                              Ahorras {appliedCoupon.tipoDescuento === 'porcentaje' ? `${appliedCoupon.valorDescuento}%` : formatCurrency(appliedCoupon.valorDescuento)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAppliedCoupon(null)}
                          className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ingresa el código del cupón de descuento"
                          value={couponCodeInput}
                          onChange={e => setCouponCodeInput(e.target.value)}
                          className="flex-1 px-3 h-11 bg-surface-2 border border-app rounded-xl text-sm font-mono font-bold uppercase tracking-wider text-app focus:outline-none focus:border-primary transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          className="px-4 h-11 bg-primary text-white rounded-xl text-xs font-bold transition-all active:scale-95 hover:opacity-90 cursor-pointer"
                        >
                          Aplicar
                        </button>
                      </div>
                    )}

                    {couponError && (
                      <p className="text-xs font-semibold text-error mt-1 flex items-center gap-1">
                        ⚠️ {couponError}
                      </p>
                    )}

                    {/* Selector rápido de cupones elegibles */}
                    <AnimatePresence>
                      {showCouponSelector && !appliedCoupon && activeCoupons.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden space-y-3 pt-3 border-t border-app border-dashed"
                        >
                          <style>{`
                            @keyframes coupon-shine {
                              0%   { transform: translateX(-100%) skewX(-20deg); }
                              100% { transform: translateX(250%)  skewX(-20deg); }
                            }
                            .coupon-card-shine::after {
                              content: '';
                              position: absolute;
                              inset: 0;
                              background: linear-gradient(
                                90deg,
                                transparent 0%,
                                rgba(255,255,255,0.18) 45%,
                                rgba(255,255,255,0.32) 50%,
                                rgba(255,255,255,0.18) 55%,
                                transparent 100%
                              );
                              transform: translateX(-100%) skewX(-20deg);
                              animation: coupon-shine 3.5s ease-in-out infinite;
                              pointer-events: none;
                            }
                            .coupon-card-shine:hover::after {
                              animation-duration: 1.2s;
                            }
                          `}</style>
                          <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Elige un cupón elegible:</p>
                          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                            {activeCoupons.map((coupon, index) => {
                              const isPercent = coupon.tipoDescuento === 'porcentaje'
                              const displayDiscount = isPercent ? `${coupon.valorDescuento}%` : formatCurrency(coupon.valorDescuento)
                              
                              const gradients = [
                                'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6d28d9 100%)',
                                'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #0284c7 100%)',
                                'linear-gradient(135deg, #059669 0%, #34d399 50%, #047857 100%)',
                                'linear-gradient(135deg, #dc2626 0%, #f87171 50%, #b91c1c 100%)',
                              ]
                              const gradient = gradients[index % gradients.length]

                              return (
                                <div
                                  key={coupon.id}
                                  onClick={() => handleApplyCoupon(coupon.codigo)}
                                  className="coupon-card-shine relative flex items-stretch rounded-2xl overflow-hidden shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none"
                                  style={{ background: gradient }}
                                >
                                  {/* Capa de glassmorphism superior */}
                                  <div
                                    className="absolute inset-0 opacity-20 pointer-events-none"
                                    style={{
                                      background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 60%)',
                                    }}
                                  />

                                  {/* Columna izquierda: descuento */}
                                  <div className="relative flex flex-col items-center justify-center px-4 py-3 min-w-[76px] shrink-0 gap-0.5">
                                    <span
                                      className="font-black leading-none text-white text-base"
                                      style={{ textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                                    >
                                      {displayDiscount}
                                    </span>
                                    <span className="text-[8px] font-bold text-white/70 uppercase tracking-widest mt-0.5">
                                      {isPercent ? 'desc.' : 'ahorro'}
                                    </span>
                                  </div>

                                  {/* Separador vertical con muescas arriba y abajo */}
                                  <div className="relative flex flex-col items-center justify-center shrink-0">
                                    <div
                                      className="absolute -top-2 w-4 h-4 rounded-full"
                                      style={{ background: 'rgba(0,0,0,0.18)' }}
                                    />
                                    <div
                                      className="w-px h-full"
                                      style={{
                                        background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 5px, transparent 5px, transparent 10px)',
                                      }}
                                    />
                                    <div
                                      className="absolute -bottom-2 w-4 h-4 rounded-full"
                                      style={{ background: 'rgba(0,0,0,0.18)' }}
                                    />
                                  </div>

                                  {/* Columna derecha: info */}
                                  <div className="relative flex-1 flex flex-col justify-center px-3.5 py-3 gap-1.5 min-w-0">
                                    {/* Código + botón */}
                                    <div className="flex items-center justify-between gap-2">
                                      <span
                                        className="font-mono font-black text-white uppercase tracking-widest text-xs truncate"
                                        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                                      >
                                        {coupon.codigo}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleApplyCoupon(coupon.codigo); }}
                                        className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer bg-white/20 border border-white/30 text-white"
                                      >
                                        Aplicar
                                      </button>
                                    </div>

                                    {/* Detalles */}
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                      <span className="flex items-center gap-0.5 text-[9px] text-white/70 font-medium">
                                        <ShoppingBag size={9} className="shrink-0" />
                                        Mín. {formatCurrency(coupon.minimoCompra || 0)}
                                      </span>
                                      {coupon.fechaExpiracion && (
                                        <span className="flex items-center gap-0.5 text-[9px] text-white/70 font-medium">
                                          <Calendar size={9} className="shrink-0" />
                                          Vence {new Date(coupon.fechaExpiracion).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-app space-y-3">
                  <div className="flex justify-between items-center text-sm text-muted">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between items-center text-sm text-success">
                      <span>Descuento cupón:</span>
                      <span>- {formatCurrency(calculateDiscount())}</span>
                    </div>
                  )}
                  {getShippingCost() > 0 && (
                    <div className="flex justify-between items-center text-sm text-muted">
                      <span>Costo de envío:</span>
                      <span>+ {formatCurrency(getShippingCost())}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-app/60 mb-6">
                    <span className="text-app font-semibold">Total a pagar:</span>
                    <span className="text-2xl font-black text-primary">{formatCurrency(getFinalTotal())}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!formData.metodoPago) return
                      setStep(4)
                    }}
                    disabled={!formData.metodoPago}
                    className="w-full h-14 bg-action text-white rounded-2xl font-bold text-base transition-all duration-300 active:scale-95 hover:opacity-90 flex items-center justify-center disabled:opacity-50 shadow-lg shadow-action/30 gap-2"
                  >
                    Revisar Pedido <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══ PASO 4: RESUMEN DEL PEDIDO ═══════════════════════════════════ */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <p className="text-xs text-muted mb-2">Por favor revisa que todo esté correcto antes de confirmar tu pedido.</p>

                {/* 1. Lista de productos */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Productos seleccionados</p>
                  {items.map((item, idx) => (
                    <div key={`${item.productId}-${item.variantId || idx}`} className="flex items-center gap-3 p-2 rounded-xl bg-surface-2 border border-app">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.nombre} className="w-10 h-10 rounded-lg object-cover bg-surface" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-app text-xs text-muted">🛒</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-app truncate">{item.nombre}</p>
                        <div className="flex gap-1.5 flex-wrap mt-0.5">
                          {item.talla && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface border border-app">Talla: {item.talla}</span>}
                          {item.color && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface border border-app">Color: {item.color}</span>}
                          <span className="text-[9px] font-bold text-muted px-1.5 py-0.5">Cant: {item.cantidad}</span>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-app">{formatCurrency(item.precio * item.cantidad)}</p>
                    </div>
                  ))}
                </div>

                {/* 2. Datos de entrega / contacto */}
                <div className="p-3 bg-surface-2 border border-app rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <User size={12} className="text-primary" /> Datos de entrega y contacto
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted">Nombre:</span> <strong className="text-app">{formData.nombre}</strong>
                    </div>
                    <div>
                      <span className="text-muted">Celular:</span> <strong className="text-app">{formData.celular}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted">Método de Entrega:</span>{" "}
                      <strong className="text-app capitalize">
                        {formData.tipoEntrega === 'domicilio' 
                          ? 'Domicilio a tu puerta' 
                          : formData.tipoEntrega === 'retiro' 
                            ? 'Retiro en tienda' 
                            : 'Entrega digital / servicio'}
                      </strong>
                    </div>
                    {formData.tipoEntrega === 'domicilio' && (
                      <div className="sm:col-span-2">
                        <span className="text-muted">Dirección:</span>{" "}
                        <strong className="text-app">{formData.direccion}, {formData.barrio}, {formData.ciudad}</strong>
                      </div>
                    )}
                    {formData.notas && (
                      <div className="sm:col-span-2 italic text-muted mt-1 bg-surface p-2 rounded-lg border-l-2 border-primary">
                          {formData.notas}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Método de pago */}
                <div className="p-3 bg-surface-2 border border-app rounded-2xl flex items-center justify-between text-xs">
                  <span className="font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={12} className="text-primary" /> Método de pago
                  </span>
                  <strong className="text-app text-sm">
                    {formData.metodoPago === 'efectivo' && '💵 Efectivo'}
                    {formData.metodoPago === 'transferencia' && `🏦 Transferencia${selectedBank === 2 && bankInfo2?.activa ? ` (${bankInfo2.banco})` : ` (${bankInfo?.banco})`}`}
                    {formData.metodoPago === 'credito' && '💳 Crédito (Fiado)'}
                  </strong>
                </div>

                {/* 4. Totales */}
                <div className="pt-4 border-t border-app space-y-2">
                  <div className="flex justify-between items-center text-xs text-muted">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between items-center text-xs text-success">
                      <span>Descuento cupón ({appliedCoupon?.codigo}):</span>
                      <span>- {formatCurrency(calculateDiscount())}</span>
                    </div>
                  )}
                  {getShippingCost() > 0 && (
                    <div className="flex justify-between items-center text-xs text-muted">
                      <span>Costo de envío:</span>
                      <span>+ {formatCurrency(getShippingCost())}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-app/60">
                    <span className="text-app font-bold text-sm">Total a pagar:</span>
                    <span className="text-xl font-black text-primary">{formatCurrency(getFinalTotal())}</span>
                  </div>
                </div>

                {/* Botón final de compra */}
                <div className="pt-2">
                  <button
                    onClick={handleCheckout}
                    disabled={isPending}
                    className="w-full h-14 bg-action text-white rounded-2xl font-bold text-base transition-all duration-300 active:scale-95 hover:opacity-90 flex items-center justify-center disabled:opacity-50 shadow-lg shadow-action/30 gap-2"
                  >
                    {isPending ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check size={20} /> Confirmar y Comprar
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══ PASO 5: ÉXITO ════════════════════════════════════════════════ */}
            {step === 5 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 size={32} />
                </motion.div>

                <h2 className="text-xl font-bold text-app mb-1">¡Pedido Exitoso!</h2>
                <p className="text-sm text-muted mb-2">
                  Tu pedido <span className="font-mono font-bold text-app">#{orderNumber}</span> ha sido recibido.
                </p>

                {/* Resumen de entrega */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
                  style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}
                >
                  {orderSnapshot?.tipoEntrega === 'domicilio' && <><Truck size={12} /> Domicilio</>}
                  {orderSnapshot?.tipoEntrega === 'retiro' && <><Store size={12} /> Retiro en Tienda</>}
                  {orderSnapshot?.tipoEntrega === 'digital' && <><CheckCircle2 size={12} /> Digital / Servicio</>}
                </div>

                {/* Bloque de Seguimiento en Vivo para el Cliente */}
                {orderTrackingEnabled && orderSnapshot?.trackingToken && (
                  <div className="mb-5 p-4 rounded-xl bg-surface-2 border border-app text-left space-y-2">
                    <div>
                      <h4 className="text-xs font-bold text-app flex items-center gap-1.5">
                        📍 Seguimiento en vivo
                      </h4>
                      <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                        Guarda este enlace para consultar el progreso de tu pedido en cualquier momento.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/pedido/status?t=${orderSnapshot.trackingToken}`
                          copyLink(url)
                        }}
                        className="flex-1 h-9 rounded-lg border border-neutral-400 bg-white text-[11px] font-bold text-neutral-800 hover:bg-neutral-100 flex items-center justify-center gap-1 transition-all duration-200"
                      >
                        {copied ? (
                          <>
                            <Check size={12} className="text-success animate-bounce" />
                            ¡Copiado!
                          </>
                        ) : (
                          'Copiar Enlace'
                        )}
                      </button>
                      
                      <a
                        href={`/pedido/status?t=${orderSnapshot.trackingToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-9 rounded-lg text-white text-[11px] font-bold hover:opacity-90 flex items-center justify-center gap-1 transition-all duration-200"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        Ver Estado
                      </a>
                    </div>
                  </div>
                )}

                {/* Flujo de Pago en Línea Activo */}
                {orderSnapshot?.metodoPago === 'online' && !isPaidOnline && (
                  <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-left space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-app flex items-center gap-1.5 text-indigo-400">
                          🛡️ Pasarela de Pago Segura
                        </h4>
                        <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                          Completa el pago para autorizar el despacho automático de tu pedido.
                        </p>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                        {currentSettings?.onlinePayment?.processor?.toUpperCase() || 'BOLD'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPaymentGateway(true)}
                      className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 border-0 cursor-pointer transition-all active:scale-98"
                    >
                      Pagar en Línea Seguro ($ {orderSnapshot?.total?.toLocaleString()})
                    </button>
                  </div>
                )}

                {/* Simulador de Pasarela de Pago Overlay */}
                {showPaymentGateway && (
                  <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 text-left space-y-6 shadow-2xl" style={{ color: 'var(--color-text)' }}>
                      <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🔒</span>
                          <div>
                            <h4 className="font-bold text-sm text-[var(--color-text)]">Pasarela Simulada de Pago</h4>
                            <p className="text-[10px] text-[var(--color-text-muted)]">Transacción encriptada de forma segura</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                          {currentSettings?.onlinePayment?.processor?.toUpperCase() || 'BOLD / PSE'}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-border)] space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-[var(--color-text-muted)]">Comercio:</span>
                            <span className="font-bold text-[var(--color-text)]">{appName || 'Mi Tienda Ecosistema'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[var(--color-text-muted)]">Concepto:</span>
                            <span className="font-bold text-[var(--color-text)]">Pedido #{orderNumber}</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-[var(--color-border)] pt-2 mt-2">
                            <span className="font-bold text-[var(--color-text)]">Total a cobrar:</span>
                            <span className="font-mono font-black text-indigo-400">$ {orderSnapshot?.total?.toLocaleString()} COP</span>
                          </div>
                        </div>

                        {/* Selección simulada de tarjeta / PSE */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Número de Tarjeta de Prueba</label>
                          <input
                            type="text"
                            placeholder="4000 1234 5678 9010"
                            disabled
                            className="w-full h-10 px-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] focus:outline-none cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowPaymentGateway(false)}
                          className="flex-1 h-11 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text)] rounded-xl font-bold text-xs border border-[var(--color-border)] cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPaidOnline(true);
                            setShowPaymentGateway(false);
                          }}
                          className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs border-0 cursor-pointer shadow-lg shadow-emerald-600/10"
                        >
                          Simular Pago Exitoso
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {whatsappAdmin || SUPPORT_WHATSAPP ? (
                  <div className="flex gap-3 mt-4 w-full">
                    <style>{`
                      @keyframes whatsapp-glow {
                        0%   { box-shadow: 0 0 0 0 rgba(37,211,102,0.7); }
                        50%  { box-shadow: 0 0 0 10px rgba(37,211,102,0); }
                        100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); }
                      }
                      @keyframes whatsapp-bounce {
                        0%, 100% { transform: translateY(0); }
                        50%       { transform: translateY(-2px); }
                      }
                      .wa-btn {
                        animation: whatsapp-glow 2s infinite ease-in-out;
                        background: linear-gradient(to right, #25D366, #128C7E) !important;
                      }
                      .wa-btn:hover {
                        animation: none;
                        box-shadow: 0 4px 20px rgba(37,211,102,0.5);
                        transform: translateY(-1px);
                      }
                      .wa-icon {
                        animation: whatsapp-bounce 2s infinite ease-in-out;
                        flex-shrink: 0;
                      }
                    `}</style>
                    <button
                      onClick={handleWhatsApp}
                      disabled={orderSnapshot?.metodoPago === 'online' && !isPaidOnline}
                      className="wa-btn flex-1 h-11 px-4 text-white rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-green-500/30 border-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:animation-none"
                    >
                      <svg
                        className="wa-icon w-5 h-5"
                        viewBox="0 0 32 32"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                      >
                        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.47 2.025 7.773L0 32l8.437-2.004A15.94 15.94 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.773-1.856l-.486-.288-5.007 1.19 1.22-4.882-.317-.5A13.27 13.27 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.846c-.398-.2-2.358-1.163-2.723-1.296-.365-.133-.631-.2-.897.2-.266.4-1.031 1.296-1.264 1.563-.233.266-.465.3-.863.1-.398-.2-1.68-.619-3.2-1.975-1.183-1.055-1.982-2.358-2.215-2.756-.233-.4-.025-.616.175-.815.18-.178.398-.465.597-.697.2-.233.266-.4.4-.665.133-.266.066-.5-.033-.697-.1-.2-.897-2.162-1.23-2.96-.324-.777-.653-.672-.897-.684l-.764-.013c-.266 0-.697.1-1.063.5-.365.4-1.396 1.364-1.396 3.326s1.43 3.858 1.63 4.124c.2.266 2.815 4.298 6.82 6.027.953.411 1.697.656 2.277.84.957.304 1.827.261 2.515.158.767-.114 2.358-.964 2.69-1.896.333-.932.333-1.73.233-1.896-.1-.166-.366-.266-.764-.466z"/>
                      </svg>
                      {isPaidOnline ? 'Enviar Confirmación WhatsApp' : 'Avisar por WhatsApp'}
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 h-11 px-4 bg-surface-2 hover:bg-surface-3 text-app border border-app rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 whitespace-nowrap"
                    >
                      Cerrar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm transition-all active:scale-95"
                  >
                    Entendido
                  </button>
                )}
              </motion.div>
            )}
    </ModalTemplate>
  )
}
