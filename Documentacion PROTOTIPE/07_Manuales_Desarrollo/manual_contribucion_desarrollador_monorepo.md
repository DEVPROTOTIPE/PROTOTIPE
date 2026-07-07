# 🛠️ Guía de Contribución y Configuración del Monorepo PROTOTIPE

Esta guía técnica está dirigida a desarrolladores del equipo de PROTOTIPE. Define el proceso obligatorio para levantar el entorno de desarrollo local del Dashboard Central y el Servidor CLI, las convenciones de Git y cómo registrar contribuciones al núcleo de la plataforma.

---

## 1. Arquitectura del Entorno de Desarrollo Local
La plataforma de desarrollo de PROTOTIPE opera en dos capas locales comunicadas mediante APIs HTTP y streams SSE:

```
  [ Navegador Web ] (localhost:5173)
         │
         │ (HTTP / SSE Streams)
         ▼
  [ dev-dashboard ] (React 19 / Vite)
         │
         │ (API REST Local: localhost:3001)
         ▼
  [ Prototipe-CLI ] (Express Bridge) ───► [ Git / Firebase CLI ] (Herramientas OS)
```

---

## 2. Instrucciones para Levantar el Entorno Local

### Paso 1: Levantar el Backend Bridge CLI
El servidor Bridge expone APIs para clonar repositorios, comparar ramas de Git, inyectar componentes y purgar directorios.
1. Abre una terminal en `D:\PROTOTIPE\Prototipe-CLI`.
2. Instala dependencias: `npm install`.
3. Levanta el servidor Express en el puerto 3001:
   `npm start` o `node server.js`
4. El preflight check verificará la presencia de Git y Firebase CLI en el PATH de Windows.

### Paso 2: Levantar el Dashboard Central (UI)
La consola administrativa permite interactuar de forma visual con las herramientas locales.
1. Abre otra terminal en `D:\PROTOTIPE\Central PROTOTIPE\dev-dashboard`.
2. Instala dependencias: `npm install`.
3. Inicia el servidor de desarrollo de Vite en el puerto 5173:
   `npm run dev`

---

## 3. Flujo de Trabajo y Ciclo de Desarrollo
Cuando modifiques el código del Dashboard o del CLI Bridge:

1.  **Validación de Compilación:** Corre `npm run build` en la carpeta de la interfaz modificada antes de hacer commit. No se permiten commits con fallas de linter o importaciones rotas.
2.  **Sincronización Física y Documental:**
    *   **Bitácora:** Registra los cambios de código realizados en `Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`.
    *   **Roadmap:** Actualiza el estatus de la tarea correspondiente en `Documentacion PROTOTIPE/02_Tareas_Roadmap/tareas_pendientes.md` tachándola con `~~[x]~~`.
    *   **Mapa de Aplicación:** Si agregas nuevos archivos o endpoints, actualiza `mapa_aplicacion.md`.

---

## 4. Convenciones de Commits y Versionamiento
Para garantizar la paridad y la legibilidad en el drift detector, usamos **Conventional Commits**:
*   `feat(dash):` para nuevas características en el dashboard (ej. nuevos widgets o pestañas).
*   `feat(cli):` para nuevos endpoints o mejoras en el generador de marca blanca.
*   `fix(dash/cli):` para corrección de bugs.
*   `docs:` para actualizaciones de manuales o bitácoras.

*Ejemplo de Commit Válido:*
```bash
git commit -m "feat(cli): add git compare-drift endpoint for multi-tenant analysis [CORE-268]"
```
