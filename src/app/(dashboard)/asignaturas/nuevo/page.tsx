import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AsignaturaForm } from "@/components/forms/asignatura-form";
import { requireEditor } from "@/lib/authz";

export default async function NuevaAsignaturaPage() {
  await requireEditor();
  return (
    <div className="space-y-6">
      <PageHeader title="Nueva asignatura" description="Alta de una asignatura o tarea" />
      <Card>
        <CardContent className="pt-6">
          <AsignaturaForm />
        </CardContent>
      </Card>
    </div>
  );
}
