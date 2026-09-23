import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/bloom/reports/reports-page";

export const Route = createFileRoute("/reports/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions Report — Bloom Admin" },
      { name: "description", content: "Vendor credit/debit transaction ledger and platform fees." },
    ],
  }),
  component: () => <ReportsPage category="transactions" />,
});
