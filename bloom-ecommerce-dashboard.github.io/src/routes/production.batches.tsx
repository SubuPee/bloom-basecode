import { createFileRoute } from "@tanstack/react-router";
import { ProductionBatchesPage } from "@/components/bloom/production/production-batches-page";

export const Route = createFileRoute("/production/batches")({
  head: () => ({
    meta: [
      { title: "Production Batches — Bloom Admin" },
      { name: "description", content: "Production batches, expiration tracking, and quarantine control." },
    ],
  }),
  component: ProductionBatchesPage,
});
