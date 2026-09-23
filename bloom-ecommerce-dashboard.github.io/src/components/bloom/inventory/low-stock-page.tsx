import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Plus,
  Factory,
  Search,
  Building2,
  Package,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { InventoryShell } from "./inventory-shell";
import { PageHeader, Pagination, SearchBox } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/lib/bloom-vendor-store";
import { inventoryApi, LowStockItem } from "@/lib/inventory-api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function LowStockPage() {
  const products = useVendorStore((s) => s.getProducts());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");

  const [apiItems, setApiItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLowStock = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await inventoryApi.getLowStock();
      setApiItems(res.items || []);
      if (isManual) toast.success("Low stock alerts synchronized from server");
    } catch {
      // Fallback silently to store
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  const lowStockItems = useMemo(() => {
    if (apiItems.length > 0) {
      return apiItems
        .map((item) => {
          const prodName = typeof item.productId === "object" ? item.productId?.name : "Product";
          const vName = typeof item.vendorId === "object" ? (item.vendorId as any)?.businessName : "Bloom Supplier";
          const vId = typeof item.vendorId === "object" ? (item.vendorId as any)?._id : item.vendorId || "VEN-1001";
          const min = item.minStock || 10;
          const isCrit = item.availableStock <= Math.floor(min / 2);

          return {
            productId: typeof item.productId === "object" ? item.productId?._id : item.productId,
            productName: prodName,
            variantId: item.variantId || item._id,
            variantName: item.variantId || "Default",
            sku: `SKU-${item.variantId?.slice(-6) || "ITEM"}`,
            unitCode: "UNITS",
            vendorId: vId,
            vendorName: vName,
            availableStock: item.availableStock,
            minStock: min,
            reorderLevel: item.reorderQuantity || min * 2,
            severity: isCrit ? ("Critical" as const) : ("Low Stock" as const),
          };
        })
        .filter((item) => {
          const matchSearch =
            item.productName.toLowerCase().includes(search.toLowerCase()) ||
            item.sku.toLowerCase().includes(search.toLowerCase()) ||
            item.vendorName.toLowerCase().includes(search.toLowerCase());
          const matchVendor = vendorFilter === "All" || item.vendorId === vendorFilter;
          return matchSearch && matchVendor;
        });
    }

    const list: Array<{
      productId: string;
      productName: string;
      variantId: string;
      variantName: string;
      sku: string;
      unitCode: string;
      vendorId: string;
      vendorName: string;
      availableStock: number;
      minStock: number;
      reorderLevel: number;
      severity: "Critical" | "Low Stock";
    }> = [];

    for (const p of products) {
      for (const v of p.variants) {
        if (v.availableStock <= v.minStock) {
          list.push({
            productId: p.id,
            productName: p.name,
            variantId: v.id,
            variantName: v.name,
            sku: v.sku,
            unitCode: v.unitCode,
            vendorId: p.vendorId,
            vendorName: p.vendorName,
            availableStock: v.availableStock,
            minStock: v.minStock,
            reorderLevel: v.reorderLevel,
            severity: v.availableStock <= Math.floor(v.minStock / 2) ? "Critical" : "Low Stock",
          });
        }
      }
    }

    return list.filter((item) => {
      const matchSearch =
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.vendorName.toLowerCase().includes(search.toLowerCase());
      const matchVendor = vendorFilter === "All" || item.vendorId === vendorFilter;
      return matchSearch && matchVendor;
    });
  }, [apiItems, products, search, vendorFilter]);

  return (
    <InventoryShell>
      <div className="space-y-7">
        <PageHeader
          title="Low Stock Warning & Replenishment Queue"
          description="Identify items nearing depletion before storefront stock-outs occur. Trigger purchase orders or launch manufacturing runs."
          action={
            <div className="flex gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => fetchLowStock(true)}
                disabled={refreshing}
              >
                <RefreshCw className={cn("size-3.5 mr-1.5", refreshing && "animate-spin")} />
                {refreshing ? "Syncing..." : "Sync Alerts"}
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/production/new">
                  <Factory className="size-4" />
                  Plan Production
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

        {/* Filters */}
        <div className="bloom-card p-5 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <SearchBox
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search low stock SKUs, products, or suppliers…"
            />

            <select
              aria-label="Filter by Vendor"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.businessName}
                </option>
              ))}
            </select>

            {(search || vendorFilter !== "All") && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setSearch("");
                  setVendorFilter("All");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Low Stock Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Product & Variant</th>
                  <th className="px-5 py-4">SKU / Unit</th>
                  <th className="px-5 py-4">Vendor Partner</th>
                  <th className="px-5 py-4">Current Available</th>
                  <th className="px-5 py-4">Minimum Stock</th>
                  <th className="px-5 py-4">Reorder Point</th>
                  <th className="px-5 py-4">Alert Urgency</th>
                  <th className="px-5 py-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading && lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        <p className="text-xs">Checking low stock levels with central warehouse...</p>
                      </div>
                    </td>
                  </tr>
                ) : lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No products currently below minimum stock thresholds. All levels healthy.
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.variantId} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">{item.variantName}</div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs font-semibold">
                        <div>{item.sku}</div>
                        <div className="text-muted-foreground">{item.unitCode}</div>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          to="/vendors/$vendorId"
                          params={{ vendorId: item.vendorId }}
                          className="text-xs hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <Building2 className="size-3.5 text-muted-foreground" />
                          {item.vendorName}
                        </Link>
                      </td>

                      <td className="px-5 py-4 font-bold text-sm text-orange">
                        {item.availableStock} {item.unitCode}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold">
                        {item.minStock} {item.unitCode}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-muted-foreground">
                        {item.reorderLevel} {item.unitCode}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                            item.severity === "Critical"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-orange-soft text-orange",
                          )}
                        >
                          <AlertTriangle className="size-3" />
                          {item.severity}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                            <Link to="/inventory/add-stock">
                              + Stock
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="rounded-full text-xs">
                            <Link to="/production/new">
                              Produce
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination count={lowStockItems.length} />
        </div>
      </div>
    </InventoryShell>
  );
}
