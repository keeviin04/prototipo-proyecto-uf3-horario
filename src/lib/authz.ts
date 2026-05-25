/**
 * Helpers de autorización.
 *
 * Reglas globales del MVP:
 *   - VIEWER: solo lectura
 *   - EDITOR: lectura y escritura sobre catálogos y asignaciones
 *   - ADMIN:  lectura, escritura y gestión de Centros y usuarios
 */

import { auth } from "@/lib/auth";
import { ApiErrors } from "@/lib/api";
import { Rol } from "@/lib/enums";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  rol: Rol;
  centroId: string | null;
}

/** Devuelve el usuario autenticado o lanza ApiError 401. */
export async function requireAuth(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) throw ApiErrors.unauthorized();
  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name!,
    rol: session.user.rol,
    centroId: session.user.centroId,
  };
}

/** Devuelve el usuario o null. Útil en server components. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name!,
    rol: session.user.rol,
    centroId: session.user.centroId,
  };
}

/** Exige que el usuario tenga uno de los roles permitidos. */
export async function requireRole(...roles: Rol[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.rol)) throw ApiErrors.forbidden();
  return user;
}

/** Atajos comunes. */
export const requireEditor = () => requireRole(Rol.ADMIN, Rol.EDITOR);
export const requireAdmin = () => requireRole(Rol.ADMIN);

/** Comprobación booleana (sin lanzar). */
export function canEdit(user: SessionUser | null): boolean {
  return user?.rol === Rol.ADMIN || user?.rol === Rol.EDITOR;
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.rol === Rol.ADMIN;
}
