"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormActions } from "@/components/forms/form-field";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast";
import { aulaCreateSchema, type AulaCreateInput } from "@/lib/validations/aula.schema";

interface AulaFormProps {
  initialData?: Partial<AulaCreateInput> & { id?: string };
}

export function AulaForm({ initialData }: AulaFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AulaCreateInput>({
    resolver: zodResolver(aulaCreateSchema),
    defaultValues: {
      codigo: initialData?.codigo ?? "",
      nombre: initialData?.nombre ?? "",
      ubicacion: initialData?.ubicacion ?? "",
      capacidad: initialData?.capacidad ?? undefined,
      equipamiento: initialData?.equipamiento ?? "",
      activo: initialData?.activo ?? true,
    },
  });

  async function onSubmit(values: AulaCreateInput) {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        capacidad:
          values.capacidad === null || values.capacidad === undefined || isNaN(Number(values.capacidad))
            ? null
            : Number(values.capacidad),
      };
      if (isEdit) {
        await apiClient.patch(`/api/aulas/${initialData!.id}`, payload);
        toast({ title: "Aula actualizada", variant: "success" });
      } else {
        await apiClient.post("/api/aulas", payload);
        toast({ title: "Aula creada", variant: "success" });
      }
      router.push("/aulas");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Error al guardar.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Código" htmlFor="codigo" required error={errors.codigo?.message}>
          <Input id="codigo" {...register("codigo")} placeholder="INF-01" />
        </FormField>
        <FormField label="Capacidad" htmlFor="capacidad" error={errors.capacidad?.message}>
          <Input
            id="capacidad"
            type="number"
            min={0}
            {...register("capacidad", { valueAsNumber: true })}
          />
        </FormField>
        <FormField label="Nombre" htmlFor="nombre" required error={errors.nombre?.message} className="sm:col-span-2">
          <Input id="nombre" {...register("nombre")} placeholder="Aula Informática 1" />
        </FormField>
        <FormField label="Ubicación" htmlFor="ubicacion" error={errors.ubicacion?.message} className="sm:col-span-2">
          <Input id="ubicacion" {...register("ubicacion")} placeholder="Edif. A, Planta 1" />
        </FormField>
        <FormField
          label="Equipamiento"
          htmlFor="equipamiento"
          error={errors.equipamiento?.message}
          className="sm:col-span-2"
        >
          <Textarea
            id="equipamiento"
            {...register("equipamiento")}
            placeholder="25 PCs, proyector, pizarra digital"
          />
        </FormField>
      </div>
      <FormField label="Activo" className="flex flex-row items-center gap-3 space-y-0">
        <input type="checkbox" id="activo" {...register("activo")} className="h-4 w-4 rounded border-input" />
      </FormField>
      <FormActions>
        <Button type="button" variant="outline" onClick={() => router.push("/aulas")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear aula"}
        </Button>
      </FormActions>
    </form>
  );
}
