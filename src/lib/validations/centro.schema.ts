import { z } from "zod";

export const centroCreateSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(20, "Máximo 20 caracteres"),
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(150),
  direccion: z.string().trim().max(200).optional().or(z.literal("")),
  activo: z.boolean().optional(),
});

export const centroUpdateSchema = centroCreateSchema.partial();

export type CentroCreateInput = z.infer<typeof centroCreateSchema>;
export type CentroUpdateInput = z.infer<typeof centroUpdateSchema>;
