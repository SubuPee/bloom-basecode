import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/bloom/reports/reports-page";

export const Route = createFileRoute("/reports/production")({
  head: () => ({
    meta: [
      { title: "Production Report — Bloom Admin" },
      { name: "description", content: "Production output, scrap rates, and finished goods inwarding." },
    ],
  }),
  component: () => <ReportsPage category="production" />,
});
