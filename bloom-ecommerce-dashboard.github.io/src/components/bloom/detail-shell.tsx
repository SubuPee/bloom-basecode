import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "./app-shell";
import { Button } from "@/components/ui/button";

export function DetailShell({
  backTo,
  backLabel,
  title,
  subtitle,
  actions,
  children,
}: {
  backTo: string;
  backLabel: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className="space-y-6">
        <Button asChild variant="ghost" className="-ml-3 rounded-full">
          <Link to={backTo}>
            <ArrowLeft />
            Back to {backLabel}
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {actions}
        </div>
        {children}
      </div>
    </AppShell>
  );
}

export function InfoBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
