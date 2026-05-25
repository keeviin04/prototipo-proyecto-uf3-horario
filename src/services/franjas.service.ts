import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ApiErrors, paginationFor, type ListQuery, type PaginationInfo } from "@/lib/api";
import type { FranjaCreateInput, FranjaUpdateInput } from "@/lib/validations/franja.schema";

export async function listFranjas(centroId: string, query: ListQuery) {
  const where: Prisma.FranjaHorariaWhereInput = {
    centroId,
    ...(query.soloActivos ? { activo: true } : {}),
    ...(query.search ? { nombre: { contains: query.search } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.franjaHoraria.findMany({
      where,
      orderBy: [{ activo: "desc" }, { orden: "asc" }, { horaInicio: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.franjaHoraria.count({ where }),
  ]);

  const pagination: PaginationInfo = paginationFor(total, query);
  return { items, pagination };
}

export async function getFranja(centroId: string, id: string) {
  const f = await prisma.franjaHoraria.findFirst({ where: { id, centroId } });
  if (!f) throw ApiErrors.notFound("La franja horaria");
  return f;
}

export async function createFranja(centroId: string, input: FranjaCreateInput) {
  return prisma.franjaHoraria.create({
    data: {
      centroId,
      nombre: input.nombre,
      horaInicio: input.horaInicio,
      horaFin: input.horaFin,
      orden: input.orden,
      activo: input.activo ?? true,
    },
  });
}

export async function updateFranja(centroId: string, id: string, input: FranjaUpdateInput) {
  await getFranja(centroId, id);
  return prisma.franjaHoraria.update({
    where: { id },
    data: {
      ...(input.nombre !== undefined ? { nombre: input.nombre } : {}),
      ...(input.horaInicio !== undefined ? { horaInicio: input.horaInicio } : {}),
      ...(input.horaFin !== undefined ? { horaFin: input.horaFin } : {}),
      ...(input.orden !== undefined ? { orden: input.orden } : {}),
      ...(input.activo !== undefined ? { activo: input.activo } : {}),
    },
  });
}

export async function deleteFranja(centroId: string, id: string) {
  await getFranja(centroId, id);
  // Las franjas no tienen relaciones con asignaciones; se pueden borrar directamente.
  await prisma.franjaHoraria.delete({ where: { id } });
  return { deleted: true, archived: false };
}
