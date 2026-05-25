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

interface GrupoItem {
  id: string;
  codigo: string;
  nombre: string;
  nivel: string;
}

export default function HorarioGrupoPage() {
  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [grupoId, setGrupoId] = useState<string>("");
  const [asignaciones, setAsignaciones] = useState<AsignacionCelda[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [loadingGrid, setLoadingGrid] = useState(false);

  useEffect(() => {
    fetch("/api/grupos?soloActivos=true&pageSize=200")
      .then((r) => r.json())
      .then((json) => setGrupos(json.data ?? []))
      .catch(() => setGrupos([]))
      .finally(() => setLoadingGrupos(false));
  }, []);

  useEffect(() => {
    if (!grupoId) {
      setAsignaciones([]);
      return;
    }
    setLoadingGrid(true);
    fetch(`/api/asignaciones?grupoId=${grupoId}&pageSize=500`)
      .then((r) => r.json())
      .then((json) => setAsignaciones(json.data ?? []))
      .catch(() => setAsignaciones([]))
      .finally(() => setLoadingGrid(false));
  }, [grupoId]);

  const grupoSeleccionado = grupos.find((g) => g.id === grupoId);
  const tituloGrid = grupoSeleccionado
    ? `${grupoSeleccionado.codigo} — ${grupoSeleccionado.nombre}`
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horario por grupo"
        description="Consulta del horario completo de un grupo de alumnos"
      />

      <div className="no-print max-w-sm">
        <Select value={grupoId} onValueChange={setGrupoId} disabled={loadingGrupos}>
          <SelectTrigger>
            <SelectValue
              placeholder={loadingGrupos ? "Cargando grupos…" : "Selecciona un grupo"}
            />
          </SelectTrigger>
          <SelectContent>
            {grupos.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.codigo} — {g.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!grupoId ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Selecciona un grupo para ver su horario.
        </p>
      ) : loadingGrid ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Cargando horario…</p>
      ) : asignaciones.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Este grupo no tiene asignaciones.
        </p>
      ) : (
        <HorarioGrid
          asignaciones={asignaciones}
          titulo={tituloGrid}
          secundario="profesor"
        />
      )}
    </div>
  );
}
