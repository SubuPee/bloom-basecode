import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/bloom/reports/reports-page";

export const Route = createFileRoute("/reports/returns")({
  head: () => ({
    meta: [
      { title: "Returns Report — Bloom Admin" },
      { name: "description", content: "Customer returns, QA inspections, salvage, and restock rates." },
    ],
  }),
  component: () => <ReportsPage category="returns" />,
});
