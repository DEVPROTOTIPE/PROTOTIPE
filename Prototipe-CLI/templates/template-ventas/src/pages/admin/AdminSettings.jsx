import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Settings, Database, Trash2, CheckCircle, AlertTriangle, Save, Paintbrush, 
  Smartphone, Building2, Sun, Moon, Link, X, LogOut, Filter, Plus, Lock, Mail, 
  KeyRound, Eye, EyeOff, ChevronRight, ArrowLeft, ChevronDown, Download, Megaphone, 
  CalendarDays, Type, Receipt, TrendingUp, ShoppingBag, Wallet, BarChart3, Tag, Heart, 
  Package, CreditCard, Sparkles, User, Truck, Percent, Calendar, Shield, ToggleLeft, 
  QrCode, Printer, Users, Copy, CheckCircle2, Loader2, LayoutGrid, MessageSquare 
} from 'lucide-react'
import { COLLECTIONS, ORDER_STATES, PAYMENT_METHODS, DEV_PIN, PORTAL_CONFIG } from '../../constants'
import { updateAppConfig, updateCatalogFilters } from '../../services/appConfigService'
import useAppConfigStore from '../../store/appConfigStore'
import useAuthStore from '../../store/authStore'
import BackButton from '../../components/ui/BackButton'
import { signOut } from 'firebase/auth'
import { auth } from '../../config/firebaseConfig'

import { ADVANCED_PALETTES, getActiveColors } from '../../constants/palettes'
import { FONTS, FONT_CATEGORIES, FONTS_BY_CATEGORY } from '../../constants/fonts'
import usePWAInstall from '../../hooks/usePWAInstall'
import { useAds, useCreateAd, useUpdateAd, useDeleteAd } from '../../hooks/useAds'
import { useProducts } from '../../hooks/useInventory'
import { useOrders } from '../../hooks/useOrders'
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '../../hooks/useCoupons'
import { formatCurrency } from '../../utils/formatters'
import { useAlertConfirm } from '../../components/common/AlertConfirmContext'

// --- SECCIONES MODULARES ---
import BrandSettings from './settings/sections/BrandSettings'
import EmployeeSettings from './settings/sections/EmployeeSettings'
import StoreSettings from './settings/sections/StoreSettings'
import PaymentSettings from './settings/sections/PaymentSettings'
import SecuritySettings from './settings/sections/SecuritySettings'
import DeveloperSettings from './settings/sections/DeveloperSettings'
import AdSettings from './settings/sections/AdSettings'
import CouponSettings from './settings/sections/CouponSettings'

// ─── CUSTOM DATE PICKER COMPONENT ────────────────────────────────────────
const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function CustomDatePicker({ value, onChange, placeholder="Elige una fecha del calendario" }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  const today = new Date()
  const selected = value ? new Date(value + 'T12:00:00') : null

  const [viewYear, setViewYear] = useState(selected ? selected.getFullYear() : today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected ? selected.getMonth() : today.getMonth())

  const display = selected
    ? `${String(selected.getDate()).padStart(2,'0')}/${String(selected.getMonth()+1).padStart(2,'0')}/${selected.getFullYear()}`
    : ''

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectDay = (d) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    onChange({ target: { value: `${viewYear}-\$\{mm\}-\$\{dd\}` } })
    setOpen(false)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isSelected = (d) => selected &&
    selected.getDate() === d && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear
  const isToday = (d) =>
    today.getDate() === d && today.getMonth() === viewMonth && today.getFullYear() === viewYear

  const calendar = (
    open && (
      <>
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 9998,
          }}
        />
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              width: 'min(320px, calc(100vw - 32px))',
              background: 'var(--color-surface)',
              borderRadius: '1.25rem',
              border: '1px solid var(--color-border)',
              boxShadow: '0 24px 80px -10px rgba(0,0,0,0.35)',
              padding: '1.25rem',
            }}
          >
            <div className="text-center mb-1">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Seleccionar fecha</p>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted transition-all active:scale-90 bg-transparent border-none cursor-pointer"
                style={{ background: 'var(--color-surface-2)' }}
              >
                <ChevronDown size={18} className="rotate-90" />
              </button>
              <span className="text-base font-bold text-app">
                {MONTHS_ES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted transition-all active:scale-90 bg-transparent border-none cursor-pointer"
                style={{ background: 'var(--color-surface-2)' }}
              >
                <ChevronDown size={18} className="-rotate-90" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {DAYS_ES.map(d => (
                <div key={d} className="text-center text-[11px] font-bold text-muted py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((d, i) => (
                <div key={i} className="flex items-center justify-center">
                  {d ? (
                    <button
                      type="button"
                      onClick={() => selectDay(d)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all active:scale-90 border-none cursor-pointer
                        ${isSelected(d)
                          ? 'text-white shadow-md'
                          : isToday(d)
                          ? 'font-bold ring-2'
                          : 'text-app hover:opacity-80'
                        }
                      `}
                      style={
                        isSelected(d)
                          ? { background: 'var(--color-primary)' }
                          : isToday(d)
                          ? { ringColor: 'var(--color-primary)', color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }
                          : { background: 'transparent' }
                      }
                    >
                      {d}
                    </button>
                  ) : <div />}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-app">
              <button
                type="button"
                onClick={() => { onChange({ target: { value: '' } }); setOpen(false) }}
                className="text-xs text-muted font-medium px-3 py-1.5 rounded-lg transition-colors active:scale-95 border-none cursor-pointer"
                style={{ background: 'var(--color-surface-2)' }}
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = new Date()
                  const mm = String(t.getMonth()+1).padStart(2,'0')
                  const dd = String(t.getDate()).padStart(2,'0')
                  onChange({ target: { value: `${t.getFullYear()}-${mm}-${dd}` } })
                  setOpen(false)
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all active:scale-95 border-none cursor-pointer"
                style={{ background: 'var(--color-primary)' }}
              >
                Hoy
              </button>
            </div>
          </div>
        </div>
      </>
    )
  )

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full h-11 pl-4 pr-10 rounded-xl bg-surface border border-app text-sm font-medium flex items-center transition-colors cursor-pointer relative"
        style={{
          color: display ? 'var(--color-text)' : 'var(--color-text-muted)',
          borderColor: open ? 'var(--color-primary)' : undefined
        }}
      >
        {display || <span style={{ color: 'var(--color-text-muted)' }}>{placeholder}</span>}
        <span className={`absolute right-3 transition-colors ${open ? 'text-primary' : 'text-muted'}`}>
          <CalendarDays size={16} />
        </span>
      </button>
      {open && ReactDOM.createPortal(calendar, document.body)}
    </div>
  )
}

// ─── CUSTOM SELECT COMPONENT ──────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="relative w-full" style={{ zIndex: open ? 50 : 'auto' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full h-11 pl-4 pr-10 rounded-xl bg-surface border border-app text-sm text-app focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer flex items-center justify-between"
        style={{ borderColor: open ? 'var(--color-primary)' : undefined }}
      >
        <span className={selected ? 'text-app' : 'text-muted'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`absolute right-3 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0" style={{ zIndex: 48 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mt-1 rounded-xl border border-app overflow-hidden shadow-xl"
              style={{ zIndex: 49, background: 'var(--color-surface)' }}
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 border-none cursor-pointer
                    ${opt.value === value
                      ? 'bg-primary text-white font-bold'
                      : 'text-app hover:bg-surface-2 bg-transparent'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

const mergeCommercialOptimization = (firestoreConfig) => {
  return {
    enabled: true,
    tools: {
      smartTags: {
        enabled: firestoreConfig?.tools?.smartTags?.enabled ?? true,
        bestSeller: {
          enabled: firestoreConfig?.tools?.smartTags?.bestSeller?.enabled ?? true,
          text: firestoreConfig?.tools?.smartTags?.bestSeller?.text || 'Más Vendido',
          bg: firestoreConfig?.tools?.smartTags?.bestSeller?.bg || '#ef4444',
          textCol: firestoreConfig?.tools?.smartTags?.bestSeller?.textCol || '#ffffff',
          style: firestoreConfig?.tools?.smartTags?.bestSeller?.style || 'pill',
          minSales: firestoreConfig?.tools?.smartTags?.bestSeller?.minSales ?? 5
        },
        unmissableOffer: {
          enabled: firestoreConfig?.tools?.smartTags?.unmissableOffer?.enabled ?? true,
          text: firestoreConfig?.tools?.smartTags?.unmissableOffer?.text || 'Oferta Imperdible',
          bg: firestoreConfig?.tools?.smartTags?.unmissableOffer?.bg || '#f59e0b',
          textCol: firestoreConfig?.tools?.smartTags?.unmissableOffer?.textCol || '#ffffff',
          style: firestoreConfig?.tools?.smartTags?.unmissableOffer?.style || 'pill'
        },
        lastUnit: {
          enabled: firestoreConfig?.tools?.smartTags?.lastUnit?.enabled ?? true,
          text: firestoreConfig?.tools?.smartTags?.lastUnit?.text || 'Última Unidad',
          bg: firestoreConfig?.tools?.smartTags?.lastUnit?.bg || '#3b82f6',
          textCol: firestoreConfig?.tools?.smartTags?.lastUnit?.textCol || '#ffffff',
          style: firestoreConfig?.tools?.smartTags?.lastUnit?.style || 'pill',
          threshold: firestoreConfig?.tools?.smartTags?.lastUnit?.threshold ?? 3
        },
        newProduct: {
          enabled: firestoreConfig?.tools?.newProduct?.enabled ?? true,
          text: firestoreConfig?.tools?.newProduct?.text || 'Nuevo',
          bg: firestoreConfig?.tools?.newProduct?.bg || '#10b981',
          textCol: firestoreConfig?.tools?.newProduct?.textCol || '#ffffff',
          style: firestoreConfig?.tools?.newProduct?.style || 'pill',
          daysLimit: firestoreConfig?.tools?.newProduct?.daysLimit ?? 7
        }
      },
      advancedGallery: {
        enabled: firestoreConfig?.tools?.advancedGallery?.enabled ?? true
      },
      visualVariations: {
        enabled: firestoreConfig?.tools?.visualVariations?.enabled ?? true
      },
      variationIndicators: {
        enabled: firestoreConfig?.tools?.variationIndicators?.enabled ?? true
      },
      cartRecommendations: {
        enabled: firestoreConfig?.tools?.cartRecommendations?.enabled ?? true,
        title: firestoreConfig?.tools?.cartRecommendations?.title || 'Recomendado para ti'
      },
      historyRecommendations: {
        enabled: firestoreConfig?.tools?.historyRecommendations?.enabled ?? true
      }
    }
  }
}

export default function AdminSettings() {
  const config = useAppConfigStore()
  const { couponsEnabled = true } = config
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { logout, user } = useAuthStore()
  const { rawInstallable, handleInstall } = usePWAInstall()
  const { showAlert } = useAlertConfirm()

  const [activeSection, setActiveSection] = useState(null)
  const [activeSubSection, setActiveSubSection] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)

  // Auto-limpiar el mensaje de guardado después de 2 segundos
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  // Modales de Confirmación Crítica
  const [criticalConfirmModal, setCriticalConfirmModal] = useState(null)
  const [criticalConfirmText, setCriticalConfirmText] = useState('')

  // Publicidad y Anuncios
  const { data: ads = [], isLoading: isLoadingAds } = useAds()
  const { data: products = [] } = useProducts()
  const createMutation = useCreateAd()
  const updateMutation = useUpdateAd()
  const deleteMutation = useDeleteAd()

  const [showAdForm, setShowAdForm] = useState(false)
  const [editingAdId, setEditingAdId] = useState(null)
  const [adToDelete, setAdToDelete] = useState(null)
  const [adFormData, setAdFormData] = useState({
    type: 'inventory',
    active: true,
    productId: '',
    discountType: 'percentage',
    discountValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    customTitle: '',
    customBanner: '',
    glowEffect: false,
    title: '',
    description: '',
    image: '',
    banner: '',
    colors: { bg: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', text: '#ffffff' },
    ctaText: 'Ver promoción',
    ctaAction: 'modal',
    ctaValue: '',
    category: '',
    isTemporalProduct: false,
    price: 0,
    promoPrice: 0,
  })

  // Cupones
  const { data: coupons = [], isLoading: isLoadingCoupons } = useCoupons()
  const createCouponMutation = useCreateCoupon()
  const updateCouponMutation = useUpdateCoupon()
  const deleteCouponMutation = useDeleteCoupon()

  const [showCouponForm, setShowCouponForm] = useState(false)
  const [editingCouponId, setEditingCouponId] = useState(null)
  const [couponToDelete, setCouponToDelete] = useState(null)
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minPurchase: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    active: true
  })

  const { data: orders = [] } = useOrders()

  const couponUsageMap = useMemo(() => {
    const map = {}
    orders.forEach(order => {
      if (order.couponCode) {
        const code = order.couponCode.toUpperCase()
        map[code] = (map[code] || 0) + 1
      }
    })
    return map
  }, [orders])

  const [formData, setFormData] = useState(() => {
    const state = useAppConfigStore.getState()
    return {
      appName: state.appName || '',
      sellerName: state.sellerName || '',
      appIcon: state.appIcon || '',
      pwaAppName: state.pwaAppName || '',
      pwaAppIcon: state.pwaAppIcon || '',
      pwaUseBrandIcon: state.pwaUseBrandIcon || false,
      theme: state.theme || 'zafiro-moderno',
      activeSeasonalEvent: state.activeSeasonalEvent || 'none',
      whatsappAdmin: state.whatsappAdmin || '',
      bankInfo: {
        banco: state.bankInfo?.banco || '',
        tipoCuenta: state.bankInfo?.tipoCuenta || 'ahorros',
        numeroCuenta: state.bankInfo?.numeroCuenta || '',
        titular: state.bankInfo?.titular || '',
        cedulaNit: state.bankInfo?.cedulaNit || '',
        qrUrl: state.bankInfo?.qrUrl || ''
      },
      bankInfo2: {
        activa: state.bankInfo2?.activa || false,
        banco: state.bankInfo2?.banco || '',
        tipoCuenta: state.bankInfo2?.tipoCuenta || 'ahorros',
        numeroCuenta: state.bankInfo2?.numeroCuenta || '',
        titular: state.bankInfo2?.titular || '',
        cedulaNit: state.bankInfo2?.cedulaNit || '',
        qrUrl: state.bankInfo2?.qrUrl || ''
      },
      catalogFilters: state.catalogFilters || {
        categories: true,
        sizes: true,
        colors: true,
        customAttributes: []
      },
      appFont: state.appFont || 'inter',
      appRadius: state.appRadius || 'rounded',
      catalogBanner: state.catalogBanner || { type: 'none', value: '' },
      catalogLayout: state.catalogLayout || 'grid2',
      animationsEnabled: state.animationsEnabled ?? true,
      guidedModeEnabled: state.guidedModeEnabled ?? true,
      actionColor: state.actionColor || '',
      welcomeWavesEnabled: state.welcomeWavesEnabled ?? true,
      loginTrustMessage: state.loginTrustMessage || '',
      slogan: state.slogan || '',
      hasMultipleEmployees: state.hasMultipleEmployees ?? false,
      employeeCount: state.employeeCount ?? 0,
      employees: state.employees ?? [],
      deliverySettings: state.deliverySettings || {
        pickup: { enabled: true, address: '', instructions: 'Recoge tu pedido directamente en nuestro local.' },
        shipping: { enabled: true, cost: 0, estimatedTime: '30 a 60 min', instructions: 'Recibe tu pedido en la comodidad de tu casa.' },
        digital: { enabled: false, instructions: 'Entrega digital o prestación de servicio presencial.' }
      },
      wholesaleSettings: state.wholesaleSettings || {
        enabled: true,
        minQuantity: 12,
        discountType: 'percentage',
        discountValue: 15
      },
      catalogMode: state.catalogMode || 'standard',
      claimsEnabled: state.claimsEnabled ?? false,
      orderTrackingEnabled: state.orderTrackingEnabled ?? false,
      developerPhone: state.developerPhone || '',
      creditsEnabled: state.creditsEnabled ?? true,
      couponsEnabled: state.couponsEnabled ?? true,
      trackingWaTemplate: state.trackingWaTemplate || '',
      appPromo: state.appPromo || {
        enabled: false,
        title: '',
        message: '',
        androidUrl: '',
        iosUrl: '',
        promoImageUrl: ''
      },
      tablesEnabled: state.tablesEnabled ?? false,
      commercialOptimization: mergeCommercialOptimization(state.commercialOptimization),
      dianSettings: state.dianSettings || {
        enabled: false,
        razonSocial: '',
        nit: '',
        digitoVerificacion: '',
        emailFiscal: '',
        ivaPorDefecto: 19
      }
    }
  })

  const [isFormInitialized, setIsFormInitialized] = useState(false)
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)

  useEffect(() => {
    if (config.isLoaded && !isFormInitialized) {
      setFormData({
        appName: config.appName || '',
        sellerName: config.sellerName || '',
        appIcon: config.appIcon || '',
        pwaAppName: config.pwaAppName || '',
        pwaAppIcon: config.pwaAppIcon || '',
        pwaUseBrandIcon: config.pwaUseBrandIcon || false,
        theme: config.theme || 'zafiro-moderno',
        activeSeasonalEvent: config.activeSeasonalEvent || 'none',
        whatsappAdmin: config.whatsappAdmin || '',
        bankInfo: {
          banco: config.bankInfo?.banco || '',
          tipoCuenta: config.bankInfo?.tipoCuenta || 'ahorros',
          numeroCuenta: config.bankInfo?.numeroCuenta || '',
          titular: config.bankInfo?.titular || '',
          cedulaNit: config.bankInfo?.cedulaNit || '',
          qrUrl: config.bankInfo?.qrUrl || ''
        },
        bankInfo2: {
          activa: config.bankInfo2?.activa || false,
          banco: config.bankInfo2?.banco || '',
          tipoCuenta: config.bankInfo2?.tipoCuenta || 'ahorros',
          numeroCuenta: config.bankInfo2?.numeroCuenta || '',
          titular: config.bankInfo2?.titular || '',
          cedulaNit: config.bankInfo2?.cedulaNit || '',
          qrUrl: config.bankInfo2?.qrUrl || ''
        },
        catalogFilters: config.catalogFilters || {
          categories: true,
          sizes: true,
          colors: true,
          customAttributes: []
        },
        appFont: config.appFont || 'inter',
        appRadius: config.appRadius || 'rounded',
        catalogBanner: config.catalogBanner || { type: 'none', value: '' },
        catalogLayout: config.catalogLayout || 'grid2',
        animationsEnabled: config.animationsEnabled ?? true,
        guidedModeEnabled: config.guidedModeEnabled ?? true,
        actionColor: config.actionColor || '',
        welcomeWavesEnabled: config.welcomeWavesEnabled ?? true,
        loginTrustMessage: config.loginTrustMessage || '',
        slogan: config.slogan || '',
        hasMultipleEmployees: config.hasMultipleEmployees ?? false,
        employeeCount: config.employeeCount ?? 0,
        employees: config.employees ?? [],
        deliverySettings: config.deliverySettings || {
          pickup: { enabled: true, address: '', instructions: 'Recoge tu pedido directamente en nuestro local.' },
          shipping: { enabled: true, cost: 0, estimatedTime: '30 a 60 min', instructions: 'Recibe tu pedido en la comodidad de tu casa.' },
          digital: { enabled: false, instructions: 'Entrega digital o prestación de servicio presencial.' }
        },
        wholesaleSettings: config.wholesaleSettings || {
          enabled: true,
          minQuantity: 12,
          discountType: 'percentage',
          discountValue: 15
        },
        catalogMode: config.catalogMode || 'standard',
        claimsEnabled: config.claimsEnabled ?? false,
        orderTrackingEnabled: config.orderTrackingEnabled ?? false,
        developerPhone: config.developerPhone || '',
        creditsEnabled: config.creditsEnabled ?? true,
        couponsEnabled: config.couponsEnabled ?? true,
        trackingWaTemplate: config.trackingWaTemplate || '',
        appPromo: config.appPromo || {
          enabled: false,
          title: '',
          message: '',
          androidUrl: '',
          iosUrl: '',
          promoImageUrl: ''
        },
        tablesEnabled: config.tablesEnabled ?? false,
        commercialOptimization: mergeCommercialOptimization(config.commercialOptimization),
        dianSettings: config.dianSettings || {
          enabled: false,
          razonSocial: '',
          nit: '',
          digitoVerificacion: '',
          emailFiscal: '',
          ivaPorDefecto: 19
        }
      })
      setIsFormInitialized(true)
    }
  }, [config.isLoaded, isFormInitialized, config])

  // Efecto para preview en tiempo real de la paleta
  useEffect(() => {
    if (!formData.theme) return

    const root = document.documentElement
    const activeColors = getActiveColors(formData.theme, config.isDarkMode, formData.activeSeasonalEvent)
    
    Object.entries(activeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    return () => {
      const originalColors = getActiveColors(config.theme, config.isDarkMode, config.activeSeasonalEvent)
      Object.entries(originalColors).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
    }
  }, [formData.theme, formData.activeSeasonalEvent, config.isDarkMode, config.theme, config.activeSeasonalEvent])

  const handleSaveAd = () => {
    if (adFormData.type === 'inventory' && !adFormData.productId) {
      showAlert({ title: 'Producto requerido', message: 'Por favor selecciona un producto', variant: 'warning' })
      return
    }
    if (adFormData.type === 'custom' && !adFormData.title) {
      showAlert({ title: 'Título requerido', message: 'Por favor ingresa un título', variant: 'warning' })
      return
    }

    if (adFormData.active) {
      const activeCount = ads.filter(a => a.active && a.id !== editingAdId).length
      if (activeCount >= 5) {
        showAlert({ title: 'Límite alcanzado', message: 'Solo puedes tener un máximo de 5 publicidades activas de forma simultánea. Desactiva otra publicidad para poder activar esta.', variant: 'warning' })
        return
      }
    }

    const payload = {
      type: adFormData.type,
      active: adFormData.active,
      startDate: adFormData.startDate,
      endDate: adFormData.endDate,
    }

    if (adFormData.type === 'inventory') {
      payload.productId = adFormData.productId
      payload.discountType = adFormData.discountType
      payload.discountValue = Number(adFormData.discountValue)
      payload.customTitle = adFormData.customTitle || ''
      payload.customBanner = adFormData.customBanner || ''
      payload.glowEffect = adFormData.glowEffect || false
    } else {
      payload.title = adFormData.title
      payload.description = adFormData.description || ''
      payload.image = adFormData.image || ''
      payload.banner = adFormData.banner || ''
      payload.colors = adFormData.colors || { bg: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', text: '#ffffff' }
      payload.ctaText = adFormData.ctaText || 'Ver promoción'
      payload.ctaAction = adFormData.ctaAction || 'modal'
      payload.ctaValue = adFormData.ctaValue || ''
      payload.category = adFormData.category || ''
      payload.isTemporalProduct = adFormData.isTemporalProduct || false
      if (adFormData.isTemporalProduct) {
        payload.price = Number(adFormData.price) || 0
        payload.promoPrice = Number(adFormData.promoPrice) || 0
      }
    }

    if (editingAdId) {
      updateMutation.mutate({ id: editingAdId, data: payload }, {
        onSuccess: () => {
          setShowAdForm(false)
          setEditingAdId(null)
        }
      })
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setShowAdForm(false)
        }
      })
    }
  }

  const handleSaveCoupon = () => {
    if (!couponFormData.code) {
      showAlert({ title: 'Código requerido', message: 'Ingresa el código del cupón', variant: 'warning' })
      return
    }
    if (!couponFormData.value || Number(couponFormData.value) <= 0) {
      showAlert({ title: 'Descuento inválido', message: 'Ingresa un valor de descuento válido mayor a 0', variant: 'warning' })
      return
    }

    const payload = {
      code: couponFormData.code.toUpperCase().trim(),
      type: couponFormData.type,
      value: Number(couponFormData.value),
      minPurchase: Number(couponFormData.minPurchase || 0),
      startDate: couponFormData.startDate,
      endDate: couponFormData.endDate,
      active: couponFormData.active
    }

    if (editingCouponId) {
      updateCouponMutation.mutate({ id: editingCouponId, data: payload }, {
        onSuccess: () => {
          setShowCouponForm(false)
          setEditingCouponId(null)
        }
      })
    } else {
      createCouponMutation.mutate(payload, {
        onSuccess: () => {
          setShowCouponForm(false)
        }
      })
    }
  }

  const toggleCustomMode = () => {
    if (typeof formData.theme === 'object') {
      setFormData({ ...formData, theme: 'zafiro-moderno' })
    } else {
      const basePalette = ADVANCED_PALETTES[formData.theme] || ADVANCED_PALETTES['zafiro-moderno']
      setFormData({
        ...formData,
        theme: {
          light: { ...basePalette.light },
          dark: { ...basePalette.dark }
        }
      })
    }
  }

  const handleCustomColorChange = (key, value) => {
    const mode = config.isDarkMode ? 'dark' : 'light'
    setFormData({
      ...formData,
      theme: {
        ...formData.theme,
        [mode]: { ...formData.theme[mode], [key]: value }
      }
    })
  }

  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      await updateAppConfig(formData)
      config.setConfig(formData)
      setIsFormInitialized(false)
      setSaveMessage({ type: 'success', text: 'Configuraciones guardadas y aplicadas a toda la aplicación.' })
      setTimeout(() => setSaveMessage(null), 4000)
    } catch (error) {
      console.error(error)
      setSaveMessage({ type: 'error', text: 'Ocurrió un error al guardar las configuraciones.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      logout()
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  useEffect(() => {
    const handleReset = () => {
      setActiveSection(null)
      setActiveSubSection(null)
    }
    window.addEventListener('reset-settings-menu', handleReset)
    return () => {
      window.removeEventListener('reset-settings-menu', handleReset)
    }
  }, [])

  const MENU_SECTIONS = [
    {
      id: 'cupones',
      label: 'Cupones de Descuento',
      description: 'Genera códigos promocionales y ofertas',
      icon: Tag,
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
    },
    {
      id: 'publicidad',
      label: 'Publicidad y Promociones',
      description: 'Gestiona banners y promociones híbridas',
      icon: Megaphone,
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-500',
    },
    {
      id: 'marca',
      label: 'Identidad de Marca',
      description: 'Nombre de la tienda y logo',
      icon: Building2,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      id: 'personalizar',
      label: 'Personalizar Tienda',
      description: 'Configura el personal de ventas y opciones de la tienda',
      icon: Sparkles,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
    {
      id: 'ventas',
      label: 'Cuentas de Pago',
      description: 'Datos bancarios para transferencias',
      icon: CreditCard,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      id: 'seguridad',
      label: 'Seguridad',
      description: 'Actualiza tus credenciales de acceso',
      icon: Shield,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
    },
    {
      id: 'developer',
      label: 'Zona de Desarrollador',
      description: 'Opciones internas y facturación de la instancia',
      icon: Database,
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-500',
    }
  ]

  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  const isStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches

  const renderMobilePreview = () => {
    const currentThemeColors = getActiveColors(formData.theme, config.isDarkMode)
    const primaryColor = currentThemeColors['--color-primary']
    const fontName = FONTS[formData.appFont]?.name || 'Inter'

    return (
      <div 
        className="flex flex-col items-center justify-start lg:col-span-5 sticky top-6 bg-surface-2 p-6 rounded-3xl border border-app h-[580px] w-full mt-6 lg:mt-0"
        style={{ fontFamily: `'${fontName}', sans-serif` }}
      >
        <div className="w-full max-w-[280px] bg-surface rounded-[2.5rem] border-[8px] border-app overflow-hidden shadow-2xl relative flex flex-col h-[500px]">
          {/* Cámara Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-app rounded-full z-50 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full"/>
            <span className="w-8 h-1 bg-zinc-800 rounded-full"/>
          </div>
          
          {/* Header Interno */}
          <div className="pt-8 pb-3 px-4 flex items-center justify-between border-b border-app bg-surface-2 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center overflow-hidden border border-app">
                {formData.appIcon ? (
                  <img src={formData.appIcon} alt="Preview Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs">🏪</span>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black text-app truncate max-w-[100px]">{formData.appName || 'Mi Tienda'}</p>
                <p className="text-[8px] text-muted truncate max-w-[100px]">{formData.slogan || 'Eslogan'}</p>
              </div>
            </div>
            <button className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center text-xs text-muted border border-app">
              🛒
            </button>
          </div>

          {/* Catálogo Interno */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-surface-2/45">
            {/* Banner de Bienvenida */}
            <div className="p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl relative overflow-hidden shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor}, var(--color-secondary))` }}>
              <h4 className="text-[10px] font-black leading-none">¡Hola {user?.displayName || 'Cliente'}!</h4>
              <p className="text-[8px] text-white/80 mt-1 leading-normal">Bienvenido a nuestra tienda virtual oficial.</p>
            </div>

            {/* Selector de Categorías */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
              {['Todos', 'Camisetas', 'Pantalones', 'Gorras'].map((cat, i) => (
                <span 
                  key={cat} 
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border whitespace-nowrap ${
                    i === 0 ? 'bg-primary border-primary text-white' : 'bg-surface border-app text-muted'
                  }`}
                  style={i === 0 ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Listado de Productos */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Camiseta Básica', price: '$45,000', tag: 'Más Vendido' },
                { name: 'Gorra Vintage', price: '$35,000', tag: 'Nuevo' }
              ].map((p, idx) => (
                <div key={idx} className="bg-surface rounded-xl border border-app overflow-hidden flex flex-col p-1.5 relative shadow-xs">
                  {/* Smart Tag Preview */}
                  {formData.commercialOptimization.tools.smartTags.enabled && (
                    <span 
                      className="absolute top-1.5 left-1.5 text-[6px] font-black px-1.5 py-0.5 rounded-full z-10 text-white"
                      style={{ 
                        backgroundColor: p.tag === 'Nuevo' 
                          ? formData.commercialOptimization.tools.smartTags.newProduct.bg 
                          : formData.commercialOptimization.tools.smartTags.bestSeller.bg
                      }}
                    >
                      {p.tag === 'Nuevo' ? formData.commercialOptimization.tools.smartTags.newProduct.text : formData.commercialOptimization.tools.smartTags.bestSeller.text}
                    </span>
                  )}
                  
                  <div className="h-16 w-full bg-surface-2 rounded-lg mb-1.5 flex items-center justify-center text-lg">
                    👕
                  </div>
                  <p className="text-[9px] font-bold text-app truncate leading-none">{p.name}</p>
                  <p className="text-[8px] text-muted mt-0.5 leading-none">{p.price}</p>
                  
                  <button 
                    className="w-full mt-2 h-6 text-[8px] font-bold text-white rounded-lg flex items-center justify-center transition-all border-none cursor-pointer"
                    style={{ backgroundColor: formData.actionColor || primaryColor }}
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-4">Vista previa en tiempo real</p>
      </div>
    )
  }

  return (
    <div className="admin-page-container min-h-screen pb-16 bg-surface text-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-left">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton fallback="/admin" />
            <div>
              <h1 className="text-xl font-black text-app">Ajustes</h1>
              <p className="text-xs text-muted mt-0.5">Control global de la aplicación</p>
            </div>
          </div>
        </div>

        {/* Administrador Profile Card */}
        {activeSection === null && (
          <div className="bg-primary/8 border border-primary/15 border-l-4 border-l-primary rounded-3xl p-6 mb-8 shadow-sm shadow-primary/5 relative overflow-hidden text-left">
            {/* Ambient glow decoration dynamically matching primary color */}
            <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-surface border border-primary/15 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {config.appIcon ? (
                    <img src={config.appIcon} alt={config.appName} className="w-full h-full object-cover" />
                  ) : (
                    <Shield size={24} className="text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-app leading-tight tracking-tight">
                    {config.sellerName || user?.displayName || 'Administrador'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/15 text-primary">
                      {config.appName || 'Mi Negocio'}
                    </span>
                    <span className="text-[10px] text-muted font-medium truncate">
                      {user?.email || ''}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto h-10 px-4 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 border border-red-500/20"
              >
                <LogOut size={14} /> Cerrar Sesión
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
              exit={{ opacity: 0, y: -15, scale: 0.95, x: '-50%' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`fixed top-6 left-1/2 z-[9999] p-4 rounded-2xl border flex items-center gap-3 shadow-xl backdrop-blur-md max-w-[90%] w-max min-w-[280px] ${
                saveMessage.type === 'error'
                  ? 'bg-red-500/95 border-red-500 text-white'
                  : 'bg-emerald-500/95 border-emerald-500 text-white'
              }`}
            >
              {saveMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
              <span className="text-xs font-bold leading-none">{saveMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MENU PRINCIPAL */}
        {activeSection === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MENU_SECTIONS.map((sec) => {
              if (sec.id === 'cupones' && !couponsEnabled) return null
              const Icon = sec.icon
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id)
                    setActiveSubSection(null)
                  }}
                  className="w-full flex items-center gap-4 p-5 bg-surface-2 rounded-2xl hover:bg-surface-3 transition-all text-left group cursor-pointer border border-app hover:border-primary/20 bg-transparent"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${sec.iconBg}`}>
                    <Icon size={22} className={sec.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-app group-hover:text-primary transition-colors">{sec.label}</p>
                    <p className="text-xs text-muted mt-1 leading-normal">{sec.description}</p>
                  </div>
                  <ChevronRight size={18} className="text-muted shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </button>
              )
            })}
          </div>
        )}

        {/* CONTENEDOR DE SECCIÓN ACTIVA */}
        {activeSection !== null && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-surface-2 p-4 rounded-2xl border border-app">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (activeSubSection !== null) {
                      setActiveSubSection(null)
                    } else {
                      setActiveSection(null)
                    }
                  }}
                  className="w-8 h-8 rounded-xl bg-surface border border-app hover:border-app-hover flex items-center justify-center text-muted hover:text-app transition-colors shadow-xs cursor-pointer"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h2 className="text-sm font-black text-app uppercase tracking-wider">
                    {MENU_SECTIONS.find(s => s.id === activeSection)?.label}
                  </h2>
                </div>
              </div>
            </div>

            {/* SECCIÓN: MARCA */}
            {activeSection === 'marca' && (
              <BrandSettings 
                formData={formData} 
                setFormData={setFormData} 
                config={config} 
                setSaveMessage={setSaveMessage} 
              />
            )}

            {/* SECCIÓN: PERSONALIZAR */}
            {activeSection === 'personalizar' && (
              activeSubSection === null ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'empleados', label: 'Gestión de Empleados', desc: 'Control de accesos y perfiles de nómina', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { id: 'temporada', label: 'Eventos de Temporada', desc: 'Aplica paletas de colores navideñas y de Halloween', icon: Calendar, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                    { id: 'seguimiento', label: 'Seguimiento por WhatsApp', desc: 'Personaliza notificaciones automáticas y PWA', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { id: 'movimientos', label: 'Auditoría de Ajustes de Stock', desc: 'Registro de modificaciones de inventario por empleado', icon: Database, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
                  ].map(sub => {
                    const SubIcon = sub.icon
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveSubSection(sub.id)}
                        className="w-full flex items-center gap-4 p-5 bg-surface-2 rounded-2xl hover:bg-surface-3 transition-all text-left group cursor-pointer border border-app hover:border-primary/20 bg-transparent"
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${sub.bg}`}>
                          <SubIcon size={20} className={sub.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-app group-hover:text-primary transition-colors">{sub.label}</p>
                          <p className="text-[10px] text-muted mt-0.5">{sub.desc}</p>
                        </div>
                        <ChevronRight size={16} className="text-muted shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSubSection(null)}
                      className="px-3.5 py-1.5 rounded-xl border border-app hover:bg-surface-2 text-xs font-semibold text-muted flex items-center gap-1 cursor-pointer bg-surface"
                    >
                      <ArrowLeft size={12} /> Menú Personalización
                    </button>
                  </div>
                  
                  {activeSubSection === 'empleados' ? (
                    <EmployeeSettings 
                      formData={formData} 
                      setFormData={setFormData} 
                      setSaveMessage={setSaveMessage} 
                      user={user} 
                      config={config} 
                    />
                  ) : (
                    <StoreSettings 
                      formData={formData} 
                      setFormData={setFormData} 
                      config={config} 
                      setSaveMessage={setSaveMessage} 
                      activeSubSection={activeSubSection} 
                      setActiveSubSection={setActiveSubSection} 
                    />
                  )}
                </div>
              )
            )}



            {/* SECCIÓN: PUBLICIDAD */}
            {activeSection === 'publicidad' && (
              <AdSettings 
                ads={ads}
                isLoadingAds={isLoadingAds}
                products={products}
                showAdForm={showAdForm}
                setShowAdForm={setShowAdForm}
                editingAdId={editingAdId}
                setEditingAdId={setEditingAdId}
                adFormData={adFormData}
                setAdFormData={setAdFormData}
                adToDelete={adToDelete}
                setAdToDelete={setAdToDelete}
                updateMutation={updateMutation}
                deleteMutation={deleteMutation}
                handleSaveAd={handleSaveAd}
                showAlert={showAlert}
              />
            )}

            {/* SECCIÓN: CUPONES */}
            {activeSection === 'cupones' && couponsEnabled && (
              <CouponSettings 
                couponsEnabled={couponsEnabled}
                isLoadingCoupons={isLoadingCoupons}
                coupons={coupons}
                couponUsageMap={couponUsageMap}
                showCouponForm={showCouponForm}
                setShowCouponForm={setShowCouponForm}
                editingCouponId={editingCouponId}
                setEditingCouponId={setEditingCouponId}
                couponFormData={couponFormData}
                setCouponFormData={setCouponFormData}
                couponToDelete={couponToDelete}
                setCouponToDelete={setCouponToDelete}
                updateCouponMutation={updateCouponMutation}
                deleteCouponMutation={deleteCouponMutation}
                handleSaveCoupon={handleSaveCoupon}
                showAlert={showAlert}
                formatCurrency={formatCurrency}
              />
            )}

            {/* SECCIÓN: CUENTAS DE PAGO */}
            {activeSection === 'ventas' && (
              <PaymentSettings 
                formData={formData} 
                setFormData={setFormData} 
                config={config} 
                setSaveMessage={setSaveMessage} 
                isSaving={isSaving} 
                setIsSaving={setIsSaving} 
                setCriticalConfirmText={setCriticalConfirmText} 
                setCriticalConfirmModal={setCriticalConfirmModal} 
              />
            )}

            {/* SECCIÓN: SEGURIDAD */}
            {activeSection === 'seguridad' && (
              <SecuritySettings 
                setSaveMessage={setSaveMessage} 
              />
            )}

            {activeSection === 'developer' && (
              <DeveloperSettings 
                formData={formData} 
                setFormData={setFormData} 
                config={config} 
                setSaveMessage={setSaveMessage} 
                isSaving={isSaving} 
                setIsSaving={setIsSaving} 
                activeSubSection={activeSubSection} 
                setActiveSubSection={setActiveSubSection}
                setIsThemeModalOpen={setIsThemeModalOpen}
                handleSaveThemeConfig={handleSaveConfig}
              />
            )}

          </div>
        )}
      </div>

      {/* MODAL GLOBAL DE CONFIRMACIÓN CRÍTICA */}
      <AnimatePresence>
        {criticalConfirmModal && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCriticalConfirmModal(null)}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-3xl p-6 shadow-2xl relative max-w-sm w-full mx-4 space-y-4 border border-app text-left"
            >
              <h3 className="text-sm font-black text-app">{criticalConfirmModal.title}</h3>
              <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">{criticalConfirmModal.desc}</p>
              
              <input
                type="text"
                placeholder="Escribe CONFIRMAR para proceder con la eliminación"
                value={criticalConfirmText}
                onChange={(e) => setCriticalConfirmText(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-surface-2 border border-app text-app focus:outline-none focus:border-amber-500 font-bold uppercase tracking-wider text-sm bg-transparent"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCriticalConfirmModal(null)}
                  className="flex-1 h-11 rounded-xl font-bold text-xs bg-surface-2 hover:bg-surface-3 text-app active:scale-95 transition-all cursor-pointer border-none"
                >
                  Cancelar
                </button>
                <button
                  disabled={criticalConfirmText !== 'CONFIRMAR' || isSaving}
                  onClick={() => {
                    criticalConfirmModal.onConfirm()
                    setCriticalConfirmModal(null)
                  }}
                  className="flex-1 h-11 rounded-xl font-bold text-xs bg-amber-500 hover:bg-emerald-600 text-white active:scale-95 transition-all cursor-pointer disabled:opacity-50 border-none"
                >
                  Confirmar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
