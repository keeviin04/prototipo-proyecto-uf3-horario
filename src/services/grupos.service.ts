import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ApiErrors, paginationFor, type ListQuery, type PaginationInfo } from "@/lib/api";
import type { GrupoCreateInput, GrupoUpdateInput } from "@/lib/validations/grupo.schema";

export async function listGrupos(centroId: string, query: ListQuery) {
  const where: Prisma.GrupoWhereInput = {
    centroId,
    ...(query.soloActivos ? { activo: true } : {}),
    ...(query.search
      ? {
          OR: [
            { codigo: { contains: query.search } },
            { nombre: { contains: query.search } },
            { cursoAcademico: { contains: query.search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.grupo.findMany({
      where,
      orderBy: [{ activo: "desc" }, { nivel: "asc" }, { nombre: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.grupo.count({ where }),
  ]);

  const pagination: PaginationInfo = paginationFor(total, query);
  return { items, pagination };
}

export async function getGrupo(centroId: string, id: string) {
  const g = await prisma.grupo.findFirst({ where: { id, centroId } });
  if (!g) throw ApiErrors.notFound("El grupo");
  return g;
}

export async function createGrupo(centroId: string, input: GrupoCreateInput) {
  return prisma.grupo.create({
    data: {
      centroId,
      codigo: input.codigo,
      nombre: input.nombre,
      nivel: input.nivel,
      cursoAcademico: input.cursoAcademico,
      numAlumnos: input.numAlumnos ?? null,
      activo: input.activo ?? true,
    },
  });
}

export async function updateGrupo(centroId: string, id: string, input: GrupoUpdateInput) {
  await getGrupo(centroId, id);
  return prisma.grupo.update({
    where: { id },
    data: {
      ...(input.codigo !== undefined ? { codigo: input.codigo } : {}),
      ...(input.nombre !== undefined ? { nombre: input.nombre } : {}),
      ...(input.nivel !== undefined ? { nivel: input.nivel } : {}),
      ...(input.cursoAcademico !== undefined ? { cursoAcademico: input.cursoAcademico } : {}),
      ...(input.numAlumnos !== undefined ? { numAlumnos: input.numAlumnos } : {}),
      ...(input.activo !== undefined ? { activo: input.activo } : {}),
    },
  });
}

export async function deleteGrupo(centroId: string, id: string) {
  await getGrupo(centroId, id);
  const numAsignaciones = await prisma.asignacion.count({ where: { grupoId: id } });
  if (numAsignaciones > 0) {
    await prisma.grupo.update({ where: { id }, data: { activo: false } });
    return { deleted: false, archived: true, asignaciones: numAsignaciones };
  }
  await prisma.grupo.delete({ where: { id } });
  return { deleted: true, archived: false, asignaciones: 0 };
}
