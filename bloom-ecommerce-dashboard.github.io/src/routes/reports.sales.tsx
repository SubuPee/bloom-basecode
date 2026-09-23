import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/bloom/reports/reports-page";

export const Route = createFileRoute("/reports/sales")({
  head: () => ({
    meta: [
      { title: "Vendor Sales Report — Bloom Admin" },
      { name: "description", content: "Vendor gross merchandise volume, commission, and net earnings." },
    ],
  }),
  component: () => <ReportsPage category="sales" />,
});
