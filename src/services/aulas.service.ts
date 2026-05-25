import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ApiErrors, paginationFor, type ListQuery, type PaginationInfo } from "@/lib/api";
import type { AulaCreateInput, AulaUpdateInput } from "@/lib/validations/aula.schema";

export async function listAulas(centroId: string, query: ListQuery) {
  const where: Prisma.AulaWhereInput = {
    centroId,
    ...(query.soloActivos ? { activo: true } : {}),
    ...(query.search
      ? {
          OR: [
            { codigo: { contains: query.search } },
            { nombre: { contains: query.search } },
            { ubicacion: { contains: query.search } },
            { equipamiento: { contains: query.search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.aula.findMany({
      where,
      orderBy: [{ activo: "desc" }, { codigo: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.aula.count({ where }),
  ]);

  const pagination: PaginationInfo = paginationFor(total, query);
  return { items, pagination };
}

export async function getAula(centroId: string, id: string) {
  const aula = await prisma.aula.findFirst({ where: { id, centroId } });
  if (!aula) throw ApiErrors.notFound("El aula");
  return aula;
}

export async function createAula(centroId: string, input: AulaCreateInput) {
  return prisma.aula.create({
    data: {
      centroId,
      codigo: input.codigo,
      nombre: input.nombre,
      ubicacion: input.ubicacion || null,
      capacidad: input.capacidad ?? null,
      equipamiento: input.equipamiento || null,
      activo: input.activo ?? true,
    },
  });
}

export async function updateAula(centroId: string, id: string, input: AulaUpdateInput) {
  await getAula(centroId, id);
  return prisma.aula.update({
    where: { id },
    data: {
      ...(input.codigo !== undefined ? { codigo: input.codigo } : {}),
      ...(input.nombre !== undefined ? { nombre: input.nombre } : {}),
      ...(input.ubicacion !== undefined ? { ubicacion: input.ubicacion || null } : {}),
      ...(input.capacidad !== undefined ? { capacidad: input.capacidad } : {}),
      ...(input.equipamiento !== undefined ? { equipamiento: input.equipamiento || null } : {}),
      ...(input.activo !== undefined ? { activo: input.activo } : {}),
    },
  });
}

export async function deleteAula(centroId: string, id: string) {
  await getAula(centroId, id);
  const numAsignaciones = await prisma.asignacion.count({ where: { aulaId: id } });
  if (numAsignaciones > 0) {
    await prisma.aula.update({ where: { id }, data: { activo: false } });
    return { deleted: false, archived: true, asignaciones: numAsignaciones };
  }
  await prisma.aula.delete({ where: { id } });
  return { deleted: true, archived: false, asignaciones: 0 };
}
