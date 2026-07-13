# Mapa de la Aplicación (Fuente de Verdad Arquitectónica)

```yaml
# INDEXADOR DE ARQUITECTURA FÍSICA PROTOTIPE (Ahorro de Tokens)
app_layout:
  Dashboard_Central:
    root: /Central PROTOTIPE/dev-dashboard/src/
    components: [components/admin/BrandingEffectsPanel.jsx, components/admin/ClientLifecyclePanel.jsx, components/admin/FeatureFlagManager.jsx, components/admin/VersionManagerView.jsx, components/admin/SaaSOperationsView.jsx, components/admin/BriefingStudioView.jsx, components/admin/FeatureMarketplaceView.jsx, components/admin/ComponentLibraryView.jsx, components/admin/ComponentSandbox.jsx, components/admin/ProvisioningProgressModal.jsx, components/admin/FirebaseAccountsModal.jsx, components/admin/ProvisioningQueueModal.jsx, components/ui/, components/common/]
    state: [store/, services/SaaSMetricsService.js, services/AlertEngine.js, config/saas_config.js]
  Prototipe_CLI:
    root: /Prototipe-CLI/
    core_scripts: [server.js, generator.js, worker_create_project.js, sync_clients.js, notification_server.js, scripts/validate-knowledge.js, scripts/test_promotion_pipeline.js, scripts/test_robustness_specials.js, scripts/test_bridge_health.js, scripts/test_smoke_visual.js, scripts/test_firestore_emulator.js, scripts/test_multiplatform.js, scripts/run_full_certification.js, scripts/distribute_rules.js, scripts/firebase_account_manager.js, scripts/update_moni_github.js, scripts/prune_drifts_local.js, scripts/link_tasks_local.js, scripts/test_status.js, scripts/test_link.js, scripts/test_feature_manifest_adapter.js, scripts/test_provision.js]
    templates: [templates/template-ventas/, templates/template-core-seed/, templates/feature-scaffold/]
    knowledge: [knowledge/core-promotion/, knowledge/firestore/, knowledge/telemetry/app-registry.json, knowledge/telemetry/event-types.json, knowledge/feature-registry.json, knowledge/schema/]
    lib: [lib/CoreCandidateBuilder.js, lib/CorePromotionValidator.js, lib/BriefingDocumentMapper.js, lib/PromotionBlueprintBuilder.js, lib/CorePromotionService.js, lib/CorePromotionPublisher.js, lib/ClientLineageMigrator.js, lib/FeatureRegistry.js, lib/VersionManager.js, lib/CapabilityResolver.js, lib/FeatureRecommender.js, lib/ExplainabilityLogger.js, lib/PackageMerger.js, lib/ProvisioningValidator.js, lib/BlueprintSimulation.js, lib/ExperienceComposer.js, lib/BiResolver.js, lib/ProvisioningStateManager.js, lib/ProvisioningQueue.js, lib/FeatureScaffolderSchemas.js, lib/FeatureDependencyGraph.js, lib/FeatureRequestValidator.js, lib/WorkspaceLockManager.js, lib/OperationJournalRepository.js, lib/FeatureScaffolder.js, lib/FeatureVerificationRunner.js, lib/SecurityMiddleware.js, lib/featureManifestAdapter.js]
  Plantilla_Core:
    root: /Plantillas Core/App Ventas/src/
    layers: [features/, components/, services/, hooks/, constants/, store/, core/generated/]
    rules: [/Plantillas Core/App Ventas/firestore.rules, /Plantillas Core/App Ventas/firestore.indexes.json]
  Instancias_Clientes:
    root: /Instancias Clientes/
    active_instances: [ventas/ventas-moni-app/]
```

Este mapa detalla de manera estructurada los módulos, vistas, flujos de datos e integraciones con Firebase de **App Ventas**. Debe mantenerse actualizado ante cualquier creación, eliminación o refactorización de archivos.

## 📂 Estructura de Documentación y Negocio
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Paginas/Pantalla_Bienvenida/welcome_page.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-366).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Fidelizacion_y_Gamificacion/Tarjeta_Rasca_Gana/scratch_card_reward.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-366).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/estado_arquitectura_post_fase9_3.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-367).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Fidelizacion_y_Gamificacion/Tarjeta_Rasca_Gana`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-367).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Fidelizacion_y_Gamificacion/Olla_Oro_Interactiva/interactive_gold_pot.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-367).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_template_core_seed.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-375).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/especificacion_disenio_experiencia_fase7.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-392).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/disenio_arquitectura_provisioning_ia_fase8.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-392).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/disenio_arquitectura_core_v2.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-392).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/evolucion_plataforma_prototype.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-392).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_experience_framework.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-392).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_core_vs_features_template.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-392).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_aprovisionamiento_clientes.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea DOC-MEMBER-PROVISIONING).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/informe_certificacion_p0_2.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-411).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/informe_certificacion_p0_3.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-417).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/informe_certificacion_p0_5.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-424).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/informe_madurez_prototipe.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-425).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/informe_p0_6_queue_architecture.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-426).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/informe_p0_7_production_hardening.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-429).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Iconos_Marca/iconos_marca.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-445).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_feature_flags_y_marketplace.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-446).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_integridad_y_criterios_aprovisionamiento.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-446).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_maquetacion_alineacion_ui.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-447).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_disenio_premium.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-449).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Sistema_Notificaciones_Premium/premium_notification_center.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-364).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Fidelizacion_y_Gamificacion/Granada_Promocional_Flotante/floating_promo_grenade.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea COMP-359).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Fidelizacion_y_Gamificacion/Galleta_Fortuna/galleta_fortuna_interactiva.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea COMP-360).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Fidelizacion_y_Gamificacion/Ruleta_Fortuna_Premios/interactivefortune_wheel.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-363).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Paginas/Pagina_Login/login_page.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-363).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Paginas/Pagina_Login/phone_id_login_page.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-363).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_consola_telegram.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-351).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Servicios_y_Firebase/Canales_Notificaciones_Telegram/manual_integracion_telegram.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-340).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/ESTADO_REAL_PROTOTIPE_2.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-302).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/protocolo_rollback_autonomo_ia.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-309).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/registro_decisiones_estrategicas.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-311).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/cuestionario_certificacion_desarrollo_2026.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-314).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_gestion_riesgos_y_disaster_recovery.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-316).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_onboarding_desarrollador_junior.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-313).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/seguridad_firestore_ecosistema.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea DOC-003).
* **`/Documentacion PROTOTIPE/02_Tareas_Roadmap/ideas_y_backlog_futuro.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-025).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/inventario_maestro.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-025).
* **`/Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-287).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_critica_ecosistema_2026.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-288).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/comparativa_y_alineacion_documental_2026.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-270).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/contrato_aprovisionamiento_dinamico_assets.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-271).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/gobernanza_dependencias_npm_multicore.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-271).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_playgrounds_storybook_multicore.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-271).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_repositorios_infraestructura_agnostica.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-271).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/especificacion_nuevos_cores_oro.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-271).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/resumen_reglas_y_estandares_desarrollo.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-272).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_sincronizacion_plantillas_2026.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-275).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_contribucion_desarrollador_monorepo.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-276).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/guia_flujo_completo_cliente_entrega.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-276).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/manual_y_auditoria_completa_prototipe_2026.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-276).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/estado_actual_ecosistema.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-279).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/Scripts_Auxiliares/consolidar_para_notebook.py`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-281).
* **`/Documentacion PROTOTIPE/01_Control_Versiones/changelog_general.md`**: Bitácora general de cambios operativos del monorepo (Saneamiento CORE-285).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_creacion_desde_cero.md`**: Manual técnico para desarrollo sobre Core Seed (renombrado CORE-285).
* **`/Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/resumen_ejecutivo_proyecto.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-013).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/Estilos/catalogo_estilos_ui.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-008).
* **`/Documentacion PROTOTIPE/10_Historial_Inyecciones/INDEX.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-127).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Contractors/Checklist_Seguridad_EPP/checklist_seguridad_epp.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Contractors/Grafico_Presupuesto_Vs_Gasto/grafico_presupuesto_vs_gasto.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Contractors/Solicitud_Pedido_Materiales/solicitud_pedido_materiales.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Contractors/Visor_Planos_Diseno/visor_planos_diseno.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Contractors/Selector_Alquiler_Andamios/selector_alquiler_andamios.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Contractors/Cronograma_Hitos_Proyecto/cronograma_hitos_proyecto.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Contractors/Calculadora_Dosificacion_Concreto/calculadora_dosificacion_concreto.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Contractors/Bitacora_Diaria_Obra/bitacora_diaria_obra.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Contractors/Selector_Especialidad_Contratistas/selector_especialidad_contratistas.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Contractors/Calculadora_Presupuesto_Obra/calculadora_presupuesto_obra.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/d:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Contractors/`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-178).
* **`/d:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Machinery_Rental/`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-180).
* **`/d:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Carpentry/`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-181).
* **`/d:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Technical_Services/`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-186).
* **`/d:/PROTOTIPE/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Refrigeration_AC/`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-186).
* **`/d:/PROTOTIPE/Documentacion PROTOTIPE/02_Tareas_Roadmap/control_creacion_componentes.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-188).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_tecnica_completa_maestra_2026.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-037).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/diccionario_tecnico_completo.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-038).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/diagrama_flujo_ecosistema.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-039).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_final_prototipe.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-039).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/registro_decisiones_arquitectura.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-041).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/mapa_dependencias_y_riesgos.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-042).
* **`/Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/roadmap_empresarial_2026_2029.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-045).
* **`/Documentacion PROTOTIPE/08_Plan_Escalabilidad_Negocio/organigrama_futuro.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-046).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_motor_aprovisionamiento_marca_blanca.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-055).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_archivos_sincronizables_2026.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-084).
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/analisis_nichos_mercado_saas.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-085).
* **`/Documentacion PROTOTIPE/09_Modulos_Completos/propuesta_dashboard_interactivo.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-086).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectonico_ecosistema.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-106).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/propuesta_conversion_psicologica_2026.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-111).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/propuestas_persuasion_captacion_avanzada_2026.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-112).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_asistente_aprovisionamiento.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-146).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_rendimiento_aprovisionamiento_2026.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-152).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/propuesta_wizard_aprovisionamiento_excelencia.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-152).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Menus/CircularDishMenu/circular_dish_menu.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-159).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Formularios_y_UI/Carrucel_Productos/carrusel_productos.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-163).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Visualizacion/Marquesina_Marcas/marquesina_marcas.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-164).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/Selector_Tallas_Colores/selector_tallas_colores.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-169).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Ecommerce_y_Ventas/`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-170).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Toast_Notification/toast_notification.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-198).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Modal_Base_Premium/modal_base_premium.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-199).
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/Componentes_Atomicos/Slide_To_Unlock_Button/slide_to_unlock_button.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-202).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/estandar_arquitectura_limpia_react_firebase.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-223).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/protocolo_colaboracion_ia.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-229).
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/reporte_auditoria_biblioteca_completa.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-230).
* **`/Documentacion PROTOTIPE/04_Estandares_y_Skills/prompt_maestro_descubrimiento.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-248).
* **`/LandingPage/Index.html`**: Portal web y landing page corporativa de PROTOTIPE. Rediseñada con enfoque de consultoría, modo oscuro/claro persistente y modales de leads y CRO.
  * **Secciones principales**: `#hero` (partículas), `#rubros`, `#problema` (contador dinámico), `#solucion`, `#beneficios` (typewriter anti-layout shift), `#negocio-organizado`, `#testimonios` (carrusel 3D), `#soporte`, `#contacto` y `#lead-modal`.
  * **Efectos interactivos**: Botones magnéticos y mini-dashboard SVG interactivo.
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_landing_page_2026.md`**: Reporte de auditoría de seguridad (rel="noopener noreferrer"), optimizaciones SEO (metadatos Open Graph/Twitter Cards), semántica HTML5 y análisis de diseño premium de la landing page.
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_critica_server_cli_2026.md`**: Auditoría de seguridad de `server.js`. Evalúa riesgos de comandos shell exec/spawn, path traversal en inputs y conmutación de puertos.
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_generator_js.md`**: Auditoría de robustez de `generator.js`. Analiza la fusión lógica de manifiestos, procesamiento de logos con Jimp y resiliencia del seeding.
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Prototipe_CLI/manual_promocion_clientes_a_cores.md`**: Manual técnico y operacional sobre el pipeline transaccional de promoción de cores, migración y rollbacks compensatorios (Fase 6).
* **`/Documentacion PROTOTIPE/07_Manuales_Desarrollo/Testing/matriz_pruebas_promocion_cores.md`**: Matriz de cobertura de los 45 escenarios del plan de pruebas frente a las aserciones ejecutadas.
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_seguridad_aprovisionamiento_2026.md`**: Auditoría de seguridad del aprovisionador en la nube, evaluando roles de servicio de Firebase, validación de credenciales y mitigación de falsos negativos.
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_paridad_y_exclusiones_2026.md`**: Auditoría técnica del motor de paridad y sincronización de Cores. Analiza riesgos de sobreescritura, y detalla la arquitectura de preservación de branding y inyección SEO en index.html, la fusión de dependencias en package.json y los filtros flexibles de exclusión.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/estrategia_negocio.md`**: Define el flujo operativo para adaptar la aplicación a clientes a partir de requerimientos de preventa, analizando componentes en la biblioteca o planificando nuevos módulos modularizados.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/modelo_operativo_y_negocio.md`**: Detalla el modelo de negocio (setup, SaaS, comisiones), onboarding comercial, ventas QR, flujos de desarrollo, soporte de excepciones, mantenimiento y rollbacks automatizados de PROTOTIPE.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/oferta_comercial_oficial.md`**: Presentación comercial oficial del ecosistema PROTOTIPE, detallando problemas que resuelve, entregables, propuesta de valor, misión, visión y principios de trabajo.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_precios_licenciamiento.md`**: Define la filosofía de precios, valor de setup, comisiones operacionales por ventas/servicios, propiedad intelectual y políticas de suspensión del ecosistema.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/matriz_precios_oficial.md`**: Matriz de precios del ecosistema, estableciendo cobros de implementación por nivel de solución (Nivel 1 a 4), operación recurrente, comisiones de venta (1% – 5%), y suscripciones mensuales.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_contratacion_clientes.md`**: Detalla el proceso de contratación estructurado (contacto, reunión inicial, diagnóstico, propuesta, aprobación, inicio de proyecto) y principios clave de preventa.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/contrato_maestro_servicios.md`**: Contrato maestro oficial de prestación de servicios tecnológicos, definiendo la propiedad intelectual del core, propiedad de datos del cliente, licenciamiento, soporte y mantenimiento.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/politica_proteccion_datos.md`**: Política oficial de protección y gestión de datos de PROTOTIPE, regulando la confidencialidad, propiedad, seguridad, retención y migración de la información.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/manual_marca.md`**: Define la personalidad de marca, posicionamiento, tono de comunicación, valores, estilo visual e identidad de PROTOTIPE.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/plan_comercial_marketing.md`**: Detalla el plan de marketing de PROTOTIPE, incluyendo los canales de adquisición, cliente ideal (emprendedores/pymes), embudo de ventas de 7 etapas y objetivos de crecimiento.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/sistema_ventas_prototipe.md`**: Define el sistema estructurado de ventas de PROTOTIPE, regulando la clasificación inicial por WhatsApp, la fase de diagnóstico técnico, propuesta, cierre y escalabilidad post-pago.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/centralizacion_ganancias_desarrollador.md`**: Propuesta de arquitectura técnica y multitenancy para centralizar y unificar las métricas de ganancias y comisiones de múltiples clientes independientes.
* **`/Documentacion PROTOTIPE/05_Estrategia_Comercial_Ecosistema/Plantillas_de_Levantamiento/briefing_cliente.md`**: Cuestionario interactivo de alta precisión para levantar requerimientos del cliente en español mapeado con variables Ecosistema del código.
* **`/git_backup.ps1`**: Script de PowerShell para automatizar copias de seguridad (Git Backup) completas de todo el ecosistema (Maestro) de manera no disruptiva, forzando la rama `develop` de desarrollo al finalizar y consolidando el Auto-Merge de producción siempre hacia la rama estándar `main`. Actualizado en CLI-349.
* **`/subproject_backup.ps1`**: Script de PowerShell para realizar respaldos Git y commits en subproyectos de manera no disruptiva, forzando la rama de desarrollo `develop` para componentes base (Core/Dashboard) y consolidando la producción siempre hacia la rama estándar `main`. Actualizado en CLI-349.
* **`/menu_backup.ps1`**: Script de PowerShell con menú interactivo por consola para simplificar copias de seguridad de forma manual de manera no disruptiva sin detener servidores locales.
* **`/Prototipe-CLI/`**: Herramienta de línea de comandos (CLI) interactiva para automatizar el aprovisionamiento, copiado de plantillas, inyección de variables de entorno y bootstrapping de nuevos proyectos del ecosistema en `D:\PROTOTIPE\Instancias Clientes\{coreType}\` mediante spinners interactivos `ora`.
  * **`config.js`**: Módulo de configuración central que unifica la resolución de rutas de trabajo y del sistema, incluyendo la resolución dinámica de directorios de instancias basada en su `coreType` mediante `getInstancePath()`, y permitiendo la portabilidad mediante variables de entorno (`PROTOTIPE_WORKSPACE_ROOT`, `PROTOTIPE_DOCS_ROOT`).
  * **`logger.js`**: Logger estructurado que escribe registros formateados en `cli_bridge.log` y con colores en consola.
  * **`worker_create_project.js`**: Proceso hijo (worker) para la creación de proyectos asíncrona que gestiona la instalación de dependencias npm, la pre-compilación y la ejecución del smoke test headless de Playwright usando `require` nativo de CommonJS compatible con Windows y estado de espera `load` para tolerar conexiones SSE persistentes.
  * **`server.js`**: Servidor local Express que expone la API Bridge con el dev-dashboard.
    * **Endpoints de Creación e Integridad**:
      - `/api/create-project` **(SOLIDIFICADO - CORE-217 / AUTOMATIZACIÓN - CORE-263)**: Inicializa la creación en background en un worker asíncrono con timeout incrementado a 20 minutos, incorporando coerción defensiva de tipos en el payload. **Desde CORE-263**, al finalizar la provisión física del proyecto, `executeCreationTaskInBackground` invoca automáticamente `seedProjectDatabase(clientId)` para pre-poblar Firestore sin intervención manual. Los errores de sembrado son no-fatales y se registran en el log SSE del dashboard.
      - `/api/project/db/seed` **(REDISEÑADO - CORE-262/263)**: Sembrado declarativo y agnóstico basado en `seed.json`. La lógica fue extraída al helper reutilizable `seedProjectDatabase(clientId)`. Lee dinámicamente el `seed.json` de la carpeta fuente del core (si existe), interpola tokens `{{COLOR_PRIMARY}}`, `{{COLOR_SECONDARY}}`, `{{COLOR_BG}}` y `{{CURRENT_ISO_DATE}}` con los valores reales de la marca, y escribe los documentos en Firestore vía REST API con tipado nativo automático. Plantillas sin `seed.json` son omitidas de forma segura.
      - `/api/integrity/autofix` **(NUEVO - CORE-258)**: Endpoint POST que ejecuta autocuración del catálogo (limpieza de localhost, rutas absolutas en bloques JSX, tipo "atom" y auto-asignación de nichos) creando respaldos preventivos en `.prototipe-backup/autocure-backups/`.
    * **Endpoints de Roadmap y Gestión de Tareas**:
      - `GET /api/roadmap` **(EXTENDIDO - CORE-264)**: Parser enriquecido del archivo `tareas_pendientes.md`. Además de extraer título e ID CORE, ahora parsea el bloque `detail` de cada tarea para exponer: `status` (estado textual), `date` (fecha ISO), `description` (descripción técnica libre) y `files[]` (archivos afectados con su acción asociada: `MODIFY`, `NEW`, `DELETE`).
      - `POST /api/roadmap/add` **(NUEVO - CORE-264)**: Endpoint de escritura que crea nuevas tareas directamente en `tareas_pendientes.md` desde el dashboard. Implementa: auto-incremento del ID CORE (calcula `maxCORE + 1` en tiempo real), backup rotativo del archivo (`tareas_pendientes.YYYYMMDD-HHmmss.bak`) antes de cualquier escritura, y serialización segura mediante `WriteQueue` para prevenir condiciones de carrera en el sistema de archivos.
    * **Endpoints de Sincronización y Core**:
      - `/api/project/drift`: Detección de NPM drift (`mismatchDeps`, `missingDeps`, `addedDeps`), cálculo de desviaciones físicas y consistencia (`consistencyScore`), con soporte opcional de compilación Vite en seco (`buildAudit=true`).
      - `/api/project/sync-file` y `/api/project/sync-files`: Sincronización diferencial downstream Core → Instancias.
      - `/api/cores/*`: Sincronización y activación de plantillas Core en disco (`performCoreSync`).
      - `/api/cores/:clave/bump-version` **(NUEVO - CORE-212)**: Incrementa la versión SemVer patch del core, actualiza `package.json` del core fuente, `plantillas_registro.json` y re-sincroniza los archivos al directorio `templates/` del CLI. Las instancias de clientes quedan marcadas automáticamente como `isOutdated=true` en el siguiente refresco del CoreSyncPanel.
      - `/api/project/fix/*`: Arreglos correctivos en caliente (reglas Firebase, Storage e índices).
      - `/api/project/cleanup` **(MEJORADO - CORE-263)**: Limpiador seguro de temporales de desarrollo (`.vite`, `.vite-temp`, `dist`, `build`, `.tmp`). Acepta el parámetro `scanOnly: true` para retornar un reporte de auditoría pre-purgado (`scan[]` con `name`, `path`, `exists`, `type`, `safe`) sin eliminar nada. El endpoint de deploy `/api/project/deploy` ejecuta automáticamente una purga como paso preflight antes de compilar.
    * **Endpoints de Firebase y Storage**:
      - `/api/project/firebase/cors-setup`: Configuración automatizada de reglas CORS de Firebase Storage con fallback a `.firebasestorage.app` e in-memory caching (`storageBucketCache`).
    * **Endpoints de Git**:
      - `/api/git/*`: Control de versiones Git (commits, diff-file, descarte, SSE streams).
        - `GET /api/git/compare-drift`: Compara la rama base del Core vs cliente, computando ahead/behind, colisiones de archivos y nivel de riesgo.
        - `GET /api/git/unpushed-commits`: Lista commits locales no pusheados con análisis Conventional Commits.
        - `POST /api/git/amend-commit`: Enmenda el HEAD local con verificación previa de existencia remota.
    * **Endpoints de Inyección de Componentes**:
      - `/api/library/inject/*`: Diagnóstico preflight, reescritura de imports, backups y rollback guiado.
    * **Servicios de Logs e Instalación**:
      - `/api/project/dependencies/install`: Gestor asíncrono de instalación de dependencias NPM vía SSE.
      - `/api/project/dev/logs-stream`: Streaming de logs de servidores de desarrollo locales activos.
  * **`generator.js`**: Motor de aprovisionamiento de proyectos.
    * **Acciones Principales**:
      - Copia y estructuración de plantillas por tipo de Core.
      - Autogeneración de reglas restrictivas para Storage/Firestore.
      - Configuración dinámica HSL y redimensionamiento inteligente de logotipos con Jimp (con fallback resiliente).
      - Inyección cromática defensiva completa y mapeo de tokens HSL en `guia_estilos_ui.md` y `index.css`.
* **`/Documentacion PROTOTIPE/06_Biblioteca_Componentes/`**: Catálogo central de componentes reutilizables y atómicos.
  * **`Formularios_y_UI/Carrito_Completo/carrito_completo.md`**: Módulo integral de Carrito de Compras (Store reactivo Zustand + CartDrawer visual animado).
  * **`Formularios_y_UI/Checkout_Modal/checkout_modal.md`**: Modal Multipaso Wizard de Checkout y formalización de pedidos para WhatsApp.
  * **`Servicios_y_Firebase/Sincronizacion_Firebase/sincronizacion_firebase.md`**: Hook reactivo genérico `useFirestoreCollection` para escuchar Firestore en tiempo real con soporte de caché offline local.
  * **`Formularios_y_UI/Tarjeta_Producto/tarjeta_producto.md`**: Tarjeta visual de producto adaptativa (`ProductCard`) con soporte grid/list y efecto Glow de neón.
  * **`Formularios_y_UI/Rejilla_Catalogo/rejilla_catalogo.md`**: Rejilla responsiva inteligente (`CatalogGrid`) con transiciones fluidas de layouts (grid/list) y Empty State reactivo comercial.
  * **`Formularios_y_UI/Stepper_Pedidos/stepper_pedidos.md`**: Stepper premium responsivo de seguimiento de pedidos (`OrderTrackingTimeline`) con micro-animaciones.
  * **`Formularios_y_UI/Seguimiento_Pedido/seguimiento_pedido.md`**: Portal público de seguimiento del progreso de pedidos (`OrderTracking`) desacoplado de rutas directas.
  * **`Formularios_y_UI/Gestor_Categorias/gestor_categorias.md`**: UI stateless para administrar, crear, editar y eliminar categorías con buscador e íconos SVG integrados.
  * **`Formularios_y_UI/Selector_Variantes/variant_selector.md`**: Interfaz atómica interactiva premium para seleccionar atributos combinados (talla, color, material) con validación de stock en tiempo real y deshabilitación de combinaciones agotadas.
  * **`Visualizacion/Alertas_Stock_Critico/admin_stock_alerts.md`**: Panel de reabastecimiento e inventario crítico (`AdminStockAlerts`) with aplanamiento de variantes.
  * **`Servicios_y_Firebase/Generacion_PDF/generacion_pdf.md`**: Motor dinámico y de marca blanca para exportar y descargar reportes PDF.
  * **`00_Core_Ecosistema_Obligatorios/Facturacion_y_Firma_Digital/facturacion_y_firma_digital.md`**: Panel de facturación del desarrollador con cálculo comisional multi-modo y firma táctil en canvas.
  * **`04_Estandares_y_Skills/propuesta_50_componentes_atomicos.md`**: Catálogo detallado de 50 componentes atómicos interactivos premium diseñados en React + Tailwind + Framer Motion.
  * **`Laundry/Selector_Tipo_Prenda_Lavado/selector_tipo_prenda_lavado.md`**: Selector de prendas con temperatura sugerida y precios.
  * **`Laundry/Calculadora_Lavado_Kilos/calculadora_lavado_kilos.md`**: Calculadora de cobro por kilos de ropa con slider.
  * **`Laundry/Programador_Rutas_Domicilio/programador_rutas_domicilio.md`**: Agendamiento de rutas con chips de fechas/horas.
  * **`Laundry/Ficha_Reporte_Manchas/ficha_reporte_manchas.md`**: Reporte de manchas interactivas sobre silueta de prenda.
  * **`Laundry/Selector_Fragancia_Suavizante/selector_fragancia_suavizante.md`**: Configuración de aromas y detergente hipoalergénico.
  * **`Laundry/Tarjeta_Sesion_Autoservicio/tarjeta_sesion_autoservicio.md`**: Estado de lavadora/secadora con temporizador regresivo.
  * **`Laundry/Buscador_Percheros_Ropa/buscador_percheros_ropa.md`**: Localizador de percheros físicos por ticket con mapa visual.
  * **`Laundry/Selector_Velocidad_Servicio/selector_velocidad_servicio.md`**: Selector de velocidad de entrega con recargos dinámicos.
  * **`Laundry/Saldo_Puntos_Fidelizacion/saldo_puntos_fidelizacion.md`**: KPI de fidelización y anillo de progreso circular SVG.
  * **`Laundry/Cuadricula_Prendas_Olvidas/cuadricula_prendas_olvidas.md`**: Listado Lost & Found con búsqueda libre.
  * **`Furniture_Repair/Selector_Telas_Texturas/selector_telas_texturas.md`**: Selector de telas por nivel de resistencia y coste de metro.
  * **`Furniture_Repair/CalculadoraMetrajeTela/calculadora_metraje_tela.md`**: Estimador de metros de tela según mueble con margen de seguridad del 10%.
  * **`Furniture_Repair/SelectorDensidadEspuma/selector_densidad_espuma.md`**: Selector de firmeza de espuma y resortes.
  * **`Furniture_Repair/CargadorFotosRestauracion/cargador_fotos_restauracion.md`**: Diagnóstico por imágenes del estado del mueble por zonas.
  * **`Furniture_Repair/SelectorAcabadoPatas/selector_acabado_patas.md`**: Selector de barniz y tintes para las patas de madera.
  * **`Furniture_Repair/SeguimientoFasesRestauracion/seguimiento_fases_restauracion.md`**: Stepper de 6 fases del proceso de tapicería.
  * **`Furniture_Repair/Selector_Estilo_Costuras/selector_estilo_costuras.md`**: Selector de costura decorativa y capitoné.
  * **`Furniture_Repair/Calculadora_Flete_Muebles/calculadora_flete_muebles.md`**: Calculadora de transporte según peso, volumen y escaleras.
  * **`Furniture_Repair/Manual_Cuidado_Tapiceria/manual_cuidado_tapiceria.md`**: Accordion de guía de cuidado e indicaciones SÍ/NO por material.
  * **`Furniture_Repair/Toggle_Impermeabilizacion/toggle_impermeabilizacion.md`**: Adición del servicio de teflonado con animación y garantía.
  * **`Wellness_Podology/HistorialClinicoPodologia/historial_clinico_podologia.md`**: Formulario clínico de antecedentes (diabetes, hemofilia) y patologías.
  * **`Wellness_Podology/MapaAnatomicoPie/mapa_anatomico_pie.md`**: Marcador interactivo sobre silueta SVG para patologías del pie.
  * **`Wellness_Podology/SelectorServicioCabina/selector_servicio_cabina.md`**: Selector de servicios, terapeutas y cabinas de tratamiento asignadas.
  * **`Wellness_Podology/SelectorProfesionalStaff/selector_profesional_staff.md`**: Grid responsiva de terapeutas con turnos y calificación en vivo.
  * **`Wellness_Podology/ConsentimientoFirmaDigital/consentimiento_firma_digital.md`**: Documento legal con scroll de seguridad y Canvas para firma digital.
  * **`Wellness_Podology/SelectorAceitesEsenciales/selector_aceites_esenciales.md`**: Dosificador de aromas de aromaterapia con exclusión por alergias.
  * **`Wellness_Podology/RegistroEsterilizacionAutoclave/registro_esterilizacion_autoclave.md`**: Historial de autoclave con curvas SVG de temperatura y presión.
  * **`Wellness_Podology/ProgramadorSesionesPaquete/programador_sesiones_paquete.md`**: Programador en lote de citas de tratamientos con barra de progreso.
  * **`Wellness_Podology/TarjetasProductosPostCuidado/tarjetas_productos_post_cuidado.md`**: Recomendador de cremas y plantillas complementarias post-tratamiento.
  * **`Wellness_Podology/VisorAnalisisPisada/visor_analisis_pisada.md`**: Mapa plantar SVG interactivo con simulador dinámico del ciclo de marcha.
  * **`Grocery_Food/SelectorCantidadGranel/selector_cantidad_granel.md`**: Selector de pesaje con balanza virtual y conversión de unidades.
  * **`Grocery_Food/AlertaVencimientoLotes/alerta_vencimiento_lotes.md`**: Tablero de alertas de caducidad de productos con descuento automático.
  * **`Grocery_Food/BuscadorCodigoPLU/buscador_codigo_plu.md`**: Teclado rápido y motor predictivo para productos a granel sin barras.
  * **`Grocery_Food/CalculadoraCombosOfertas/calculadora_combos_ofertas.md`**: Simulador interactivo de promociones cruzadas y combos con cálculo de ahorro.
  * **`Grocery_Food/FormularioAbastecimientoGondolas/formulario_abastecimiento_gondolas.md`**: Auditoría de existencias en góndolas por pasillo y reposición a bodega.
  * **`Grocery_Food/SelectorHorariosRetiro/selector_horarios_retiro.md`**: Programador de franjas horarias logísticas con tarifas dinámicas.
  * **`Grocery_Food/AdvertenciaNutricionalAlergenos/advertencia_nutricional_alergenos.md`**: Validador de sellos y alérgenos cruzados con ficha de cliente.
  * **`Grocery_Food/FormularioMermasDesperdicios/formulario_mermas_desperdicios.md`**: Control contable de pérdidas por daño, vencimiento o hurto.
  * **`Grocery_Food/PlantillaComprasRecurrentes/plantilla_compras_recurrentes.md`**: Programación de pedidos recurrentes y autocompletado en un clic.
  * **`Grocery_Food/CuadriculaOfertasDia/cuadricula_ofertas_dia.md`**: Vitrina responsiva de ofertas relámpago con temporizador regresivo.
  * **`Insumos_Agricolas/BuscadorCompatibilidadInsumos/buscador_compatibilidad_insumos.md`**: Filtro interactivo de compatibilidad química y fitotoxicidad de insumos por tipo de cultivo.
  * **`Insumos_Agricolas/CalculadoraRendimientoDosificacion/calculadora_rendimiento_dosificacion.md`**: Calculadora de dosis y sacos requeridos según el área de siembra (Ha/m²).
  * **`Insumos_Agricolas/FormularioPedidoMayorista/formulario_pedido_mayorista.md`**: Formulario matricial de pedidos por volumen y fletes pesados con confirmación modal.
  * **`Alimentos_Artesanales/ConfiguradorPastelesEventos/configurador_pasteles_eventos.md`**: Asistente interactivo paso a paso para configurar pasteles de eventos, masa, cobertura, dedicatoria y cálculo de abono del 50%.
  * **`Alimentos_Artesanales/BloqueadorCalendarioEntregas/bloqueador_calendario_entregas.md`**: Calendario interactivo de franjas horarias con bloqueo de capacidad operativa por saturación de hornos.
  * **`Alimentos_Artesanales/ModuloPresupuestoMesasDulces/modulo_presupuesto_mesas_dulces.md`**: Cotizador y distribuidor automático de bocados dulces en múltiplos de 6 según número de invitados y tipo de evento.
  * **`Ferreteria_Rural/Selector_Calibre_Alambre/selector_calibre_alambre.md`**: Configurador de cercados de alambre de púas, galvanizados y concertinas con cálculo dinámico de metraje, peso y cotización comercial.
* **`/Documentacion PROTOTIPE/09_Modulos_Completos/`**: Catálogo de Módulos Completos (Ecosistema Features).
  * **`Caja_Diaria_POS/caja_diaria_pos.md`**: Apertura de caja, transacciones de flujo auxiliar, arqueo físico vs esperado HSL y lienzo interactivo para firmas.
  * **`Creditos_y_Saldos/creditos_saldos.md`**: Lógica de créditos, cuentas por cobrar, abonos y estado de cuentas de clientes.
  * **`Omnicanalidad_WhatsApp/omnicanalidad.md`**: Módulo de redirecciones y plantillas dinámicas de WhatsApp.
  * **`Telemetria_Centralizada/telemetria_centralizada.md`**: Monitoreo y subida de telemetría de facturación y logs a Firestore.
  * **`Reservas_Agenda_Citas/reservas_agenda_citas.md`**: Agenda interactiva semanal y cuadrícula de horarios asignables para servicios y reservas profesionales.
  * **`POS_Express_Scanner/pos_express_scanner.md`**: Módulo de checkout veloz en caja que interpreta eventos de lectores de códigos de barra físicos.
  * **`Ordenes_Trabajo_Equipos/ordenes_trabajo_equipos.md`**: Ficha de control de recepción de maquinaria y equipos para diagnóstico, repuestos y firma digital.
  * **`Pantalla_Cocina_KDS/pantalla_cocina_kds.md`**: Monitor interactivo de cocina en tiempo real (KDS) con semáforo cronológico de tiempos de preparación y alertas auditivas sintéticas (Web Audio API).
* **`/Documentacion PROTOTIPE/Manuales/`**: Carpeta jerárquica de manuales técnicos de desarrollo de Rápido Entendimiento para el programador.
  * **`README.md`**: Consola de Control Visual indexando y clasificando manuales por complejidad, tecnologías e impacto.
  * **`Arquitectura_Multi_Instancia/Configuracion_Marca/manual_brand_config.md`**: Guía técnica de personalización, HSL dinámico y script de siembra.
  * **`Arquitectura_Multi_Instancia/Configuracion_Marca/manual_centralizacion_comisiones.md`**: Guía técnica de implementación de telemetría y consolidación HTTP de comisiones en servidor central.
  * **`Arquitectura_Multi_Instancia/Configuracion_Marca/manual_nichos_servicios.md`**: Manual de Verticales de Servicios y Operaciones Técnicas a la Medida, detallando modelado de atributos, workflows y lógica de 8 industrias de servicios técnicos y talleres.
  * **`Paginas/Seguimiento_Pedido/manual_order_tracking.md`**: Guía de seguridad de tokens UUID y reglas compuestas de Firestore.
  * **`Visualizacion/Alertas_Stock/manual_admin_stock_alerts.md`**: Guía del algoritmo de stock crítico y transacciones concurrentes de inventario.
  * **`Servicios_y_Firebase/Generacion_PDF/manual_generacion_pdf.md`**: Guía técnica del procesamiento vectorial A4 y plugin de AutoTable. Detalla la lógica de reportes financieros y de caja (conciliación líquida vs cuentas por cobrar, y dinámica de empleados/vendedores) y el reporte de rotación/inventario 360° (tasa Sell-Through, Runway en días de stock, Pareto ABC del 80/20 y alertas dinámicas ante desactivación global de variantes).
  * **`Servicios_y_Firebase/Omnicanalidad_WhatsApp/manual_whatsapp_notifications.md`**: Guía técnica del parseo dinámico de templates de chat y APIs libres de cobro.
  * **`Servicios_y_Firebase/Creditos_y_Saldos/manual_credits_and_balances.md`**: Guía técnica de la mitigación de race conditions en cajas multi-vendedor con transacciones.
  * **`Paginas/Compra_por_QR/manual_compra_qr.md`**: Guía técnica del flujo de redirección por URL parametrizada, inicio de sesión express e integración de códigos QR en el catálogo.

* **`/Documentacion PROTOTIPE/Estandar de Desarrollo/`**: Guías técnicas, reglas de diseño y arquitectura.
  * **`inicializacion_nuevos_proyectos.md`**: Protocolo obligatorio y checklist paso a paso de bootstrap para nuevos proyectos de software (verificaciones de paridad, inicialización local y biblioteca de componentes).
  * **`guia_facturacion_dian_comisiones.md`**: Estándar técnico para la implementación y control de facturación electrónica DIAN y comisiones comisionales sobre base imponible.
  * **`mapa_documentacion_ia.md`**: Mapa semántico global de la documentación. GPS principal de la IA para localizar instantáneamente cualquier manual, componente, bitácora o estándar.
  * **`Copia_Seguridad_Reglas_y_Skills/`**: Directorio de resguardo de las reglas de comportamiento globales de la IA (`GEMINI.md`) y las habilidades o skills de automatización (`Skills/`).
    * **`Skills/sandbox_integrator/SKILL.md`**: Skill para registrar e integrar dinámicamente playgrounds de componentes manuales en el dashboard (`@sandbox`).
    * **`Skills/portar_componente/SKILL.md`**: Skill para portar, adaptar e inyectar automáticamente código de componentes a proyectos del disco (`@portar-componente`).
  * **`Copia_Seguridad_Reglas_y_Skills/sync_rules.js`**: Script de sincronización dinámica de reglas de IA para clonar de forma proactiva y automática el archivo GEMINI.md a todos los subproyectos y plantillas del CLI.
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_rendimiento_db_2026.md`**: Informe técnico de optimización de lecturas/escrituras en base de datos Firestore, sincronización delta para IndexedDB en POS y solución de lecturas duplicadas en montaje de hooks de pedidos.
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/analisis_costos_firebase_2026.md`**: Informe técnico detallado analizando la procedencia del cobro de $2 USD por almacenamiento de imágenes en Cloud Functions en el proyecto Ventas, y el plan de prevención/mitigación para retornar a $0 USD.
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/auditoria_replicacion_cores_2026.md`**: Análisis de seguridad, robustez y conectividad central del motor de aprovisionamiento de marcas blancas al clonar Cores genéricos actuales y futuros.
* **`/Documentacion PROTOTIPE/03_Auditorias_y_Faro_Core/analisis_adaptabilidad_core_seed.md`**: Informe técnico de diagnóstico, brechas y propuestas de adaptabilidad del Core Seed para marcas blancas en cualquier nicho. [NEW] CLI-365.
* **`/Documentacion PROTOTIPE/Tareas Pendientes/`**: Bitácora y estado del roadmap del proyecto.
  * **`tareas_pendientes.md`**: Lista general de tareas completadas, en progreso e hitos de desarrollo técnico.
  * **`tareas_pendientes_prioritarias.md`**: Backlog prioritario de desarrollo e infraestructura futura (como la centralización de comisiones) que se ejecutará bajo tu consentimiento.
<!-- START_AUTO_CORES_APP -->
### 📂 Carpeta del Core de App Ventas
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/tareas_pendientes.md`**: Control de Tareas y Estado de Implementación.
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/bitacora_cambios.md`**: Bitácora de Cambios y Control de Versiones.
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/mapa_aplicacion.md`**: Mapa de la Aplicación (Arquitectura Física).
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/esquema_colecciones.md`**: Esquema y Propósito de Colecciones de Base de Datos (Firestore).
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/plan_implementacion_ia.md`**: Plan de Implementación y Roadmaps de Inteligencia Artificial.
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/manual_migracion.md`**: Manual de Despliegue y Configuraciones Locales.
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/flujos_aplicacion.md`**: Flujos Operativos y Diagramas de Secuencia.
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/mapa_arquitectura.md`**: Mapa de Arquitectura Física y Árbol de Código.
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/mapa_arquitectura_ia.md`**: Mapa Semántico de Rutas para Inteligencia Artificial.
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/contexto_negocio.md`**: Contexto de Negocio y Reglas Operativas del Dominio.
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/restricciones_tecnicas.md`**: Restricciones Técnicas y Patrones Prohibidos.
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/guia_estilos_ui.md`**: Guía de Estilos de UI y Sistema de Diseño del Core.

<!-- END_AUTO_CORES_APP -->




---

## 📂 Estructura de Módulos y Archivos Clave
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/CorePromotionModal.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-456).
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/guia_multitenant.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-373).
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/estrategia_testing.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-373).
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/modelo_firestore.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-373).
* **`/Plantillas Core/App Ventas/Documentacion App Ventas/arquitectura_features.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-373).
* **`/Plantillas Core/App Ventas/.github/workflows/ci.yml`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-373).
* **`/Plantillas Core/App Ventas/tests/unit/orderService.extended.spec.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-373).
* **`/Plantillas Core/App Ventas/tests/unit/creditService.spec.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-373).
* **`/Plantillas Core/App Ventas/tests/unit/inventoryService.spec.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-373).
* **`/Prototipe-CLI/templates/template-core-seed/template.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-374).
* **`/Prototipe-CLI/templates/template-core-seed/tests/e2e/app-health.spec.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-374).
* **`/Prototipe-CLI/templates/template-core-seed/tests/unit/smoke.spec.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-374).
* **`/Prototipe-CLI/templates/template-core-seed/.github/workflows/ci.yml`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-374).
* **`/Prototipe-CLI/templates/template-core-seed/vitest.config.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-374).
* **`/Plantillas Core/App Ventas/src/routes/AppRoutes.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-379).
* **`/Plantillas Core/App Ventas/src/hooks/useCartRecommendations.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-380).
* **`/Plantillas Core/App Ventas/tests/unit/salesService.spec.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-380).
* **`/Plantillas Core/App Ventas/src/features/delivery/routes.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-380).
* **`/Plantillas Core/App Ventas/src/features/credits/routes.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-380).
* **`/Plantillas Core/App Ventas/src/features/orders/routes.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-380).
* **`/Plantillas Core/App Ventas/src/features/sales/services/salesService.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-380).
* **`/Plantillas Core/App Ventas/src/features/sales/routes.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-380).
* **`/Plantillas Core/App Ventas/src/features/inventory/routes.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-380).
* **`/Prototipe-CLI/verticals`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-392).
* **`/Prototipe-CLI/package-lock.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-392).
* **`/Prototipe-CLI/scripts/tests/p0_2/test_blueprint_no_write.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-407).
* **`/Prototipe-CLI/scripts/tests/p0_2/test_bridge_contract.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-408).
* **`/Prototipe-CLI/scripts/tests/p0_2/run_p0_2_contract_tests.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-409).
* **`/Prototipe-CLI/scripts/tests/p0_2/test_dashboard_payload_contract.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-409).
* **`/Central PROTOTIPE/dev-dashboard/src/utils/provisioningPayload.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-409).
* **`/Prototipe-CLI/scripts/tests/p0_3/run_p0_3_security_tests.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-412).
* **`/Prototipe-CLI/lib/ProvisioningEnvelopeAdapter.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-413).
* **`/Prototipe-CLI/scripts/tests/p0_3/test_scaffolding_security.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-415).
* **`/Prototipe-CLI/lib/SecretRedactor.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-415).
* **`/Prototipe-CLI/lib/PathSecurity.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-416).
* **`/Prototipe-CLI/scripts/tests/p0_4/run_p0_4_lifecycle_tests.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-418).
* **`/Prototipe-CLI/scripts/tests/p0_4/test_lifecycle_observability.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-418).
* **`/Prototipe-CLI/scripts/tests/p0_6/run_p0_6_queue_tests.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-427).
* **`/Prototipe-CLI/scripts/tests/p0_6/test_provisioning_queue.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-427).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/BrandIconsSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-445).
* **`/Central PROTOTIPE/dev-dashboard/src/components/ui/BrandIcons.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-445).
* **`/Plantillas Core/App Ventas/src/components/admin/settings/DeliveryCustomMessengerPanel.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-446).
* **`/Plantillas Core/App Ventas/src/components/admin/orders/OrderDeliveryPanel.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-446).
* **`/Prototipe-CLI/scripts/test_support/normalize_result.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-451).
* **`/Prototipe-CLI/scripts/test_support/network_guard.mjs`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-451).
* **`/Prototipe-CLI/scripts/test_characterization_record.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-451).
* **`/Prototipe-CLI/lib/FeatureArtifactGenerator.js`**: Generador de manifiestos, catálogo y defaults a partir del registry de features (Fase 0C).
* **`/Prototipe-CLI/run_artifact_generator.js`**: Script de utilidad para regenerar artefactos locales (Fase 0C).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FloatingPromoGrenadeSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea COMP-359).
* **`/Central PROTOTIPE/dev-dashboard/src/components/common/FloatingPromoGrenade.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea COMP-359).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/InteractiveFortuneCookieSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea COMP-360).
* **`/Central PROTOTIPE/dev-dashboard/src/components/common/InteractiveFortuneCookie.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea COMP-360).
* **`/Central PROTOTIPE/dev-dashboard/src/components/common/RaffleWheelOfFortune.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-363).
* **`/Central PROTOTIPE/dev-dashboard/src/components/common/InteractiveFortuneWheel.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-363).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/InteractiveFortuneWheelSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-363).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/RaffleWheelOfFortuneSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-363).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CatalogBannerSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-363).
* **`/Instancias Clientes/ventas/ventas-moni-app/.firebase/hosting.ZGlzdA.cache`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-312).
* **`/Instancias Clientes/ventas/ventas-moni-app/src/components/client/catalog/ClientFilterModal.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-312).
* **`/Plantillas Core/App Ventas/src/components/client/catalog/ClientFilterModal.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-312).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/generacion_pdfSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-299).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/LeafletMapPickerSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-300).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ProgramadorRutasDomicilioSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-301).
* **`/Instancias Clientes/ventas/ventas-moni-app/prototipe.lock.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-319).
* **`/Prototipe-CLI/templates/template-ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-319).
* **`/Plantillas Core/App Ventas/src/pages/admin/settings/sections/DeveloperSettings.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-319).
* **`/Prototipe-CLI/templates/template-ventas/src/pages/client/ClientCredits.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-319).
* **`/Plantillas Core/App Ventas/src/pages/client/ClientCredits.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-319).
* **`/Prototipe-CLI/scripts/toggle_maintenance.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-319).
* **`/Prototipe-CLI/templates/template-ventas/src/store/appConfigStore.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-319).
* **`/Prototipe-CLI/templates/template-ventas/src/services/appConfigService.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-319).
* **`/Plantillas Core/App Ventas/src/store/appConfigStore.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-319).
* **`/Plantillas Core/App Ventas/src/services/appConfigService.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-319).
* **`/Prototipe-CLI/templates/template-core-seed/src/components/common/SparkQuotaBanner.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-316).
* **`/Prototipe-CLI/templates/template-core-seed/src/services/telemetryService.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-316).
* **`/Prototipe-CLI/templates/template-ventas/src/components/common/SparkQuotaBanner.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-316).
* **`/Prototipe-CLI/templates/template-ventas/src/services/telemetryService.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-316).
* **`/Plantillas Core/App Ventas/src/components/common/SparkQuotaBanner.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-316).
* **`/Prototipe-CLI/scripts/offboard_client.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-316).
* **`/Prototipe-CLI/scripts/backup_db.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-316).
* **`/Instancias Clientes/ventas/ventas-moni-app/.prototipe.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-284).
* **`/Prototipe-CLI/templates/template-core-seed/src/layouts/MainLayout.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-296).
* **`/consolidar_notebook.bat`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-281).
* **`/Plantillas Core/App Ventas/src/pages/portal/PortalMensajero.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-006).
* **`/Plantillas Core/App Ventas/src/pages/admin/settings/sections/AppearanceSettings.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-008).
* **`/Plantillas Core/App Ventas/src/services/orderService.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-010).
* **`/Plantillas Core/App Ventas/src/schemas/inventorySchemas.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-010).
* **`/Plantillas Core/App Ventas/src/schemas/appConfigSchema.js`**: Esquema de validación Zod con fallbacks automáticos para configuraciones Firestore (Tarea CORE-328).
* **`/Prototipe-CLI/templates/template-core-seed/src/constants/index.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-020).
* **`/Prototipe-CLI/templates/template-core-seed/src/features/billing/index.js`**: Stub de compilación que exporta un suscriptor no-op `subscribeToBillingData` para resolver dependencias cuando la feature no se aprovisiona (Tarea CLI-438).
* **`/Central PROTOTIPE/dev-dashboard/src/services/pdfService.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-023).
* **`/Plantillas Core/App Ventas/tests/helpers/checkout.helpers.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea LINE-2007).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/ComponentLibraryView.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-030).
* **`/Prototipe-CLI/server.js`**: Puente de API local de la consola de administración. Incluye la corrección para execSync indefinido en el despliegue de reglas Firebase y el middleware de autenticación criptográfica Firebase Auth/RBAC. Actualizado en CLI-397.
* **`/Prototipe-CLI/knowledge/core-promotion/promotion-blueprint.schema.json`**: JSON Schema del blueprint de promoción en formato Draft-07. [NEW] CLI-397.
* **`/Prototipe-CLI/knowledge/core-promotion/lineage-migration.schema.json`**: JSON Schema del blueprint de migración de linajes de clientes. [NEW] CLI-397.
* **`/Prototipe-CLI/knowledge/core-promotion/journal.schema.json`**: JSON Schema del journal transaccional de operaciones del monorepo. [NEW] CLI-397.
* **`/Prototipe-CLI/knowledge/core-promotion/file-policy.json`**: Configuración de políticas granulares de exclusión y transformación en staging. [NEW] CLI-397.
* **`/Prototipe-CLI/knowledge/core-promotion/seed-rules.json`**: Reglas de filtrado y anonimización de colecciones/campos para seeds. [NEW] CLI-397.
* **`/Prototipe-CLI/lib/PromotionBlueprintBuilder.js`**: Lector/escritor seguro de blueprints y journals con validación AJV y protección Prototype Pollution. [NEW] CLI-397.
* **`/Prototipe-CLI/lib/CorePromotionService.js`**: Coordinador general del pipeline y encargado de la rutina de recuperación tras reinicio del Bridge. [NEW] CLI-397.
* **`/Prototipe-CLI/lib/CoreCandidateBuilder.js`**: Constructor del core candidato en staging aplicando file-policy.json y reescritura de namespaces. [NEW] CLI-399.
* **`/Prototipe-CLI/lib/CorePromotionValidator.js`**: Validador de staging. Escanea secretos, PII, verifica features, anonimiza seeds y compila producción Vite. [NEW] CLI-399.
* **`/Prototipe-CLI/lib/BriefingDocumentMapper.js`**: Mapeador de especificaciones de gobernanza del core a partir de briefings y blueprints. [NEW] CLI-399.
* **`/Prototipe-CLI/notification_server.js`**: Servidor de notificaciones Telegram del ecosistema. Incluye ciclo de polling de comandos, Inline Keyboards, State Machine para wizard /addtask, interceptor AWAITING_TEXT, y soporte multi-canal. Incorpora los módulos remotos de control de versiones de Git (/git), administración de dev servers Vite (/devserver), herramientas de autocuración (/fix), matriz de desviación de reglas Firebase (/rules), diagnósticos de Playwright (/tests), e inventario de Cores semilla (/cores). Robustecido con manejadores de excepciones y aislamiento de updates. Implementa los comandos `/telemetria` y `/telemetria_check` para auditar transmisiones mensuales. Robustecido con cerrojo de refresco de tokens OAuth2, polling seguro no solapado con setTimeout y Graceful Shutdown en señales SIGINT/SIGTERM. [MODIFY] CLI-365.
* **`/Prototipe-CLI/notification_config.json`**: Archivo de configuración local para los canales de Telegram (tokens, chat IDs por subcanal). Excluido del linter de integridad por ser artefacto de credenciales de entorno. [NEW] CLI-341.
* **`/Central PROTOTIPE/dev-dashboard/src/components/ui/DarkModeToggle.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-032).
* **`/Central PROTOTIPE/dev-dashboard/src/index.css`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-032).
* **`/Prototipe-CLI/generator.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-033).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SandboxLayout.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-054).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/PWAInstallBannerSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-054).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CatalogFiltersSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-054).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/OrderTrackingSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-054).
* **`/Central PROTOTIPE/dev-dashboard/src/components/common/HybridLoginPage.jsx`**: Componente de página de Login Híbrido unificado para clientes (OTP) y equipo (Email/Password). [NEW] CLI-362.
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/LoginPageSandbox.jsx`**: Playground de la página de Login Híbrida. Modificado para renderizar HybridLoginPage.jsx. [MODIFY] CLI-362.
* **`/Central PROTOTIPE/dev-dashboard/src/components/common/PhoneIdLoginPage.jsx`**: Componente de página de Login por Teléfono ID (sin OTP) para clientes y equipo (Email/Password). [NEW] CLI-363.
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/PhoneIdLoginPageSandbox.jsx`**: Playground de la página de Login por Teléfono ID. [NEW] CLI-363.
* **`/Central PROTOTIPE/dev-dashboard/src/components/common/PremiumNotificationCenter.jsx`**: Componente de bandeja de notificaciones premium con mitigación de bloqueos táctiles. [NEW] CLI-364.
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/PremiumNotificationCenterSandbox.jsx`**: Playground del centro de notificaciones premium. [NEW] CLI-364.
* **`/Central PROTOTIPE/dev-dashboard/src/components/common/PremiumWelcomeSplash.jsx`**: Componente de pantalla de bienvenida con ondas sonar y orbes ambientales. [NEW] CLI-365.
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/WelcomePageSandbox.jsx`**: Playground de la pantalla de bienvenida. Modificado para renderizar PremiumWelcomeSplash.jsx. [MODIFY] CLI-365.
* **`/Central PROTOTIPE/dev-dashboard/src/components/common/ScratchCardReward.jsx`**: Componente de tarjeta de rasca y gana con físicas de Canvas HTML5. [NEW] CLI-366.
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ScratchCardRewardSandbox.jsx`**: Playground de la tarjeta de rasca y gana interactiva. [NEW] CLI-366.
* **`/Central PROTOTIPE/dev-dashboard/src/components/common/InteractiveGoldPot.jsx`**: Componente de olla de oro interactiva con físicas de Framer Motion y crecimiento gradual. [NEW] CLI-367.
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/InteractiveGoldPotSandbox.jsx`**: Playground de la olla de oro interactiva de ahorro. [NEW] CLI-367.
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FormularioProductoIASandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-054).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ReservasAgendaSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/POSExpressScannerSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/OrdenesTrabajoEquiposSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/OmnicanalidadWhatsAppSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FacturacionComisionalSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CreditosSaldosSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CajaDiariaPOSSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SelectorBoletasRifasSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ReservasAgendaCitasSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-179).
* **`/C:/Users/Sergio/.gemini/antigravity/brain/2384f55b-7e9d-4a85-8d9d-5b3de0516db9/reporte_auditoria_ecosistema_completo.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-236).
* **`/sincronizacion_templates_universal.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CLI-013).
* **`/checklist_auditoria_core.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-001).
* **`/propuesta_panel_skills_dashboard.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-129).
* **`/backup.log`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-034).
* **`/Prototipe-CLI/sync_clients.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-053).
* **`/Instancias Clientes/ventas/ventas-moni-app/scripts/generate_ia_map.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-087).
* **`/Instancias Clientes/ventas/ventas-moni-app/.env.local`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-087).
* **`/Plantillas Core/App Ventas/.gitignore`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-099).
* **`/Instancias Clientes/ventas/ventas-moni-app/.gitignore`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-099).
* **`/.gitignore`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-099).
* **`/Prototipe-CLI/cli.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-103).
* **`/Prototipe-CLI/sync_templates.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-108).
* **`/Central PROTOTIPE/dev-dashboard/public/landing/sw.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-109).
* **`/LandingPage/sw.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-113).
* **`/LandingPage/css/styles.css`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-113).
* **`/LandingPage/js/app.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-113).
* **`/Prototipe-CLI/templates/template-ventas/jsconfig.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-119).
* **`/Instancias Clientes/ventas/ventas-moni-app/jsconfig.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-119).
* **`/Plantillas Core/App Ventas/jsconfig.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-119).
* **`/Central PROTOTIPE/dev-dashboard/jsconfig.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-119).
* **`/Central PROTOTIPE/dev-dashboard/vite.config.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-119).
* **`/Plantillas Core/App Ventas/core-manifest.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-138).
* **`/Central PROTOTIPE/dev-dashboard/firestore.rules`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-139).
* **`/Prototipe-CLI/templates/template-ventas/src/pages/LoginPage.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-148).
* **`/Instancias Clientes/ventas/ventas-moni-app/firestore.rules`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-149).
* **`/Instancias Clientes/ventas/ventas-moni-app/src/pages/LoginPage.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-149).
* **`/Plantillas Core/App Ventas/src/pages/LoginPage.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-149).
* **`/Plantillas Core/App Ventas/src/pages/client/ClientProfile.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-157).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CircularDishMenuSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-159).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/ModuloAgendamientoBarberiaSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-162).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CarrucelProductosSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-163).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/InfiniteLogoMarqueeSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-164).
* **`/Prototipe-CLI/scripts/classify_existing_library.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-168).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SelectorTallasColoresSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-169).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/SelectorCalibreAlambreSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-194).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/FloatingMenuTriggerSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-206).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/sandboxes/CreditCardInteractiveFlipSandbox.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-206).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/CoreSyncPanel.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-212).
* **`/Plantillas Core/App Ventas/src/constants/index.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-222).
* **`/Prototipe-CLI/templates/template-core-seed/vite.config.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-222).
* **`/Prototipe-CLI/templates/template-core-seed/jsconfig.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-222).
* **`/Prototipe-CLI/scripts/test_provision.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-222).
* **`/Prototipe-CLI/config/niches.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-222).
* **`/Plantillas Core/App Ventas/src/pages/client/OrderTracking.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-224).
* **`/Plantillas Core/App Ventas/src/pages/client/ClientCatalog.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-224).
* **`/Plantillas Core/App Ventas/src/components/ui/OrderTrackingSkeleton.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-224).
* **`/Plantillas Core/App Ventas/src/components/ui/ProductCardSkeleton.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-224).
* **`/Plantillas Core/App Ventas/.prettierrc`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-224).
* **`/Prototipe-CLI/templates/template-core-seed/src/components/ui/ProductCardSkeleton.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-224).
* **`/Prototipe-CLI/templates/template-core-seed/.prettierrc`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-224).
* **`/Prototipe-CLI/templates/template-core-seed/src/services/telemetryOutboxDb.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-226).
* **`/Prototipe-CLI/templates/template-core-seed/scripts/validate-core-integrity.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-226).
* **`/Prototipe-CLI/templates/template-core-seed/eslint.config.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-226).
* **`/Plantillas Core/App Ventas/src/services/telemetryOutboxDb.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-226).
* **`/Plantillas Core/App Ventas/scripts/validate-core-integrity.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-226).
* **`/Plantillas Core/App Ventas/src/pages/WelcomePage.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-231).
* **`/Plantillas Core/App Ventas/src/components/ui/PWAInstallBanner.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-231).
* **`/Plantillas Core/App Ventas/src/components/client/catalog/CatalogBanner.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-231).
* **`/Plantillas Core/App Ventas/src/App.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-231).
* **`/Plantillas Core/App Ventas/eslint.config.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-231).
* **`/Plantillas Core/App Ventas/src/pages/admin/AdminStockAlerts.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-232).
* **`/Plantillas Core/App Ventas/src/pages/admin/AdminInventory.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-232).
* **`/Plantillas Core/App Ventas/src/pages/admin/AdminClaims.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-232).
* **`/Prototipe-CLI/scripts/sync-discovery-prompt.cjs`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-248).
* **`/.agents/skills/sync_manifest.json`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-249).
* **`/Plantillas Core/App Ventas/vite.config.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-253).
* **`/Plantillas Core/App Ventas/storage.rules`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-253).
* **`/Plantillas Core/App Ventas/firestore.rules`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-253).
* **`/Prototipe-CLI/templates/template-ventas/vite.config.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-253).
* **`/Prototipe-CLI/templates/template-ventas/storage.rules`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-253).
* **`/Prototipe-CLI/templates/template-ventas/firestore.rules`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-253).
* **`/Instancias Clientes/ventas/ventas-moni-app/vite.config.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-254).
* **`/Prototipe-CLI/test_templates.js`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-254).
* **`/Central PROTOTIPE/dev-dashboard/scripts/verify_library_integrity.cjs`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-258).
* **`/Central PROTOTIPE/dev-dashboard/src/App.jsx`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-260).
* **`/Central PROTOTIPE/dev-dashboard/src/components/admin/ProvisioningProgressModal.jsx`**: Modal modular premium interactivo para monitorear el estado y progreso del aprovisionamiento local en tiempo real. [NEW] CLI-436.
* **`/.agents/AGENTS.md`**: Auto-registrado mediante diagnóstico de Roadmap (Tarea CORE-265).

### 👥 Módulo Cliente (Tienda PWA)
* **`/src/layouts/ClientLayout.jsx`**: Layout raíz del flujo del cliente. Gestiona la barra de navegación, el banner dinámico de anuncios, el carrito lateral y el modal de cupones.
* **`/src/components/client/cart/CartDrawer.jsx`**: Cajón lateral del carrito de compras del cliente. Muestra el resumen de productos agregados, selector interactivo de cantidades, totales y botón de checkout. Integra el sistema de recomendaciones comerciales ("Recomendados para ti") con caché de ciclo de apertura para evitar consultas repetitivas de red.
* **`/src/pages/client/CatalogPage.jsx`**: Catálogo de productos. Integra el filtrado avanzado a través de `appConfigStore` y la barra de búsqueda en tiempo real.
* **`/src/components/client/catalog/ProductDetailModal.jsx`**: Detalle ampliado del producto seleccionado, opciones de color, talla y agregado al carrito (Usa [ModalTemplate](file:///d:/Aplicaciones/App%20Ventas/src/components/common/ModalTemplate.jsx)).
* **`/src/components/client/checkout/CheckoutModal.jsx`**: Proceso de compra tipo "wizard". Integra de manera anidada `ClientCouponsModal` para permitir la aplicación rápida y automatizada de códigos de descuento en el paso de método de pago, y un selector interactivo de mesas disponibles en tiempo real para clientes no sentados que eligen la opción "Pedido en Mesa" (Usa [ModalTemplate](file:///d:/Aplicaciones/App%20Ventas/src/components/common/ModalTemplate.jsx)).
* **`/src/components/client/claims/ClaimRequestModal.jsx`**: Formulario de reclamación de garantías por pedido (Usa [ModalTemplate](file:///d:/Aplicaciones/App%20Ventas/src/components/common/ModalTemplate.jsx)).
* **`/src/components/client/coupons/ClientCouponsModal.jsx`**: Listado de cupones y ofertas flash activos con diseño de ticket prémium que implementa dientes de sierra SVG y línea de perforación punteada (Usa [ModalTemplate](file:///d:/Aplicaciones/App%20Ventas/src/components/common/ModalTemplate.jsx)).
* **`/src/pages/client/ProductDetailPage.jsx`**: Página de vista detallada del producto para clientes de la tienda virtual. Integrada como ruta hija en `/tienda/producto/:id` para renderizar con barra lateral (Sidebar) en versión de escritorio y autoconstreñir las imágenes. En versión móvil, se ocultan el navbar superior y barra inferior de navegación para una visualización fluida a pantalla completa.
* **`/src/pages/client/ProductPublicDetail.jsx`**: Portal Público de Compra. Experiencia especializada y optimizada para conversión de clientes que escanean códigos QR físicos de productos. Soportada de manera responsiva y sin login.
* **`/src/pages/client/ClientCredits.jsx`**: Portal de visualización de créditos, abonos e historial para clientes, saneado con ModalTemplate (Módulo 5).

### 💼 Módulo Administración (POS / Dashboard / Control)
* **`/src/layouts/AdminLayout.jsx`**: Navegación interna y control de sesión de administradores y vendedores. Incorpora el diseño interactivo de barra lateral colapsable, menú hamburguesa alineado y transición de logotipo/título en escritorio. **[Modo Offline]**: Restringe la navegación únicamente al POS ("Venta") y fuerza una redirección automática hacia el POS si la conexión se cae estando en otra pestaña.
* **`/src/layouts/PortalLayout.jsx`**: Layout raíz del portal del vendedor y empleados. Gestiona la sesión del empleado, la campana de notificaciones y muestra un indicador de red dinámico que cambia a "Modo Offline" elástico en ámbar al perder la conexión.
* **`/src/pages/admin/AdminHome.jsx`**: Panel de Inicio del Administrador (diseño premium estilo "wallet" con balances destacados, distribución de caja diaria por métodos de pago y carrusel de transacciones recientes).
* **`/src/pages/admin/InventoryPage.jsx`**: Panel de control de productos, stock, tallas, imágenes y categorías.
* **`/src/pages/admin/AdminOrders.jsx`**: Panel de Gestión de Pedidos del administrador. Gestiona el flujo de estados de pedidos (Pendiente, Completado, Cancelado, Crédito Aprobado), visualización interactiva de mapas de Leaflet (desplegables), asignación de mensajeros, generación de facturas PDF, y consulta del modal interactivo de Historial de Pedidos.
* **`/src/pages/EmployeePortal.jsx`**: Interfaz de ingreso y selección de perfiles para empleados con keypad táctil de PIN, lobby de bienvenida con visualización de pago programado (salario, frecuencia y fecha) e indicadores de rendimiento diario, y redirección por roles.
* **`/src/pages/DeliveryPanel.jsx`**: Espacio de trabajo (Panel de Domicilios) para los domiciliarios autenticados con PIN, con control de entregas, estadísticas diarias y geolocalización integrada.
* **`/src/pages/admin/AdminPortalQR.jsx`**: Módulo administrativo de 3 pestañas para generar códigos QR de acceso, monitorear sesiones activas en tiempo real y consultar el historial logeado de accesos por turnos.
* **`/src/components/admin/inventory/ProductFormModal.jsx`**: Modal de creación/edición de productos asistido por IA. Permite la carga directa de imágenes a Storage mediante `uploadService` (portada, galería secundaria y variantes). El grid de variantes cuenta con rediseño simétrico a 2 columnas (SKU y Foto de variante) tras ser purgada la opción redundante de "Precio Propio" (Usa [ModalTemplate](file:///d:/Aplicaciones/App%20Ventas/src/components/common/ModalTemplate.jsx)).
* **`/src/components/admin/settings/CatalogFiltersCreator.jsx`**: Configurador administrativo de dimensiones del catálogo (categorías, tallas, colores) y gestor de atributos dinámicos personalizados.
* **`/src/components/admin/settings/DeveloperDiagnosticsModal.jsx`**: Modal de diagnóstico técnico para desarrolladores. Provee pestañas para ver variables de entorno, realizar pings de conectividad a Firebase Local y Central, y probar llaves de notificaciones VAPID y notificaciones push.
* **`/src/pages/admin/AdminSettings.jsx`**: Panel de Ajustes y Configuración del Administrador. Rediseñado como un controlador y despachador de pestañas ligero y desacoplado que importa secciones modulares.
* **`/src/pages/admin/settings/components/MobilePreview.jsx`**: Componente visual interactivo para simular la vista previa de la tienda PWA del cliente en tiempo real.
* **`/src/pages/admin/settings/sections/BrandSettings.jsx`**: Sub-panel de gestión de identidad de marca (logo, colores, PWA, redes sociales).
* **`/src/pages/admin/settings/sections/EmployeeSettings.jsx`**: Sub-panel de personal para control de PINs, generación de códigos QR de accesos y nóminas de empleados.
* **`/src/pages/admin/settings/sections/StoreSettings.jsx`**: Sub-panel de opciones operativas, que agrupa configuración de stock/movimientos, ventas al por mayor, temporadas, garantías/reclamaciones y plantilla de mensaje de seguimiento de pedidos.
* **`/src/pages/admin/settings/sections/PaymentSettings.jsx`**: Sub-panel de cuentas bancarias y métodos de cobro autorizados en checkout.
* **`/src/pages/admin/settings/sections/SecuritySettings.jsx`**: Sub-panel de seguridad para actualizar correo y clave del administrador principal.
* **`/src/pages/admin/settings/sections/DeveloperSettings.jsx`**: Zona protegida del desarrollador mediante PIN maestro (`DEV_PIN`), delegando la facturación, firma y telemetría a `DeveloperBillingPanel`, gestionando la restauración a cero y variables de entorno del servidor, y controlando la activación de módulos globales, configuración de facturación DIAN y métodos de entrega.
* **`/src/pages/admin/settings/sections/DeveloperBillingPanel.jsx`**: Componente modular y portable de facturación del desarrollador, que consolida las métricas de ganancias comisionales, la firma táctil digital del cliente, la generación del recibo certificado en PDF y la sección de telemetría y diagnósticos (error de prueba y envío manual de facturación).
* **`/dev-dashboard/`** [STANDALONE]: Consola Central del Desarrollador (Proyecto web independiente aislado). Interfaz interactiva privada conectada de forma híbrida al Firestore Central para ver comisiones acumuladas, ingresos y estado de pagos de clientes.
  * **Navegación Multi-Tab y Responsividad**: Sidebar fijo en desktop y barra de navegación inferior fija (`bottom-nav`) en móviles con 7 pestañas activas (Inicio, Cobros, Biblioteca, Nuevo, Monitoreo, Cores, Branding) y Safe Area (`pb-safe`) soportada. CRM es accesible exclusivamente mediante la tarjeta de "Clientes Activos" en Inicio (incorporando la pestaña "Matriz de Paridad (Drift Heatmap)" con mapa de calor del nivel de paridad global de clientes, la pestaña de Sincronización Core para detectar desviaciones físicas y dependencias NPM desincronizadas, un panel de control Git con descarte de cambios en caliente selectivo y masivo, visor de commits locales, estado de sincronización con GitHub y visor de diffs formateado, y botones para ver terminal de logs en vivo), y Ajustes se despliega desde el modal de Perfil (el cual está adaptado dinámicamente al modo claro y oscuro).
  * **Radar de Salud de Instancias**: Widget interactivo tipo sonar en la columna derecha de Inicio que representa las instancias en vivo mediante coordenadas polares (distancia radial y ángulo) deterministas en un lienzo circular con barrido conic-gradient rotativo (`animate-radar-sweep`), filtros de búsqueda rápidos por tipo de Core (Ventas, POS, etc.), ficha técnica de telemetría de ping/latencia del cliente seleccionado, y redirección directa a la Consola de Incidentes en caso de alertas activas. [HealthRadar.jsx](file:///d:/PROTOTIPE/Central%20PROTOTIPE/dev-dashboard/src/components/admin/HealthRadar.jsx) [NEW]
  * **Branding Studio HSL and WCAG 2.1 Validator**: Pestaña dedicada al diseño de identidad cromática de marca. Permite experimentar con selectores cromáticos HSL, validar las relaciones de contraste en tiempo real contra los estándares de la W3C (AAA, AA, Fail) para el botón primario y el fondo general, y seleccionar de una gallery de 100 paletas premium organizadas en acordeones por nichos de mercado (Tecnología, Moda, Comida, etc.).
  * **Historial de Aprovisionamientos Responsivo**: En la pestaña "Nuevo Cliente" (onboarding), el listado de aprovisionamientos previos cuenta con un diseño adaptativo que oculta la tabla clásica (`hidden md:table`) en dispositivos móviles y renderiza tarjetas detalladas optimizadas para pantallas táctiles (`md:hidden`) junto con un paginador fluído integrado.
  * **Integración de Recharts y Selector de Periodos**: Selector interactivo de periodos (Mes/Año) en cabecera con estilo glassmorphic, visualización reactiva de métricas del dashboard filtradas por mes/año y gráfico general de áreas ("Comisiones Generales") histórico con `ReferenceLine` vertical indicativa del mes seleccionado. Acordeón de clientes con mini-gráficos individuales de ventas y comisiones (Framer Motion + AreaChart), y participación comisional por nicho (PieChart) con tabla de margen neto en el simulador financiero.
  * **Transiciones Fluidas**: Animaciones fluidas al cambiar entre vistas, despliegue de drawers y acordeones interactivos usando Framer Motion.
  * **Portal del Cliente CRM**: Split-view para computadores y pantalla completa para móviles, permitiendo editar configuraciones del cliente (modo de cobro, DIAN billing y tokens), simular envíos de telemetría o generar la ficha de rendimiento y log individual de cliente en PDF.
  * **Modales de Métricas de Cabecera**: Modales funcionales de detalle para Comisión Acumulada, Cobrado y Por Recaudar, que muestran aportes por cliente, listado de transacciones históricas, registro de cobros directos integrados con CRM y exportación a PDF.
  * **Consola de Incidentes y Diagnósticos de Telemetría**: Panel interactivo en tiempo real conectado a `app_failures` en Firestore. Cuenta con filtros por estado (Activos / Resueltos / Todos), severidad (Errores / Advertencias / Información) y buscador de texto, con tarjetas métricas de cabecera interactivas como filtros directos. Implementa agrupación (de-duplicación) de incidentes duplicados con insignias animadas de impactos y resolución de errores con formulario inline para guardar de forma permanente notas de resolución históricas (`resolutionNote`, `resolvedAt`). El modal de diagnóstico integra visualización de código en vivo (CLI Bridge), datos del entorno de ejecución, enlaces automáticos de creación de índices compuestos de Firebase y un motor heurístico premium para detectar fallas de CORS, deserialización JSON, permisos de Firebase Storage y desconexión de red de Firestore.
    * **`src/hooks/useCopyToClipboard.js`**: Hook de copiado rápido al portapapeles.
    * **`src/hooks/useToast.js`**: Hook de control de notificaciones flotantes toast.
    * **`src/components/ui/GuidedToast.jsx`**: Banner de notificación toast interactiva premium adaptada.
    * **`src/components/common/AlertConfirmContext.jsx`**: Proveedor de diálogos de alertas y confirmaciones síncronas promesificadas.
    * **`src/components/admin/ComponentSandbox.jsx`**: Playground de previsualización interactiva con simulación de estados en vivo. Su carga está completamente automatizada usando `import.meta.glob` de Vite para importar de forma dinámica los componentes en `sandboxes/` sin requerir imports o mapeos estáticos manuales. Si un componente visual carece de sandbox configurado, ofrece el botón interactivo para crearlo en caliente usando la API de Scaffold. Robustecido con `SandboxErrorBoundary` para encapsular fallas en runtime.
    * **`src/components/admin/sandboxes/`**: Directorio de playgrounds visuales interactivos individuales de componentes complejos (FormularioProductoIASandbox, LoginPageSandbox, OrderTrackingSandbox, CatalogFiltersSandbox, PWAInstallBannerSandbox, ModuloAgendamientoBarberiaSandbox, etc.) integrados en el Sandbox del Dashboard.
    * **`src/components/admin/ComponentLibraryView.jsx`**: Vista de catálogo de la biblioteca a doble columna (30%/70%) conectada al Daemon CLI, con buscador inteligente, filtros por tipo (UI, Átomos, Módulos, Hooks, Servicios), tag, sandbox, categorías colapsables tipo acordeón animadas con Framer Motion, y sistema de instalación guiada en 3 pasos (Modal Wizard): Paso 1 pre-validación (preflight), Paso 2 diagnóstico de dependencias NPM e internas (representadas como un árbol en cascada visual) + panel de curación "CSS Doctor" para autoinyectar variables de estilo faltantes + configuración interactiva de env vars, Paso 3 progreso en vivo via SSE con iconografía de estado por fase. 4 pestañas de detalle: Documentación, Código Fuente (con widget "Copia de Importación Inteligente" con ruta alias `@/`), Sandbox, Historial (CORE-127: timeline de inyecciones/rollbacks con filtros, paginación, visor de diffs unificado y estado de build). Registro de inventario en `.prototipe-injected.json` con checksum SHA-256. Rollback guiado de componentes individuales con reversión en cascada de dependencias.
    * **`src/components/admin/E2EPanel.jsx`**: Panel modular para lanzar y monitorear la suite de pruebas End-to-End (E2E) con Playwright de forma visual e interactiva por cliente, transmitiendo logs mediante SSE.
    * **`src/components/admin/CoreManagerPanel.jsx`**: Panel de control visual del desarrollador para registrar nuevos cores, clonar plantillas de referencia (scaffold) y administrar el estado general de las plantillas core, delegando la vista detallada de la tarjeta a `CoreCard.jsx`.
    * **`src/components/admin/CoreCard.jsx`**: Componente modular que encapsula el estado y ciclo de vida de una plantilla core. Administra de forma aislada las auditorías PWA/calidad, edición de variables de entorno (con doble confirmación de borrado), descarga de logs de compilación, despliegues por SSE y log de acciones, la visualización detallada de paridad física (0-100%) con cálculo lazy-loading de diffs al expandir el acordeón del archivo modificado, el reporte de archivos obsoletos (huérfanos) con soporte de sincronización y poda (prune: true) en caliente, y el panel de Monitoreo & Telemetría de Desarrollo para el orquestador local (`[clave]-smartfix`), el cual expone estados de pings en vivo, visor de fallos local, controles interactivos de servidor (Desplegar en Local, Detener, Ir a Local) y el lanzador al modal de gestión operativa/drift, evitando re-renders masivos en el panel principal.
    * **`src/components/admin/GitBackupPanel.jsx`**: Panel visual de control de versiones y copias de seguridad (Git Backup) con soporte para estrategias (GitHub Sync, Auto-Merge), visor de log interactivo en vivo y registro de metadatos de respaldos por SSE. **Desde CORE-268**, integra: (1) **Drift Map Core-Cliente** que mapea y compara de forma visual la desviación entre la rama base del Core (main/develop) y la de una instancia cliente seleccionada, mostrando un semáforo de riesgo e identificando colisiones de archivos en tiempo real; (2) **Auditor de Commits Locales** que inspecciona los commits locales pendientes de envío y avisa mediante alertas animadas si incumplen el estándar de Conventional Commits o carecen de ID de tarea; (3) **Enmendador Seguro HEAD** que permite corregir el mensaje del commit HEAD local de manera interactiva con blindaje de seguridad contra commits ya pusheados. [MODIFY]
    * **`src/components/admin/BriefingStudioView.jsx`**: Wizard premium interactivo de preventa de 20 pasos de preventa con auto-guardado en la colección `briefings` de Firestore, panel de análisis de viabilidad (Modo 2) con el Bridge CLI e inyección a onboarding.
    * **`src/components/admin/CotizadorView.jsx`**: Calculadora comisional de 5 pasos basada en matriz de precios persistida en Firestore y generación/descarga del PDF de propuesta de negocio premium.
    * **`src/components/admin/FeatureFlagManager.jsx`**: Panel de control visual de las 10 flags operativas del Core (creditsEnabled, wholesaleEnabled, etc.) con timeline de auditoría de cambios en Firestore.
    * **`src/components/admin/RecaudoPanel.jsx`**: Módulo completo y autoadaptable de cartera y recaudación de comisiones a pantalla completa. Ofrece métricas de cobro y efectividad, buscador, filtros de vencimiento, paginación, toggle de agrupación de deuda por cliente (para soportar grandes volúmenes de datos), Side Drawer lateral de perfil comercial, e integraciones con WhatsApp para recordatorios de pago dinámicos.
    * **`src/components/admin/CobrosPanel.jsx`**: Módulo completo y modular del historial de comisiones recaudadas a pantalla completa. Ofrece métricas de cobro y efectividad, buscador, filtros por año, paginación, toggle de agrupación para consolidar el historial acumulado por cliente (abriendo un Side Drawer detallado) o desglose periodizado, e interacción de reversión de pagos con animaciones de carga.
    * **`src/components/admin/ComisionesPanel.jsx`**: Módulo completo y modular de visualización y exportación de comisiones acumuladas a pantalla completa. Presenta un desglose interactivo de aportes por cliente con barras de progreso y porcentaje de contribución, historial paginado de transacciones con búsquedas y ordenamientos, exportación general a PDF de métricas y proyecciones, y un Side Drawer lateral con el desglose histórico de periodos por cliente seleccionado.
    * **`src/components/admin/NichesManagerPanel.jsx`**: Módulo completo y modular de administración, creación y edición de verticales de negocio (nichos) del monorepo a pantalla completa. Permite buscar nichos, añadir nuevos atributos dinámicos (de tipo texto o dropdown con opciones delimitadas por comas), editar propiedades y borrar nichos mediante ventana de confirmación segura, unificado con `config/niches_metadata.json` del backend. [NEW]
    * **`src/components/admin/BrandingEffectsPanel.jsx`**: Panel de control interactivo (Design Studio) para seleccionar e interactuar con los nuevos tokens de efectos de branding avanzados (shadowStyle, glassmorphism, animationSpeed y radiusMode) con previsualización en vivo. [NEW]
    * **`src/components/admin/ClientLifecyclePanel.jsx`**: Panel modular premium de gestión de ciclo de vida del cliente. Permite la edición en caliente de variables SaaS, branding (paleta HSL), estado de cuenta SaaS (active, suspended, offboarded) e inyección/remoción en vivo de features funcionales del FeatureRegistry en la instancia. [NEW] CLI-394.
    * **`src/components/admin/VersionManagerView.jsx`**: Panel modular premium de gestión de versiones y control de actualizaciones del cliente. Integra semáforos HSL de drift, modal interactivo de plan pre-flight, y terminal de logs SSE en vivo con DevOps Guard Simulator integrado. [NEW] CLI-395.
    * **`src/services/SaaSMetricsService.js`**: Servicio desacoplado para consolidar el cálculo de MRR, ARR, Churn Rate e ingresos comisionales del ecosistema SaaS. [NEW] CLI-395.
    * **`src/components/admin/SaaSOperationsView.jsx`**: Panel ejecutivo presentacional de operaciones SaaS. Muestra indicadores financieros, pings HTTP y consola de logs de incidentes. [NEW] CLI-396.
    * **`src/services/AlertEngine.js`**: Motor desacoplado para evaluar la salud de las instancias, latencias y errores de telemetría y generar alertas operativas. [NEW] CLI-396.
    * **`src/config/saas_config.js`**: Configuración dinámica de costos de infraestructura por tenant, tarifas y umbrales del ecosistema SaaS. [NEW] CLI-396.
    * **`src/components/admin/SkillsRoadmapPanel.jsx`** **(EXTENDIDO - CORE-263/264/265)**: Panel central de herramientas del desarrollador que agrupa en pestañas las utilidades de gestión del ecosistema. **Desde CORE-264/265**, incorpora 4 funcionalidades avanzadas en Roadmap: (1) **Panel de Detalles Interactivo 2 columnas** — al seleccionar una tarea se despliega una vista lateral con descripción técnica, lista de archivos con badges por color (`MODIFY`/`NEW`/`DELETE`) y metadatos; (2) **Buscador en Tiempo Real y Filtros Inteligentes** — foco con `/`, 3 filtros de estado (`Todas`, `Pendientes`, `Hechas`) y un **carrusel de pills de dominios** que muestra contadores por dominio y permite filtrado multi-dominio; (3) **Formulario de Creación Inline** — unificado mediante un desplegable **`CustomSelect`** con soporte para 9 dominios oficiales (CORE/CLI/DASH/TPL/PLT/INST/DOC/LND/BIZ) y auto-ID secuencial calculado; (4) **Barra de Métricas y Renderizado Multi-badge** — visualiza en cabecera el porcentaje de avance general y en el listado múltiples etiquetas de colores según el dominio inferido dinámicamente. [MODIFY]
    * **`src/components/admin/HealthMonitorView.jsx`**: Panel semafórico de monitoreo de disponibilidad HTTP y manifests de las instancias con gráficos históricos de latencia en ms.
    * **`src/firebase.js`**: Módulo de inicialización singleton de Firebase Central en dev-dashboard para persistir y sincronizar la colección `historial_respaldos`.
    * **`src/config.js`**: Configuración centralizada de constantes y variables de entorno del dashboard, unificando la API de comunicación con el CLI Bridge (`CLI_URL`) con soporte configurable via variable de entorno.
    * **`src/index.css`**: Hoja de estilos principal del dashboard. Define las animaciones premium, clases de neon glow, fuentes tipográficas, variables de tema HSL de la marca, el remapeo adaptativo dinámico de colores e inversor cromático de la escala slate de Tailwind para Modo Claro, y el fondo tecnológico premium animado (dots móviles y orbs GPU) junto a la generalización del efecto flotante glassmorphic para tarjetas.
* **`/src/pages/admin/AdminSales.jsx`**: POS Inteligente de Ventas Directas de Mostrador (con soporte para catálogo de productos y productos personalizados) e indicador en tiempo real de ventas diarias del vendedor activo.
* **`/src/pages/admin/AdminSalesDetail.jsx`**: Panel de Análisis de Ventas de Administrador. Muestra el rendimiento del mes y productos/empleados más vendidos. Integra el cálculo de la **Caja Neta Real (Ganancia Neta)** deduciendo los pagos fijos del periodo del total bruto comercial.
* **`/src/pages/admin/AdminQRPerformance.jsx`**: Panel de Rendimiento y Analítica de códigos QR. Permite monitorear escaneos, carritos abandonados y conversiones en tiempo real.
* **`/src/pages/admin/AdminCredits.jsx`**: Panel de administración de créditos de deudores, abonos e historial, saneado con ModalTemplate (Módulo 5).
* **`/src/components/admin/settings/AppResetTool.jsx`**: Utilidad administrativa destructiva de alta seguridad para restaurar bases de datos comerciales a cero conservando la cuenta admin actual.

### ⚙️ Componentes Comunes e Infraestructura
* **`/src/components/ui/feedback/ErrorBoundaryFallback.jsx`**: Componente de recuperación ante fallas críticas en tiempo de ejecución (React Error Boundary) con soporte colapsable para visualización de detalles técnicos in-situ y reporte automático a telemetría centralizada.
* **`/src/components/ui/DatePicker.jsx`**: Componente selector de fecha premium que renderiza el calendario en un portal centered modal con backdrop oscuro translúcido.
* **`/src/components/ui/CustomSelect.jsx`**: Selector personalizado reutilizable que soporta placeholder, animaciones, portabilidad, e interactividad adaptativa de despliegue hacia arriba (`dropUp`) para evitar clippings en modales o pantallas reducidas.
* **`/src/components/ui/CategoryManager.jsx`**: Componente de interfaz puro, stateless y portátil para gestionar categorías con íconos vectoriales.
* **`/src/components/admin/inventory/CategoryManager.jsx`**: Wrapper contenedor de estado que conecta el componente de UI con los hooks del inventario de Firebase.
* **`/src/components/common/ModalTemplate.jsx`**: Componente maestro unificado que provee overlays, portal, animaciones estandarizadas (Framer Motion) e inactivación de scroll.
* **`/src/components/common/AlertConfirmContext.jsx`**: Contexto y hook global (`useAlertConfirm`) que unifica y reemplaza los alerts/confirms nativos con modales HSL premium.
* **`/src/components/common/ScrollToTop.jsx`**: Componente utilitario que restablece la posición del scroll de la ventana al tope superior ante transiciones de ruta.
* **`/playwright.config.js`**: Configuración centralizada de Playwright para lanzar servidores Vite locales, grabaciones, capturas de pantalla automáticas ante fallos y suites headless.
* **`/tests/checkout.spec.js`**: Pruebas End-to-End (E2E) con Playwright. Automatiza y valida de forma robusta el flujo crítico de compra completo (Splash bienvenida -> Login cliente -> Catálogo -> Detalle producto -> Checkout directo -> Confirmación).

* **`/src/components/ui/BackButton.jsx`**: Componente atómico para botones estandarizados de navegación "atrás".
* **`/src/components/ui/QuantitySelector.jsx`**: Componente atómico de incremento y decremento de cantidades con control de límites.
* **`/src/components/ui/LeafletMapPicker.jsx`**: Selector y visualizador de mapas interactivo e independiente basado en Leaflet y OpenStreetMap (Nominatim).
* **`/src/services/alertService.js`**: Singleton imperativo de alertas y confirmaciones. Permite disparar los modales premium del sistema (`showAlert`, `showConfirm`) desde fuera del árbol React — hooks puros, class components y servicios JS. Registrado por `AlertConfirmProvider` al montar vía `useEffect`.
* **`/src/services/whatsappService.js`**: Utilidad unificada para formatear números y redireccionar a chats de WhatsApp.
* **`/src/services/centralFirebaseService.js`**: Singleton perezoso de conexión a la base de datos central del desarrollador (`centralDevApp`). Inicializa una segunda app de Firebase usando las variables `VITE_DEVELOPER_CENTRAL_*` y expone `getCentralFirestore()`. Permite al cliente escuchar en tiempo real `sistemaAlerta` (bloqueo remoto de pago) y responder al campo `triggerPing` escribiendo `lastPingResponse` sin autenticación (Ping-Pong). Retorna `null` silenciosamente si las variables no están configuradas (modo standalone).
* **`/src/services/billingService.js`**: Lógica de cálculo, acumulación y desglose de comisiones mensuales e históricas multi-modo (porcentaje, valor fijo por servicio, pago mensual fijo) con soporte de fallbacks dinámicos reactivos a variables locales de entorno de Vite (`import.meta.env.VITE_DEVELOPER_*`). Escucha y expone en tiempo real la señal `triggerTelemetryReport` emitida por el panel de control central.
* **`/src/services/telemetryService.js`**: Servicio de reporte y transmisión de telemetría de facturación mensual consolidada hacia el panel central (híbrido HTTP/Firestore).
* **`/src/services/pdfService.js`**: Utilidad centralizada para exportación y descarga de reportes y recibos PDF financieros, de inventario y de cartera (Módulo 5).
* **`/src/services/creditService.js`**: Lógica de administración de deudas y abonos con control transaccional robusto contra condiciones de carrera (Módulo 5).
* **`/src/services/accessLogService.js`**: Servicio atómico para registrar logs de accesos (inicio/cierre) de empleados, acumular estadísticas de actividad diaria y gestionar snapshots en tiempo real de sesiones de trabajo.
* **`/src/services/uploadService.js`**: Servicio de abstracción para la subida de archivos (imágenes de producto, variantes, logos) y eliminación de Storage. Intercepta y comprime dinámicamente imágenes WebP client-side a resoluciones máximas de 800px/400px.
* **`/src/services/inventoryService.js`**: Servicio de inventario que provee la función `getProductsPaged` para paginación de Firestore mediante cursores (`limit`, `startAfter`).
* **`/src/hooks/useInventory.js`**: Expone el hook `useProductsInfinite` para consultas paginadas con TanStack Query v5.
* **`/src/hooks/useAuthInit.js`**: Hook para escuchar el estado de autenticación (onAuthStateChanged) y auto-recrear el perfil del administrador en Firestore si sus datos son borrados o huérfanos.
* **`/src/utils/imageCompression.js`**: Helper utilitario autónomo que procesa imágenes con HTML Canvas a formato WebP optimizado (calidad 0.75).
* **`/src/services/qrAnalyticsService.js`**: Servicio de telemetría y analítica para registrar escaneos, vistas y conversiones provenientes de códigos QR de venta física.
* **`/src/services/trackingAnalyticsService.js`**: Servicio de telemetría para registrar interacciones (scans, clicks a tienda, descargas) en el portal público de seguimiento de pedidos.
* **`/src/hooks/useCopyToClipboard.js`**: Custom hook reutilizable para gestionar el copiado de textos al portapapeles con reset automático de estado.
* **`/src/hooks/useBilling.js`**: Custom hook de suscripción a métricas de facturación y actualización de tasas de comisión en tiempo real.
* **`/src/hooks/useProductVariants.js`**: Hook unificado para el cálculo de variantes de productos, stock consolidado e insignias inteligentes (reducción de duplicidad de código).
* **`/src/services/notificationCenterService.js`**: Único punto de entrada para crear, distribuir, suscribir y gestionar notificaciones de la plataforma, incluyendo soporte reactivo del conteo de no leídos (`subscribeToUnreadCount`).
* **`/src/hooks/useNotificationCenter.js`**: Hook unificado del Centro de Notificaciones con suscripción reactiva en tiempo real del conteo de no leídos de Firestore y carga histórica lazy de notificaciones antiguas.
* **`/src/hooks/useAppConfigSync.js`**: Hook global de sincronización de configuración que debe invocarse una única vez en la raíz de la app. Combina tres responsabilidades: (1) listener local a Firestore para `appConfig` y `catalogFilters` via `subscribeToAppConfig`/`subscribeToCatalogFilters`, (2) reporte automático de telemetría mensual de facturación (fin de mes o trigger remoto via `triggerTelemetryReport`), y (3) listener central al documento `/clientes_control/{CLIENT_ID}` en la BD del desarrollador para recibir `sistemaAlerta` y estado de suspensión ineludible (`deactivated`, `deactivationReason`) en tiempo real, además de despachar solicitudes de ping test interactivos via eventos globales en la UI. Propagado a ambos templates CLI (`template-ventas` y `template-core-seed`).
* **`/src/components/common/NotificationHistoryTray.jsx`**: Bandeja visual en tiempo real de notificaciones con filtros, eliminación en lote, scroll infinito e iconografía y colores HSL dinámicos de Lucide.
* **`/src/utils/firestoreAuthGuard.js`**: Utilitario de blindaje que proporciona `withAuth()` y `withAuthSilent()` para envolver operaciones de Firestore, evitando excepciones por falta de sesión de usuario en el arranque.
* **`/src/utils/swHealthCheck.js`**: Utilitario de autocuración de Service Workers. Identifica y elimina las bases de datos de IndexedDB del SW de FCM que tengan conflictos de versión.
* **`/src/store/connectivityStore.js`**: Store Zustand reactivo para controlar y rastrear el estado de red online/offline de forma global.
* **`/src/services/offlineDB.js`**: Base de datos IndexedDB local para almacenar productos, categorías y cola de ventas pendientes offline.
* **`/src/config/firebaseConfig.js`**: Inicialización de servicios oficiales de Firebase (Firestore, Auth, Storage).
* **`/src/main.jsx`**: Punto de entrada de React. Configura el registro del Service Worker de la PWA (`registerSW`) y la lógica de recarga en caliente reactiva (`controllerchange`) al activar nuevas versiones en segundo plano.
* **`/firebase.json`**: Configuración de Firebase para Hosting y base de datos. Inyecta políticas estrictas de caching PWA (no-cache para index/sw/manifiestos, y caché inmutable de un año para `/assets/**`).
* **`/src/config/niche.json`**: Metadatos dinámicos por nicho. Configura de forma dinámica la visibilidad de colores/tallas de calzado e inyecta atributos específicos de la industria (tolerancia, PSI, etc.).
* **`/src/constants/palettes.js`**: Catálogos de paletas avanzadas (incluyendo 130 paletas para los 13 nuevos nichos de mercado con contrastes AAA/AA verificados), eventos estacionales de temporada y lógica de cálculo de colores HSL.
* **`/src/constants.js`**: Catálogos, nombres de colecciones y constantes del negocio.
* **`/src/components/ui/BackgroundCanvas.jsx`** (Template Core Seed): Componente de renderizado de fondos dinámicos interactivos (mallas fluidas Mesh Gradient, auroras y partículas flotantes aceleradas por GPU) compatible con dirección fluida en 4 ejes, opacidades graduables y formas vectoriales personalizadas procedimentales (círculos, glow, estrellas e iconos SVG por nicho). [MODIFY]
* **`/src/components/ui/particlesIcons.js`** (Template Core Seed): Biblioteca premium y organizada con 110 iconos vectoriales de Lucide distribuidos en 11 categorías temáticas para partículas flotantes personalizadas del lienzo. [NEW]
* **`/src/components/ui/InteractiveTiltCard.jsx`** (Template Core Seed): Tarjeta interactiva con inclinación física 3D y brillo holográfico (Glare) optimizada para aceleración por hardware. [NEW]
* **`/src/features/customer-loyalty/module.js`** (Core v2.8): Manifiesto de feature de fidelización comercial de clientes. [NEW] Tarea CLI-488.
* **`/src/features/customer-loyalty/services/CustomerLoyaltyService.js`** (Core v2.8): Lógica transaccional de acumulación y canje de puntos de fidelidad. [NEW] Tarea CLI-488.
* **`/src/core/kernel/ApplicationKernel.js`** (Core v2.7): Bootstrap y orquestador centralizado de la carga lineal de features activas. [NEW] Tarea CLI-378.
* **`/src/core/kernel/FeatureLifecycleManager.js`** (Core v2.7): Máquina de estados finitos que valida transiciones de ciclo de vida en runtime. [NEW] Tarea CLI-378.
* **`/src/core/kernel/FeatureHealthManager.js`** (Core v2.7): Administrador de diagnóstico de salud operativa en runtime. [NEW] Tarea CLI-378.
* **`/src/features/inventory/services/inventoryInterface.js`** (Core v2.7): Contrato y API pública de inventario que encapsula las operaciones de deducción transaccional de stock con optimización de lecturas. [NEW] Tarea CLI-380.
* **`/src/features/inventory/module.js`** (Core v2.7): Manifiesto de feature de inventario. [NEW] Tarea CLI-380.
* **`/src/features/sales/module.js`** (Core v2.7): Manifiesto de feature de ventas/POS. [NEW] Tarea CLI-380.
* **`/src/features/orders/module.js`** (Core v2.7): Manifiesto de feature de pedidos. [NEW] Tarea CLI-380.
* **`/src/features/credits/module.js`** (Core v2.7): Manifiesto de feature de créditos. [NEW] Tarea CLI-380.




---

## 🔄 Flujos de Datos e Integración de Firebase

```mermaid
graph TD
    A[Vistas de Cliente / POS] --> B[Zustand Stores / React Hooks]
    B --> C[Servicios de Negocio /src/services/]
    C --> D[(Firestore / Firebase Auth)]
    
    subgraph Colecciones Críticas en Firestore
        D1[products]
        D2[orders]
        D3[credits]
        D4[claims]
        D5[tables]
        D6[tableRequests]
    end
    D --> D1
    D --> D2
    D --> D3
    D --> D4
    D --> D5
    D --> D6
```

---

## 🛠️ Reglas de Conectividad con la Base de Datos

* **Escritura en `products`**: Requiere rol administrativo y sesión iniciada (`request.auth != null`).
* **Escritura en `orders`**: Permitida para clientes públicos. Descuenta stock atómicamente al instante mediante transacciones (`runTransaction`).
* **Créditos (`credits`)**: Cuando un pedido pasa a estado `credito_aprobado`, el backend atómico descuenta el stock y genera de forma automática la cuenta de cobro correspondiente en la colección de créditos.
* **Portal de Features SaaS (Sección 10)**: Documentado en el manual absolute bajo el sprint documental de features, centralizando la gobernanza del `feature-registry.json` y el ciclo de scaffolding transaccional en la CLI.
