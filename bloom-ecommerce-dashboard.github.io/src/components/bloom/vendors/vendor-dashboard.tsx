import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  UserCheck,
  Package,
  ShoppingCart,
  Receipt,
  Banknote,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { VendorShell } from "./vendor-shell";
import { PageHeader, StatusBadge } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore, vendorStore, type Vendor } from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const salesTrend = [
  { month: "Apr", sales: 240000, commission: 24000, orders: 120 },
  { month: "May", sales: 310000, commission: 31000, orders: 154 },
  { month: "Jun", sales: 285000, commission: 28500, orders: 140 },
  { month: "Jul", sales: 420000, commission: 42000, orders: 210 },
  { month: "Aug", sales: 490000, commission: 49000, orders: 248 },
  { month: "Sep", sales: 580000, commission: 58000, orders: 290 },
];

export function VendorDashboard() {
  useEffect(() => {
    vendorStore.syncFromBackend();
  }, []);

  const vendors = useVendorStore((s) => s.getVendors());
  const products = useVendorStore((s) => s.getProducts());
  const orders = useVendorStore((s) => s.getVendorOrders());
  const settlements = useVendorStore((s) => s.getSettlements());
  const returns = useVendorStore((s) => s.getReturns());
  const productions = useVendorStore((s) => s.getProductions());

  const activeVendors = vendors.filter((v) => v.status === "Approved").length;
  const pendingVendors = vendors.filter((v) => v.status === "Pending" || v.status === "Under Review");
  const totalProducts = products.length;

  let totalAvailableUnits = 0;
  let lowStockCount = 0;
  for (const p of products) {
    for (const v of p.variants) {
      totalAvailableUnits += v.availableStock;
      if (v.availableStock <= v.minStock) lowStockCount++;
    }
  }

  const totalSalesAmount = orders.reduce((sum, o) => sum + o.vendorGross, 0);
  const pendingSettlementAmount = settlements
    .filter((s) => s.paymentStatus !== "Paid")
    .reduce((sum, s) => sum + s.netPayable, 0);

  const pendingReturns = returns.filter((r) => r.status === "Requested" || r.status === "Inspecting").length;
  const activeProductions = productions.filter((p) => p.status === "In Progress" || p.status === "Planned").length;

  const quickStats = [
    {
      title: "Total Vendors",
      value: vendors.length,
      sub: `${activeVendors} active · ${pendingVendors.length} pending`,
      icon: Building2,
      tone: "bg-blue-soft text-blue",
      href: "/vendors/list",
    },
    {
      title: "Active Catalog SKUs",
      value: totalProducts,
      sub: `${totalAvailableUnits.toLocaleString()} units in stock`,
      icon: Package,
      tone: "bg-pink-soft text-pink",
      href: "/vendors/products",
    },
    {
      title: "Gross Vendor Sales",
      value: `₹${(totalSalesAmount / 1000).toFixed(1)}k`,
      sub: `${orders.length} orders fulfilled`,
      icon: ShoppingCart,
      tone: "bg-gold-soft text-gold",
      href: "/vendors/orders",
    },
    {
      title: "Pending Settlements",
      value: `₹${pendingSettlementAmount.toLocaleString("en-IN")}`,
      sub: `${settlements.filter((s) => s.paymentStatus === "Pending").length} awaiting approval`,
      icon: Banknote,
      tone: "bg-orange-soft text-orange",
      href: "/vendors/settlements",
    },
  ];

  return (
    <VendorShell>
      <div className="space-y-7">
        <PageHeader
          title="Vendor Ecosystem"
          description="Supervise vendor onboarding, catalog inventory, order allocations, and automated settlement cycles."
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/vendors/registrations">
                  <UserCheck className="size-4" />
                  Review Registrations ({pendingVendors.length})
                </Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/inventory/add-stock">
                  <Plus className="size-4" />
                  Add Stock
                </Link>
              </Button>
            </div>
          }
        />

        {/* Top Cards */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {quickStats.map(({ title, value, sub, icon: Icon, tone, href }) => (
            <Link
              key={title}
              to={href}
              className="bloom-card bloom-panel-hover group p-5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={cn("grid size-11 place-items-center rounded-2xl", tone)}>
                  <Icon className="size-5" />
                </div>
                <span className="grid size-8 place-items-center rounded-full border bg-card/60 text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
              <p className="mt-5 text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight">{value}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            </Link>
          ))}
        </div>

        {/* Operational Alerts Bar */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bloom-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-orange-soft text-orange">
                <AlertTriangle className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Low Stock Warnings</p>
                <p className="text-base font-semibold">{lowStockCount} Variants</p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
              <Link to="/inventory/low-stock">View</Link>
            </Button>
          </div>

          <div className="bloom-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-pink-soft text-pink">
                <RotateCcw className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Return Inspections</p>
                <p className="text-base font-semibold">{pendingReturns} Requests</p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
              <Link to="/vendors/returns">Inspect</Link>
            </Button>
          </div>

          <div className="bloom-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-blue-soft text-blue">
                <TrendingUp className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Production Batches</p>
                <p className="text-base font-semibold">{activeProductions} In Run</p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
              <Link to="/production">Track</Link>
            </Button>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <div className="bloom-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Vendor Sales & Platform Commission</h3>
                <p className="text-xs text-muted-foreground">
                  Monthly gross sales generated by marketplace vendors vs Bloom 8–15% take-rate.
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
                <TrendingUp className="size-3.5" /> +24.8% vs last quarter
              </span>
            </div>

            <div className="mt-6 h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--pink)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--pink)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface-raised)",
                      borderColor: "var(--border)",
                      borderRadius: "1rem",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Gross Sales"
                    stroke="var(--blue)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="commission"
                    name="Commission Earned"
                    stroke="var(--pink)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#commGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Registrations Quick Action Panel */}
          <div className="bloom-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pending Vendor Approvals</h3>
                <span className="rounded-full bg-orange-soft px-2.5 py-0.5 text-xs font-semibold text-orange">
                  {pendingVendors.length} require action
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Verify business registration, PAN/GST compliance, and bank credentials.
              </p>

              <div className="mt-5 space-y-3">
                {pendingVendors.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-2xl border bg-card/40 p-3.5"
                  >
                    <div>
                      <p className="font-semibold text-sm">{v.businessName}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.city}, {v.state} · {v.businessType}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <Clock className="size-3 text-orange" />
                          KYC: {v.kycStatus}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Button
                        size="sm"
                        className="h-8 rounded-full px-3 text-xs"
                        onClick={() => {
                          vendorStore.updateVendorStatus(v.id, "Approved");
                          toast.success(`${v.businessName} approved successfully`);
                        }}
                      >
                        Approve
                      </Button>
                      <Button asChild variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs">
                        <Link to="/vendors/$vendorId" params={{ vendorId: v.id }}>Review</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button asChild variant="ghost" className="mt-4 w-full rounded-2xl">
              <Link to="/vendors/registrations">
                View All Registrations
                <ArrowUpRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Top Vendors Table */}
        <div className="bloom-card overflow-hidden">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h3 className="text-lg font-semibold">Active Marketplace Partners</h3>
              <p className="text-xs text-muted-foreground">
                Overview of authorized manufacturers, wholesalers, and brands.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full text-xs">
              <Link to="/vendors/list">View Directory</Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Vendor</th>
                  <th className="px-5 py-3.5">Category / Type</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Commission</th>
                  <th className="px-5 py-3.5">KYC Status</th>
                  <th className="px-5 py-3.5">Vendor Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {vendors.slice(0, 5).map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        to="/vendors/$vendorId"
                        params={{ vendorId: vendor.id }}
                        className="font-medium hover:text-primary transition-colors block"
                      >
                        {vendor.businessName}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {vendor.id} · {vendor.city}, {vendor.state}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium">
                        {vendor.businessType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div>{vendor.email}</div>
                      <div className="text-muted-foreground">{vendor.phone}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-sm">
                      {vendor.commissionRate}%
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          vendor.kycStatus === "Verified"
                            ? "bg-success-soft text-success"
                            : vendor.kycStatus === "In Review"
                              ? "bg-orange-soft text-orange"
                              : "bg-destructive/15 text-destructive",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            vendor.kycStatus === "Verified" ? "bg-success" : "bg-orange",
                          )}
                        />
                        {vendor.kycStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={vendor.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button asChild variant="ghost" size="sm" className="rounded-full">
                        <Link to="/vendors/$vendorId" params={{ vendorId: vendor.id }}>View Details</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
