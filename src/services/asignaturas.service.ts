import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ApiErrors, paginationFor, type ListQuery, type PaginationInfo } from "@/lib/api";
import type {
  AsignaturaCreateInput,
  AsignaturaUpdateInput,
} from "@/lib/validations/asignatura.schema";

export async function listAsignaturas(centroId: string, query: ListQuery) {
  const where: Prisma.AsignaturaWhereInput = {
    centroId,
    ...(query.soloActivos ? { activo: true } : {}),
    ...(query.search
      ? {
          OR: [
            { codigo: { contains: query.search } },
            { nombre: { contains: query.search } },
            { descripcion: { contains: query.search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.asignatura.findMany({
      where,
      orderBy: [{ activo: "desc" }, { nombre: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.asignatura.count({ where }),
  ]);

  const pagination: PaginationInfo = paginationFor(total, query);
  return { items, pagination };
}

export async function getAsignatura(centroId: string, id: string) {
  const a = await prisma.asignatura.findFirst({ where: { id, centroId } });
  if (!a) throw ApiErrors.notFound("La asignatura");
  return a;
}

export async function createAsignatura(centroId: string, input: AsignaturaCreateInput) {
  return prisma.asignatura.create({
    data: {
      centroId,
      codigo: input.codigo,
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      tipo: input.tipo,
      color: input.color,
      activo: input.activo ?? true,
    },
  });
}

export async function updateAsignatura(
  centroId: string,
  id: string,
  input: AsignaturaUpdateInput,
) {
  await getAsignatura(centroId, id);
  return prisma.asignatura.update({
    where: { id },
    data: {
      ...(input.codigo !== undefined ? { codigo: input.codigo } : {}),
      ...(input.nombre !== undefined ? { nombre: input.nombre } : {}),
      ...(input.descripcion !== undefined ? { descripcion: input.descripcion || null } : {}),
      ...(input.tipo !== undefined ? { tipo: input.tipo } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.activo !== undefined ? { activo: input.activo } : {}),
    },
  });
}

export async function deleteAsignatura(centroId: string, id: string) {
  await getAsignatura(centroId, id);
  const numAsignaciones = await prisma.asignacion.count({ where: { asignaturaId: id } });
  if (numAsignaciones > 0) {
    await prisma.asignatura.update({ where: { id }, data: { activo: false } });
    return { deleted: false, archived: true, asignaciones: numAsignaciones };
  }
  await prisma.asignatura.delete({ where: { id } });
  return { deleted: true, archived: false, asignaciones: 0 };
}
