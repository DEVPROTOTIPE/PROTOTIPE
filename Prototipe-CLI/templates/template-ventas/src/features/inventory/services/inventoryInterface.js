import { doc } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';
import { auditProductStock } from './inventoryService';

/**
 * Contrato de Dominio para deducción transaccional de stock de productos/variantes.
 * Es invocado por las features de ventas (POS) y pedidos (e-commerce) para aislar la persistencia.
 * @param {Array<{productId: string, varianteId: string, cantidad: number, nombre?: string}>} items - Lista de variantes a deducir
 * @param {object} transactionInstance - Instancia de transacción Firestore activa
 */
export const deductInventoryStock = async (items, transactionInstance) => {
  if (!transactionInstance) {
    throw new Error('[Inventory Contract] Se requiere una instancia de transacción activa.');
  }

  const updatedProducts = {};
  const productsCache = {};

  for (const item of items) {
    let productSnap = productsCache[item.productId];
    if (!productSnap) {
      const productRef = doc(db, 'products', item.productId);
      productSnap = await transactionInstance.get(productRef);
      if (!productSnap.exists()) {
        throw new Error(`Producto no encontrado: ${item.nombre || item.productId}`);
      }
      productsCache[item.productId] = productSnap;
    }

    const productData = productSnap.data();
    if (productData.stockInfinito === true) {
      continue; // Stock infinito, omitir decremento
    }

    const dataToMutate = updatedProducts[item.productId] || {
      nombre: productData.nombre || item.nombre || '',
      variantes: [...(productData.variantes || [])]
    };

    const variantIndex = dataToMutate.variantes.findIndex(v => v.id === item.varianteId);

    if (variantIndex === -1) {
      throw new Error(`La variante con ID ${item.varianteId} no se encuentra en el producto "${dataToMutate.nombre}".`);
    }

    const stockActual = Number(dataToMutate.variantes[variantIndex].stock) || 0;
    if (stockActual < item.cantidad) {
      const variant = dataToMutate.variantes[variantIndex];
      const variantLabel = [variant.talla, variant.color].filter(Boolean).join(' / ');
      const labelSuffix = variantLabel ? ` (${variantLabel})` : '';
      const qtySuffix = stockActual > 0 
        ? `Solo quedan ${stockActual} unidades.` 
        : 'Solo está agotado.';
      
      throw new Error(`Stock insuficiente para "${dataToMutate.nombre}${labelSuffix}". ${qtySuffix}`);
    }

    dataToMutate.variantes[variantIndex].stock = stockActual - item.cantidad;
    updatedProducts[item.productId] = dataToMutate;
  }

  // Guardar todas las mutaciones al final de la transacción
  for (const [prodId, data] of Object.entries(updatedProducts)) {
    const productRef = doc(db, 'products', prodId);
    const totalQtySold = items
      .filter(item => item.productId === prodId)
      .reduce((sum, item) => sum + item.cantidad, 0);

    const productSnap = productsCache[prodId];
    const originalData = productSnap.data();

    transactionInstance.update(productRef, {
      variantes: data.variantes,
      salesCount: (originalData.salesCount || 0) + totalQtySold,
      updatedAt: new Date()
    });
  }

  // Ejecutar auditoría de stock bajo de forma asíncrona no bloqueante
  Object.entries(updatedProducts).forEach(([prodId, prodData]) => {
    auditProductStock(prodId, prodData).catch(err => {
      console.error(`[Inventory Contract ERROR] Fallo al auditar stock de "${prodId}":`, err);
    });
  });

  return updatedProducts;
};
