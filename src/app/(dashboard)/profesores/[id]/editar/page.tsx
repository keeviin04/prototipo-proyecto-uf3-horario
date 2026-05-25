import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProfesorForm } from "@/components/forms/profesor-form";
import { requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { getProfesor } from "@/services/profesores.service";

export default async function EditarProfesorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await params;

  let profesor;
  try {
    profesor = await getProfesor(centroId, id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar profesor"
        description={`${profesor.apellidos}, ${profesor.nombre}`}
      />
      <Card>
        <CardContent className="pt-6">
          <ProfesorForm
            initialData={{
              id: profesor.id,
              codigo: profesor.codigo,
              nombre: profesor.nombre,
              apellidos: profesor.apellidos,
              email: profesor.email ?? "",
              departamento: profesor.departamento ?? "",
              activo: profesor.activo,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
