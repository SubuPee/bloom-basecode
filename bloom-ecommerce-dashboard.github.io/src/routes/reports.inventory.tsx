import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/bloom/reports/reports-page";

export const Route = createFileRoute("/reports/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory Report — Bloom Admin" },
      { name: "description", content: "Inventory valuation, available vs reserved stock, and turnover." },
    ],
  }),
  component: () => <ReportsPage category="inventory" />,
});
