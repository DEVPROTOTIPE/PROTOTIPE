# Estándar Universal de Sincronización de Templates PROTOTIPE

> **Disparador:** `@actualizar-template [nombre]`
> **Registro de plantillas:** [`plantillas_registro.json`](file:///D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json)
> **Cuándo ejecutar:** Siempre antes de crear un proyecto nuevo desde el CLI o tras finalizar cambios significativos en una aplicación base de desarrollo.

---

## Filosofía

Cada app activa (App Ventas, App Servicios, etc.) es la **fuente de verdad** de su respectivo template en el CLI.
El template es una copia limpia, sanitizada y despersonalizada lista para ser clonada por clientes individuales.
La sincronización es **on-demand** y se ejecuta con `@actualizar-template`.

---

## Plantillas registradas

Consultar [`plantillas_registro.json`](file:///D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json) para ver la lista completa y sus rutas en tiempo real.

| Nombre | Nicho | Activo en Producción | Carpeta Fuente | Carpeta Destino Template |
|---|---|---|---|---|
| `ventas` | Retail / Ecommerce / POS | ✅ Sí | `D:/PROTOTIPE/Plantillas Core/App Ventas` | `D:/PROTOTIPE/Prototipe-CLI/templates/template-ventas` |
| `servicios` | Talleres / Mantenimiento / Servicios técnicos | ⏳ Pendiente | `D:/PROTOTIPE/App Servicios` | `D:/PROTOTIPE/Prototipe-CLI/templates/template-servicios` |
| `agendamiento` | Citas / Reservas / Hoteles / Turnos | ⏳ Pendiente | `D:/PROTOTIPE/App Agendamiento` | `D:/PROTOTIPE/Prototipe-CLI/templates/template-agendamiento` |
| `gastronomia` | Restaurantes / Cafés / Bares / Comidas | ⏳ Pendiente | `D:/PROTOTIPE/App Gastronomia` | `D:/PROTOTIPE/Prototipe-CLI/templates/template-gastronomia` |

---

## Archivos que SÍ se sincronizan (genéricos — aplica a CUALQUIER template)

### `src/`
| Directorio / Archivo | Razón |
|---|---|
| `src/components/` | Componentes de UI reutilizables |
| `src/hooks/` | Hooks personalizados |
| `src/services/` | Servicios de Firestore |
| `src/store/` | Estado global (Zustand) |
| `src/layouts/` | Layouts de navegación |
| `src/pages/` | Páginas de la app |
| `src/routes/` | Configuración de rutas |
| `src/utils/` | Utilidades y helpers |
| `src/constants/` | Constantes de la app |
| `src/schemas/` | Esquemas de validación |
| `src/types/` | Tipos TypeScript |
| `src/providers/` | Providers de contexto |
| `src/App.jsx` | Componente raíz |
| `src/App.css` | Estilos globales |
| `src/index.css` | Variables CSS y sistema de diseño |
| `src/main.jsx` | Punto de entrada |

### Raíz del proyecto
| Archivo | Razón |
|---|---|
| `firestore.indexes.json` | Índices compuestos requeridos |
| `firestore.rules` | Reglas de seguridad |
| `vite.config.js` | Configuración del bundler |
| `eslint.config.js` | Reglas de linting |
| `GEMINI.md` | Reglas de comportamiento de la IA |
| `flujos_aplicacion.md` | Documentación de flujos |
| `mapa_arquitectura.md` | Mapa de arquitectura |
| `mapa_arquitectura_ia.md` | Mapa semántico para la IA |

---

## Archivos que NUNCA se sincronizan (cliente-específicos — aplica a CUALQUIER template)

| Archivo / Directorio | Razón |
|---|---|
| `.env.local` | Credenciales Firebase del cliente actual |
| `.firebaserc` | ID del proyecto Firebase del cliente |
| `firebase.json` | Configuración de hosting del cliente |
| `src/config/firebaseConfig.js` | SDK config del proyecto Firebase |
| `index.html` | Título, meta SEO y favicon del cliente |
| `public/` (logos, favicon) | Assets de marca del cliente |
| `package-lock.json` | Se regenera con `npm install` |
| `node_modules/` | Dependencias instaladas localmente |
| `.env.example` | Actualizar manualmente si hay variables nuevas |

---

## Procedimiento al ejecutar `@actualizar-template [nombre]`

### Paso 1 — Leer el registro
Abrir [`plantillas_registro.json`](file:///D:/PROTOTIPE/Prototipe-CLI/plantillas_registro.json), localizar la entrada `[nombre]` y obtener `fuente` y `destino`.

### Paso 2 — Verificar que la fuente existe
Si `activo: false` y la carpeta fuente no existe en disco → informar al usuario y detener.

### Paso 3 — Auditoría de diferencias
Comparar tamaño/contenido de los archivos de la lista "SÍ sincronizar" entre fuente y destino. Reportar cuáles difieren antes de copiar.

### Paso 4 — Copiar archivos genéricos
Copiar los archivos modificados de `fuente/` → `destino/` respetando la estructura.

### Paso 5 — Limpiar datos cliente-específicos
Verificar que los archivos copiados no contengan:
- Nombres reales de clientes hardcodeados
- IDs de colecciones Firestore del cliente
- Tokens, credenciales o proyecto Firebase (`ventas-smartfix`, etc.)

Si se dectecta alguno → reemplazar por variable genérica o comentario de placeholder.

### Paso 6 — Validar `firestore.indexes.json`
Asegurar que el template tenga exactamente los mismos índices que la app fuente.

### Paso 7 — Confirmar al usuario
Reportar tabla: archivos actualizados | archivos omitidos | razón.
Registrar la sincronización en la tabla de historial de este documento.

---

## Checklist de validación post-sincronización

- [ ] No hay referencias a `.env.local` en el código copiado
- [ ] No hay `projectId` hardcodeado del cliente anterior
- [ ] `firestore.indexes.json` está actualizado
- [ ] `GEMINI.md` propagado (ejecutar `sync_rules.js`)
- [ ] El template compila sin errores (`npm run build` en el destino)

---

## Historial de sincronizaciones

| Fecha | Template | Archivos actualizados | Ejecutado por |
|---|---|---|---|
| 2026-06-08 | `ventas` | Sincronización inicial automatizada con script de CLI | Antigravity AI |
