import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ApiErrors, paginationFor, type ListQuery, type PaginationInfo } from "@/lib/api";
import type {
  AsignacionCreateInput,
  AsignacionUpdateInput,
} from "@/lib/validations/asignacion.schema";

const baseInclude = {
  profesor: { select: { id: true, codigo: true, nombre: true, apellidos: true } },
  aula: { select: { id: true, codigo: true, nombre: true } },
  asignatura: { select: { id: true, codigo: true, nombre: true, color: true, tipo: true } },
  grupo: { select: { id: true, codigo: true, nombre: true, nivel: true } },
} satisfies Prisma.AsignacionInclude;

export interface AsignacionFilters {
  dia?: string;
  profesorId?: string;
  aulaId?: string;
  grupoId?: string;
}

export async function listAsignaciones(
  centroId: string,
  query: ListQuery,
  filters: AsignacionFilters = {},
) {
  const where: Prisma.AsignacionWhereInput = {
    centroId,
    ...(filters.dia ? { dia: filters.dia } : {}),
    ...(filters.profesorId ? { profesorId: filters.profesorId } : {}),
    ...(filters.aulaId ? { aulaId: filters.aulaId } : {}),
    ...(filters.grupoId ? { grupoId: filters.grupoId } : {}),
    ...(query.search
      ? {
          OR: [
            { profesor: { nombre: { contains: query.search } } },
            { profesor: { apellidos: { contains: query.search } } },
            { aula: { codigo: { contains: query.search } } },
            { aula: { nombre: { contains: query.search } } },
            { asignatura: { nombre: { contains: query.search } } },
            { grupo: { codigo: { contains: query.search } } },
            { grupo: { nombre: { contains: query.search } } },
            { observaciones: { contains: query.search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.asignacion.findMany({
      where,
      include: baseInclude,
      orderBy: [{ dia: "asc" }, { horaInicio: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.asignacion.count({ where }),
  ]);

  const pagination: PaginationInfo = paginationFor(total, query);
  return { items, pagination };
}

export async function getAsignacion(centroId: string, id: string) {
  const a = await prisma.asignacion.findFirst({
    where: { id, centroId },
    include: baseInclude,
  });
  if (!a) throw ApiErrors.notFound("La asignación");
  return a;
}

export async function createAsignacion(
  centroId: string,
  input: AsignacionCreateInput,
  createdById?: string,
) {
  await checkSolapamientos(centroId, input);

  return prisma.asignacion.create({
    data: {
      centroId,
      dia: input.dia,
      horaInicio: input.horaInicio,
      horaFin: input.horaFin,
      profesorId: input.profesorId,
      aulaId: input.aulaId,
      asignaturaId: input.asignaturaId,
      grupoId: input.grupoId,
      vigenteDesde: input.vigenteDesde ? new Date(input.vigenteDesde) : null,
      vigenteHasta: input.vigenteHasta ? new Date(input.vigenteHasta) : null,
      observaciones: input.observaciones || null,
      createdById: createdById ?? null,
    },
    include: baseInclude,
  });
}

export async function updateAsignacion(
  centroId: string,
  id: string,
  input: AsignacionUpdateInput,
) {
  const existing = await getAsignacion(centroId, id);

  const merged = {
    dia: input.dia ?? existing.dia,
    horaInicio: input.horaInicio ?? existing.horaInicio,
    horaFin: input.horaFin ?? existing.horaFin,
    profesorId: input.profesorId ?? existing.profesorId,
    aulaId: input.aulaId ?? existing.aulaId,
    grupoId: input.grupoId ?? existing.grupoId,
  };

  const afectaSolapamiento =
    input.dia !== undefined ||
    input.horaInicio !== undefined ||
    input.horaFin !== undefined ||
    input.profesorId !== undefined ||
    input.aulaId !== undefined ||
    input.grupoId !== undefined;

  if (afectaSolapamiento) {
    await checkSolapamientos(centroId, merged, id);
  }

  return prisma.asignacion.update({
    where: { id },
    data: {
      ...(input.dia !== undefined ? { dia: input.dia } : {}),
      ...(input.horaInicio !== undefined ? { horaInicio: input.horaInicio } : {}),
      ...(input.horaFin !== undefined ? { horaFin: input.horaFin } : {}),
      ...(input.profesorId !== undefined ? { profesorId: input.profesorId } : {}),
      ...(input.aulaId !== undefined ? { aulaId: input.aulaId } : {}),
      ...(input.asignaturaId !== undefined ? { asignaturaId: input.asignaturaId } : {}),
      ...(input.grupoId !== undefined ? { grupoId: input.grupoId } : {}),
      ...(input.vigenteDesde !== undefined
        ? { vigenteDesde: input.vigenteDesde ? new Date(input.vigenteDesde) : null }
        : {}),
      ...(input.vigenteHasta !== undefined
        ? { vigenteHasta: input.vigenteHasta ? new Date(input.vigenteHasta) : null }
        : {}),
      ...(input.observaciones !== undefined
        ? { observaciones: input.observaciones || null }
        : {}),
    },
    include: baseInclude,
  });
}

export async function deleteAsignacion(centroId: string, id: string) {
  await getAsignacion(centroId, id);
  await prisma.asignacion.delete({ where: { id } });
  return { deleted: true, archived: false };
}

// ---------------------------------------------------------------
//  Detección de solapamientos
// ---------------------------------------------------------------

interface OverlapInput {
  dia: string;
  horaInicio: string;
  horaFin: string;
  profesorId: string;
  aulaId: string;
  grupoId: string;
}

async function checkSolapamientos(
  centroId: string,
  input: OverlapInput,
  excludeId?: string,
) {
  // Dos intervalos [a1,a2) y [b1,b2) solapan si: a1 < b2 AND b1 < a2
  // Comparación lexicográfica sobre "HH:MM" es equivalente a numérica con padding.
  const base: Prisma.AsignacionWhereInput = {
    centroId,
    dia: input.dia,
    horaInicio: { lt: input.horaFin },
    horaFin: { gt: input.horaInicio },
    ...(excludeId ? { id: { not: excludeId } } : {}),
  };

  const [solapaProfesor, solapaAula, solapaGrupo] = await Promise.all([
    prisma.asignacion.findFirst({ where: { ...base, profesorId: input.profesorId } }),
    prisma.asignacion.findFirst({ where: { ...base, aulaId: input.aulaId } }),
    prisma.asignacion.findFirst({ where: { ...base, grupoId: input.grupoId } }),
  ]);

  const errores: string[] = [];
  if (solapaProfesor)
    errores.push(
      `El profesor ya tiene una asignación ese día de ${solapaProfesor.horaInicio} a ${solapaProfesor.horaFin}.`,
    );
  if (solapaAula)
    errores.push(
      `El aula ya está ocupada ese día de ${solapaAula.horaInicio} a ${solapaAula.horaFin}.`,
    );
  if (solapaGrupo)
    errores.push(
      `El grupo ya tiene una asignación ese día de ${solapaGrupo.horaInicio} a ${solapaGrupo.horaFin}.`,
    );

  if (errores.length > 0) {
    throw ApiErrors.conflict(errores.join(" "));
  }
}
