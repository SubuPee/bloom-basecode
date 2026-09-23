import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Package,
  Layers,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { VendorShell } from "./vendor-shell";
import { PageHeader, Pagination, SearchBox, StatusBadge } from "../ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVendorStore, type VendorProduct, type ProductVariant } from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function VendorProductsPage() {
  const products = useVendorStore((s) => s.getProducts());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeVariantView, setActiveVariantView] = useState<VendorProduct | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(search.toLowerCase());
      const matchVendor = vendorFilter === "All" || p.vendorId === vendorFilter;
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      return matchSearch && matchVendor && matchCat;
    });
  }, [products, search, vendorFilter, categoryFilter]);

  return (
    <VendorShell>
      <div className="space-y-7">
        <PageHeader
          title="Vendor Catalog & Variant Management"
          description="Manage supplier SKUs, variant attributes, unit conversions, wholesale purchase costs, and sellable stock levels."
          action={
            <div className="flex gap-2.5">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/inventory/stock">
                  <Layers className="size-4" />
                  View Stock Ledger
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

        {/* Filter Bar */}
        <div className="bloom-card p-5 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <SearchBox
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, SKU, or vendor name…"
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

            <select
              aria-label="Filter by Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {(search || vendorFilter !== "All" || categoryFilter !== "All") && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setSearch("");
                  setVendorFilter("All");
                  setCategoryFilter("All");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Product Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Product & SKU</th>
                  <th className="px-5 py-4">Vendor Partner</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Variants</th>
                  <th className="px-5 py-4">Retail Price</th>
                  <th className="px-5 py-4">Purchase Price</th>
                  <th className="px-5 py-4">Available Stock</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((product) => {
                  const totalStock = product.variants.reduce((acc, v) => acc + v.availableStock, 0);
                  const isLow = totalStock <= 15;

                  return (
                    <tr key={product.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm">{product.name}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {product.sku}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          to="/vendors/$vendorId"
                          params={{ vendorId: product.vendorId }}
                          className="font-medium text-xs hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <Building2 className="size-3.5 text-muted-foreground" />
                          {product.vendorName}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <span className="font-medium">{product.category}</span>
                        <div className="text-muted-foreground">{product.subCategory}</div>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setActiveVariantView(product)}
                          className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-semibold hover:border-primary transition-colors"
                        >
                          <Layers className="size-3" />
                          {product.variants.length} Variants
                        </button>
                      </td>

                      <td className="px-5 py-4 font-semibold text-sm">
                        ₹{product.sellingPrice.toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        ₹{product.purchasePrice.toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold",
                            totalStock === 0
                              ? "bg-destructive/15 text-destructive"
                              : isLow
                                ? "bg-orange-soft text-orange"
                                : "bg-success-soft text-success",
                          )}
                        >
                          {totalStock === 0 ? "0 (Out of stock)" : `${totalStock} units`}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={product.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-xs"
                            onClick={() => setActiveVariantView(product)}
                          >
                            Inspect Variants
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination count={filtered.length} />
        </div>
      </div>

      {/* Inspect Variants Modal */}
      <Dialog open={!!activeVariantView} onOpenChange={(open) => !open && setActiveVariantView(null)}>
        <DialogContent className="rounded-3xl max-w-3xl">
          <DialogHeader>
            <DialogTitle>{activeVariantView?.name} · Variant Breakdown</DialogTitle>
            <DialogDescription>
              SKU: {activeVariantView?.sku} · Vendor: {activeVariantView?.vendorName}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto py-2">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="p-3">Variant Name</th>
                  <th className="p-3">SKU / Barcode</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Price (Sell / Cost)</th>
                  <th className="p-3">Available</th>
                  <th className="p-3">Reserved</th>
                  <th className="p-3">Min / Reorder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {activeVariantView?.variants.map((v) => (
                  <tr key={v.id} className="hover:bg-accent/40">
                    <td className="p-3 font-semibold">{v.name}</td>
                    <td className="p-3 font-mono">
                      <div>{v.sku}</div>
                      <div className="text-[10px] text-muted-foreground">{v.barcode}</div>
                    </td>
                    <td className="p-3">{v.unitCode}</td>
                    <td className="p-3">
                      <div className="font-semibold">₹{v.price}</div>
                      <div className="text-muted-foreground">Cost: ₹{v.purchasePrice}</div>
                    </td>
                    <td className="p-3 font-bold text-success">{v.availableStock}</td>
                    <td className="p-3 text-muted-foreground">{v.reservedStock}</td>
                    <td className="p-3 text-muted-foreground">
                      {v.minStock} / {v.reorderLevel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setActiveVariantView(null)}>
              Close
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/inventory/add-stock">Add Stock to Variant</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VendorShell>
  );
}
