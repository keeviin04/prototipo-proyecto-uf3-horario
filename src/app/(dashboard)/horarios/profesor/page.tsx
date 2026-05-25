"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { HorarioGrid, type AsignacionCelda } from "@/components/horarios/horario-grid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfesorItem {
  id: string;
  codigo: string;
  nombre: string;
  apellidos: string;
}

export default function HorarioProfesorPage() {
  const [profesores, setProfesores] = useState<ProfesorItem[]>([]);
  const [profesorId, setProfesorId] = useState<string>("");
  const [asignaciones, setAsignaciones] = useState<AsignacionCelda[]>([]);
  const [loadingProfs, setLoadingProfs] = useState(true);
  const [loadingGrid, setLoadingGrid] = useState(false);

  // Cargar lista de profesores
  useEffect(() => {
    fetch("/api/profesores?soloActivos=true&pageSize=200")
      .then((r) => r.json())
      .then((json) => setProfesores(json.data ?? []))
      .catch(() => setProfesores([]))
      .finally(() => setLoadingProfs(false));
  }, []);

  // Cargar asignaciones cuando cambia el profesor seleccionado
  useEffect(() => {
    if (!profesorId) {
      setAsignaciones([]);
      return;
    }
    setLoadingGrid(true);
    fetch(`/api/asignaciones?profesorId=${profesorId}&pageSize=500`)
      .then((r) => r.json())
      .then((json) => setAsignaciones(json.data ?? []))
      .catch(() => setAsignaciones([]))
      .finally(() => setLoadingGrid(false));
  }, [profesorId]);

  const profesorSeleccionado = profesores.find((p) => p.id === profesorId);
  const tituloGrid = profesorSeleccionado
    ? `${profesorSeleccionado.apellidos}, ${profesorSeleccionado.nombre} (${profesorSeleccionado.codigo})`
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horario por profesor"
        description="Consulta del horario individual de un profesor"
      />

      <div className="no-print max-w-sm">
        <Select value={profesorId} onValueChange={setProfesorId} disabled={loadingProfs}>
          <SelectTrigger>
            <SelectValue
              placeholder={loadingProfs ? "Cargando profesores…" : "Selecciona un profesor"}
            />
          </SelectTrigger>
          <SelectContent>
            {profesores.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.apellidos}, {p.nombre}{" "}
                <span className="text-muted-foreground">({p.codigo})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!profesorId ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Selecciona un profesor para ver su horario.
        </p>
      ) : loadingGrid ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Cargando horario…</p>
      ) : asignaciones.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Este profesor no tiene asignaciones.
        </p>
      ) : (
        <HorarioGrid
          asignaciones={asignaciones}
          titulo={tituloGrid}
          secundario="aula"
        />
      )}
    </div>
  );
}
