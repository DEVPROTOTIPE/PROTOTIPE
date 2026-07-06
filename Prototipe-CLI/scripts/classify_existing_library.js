import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GIT_ROOT = path.resolve(__dirname, '..', '..');

// Matriz de mapeo completa de componentes a nichos y tipos
const componentMappings = {
  "DeveloperBillingPanel": { type: "component", niches: [] },
  "TelemetryService": { type: "service", niches: [] },
  "ErrorDiagnosticConsole": { type: "component", niches: [] },
  "ModalTemplate": { type: "component", niches: [] },
  "ModalConfirm": { type: "component", niches: [] },
  "CategoryManager": { type: "component", niches: ["retail_clothing", "grocery_food", "distribuidoras-beauty"] },
  "CustomSelect": { type: "component", niches: [] },
  "VariantSelector": { type: "component", niches: ["retail_clothing", "moda-local-calzado", "distribuidoras-beauty", "coleccionismo-geek"] },
  "Pagination": { type: "component", niches: [] },
  "BackButton": { type: "component", niches: [] },
  "QuantitySelector": { type: "component", niches: [] },
  "DarkModeToggle": { type: "component", niches: [] },
  "LeafletMapPicker": { type: "component", niches: ["contractors", "machinery_rental", "laundry", "grocery_food", "distribucion-horeca"] },
  "GuidedToast": { type: "component", niches: [] },
  "PWAInstallBanner": { type: "component", niches: [] },
  "useCartStore": { type: "hook", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "distribuidoras-beauty", "petshops-locales", "moda-local-calzado", "alimentacion-saludable", "home-office-ergonomia", "licores-cocteleria", "coleccionismo-geek", "distribucion-horeca"] },
  "CartDrawer": { type: "component", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "distribuidoras-beauty", "petshops-locales", "moda-local-calzado", "alimentacion-saludable", "home-office-ergonomia", "licores-cocteleria", "coleccionismo-geek", "distribucion-horeca"] },
  "FilterPanel": { type: "component", niches: ["retail_clothing", "grocery_food", "distribuidoras-beauty", "petshops-locales", "moda-local-calzado", "alimentacion-saludable", "home-office-ergonomia", "licores-cocteleria", "coleccionismo-geek"] },
  "CatalogFiltersCreator": { type: "component", niches: ["retail_clothing", "grocery_food", "distribuidoras-beauty", "petshops-locales", "moda-local-calzado", "alimentacion-saludable", "home-office-ergonomia", "licores-cocteleria", "coleccionismo-geek"] },
  "CheckoutModal": { type: "component", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "distribuidoras-beauty", "petshops-locales", "moda-local-calzado", "alimentacion-saludable", "home-office-ergonomia", "licores-cocteleria", "coleccionismo-geek", "distribucion-horeca"] },
  "ProductCard": { type: "component", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "distribuidoras-beauty", "petshops-locales", "moda-local-calzado", "alimentacion-saludable", "home-office-ergonomia", "licores-cocteleria", "coleccionismo-geek", "distribucion-horeca"] },
  "OrderTrackingTimeline": { type: "component", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "laundry", "distribucion-horeca"] },
  "MapToggle": { type: "component", niches: ["contractors", "machinery_rental", "laundry", "grocery_food", "distribucion-horeca"] },
  "CurrencyInput": { type: "component", niches: [] },
  "ConnectivityToast": { type: "component", niches: [] },
  "SwipeableBottomSheet": { type: "component", niches: [] },
  "OTPInputField": { type: "component", niches: [] },
  "CommandPaletteKBar": { type: "component", niches: [] },
  "InteractiveCouponBadge": { type: "component", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "distribuidoras-beauty", "moda-local-calzado", "coleccionismo-geek"] },
  "InteractiveTutorialTour": { type: "component", niches: [] },
  "DatePickerPremium": { type: "component", niches: ["wellness_podology", "technical_services", "refrigeration_ac", "contractors", "machinery_rental", "carpentry", "laundry", "furniture_repair", "alimentos-artesanales"] },
  "RadialInteractiveMenu": { type: "component", niches: [] },
  "MagneticButton": { type: "component", niches: [] },
  "NotificationBell": { type: "component", niches: [] },
  "BreadcrumbHeader": { type: "component", niches: [] },
  "CustomCursor": { type: "component", niches: [] },
  "LazyImage": { type: "component", niches: [] },
  "OrderTracking": { type: "component", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "laundry", "distribucion-horeca"] },
  "CarrucelProductos": { type: "component", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "distribuidoras-beauty", "petshops-locales", "moda-local-calzado", "alimentacion-saludable", "home-office-ergonomia", "licores-cocteleria", "coleccionismo-geek"] },
  "CatalogBanner": { type: "component", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "distribuidoras-beauty", "petshops-locales", "moda-local-calzado", "alimentacion-saludable", "home-office-ergonomia", "licores-cocteleria", "coleccionismo-geek"] },
  "CatalogGrid": { type: "component", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "distribuidoras-beauty", "petshops-locales", "moda-local-calzado", "alimentacion-saludable", "home-office-ergonomia", "licores-cocteleria", "coleccionismo-geek", "distribucion-horeca"] },
  "AdminStockAlerts": { type: "component", niches: ["retail_clothing", "grocery_food", "distribuidoras-beauty", "petshops-locales", "moda-local-calzado", "repuestos-motos", "repuestos-lineablanca", "ferreteria-rural", "insumos-agricolas"] },
  "EmptyState": { type: "component", niches: [] },
  "BentoGrid": { type: "component", niches: [] },
  "InfiniteLogoMarquee": { type: "component", niches: ["retail_clothing", "moda-local-calzado", "distribuidoras-beauty", "coleccionismo-geek"] },
  "HolographicTiltCard": { type: "component", niches: ["coleccionismo-geek", "retail_clothing"] },
  "SwipeableCardStack": { type: "component", niches: ["retail_clothing", "moda-local-calzado", "coleccionismo-geek"] },
  "InteractiveAmbientGlow": { type: "component", niches: [] },
  "GlobalSkeletonLoader": { type: "component", niches: [] },
  "CircularDishMenu": { type: "component", niches: ["grocery_food", "alimentos-artesanales", "licores-cocteleria", "distribucion-horeca"] },
  "useFirestoreCollection": { type: "hook", niches: [] },
  "useInactivityTimer": { type: "hook", niches: [] },
  "useAlertConfirm": { type: "hook", niches: [] },
  "useSavedLocation": { type: "hook", niches: ["contractors", "machinery_rental", "laundry", "grocery_food", "distribucion-horeca"] },
  "InventoryTransactionService": { type: "service", niches: [] },
  "couponService": { type: "service", niches: [] },
  "deliveryService": { type: "service", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "laundry", "distribucion-horeca"] },
  "DeveloperDiagnosticsModal": { type: "component", niches: [] },
  "whatsappService": { type: "service", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "wellness_podology", "moda-local-calzado"] },
  "pdfService": { type: "service", niches: [] },
  "ThemeManager": { type: "service", niches: [] },
  "AppResetTool": { type: "service", niches: [] },
  "ErrorBoundaryFallback": { type: "component", niches: [] },
  "LoginPage": { type: "component", niches: [] },
  "WelcomePage": { type: "component", niches: [] },
  "QRProductPublicDetail": { type: "component", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "moda-local-calzado", "coleccionismo-geek"] },
  "StockHeatmap": { type: "component", niches: ["retail_clothing", "grocery_food", "distribuidoras-beauty", "petshops-locales", "moda-local-calzado"] },
  "RaffleNumberSelector": { type: "component", niches: ["retail_clothing", "grocery_food", "coleccionismo-geek", "distribuidoras-beauty", "moda-local-calzado"] },
  "RaffleWheelOfFortune": { type: "component", niches: ["retail_clothing", "grocery_food", "coleccionismo-geek", "distribuidoras-beauty", "moda-local-calzado"] },
  "AgendaReservationCalendar": { type: "component", niches: ["wellness_podology", "technical_services", "refrigeration_ac", "contractors", "carpentry", "laundry", "furniture_repair"] },
  "CajaDiariaPOS": { type: "module", niches: ["grocery_food", "ferreteria-rural", "repuestos-motos", "distribuidoras-beauty", "petshops-locales", "licores-cocteleria", "distribucion-horeca"] },
  "CreditosSaldos": { type: "module", niches: ["distribucion-horeca", "contractors", "technical_services", "machinery_rental", "insumos-agricolas", "ferreteria-rural"] },
  "OmnicanalidadWhatsApp": { type: "module", niches: ["retail_clothing", "grocery_food", "alimentos-artesanales", "wellness_podology", "moda-local-calzado", "coleccionismo-geek"] },
  "TelemetriaCentralizada": { type: "module", niches: [] },
  "PantallaCocinaKDS": { type: "module", niches: ["grocery_food", "alimentos-artesanales", "licores-cocteleria"] },
  "ReservasAgendaCitas": { type: "module", niches: ["wellness_podology", "technical_services", "refrigeration_ac", "contractors", "carpentry", "laundry", "furniture_repair"] },
  "POSExpressScanner": { type: "module", niches: ["grocery_food", "ferreteria-rural", "repuestos-motos", "distribuidoras-beauty", "petshops-locales", "licores-cocteleria", "distribucion-horeca"] },
  "OrdenesTrabajoEquipos": { type: "module", niches: ["technical_services", "refrigeration_ac", "contractors", "machinery_rental", "furniture_repair", "repuestos-motos", "repuestos-lineablanca"] },
  "ModuloAgendamientoBarberia": { type: "module", niches: ["wellness_podology"] }
};

async function run() {
  const readmePath = path.join(GIT_ROOT, 'Documentacion PROTOTIPE', '06_Biblioteca_Componentes', 'README.md');
  if (!await fs.pathExists(readmePath)) {
    console.error('No se encontró el README.md de la biblioteca.');
    return;
  }

  const content = await fs.readFile(readmePath, 'utf8');
  const lines = content.split('\n');
  let count = 0;

  for (const line of lines) {
    const compMatch = line.match(/^\*\s+\[(.+?)\]\(([^)]+)\):\s*(.+)/);
    if (compMatch) {
      const link = compMatch[2].trim();
      let absolutePath;
      if (link.startsWith('file://')) {
        absolutePath = fileURLToPath(link);
      } else {
        absolutePath = path.resolve(link);
      }
      
      if (await fs.pathExists(absolutePath)) {
        let mdContent = await fs.readFile(absolutePath, 'utf8');
        const manifestMatch = mdContent.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
        
        if (manifestMatch) {
          try {
            const manifest = JSON.parse(manifestMatch[1]);
            const technicalName = manifest.technicalName || manifest.resource;
            const mapping = componentMappings[technicalName];
            
            if (mapping) {
              manifest.type = mapping.type;
              manifest.niches = mapping.niches;
              
              const newManifestJson = JSON.stringify(manifest, null, 2);
              const updatedContent = mdContent.replace(
                /<!--\s*\{[\s\S]*?\}\s*-->/,
                `<!--\n${newManifestJson}\n-->`
              );
              
              await fs.writeFile(absolutePath, updatedContent, 'utf8');
              console.log(`[OK] Actualizado manifiesto para: ${technicalName}`);
              count++;
            }
          } catch (e) {
            console.error(`[Error] Fallo al parsear manifiesto en ${absolutePath}:`, e.message);
          }
        }
      }
    }
  }

  console.log(`\n==================================================`);
  console.log(`🎉 PROCESAMIENTO FINALIZADO. ${count} manifiestos actualizados.`);
  console.log(`==================================================`);
}

run();
