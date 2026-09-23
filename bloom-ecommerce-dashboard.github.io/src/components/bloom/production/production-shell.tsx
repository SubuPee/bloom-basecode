import { useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Factory, ListOrdered, PlusCircle, Boxes, History } from "lucide-react";
import { AppShell } from "../app-shell";
import { cn } from "@/lib/utils";
import { useVendorStore } from "@/lib/bloom-vendor-store";
import { productionApi } from "@/lib/production-api";

const tabs = [
  { to: "/production", label: "Dashboard", icon: Factory, exact: true },
  { to: "/production/list", label: "Production Orders", icon: ListOrdered },
  { to: "/production/new", label: "Create Production", icon: PlusCircle },
  { to: "/production/batches", label: "Production Batches", icon: Boxes },
  { to: "/production/history", label: "Production History", icon: History },
] as const;

export function ProductionShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const storeCount = useVendorStore(
    (s) => s.getProductions().filter((p) => p.status === "In Progress" || p.status === "Planned").length,
  );
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    productionApi
      .getOverview()
      .then((ov) => {
        if (mounted && typeof ov.activeOrdersCount === "number") {
          setLiveCount(ov.activeOrdersCount);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const inProgressCount = liveCount !== null ? liveCount : storeCount;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex gap-1.5 overflow-x-auto rounded-full border bg-card/70 p-1.5 no-scrollbar">
          {tabs.map(({ to, label, icon: Icon, ...rest }) => {
            const active =
              "exact" in rest && rest.exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span>{label}</span>
                {label === "Production Orders" && inProgressCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-blue-soft text-[10px] font-bold text-blue">
                    {inProgressCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </AppShell>
  );
}
