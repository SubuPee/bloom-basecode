import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  Boxes,
  Layers,
  AlertTriangle,
  PackageX,
  ShieldAlert,
  Send,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Warehouse,
  History,
  Archive,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { InventoryShell } from "./inventory-shell";
import { PageHeader } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/lib/bloom-vendor-store";
import { inventoryApi, InventoryOverviewData } from "@/lib/inventory-api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const defaultCategoryStockData = [
  { name: "Electronics", available: 120, reserved: 15, damaged: 2 },
  { name: "Apparel", available: 320, reserved: 40, damaged: 5 },
  { name: "Beauty", available: 210, reserved: 18, damaged: 3 },
  { name: "Home & Kitchen", available: 85, reserved: 8, damaged: 4 },
  { name: "Footwear", available: 45, reserved: 4, damaged: 1 },
];

const COLORS = ["var(--blue)", "var(--pink)", "var(--gold)", "var(--orange)", "var(--success)"];

export function InventoryOverview() {
  const storeProducts = useVendorStore((s) => s.getProducts());
  const storeMovements = useVendorStore((s) => s.getMovements());

  const [apiOverview, setApiOverview] = useState<InventoryOverviewData | null>(null);
  const [apiLowCount, setApiLowCount] = useState<number | null>(null);
  const [apiOutCount, setApiOutCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverviewData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [overview, lowStock, outOfStock] = await Promise.all([
        inventoryApi.getOverview().catch(() => null),
        inventoryApi.getLowStock().catch(() => null),
        inventoryApi.getOutOfStock().catch(() => null),
      ]);

      if (overview) setApiOverview(overview);
      if (lowStock) setApiLowCount(lowStock.items ? lowStock.items.length : 0);
      if (outOfStock) setApiOutCount(outOfStock.items ? outOfStock.items.length : 0);

      if (isManual) {
        toast.success("Inventory metrics synchronized with backend");
      }
    } catch {
      if (isManual) toast.error("Failed to sync live inventory data");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  let totalSkus = 0;
  let storeAvailableStock = 0;
  let storeReservedStock = 0;
  let storeDamagedStock = 0;
  let storeExpiredStock = 0;
  let storeInTransitStock = 0;
  let storeTotalValue = 0;
  let storeLowStockCount = 0;
  let storeOutOfStockCount = 0;

  for (const p of storeProducts) {
    for (const v of p.variants) {
      totalSkus++;
      storeAvailableStock += v.availableStock;
      storeReservedStock += v.reservedStock;
      storeDamagedStock += v.damagedStock;
      storeExpiredStock += v.expiredStock;
      storeInTransitStock += v.inTransitStock;
      storeTotalValue += (v.availableStock + v.reservedStock) * v.purchasePrice;

      if (v.availableStock === 0) storeOutOfStockCount++;
      else if (v.availableStock <= v.minStock) storeLowStockCount++;
    }
  }

  const availableStock = apiOverview?.availableStock ?? storeAvailableStock;
  const reservedStock = apiOverview?.reservedStock ?? storeReservedStock;
  const inTransitStock = apiOverview?.inTransitStock ?? storeInTransitStock;
  const damagedStock = apiOverview?.damagedStock ?? storeDamagedStock;
  const expiredStock = apiOverview?.expiredStock ?? storeExpiredStock;
  const totalStock = availableStock + reservedStock + damagedStock + expiredStock + inTransitStock;

  const lowStockCount = apiLowCount ?? storeLowStockCount;
  const outOfStockCount = apiOutCount ?? storeOutOfStockCount;
  const totalValue = apiOverview?.totalStockValue ?? storeTotalValue;

  const categoryStockData =
    apiOverview?.categoryStockData && apiOverview.categoryStockData.length > 0
      ? apiOverview.categoryStockData
      : defaultCategoryStockData;

  const stockSplit = [
    { name: "Available (Sellable)", value: availableStock, color: "var(--success)" },
    { name: "Reserved (Orders)", value: reservedStock, color: "var(--blue)" },
    { name: "In Transit", value: inTransitStock, color: "var(--gold)" },
    { name: "Damaged / Scrap", value: damagedStock, color: "var(--orange)" },
    { name: "Expired Quarantine", value: expiredStock, color: "var(--destructive)" },
  ];

  return (
    <InventoryShell>
      <div className="space-y-7">
        <PageHeader
          title="Warehouse Inventory & Stock Supervision"
          description="Monitor real-time inventory valuations, multi-tier stock isolation (available, reserved, damaged, in-transit), and warehouse distributions."
          action={
            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => fetchOverviewData(true)}
                disabled={refreshing}
              >
                <RefreshCw className={cn("size-3.5 mr-1.5", refreshing && "animate-spin")} />
                {refreshing ? "Syncing..." : "Sync Stock"}
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/inventory/adjustment">
                  Stock Adjustment
                </Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/inventory/add-stock">
                  <Plus className="size-4" />
                  Add Inbound Stock
                </Link>
              </Button>
            </div>
          }
        />

        {/* Top Operational Cards */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bloom-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-blue-soft text-blue">
                <Boxes className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Total Stock Units</p>
                <h3 className="text-2xl font-bold">{totalStock.toLocaleString("en-IN")}</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Across <span className="font-semibold text-foreground">{totalSkus} variant SKUs</span> in all hubs
            </p>
          </div>

          <div className="bloom-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-success-soft text-success">
                <TrendingUp className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Inventory Valuation</p>
                <h3 className="text-2xl font-bold">₹{totalValue.toLocaleString("en-IN")}</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Valued at wholesale cost of goods</p>
          </div>

          <div className="bloom-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-orange-soft text-orange">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Low Stock Threshold</p>
                <h3 className="text-2xl font-bold text-orange">{lowStockCount} SKUs</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Below minimum reorder threshold</p>
          </div>

          <div className="bloom-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-destructive/15 text-destructive">
                <PackageX className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Stock-Out Alerts</p>
                <h3 className="text-2xl font-bold text-destructive">{outOfStockCount} SKUs</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Zero sellable inventory available</p>
          </div>
        </div>

        {/* Stock Isolation Breakdown Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bloom-card p-4">
            <p className="text-xs uppercase text-muted-foreground font-semibold">Available Stock</p>
            <p className="text-xl font-bold text-success mt-1">{availableStock}</p>
            <p className="text-[11px] text-muted-foreground">Ready for storefront sale</p>
          </div>

          <div className="bloom-card p-4">
            <p className="text-xs uppercase text-muted-foreground font-semibold">Reserved Stock</p>
            <p className="text-xl font-bold text-blue mt-1">{reservedStock}</p>
            <p className="text-[11px] text-muted-foreground">Allocated to customer orders</p>
          </div>

          <div className="bloom-card p-4">
            <p className="text-xs uppercase text-muted-foreground font-semibold">In Transit</p>
            <p className="text-xl font-bold text-gold mt-1">{inTransitStock}</p>
            <p className="text-[11px] text-muted-foreground">Between warehouse transfers</p>
          </div>

          <div className="bloom-card p-4">
            <p className="text-xs uppercase text-muted-foreground font-semibold">Damaged Pool</p>
            <p className="text-xl font-bold text-orange mt-1">{damagedStock}</p>
            <p className="text-[11px] text-muted-foreground">Non-sellable defectives</p>
          </div>

          <div className="bloom-card p-4">
            <p className="text-xs uppercase text-muted-foreground font-semibold">Expired Stock</p>
            <p className="text-xl font-bold text-destructive mt-1">{expiredStock}</p>
            <p className="text-[11px] text-muted-foreground">Quarantined for disposal</p>
          </div>
        </div>

        {/* Visual Charts */}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="bloom-card p-6">
            <h3 className="text-base font-semibold">Category Stock Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Breakdown of available units vs reserved customer orders by product category.
            </p>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStockData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface-raised)",
                      borderColor: "var(--border)",
                      borderRadius: "1rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="available" name="Available Stock" fill="var(--blue)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="reserved" name="Reserved Stock" fill="var(--pink)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bloom-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold">Stock Status Allocation</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Total warehouse inventory categorized by readiness state.
              </p>

              <div className="h-[180px] w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockSplit}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {stockSplit.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface-raised)",
                        borderColor: "var(--border)",
                        borderRadius: "1rem",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t text-xs">
              {stockSplit.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </span>
                  <span className="font-bold">{item.value} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links to Movements */}
        <div className="bloom-card overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold">Recent Stock Movements</h3>
              <p className="text-xs text-muted-foreground">Real-time ledger audit trail of recent receipts, dispatches, and adjustments.</p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
              <Link to="/inventory/movements">View All Movements</Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Movement ID</th>
                  <th className="px-5 py-3.5">Product & Variant</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Quantity Change</th>
                  <th className="px-5 py-3.5">New Balance</th>
                  <th className="px-5 py-3.5">Warehouse</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {apiOverview?.recentMovements && apiOverview.recentMovements.length > 0
                  ? apiOverview.recentMovements.map((m: any) => (
                      <tr key={m._id || m.movementId} className="hover:bg-accent/40">
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">
                          {m.movementId || m._id?.slice(-8)}
                        </td>
                        <td className="px-5 py-3.5 font-medium">
                          {typeof m.productId === "object" ? m.productId?.name : m.productId} ·{" "}
                          <span className="text-muted-foreground text-xs">{m.variantId}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                            {m.movementType}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "px-5 py-3.5 font-mono font-bold text-sm",
                            m.quantity >= 0 ? "text-success" : "text-destructive",
                          )}
                        >
                          {m.quantity >= 0 ? `+${m.quantity}` : m.quantity} units
                        </td>
                        <td className="px-5 py-3.5 font-bold font-mono">{m.newStock} units</td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground">
                          {typeof m.warehouseId === "object" ? m.warehouseId?.name : m.warehouseId || "Central"}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Recently"}
                        </td>
                      </tr>
                    ))
                  : storeMovements.slice(0, 5).map((m) => (
                      <tr key={m.id} className="hover:bg-accent/40">
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">{m.id}</td>
                        <td className="px-5 py-3.5 font-medium">
                          {m.productName} · <span className="text-muted-foreground text-xs">{m.variantName}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                            {m.movementType}
                          </span>
                        </td>
                        <td className={cn("px-5 py-3.5 font-mono font-bold text-sm", m.quantity >= 0 ? "text-success" : "text-destructive")}>
                          {m.quantity >= 0 ? `+${m.quantity}` : m.quantity} {m.unit}
                        </td>
                        <td className="px-5 py-3.5 font-bold font-mono">{m.newStock} {m.unit}</td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground">{m.warehouse}</td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground">{m.createdDate}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </InventoryShell>
  );
}
