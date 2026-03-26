# Proyecto Soclean Coordinación (CoreOps)

## Arquitectura de la Aplicación

### Organización de Archivos
- `/src`: Código fuente de la interfaz y hooks React.
- `/lib/services`: Capa de lógica de negocio y conexión directa con Supabase.
- `/lib/validation`: Esquemas de validación Zod.
- `/tests/e2e`: Pruebas de extremo a extremo con Playwright.
- `/.github/workflows`: Automatización CI/CD.

### Stack Tecnológico
- **Frontend**: React + Vite
- **Base de Datos / Auth**: Supabase
- **Estilos**: Tailwind CSS
- **QA**: Playwright + Vitest
- **CI/CD**: GitHub Actions

### Guía de Desarrollo
1. Toda lógica de datos debe ir en `/lib/services`.
2. Los formularios deben validarse en `/lib/validation`.
3. Antes de cada push, correr `pnpm test:e2e` localmente.
