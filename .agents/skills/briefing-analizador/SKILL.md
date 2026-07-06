---
name: briefing-analizador
description: >-
  Analiza las respuestas de la sesión de descubrimiento del Briefing Studio,
  evalúa la viabilidad técnica contra la biblioteca de componentes y calcula
  la complejidad estimada del proyecto para guiar la inyección y el onboarding.
  Se activa con @briefing-analizador.
trigger: "@briefing-analizador"
aliases:
  - "@analizar-briefing"
  - "@analizar-descubrimiento"
---

# Skill: Briefing Analizador (Módulo de Preventa y Viabilidad)

Esta skill analiza los datos levantados durante la entrevista interactiva de 20 pasos en el **Briefing Studio** para estructurar la viabilidad técnica del proyecto del cliente contra el Core Ecosistema de PROTOTIPE.

---

## 📁 Variables del Entorno Portables

> **Variable `[BRIEFING_SESSION]`:** ID de la sesión de descubrimiento o ruta al archivo JSON exportado por el dashboard.
> **Variable `[PROYECTO_CLIENTE]`:** Nombre técnico asignado al cliente en el onboarding (ej. `ventas-smartfix`).

---

## ⚙️ Flujo Operativo de la Skill

Al activarse con el trigger `@briefing-analizador`, la IA debe realizar los siguientes pasos de forma estrictamente secuencial:

### Paso 1: Extracción y Parseo de Datos
1. Cargar el JSON de la sesión de descubrimiento (`briefings/[SESSION_ID]`) desde Firestore o el archivo local indicado en `[BRIEFING_SESSION]`.
2. Extraer las respuestas clave divididas en los dominios de:
   - **Rubro y Operación:** Tipos de producto, volumen de venta diario, personal de caja.
   - **Lógica e Integraciones:** Necesidad de créditos, facturación DIAN, mapas de reparto, operación offline.
   - **Identidad:** Paleta de colores HSL deseada, tipografías y metadatos SEO.

### Paso 2: Auditoría contra la Biblioteca de Componentes
1. Consultar la [Biblioteca de Componentes](file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/) para verificar qué porcentaje de la solución requerida por el cliente se encuentra resuelta por componentes atómicos o módulos del Core:
   - POS Express / Caja Diaria -> Mapear contra `POS_Express_Scanner` y `Caja_Diaria_POS`.
   - Créditos -> Mapear contra `Creditos_y_Saldos`.
   - Agenda / Citas -> Mapear contra `Reservas_Agenda_Citas`.
   - Facturación DIAN -> Mapear contra `Facturacion_y_Firma_Digital`.
   - Cocina / KDS -> Mapear contra `Pantalla_Cocina_KDS`.

2. Calcular el **Grado de Cobertura Ecosistema (GCE)**:
   $$\text{GCE} = \frac{\text{Componentes Reutilizados Disponibles}}{\text{Módulos Totales Requeridos}}$$
   - Si $\text{GCE} \ge 80\%$: El proyecto es altamente viable mediante inyección limpia y feature flags del Core.
   - Si $50\% \le \text{GCE} < 80\%$: Viabilidad media. Requiere parametrización y desarrollo de deltas adaptativos.
   - Si $\text{GCE} < 50\%$: Baja cobertura. Se sugiere estructurar un componente personalizado o refactorizar un módulo a la medida.

### Paso 3: Diagnóstico de Complejidad Funcional
1. Calcular el score total de complejidad del cliente asignando pesos a las respuestas técnicas:
   - **Baja Complejidad (0-20 pts):** Landing comercial / catálogo estático con envíos planos a WhatsApp.
   - **Media Complejidad (21-60 pts):** Catálogo interactivo + POS + Caja Diaria + Módulo de Créditos.
   - **Alta Complejidad (61-108 pts):** Multi-sede, facturación DIAN integrada, telemetría e integración de mapas/domicilios.
2. Emitir el veredicto de viabilidad técnica y clasificar el tipo de instancia a aprovisionar en el CLI (`template-ventas`, `template-servicios`, etc.).

---

## 📄 Formato del Reporte de Diagnóstico

La skill debe emitir el resultado en el siguiente formato markdown estructurado para ser visualizado en la pestaña de análisis del dashboard o guardado en Firestore:

```markdown
# ANÁLISIS DE VIABILIDAD TÉCNICA: [Nombre Cliente]
**Fecha:** [Timestamp] | **Sesión ID:** [SessionId]

## 📊 Métricas Core
- **Puntaje de Complejidad:** [Total Pts] / 108 pts
- **Nivel de Clasificación:** [Micro | Pequeño | Medio | Grande | Estratégico]
- **Grado de Cobertura Ecosistema:** [GCE]%

## 🧱 Componentes a Inyectar desde la Biblioteca
| Componente Reutilizable | Origen de Biblioteca | Rol en el Cliente |
| --- | --- | --- |
| [ej: CajaDiariaPOS] | `09_Modulos_Completos/Caja_Diaria_POS` | Control de arqueo diario de caja física |

## 🛠️ Desarrollo de Deltas Personalizados (Fuera de Core)
- [Listado de requerimientos no cubiertos por el catálogo que requerirán código ad-hoc]

## ⚙️ Propuesta de Instancia CLI
- **Plantilla Sugerida:** [template-ventas | template-servicios]
- **Feature Flags a Pre-configurar:**
  - `creditsEnabled`: [true | false]
  - `enableDianBilling`: [true | false]
  - `deliveryEnabled`: [true | false]
```
