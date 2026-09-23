import { createFileRoute } from "@tanstack/react-router";
import { VendorActivityLogsPage } from "@/components/bloom/vendors/vendor-activity-logs";

export const Route = createFileRoute("/vendors/activity")({
  head: () => ({
    meta: [
      { title: "Vendor Activity Logs — Bloom Admin" },
      { name: "description", content: "Vendor audit trail, compliance logs, and administrative actions." },
    ],
  }),
  component: VendorActivityLogsPage,
});
