import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/bloom/master-page";
export const Route = createFileRoute("/sub-categories")({
  head: () => ({
    meta: [
      { title: "Sub-Categories — Bloom Admin" },
      { name: "description", content: "Manage Bloom product sub-categories." },
      { property: "og:title", content: "Sub-Categories — Bloom Admin" },
      { property: "og:description", content: "Manage Bloom product sub-categories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <MasterPage kind="sub-categories" />,
});
