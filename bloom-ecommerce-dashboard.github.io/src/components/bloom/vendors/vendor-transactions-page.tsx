import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Receipt,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Download,
  Building2,
} from "lucide-react";
import { VendorShell } from "./vendor-shell";
import { PageHeader, Pagination, SearchBox, StatusBadge } from "../ui";
import { Button } from "@/components/ui/button";
import { useVendorStore, type TransactionType, type TransactionStatus } from "@/lib/bloom-vendor-store";
import { cn } from "@/lib/utils";

const ALL_TYPES: TransactionType[] = [
  "Order Sale",
  "Commission",
  "Vendor Settlement",
  "Refund",
  "Return Deduction",
  "Shipping Charge",
  "Tax",
  "Adjustment",
  "Withdrawal",
  "Payment",
];

export function VendorTransactionsPage() {
  const transactions = useVendorStore((s) => s.getTransactions());
  const vendors = useVendorStore((s) => s.getVendors());

  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.vendorName.toLowerCase().includes(search.toLowerCase()) ||
        (t.orderNumber && t.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
        t.referenceId.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchVendor = vendorFilter === "All" || t.vendorId === vendorFilter;
      const matchType = typeFilter === "All" || t.type === typeFilter;
      return matchSearch && matchVendor && matchType;
    });
  }, [transactions, search, vendorFilter, typeFilter]);

  let totalCredits = 0;
  let totalDebits = 0;
  for (const t of transactions) {
    if (t.status === "Completed") {
      if (t.amount > 0) totalCredits += t.amount;
      else totalDebits += Math.abs(t.amount);
    }
  }

  return (
    <VendorShell>
      <div className="space-y-7">
        <PageHeader
          title="Vendor Financial Ledger & Transactions"
          description="Real-time transaction stream tracking order sales, commission charges, refunds, return clawbacks, and bank payouts."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/reports">
                <Download className="size-4" />
                Export Ledger
              </Link>
            </Button>
          }
        />

        {/* Ledger Summary Cards */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="bloom-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-success-soft text-success">
                <ArrowDownLeft className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Total Gross Inflows</p>
                <h3 className="text-2xl font-bold">₹{totalCredits.toLocaleString("en-IN")}</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Order sales credited before platform take-rates</p>
          </div>

          <div className="bloom-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-destructive/15 text-destructive">
                <ArrowUpRight className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Total Outflows & Deductions</p>
                <h3 className="text-2xl font-bold">₹{totalDebits.toLocaleString("en-IN")}</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Commissions, return refunds, and disbursed settlements</p>
          </div>

          <div className="bloom-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-blue-soft text-blue">
                <Wallet className="size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Net Retained Reserve</p>
                <h3 className="text-2xl font-bold">₹{(totalCredits - totalDebits).toLocaleString("en-IN")}</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Available balance held across active marketplace vendors</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bloom-card p-5 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <SearchBox
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Txn ID, Order #, Reference #, or Vendor…"
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
              aria-label="Filter by Transaction Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-11 rounded-full border bg-muted/50 px-4 text-sm font-medium"
            >
              <option value="All">All Transaction Types</option>
              {ALL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {(search || vendorFilter !== "All" || typeFilter !== "All") && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setSearch("");
                  setVendorFilter("All");
                  setTypeFilter("All");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bloom-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Transaction ID</th>
                  <th className="px-5 py-4">Vendor Partner</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Order / Reference #</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((txn) => (
                  <tr key={txn.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-xs text-primary">
                      {txn.id}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to="/vendors/$vendorId"
                        params={{ vendorId: txn.vendorId }}
                        className="font-medium hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <Building2 className="size-3.5 text-muted-foreground" />
                        {txn.vendorName}
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                        {txn.type}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs">
                      <div>{txn.orderNumber || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">{txn.referenceId}</div>
                    </td>

                    <td className="px-5 py-4 text-xs text-muted-foreground max-w-xs truncate">
                      {txn.description}
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-sm">
                      <span className={txn.amount >= 0 ? "text-success" : "text-destructive"}>
                        {txn.amount >= 0
                          ? `+₹${txn.amount.toLocaleString("en-IN")}`
                          : `-₹${Math.abs(txn.amount).toLocaleString("en-IN")}`}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {txn.createdDate}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={txn.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination count={filtered.length} />
        </div>
      </div>
    </VendorShell>
  );
}
