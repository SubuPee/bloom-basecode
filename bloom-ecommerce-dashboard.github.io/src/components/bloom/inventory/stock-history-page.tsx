import { useState, useMemo, useEffect, useCallback } from "react";
import {
  History,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  RotateCcw,
  Factory,
  ArrowLeftRight,
  Loader2,
} from "lucide-react";
import { InventoryShell } from "./inventory-shell";
import { PageHeader, Pagination, SearchBox } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore, StockMovement } from "@/lib/bloom-vendor-store";
import { inventoryApi, StockMovementItem } from "@/lib/inventory-api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function StockHistoryPage() {
  const storeMovements: StockMovement[] = useVendorStore((s) => s.getMovements());

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [apiItems, setApiItems] = useState<StockMovementItem[]>([]);
  const [apiTotal, setApiTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await inventoryApi.getAuditHistory({ page, limit: 12 });
      setApiItems(res.items || []);
      setApiTotal(res.total);
      if (isManual) toast.success("Audit history synchronized from server");
    } catch {
      // Fallback to store
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = useMemo(() => {
    if (apiItems.length > 0) {
      return apiItems
        .map((m) => {
          const prodName = typeof m.productId === "object" ? m.productId?.name : "Product";
          const whName = typeof m.warehouseId === "object" ? m.warehouseId?.name : "Central Warehouse";
          const performer = typeof m.performedBy === "object" ? m.performedBy?.name : "Operator";

          return {
            id: m.movementId || m._id?.slice(-8) || "MOV-001",
            productId: typeof m.productId === "object" ? m.productId?._id : m.productId,
            productName: prodName,
            variantId: m.variantId || "default",
            variantName: m.variantId || "Default",
            sku: `SKU-${m.variantId?.slice(-6) || "AUD"}`,
            vendorId: "VEN-1001",
            vendorName: "Bloom Supplier",
            batchNumber: m.batchNumber || "BAT-AUDIT",
            movementType: m.movementType as any,
            referenceId: m.referenceId || "REF-AUDIT",
            quantity: m.quantity,
            unit: "units",
            previousStock: m.previousStock,
            newStock: m.newStock,
            warehouse: whName,
            location: "Zone A",
            createdBy: performer,
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
            m.productName.toLowerCase().includes(search.toLowerCase()) ||
            m.variantName.toLowerCase().includes(search.toLowerCase()) ||
            (m.sku && m.sku.toLowerCase().includes(search.toLowerCase())) ||
            (m.notes && m.notes.toLowerCase().includes(search.toLowerCase())) ||
            (m.referenceId && m.referenceId.toLowerCase().includes(search.toLowerCase()));

          const matchType = typeFilter === "ALL" || m.movementType === typeFilter;
          return matchSearch && matchType;
        });
    }

    return storeMovements.filter((m: StockMovement) => {
      const matchSearch =
        m.productName.toLowerCase().includes(search.toLowerCase()) ||
        m.variantName.toLowerCase().includes(search.toLowerCase()) ||
        (m.sku && m.sku.toLowerCase().includes(search.toLowerCase())) ||
        (m.notes && m.notes.toLowerCase().includes(search.toLowerCase())) ||
        (m.referenceId && m.referenceId.toLowerCase().includes(search.toLowerCase()));

      const matchType = typeFilter === "ALL" || m.movementType === typeFilter;
      return matchSearch && matchType;
    });
  }, [apiItems, storeMovements, search, typeFilter]);

  const pageSize = 12;
  const paginated = apiItems.length > 0 ? filteredHistory : filteredHistory.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const headers = [
      "Date Time",
      "Movement ID",
      "Product",
      "Variant",
      "SKU",
      "Type",
      "Previous Stock",
      "Quantity Change",
      "New Stock",
      "Unit",
      "Notes / Reason",
      "Reference ID",
      "Warehouse",
      "Performed By",
    ];

    const rows = filteredHistory.map((m: any) => [
      `"${m.createdDate}"`,
      m.id,
      `"${m.productName}"`,
      `"${m.variantName}"`,
      m.sku || "N/A",
      m.movementType,
      m.previousStock,
      m.quantity,
      m.newStock,
      m.unit,
      `"${m.notes || ""}"`,
      m.referenceId || "N/A",
      `"${m.warehouse || "Central Warehouse"}"`,
      `"${m.createdBy || "Admin"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `bloom_stock_audit_history_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Opening Stock":
      case "Manual Addition":
      case "Purchase":
        return {
          icon: ArrowDownLeft,
          color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
          label: type,
        };
      case "Order":
      case "Manual Deduction":
        return {
          icon: ArrowUpRight,
          color: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-300 dark:border-red-800",
          label: type,
        };
      case "Production":
        return {
          icon: Factory,
          color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800",
          label: "Production",
        };
      case "Return":
      case "Order Cancellation":
        return {
          icon: RotateCcw,
          color: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-300 dark:border-purple-800",
          label: type,
        };
      case "Transfer":
        return {
          icon: ArrowLeftRight,
          color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-300 dark:border-blue-800",
          label: "Transfer",
        };
      default:
        return {
          icon: RefreshCw,
          color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800",
          label: type,
        };
    }
  };

  return (
    <InventoryShell>
      <div className="space-y-6">
        <PageHeader
          title="Stock Audit History"
          description="Complete chronological audit trail of all warehouse inventory transactions, balance changes, and reason codes."
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchHistory(true)}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                {refreshing ? "Syncing..." : "Sync History"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCsv}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Full Audit CSV
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <div className="bloom-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full md:w-auto">
            <SearchBox
              placeholder="Search by SKU, product, reason, reference..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
            >
              <option value="ALL">All Event Types</option>
              <option value="Opening Stock">Opening Stock</option>
              <option value="Purchase">Purchase / Inward</option>
              <option value="Production">Production</option>
              <option value="Order">Order Dispatch</option>
              <option value="Order Cancellation">Order Cancellation</option>
              <option value="Return">Return Restock</option>
              <option value="Adjustment">Adjustment</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp & Ref</th>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4 text-center">Previous</th>
                  <th className="py-3 px-4 text-center">Qty Delta</th>
                  <th className="py-3 px-4 text-center">Resulting Balance</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Warehouse & Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm">Fetching stock audit ledger from server...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      No stock history records match your filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((m: StockMovement) => {
                    const badge = getTypeBadge(m.movementType);
                    const Icon = badge.icon;
                    const isPositive = m.quantity > 0;

                    return (
                      <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <p className="font-mono text-xs font-semibold text-foreground">
                            {m.createdDate}
                          </p>
                          {m.referenceId && (
                            <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground mt-1 inline-block">
                              {m.referenceId}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{m.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.variantName} {m.sku && <span className="font-mono">• {m.sku}</span>}
                          </p>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                              badge.color
                            )}
                          >
                            <Icon className="h-3 w-3" />
                            {badge.label}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-xs text-muted-foreground">
                          {m.previousStock} {m.unit}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-xs whitespace-nowrap">
                          <span
                            className={cn(
                              isPositive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {isPositive ? `+${m.quantity}` : m.quantity} {m.unit}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-xs font-bold text-foreground">
                          {m.newStock} {m.unit}
                        </td>

                        <td className="py-3 px-4 text-xs text-muted-foreground max-w-[200px] truncate" title={m.notes || ""}>
                          {m.notes || "—"}
                        </td>

                        <td className="py-3 px-4 text-xs">
                          <p className="font-medium text-foreground">{m.warehouse || "Central Warehouse"}</p>
                          <p className="text-muted-foreground text-[10px]">
                            By {m.createdBy || "Inventory Admin"}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </InventoryShell>
  );
}
