# 🚀 Prompt de Arranque para Google Antigravity (Proyecto: Test App Sinc)

Copia y pega todo el contenido de este bloque en tu primer mensaje del chat de Antigravity en este proyecto:

---

Hola. Vamos a trabajar sobre este nuevo proyecto: **Test App Sinc** (test-app-sinc). 
La carpeta física está creada en la ruta: `D:\PROTOTIPE\Instancias Clientes\ventas\App-test-app-sinc`

Por favor, lee e indiza obligatoriamente los siguientes archivos y carpetas de navegación e instrucciones antes de proponer tu plan de implementación. Son tu GPS de arquitectura y estándares:
1. **Mapa de Código de este Proyecto** → [mapa_arquitectura_ia.md](file:///D:/PROTOTIPE/Instancias Clientes/ventas/App-test-app-sinc/mapa_arquitectura_ia.md): contiene la estructura física de todos los archivos y carpetas locales.
2. **Mapa de Documentación Global** → [mapa_documentacion_ia.md](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/mapa_documentacion_ia.md): índice de navegación semántica de toda la documentación central.
3. **Instrucciones del Proyecto** → [GEMINI.md](file:///D:/PROTOTIPE/Instancias Clientes/ventas/App-test-app-sinc/GEMINI.md): reglas de comportamiento, estándares del stack y disparadores locales.
4. **Documentación Obligatoria del Proyecto (Carpeta Local):**
   - 🏢 **[contexto_negocio.md](file:///D:/PROTOTIPE/Instancias Clientes/ventas/App-test-app-sinc/Documentacion%20Test%20App%20Sinc/contexto_negocio.md)**: Lee esto PRIMERO — define quién es el cliente, sus reglas de negocio y KPIs. Determina si el código que generas tiene sentido operativo.
   - 🚫 **[restricciones_tecnicas.md](file:///D:/PROTOTIPE/Instancias Clientes/ventas/App-test-app-sinc/Documentacion%20Test%20App%20Sinc/restricciones_tecnicas.md)**: Dependencias fijadas, patrones prohibidos y limitaciones conocidas de esta instancia. Consulta antes de instalar librerías o cambiar arquitectura.
   - 🎨 **[guia_estilos_ui.md](file:///D:/PROTOTIPE/Instancias Clientes/ventas/App-test-app-sinc/Documentacion%20Test%20App%20Sinc/guia_estilos_ui.md)**: Paleta HSL, tokens de diseño y convenciones de componentes. Obligatorio antes de tocar cualquier estilo.
   - 🗄️ **[esquema_colecciones.md](file:///D:/PROTOTIPE/Instancias Clientes/ventas/App-test-app-sinc/Documentacion%20Test%20App%20Sinc/esquema_colecciones.md)**: Modelo de datos Firestore de esta instancia.
5. **Directorios Clave de Estándares y Componentes (Auditoría Obligatoria):**
   - 📂 **[04_Estandares_y_Skills](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/)**: Lee `inicializacion_nuevos_proyectos.md` y `Firebase_Listeners_Clean.md` para entender el blindaje de base de datos y la PWA.
   - 📂 **[06_Biblioteca_Componentes](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/)**: Consulta el catálogo de componentes listos para portar y reutilizar sin reescribir código.
   - 📂 **[07_Manuales_Desarrollo](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/07_Manuales_Desarrollo/)**: Contiene la especificación de Sharding Multitenant y manuales de arquitectura.
   - 📂 **[09_Modulos_Completos](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/09_Modulos_Completos/)**: Consulta el catálogo de módulos completos (Features) listos para portar.
   - 📂 **[03_Auditorias_y_Faro_Core](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/03_Auditorias_y_Faro_Core/)**: Revisa `bitacora_cambios.md` para entender el historial de desarrollo y parches.

### 📋 Contexto del Cliente (Briefing)
- **Nombre**: Test App Sinc
- **Client ID**: test-app-sinc
- **Core al que pertenece**: ventas
- **Modo de Facturación de la Instancia**: percentage
- **Tasa de Comisión / Costo**: 
  - Porcentaje: 1.5%
  - Pago Mensual Fijo: $0 COP
- **Facturación Electrónica (DIAN)**: 🔴 Inactiva (Costo por factura: $0 COP)
- **Token de Telemetría**: test-app-sinc-token-1782502865398
- **Colores de Marca**: Tema HSL custom
  - Primario: `hsl(142, 70%, 45%)`
  - Secundario: ``
  - Fondo: ``
  - Texto: ``
  - Tipografía (Google Font): `Inter`

### ⚙️ Módulos y Capacidades Tecnológicas Seleccionadas:


### 📝 Requerimientos Especiales del Cliente:
*(Ninguno especificado)*

### 📦 Componentes y Módulos Recomendados de la Biblioteca (Preferentes):
  *(Ninguno sugerido preferentemente; utiliza libremente la biblioteca global)*

> [!NOTE]
> **Autonomía Creativa de la IA:** Las recomendaciones anteriores son sugerencias preferentes de reutilización. Si para cumplir con el briefing del negocio requieres interfaces, hooks o bases de datos ausentes en la biblioteca, tienes total autonomía de diseñarlas y programarlas desde cero, garantizando el stack de calidad de la plataforma.

---



### 🛡️ DIRECTIVAS DE ROBUSTEZ Y CALIDAD (OBLIGATORIO)

Para asegurar que esta aplicación cumpla con los estándares premium del ecosistema de instancias y evitar código basura o inestable, debes seguir estrictamente estas reglas desde tu primer cambio:

1. **Aislamiento de Sharding (Portabilidad):**
   - Queda estrictamente prohibido hardcodear IDs de proyectos Firebase o credenciales. Consume todo dinámicamente desde el entorno local (`.env.local`).
2. **Robustez en Escuchas Firebase (Listeners Seguros):**
   - No te suscribas a oyentes en tiempo real (`onSnapshot`) de colecciones privadas/restringidas sin validar que el usuario de Firebase Auth esté inicializado y logueado.
   - Todo listener debe retornar su función de limpieza (`cleanup`) al desmontar.
3. **Consistencia Cromática y Tailwind v4:**
   - Adapta el archivo `src/index.css` aplicando la paleta de colores de marca bajo el bloque `@theme` de Tailwind CSS v4.
   - Evita el uso de bordes negros o colores crudos; utiliza contornos discretos (`border-app` o escalas HSL bajas) y acabados con glassmorphism.
4. **Seguridad y Transacciones:**
   - Toda deducción o adición de stock en base de datos debe ejecutarse mediante transacciones atómicas (`runTransaction`) para prevenir condiciones de carrera.
   - La visualización pública de datos sensibles o seguimiento de pedidos debe estar protegida bajo URLs parametrizadas por tokens UUID seguros.
5: **Reutilización e Integración de Estándares (Auditoría de Documentación):**
   - Antes de escribir cualquier línea de lógica, audita obligatoriamente:
     - El catálogo en [Biblioteca de Componentes](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/06_Biblioteca_Componentes/) para verificar si ya existe un componente que resuelva la interfaz.
     - La carpeta de [Módulos Completos](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/09_Modulos_Completos/) para portar módulos de negocio complejos (Features) ya estructurados.
     - La carpeta [04_Estandares_y_Skills](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/04_Estandares_y_Skills/) para seguir las guías de inicialización y listeners sin romper las reglas de Firebase.
     - El [Informe de Investigación del Ecosistema 2026](file:///D:/PROTOTIPE/Instancias Clientes/Documentacion%20PROTOTIPE/09_Plan_Escalabilidad_Negocio/informe_investigacion_ecosistema_2026.md) para emplear librerías Open Source aprobadas en lugar de codificar soluciones personalizadas desde cero.
6. **Mantener estructura modular:**
   - Queda prohibido mezclar lógica de múltiples vistas en archivos monolíticos. Cada componente nuevo debe colocarse en su propio archivo descriptivo en la ruta correspondiente.
7. **Compilación de Integridad y Bitácora Obligatoria:**
   - **Antes de dar por completada cualquier tarea o hito, debes ejecutar localmente `npm run build`** en la consola del proyecto. Esta comprobación garantiza que no se introduzcan errores sintácticos o fallos de compilación.
   - Registra de forma obligatoria los cambios técnicos en `bitacora_cambios.md` y actualiza la lista de tareas en `tareas_pendientes.md` en el mismo paso que realizas los cambios de código.
8. **Despliegues controlados:**
   - NUNCA realices despliegues a producción o hosting de forma automática; solicita aprobación.
9. **Lectura de navegación:**
   - Usa las rutas de los mapas de navegación directamente para leer y editando archivos. Evita búsquedas ciegas (`grep` o `list_dir`).

Comencemos presentándote e indexando los archivos. ¿Estás listo?
