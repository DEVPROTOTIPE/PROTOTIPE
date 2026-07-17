---
name: find-skills-governed
description: "Busca skills externas cuando el registro aprobado de PROTOTIPE no cubre una necesidad. Activar únicamente después de que route-capabilities devuelva DISCOVERY_REVIEW_REQUIRED. Permite descubrir y evaluar candidatos, pero prohíbe instalarlos, actualizarlos, ejecutarlos o concederles permisos automáticamente."
---

# Descubrimiento gobernado de skills

## Propósito

Usar `Find Skills` de `vercel-labs/skills` como radar externo sin convertir una
búsqueda en una instalación de supply chain.

## Precondiciones

1. `route-capabilities` devolvió `DISCOVERY_REVIEW_REQUIRED`.
2. El fundador autorizó el acceso a red para la búsqueda.
3. La consulta no contiene secretos, datos personales ni información de clientes.
4. La versión revisada del CLI es `skills@1.5.16` al 2026-07-14. Una versión
   distinta exige revisar su diff, publicación y procedencia antes de usarla.

## Búsqueda permitida

Desactivar telemetría y ejecutar solo `find` con una consulta específica:

```powershell
$env:DO_NOT_TRACK='1'
$npx = 'D:\PROTOTIPE_TOOLS\node-v22.23.0-win-x64\npx.cmd'
& $npx skills@1.5.16 find "terminos concretos"
```

No seleccionar opciones que desencadenen instalación. Detenerse después de obtener
los candidatos.

## Evaluación obligatoria

Para cada candidato registrar:

- nombre, propósito y problema exacto que cubre;
- autor/organización y URL de origen;
- versión, tag o commit evaluado;
- licencia y mantenimiento reciente;
- archivos incluidos y tamaño;
- scripts, hooks, MCP, comandos y dependencias;
- herramientas permitidas, red y datos accesibles;
- superposición con capacidades internas;
- pruebas doradas, rollback y criterio de retirada.

Popularidad, estrellas e instalaciones son señales de adopción, no controles de
seguridad.

## Resultado

```text
SKILL_CANDIDATE_REVIEW
Consulta:
Candidato:
Origen y versión:
Valor único:
Redundancias:
Permisos y datos:
Riesgos de supply chain:
Pruebas requeridas:
Recomendación: REJECT | QUARANTINE | PILOT_PROPOSAL
Instalación ejecutada: NO
```

## Prohibiciones

- `npx skills add`, `use`, `update`, `remove` o `rm`.
- `-g`, `-y`, `--yes`, `--all` o `--skill '*'`.
- `curl | bash`, `Invoke-Expression` o scripts remotos por pipe.
- URLs Git arbitrarias sin revisión de origen.
- symlinks hacia fuentes remotas o actualizables.
- modificar `.claude/skills`, `.agents/skills`, plugins o MCP durante la búsqueda.

La promoción de un candidato es una tarea separada con aprobación explícita,
copia versionada, hash, validación y rollback.
