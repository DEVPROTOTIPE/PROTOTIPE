# 🧠 Propuesta Técnica: Motor de Prompting Avanzado y Analizador de Briefing para la IA

## 1. Contexto y Problema Actual
Actualmente, el flujo de aprovisionamiento de la plataforma PROTOTIPE inicializa proyectos a través de un CLI básico que genera un prompt descriptivo plano. Este prompt es propenso a omitir detalles críticos como:
* Estructuras de datos a medida (Firestore schemas).
* Comportamientos de animación y gestos interactivos (Framer Motion).
* Componentes modularizados de la biblioteca global que encajen con el nicho del cliente.
* La adaptación automática de verticales (por ejemplo, evitar carritos de retail con talla/color para un taller o tornería).

---

## 2. Solución Propuesta: El Analizador de Requerimientos de Negocio (Onboarder AI)
Se propone integrar un módulo analizador de requerimientos cognitivos en el **Developer Dashboard** y en el **Prototipe-CLI**. Cuando el desarrollador ingrese el briefing simple del cliente (ej. *"Tornero que atiende por orden de llegada"*), una llamada a la API de la IA (Gemini 1.5 Flash/Pro) parseará el briefing a través de una **Plantilla de Análisis de Nicho Estricta**.

### Flujo Operativo:
```
[Briefing Simple] 
       │
       ▼
[Prompt Template de Análisis Estructural (Gemini)]
       │
       ├─► 1. Clasificación de Vertical (Retail / Servicios / Eventos)
       ├─► 2. Mapeo de Colecciones y Esquema de Datos Firestore
       ├─► 3. Selección de Componentes de la Biblioteca Global
       ├─► 4. Definición de Flujos UX y Micro-interacciones
       ▼
[Prompt de Implementación Perfecto (Output)]
```

---

## 3. Estructura de la Plantilla del Sistema (Prompt de Sistema del Generador)
Para obtener el prompt de implementación perfecto, el motor analizador debe utilizar la siguiente plantilla de directivas de sistema:

```markdown
Eres el Arquitecto de Software Principal de PROTOTIPE. Tu misión es transformar un requerimiento de cliente básico y un branding HSL en un PROMPT DE ARRANQUE PERFECTO de implementación para un agente autónomo de desarrollo (Antigravity).

El prompt generado debe ser sumamente estructurado y contener obligatoriamente las siguientes secciones:

1. IDENTIDAD Y BRANDING (Variables HSL):
   - Definir los colores primarios, secundarios, fondo y fuente indicados por el usuario.

2. VERTICAL DE NEGOCIO Y REGLAS OPERATIVAS:
   - Declarar si el negocio pertenece a Retail tradicional (e-commerce) o a Servicios/Talleres (Manual de Verticales de Servicios).
   - Definir los flujos operativos lógicos (ej: orden de llegada, cola fifo, estados de producción, agenda de turnos).

3. ESQUEMA DE DATOS FIRESTORE DETALLADO:
   - Estructuración exacta de las colecciones, campos y tipos de datos (Zod schema si aplica).
   - Ejemplo: Colección 'orders' con campo 'estado' (pending -> accepted -> in_production -> ready -> delivered).

4. BLUEPRINT DE PÁGINAS Y LAYOUTS:
   - Describir exactamente qué pantallas componen la aplicación (Welcome, Catalog/Dashboard, Admin visors).
   - Detallar la distribución de componentes atómicos en cada layout.

5. SELECCIÓN DE COMPONENTES GLOBALES (Reutilización del Catálogo):
   - Listar qué componentes de D:\PROTOTIPE\Documentacion PROTOTIPE\06_Biblioteca_Componentes\ se deben portar e inyectar en caliente (ej: stepper_pedidos, order_tracking, swipeable_bottom_sheet, dark_mode_toggle).

6. MICRO-ANIMACIONES Y UX PREMIUM (Obligatorias):
   - Detallar transiciones de estado, animaciones de hover, resorte de carga, shimmers en skeleton, feedback visual táctil y transiciones de páginas.

7. CRITERIOS DE ACEPTACIÓN TÉCNICOS:
   - Exigir compilación limpia ('npm run build'), listeners estables con cleanup, y actualización inmediata de bitácora_cambios.md y tareas_pendientes.md.
```

---

## 4. Ejemplo Práctico: Entrada vs Prompt Perfecto Generado

### Entrada del desarrollador:
> **Cliente:** "Taller de Tornería Remigio. Necesita que el cliente se registre con nombre/teléfono para pedir turno de maquinado. En el taller, Laura (la administradora) ve los pedidos en orden de llegada, los asigna a un tornero o máquina disponible, y el cliente puede ver en vivo por qué paso va su pieza (Recepción, Corte, Maquinado, Pulido, Listo)."
> **Branding:** Verde esmeralda (#10b981) y fondo oscuro (#0b130f).

### Prompt Perfecto de Implementación Generado (Output de la IA):
```markdown
# 🚀 PROMPT DE IMPLEMENTACIÓN: TORNERÍA REMIGIO

## 1. Identidad Visual (HSL)
- Primario: #10b981 (esmeralda)
- Fondo: #0b130f (carbon/oscuro)
- Usar fuente Poppins. Bordes base 'rounded' (12px). Modo oscuro forzado.

## 2. Vertical de Negocio: Servicios y Manufactura a la Medida
- Aplicar lineamientos de '07_Manuales_Desarrollo/Arquitectura_Multi_Instancia/Configuracion_Marca/manual_nichos_servicios.md'.
- Flujo Operativo: Cola FIFO de órdenes de trabajo. No usar carrito con 'talla/color' ni pasarela tradicional. El cliente registra una "Solicitud de Torneado" describiendo su pieza y adjuntando una foto de referencia.

## 3. Estructura de Datos en Firestore
- Colección `orders` (Órdenes de Trabajo):
  - `id`: string (UUID auto)
  - `cliente`: { nombre: string, celular: string }
  - `pieza`: { descripcion: string, fotoUrl: string }
  - `estado`: string ('pending' | 'received' | 'corte' | 'maquinado' | 'pulido' | 'ready' | 'delivered')
  - `asignadoA`: string (nombre de tornero o máquina, inicial null)
  - `createdAt`: timestamp
  - `posicionCola`: number (autoincremental por día)

## 4. Componentes a Reutilizar de la Biblioteca Global
- Portar `/06_Biblioteca_Componentes/Formularios_y_UI/Boton_Regreso/` para toda navegación.
- Portar `/06_Biblioteca_Componentes/Formularios_y_UI/Stepper_Pedidos/` para el rastreo del cliente.
- Portar `/06_Biblioteca_Componentes/Formularios_y_UI/Notificacion_Toast/` para alertas de cambio de máquina.
- Utilizar `/06_Biblioteca_Componentes/Pedidos_y_Gestion/Tarjeta_Pedido_Admin/` adaptada al flujo de torneado.

## 5. Diseño y Animaciones Requeridas (Framer Motion)
- **Pantalla Cliente:** Línea de tiempo interactiva con efectos staggered. El chip de estado actual debe parpadear con pulso suave (`animate-pulse`).
- **Pantalla Laura (Admin):** Bento grid responsivo para visualizar la cola de producción. Las tarjetas deben soportar drag and drop o botones fluidos de cambio de máquina con escala de escala `0.95`.
- **Skeleton Shimmer:** Utilizar skeleton loaders en lugar de spinners para evitar parpadeos visuales al cargar la cola de pedidos.

## 6. Pasos de Codificación Requeridos
1. Configurar `src/store/productionStore.js` para persistir estado de la cola.
2. Implementar `src/pages/client/WelcomePage.jsx` y `src/pages/client/OrderTracking.jsx` (Línea de tiempo).
3. Implementar `src/pages/admin/ProductionDashboard.jsx` (Cola de alistado por orden de llegada con asignación a máquinas).
4. Actualizar rutas en `AppRoutes.jsx`.
5. Ejecutar 'npm run build' y reportar a 'bitacora_cambios.md'.
```

---

## 5. Próximos Pasos de Automatización
1. **Endpoint REST en el CLI:** Agregar un endpoint `/api/analyze-briefing` al servidor Node.js local de Prototipe-CLI.
2. **UI en el Dashboard:** Añadir una tarjeta en el portal del desarrollador con un área de texto: *"Describe las necesidades del cliente"* y un botón *"Generar Prompt Perfecto para Antigravity"*.
3. **Consumo Directo:** El prompt arrojado se podrá copiar en un solo clic para inicializar la fase de desarrollo del agente Antigravity, logrando que el 100% de la lógica a la medida quede plasmada desde el primer segundo.
