import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Copy, TicketPercent, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PlatformShell } from "@/components/bloom/platform-shell";
import { PageHeader, SearchBox } from "@/components/bloom/ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { platformApi } from "@/lib/platform-api";
import { offers as fallbackOffers, type Offer } from "@/lib/bloom-b2c";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/platform/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Coupons — Bloom Admin" },
      {
        name: "description",
        content: "Create and monitor discount codes, campaigns and shopper offers.",
      },
      { property: "og:title", content: "Offers & Coupons — Bloom Admin" },
      {
        property: "og:description",
        content: "Create and monitor discount codes, campaigns and shopper offers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OffersPage,
});

const tone: Record<string, string> = {
  Active: "bg-success-soft text-success",
  Scheduled: "bg-warning-soft text-warning",
  Expired: "bg-muted text-muted-foreground",
};
const tabs = ["All", "Active", "Scheduled", "Expired"] as const;

function OffersPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = useState("");
  const [offerList, setOfferList] = useState<Offer[]>(fallbackOffers);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    type: "Percent" as "Percent" | "Flat" | "Free shipping" | "BOGO",
    value: "20%",
    minOrder: 999,
    limit: 2000,
    status: "Active" as "Active" | "Scheduled" | "Expired",
    window: "Always on",
    audience: "All customers",
  });

  const loadOffers = async () => {
    try {
      setLoading(true);
      const res = await platformApi.getOffers();
      if (res && res.length > 0) {
        setOfferList(res);
      }
    } catch {
      // Keep existing list on offline/fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOffers();
  }, []);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.title.trim()) {
      toast.error("Please provide both coupon code and title");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await platformApi.createOffer({
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        type: formData.type,
        value: formData.value.trim(),
        minOrder: Number(formData.minOrder) || 0,
        limit: Number(formData.limit) || 1000,
        status: formData.status,
        window: formData.window.trim(),
        audience: formData.audience.trim(),
      });

      toast.success(`Offer ${formData.code} created successfully!`);
      setIsCreateOpen(false);
      setOfferList((prev) => [created, ...prev]);
      setFormData({
        code: "",
        title: "",
        type: "Percent",
        value: "20%",
        minOrder: 999,
        limit: 2000,
        status: "Active",
        window: "Always on",
        audience: "All customers",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to create offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (offer: Offer) => {
    const nextStatus = offer.status === "Active" ? "Expired" : "Active";
    try {
      const updated = await platformApi.updateOffer(offer.id, { status: nextStatus });
      toast.success(`Offer ${offer.code} status changed to ${nextStatus}`);
      setOfferList((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, status: updated.status || nextStatus } : o))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update offer status");
    }
  };

  const handleDeleteOffer = async (offer: Offer) => {
    if (!confirm(`Are you sure you want to delete offer "${offer.code}"?`)) return;
    try {
      await platformApi.deleteOffer(offer.id);
      toast.success(`Offer ${offer.code} deleted`);
      setOfferList((prev) => prev.filter((o) => o.id !== offer.id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete offer");
    }
  };

  const list = offerList.filter(
    (o) =>
      (tab === "All" || o.status === tab) &&
      (!query.trim() || `${o.code} ${o.title}`.toLowerCase().includes(query.trim().toLowerCase())),
  );

  const liveCount = offerList.filter((o) => o.status === "Active").length;
  const schedCount = offerList.filter((o) => o.status === "Scheduled").length;
  const totalUsed = offerList.reduce((s, o) => s + (o.used || 0), 0);
  const bestPerformer =
    [...offerList].sort((a, b) => (b.used || 0) - (a.used || 0))[0]?.code || "FREESHIP";

  return (
    <PlatformShell>
      <PageHeader
        title="Offers & coupons"
        description="Discounts, free shipping and campaigns running on your storefront."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => void loadOffers()}
              disabled={loading}
              title="Refresh offers"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
            <Button className="rounded-full" onClick={() => setIsCreateOpen(true)}>
              <Plus />
              Create offer
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Live offers", value: liveCount },
          { label: "Scheduled", value: schedCount },
          {
            label: "Total redemptions",
            value: totalUsed.toLocaleString("en-IN"),
          },
          { label: "Best performer", value: bestPerformer },
        ].map((s) => (
          <div key={s.label} className="bloom-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBox
          placeholder="Search code or offer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "h-10 rounded-full border px-4 text-sm font-medium transition-colors",
                tab === t
                  ? "border-primary bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((o) => {
          const used = o.used || 0;
          const limit = o.limit || 1000;
          const pct = Math.min(100, Math.round((used / limit) * 100));
          return (
            <div key={o.id} className="bloom-card flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-primary/15 text-primary">
                  <TicketPercent className="size-5" />
                </span>
                <span
                  className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tone[o.status] || "bg-muted text-muted-foreground")}
                >
                  {o.status}
                </span>
              </div>
              <div>
                <p className="font-medium">{o.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {o.window} · {o.audience}
                </p>
              </div>
              <button
                onClick={() => {
                  void navigator.clipboard?.writeText(o.code);
                  toast.success(`Copied ${o.code}`);
                }}
                className="flex items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-3 text-sm font-semibold tracking-wider transition-colors hover:bg-accent"
              >
                {o.code}
                <Copy className="size-4 text-muted-foreground" />
              </button>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Discount</dt>
                  <dd className="font-medium">{o.value}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Min. order</dt>
                  <dd className="font-medium">
                    {o.minOrder ? `₹${o.minOrder.toLocaleString("en-IN")}` : "None"}
                  </dd>
                </div>
              </dl>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{used.toLocaleString("en-IN")} used</span>
                  <span>{limit.toLocaleString("en-IN")} limit</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="mt-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-full"
                  onClick={() => void handleToggleStatus(o)}
                >
                  {o.status === "Active" ? "Pause" : "Activate"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-destructive hover:bg-destructive/10"
                  onClick={() => void handleDeleteOffer(o)}
                  title="Delete offer"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Offer Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Promotional Offer</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => void handleCreateOffer(e)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="offer-code">Coupon Code *</Label>
                <Input
                  id="offer-code"
                  placeholder="e.g. FESTIVE30"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="offer-type">Discount Type</Label>
                <select
                  id="offer-type"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                >
                  <option value="Percent">Percentage</option>
                  <option value="Flat">Flat Amount</option>
                  <option value="Free shipping">Free Shipping</option>
                  <option value="BOGO">Buy 1 Get 1</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="offer-title">Campaign Title *</Label>
              <Input
                id="offer-title"
                placeholder="e.g. Festive season 30% off"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="offer-value">Value</Label>
                <Input
                  id="offer-value"
                  placeholder="30% or ₹300"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="offer-min">Min Order (₹)</Label>
                <Input
                  id="offer-min"
                  type="number"
                  placeholder="999"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="offer-limit">Usage Limit</Label>
                <Input
                  id="offer-limit"
                  type="number"
                  placeholder="2000"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="offer-window">Validity Window</Label>
                <Input
                  id="offer-window"
                  placeholder="e.g. Always on / 01 – 31 Oct"
                  value={formData.window}
                  onChange={(e) => setFormData({ ...formData, window: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="offer-audience">Target Audience</Label>
                <Input
                  id="offer-audience"
                  placeholder="e.g. All customers"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="offer-status">Initial Status</Label>
              <select
                id="offer-status"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
              >
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Save Offer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PlatformShell>
  );
}
