# 🚨 Protocolo de Reversión y Rollback Seguro para IA (Ecosistema PROTOTIPE)

Este documento establece el árbol de decisión cognitivo, los límites de seguridad y las directivas procedimentales para agentes de Inteligencia Artificial al momento de enfrentar fallos recurrentes de compilación o inyección en el monorepo.

> [!IMPORTANT]
> **PROHIBICIÓN ABSOLUTA DE RESTAURACIÓN DESATENDIDA (Regla AGENTS.md)**
> Queda estrictamente prohibido a la IA realizar cualquier tipo de restauración de archivos, descarte de cambios en el directorio de trabajo, o reversión de código (incluyendo de forma enunciativa pero no limitativa: `git restore`, `git checkout --`, `git reset --hard`, `git clean`) de forma autónoma sin confirmación explícita previa y por escrito del usuario en el chat.

---

## 🧠 1. Árbol de Decisión Cognitiva

Cuando la IA realiza un cambio de código y ejecuta el protocolo de compilación (`cmd /c npm run build`), si el compilador devuelve errores, se debe seguir estrictamente este flujo de tolerancia a fallos:

```mermaid
flowchart TD
    A["❌ Error de Compilación Detectado"] --> B{"¿Es el primer o segundo intento?"}
    B -->|Sí| C["🔍 Analizar logs de error (linter, imports, variables)"]
    C --> D["🛠️ Aplicar Fix local e intentar compilar de nuevo"]
    B -->|No (Intento 3+ fallido)| E["⚠️ Alerta de Bucle Iterativo Roto"]
    E --> F["🛑 DETENER todas las llamadas a herramientas de modificación"]
    F --> G["💬 Generar Propuesta de Rollback en el chat al usuario"]
    G --> H{"¿El usuario aprueba la reversión?"}
    H -->|No| I["👤 Esperar instrucciones manuales del usuario"]
    H -->|Sí| J["🚀 Ejecutar Rollback Autorizado (Git / API / Físico)"]
    J --> K["✓ Entorno Restablecido a Estado Estable"]
```

---

## 💬 2. Plantilla de Solicitud de Aprobación de Rollback

Si la IA alcanza el **Tercer Intento Fallido de Fix** y el compilador sigue arrojando fallos que comprometen la estabilidad del entorno de desarrollo, la IA debe emitir de inmediato un mensaje en el chat estructurado bajo la siguiente plantilla de advertencia:

```
> [!WARNING]
> ### 🛑 BUCLE DE COMPILACIÓN DETECTADO (ROLLBACK RECOMENDADO)
> He intentado resolver la falla de compilación en 3 ocasiones sin éxito. Para evitar la propagación de código corrupto o inyecciones rotas en el monorepo, solicito tu autorización para realizar un rollback inmediato de los archivos modificados.
>
> **Archivos a restaurar:**
> - `[Ruta del Archivo 1]` (se descartarán los cambios del turno)
> - `[Ruta del Archivo 2]`
>
> **Causa Raíz del Fallo:**
> `[Breve snippet del log del compilador/linter]`
>
> **Comando de Rescate sugerido:**
> `[Especificar comando a ejecutar, ej: git restore o POST /api/library/inject/rollback]`
>
> **¿Deseas proceder con el Rollback? Por favor responde "Sí" para autorizar la ejecución.**
```

---

## 🛠️ 3. Comandos de Rescate Autorizados

Una vez que el usuario escribe **"Sí"** o confirma explícitamente en el chat, la IA está facultada para ejecutar exclusivamente uno de los siguientes procedimientos de reversión según corresponda:

### Escenario A: Inyección de Componentes de la Biblioteca Rota
Si el fallo se produjo tras portar un componente usando la API Bridge:
*   **Acción:** Realizar una llamada HTTP `POST` al endpoint de rollback de la API Bridge:
    *   **Endpoint:** `/api/library/inject/rollback`
    *   **Payload:** `{ "clientId": "[id-cliente]", "componentName": "[NombreComponente]" }`
*   **Efecto:** La API Bridge restaurará los archivos originales desde `.temp_backup_sync` y eliminará físicamente del disco del cliente cualquier archivo nuevo inyectado que no existiera antes, restableciendo el checksum original.

### Escenario B: Cambios de Código Manuales en el Core o Instancias
Si el fallo se produjo tras refactorizaciones manuales de código o modificaciones directas:
*   **Acción:** Ejecutar comandos de restauración selectiva a nivel de Git:
    *   `git -C "d:\PROTOTIPE" restore [ruta_relativa_del_archivo]`
*   *Nota:* No uses `git reset --hard` ni `git clean` a menos que sea la única alternativa y el usuario lo haya ordenado con esas palabras textuales.

---

## 📝 4. Registro Post-Rollback

Tras una reversión exitosa, la IA debe documentar el evento:
1.  Actualizar la bitácora física `bitacora_cambios.md` registrando la tarea activa con el sufijo `[ROLLBACK]`.
2.  Dejar el estatus del Roadmap `tareas_pendientes.md` como `[ ]` (pendiente) o `[x] ~~[FALLIDO/REVERTIDO]~~` según indique el programador.
3.  Reportar el estado limpio del área de trabajo al usuario en el chat.
