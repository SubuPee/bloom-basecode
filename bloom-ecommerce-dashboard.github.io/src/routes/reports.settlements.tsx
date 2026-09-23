import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/bloom/reports/reports-page";

export const Route = createFileRoute("/reports/settlements")({
  head: () => ({
    meta: [
      { title: "Settlements Report — Bloom Admin" },
      { name: "description", content: "Vendor periodic settlements, disbursements, and bank payouts." },
    ],
  }),
  component: () => <ReportsPage category="settlements" />,
});
