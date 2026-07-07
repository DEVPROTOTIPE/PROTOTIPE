---
name: database-seeder
description: Sembrado seguro y adaptado de datos de prueba en la base de datos de desarrollo (Firestore) validando esquemas contra la documentación del Core.
trigger: "@db-seed"
aliases:
  - "@sembrar-datos"
---

# Skill de Sembrado Seguro (`database-seeder`)

Esta skill permite poblar la base de datos de desarrollo (Firestore) de una instancia cliente seleccionada con un conjunto de datos ficticios realistas de prueba (categorías y artículos), previniendo la inyección de campos inconsistentes.

## 📁 Rutas de Acceso

- **Esquema de referencia:** `[GIT_ROOT]/Plantillas Core/App Ventas/Documentacion App Ventas/esquema_colecciones.md`
- **Endpoint API:** `POST http://localhost:3001/api/project/db/seed`

## 🛠️ Procedimiento Seguro De Seed

1. **Verificación de Entorno:** Confirmar que el proyecto destino es de desarrollo (`development`), `staging` o se ejecuta en el emulador local. Queda estrictamente prohibido ejecutar scripts de sembrado directo contra el entorno de producción de un cliente activo.
2. **Validación contra Esquema:** Validar que el payload del seed coincida estrictamente con la estructura declarada en `esquema_colecciones.md` del proyecto activo.
3. **Petición Controlada al Bridge:** Enviar el seed únicamente mediante una petición `POST` al endpoint controlado de la API Bridge: `POST http://localhost:3001/api/project/db/seed`.
4. **Idempotencia y Transaccionalidad:** Si el seed modifica documentos calientes (inventario/stock, caja/contabilidad, saldo de crédito, contadores), la escritura en el servidor debe ejecutarse mediante transacciones concurrentes (`runTransaction`) o lotes atómicos idempotentes, registrando un `seedRunId` único, timestamp de auditoría y usuario operador.
5. **Post-verificación y Registro:**
   - Ejecuta `cmd /c npm run validate` en el proyecto activo para verificar la integridad sintáctica y de diseño.
   - Registra detalladamente la siembra de datos en `bitacora_cambios.md`.

