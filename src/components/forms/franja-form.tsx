"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormActions } from "@/components/forms/form-field";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast";
import { franjaCreateSchema, type FranjaCreateInput } from "@/lib/validations/franja.schema";

interface FranjaFormProps {
  initialData?: Partial<FranjaCreateInput> & { id?: string };
}

export function FranjaForm({ initialData }: FranjaFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FranjaCreateInput>({
    resolver: zodResolver(franjaCreateSchema),
    defaultValues: {
      nombre: initialData?.nombre ?? "",
      horaInicio: initialData?.horaInicio ?? "08:00",
      horaFin: initialData?.horaFin ?? "09:00",
      orden: initialData?.orden ?? 1,
      activo: initialData?.activo ?? true,
    },
  });

  async function onSubmit(values: FranjaCreateInput) {
    setSubmitting(true);
    try {
      const payload = { ...values, orden: Number(values.orden) };
      if (isEdit) {
        await apiClient.patch(`/api/franjas/${initialData!.id}`, payload);
        toast({ title: "Franja actualizada", variant: "success" });
      } else {
        await apiClient.post("/api/franjas", payload);
        toast({ title: "Franja creada", variant: "success" });
      }
      router.push("/franjas");
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
        <FormField
          label="Nombre"
          htmlFor="nombre"
          required
          error={errors.nombre?.message}
          className="sm:col-span-2"
          hint={'Ej.: "1ª hora", "Recreo", "4ª hora".'}
        >
          <Input id="nombre" {...register("nombre")} placeholder="1ª hora" />
        </FormField>
        <FormField
          label="Hora de inicio"
          htmlFor="horaInicio"
          required
          error={errors.horaInicio?.message}
        >
          <Input id="horaInicio" type="time" {...register("horaInicio")} />
        </FormField>
        <FormField
          label="Hora de fin"
          htmlFor="horaFin"
          required
          error={errors.horaFin?.message}
        >
          <Input id="horaFin" type="time" {...register("horaFin")} />
        </FormField>
        <FormField
          label="Orden"
          htmlFor="orden"
          error={errors.orden?.message}
          hint="Controla el orden de aparición en la lista (menor número primero)."
        >
          <Input
            id="orden"
            type="number"
            min={0}
            {...register("orden", { valueAsNumber: true })}
          />
        </FormField>
      </div>
      <FormField label="Activa" className="flex flex-row items-center gap-3 space-y-0">
        <input type="checkbox" id="activo" {...register("activo")} className="h-4 w-4 rounded border-input" />
      </FormField>
      <FormActions>
        <Button type="button" variant="outline" onClick={() => router.push("/franjas")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear franja"}
        </Button>
      </FormActions>
    </form>
  );
}
