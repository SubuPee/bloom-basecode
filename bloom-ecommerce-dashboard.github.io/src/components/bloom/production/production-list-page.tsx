import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Factory,
  Plus,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Boxes,
  Eye,
  Building2,
  Package,
  Loader2,
} from "lucide-react";
import { ProductionShell } from "./production-shell";
import { PageHeader, Pagination, SearchBox } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/lib/bloom-vendor-store";
import { productionApi, ProductionOrder } from "@/lib/production-api";
import { cn } from "@/lib/utils";

export function ProductionListPage() {
  const storeProductions = useVendorStore((s) => s.getProductions());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [liveOrders, setLiveOrders] = useState<ProductionOrder[] | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPagesCount, setTotalPagesCount] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productionApi
      .getOrders({
        search: search.trim() || undefined,
        status: statusFilter,
        vendorId: vendorFilter,
        page,
        limit: pageSize,
      })
      .then((res) => {
        if (mounted) {
          setLiveOrders(res.data);
          setTotalCount(res.pagination.total);
          setTotalPagesCount(res.pagination.pages || 1);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch production orders:", err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [search, statusFilter, vendorFilter, page]);

  const fallbackFilteredOrders = useMemo(() => {
    return storeProductions.filter((p) => {
      const matchSearch =
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.productName.toLowerCase().includes(search.toLowerCase()) ||
        p.variantName.toLowerCase().includes(search.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "All" || p.status === statusFilter;
      const matchVendor = vendorFilter === "All" || p.vendorId === vendorFilter;

      return matchSearch && matchStatus && matchVendor;
    });
  }, [storeProductions, search, statusFilter, vendorFilter]);

  const displayOrders = liveOrders !== null ? liveOrders : fallbackFilteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const totalOrdersCount = liveOrders !== null ? totalCount : fallbackFilteredOrders.length;
  const totalPages = liveOrders !== null ? totalPagesCount : (Math.ceil(fallbackFilteredOrders.length / pageSize) || 1);

  const exportCsv = () => {
    const headers = [
      "Production ID",
      "Batch Number",
      "Product",
      "Variant",
      "Vendor",
      "Unit",
      "Planned Qty",
      "Produced Qty",
      "Good Qty",
      "Rejected Qty",
      "Warehouse",
      "Location",
      "Status",
      "Production Date",
      "Expected Completion",
    ];

    const rows = displayOrders.map((p) => [
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
      p.status,
      p.productionDate,
      p.expectedCompletion,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `production_orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800";
      case "In Progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-300 dark:border-blue-800";
      case "Planned":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800";
      case "Partially Completed":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-300 dark:border-purple-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <ProductionShell>
      <div className="space-y-6">
        <PageHeader
          title="Production Work Orders"
          description="Manage, schedule, track, and complete manufacturing batches with rigorous quality control recording."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Link to="/production/new">
                <Button size="sm" className="gap-2 bg-bloom-sage hover:bg-bloom-sage/90 text-white font-medium">
                  <Plus className="h-4 w-4" />
                  New Production Order
                </Button>
              </Link>
            </div>
          }
        />

        {/* Filters */}
        <div className="bloom-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full md:w-auto">
            <SearchBox
              placeholder="Search by ID, batch, product, or vendor..."
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
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Partially Completed">Partially Completed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
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

        {/* Orders Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Order & Batch</th>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4 text-center">Planned vs Output</th>
                  <th className="py-3 px-4 text-center">QA Good / Reject</th>
                  <th className="py-3 px-4">Destination & Bin</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      No production orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  displayOrders.map((order) => {
                    const statusClass = getStatusBadge(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <p className="font-mono text-xs font-bold text-foreground">{order.id}</p>
                          <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                            Batch: <span className="font-semibold text-foreground">{order.batchNumber}</span>
                          </p>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{order.productName}</p>
                          <p className="text-xs text-muted-foreground">{order.variantName}</p>
                        </td>

                        <td className="py-3 px-4 text-xs font-medium text-muted-foreground">
                          {order.vendorName}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <p className="text-xs font-bold text-foreground">
                            {order.producedQuantity} / {order.plannedQuantity} {order.unit}
                          </p>
                          <div className="w-16 h-1.5 bg-muted rounded-full mx-auto mt-1 overflow-hidden">
                            <div
                              className="h-full bg-bloom-sage rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (order.producedQuantity / order.plannedQuantity) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {order.producedQuantity > 0 ? (
                            <div className="text-xs font-mono">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {order.goodQuantity} Good
                              </span>
                              {order.rejectedQuantity > 0 && (
                                <span className="text-rose-600 dark:text-rose-400 ml-1.5 font-bold">
                                  / {order.rejectedQuantity} Rej
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending run</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-xs">
                          <p className="font-medium text-foreground">{order.warehouseName}</p>
                          <p className="text-muted-foreground font-mono text-[11px]">{order.storageLocation}</p>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                              statusClass
                            )}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Link
                            to="/production/$productionId"
                            params={{ productionId: order.id }}
                          >
                            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                              <Eye className="h-3.5 w-3.5" />
                              Details
                            </Button>
                          </Link>
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
                {Math.min(page * pageSize, totalOrdersCount)} of {totalOrdersCount} orders
              </p>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </ProductionShell>
  );
}
