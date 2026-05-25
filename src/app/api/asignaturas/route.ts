import { withErrorHandling, ok, created, parseListQuery } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { listAsignaturas, createAsignatura } from "@/services/asignaturas.service";
import { asignaturaCreateSchema } from "@/lib/validations/asignatura.schema";

export const GET = withErrorHandling(async (req) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const query = parseListQuery(req.url);
  const { items, pagination } = await listAsignaturas(centroId, query);
  return ok(items, pagination);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const input = asignaturaCreateSchema.parse(await req.json());
  return created(await createAsignatura(centroId, input));
});
