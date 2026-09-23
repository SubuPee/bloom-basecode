import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShoppingCart,
  PackageSearch,
  UserRound,
  Settings2,
  CreditCard,
  CheckCheck,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { SettingsShell } from "@/components/bloom/settings-shell";
import { PageHeader, SearchBox } from "@/components/bloom/ui";
import { Button } from "@/components/ui/button";
import { settingsApi } from "@/lib/settings-api";
import type { Notification } from "@/lib/bloom-settings";
import { cn } from "@/lib/utils";

const icons = {
  order: ShoppingCart,
  inventory: PackageSearch,
  customer: UserRound,
  system: Settings2,
  payment: CreditCard,
};
const tones: Record<Notification["type"], string> = {
  order: "bg-blue-soft text-blue",
  inventory: "bg-warning-soft text-warning",
  customer: "bg-primary/15 text-primary",
  system: "bg-muted text-muted-foreground",
  payment: "bg-success-soft text-success",
};
const filters = ["All", "Unread", "Orders", "Inventory", "Payments", "System"] as const;

export const Route = createFileRoute("/settings/notifications/")({
  head: () => ({
    meta: [
      { title: "Notifications — Bloom Admin" },
      {
        name: "description",
        content: "All workspace alerts for orders, inventory, payments and security.",
      },
      { property: "og:title", content: "Notifications — Bloom Admin" },
      {
        property: "og:description",
        content: "All workspace alerts for orders, inventory, payments and security.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await settingsApi.listNotifications({
        search: query,
        type: filter === "All" || filter === "Unread" ? undefined : filter,
        read: filter === "Unread" ? "false" : undefined,
      });
      setNotificationsList(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err: any) {
      toast.error(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [query, filter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await settingsApi.markAllRead();
      setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark all as read");
    }
  };

  const handleNotificationClick = (id: string, currentlyRead: boolean) => {
    if (!currentlyRead) {
      settingsApi.toggleNotificationRead(id, true).catch(() => {});
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  return (
    <SettingsShell>
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread of ${notificationsList.length} alerts across your workspace.`}
        action={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck />
            Mark all as read
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchBox
          placeholder="Search notifications"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-10 rounded-full border px-4 text-sm font-medium transition-colors",
                filter === f
                  ? "border-primary bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bloom-card divide-y overflow-hidden">
        {loading && notificationsList.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            Loading notifications…
          </p>
        ) : notificationsList.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No notifications match this filter.
          </p>
        ) : (
          notificationsList.map((n) => {
            const Icon = icons[n.type] || Settings2;
            const isRead = n.read;
            return (
              <Link
                key={n.id}
                to="/settings/notifications/$notificationId"
                params={{ notificationId: n.id }}
                onClick={() => handleNotificationClick(n.id, isRead)}
                className={cn(
                  "flex items-start gap-4 p-5 transition-colors hover:bg-accent/60",
                  !isRead && "bg-primary/[0.06]"
                )}
              >
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-full",
                    tones[n.type] || "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn("text-sm", isRead ? "font-medium" : "font-semibold")}>
                      {n.title}
                    </p>
                    {!isRead && <span className="size-2 rounded-full bg-primary" />}
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        n.priority === "High"
                          ? "bg-destructive/15 text-destructive"
                          : n.priority === "Medium"
                            ? "bg-warning-soft text-warning"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {n.priority}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {n.source} · {n.time}
                  </p>
                </div>
                <ChevronRight className="mt-3 size-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })
        )}
      </div>
    </SettingsShell>
  );
}
