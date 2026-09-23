import { createFileRoute } from "@tanstack/react-router";
import { VendorSettlementsPage } from "@/components/bloom/vendors/vendor-settlements-page";

export const Route = createFileRoute("/vendors/settlements")({
  head: () => ({
    meta: [
      { title: "Vendor Settlements — Bloom Admin" },
      { name: "description", content: "Vendor periodic settlements, fee deductions, and net payout calculation." },
    ],
  }),
  component: VendorSettlementsPage,
});
