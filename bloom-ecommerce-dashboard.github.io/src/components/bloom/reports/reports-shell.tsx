import { Link, useLocation } from "@tanstack/react-router";
import {
  FileSpreadsheet,
  TrendingUp,
  ShoppingCart,
  Boxes,
  Factory,
  Receipt,
  Banknote,
  RotateCcw,
} from "lucide-react";
import { AppShell } from "../app-shell";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/reports", label: "Overview", icon: FileSpreadsheet, exact: true },
  { to: "/reports/sales", label: "Vendor Sales", icon: TrendingUp },
  { to: "/reports/orders", label: "Vendor Orders", icon: ShoppingCart },
  { to: "/reports/inventory", label: "Inventory Report", icon: Boxes },
  { to: "/reports/production", label: "Production Report", icon: Factory },
  { to: "/reports/transactions", label: "Transactions", icon: Receipt },
  { to: "/reports/settlements", label: "Settlements", icon: Banknote },
  { to: "/reports/returns", label: "Returns Report", icon: RotateCcw },
] as const;

export function ReportsShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

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
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </AppShell>
  );
}
