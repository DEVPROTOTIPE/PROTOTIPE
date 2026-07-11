import semver from 'semver';

export class PackageMerger {
  /**
   * Fusiona dependencias de manera gobernada, deteniendo la generación si hay conflictos de versiones.
   * @param {Array<Object>} featuresMetadatas
   * @param {Array<Object>} componentsMetadatas
   * @param {Object} basePackageJson
   * @returns {Object} package.json resultante
   */
  static merge(featuresMetadatas, componentsMetadatas, basePackageJson) {
    console.log('📦 [PackageMerger] Iniciando fusión de dependencias...');
    const mergedDeps = { ...basePackageJson.dependencies };
    const conflicts = [];

    // Recopilar dependencias requeridas por las features y componentes
    const requirements = {};

    const addRequirements = (sourceId, depsObj) => {
      if (!depsObj) return;
      Object.entries(depsObj).forEach(([pkg, range]) => {
        if (!requirements[pkg]) {
          requirements[pkg] = [];
        }
        requirements[pkg].push({ sourceId, range });
      });
    };

    // Procesar features
    featuresMetadatas.forEach(feat => {
      if (feat.npmDependencies) {
        addRequirements(`feature:${feat.id}`, feat.npmDependencies);
      }
    });

    // Procesar componentes
    componentsMetadatas.forEach(comp => {
      if (comp.dependencies && comp.dependencies.npm) {
        // En los componentes el array de npm solo son nombres. Asumimos versiones compatibles de core o leemos sus dependencias.
        // Si el schema del componente declara npm como array de strings, asumimos versión base o mapeamos.
        // Para robustecer, el schema de componentes define dependencias.npm como un array de strings.
        // Si no define versión, podemos asumir "*" o el valor de la plantilla base.
        comp.dependencies.npm.forEach(pkg => {
          // Si no está registrado en features, le ponemos una versión por defecto compatible de la plantilla
          if (!requirements[pkg]) {
            requirements[pkg] = [{ sourceId: `component:${comp.id}`, range: '*' }];
          }
        });
      }
    });

    // Validar intersección de rangos semver
    Object.entries(requirements).forEach(([pkg, reqs]) => {
      let resolvedRange = null;

      for (const req of reqs) {
        if (req.range === '*') continue;

        if (!resolvedRange) {
          resolvedRange = req.range;
          continue;
        }

        // Validar si los rangos se superponen
        const validRange = semver.validRange(resolvedRange);
        const candidateRange = semver.validRange(req.range);

        if (validRange && candidateRange) {
          // Intentar encontrar intersección
          const intersection = semver.intersects(resolvedRange, req.range);
          if (!intersection) {
            conflicts.push({
              package: pkg,
              details: reqs.map(r => `${r.sourceId} requiere ${r.range}`).join(', ')
            });
          } else {
            // Resolver a la versión más restrictiva/alta de manera segura
            // Simplificación: nos quedamos con el rango candidato si cruza
            resolvedRange = `${resolvedRange} ${req.range}`;
          }
        }
      }

      if (resolvedRange && !conflicts.find(c => c.package === pkg)) {
        mergedDeps[pkg] = resolvedRange;
      }
    });

    if (conflicts.length > 0) {
      console.error('\n❌ [CONFLICTO DE DEPENDENCIAS NPM DETECTADO]');
      conflicts.forEach(c => {
        console.error(`  - Paquete: "${c.package}". Detalles: ${c.details}`);
      });
      throw new Error(`Fallo de aprovisionamiento: Conflicto de versiones NPM incompatible.`);
    }

    const updatedPackageJson = { ...basePackageJson };
    updatedPackageJson.dependencies = mergedDeps;
    return updatedPackageJson;
  }
}
