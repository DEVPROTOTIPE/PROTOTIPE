# Protocolo de Colaboración IA y Decisiones de Componentes

Este conjunto de reglas rige el proceso de interacción colaborativa y la toma de decisiones para inyectar, crear o proponer la extracción de componentes en el ecosistema PROTOTIPE.

## 1. DISPARADOR OBLIGATORIO DE COLABORACIÓN IA (`@colaborar`)

1. **Activación:** Siempre que el usuario escriba la palabra **`@colaborar`** en su mensaje, la IA debe interrumpir cualquier cambio físico de código y preparar de inmediato el **Context Pack** estructurado.
2. **Formato:** El Context Pack debe encapsularse entre delimitadores claros (`===== BEGIN CONTEXT PACK [id] =====` y `===== END CONTEXT PACK [id] =====`) para que el usuario pueda copiarlo directamente al LLM externo (Claude, DeepSeek, GPT, Gemini).
3. **Filtro Crítico de Sugerencias:** Al recibir el feedback del LLM externo, la IA debe contrastarlo contra los archivos locales antes de codificar, documentando la clasificación de decisiones (Aceptada/Adaptada/Rechazada).

---

## 2. PROTOCOLO DE TOMA DE DECISIONES DE COMPONENTES (HÍBRIDO - PROACTIVO)

Para mantener la biblioteca de componentes como un ecosistema en constante crecimiento y evitar redundancia o spaghetti code, la IA debe seguir estrictamente este flujo de decisión ante cada requerimiento de UI:

1. **Fase de Descubrimiento (Mapeo):**
   * Antes de codificar cualquier vista o formulario del cliente, la IA debe consultar de forma obligatoria el listado de `06_Biblioteca_Componentes` y el `mapa_aplicacion.md`.
   * Si el componente ya existe en el core, la IA ejecutará la inyección mediante la skill `portar-componente`.

2. **Fase de Programación de Deltas:**
   * Si no existe un componente base adecuado, la IA lo desarrollará localmente dentro del proyecto cliente en `src/components/common/` o en su feature correspondiente.
   * La programación debe acatar rigurosamente todas las restricciones críticas de la sección **`ESTÁNDAR DE DESIGN INTEGRITY GUARD`** (HSL semántico, sin píxeles rígidos, responsividad responsiva mobile-first, sin colores hardcodeados).

3. **Fase de Retorno al Core (Proactividad de Extracción):**
   * Al finalizar un delta personalizado, la IA debe evaluar con ojo clínico si el componente cumple con: (a) Lógica desacoplada de variables quemadas del cliente, (b) Utilidad potencial en al menos 2 verticales de las 23 oficiales del ecosistema.
   * Si cumple con estos criterios de reutilización, la IA **DEBE proponer de manera 100% autónoma y proactiva** su extracción en el cierre de su respuesta mediante el siguiente bloque descriptivo:
     ```markdown
     💡 [PROPUESTA DE EXTRACTOR]: He detectado que el componente '[NombreComponente]' es genérico e independiente del dominio. Te sugiero ejecutar la skill '@extraer-componente' en el siguiente turno para catalogarlo en la biblioteca y habilitar su inyección automática en el CLI.
     ```
   * Si el usuario confirma o escribe la palabra clave `@extraer-componente`, la IA activará de inmediato la skill correspondiente.
