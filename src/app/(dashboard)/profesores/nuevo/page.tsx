import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProfesorForm } from "@/components/forms/profesor-form";
import { requireEditor } from "@/lib/authz";

export default async function NuevoProfesorPage() {
  await requireEditor();
  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo profesor" description="Alta de un nuevo profesor en el centro" />
      <Card>
        <CardContent className="pt-6">
          <ProfesorForm />
        </CardContent>
      </Card>
    </div>
  );
}
