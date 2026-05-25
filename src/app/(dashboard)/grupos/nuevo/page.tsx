import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { GrupoForm } from "@/components/forms/grupo-form";
import { requireEditor } from "@/lib/authz";

export default async function NuevoGrupoPage() {
  await requireEditor();
  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo grupo" description="Alta de un grupo de alumnos" />
      <Card>
        <CardContent className="pt-6">
          <GrupoForm />
        </CardContent>
      </Card>
    </div>
  );
}
