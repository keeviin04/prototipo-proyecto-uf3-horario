"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField, FormActions } from "@/components/forms/form-field";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast";
import { grupoCreateSchema, type GrupoCreateInput } from "@/lib/validations/grupo.schema";
import { NIVELES_EDUCATIVOS, ETIQUETA_NIVEL } from "@/lib/enums";

interface GrupoFormProps {
  initialData?: Partial<GrupoCreateInput> & { id?: string };
}

export function GrupoForm({ initialData }: GrupoFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GrupoCreateInput>({
    resolver: zodResolver(grupoCreateSchema),
    defaultValues: {
      codigo: initialData?.codigo ?? "",
      nombre: initialData?.nombre ?? "",
      nivel: initialData?.nivel ?? "FP_SUPERIOR",
      cursoAcademico: initialData?.cursoAcademico ?? "2025-2026",
      numAlumnos: initialData?.numAlumnos ?? undefined,
      activo: initialData?.activo ?? true,
    },
  });

  async function onSubmit(values: GrupoCreateInput) {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        numAlumnos:
          values.numAlumnos === null || values.numAlumnos === undefined || isNaN(Number(values.numAlumnos))
            ? null
            : Number(values.numAlumnos),
      };
      if (isEdit) {
        await apiClient.patch(`/api/grupos/${initialData!.id}`, payload);
        toast({ title: "Grupo actualizado", variant: "success" });
      } else {
        await apiClient.post("/api/grupos", payload);
        toast({ title: "Grupo creado", variant: "success" });
      }
      router.push("/grupos");
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Error al guardar.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Código" htmlFor="codigo" required error={errors.codigo?.message}>
          <Input id="codigo" {...register("codigo")} placeholder="1DAW" />
        </FormField>
        <FormField label="Curso académico" htmlFor="cursoAcademico" required error={errors.cursoAcademico?.message}>
          <Input id="cursoAcademico" {...register("cursoAcademico")} placeholder="2025-2026" />
        </FormField>
        <FormField
          label="Nombre"
          htmlFor="nombre"
          required
          error={errors.nombre?.message}
          className="sm:col-span-2"
        >
          <Input id="nombre" {...register("nombre")} placeholder="1º DAW" />
        </FormField>
        <FormField label="Nivel educativo" required error={errors.nivel?.message}>
          <Controller
            control={control}
            name="nivel"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un nivel" />
                </SelectTrigger>
                <SelectContent>
                  {NIVELES_EDUCATIVOS.map((n) => (
                    <SelectItem key={n} value={n}>
                      {ETIQUETA_NIVEL[n]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Nº alumnos" htmlFor="numAlumnos" error={errors.numAlumnos?.message}>
          <Input
            id="numAlumnos"
            type="number"
            min={0}
            {...register("numAlumnos", { valueAsNumber: true })}
          />
        </FormField>
      </div>
      <FormField label="Activo" className="flex flex-row items-center gap-3 space-y-0">
        <input type="checkbox" id="activo" {...register("activo")} className="h-4 w-4 rounded border-input" />
      </FormField>
      <FormActions>
        <Button type="button" variant="outline" onClick={() => router.push("/grupos")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear grupo"}
        </Button>
      </FormActions>
    </form>
  );
}
