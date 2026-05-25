import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ApiErrors, paginationFor, type ListQuery, type PaginationInfo } from "@/lib/api";
import type { CentroCreateInput, CentroUpdateInput } from "@/lib/validations/centro.schema";

export async function listCentros(query: ListQuery) {
  const where: Prisma.CentroWhereInput = {
    ...(query.soloActivos ? { activo: true } : {}),
    ...(query.search
      ? {
          OR: [
            { codigo: { contains: query.search } },
            { nombre: { contains: query.search } },
            { direccion: { contains: query.search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.centro.findMany({
      where,
      orderBy: [{ activo: "desc" }, { nombre: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.centro.count({ where }),
  ]);

  const pagination: PaginationInfo = paginationFor(total, query);
  return { items, pagination };
}

export async function getCentro(id: string) {
  const c = await prisma.centro.findUnique({ where: { id } });
  if (!c) throw ApiErrors.notFound("El centro");
  return c;
}

export async function createCentro(input: CentroCreateInput) {
  return prisma.centro.create({
    data: {
      codigo: input.codigo,
      nombre: input.nombre,
      direccion: input.direccion || null,
      activo: input.activo ?? true,
    },
  });
}

export async function updateCentro(id: string, input: CentroUpdateInput) {
  await getCentro(id);
  return prisma.centro.update({
    where: { id },
    data: {
      ...(input.codigo !== undefined ? { codigo: input.codigo } : {}),
      ...(input.nombre !== undefined ? { nombre: input.nombre } : {}),
      ...(input.direccion !== undefined ? { direccion: input.direccion || null } : {}),
      ...(input.activo !== undefined ? { activo: input.activo } : {}),
    },
  });
}

export async function deleteCentro(id: string) {
  await getCentro(id);
  // Comprobamos si tiene cualquier dato relacionado.
  const [profesores, aulas, asignaturas, grupos, franjas] = await Promise.all([
    prisma.profesor.count({ where: { centroId: id } }),
    prisma.aula.count({ where: { centroId: id } }),
    prisma.asignatura.count({ where: { centroId: id } }),
    prisma.grupo.count({ where: { centroId: id } }),
    prisma.franjaHoraria.count({ where: { centroId: id } }),
  ]);
  const total = profesores + aulas + asignaturas + grupos + franjas;
  if (total > 0) {
    await prisma.centro.update({ where: { id }, data: { activo: false } });
    return { deleted: false, archived: true, relacionados: total };
  }
  await prisma.centro.delete({ where: { id } });
  return { deleted: true, archived: false, relacionados: 0 };
}
