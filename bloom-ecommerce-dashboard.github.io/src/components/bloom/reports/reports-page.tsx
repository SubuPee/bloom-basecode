import { useState, useMemo, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  ShoppingCart,
  Boxes,
  Factory,
  Receipt,
  Banknote,
  RotateCcw,
  Building2,
  Package,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ReportsShell } from "./reports-shell";
import { PageHeader, Pagination, SearchBox } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/lib/bloom-vendor-store";
import { reportsApi, ReportsOverviewData } from "@/lib/reports-api";
import { cn } from "@/lib/utils";

export type ReportCategory =
  | "overview"
  | "sales"
  | "orders"
  | "inventory"
  | "production"
  | "transactions"
  | "settlements"
  | "returns";

interface ReportsPageProps {
  category?: ReportCategory;
}

export function ReportsPage({ category = "overview" }: ReportsPageProps) {
  const storeVendors = useVendorStore((s) => s.getVendors());
  const storeOrders = useVendorStore((s) => s.getVendorOrders());
  const storeProducts = useVendorStore((s) => s.getProducts());
  const storeProductions = useVendorStore((s) => s.getProductions());
  const storeTransactions = useVendorStore((s) => s.getTransactions());
  const storeSettlements = useVendorStore((s) => s.getSettlements());
  const storeReturns = useVendorStore((s) => s.getReturns());

  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [dateRange, setDateRange] = useState("30d");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [overviewData, setOverviewData] = useState<ReportsOverviewData | null>(null);
  const [liveItems, setLiveItems] = useState<any[] | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Title & description mapping
  const meta = useMemo(() => {
    switch (category) {
      case "sales":
        return {
          title: "Vendor Sales & Revenue Report",
          description: "Aggregate gross merchant volume, platform commission, and net vendor earnings.",
        };
      case "orders":
        return {
          title: "Vendor Orders & Fulfillment Report",
          description: "Order fulfillment lifecycle, dispatch timelines, and line-item delivery tracking.",
        };
      case "inventory":
        return {
          title: "Inventory Stock Ledger Report",
          description: "Sellable stock valuation, reserved allocation, out-of-stock items, and turnover.",
        };
      case "production":
        return {
          title: "Production Output & QA Report",
          description: "Finished good manufacturing volumes, scrap rates, and lot completion audits.",
        };
      case "transactions":
        return {
          title: "Financial Transactions Ledger",
          description: "Detailed credit and debit transactions across vendor escrow and platform wallets.",
        };
      case "settlements":
        return {
          title: "Vendor Settlements & Payouts Report",
          description: "Weekly settlement tranches, deductions, bank references, and disbursement statuses.",
        };
      case "returns":
        return {
          title: "Customer Returns & Restock Disposition",
          description: "RMA inspection results, return reasons, salvage rates, and refund adjustments.",
        };
      default:
        return {
          title: "Analytics & Executive Reports Center",
          description: "Unified cross-ecosystem analytics, revenue attribution, supply metrics, and CSV exports.",
        };
    }
  }, [category]);

  // Fetch Live Overview KPIs & Active Report Data
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // 1. Fetch overview KPIs
    reportsApi
      .getOverview({ vendorId: vendorFilter, dateRange })
      .then((res) => {
        if (mounted) setOverviewData(res);
      })
      .catch((err) => {
        console.warn("Reports overview error, falling back to local store:", err);
      });

    // 2. Fetch specific domain report
    const query = {
      search: search.trim() || undefined,
      vendorId: vendorFilter !== "All" ? vendorFilter : undefined,
      dateRange,
      page,
      limit: pageSize,
    };

    let fetcher: Promise<any>;
    if (category === "sales" || category === "overview") {
      fetcher = reportsApi.getSalesReport(query);
    } else if (category === "orders") {
      fetcher = reportsApi.getOrdersReport(query);
    } else if (category === "inventory") {
      fetcher = reportsApi.getInventoryReport(query);
    } else if (category === "production") {
      fetcher = reportsApi.getProductionReport(query);
    } else if (category === "transactions") {
      fetcher = reportsApi.getTransactionsReport(query);
    } else if (category === "settlements") {
      fetcher = reportsApi.getSettlementsReport(query);
    } else {
      fetcher = reportsApi.getReturnsReport(query);
    }

    fetcher
      .then((res) => {
        if (mounted) {
          const items = res.data || res.items || [];
          setLiveItems(items);
          setTotalCount(res.pagination?.total || items.length);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn(`Reports ${category} fetch error, using local store:`, err);
        if (mounted) {
          setLiveItems(null);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [category, vendorFilter, dateRange, search, page]);

  // KPI metrics
  const totalSales = overviewData?.kpis?.totalSales ?? storeOrders.reduce((acc, o) => acc + (o.vendorGross || 0), 0);
  const totalCommission = overviewData?.kpis?.totalCommission ?? storeOrders.reduce((acc, o) => acc + (o.commissionAmount || 0), 0);
  const totalOrdersCount = overviewData?.kpis?.totalOrdersCount ?? storeOrders.length;
  const totalInventoryUnits = overviewData?.kpis?.totalInventoryUnits ?? storeProducts.reduce(
    (acc, p) => acc + (p.variants || []).reduce((vAcc, v) => vAcc + (v.availableStock || 0), 0),
    0
  );
  const totalSettledAmount = overviewData?.kpis?.totalSettledAmount ?? storeSettlements
    .filter((s) => s.paymentStatus === "Paid")
    .reduce((acc, s) => acc + (s.netPayable || 0), 0);

  // Dynamic CSV Export via live API
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await reportsApi.exportReport(category, {
        vendorId: vendorFilter !== "All" ? vendorFilter : undefined,
        dateRange,
        search: search.trim() || undefined,
        format: "csv",
      });
      toast.success(`${meta.title} CSV exported successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to export report CSV");
    } finally {
      setExporting(false);
    }
  };

  // Fallback items if liveItems is null
  const displayOrders = liveItems !== null ? liveItems : storeOrders;
  const displayProducts = liveItems !== null ? liveItems : storeProducts.flatMap((p) =>
    p.variants.map((v) => ({
      ...v,
      productName: p.name,
      variantName: v.name,
      vendorName: p.vendorName,
    }))
  );
  const displayProductions = liveItems !== null ? liveItems : storeProductions;
  const displayTransactions = liveItems !== null ? liveItems : storeTransactions;
  const displaySettlements = liveItems !== null ? liveItems : storeSettlements;
  const displayReturns = liveItems !== null ? liveItems : storeReturns;

  const currentTotal = totalCount || (liveItems ? liveItems.length : 10);
  const totalPages = Math.max(1, Math.ceil(currentTotal / pageSize));

  return (
    <ReportsShell>
      <div className="space-y-6">
        <PageHeader
          title={meta.title}
          description={meta.description}
          action={
            <Button
              size="sm"
              onClick={handleExportCsv}
              disabled={exporting}
              className="gap-2 bg-bloom-sage hover:bg-bloom-sage/90 text-white font-medium"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download Report CSV
            </Button>
          }
        />

        {/* Global Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bloom-card p-5 border-l-4 border-bloom-sage">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-muted-foreground">Gross Sales (GMV)</span>
              <div className="w-8 h-8 rounded-full bg-bloom-sage/10 text-bloom-sage flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">₹{totalSales.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Across {totalOrdersCount} orders</p>
          </div>

          <div className="bloom-card p-5 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-muted-foreground">Platform Fees</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2">₹{totalCommission.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Realized platform revenue</p>
          </div>

          <div className="bloom-card p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-muted-foreground">Sellable Stock</span>
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-2">{totalInventoryUnits.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Active inventory units</p>
          </div>

          <div className="bloom-card p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-muted-foreground">Disbursed Payouts</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                <Banknote className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-2">₹{totalSettledAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Successfully wired via NEFT/RTGS</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bloom-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full md:w-auto">
            <SearchBox
              placeholder="Search reports by ID, name, reference, vendor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setPage(1);
              }}
              className="bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
            >
              <option value="All">All Vendors</option>
              {storeVendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.businessName}
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Dynamic Report Table */}
        <div className="bloom-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-bloom-sage" />
              {meta.title} — Tabular Audit Trail
            </h3>
            <span className="text-xs text-muted-foreground">
              {loading ? "Refreshing records..." : `Showing ${currentTotal} verified entries`}
            </span>
          </div>

          <div className="overflow-x-auto">
            {/* Conditional Table Body by Category */}
            {category === "sales" || category === "overview" ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Gross GMV</th>
                    <th className="py-3 px-4 text-right">Commission</th>
                    <th className="py-3 px-4 text-right">Vendor Net</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayOrders.map((o: any, idx: number) => (
                    <tr key={o.id || o.orderNumber || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-foreground">
                        {o.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{o.date}</td>
                      <td className="py-3 px-4 text-xs font-medium text-foreground">{o.vendorName}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{o.customerName}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-xs text-foreground">
                        ₹{(o.vendorGross || o.grossAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-bloom-sage font-semibold">
                        ₹{(o.commissionAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-xs text-emerald-600">
                        ₹{(o.vendorEarnings || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {o.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : category === "orders" ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Items Count</th>
                    <th className="py-3 px-4 text-right">Order Value</th>
                    <th className="py-3 px-4 text-center">Fulfillment</th>
                    <th className="py-3 px-4 text-center">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayOrders.map((o: any, idx: number) => (
                    <tr key={o.id || o.orderNumber || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-foreground">
                        {o.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{o.date}</td>
                      <td className="py-3 px-4 text-xs font-medium text-foreground">{o.vendorName}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {o.itemsCount || o.items?.length || o.totalQuantity || 1} line items
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-xs text-foreground">
                        ₹{(o.vendorGross || o.grossAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {o.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : category === "inventory" ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Product & Variant</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4 text-center">Available Stock</th>
                    <th className="py-3 px-4 text-center">Reserved</th>
                    <th className="py-3 px-4 text-center">Damaged / Quarantine</th>
                    <th className="py-3 px-4 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayProducts.map((v: any, idx: number) => (
                    <tr key={v.id || v.sku || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">
                        {v.productName || v.name} —{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          {v.variantName || v.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{v.sku}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{v.vendorName}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-xs text-emerald-600">
                        {v.availableStock} {v.unitCode || "Units"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-amber-600">
                        {v.reservedStock || 0} {v.unitCode || "Units"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-red-600">
                        {v.damagedStock || 0} {v.unitCode || "Units"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-xs text-foreground">
                        ₹{(v.price || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : category === "production" ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Work Order</th>
                    <th className="py-3 px-4">Batch #</th>
                    <th className="py-3 px-4">Product & Variant</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4 text-center">Planned</th>
                    <th className="py-3 px-4 text-center">Good Inwarded</th>
                    <th className="py-3 px-4 text-center">Rejected QA</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayProductions.map((p: any, idx: number) => (
                    <tr key={p.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-foreground">{p.id}</td>
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-bloom-sage">
                        #{p.batchNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {p.productName} —{" "}
                        <span className="text-xs text-muted-foreground font-normal">{p.variantName}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{p.vendorName}</td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-muted-foreground font-medium">
                        {p.plannedQuantity}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-xs text-emerald-600">
                        {p.goodQuantity}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-red-600">
                        {p.rejectedQuantity}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "text-xs px-2.5 py-0.5 rounded-full font-semibold",
                            p.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : p.status === "In Progress"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                          )}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : category === "transactions" ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Txn ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4 text-center">Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 font-mono">Reference</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayTransactions.map((t: any, idx: number) => (
                    <tr key={t.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-foreground">{t.id}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{t.createdDate}</td>
                      <td className="py-3 px-4 text-xs font-medium text-foreground">{t.vendorName}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-semibold",
                            t.type === "Credit" || t.type === "Payout"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                          )}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-xs text-foreground">
                        ₹{(t.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        {t.referenceId || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : category === "settlements" ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Settlement ID</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4 text-right">Gross Sales</th>
                    <th className="py-3 px-4 text-right">Commission</th>
                    <th className="py-3 px-4 text-right">Net Payable</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displaySettlements.map((st: any, idx: number) => (
                    <tr key={st.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-foreground">{st.id}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{st.settlementPeriod}</td>
                      <td className="py-3 px-4 text-xs font-medium text-foreground">{st.vendorName}</td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-foreground">
                        ₹{(st.totalSales || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-bloom-sage font-semibold">
                        ₹{(st.commission || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-xs text-emerald-600">
                        ₹{(st.netPayable || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {st.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Return ID</th>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4 text-center">Inspection Result</th>
                    <th className="py-3 px-4 text-right">Refund Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayReturns.map((ret: any, idx: number) => (
                    <tr key={ret.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-foreground">{ret.id}</td>
                      <td className="py-3 px-4 font-mono text-xs">{ret.orderNumber}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{ret.productName}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{ret.vendorName}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{ret.reason}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-muted text-muted-foreground">
                          {ret.inspectionResult}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-xs text-foreground">
                        ₹{(ret.refundAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {ret.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages} ({currentTotal} items)
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </ReportsShell>
  );
}
