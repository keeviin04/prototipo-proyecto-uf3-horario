import { withErrorHandling, ok } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import {
  getProfesor,
  updateProfesor,
  deleteProfesor,
} from "@/services/profesores.service";
import { profesorUpdateSchema } from "@/lib/validations/profesor.schema";

export const GET = withErrorHandling(async (_req, ctx) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  const profesor = await getProfesor(centroId, id);
  return ok(profesor);
});

export const PATCH = withErrorHandling(async (req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  const body = await req.json();
  const input = profesorUpdateSchema.parse(body);
  const profesor = await updateProfesor(centroId, id, input);
  return ok(profesor);
});

export const DELETE = withErrorHandling(async (_req, ctx) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await ctx.params;
  const result = await deleteProfesor(centroId, id);
  return ok(result);
});
