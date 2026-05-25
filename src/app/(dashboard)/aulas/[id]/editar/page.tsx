import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AulaForm } from "@/components/forms/aula-form";
import { requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { getAula } from "@/services/aulas.service";

export default async function EditarAulaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await params;
  let aula;
  try {
    aula = await getAula(centroId, id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Editar aula" description={aula.nombre} />
      <Card>
        <CardContent className="pt-6">
          <AulaForm
            initialData={{
              id: aula.id,
              codigo: aula.codigo,
              nombre: aula.nombre,
              ubicacion: aula.ubicacion ?? "",
              capacidad: aula.capacidad ?? undefined,
              equipamiento: aula.equipamiento ?? "",
              activo: aula.activo,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
