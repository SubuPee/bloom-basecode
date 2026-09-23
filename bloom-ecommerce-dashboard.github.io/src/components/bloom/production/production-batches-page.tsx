import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Boxes,
  Search,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Warehouse,
  Ban,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ProductionShell } from "./production-shell";
import { PageHeader, Pagination, SearchBox } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore, vendorStore, BatchStatus } from "@/lib/bloom-vendor-store";
import { productionApi, ProductionBatchItem } from "@/lib/production-api";
import { cn } from "@/lib/utils";

export function ProductionBatchesPage() {
  const storeBatches = useVendorStore((s) => s.getBatches());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [liveBatches, setLiveBatches] = useState<ProductionBatchItem[] | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPagesCount, setTotalPagesCount] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const fetchBatches = () => {
    setLoading(true);
    productionApi
      .getBatches({
        search: search.trim() || undefined,
        status: statusFilter,
        page,
        limit: pageSize,
      })
      .then((res) => {
        setLiveBatches(res.data);
        setTotalCount(res.pagination.total);
        setTotalPagesCount(res.pagination.pages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch batches:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBatches();
  }, [search, statusFilter, page]);

  const fallbackFilteredBatches = useMemo(() => {
    return storeBatches.filter((b) => {
      const matchSearch =
        b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.productName.toLowerCase().includes(search.toLowerCase()) ||
        b.variantName.toLowerCase().includes(search.toLowerCase()) ||
        b.vendorName.toLowerCase().includes(search.toLowerCase()) ||
        b.location.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "All" || b.status === statusFilter;
      const matchVendor = vendorFilter === "All" || b.vendorId === vendorFilter;

      return matchSearch && matchStatus && matchVendor;
    });
  }, [storeBatches, search, statusFilter, vendorFilter]);

  const displayBatches = liveBatches !== null ? liveBatches : fallbackFilteredBatches.slice((page - 1) * pageSize, page * pageSize);
  const totalBatchesCount = liveBatches !== null ? totalCount : fallbackFilteredBatches.length;
  const totalPages = liveBatches !== null ? totalPagesCount : (Math.ceil(fallbackFilteredBatches.length / pageSize) || 1);

  const toggleBatchBlock = async (batchId: string, currentStatus: string) => {
    const isCurrentlyBlocked = currentStatus === "Blocked" || currentStatus === "Quarantined";
    const nextBackendStatus = isCurrentlyBlocked ? "Active" : "Quarantined";
    const nextUiStatus: BatchStatus = isCurrentlyBlocked ? "Active" : "Blocked";

    try {
      await productionApi.updateBatchStatus(batchId, nextBackendStatus);
      vendorStore.updateBatchStatus(batchId, nextUiStatus, "Quality Assurance Officer");
      toast.success(`Batch #${batchId} status updated to ${nextBackendStatus}`);
      fetchBatches();
    } catch (err: any) {
      // Fallback local update
      vendorStore.updateBatchStatus(batchId, nextUiStatus, "Quality Assurance Officer");
      toast.success(`Batch status updated to ${nextUiStatus}`);
      fetchBatches();
    }
  };

  const exportCsv = () => {
    const headers = [
      "Batch Number",
      "Product",
      "Variant",
      "Vendor",
      "Initial Qty",
      "Available Qty",
      "Damaged Qty",
      "Expired Qty",
      "Mfg Date",
      "Expiry Date",
      "Warehouse",
      "Storage Location",
      "Status",
    ];

    const rows = displayBatches.map((b) => [
      b.batchNumber,
      `"${b.productName}"`,
      `"${b.variantName}"`,
      `"${b.vendorName}"`,
      b.initialQuantity,
      b.availableQuantity,
      b.damagedQuantity,
      b.expiredQuantity,
      b.manufacturingDate,
      b.expiryDate,
      `"${b.warehouseName}"`,
      `"${b.location}"`,
      b.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `production_batches_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProductionShell>
      <div className="space-y-6">
        <PageHeader
          title="Production Batches & Shelf Life"
          description="Lot tracking, manufacturing dates, expiration timelines, quarantine controls, and storage bin allocation."
          actions={
            <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
              <Download className="h-4 w-4" />
              Export Batches CSV
            </Button>
          }
        />

        {/* Filters */}
        <div className="bloom-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full md:w-auto">
            <SearchBox
              placeholder="Search by batch number, product, vendor, bin..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-card border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-bloom-sage"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Batches</option>
              <option value="Depleted">Depleted</option>
              <option value="Blocked">Blocked / Quarantined</option>
              <option value="Expired">Expired</option>
            </select>

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

        {/* Batches Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Product & Variant</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4 text-center">Available / Initial</th>
                  <th className="py-3 px-4 text-center">Damaged / Expired</th>
                  <th className="py-3 px-4">Shelf Life Dates</th>
                  <th className="py-3 px-4">Warehouse & Bin</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayBatches.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground">
                      No batches found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  displayBatches.map((batch) => {
                    const isBlocked = batch.status === "Blocked";

                    return (
                      <tr key={batch.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-foreground">
                          {batch.batchNumber}
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{batch.productName}</p>
                          <p className="text-xs text-muted-foreground">{batch.variantName}</p>
                        </td>

                        <td className="py-3 px-4 text-xs font-medium text-muted-foreground">
                          {batch.vendorName}
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-xs">
                          <span className="font-bold text-foreground">{batch.availableQuantity}</span>
                          <span className="text-muted-foreground"> / {batch.initialQuantity}</span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-xs text-muted-foreground">
                          {batch.damagedQuantity > 0 || batch.expiredQuantity > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                              {batch.damagedQuantity} Dmg / {batch.expiredQuantity} Exp
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-xs space-y-0.5">
                          <p className="text-muted-foreground">
                            Mfg: <span className="font-medium text-foreground">{batch.manufacturingDate}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Exp: <span className="font-semibold text-foreground">{batch.expiryDate}</span>
                          </p>
                        </td>

                        <td className="py-3 px-4 text-xs">
                          <p className="font-medium text-foreground">{batch.warehouseName}</p>
                          <p className="font-mono text-muted-foreground text-[11px]">{batch.location}</p>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                              batch.status === "Active"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : batch.status === "Blocked"
                                ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {batch.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleBatchBlock(batch.id, batch.status)}
                            className={cn(
                              "h-8 gap-1 text-xs",
                              isBlocked ? "text-emerald-600" : "text-amber-600"
                            )}
                          >
                            {isBlocked ? (
                              <>
                                <RotateCcw className="h-3.5 w-3.5" /> Unblock
                              </>
                            ) : (
                              <>
                                <Ban className="h-3.5 w-3.5" /> Quarantine
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalBatchesCount)} of {totalBatchesCount} batches
              </p>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </ProductionShell>
  );
}
