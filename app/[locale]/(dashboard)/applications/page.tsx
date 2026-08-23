import { ApplicationsDashboard } from "@/components/applications/ApplicationsDashboard";

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold sm:text-2xl">Arizalar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Barcha mijozlarning universitet arizalari va muddatlar
        </p>
      </div>
      <ApplicationsDashboard />
    </div>
  );
}
