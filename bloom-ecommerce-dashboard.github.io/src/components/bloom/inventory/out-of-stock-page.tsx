import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  XCircle,
  Plus,
  Factory,
  Search,
  Building2,
  Package,
  AlertOctagon,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { InventoryShell } from "./inventory-shell";
import { PageHeader, Pagination, SearchBox } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/lib/bloom-vendor-store";
import { inventoryApi, OutOfStockItem } from "@/lib/inventory-api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function OutOfStockPage() {
  const products = useVendorStore((s) => s.getProducts());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");

  const [apiItems, setApiItems] = useState<OutOfStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOutOfStock = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await inventoryApi.getOutOfStock();
      setApiItems(res.items || []);
      if (isManual) toast.success("Out of stock ledger synchronized from server");
    } catch {
      // Fallback silently
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOutOfStock();
  }, [fetchOutOfStock]);

  const outOfStockItems = useMemo(() => {
    if (apiItems.length > 0) {
      return apiItems
        .map((item) => {
          const prodName = typeof item.productId === "object" ? item.productId?.name : "Product";
          const vName = typeof item.vendorId === "object" ? (item.vendorId as any)?.businessName : "Bloom Supplier";
          const vId = typeof item.vendorId === "object" ? (item.vendorId as any)?._id : item.vendorId || "VEN-1001";

          return {
            productId: typeof item.productId === "object" ? item.productId?._id : item.productId,
            productName: prodName,
            variantId: item.variantId || item._id,
            variantName: item.variantId || "Default",
            sku: `SKU-${item.variantId?.slice(-6) || "OOS"}`,
            unitCode: "UNITS",
            vendorId: vId,
            vendorName: vName,
            reservedStock: item.reservedStock || 0,
            minStock: 10,
            reorderLevel: 25,
            price: 750,
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
      reservedStock: number;
      minStock: number;
      reorderLevel: number;
      price: number;
    }> = [];

    for (const p of products) {
      for (const v of p.variants) {
        if (v.availableStock <= 0) {
          list.push({
            productId: p.id,
            productName: p.name,
            variantId: v.id,
            variantName: v.name,
            sku: v.sku,
            unitCode: v.unitCode,
            vendorId: p.vendorId,
            vendorName: p.vendorName,
            reservedStock: v.reservedStock,
            minStock: v.minStock,
            reorderLevel: v.reorderLevel,
            price: v.price,
          });
        }
      }
    }

    return list.filter((item) => {
      const matchSearch =
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.vendorName.toLowerCase().includes(search.toLowerCase());
      const matchVendor =
        vendorFilter === "All" || item.vendorId === vendorFilter;
      return matchSearch && matchVendor;
    });
  }, [apiItems, products, search, vendorFilter]);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(outOfStockItems.length / pageSize) || 1;
  const paginatedItems = outOfStockItems.slice((page - 1) * pageSize, page * pageSize);

  const totalOutOfStockSkus = outOfStockItems.length;
  const vendorsImpacted = new Set(outOfStockItems.map((i) => i.vendorId)).size;
  const backorderUnits = outOfStockItems.reduce((acc, curr) => acc + curr.reservedStock, 0);

  const exportCsv = () => {
    const headers = ["Product", "Variant", "SKU", "Vendor", "Reserved / Backorder", "Min Required", "Reorder Level", "Unit Price"];
    const rows = outOfStockItems.map((i) => [
      `"${i.productName}"`,
      `"${i.variantName}"`,
      i.sku,
      `"${i.vendorName}"`,
      i.reservedStock,
      i.minStock,
      i.reorderLevel,
      `₹${i.price}`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `out_of_stock_skus_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <InventoryShell>
      <div className="space-y-6">
        <PageHeader
          title="Out of Stock Items"
          description="Stock items with zero available inventory requiring immediate replenishment or emergency production."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fetchOutOfStock(true)}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                {refreshing ? "Syncing..." : "Sync Stock"}
              </Button>
              <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Link to="/inventory/add-stock">
                <Button size="sm" className="gap-2 bg-bloom-sage hover:bg-bloom-sage/90 text-white">
                  <Plus className="h-4 w-4" />
                  Quick Inward Stock
                </Button>
              </Link>
            </div>
          }
        />

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bloom-card p-5 border-l-4 border-red-500 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Zero Stock SKUs</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{totalOutOfStockSkus}</p>
              <p className="text-xs text-muted-foreground mt-1">Requires immediate supplier PO</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <XCircle className="h-6 w-6" />
            </div>
          </div>

          <div className="bloom-card p-5 border-l-4 border-amber-500 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Backorders / Reserved</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{backorderUnits} units</p>
              <p className="text-xs text-muted-foreground mt-1">Pending order fulfillments</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <AlertOctagon className="h-6 w-6" />
            </div>
          </div>

          <div className="bloom-card p-5 border-l-4 border-blue-500 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Suppliers Affected</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{vendorsImpacted}</p>
              <p className="text-xs text-muted-foreground mt-1">Active supplier partnerships</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bloom-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full md:w-auto">
            <SearchBox
              placeholder="Search by SKU, item name or vendor..."
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

        {/* Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Item & Variant</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4 text-center">Available Stock</th>
                  <th className="py-3 px-4 text-center">Reserved Units</th>
                  <th className="py-3 px-4 text-center">Safety Reorder</th>
                  <th className="py-3 px-4 text-right">Emergency Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="font-medium text-foreground">Checking zero-inventory records...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-10 w-10 text-muted-foreground/40" />
                        <p className="font-medium text-foreground">No out-of-stock items detected</p>
                        <p className="text-xs">All active variants currently have sellable inventory units.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr key={`${item.productId}-${item.variantId}`} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.variantName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{item.sku}</td>
                      <td className="py-3 px-4 text-xs font-medium text-muted-foreground">
                        {item.vendorName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-300 dark:border-red-800">
                          0 {item.unitCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.reservedStock > 0 ? (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                            {item.reservedStock} {item.unitCode}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-xs">
                        <span className="text-muted-foreground">Min {item.minStock} | Target {item.reorderLevel}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to="/inventory/add-stock">
                            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                              <Plus className="h-3.5 w-3.5 text-bloom-sage" />
                              Add Stock
                            </Button>
                          </Link>
                          <Link to="/production/new">
                            <Button size="sm" className="h-8 gap-1 text-xs bg-bloom-sage text-white hover:bg-bloom-sage/90">
                              <Factory className="h-3.5 w-3.5" />
                              Order Production
                            </Button>
                          </Link>
                        </div>
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
                {Math.min(page * pageSize, outOfStockItems.length)} of {outOfStockItems.length} items
              </p>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </InventoryShell>
  );
}
