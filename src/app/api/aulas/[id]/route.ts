import { withErrorHandling, ok } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { getAula, updateAula, deleteAula } from "@/services/aulas.service";
import { aulaUpdateSchema } from "@/lib/validations/aula.schema";

export const GET = withErrorHandling(async (_req, ctx) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  return ok(await getAula(centroId, id));
});

export const PATCH = withErrorHandling(async (req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  const input = aulaUpdateSchema.parse(await req.json());
  return ok(await updateAula(centroId, id, input));
});

export const DELETE = withErrorHandling(async (_req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  return ok(await deleteAula(centroId, id));
});
