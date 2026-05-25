import { withErrorHandling, ok } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { getGrupo, updateGrupo, deleteGrupo } from "@/services/grupos.service";
import { grupoUpdateSchema } from "@/lib/validations/grupo.schema";

export const GET = withErrorHandling(async (_req, ctx) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  return ok(await getGrupo(centroId, id));
});

export const PATCH = withErrorHandling(async (req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  const input = grupoUpdateSchema.parse(await req.json());
  return ok(await updateGrupo(centroId, id, input));
});

export const DELETE = withErrorHandling(async (_req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  return ok(await deleteGrupo(centroId, id));
});
