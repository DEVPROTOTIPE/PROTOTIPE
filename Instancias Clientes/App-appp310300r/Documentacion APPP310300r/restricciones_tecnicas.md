# 🚫 Restricciones Técnicas — APPP310300r

> La IA debe consultar este archivo antes de actualizar dependencias, cambiar patterns o sugerir librerías.

## Stack Fijo (No Negociable)
- **Framework:** React + Vite
- **Estilos:** Tailwind CSS v4 con tokens HSL en `@theme`
- **DB:** Firebase Firestore
- **Estado:** Zustand
- **Plantilla base:** `template-core-seed`

## Dependencias con Versión Fijada
| Dependencia | Versión | Razón del bloqueo |
|---|---|---|
| firebase | Ver package.json | Compatibilidad con reglas de seguridad existentes |

## Patrones Prohibidos en Este Proyecto
- ❌ Hardcodear Project IDs o credenciales en código fuente
- ❌ `onSnapshot` sin validar Auth y sin retornar cleanup
- ❌ Modificar stock/inventario sin `runTransaction`
- ❌ Despliegues automáticos sin aprobación explícita
- ❌ Bordes negros crudos — usar `border-app` o HSL bajos

## Limitaciones Conocidas de Esta Instancia
*(Ej: "El cliente usa solo dispositivos Android con conexión 4G inestable")*
