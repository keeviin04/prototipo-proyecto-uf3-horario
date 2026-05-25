import { z } from "zod";

export const aulaCreateSchema = z.object({
  codigo: z.string().trim().min(1, "El código es obligatorio").max(20),
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(100),
  ubicacion: z.string().trim().max(150).optional().or(z.literal("")),
  capacidad: z
    .number({ invalid_type_error: "Debe ser un número" })
    .int("Debe ser un número entero")
    .min(0, "Debe ser mayor o igual a 0")
    .max(2000)
    .optional()
    .nullable(),
  equipamiento: z.string().trim().max(500).optional().or(z.literal("")),
  activo: z.boolean().optional(),
});

export const aulaUpdateSchema = aulaCreateSchema.partial();

export type AulaCreateInput = z.infer<typeof aulaCreateSchema>;
export type AulaUpdateInput = z.infer<typeof aulaUpdateSchema>;
