# Informe de Auditoría de Madurez — Ecosistema PROTOTIPE

**Estado:** `COMPLETED`
**Fecha de emisión:** 2026-07-12
**Monorepo:** `PROTOTIPE`
**Ecosistema:** `App Ventas` / `Prototype CLI`
**Puntuación Global del Sistema:** `8.8 / 10`

---

## 1. Evaluación de la Arquitectura Actual

El sistema ha evolucionado desde un script monolítico de scaffolding hasta una infraestructura de aprovisionamiento distribuida y desacoplada de 3 niveles:

### 1.1 Capas y Responsabilidades
1. **Capa de Presentación e Interacción (Dashboard Central):**
   - *Responsabilidad:* Capturar la intención de negocio del usuario (vertical, colores, features deseadas).
   - *Evaluación:* Aísla la complejidad de la consola mediante un flujo visual (Wizard) y traduce el payload plano del cliente a un sobre de contrato canónico estructurado (`blueprint` + `execution`) mediante `buildProvisioningPayload()`.
2. **Capa de Orquestación y API (server.js / Bridge API):**
   - *Responsabilidad:* Exponer endpoints HTTP/SSE, validar seguridad del sobre de entrada, gestionar locks de concurrencia y coordinar estados del ciclo de vida.
   - *Evaluación:* Funciona como un controlador de tráfico. Implementa el locking físico en disco y la persistencia de estados de aprovisionamiento en formato JSON.
3. **Capa de Aislamiento y Ejecución (worker_create_project.js):**
   - *Responsabilidad:* Ejecutar tareas pesadas de CPU/Disco en un subproceso de Node (`child_process.fork`) con entorno sanitizado.
   - *Evaluación:* Evita que un fallo en el scaffolding (como una caída en `npm install`) bloquee el servidor Express principal. Sanitiza la salida de consola (logs) mediante overrides y redacta secretos recursivamente antes de enviarlos por IPC.
4. **Capa Física de Generación (generator.js / ProvisioningValidator):**
   - *Responsabilidad:* Validar físicamente el Blueprint contra el catálogo de dependencias del Core, resolver paths absolutos libres de TOCTOU, copiar archivos, compilar assets y ejecutar rollback en caso de fallo.
   - *Evaluación:* Altamente modular, desacoplada de Firebase Cloud SDK y Express.

### 1.2 Acoplamiento y Puntos Únicos de Fallo (SPOF)
- **Acoplamiento Directo al Subproceso:** Aunque el worker ejecuta en background, el Bridge no dispone de una cola de mensajería (Message Queue). Si Express recibe 10 peticiones válidas para 10 clientes distintos simultáneamente, disparará 10 procesos fork en paralelo. Esto saturará de inmediato los ciclos de CPU y el ancho de banda del filesystem local (debido a `npm install` masivos ejecutados concurrentemente), pudiendo colapsar el sistema operativo del host.
- **SPOF del Lock File:** Si la carpeta `artifacts/provisioning-lock/` pierde permisos de escritura o el disco del servidor se llena al 100%, el sistema no podrá adquirir bloqueos y rechazará todas las peticiones de aprovisionamiento de manera indefinida.

---

## 2. Producción Readiness (Preparación para Operar a Escala)

El ecosistema cuenta con mecanismos sólidos para mitigar fallos, pero requiere ajustes operativos para dar el salto a escala masiva:

| Criterio | Estado de Madurez | Justificación y Limitaciones Actuales |
|---|---|---|
| **Clientes Simultáneos** | ⚠️ **Medio** | Protegido contra la sobreescritura accidental del mismo cliente gracias al lock file persistente. Sin embargo, no hay control de concurrencia global ni rate-limiting para clientes distintos en paralelo. |
| **Generación Masiva** | ⚠️ **Medio** | Funciona excelentemente a nivel de generación individual. A escala de cientos/miles de instancias, el uso de dependencias duplicadas (`node_modules` en cada carpeta de cliente) provocará una explosión del espacio de disco. Se requiere transición a monorepo multi-tenant o enlaces simbólicos para `node_modules` compartidos. |
| **Recuperación ante Fallos** | ✅ **Alto** | El rollback físico y el estado persistente (`failed`) garantizan que el sistema no quede en limbo. La resiliencia al reinicio de Express funciona al 100% mediante la comprobación de procesos vivos (PIDs) en el lock file. |
| **Mantenimiento a Largo Plazo** | ✅ **Alto** | La separación de la biblioteca de componentes y la validación estricta de dependencias previenen drifts de código y garantizan paridad lógica. |

---

## 3. Auditoría de Seguridad

Se realizó un análisis estático de las defensas implementadas:

- **Aislamiento de Secretos:** `SecretRedactor` implementa un blindaje efectivo mediante la recopilación y redacción recursiva de contraseñas de administrador, llaves de Firebase y tokens del entorno en logs y canales IPC.
- **Directory Traversal y TOCTOU:** Mitigados al 100% gracias a `PathSecurity.validateContainedPath` (que bloquea saltos relativos y absolutos en base a una lista blanca de directorios de instancias) y al uso de `fs.realpath` post-`ensureDir` para resolver enlaces simbólicos maliciosos.
- **Validación de Carga de Archivos (Uploader):** El endpoint `/api/upload-logo` cuenta con una whitelist de extensiones permitidas, neutralizando la inyección de scripts ejecutables en el directorio temporal `temp_uploads`.
- **Superficie de Ataque:** Puesto que el Bridge está pensado para ejecutarse localmente en la máquina del desarrollador (`localhost`), la superficie de ataque es mínima. Si se expone a redes externas, **requiere obligatoriamente** un middleware de autenticación (JWT/OAuth) para restringir el acceso a los endpoints administrativos.

---

## 4. Calidad de Ingeniería y Cobertura

- **Cobertura de Pruebas:** Excelente nivel de pruebas estáticas y dinámicas organizadas por fases (`test:p0.2`, `test:p0.3`, `test:p0.4`), logrando una validación completa y paridad de resultados.
- **Deuda Técnica:** Baja. La lógica está bien modularizada y documentada en los manuales del Core.
- **Mantenibilidad:** El uso de Feature-Sliced Design para el scaffolding de cliente facilita la localización de bugs y la extensión de features sin contaminar el núcleo del sistema.

---

## 5. Escalabilidad y Cuellos de Botella

1. **El cuello de botella de `npm install`:** 
   El paso que más consume tiempo y recursos en la creación física de la instancia es la resolución de dependencias de red de npm. Al no contar con almacenamiento en caché local offline compartido o una carpeta `node_modules` unificada por enlaces duros (hard links), cada cliente descarga y compila megabytes redundantes.
2. **Concurrencia en RAM/CPU:**
   La ejecución asíncrona descontrolada por forks directos de subprocesos carece de control de cola (Queue Management). Esto limita la capacidad del Bridge a la potencia de hardware de la máquina de desarrollo.

---

## 6. Arquitectura Recomendada (Evolución a Producción Masiva)

Para escalar a miles de instancias simultáneas sin comprometer el servidor, se propone la transición hacia una arquitectura orientada a eventos con colas de mensajería locales:

```
[Express Controller] 
       │
       ▼ (Valida Payload envelope)
[Job Queue (BullMQ / P-Queue)] ──► Almacena tareas en cola ordenada
       │
       ▼ (Consumidor Secuencial - Máximo N Workers en Paralelo)
[Provisioning Worker Pool]
       │
       ├─► Adquiere Lock persistente en disco
       ├─► Resuelve node_modules a través de pnpm store (hard links compartidos)
       ├─► Genera scaffolding físico
       ├─► Registra recursos Firebase en lote (Batch Cloud Registry)
       │
       ▼
[Real-time SSE Notification]
```

---

## 7. Roadmap Técnico Recomendado

Se sugieren las siguientes fases evolutivas antes de habilitar aprovisionamientos multi-tenant remotos:

### Fase 1: Implementación de Cola de Trabajo Secuencial (Job Queue)
* **Objetivo:** Prevenir la saturación del host limitando el número de aprovisionamientos paralelos permitidos en Express.
* **Impacto:** **Alto** (Estabilidad del servidor al 100% bajo tráfico).
* **Esfuerzo Estimado:** Bajo (1-2 días usando una librería de colas ligeras en memoria/disco como `p-queue`).

### Fase 2: Optimización de Filesystem mediante pnpm o Enlaces Duros (Hard Links)
* **Objetivo:** Reducir drásticamente el espacio en disco de las instancias creadas compartiendo el directorio `node_modules`.
* **Impacto:** **Muy Alto** (Ahorro de hasta el 90% de almacenamiento físico por instancia).
* **Esfuerzo Estimado:** Medio (2-3 días adaptando los comandos de instalación en `generator.js`).

### Fase 3: Automatización del Purgado Cloud (Rollback Automático Firebase)
* **Objetivo:** Eliminar físicamente proyectos Firebase creados si la tarea cambia a estado `failed`, evitando colapsar los límites de la cuenta GCP.
* **Impacto:** **Medio-Alto** (Mitigación total de infraestructura huérfana).
* **Esfuerzo Estimado:** Medio (2 días implementando `projects.delete` a través de CLI de Firebase).

---

## 8. Conclusión

El ecosistema **PROTOTIPE CLI** exhibe un excelente nivel de robustez técnica, cobertura de pruebas y blindaje de seguridad para la fase local y de desarrollo de instancias. La arquitectura de tres capas está bien estructurada y las correcciones de ciclo de vida (P0.4) sientan las bases sólidas para avanzar hacia la madurez productiva a gran escala.

> **AUDIT STATUS: COMPLETED & APPROVED FOR NEXT STEPS**
