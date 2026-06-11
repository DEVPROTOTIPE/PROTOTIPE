# 🚫 Restricciones Técnicas — App Domiciliarios

## Stack Fijo (No Negociable)
- React + Vite
- Tailwind CSS v4 con tokens HSL en `@theme`
- Firebase Firestore + Auth
- Zustand

## Patrones Prohibidos
- ❌ Hardcodear credenciales
- ❌ `onSnapshot` sin Auth ni cleanup
- ❌ Modificar inventario sin `runTransaction`
- ❌ Bordes negros crudos
- ❌ Despliegues automáticos sin aprobación

## Dependencias con Versión Fijada
| Dependencia | Versión | Razón |
|---|---|---|
| firebase | Ver package.json | Compatibilidad con reglas Firestore |
