# 📋 Roadmap Estratégico de Onboarding de Clientes y Próximos Tenants

Este documento sirve como el plan estratégico de despliegue para los primeros clientes reales de **Prototipe**, asegurando que cada integración siga un flujo ordenado, documentado y libre de mantenimiento manual duplicado.

---

## 📋 Pipeline de Onboarding Estándar para Clientes Futuros (Fórmula de Escala)
Cuando consigas nuevos prospectos o clientes, aplicaremos secuencialmente este checklist técnico y de negocio antes de programar para no saturar el desarrollo:

### 1. Fase de Briefing Comercial (Fricción Cero)
* El cliente llena el `briefing_cliente.md` con:
  * Nombre del negocio y descripción corta.
  * Logo de marca blanca y paleta cromática preferida (1 color primario).
  * Métodos de contacto (WhatsApp para notificaciones de órdenes).
  * Listado inicial de categorías de inventario.

### 2. Fase de Diseño y Configuración (Backend)
* Crear la carpeta de cliente en `D:\PROTOTIPE\Documentacion PROTOTIPE\08_Instancias\[Nombre_Cliente]\`.
* Crear `briefing_[nombre_cliente].md`.
* Activar las **Feature Flags** adecuadas según las necesidades específicas del cliente.

### 3. Fase de Despliegue en Hosting (Producción)
* Generar los DNS y subdominios personalizados.
* Lanzar la compilación optimizada en Firebase Hosting.
* Entregar credenciales del portal administrativo al cliente.

---

## 💡 Backlog de Clientes Prospectados
> Registra aquí los nuevos clientes que vayas hablando para planificar su onboarding en las fases correspondientes de la Hoja de Ruta Maestra.

1. **[Espacio Reservado para Cliente N°2]** (Ej. Barbería local, comida rápida de barrio, etc.)
2. **[Espacio Reservado para Cliente N°3]**
