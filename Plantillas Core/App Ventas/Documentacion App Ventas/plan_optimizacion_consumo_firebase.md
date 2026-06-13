# Análisis y Plan de Optimización de Consumo (Ultra-Low Billing - Firestore & Storage)

Este manual técnico expone el diagnóstico y plan de optimización de costos del ecosistema **PROTOTIPE** para reducir al mínimo absoluto las lecturas, escrituras y cuotas de transferencia/almacenamiento de Firebase. El objetivo es viabilizar el uso de cuentas gratuitas (Spark Plan) o de bajísimo costo para todas las marcas.

---

## 1. Análisis Diagnóstico de Consumos Actuales

Tras auditar las plantillas base (`App Ventas`), identificamos los siguientes cuellos de botella e ineficiencias críticas de red y base de datos:

### A. Colección de Productos (Lecturas Planas en Catálogo)
- **Comportamiento Actual:** El componente `ClientCatalog.jsx` realiza un fetch completo mediante `useProducts(true)` que invoca `getDocs(productsRef)`.
- **Impacto:** Si una tienda tiene 300 productos, cada cliente que entra a la web genera **300 lecturas instantáneas** de Firestore. En el plan gratuito Spark (límite de 50,000 lecturas/día), la cuota se agota con tan solo 166 visitas diarias.
- **Solución:** Implementar carga perezosa de datos (*lazy loading*) con Intersection Observer y paginación por cursores (`limit` y `startAfter` de Firestore).

### B. Carga y Almacenamiento de Imágenes (Firebase Storage)
- **Comportamiento Actual:** El administrador sube imágenes directamente desde su cámara o galería a través de `uploadService.js`. No se realiza pre-procesamiento, subiendo fotos nativas en formato PNG/JPEG que suelen pesar entre **3 MB y 8 MB** cada una.
- **Impacto:** El plan Spark solo otorga **5 GB de almacenamiento** en Storage y **1 GB/día de transferencia de descarga**. Con fotos de 5 MB, el límite de almacenamiento se alcanza con solo 1,000 fotos de productos, y el ancho de banda diario de salida se satura con tan solo 200 visitas que exploren el catálogo.
- **Solución:** Compresor client-side universal a formato **WebP (resolución máxima de 800px, calidad 0.75)** y soporte de enlaces externos para imágenes alojadas en servidores gratuitos de terceros.

### C. Configuración de Aplicación (Falta de Caché Offline)
- **Comportamiento Actual:** En cada inicio y refresco de pantalla, se consulta la configuración general (`appConfig`) desde Firestore.
- **Impacto:** Multiplica el número de lecturas en colecciones que rara vez cambian.
- **Solución:** Forzar la persistencia IndexedDB nativa de Firebase y guardar la configuración en `LocalStorage` con un validador de versión en segundo plano.

---

## 2. Plan de Implementación de Mejoras

### MÓDULO I: Compresor Client-Side Universal (WebP)

Para evitar la subida de archivos pesados, se intercepta la imagen en el formulario administrativo y se procesa localmente usando la API Canvas de HTML5.

#### Algoritmo de Compresión Propuesto (`/src/utils/imageCompression.js`):
```javascript
/**
 * Redimensiona y comprime una imagen local en el navegador del cliente.
 * @param {File} file Archivo original de imagen.
 * @param {number} maxWidth Ancho máximo permitido (default 800px).
 * @param {number} maxHeight Alto máximo permitido (default 800px).
 * @param {number} quality Calidad de salida de 0 a 1 (default 0.75).
 * @returns {Promise<Blob>} Imagen comprimida en formato WebP.
 */
export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular escala proporcional
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Fallo al exportar el Canvas a Blob.'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
```

#### Integración Downstream en `uploadService.js`:
Al subir la imagen, se llama a la función de compresión antes de transferir los bytes a Storage:
```javascript
import { compressImage } from '../utils/imageCompression';

export async function uploadImage(file, folder = 'products', customName = null, onProgress = null) {
  if (!file) throw new Error('Archivo inválido.');

  // Compresión automática client-side
  let uploadBlob = file;
  if (file.type.startsWith('image/')) {
    try {
      const maxDim = folder === 'products' ? 800 : 400; // Logos y variantes a 400px
      uploadBlob = await compressImage(file, maxDim, maxDim, 0.75);
    } catch (err) {
      console.warn('[Upload Service] Falló compresión, subiendo original:', err.message);
    }
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const fileName = `${crypto.randomUUID()}_${cleanName.split('.')[0]}.webp`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  
  const uploadTask = uploadBytesResumable(storageRef, uploadBlob);
  // ... resto de lógica de subida y obtención de URL
}
```

---

### MÓDULO II: Carga Perezosa de Productos (Paginación por Cursores)

En lugar de consultar la lista de productos completa en `ClientCatalog.jsx`, consultamos por bloques (ej: 12 ítems).

#### Cambios en `inventoryService.js` (Lógica de Paginación):
```javascript
import { query, limit, startAfter, getDocs, where, orderBy } from 'firebase/firestore';

export async function getProductsPaged(onlyActive = true, lastVisibleDoc = null, pageSize = 12) {
  let q = query(
    productsRef,
    where('activo', '==', onlyActive),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastVisibleDoc) {
    q = query(
      productsRef,
      where('activo', '==', onlyActive),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisibleDoc),
      limit(pageSize)
    );
  }

  const snap = await getDocs(q);
  const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return {
    products,
    lastVisible: snap.docs[snap.docs.length - 1] || null,
    hasMore: products.length === pageSize
  };
}
```

#### Carga en el Catálogo de Clientes (`ClientCatalog.jsx`):
Se acopla un observador de intersección al final de la lista. Cuando entra al viewport del cliente, se dispara la carga del siguiente lote:
```javascript
const observer = useRef();
const lastProductElementRef = useCallback(
  (node) => {
    if (isLoadingProducts) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchNextPage(); // Carga el siguiente cursor startAfter
      }
    });

    if (node) observer.current.observe(node);
  },
  [isLoadingProducts, hasMore]
);
```

---

### MÓDULO III: Persistencia Local y Caché de Configuración

#### Habilitación de Persistencia Offline en `firebaseConfig.js`:
```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('La persistencia falló: Múltiples pestañas abiertas.');
  } else if (err.code === 'unimplemented') {
    console.warn('El navegador no soporta persistencia offline.');
  }
});
```

#### Caché de Identidad de Marca (`LocalStorage`):
Guardamos la configuración y la pre-cargamos de inmediato al iniciar la app.
```javascript
export function getCachedAppConfig() {
  const cached = localStorage.getItem('prototipe_app_config');
  return cached ? JSON.parse(cached) : null;
}

export function cacheAppConfig(config) {
  localStorage.setItem('prototipe_app_config', JSON.stringify(config));
}
```

---

## 3. Directrices para Aprovisionamiento CLI (Futuros Clientes)

Para garantizar que todas las nuevas marcas e instancias de clientes creadas automáticamente por la CLI hereden estas optimizaciones, se establecen las siguientes directivas obligatorias:

1. **Inyección en `generator.js`:** El motor de aprovisionamiento del CLI incluirá el archivo de utilidad `imageCompression.js` en la copia inicial de archivos en el directorio `/src/utils/` del cliente.
2. **Habilitación de IndexedDB por Defecto:** La plantilla core `template-ventas` vendrá pre-configurada con la llamada de persistencia offline habilitada por defecto en su archivo de configuración de Firebase.
3. **Validación de Peso de Logos en Onboarding:** El endpoint `/api/upload-logo` del CLI continuará forzando el redimensionamiento del logotipo con Jimp, pero se acoplará la compresión WebP antes de guardar el asset final de marca.
