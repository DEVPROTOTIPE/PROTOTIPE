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

## 🛠️ Procedimiento de Uso

1. **Trigger de IA:** `@db-seed` o `@sembrar-datos`.
2. **Validación Previa (Esquemas):**
   - El sistema comprueba si existe `esquema_colecciones.md` en el Core del proyecto activo.
   - Valida que las colecciones de destino (`categorias` y `articulos`) estén documentadas antes de inyectar.
3. **Autenticación (Firebase CLI Token):**
   - Requiere tener una sesión activa en Firebase CLI (`firebase login` ejecutado localmente).
4. **Sembrado:** Inyecta 3 categorías de muestra y 3 artículos detallados (ej: Tenis Run Ultra, Reloj Inteligente V2) en Firestore utilizando privilegios administrativos del token de desarrollo, saltándose momentáneamente las reglas locales de lectura/escritura únicamente para poblar el ambiente.
