import { createFileRoute } from "@tanstack/react-router";
import { ProductionHistoryPage } from "@/components/bloom/production/production-history-page";

export const Route = createFileRoute("/production/history")({
  head: () => ({
    meta: [
      { title: "Production History — Bloom Admin" },
      { name: "description", content: "Historical production work orders and QA scrap audits." },
    ],
  }),
  component: ProductionHistoryPage,
});
