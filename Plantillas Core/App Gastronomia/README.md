# App Gastronomia (Core de Comidas, Mesas y Restaurantes)

Este directorio es la **fuente de verdad** para el desarrollo y mantenimiento del módulo base gastronómico en el ecosistema PROTOTIPE.

## Nicho
- Restaurantes, cafés, bares, panaderías, discotecas y servicios de pedidos directos a mesas o domicilios.

## 🚀 Cómo iniciar el desarrollo de este Core
Para empezar a programar la base de este nicho sobre la arquitectura limpia y telemetría de PROTOTIPE:
1. Copia el contenido de la plantilla semilla limpia: `D:\PROTOTIPE\Prototipe-CLI\templates\template-core-seed` en esta carpeta.
2. Ejecuta `npm install` para instalar dependencias base.
3. Modifica `package.json` para definir `"name": "app-gastronomia"`.
4. Diseña las colecciones Firestore, las vistas y los flujos operativos bajo `src/`.
5. Valida ejecutando `npm run build`.

## Sincronización
- Sincroniza los cambios con el CLI ejecutando el comando `@actualizar-template gastronomia` (o `node D:\PROTOTIPE\Prototipe-CLI\sync_templates.js gastronomia`).
