import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import type { ElementType } from "react";
import {
  Package,
  Tags,
  TriangleAlert,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
  BadgePercent,
  Expand,
  ChevronDown,
  Check,
  UserRound,
  Loader2,
} from "lucide-react";
import { AppShell } from "./app-shell";
import { PageHeader, StatusBadge } from "./ui";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-context";
import { cn } from "@/lib/utils";
import { imageForProduct } from "@/lib/product-images";
import {
  dashboardApi,
  DashboardOverviewData,
  DashboardStat,
  CategorySplitItem,
  RecentProduct,
} from "@/lib/dashboard-api";

const initialStats = [
  {
    label: "Total Products",
    value: "2,486",
    trend: "12.5%",
    Icon: Package,
    up: true,
    tone: "bg-blue-soft text-blue",
  },
  {
    label: "Active Categories",
    value: "64",
    trend: "4.2%",
    Icon: Tags,
    up: true,
    tone: "bg-pink-soft text-pink",
  },
  {
    label: "Low Stock Alerts",
    value: "18",
    trend: "8.1%",
    Icon: TriangleAlert,
    up: false,
    tone: "bg-orange-soft text-orange",
  },
  {
    label: "Total Warehouses",
    value: "8",
    trend: "2.0%",
    Icon: Warehouse,
    up: true,
    tone: "bg-gold-soft text-gold",
  },
];

const fallbackCategories = [
  { name: "Electronics", count: 92, percentage: 92, tone: "bg-blue" },
  { name: "Apparel", count: 74, percentage: 74, tone: "bg-pink" },
  { name: "Home & Kitchen", count: 61, percentage: 61, tone: "bg-orange" },
  { name: "Beauty", count: 48, percentage: 48, tone: "bg-success" },
  { name: "Sports", count: 38, percentage: 38, tone: "bg-gold" },
  { name: "Books", count: 29, percentage: 29, tone: "bg-blue" },
];

const fallbackRecent: RecentProduct[] = [
  {
    id: "1",
    code: "WH-1001",
    name: "Wireless Headphones",
    category: "Electronics",
    price: "₹6,999",
    rawPrice: 6999,
    status: "Active",
    image: "",
  },
  {
    id: "2",
    code: "TS-2041",
    name: "Organic Cotton T-Shirt",
    category: "Apparel",
    price: "₹1,299",
    rawPrice: 1299,
    status: "Active",
    image: "",
  },
  {
    id: "3",
    code: "LM-3010",
    name: "Arc Table Lamp",
    category: "Home goods",
    price: "₹3,499",
    rawPrice: 3499,
    status: "Active",
    image: "",
  },
  {
    id: "4",
    code: "CK-7008",
    name: "Ceramic Cookware Set",
    category: "Kitchen",
    price: "₹8,999",
    rawPrice: 8999,
    status: "Active",
    image: "",
  },
];

function getStatIcon(label: string): ElementType {
  if (label.includes("Product")) return Package;
  if (label.includes("Categor")) return Tags;
  if (label.includes("Stock")) return TriangleAlert;
  if (label.includes("Warehouse")) return Warehouse;
  return Package;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverviewData | null>(null);

  useEffect(() => {
    let mounted = true;
    dashboardApi
      .getOverview()
      .then((data) => {
        if (mounted) {
          setOverview(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Dashboard overview live fetch error, using defaults:", err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const actions: Array<{
    label: string;
    to: "/products/new" | "/categories" | "/brands" | "/warehouses";
    icon: ElementType;
    tone: string;
  }> = [
    { label: "Add Product", to: "/products/new", icon: Package, tone: "bg-blue-soft text-blue" },
    { label: "Add Category", to: "/categories", icon: Tags, tone: "bg-pink-soft text-pink" },
    { label: "Add Brand", to: "/brands", icon: BadgePercent, tone: "bg-orange-soft text-orange" },
    { label: "Add Warehouse", to: "/warehouses", icon: Warehouse, tone: "bg-gold-soft text-gold" },
  ];

  // Derive stats with live data or fallback
  const renderedStats = overview?.stats?.length
    ? overview.stats.map((s) => ({
        label: s.label,
        value: s.value,
        trend: s.trend,
        Icon: getStatIcon(s.label),
        up: s.up,
        tone: s.tone || "bg-blue-soft text-blue",
      }))
    : initialStats;

  // Categories
  const categories: CategorySplitItem[] =
    overview?.productsByCategory && overview.productsByCategory.length > 0
      ? overview.productsByCategory
      : fallbackCategories;

  // Status Split
  const statusSplit = overview?.statusSplit || {
    total: 2486,
    active: 2140,
    inactive: 246,
    draft: 100,
  };

  // Recent products
  const recentProducts: RecentProduct[] =
    overview?.recentProducts && overview.recentProducts.length > 0
      ? overview.recentProducts
      : fallbackRecent;

  // Orders summary
  const ordersSummary = overview?.ordersSummary || {
    totalOrders: 1842,
    awaitingConfirmation: 12,
  };

  return (
    <AppShell>
      <div className="space-y-7">
        <PageHeader
          title="Dashboard"
          description={`Welcome back, ${user?.name || "Alex Morgan"} — here's what's happening today.`}
          action={
            <button className="flex h-11 items-center gap-3 rounded-full border bg-card px-4 text-sm font-medium transition hover:bg-muted/30">
              This month <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          }
        />

        {/* Top 4 KPI Metrics */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {renderedStats.map(({ label, value, trend, Icon, up, tone }) => (
            <div className="bloom-card bloom-panel-hover p-5" key={label}>
              <div className="flex items-start justify-between">
                <div className={cn("grid size-11 place-items-center rounded-full", tone)}>
                  <Icon className="size-5" />
                </div>
                <Button variant="ghost" size="icon" className="bloom-icon-button size-8">
                  <Expand />
                </Button>
              </div>
              <p className="mt-7 text-sm text-muted-foreground">{label}</p>
              <p
                className={cn(
                  "mt-2 text-4xl font-semibold",
                  label.includes("Low") && "text-orange"
                )}
              >
                {value}
              </p>
              <div className="mt-5 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                    up ? "bg-success-soft text-success" : "bg-pink-soft text-pink"
                  )}
                >
                  {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {trend}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Category Split & Status Donut */}
        <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
          {/* Products by Category */}
          <div className="bloom-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Products by Category</h2>
                <p className="mt-1 text-xs text-muted-foreground">Top categories by catalog size</p>
              </div>
              <Button variant="ghost" size="icon" className="bloom-icon-button">
                <Expand />
              </Button>
            </div>
            <div className="mt-7 space-y-5">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="grid grid-cols-[120px_1fr_35px] items-center gap-3 text-sm"
                >
                  <span className="truncate font-medium">{cat.name}</span>
                  <div className="h-2.5 rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", cat.tone || "bg-blue")}
                      style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }}
                    />
                  </div>
                  <span className="text-right text-xs text-muted-foreground font-mono">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Status Split */}
          <div className="bloom-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Product Status Split</h2>
              <Button variant="ghost" size="icon" className="bloom-icon-button">
                <Expand />
              </Button>
            </div>
            <div className="mt-7 grid place-items-center">
              <div className="bloom-donut relative grid size-48 place-items-center rounded-full">
                <div className="grid size-32 place-items-center rounded-full bg-card text-center shadow-inner">
                  <div>
                    <strong className="text-3xl font-bold">
                      {statusSplit.total.toLocaleString("en-IN")}
                    </strong>
                    <p className="text-xs text-muted-foreground">Total products</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-2 text-center text-xs">
              <span>
                <i className="mr-1 inline-block size-2 rounded-full bg-blue" />
                Active ({statusSplit.active.toLocaleString("en-IN")})
              </span>
              <span>
                <i className="mr-1 inline-block size-2 rounded-full bg-orange" />
                Inactive ({statusSplit.inactive.toLocaleString("en-IN")})
              </span>
              <span>
                <i className="mr-1 inline-block size-2 rounded-full bg-pink" />
                Draft ({statusSplit.draft.toLocaleString("en-IN")})
              </span>
            </div>
          </div>
        </div>

        {/* Recently Added Products & Quick Actions */}
        <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
          <div className="bloom-card overflow-hidden">
            <div className="flex items-center justify-between p-6">
              <div>
                <h2 className="text-lg font-semibold">Recently Added Products</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Latest additions to your catalog
                </p>
              </div>
              <Link to="/products" className="text-sm font-medium text-blue hover:underline">
                View all
              </Link>
            </div>
            {recentProducts.map((prod, index) => (
              <div
                key={prod.id || prod.code || prod.name}
                className="group grid grid-cols-[48px_1fr_auto_auto] items-center gap-3 border-t p-4 text-sm transition hover:bg-muted/40"
              >
                <img
                  src={prod.image || imageForProduct(prod.code, index)}
                  alt=""
                  width={816}
                  height={816}
                  loading="lazy"
                  className="size-11 rounded-xl object-cover bg-muted/20"
                />
                <div>
                  <p className="font-medium text-foreground">{prod.name}</p>
                  <p className="text-xs text-muted-foreground">{prod.category}</p>
                </div>
                <span className="hidden font-medium sm:block text-foreground">{prod.price}</span>
                <StatusBadge status={prod.status || "Active"} />
              </div>
            ))}
          </div>

          <div className="bloom-card p-6">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <p className="mt-1 text-xs text-muted-foreground">Common catalog workflows</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {actions.map(({ label, to, icon: Icon, tone }) => (
                <Button
                  asChild
                  variant="outline"
                  className="h-28 flex-col rounded-2xl border-border bg-muted/20 hover:bg-muted/60"
                  key={label}
                >
                  <Link to={to}>
                    <span className={cn("grid size-10 place-items-center rounded-full", tone)}>
                      <Icon className="size-5" />
                    </span>
                    <span>{label}</span>
                  </Link>
                </Button>
              ))}
            </div>

            <Link to="/orders" className="block">
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-success-soft p-4 transition hover:bg-success-soft/80">
                <span className="grid size-10 place-items-center rounded-full bg-success text-primary-foreground">
                  <Check />
                </span>
                <div>
                  <p className="text-2xl font-semibold">
                    {ordersSummary.totalOrders.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-success">
                      {ordersSummary.awaitingConfirmation} orders
                    </strong>{" "}
                    await confirmation
                  </p>
                </div>
                <UserRound className="ml-auto text-success" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
