# 🛡️ Estándar de Seguridad y Plantilla Base para Firestore Rules

Este estándar técnico establece las directrices de seguridad obligatorias y proporciona una plantilla de marca blanca para la creación y personalización de reglas de seguridad de Firestore (`firestore.rules`) en cualquier aplicación del ecosistema. Su propósito es garantizar la consistencia, evitar errores comunes de compilación y evitar fugas de información.

---

## 🚫 Errores Comunes de Compilación a Evitar (Anti-Patrones IA)

1. **Comparaciones de Tipos Incompatibles (Warning de Tipo):**
   * *Incorrecto:* `allow read: if (userId != null && request.auth == null)` cuando `userId` es una variable de ruta capturada por el match (siempre se evalúa como string, por lo que compararlo contra `null` genera una advertencia o error en compilación).
   * *Correcto:* `allow read: if request.auth == null` directamente, o verificar la existencia en el objeto de request.
2. **Uso de Datos Inexistentes en Creación:**
   * Al validar datos del documento en un flujo de creación (`create`), no debes usar `resource.data` (que representa el estado del documento en la base de datos *antes* de la transacción). Debes usar `request.resource.data` (los datos entrantes).
3. **Ignorar el Límite de Queries (List Leaks):**
   * Permitir `allow read: if resource.data.owner == userId` es seguro para documentos individuales (get), pero si el cliente realiza una consulta de lista (list) sin filtros, Firestore fallará o denegará el acceso.
   * *Solución:* Usar cláusulas que validen límites de consultas o exigir filtros en el request: `request.query.limit <= 20`.

---

## 📋 Plantilla Base Segura (Marca Blanca)

Utiliza este template como punto de partida para cualquier aplicación. Modifica únicamente los nombres de colecciones manteniendo la estructura de seguridad de administrador y scopes de usuario:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── HELPERS GLOBALES DE ACCESO ──────────────────────────────────
    
    // Verifica si la sesión pertenece al Administrador del sistema
    function isAdmin() {
      return request.auth != null;
    }

    // Verifica si el celular proveído coincide con la sesión del usuario
    function isOwner(phoneField) {
      return phoneField != null && (isAdmin() || request.auth == null);
    }

    // ─── REGLAS POR COLECCIÓN ────────────────────────────────────────

    // 1. Configuración Global de la Aplicación
    match /config/{document} {
      allow read: if true; // Lectura pública para inicializar la UI (temas, marca)
      allow write: if isAdmin(); // Solo admin puede alterar configuraciones de marca
    }

    // 2. Base de Datos de Clientes y Perfiles
    match /users/{userId} {
      // Clientes pueden leer/escribir su propio nodo (donde el ID del doc es su número celular)
      allow read, write: if isAdmin() || (userId != null && request.auth == null);
      allow list: if isAdmin(); // Protege contra descargas masivas de números/nombres
      allow delete: if isAdmin();

      // Subcolecciones privadas (ej: Favoritos)
      match /favorites/{favoriteId} {
        allow read, write: if isAdmin() || true;
      }
    }

    // 3. Catálogo de Productos y Categorías
    match /products/{document} {
      allow read: if true; // Público para que los clientes compren
      allow write, update, delete: if isAdmin();
    }
    match /categories/{document} {
      allow read: if true;
      allow write, delete: if isAdmin();
    }

    // 4. Pedidos y Transacciones
    match /orders/{document} {
      allow create: if true; // Clientes sin auth crean pedidos
      allow read: if isAdmin() || (resource.data.cliente.celular != null && request.query.limit <= 20);
      allow update: if isAdmin() || (
        resource.data.cliente.celular != null &&
        (
          // Permite al cliente cancelar o marcar como oculto su propio pedido
          (request.resource.data.estado == 'cancelado' && resource.data.estado == 'pendiente') ||
          (request.resource.data.ocultoCliente == true)
        )
      );
      allow delete: if isAdmin();
    }

    // 5. Créditos y Contabilidad
    match /credits/{document} {
      allow read: if isAdmin() || (resource.data.clienteCelular != null);
      allow write, delete: if isAdmin();
    }

    // 6. Cupones y Descuentos
    match /coupons/{document} {
      allow read: if true;
      allow write, delete: if isAdmin();
    }

    // 7. Notificaciones y Logs
    match /clientNotifications/{document} {
      allow read, update: if isAdmin() || (resource.data.clienteCelular != null);
      allow create: if true;
      allow delete: if isAdmin();
    }
  }
}
```

---

## 📐 Directivas para la IA al Diseñar Reglas Nuevas

1. **Principio de Privacidad por Defecto:** Toda nueva colección debe tener por defecto `allow read, write: if isAdmin();` a menos que sea explícitamente pública o requiera acceso condicionado de cliente.
2. **Separación de Scopes:** Nunca unas `read` y `write` en una sola regla pública si una de las dos operaciones requiere restricciones. Sepáralas explícitamente en sentencias `allow read:` y `allow write:`.
3. **No uses Placeholders:** Genera siempre código sintácticamente correcto de Firestore Rules v2. No uses variables ficticias en producción.
