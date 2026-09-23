import { useState, useEffect } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Download,
  IndianRupee,
  ShoppingBag,
  Users,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "./app-shell";
import { PageHeader } from "./ui";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  salesApi,
  SalesOverviewData,
  SalesMetricStat,
  SalesChannel,
  TopProduct,
  CustomerMix,
} from "@/lib/sales-api";

const defaultBars = [38, 52, 45, 68, 56, 72, 61, 84, 76, 92, 78, 96];
const defaultLabels = ["1 Sep", "8 Sep", "15 Sep", "22 Sep", "30 Sep"];

const defaultChannels: SalesChannel[] = [
  { name: "Online store", amount: 842680, formattedAmount: "₹8,42,680", share: "68%", percentage: 68, tone: "bg-blue" },
  { name: "Marketplace", amount: 274190, formattedAmount: "₹2,74,190", share: "22%", percentage: 22, tone: "bg-pink" },
  { name: "Retail POS", amount: 123450, formattedAmount: "₹1,23,450", share: "10%", percentage: 10, tone: "bg-gold" },
];

const defaultTopProducts: TopProduct[] = [
  { rank: 1, name: "Wireless Headphones", unitsSold: 182, soldText: "182 sold", revenue: 1273818, formattedRevenue: "₹12,73,818" },
  { rank: 2, name: "Organic Cotton T-Shirt", unitsSold: 154, soldText: "154 sold", revenue: 200046, formattedRevenue: "₹2,00,046" },
  { rank: 3, name: "Arc Table Lamp", unitsSold: 96, soldText: "96 sold", revenue: 335904, formattedRevenue: "₹3,35,904" },
  { rank: 4, name: "Vitamin C Face Serum", unitsSold: 88, soldText: "88 sold", revenue: 79112, formattedRevenue: "₹79,112" },
];

const defaultCustomerMix: CustomerMix = {
  totalCustomers: "4,208",
  rawTotal: 4208,
  returning: { count: 2693, percentage: 64, label: "Returning 64%", tone: "bg-blue" },
  new: { count: 1515, percentage: 36, label: "New 36%", tone: "bg-pink" },
};

const defaultStats: SalesMetricStat[] = [
  {
    id: "gross_sales",
    label: "Gross sales",
    value: "₹12.4L",
    rawAmount: 1240000,
    trend: "18.4%",
    up: true,
    tone: "bg-blue-soft text-blue",
    detail: "vs previous month",
  },
  {
    id: "net_revenue",
    label: "Net revenue",
    value: "₹10.8L",
    rawAmount: 1080000,
    trend: "15.2%",
    up: true,
    tone: "bg-success-soft text-success",
    detail: "vs previous month",
  },
  {
    id: "orders",
    label: "Orders",
    value: "1,842",
    rawAmount: 1842,
    trend: "12.1%",
    up: true,
    tone: "bg-orange-soft text-orange",
    detail: "vs previous month",
  },
  {
    id: "avg_order_value",
    label: "Avg. order value",
    value: "₹674",
    rawAmount: 674,
    trend: "2.8%",
    up: false,
    tone: "bg-pink-soft text-pink",
    detail: "vs previous month",
  },
];

const PERIOD_LABELS: Record<string, string> = {
  this_month: "This month",
  this_week: "This week",
  last_month: "Last month",
  this_quarter: "This quarter",
  this_year: "This year",
  all_time: "All time",
};

export function SalesPage() {
  const [period, setPeriod] = useState<string>("this_month");
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [salesData, setSalesData] = useState<SalesOverviewData | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    salesApi
      .getOverview(period)
      .then((data) => {
        if (mounted) {
          setSalesData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch live sales overview, using defaults:", err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [period]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await salesApi.exportReport("csv");
      toast.success("Sales report CSV exported successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to export sales report");
    } finally {
      setExporting(false);
    }
  };

  const stats = salesData?.stats || defaultStats;
  const bars = salesData?.revenueOverview?.bars || defaultBars;
  const points = salesData?.revenueOverview?.points || [];
  const labels = salesData?.revenueOverview?.labels || defaultLabels;
  const channels = salesData?.channels || defaultChannels;
  const topProducts = salesData?.topProducts || defaultTopProducts;
  const customerMix = salesData?.customerMix || defaultCustomerMix;

  const getStatIcon = (id: string, label: string) => {
    if (id.includes("gross") || label.includes("Gross")) return IndianRupee;
    if (id.includes("net") || label.includes("Net")) return CreditCard;
    if (id.includes("order_value") || label.includes("Avg")) return Users;
    if (id.includes("orders") || label.includes("Orders")) return ShoppingBag;
    return IndianRupee;
  };

  return (
    <AppShell>
      <div className="space-y-7">
        <PageHeader
          title="Sales"
          description="Revenue, orders and customer performance at a glance."
          action={
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 rounded-full gap-2 font-medium">
                    <CalendarDays className="size-4" />
                    {PERIOD_LABELS[period] || "This month"}
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setPeriod(key)}
                      className={cn(period === key && "bg-muted font-semibold text-primary")}
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={handleExport}
                disabled={exporting}
                className="h-11 rounded-full gap-2 bg-primary font-medium"
              >
                {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Export report
              </Button>
            </div>
          }
        />

        {/* Top 4 Financial KPI Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = getStatIcon(stat.id, stat.label);
            return (
              <div key={stat.label} className="bloom-card bloom-panel-hover p-5">
                <div className="flex items-start justify-between">
                  <span className={cn("grid size-11 place-items-center rounded-full", stat.tone)}>
                    <Icon className="size-5" />
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                      stat.up ? "bg-success-soft text-success" : "bg-pink-soft text-pink"
                    )}
                  >
                    {stat.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    {stat.trend}
                  </span>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{stat.value}</p>
                <p className="mt-3 text-xs text-muted-foreground">{stat.detail || "vs previous month"}</p>
              </div>
            );
          })}
        </div>

        {/* Daily Revenue Overview & Sales By Channel */}
        <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
          <section className="bloom-card p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {salesData?.revenueOverview?.title || "Revenue overview"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {salesData?.revenueOverview?.subtitle || "Daily sales performance for September"}
              </p>
            </div>
            <div className="mt-8 flex h-64 items-end gap-2 border-b border-l px-3 pt-4 sm:gap-4">
              {bars.map((height, index) => {
                const point = points[index];
                const displayTooltip = point?.formattedAmount || `₹${height}k`;
                return (
                  <div key={index} className="group flex h-full flex-1 items-end">
                    <div
                      className="relative w-full rounded-t-md bg-blue transition hover:bg-pink cursor-pointer"
                      style={{ height: `${Math.min(100, Math.max(8, height))}%` }}
                    >
                      <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-popover px-2 py-1 text-[10px] group-hover:block whitespace-nowrap shadow border font-mono">
                        {displayTooltip}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex justify-between pl-3 text-[10px] text-muted-foreground">
              {labels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </section>

          <section className="bloom-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Sales by channel</h2>
            <p className="mt-1 text-xs text-muted-foreground">Revenue contribution</p>
            <div className="mt-8 space-y-7">
              {channels.map((channel) => (
                <div key={channel.name}>
                  <div className="mb-2 flex items-end justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{channel.name}</p>
                      <p className="text-lg font-semibold font-mono text-foreground">{channel.formattedAmount}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{channel.share}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", channel.tone)}
                      style={{ width: `${Math.min(100, Math.max(5, channel.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Top Products & Customer Mix */}
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <section className="bloom-card overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-foreground">Top products</h2>
              <p className="mt-1 text-xs text-muted-foreground">Best sellers by revenue</p>
            </div>
            {topProducts.map((p, index) => (
              <div
                key={p.name}
                className="grid grid-cols-[32px_1fr_auto] items-center gap-3 border-t px-6 py-4 transition hover:bg-muted/30"
              >
                <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  {p.rank || index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.soldText}</p>
                </div>
                <strong className="text-sm font-mono text-foreground">{p.formattedRevenue}</strong>
              </div>
            ))}
          </section>

          <section className="bloom-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Customer mix</h2>
            <p className="mt-1 text-xs text-muted-foreground">New and returning customers</p>
            <div className="mx-auto mt-8 grid size-48 place-items-center rounded-full bloom-sales-donut">
              <div className="grid size-32 place-items-center rounded-full bg-card text-center shadow-inner">
                <div>
                  <strong className="text-3xl font-bold text-foreground">{customerMix.totalCustomers}</strong>
                  <p className="text-xs text-muted-foreground">Customers</p>
                </div>
              </div>
            </div>
            <div className="mt-7 flex justify-center gap-5 text-xs">
              <span className="flex items-center">
                <i className="mr-2 inline-block size-2 rounded-full bg-blue" />
                {customerMix.returning?.label || "Returning 64%"}
              </span>
              <span className="flex items-center">
                <i className="mr-2 inline-block size-2 rounded-full bg-pink" />
                {customerMix.new?.label || "New 36%"}
              </span>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
