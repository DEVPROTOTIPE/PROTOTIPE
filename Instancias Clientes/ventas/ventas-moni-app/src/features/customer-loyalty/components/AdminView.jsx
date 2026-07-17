import React, { useState } from 'react';
import { useCustomerLoyalty } from '../hooks/useCustomerLoyalty';
import { Award, Search, ArrowUpRight, ArrowDownLeft, Plus, Minus, Settings, CheckCircle } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

export default function AdminView(props) {
  const { user, role } = useAuthStore();
  const isAdmin = role === 'admin';

  if (!isAdmin || !user) return null;

  return <AdminViewContent {...props} user={user} />;
}

function AdminViewContent({ tenantId: propTenantId, user }) {
  const tenantId = propTenantId || user?.tenantId || 'demo';
  const [searchCustomerId, setSearchCustomerId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const { 
    account, 
    transactions, 
    loading, 
    error, 
    earnPoints, 
    redeemPoints 
  } = useCustomerLoyalty(tenantId, selectedCustomerId);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchCustomerId.trim()) return;
    // Si viene en formato LOYALTY:tokenId, se podría extraer o simplemente usar el customerId directo
    let targetId = searchCustomerId.trim();
    if (targetId.startsWith('LOYALTY:')) {
      // Para simulación o pruebas con el token opaco
      targetId = targetId.split(':')[1];
    }
    setSelectedCustomerId(targetId);
    setStatusMessage(null);
  };

  const handleEarn = async (e) => {
    e.preventDefault();
    if (!saleAmount || parseFloat(saleAmount) <= 0) return;
    try {
      // 1 punto por cada $100 de compra
      const pts = Math.floor(parseFloat(saleAmount) * 0.01);
      if (pts <= 0) {
        setStatusMessage({ type: 'error', text: 'El valor de la compra no acumula puntos mínimos ($100)' });
        return;
      }
      await earnPoints(pts, `admin_sale_${Date.now()}`);
      setStatusMessage({ type: 'success', text: `Acumulados ${pts} puntos con éxito` });
      setSaleAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    const pts = parseInt(pointsToRedeem);
    if (!pts || pts <= 0) return;
    try {
      await redeemPoints(pts, `admin_redeem_${Date.now()}`);
      setStatusMessage({ type: 'success', text: `Canjeados ${pts} puntos con éxito` });
      setPointsToRedeem('');
    } catch (err) {
      // Capturado por el hook useCustomerLoyalty y expuesto en `error`
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>Fidelización de Clientes (Loyalty)</span>
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">Configura reglas, acumula y canjea puntos de clientes</p>
        </div>
      </div>

      {/* Buscador de Cliente */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-[var(--color-text-muted)]" />
          <input 
            type="text"
            value={searchCustomerId}
            onChange={(e) => setSearchCustomerId(e.target.value)}
            placeholder="Buscar ID de Cliente o escanear QR..."
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] rounded-xl text-sm outline-none"
          />
        </div>
        <button 
          type="submit"
          className="py-2.5 px-4 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-xl"
        >
          Buscar
        </button>
      </form>

      {statusMessage && (
        <div className={`p-4 border rounded-2xl text-sm flex items-center gap-2 ${
          statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm">
          {error === 'LOYALTY_INSUFFICIENT_POINTS' ? 'El cliente no cuenta con puntos suficientes para realizar este canje.' : error}
        </div>
      )}

      {selectedCustomerId && !loading && account && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen e Historial */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold text-[var(--color-text-muted)]">Estado de Cuenta</span>
                <span className="text-xxs px-2.5 py-1 bg-amber-500/10 text-amber-500 font-bold rounded-full">
                  NIVEL {account.level}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-[var(--color-text)]">Puntos acumulados</span>
                <span className="text-3xl font-black text-[var(--color-text)]">{account.pointsBalance} pts</span>
              </div>
            </div>

            {/* Historial de transacciones */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[var(--color-text)] px-1">Historial del Cliente</h3>
              {transactions.length === 0 ? (
                <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-center">
                  <span className="text-xs text-[var(--color-text-muted)]">Sin transacciones registradas</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {transactions.map((tx) => (
                    <div 
                      key={tx.transactionId} 
                      className="flex items-center justify-between p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          tx.type === 'EARN' ? 'bg-emerald-500/10 text-emerald-500' :
                          tx.type === 'REDEEM' ? 'bg-rose-500/10 text-rose-500' :
                          'bg-sky-500/10 text-sky-500'
                        }`}>
                          {tx.type === 'EARN' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-[var(--color-text)] block leading-tight truncate">
                            {tx.type === 'EARN' ? 'Acumulación por Venta' :
                             tx.type === 'REDEEM' ? 'Canje de Recompensa' : 'Ajuste de Saldo'}
                          </span>
                          <span className="text-xxs text-[var(--color-text-muted)] block truncate">
                            {new Date(tx.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className={`font-mono font-black ${
                        tx.points > 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Acciones de Operación */}
          <div className="space-y-6">
            {/* Acumular puntos */}
            <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Acumular Puntos</span>
              </h3>
              <form onSubmit={handleEarn} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-[var(--color-text-muted)]">Monto de Venta ($)</label>
                  <input 
                    type="number"
                    inputmode="decimal"
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(e.target.value)}
                    placeholder="Monto total compra..."
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl"
                >
                  Acumular
                </button>
              </form>
            </div>

            {/* Canjear puntos */}
            <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                <Minus className="w-4 h-4 text-rose-500" />
                <span>Canjear Puntos</span>
              </h3>
              <form onSubmit={handleRedeem} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-[var(--color-text-muted)]">Puntos a deducir</label>
                  <input 
                    type="number"
                    inputmode="numeric"
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(e.target.value)}
                    placeholder="Mínimo 500 pts..."
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 bg-rose-500 text-white text-xs font-bold rounded-xl"
                >
                  Canjear
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedCustomerId && !loading && !account && (
        <div className="p-12 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl">
          <span className="text-sm text-[var(--color-text-muted)]">No se encontró una cuenta activa para este ID.</span>
        </div>
      )}
    </div>
  );
}
