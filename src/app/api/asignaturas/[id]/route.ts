import { withErrorHandling, ok } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import {
  getAsignatura,
  updateAsignatura,
  deleteAsignatura,
} from "@/services/asignaturas.service";
import { asignaturaUpdateSchema } from "@/lib/validations/asignatura.schema";

export const GET = withErrorHandling(async (_req, ctx) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  return ok(await getAsignatura(centroId, id));
});

export const PATCH = withErrorHandling(async (req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  const input = asignaturaUpdateSchema.parse(await req.json());
  return ok(await updateAsignatura(centroId, id, input));
});

export const DELETE = withErrorHandling(async (_req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  return ok(await deleteAsignatura(centroId, id));
});
