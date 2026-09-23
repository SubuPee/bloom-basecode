import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/bloom/dashboard-page";
export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Bloom Admin" },
      { name: "description", content: "Bloom ecommerce operations overview." },
      { property: "og:title", content: "Dashboard — Bloom Admin" },
      { property: "og:description", content: "Bloom ecommerce operations overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});
