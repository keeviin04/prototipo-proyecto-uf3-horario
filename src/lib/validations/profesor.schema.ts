import { z } from "zod";

export const profesorCreateSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "El código es obligatorio")
    .max(20, "Máximo 20 caracteres"),
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(80),
  apellidos: z.string().trim().min(2, "Los apellidos son obligatorios").max(120),
  email: z
    .string()
    .trim()
    .email("Email no válido")
    .max(150)
    .optional()
    .or(z.literal("")),
  departamento: z.string().trim().max(80).optional().or(z.literal("")),
  activo: z.boolean().optional(),
});

export const profesorUpdateSchema = profesorCreateSchema.partial();

export type ProfesorCreateInput = z.infer<typeof profesorCreateSchema>;
export type ProfesorUpdateInput = z.infer<typeof profesorUpdateSchema>;
