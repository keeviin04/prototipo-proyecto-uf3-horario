import { z } from "zod";
import { nivelEducativoSchema } from "@/lib/enums";

export const grupoCreateSchema = z.object({
  codigo: z.string().trim().min(1, "El código es obligatorio").max(20),
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(100),
  nivel: nivelEducativoSchema,
  cursoAcademico: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{4}$/, "Formato YYYY-YYYY, p.ej. 2025-2026"),
  numAlumnos: z
    .number({ invalid_type_error: "Debe ser un número" })
    .int()
    .min(0)
    .max(1000)
    .optional()
    .nullable(),
  activo: z.boolean().optional(),
});

export const grupoUpdateSchema = grupoCreateSchema.partial();

export type GrupoCreateInput = z.infer<typeof grupoCreateSchema>;
export type GrupoUpdateInput = z.infer<typeof grupoUpdateSchema>;
