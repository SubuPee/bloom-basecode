import { createFileRoute } from "@tanstack/react-router";
import { VendorDashboard } from "@/components/bloom/vendors/vendor-dashboard";

export const Route = createFileRoute("/vendors/")({
  head: () => ({
    meta: [
      { title: "Vendor Dashboard — Bloom Admin" },
      { name: "description", content: "Vendor management dashboard, KPIs, and overview." },
    ],
  }),
  component: VendorDashboard,
});
