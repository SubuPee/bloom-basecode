import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plug } from "lucide-react";
import { toast } from "sonner";
import { SettingsShell } from "@/components/bloom/settings-shell";
import { PageHeader } from "@/components/bloom/ui";
import { Button } from "@/components/ui/button";
import { settingsApi, type IntegrationItem } from "@/lib/settings-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Bloom Admin" },
      {
        name: "description",
        content: "Connect payments, logistics, marketing and accounting tools to Bloom.",
      },
      { property: "og:title", content: "Integrations — Bloom Admin" },
      {
        property: "og:description",
        content: "Connect payments, logistics, marketing and accounting tools to Bloom.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const [integrationsList, setIntegrationsList] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadIntegrations() {
      try {
        setLoading(true);
        const data = await settingsApi.listIntegrations();
        setIntegrationsList(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load integrations");
      } finally {
        setLoading(false);
      }
    }
    loadIntegrations();
  }, []);

  const handleToggle = async (item: IntegrationItem) => {
    try {
      setTogglingId(item.id);
      const updated = await settingsApi.toggleIntegration(item.id);
      setIntegrationsList((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: updated.status } : i))
      );
      toast.success(
        updated.status === "Connected"
          ? `${item.name} connected successfully`
          : `${item.name} disconnected`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle integration");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <SettingsShell>
      <PageHeader title="Integrations" description="Services connected to your Bloom workspace." />

      {loading && integrationsList.length === 0 ? (
        <div className="bloom-card p-10 text-center text-sm text-muted-foreground">
          Loading integrations…
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {integrationsList.map((i) => {
            const connected = i.status === "Connected";
            const isProcessing = togglingId === i.id;
            return (
              <div key={i.id || i.name} className="bloom-card flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-primary/15 text-primary">
                    <Plug className="size-5" />
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      connected
                        ? "bg-success-soft text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i.status}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.category} · {i.detail}
                  </p>
                </div>
                <Button
                  variant={connected ? "outline" : "default"}
                  className="mt-auto w-full rounded-full"
                  disabled={isProcessing}
                  onClick={() => handleToggle(i)}
                >
                  {isProcessing
                    ? "Updating…"
                    : connected
                      ? "Disconnect"
                      : "Connect"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </SettingsShell>
  );
}
