import { ComponentRegistry } from '../config/ComponentRegistry'

class DashboardComposerClass {
  /**
   * Compone el dashboard dinámicamente resolviendo widgets e inyectando promesas lazy.
   * @param {object} dashboardConfig - Configuración del dashboard.json
   * @param {string} userRole - Rol del usuario actual
   * @returns {Array<{id, size, componentPromise}>}
   */
  compose(dashboardConfig = {}, userRole) {
    const activeWidgets = dashboardConfig.activeWidgets || []
    const composed = []

    for (const widget of activeWidgets) {
      const componentPromise = ComponentRegistry.getWithPermission('widgets', widget.id, userRole)
      if (componentPromise) {
        composed.push({
          id: widget.id,
          size: widget.size || 'col-span-12',
          componentPromise
        })
      }
    }

    return composed
  }
}
export const DashboardComposer = new DashboardComposerClass()
