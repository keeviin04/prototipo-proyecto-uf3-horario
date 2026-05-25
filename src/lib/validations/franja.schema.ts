import { z } from "zod";
import { horaSchema, horaAMinutos } from "@/lib/validations/comun";

export const franjaCreateSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio").max(50),
    horaInicio: horaSchema,
    horaFin: horaSchema,
    orden: z
      .number({ invalid_type_error: "Debe ser un número" })
      .int()
      .min(0)
      .max(999)
      .default(0),
    activo: z.boolean().optional(),
  })
  .refine((d) => horaAMinutos(d.horaFin) > horaAMinutos(d.horaInicio), {
    message: "La hora de fin debe ser posterior a la hora de inicio",
    path: ["horaFin"],
  });

export const franjaUpdateSchema = z
  .object({
    nombre: z.string().trim().min(1).max(50).optional(),
    horaInicio: horaSchema.optional(),
    horaFin: horaSchema.optional(),
    orden: z.number().int().min(0).max(999).optional(),
    activo: z.boolean().optional(),
  })
  .refine(
    (d) => {
      // Si vienen ambas horas, validamos. Si solo viene una, no.
      if (d.horaInicio && d.horaFin) {
        return horaAMinutos(d.horaFin) > horaAMinutos(d.horaInicio);
      }
      return true;
    },
    {
      message: "La hora de fin debe ser posterior a la hora de inicio",
      path: ["horaFin"],
    },
  );

export type FranjaCreateInput = z.infer<typeof franjaCreateSchema>;
export type FranjaUpdateInput = z.infer<typeof franjaUpdateSchema>;
