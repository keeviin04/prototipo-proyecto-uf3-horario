import { z } from "zod";
import { tipoAsignaturaSchema } from "@/lib/enums";

export const asignaturaCreateSchema = z.object({
  codigo: z.string().trim().min(1, "El código es obligatorio").max(20),
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(100),
  descripcion: z.string().trim().max(500).optional().or(z.literal("")),
  tipo: tipoAsignaturaSchema.default("ASIGNATURA"),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Formato inválido, usa #RRGGBB")
    .default("#3b82f6"),
  activo: z.boolean().optional(),
});

export const asignaturaUpdateSchema = asignaturaCreateSchema.partial();

export type AsignaturaCreateInput = z.infer<typeof asignaturaCreateSchema>;
export type AsignaturaUpdateInput = z.infer<typeof asignaturaUpdateSchema>;
