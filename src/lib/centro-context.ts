/**
 * Resolución del centro activo.
 *
 * En el MVP solo hay un centro y todas las operaciones se hacen contra él.
 * En el futuro, este helper será el punto único donde se decide qué centro
 * usar (sesión del usuario, selector en topbar, etc.).
 */

import { prisma } from "@/lib/db";
import { ApiErrors } from "@/lib/api";
import type { SessionUser } from "@/lib/authz";

/** Devuelve el centroId asociado al usuario, o el primer centro activo. */
export async function resolveCentroId(user: SessionUser): Promise<string> {
  if (user.centroId) return user.centroId;

  const centro = await prisma.centro.findFirst({
    where: { activo: true },
    orderBy: { createdAt: "asc" },
  });
  if (!centro) throw ApiErrors.notFound("Centro");
  return centro.id;
}
