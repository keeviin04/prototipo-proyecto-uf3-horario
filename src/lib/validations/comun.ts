import { z } from "zod";

/** Valida una hora en formato "HH:MM" (24h). */
export const horaSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato inválido. Use HH:MM (24h).");

/** Convierte "HH:MM" en minutos desde medianoche. Útil para comparar y detectar solapamientos. */
export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/** Comprueba si dos intervalos horarios [a1,a2) y [b1,b2) se solapan en algún punto > 0. */
export function intervalosSolapan(a1: string, a2: string, b1: string, b2: string): boolean {
  const ai = horaAMinutos(a1);
  const af = horaAMinutos(a2);
  const bi = horaAMinutos(b1);
  const bf = horaAMinutos(b2);
  return ai < bf && bi < af;
}
