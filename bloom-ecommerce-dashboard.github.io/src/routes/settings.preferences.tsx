import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { SettingsShell } from "@/components/bloom/settings-shell";
import { PageHeader, Field } from "@/components/bloom/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { settingsApi } from "@/lib/settings-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/preferences")({
  head: () => ({
    meta: [
      { title: "Workspace settings — Bloom Admin" },
      {
        name: "description",
        content: "Store details, regional formats and alert preferences for Bloom.",
      },
      { property: "og:title", content: "Workspace settings — Bloom Admin" },
      {
        property: "og:description",
        content: "Store details, regional formats and alert preferences for Bloom.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PreferencesPage,
});

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors",
        on ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "block size-5 rounded-full bg-background transition-transform",
          on && "translate-x-5"
        )}
      />
    </button>
  );
}

const alertConfig = [
  { id: "orders", label: "New orders", desc: "Email me whenever an order is placed." },
  { id: "stock", label: "Low stock", desc: "Alert when stock falls below the reorder point." },
  { id: "payouts", label: "Payouts", desc: "Weekly settlement summaries." },
  { id: "reviews", label: "Customer reviews", desc: "New product reviews awaiting moderation." },
  { id: "security", label: "Security", desc: "Sign-ins from new devices and role changes." },
] as const;

function PreferencesPage() {
  const [storeDetails, setStoreDetails] = useState({
    storeName: "Bloom",
    supportEmail: "care@bloom.store",
    supportPhone: "+91 22 4000 1188",
    storefrontDomain: "bloom.store",
  });

  const [regional, setRegional] = useState({
    currency: "INR (₹)",
    timezone: "IST (UTC +5:30)",
    dateFormat: "DD MMM YYYY",
    weightUnit: "Kilogram",
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    orders: true,
    stock: true,
    payouts: true,
    reviews: false,
    security: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      try {
        setLoading(true);
        const data = await settingsApi.getPreferences();
        if (data.storeDetails) setStoreDetails((prev) => ({ ...prev, ...data.storeDetails }));
        if (data.regional) setRegional((prev) => ({ ...prev, ...data.regional }));
        if (data.notificationPreferences) {
          setNotificationPreferences((prev) => ({ ...prev, ...data.notificationPreferences }));
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load preferences");
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      await settingsApi.savePreferences({
        storeDetails,
        regional,
        notificationPreferences,
      });
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleAlert = (key: keyof typeof notificationPreferences) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <SettingsShell>
      <PageHeader
        title="Settings"
        description="Store identity, regional formats and how Bloom notifies your team."
        action={
          <Button className="rounded-full" onClick={save} disabled={saving || loading}>
            <Save />
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <div className="bloom-card p-6">
        <h2 className="text-lg font-semibold">Store details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Store name">
            <Input
              value={storeDetails.storeName}
              onChange={(e) => setStoreDetails({ ...storeDetails, storeName: e.target.value })}
              className="h-11 rounded-2xl"
            />
          </Field>
          <Field label="Support email">
            <Input
              value={storeDetails.supportEmail}
              onChange={(e) => setStoreDetails({ ...storeDetails, supportEmail: e.target.value })}
              className="h-11 rounded-2xl"
            />
          </Field>
          <Field label="Support phone">
            <Input
              value={storeDetails.supportPhone}
              onChange={(e) => setStoreDetails({ ...storeDetails, supportPhone: e.target.value })}
              className="h-11 rounded-2xl"
            />
          </Field>
          <Field label="Storefront domain">
            <Input
              value={storeDetails.storefrontDomain}
              onChange={(e) =>
                setStoreDetails({ ...storeDetails, storefrontDomain: e.target.value })
              }
              className="h-11 rounded-2xl"
            />
          </Field>
        </div>
      </div>

      <div className="bloom-card p-6">
        <h2 className="text-lg font-semibold">Regional</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Currency">
            <select
              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm"
              value={regional.currency}
              onChange={(e) => setRegional({ ...regional, currency: e.target.value })}
            >
              {["INR (₹)", "USD ($)", "EUR (€)"].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Timezone">
            <select
              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm"
              value={regional.timezone}
              onChange={(e) => setRegional({ ...regional, timezone: e.target.value })}
            >
              {["IST (UTC +5:30)", "GMT (UTC)", "EST (UTC -5)"].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date format">
            <select
              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm"
              value={regional.dateFormat}
              onChange={(e) => setRegional({ ...regional, dateFormat: e.target.value })}
            >
              {["DD MMM YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Weight unit">
            <select
              className="h-11 w-full rounded-2xl border bg-background px-3 text-sm"
              value={regional.weightUnit}
              onChange={(e) => setRegional({ ...regional, weightUnit: e.target.value })}
            >
              {["Kilogram", "Gram", "Pound"].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div className="bloom-card p-6">
        <h2 className="text-lg font-semibold">Notification preferences</h2>
        <ul className="mt-5 divide-y">
          {alertConfig.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-medium">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
              <Toggle
                on={!!notificationPreferences[a.id as keyof typeof notificationPreferences]}
                onClick={() => toggleAlert(a.id as keyof typeof notificationPreferences)}
              />
            </li>
          ))}
        </ul>
      </div>
    </SettingsShell>
  );
}
