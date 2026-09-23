import { createFileRoute } from "@tanstack/react-router";
import { VendorTransactionsPage } from "@/components/bloom/vendors/vendor-transactions-page";

export const Route = createFileRoute("/vendors/transactions")({
  head: () => ({
    meta: [
      { title: "Vendor Transactions — Bloom Admin" },
      { name: "description", content: "Vendor ledger transactions, order credits, commissions, and debits." },
    ],
  }),
  component: VendorTransactionsPage,
});
