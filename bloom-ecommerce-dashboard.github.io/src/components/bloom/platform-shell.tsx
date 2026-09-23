import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid, CreditCard, TicketPercent, LifeBuoy } from "lucide-react";
import { AppShell } from "./app-shell";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/platform", label: "Control centre", icon: LayoutGrid, exact: true },
  { to: "/platform/payments", label: "Payments", icon: CreditCard },
  { to: "/platform/offers", label: "Offers & coupons", icon: TicketPercent },
  { to: "/platform/operations", label: "Operations", icon: LifeBuoy },
] as const;

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto rounded-full border bg-card/60 p-1.5">
          {tabs.map(({ to, label, icon: Icon, ...rest }) => {
            const active =
              "exact" in rest && rest.exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </AppShell>
  );
}

export function money(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
