import React, { useState } from 'react';
import useAuthStore from '../../../store/authStore'; // Ajustar ruta de imports del core
import { use{{pascalName}} } from '../hooks/use{{pascalName}}';
import { Plus, Loader2 } from 'lucide-react';

export default function AdminView() {
  const { user } = useAuthStore();
  const tenantId = user?.tenantId || 'demo';
  const { data, loading, error, addRecord } = use{{pascalName}}(tenantId);
  const [form, setForm] = useState({ name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await addRecord({ name: form.name });
      setForm({ name: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)]">
          {{displayName}} (Admin)
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Administración y configuración del módulo en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="md:col-span-1 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-semibold mb-4 text-[var(--color-text)]">Nuevo Registro</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name-input" className="block text-sm font-medium text-[var(--color-text)]">
                Nombre
              </label>
              <input
                id="name-input"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ name: e.target.value })}
                placeholder="Ej. Registro base"
                className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[var(--color-primary)] !text-white font-medium text-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Listado */}
        <div className="md:col-span-2 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Registros Existentes</h2>
          
          {loading && data.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-sm text-[var(--color-text-muted)]">
              No hay registros creados todavía.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                    <th className="py-2 font-medium">ID</th>
                    <th className="py-2 font-medium">Nombre</th>
                    <th className="py-2 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {data.map((item) => (
                    <tr key={item.id} className="text-[var(--color-text)]">
                      <td className="py-3 font-mono text-xs">{item.id}</td>
                      <td className="py-3">{item.name}</td>
                      <td className="py-3 text-[var(--color-text-muted)] text-xs">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
