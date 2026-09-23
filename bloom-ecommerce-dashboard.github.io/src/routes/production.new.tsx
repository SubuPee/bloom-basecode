import { createFileRoute } from "@tanstack/react-router";
import { CreateProductionPage } from "@/components/bloom/production/create-production-page";

export const Route = createFileRoute("/production/new")({
  head: () => ({
    meta: [
      { title: "Schedule Production Order — Bloom Admin" },
      { name: "description", content: "Create a new production work order, batch, and BOM requirements." },
    ],
  }),
  component: CreateProductionPage,
});
