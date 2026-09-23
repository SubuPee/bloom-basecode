import { createFileRoute } from "@tanstack/react-router";
import { MasterDetail } from "@/components/bloom/master-detail";
export const Route = createFileRoute("/master/$kind/$itemId")({
  head: () => ({
    meta: [
      { title: "Record Details — Bloom Admin" },
      { name: "description", content: "Review a Bloom master-data record." },
      { property: "og:title", content: "Record Details — Bloom Admin" },
      { property: "og:description", content: "Review a Bloom master-data record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MasterDetail,
});
