import { Link, useLocation } from "@tanstack/react-router";
import {
  Boxes,
  Layers,
  PlusCircle,
  SlidersHorizontal,
  ArrowLeftRight,
  AlertTriangle,
  PackageX,
  Send,
  History,
} from "lucide-react";
import { AppShell } from "../app-shell";
import { cn } from "@/lib/utils";
import { useVendorStore } from "@/lib/bloom-vendor-store";

const tabs = [
  { to: "/inventory", label: "Overview", icon: Boxes, exact: true },
  { to: "/inventory/stock", label: "Product Stock", icon: Layers },
  { to: "/inventory/add-stock", label: "Add Stock", icon: PlusCircle },
  { to: "/inventory/adjustment", label: "Adjustment", icon: SlidersHorizontal },
  { to: "/inventory/movements", label: "Movements", icon: ArrowLeftRight },
  { to: "/inventory/low-stock", label: "Low Stock", icon: AlertTriangle },
  { to: "/inventory/out-of-stock", label: "Out of Stock", icon: PackageX },
  { to: "/inventory/transfer", label: "Stock Transfer", icon: Send },
  { to: "/inventory/history", label: "Stock History", icon: History },
] as const;

export function InventoryShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const lowCount = useVendorStore((s) => {
    let count = 0;
    for (const p of s.getProducts()) {
      for (const v of p.variants) {
        if (v.availableStock <= v.minStock && v.availableStock > 0) count++;
      }
    }
    return count;
  });

  const outCount = useVendorStore((s) => {
    let count = 0;
    for (const p of s.getProducts()) {
      for (const v of p.variants) {
        if (v.availableStock === 0) count++;
      }
    }
    return count;
  });

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
                {label === "Low Stock" && lowCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-orange-soft text-[10px] font-bold text-orange">
                    {lowCount}
                  </span>
                )}
                {label === "Out of Stock" && outCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-destructive/15 text-[10px] font-bold text-destructive">
                    {outCount}
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
