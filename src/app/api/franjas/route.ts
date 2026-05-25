import { withErrorHandling, ok, created, parseListQuery } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { listFranjas, createFranja } from "@/services/franjas.service";
import { franjaCreateSchema } from "@/lib/validations/franja.schema";

export const GET = withErrorHandling(async (req) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const query = parseListQuery(req.url);
  const { items, pagination } = await listFranjas(centroId, query);
  return ok(items, pagination);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const input = franjaCreateSchema.parse(await req.json());
  return created(await createFranja(centroId, input));
});
