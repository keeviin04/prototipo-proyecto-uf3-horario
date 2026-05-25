import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AsignaturaForm } from "@/components/forms/asignatura-form";
import { requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { getAsignatura } from "@/services/asignaturas.service";
import type { TipoAsignatura } from "@/lib/enums";

export default async function EditarAsignaturaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await params;
  let asignatura;
  try {
    asignatura = await getAsignatura(centroId, id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Editar asignatura" description={asignatura.nombre} />
      <Card>
        <CardContent className="pt-6">
          <AsignaturaForm
            initialData={{
              id: asignatura.id,
              codigo: asignatura.codigo,
              nombre: asignatura.nombre,
              descripcion: asignatura.descripcion ?? "",
              tipo: asignatura.tipo as TipoAsignatura,
              color: asignatura.color,
              activo: asignatura.activo,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
