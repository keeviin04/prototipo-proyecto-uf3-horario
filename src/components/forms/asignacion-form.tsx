"use client";

import { useEffect, useState } from "react";
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
  asignacionCreateSchema,
  type AsignacionCreateInput,
} from "@/lib/validations/asignacion.schema";
import { DIAS_SEMANA, ETIQUETA_DIA } from "@/lib/enums";

interface ProfesorOption {
  id: string;
  codigo: string;
  nombre: string;
  apellidos: string;
}
interface AulaOption {
  id: string;
  codigo: string;
  nombre: string;
}
interface AsignaturaOption {
  id: string;
  nombre: string;
  tipo: string;
  color: string;
}
interface GrupoOption {
  id: string;
  codigo: string;
  nombre: string;
}

interface AsignacionFormProps {
  initialData?: Partial<AsignacionCreateInput> & { id?: string };
}

export function AsignacionForm({ initialData }: AsignacionFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initialData?.id);

  const [opts, setOpts] = useState<{
    profesores: ProfesorOption[];
    aulas: AulaOption[];
    asignaturas: AsignaturaOption[];
    grupos: GrupoOption[];
    loading: boolean;
  }>({ profesores: [], aulas: [], asignaturas: [], grupos: [], loading: true });

  useEffect(() => {
    async function cargar() {
      try {
        const [p, a, s, g] = await Promise.all([
          fetch("/api/profesores?soloActivos=true&pageSize=200").then((r) => r.json()),
          fetch("/api/aulas?soloActivos=true&pageSize=200").then((r) => r.json()),
          fetch("/api/asignaturas?soloActivos=true&pageSize=200").then((r) => r.json()),
          fetch("/api/grupos?soloActivos=true&pageSize=200").then((r) => r.json()),
        ]);
        setOpts({
          profesores: p.data ?? [],
          aulas: a.data ?? [],
          asignaturas: s.data ?? [],
          grupos: g.data ?? [],
          loading: false,
        });
      } catch {
        toast({ title: "Error al cargar las opciones", variant: "destructive" });
        setOpts((prev) => ({ ...prev, loading: false }));
      }
    }
    cargar();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AsignacionCreateInput>({
    resolver: zodResolver(asignacionCreateSchema),
    defaultValues: {
      dia: initialData?.dia,
      horaInicio: initialData?.horaInicio ?? "",
      horaFin: initialData?.horaFin ?? "",
      profesorId: initialData?.profesorId ?? "",
      aulaId: initialData?.aulaId ?? "",
      asignaturaId: initialData?.asignaturaId ?? "",
      grupoId: initialData?.grupoId ?? "",
      vigenteDesde: initialData?.vigenteDesde ?? "",
      vigenteHasta: initialData?.vigenteHasta ?? "",
      observaciones: initialData?.observaciones ?? "",
    },
  });

  async function onSubmit(values: AsignacionCreateInput) {
    setSubmitting(true);
    try {
      if (isEdit) {
        await apiClient.patch(`/api/asignaciones/${initialData!.id}`, values);
        toast({ title: "Asignación actualizada", variant: "success" });
      } else {
        await apiClient.post("/api/asignaciones", values);
        toast({ title: "Asignación creada", variant: "success" });
      }
      router.push("/asignaciones");
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
        {/* Día */}
        <FormField label="Día" required error={errors.dia?.message}>
          <Controller
            control={control}
            name="dia"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un día" />
                </SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map((d) => (
                    <SelectItem key={d} value={d}>
                      {ETIQUETA_DIA[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {/* Spacer */}
        <div className="hidden sm:block" />

        {/* Hora inicio */}
        <FormField
          label="Hora inicio"
          htmlFor="horaInicio"
          required
          error={errors.horaInicio?.message}
        >
          <Input id="horaInicio" type="time" {...register("horaInicio")} />
        </FormField>

        {/* Hora fin */}
        <FormField label="Hora fin" htmlFor="horaFin" required error={errors.horaFin?.message}>
          <Input id="horaFin" type="time" {...register("horaFin")} />
        </FormField>

        {/* Profesor */}
        <FormField label="Profesor" required error={errors.profesorId?.message}>
          <Controller
            control={control}
            name="profesorId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={opts.loading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={opts.loading ? "Cargando…" : "Selecciona un profesor"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {opts.profesores.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.apellidos}, {p.nombre}{" "}
                      <span className="text-muted-foreground">({p.codigo})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {/* Aula */}
        <FormField label="Aula" required error={errors.aulaId?.message}>
          <Controller
            control={control}
            name="aulaId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={opts.loading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={opts.loading ? "Cargando…" : "Selecciona un aula"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {opts.aulas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.codigo} — {a.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {/* Asignatura */}
        <FormField label="Asignatura" required error={errors.asignaturaId?.message}>
          <Controller
            control={control}
            name="asignaturaId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={opts.loading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={opts.loading ? "Cargando…" : "Selecciona una asignatura"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {opts.asignaturas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: a.color }}
                        />
                        {a.nombre}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {/* Grupo */}
        <FormField label="Grupo" required error={errors.grupoId?.message}>
          <Controller
            control={control}
            name="grupoId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={opts.loading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={opts.loading ? "Cargando…" : "Selecciona un grupo"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {opts.grupos.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.codigo} — {g.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        {/* Vigente desde */}
        <FormField
          label="Vigente desde"
          htmlFor="vigenteDesde"
          error={errors.vigenteDesde?.message}
          hint="Opcional. Sin fecha de inicio significa desde siempre."
        >
          <Input id="vigenteDesde" type="date" {...register("vigenteDesde")} />
        </FormField>

        {/* Vigente hasta */}
        <FormField
          label="Vigente hasta"
          htmlFor="vigenteHasta"
          error={errors.vigenteHasta?.message}
          hint="Opcional. Sin fecha de fin significa indefinido."
        >
          <Input id="vigenteHasta" type="date" {...register("vigenteHasta")} />
        </FormField>

        {/* Observaciones */}
        <FormField
          label="Observaciones"
          htmlFor="observaciones"
          error={errors.observaciones?.message}
          className="sm:col-span-2"
        >
          <Textarea id="observaciones" rows={2} {...register("observaciones")} />
        </FormField>
      </div>

      <FormActions>
        <Button type="button" variant="outline" onClick={() => router.push("/asignaciones")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting || opts.loading}>
          {submitting ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear asignación"}
        </Button>
      </FormActions>
    </form>
  );
}
