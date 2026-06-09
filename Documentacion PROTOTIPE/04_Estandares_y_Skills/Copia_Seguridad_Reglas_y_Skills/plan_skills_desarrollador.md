# 🛠️ Plan de Creación de Habilidades de Agente (Agent Skills)

Este plan detalla las habilidades personalizadas (Agent Skills) propuestas para potenciar el desarrollo local, simulación de datos, integridad de código y portabilidad de componentes en el ecosistema **App Ventas**.

---

## 📋 Habilidades Definitivas

### 1. `db-seeder` (Sembrador de Datos Ecosistema)
* **Objetivo**: Poblar colecciones de Firestore con un solo comando utilizando datos coherentes y realistas para simular escenarios de producción en caliente.
* **Campos Clave a Poblar**:
  * `/products`: Productos con variantes de color, tallas, imágenes y stocks diferenciados.
  * `/credits`: Deudas activas y saldos para probar la pestaña de créditos.
  * `/orders`: Historial de ventas para pruebas de analíticas y reportes de comisiones mensuales.

### 2. `integrity-compiler` (Automatización `@postchange`)
* **Objetivo**: Automatizar y forzar la ejecución secuencial del protocolo de integridad física y documental inmediatamente después de cada cambio de código.
* **Flujo**:
  1. Ejecuta la compilación local (`cmd /c npm run build`) para verificar la ausencia de errores estáticos.
  2. Valida la sintaxis y estructura de `firestore.rules`.
  3. Actualiza cronológicamente `bitacora_cambios.md` registrando la causa raíz y solución técnica.
  4. Sincroniza `mapa_aplicacion.md` si hubo cambios en la estructura física del disco.
  5. Actualiza y tacha las tareas completadas en `tareas_pendientes.md` con su historial respectivo.

### 3. `component-extractor` (Extractor de Componentes y Funciones)
* **Objetivo**: Extraer de forma autónoma componentes visuales completos (UI) y funciones lógicas reutilizables (hooks/servicios) de la base de código para modularizarlos y documentarlos en la Biblioteca de Componentes del proyecto bajo el estándar de portabilidad.
* **Acciones**:
  1. Auditar el código fuente para extraer la lógica funcional completa sin omitir subcomponentes ni dependencias.
  2. Refactorizar eliminando rutas fijas de Firestore e inyectando soporte para clases HSL.
  3. Crear el archivo descriptivo estructurado en `/Biblioteca de Componentes/` bajo carpetización descriptiva en español.
  4. Evaluar y generar el manual de desarrollo correspondiente en `/Manuales/` si la lógica presenta alta complejidad.
  5. Sincronizar el catálogo general `README.md` de la biblioteca y el mapa de documentación.

---

## 🚀 Plan de Ejecución
1. **Paso 1**: Crear la estructura de la Skill seleccionada en el directorio de usuario `.gemini/skills/`.
2. **Paso 2**: Implementar el archivo `SKILL.md` con las instrucciones del rol del Agente.
3. **Paso 3**: Escribir los scripts de soporte en Node.js para interactuar con Firebase y archivos locales.
