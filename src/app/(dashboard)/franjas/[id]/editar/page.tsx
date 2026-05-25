import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FranjaForm } from "@/components/forms/franja-form";
import { requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { getFranja } from "@/services/franjas.service";

export default async function EditarFranjaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await params;
  let franja;
  try {
    franja = await getFranja(centroId, id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Editar franja" description={franja.nombre} />
      <Card>
        <CardContent className="pt-6">
          <FranjaForm
            initialData={{
              id: franja.id,
              nombre: franja.nombre,
              horaInicio: franja.horaInicio,
              horaFin: franja.horaFin,
              orden: franja.orden,
              activo: franja.activo,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
