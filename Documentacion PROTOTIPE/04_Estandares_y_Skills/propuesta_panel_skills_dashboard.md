# Propuesta Técnica: Integración de Habilidades (Skills) en la Central de Control PROTOTIPE (Flujo Híbrido)

Tras evaluar críticamente las limitaciones de infraestructura y dependencias de red en el servidor CLI local (`server.js`), se ha determinado que el enfoque más robusto, libre de fallos y de menor coste de mantenimiento para ejecutar las habilidades lógicas es el **Flujo Híbrido mediante Comandos Rápidos**. 

Este diseño técnico desacopla la lógica cognitiva de la interfaz gráfica, manteniendo el procesamiento inteligente en el chat de Antigravity y la visualización interactiva en el Dashboard Central.

---

## 1. Módulos y Arquitectura de las Habilidades en la UI

### A. Diagnóstico y Salud del Catálogo (1-Clic Local Determinista)
Estas herramientas no requieren procesamiento de inteligencia artificial y se ejecutan directamente en el servidor CLI local:

*   **Monitor de Integridad en Vivo:** Pestaña en el Dashboard que ejecuta `verify_library_integrity.cjs` y muestra una lista interactiva de errores (manifiestos JSON rotos, dependencias internas con enlaces inexistentes o sandboxes huérfanos).
*   **Gestor del Roadmap de Markdown:** Interfaz que lee y parsea `tareas_pendientes.md` para mostrar las tareas en pantalla. Al alternar el estado en la interfaz, el CLI escribe directamente los cambios de checkbox (`[ ]` / `[x]`) en el archivo físico, eliminando bases de datos intermedias.

---

### B. Creación y Extracción de Componentes (Flujo Híbrido de Copiar y Pegar)
Para las habilidades que requieren razonamiento de código (`component_extractor` y `component_creator`), el Dashboard actuará como un generador de comandos estructurados:

#### 1. Asistente Visual de Extracción de Componentes (`component_extractor`)
1.  **Selección Visual:** El desarrollador navega por los archivos de una aplicación cliente activa en el Dashboard y selecciona el archivo JSX a extraer (ej. `SwipeableCard.jsx`).
2.  **Configurador de Comando:** El Dashboard le permite al desarrollador ingresar especificaciones adicionales mediante un selector rápido (ej. si requiere adaptaciones particulares de Tailwind o Firebase).
3.  **Generación de Comando de IA:** La interfaz genera un bloque de comando optimizado y estructurado listo para copiar en un clic:
    *   *Ejemplo de comando generado:* `@extraer-componente "src/components/common/SwipeableCard.jsx" [especificaciones_del_usuario]`
4.  **Procesamiento:** El desarrollador pega el comando en el chat. Antigravity procesa el código en segundo plano con las herramientas locales, limpia credenciales, parametriza los colores HSL y escribe la ficha técnica `.md` y el Sandbox de prueba en el disco.
5.  **Refresco en Vivo:** Al regresar al Dashboard, este detecta automáticamente los nuevos archivos creados en el disco y actualiza la lista del catálogo y el visor de playgrounds al instante.

#### 2. Creador de Componentes por Requerimientos (`component_creator`)
1.  **Formulario de Scaffolding:** En la sección de la biblioteca, el desarrollador rellena un formulario básico indicando la categoría del componente y describe en lenguaje natural su funcionalidad.
2.  **Copia de Comando:** El Dashboard genera el comando estructurado:
    *   *Ejemplo de comando generado:* `@crear-componente "Formularios_y_UI" "ContadorStock" "Un contador con efecto pulsante en HSL"`
3.  **Procesamiento y Renderizado:** El desarrollador pega el comando en el chat. Antigravity genera la documentación y el Sandbox en caliente. Al instante, el componente aparece renderizado e interactivo en la pestaña de Playgrounds del Dashboard.

---

## 2. Ventajas del Enfoque Híbrido
*   **Cero Dependencias de Red en el CLI:** El backend local no requiere paquetes pesados de modelos de lenguaje ni credenciales de API (`GEMINI_API_KEY`) para funcionar, eliminando posibles fallos por desconexión o expiración de llaves.
*   **Fidelidad Absoluta de la IA:** El procesamiento cognitivo de código se realiza en el canal nativo del chat de Antigravity, garantizando el cumplimiento estricto de las directrices y estándares de diseño.
*   **Reactividad Local:** El dashboard utiliza los sistemas de detección de cambios de archivos de Node (`chokidar` o similares en el CLI) para actualizar la interfaz web inmediatamente en cuanto los archivos son creados o modificados en el disco.
