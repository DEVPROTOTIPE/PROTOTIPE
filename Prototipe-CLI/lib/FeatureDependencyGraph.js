export class FeatureDependencyGraph {
  /**
   * @param {Object[]} features - Lista de features del registry central
   */
  constructor(features) {
    this.features = features;
    this.adjList = new Map();
    this.buildGraph();
  }

  buildGraph() {
    this.features.forEach(f => {
      this.adjList.set(f.id, f.dependencies || []);
    });
  }

  /**
   * Comprueba si hay dependencias no resueltas en la lista de dependencias dada.
   * @param {string[]} dependencies 
   * @returns {string[]} Lista de dependencias no encontradas en el registro
   */
  getUnresolvedDependencies(dependencies) {
    return dependencies.filter(depId => !this.adjList.has(depId));
  }

  /**
   * Comprueba si la adición de una dependencia de parentId -> childId introduce un ciclo.
   * @param {string} parentId 
   * @param {string} childId 
   * @returns {boolean} True si hay un ciclo
   */
  wouldIntroduceCycle(parentId, childId) {
    // Clonar temporalmente el grafo e inyectar el nuevo arco
    const tempGraph = new Map(this.adjList);
    const parentDeps = tempGraph.get(parentId) || [];
    tempGraph.set(parentId, [...parentDeps, childId]);

    // Buscar ciclos usando DFS
    const visited = new Set();
    const recStack = new Set();

    const dfs = (node) => {
      if (recStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recStack.add(node);

      const neighbors = tempGraph.get(node) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recStack.delete(node);
      return false;
    };

    // Verificar todos los nodos
    for (const node of tempGraph.keys()) {
      if (dfs(node)) return true;
    }

    return false;
  }

  /**
   * Devuelve un orden topológico de las features para determinar el orden de instalación.
   * Lanza un error si hay ciclos existentes.
   * @returns {string[]}
   */
  getInstallationOrder() {
    const visited = new Set();
    const recStack = new Set();
    const order = [];

    const dfs = (node) => {
      if (recStack.has(node)) {
        throw new Error(`[FeatureDependencyGraph] Ciclo detectado involucrando a la feature: ${node}`);
      }
      if (visited.has(node)) return;

      recStack.add(node);

      const neighbors = this.adjList.get(node) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor);
      }

      recStack.delete(node);
      visited.add(node);
      order.push(node);
    };

    for (const node of this.adjList.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return order; // Retorna del final al inicio
  }
}
