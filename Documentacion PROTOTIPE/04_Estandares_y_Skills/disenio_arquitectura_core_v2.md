# 📐 Especificación de Diseño Arquitectónico — Core v2.1 (SaaS Platform Framework)

Este documento define la arquitectura objetivo de la versión **Core v2.1** para `template-core-seed`. Transforma la base de código de retail en un framework extensible, de baja huella en bundle y con soporte dinámico para múltiples verticales de negocio (Citas, Reservas, E-commerce, Clínicas, etc.) mediante inyección reactiva desde la CLI de Prototype.

---

## 📊 1. Matriz de Localización: Core vs Features

Bajo la arquitectura Core v2.1, todos los módulos de la aplicación se clasifican estrictamente de la siguiente forma:

| Módulo | Categoría | Ubicación Core v2.1 | Estado Actual en Semilla | Acción Requerida |
| :--- | :---: | :--- | :---: | :--- |
| **Autenticación** | CORE | `src/core/auth/` | Mezclado en `src/hooks/` | Mover a carpeta `/core/auth/`. |
| **Usuarios** | CORE | `src/core/auth/userService.js` | Mezclado en `src/services/` | Reubicar bajo `/core/auth/`. |
| **Roles / Permisos** | CORE | `src/core/contracts/permissionsContract.js` | Constante rígida en index.js | Crear contrato abstracto de validación. |
| **Tenant Management**| CORE | `src/core/config/tenantManager.js` | Mezclado en `src/services/` | Reubicar bajo `/core/config/`. |
| **Configuración** | CORE | `src/core/config/appConfigStore.js` | Store Zustand con campos retail | Dividir schema y almacenar solo valores core. |
| **Branding y Temas** | CORE | `src/core/config/theme/` | En constantes de palettes | Mover palettes y layouts a `/core/config/theme/`. |
| **Telemetría** | CORE | `src/core/contracts/telemetryContract.js` | Mezclado en `src/services/` | Crear contrato y reubicar en `/core/contracts/`. |
| **Manejo de Errores** | CORE | `src/core/error/` | En `src/services/` | Mover triggers a `/core/error/`. |
| **Testing** | CORE | `tests/` | vitest sin aliases y locked | Añadir resolvers de Vitest y fix cmd en Playwright. |
| **CI/CD** | CORE | `.github/workflows/ci.yml` | Configurado | Actualizar para correr checks de linter y build. |
| **Ventas (POS)** | FEATURE | `src/features/sales/` | Aislado pero acoplado a BD | Encapsular stock transaccional en el contrato. |
| **Pedidos (Checkout)**| FEATURE | `src/features/orders/` | Aislado pero acoplado a BD | Desacoplar decremento directo de productos. |
| **Inventario** | FEATURE | `src/features/inventory/` | Aislado pero sin API pública | Crear `src/features/inventory/services/inventoryInterface.js`. |
| **Créditos (Fiado)** | FEATURE | `src/features/credits/` | Aislado | Sin cambios estructurales. |
| **Facturación (PDF)** | FEATURE | `src/features/billing/` | Aislado | Sin cambios estructurales. |
| **Citas y Reservas** | FEATURE | `src/features/appointments/` | *No existente* | Reservado para generación por nicho. |
| **CRM** | FEATURE | `src/features/crm/` | *No existente* | Reservado para generación por nicho. |

---

## 🛠️ 2. Auditoría de Generabilidad y Modificaciones Manuales

Si la CLI de Prototype genera verticales alternativos (Citas, Clínicas o E-commerce tradicional) a partir del estado actual de la plantilla, se requieren los siguientes cambios manuales debido al acoplamiento rígido:

### 1. Aplicación de Citas / Reservas (Clínicas):
* **Rutas:** Eliminar manualmente todas las páginas y layouts de catálogo e inventarios en `AppRoutes.jsx`. Registrar las rutas de agendas e historias clínicas de forma manual.
* **Configuración:** Limpiar los campos `wholesaleSettings` y `deliverySettings` del schema Zod global para evitar errores al inicializar la BD vacía.
* **Componentes:** Remover el Drawer de Carrito (`CartDrawer.jsx`) y el modal de variantes de productos de los layouts generales de UI.

### 2. E-commerce Puro (Sin POS / Sin Bodega):
* **Portales:** Eliminar manualmente los módulos de rol operativo del vendedor, mensajero y despachador de almacén.
* **Services:** Desconectar los listeners de sincronización de IndexedDB (`syncOfflineSales`) en `App.jsx`.
* **Rutas:** Limpiar el router para evitar accesos indebidos a rutas POS deshabilitadas.

---

## 🔗 3. Mapa de Dependencias Modulares (Imports y Acoplamiento)

Para asegurar que las features puedan añadirse o eliminarse sin romper el compilador, se establecen reglas estrictas de importación:

```
                  ┌─────────────────────────────────┐
                  │        Core Contracts           │
                  │ (telemetry, notifications, etc.)│
                  └────────────────┬────────────────┘
                                   ▲
                                   │ (Permitido)
  ┌────────────────────────────────┼────────────────────────────────┐
  │                           Features                              │
  │                                                                 │
  │  ┌──────────────────┐  (Prohibido)  ┌────────────────────────┐  │
  │  │  sales / orders  ├──────────────►│       inventory        │  │
  │  │  (POS/Checkout)  │               │       (Products)       │  │
  │  └────────┬─────────┘               └───────────▲────────────┘  │
  │           │                                     │               │
  │           └──────────► inventoryInterface ──────┘               │
  │                         (Contrato DDD - Permitido)              │
  └─────────────────────────────────────────────────────────────────┘
```

### Reglas de Validación de Imports:
1. **Imports Prohibidos (Cross-Feature directo):**
   * *Incorrecto:* `import { dbUpdateStock } from '../../inventory/services/inventoryService'` en `salesService.js`.
   * *Correcto:* `import { deductInventoryStock } from '../../inventory/services/inventoryInterface'`.
2. **Imports Prohibidos (Core ➔ Feature):**
   * El Core bootstrap (`src/App.jsx`, `src/core/router/AppRoutes.jsx`) tiene estrictamente **prohibido** importar componentes de negocio de forma estática. Toda ruta de feature debe resolverse por lazy loading dinámico.
3. **Dependencias Circulares:**
   * Queda prohibido que `inventory` importe lógica de `sales` u `orders`. La comunicación del estado de ventas debe ser unidireccional y basada en interfaces abstractas de inventario.

---

## ⚙️ 4. Flujo de Ejecución del Router Dinámico y Lazy Loading Real

El enrutador central de Core v2.1 utiliza `import.meta.glob` diferido para importar únicamente el bundle del router de la feature cuando el usuario navegue hacia él:

```javascript
// src/core/router/AppRoutes.jsx
import React, { useMemo, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FeatureRegistry } from '../config/FeatureRegistry';

// Escaneo no eager (Retorna una lista de imports asíncronos)
const featureRoutesLoaders = import.meta.glob('../../features/*/routes.jsx');

const DynamicFeatureRoute = ({ featureName, routePath }) => {
  const LazyComponent = useMemo(() => {
    return lazy(async () => {
      const loaderPath = `../../features/${featureName}/routes.jsx`;
      if (featureRoutesLoaders[loaderPath]) {
        const module = await featureRoutesLoaders[loaderPath]();
        const routeObj = module[`${featureName}Routes`]?.find(r => r.path === routePath);
        return { default: () => routeObj.element };
      }
      return { default: () => <Navigate to="/" replace /> };
    });
  }, [featureName, routePath]);

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LazyComponent />
    </Suspense>
  );
};
```

---

## 🚀 5. Roadmap de Migración Incremental (4 Fases)

### Fase 1: Desacople del Router y Configuración Base
* **Entregables:** `features.json` [NEW], `FeatureRegistry.js` [NEW], `AppRoutes.jsx` [MODIFY].
* **Estrategia de Compatibilidad:** El registro de features proveerá un fallback con todas las features de retail activadas por defecto si el archivo `features.json` no está presente, garantizando compatibilidad con proyectos antiguos creados por la CLI.
* **Validación:** `npm run build` y ejecución de Smoke tests con Vitest.

### Fase 2: Mapeo y Migración de Servicios a `/core/` (Capa Proxy)
* **Entregables:** Proxies de importación en `src/services/` y `src/components/ui/CategoryManager.jsx`.
* **Estrategia de Compatibilidad:** Los archivos originales se convierten en re-exportadores del módulo reubicado. Esto evita romper importaciones relativas (`../../services/...`) en el código intermedio de administración.
* **Validación:** Ejecución de suite completa de pruebas unitarias y E2E de Playwright.

### Fase 3: Aislamiento transaccional mediante Contratos (inventoryInterface)
* **Entregables:** `inventoryInterface.js` [NEW], refactorización de `salesService.js` y `orderService.js`.
* **Estrategia de Compatibilidad:** Implementar el contrato manteniendo la API transaccional intacta. Las colecciones compartidas se desvinculan a nivel de persistencia de bases de datos.
* **Validación:** Vitest run con mocks de transacciones de Firestore.

### Fase 4: Automatización e Integración en Prototype CLI (generator.js / sync_templates.js)
* **Entregables:** Actualización en `generator.js` y `sync_templates.js`.
* **Estrategia de Compatibilidad:** La CLI lee las variables del cliente y escribe en caliente en `features.json`. Solo se copian las carpetas de las features asociadas al nicho de negocio del cliente.
* **Validación:** Simulación completa del build con `node sync_templates.js ventas --dry-run`.

---

## 🎯 6. Conclusión y Nivel de Madurez Concluido

> **Nivel de Madurez Post-Implementación:** **Framework SaaS Generador de Aplicaciones**
>
> **Justificación:** Al aplicar el diseño de Core v2.1, `template-core-seed` rompe completamente la dependencia estática con el nicho retail. La CLI podrá inyectar únicamente el núcleo minimalista (Auth + DB + Telemetría + Config) y las features que correspondan estrictamente a la vertical comercial del cliente final (como agendas para clínicas o catálogos para e-commerce). El bundle final se reduce, se aíslan los agregados en DDD y se previenen deudas técnicas en cascada a gran escala.
