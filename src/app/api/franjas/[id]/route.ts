import { withErrorHandling, ok } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { getFranja, updateFranja, deleteFranja } from "@/services/franjas.service";
import { franjaUpdateSchema } from "@/lib/validations/franja.schema";

export const GET = withErrorHandling(async (_req, ctx) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  return ok(await getFranja(centroId, id));
});

export const PATCH = withErrorHandling(async (req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  const input = franjaUpdateSchema.parse(await req.json());
  return ok(await updateFranja(centroId, id, input));
});

export const DELETE = withErrorHandling(async (_req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  return ok(await deleteFranja(centroId, id));
});
