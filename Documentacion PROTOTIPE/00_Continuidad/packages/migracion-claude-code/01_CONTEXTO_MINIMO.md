# Contexto Mínimo de Continuidad — Transición a Claude Code

Este documento define el estado y las decisiones tomadas para la migración del asistente de desarrollo asistido de PROTOTIPE.

## 1. Decisiones Confirmadas

- **Alcance Limitado:** Se migra únicamente el asistente de desarrollo de la IA (de Antigravity a Claude Code). El runtime de producción, servicios de base de datos Firestore y las automatizaciones locales de Node.js en `Prototipe-CLI` permanecen sin cambios.
- **Formateo y Limpieza:** El equipo de desarrollo se someterá a un formateo de sistema operativo limpio.
- **Estructura Equivalente en Destino:** En el entorno de Claude Code, se debe implementar una estructura homóloga de reglas (`CLAUDE.md`) y habilidades (`skills/`) que garantice el bucle de revisión cerrada.

## 2. Estado Actual del Repositorio

- **Rama Activa:** `docs/context-packaging` (creada para el desarrollo de esta herramienta piloto).
- **Consistencia de Fuentes:** Se ha generado el índice de hash para las fuentes versionadas detectadas en el repositorio.
- **Declaración de Seguridad de Datos:** El escáner automático de secretos se limitó a detectar patrones sintácticos conocidos (claves Firebase, tokens JWT, llaves privadas y patrones comunes de asignación de variables de credenciales). Esta validación no exime de realizar una revisión humana rigurosa antes de cualquier resguardo público o migración final.
- **Cambios Locales:** Se mantienen modificaciones de trabajo en el workspace actual (vía `git status`) que no interfieren con esta carpeta y que se conservarán para la posterior revisión tras el formateo.

## 3. Restricciones Operativas

- **Gobernanza:** Queda estrictamente prohibido realizar despliegues automáticos a hosting o Cloud Functions desde la IA a menos que el usuario lo solicite explícitamente.
- **Reglas del Core:** Se mantiene la prohibición absoluta de usar elementos `<select>` nativos (usar `CustomSelect`), realizar restauraciones destructivas de Git sin permiso, o usar slate fijo para disabled.
- **Sensibilidad:** Las credenciales y claves de Firebase o GitHub deben permanecer en archivos `.env.local` excluidos y no subirse al repositorio.

## 4. Tareas Pendientes e Hitos Siguientes

Para garantizar una transición segura y sin pérdida de continuidad, el orden de ejecución estricto es:
1. **Completar recuperación y escaneo adicional:** Confirmar la integridad de los directorios clave del monorepo y realizar un escaneo de seguridad secundario sobre archivos no versionados y configuraciones locales.
2. **Clonación limpia previa al formateo:** Realizar un clon limpio de resguardo completo del monorepo y su base documental en almacenamiento externo.
3. **Revisión y Aprobación del Piloto:** El usuario revisará y validará la estructura y contenido del paquete piloto generado.
4. **Commit/Push del Piloto:** La evaluación de subir a Git la rama `docs/context-packaging` con los archivos de continuidad se realizará únicamente después de la aprobación humana explícita.

## 5. Siguiente Paso Exacto

1. **Revisión y Validación Humana:** El usuario Sergio revisará este paquete piloto directamente en el workspace local para autorizar el paso a la fase de clonación y transición.
