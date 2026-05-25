/**
 * Servicio de Profesores.
 *
 * Lógica de negocio independiente de HTTP. Las API routes (capa de transporte)
 * llaman a estos métodos. Los tests unitarios pueden testear este módulo sin
 * levantar Next.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ApiErrors, paginationFor, type ListQuery, type PaginationInfo } from "@/lib/api";
import type {
  ProfesorCreateInput,
  ProfesorUpdateInput,
} from "@/lib/validations/profesor.schema";

const baseInclude = {} satisfies Prisma.ProfesorInclude;

export async function listProfesores(centroId: string, query: ListQuery) {
  const where: Prisma.ProfesorWhereInput = {
    centroId,
    ...(query.soloActivos ? { activo: true } : {}),
    ...(query.search
      ? {
          OR: [
            { codigo: { contains: query.search } },
            { nombre: { contains: query.search } },
            { apellidos: { contains: query.search } },
            { email: { contains: query.search } },
            { departamento: { contains: query.search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.profesor.findMany({
      where,
      include: baseInclude,
      orderBy: [{ activo: "desc" }, { apellidos: "asc" }, { nombre: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.profesor.count({ where }),
  ]);

  const pagination: PaginationInfo = paginationFor(total, query);
  return { items, pagination };
}

export async function getProfesor(centroId: string, id: string) {
  const profesor = await prisma.profesor.findFirst({
    where: { id, centroId },
    include: baseInclude,
  });
  if (!profesor) throw ApiErrors.notFound("El profesor");
  return profesor;
}

export async function createProfesor(centroId: string, input: ProfesorCreateInput) {
  return prisma.profesor.create({
    data: {
      centroId,
      codigo: input.codigo,
      nombre: input.nombre,
      apellidos: input.apellidos,
      email: input.email || null,
      departamento: input.departamento || null,
      activo: input.activo ?? true,
    },
  });
}

export async function updateProfesor(centroId: string, id: string, input: ProfesorUpdateInput) {
  await getProfesor(centroId, id); // 404 si no existe
  return prisma.profesor.update({
    where: { id },
    data: {
      ...(input.codigo !== undefined ? { codigo: input.codigo } : {}),
      ...(input.nombre !== undefined ? { nombre: input.nombre } : {}),
      ...(input.apellidos !== undefined ? { apellidos: input.apellidos } : {}),
      ...(input.email !== undefined ? { email: input.email || null } : {}),
      ...(input.departamento !== undefined ? { departamento: input.departamento || null } : {}),
      ...(input.activo !== undefined ? { activo: input.activo } : {}),
    },
  });
}

/**
 * Borrado seguro: si el profesor tiene asignaciones, no se borra sino que se archiva.
 */
export async function deleteProfesor(centroId: string, id: string) {
  await getProfesor(centroId, id);

  const numAsignaciones = await prisma.asignacion.count({ where: { profesorId: id } });

  if (numAsignaciones > 0) {
    // Archivar
    await prisma.profesor.update({ where: { id }, data: { activo: false } });
    return { deleted: false, archived: true, asignaciones: numAsignaciones };
  }

  await prisma.profesor.delete({ where: { id } });
  return { deleted: true, archived: false, asignaciones: 0 };
}
