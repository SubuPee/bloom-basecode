import { createFileRoute } from "@tanstack/react-router";
import { ProductionBatchesPage } from "@/components/bloom/production/production-batches-page";

export const Route = createFileRoute("/master/batches")({
  head: () => ({
    meta: [
      { title: "Batch Master — Bloom Admin" },
      { name: "description", content: "Master batch registry, expiration tracking, and lot segregation." },
    ],
  }),
  component: ProductionBatchesPage,
});
