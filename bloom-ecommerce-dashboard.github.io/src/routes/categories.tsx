import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/bloom/master-page";
export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Bloom Admin" },
      { name: "description", content: "Manage Bloom product categories." },
      { property: "og:title", content: "Categories — Bloom Admin" },
      { property: "og:description", content: "Manage Bloom product categories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <MasterPage kind="categories" />,
});
