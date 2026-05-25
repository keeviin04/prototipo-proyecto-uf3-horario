"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  asignaturaCreateSchema,
  type AsignaturaCreateInput,
} from "@/lib/validations/asignatura.schema";
import { TIPOS_ASIGNATURA, ETIQUETA_TIPO_ASIGNATURA } from "@/lib/enums";

interface AsignaturaFormProps {
  initialData?: Partial<AsignaturaCreateInput> & { id?: string };
}

export function AsignaturaForm({ initialData }: AsignaturaFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AsignaturaCreateInput>({
    resolver: zodResolver(asignaturaCreateSchema),
    defaultValues: {
      codigo: initialData?.codigo ?? "",
      nombre: initialData?.nombre ?? "",
      descripcion: initialData?.descripcion ?? "",
      tipo: initialData?.tipo ?? "ASIGNATURA",
      color: initialData?.color ?? "#3b82f6",
      activo: initialData?.activo ?? true,
    },
  });

  const color = watch("color");

  async function onSubmit(values: AsignaturaCreateInput) {
    setSubmitting(true);
    try {
      if (isEdit) {
        await apiClient.patch(`/api/asignaturas/${initialData!.id}`, values);
        toast({ title: "Asignatura actualizada", variant: "success" });
      } else {
        await apiClient.post("/api/asignaturas", values);
        toast({ title: "Asignatura creada", variant: "success" });
      }
      router.push("/asignaturas");
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
          <Input id="codigo" {...register("codigo")} placeholder="BBDD" />
        </FormField>
        <FormField label="Tipo" required error={errors.tipo?.message}>
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ASIGNATURA.map((t) => (
                    <SelectItem key={t} value={t}>
                      {ETIQUETA_TIPO_ASIGNATURA[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField
          label="Nombre"
          htmlFor="nombre"
          required
          error={errors.nombre?.message}
          className="sm:col-span-2"
        >
          <Input id="nombre" {...register("nombre")} placeholder="Bases de Datos" />
        </FormField>
        <FormField
          label="Descripción"
          htmlFor="descripcion"
          error={errors.descripcion?.message}
          className="sm:col-span-2"
        >
          <Textarea id="descripcion" {...register("descripcion")} />
        </FormField>
        <FormField label="Color" htmlFor="color" error={errors.color?.message}>
          <div className="flex items-center gap-3">
            <Input id="color" type="color" {...register("color")} className="h-10 w-16 p-1" />
            <span className="text-sm text-muted-foreground">{color}</span>
          </div>
        </FormField>
      </div>
      <FormField label="Activo" className="flex flex-row items-center gap-3 space-y-0">
        <input type="checkbox" id="activo" {...register("activo")} className="h-4 w-4 rounded border-input" />
      </FormField>
      <FormActions>
        <Button type="button" variant="outline" onClick={() => router.push("/asignaturas")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear asignatura"}
        </Button>
      </FormActions>
    </form>
  );
}
