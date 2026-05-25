import { z } from "zod";
import { diaSemanaSchema } from "@/lib/enums";
import { horaSchema } from "@/lib/validations/comun";

const fechaOpcionalSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido. Use YYYY-MM-DD.")
  .optional()
  .or(z.literal(""));

// Schema base (sin superRefine) para poder derivar el parcial
const asignacionBaseSchema = z.object({
  dia: diaSemanaSchema,
  horaInicio: horaSchema,
  horaFin: horaSchema,
  profesorId: z.string().min(1, "Selecciona un profesor"),
  aulaId: z.string().min(1, "Selecciona un aula"),
  asignaturaId: z.string().min(1, "Selecciona una asignatura"),
  grupoId: z.string().min(1, "Selecciona un grupo"),
  vigenteDesde: fechaOpcionalSchema,
  vigenteHasta: fechaOpcionalSchema,
  observaciones: z.string().trim().max(500).optional().or(z.literal("")),
});

function refinarHorario<T extends { horaInicio?: string; horaFin?: string; vigenteDesde?: string; vigenteHasta?: string }>(
  data: T,
  ctx: z.RefinementCtx,
) {
  if (data.horaInicio && data.horaFin && data.horaFin <= data.horaInicio) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La hora de fin debe ser posterior a la de inicio.",
      path: ["horaFin"],
    });
  }
  if (
    data.vigenteDesde &&
    data.vigenteHasta &&
    data.vigenteHasta <= data.vigenteDesde
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de fin debe ser posterior a la de inicio.",
      path: ["vigenteHasta"],
    });
  }
}

export const asignacionCreateSchema = asignacionBaseSchema.superRefine(refinarHorario);

export const asignacionUpdateSchema = asignacionBaseSchema.partial().superRefine(refinarHorario);

export type AsignacionCreateInput = z.infer<typeof asignacionCreateSchema>;
export type AsignacionUpdateInput = z.infer<typeof asignacionUpdateSchema>;
