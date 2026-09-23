import { useState, useEffect } from "react";
import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Archive, BellOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { SettingsShell } from "@/components/bloom/settings-shell";
import { InfoBlock } from "@/components/bloom/detail-shell";
import { Button } from "@/components/ui/button";
import { settingsApi } from "@/lib/settings-api";
import type { Notification } from "@/lib/bloom-settings";

export const Route = createFileRoute("/settings/notifications/$notificationId")({
  head: () => ({
    meta: [
      { title: "Notification detail — Bloom Admin" },
      { name: "description", content: "Full context for a Bloom workspace notification." },
      { property: "og:title", content: "Notification detail — Bloom Admin" },
      { property: "og:description", content: "Full context for a Bloom workspace notification." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationDetail,
});

function NotificationDetail() {
  const { notificationId } = useParams({ from: "/settings/notifications/$notificationId" });
  const navigate = useNavigate();
  const [item, setItem] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const data = await settingsApi.getNotification(notificationId);
        setItem(data);
      } catch (err: any) {
        console.error("Failed to load notification", err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [notificationId]);

  const handleArchive = async () => {
    if (!item) return;
    try {
      setArchiving(true);
      await settingsApi.deleteNotification(item.id);
      toast.success("Notification archived");
      navigate({ to: "/settings/notifications" });
    } catch (err: any) {
      toast.error(err.message || "Failed to archive notification");
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <SettingsShell>
        <div className="bloom-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Loading notification details…</p>
        </div>
      </SettingsShell>
    );
  }

  if (!item) {
    return (
      <SettingsShell>
        <div className="bloom-card p-10 text-center">
          <p className="text-sm text-muted-foreground">This notification no longer exists.</p>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/settings/notifications">Back to notifications</Link>
          </Button>
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell>
      <Button asChild variant="ghost" className="-ml-3 rounded-full">
        <Link to="/settings/notifications">
          <ArrowLeft />
          Back to notifications
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {item.id} · {item.source}
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{item.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{item.date}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => toast.info(`Muted alerts from ${item.source}`)}
          >
            <BellOff />
            Mute this type
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleArchive}
            disabled={archiving}
          >
            <Archive />
            {archiving ? "Archiving…" : "Archive"}
          </Button>
          {item.link && (
            <Button asChild className="rounded-full">
              <Link to={item.link.to}>
                {item.link.label}
                <ExternalLink />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="bloom-card p-6">
          <h2 className="text-lg font-semibold">Summary</h2>
          <p className="mt-3 text-sm text-muted-foreground">{item.body}</p>
          <p className="mt-4 text-sm leading-relaxed">{item.detail}</p>
        </div>
        <div className="bloom-card p-6">
          <h2 className="text-lg font-semibold">Details</h2>
          <dl className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <InfoBlock label="Priority" value={item.priority} />
            <InfoBlock label="Category" value={item.source} />
            <InfoBlock label="Triggered by" value={item.actor} />
            <InfoBlock label="Received" value={`${item.date} (${item.time})`} />
            <InfoBlock label="Status" value={item.read ? "Read" : "Unread"} />
          </dl>
        </div>
      </div>
    </SettingsShell>
  );
}
