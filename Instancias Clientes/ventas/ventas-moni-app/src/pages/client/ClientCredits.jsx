import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, History, DollarSign, CheckCircle, ChevronDown, Wifi, FileText, X } from 'lucide-react'
import { useClientCredits, createCreditNotification } from '../../features/credits'
import useAuthStore from '../../store/authStore'
import useAppConfigStore from '../../store/appConfigStore'
import { formatCurrency } from '../../utils/formatters'
import { SUPPORT_WHATSAPP } from '../../constants'
import QRCode from 'qrcode'
import ModalTemplate from '../../components/common/ModalTemplate'
import HolographicTiltCard from '../../components/ui/HolographicTiltCard'
import CustomSelect from '../../components/ui/CustomSelect'

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 22
    }
  }
}

export default function ClientCredits() {
  const { user } = useAuthStore()
  const { appName, whatsappAdmin } = useAppConfigStore()
  const { data: credits = [], isLoading } = useClientCredits(user?.celular)

  const [qrDataUrl, setQrDataUrl] = useState('')
  const [showZoomedQr, setShowZoomedQr] = useState(false)

  useEffect(() => {
    if (user?.celular) {
      QRCode.toDataURL(user.celular, { 
        margin: 1, 
        width: 256,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('[ClientCredits] Error generando QR:', err))
    }
  }, [user?.celular])

  const [selectedCredit, setSelectedCredit] = useState(null)
  const [abonoMonto, setAbonoMonto] = useState('')
  const [abonoError, setAbonoError] = useState('')
  const [pagoMetodo, setPagoMetodo] = useState('whatsapp') // 'whatsapp' | 'online'
  const [showPaymentGateway, setShowPaymentGateway] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  // Balance local reactivo para abonos simulados exitosos
  const [localAbonosMap, setLocalAbonosMap] = useState({})

  // Rastrear IDs de créditos archivados en localStorage
  const storageKey = user ? `pwa-client-archived-credits-${user.celular}` : 'pwa-client-archived-credits-guest'
  const [archivedIds, setArchivedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [showArchived, setShowArchived] = useState(false)

  const handleArchiveToggle = (creditId) => {
    const nextArchived = archivedIds.includes(creditId)
      ? archivedIds.filter(id => id !== creditId)
      : [...archivedIds, creditId]
    setArchivedIds(nextArchived)
    localStorage.setItem(storageKey, JSON.stringify(nextArchived))
  }

  // Mapear créditos aplicando los abonos locales interactivos simulados
  const mappedCredits = credits.map(c => {
    const abonosLocales = localAbonosMap[c.id] || 0
    const nuevoSaldo = Math.max(0, c.saldoPendiente - abonosLocales)
    return {
      ...c,
      saldoPendiente: nuevoSaldo,
      estado: nuevoSaldo === 0 ? 'pagado' : c.estado
    }
  })

  // Separar activos, pagados y archivados
  const activos = mappedCredits.filter(c => c.estado === 'activo')
  const pagadosNoArchivados = mappedCredits.filter(c => c.estado === 'pagado' && !archivedIds.includes(c.id))
  
  const pagadosArchivados = mappedCredits
    .filter(c => c.estado === 'pagado' && archivedIds.includes(c.id))
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
      return dateB - dateA
    })
    .slice(0, 5)

  const pagadosAMostrar = showArchived ? pagadosArchivados : pagadosNoArchivados
  const totalDeuda = activos.reduce((sum, c) => sum + c.saldoPendiente, 0)

  const handleSendPagoTotalWhatsApp = async (credit) => {
    const cleanPhone = whatsappAdmin?.replace(/\D/g, '') || SUPPORT_WHATSAPP?.replace(/\D/g, '') || ''
    const mensaje = `Hola, deseo realizar el pago total de mi crédito correspondiente al pedido *#${credit.orderNumber}* por un valor de *${formatCurrency(credit.saldoPendiente)}*. Mi número de celular es ${user?.celular}.`
    
    try {
      await createCreditNotification({
        type: 'pago_total',
        clienteNombre: user?.nombre || 'Cliente',
        clienteCelular: user?.celular || '',
        monto: credit.saldoPendiente,
        orderNumber: credit.orderNumber
      })
    } catch (error) {
      console.error('[ClientCredits] Error al crear la notificación de pago total:', error)
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const handleOpenAbonar = (credit) => {
    setSelectedCredit(credit)
    setAbonoMonto('')
    setAbonoError('')
    setPagoMetodo('whatsapp')
  }

  const handleProcesarAbono = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const monto = Number(abonoMonto)
    
    if (!abonoMonto || isNaN(monto) || monto <= 0) {
      setAbonoError('Ingresa un monto válido mayor a 0')
      return
    }

    if (monto > selectedCredit.saldoPendiente) {
      setAbonoError('El monto no puede superar el saldo pendiente')
      return
    }

    if (pagoMetodo === 'online') {
      // Abrir pasarela simulada
      setShowPaymentGateway(true)
    } else {
      // Envío tradicional por WhatsApp
      handleSendAbonoWhatsApp(monto)
    }
  }

  const handleSendAbonoWhatsApp = async (monto) => {
    const cleanPhone = whatsappAdmin?.replace(/\D/g, '') || SUPPORT_WHATSAPP?.replace(/\D/g, '') || ''
    const mensaje = `Hola, deseo registrar un abono de *${formatCurrency(monto)}* a mi crédito activo correspondiente al pedido *#${selectedCredit.orderNumber}* (el cual tiene un saldo pendiente de ${formatCurrency(selectedCredit.saldoPendiente)}). Mi número de celular es ${user?.celular}.`
    
    try {
      await createCreditNotification({
        type: 'abono',
        clienteNombre: user?.nombre || 'Cliente',
        clienteCelular: user?.celular || '',
        monto: monto,
        orderNumber: selectedCredit.orderNumber
      })
    } catch (error) {
      console.error('[ClientCredits] Error al crear la notificación de abono:', error)
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`, '_blank')
    setSelectedCredit(null)
  }

  const handleConfirmarAbonoOnline = async () => {
    const monto = Number(abonoMonto)
    try {
      // Registrar notificación de abono en Firebase
      await createCreditNotification({
        type: 'abono_online',
        clienteNombre: user?.nombre || 'Cliente',
        clienteCelular: user?.celular || '',
        monto: monto,
        orderNumber: selectedCredit.orderNumber
      })

      // Actualizar estado local reactivo
      setLocalAbonosMap(prev => ({
        ...prev,
        [selectedCredit.id]: (prev[selectedCredit.id] || 0) + monto
      }))

      alert(`¡Abono en línea de ${formatCurrency(monto)} procesado con éxito por Bold/PSE!`);
    } catch (error) {
      console.error('[ClientCredits] Error al registrar abono online:', error)
    } finally {
      setShowPaymentGateway(false)
      setSelectedCredit(null)
    }
  }

  // Descarga de Extracto de cuenta PDF consolidado
  const handleDownloadExtractPDF = async () => {
    setLoadingPdf(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      // Colores de diseño premium
      const primaryColor = [79, 70, 229]
      const darkColor = [15, 23, 42]
      const textMuted = [100, 116, 139]

      // Cabecera superior
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, 210, 4, 'F')

      doc.setTextColor(...textMuted)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(`${appName?.toUpperCase() || 'MI TIENDA'} • PORTAL DE CLIENTES B2C`, 20, 15)

      doc.setTextColor(...darkColor)
      doc.setFontSize(18)
      doc.text('EXTRACTO FINANCIERO DE CRÉDITOS', 20, 24)

      doc.setTextColor(...textMuted)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Cliente: ${user?.nombre || 'Cliente'} | Celular: ${user?.celular || ''}`, 20, 29)
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 20, 34)

      // Divider
      doc.setDrawColor(226, 232, 240)
      doc.line(20, 38, 190, 38)

      // Balance
      doc.setTextColor(...darkColor)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('RESUMEN DE BALANCE:', 20, 46)

      doc.setFont('helvetica', 'normal')
      doc.text(`Total Créditos Activos: ${activos.length}`, 20, 52)
      doc.text(`Historial de Créditos Pagados: ${pagadosNoArchivados.length + pagadosArchivados.length}`, 20, 58)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      doc.text(`DEUDA TOTAL PENDIENTE: ${formatCurrency(totalDeuda)}`, 20, 66)

      // Tabla de créditos activos
      doc.setTextColor(...darkColor)
      doc.setFontSize(11)
      doc.text('CRÉDITOS ACTIVOS:', 20, 78)

      let yPos = 86
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Pedido', 20, yPos)
      doc.text('Valor Total', 50, yPos)
      doc.text('Saldo Pendiente', 90, yPos)
      doc.text('Estado', 140, yPos)

      doc.line(20, yPos + 2, 190, yPos + 2)
      yPos += 8

      doc.setFont('helvetica', 'normal')
      if (activos.length === 0) {
        doc.text('No posees créditos activos pendientes de pago.', 20, yPos)
      } else {
        activos.forEach(c => {
          doc.text(`#${c.orderNumber}`, 20, yPos)
          doc.text(`${formatCurrency(c.montoTotal)}`, 50, yPos)
          doc.setTextColor(...primaryColor)
          doc.text(`${formatCurrency(c.saldoPendiente)}`, 90, yPos)
          doc.setTextColor(...darkColor)
          doc.text('ACTIVO', 140, yPos)
          yPos += 6
        })
      }

      doc.save(`extracto_cuenta_${user?.celular || 'cliente'}.pdf`)
    } catch (error) {
      console.error('[ClientCredits] Error al compilar PDF:', error)
    } finally {
      setLoadingPdf(false)
    }
  }

  return (
    <div className="pb-6">
      <div className="pt-8 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-app leading-tight">Tus Créditos</h1>
              <p className="text-muted text-sm font-medium">Estado de cuenta</p>
            </div>
            
            <button
              onClick={handleDownloadExtractPDF}
              disabled={loadingPdf}
              className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/10 border-0 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <FileText size={14} />
              {loadingPdf ? 'Generando PDF...' : 'Descargar Extracto (PDF)'}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 bg-surface rounded-3xl p-6 md:p-8 border border-app shadow-lg">
            {/* Contenedor de la Tarjeta Holográfica */}
            <div className="w-full max-w-sm shrink-0">
              <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Tu Estado de Cuenta</p>
              
              <HolographicTiltCard 
                maxTilt={12} 
                scale={1.03}
                className="w-full aspect-[1.58/1] text-white flex flex-col justify-between select-none relative overflow-visible" FrontClass="w-full h-full p-6 text-white flex flex-col justify-between select-none relative overflow-hidden rounded-[24px]"
                style={{
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
                  borderRadius: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
                front={
                  <div 
                    className="w-full h-full p-6 text-white flex flex-col justify-between select-none relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 92%, #000000), color-mix(in srgb, var(--color-accent) 75%, #000000))'
                    }}
                  >
                    {/* Fila superior: Chip digital e íconos */}
                    <div className="flex items-center justify-between w-full z-10">
                      {/* Chip metálico simulado */}
                      <div className="w-9 h-7 rounded-md bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border border-yellow-200/50 shadow-inner relative flex flex-col gap-[2px] p-1.5 overflow-hidden">
                        <div className="w-full h-[1px] bg-black/10" />
                        <div className="w-full h-[1px] bg-black/10" />
                        <div className="w-full h-[1px] bg-black/10" />
                        <div className="absolute inset-0 flex justify-between pointer-events-none">
                          <div className="w-[1px] h-full bg-black/10 ml-2" />
                          <div className="w-[1px] h-full bg-black/10 mr-2" />
                        </div>
                      </div>
                      {/* Contactless & Label */}
                      <div className="flex items-center gap-2 text-white/60">
                        <Wifi size={16} className="rotate-90 text-white/50" />
                        <span className="font-mono text-[9px] tracking-widest uppercase font-bold text-white/40">CRÉDITO</span>
                      </div>
                    </div>

                    {/* Fila central: Saldo total pendiente */}
                    <div className="flex flex-col gap-0.5 z-10 my-2">
                      <span className="text-[10px] uppercase text-white/50 tracking-widest font-bold">Total Pendiente</span>
                      <span className="text-3xl md:text-4.5xl font-black font-mono tracking-tight text-white drop-shadow-md">
                        {formatCurrency(totalDeuda)}
                      </span>
                    </div>

                    {/* Fila inferior: Nombre y celular */}
                    <div className="flex justify-between items-end w-full z-10">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-white/40 tracking-wider">Cliente</span>
                        <span className="font-bold text-xs truncate max-w-[180px]">{user?.nombre || 'Nombre de Cliente'}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] uppercase text-white/40 tracking-wider">Celular</span>
                        <span className="font-mono text-xs">{user?.celular || '0000000000'}</span>
                      </div>
                    </div>
                  </div>
                }
                back={
                  <div 
                    className="w-full h-full text-white flex flex-col justify-between select-none relative overflow-hidden rounded-[24px] p-5"
                    style={{
                      background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 92%, #000000), color-mix(in srgb, var(--color-accent) 75%, #000000))'
                    }}
                  >
                    {/* Banda magnética superior */}
                    <div className="absolute top-3 left-0 w-full h-6 bg-slate-900/90 shadow-inner" />

                    {/* Contenido principal del reverso */}
                    <div className="mt-7 flex items-center justify-between gap-4 flex-1">
                      {/* Firma manuscrita */}
                      <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[7px] text-white/40 uppercase tracking-wider font-semibold">
                          Firma Autorizada
                        </span>
                        <div className="w-full h-7 bg-white/80 rounded border border-white/20 flex items-center pl-3 select-none">
                          <span className="font-serif italic text-slate-800 text-[10px] tracking-wide select-none">
                            {user?.nombre || 'Cliente Preferencial'}
                          </span>
                        </div>
                        <div className="text-[7px] text-white/50 leading-tight font-light font-mono mt-1">
                          {appName || 'Mi Tienda'} · WhatsApp: {whatsappAdmin || 'No disponible'}
                        </div>
                      </div>

                      {/* Caja del Código QR Escaneable */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar giro
                            setShowZoomedQr(true);
                          }}
                          className="bg-white p-1.5 rounded-lg border border-white/20 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center w-14 h-14"
                          title="Toca para ampliar QR"
                        >
                          {qrDataUrl ? (
                            <img src={qrDataUrl} alt="Código QR Cliente" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 animate-pulse rounded" />
                          )}
                        </button>
                        <span className="text-[6px] text-white/40 uppercase tracking-wider font-mono">
                          Tocar para ampliar
                        </span>
                      </div>
                    </div>

                    {/* Fila inferior: Branding & Leyendas */}
                    <div className="flex justify-between items-end border-t border-white/10 pt-2 mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[6px] text-white/30 uppercase leading-none">
                          Válido únicamente en tiendas del comercio emisor.
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <span className="font-mono text-[9px] tracking-wider uppercase font-bold text-white">
                          VIP MEMBER
                        </span>
                      </div>
                    </div>
                  </div>
                }
              />
            </div>

            {/* Ficha Resumen Informativa */}
            <div className="w-full space-y-4">
              <p className="text-sm font-semibold text-muted uppercase tracking-wider">Resumen Informativo</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-2 p-5 rounded-2xl border border-app flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {activos.length}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-app uppercase tracking-wide">Créditos Activos</h4>
                    <p className="text-sm text-muted mt-0.5 font-medium">Pedidos pendientes por pagar</p>
                  </div>
                </div>

                <div className="bg-surface-2 p-5 rounded-2xl border border-app flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-app uppercase tracking-wide">Créditos Pagados</h4>
                    <p className="text-sm text-muted mt-0.5 font-medium">Historial solventado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            {/* Lista de Créditos Activos */}
            <section>
              <h3 className="text-lg font-bold text-app mb-4 ml-2">Créditos Activos pendientes</h3>
              
              {isLoading ? (
                <div className="text-center py-8 text-xs text-muted">
                  Cargando créditos...
                </div>
              ) : (
                <motion.div 
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="grid gap-6"
                >
                  {activos.length > 0 ? (
                    activos.map(credit => (
                      <motion.div variants={itemVariants} key={credit.id}>
                        <CreditCardItem 
                          key={credit.id} 
                          credit={credit} 
                          onAbonar={handleOpenAbonar} 
                          onPagoTotal={handleSendPagoTotalWhatsApp}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-surface rounded-3xl border border-app border-dashed flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">🎉</span>
                      <p className="text-sm font-bold text-app">¡Felicitaciones!</p>
                      <p className="text-xs text-muted">No posees ningún saldo de crédito pendiente de pago.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </section>

            {/* Créditos Pagados */}
            {(pagadosNoArchivados.length > 0 || pagadosArchivados.length > 0) && (
              <section>
                <div className="flex items-center justify-between mb-4 ml-2 mr-2">
                  <h3 className="text-lg font-bold text-app">
                    {showArchived ? 'Historial Archivada' : 'Historial Pagado'}
                  </h3>
                  
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-surface-2 border border-app text-muted hover:text-app transition-colors active:scale-95"
                  >
                    {showArchived 
                      ? `Ver Pagados (${pagadosNoArchivados.length})` 
                      : `Ver Archivados (${pagadosArchivados.length})`
                    }
                  </button>
                </div>

                <motion.div 
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="grid gap-4 opacity-90"
                >
                  {pagadosAMostrar.length > 0 ? (
                    pagadosAMostrar.map(credit => (
                      <motion.div variants={itemVariants} key={credit.id}>
                        <CreditCardItem 
                          key={credit.id} 
                          credit={credit} 
                          isPaid 
                          isArchived={archivedIds.includes(credit.id)}
                          onArchive={handleArchiveToggle}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-muted bg-surface rounded-3xl border border-app border-dashed">
                      No hay créditos en esta lista.
                    </div>
                  )}
                </motion.div>
              </section>
            )}

          </div>
        </div>
      </div>

      {/* MODAL PARA AGREGAR ABONO CLIENTE */}
      <ModalTemplate
        isOpen={!!selectedCredit}
        onClose={() => setSelectedCredit(null)}
        title="Registrar Abono"
        subtitle={selectedCredit ? `Ingresa el monto que deseas abonar para el pedido #${selectedCredit.orderNumber}.` : ''}
        icon={DollarSign}
        footerActions={
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => setSelectedCredit(null)}
              className="flex-1 h-12 bg-surface-2 text-app border border-app rounded-xl font-bold transition-all active:scale-95 cursor-pointer hover:bg-app/10"
            >
              Cancelar
            </button>
            <button
              onClick={handleProcesarAbono}
              disabled={!abonoMonto}
              className="flex-1 h-12 bg-primary text-white rounded-xl font-bold shadow-md hover:opacity-90 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              Abonar
            </button>
          </div>
        }
      >
        {selectedCredit && (
          <div className="space-y-4 pt-2">
            <div className="bg-warning-soft border border-warning-soft rounded-2xl p-4 flex justify-between items-center">
              <span className="text-xs font-bold text-warning uppercase tracking-wider">Saldo Pendiente:</span>
              <span className="text-xl font-black text-warning">
                {formatCurrency(selectedCredit.saldoPendiente)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Monto a abonar *</label>
              <input
                type="number"
                inputmode="decimal"
                value={abonoMonto}
                onChange={(e) => {
                  setAbonoMonto(e.target.value)
                  setAbonoError('')
                }}
                className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-primary-soft text-app focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Ingresa el valor numérico"
                autoFocus
              />
              {abonoError && <p className="text-xs text-red-500 font-semibold mt-1">{abonoError}</p>}
            </div>

            {/* Selector de pasarela en modal abono */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider">Método de Abono</label>
              <CustomSelect
                value={pagoMetodo}
                onChange={(val) => setPagoMetodo(val)}
                options={[
                  { value: 'whatsapp', label: 'Reportar por WhatsApp (Efectivo/Transferencia)' },
                  { value: 'online', label: 'Pagar con Tarjeta / PSE en Línea Seguro' }
                ]}
              />
            </div>
          </div>
        )}
      </ModalTemplate>

      {/* Simulador de Pasarela de Pago para Abonos */}
      {showPaymentGateway && selectedCredit && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 text-left space-y-6 shadow-2xl" style={{ color: 'var(--color-text)' }}>
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text)]">Pasarela de Abonos Segura</h4>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Transacción encriptada</p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">BOLD / PSE</span>
            </div>

            <div className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-border)] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Comercio:</span>
                <span className="font-bold text-[var(--color-text)]">{appName || 'Mi Tienda Ecosistema'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Abono a pedido:</span>
                <span className="font-bold text-[var(--color-text)]">#{selectedCredit.orderNumber}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-[var(--color-border)] pt-2 mt-2">
                <span className="font-bold text-[var(--color-text)]">Total a abonar:</span>
                <span className="font-mono font-black text-indigo-400">$ {Number(abonoMonto).toLocaleString()} COP</span>
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
                onClick={handleConfirmarAbonoOnline}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs border-0 cursor-pointer shadow-lg shadow-emerald-600/10"
              >
                Simular Pago Exitoso
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Zoom Código QR de Identificación del Cliente */}
      <AnimatePresence>
        {showZoomedQr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowZoomedQr(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 max-w-[280px] w-full text-center relative border border-[var(--color-border)] cursor-default"
            >
              {/* Botón de cierre */}
              <button
                onClick={() => setShowZoomedQr(false)}
                className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors w-7 h-7 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="font-display font-bold text-[var(--color-text)] text-sm tracking-tight mt-2">
                Identificación de Cliente
              </h3>
              <p className="text-[10px] text-[var(--color-text-muted)] max-w-[200px] leading-normal -mt-2">
                Presenta este código al vendedor para cargar tu cuenta o autorizar créditos.
              </p>

              {/* QR Grande */}
              <div className="w-44 h-44 bg-white p-2 rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner">
                {qrDataUrl && (
                  <img 
                    src={qrDataUrl} 
                    alt="Código QR Ampliado" 
                    className="w-full h-full object-contain" 
                  />
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="font-mono font-bold text-xs text-[var(--color-text)] tracking-wider">
                  {user?.nombre || 'Cliente'}
                </span>
                <span className="font-mono text-[10px] text-[var(--color-text-muted)] font-bold">
                  Celular: {user?.celular || ''}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CreditCardItem({ credit, isPaid, onAbonar, onPagoTotal, onArchive, isArchived }) {
  const [showPayments, setShowPayments] = useState(false)

  return (
    <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-app shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-app text-lg">#{credit.orderNumber}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              isPaid ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
            }`}>
              {isPaid ? 'PAGADO' : 'ACTIVO'}
            </span>
          </div>
          
          {/* Barra de progreso de pago estilo Fintech */}
          {(() => {
            const totalPagado = credit.montoTotal - credit.saldoPendiente;
            const porcentaje = credit.montoTotal > 0 ? Math.min(100, Math.max(0, (totalPagado / credit.montoTotal) * 100)) : 100;
            
            return (
              <div className="mt-3 max-w-md">
                {/* Riel de la barra */}
                <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden border border-app relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentaje}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                {/* Info textual de progreso */}
                <div className="flex justify-between items-center mt-1.5 text-[10px] font-bold text-muted uppercase tracking-wider">
                  <span>Abonado: {formatCurrency(totalPagado)}</span>
                  <span>{porcentaje.toFixed(0)}% cubierto</span>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="flex gap-2.5 shrink-0 self-end sm:self-center">
          {isPaid ? (
            <button
              onClick={() => onArchive(credit.id)}
              className="px-4 h-11 bg-surface-2 hover:bg-surface-3 text-app border border-app rounded-2xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isArchived ? 'Desarchivar' : 'Archivar'}
            </button>
          ) : (
            <>
              <button
                onClick={() => onAbonar(credit)}
                className="px-4.5 h-11 bg-surface-2 hover:bg-surface-3 text-app border border-app rounded-2xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Abonar
              </button>
              <button
                onClick={() => onPagoTotal(credit)}
                className="px-4.5 h-11 bg-primary text-white rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-md hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Pago Total
              </button>
            </>
          )}
        </div>
      </div>

      {credit.pagos && credit.pagos.length > 0 && (
        <div className="border-t border-app pt-4 mt-4">
          <button
            onClick={() => setShowPayments(!showPayments)}
            className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-app transition-colors"
          >
            <History size={14} />
            {showPayments ? 'Ocultar Historial de Abonos' : `Ver Historial de Abonos (${credit.pagos.length})`}
            <ChevronDown size={14} className={`transition-transform duration-300 ${showPayments ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showPayments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="space-y-2 pl-2">
                  {credit.pagos.map((pago, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-app/50 last:border-0">
                      <div>
                        <p className="font-bold text-app">
                          Abono #{idx + 1} {pago.metodoPago === 'online' && '🔒 (En línea)'}
                        </p>
                        <p className="text-[10px] text-muted">
                          {pago.createdAt?.toDate ? pago.createdAt.toDate().toLocaleDateString() : new Date(pago.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-mono font-black text-success">
                        + {formatCurrency(pago.monto)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
