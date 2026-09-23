import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Banknote,
  CheckCircle2,
  Clock,
  Plus,
  Building2,
  Calendar,
  AlertCircle,
  FileCheck,
  Send,
  Eye,
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
import { Label } from "@/components/ui/label";
import { useVendorStore, vendorStore, type VendorSettlement, type SettlementStatus } from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function VendorSettlementsPage() {
  useEffect(() => {
    vendorStore.syncFromBackend();
  }, []);

  const settlements = useVendorStore((s) => s.getSettlements());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || "VEN-1001");
  const [period, setPeriod] = useState("11 – 17 Sep 2026");

  const filtered = useMemo(() => {
    return settlements.filter((s) => {
      const matchSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.vendorName.toLowerCase().includes(search.toLowerCase()) ||
        s.settlementPeriod.toLowerCase().includes(search.toLowerCase());
      const matchVendor = vendorFilter === "All" || s.vendorId === vendorFilter;
      const matchStatus = statusFilter === "All" || s.paymentStatus === statusFilter;
      return matchSearch && matchVendor && matchStatus;
    });
  }, [settlements, search, vendorFilter, statusFilter]);

  function handleCreateSettlement() {
    try {
      const res = vendorStore.generateSettlement(selectedVendorId, period);
      toast.success(`Generated settlement #${res.id} for ₹${res.netPayable.toLocaleString("en-IN")}`);
      setGenerateModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate settlement");
    }
  }

  function handleApproveSettlement(id: string) {
    vendorStore.approveSettlement(id);
    toast.success(`Settlement #${id} approved and routed to Payment Disbursement Queue.`);
  }

  return (
    <VendorShell>
      <div className="space-y-7">
        <PageHeader
          title="Vendor Settlement Management"
          description="Automate settlement periods, calculate marketplace commissions, account for return adjustments, and approve vendor disbursements."
          action={
            <div className="flex gap-2.5">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/vendors/payments">
                  <Banknote className="size-4" />
                  Disbursement Queue
                </Link>
              </Button>
              <Button className="rounded-full" onClick={() => setGenerateModalOpen(true)}>
                <Plus className="size-4" />
                Generate New Settlement
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
              placeholder="Search by Settlement ID, Period, or Vendor…"
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
              aria-label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="On Hold">On Hold</option>
            </select>

            {(search || vendorFilter !== "All" || statusFilter !== "All") && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setSearch("");
                  setVendorFilter("All");
                  setStatusFilter("All");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Settlements Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Settlement ID</th>
                  <th className="px-5 py-4">Vendor Partner</th>
                  <th className="px-5 py-4">Period</th>
                  <th className="px-5 py-4">Gross Sales</th>
                  <th className="px-5 py-4">Commission</th>
                  <th className="px-5 py-4">Refunds</th>
                  <th className="px-5 py-4">Net Payable</th>
                  <th className="px-5 py-4">Settlement Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-xs text-primary">
                      {s.id}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to="/vendors/$vendorId"
                        params={{ vendorId: s.vendorId }}
                        className="font-medium hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <Building2 className="size-3.5 text-muted-foreground" />
                        {s.vendorName}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-xs font-medium">
                      {s.settlementPeriod}
                    </td>

                    <td className="px-5 py-4 font-semibold text-sm">
                      ₹{s.totalSales.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-destructive">
                      -₹{s.commission.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-destructive">
                      -₹{s.refunds.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 font-bold text-success text-sm">
                      ₹{s.netPayable.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {s.settlementDate}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={s.paymentStatus} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      {s.paymentStatus === "Pending" && (
                        <Button
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => handleApproveSettlement(s.id)}
                        >
                          Approve Payout
                        </Button>
                      )}
                      {s.paymentStatus === "Approved" && (
                        <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
                          <Link to="/vendors/payments">Queue Payout</Link>
                        </Button>
                      )}
                      {s.paymentStatus === "Paid" && (
                        <span className="text-xs text-muted-foreground font-mono">
                          Ref: {s.referenceNumber || "Disbursed"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination count={filtered.length} />
        </div>
      </div>

      {/* Generate Settlement Modal */}
      <Dialog open={generateModalOpen} onOpenChange={setGenerateModalOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Vendor Settlement</DialogTitle>
            <DialogDescription>
              Calculate sales, apply commission fee schedules, and deduce customer returns for the period.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-1.5">
              <Label>Select Vendor</Label>
              <select
                aria-label="Select Vendor"
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="h-11 w-full rounded-2xl border bg-background px-3 text-sm font-medium"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.businessName} ({v.commissionRate}% Commission)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Settlement Window</Label>
              <select
                aria-label="Settlement Window"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-11 w-full rounded-2xl border bg-background px-3 text-sm font-medium"
              >
                <option value="11 – 17 Sep 2026">11 – 17 Sep 2026 (Weekly)</option>
                <option value="04 – 10 Sep 2026">04 – 10 Sep 2026 (Weekly)</option>
                <option value="01 – 15 Sep 2026">01 – 15 Sep 2026 (Bi-Weekly)</option>
                <option value="01 – 31 Aug 2026">01 – 31 Aug 2026 (Monthly)</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={handleCreateSettlement}>
              Calculate & Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VendorShell>
  );
}
