import { createFileRoute } from "@tanstack/react-router";
import { UnitMasterPage } from "@/components/bloom/master/unit-master-page";

export const Route = createFileRoute("/units")({
  head: () => ({
    meta: [
      { title: "Unit Master & Conversions — Bloom Admin" },
      { name: "description", content: "Manage Bloom catalog units, base ratios, and conversion matrix." },
      { property: "og:title", content: "Unit Master & Conversions — Bloom Admin" },
      { property: "og:description", content: "Manage Bloom catalog units, base ratios, and conversion matrix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UnitMasterPage,
});
