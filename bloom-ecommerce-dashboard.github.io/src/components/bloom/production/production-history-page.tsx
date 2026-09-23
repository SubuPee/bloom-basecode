import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  History,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Factory,
  Boxes,
  Calendar,
  Building2,
  Loader2,
} from "lucide-react";
import { ProductionShell } from "./production-shell";
import { PageHeader, Pagination, SearchBox } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/lib/bloom-vendor-store";
import { productionApi, ProductionOrder } from "@/lib/production-api";
import { cn } from "@/lib/utils";

export function ProductionHistoryPage() {
  const storeProductions = useVendorStore((s) => s.getProductions());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [liveHistory, setLiveHistory] = useState<ProductionOrder[] | null>(null);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPagesCount, setTotalPagesCount] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productionApi
      .getHistory({
        search: search.trim() || undefined,
        vendorId: vendorFilter,
        page,
        limit: pageSize,
      })
      .then((res) => {
        if (mounted) {
          setLiveHistory(res.data);
          setLiveStats(res.stats);
          setTotalCount(res.pagination.total);
          setTotalPagesCount(res.pagination.pages || 1);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch production history:", err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [search, vendorFilter, page]);

  // History includes all completed, partially completed, or cancelled orders
  const fallbackHistoryOrders = useMemo(() => {
    return storeProductions.filter(
      (p) =>
        p.status === "Completed" ||
        p.status === "Partially Completed" ||
        p.status === "Cancelled"
    );
  }, [storeProductions]);

  const fallbackFilteredHistory = useMemo(() => {
    return fallbackHistoryOrders.filter((p) => {
      const matchSearch =
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.productName.toLowerCase().includes(search.toLowerCase()) ||
        p.variantName.toLowerCase().includes(search.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(search.toLowerCase());

      const matchVendor = vendorFilter === "All" || p.vendorId === vendorFilter;

      return matchSearch && matchVendor;
    });
  }, [fallbackHistoryOrders, search, vendorFilter]);

  const displayHistory = liveHistory !== null ? liveHistory : fallbackFilteredHistory.slice((page - 1) * pageSize, page * pageSize);
  const totalHistoryCount = liveHistory !== null ? totalCount : fallbackFilteredHistory.length;
  const totalPages = liveHistory !== null ? totalPagesCount : (Math.ceil(fallbackFilteredHistory.length / pageSize) || 1);

  const totalCompletedRuns = liveStats?.totalCompleted ?? fallbackHistoryOrders.filter((p) => p.status === "Completed").length;
  const totalInwarded = liveStats?.totalGood ?? fallbackHistoryOrders.reduce((acc, p) => acc + p.goodQuantity, 0);
  const totalScrapped = liveStats?.totalRejected ?? fallbackHistoryOrders.reduce((acc, p) => acc + p.rejectedQuantity, 0);

  const exportCsv = () => {
    const headers = [
      "Order ID",
      "Batch Number",
      "Product",
      "Variant",
      "Vendor",
      "Unit",
      "Planned Qty",
      "Produced Qty",
      "Good Inwarded",
      "QA Rejection",
      "Warehouse",
      "Bin",
      "Completion Date",
      "Created By",
    ];

    const rows = displayHistory.map((p) => [
      p.id,
      p.batchNumber,
      `"${p.productName}"`,
      `"${p.variantName}"`,
      `"${p.vendorName}"`,
      p.unit,
      p.plannedQuantity,
      p.producedQuantity,
      p.goodQuantity,
      p.rejectedQuantity,
      `"${p.warehouseName}"`,
      `"${p.storageLocation}"`,
      p.actualCompletion || p.expectedCompletion,
      `"${p.createdBy}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `production_historical_audit_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProductionShell>
      <div className="space-y-6">
        <PageHeader
          title="Production History & QA Archives"
          description="Archival record of completed manufacturing work orders, quality control yields, and finished goods inwarding."
          actions={
            <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
              <Download className="h-4 w-4" />
              Export History CSV
            </Button>
          }
        />

        {/* Top Historical Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bloom-card p-5 border-l-4 border-emerald-500 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Completed Runs</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalCompletedRuns}</p>
              <p className="text-xs text-muted-foreground mt-1">Successfully closed work orders</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="bloom-card p-5 border-l-4 border-bloom-sage flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Total Good Output</p>
              <p className="text-3xl font-bold text-bloom-sage mt-1">{totalInwarded.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Units added to sellable stock</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-bloom-sage/10 text-bloom-sage flex items-center justify-center">
              <Boxes className="h-6 w-6" />
            </div>
          </div>

          <div className="bloom-card p-5 border-l-4 border-red-500 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">QA Rejections Scrapped</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{totalScrapped.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Defective units quarantined</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bloom-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full md:w-auto">
            <SearchBox
              placeholder="Search history by batch, product, or order ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setPage(1);
              }}
              className="bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
            >
              <option value="All">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.businessName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Work Order</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Product Specification</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4 text-center">Good Units Inwarded</th>
                  <th className="py-3 px-4 text-center">Defects / Scrap</th>
                  <th className="py-3 px-4">Warehouse & Bin</th>
                  <th className="py-3 px-4">Completion Date</th>
                  <th className="py-3 px-4 text-right">View Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground">
                      No historical production orders found.
                    </td>
                  </tr>
                ) : (
                  displayHistory.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-foreground">
                        {order.id}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-foreground">
                        {order.batchNumber}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{order.productName}</p>
                        <p className="text-xs text-muted-foreground">{order.variantName}</p>
                      </td>

                      <td className="py-3 px-4 text-xs font-medium text-muted-foreground">
                        {order.vendorName}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +{order.goodQuantity} {order.unit}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-xs text-rose-600 dark:text-rose-400 font-semibold">
                        {order.rejectedQuantity} {order.unit}
                      </td>

                      <td className="py-3 px-4 text-xs">
                        <p className="font-medium text-foreground">{order.warehouseName}</p>
                        <p className="text-muted-foreground font-mono text-[11px]">{order.storageLocation}</p>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {order.actualCompletion || order.expectedCompletion}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/production/$productionId"
                          params={{ productionId: order.id }}
                        >
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            View Run
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalHistoryCount)} of {totalHistoryCount} orders
              </p>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </ProductionShell>
  );
}
