import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/bloom/reports/reports-page";

export const Route = createFileRoute("/reports/")({
  head: () => ({
    meta: [
      { title: "Reports Overview — Bloom Admin" },
      { name: "description", content: "Analytics, executive reporting center, and data exports." },
    ],
  }),
  component: () => <ReportsPage category="overview" />,
});
