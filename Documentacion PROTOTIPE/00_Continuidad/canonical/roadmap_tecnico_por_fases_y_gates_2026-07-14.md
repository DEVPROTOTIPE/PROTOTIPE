# Roadmap técnico y empresarial por fases y gates

**Procedencia:** curado desde
`D:\RESPALDO_PROTOTIPE\Continuidad\2026-07-14\02_DOCUMENTOS_CENTRALES\12_ROADMAP_TECNICO_Y_EMPRESARIAL_ESCALABLE.md`
(auditoría externa, 2026-07-14). Traído a `Documentacion PROTOTIPE` el
2026-07-15 como corrección a `CORE-346`: ese cierre lo había marcado
"sustancialmente redundante" con
`Auditoria_Integral_y_Roadmap_PROTOTIPE_2026-07-13.md` sin verificar línea a
línea. Verificación real por `grep` (2026-07-15): el documento de auditoría
canónico **no** usa la estructura Fase 0-8/Gate 0-6 de este archivo, no
tiene la fórmula de precio de la sección 14, ni las tablas de KPIs de las
secciones 12-13 — cubre el mismo territorio estratégico (ICP, secuencia
contener→asegurar→probar upgrade→validar→escalar) con otra forma, no con
esta. Este documento es complementario, no un duplicado.

**No sustituye** `Auditoria_Integral_y_Roadmap_PROTOTIPE_2026-07-13.md`
(sigue siendo el documento canónico de diagnóstico y estrategia de negocio
más extenso) ni `Plan_Maestro_Estabilizacion_y_Migracion_Claude_Code_PROTOTIPE.md`
(que ya tiene Golden Tasks, rollback y Definition of Done propios). Aporta lo
que ninguno de los dos tiene: una secuencia de fases con **gates** (criterios
binarios de paso), tablas de KPI técnicos y de negocio, y la fórmula de
precio mínimo.

**Advertencia de vigencia (2026-07-15):** las fechas y horizontes de abajo
son los de la auditoría origen (14 de julio de 2026) y **no** se
actualizaron para reflejar que `CORE-341` a `CORE-347` ya ejecutaron buena
parte de la Fase 0 y del inicio de la Fase 1/2 (baseline de runtime, ADR de
arquitectura por capas, guard ESLint, migración de features, gobernanza
multiagente, reconciliación de continuidad). Usa este documento por su
**estructura de fases/gates**, no por sus fechas ni por el estado de avance
que describe — para eso, consulta `tareas_pendientes.md`.

---

## 1. Norte

Convertir PROTOTIPE de un ecosistema amplio y prometedor, pero inconsistente, en una empresa de software repetible que pueda:

1. vender una promesa específica;
2. desplegarla de forma segura;
3. medir valor y costos;
4. actualizar clientes sin forks;
5. soportarlos con margen;
6. expandirse solo después de demostrar repetibilidad.

Este roadmap es **gate-driven**. Las fechas son horizontes sugeridos, no autorizaciones para avanzar si el gate anterior falla.

## 2. Estrategia fundamental

```text
Contener
→ Reproducir
→ Asegurar
→ Unificar verdad
→ Probar upgrade
→ Operar dinero y datos
→ Validar un ICP
→ Repetir
→ Escalar
```

No se recomienda construir un marketplace, nuevas verticales o "50 componentes premium" durante las primeras fases.

## 3. Fase 0 — Preservación y baseline

**Horizonte sugerido:** primeros 2–4 días efectivos después de reinstalar.
**Objetivo:** saber exactamente qué se puede reconstruir sin memoria humana.

### Trabajo

- recuperar `D:` y cápsula;
- clonar los repositorios limpios;
- registrar refs/HEAD/remotos;
- fijar runtime;
- ejecutar instalación/pruebas/build baseline;
- conservar parches sin aplicarlos;
- rotar secretos expuestos.

### Gate 0

- cada unidad tiene origen y commit;
- working trees limpios o cambios clasificados;
- `npm ci` baseline documentado;
- secretos reales rotados;
- bitácora v3.6+ actualizada.

## 4. Fase 1 — Cierre P0

**Horizonte sugerido:** semanas 1–3.
**Objetivo:** eliminar caminos de toma de control, exposición y mutación sin autorización.

### Trabajo

- pruebas Emulator de ataques;
- bootstrap admin server-side;
- identidad real cliente/empleado;
- reglas deny-by-default;
- operador central por claims;
- retirar access token Google del browser;
- proteger Bridge;
- telemetría v2.

### Gate 1

- cero pruebas P0 rojas;
- cero secretos en HEAD;
- 100% de rutas mutables con capacidad;
- token inactivo se rechaza;
- no hay producción real desplegada con reglas antiguas.

### Decisión empresarial

Durante esta fase se puede hacer discovery y demostración con datos sintéticos. No se debe contratar un piloto que dependa de seguridad no cerrada.

## 5. Fase 2 — Reproducibilidad

**Horizonte sugerido:** semanas 2–5, parcialmente en paralelo después de cerrar secretos.
**Objetivo:** cada repo se construye igual en máquina limpia y CI.

### Trabajo

- reparar lock Moni;
- Dashboard autónomo;
- paths portables;
- runtime único;
- CI de Core, Moni, Dashboard, Functions y CLI;
- lint baseline;
- cobertura por riesgo;
- builds sin mutar fuente.

### Gate 2

`npm ci → lint/validate → test → rules → build` pasa en clones limpios y una falla deliberada rompe el pipeline.

## 6. Fase 3 — Producto canónico

**Horizonte sugerido:** semanas 4–8.
**Objetivo:** una única cadena explica qué es una feature, plantilla e instancia.

### Trabajo

- ADR monorepo/polyrepo;
- una plantilla ventas;
- schema de feature;
- reconciliador Knowledge/registry/físico/manifest/lock;
- plan Generator puro;
- apply staging/atomic;
- manifest de overrides;
- upgrade y rollback Moni.

### Gate 3

- mismo input genera mismo plan/hash;
- drift bloquea;
- Moni N→N+1 y rollback pasan dos veces;
- ninguna personalización válida se pierde;
- añadir una feature declarativa no requiere hardcode en Generator.

## 7. Fase 4 — Operación confiable

**Horizonte sugerido:** semanas 6–10.
**Objetivo:** poder cobrar y recuperar con evidencia.

### Trabajo

- ledger de billing;
- periodos y conciliación;
- decidir/retirar DIAN;
- backup/restore;
- observabilidad/SLO;
- incident response;
- offboarding;
- presupuesto Firestore por instancia.

### Gate 4

- comisión se reproduce desde ledger;
- cierre de periodo es idempotente;
- restore de prueba cumple RPO/RTO definidos;
- incidente sintético activa runbook;
- salida de cliente exporta/revoca/elimina según política.

## 8. Fase 5 — Oferta mínima y piloto

**Horizonte sugerido:** meses 3–4.
**Objetivo:** demostrar que un negocio paga y obtiene valor sin requerir un fork.

### ICP inicial recomendado

Un comercio minorista pequeño/mediano con:

- inventario manejable;
- pedidos por WhatsApp/QR/catálogo;
- dolor por desorden de stock/pedidos;
- dueño accesible;
- capacidad de decisión rápida;
- sin requerimiento DIAN dentro del alcance inicial;
- sin datos especialmente sensibles.

### Oferta mínima

- catálogo y pedidos;
- inventario;
- panel administrativo;
- notificaciones necesarias;
- onboarding y capacitación;
- soporte definido;
- backup/exportación definidos;
- una sola modalidad de cobro inicial fácil de conciliar.

### Piloto

Propuesta de objetivos, explícitamente sujetos a discovery:

- una instancia canaria;
- 4–8 semanas de observación;
- baseline antes del go-live;
- activación en una semana acordada;
- reducción medible de pedidos perdidos/tiempo de registro o diferencia de inventario;
- soporte e incidentes registrados;
- aceptación firmada.

### Gate 5

- cliente usa el flujo principal semanalmente;
- valor acordado mejora frente al baseline;
- no hay P0/P1 abiertos en su alcance;
- costo de soporte e infraestructura cabe en el precio;
- el cliente acepta continuar/pagar;
- aprendizaje se generaliza al ICP.

## 9. Fase 6 — Repetibilidad

**Horizonte sugerido:** meses 4–8.
**Objetivo:** demostrar que el segundo y tercer cliente cuestan menos de implementar y no generan forks.

### Trabajo

- onboarding estandarizado;
- templates y configuración, no edición manual;
- CRM con etapas/owners;
- customer health;
- soporte por severidad;
- QBR/renovación;
- base de conocimiento;
- métricas de cohortes.

### Meta propuesta

Alcanzar tres clientes pagos del mismo ICP antes de abrir otra vertical. No es una garantía financiera; es un umbral de aprendizaje.

### Gate 6

- tres clientes en misma rama de producto;
- cero forks no declarados;
- tiempo de onboarding decrece por cohorte;
- margen bruto positivo por cliente;
- churn y soporte tienen causa conocida;
- upgrades canarios funcionan.

## 10. Fase 7 — Escala controlada

**Horizonte sugerido:** meses 8–12.
**Objetivo:** crecer sin que el fundador sea el único operador.

### Trabajo

- automatizar provisión con gates;
- self-service solo de configuración segura;
- panel de health y costos;
- alertas y runbooks;
- roles de soporte/operación;
- marketing de caso real;
- canal de referidos/partners pequeño;
- SLO y capacidad.

### Meta propuesta

Llegar a una cohorte de 8–12 clientes del mismo producto solo si los gates de soporte, margen y upgrade permanecen verdes.

## 11. Fase 8 — Expansión

**Horizonte sugerido:** meses 12–24.
**Objetivo:** expandir capacidad o vertical sobre una plataforma estable.

Orden recomendado:

1. nuevas features para el mismo ICP;
2. paquete/plan superior;
3. integración fiscal mediante proveedor;
4. segundo ICP adyacente;
5. marketplace controlado solo cuando contrato de feature sea maduro.

No abrir un segundo vertical si el primero aún necesita forks manuales o no tiene retención.

## 12. KPIs técnicos

| KPI | Definición |
|---|---|
| Lead time | merge aprobado → producción canaria |
| Change failure rate | promociones con rollback/incidente |
| MTTR | detección → restauración |
| Upgrade success | instancias actualizadas sin intervención/fallo |
| Drift rate | instancias con diferencias no clasificadas |
| CI reliability | ejecuciones reproducibles/no flaky |
| Security gate | P0/P1 abiertos por release |
| Restore success | simulacros restaurados/intentados |
| Cost per tenant | cloud + observabilidad + backup por cliente |

## 13. KPIs de producto y negocio

| KPI | Definición |
|---|---|
| Time to value | contrato/go-live → primer resultado valioso |
| Activation | cliente completa journey principal y configuración mínima |
| Weekly meaningful use | semanas con pedidos/inventario/flujo objetivo |
| Support load | horas/tickets por cliente y causa |
| Gross margin | ingreso menos cloud, soporte y costos variables directos |
| Logo churn | clientes perdidos / clientes iniciales del periodo |
| Revenue retention | ingreso retenido/expandido de cohorte |
| Pipeline conversion | lead→discovery→proposal→close |
| Sales cycle | primer contacto → firma |
| CAC payback | adquisición / margen bruto mensual |
| Customer health | uso + valor + soporte + pago + riesgo |

## 14. Modelo de precios

No fijar un precio únicamente desde competidores. Calcular:

```text
Costo mensual directo = cloud + backups + mensajería + soporte + pagos + IA operativa
Costo setup = discovery + configuración + migración + capacitación + contingencia
Precio mínimo = costo / (1 - margen objetivo)
```

### Recomendación inicial

- setup suficiente para no financiar implantación con caja futura;
- mensualidad fija que cubra operación;
- límites de uso y soporte claros;
- comisión solo si el ledger está listo y aporta valor compartido;
- cambios fuera de alcance cotizados;
- descuento a design partner a cambio de evidencia/caso, no trabajo gratis indefinido.

## 15. Estrategia comercial paso a paso

1. Elegir una lista de 20–30 negocios del ICP, no campañas masivas.
2. Realizar discovery centrado en proceso y costo del problema.
3. Registrar estado actual y métrica baseline.
4. Calificar dolor, autoridad, presupuesto y urgencia.
5. Demostrar un journey, no todo el ecosistema.
6. Propuesta con alcance/gates/exclusiones.
7. Piloto pago o design partnership con obligaciones mutuas.
8. Onboarding y go-live con aceptación.
9. Revisión semanal inicial y medición.
10. Caso de éxito solo con autorización y evidencia.
11. Repetir en el mismo ICP.

## 16. Contratación futura

No contratar por organigrama aspiracional. Contratar al aparecer un cuello medido:

- soporte/QA cuando soporte consume capacidad de producto de forma sostenida;
- especialista Firebase/security antes de escalar datos reales si no se cubre internamente;
- ventas cuando el founder-led sales ya demuestra conversión repetible;
- customer success cuando cohortes requieren onboarding/renovación sistemáticos;
- contabilidad/legal desde el primer contrato real, como servicio profesional si conviene.

## 17. Cadencia del fundador

Durante estabilización:

- 50% seguridad/reproducibilidad/verdad;
- 20% discovery con ICP;
- 15% operación/documentación;
- 10% producto esencial;
- 5% exploración.

Después del piloto, mover gradualmente tiempo hacia venta, onboarding y retención. Los porcentajes son una propuesta de enfoque, no métricas históricas.

## 18. Criterios de no avance

Detener expansión si ocurre cualquiera:

- P0 abierto;
- restore no probado;
- Moni no actualizable;
- margen desconocido o negativo;
- soporte crece más rápido que clientes;
- cada cliente exige fork;
- claims contractuales no verificables;
- IA es necesaria para recordar cómo funciona el sistema.

## 19. Resultado esperado a 24 meses

Una empresa sana no se define por cantidad de módulos, sino por:

- producto estable para uno o dos ICPs;
- clientes que reciben valor medible;
- ingresos recurrentes con margen;
- onboarding, upgrade, soporte y salida reproducibles;
- seguridad/privacidad demostrables;
- Knowledge Layer que acelera features sin hardcode;
- equipo que opera sin depender de la memoria exclusiva del fundador.
