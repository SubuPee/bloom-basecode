import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Eye,
  Loader2,
  MoreHorizontal,
  UserRoundCheck,
  Users,
  UserPlus,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "./app-shell";
import { PageHeader, Pagination, SearchBox, StatusBadge } from "./ui";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { customerApi, CustomerListItem, CustomerStatCard } from "@/lib/customer-api";
import { cn } from "@/lib/utils";

const statIconMap: Record<string, any> = {
  "Total customers": Users,
  "New this month": UserPlus,
  Returning: UserRoundCheck,
  "Lifetime value": WalletCards,
};

const statToneMap: Record<string, string> = {
  "Total customers": "bg-blue-soft text-blue",
  "New this month": "bg-success-soft text-success",
  Returning: "bg-orange-soft text-orange",
  "Lifetime value": "bg-pink-soft text-pink",
};

export function CustomersPage() {
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("All segments");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [customersList, setCustomersList] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [statCards, setStatCards] = useState<CustomerStatCard[]>([
    { label: "Total customers", value: "4,208", trend: "+14.2%" },
    { label: "New this month", value: "286", trend: "+18.7%" },
    { label: "Returning", value: "64%", trend: "+3.1%" },
    { label: "Lifetime value", value: "₹18,420", trend: "+9.4%" },
  ]);

  // Load KPI stats
  const fetchStats = useCallback(async () => {
    try {
      const stats = await customerApi.getCustomerStats();
      if (stats.cards && stats.cards.length > 0) {
        setStatCards(stats.cards);
      }
    } catch (err: any) {
      console.warn("Failed to load customer stats:", err);
    }
  }, []);

  // Load customers directory
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerApi.getCustomers({
        search: search.trim() || undefined,
        segment: segmentFilter !== "All segments" && segmentFilter !== "All" ? segmentFilter : undefined,
        status: statusFilter !== "All statuses" && statusFilter !== "All" ? statusFilter : undefined,
        page,
        limit: 10,
      });

      setCustomersList(res.customers);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      console.error("Failed to load customers:", err);
      toast.error(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search, segmentFilter, statusFilter, page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  return (
    <AppShell>
      <div className="space-y-7">
        <PageHeader
          title="Customers"
          description="Understand your customers and their purchase history."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, trend }) => {
            const Icon = statIconMap[label] || Users;
            const tone = statToneMap[label] || "bg-blue-soft text-blue";
            return (
              <div key={label} className="bloom-card p-5">
                <span className={cn("grid size-11 place-items-center rounded-full", tone)}>
                  <Icon className="size-5" />
                </span>
                <p className="mt-5 text-sm text-muted-foreground">{label}</p>
                <div className="mt-1 flex items-end justify-between">
                  <strong className="text-3xl">{value}</strong>
                  <span className="rounded-full bg-success-soft px-2 py-1 text-xs text-success">
                    {trend}
                  </span>
                </div>
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
              placeholder="Search customers…"
            />
            <select
              value={segmentFilter}
              onChange={(e) => {
                setSegmentFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm"
            >
              <option value="All segments">All segments</option>
              <option value="VIP">VIP</option>
              <option value="Returning">Returning</option>
              <option value="New">New</option>
              <option value="At risk">At risk</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm"
            >
              <option value="All statuses">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-muted/55 text-[11px] uppercase text-muted-foreground">
                <tr>
                  {[
                    "Customer",
                    "Location",
                    "Orders",
                    "Total spent",
                    "Segment",
                    "Status",
                    "Joined",
                    "",
                  ].map((h) => (
                    <th key={h} className="p-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td colSpan={8} className="p-4">
                        <div className="h-8 animate-pulse rounded-xl bg-muted" />
                      </td>
                    </tr>
                  ))
                ) : customersList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <Users className="mx-auto size-10 text-muted-foreground opacity-50" />
                      <p className="mt-3 text-base font-semibold">No customers found</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try adjusting your search query or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  customersList.map((c, index) => {
                    const custId = c.id || c._id;
                    const tone =
                      c.avatarTone ||
                      [
                        "bg-blue-soft text-blue",
                        "bg-pink-soft text-pink",
                        "bg-orange-soft text-orange",
                      ][index % 3];
                    const initials =
                      c.avatarInitials ||
                      c.name
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                    return (
                      <tr key={custId} className="border-t transition hover:bg-muted/35">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "grid size-10 place-items-center rounded-full text-xs font-semibold",
                                tone
                              )}
                            >
                              {initials}
                            </span>
                            <div>
                              <p className="font-medium">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{c.city}</td>
                        <td className="p-4">{c.orders}</td>
                        <td className="p-4 font-semibold">{c.spent}</td>
                        <td className="p-4">
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                            {c.segment}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="p-4 text-muted-foreground">{c.joined}</td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to="/customers/$customerId" params={{ customerId: custId }}>
                                  <Eye className="mr-2 size-4" />
                                  View customer
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination count={totalCount || customersList.length} />
        </div>
      </div>
    </AppShell>
  );
}
