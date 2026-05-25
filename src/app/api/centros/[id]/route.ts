import { withErrorHandling, ok } from "@/lib/api";
import { requireAuth, requireAdmin } from "@/lib/authz";
import { getCentro, updateCentro, deleteCentro } from "@/services/centros.service";
import { centroUpdateSchema } from "@/lib/validations/centro.schema";

export const GET = withErrorHandling(async (_req, ctx) => {
  await requireAuth();
  const { id } = await ctx.params;
  return ok(await getCentro(id));
});

export const PATCH = withErrorHandling(async (req, ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const input = centroUpdateSchema.parse(await req.json());
  return ok(await updateCentro(id, input));
});

export const DELETE = withErrorHandling(async (_req, ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  return ok(await deleteCentro(id));
});
