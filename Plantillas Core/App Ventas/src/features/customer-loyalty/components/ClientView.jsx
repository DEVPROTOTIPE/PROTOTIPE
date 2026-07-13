import React, { useState, useEffect } from 'react';
import { useCustomerLoyalty } from '../hooks/useCustomerLoyalty';
import { QRCodeSVG } from 'qrcode.react';
import { Award, QrCode, RefreshCw, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function ClientView({ tenantId, customerId }) {
  const { account, transactions, loading, error, generateQRToken } = useCustomerLoyalty(tenantId, customerId);
  const [qrToken, setQrToken] = useState('');
  const [generatingQr, setGeneratingQr] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleRefreshQR = async () => {
    if (generatingQr) return;
    try {
      setGeneratingQr(true);
      const token = await generateQRToken();
      setQrToken(token);
      setTimeLeft(600); // 10 minutos
    } catch (err) {
      console.error('Error generando token QR:', err);
    } finally {
      setGeneratingQr(false);
    }
  };

  useEffect(() => {
    if (tenantId && customerId) {
      handleRefreshQR();
    }
  }, [tenantId, customerId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'PLATINUM': return 'from-indigo-600 to-purple-800 text-white';
      case 'GOLD': return 'from-amber-400 to-yellow-600 text-white';
      case 'SILVER': return 'from-slate-400 to-slate-600 text-white';
      default: return 'from-amber-700 to-amber-900 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        <span className="text-sm text-[var(--color-text-muted)]">Cargando tu cuenta de fidelización...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-6">
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Tarjeta de Fidelización Premium */}
      <div className={`relative p-6 rounded-3xl bg-gradient-to-br ${getLevelColor(account?.level)} shadow-xl overflow-hidden`}>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider opacity-75 font-semibold">Club de Puntos</span>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-lg font-bold">NIVEL {account?.level || 'BRONZE'}</span>
            </div>
          </div>
          <span className="text-xs font-mono opacity-80">ID: {customerId?.slice(0, 8)}</span>
        </div>

        <div className="mt-8 space-y-1">
          <span className="text-xs opacity-75">Puntos disponibles</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight">{account?.pointsBalance ?? 0}</span>
            <span className="text-sm font-semibold">pts</span>
          </div>
        </div>
      </div>

      {/* Tarjeta QR Seguro */}
      <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-sm flex flex-col items-center text-center space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[var(--color-text)]">Código de Identificación QR</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Muéstralo en caja para acumular o canjear puntos</p>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-inner relative flex items-center justify-center">
          {qrToken ? (
            <QRCodeSVG value={`LOYALTY:${qrToken}`} size={160} level="M" />
          ) : (
            <div className="w-[160px] h-[160px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">
              <QrCode className="w-12 h-12 text-slate-400" />
            </div>
          )}
          {timeLeft <= 0 && qrToken && (
            <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center gap-2 p-4">
              <span className="text-xs font-bold text-red-500">QR Expirado</span>
              <button 
                onClick={handleRefreshQR} 
                className="py-1.5 px-3 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Generar nuevo
              </button>
            </div>
          )}
        </div>

        {timeLeft > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <Clock className="w-3.5 h-3.5" />
            <span>Expira en:</span>
            <span className="font-mono font-bold text-[var(--color-text)]">{formatTime(timeLeft)}</span>
          </div>
        )}

        <button
          onClick={handleRefreshQR}
          disabled={generatingQr}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] active:scale-[0.98] disabled:opacity-50 text-sm font-semibold rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${generatingQr ? 'animate-spin' : ''}`} />
          <span>Actualizar Identificación</span>
        </button>
      </div>

      {/* Historial de Transacciones */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[var(--color-text)] px-1">Últimos movimientos</h3>
        {transactions.length === 0 ? (
          <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-center">
            <span className="text-xs text-[var(--color-text-muted)]">No tienes transacciones registradas</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
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
                  <div>
                    <span className="font-bold text-[var(--color-text)] block leading-tight">
                      {tx.type === 'EARN' ? 'Puntos acumulados' :
                       tx.type === 'REDEEM' ? 'Canje de puntos' : 'Ajuste manual'}
                    </span>
                    <span className="text-xxs text-[var(--color-text-muted)]">
                      {new Date(tx.createdAt).toLocaleDateString()}
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
  );
}
