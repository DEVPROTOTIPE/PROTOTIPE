# Plantilla de Briefing y Cuestionario de Precisión Ecosistema

Esta plantilla guía la reunión de relevamiento con el cliente. Su estructura está alineada con el mapeo técnico de la aplicación base, facilitando la parametrización de variables en caliente, configuración de base de datos e identificación de componentes reutilizables.

---

## 🏢 1. Información General del Cliente
* **Nombre de la Empresa / Marca:**
* **Sector / Nicho de Mercado:**
* **Contacto Principal:**
* **Canales de Venta Actuales (Físico, Instagram, WhatsApp, etc.):**

---

## 📐 2. Cuestionario de Precisión Operativa (Entrevista al Cliente)

*Preguntas clave redactadas para el cliente, orientadas a mapear la base de datos Firestore y las Feature Flags de la aplicación.*

### A. Gestión de Catálogo y Productos (Mapea: `products`, `variants`, `features.wholesale`)
1. **"¿Tus productos vienen en variaciones (como diferentes tallas, colores, sabores o materiales) o son de modelo único?"**
   * *Notas del Cliente:* 
2. **"¿Vendes a un precio único, o manejas tarifas con descuento para ventas al por mayor (mayoreo) a partir de cierta cantidad de unidades?"**
   * *Notas del Cliente:*
3. **"Cuando un producto se queda sin existencias (stock cero), ¿prefieres que el cliente deje de verlo/comprarlo, o quieres permitir que lo reserven bajo encargo con un tiempo de entrega estipulado?"**
   * *Notas del Cliente:*

### B. Notificaciones y Canal de Pedidos (Mapea: `whatsappService`, `limits.minOrderAmount`)
4. **"¿Cuál es el número de WhatsApp oficial del negocio al que deben llegar todos los avisos de compras en tiempo real?"**
   * *Notas del Cliente:*
5. **"¿Estableces un valor mínimo de compra en la tienda web para poder procesar y enviar un pedido (ej. pedidos mínimos de $10,000 COP)?"**
   * *Notas del Cliente:*

### C. Métodos de Pago y Financiación (Mapea: `features.credits`, `paymentMethods`)
6. **"¿Cuáles son tus métodos de pago autorizados (transferencia, efectivo contra entrega, pasarela de pago)?"**
   * *Notas del Cliente:*
7. **"¿Ofreces un sistema de 'fiado' o créditos a clientes recurrentes de confianza? Si es así, ¿deseas poner un límite de saldo máximo para fiar por cliente?"**
   * *Notas del Cliente:*

### D. Fidelización y Reclamaciones (Mapea: `features.coupons`, `features.claims`)
8. **"¿Sueles crear cupones de descuento o promociones de temporada (ej. $10,000 de descuento o 10% menos) para impulsar tus ventas?"**
   * *Notas del Cliente:*
9. **"Si un cliente tiene un inconveniente con su pedido, ¿deseas que pueda enviarte un reporte de garantía formal con fotos desde la misma web, o prefieres gestionarlo todo directo por chat?"**
   * *Notas del Cliente:*

---

## 🎨 3. Cuestionario de Branding e Identidad Visual (Mapea: `theme`, `assets`)

10. **"¿Cuáles son los colores primarios y secundarios de tu logotipo o branding? (Si tienes los códigos exactos en Hexadecimal o HSL, indícalos)"**
    * *Notas del Cliente:*
11. **"¿Qué sensación o tono de diseño buscas transmitir en la tienda? (Limpio y minimalista, elegante y oscuro, infantil y colorido, deportivo y vibrante)"**
    * *Notas del Cliente:*
12. **"¿Qué fuente tipográfica te representa más? (Moderna sin serifas como Roboto/Inter, o elegante con serifas como Georgia/Playfair)"**
    * *Notas del Cliente:*

---

## ❌ 4. Dolores y Falencias del Negocio (Diagnóstico)
* **¿Cuál es el cuello de botella operativo que más tiempo les quita actualmente?**
* **¿Qué errores humanos ocurren con mayor frecuencia en el día a día?**
* **¿Qué datos financieros o de inventario les cuesta más trabajo consolidar o calcular?**

---

## 📝 5. Resumen Técnico del Desarrollador (Para Sergio & Antigravity)
*A rellenar tras la reunión para mapear con la biblioteca:*
* **HSL Sugerido Primario:**
* **HSL Sugerido Botones Compra (`actionColor`):**
* **Componentes de la Biblioteca Reutilizables:**
  * `[ ]` [carrito_completo](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/Biblioteca de Componentes/Formularios_y_UI/Carrito_Completo/carrito_completo.md)
  * `[ ]` [checkout_modal](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/Biblioteca de Componentes/Formularios_y_UI/Checkout_Modal/checkout_modal.md)
  * `[ ]` [tarjeta_producto](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/Biblioteca de Componentes/Formularios_y_UI/Tarjeta_Producto/tarjeta_producto.md)
  * `[ ]` [rejilla_catalogo](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/Biblioteca de Componentes/Formularios_y_UI/Rejilla_Catalogo/rejilla_catalogo.md)
  * `[ ]` [seguimiento_pedido](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/Biblioteca de Componentes/Formularios_y_UI/Seguimiento_Pedido/seguimiento_pedido.md)
  * `[ ]` [admin_stock_alerts](file:///D:/PROTOTIPE/Documentacion PROTOTIPE/Biblioteca de Componentes/Visualizacion/Alertas_Stock_Critico/admin_stock_alerts.md)
* **Feature Flags a Setear en Firestore (`true`/`false`):**
  * `creditsEnabled`:
  * `couponsEnabled`:
  * `claimsEnabled`:
  * `wholesaleEnabled`:
