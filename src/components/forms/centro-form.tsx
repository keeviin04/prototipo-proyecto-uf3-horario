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
import { centroCreateSchema, type CentroCreateInput } from "@/lib/validations/centro.schema";

interface CentroFormProps {
  initialData?: Partial<CentroCreateInput> & { id?: string };
}

export function CentroForm({ initialData }: CentroFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CentroCreateInput>({
    resolver: zodResolver(centroCreateSchema),
    defaultValues: {
      codigo: initialData?.codigo ?? "",
      nombre: initialData?.nombre ?? "",
      direccion: initialData?.direccion ?? "",
      activo: initialData?.activo ?? true,
    },
  });

  async function onSubmit(values: CentroCreateInput) {
    setSubmitting(true);
    try {
      if (isEdit) {
        await apiClient.patch(`/api/centros/${initialData!.id}`, values);
        toast({ title: "Centro actualizado", variant: "success" });
      } else {
        await apiClient.post("/api/centros", values);
        toast({ title: "Centro creado", variant: "success" });
      }
      router.push("/centros");
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
          <Input id="codigo" {...register("codigo")} placeholder="CEU-FIII" />
        </FormField>
        <FormField label="Nombre" htmlFor="nombre" required error={errors.nombre?.message}>
          <Input id="nombre" {...register("nombre")} placeholder="CEU FP Fernando III" />
        </FormField>
        <FormField
          label="Dirección"
          htmlFor="direccion"
          error={errors.direccion?.message}
          className="sm:col-span-2"
        >
          <Input id="direccion" {...register("direccion")} placeholder="Bormujos, Sevilla" />
        </FormField>
      </div>
      <FormField label="Activo" className="flex flex-row items-center gap-3 space-y-0">
        <input type="checkbox" id="activo" {...register("activo")} className="h-4 w-4 rounded border-input" />
      </FormField>
      <FormActions>
        <Button type="button" variant="outline" onClick={() => router.push("/centros")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear centro"}
        </Button>
      </FormActions>
    </form>
  );
}
