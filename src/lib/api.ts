/**
 * Utilidades para Route Handlers de Next.js.
 *
 * Centralizan el formato de respuestas y el manejo de errores para que
 * todos los endpoints respondan con la misma forma:
 *
 *   Éxito:  { data: T, pagination?: {...} }
 *   Error:  { error: { code, message, details? } }
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

// -------------------------------------------------------------
//  Errores conocidos
// -------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const ApiErrors = {
  unauthorized: () => new ApiError("UNAUTHORIZED", "No autenticado.", 401),
  forbidden: () => new ApiError("FORBIDDEN", "No tienes permisos para esta acción.", 403),
  notFound: (recurso = "El recurso") =>
    new ApiError("NOT_FOUND", `${recurso} no existe.`, 404),
  validation: (details: unknown) =>
    new ApiError("VALIDATION_ERROR", "Datos no válidos.", 422, details),
  conflict: (message = "El recurso ya existe.") => new ApiError("CONFLICT", message, 409),
  restricted: (message = "No se puede borrar: existen elementos relacionados.") =>
    new ApiError("RESTRICTED", message, 409),
  internal: () =>
    new ApiError("INTERNAL_ERROR", "Error interno del servidor.", 500),
};

// -------------------------------------------------------------
//  Respuesta unificada
// -------------------------------------------------------------

interface SuccessPayload<T> {
  data: T;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function ok<T>(data: T, pagination?: PaginationInfo): NextResponse<SuccessPayload<T>> {
  return NextResponse.json({ data, ...(pagination ? { pagination } : {}) });
}

export function created<T>(data: T): NextResponse<SuccessPayload<T>> {
  return NextResponse.json({ data }, { status: 201 });
}

// -------------------------------------------------------------
//  Wrapper para handlers: captura errores y los formatea
// -------------------------------------------------------------

type Handler = (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;

export function withErrorHandling(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return errorToResponse(err);
    }
  };
}

function errorToResponse(err: unknown): NextResponse {
  // Errores de validación Zod
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Datos no válidos.",
          details: err.flatten(),
        },
      },
      { status: 422 },
    );
  }

  // Errores conocidos de nuestra API
  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
      { status: err.status },
    );
  }

  // Errores conocidos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      // Unique constraint
      const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "campo";
      return NextResponse.json(
        {
          error: {
            code: "CONFLICT",
            message: `Ya existe un registro con el mismo valor en: ${target}.`,
          },
        },
        { status: 409 },
      );
    }
    if (err.code === "P2003" || err.code === "P2014") {
      // Foreign key restrict
      return NextResponse.json(
        {
          error: {
            code: "RESTRICTED",
            message: "No se puede realizar la operación: existen registros relacionados.",
          },
        },
        { status: 409 },
      );
    }
    if (err.code === "P2025") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "El recurso no existe." } },
        { status: 404 },
      );
    }
  }

  // Genérico
  console.error("[API ERROR]", err);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Error interno del servidor." } },
    { status: 500 },
  );
}

// -------------------------------------------------------------
//  Parsing de query params para listados
// -------------------------------------------------------------

export interface ListQuery {
  search: string;
  page: number;
  pageSize: number;
  soloActivos: boolean;
}

export function parseListQuery(url: string): ListQuery {
  const u = new URL(url);
  const page = Math.max(1, Number(u.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(u.searchParams.get("pageSize") ?? "20")));
  const search = (u.searchParams.get("search") ?? "").trim();
  const soloActivos = u.searchParams.get("soloActivos") !== "false";
  return { page, pageSize, search, soloActivos };
}

export function paginationFor(total: number, query: ListQuery): PaginationInfo {
  return {
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}
