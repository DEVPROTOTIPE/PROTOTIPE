---
name: portar-componente
description: >-
  Porta (migra) un componente documentado en la Biblioteca de Componentes al
  código fuente de un proyecto destino. Lee el .md, extrae el código, crea el
  archivo .jsx en la ruta correcta del proyecto, adapta imports y colecciones
  de Firestore, y verifica el build. Se activa con @portar-componente.
trigger: "@portar-componente"
aliases:
  - "@portar-componente [PROYECTO_ACTIVO] [NombreComponente]"
---

# Portar Componente

## 📁 Variable de Proyecto Dinámica

> **Variable `[PROYECTO_ACTIVO]`:** Ruta raíz del proyecto de destino. Se determina en este orden de prioridad:
> 1. Si el usuario la especificó en el trigger (ej. `@portar-componente "App Reservas" "SelectorFecha"`), usar esa.
> 2. Si hay un proyecto abierto actualmente en el contexto de la sesión, usar ese.
> 3. Si ninguna de las anteriores aplica, preguntar al usuario antes de continuar: "¿En qué proyecto estás trabajando? Indica la ruta o el nombre de la plantilla."

---

## 📁 Rutas del Proyecto Portables

> Las rutas se construyen dinámicamente usando el directorio raíz del ecosistema `[GIT_ROOT]`:
> - Biblioteca: `[GIT_ROOT]/Documentacion PROTOTIPE/06_Biblioteca_Componentes/`
> - Bitácora: `[GIT_ROOT]/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/bitacora_cambios.md`
> - Mapas: `[GIT_ROOT]/Documentacion PROTOTIPE/04_Estandares_y_Skills/`
> - Dev-dashboard: `[GIT_ROOT]/Central PROTOTIPE/dev-dashboard/`

---

Actúas como un Ingeniero de Integración y Código Portable. Cuando esta skill esté activa, debes seguir estrictamente los siguientes pasos secuenciales:

### 1. Localizar la Ficha Técnica del Componente
Busca el archivo `.md` del componente en el catálogo de componentes `06_Biblioteca_Componentes/` (usa `README.md` como índice).
- Si no existe el componente, informa al usuario y aborta.
- Lee el archivo `.md` completo.

### 2. Validar Existencia en Destino
Verifica si el archivo de destino (definido en el manifiesto JSON del `.md` como `targetPath`) ya existe en el proyecto cliente `[PROYECTO_ACTIVO]`.
- Si el archivo ya existe: **Pausa** y pregunta al usuario de forma explícita si desea sobrescribir el archivo o cancelar la operación.
- Si no existe, continúa al Paso 3.

### 3. Consultar Requerimientos Específicos (Interactividad al Reutilizar)
Está estrictamente prohibido inyectar el código por defecto a ciegas.
- Presenta al usuario una propuesta técnica de configuración rápida del componente.
- Pregúntale al usuario si requiere comportamientos, botones, animaciones, callbacks o campos específicos para esta instancia en particular.
- Adapta el código React extraído del `.md` según las confirmaciones del usuario.

### 4. Resolver e Instalar Dependencias
Lee el bloque de manifiesto JSON del componente en los comentarios HTML.
- **Dependencias NPM:** Verifica si las dependencias listadas en el manifiesto ya están en el `package.json` del proyecto destino. Si no están:
  1. Instala la dependencia usando `npm install [nombre-libreria] --save`.
  2. Si hay fallos de permisos, solicita confirmación al usuario de que instaló la dependencia.
- **Dependencias Internas:** Si el manifiesto lista componentes o hooks internos requeridos por el componente:
  1. Rastrear sus fichas técnicas e inyectar esas dependencias primero de forma recursiva.
  2. **Verificación de Controles y Confirmación:** Si el componente a portar utiliza `CustomSelect` o `useAlertConfirm` (ya sea por manifiesto o detectado en su código), asegúrate de que el proyecto destino los tenga en `src/components/ui/` y `src/components/common/` respectivamente. Si faltan en el destino, transpórtalos e inyéctalos en cascada antes de escribir el componente.

### 5. Adaptar Imports y Rutas del Código
El código de la biblioteca puede usar paths genéricos o relativos de otro proyecto.
- Adapta las rutas de importación (`import`) a la estructura del nuevo proyecto cliente, usando alias `@/` si están soportados en el `vite.config.js` del destino.
- Convierte cualquier ruta de colección de Firestore en props configurables o constantes legibles desde variables de entorno locales, evitando acoplamientos duros de base de datos.

### 6. Escribir el Archivo y Sincronizar
- Escribe el código adaptado en la ruta correcta (`targetPath`) dentro de `[PROYECTO_ACTIVO]`.
- Registra el cambio en `D:\PROTOTIPE\Documentacion PROTOTIPE\03_Auditorias_y_Faro_Core\bitacora_cambios.md`.
- Sincroniza el mapa de la aplicación cliente en `mapa_aplicacion.md` registrando la nueva ruta física creada.

### 7. Compilación y Validación
- Ejecuta `cmd /c npm run build` en el proyecto `[PROYECTO_ACTIVO]` para asegurar que compile sin advertencias ni errores.
- No reportes éxito hasta que el build pase limpio.

---

## Reglas Críticas

### No crear dependencias que no existen
Si el componente requiere un store de Zustand (ej. `useCartStore`) que no existe en el proyecto destino, NO lo crees automáticamente. Notifica al usuario qué dependencias deben portarse primero.

### Fidelidad funcional total
El código portado debe ser 100% funcional. Prohibido usar placeholders o esqueletos. El archivo de código de destino debe estar completo.
