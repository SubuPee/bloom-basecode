import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  Building2,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { InventoryShell } from "./inventory-shell";
import { PageHeader, Pagination, SearchBox } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore, type MovementType } from "@/lib/bloom-vendor-store";
import { inventoryApi, StockMovementItem } from "@/lib/inventory-api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ALL_MOVEMENT_TYPES: MovementType[] = [
  "Opening Stock",
  "Purchase",
  "Production",
  "Order",
  "Order Cancellation",
  "Return",
  "Damage",
  "Expiry",
  "Adjustment",
  "Transfer",
  "Manual Addition",
  "Manual Deduction",
];

export function StockMovementsPage() {
  const storeMovements = useVendorStore((s) => s.getMovements());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [apiItems, setApiItems] = useState<StockMovementItem[]>([]);
  const [apiTotal, setApiTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovements = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await inventoryApi.getMovements({
        movementType: typeFilter !== "All" ? typeFilter : undefined,
        page,
        limit: 25,
      });
      setApiItems(res.items || []);
      setApiTotal(res.total);
      if (isManual) toast.success("Stock movements synchronized from server");
    } catch {
      // Fallback silently
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [typeFilter, page]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const filtered = useMemo(() => {
    if (apiItems.length > 0) {
      return apiItems
        .map((m) => {
          const prodName = typeof m.productId === "object" ? m.productId?.name : "Product";
          const whName = typeof m.warehouseId === "object" ? m.warehouseId?.name : "Central Warehouse";

          return {
            id: m.movementId || m._id?.slice(-8) || "MOV-001",
            productId: typeof m.productId === "object" ? m.productId?._id : m.productId,
            productName: prodName,
            variantName: m.variantId || "Default",
            vendorId: "VEN-1001",
            vendorName: "Bloom Supplier",
            batchNumber: m.batchNumber || "BAT-STD",
            movementType: m.movementType as MovementType,
            referenceId: m.referenceId || "REF-AUDIT",
            quantity: m.quantity,
            unit: "units",
            previousStock: m.previousStock,
            newStock: m.newStock,
            warehouse: whName,
            location: "Zone A",
            createdBy: typeof m.performedBy === "object" ? m.performedBy?.name : "System",
            createdDate: m.createdAt
              ? new Date(m.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recently",
            notes: m.notes || "",
          };
        })
        .filter((m) => {
          const matchSearch =
            m.id.toLowerCase().includes(search.toLowerCase()) ||
            m.productName.toLowerCase().includes(search.toLowerCase()) ||
            m.variantName.toLowerCase().includes(search.toLowerCase()) ||
            m.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
            m.referenceId.toLowerCase().includes(search.toLowerCase()) ||
            (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()));

          const matchType = typeFilter === "All" || m.movementType === typeFilter;
          const matchVendor = vendorFilter === "All" || m.vendorId === vendorFilter;

          return matchSearch && matchType && matchVendor;
        });
    }

    return storeMovements.filter((m) => {
      const matchSearch =
        m.id.toLowerCase().includes(search.toLowerCase()) ||
        m.productName.toLowerCase().includes(search.toLowerCase()) ||
        m.variantName.toLowerCase().includes(search.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
        m.referenceId.toLowerCase().includes(search.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()));

      const matchType = typeFilter === "All" || m.movementType === typeFilter;
      const matchVendor = vendorFilter === "All" || m.vendorId === vendorFilter;

      return matchSearch && matchType && matchVendor;
    });
  }, [apiItems, storeMovements, search, typeFilter, vendorFilter]);

  const exportMovementsCsv = () => {
    const headers = ["Movement ID", "Product", "Variant", "Type", "Quantity", "Prev Stock", "New Stock", "Warehouse", "Date"];
    const rows = filtered.map((m) => [
      m.id,
      `"${m.productName}"`,
      `"${m.variantName}"`,
      m.movementType,
      m.quantity,
      m.previousStock,
      m.newStock,
      `"${m.warehouse}"`,
      `"${m.createdDate}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `movements_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <InventoryShell>
      <div className="space-y-7">
        <PageHeader
          title="Stock Movement Ledger & Audit Trail"
          description="Complete immutable chronological ledger tracking every single physical stock mutation across purchases, manufacturing, orders, returns, and write-offs."
          action={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => fetchMovements(true)}
                disabled={refreshing}
              >
                <RefreshCw className={cn("size-3.5 mr-1.5", refreshing && "animate-spin")} />
                {refreshing ? "Syncing..." : "Sync Ledger"}
              </Button>
              <Button variant="outline" className="rounded-full" onClick={exportMovementsCsv}>
                <Download className="size-4" />
                Export Ledger (CSV)
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
              placeholder="Search by Movement ID, Product, Batch #, or Reference…"
            />

            <select
              aria-label="Filter by Movement Type"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">All Movement Types</option>
              {ALL_MOVEMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

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

            {(search || typeFilter !== "All" || vendorFilter !== "All") && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("All");
                  setVendorFilter("All");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Movement Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Movement ID</th>
                  <th className="px-5 py-4">Product & Variant</th>
                  <th className="px-5 py-4">Vendor Partner</th>
                  <th className="px-5 py-4">Batch Number</th>
                  <th className="px-5 py-4">Movement Type</th>
                  <th className="px-5 py-4">Reference ID</th>
                  <th className="px-5 py-4">Change</th>
                  <th className="px-5 py-4">Stock (Prev → New)</th>
                  <th className="px-5 py-4">Hub / Location</th>
                  <th className="px-5 py-4">User & Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-6 animate-spin text-primary" />
                        <p className="text-sm">Fetching stock movements audit ledger...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-muted-foreground">
                      <p className="text-sm font-medium text-foreground">No stock movements found</p>
                      <p className="text-xs">No movements match your active search or filters.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-xs text-primary">
                      {m.id}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm">{m.productName}</div>
                      <div className="text-xs text-muted-foreground">{m.variantName}</div>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to="/vendors/$vendorId"
                        params={{ vendorId: m.vendorId }}
                        className="text-xs hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <Building2 className="size-3.5 text-muted-foreground" />
                        {m.vendorName}
                      </Link>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {m.batchNumber}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
                        {m.movementType}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-primary font-medium">
                      {m.referenceId}
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-sm">
                      <span className={m.quantity >= 0 ? "text-success" : "text-destructive"}>
                        {m.quantity >= 0 ? `+${m.quantity}` : m.quantity} {m.unit}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-mono">
                      {m.previousStock} → <span className="font-bold">{m.newStock}</span>
                    </td>

                    <td className="px-5 py-4 text-xs">
                      <div>{m.warehouse}</div>
                      {m.location && <div className="text-[11px] text-muted-foreground">{m.location}</div>}
                    </td>

                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      <div>{m.createdBy}</div>
                      <div className="text-[11px]">{m.createdDate}</div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
          <Pagination count={apiTotal ?? filtered.length} />
        </div>
      </div>
    </InventoryShell>
  );
}
