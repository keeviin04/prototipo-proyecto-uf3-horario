import { withErrorHandling, ok, created, parseListQuery } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { listAsignaciones, createAsignacion } from "@/services/asignaciones.service";
import { asignacionCreateSchema } from "@/lib/validations/asignacion.schema";

export const GET = withErrorHandling(async (req) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const query = parseListQuery(req.url);
  const u = new URL(req.url);
  const filters = {
    dia: u.searchParams.get("dia") ?? undefined,
    profesorId: u.searchParams.get("profesorId") ?? undefined,
    aulaId: u.searchParams.get("aulaId") ?? undefined,
    grupoId: u.searchParams.get("grupoId") ?? undefined,
  };
  const { items, pagination } = await listAsignaciones(centroId, query, filters);
  return ok(items, pagination);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const body = await req.json();
  const input = asignacionCreateSchema.parse(body);
  const asignacion = await createAsignacion(centroId, input, user.id);
  return created(asignacion);
});
