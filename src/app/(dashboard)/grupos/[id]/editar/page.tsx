import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { GrupoForm } from "@/components/forms/grupo-form";
import { requireEditor } from "@/lib/authz";
import { resolveCentroId } from "@/lib/centro-context";
import { getGrupo } from "@/services/grupos.service";
import type { NivelEducativo } from "@/lib/enums";

export default async function EditarGrupoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireEditor();
  const centroId = await resolveCentroId(user);
  const { id } = await params;
  let grupo;
  try {
    grupo = await getGrupo(centroId, id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Editar grupo" description={grupo.nombre} />
      <Card>
        <CardContent className="pt-6">
          <GrupoForm
            initialData={{
              id: grupo.id,
              codigo: grupo.codigo,
              nombre: grupo.nombre,
              nivel: grupo.nivel as NivelEducativo,
              cursoAcademico: grupo.cursoAcademico,
              numAlumnos: grupo.numAlumnos ?? undefined,
              activo: grupo.activo,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
