import { createFileRoute } from "@tanstack/react-router";
import { VendorPaymentsPage } from "@/components/bloom/vendors/vendor-payments-page";

export const Route = createFileRoute("/vendors/payments")({
  head: () => ({
    meta: [
      { title: "Vendor Payments — Bloom Admin" },
      { name: "description", content: "Vendor disbursement payouts, UTR tracking, and bank approvals." },
    ],
  }),
  component: VendorPaymentsPage,
});
