# AGENTS.md — Instrucciones para Jules
# Proyecto: CoreOps — App Web de Gestión Empresarial

---

## 📌 DESCRIPCIÓN DEL PROYECTO

CoreOps es una aplicación web empresarial para gestionar servicios, personal, facturación y nómina.
Está diseñada para ser modular, escalable y de fácil uso.

**URL del proyecto**: (completar cuando esté en producción)
**Repositorio**: (completar con URL del repo)
**Entorno de staging**: (completar cuando esté disponible)

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
- **Exportación**: xlsx + jsPDF
- **Iconos**: Lucide React

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
├── hooks/               → React Query hooks (Llaman a services, NO a Supabase directamente)
├── lib/
│   ├── services/        → ⚠️ CAPA CRÍTICA — Toda la lógica de negocio y consultas a Supabase
│   ├── supabase.ts      → Cliente de Supabase
│   ├── utils.ts
│   └── validations/     → Schemas Zod por módulo
├── stores/              → Zustand stores
├── types/               → Interfaces y tipos TypeScript
└── constants/           → Roles, estados, configuraciones globales
```

---

## ✅ REGLAS OBLIGATORIAS — SIEMPRE RESPETAR

### Código
- TypeScript **estricto**: prohibido usar `any`, `unknown` sin justificación documentada
- Todos los componentes deben tener sus **tipos definidos explícitamente**
- Naming en **camelCase** para variables/funciones, **PascalCase** para componentes
- Sin código comentado en el repositorio principal (usar ramas para experimentos)
- Máximo **200 líneas por archivo** — si supera ese límite, dividir en subcomponentes

### Base de datos
- **Centralización**: Toda consulta a Supabase DEBE vivir en `src/lib/services/`.
- **Hooks Limpios**: Los hooks en `src/hooks/` solo deben coordinar el estado de React Query llamando a los servicios.
- **Nunca modificar** el archivo `src/lib/supabase.ts` sin un plan aprobado.
- **Transacciones**: Lógica compleja (nómina, facturación) debe ser atómica en el servicio correspondiente.
- **Manejo de Errores**: Todo servicio debe capturar y formatear errores para que la UI los muestre amigablemente.

### UI / Estilos
- Respetar la paleta de colores definida en `tailwind.config.ts`
- **No instalar** librerías de UI adicionales sin consultar (solo usar shadcn/ui ya instalada)
- Todos los textos visibles al usuario deben estar **en español**
- Los mensajes de error al usuario deben ser **claros y amigables** (no mostrar errores técnicos crudos)

### Seguridad
- **Nunca** hardcodear credenciales, tokens ni URLs de Supabase en el código
- Usar siempre las variables de entorno definidas en `.env.local`
- Las variables de entorno empiezan con `VITE_` para ser accesibles en el frontend

---

## 🧪 REGLAS DE TESTING

- **Obligatorio** escribir tests para toda lógica de negocio en estos módulos:
  - `nomina/` → cálculo de salarios, horas extra, deducciones
  - `facturacion/` → generación de facturas, cálculo de impuestos, totales
  - `asistencia/` → cálculo de horas trabajadas, tardanzas, ausencias
- Usar **Vitest** como framework de testing
- Los tests van en `src/__tests__/` espejando la estructura de `src/`
- Nombrar archivos de test: `nombreDelModulo.test.ts`
- Cada función de cálculo numérico debe tener mínimo **3 casos de prueba** (caso normal, borde, error)
- Ejecutar `pnpm test` antes de abrir cualquier PR

---

## 🔍 MÓDULOS DEL SISTEMA — PRIORIDADES

### 🔴 CRÍTICOS (máxima precaución en cambios)
1. **Nómina** — Afecta pagos reales a empleados. Cualquier cambio requiere tests exhaustivos.
2. **Facturación** — Afecta cobros a clientes. Verificar cálculos de impuestos y totales.
3. **Autenticación / Roles** — No modificar la lógica de permisos sin plan aprobado.

### 🟡 IMPORTANTES (precaución normal)
4. **Asistencia** — Los datos alimentan el cálculo de nómina.
5. **Funcionarios** — Tabla central referenciada por casi todos los módulos.
6. **Clientes** — Referenciados en servicios y facturas.

### 🟢 ESTÁNDAR (cambios más libres con tests)
7. **Servicios** — Catálogo de servicios prestados.
8. **Horarios** — Gestión de turnos.
9. **Dashboard** — Solo lectura, sin escritura a base de datos.

---

## 🚫 LO QUE JULES NO DEBE HACER NUNCA

- ❌ Aprobar ni hacer merge de sus propios PRs
- ❌ Modificar archivos de configuración de Supabase (`.sql`, migraciones) sin un plan detallado aprobado
- ❌ Cambiar la estructura de las tablas `nominas`, `nomina_items`, `facturas`, `factura_items`
- ❌ Eliminar o renombrar columnas existentes en la base de datos
- ❌ Instalar dependencias nuevas sin mencionarlo en la descripción del PR
- ❌ Modificar el sistema de roles y permisos sin aprobación explícita
- ❌ Hacer cambios en más de 3 módulos en un solo PR (dividir en PRs pequeños y enfocados)
- ❌ Usar `console.log` en código de producción (solo en archivos `.test.ts`)

---

## ✅ TAREAS IDEALES PARA JULES

Jules puede y debe tomar la iniciativa en estas áreas sin necesitar prompt específico:

- Corregir errores de TypeScript o lint detectados en el CI
- Eliminar imports no utilizados
- Agregar o mejorar el manejo de errores en llamadas a Supabase
- Escribir o completar tests faltantes en módulos críticos
- Optimizar queries lentas a Supabase (detectadas por tiempo de respuesta)
- Mejorar accesibilidad (atributos `aria-*`, roles semánticos HTML)
- Actualizar dependencias **de parche** (x.x.PATCH) de forma segura
- Agregar comentarios JSDoc a funciones de cálculo complejo

---

## 📝 FORMATO ESPERADO DE PULL REQUESTS

Todo PR de Jules debe incluir en su descripción:

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
- [ ] Actualización de dependencias

## ¿Requiere revisión especial?
(Indicar si toca módulos críticos: nómina, facturación, auth)

## Tests
- [ ] Tests existentes pasan
- [ ] Nuevos tests agregados (si aplica)
```

---

## 🌿 ESTRATEGIA DE RAMAS

- `main` → producción, **solo merge con PR aprobado**
- `dev` → rama de desarrollo activo
- `jules/fix-*` → ramas de Jules para correcciones
- `jules/test-*` → ramas de Jules para tests
- `jules/refactor-*` → ramas de Jules para refactorizaciones
- `feature/*` → nuevas funcionalidades (creadas por el equipo humano)

Jules **siempre** abre sus PRs hacia `dev`, nunca hacia `main`.

---

## 🔗 REFERENCIAS ÚTILES

- Documentación Supabase: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com/docs
- TanStack Table: https://tanstack.com/table/latest
- Zod: https://zod.dev
- Vitest: https://vitest.dev

---

*Archivo mantenido por el equipo de CoreOps. Última actualización: 2026.*
*Ante cualquier duda sobre el alcance de una tarea, Jules debe detenerse y solicitar clarificación antes de proceder.*
