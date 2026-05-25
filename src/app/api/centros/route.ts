import { withErrorHandling, ok, created, parseListQuery } from "@/lib/api";
import { requireAuth, requireAdmin } from "@/lib/authz";
import { listCentros, createCentro } from "@/services/centros.service";
import { centroCreateSchema } from "@/lib/validations/centro.schema";

export const GET = withErrorHandling(async (req) => {
  await requireAuth();
  const query = parseListQuery(req.url);
  const { items, pagination } = await listCentros(query);
  return ok(items, pagination);
});

export const POST = withErrorHandling(async (req) => {
  await requireAdmin();
  const input = centroCreateSchema.parse(await req.json());
  return created(await createCentro(input));
});
