import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Star, Truck, LifeBuoy, Check, X, RefreshCw, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { PlatformShell } from "@/components/bloom/platform-shell";
import { PageHeader } from "@/components/bloom/ui";
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
import {
  platformApi,
  type ReviewItem,
  type TicketItem,
  type ShippingZoneItem,
} from "@/lib/platform-api";
import {
  reviews as fallbackReviews,
  supportTickets as fallbackTickets,
  shippingZones as fallbackZones,
} from "@/lib/bloom-b2c";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/platform/operations")({
  head: () => ({
    meta: [
      { title: "Operations — Bloom Admin" },
      {
        name: "description",
        content: "Moderate reviews, resolve support tickets and manage shipping zones.",
      },
      { property: "og:title", content: "Operations — Bloom Admin" },
      {
        property: "og:description",
        content: "Moderate reviews, resolve support tickets and manage shipping zones.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OperationsPage,
});

const tone: Record<string, string> = {
  Open: "bg-warning-soft text-warning",
  "In progress": "bg-blue-soft text-blue",
  Resolved: "bg-success-soft text-success",
  Closed: "bg-muted text-muted-foreground",
  Pending: "bg-warning-soft text-warning",
  Approved: "bg-success-soft text-success",
  Rejected: "bg-destructive/15 text-destructive",
  High: "bg-destructive/15 text-destructive",
  Medium: "bg-warning-soft text-warning",
  Low: "bg-muted text-muted-foreground",
};

function OperationsPage() {
  const [reviewList, setReviewList] = useState<ReviewItem[]>(fallbackReviews as ReviewItem[]);
  const [ticketList, setTicketList] = useState<TicketItem[]>(fallbackTickets as TicketItem[]);
  const [zonesList, setZonesList] = useState<ShippingZoneItem[]>(fallbackZones);
  const [loading, setLoading] = useState(true);

  // Create Ticket Dialog State
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    customer: "",
    subject: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    channel: "Web Portal",
  });
  const [isTicketSubmitting, setIsTicketSubmitting] = useState(false);

  // Edit Shipping Zones Dialog State
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [editZones, setEditZones] = useState<ShippingZoneItem[]>([]);
  const [isZoneSubmitting, setIsZoneSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, tRes, zRes] = await Promise.allSettled([
        platformApi.getReviews(),
        platformApi.getTickets(),
        platformApi.getShippingZones(),
      ]);

      if (rRes.status === "fulfilled" && rRes.value?.length > 0) {
        setReviewList(rRes.value);
      }
      if (tRes.status === "fulfilled" && tRes.value?.length > 0) {
        setTicketList(tRes.value);
      }
      if (zRes.status === "fulfilled" && zRes.value?.length > 0) {
        setZonesList(zRes.value);
      }
    } catch {
      // Fallback seamlessly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleModerateReview = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await platformApi.updateReviewStatus(id, status);
      toast.success(`Review ${status.toLowerCase()}`);
      setReviewList((prev) =>
        prev.map((r) => (r.id === id || r._id === id ? { ...r, status } : r))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to moderate review");
    }
  };

  const handleCycleTicketStatus = async (ticket: TicketItem) => {
    const nextMap: Record<string, "Open" | "In progress" | "Resolved" | "Closed"> = {
      Open: "In progress",
      "In progress": "Resolved",
      Resolved: "Closed",
      Closed: "Open",
    };
    const nextStatus = nextMap[ticket.status] || "Resolved";
    const id = ticket.id || ticket._id;
    if (!id) return;

    try {
      await platformApi.updateTicketStatus(id, nextStatus);
      toast.success(`Ticket #${ticket.id} marked as ${nextStatus}`);
      setTicketList((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: nextStatus } : t))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update ticket");
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.customer.trim() || !ticketForm.subject.trim()) {
      toast.error("Please fill in customer name and subject");
      return;
    }

    try {
      setIsTicketSubmitting(true);
      const created = await platformApi.createTicket({
        customer: ticketForm.customer.trim(),
        subject: ticketForm.subject.trim(),
        priority: ticketForm.priority,
        channel: ticketForm.channel,
      });

      toast.success("Support ticket opened successfully");
      setIsTicketDialogOpen(false);
      setTicketList((prev) => [created, ...prev]);
      setTicketForm({
        customer: "",
        subject: "",
        priority: "Medium",
        channel: "Web Portal",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to open ticket");
    } finally {
      setIsTicketSubmitting(false);
    }
  };

  const handleOpenZoneDialog = () => {
    setEditZones(JSON.parse(JSON.stringify(zonesList)));
    setIsZoneDialogOpen(true);
  };

  const handleSaveZones = async () => {
    try {
      setIsZoneSubmitting(true);
      const updated = await platformApi.updateShippingZones(editZones);
      toast.success("Shipping zones updated successfully");
      setZonesList(updated);
      setIsZoneDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update shipping zones");
    } finally {
      setIsZoneSubmitting(false);
    }
  };

  return (
    <PlatformShell>
      <PageHeader
        title="Operations"
        description="Reviews, customer support and delivery rules for your B2C shoppers."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => void loadData()}
              disabled={loading}
              title="Refresh operations data"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
            <Button className="rounded-full" onClick={() => setIsTicketDialogOpen(true)}>
              <Plus />
              New ticket
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reviews Section */}
        <div className="bloom-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Star className="size-5 text-primary" />
              Review moderation
            </h2>
            <span className="text-xs text-muted-foreground">
              {reviewList.filter((r) => r.status === "Pending").length} pending
            </span>
          </div>
          <ul className="mt-4 divide-y">
            {reviewList.map((r) => (
              <li key={r.id || r._id} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.product}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.customer} · {r.date}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-sm text-warning">
                    {r.rating}
                    <Star className="size-3.5 fill-current" />
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      tone[r.status] || "bg-muted text-muted-foreground",
                    )}
                  >
                    {r.status}
                  </span>
                  {r.status === "Pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto rounded-full"
                        onClick={() => void handleModerateReview(r.id || r._id!, "Approved")}
                      >
                        <Check className="size-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-destructive hover:bg-destructive/10"
                        onClick={() => void handleModerateReview(r.id || r._id!, "Rejected")}
                      >
                        <X className="size-3.5" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Tickets & Shipping Zones */}
        <div className="space-y-6">
          <div className="bloom-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <LifeBuoy className="size-5 text-primary" />
                Support tickets
              </h2>
              <span className="text-xs text-muted-foreground">
                {ticketList.filter((t) => t.status !== "Resolved" && t.status !== "Closed").length} active
              </span>
            </div>
            <ul className="mt-4 divide-y">
              {ticketList.map((t) => (
                <li
                  key={t.id || t._id}
                  className="group flex cursor-pointer items-start gap-3 py-4 text-sm transition-colors hover:bg-accent/40"
                  onClick={() => void handleCycleTicketStatus(t)}
                  title="Click to advance ticket status"
                >
                  <div className="min-w-0">
                    <p className="font-medium group-hover:text-primary">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.id} · {t.customer} {t.age ? `· ${t.age} old` : ""}
                    </p>
                  </div>
                  <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        tone[t.status] || "bg-muted text-muted-foreground",
                      )}
                    >
                      {t.status}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px]",
                        tone[t.priority] || "bg-muted text-muted-foreground",
                      )}
                    >
                      {t.priority}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bloom-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Truck className="size-5 text-primary" />
                Shipping zones
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-xs"
                onClick={handleOpenZoneDialog}
              >
                <Edit2 className="size-3.5 mr-1" />
                Configure
              </Button>
            </div>
            <ul className="mt-4 divide-y">
              {zonesList.map((z) => (
                <li key={z.zone} className="py-4 text-sm">
                  <p className="font-medium">{z.zone}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {z.rate} · {z.eta} · {z.partners}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* New Support Ticket Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Open Support Ticket</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => void handleCreateTicket(e)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="ticket-customer">Customer Name *</Label>
              <Input
                id="ticket-customer"
                placeholder="e.g. Rahul Verma"
                value={ticketForm.customer}
                onChange={(e) => setTicketForm({ ...ticketForm, customer: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ticket-subject">Subject / Issue Summary *</Label>
              <Input
                id="ticket-subject"
                placeholder="e.g. Delivery delayed beyond promised date"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ticket-priority">Priority</Label>
                <select
                  id="ticket-priority"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={ticketForm.priority}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, priority: e.target.value as any })
                  }
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ticket-channel">Channel</Label>
                <Input
                  id="ticket-channel"
                  placeholder="e.g. Email, Chat, WhatsApp"
                  value={ticketForm.channel}
                  onChange={(e) => setTicketForm({ ...ticketForm, channel: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsTicketDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isTicketSubmitting}>
                {isTicketSubmitting ? "Creating..." : "Open Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Configure Shipping Zones Dialog */}
      <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Shipping Zones</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2">
            {editZones.map((z, idx) => (
              <div key={idx} className="rounded-xl border p-3 space-y-2">
                <p className="font-semibold text-xs text-primary">{z.zone}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Rate / Threshold</Label>
                    <Input
                      value={z.rate}
                      onChange={(e) => {
                        const copy = [...editZones];
                        copy[idx].rate = e.target.value;
                        setEditZones(copy);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Estimated ETA</Label>
                    <Input
                      value={z.eta}
                      onChange={(e) => {
                        const copy = [...editZones];
                        copy[idx].eta = e.target.value;
                        setEditZones(copy);
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Courier Partners</Label>
                  <Input
                    value={z.partners}
                    onChange={(e) => {
                      const copy = [...editZones];
                      copy[idx].partners = e.target.value;
                      setEditZones(copy);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setIsZoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSaveZones()} disabled={isZoneSubmitting}>
              {isZoneSubmitting ? "Saving..." : "Save Zones"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PlatformShell>
  );
}
