# Instancias de Clientes (PROTOTIPE)

Este directorio organiza las aplicaciones de los clientes del ecosistema de acuerdo con su tipo de **Core** correspondiente.

## Convención de Estructura

```
Instancias Clientes/
├── [coreType]/
│   └── [nombre-de-instancia]/
└── README.md
```

### Ejemplos:
- `ventas/ventas-moni-app`: Instancia del core de Ventas y POS.
- `reservas/reservas-clinica-app` (Futuro): Instancia del core de Agenda y Reservas.

Esta convención permite escalar el ecosistema de forma ordenada sin colisión de nombres y facilitando la automatización de backups, diagnósticos e integraciones de IA.
