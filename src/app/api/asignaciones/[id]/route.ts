import { withErrorHandling, ok } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import {
  getAsignacion,
  updateAsignacion,
  deleteAsignacion,
} from "@/services/asignaciones.service";
import { asignacionUpdateSchema } from "@/lib/validations/asignacion.schema";

export const GET = withErrorHandling(async (_req, ctx) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  const asignacion = await getAsignacion(centroId, id);
  return ok(asignacion);
});

export const PATCH = withErrorHandling(async (req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  const body = await req.json();
  const input = asignacionUpdateSchema.parse(body);
  const asignacion = await updateAsignacion(centroId, id, input);
  return ok(asignacion);
});

export const DELETE = withErrorHandling(async (_req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  const result = await deleteAsignacion(centroId, id);
  return ok(result);
});
