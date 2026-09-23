import { createFileRoute } from "@tanstack/react-router";
import { ProductionListPage } from "@/components/bloom/production/production-list-page";

export const Route = createFileRoute("/production/list")({
  head: () => ({
    meta: [
      { title: "Production Orders — Bloom Admin" },
      { name: "description", content: "Work orders list, progress tracking, and batch assignments." },
    ],
  }),
  component: ProductionListPage,
});
