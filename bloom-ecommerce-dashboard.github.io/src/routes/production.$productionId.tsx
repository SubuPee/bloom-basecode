import { createFileRoute } from "@tanstack/react-router";
import { ProductionDetailPage } from "@/components/bloom/production/production-detail-page";

export const Route = createFileRoute("/production/$productionId")({
  head: () => ({
    meta: [
      { title: "Production Order Details — Bloom Admin" },
      { name: "description", content: "Production work order details, QA completion, and batch allocation." },
    ],
  }),
  component: ProductionDetailPage,
});
