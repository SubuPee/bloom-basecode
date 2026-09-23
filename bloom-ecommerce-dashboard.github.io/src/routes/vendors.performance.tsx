import { createFileRoute } from "@tanstack/react-router";
import { VendorPerformancePage } from "@/components/bloom/vendors/vendor-performance-page";

export const Route = createFileRoute("/vendors/performance")({
  head: () => ({
    meta: [
      { title: "Vendor Performance — Bloom Admin" },
      { name: "description", content: "Vendor KPI scorecards, ratings, fulfillment speed, and return rates." },
    ],
  }),
  component: VendorPerformancePage,
});
