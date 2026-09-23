import { createFileRoute } from "@tanstack/react-router";
import { ProductionDashboard } from "@/components/bloom/production/production-dashboard";

export const Route = createFileRoute("/production/")({
  head: () => ({
    meta: [
      { title: "Production Management — Bloom Admin" },
      { name: "description", content: "Manufacturing work orders, batches, QA output, and finished goods." },
    ],
  }),
  component: ProductionDashboard,
});
