/**
 * Definiciones de "enums" para la aplicación.
 *
 * Como SQLite no soporta enums nativos en Prisma, los valores se almacenan
 * como String en la base de datos. Aquí los definimos como objetos `const`
 * + tipos TypeScript para conseguir el mismo nivel de seguridad y ergonomía
 * que un enum real, y exportamos esquemas Zod para validar entradas.
 *
 * Uso:
 *
 *   import { Rol, rolSchema } from "@/lib/enums";
 *
 *   const r: Rol = Rol.ADMIN;          // tipado fuerte
 *   rolSchema.parse(inputDelUsuario);  // validación en API
 *
 * Si en el futuro se migra a PostgreSQL, estos valores coinciden con los
 * enums nativos que se podrían declarar en el schema de Prisma.
 */

import { z } from "zod";

// -------------------------------------------------------------
//  Rol del usuario
// -------------------------------------------------------------
export const Rol = {
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
} as const;
export type Rol = (typeof Rol)[keyof typeof Rol];
export const ROLES = Object.values(Rol) as Rol[];
export const rolSchema = z.enum(["ADMIN", "EDITOR", "VIEWER"]);

// -------------------------------------------------------------
//  Día de la semana
// -------------------------------------------------------------
export const DiaSemana = {
  LUNES: "LUNES",
  MARTES: "MARTES",
  MIERCOLES: "MIERCOLES",
  JUEVES: "JUEVES",
  VIERNES: "VIERNES",
  SABADO: "SABADO",
  DOMINGO: "DOMINGO",
} as const;
export type DiaSemana = (typeof DiaSemana)[keyof typeof DiaSemana];
export const DIAS_SEMANA = Object.values(DiaSemana) as DiaSemana[];
export const diaSemanaSchema = z.enum([
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
]);

/** Etiquetas legibles para mostrar en UI. */
export const ETIQUETA_DIA: Record<DiaSemana, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

// -------------------------------------------------------------
//  Nivel educativo
// -------------------------------------------------------------
export const NivelEducativo = {
  INFANTIL: "INFANTIL",
  PRIMARIA: "PRIMARIA",
  ESO: "ESO",
  BACHILLERATO: "BACHILLERATO",
  FP_BASICA: "FP_BASICA",
  FP_MEDIO: "FP_MEDIO",
  FP_SUPERIOR: "FP_SUPERIOR",
  GRADO: "GRADO",
  MASTER: "MASTER",
  OTRO: "OTRO",
} as const;
export type NivelEducativo = (typeof NivelEducativo)[keyof typeof NivelEducativo];
export const NIVELES_EDUCATIVOS = Object.values(NivelEducativo) as NivelEducativo[];
export const nivelEducativoSchema = z.enum([
  "INFANTIL",
  "PRIMARIA",
  "ESO",
  "BACHILLERATO",
  "FP_BASICA",
  "FP_MEDIO",
  "FP_SUPERIOR",
  "GRADO",
  "MASTER",
  "OTRO",
]);

/** Etiquetas legibles para mostrar en UI. */
export const ETIQUETA_NIVEL: Record<NivelEducativo, string> = {
  INFANTIL: "Infantil",
  PRIMARIA: "Primaria",
  ESO: "ESO",
  BACHILLERATO: "Bachillerato",
  FP_BASICA: "FP Básica",
  FP_MEDIO: "FP Grado Medio",
  FP_SUPERIOR: "FP Grado Superior",
  GRADO: "Grado universitario",
  MASTER: "Máster",
  OTRO: "Otro",
};

// -------------------------------------------------------------
//  Tipo de asignatura
// -------------------------------------------------------------
export const TipoAsignatura = {
  ASIGNATURA: "ASIGNATURA",
  TUTORIA: "TUTORIA",
  REUNION: "REUNION",
  GUARDIA: "GUARDIA",
  TAREA: "TAREA",
  OTRO: "OTRO",
} as const;
export type TipoAsignatura = (typeof TipoAsignatura)[keyof typeof TipoAsignatura];
export const TIPOS_ASIGNATURA = Object.values(TipoAsignatura) as TipoAsignatura[];
export const tipoAsignaturaSchema = z.enum([
  "ASIGNATURA",
  "TUTORIA",
  "REUNION",
  "GUARDIA",
  "TAREA",
  "OTRO",
]);

/** Etiquetas legibles para mostrar en UI. */
export const ETIQUETA_TIPO_ASIGNATURA: Record<TipoAsignatura, string> = {
  ASIGNATURA: "Asignatura",
  TUTORIA: "Tutoría",
  REUNION: "Reunión",
  GUARDIA: "Guardia",
  TAREA: "Tarea",
  OTRO: "Otro",
};
