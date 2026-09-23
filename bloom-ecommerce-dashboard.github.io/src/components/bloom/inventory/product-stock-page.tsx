import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  Layers,
  Search,
  Filter,
  Plus,
  SlidersHorizontal,
  Send,
  Building2,
  AlertTriangle,
  PackageX,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { InventoryShell } from "./inventory-shell";
import { PageHeader, Pagination, SearchBox, StatusBadge } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/lib/bloom-vendor-store";
import { inventoryApi, StockVariantItem } from "@/lib/inventory-api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProductStockPage() {
  const products = useVendorStore((s) => s.getProducts());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [stockStatusFilter, setStockStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [apiItems, setApiItems] = useState<StockVariantItem[]>([]);
  const [apiTotal, setApiTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStock = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await inventoryApi.getStock({
        search: search || undefined,
        vendorId: vendorFilter !== "All" ? vendorFilter : undefined,
        status: stockStatusFilter !== "All" ? stockStatusFilter : undefined,
        page,
        limit: 20,
      });
      setApiItems(res.items);
      setApiTotal(res.total);
      if (isManual) toast.success("Stock ledger refreshed from server");
    } catch {
      // Fallback silently to client store
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [search, vendorFilter, stockStatusFilter, page]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const stockRows = useMemo(() => {
    // If backend returned items, format them
    if (apiItems.length > 0) {
      return apiItems.map((item) => {
        const prodName = typeof item.productId === "object" ? item.productId?.name : item.productName || "Product";
        const vName = typeof item.vendorId === "object" ? (item.vendorId as any)?.businessName : "Bloom Supplier";
        const vId = typeof item.vendorId === "object" ? (item.vendorId as any)?._id : item.vendorId || "VEN-1001";
        const uCode = item.sku?.split("-")[1] || "UNITS";

        return {
          productId: typeof item.productId === "object" ? item.productId?._id : item.productId,
          productName: prodName,
          category: typeof item.productId === "object" ? item.productId?.category : "General",
          vendorId: vId,
          vendorName: vName,
          variantId: item.variantId || item._id,
          variantName: item.variantId || "Default Variant",
          sku: item.sku || "SKU-N/A",
          barcode: "890123456789",
          unitCode: uCode,
          availableStock: item.availableStock,
          reservedStock: item.reservedStock,
          damagedStock: item.damagedStock,
          expiredStock: item.expiredStock,
          inTransitStock: item.inTransitStock,
          totalStock: item.totalStock ?? (item.availableStock + item.reservedStock + item.damagedStock + item.expiredStock + item.inTransitStock),
          minStock: item.minStock || 10,
          reorderLevel: item.reorderPoint || 20,
          purchasePrice: 500,
          sellingPrice: 850,
        };
      });
    }

    // Otherwise fallback to client store
    const list: Array<{
      productId: string;
      productName: string;
      category: string;
      vendorId: string;
      vendorName: string;
      variantId: string;
      variantName: string;
      sku: string;
      barcode: string;
      unitCode: string;
      availableStock: number;
      reservedStock: number;
      damagedStock: number;
      expiredStock: number;
      inTransitStock: number;
      totalStock: number;
      minStock: number;
      reorderLevel: number;
      purchasePrice: number;
      sellingPrice: number;
    }> = [];

    for (const p of products) {
      for (const v of p.variants) {
        list.push({
          productId: p.id,
          productName: p.name,
          category: p.category,
          vendorId: p.vendorId,
          vendorName: p.vendorName,
          variantId: v.id,
          variantName: v.name,
          sku: v.sku,
          barcode: v.barcode,
          unitCode: v.unitCode,
          availableStock: v.availableStock,
          reservedStock: v.reservedStock,
          damagedStock: v.damagedStock,
          expiredStock: v.expiredStock,
          inTransitStock: v.inTransitStock,
          totalStock: v.availableStock + v.reservedStock + v.damagedStock + v.expiredStock + v.inTransitStock,
          minStock: v.minStock,
          reorderLevel: v.reorderLevel,
          purchasePrice: v.purchasePrice,
          sellingPrice: v.price,
        });
      }
    }

    return list.filter((r) => {
      const matchSearch =
        r.productName.toLowerCase().includes(search.toLowerCase()) ||
        r.variantName.toLowerCase().includes(search.toLowerCase()) ||
        r.sku.toLowerCase().includes(search.toLowerCase()) ||
        r.vendorName.toLowerCase().includes(search.toLowerCase());

      const matchVendor = vendorFilter === "All" || r.vendorId === vendorFilter;

      let matchStock = true;
      if (stockStatusFilter === "In Stock") matchStock = r.availableStock > r.minStock;
      else if (stockStatusFilter === "Low Stock") matchStock = r.availableStock <= r.minStock && r.availableStock > 0;
      else if (stockStatusFilter === "Out of Stock") matchStock = r.availableStock === 0;

      return matchSearch && matchVendor && matchStock;
    });
  }, [apiItems, products, search, vendorFilter, stockStatusFilter]);

  return (
    <InventoryShell>
      <div className="space-y-7">
        <PageHeader
          title="Product Stock Ledger & Variant Availability"
          description="Detailed itemized breakdown of stock by variant, SKU, reserved order allocations, damaged goods, and minimum reorder thresholds."
          action={
            <div className="flex gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => fetchStock(true)}
                disabled={refreshing}
              >
                <RefreshCw className={cn("size-3.5 mr-1.5", refreshing && "animate-spin")} />
                {refreshing ? "Syncing..." : "Sync Ledger"}
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/inventory/adjustment">
                  <SlidersHorizontal className="size-4" />
                  Stock Adjustment
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Product Name, Variant, SKU, or Supplier…"
            />

            <select
              aria-label="Filter by Vendor"
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.businessName}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by Stock Status"
              value={stockStatusFilter}
              onChange={(e) => {
                setStockStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock (Healthy)</option>
              <option value="Low Stock">Low Stock Alert</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            {(search || vendorFilter !== "All" || stockStatusFilter !== "All") && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setSearch("");
                  setVendorFilter("All");
                  setStockStatusFilter("All");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Stock Ledger Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Product & Variant</th>
                  <th className="px-5 py-4">SKU / Unit</th>
                  <th className="px-5 py-4">Vendor Partner</th>
                  <th className="px-5 py-4">Available</th>
                  <th className="px-5 py-4">Reserved</th>
                  <th className="px-5 py-4">In Transit</th>
                  <th className="px-5 py-4">Damaged / Expired</th>
                  <th className="px-5 py-4">Total Stock</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading && stockRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-6 animate-spin text-primary" />
                        <p className="text-sm">Loading inventory ledger from server...</p>
                      </div>
                    </td>
                  </tr>
                ) : stockRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <PackageX className="size-8 text-muted-foreground/60" />
                        <p className="text-sm font-medium text-foreground">No stock records found</p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search criteria or clear active filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stockRows.map((row) => {
                    const isOut = row.availableStock === 0;
                    const isLow = row.availableStock <= row.minStock && !isOut;

                    return (
                      <tr key={row.variantId} className="hover:bg-accent/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-sm">{row.productName}</div>
                          <div className="text-xs text-muted-foreground font-medium mt-0.5">
                            {row.variantName}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-mono text-xs">
                          <div className="font-semibold">{row.sku}</div>
                          <div className="text-muted-foreground">{row.unitCode}</div>
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            to="/vendors/$vendorId"
                            params={{ vendorId: row.vendorId }}
                            className="text-xs hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            <Building2 className="size-3.5 text-muted-foreground" />
                            {row.vendorName}
                          </Link>
                        </td>

                        <td className="px-5 py-4 font-bold text-sm">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                              isOut
                                ? "bg-destructive/15 text-destructive"
                                : isLow
                                  ? "bg-orange-soft text-orange"
                                  : "text-success",
                            )}
                          >
                            {row.availableStock} {row.unitCode}
                            {isLow && <AlertTriangle className="size-3 ml-0.5" />}
                            {isOut && <PackageX className="size-3 ml-0.5" />}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs font-mono text-muted-foreground">
                          {row.reservedStock} {row.unitCode}
                        </td>

                        <td className="px-5 py-4 text-xs font-mono text-muted-foreground">
                          {row.inTransitStock} {row.unitCode}
                        </td>

                        <td className="px-5 py-4 text-xs font-mono text-destructive">
                          {row.damagedStock + row.expiredStock} {row.unitCode}
                        </td>

                        <td className="px-5 py-4 font-bold text-sm">
                          {row.totalStock} {row.unitCode}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
                              <Link to="/inventory/adjustment">
                                Adjust
                              </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
                              <Link to="/inventory/add-stock">
                                + Stock
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination count={apiTotal ?? stockRows.length} />
        </div>
      </div>
    </InventoryShell>
  );
}
