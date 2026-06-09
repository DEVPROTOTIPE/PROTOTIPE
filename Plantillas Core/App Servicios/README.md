# App Servicios (Core de Servicios y Talleres)

Este directorio es la **fuente de verdad** para el desarrollo y mantenimiento del módulo base de servicios en el ecosistema PROTOTIPE.

## Nicho
- Talleres mecánicos, tornerías, soporte técnico, mantenimiento a domicilio y prestación de servicios profesionales.

## 🚀 Cómo iniciar el desarrollo de este Core
Para empezar a programar la base de este nicho sobre la arquitectura limpia y telemetría de PROTOTIPE:
1. Copia el contenido de la plantilla semilla limpia: `D:\PROTOTIPE\Prototipe-CLI\templates\template-core-seed` en esta carpeta.
2. Ejecuta `npm install` para instalar dependencias base.
3. Modifica `package.json` para definir `"name": "app-servicios"`.
4. Diseña las colecciones Firestore, las vistas y los flujos operativos bajo `src/`.
5. Valida ejecutando `npm run build`.

## Sincronización
- Sincroniza los cambios con el CLI ejecutando el comando `@actualizar-template servicios` (o `node D:\PROTOTIPE\Prototipe-CLI\sync_templates.js servicios`).
