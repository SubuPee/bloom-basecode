import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Factory,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Building2,
  Package,
  Loader2,
} from "lucide-react";
import { ProductionShell } from "./production-shell";
import { PageHeader } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/lib/bloom-vendor-store";
import { productionApi, ProductionOverviewData, ProductionOrder, ProductionBatchItem } from "@/lib/production-api";
import { cn } from "@/lib/utils";

export function ProductionDashboard() {
  const storeProductions = useVendorStore((s) => s.getProductions());
  const storeBatches = useVendorStore((s) => s.getBatches());

  const [liveOverview, setLiveOverview] = useState<ProductionOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    productionApi
      .getOverview()
      .then((data) => {
        if (mounted) {
          setLiveOverview(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load production overview:", err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (liveOverview) {
      const active = liveOverview.activeOrdersCount || 0;
      const completed = liveOverview.completedOrdersCount || 0;
      const totalProducedUnits = liveOverview.totalProduced || 0;
      const totalGoodUnits = liveOverview.totalGood || 0;
      const totalRejectedUnits = liveOverview.totalRejected || 0;
      const yieldRate = liveOverview.yieldPercentage ? String(liveOverview.yieldPercentage) : "98.5";
      const rejectionRate =
        totalProducedUnits > 0
          ? ((totalRejectedUnits / totalProducedUnits) * 100).toFixed(1)
          : "1.5";

      const inProgress = liveOverview.activeOrders.filter((o) => o.status === "In Progress").length;
      const planned = liveOverview.activeOrders.filter((o) => o.status === "Planned").length;

      return {
        totalOrders: liveOverview.totalOrders,
        inProgress,
        planned,
        completed,
        totalGoodUnits,
        totalRejectedUnits,
        yieldRate,
        rejectionRate,
      };
    }

    const totalOrders = storeProductions.length;
    const inProgress = storeProductions.filter((p) => p.status === "In Progress").length;
    const planned = storeProductions.filter((p) => p.status === "Planned").length;
    const completed = storeProductions.filter((p) => p.status === "Completed").length;

    const totalProducedUnits = storeProductions.reduce((acc, p) => acc + p.producedQuantity, 0);
    const totalGoodUnits = storeProductions.reduce((acc, p) => acc + p.goodQuantity, 0);
    const totalRejectedUnits = storeProductions.reduce((acc, p) => acc + p.rejectedQuantity, 0);

    const yieldRate =
      totalProducedUnits > 0
        ? ((totalGoodUnits / totalProducedUnits) * 100).toFixed(1)
        : "98.5";

    const rejectionRate =
      totalProducedUnits > 0
        ? ((totalRejectedUnits / totalProducedUnits) * 100).toFixed(1)
        : "1.5";

    return {
      totalOrders,
      inProgress,
      planned,
      completed,
      totalGoodUnits,
      totalRejectedUnits,
      yieldRate,
      rejectionRate,
    };
  }, [liveOverview, storeProductions]);

  const activeOrders = useMemo(() => {
    if (liveOverview) return liveOverview.activeOrders;
    return storeProductions.filter(
      (p) => p.status === "In Progress" || p.status === "Planned" || p.status === "Partially Completed"
    );
  }, [liveOverview, storeProductions]);

  const recentBatches = useMemo(() => {
    if (liveOverview && liveOverview.recentBatches.length > 0) return liveOverview.recentBatches;
    return storeBatches.slice(0, 5);
  }, [liveOverview, storeBatches]);

  return (
    <ProductionShell>
      <div className="space-y-6">
        <PageHeader
          title="Production Management"
          description="Real-time supervision of manufacturing work orders, quality control yield rates, batch tracing, and finished goods inwarding."
          actions={
            <Link to="/production/new">
              <Button size="sm" className="gap-2 bg-bloom-sage hover:bg-bloom-sage/90 text-white font-medium">
                <Plus className="h-4 w-4" />
                Create Production Run
              </Button>
            </Link>
          }
        />

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bloom-card p-5 border-l-4 border-indigo-500 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Active Work Orders</p>
              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                <Factory className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-foreground">{stats.inProgress + stats.planned}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold text-blue-600">{stats.inProgress} in progress</span> • {stats.planned} scheduled
              </p>
            </div>
          </div>

          <div className="bloom-card p-5 border-l-4 border-emerald-500 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Quality Yield Rate</p>
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-emerald-600">{stats.yieldRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalGoodUnits.toLocaleString()} good finished units
              </p>
            </div>
          </div>

          <div className="bloom-card p-5 border-l-4 border-amber-500 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Scrap / Rejection Rate</p>
              <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-amber-600">{stats.rejectionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalRejectedUnits} units rejected in QA
              </p>
            </div>
          </div>

          <div className="bloom-card p-5 border-l-4 border-bloom-sage flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Completed Batches</p>
              <div className="w-8 h-8 rounded-full bg-bloom-sage/10 text-bloom-sage flex items-center justify-center">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-foreground">{batches.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completed} work orders fulfilled
              </p>
            </div>
          </div>
        </div>

        {/* Active Production Runs & Batches */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Work Orders */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bloom-card p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-bloom-sage" />
                  <h3 className="font-semibold text-foreground">Active Production Runs</h3>
                </div>
                <Link to="/production/list" className="text-xs font-semibold text-bloom-sage hover:underline flex items-center gap-1">
                  View All Orders <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-4">
                {activeOrders.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Factory className="h-10 w-10 mx-auto opacity-30 mb-2" />
                    <p className="font-medium text-foreground">No active production runs right now</p>
                    <p className="text-xs">Schedule a new manufacturing order to track output & QA.</p>
                  </div>
                ) : (
                  activeOrders.map((order) => {
                    const progressPercent =
                      order.plannedQuantity > 0
                        ? Math.min(
                            100,
                            Math.round((order.producedQuantity / order.plannedQuantity) * 100)
                          )
                        : 0;

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl border border-border bg-card/60 hover:bg-card hover:shadow-xs transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-foreground">{order.id}</span>
                              <span
                                className={cn(
                                  "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                  order.status === "In Progress"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                )}
                              >
                                {order.status}
                              </span>
                              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                Batch #{order.batchNumber}
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground mt-1">
                              {order.productName} — <span className="text-sm font-normal text-muted-foreground">{order.variantName}</span>
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link to="/production/$productionId" params={{ productionId: order.id }}>
                              <Button size="sm" variant="outline" className="h-8 text-xs">
                                Manage Run
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Output: {order.producedQuantity} / {order.plannedQuantity} {order.unit}</span>
                            <span className="font-bold text-foreground">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-bloom-sage transition-all duration-500 rounded-full"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" /> Vendor: <strong className="text-foreground">{order.vendorName}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> Expected: <strong className="text-foreground">{order.expectedCompletion}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Recent Batches Output & Storage */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bloom-card p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-bloom-sage" />
                  <h3 className="font-semibold text-foreground">Recent Batches</h3>
                </div>
                <Link to="/production/batches" className="text-xs font-semibold text-bloom-sage hover:underline">
                  All Batches
                </Link>
              </div>

              <div className="space-y-3">
                {recentBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground">{batch.batchNumber}</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                          batch.status === "Active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {batch.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-foreground">{batch.productName}</p>
                      <p className="text-[11px] text-muted-foreground">{batch.variantName}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
                      <span>Available: <strong className="text-foreground">{batch.availableQuantity} units</strong></span>
                      <span>Mfg: {batch.manufacturingDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Standard Policy Card */}
            <div className="bloom-card p-5 bg-bloom-sage/5 border-bloom-sage/20 space-y-2">
              <div className="flex items-center gap-2 text-bloom-sage font-semibold text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span>Bloom Production QA Policy</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Finished production output directly triggers stock ledger inwarding. Good output units are credited to available sellable inventory, while QA rejects are quarantined in damaged stock.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProductionShell>
  );
}
