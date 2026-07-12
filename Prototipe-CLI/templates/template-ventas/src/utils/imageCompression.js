/**
 * 🚀 UTILIDAD DE COMPRESIÓN DE IMÁGENES CLIENT-SIDE
 * Ubicación: src/utils/imageCompression.js
 * 
 * Captura un archivo de imagen, lo procesa con Canvas en el navegador
 * para reducir su resolución de forma proporcional si excede los límites,
 * y lo exporta como Blob WebP comprimido de alta eficiencia.
 */

/**
 * Comprime y redimensiona una imagen local antes de subirla.
 * 
 * @param {File} file Archivo original de imagen.
 * @param {number} maxWidth Ancho máximo permitido (default 800px).
 * @param {number} maxHeight Alto máximo permitido (default 800px).
 * @param {number} quality Calidad de compresión de 0 a 1 (default 0.75).
 * @returns {Promise<Blob>} Promesa que resuelve con el Blob comprimido en WebP.
 */
export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    // Si no es una imagen, retornar el archivo original
    if (!file.type.startsWith('image/')) {
      return resolve(file)
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calcular escala proporcional manteniendo la relación de aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a blob de formato WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
              // Devolver un File real (no un Blob con .name hack) para garantizar
              // que .name, .type y .size sean propiedades nativas accesibles en uploadService
              const webpFile = new File([blob], `${nameWithoutExt}.webp`, { type: 'image/webp' })
              resolve(webpFile)
            } else {
              resolve(file) // Fallback al original si toBlob falla
            }
          },
          'image/webp',
          quality
        );
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}
