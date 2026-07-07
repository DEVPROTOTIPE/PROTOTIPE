# Propuesta de Rediseño de Experiencia de Usuario y Nuevas Funcionalidades para la Biblioteca (CORE-120)

Esta propuesta detalla mejoras estéticas y lógicas en la interfaz de la **Biblioteca de Componentes y Módulos** en el Dashboard Central, y define nuevas funcionalidades de gran valor para la agilidad en el desarrollo de instancias bajo el ecosistema de **PROTOTIPE**.

---

## 1. Rediseño Visual y UX (Mejora de Filtrado y Búsqueda)

Buscamos simplificar y embellecer la interfaz para que localizar, comparar e inyectar un componente requiera la menor cantidad de clics posible, manteniendo un aspecto ultra-premium y limpio.

### A. Estructura de Tres Columnas (Sticky Workspace Layout)
Para pantallas anchas, la interfaz se organizará en tres columnas fijas para evitar scroll vertical excesivo de la página entera:

```
+-------------------+-----------------------------------+------------------------------------+
| COLUMNA 1: FILTROS| COLUMNA 2: GRID DE COMPONENTES    | COLUMNA 3: ÁREA DE TRABAJO DETAIL  |
| - Buscador Global | - Cards visuales de componentes  | - Detalle (Documentación / JSX)    |
| - Filtro de Tipos | - Badges dinámicos (NPM, Hooks)   | - Sandbox interactivo en vivo      |
| - Nube de Tags    | - Estado de inyección y sandbox   | - Selector de Auto-Inyección       |
+-------------------+-----------------------------------+------------------------------------+
```

*   **Buscador Estilo Command-Palette:** Un buscador unificado con desenfoque de fondo (*backdrop-blur*) y atajo de teclado físico (ej. pulsar `/` enfoca el input) con autocompletado en tiempo real.
*   **Filtros Rápidos Horizontales:** Píldoras interactivas basadas en gradientes HSL para segmentar el catálogo al instante:
    `[ Todos ]` `[ 🧩 Componentes UI ]` `[ 🪝 Hooks Personalizados ]` `[ ⚙️ Servicios ]` `[ 📦 Módulos Completos ]`
*   **Nube de Etiquetas (Tag Cloud) en Barra Lateral:** Un panel retráctil o sidebar izquierdo que agrupa los tags más usados (ej. `Firebase`, `Animación`, `PDF`) permitiendo filtrados cruzados con estados activos/inactivos muy limpios.

### B. Tarjetas de Componentes Ultra-Premium (Component Grid Cards)
En lugar de una lista plana o acordeón de texto, cada componente se mostrará como una tarjeta interactiva con:
*   **Indicador de Tipo:** Icono visual del tipo de recurso (ej. un gancho para hooks, una caja para módulos).
*   **Indicadores de Estado:** Pequeñas píldoras cromáticas que informan si el componente cuenta con Sandbox verificado (`LIVE`) o si ya está inyectado en el cliente seleccionado actualmente.
*   **Acciones Rápidas en Hover:** Al pasar el cursor sobre la tarjeta, se revelarán sutiles botones de acción rápida: Ver Código, Ejecutar Sandbox, o Abrir Inyector.

---

## 2. Nuevas Funcionalidades Propuestas para el Ecosistema

Teniendo en cuenta que PROTOTIPE opera clonando y personalizando plantillas core para instancias de clientes locales, proponemos añadir las siguientes funciones integradas en el flujo de la biblioteca:

### A. Visor de Diferencias (Code Diff Viewer) antes de Sobrescribir
*   **Propósito:** Si el desarrollador intenta inyectar un componente que ya existe en el cliente de destino, el sistema no sobrescribirá a ciegas ni dará una advertencia estática.
*   **Detalle:** El Dashboard renderizará un **comparador de código en pantalla dividida** (*split diff viewer*) mostrando las diferencias de líneas entre el componente de la biblioteca (izquierda) y el archivo local del cliente (derecha). Esto permite validar cambios manuales o adaptaciones hechas por el cliente antes de consolidar.

### B. Selector de Módulos con Dependencias Opcionales
*   **Propósito:** Dar flexibilidad al inyectar módulos grandes (como un POS o cocina KDS) que contienen sub-características que no todos los clientes necesitan.
*   **Detalle:** En el manifiesto JSON del Markdown se listarán dependencias opcionales:
    ```json
    "optional": [
      { "name": "WhatsAppReceipt", "link": "...", "description": "Envío de comprobantes por WhatsApp" }
    ]
  ```
    Al inyectar, la interfaz presentará interruptores (*toggles*) para que el usuario elija qué dependencias opcionales inyectar, optimizando el tamaño del código final.

### C. Mapeador Cromático HSL en Tiempo Real (Brand Color Live Preview)
*   **Propósito:** Previsualizar cómo se adaptará el componente visual a la paleta de colores de marca del cliente destino antes de escribirlo.
*   **Detalle:** Dado que el cliente tiene configurados sus colores en las variables CSS, el visor de la biblioteca puede renderizar el componente simulando los tokens HSL del cliente elegido, permitiendo al desarrollador verificar contrastes y consistencia visual en un instante.
