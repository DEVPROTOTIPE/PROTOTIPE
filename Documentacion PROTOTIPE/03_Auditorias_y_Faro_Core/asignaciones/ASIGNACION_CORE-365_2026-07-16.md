# Asignación de tarea — CORE-365

Este archivo es autocontenido: se pega o adjunta completo en un chat nuevo de
Antigravity apuntando a `D:\PROTOTIPE`.

## 0. Quién eres y bajo qué reglas operas

Trabajas bajo el contrato multiagente `.agents/AI_WORKFLOW.md` — **léelo
completo antes de escribir nada**. `CLAUDE.md` y `AI_WORKFLOW.md` §1-6
siguen aplicando íntegros.

Antes de escribir:
1. `git status --short --branch` en `D:\PROTOTIPE`.
2. Confirma rama `docs/context-packaging`, HEAD `5815370`. Si no coincide,
   detente.
3. Esta tarea toca **solo** `Plantillas Core/App Ventas/`. El fundador
   sincroniza Core → `template-ventas`/`ventas-moni-app` él mismo desde el
   panel del Dashboard Central — no propagues manualmente a esas 2 copias.
4. Trata cualquier cambio que no sea tuyo como ajeno.

## 1. Identificación

- ID: `CORE-365`
- Título: Auditoría y corrección de responsividad — cada página y sesión
  de App Ventas Core
- Asignada por: Claude Code (terminal), 2026-07-16, por instrucción
  explícita del fundador

## 2. Objetivo y beneficio

El fundador detectó en vivo que algunas páginas de la app **no se
comportan de forma responsiva** — ejemplo confirmado: la vista de
Fidelización (`AdminCustomerLoyalty.jsx`/`AdminView.jsx`). Quiere una
garantía real, página por página, de que **toda** la app (sesión cliente,
sesión admin, portales de empleados) es perfectamente responsiva en móvil,
tablet y escritorio — no solo un parche puntual en la página que falló.

**No inventes un estándar nuevo.** Este proyecto ya tiene uno propio,
documentado y con motivos reales detrás de cada regla (huelen a
postmortems de bugs reales, no son gustos estéticos):
`.claude/rules/component-library.md`, sección **"5. ESTÁNDAR DE DISEÑO
RESPONSIVO MÓVIL Y PREVENCIÓN DE DESBORDAMIENTOS"** (14 reglas exactas,
con ejemplos de clases Tailwind concretas) y sección **"7. ESTÁNDAR DE
DESIGN INTEGRITY GUARD"** (prohibiciones que bloquean el build:
`validate-core-integrity.js`). Lee esas 2 secciones completas antes de
tocar cualquier archivo — son tu criterio de corrección, no una guía
opcional.

## 3. Alcance autorizado — checklist completo de páginas

Audita **cada una** de estas páginas contra las 14 reglas de la sección 5.
Para cada página: documenta qué regla(s) viola (si alguna), corrige, y
marca el checklist en el traspaso. No te detengas en la primera página que
encuentres mal — cubre la lista completa.

**Sesión Cliente** (`src/pages/client/`):
- [ ] `ClientCatalog.jsx`
- [ ] `ClientCredits.jsx`
- [ ] `ClientFavorites.jsx`
- [ ] `ClientOrders.jsx`
- [ ] `ClientProfile.jsx`
- [ ] `OrderTracking.jsx`
- [ ] `ProductDetailPage.jsx`
- [ ] `ProductPublicDetail.jsx`

**Sesión Admin** (`src/pages/admin/`):
- [ ] `AdminClaims.jsx`
- [ ] `AdminCredits.jsx`
- [ ] `AdminDeliveryPerformance.jsx`
- [ ] `AdminHome.jsx`
- [ ] `AdminInventory.jsx`
- [ ] `AdminNotificationAnalytics.jsx`
- [ ] `AdminOrders.jsx`
- [ ] `AdminPortalQR.jsx`
- [ ] `AdminQRPerformance.jsx`
- [ ] `AdminSales.jsx`
- [ ] `AdminSalesDetail.jsx`
- [ ] `AdminSettings.jsx` (incluye sus secciones en `src/pages/admin/settings/sections/`)
- [ ] `AdminStockAlerts.jsx`

**Portales de empleados** (`src/pages/portal/`):
- [ ] `PortalAuth.jsx`
- [ ] `PortalBodega.jsx`
- [ ] `PortalMensajero.jsx`
- [ ] `PortalVendedor.jsx`

**Vistas de features dinámicas** (`src/features/*/components/Admin*.jsx`):
- [ ] `customer-loyalty/components/AdminCustomerLoyalty.jsx` — **ya
      confirmado roto por el fundador, prioridad más alta**
- [ ] `customer-loyalty/components/AdminView.jsx` — mismo feature, revisar
      también
- [ ] `hello-module/components/AdminHelloModule.jsx`

**Páginas raíz y layouts**:
- [ ] `src/pages/WelcomePage.jsx`
- [ ] `src/pages/LoginPage.jsx`
- [ ] `src/layouts/ClientLayout.jsx`
- [ ] `src/layouts/AdminLayout.jsx`
- [ ] `src/layouts/PortalLayout.jsx`
- [ ] `src/components/common/MobileBottomNav.jsx` (componente nuevo,
      commit `5815370` — verifica que el propio rediseño de nav cumple las
      14 reglas, ya que se construyó en paralelo a esta auditoría)

## 4. Método de auditoría (dos niveles, ambos obligatorios)

1. **Auditoría de código (obligatoria, mínimo aceptable):** para cada
   archivo del checklist, revisa el JSX contra las 14 reglas de la sección
   5 — busca específicamente: anchos fijos en píxeles (`w-[...px]`,
   `style={{width:...}}`), alturas rígidas (`h-10`, `h-11` en elementos con
   texto variable), paddings estáticos elevados sin variante `sm:`/`md:`,
   tablas sin `overflow-x-auto`, texto largo sin `truncate`/`break-words`/
   `min-w-0`, `grid-cols-2` directo sin la utilidad responsiva.
2. **Verificación visual (si tienes herramienta de navegador/capturas
   disponible):** renderiza cada página en al menos 3 anchos de viewport
   (375px móvil, 768px tablet, 1280px escritorio) y confirma que no hay
   scroll horizontal ni elementos cortados/superpuestos. Si no tienes esta
   capacidad, dilo explícitamente en el traspaso como `RESULTADO INFORMADO
   NO REAUDITADO` para ese nivel — no finjas verificación visual que no
   hiciste.

## 5. Exclusiones explícitas

- No toques `Prototipe-CLI/templates/template-ventas/` ni
  `Instancias Clientes/ventas/ventas-moni-app/` — el fundador sincroniza él
  mismo desde el dashboard.
- No inventes reglas de diseño nuevas fuera de las 14 ya documentadas — si
  encuentras un caso que ninguna de las 14 cubre bien, etiqueta
  `DECISIÓN REQUERIDA` con tu propuesta, no la apliques unilateralmente.
- No toques lógica de negocio/datos — solo maquetación/responsividad.
- No hacer commit/push.

## 6. Criterios de cierre verificables por comando

Todos ejecutados dentro de `Plantillas Core/App Ventas/`:
1. Las ~30 casillas del checklist de la sección 3 quedan marcadas, cada una
   con una nota de una línea ("cumple" o "corregido: regla X").
2. `npx eslint .` → sin errores nuevos respecto a la línea base actual
   (compara contra `git show HEAD -- .` si necesitas confirmar la línea
   base).
3. `npm run build` → éxito, incluyendo el paso de `validate-core-integrity.js`
   del prebuild (Design Integrity Guard, sección 7 del mismo archivo de
   reglas) sin nuevas advertencias.
4. `npx vitest run` → mismo tally que la línea base actual (118 passed
   según la última verificación conocida) — sin regresión.

## 7. Loop de autocorrección (`AI_WORKFLOW.md` §7.2)

Implementa → corre TODOS los criterios de la sección 6 → si algo falla,
corrige y vuelve a correr TODOS → hasta 5 ciclos o `BLOQUEO`. Dado el
tamaño de esta tarea (~30 archivos), documenta el progreso por lotes en el
traspaso (qué archivos ya se auditaron en cada ciclo), no solo el
resultado final.

## 8. Etiquetado de evidencia (`AI_WORKFLOW.md` §7.1)

`HECHO VERIFICADO` / `RESULTADO INFORMADO NO REAUDITADO` / `INFERENCIA` /
`RIESGO` / `PROPUESTA` / `BLOQUEO` / `DECISIÓN REQUERIDA`.

## 9. Artefacto de salida obligatorio

`Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/traspasos/TRASPASO_CORE-365_2026-07-16.md`
con plantilla de `AI_WORKFLOW.md` §7.1 + sección "Reverificación rápida"
de §7.2. Incluye el checklist completo de la sección 3 con su estado final
por archivo (no solo un resumen agregado — quien retome debe poder ver
página por página qué se tocó y qué no). No marques
`tareas_pendientes.md`/`bitacora_cambios.md` como `VERIFIED_COMPLETE` —
deja `AWAITING_REVIEW`.

## 10. Si algo no está claro

Etiqueta `DECISIÓN REQUERIDA`, no inventes, detente ahí. Si tu sesión no
tiene capacidad de renderizar/capturar pantallas reales, dilo explícitamente
al inicio del traspaso (no al final) para que quien retome sepa qué nivel
de verificación falta reforzar.
