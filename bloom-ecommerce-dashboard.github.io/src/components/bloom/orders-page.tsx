import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Download,
  Eye,
  Loader2,
  MoreHorizontal,
  PackageCheck,
  PackageOpen,
  RotateCcw,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "./app-shell";
import { PageHeader, Pagination, SearchBox } from "./ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ordersApi, OrderListItem, OrderStatCard } from "@/lib/orders-api";

const statusTone: Record<string, string> = {
  Processing: "bg-orange-soft text-orange",
  Shipped: "bg-blue-soft text-blue",
  Delivered: "bg-success-soft text-success",
  Returned: "bg-pink-soft text-pink",
  Cancelled: "bg-muted text-muted-foreground",
};

const iconMap: Record<string, any> = {
  "New orders": PackageOpen,
  Processing: PackageCheck,
  "In transit": Truck,
  Returns: RotateCcw,
};

const toneMap: Record<string, string> = {
  "New orders": "bg-blue-soft text-blue",
  Processing: "bg-orange-soft text-orange",
  "In transit": "bg-success-soft text-success",
  Returns: "bg-pink-soft text-pink",
};

export function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All payments");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [ordersList, setOrdersList] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const [statCards, setStatCards] = useState<OrderStatCard[]>([
    { label: "New orders", value: "128", detail: "12 since yesterday" },
    { label: "Processing", value: "34", detail: "8 need attention" },
    { label: "In transit", value: "67", detail: "92% on schedule" },
    { label: "Returns", value: "9", detail: "1.8% return rate" },
  ]);

  // Load metrics stats
  const fetchStats = useCallback(async () => {
    try {
      const stats = await ordersApi.getOrderStats();
      if (stats.cards && stats.cards.length > 0) {
        setStatCards(stats.cards);
      }
    } catch (err: any) {
      console.warn("Failed to load order stats:", err);
    }
  }, []);

  // Load orders list
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getOrders({
        search: search.trim() || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        payment:
          paymentFilter !== "All payments" && paymentFilter !== "All"
            ? paymentFilter
            : undefined,
        page,
        limit: 10,
      });

      setOrdersList(res.orders);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      toast.error(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, paymentFilter, page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPaymentFilter("All payments");
    setPage(1);
    setSelected([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(ordersList.map((o) => o.id || o.orderNumber));
    } else {
      setSelected([]);
    }
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await ordersApi.exportOrders("csv");
      toast.success("Orders CSV exported successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to export orders");
    } finally {
      setExporting(false);
    }
  };

  const handleBulkStatus = async (status: string) => {
    if (selected.length === 0) return;
    try {
      await ordersApi.bulkUpdateStatus(selected, status);
      toast.success(`Updated status to ${status} for ${selected.length} order(s)`);
      setSelected([]);
      fetchOrders();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Bulk status update failed");
    }
  };

  const handleQuickStatusUpdate = async (id: string, currentStatus: string) => {
    const nextStatusMap: Record<string, string> = {
      Processing: "Shipped",
      Shipped: "Delivered",
      Delivered: "Processing",
      Returned: "Processing",
      Cancelled: "Processing",
    };
    const next = nextStatusMap[currentStatus] || "Shipped";
    try {
      await ordersApi.updateOrderStatus(id, next);
      toast.success(`Order #${id} marked as ${next}`);
      fetchOrders();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    }
  };

  const handleDownloadInvoice = async (id: string) => {
    try {
      const invoice = await ordersApi.getOrderInvoice(id);
      toast.success(`Invoice ${invoice.invoiceNumber} ready`);
      window.print();
    } catch (err: any) {
      toast.error(err.message || "Failed to retrieve invoice");
    }
  };

  const allSelected =
    ordersList.length > 0 &&
    ordersList.every((o) => selected.includes(o.id || o.orderNumber));

  return (
    <AppShell>
      <div className="space-y-7">
        <PageHeader
          title="Orders"
          description="Track, fulfill and manage every customer order."
          action={
            <Button
              variant="outline"
              disabled={exporting}
              onClick={handleExport}
              className="h-11 rounded-full px-5"
            >
              {exporting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download />
              )}
              Export orders
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, detail }) => {
            const Icon = iconMap[label] || PackageOpen;
            const tone = toneMap[label] || "bg-blue-soft text-blue";
            return (
              <div key={label} className="bloom-card bloom-panel-hover p-5">
                <div className={cn("grid size-11 place-items-center rounded-full", tone)}>
                  <Icon className="size-5" />
                </div>
                <p className="mt-5 text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-semibold">{value}</p>
                <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
              </div>
            );
          })}
        </div>

        <div className="bloom-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b p-5 lg:flex-row">
            <SearchBox
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search order or customer…"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm"
            >
              <option value="All">All statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Returned">Returned</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm"
            >
              <option value="All payments">All payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed</option>
            </select>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-3 border-b bg-blue-soft p-3 text-sm">
              <strong>{selected.length} selected</strong>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatus("Shipped")}
              >
                Mark Shipped
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatus("Delivered")}
              >
                Mark Delivered
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="mt-3 text-sm">Loading orders…</p>
            </div>
          ) : ordersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <p className="text-base font-semibold">No orders found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search criteria or status filter.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={handleClearFilters}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-muted/55 text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="p-4">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(v) => handleSelectAll(Boolean(v))}
                      />
                    </th>
                    {[
                      "Order",
                      "Customer",
                      "Date",
                      "Items",
                      "Total",
                      "Payment",
                      "Fulfillment",
                      "",
                    ].map((h) => (
                      <th key={h} className="p-4 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((o) => {
                    const orderId = o.id || o.orderNumber;
                    const isSelected = selected.includes(orderId);
                    return (
                      <tr key={orderId} className="border-t transition hover:bg-muted/35">
                        <td className="p-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(v) =>
                              handleToggleSelect(orderId, Boolean(v))
                            }
                          />
                        </td>
                        <td className="p-4 font-semibold text-blue">
                          <Link
                            to="/orders/$orderId"
                            params={{ orderId }}
                            className="hover:underline"
                          >
                            #{orderId}
                          </Link>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{o.customer}</p>
                          <p className="text-xs text-muted-foreground">
                            {o.customerSegment || "Verified customer"}
                          </p>
                        </td>
                        <td className="p-4 text-muted-foreground">{o.date}</td>
                        <td className="p-4">{o.items}</td>
                        <td className="p-4 font-semibold">{o.total}</td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs",
                              o.payment === "Paid"
                                ? "bg-success-soft text-success"
                                : o.payment === "Pending"
                                  ? "bg-orange-soft text-orange"
                                  : "bg-pink-soft text-pink"
                            )}
                          >
                            {o.payment}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs",
                              statusTone[o.status] || "bg-muted text-muted-foreground"
                            )}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to="/orders/$orderId" params={{ orderId }}>
                                  <Eye className="mr-2 size-4" />
                                  View order
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleQuickStatusUpdate(orderId, o.status)}
                              >
                                <Truck className="mr-2 size-4" />
                                Update status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadInvoice(orderId)}
                              >
                                <Download className="mr-2 size-4" />
                                Download invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Pagination count={totalCount || ordersList.length} />
        </div>
      </div>
    </AppShell>
  );
}
