import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AsignacionForm } from "@/components/forms/asignacion-form";
import { requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { getAsignacion } from "@/services/asignaciones.service";
import { ETIQUETA_DIA, type DiaSemana } from "@/lib/enums";

export default async function EditarAsignacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await params;

  let asignacion;
  try {
    asignacion = await getAsignacion(centroId, id);
  } catch {
    notFound();
  }

  const dia = asignacion.dia as DiaSemana;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar asignación"
        description={`${asignacion.profesor.apellidos}, ${asignacion.profesor.nombre} — ${ETIQUETA_DIA[dia]} ${asignacion.horaInicio}–${asignacion.horaFin}`}
      />
      <Card>
        <CardContent className="pt-6">
          <AsignacionForm
            initialData={{
              id: asignacion.id,
              dia,
              horaInicio: asignacion.horaInicio,
              horaFin: asignacion.horaFin,
              profesorId: asignacion.profesorId,
              aulaId: asignacion.aulaId,
              asignaturaId: asignacion.asignaturaId,
              grupoId: asignacion.grupoId,
              vigenteDesde: asignacion.vigenteDesde
                ? asignacion.vigenteDesde.toISOString().split("T")[0]
                : "",
              vigenteHasta: asignacion.vigenteHasta
                ? asignacion.vigenteHasta.toISOString().split("T")[0]
                : "",
              observaciones: asignacion.observaciones ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
