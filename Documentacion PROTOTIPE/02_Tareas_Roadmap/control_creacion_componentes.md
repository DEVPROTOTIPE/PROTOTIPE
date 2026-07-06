# Control de Creación y Checklist de Componentes (139 Componentes)

Este documento registra y realiza el seguimiento persistente de la inyección de los 139 componentes comerciales (100 base + 39 simplificados de alto valor para las verticales 11 a 23) diseñados para expandir el ecosistema **PROTOTIPE**. 

---## 📊 Progreso de Implementación
* **Total Planificado:** 139
* **Completados:** 107
* **Restantes:** 32

---

## 🛍️ Vertical 1: Ropa y Retail Tradicional (`retail_clothing`)
- [x] **`SelectorTallasColores`**: Rejilla interactiva para seleccionar combinaciones con indicador de stock en tiempo real.
- [x] **`GuiaMedidasTallaIdeal`**: Calculadora interactiva donde el usuario ingresa sus medidas (busto, cintura, cadera) y el sistema recomienda su talla ideal.
- [x] **`GaleriaZoomHover`**: Visor de fotos con aumento al pasar el puntero para ver costuras y texturas.
- [x] **`CarruselCompletaLook`**: Inyección de productos relacionados (accesorios, pantalones) que combinan con la prenda principal.
- [x] **`BuscadorDisponibilidadTiendas`**: Buscador por código postal o ciudad para verificar en qué tienda física hay stock.
- [x] **`SelectorEmpaqueRegalo`**: Checkbox interactivo con selector de tarjeta de dedicatoria y tipo de empaque de regalo.
- [x] **`DeslizadorProductosSimilares`**: Slider que compara prendas del mismo estilo o patrón de diseño.
- [x] **`IconosCuidadoPrendas`**: Bloque visual de iconos estándar (lavado, planchado, secado) con tooltip descriptivo.
- [x] **`PestanasFiltroTemporada`**: Tabs de filtrado rápido (Primavera-Verano, Otoño-Invierno, Deportivo, Formal).
- [x] **`InsigniasDescuentoVolumen`**: Indicadores visuales en el precio según la cantidad seleccionada.

## ⚙️ Vertical 2: Tornerías y Mecanizado de Precisión (`technical_services`)
- [x] **`CargadorPlanosCAD`**: Campo para cargar planos (DXF, STEP, PDF) con validador de formato y tamaño.
- [x] **`CalculadoraCotizacionMecanizado`**: Formulario interactivo que estima costos ingresando tipo de metal, diámetro, longitud y grado de tolerancia.
- [x] **`SelectorProcesosMecanizado`**: Selector visual de servicios requeridos (Torneado, Fresado, Rectificado, Soldadura).
- [x] **`SelectorTratamientoAcabado`**: Selector de tratamientos (Pavonado, Cincado, Tratamiento Térmico, Pintura Electrostática).
- [x] **`ReporteControlCalidad`**: Tabla interactiva para ver mediciones reales vs tolerancias de diseño por pieza entregada.
- [x] **`SelectorEspecificacionRosca`**: Dropdowns para seleccionar roscas normalizadas (métrica, Whitworth, NPT) con sus pasos.
- [x] **`SeguimientoOrdenesProduccion`**: Stepper visual de etapas físicas de fabricación.
- [x] **`CalculadoraPesoMateriales`**: Utilidad interactiva para calcular el peso estimado de barras o placas metálicas.
- [x] **`SelectorLotesVolumen`**: Tabla de precios dinámicos por volumen de piezas mecanizadas.
- [x] **`FormularioSolicitudRectificacion`**: Registro de fallas en piezas desgastadas con carga de fotos.

## ❄️ Vertical 3: Refrigeración y Climatización (`refrigeration_ac`)
- [x] **`CalculadoraCargaBTU`**: Formulario para calcular los BTUs requeridos de un aire acondicionado ingresando dimensiones del cuarto.
- [x] **`SelectorTipoAireAcondicionado`**: Selector gráfico entre Mini-Split, Cassette, Ducto o Aire Central.
- [x] **`ProgramadorMantenimientoPreventivo`**: Formulario interactivo para programar visitas periódicas de limpieza de filtros.
- [x] **`EstimadorAhorroEnergetico`**: Comparador de eficiencia (Inverter vs tradicional) con estimación de ahorro.
- [x] **`SelectorRefrigeranteRepuestos`**: Selector de gas (R410A, R22, R134a) para servicios de recarga.
- [x] **`ListaDiagnosticoFallas`**: Cuestionario interactivo para estimar la causa y el costo de reparación.
- [x] **`TablaEspecificacionesHVAC`**: Tabla comparativa de especificaciones de compresores and consumo de amperaje.
- [x] **`SelectorTramosTuberia`**: Selector de metros de tubería de cobre and aislamiento necesarios.
- [x] **`TarjetaGarantiaContratos`**: Tarjeta interactiva para consultar el tiempo de garantía restante.
- [x] **`SelectorTermostatosSensores`**: Selector de accesorios de control de climatización.

## 📐 Vertical 4: Contratistas y Construcción (`contractors`)
- [x] **`CalculadoraPresupuestoObra`**: Panel interactivo por etapas para estimar costos de mano de obra y materiales.
- [x] **`SelectorEspecialidadContratistas`**: Selector gráfico de especialidades (Albañilería, Plomería, Electricidad, Pintura).
- [x] **`BitacoraDiariaObra`**: Formulario para subir fotos del avance diario, asistencia y novedades.
- [x] **`CalculadoraDosificacionConcreto`**: Herramienta interactiva para calcular bolsas de cemento, arena y grava por m³.
- [x] **`CronogramaHitosProyecto`**: Gantt simplificado que muestra fechas de inicio y fin por fase.
- [x] **`SelectorAlquilerAndamios`**: Selector de cantidad de cuerpos de andamio y días de alquiler.
- [x] **`VisorPlanosDiseno`**: Galería interactiva de planos clasificados por especialidad.
- [x] **`SolicitudPedidoMateriales`**: Formulario interno para solicitar varilla, cemento o ladrillo.
- [x] **`GraficoPresupuestoVsGasto`**: Gráfico comparativo de costos proyectados vs costos ejecutados.
- [x] **`ChecklistSeguridadEPP`**: Lista interactiva de verificación de equipo de protección personal.

## 🚜 Vertical 5: Alquiler de Maquinaria y Equipos (`machinery_rental`)
- [x] **`CalendarioRangoAlquiler`**: Calendario interactivo de rango de fechas para verificar disponibilidad.
- [x] **`CalculadoraTarifasAlquiler`**: Calculadora que desglosa tarifas por día, semana o mes.
- [x] **`ChecklistInspeccionMaquinaria`**: Formulario digital para registrar niveles, horómetro y daños.
- [x] **`TarjetasOperadoresAutorizados`**: Selector de conductores con licencias certificadas.
- [x] **`CalculadoraFletesTransporte`**: Selector de tipo de cama baja y kilómetros de traslado.
- [x] **`SelectorAccesoriosMaquinaria`**: Selector de complementos para excavadoras o minicargadores.
- [x] **`MonitorHorasAlertas`**: Tarjeta que muestra las horas de uso y proximidad de mantenimiento.
- [x] **`SelectorSeguroDanos`**: Checkbox interactivo para seguro de exención de daños.
- [x] **`DeslizadorCapacidadTonelaje`**: Deslizador para filtrar por toneladas de capacidad o alcance.
- [x] **`TarjetaLogisticaDespacho`**: Ficha que detalla conductor del flete, ruta y entrega.

## 🪚 Vertical 6: Carpinterías y Muebles (`carpentry`)
- [x] **`OptimizadorCorteTableros`**: Utilidad para visualizar cómo cortar piezas en un tablero minimizando el desperdicio.
- [x] **`SelectorMaderaAcabado`**: Muestrario de maderas y acabados de superficie.
- [x] **`CalculadoraMueblesMedida`**: Configurar dimensiones de muebles con actualización de precio.
- [x] **`SelectorHerrajesAccesorios`**: Selector de bisagras, rieles, jaladeras y organizadores.
- [x] **`TablaDespieceMateriales`**: Tabla interactiva con cantidad de piezas y dimensiones exactas.
- [x] **`AgendamientoTomaMedidas`**: Formulario para programar la visita de toma de medidas a domicilio.
- [x] **`SelectorModulosCocina`**: Selector gráfico de módulos para armar cocinas modulares.
- [x] **`GaleriaRendersMuebles`**: Galería con sliders interactivos de imágenes "Antes / Después".
- [x] **`SelectorAperturaPuertas`**: Diagrama interactivo para elegir el sentido de apertura.
- [x] **`CalculadorTarifaInstalacion`**: Tarifador dinámico según piso y complejidad del ensamble.

## 🧺 Vertical 7: Lavanderías y Tintorerías (`laundry`)
- [x] **`SelectorTipoPrendaLavado`**: Lista visual de prendas con métodos de lavado sugeridos.
- [x] **`CalculadoraLavadoKilos`**: Barra interactiva para estimar costo ingresando los kilogramos.
- [x] **`ProgramadorRutasDomicilio`**: Formulario para agendar recolección y entrega de prendas.
- [x] **`FichaReporteManchas`**: Formulario digital para marcar manchas específicas en una silueta.
- [x] **`SelectorFraganciaSuavizante`**: Selector de aromas e indicador de detergente hipoalergénico.
- [x] **`TarjetaSesionAutoservicio`**: Interfaz para escanear QR de lavadora/secadora física y ver tiempo restante.
- [x] **`BuscadorPercherosRopa`**: Buscador de ubicación de percheros numerados para entrega rápida.
- [x] **`SelectorVelocidadServicio`**: Selector de velocidad de entrega (Express, Mismo día, Normal) con recargo.
- [x] **`SaldoPuntosFidelizacion`**: Tarjeta con saldo de lavadas, puntos y cupones.
- [x] **`CuadriculaPrendasOlvidadas`**: Galería de prendas sin etiqueta con buscador descriptivo.

## 🛋️ Vertical 8: Tapicería y Restauración de Muebles (`furniture_repair`)
- [x] **`SelectorTelasTexturas`**: Muestrario de telas clasificadas por tipo con especificaciones de resistencia.
- [x] **`CalculadoraMetrajeTela`**: Estima metros de tela requeridos según el tipo de mueble.
- [x] **`SelectorDensidadEspuma`**: Selector de densidad de espuma y estado de resortes.
- [x] **`CargadorFotosRestauracion`**: Subir fotos del mueble desgastado desde diferentes ángulos.
- [x] **`SelectorAcabadoPatas`**: Selector de tonos de tinte y barniz para patas de madera.
- [x] **`SeguimientoFasesRestauracion`**: Stepper visual de etapas físicas del tapizado.
- [x] **`SelectorEstiloCosturas`**: Selector gráfico de tipos de costura y capitoné.
- [x] **`CalculadoraFleteMuebles`**: Calculadora basada en dimensiones y operarios necesarios.
- [x] **`ManualCuidadoTapiceria`**: Consejos para limpiar derrames y evitar desgaste.
- [x] **`ToggleImpermeabilizacion`**: Checkbox para agregar servicio de teflonado con garantía.

## 💆 Vertical 9: Estética, Podología y Bienestar (`wellness_podology`)
- [x] **`HistorialClinicoPodologia`**: Formulario privado de registro de patologías, alergias y tratamientos.
- [x] **`MapaAnatomicoPie`**: Imagen interactiva del pie para marcar zonas de dolor o lesiones.
- [x] **`SelectorServicioCabina`**: Selector de masajes con asignación automática de cabina.
- [x] **`SelectorProfesionalStaff`**: Filtros para seleccionar terapeuta/especialista preferido.
- [x] **`ConsentimientoFirmaDigital`**: Firma táctil de términos antes de tratamientos.
- [x] **`SelectorAceitesEsenciales`**: Selector de esencias para personalizar la experiencia en cabina.
- [x] **`RegistroEsterilizacionAutoclave`**: Registro de lotes de esterilización de herramientas médicas.
- [x] **`ProgramadorSesionesPaquete`**: Selector para agendar sesiones consecutivas de paquetes.
- [x] **`TarjetasProductosPostCuidado`**: Carrusel de cremas y plantillas sugeridas.
- [x] **`VisorAnalisisPisada`**: Ficha para registrar resultados del análisis de pisada.

## 🍎 Vertical 10: Minimarkets y Alimentos (`grocery_food`)
- [x] **`SelectorCantidadGranel`**: Input y selector de peso con precio dinámico reactivo.
- [x] **`AlertaVencimientoLotes`**: Alerta de productos próximos a vencer con rebaja de precios.
- [x] **`BuscadorCodigoPLU`**: Campo de búsqueda de códigos rápidos (PLU) de frutas y verduras.
- [x] **`CalculadoraCombosOfertas`**: Ficha de combos (ej. Arroz + Aceite) y cálculo de descuento.
- [x] **`FormularioAbastecimientoGondolas`**: Registro móvil de faltantes de productos en estantes.
- [x] **`SelectorHorariosRetiro`**: Selector de franja horaria para retiro en tienda física.
- [x] **`AdvertenciaNutricionalAlergenos`**: Alerta con etiquetas (Sin Gluten, Vegano, Contiene Maní).
- [x] **`FormularioMermasDesperdicios`**: Registro para dar de baja productos dañados.
- [x] **`PlantillaComprasRecurrentes`**: Carga de compras anteriores para recargar el carrito.
- [x] **`CuadriculaOfertasDia`**: Grilla dinámica de ofertas agrícolas del día.

## 🚜 Vertical 11: Insumos y Repuestos Agrícolas (`insumos-agricolas`)
- [x] **`BuscadorCompatibilidadInsumos`**: Buscador por tipo de cultivo que filtra fertilizantes, abonos y herramientas compatibles para evitar compras incorrectas.
- [x] **`CalculadoraRendimientoDosificacion`**: Calculadora interactiva de dosis sugerida y costo total según dimensiones del lote de cultivo.
- [x] **`FormularioPedidoMayorista`**: Matriz de pedido rápido en lote para abastos y cooperativas con descuentos escalonados por volumen.

## 🎂 Vertical 12: Alimentos Artesanales y Repostería (`alimentos-artesanales`)
- [x] **`ConfiguradorPastelesPersonalizados`** (Implementado como **`ConfiguradorPastelesEventos`**): Asistente de porciones, sabor, cobertura y dedicatoria.
- [x] **`ProgramadorEntregaPasteles`** (Implementado como **`BloqueadorCalendarioEntregas`**): Calendario con bloqueos de producción máxima diaria.
- [ ] **`SelectorAccesoriosFiesta`**: Selector de velas, toppers de felicitación y bengalas.
- [ ] **`CalculadoraPorcionesTorta`**: Sugiere pisos o diámetro de pastel según los invitados.
- [ ] **`AdvertenciaAlergenosBaker`**: Alerta para confirmar bizcochos especiales.
- [ ] **`CatalogoDisenosPasteleria`**: Sliders para elegir temáticas de decoración y precios base.
- [ ] **`SelectorCajasPasteleria`**: Selector de empaques altos con ventana y consejos de traslado.
- [ ] **`ConsejosConservacionPostres`**: Indicadores de refrigeración o temperatura ambiente.
- [x] **`CotizadorMesasDulces`** (Implementado como **`ModuloPresupuestoMesasDulces`**): Cotizador de bocaditos, macarons y trufas para eventos.
- [ ] **`SelectorRellenosGourmet`**: Dropdown visual de rellenos premium con recargos.

## 🛠️ Vertical 13: Ferretería y Construcción Rural (`ferreteria-rural`)
- [x] **`SelectorCalibreAlambre`**: Selector de alambres de púas o galvanizados por calibre y longitud.
- [ ] **`CalculadoraTejasZinc`**: Estima cantidad de tejas necesarias para cubrir un tejado.
- [ ] **`BuscadorTornillosPernos`**: Buscador por tipo de cabeza, rosca, paso y grado de acero.
- [ ] **`SelectorPostesCercados`**: Selector de postes de madera inmunizada o concreto.
- [ ] **`CalculadoraTuberiaRiego`**: Selector de mangueras de riego por diámetro y longitud.
- [ ] **`CalculadoraTanquesAgua`**: Estima litros requeridos según cabezas de ganado o personas.
- [ ] **`TarjetasHerramientasLabranza`**: Cuadrícula de machetes, palas y azadones con pesos.
- [ ] **`CalculadoraMallasCerramiento`**: Selector de mallas por metros lineales y altura.
- [ ] **`CotizadorPlantasGeneradores`**: Formulario para plantas eléctricas según Watts requeridos.
- [ ] **`CuadriculaConectoresPVC`**: Malla visual de codos, uniones, tees y llaves de paso.

## 🏍️ Vertical 14: Repuestos y Accesorios de Motos (`repuestos-motos`)
- [ ] **`BuscadorRepuestosMoto`**: Filtro jerárquico por marca, modelo, cilindrada y sistema de moto.
- [ ] **`SelectorRelacionArrastre`**: Piñón, corona y cadena por paso y cantidad de dientes.
- [ ] **`SelectorLlantasMoto`**: Selector por medida delantera/trasera y tipo de terreno.
- [ ] **`BuscadorAceiteFiltros`**: Sugiere aceite y filtros según el manual técnico.
- [ ] **`GuiaTallasCascos`**: Tabla de circunferencia e indicadores de certificación de seguridad.
- [ ] **`AgendamientoServiciosTaller`**: Agenda de citas para mantenimiento en taller.
- [ ] **`SelectorPastillasFrenos`**: Pastillas de freno según compuesto (sinterizadas, orgánicas).
- [ ] **`SelectorBateriasMoto`**: Baterías por código de referencia y CCA.
- [ ] **`SelectorAccesoriosViaje`**: Selector de maleteros, alforjas y sliders de protección.
- [ ] **`TablaEspecificacionesSuspension`**: Comparador de amortiguadores por distancia entre centros.

## 💅 Vertical 15: Suministros de Belleza Profesional (`distribuidoras-beauty`)
- [ ] **`CartaColoresTinturas`**: Cuadrícula interactiva con muestras de tonos de cabello.
- [ ] **`CalculadoraMezclasOxidante`**: Sugiere volúmenes y proporciones de mezcla de tintura.
- [ ] **`DiagnosticoTratamientoCapilar`**: Test de porosidad capilar para recomendar tratamientos.
- [ ] **`SelectorMobiliarioSalon`**: Muestrario de camillas, lavacabezas y sillas de peluquería.
- [ ] **`TarifasMayoristasBelleza`**: Descuentos progresivos por volumen de tintes y decolorantes.
- [ ] **`SelectorAccesoriosManicura`**: Selector de tonos de esmaltes semipermanentes y lámparas LED.
- [ ] **`EspecificacionesHerramientasTermicas`**: Tabla comparativa de planchas y secadores por placas.
- [ ] **`CarruselProductosBarberia`**: Carrusel de ceras de fijación y aceites de barba.
- [ ] **`RegistroEstilistasProfesionales`**: Validación de licencia para precios mayoristas.
- [ ] **`SelectorExtensionesCabello`**: Selector por tipo de fijación, largo y tono de extensiones.

## 🐶 Vertical 16: Alimentos y Accesorios para Mascotas (`petshops-locales`)
- [ ] **`CalculadoraRacionMascota`**: Gramos diarios recomendados por peso, edad y actividad.
- [ ] **`GuiaTallasMascotas`**: Medidas de cuello y pecho para elegir bozales y collares.
- [ ] **`AgendamientoPeluqueriaCanina`**: Reserva de citas de baño y corte para mascotas.
- [ ] **`FiltrosAlimentoMascota`**: Filtros de comida por edad y tamaño de raza.
- [ ] **`SelectorAntiparasitariosMascota`**: Selector de pipetas o pastillas ordenados por kg de peso.
- [ ] **`RegistroFichaMascota`**: Registro de vacunas, alergias e historial del animal.
- [ ] **`SelectorArenaGato`**: Selector de arenas (bentonita, sílice, ecofibras).
- [ ] **`SuscripcionMensualAlimento`**: Suscripción de alimento con envío automático recurrente.
- [ ] **`EscalaResistenciaJuguetes`**: Clasifica mordedores por nivel de resistencia (masticador destructivo).
- [ ] **`SelectorSuplementosMascotas`**: Suplementos articulares y calmantes naturales.

## ⚙️ Vertical 17: Repuestos de Electrodomésticos (`repuestos-lineablanca`)
- [ ] **`BuscadorRepuestosElectrodomesticos`**: Buscador por marca, modelo y número de serie de repuesto.
- [ ] **`SelectorTermostatosSensoresLineaBlanca`**: Termistores y fusibles térmicos compatibles.
- [ ] **`SelectorBombasMotoresLavarropas`**: Bombas y motores de lavadora por voltaje y potencia.
- [ ] **`MedidorBurletesNeveras`**: Medidas de empaques magnéticos de neveras por tipo de ranura.
- [ ] **`BuscadorTransmisionesCorreas`**: Transmisiones y correas por estrías y longitud.
- [ ] **`BuscadorTarjetasElectronicas`**: Placas de control principal y paneles de botones.
- [ ] **`SelectorResistenciasQuemadores`**: Resistencias de hornos y quemadores de estufas por Watts.
- [ ] **`SolicitudRepuestoDificil`**: Formulario de búsqueda manual enviando foto de la pieza.
- [ ] **`SelectorFiltrosAguaNevera`**: Filtros de agua de refrigerador internos/externos por marcas.
- [ ] **`SelectorValvulasEntradaAgua`**: Electroválvulas de entrada de agua por vías de paso.

## 👞 Vertical 18: Calzado y Confección Local (`moda-local-calzado`)
- [ ] **`MedidorTallasCalzado`**: Conversor de centímetros a talla de calzado adecuada.
- [ ] **`SelectorHormasCalzado`**: Selección de horma (normal, ancha, empeine alto).
- [ ] **`SelectorCuerosMateriales`**: Muestrario de tipos de cuero y textiles locales.
- [ ] **`ConfiguradorCalzadoMedida`**: Diseñador de mocasines o botas por tipo de suela y color.
- [ ] **`SelectorSuelasTacones`**: Selector de suelas y tacones con escala de rigidez.
- [ ] **`CarruselMantenimientoCalzado`**: Betunes, cepillos y cremas protectoras compatibles.
- [ ] **`SelectorForroInterno`**: Forros interiores (badana transpirable, chiporro térmico).
- [ ] **`FormularioReparacionCalzado`**: Registro de reparación de tapas o teñido de calzado.
- [ ] **`DetallePlantillasConfort`**: Plantillas acolchadas ortopédicas o de memory foam.
- [ ] **`SelectorAlturaCanaBotas`**: Visualizador del alto de caña de botas con contorno de pantorrilla.

## 🥗 Vertical 19: Alimentación Orgánica y Saludable (`alimentacion-saludable`)
- [ ] **`SelectorFiltrosDieteticos`**: Filtros Keto, Vegano, Orgánico, Sin Azúcar, Sin Gluten.
- [ ] **`TablaInformacionNutricional`**: Desglose de calorías, grasas y azúcares añadidos.
- [ ] **`CalculadoraRecargaGranel`**: Pedido de granos a granel indicando tipo de envase.
- [ ] **`CanastaOrganicaSuscripcion`**: Suscripción de canastas de hortalizas ecológicas semanales.
- [ ] **`SelloOrigenEcologico`**: Mapa del productor local y cálculo de huella de carbono.
- [ ] **`SelectorIngredientesRecetas`**: Añadir todos los ingredientes de una receta al carrito.
- [ ] **`SelectorEdulcorantesAlternativos`**: Endulzantes (Estevia, Alulosa, Miel) con índice glucémico.
- [ ] **`SelectorBebidasVegetales`**: Bebidas de almendra, soya, avena y coco con nivel de calcio.
- [ ] **`AlertasCosechaDia`**: Notificaciones de cultivos recién cosechados disponibles.
- [ ] **`ComparadorProteinaVegetal`**: Comparador gráfico de gramos de proteína por ración.

## 💻 Vertical 20: Equipamiento Home Office (`home-office-ergonomia`)
- [ ] **`CalculadoraErgonomiaAltura`**: Altura de silla y monitor según la estatura del usuario.
- [ ] **`SelectorMecanismoErgonomico`**: Selector de inclinación sincrónica o contacto permanente.
- [ ] **`ConfiguradorEscritorioElevable`**: Ajustes de escritorio regulable y acabados del tablero.
- [ ] **`SelectorBrazosMonitores`**: Soportes para pantallas de monitor por peso y pulgadas.
- [ ] **`ListaAccesoriosErgonomicos`**: Reposapiés, cojines lumbares y mouses ergonómicos.
- [ ] **`SelectorSuperficiesEscritorio`**: Tableros de melamina, pino, bambú o vidrio templado.
- [ ] **`CalculadoraBandejasPasacables`**: Canaletas de cables con tomacorrientes integrados.
- [ ] **`SelectorRuedasSillas`**: Ruedas de silicona para pisos duros o nylon para alfombras.
- [ ] **`SelectorMallasTextiles`**: Muestrario de mallas antitranspirantes para el espaldar.
- [ ] **`CalculadoraTarifaEnsamble`**: Tarifador de armado e instalación del mobiliario.

## 🍹 Vertical 21: Bodega de Licores y Coctelería (`licores-cocteleria`)
- [ ] **`SelectorCrianzaAnosLicores`**: Filtros por añejamiento (Whisky 12/18 años, Vinos Gran Reserva).
- [ ] **`CalculadoraBebidasEventos`**: Estima botellas de alcohol e hielo según los invitados.
- [ ] **`MallaMaridajeLicores`**: Recomendación de maridajes óptimos de copas y comidas.
- [ ] **`ConstructorKitsCocteles`**: Asistente para armar kits de cocteles a medida.
- [ ] **`GuiaTemperaturaServicio`**: Temperatura sugerida de decantación y servicio.
- [ ] **`SelectorCristaleriaCoctel`**: Vasos y copas recomendados según el licor.
- [ ] **`SeccionBebidasSinAlcohol`**: Destilados botánicos 0.0% e insumos de coctelería analcohólica.
- [ ] **`SelectorBotanicosGintonic`**: Especias, bayas de enebro, cardamomo y cítricos.
- [ ] **`DescuentosCajasLicores`**: Descuentos de precio por cajas de 6 o 12 botellas.
- [ ] **`ModalVerificacionEdad`**: Modal de entrada con confirmación legal de mayoría de edad.

## 🧸 Vertical 22: Artículos Geek y Coleccionismo (`coleccionismo-geek`)
- [ ] **`EscalaEstadoCajaFunko`**: Calificación de empaque (Grado 10/10, Caja regular) con fotos.
- [ ] **`TablaMedidasCamisetasGeek`**: Tabla de camisetas con medidas de sisa y largo.
- [ ] **`SelectorProtectoresColeccionismo`**: Estuches protectores blandos de plástico o acrílicos rígidos.
- [ ] **`TarjetaAbonoPreventa`**: Tarjeta de abono para reservar lanzamientos con costo estimado.
- [ ] **`FiltrosRarezaExclusividad`**: Filtros Chase, Vaulted, Exclusivo de convención.
- [ ] **`SeguimientoColeccionCompleta`**: Visualizador de colección para marcar piezas deseadas/compradas.
- [ ] **`VisorCartasTCGZoom`**: Visor de alta resolución para cartas coleccionables.
- [ ] **`SelectorBasesIluminacion`**: Soportes acrílicos retroiluminados para exhibición de figuras.
- [ ] **`FormularioCanjeFiguras`**: Solicitud de intercambio o venta de figuras usadas.
- [ ] **`DirectorioFranquiciasGeek`**: Logos y links de clasificación por sagas o franquicias.

## 📦 Vertical 23: Insumos Horeca B2B (`distribucion-horeca`)
- [ ] **`SelectorFormatosHoreca`**: Formatos industriales de aceite bidón, salsas galón y sacos.
- [ ] **`TarifasMayoristasHoreca`**: Descuentos B2B por palets o cajas de volumen.
- [ ] **`FormularioAbastoRecurrente`**: Pedido de insumos recurrentes mensuales en un clic.
- [ ] **`CalculadoraCostoPorcion`**: Calcula el costo de receta según el precio unitario del bulto.
- [ ] **`SelectorEmpaquesTakeaway`**: Envases desechables compostables por divisiones y formas.
- [ ] **`SolicitudCreditoB2B`**: Formulario de crédito rotativo con subida de RUT e impuestos.
- [ ] **`SelectorInsumosBaristas`**: Pitillos de papel, vasos desechables de café y edulcorantes.
- [ ] **`AlertaStockMinimoHoreca`**: Notifica escasez de insumos críticos de restaurante.
- [ ] **`CalculadoraLogisticaFrio`**: Requerimiento de transporte refrigerado o seco.
- [ ] **`SelectorInsumosLimpieza`**: Jabón antibacterial y desinfectante industrial por galón.
