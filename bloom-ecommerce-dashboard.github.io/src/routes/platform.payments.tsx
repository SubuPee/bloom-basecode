import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, RotateCcw, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PlatformShell, money } from "@/components/bloom/platform-shell";
import { PageHeader, SearchBox, Pagination } from "@/components/bloom/ui";
import { Button } from "@/components/ui/button";
import { platformApi, type PayoutItem, type RefundItem } from "@/lib/platform-api";
import {
  transactions as fallbackTransactions,
  payouts as fallbackPayouts,
  refunds as fallbackRefunds,
  type Txn,
} from "@/lib/bloom-b2c";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/platform/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Bloom Admin" },
      {
        name: "description",
        content: "Track B2C transactions, refunds and weekly payouts for the Bloom store.",
      },
      { property: "og:title", content: "Payments — Bloom Admin" },
      {
        property: "og:description",
        content: "Track B2C transactions, refunds and weekly payouts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentsPage,
});

const tone: Record<string, string> = {
  Captured: "bg-success-soft text-success",
  Pending: "bg-warning-soft text-warning",
  Refunded: "bg-blue-soft text-blue",
  Failed: "bg-destructive/15 text-destructive",
  Processed: "bg-success-soft text-success",
  "In review": "bg-warning-soft text-warning",
  Settled: "bg-success-soft text-success",
};

function PaymentsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All status");
  const [method, setMethod] = useState("All methods");

  const [txns, setTxns] = useState<Txn[]>(fallbackTransactions);
  const [payoutList, setPayoutList] = useState<PayoutItem[]>(fallbackPayouts as PayoutItem[]);
  const [refundList, setRefundList] = useState<RefundItem[]>(fallbackRefunds as RefundItem[]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, pRes, rRes] = await Promise.allSettled([
        platformApi.getTransactions(),
        platformApi.getPayouts(),
        platformApi.getRefunds(),
      ]);

      if (tRes.status === "fulfilled" && tRes.value?.length > 0) {
        setTxns(tRes.value);
      }
      if (pRes.status === "fulfilled" && pRes.value?.length > 0) {
        setPayoutList(pRes.value);
      }
      if (rRes.status === "fulfilled" && rRes.value?.length > 0) {
        setRefundList(rRes.value);
      }
    } catch {
      // Keep fallbacks on offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const list = txns.filter((t) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      t.customer?.toLowerCase().includes(q) ||
      t.order?.toLowerCase().includes(q) ||
      t.id?.toLowerCase().includes(q);
    const matchesStatus = status === "All status" || t.status === status;
    const matchesMethod = method === "All methods" || t.method === method;
    return matchesQuery && matchesStatus && matchesMethod;
  });

  const captured = txns
    .filter((t) => t.status === "Captured")
    .reduce((s, t) => s + (t.amount || 0), 0);
  const pendingAmount = txns
    .filter((t) => t.status === "Pending")
    .reduce((s, t) => s + (t.amount || 0), 0);
  const refundedAmount = refundList.reduce((s, r) => s + (r.amount || 0), 0);
  const nextPayout = payoutList[0]?.net || 300300;

  const stats = [
    { label: "Captured", value: money(captured) },
    { label: "Pending", value: money(pendingAmount) },
    { label: "Refunded", value: money(refundedAmount) },
    { label: "Next payout", value: money(nextPayout) },
  ];

  const handleExportCsv = () => {
    try {
      const headers = ["Transaction ID", "Order ID", "Customer", "Method", "Amount", "Status", "Date", "Gateway"];
      const rows = list.map((t) => [
        t.id,
        t.order,
        `"${t.customer}"`,
        t.method,
        t.amount,
        t.status,
        `"${t.date}"`,
        `"${t.gateway}"`,
      ]);
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `bloom-payments-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Payments CSV exported successfully");
    } catch {
      toast.error("Failed to export transactions");
    }
  };

  return (
    <PlatformShell>
      <PageHeader
        title="Payments"
        description="Every rupee moving through your B2C store — captures, refunds and settlements."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => void loadData()}
              disabled={loading}
              title="Refresh payments data"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
            <Button variant="outline" className="rounded-full" onClick={handleExportCsv}>
              <Download />
              Export
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bloom-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBox
          placeholder="Search transaction, order or customer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="h-11 rounded-full border bg-background px-4 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {["All status", "Captured", "Pending", "Refunded", "Failed"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className="h-11 rounded-full border bg-background px-4 text-sm"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          {["All methods", "UPI", "Card", "Netbanking", "COD", "Wallet"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bloom-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-4 font-medium">Transaction</th>
                <th className="px-5 py-4 font-medium">Order</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Method</th>
                <th className="px-5 py-4 font-medium">Amount</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-accent/50">
                  <td className="px-5 py-4 font-medium">
                    {t.id}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {t.gateway}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      to="/orders/$orderId"
                      params={{ orderId: t.order }}
                      className="text-primary hover:underline"
                    >
                      #{t.order}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{t.customer}</td>
                  <td className="px-5 py-4 text-muted-foreground">{t.method}</td>
                  <td className="px-5 py-4 font-semibold">{money(t.amount)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tone[t.status] || "bg-muted text-muted-foreground")}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination count={list.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bloom-card p-6">
          <h2 className="text-lg font-semibold">Payouts</h2>
          <ul className="mt-4 divide-y">
            {payoutList.map((p) => (
              <li key={p.id} className="py-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{p.period}</p>
                  <span
                    className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tone[p.status] || "bg-muted text-muted-foreground")}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.id} · {p.bank} · fees {money(p.fees)} · refunds {money(p.refunds)}
                </p>
                <p className="mt-2 text-lg font-semibold">{money(p.net)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bloom-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <RotateCcw className="size-5 text-primary" />
            Refunds
          </h2>
          <ul className="mt-4 divide-y">
            {refundList.map((r) => (
              <li key={r.id} className="flex items-start gap-3 py-4 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    {r.customer} · {money(r.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{r.order} · {r.reason} · {r.date}
                  </p>
                </div>
                <span
                  className={cn(
                    "ml-auto rounded-full px-2.5 py-1 text-xs font-medium",
                    tone[r.status] || "bg-muted text-muted-foreground",
                  )}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PlatformShell>
  );
}
