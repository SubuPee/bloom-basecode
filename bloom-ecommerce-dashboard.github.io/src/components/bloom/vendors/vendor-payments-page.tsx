import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Building2,
  Banknote,
  Send,
  AlertCircle,
  FileCheck,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVendorStore, vendorStore, type VendorPayment } from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function VendorPaymentsPage() {
  useEffect(() => {
    vendorStore.syncFromBackend();
  }, []);

  const payments = useVendorStore((s) => s.getPayments());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [disburseModal, setDisburseModal] = useState<VendorPayment | null>(null);
  const [utrNumber, setUtrNumber] = useState("");

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(search.toLowerCase()) ||
        p.settlementId.toLowerCase().includes(search.toLowerCase()) ||
        p.referenceId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [payments, search, statusFilter]);

  function handleProcessPayment() {
    if (!disburseModal) return;
    const finalUtr = utrNumber.trim() || `UTR/HDFC/${Date.now().toString().slice(-8)}`;
    vendorStore.processPayment(disburseModal.id, finalUtr);
    toast.success(`Payment #${disburseModal.id} marked as Paid with UTR: ${finalUtr}`);
    setDisburseModal(null);
    setUtrNumber("");
  }

  return (
    <VendorShell>
      <div className="space-y-7">
        <PageHeader
          title="Vendor Disbursements & Payment Gateway"
          description="Process approved vendor settlements, execute bank remittances (NEFT / RTGS / UPI), and record bank reference UTR IDs."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/vendors/settlements">
                <FileCheck className="size-4" />
                View Approved Settlements
              </Link>
            </Button>
          }
        />

        {/* Filters */}
        <div className="bloom-card p-5 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <SearchBox
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Payment ID, Settlement Ref, UTR, or Vendor…"
            />

            <select
              aria-label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved / Queued</option>
              <option value="Completed">Completed / Paid</option>
              <option value="Failed">Failed</option>
            </select>

            {(search || statusFilter !== "All") && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Payment ID</th>
                  <th className="px-5 py-4">Vendor Partner</th>
                  <th className="px-5 py-4">Settlement ID</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Bank & Account</th>
                  <th className="px-5 py-4">Disbursement Ref / UTR</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-xs text-primary">
                      {p.id}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to="/vendors/$vendorId"
                        params={{ vendorId: p.vendorId }}
                        className="font-medium hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <Building2 className="size-3.5 text-muted-foreground" />
                        {p.vendorName}
                      </Link>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs">
                      {p.settlementId}
                    </td>

                    <td className="px-5 py-4 font-bold text-base text-foreground">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-xs font-mono">
                      <div>{p.method} · {p.bankAccountMasked}</div>
                      <div className="text-muted-foreground">{p.ifsc}</div>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {p.referenceId}
                    </td>

                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {p.processedDate || p.requestedDate}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      {p.status !== "Completed" ? (
                        <Button
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => {
                            setDisburseModal(p);
                            setUtrNumber(`UTR/HDFC/${Date.now().toString().slice(-8)}`);
                          }}
                        >
                          <Send className="size-3 mr-1" />
                          Mark Paid
                        </Button>
                      ) : (
                        <span className="text-xs text-success font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="size-3.5" />
                          Settled
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

      {/* Disburse Modal */}
      <Dialog open={!!disburseModal} onOpenChange={(open) => !open && setDisburseModal(null)}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Disburse Payment · {disburseModal?.vendorName}</DialogTitle>
            <DialogDescription>
              Record the bank remittance UTR number for Settlement #{disburseModal?.settlementId}.
            </DialogDescription>
          </DialogHeader>

          {disburseModal && (
            <div className="space-y-4 py-2 text-sm">
              <div className="rounded-2xl border bg-muted/30 p-4 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payable Amount:</span>
                  <span className="font-bold text-base text-success">₹{disburseModal.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Beneficiary Account:</span>
                  <span className="font-mono">{disburseModal.bankAccountMasked} ({disburseModal.ifsc})</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Transfer Method:</span>
                  <span className="font-semibold">{disburseModal.method}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Bank UTR / Transaction Reference Number</Label>
                <Input
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. UTR/HDFC/99248102"
                  className="rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setDisburseModal(null)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={handleProcessPayment}>
              Confirm Disbursement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VendorShell>
  );
}
