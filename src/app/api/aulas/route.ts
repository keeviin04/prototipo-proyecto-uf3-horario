import { withErrorHandling, ok, created, parseListQuery } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { listAulas, createAula } from "@/services/aulas.service";
import { aulaCreateSchema } from "@/lib/validations/aula.schema";

export const GET = withErrorHandling(async (req) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const query = parseListQuery(req.url);
  const { items, pagination } = await listAulas(centroId, query);
  return ok(items, pagination);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const body = await req.json();
  const input = aulaCreateSchema.parse(body);
  const aula = await createAula(centroId, input);
  return created(aula);
});
