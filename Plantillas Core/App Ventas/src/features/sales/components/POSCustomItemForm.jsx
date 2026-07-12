import { useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import CurrencyInput from '../../../components/ui/CurrencyInput'
import NumberInput from '../../../components/ui/NumberInput'

/**
 * Formulario independiente para registrar y agregar un producto personalizado/libre al carrito.
 */
export default function POSCustomItemForm({
  onAddItem,
  setStockAlert
}) {
  const [customItem, setCustomItem] = useState({
    nombre: '',
    precio: '',
    cantidad: '1',
    descripcion: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const precio = parseFloat(customItem.precio)
    const cantidad = parseInt(customItem.cantidad)

    if (!customItem.nombre.trim() || isNaN(precio) || precio <= 0 || isNaN(cantidad) || cantidad <= 0) {
      if (setStockAlert) {
        setStockAlert({ message: 'Completa nombre, precio y cantidad válidos.' })
      }
      return
    }

    const newItem = {
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
    }

    onAddItem(newItem)
    setCustomItem({ nombre: '', precio: '', cantidad: '1', descripcion: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-3xl p-5 border border-app shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-app">
        <FileText size={16} className="text-emerald-500" />
        <p className="text-sm font-bold text-app">Agregar producto personalizado</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Nombre del producto</label>
          <input
            type="text"
            value={customItem.nombre}
            onChange={e => setCustomItem(p => ({ ...p, nombre: e.target.value }))}
            placeholder="Ingresa el nombre del producto personalizado"
            className="w-full h-11 px-4 rounded-2xl bg-surface-2 border border-app text-sm text-app focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Detalles / Descripción (opcional)</label>
          <input
            type="text"
            value={customItem.descripcion}
            onChange={e => setCustomItem(p => ({ ...p, descripcion: e.target.value }))}
            placeholder="Ingresa las especificaciones del producto personalizado"
            className="w-full h-11 px-4 rounded-2xl bg-surface-2 border border-app text-sm text-app focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Precio unitario</label>
            <CurrencyInput
              value={customItem.precio}
              onChange={(val) => setCustomItem(p => ({ ...p, precio: val }))}
              placeholder="Ingresa el valor numérico"
              className="w-full h-11 px-4 rounded-2xl bg-surface-2 border border-app text-sm text-app focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Cantidad</label>
            <NumberInput
              min={1}
              value={customItem.cantidad}
              onChange={(val) => setCustomItem(p => ({ ...p, cantidad: val }))}
              className="w-full h-11 px-4 rounded-2xl bg-surface-2 border border-app text-sm text-app focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full h-11 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-all bg-emerald-500 hover:bg-emerald-600 border-none cursor-pointer"
        >
          <Plus size={16} /> Agregar al carrito
        </button>
      </div>
    </form>
  )
}
