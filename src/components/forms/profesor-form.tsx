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
import {
  profesorCreateSchema,
  type ProfesorCreateInput,
} from "@/lib/validations/profesor.schema";

interface ProfesorFormProps {
  initialData?: Partial<ProfesorCreateInput> & { id?: string };
}

export function ProfesorForm({ initialData }: ProfesorFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfesorCreateInput>({
    resolver: zodResolver(profesorCreateSchema),
    defaultValues: {
      codigo: initialData?.codigo ?? "",
      nombre: initialData?.nombre ?? "",
      apellidos: initialData?.apellidos ?? "",
      email: initialData?.email ?? "",
      departamento: initialData?.departamento ?? "",
      activo: initialData?.activo ?? true,
    },
  });

  async function onSubmit(values: ProfesorCreateInput) {
    setSubmitting(true);
    try {
      if (isEdit) {
        await apiClient.patch(`/api/profesores/${initialData!.id}`, values);
        toast({ title: "Profesor actualizado", variant: "success" });
      } else {
        await apiClient.post("/api/profesores", values);
        toast({ title: "Profesor creado", variant: "success" });
      }
      router.push("/profesores");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : "Error al guardar. Inténtalo de nuevo.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Código" htmlFor="codigo" required error={errors.codigo?.message}>
          <Input id="codigo" {...register("codigo")} placeholder="P001" />
        </FormField>
        <FormField label="Departamento" htmlFor="departamento" error={errors.departamento?.message}>
          <Input id="departamento" {...register("departamento")} placeholder="Informática" />
        </FormField>
        <FormField label="Nombre" htmlFor="nombre" required error={errors.nombre?.message}>
          <Input id="nombre" {...register("nombre")} />
        </FormField>
        <FormField label="Apellidos" htmlFor="apellidos" required error={errors.apellidos?.message}>
          <Input id="apellidos" {...register("apellidos")} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message} className="sm:col-span-2">
          <Input id="email" type="email" {...register("email")} placeholder="profesor@uf3.local" />
        </FormField>
      </div>
      <FormField label="Activo" className="flex flex-row items-center gap-3 space-y-0">
        <input
          type="checkbox"
          id="activo"
          {...register("activo")}
          className="h-4 w-4 rounded border-input"
        />
      </FormField>
      <FormActions>
        <Button type="button" variant="outline" onClick={() => router.push("/profesores")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear profesor"}
        </Button>
      </FormActions>
    </form>
  );
}
