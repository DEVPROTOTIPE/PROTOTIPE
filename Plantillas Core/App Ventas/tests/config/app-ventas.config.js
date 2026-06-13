/**
 * Configuración de pruebas E2E para: App Ventas (instancia base PROTOTIPE)
 * -----------------------------------------------------------------------
 * Adapta este archivo para cada cliente/proyecto nuevo. El spec de checkout
 * importa este objeto y adapta su flujo al contexto de cada aplicación.
 */

export const APP_CONFIG = {
  /** Nombre descriptivo de la instancia (para logs y reportes) */
  name: 'App Ventas - PROTOTIPE',

  /** Puerto del servidor de desarrollo local */
  baseURL: 'http://localhost:5173',

  /** ¿Tiene pantalla de bienvenida antes del login? */
  hasWelcomePage: true,
  welcomeButtonText: 'Comencemos',

  /** Credenciales de prueba (usuario nuevo para forzar registro completo) */
  testUser: {
    /** Si es `true`, genera un teléfono aleatorio para simular usuario nuevo cada vez */
    generateRandomPhone: true,
    /** Prefijo del teléfono generado aleatoriamente (10 dígitos totales) */
    phonePrefix: '300',
    /** Nombre que se usará al registrar el usuario nuevo */
    name: 'Cliente E2E Playwright',
    /** Teléfono fijo (se usa sólo si generateRandomPhone = false) */
    fixedPhone: '3001234567',
  },

  /** Selectores y textos de la página de Login */
  login: {
    phoneInputSelector: 'input[type="tel"]',
    nameInputPlaceholder: 'nombre y apellido', // Se busca con `placeholder*=`
    submitButtonSelector: 'button[type="submit"]',
  },

  /** Configuración del catálogo de productos */
  catalog: {
    /** Texto del producto a buscar en el catálogo para el test */
    targetProductText: 'Cámara inalámbrica',
    /** URL pattern del catálogo */
    urlPattern: /\/tienda\/catalogo/,
    /** URL pattern del detalle de producto */
    productDetailUrlPattern: /\/tienda\/producto\//,
  },

  /**
   * Selectores del detalle de producto.
   * Adaptar si el cliente tiene un layout diferente.
   */
  productDetail: {
    buyNowButtonText: 'Comprar Ahora',
    colorSectionSelector: 'h3:has-text("Color") + div button',
    tallaSectionSelector: 'h3:has-text("Talla") + div button',
  },

  /**
   * Configuración del modal de checkout.
   * Define qué pasos están activos y los textos/selectores de cada uno.
   */
  checkout: {
    /**
     * Paso 1: Método de entrega.
     * Si el negocio sólo tiene un método activo, el modal lo omite automáticamente.
     * Poner `enabled: false` si este paso nunca aparece en esta instancia.
     */
    deliveryStep: {
      enabled: true,
      preferredOptionText: 'Retiro en Tienda',
    },

    /** Paso 2: Datos del cliente */
    contactStep: {
      phoneInputSelector: 'input[type="tel"]',
      continueButtonText: 'Continuar al Pago',
    },

    /** Paso 3: Método de pago */
    paymentStep: {
      preferredMethodText: 'Efectivo',
      reviewButtonText: 'Revisar Pedido',
    },

    /** Paso 4: Resumen y confirmación */
    confirmStep: {
      confirmButtonText: 'Confirmar y Comprar',
    },

    /** Paso 5: Pantalla de éxito */
    successStep: {
      successText: '¡Pedido Exitoso!',
      successTimeout: 20000,
    },
  },
};
