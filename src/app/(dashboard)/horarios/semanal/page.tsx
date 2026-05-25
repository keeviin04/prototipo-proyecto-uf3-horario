"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { HorarioGrid, type AsignacionCelda } from "@/components/horarios/horario-grid";

export default function HorarioSemanalPage() {
  const [asignaciones, setAsignaciones] = useState<AsignacionCelda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/asignaciones?pageSize=500")
      .then((r) => r.json())
      .then((json) => setAsignaciones(json.data ?? []))
      .catch(() => setAsignaciones([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vista semanal"
        description="Cuadrícula completa de la semana con todas las asignaciones"
      />

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Cargando horario…</p>
      ) : asignaciones.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No hay asignaciones creadas todavía.
        </p>
      ) : (
        <HorarioGrid
          asignaciones={asignaciones}
          titulo="Horario semanal completo"
          secundario="profesor"
        />
      )}
    </div>
  );
}
