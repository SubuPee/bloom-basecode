import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  ShoppingCart,
  Users,
  PanelsTopLeft,
  CreditCard,
  TicketPercent,
  Store,
  LifeBuoy,
  ArrowUpRight,
  TrendingUp,
  Star,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import { PlatformShell, money } from "@/components/bloom/platform-shell";
import { PageHeader } from "@/components/bloom/ui";
import { Button } from "@/components/ui/button";
import { platformApi, type PlatformOverviewData } from "@/lib/platform-api";
import { transactions as fallbackTransactions, offers as fallbackOffers, reviews as fallbackReviews, supportTickets as fallbackTickets } from "@/lib/bloom-b2c";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/platform/")({
  head: () => ({
    meta: [
      { title: "B2C Control Centre — Bloom Admin" },
      {
        name: "description",
        content:
          "Run the entire Bloom B2C platform — customers, catalog, orders, payments, offers and content — from one dashboard.",
      },
      { property: "og:title", content: "B2C Control Centre — Bloom Admin" },
      {
        property: "og:description",
        content: "Run the entire Bloom B2C platform from one dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ControlCentre,
});

const iconMap: Record<string, any> = {
  IndianRupee,
  ShoppingCart,
  Users,
  TrendingUp,
};

const defaultKpis = [
  {
    label: "Revenue today",
    value: money(184320),
    delta: "+12.4%",
    icon: IndianRupee,
    tone: "bg-success-soft text-success",
  },
  {
    label: "Orders today",
    value: "148",
    delta: "+8.1%",
    icon: ShoppingCart,
    tone: "bg-blue-soft text-blue",
  },
  {
    label: "New B2C users",
    value: "62",
    delta: "+18.9%",
    icon: Users,
    tone: "bg-primary/15 text-primary",
  },
  {
    label: "Conversion",
    value: "3.42%",
    delta: "+0.3pt",
    icon: TrendingUp,
    tone: "bg-warning-soft text-warning",
  },
];

const modules = [
  {
    to: "/customers",
    label: "B2C users",
    desc: "Profiles, segments and lifetime value",
    icon: Users,
    meta: "2,418 shoppers",
  },
  {
    to: "/products",
    label: "Catalog",
    desc: "Products, variants, pricing and stock",
    icon: Package,
    meta: "312 products",
  },
  {
    to: "/orders",
    label: "Orders",
    desc: "Fulfilment, shipping and returns",
    icon: ShoppingCart,
    meta: "148 today",
  },
  {
    to: "/platform/payments",
    label: "Payments",
    desc: "Transactions, refunds and payouts",
    icon: CreditCard,
    meta: "₹3.12L this week",
  },
  {
    to: "/platform/offers",
    label: "Offers",
    desc: "Coupons, discounts and campaigns",
    icon: TicketPercent,
    meta: "4 live offers",
  },
  {
    to: "/cms",
    label: "Content",
    desc: "Banners, pages and storefront sections",
    icon: PanelsTopLeft,
    meta: "9 published",
  },
  {
    to: "/platform/operations",
    label: "Operations",
    desc: "Reviews, support and shipping zones",
    icon: LifeBuoy,
    meta: "3 open tickets",
  },
  {
    to: "/storefront",
    label: "Storefront",
    desc: "Preview what shoppers see",
    icon: Store,
    meta: "bloom.store",
  },
] as const;

function ControlCentre() {
  const [data, setData] = useState<PlatformOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await platformApi.getOverview();
      setData(res);
    } catch {
      // Graceful fallback to static data if unauthenticated or offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const pendingReviews =
    data?.counts?.pendingReviews ??
    fallbackReviews.filter((r) => r.status === "Pending").length;
  const openTickets =
    data?.counts?.openTickets ??
    fallbackTickets.filter((t) => t.status !== "Resolved" && t.status !== "Closed").length;
  const liveOffers =
    data?.counts?.liveOffers ??
    fallbackOffers.filter((o) => o.status === "Active").length;
  const lowStock = data?.counts?.lowStockProducts ?? 6;

  const displayKpis = data?.kpis?.length
    ? data.kpis.map((k) => ({
        label: k.label,
        value: k.value,
        delta: k.delta,
        icon: iconMap[k.iconName] || TrendingUp,
        tone: k.tone,
      }))
    : defaultKpis;

  const txns = data?.recentTransactions?.length ? data.recentTransactions : fallbackTransactions;

  return (
    <PlatformShell>
      <PageHeader
        title="B2C Control Centre"
        description="Every part of your consumer business — users, catalog, orders, payments, offers and content — in one place."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => void loadData()}
              disabled={loading}
              title="Refresh Control Centre metrics"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/storefront">
                Open storefront
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {displayKpis.map(({ label, value, delta, icon: Icon, tone }) => (
          <div key={label} className="bloom-card p-5">
            <div className="flex items-start justify-between">
              <span className={cn("grid size-11 place-items-center rounded-full", tone)}>
                <Icon className="size-5" />
              </span>
              <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
                {delta}
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {modules.map(({ to, label, desc, icon: Icon, meta }) => (
          <Link
            key={to}
            to={to}
            className="bloom-card group flex flex-col gap-3 p-5 transition-colors hover:border-primary/60"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-full bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </div>
            <p className="mt-auto text-xs font-medium text-primary">{meta}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="bloom-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest transactions</h2>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/platform/payments">View all</Link>
            </Button>
          </div>
          <ul className="mt-4 divide-y">
            {txns.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="grid size-9 place-items-center rounded-full bg-muted text-xs font-semibold">
                  {t.method.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{t.customer}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    #{t.order} · {t.date}
                  </p>
                </div>
                <span className="ml-auto text-right">
                  <span className="block font-semibold">{money(t.amount)}</span>
                  <span className="text-xs text-muted-foreground">{t.status}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="bloom-card p-6">
            <h2 className="text-lg font-semibold">Needs your attention</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Star className="size-4" />
                  Reviews awaiting moderation
                </span>
                <Link to="/platform/operations" className="font-semibold text-primary">
                  {pendingReviews}
                </Link>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <LifeBuoy className="size-4" />
                  Open support tickets
                </span>
                <Link to="/platform/operations" className="font-semibold text-primary">
                  {openTickets}
                </Link>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <TicketPercent className="size-4" />
                  Live offers
                </span>
                <Link to="/platform/offers" className="font-semibold text-primary">
                  {liveOffers}
                </Link>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Package className="size-4" />
                  Low stock products
                </span>
                <Link to="/products" className="font-semibold text-primary">
                  {lowStock}
                </Link>
              </li>
            </ul>
          </div>
          <div className="bloom-card p-6">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="mt-4 grid gap-2">
              <Button asChild variant="outline" className="justify-start rounded-full">
                <Link to="/products/new">
                  <Package />
                  Add product
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start rounded-full">
                <Link to="/platform/offers">
                  <TicketPercent />
                  Create offer
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start rounded-full">
                <Link to="/cms">
                  <PanelsTopLeft />
                  Publish content
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}
