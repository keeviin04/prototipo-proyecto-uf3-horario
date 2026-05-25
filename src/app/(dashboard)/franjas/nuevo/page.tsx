import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FranjaForm } from "@/components/forms/franja-form";
import { requireEditor } from "@/lib/authz";

export default async function NuevaFranjaPage() {
  await requireEditor();
  return (
    <div className="space-y-6">
      <PageHeader title="Nueva franja horaria" description="Alta de una franja de tiempo" />
      <Card>
        <CardContent className="pt-6">
          <FranjaForm />
        </CardContent>
      </Card>
    </div>
  );
}
