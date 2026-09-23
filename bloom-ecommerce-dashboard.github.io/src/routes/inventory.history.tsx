import { createFileRoute } from "@tanstack/react-router";
import { StockHistoryPage } from "@/components/bloom/inventory/stock-history-page";

export const Route = createFileRoute("/inventory/history")({
  head: () => ({
    meta: [
      { title: "Stock Audit History — Bloom Admin" },
      { name: "description", content: "Complete historical audit log of all inventory movements." },
    ],
  }),
  component: StockHistoryPage,
});
