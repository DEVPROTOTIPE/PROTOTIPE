import React from 'react';
import useAuthStore from '../../../store/authStore'; // Ajustar ruta de imports del core
import { useCustomerLoyalty } from '../hooks/useCustomerLoyalty';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClientView() {
  const { user } = useAuthStore();
  const tenantId = user?.tenantId || 'demo';
  const { data, loading, error } = useCustomerLoyalty(tenantId);
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Botón Volver */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Fidelización de Clientes
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Consulta y seguimiento de tus datos de Fidelización de Clientes en vivo.
        </p>
      </div>

      {loading && data.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm rounded-xl">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="p-8 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-sm text-[var(--color-text-muted)]">
          No tienes registros activos en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2.5 py-1 rounded">
                  {item.id.slice(0, 8)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-semibold text-base text-[var(--color-text)]">{item.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
