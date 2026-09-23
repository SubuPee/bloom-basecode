import { Link, useLocation } from "@tanstack/react-router";
import {
  Store,
  UserCheck,
  Building2,
  Package,
  ShoppingCart,
  Receipt,
  CreditCard,
  Banknote,
  RotateCcw,
  TrendingUp,
  History,
} from "lucide-react";
import { AppShell } from "../app-shell";
import { cn } from "@/lib/utils";
import { useVendorStore } from "@/lib/bloom-vendor-store";

const tabs = [
  { to: "/vendors", label: "Dashboard", icon: Store, exact: true },
  { to: "/vendors/registrations", label: "Registrations", icon: UserCheck },
  { to: "/vendors/list", label: "All Vendors", icon: Building2 },
  { to: "/vendors/products", label: "Products", icon: Package },
  { to: "/vendors/orders", label: "Orders", icon: ShoppingCart },
  { to: "/vendors/transactions", label: "Transactions", icon: Receipt },
  { to: "/vendors/payments", label: "Payments", icon: CreditCard },
  { to: "/vendors/settlements", label: "Settlements", icon: Banknote },
  { to: "/vendors/returns", label: "Returns", icon: RotateCcw },
  { to: "/vendors/performance", label: "Performance", icon: TrendingUp },
  { to: "/vendors/activity", label: "Activity Logs", icon: History },
] as const;

export function VendorShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const pendingCount = useVendorStore(
    (s) => s.getVendors().filter((v) => v.status === "Pending" || v.status === "Under Review").length,
  );

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
                {label === "Registrations" && pendingCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-orange-soft text-[10px] font-bold text-orange">
                    {pendingCount}
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
