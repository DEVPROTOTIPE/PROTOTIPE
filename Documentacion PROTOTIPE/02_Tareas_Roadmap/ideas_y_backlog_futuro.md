# 💡 Buzón de Ideas y Notas del Backlog Futuro

Este archivo sirve como repositorio central de ideas de diseño, flujos operativos sugeridos, integraciones comerciales futuras y propuestas tecnológicas que no forman parte del sprint activo pero que se reservan para su evaluación y planificación en fases posteriores de PROTOTIPE.

---

## 📈 Idea 1: Auditoría Analítica de Deuda Técnica con NotebookLM (Tabla de Datos)

### Propósito
Automatizar la detección de deuda técnica en la inyección de componentes y consistencia de compilaciones sin escribir herramientas complejas de analítica.

### Flujo Operativo Sugerido
1.  **Origen de Datos:** Utilizar el log `.prototipe-audit-trail.jsonl` generado automáticamente en la raíz de los proyectos clientes (`App Ventas`, etc.) tras realizar inyecciones.
2.  **Carga a NotebookLM:** Subir este archivo como fuente en el Workspace de NotebookLM.
3.  **Prompt de Análisis de Tabla de Datos:**
    ```text
    Actúa como un Analista de Datos de Software Senior. Ejecuta un script en Python dentro de tu entorno para procesar los datos de auditoría de inyecciones y compilaciones provistos en el archivo cargado.

    Calcula y presenta de forma resumida en una tabla:
    1. El Consistency Score promedio de las inyecciones.
    2. Identifica los 3 componentes específicos que registran la mayor cantidad de fallos de compilación local ("buildAudit=false" o "buildFailed=true").
    3. Identifica los 3 componentes con mayor "NPM drift" (desviación o discrepancia de dependencias instaladas en los clientes vs la plantilla Core).

    Muestra el código de análisis utilizado y genera una conclusión clave sobre la salud del código de nuestra biblioteca.
    ```
4.  **Objetivo:** Usar el reporte final para dictaminar qué componentes del catálogo necesitan refactorizaciones prioritarias o están desalineados con las dependencias del Core.

---

## 💳 Idea 2: Integración de Portal B2C - Consolidación de Abonos de Créditos en Firestore

### Propósito
Conectar la pasarela de pagos simulada del portal de clientes final (B2C) con el motor transaccional real para consolidar abonos directos.

### Flujo Operativo Sugerido
*   **Origen:** El usuario realiza un pago/abono en la vista interactiva `ClientCredits.jsx`.
*   **Destino:** En lugar de una simulación puramente en el estado local de React, registrar el abono en tiempo real bajo la colección física de auditoría `/credits/{id}/pagos` de Firestore.
*   **Variables de Control:** Validar el saldo insoluto del crédito y recalcular automáticamente el estatus del crédito (Vigente, Pagado o En Mora) usando la lógica de persistencia del lado del cliente.
