import { Link, useLocation } from "@tanstack/react-router";
import { User, Bell, SlidersHorizontal, Users, ShieldCheck, Plug } from "lucide-react";
import { AppShell } from "./app-shell";
import { cn } from "@/lib/utils";
import { notifications } from "@/lib/bloom-settings";

const items = [
  { to: "/settings", label: "Profile", icon: User, exact: true },
  { to: "/settings/notifications", label: "Notifications", icon: Bell },
  { to: "/settings/preferences", label: "Settings", icon: SlidersHorizontal },
  { to: "/settings/users", label: "Users", icon: Users },
  { to: "/settings/roles", label: "Roles & Permissions", icon: ShieldCheck },
  { to: "/settings/integrations", label: "Integrations", icon: Plug },
] as const;

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <AppShell>
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Settings
          </p>
          <nav className="mt-4 space-y-1">
            {items.map(({ to, label, icon: Icon, ...rest }) => {
              const active =
                "exact" in rest && rest.exact ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/15 text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {active && (
                    <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary" />
                  )}
                  <Icon className={cn("size-5 shrink-0", active && "text-primary")} />
                  <span className="truncate">{label}</span>
                  {label === "Notifications" && unread > 0 && (
                    <span className="ml-auto grid h-6 min-w-6 place-items-center rounded-full bg-destructive px-2 text-xs font-semibold text-destructive-foreground">
                      {unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </AppShell>
  );
}
