import { createFileRoute } from "@tanstack/react-router";
import { MasterPage } from "@/components/bloom/master-page";
export const Route = createFileRoute("/attributes")({
  head: () => ({
    meta: [
      { title: "Attributes — Bloom Admin" },
      { name: "description", content: "Manage Bloom product attributes." },
      { property: "og:title", content: "Attributes — Bloom Admin" },
      { property: "og:description", content: "Manage Bloom product attributes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <MasterPage kind="attributes" />,
});
