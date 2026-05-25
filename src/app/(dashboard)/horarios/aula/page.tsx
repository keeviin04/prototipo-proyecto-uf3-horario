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

interface AulaItem {
  id: string;
  codigo: string;
  nombre: string;
}

export default function HorarioAulaPage() {
  const [aulas, setAulas] = useState<AulaItem[]>([]);
  const [aulaId, setAulaId] = useState<string>("");
  const [asignaciones, setAsignaciones] = useState<AsignacionCelda[]>([]);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [loadingGrid, setLoadingGrid] = useState(false);

  useEffect(() => {
    fetch("/api/aulas?soloActivos=true&pageSize=200")
      .then((r) => r.json())
      .then((json) => setAulas(json.data ?? []))
      .catch(() => setAulas([]))
      .finally(() => setLoadingAulas(false));
  }, []);

  useEffect(() => {
    if (!aulaId) {
      setAsignaciones([]);
      return;
    }
    setLoadingGrid(true);
    fetch(`/api/asignaciones?aulaId=${aulaId}&pageSize=500`)
      .then((r) => r.json())
      .then((json) => setAsignaciones(json.data ?? []))
      .catch(() => setAsignaciones([]))
      .finally(() => setLoadingGrid(false));
  }, [aulaId]);

  const aulaSeleccionada = aulas.find((a) => a.id === aulaId);
  const tituloGrid = aulaSeleccionada
    ? `Aula ${aulaSeleccionada.codigo} — ${aulaSeleccionada.nombre}`
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horario por aula"
        description="Consulta de las clases impartidas en un aula concreta"
      />

      <div className="no-print max-w-sm">
        <Select value={aulaId} onValueChange={setAulaId} disabled={loadingAulas}>
          <SelectTrigger>
            <SelectValue
              placeholder={loadingAulas ? "Cargando aulas…" : "Selecciona un aula"}
            />
          </SelectTrigger>
          <SelectContent>
            {aulas.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.codigo} — {a.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!aulaId ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Selecciona un aula para ver su horario.
        </p>
      ) : loadingGrid ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Cargando horario…</p>
      ) : asignaciones.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Esta aula no tiene asignaciones.
        </p>
      ) : (
        <HorarioGrid
          asignaciones={asignaciones}
          titulo={tituloGrid}
          secundario="grupo"
        />
      )}
    </div>
  );
}
