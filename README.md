# Horarios UF3

Aplicación web para la gestión de horarios personales del departamento UF3 (PRIMER PROTOTIPO).
Permite registrar profesores, aulas, asignaturas y grupos, definir asignaciones
horarias con detección automática de solapamientos, y consultar el horario
desde varias vistas (semanal, por profesor, por aula, por grupo).

> **Estado actual:** Sprint 1 completado.
> Sprint 0 (estructura + auth + BBDD) ✅
> Sprint 1 (CRUDs de catálogos) ✅
> Sprint 2 (asignaciones + solapamientos) — pendiente
> Sprint 3 (vistas + exportación PDF) — pendiente
> Sprint 4 (pulido + documentación) — pendiente

---

## Tabla de contenidos

1. [Stack tecnológico](#stack-tecnológico)
2. [Requisitos previos](#requisitos-previos)
3. [Instalación paso a paso](#instalación-paso-a-paso)
4. [Comandos disponibles](#comandos-disponibles)
5. [Cómo probar Sprint 1](#cómo-probar-sprint-1)
6. [Roles y permisos](#roles-y-permisos)
7. [API REST](#api-rest)
8. [Estructura del proyecto](#estructura-del-proyecto)
9. [Modelo de datos](#modelo-de-datos)
10. [Credenciales de prueba](#credenciales-de-prueba)
11. [Plan de sprints](#plan-de-sprints)

---

## Stack tecnológico

| Capa            | Tecnología                                  |
| --------------- | ------------------------------------------- |
| Framework       | Next.js 15 (App Router)                     |
| Lenguaje        | TypeScript                                  |
| Estilos         | Tailwind CSS + componentes propios (Radix)  |
| Base de datos   | SQLite (dev) / PostgreSQL (prod)            |
| ORM             | Prisma                                      |
| Autenticación   | Auth.js v5 (NextAuth) con Credentials       |
| Validación      | Zod                                         |
| Formularios     | React Hook Form + Zod resolver              |
| Iconos          | Lucide                                      |
| Tests           | Vitest                                      |

---

## Requisitos previos

- **Node.js 20 o superior**
- **npm 10+**
- Git

---

## Instalación paso a paso

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env
# Genera un AUTH_SECRET y pégalo en .env:
#   openssl rand -base64 32

# 3. Crear BBDD
npm run db:migrate

# 4. Cargar datos de ejemplo
npm run db:seed

# 5. Arrancar
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Comandos disponibles

| Comando                 | Descripción                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo                                |
| `npm run build`         | Build de producción                                   |
| `npm run start`         | Servidor de producción                                |
| `npm run lint`          | Linter (ESLint)                                       |
| `npm run format`        | Formateo (Prettier)                                   |
| `npm run typecheck`     | Comprueba tipos sin generar archivos                  |
| `npm run db:migrate`    | Aplica migraciones de Prisma                          |
| `npm run db:reset`      | **Borra y recrea** la BBDD                            |
| `npm run db:seed`       | Carga datos de ejemplo                                |
| `npm run db:studio`     | Abre Prisma Studio (GUI)                              |
| `npm test`              | Ejecuta tests unitarios                               |

---

## Cómo probar Sprint 1

Una vez arrancada la aplicación, accede como `admin@uf3.local` y prueba:

### Listado de profesores
- Ve a `/profesores`.
- Verás la tabla con paginación, búsqueda con debounce y badge de estado.
- Busca "García" o "Informática" para probar la búsqueda.

### Alta de un profesor
- Clic en "Nuevo profesor".
- Rellena el formulario (los errores aparecen inline al perder el foco).
- Al guardar, verás un toast verde de confirmación y volverás a la lista.

### Edición
- En la fila de un profesor, clic en el menú de tres puntos → "Editar".
- Modifica algún campo y guarda.

### Borrado seguro
- Clic en menú → "Eliminar" → confirma en el diálogo.
- Si el profesor **tiene asignaciones**, no se borra sino que se **archiva**
  (cambia a estado "Archivado"). El toast lo explicará.
- Si no tiene asignaciones, se borra definitivamente.

### Repite con todos los recursos
- `/aulas`, `/asignaturas`, `/grupos`, `/franjas`, `/centros`.

### Prueba los roles
- Cierra sesión y entra como `editor@uf3.local` (puede CRUD todo menos Centros).
- Cierra sesión y entra como `viewer@uf3.local` (solo lectura, sin botones de
  "Nuevo" ni menú de acciones).

---

## Roles y permisos

| Operación                     | ADMIN | EDITOR | VIEWER |
| ----------------------------- | :---: | :----: | :----: |
| Listar profesores/aulas/…     |  ✅   |   ✅   |   ✅   |
| Crear/editar/borrar catálogos |  ✅   |   ✅   |   ❌   |
| Gestionar Centros             |  ✅   |   ❌   |   ❌   |

La autorización se aplica tanto en la API (`requireEditor`, `requireAdmin`)
como en la UI (los botones de "Nuevo" y "Eliminar" se ocultan).

---

## API REST

Todas las rutas viven bajo `/api/{recurso}` y siguen el mismo patrón.

| Método | Ruta                          | Acción                          | Rol mínimo |
| ------ | ----------------------------- | ------------------------------- | ---------- |
| GET    | `/api/{recurso}`              | Listado con paginación/búsqueda | VIEWER     |
| POST   | `/api/{recurso}`              | Crear                           | EDITOR*    |
| GET    | `/api/{recurso}/[id]`         | Detalle                         | VIEWER     |
| PATCH  | `/api/{recurso}/[id]`         | Actualizar                      | EDITOR*    |
| DELETE | `/api/{recurso}/[id]`         | Borrar o archivar               | EDITOR*    |

`* /api/centros` requiere ADMIN para POST/PATCH/DELETE.

Recursos disponibles: `profesores`, `aulas`, `asignaturas`, `grupos`,
`franjas`, `centros`.

### Forma de la respuesta

Éxito:
```json
{ "data": { ... } | [ ... ], "pagination": { "page": 1, ... } }
```

Error:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {...} } }
```

### Query params del listado

| Param         | Tipo    | Por defecto | Descripción                                |
| ------------- | ------- | ----------- | ------------------------------------------ |
| `page`        | int     | 1           | Página solicitada                          |
| `pageSize`    | int     | 20          | Tamaño de página (máx 100)                 |
| `search`      | string  | ""          | Búsqueda libre sobre campos relevantes     |
| `soloActivos` | boolean | true        | Si `false`, incluye registros archivados   |

### Códigos de error de la API

| Código              | HTTP | Significado                                |
| ------------------- | ---- | ------------------------------------------ |
| `UNAUTHORIZED`      | 401  | No autenticado                             |
| `FORBIDDEN`         | 403  | Sin permisos para esta operación           |
| `NOT_FOUND`         | 404  | El recurso no existe                       |
| `VALIDATION_ERROR`  | 422  | Datos no válidos (incluye `details` Zod)   |
| `CONFLICT`          | 409  | Código duplicado u otra restricción única  |
| `RESTRICTED`        | 409  | Hay registros relacionados                 |
| `INTERNAL_ERROR`    | 500  | Error no esperado                          |

---

## Estructura del proyecto

```
horarios-uf3/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   │   ├── profesores/    (page · nuevo · [id]/editar)
│   │   │   ├── aulas/
│   │   │   ├── asignaturas/
│   │   │   ├── grupos/
│   │   │   ├── franjas/
│   │   │   ├── centros/
│   │   │   ├── asignaciones/  (Sprint 2)
│   │   │   └── horarios/      (Sprint 3)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── profesores/    (route · [id]/route)
│   │   │   ├── aulas/
│   │   │   ├── asignaturas/
│   │   │   ├── grupos/
│   │   │   ├── franjas/
│   │   │   └── centros/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 (button, input, label, card, select,
│   │   │                        textarea, dialog, dropdown-menu,
│   │   │                        toast, toaster, use-toast)
│   │   ├── data-table/         (data-table, pagination,
│   │   │                        row-actions, use-list-resource)
│   │   ├── forms/              (form-field, profesor-form, aula-form,
│   │   │                        asignatura-form, grupo-form,
│   │   │                        franja-form, centro-form)
│   │   ├── layout/             (sidebar, topbar, page-header,
│   │   │                        placeholder-page)
│   │   └── feedback/           (confirm-dialog)
│   ├── lib/
│   │   ├── db.ts               (Prisma client singleton)
│   │   ├── auth.ts             (NextAuth config)
│   │   ├── authz.ts            (requireAuth/Editor/Admin, canEdit)
│   │   ├── api.ts              (respuestas y errores unificados)
│   │   ├── api-client.ts       (fetch wrapper para formularios)
│   │   ├── centro-context.ts   (resolución de centro activo)
│   │   ├── enums.ts            (Rol, DiaSemana, NivelEducativo, TipoAsignatura)
│   │   ├── utils.ts            (cn)
│   │   └── validations/        (esquemas Zod por recurso)
│   ├── services/               (lógica de negocio por recurso)
│   └── middleware.ts           (protección de rutas)
└── tests/
    └── solapamientos.test.ts
```

---

## Modelo de datos

Ver `prisma/schema.prisma` para el detalle. Resumen:

```
Centro 1 ──── N Profesor / Aula / Asignatura / Grupo / FranjaHoraria / Asignacion
Asignacion N ─ 1 Profesor, Aula, Asignatura, Grupo
Usuario 1 ─── 0..1 Profesor (opcional)
```

Tres tipos de solapamiento (que se verificarán en Sprint 2): profesor, aula y
grupo. Asignaciones de duración libre (no se obligan franjas predefinidas).

---

## Credenciales de prueba

Tras ejecutar `npm run db:seed`:

| Email              | Contraseña    | Rol     |
| ------------------ | ------------- | ------- |
| `admin@uf3.local`  | `Admin1234!`  | ADMIN   |
| `editor@uf3.local` | `Editor1234!` | EDITOR  |
| `viewer@uf3.local` | `Viewer1234!` | VIEWER  |

---

## Plan de sprints

| Sprint   | Objetivo                                                                       |
| -------- | ------------------------------------------------------------------------------ |
| Sprint 0 | ✅ Estructura, BBDD, auth, layout base                                          |
| Sprint 1 | ✅ CRUD de Profesores, Aulas, Asignaturas, Grupos, Franjas y Centros            |
| Sprint 2 | Alta / edición / borrado de asignaciones con detección de solapamientos        |
| Sprint 3 | Vistas semanal, por profesor, por aula y por grupo. Impresión / exportación PDF |
| Sprint 4 | Pulido final + documentación completa                                          |

---

## Notas técnicas

- **Enums como String.** SQLite no soporta enums nativos en Prisma. Los valores
  válidos están centralizados en `src/lib/enums.ts` con tipos TypeScript y
  esquemas Zod. La validación ocurre en las APIs.
- **Borrado seguro.** Los profesores, aulas, asignaturas y grupos con
  asignaciones relacionadas se **archivan** (`activo = false`) en lugar de
  borrarse, para preservar el histórico. Esto se hace de forma automática en
  los servicios.
- **Búsqueda con debounce.** Las listas hacen debounce de 350 ms y resetean a
  página 1 cuando cambia la búsqueda (ver `useListResource`).

---

## Licencia

Proyecto académico del laboratorio UF3 (CEU FP Fernando III, curso 2025/2026).
