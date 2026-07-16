# Reglas Globales de Desarrollo y Prohibiciones Críticas

## 1. PROHIBICIÓN ABSOLUTA DE RESTAURAR O DESCARTAR CAMBIOS FÍSICOS (CRÍTICO - OBLIGATORIO)

Queda estrictamente prohibido a la IA realizar cualquier tipo de restauración de archivos, descarte de cambios en el directorio de trabajo, o reversión de código (incluyendo de forma enunciativa pero no limitativa: `git restore`, `git checkout --`, `git reset --hard`, `git clean`) sin la confirmación explícita previa y por escrito del usuario. Esta regla es absoluta, de nivel general y aplica a cualquier comando local o interacción con repositorios remotos como GitHub.

## 2. PROTOCOLO DE INTEGRIDAD DE CÓDIGO (POST-CHANGE) - ACTUALIZADO

Para asegurar que todo cambio de código, inyección de componentes o portabilidad de módulos mantenga la estabilidad y consistencia al 100% de manera transparente para el usuario, se establece la siguiente directiva:

1. **Activación Transparente y Autónoma:** Siempre que la IA cree, edite, refactorice o porte cualquier archivo de código o componente en el ecosistema, **DEBE ejecutar inmediatamente y de manera autónoma en segundo plano** el protocolo de integridad física y documental (verificando compilación/build y actualizando la documentación local), proponiendo de inmediato los resultados al usuario.
2. **Validación por Compilación local:** Se debe ejecutar la compilación de producción del proyecto en el cual se realizó la intervención:
   `cmd /c npm run build`
   Si el build genera advertencias, errores de linter o fallos de compilación, la IA los corregirá de forma proactiva en ese mismo turno antes de dar por completado el trabajo.
3. **Sincronización Documental Obligatoria:** En el mismo paso del cambio físico de código, la IA actualizará de forma obligatoria y proactiva en el disco local antes de enviar su respuesta:
   - **`bitacora_cambios.md`**: Registrando el código de tarea y el impacto técnico.
   - **`mapa_aplicacion.md`**: Reflejando cualquier nueva ruta o reestructuración física.
   - **`tareas_pendientes.md`**: Marcando la tarea realizada como completada e identificando cualquier re-trabajo o revisión histórica. *Evitación de Drifts:* Si mueves, renombras o eliminas un archivo físico en el monorepo que previamente estaba declarado en la lista de archivos de cualquier tarea en `tareas_pendientes.md`, DEBES corregir, actualizar o remover inmediatamente la referencia a dicho archivo en la tarea correspondiente para prevenir advertencias de consistencia de disco (`FILE_NOT_FOUND`).
   - **`mapa_documentacion_ia.md`**: Registrando o actualizando el mapa semántico si se crearon, modificaron o archivaron documentos.
4. **PROPUESTA OBLIGATORIA DE COMMIT (NO AUTO-COMMIT):** Queda estrictamente prohibido al agente realizar auto-commits o auto-push silenciosos en Git. En su lugar, el agente debe:
   - Guardar todos los cambios físicos de código y documentación en el disco local.
   - Proponer los cambios estructurados en Git y el mensaje de commit sugerido (siguiendo Conventional Commits con el ID de la tarea, ej. `CORE-348: mensaje`).
   - Esperar la autorización explícita por escrito del usuario antes de proceder a la ejecución de comandos que alteren el control de versiones (`git commit`, `git push`, etc.).
