import { withErrorHandling, ok, created, parseListQuery } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { listGrupos, createGrupo } from "@/services/grupos.service";
import { grupoCreateSchema } from "@/lib/validations/grupo.schema";

export const GET = withErrorHandling(async (req) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const query = parseListQuery(req.url);
  const { items, pagination } = await listGrupos(centroId, query);
  return ok(items, pagination);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const input = grupoCreateSchema.parse(await req.json());
  return created(await createGrupo(centroId, input));
});
