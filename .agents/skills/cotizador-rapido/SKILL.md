---
name: cotizador-rapido
description: >-
  Automatiza la generación de propuestas económicas y cotizaciones comerciales
  basándose en el puntaje de complejidad y la matriz de precios oficial del
  ecosistema PROTOTIPE. Se activa con @cotizador-rapido.
trigger: "@cotizador-rapido"
aliases:
  - "@cotizar-proyecto"
  - "@generar-cotizacion"
---

# Skill: Cotizador Rápido (Cálculo de Tarifas y Propuestas)

Esta skill permite a la IA automatizar el cálculo comisional y de implementación (Setup inicial y SaaS mensual) para prospectos del ecosistema PROTOTIPE en base a la matriz de precios oficial registrada en Firestore.

---

## 📁 Variables del Entorno Portables

> **Variable `[PUNTAJE_COMPLEJIDAD]`:** Score de complejidad del proyecto obtenido del Briefing Studio (0-108 pts).
> **Variable `[FACTOR_AJUSTE]`:** Porcentaje de markup o descuento a aplicar (-30% a +50%).

---

## ⚙️ Flujo Operativo de la Skill

Al activarse con el trigger `@cotizador-rapido`, la IA debe realizar los siguientes pasos de forma estrictamente secuencial:

### Paso 1: Clasificación de Nivel en la Matriz
1. Consultar la matriz de precios configurada localmente o en la colección `dashboard_config/pricing_matrix`:
   - **Micro (0-20 pts):** Setup: \$500k - \$1.5M | Mensual: \$50k | Comisión: 1.0%
   - **Pequeño (21-40 pts):** Setup: \$1.5M - \$4.0M | Mensual: \$100k | Comisión: 1.5%
   - **Medio (41-60 pts):** Setup: \$3.5M - \$7.0M | Mensual: \$180k | Comisión: 2.0%
   - **Grande (61-80 pts):** Setup: \$6.0M - \$12.0M | Mensual: \$300k | Comisión: 2.5%
   - **Estratégico (81-108 pts):** Setup: \$10.0M - \$25.0M | Mensual: \$500k | Comisión: 3.5%

2. Identificar la fila correspondiente al valor de `[PUNTAJE_COMPLEJIDAD]`.

### Paso 2: Aplicación del Factor de Ajuste
1. Calcular el valor de Setup base aplicando el `[FACTOR_AJUSTE]`:
   $$\text{Setup Final} = \text{Setup Base} \times \left(1 + \frac{\text{Factor Ajuste}}{100}\right)$$
2. Calcular la mensualidad y tasa de comisión. Si el usuario ingresa valores manuales (overrides) en el trigger, priorizar esos valores.

### Paso 3: Generación de la Propuesta Formal
1. Redactar una propuesta comercial estructurada y profesional en español utilizando un tono ejecutivo de consultoría tecnológica de alto valor.

---

## 📄 Formato de la Propuesta Comercial

La propuesta comercial generada debe seguir esta plantilla markdown exacta:

```markdown
# PROPUESTA COMERCIAL: [Nombre del Cliente]
**Fecha:** [Fecha Actual] | **Vigencia:** 30 días calendario

---

## 🎯 Objetivos del Proyecto
[Breve descripción de cómo el ecosistema PROTOTIPE digitalizará y resolverá los dolores operativos clave levantados en el briefing]

## 🛠️ Alcance de Módulos a Implementar
- [Módulo 1]: [Detalle funcional]
- [Módulo 2]: [Detalle funcional]

## 💰 Resumen de Propuesta Económica

| Concepto | Inversión / Tarifa | Notas |
| --- | --- | --- |
| **Setup de Implementación** | $[Valor Setup] COP | Pago único (50% anticipo, 50% entrega) |
| **SaaS de Soporte y Licencia** | $[Valor Mensual] COP / mes | Soporte prioritario y actualizaciones core |
| **Comisión por Transacción** | [Valor Comisión]% | Sobre transacciones comerciales procesadas |

## 🚀 Cronograma Estimado de Entrega
- **Fase 1 (Aprovisionamiento e Inyección):** 2 días hábiles.
- **Fase 2 (Configuración de Marca y Carga de Datos):** 3 días hábiles.
- **Fase 3 (Pruebas E2E y QA de Integridad):** 1 día hábil.
- **Fase 4 (Despliegue a Producción y Capacitación):** 1 día hábil.
```
