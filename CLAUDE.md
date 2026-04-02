# CLAUDE.md — Instrucciones para Claude Code

## Proyecto: CoreOps — App Web de Gestión Empresarial (Soclean)

---

## 📌 DESCRIPCIÓN DEL PROYECTO

CoreOps es una aplicación web empresarial para gestionar servicios, personal, facturación y nómina de Soclean Uruguay.
Está diseñada para ser modular, escalable y de fácil uso.

**Deploy**: https://soclean-coordinacion.vercel.app
**Repositorio**: https://github.com/socleanops/App-web-Coordinaci-n-Soclean

---

## 🛠️ STACK TECNOLÓGICO

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS + shadcn/ui
- **Base de datos / Auth / Storage**: Supabase
- **Estado global**: Zustand / TanStack Query
- **Formularios**: React Hook Form + Zod
- **Tablas**: TanStack Table v8
- **Gráficas**: Recharts
- **Fechas**: date-fns
- **Exportación**: xlsx + jsPDF + jspdf-autotable
- **Iconos**: Lucide React
- **Package manager**: pnpm
- **Tests unitarios**: Vitest (51 tests en 14 archivos — mantener en verde)
- **Tests E2E**: Playwright (3 tests en core-flow.spec.ts — mantener en verde)

---

## 📁 ESTRUCTURA DE CARPETAS

```
src/
├── components/
│   ├── ui/              → Componentes shadcn/ui (NO modificar sin autorización)
│   ├── layout/          → Sidebar, Header, Layout principal
│   ├── dashboard/
│   ├── funcionarios/
│   ├── clientes/
│   ├── servicios/
│   ├── horarios/
│   ├── asistencia/
│   ├── facturacion/
│   └── nomina/
├── pages/               → Una página por módulo
├── hooks/               → Custom hooks (useAuth, useFuncionarios, etc.)
├── lib/
│   ├── services/        → Servicios de acceso a Supabase por módulo
│   ├── supabase.ts      → ⚠️ ARCHIVO CRÍTICO — No modificar sin plan aprobado
│   ├── utils.ts
│   └── validations/     → Schemas Zod por módulo
├── stores/              → Zustand stores
├── types/               → Interfaces y tipos TypeScript
└── constants/           → Roles, estados, configuraciones globales

src/__tests__/           → Tests Vitest (espeja estructura de src/)
tests/e2e/               → Tests Playwright
```

---

## ✅ REGLAS OBLIGATORIAS — SIEMPRE RESPETAR

### Código

- TypeScript **estricto**: prohibido usar `any` — sin excepciones
- Para mocks en Vitest usar `as never`, nunca `as any`
- Para errores de Supabase en catch blocks usar el patrón:
  ```typescript
  import type { PostgrestError } from '@supabase/supabase-js';
  const errMessage = error instanceof Error
    ? error.message
    : (error as PostgrestError).message ?? String(error);
  ```
- Todos los componentes deben tener sus **tipos definidos explícitamente**
- Naming en **camelCase** para variables/funciones, **PascalCase** para componentes
- Sin código comentado en el repositorio principal
- Máximo **200 líneas por archivo** — si supera ese límite, dividir en subcomponentes

### Base de datos

- **Nunca modificar** el archivo `src/lib/supabase.ts` sin plan aprobado
- **Nunca eliminar** tablas ni columnas directamente — solo proponer migraciones
- Toda consulta a Supabase debe tener **manejo de errores** explícito
- Las queries que afecten nómina o facturación deben incluir **transacciones**

### Variables de entorno

- Las variables de entorno empiezan con `VITE_` (no `NEXT_PUBLIC_`)
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son las críticas
- **Nunca** hardcodear credenciales en el código

### UI / Estilos

- Respetar la paleta de colores definida en `tailwind.config.ts`
- **No instalar** librerías de UI adicionales (solo shadcn/ui ya instalada)
- Todos los textos visibles al usuario en **español**
- Los mensajes de error deben ser **claros y amigables**

---

## 🧪 REGLAS DE TESTING — CRÍTICO

### Vitest (tests unitarios)

- Correr con: `pnpm test` o `vitest run`
- Los tests van en `src/__tests__/` espejando la estructura de `src/`
- Nombrar archivos: `nombreDelModulo.test.ts`
- **NUNCA usar `as any`** en mocks — usar `as never`
- Cada función de cálculo numérico debe tener mínimo **3 casos de prueba**
- Ejecutar `pnpm test` antes de cualquier commit — debe salir exit 0

### Playwright (tests E2E)

- Correr con: `npx playwright test`
- Tests en: `tests/e2e/core-flow.spec.ts`
- **NUNCA usar aserciones estáticas** sobre elementos que puedan estar hidratándose:
  ```typescript
  // ❌ MAL — no tiene auto-retry:
  expect(await page.locator('table tr').count()).toBeGreaterThan(1);

  // ✅ BIEN — auto-retry nativo de Playwright:
  await expect(page.locator('table tr').nth(1)).toBeVisible({ timeout: 15000 });
  await expect(page.locator('table tr')).toHaveCount(n, { timeout: 15000 });
  ```
- **Siempre esperar señales de hidratación React** antes de hacer click:
  ```typescript
  await page.locator('table').waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await expect(boton).toBeEnabled({ timeout: 10000 });
  await boton.click();
  ```
- Prevenir race conditions esperando elementos post-fetch antes de interactuar

---

## 🔍 MÓDULOS DEL SISTEMA — PRIORIDADES

### 🔴 CRÍTICOS (máxima precaución)

1. **Nómina** — Afecta pagos reales. Cualquier cambio requiere tests exhaustivos.
2. **Facturación** — Afecta cobros a clientes. Verificar cálculos de impuestos.
3. **Autenticación / Roles** — No modificar lógica de permisos sin plan aprobado.

### 🟡 IMPORTANTES

1. **Asistencia** — Los datos alimentan el cálculo de nómina.
2. **Funcionarios** — Tabla central referenciada por casi todos los módulos.
3. **Clientes** — Referenciados en servicios y facturas.

### 🟢 ESTÁNDAR (cambios más libres con tests)

1. **Servicios** — Catálogo de servicios prestados.
2. **Horarios** — Gestión de turnos.
3. **Dashboard** — Solo lectura, sin escritura a base de datos.

---

## 🚫 LO QUE CLAUDE CODE NO DEBE HACER NUNCA

- ❌ Hacer merge de sus propios PRs
- ❌ Modificar archivos de configuración de Supabase sin plan aprobado
- ❌ Cambiar la estructura de las tablas `nominas`, `nomina_items`, `facturas`, `factura_items`
- ❌ Eliminar o renombrar columnas existentes en la base de datos
- ❌ Instalar dependencias nuevas sin mencionarlo en el PR
- ❌ Modificar el sistema de roles y permisos sin aprobación
- ❌ Hacer cambios en más de 3 módulos en un solo PR
- ❌ Usar `console.log` en código de producción
- ❌ Usar `as any` en ningún contexto

---

## ✅ TAREAS IDEALES PARA CLAUDE CODE

- Corregir errores de TypeScript o lint detectados en el CI
- Eliminar imports no utilizados
- Agregar manejo de errores en llamadas a Supabase
- Escribir o completar tests faltantes en módulos críticos
- Optimizar queries lentas a Supabase
- Mejorar accesibilidad (atributos `aria-*`, roles semánticos HTML)
- Actualizar dependencias de parche (x.x.PATCH) de forma segura
- Agregar comentarios JSDoc a funciones de cálculo complejo

---

## 🌿 ESTRATEGIA DE RAMAS

- `main` → producción, **solo merge con PR aprobado**
- `dev` → rama de desarrollo activo
- `fix/*` → correcciones
- `test/*` → cobertura de tests
- `feature/*` → nuevas funcionalidades

Claude Code **siempre** abre sus PRs hacia `dev`, nunca hacia `main`.

---

## 📝 FORMATO ESPERADO DE PULL REQUESTS

```
## ¿Qué hace este PR?
(Descripción breve en 1-2 líneas)

## Módulos afectados
(Lista de archivos/carpetas modificados)

## Tipo de cambio
- [ ] Bug fix
- [ ] Mejora de rendimiento
- [ ] Tests
- [ ] Refactor

## ¿Requiere revisión especial?
(Indicar si toca módulos críticos: nómina, facturación, auth)

## Tests
- [ ] pnpm test pasa (exit 0)
- [ ] Nuevos tests agregados (si aplica)
- [ ] npx playwright test pasa (si se modificó UI)
```

---

## 🔗 REFERENCIAS

- Documentación Supabase: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com/docs
- Vitest: https://vitest.dev
- Playwright: https://playwright.dev

---

*Archivo para Claude Code. Basado en AGENTS.md del proyecto.*
*Ante cualquier duda sobre el alcance de una tarea, detenerse y pedir clarificación antes de proceder.*
