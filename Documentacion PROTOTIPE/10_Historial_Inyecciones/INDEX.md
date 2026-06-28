# 🗂️ Índice de Historiales de Inyección — Prototipe

> Generado automáticamente por Prototipe CLI — CORE-127  
> **NO modificar manualmente.** Este archivo es actualizado por el servidor cada vez que se realiza una inyección, rollback o auto-rollback.

## Propósito

Este directorio contiene el **historial inmutable de todas las operaciones** realizadas con el sistema de inyección de componentes y módulos de la Biblioteca Prototipe hacia proyectos cliente.

## Estructura

```
10_Historial_Inyecciones/
├── INDEX.md                    ← Este archivo (índice global de clientes)
├── historial_<clientId>.md     ← Historial de inyecciones por cliente (auto-generado)
└── .prototipe-audit-trail.jsonl  ← En el directorio del proyecto cliente
```

## Fuente de datos

Los datos se persisten en **dos capas complementarias**:

| Capa | Archivo | Ubicación | Propósito |
|---|---|---|---|
| Primaria (máquina) | `.prototipe-audit-trail.jsonl` | Directorio del proyecto cliente | Append-only, consumido por API `/audit-trail` |
| Secundaria (humana) | `historial_<clientId>.md` | Esta carpeta | Legible por IA y humanos, trazabilidad narrativa |

## Semántica de operaciones auditadas

| Operación | Disparador | Estado posible |
|---|---|---|
| `inject` | Inyección exitosa vía `/inject/stream` | `success` |
| `auto-rollback` | Fallo durante inyección con reversión automática | `error` |
| `rollback` | Rollback manual vía `/inject/rollback` | `success` |

---

## Clientes registrados

| Cliente | Última Operación | Timestamp | Estado |
|---|---|---|---|
