# 🚀 Reporte de Auditoría de Rendimiento: Motor de Aprovisionamiento PROTOTIPE

**Fecha:** 2026-07-01  
**Auditor:** Arquitecto de Software & Especialista en Rendimiento Web  
**Estado:** Propuesta Técnica de Optimización y Paralelización en `Prototipe-CLI`

---

## 📊 Comparativa de Tiempos: Actual vs. Optimizado

A continuación se presenta un desglose estimado del impacto temporal de las optimizaciones propuestas:

| Fase del Proceso | Duración Actual (Promedio) | Duración Optimizada (Estimada) | Reducción (%) | Solución Técnica Clave |
| :--- | :---: | :---: | :---: | :--- |
| **Preflight & Env Check** | ~8s | ~1s | 87% | Cachear chequeos CLI locales |
| **Instalación de Dependencias** | ~180s - 300s | ~15s - 25s | 91% | `--prefer-offline` + pnpm / Junctions |
| **Aprovisionamiento Firebase** | ~120s - 180s | ~60s - 90s | 50% | Paralelización con `Promise.all` |
| **Compilación & Deploy local** | ~90s - 120s | ~40s - 60s | 50% | Despliegue diferido opcional |
| **Total Neto de Onboarding** | **~7 - 10 min** | **~1.5 - 2.5 min** | **~75%** | **Diseño Asíncrono de Extremo a Extremo** |

---

## 🔍 Hallazgos Críticos y Soluciones de Diseño

### 1. Bloqueo de CPU y Event Loop por Comandos Síncronos (`execSync`)
* **Ubicación exacta:** `generator.js` (Líneas 125, 132, 1073, 1611, 1615, 1633, 1649, 1650, 1653, 1675, 1689, 1717)
* **Causa raíz:** El generador utiliza `execSync` para todas las tareas pesadas de CLI (npm install, git, firebase y test de humo). En Node.js, `execSync` bloquea por completo el hilo principal (Event Loop) del subproceso.
* **Consecuencia:** 
  1. El worker no puede recibir ni procesar mensajes de cancelación o señales IPC enviados por el servidor Express si el usuario interrumpe la petición.
  2. Debido al uso de `stdio: 'inherit'` en el worker, las salidas de los comandos se vuelcan a la terminal padre pero no se capturan ni se transmiten al cliente a través del SSE Stream de manera progresiva, provocando "silencios" y congelaciones visuales en el dashboard durante el aprovisionamiento.
* **Solución concreta:** Reemplazar todas las ejecuciones críticas de `execSync` por un resolvedor asíncrono basado en `spawn` que capture los búferes de logs (`stdout` y `stderr`) línea por línea y envíe pings IPC inmediatos (`process.send({ type: 'LOG', line })`), garantizando interactividad instantánea y fluidez visual en la barra de progreso del desarrollador.

---

### 2. Cuello de Botella en la Instalación de Dependencias (`npm install`)
* **Ubicación exacta:** [generator.js:L1605-1620](file:///d:/PROTOTIPE/Prototipe-CLI/generator.js#L1605-L1620)
* **Causa raíz:** El bootstrapping del proyecto ejecuta `npm install` de forma limpia descargando y resolviendo el árbol completo desde el registro en línea de npmjs, lo cual puede tardar hasta 5 minutos en redes lentas.
* **Solución concreta:**
  1. **Flag `--prefer-offline` / `--no-audit`:** Añadir parámetros que fuercen a npm a leer de la caché global local de Node.js sin verificar firmas remotas ni auditorías de vulnerabilidades en cada generación.
  2. **Detección de PNPM:** Consultar si `pnpm` o `yarn` está instalado en el host local y priorizar su uso.
  3. **Junctions (Windows):** Si se utiliza una plantilla estática, el backend CLI puede crear un enlace simbólico de tipo unión de directorios (`junction` en Windows / `ln -s` en POSIX) para compartir la carpeta `node_modules` preinstalada de las plantillas hacia la carpeta del cliente en menos de 0.5 segundos, eliminando la necesidad de realizar descargas de npm.

---

### 3. Latencia Secuencial de Red en Aprovisionamiento Cloud (Firebase)
* **Ubicación exacta:** [server.js:L452-511](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L452-L511)
* **Causa raíz:** Las llamadas a Firebase CLI (`firebase projects:create`, `firebase firestore:databases:create`, `firebase apps:create web`) se ejecutan de manera estrictamente secuencial y síncrona en bloque, forzando a que cada comando de red espere a que el anterior reciba respuesta de Google Cloud.
* **Solución concreta:** Ejecutar los comandos de creación y configuración en paralelo mediante `Promise.all` cuando sea viable (por ejemplo, registrar la Web App y aprovisionar la base de datos Firestore de forma simultánea una vez que el proyecto base ha sido verificado como activo).

---

### 4. Tolerancia y Resiliencia ante Fallos de Red No Críticos
* **Ubicación exacta:** [server.js:L527-535](file:///d:/PROTOTIPE/Prototipe-CLI/server.js#L527-L535) y [worker_create_project.js:L183-197](file:///d:/PROTOTIPE/Prototipe-CLI/worker_create_project.js#L183-L197)
* **Causa raíz:** Si ocurre un error de red durante pasos no críticos del bootstrap (como el push a GitHub o el despliegue de reglas de Firebase Hosting), el proceso completo del worker arroja una excepción fatal, cancelando y descartando la instalación local de la aplicación.
* **Solución concreta:** Envolver las fases no críticas de red de infraestructura en bloques `try/catch` aislados. Si GitHub o Hosting fallan, el worker debe reportar éxito (`SUCCESS`) con una advertencia en los logs, permitiendo que la instancia local de desarrollo del programador se mantenga funcional en disco para edición manual.
