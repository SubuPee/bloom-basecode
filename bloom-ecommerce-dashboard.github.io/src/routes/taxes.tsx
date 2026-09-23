import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/bloom/master-page";
export const Route = createFileRoute("/taxes")({
  head: () => ({
    meta: [
      { title: "Taxes — Bloom Admin" },
      { name: "description", content: "Manage Bloom tax rules." },
      { property: "og:title", content: "Taxes — Bloom Admin" },
      { property: "og:description", content: "Manage Bloom tax rules." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <MasterPage kind="taxes" />,
});
