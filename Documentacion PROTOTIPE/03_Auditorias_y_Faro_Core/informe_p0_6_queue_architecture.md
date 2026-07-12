# Informe de Diseño Arquitectónico — Fase P0.6: Provisioning Queue & Job Management

**Estado:** `DESIGN APPROVED / AWAITING IMPLEMENTATION`
**Fecha de emisión:** 2026-07-12
**Monorepo:** `PROTOTIPE`
**Ecosistema:** `App Ventas` / `Prototype CLI`

---

## 1. Auditoría del Flujo Actual de Workers

El Bridge API (`server.js`) implementa actualmente un flujo asíncrono no limitativo para el aprovisionamiento de proyectos:

### 1.1 Ciclo de Vida y Nacimiento de Procesos
1. El usuario envía una petición `POST` al endpoint `/api/create-project`.
2. El Bridge API valida el payload canónico, adquiere un lock exclusivo por `clientId` en disco y registra la tarea en memoria en el mapa `activeCreationTasks`.
3. Express responde inmediatamente con el `taskId` y en segundo plano dispara la función `executeCreationTaskInBackground(taskId, answers)`.
4. Dicha función ejecuta `runCreateProjectWorker()`, la cual realiza un `child_process.fork()` del archivo `worker_create_project.js`.
5. El worker se comunica con el Bridge a través de mensajería IPC (`process.send`), enviando logs en tiempo real (`type: 'LOG'`) y notificando el éxito o fallo de la operación.

### 1.2 Límites de Concurrencia y Riesgos de Saturación
* **Límite Actual:** $1$ operación por `clientId` (gracias al lock file preventivo). Sin embargo, el límite de concurrencia global para *diferentes* clientes es **infinito**.
* **Riesgos de Saturación:**
  - Si un desarrollador o múltiples usuarios inician el aprovisionamiento de 5 instancias distintas (ej. `tienda-ropa`, `ferreteria-rural`, `minimarket-alimentos`, etc.) simultáneamente, Express creará 5 subprocesos fork en paralelo.
  - Cada fork iniciará un comando `npm install` independiente. Dado que npm consume casi el 100% de la capacidad de I/O de disco y un núcleo entero de CPU por proceso, ejecutar 5 de ellos en paralelo saturará el disco (provocando thrashing de disco en HDD/SSD) y colapsará el Bridge, provocando pérdidas de conexión SSE, timeouts y estados `failed` en cascada.
* **Punto de Inserción de la Cola:** 
  La cola de trabajo debe insertarse en `server.js` inmediatamente antes del disparo de `executeCreationTaskInBackground`. El endpoint `/api/create-project` debe encolar la solicitud y retornar su ID de tarea y posición en la cola, delegando la ejecución a un procesador controlado (Worker Thread/Process Pool) que atienda los Jobs de manera secuencial.

---

## 2. Diseño de la Cola de Aprovisionamiento (Job Queue)

Se propone un diseño de cola ligera, resiliente a caídas y de alta visibilidad para el desarrollador:

### 2.1 Especificaciones Técnicas de la Cola
* **Cola en Memoria con Persistencia Ligera en Disco:** 
  Dado que el Bridge se ejecuta de forma local en la máquina de desarrollo, no es necesario introducir dependencias pesadas como Redis. Se propone implementar una clase `ProvisioningQueue` nativa en Express que almacene el array de Jobs en RAM y guarde/actualice un manifiesto JSON en `artifacts/provisioning-queue.json` cada vez que cambie la lista de jobs.
* **Workers Concurrentes recomendados:** `maxConcurrency = 1`. 
  Debido a la naturaleza pesada de `npm install` y las compilaciones de assets, se recomienda que únicamente se procese **una tarea física a la vez**, manteniendo las demás solicitudes en espera ordenada.
* **Estados del Job (Ciclo de Vida):**
  - `enqueued` (en espera de turno en la cola).
  - `processing` (actualmente ejecutando Firebase o Scaffolding).
  - `completed` (finalizado con éxito).
  - `failed` (finalizado con error).

```
   [Job Creado] ──► Estado: enqueued 
                         │
                         ▼ (Espera turno en la cola)
                    Estado: processing (Adquiere lock y ejecuta fork)
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   [Éxito E2E]                       [Fallo E2E]
Estado: completed                 Estado: failed
Libera Lock y actualiza           Libera Lock y ejecuta rollback
```

* **Estrategia de Retry (Reintentos):**
  Se establece en `maxRetries = 0` por defecto. En aprovisionamientos complejos, reintentar a ciegas tras un error de Firebase (como falta de permisos o proyecto excedido) o falta de conexión a Internet es contraproducente. Es preferible marcar la tarea como `failed` para que el desarrollador la revise e inicie manualmente un nuevo re-aprovisionamiento seguro.
* **Recuperación tras Reinicio (Crash Resilience):**
  Al arrancar el servidor Express:
  1. Se verifica si el archivo `artifacts/provisioning-queue.json` existe.
  2. Si hay jobs con estado `processing`, se asume que Express se cayó durante su ejecución.
  3. El Bridge limpia los locks de dichos clientes, marca el estado del job previo como `failed` (o `enqueued` si se prefiere reintentar) y restaura la cola procesando los jobs que quedaron en espera (`enqueued`).

---

## 3. Impacto de Cambios por Componente

### 3.1 `server.js` (Bridge API)
- **Implementar `ProvisioningQueue`:** Clase encargada de la persistencia de cola en `artifacts/provisioning-queue.json`, con métodos `enqueue()`, `dequeue()`, `processNext()` y `restore()`.
- **Modificar `/api/create-project`:** En lugar de lanzar `executeCreationTaskInBackground` de forma directa, registra el job en la cola con estado `enqueued`, guarda en disco y retorna la posición inicial.
- **Modificar `/api/create-project/stream`:** El endpoint SSE ahora puede transmitir eventos de posicionamiento de la cola: `res.write('data: ' + JSON.stringify({ type: 'queue', position }) + '\n\n')`. Cuando el job pase a `processing`, el cliente empezará a recibir los logs habituales del subproceso.

### 3.2 `worker_create_project.js` (Subproceso)
- **Cero Cambios de Interfaz:** El worker se mantiene intacto. Sigue recibiendo el evento `START` a través de IPC, reportando logs con `LOG` y finalizando con `SUCCESS` o `ERROR`.

### 3.3 `ProvisioningStateManager.js` (Lifecycle Manager)
- **Método `getState(clientId)`:** Extender si es necesario para sincronizar el estado del ciclo de vida del cliente con la posición o estado del job en la cola.

### 3.4 Dashboard `App.jsx`
- **Soporte SSE de Cola:** El receptor de logs SSE del Dashboard debe manejar el nuevo tipo de evento `{ type: 'queue', position }`, mostrando un indicador de progreso de tipo: *"Esperando turno en la cola de aprovisionamiento... Posición actual: #2"*.

---

## 4. Análisis de Seguridad e Integridad

* **Aislamiento entre Jobs:** El aislamiento por subprocesos (`child_process.fork`) y entornos limpios (`SAFE_ENV_ALLOWLIST`) se mantiene inalterado. La cola simplemente controla *cuándo* se lanzan los procesos, no cómo se ejecutan.
* **Gobernanza de Locks (P0.4):** El lock file `artifacts/provisioning-lock/{clientId}.lock` se adquiere **inmediatamente al pasar el job a estado `processing`**, y no al encolarse. Esto permite que un usuario encole peticiones para diferentes clientes simultáneamente, pero bloquea peticiones repetidas para el *mismo* cliente de forma atómica en el endpoint `/api/create-project` mediante comprobaciones rápidas de la cola.
* **Compatibilidad:** 100% compatible con los mecanismos de Directory Traversal, TOCTOU y redacción de secretos (P0.3) implementados en el generador y worker.

---

## 5. Conclusión del Diseño

La arquitectura propuesta para la cola de aprovisionamiento (**Fase P0.6**) resuelve el principal SPOF de rendimiento del ecosistema local, limitando el consumo de recursos de disco y CPU a través de un procesamiento secuencial controlado, al tiempo que garantiza consistencia absoluta de estados y una experiencia de usuario (UX) premium y clara.

> **P0.6 STATUS: DESIGN COMPLETED — AWAITING USER APPROVAL TO IMPLEMENT**
