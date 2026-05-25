import { withErrorHandling, ok, created, parseListQuery } from "@/lib/api";
import { requireAuth, requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import {
  listProfesores,
  createProfesor,
} from "@/services/profesores.service";
import { profesorCreateSchema } from "@/lib/validations/profesor.schema";

export const GET = withErrorHandling(async (req) => {
  const user = await requireAuth();
  const centroId = await resolveCentroId(user);
  const query = parseListQuery(req.url);
  const { items, pagination } = await listProfesores(centroId, query);
  return ok(items, pagination);
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const body = await req.json();
  const input = profesorCreateSchema.parse(body);
  const profesor = await createProfesor(centroId, input);
  return created(profesor);
});
