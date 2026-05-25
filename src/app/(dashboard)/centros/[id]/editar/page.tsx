import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CentroForm } from "@/components/forms/centro-form";
import { requireAdmin } from "@/lib/authz";
import { getCentro } from "@/services/centros.service";

export default async function EditarCentroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  let centro;
  try {
    centro = await getCentro(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Editar centro" description={centro.nombre} />
      <Card>
        <CardContent className="pt-6">
          <CentroForm
            initialData={{
              id: centro.id,
              codigo: centro.codigo,
              nombre: centro.nombre,
              direccion: centro.direccion ?? "",
              activo: centro.activo,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
