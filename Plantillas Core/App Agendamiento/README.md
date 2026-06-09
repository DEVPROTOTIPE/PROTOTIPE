# App Agendamiento (Core de Citas y Reservas)

Este directorio es la **fuente de verdad** para el desarrollo y mantenimiento del módulo base de citas y reservas en el ecosistema PROTOTIPE.

## Nicho
- Citas médicas, salones de belleza/barberías, reservas de hoteles, consultorios profesionales y turnos en general.

## 🚀 Cómo iniciar el desarrollo de este Core
Para empezar a programar la base de este nicho sobre la arquitectura limpia y telemetría de PROTOTIPE:
1. Copia el contenido de la plantilla semilla limpia: `D:\PROTOTIPE\Prototipe-CLI\templates\template-core-seed` en esta carpeta.
2. Ejecuta `npm install` para instalar dependencias base.
3. Modifica `package.json` para definir `"name": "app-agendamiento"`.
4. Diseña las colecciones Firestore, las vistas y los flujos operativos bajo `src/`.
5. Valida ejecutando `npm run build`.

## Sincronización
- Sincroniza los cambios con el CLI ejecutando el comando `@actualizar-template agendamiento` (o `node D:\PROTOTIPE\Prototipe-CLI\sync_templates.js agendamiento`).
