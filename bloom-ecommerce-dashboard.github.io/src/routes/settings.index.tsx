import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Clock,
  KeyRound,
  Smartphone,
  Pencil,
  Activity,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { SettingsShell } from "@/components/bloom/settings-shell";
import { PageHeader, StatusBadge } from "@/components/bloom/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/bloom/auth-context";
import { settingsApi, type ProfileData } from "@/lib/settings-api";

const iconMap: Record<string, any> = {
  ShoppingCart,
  Package,
  Users,
  Clock,
};

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Profile — Bloom Admin" },
      { name: "description", content: "Your Bloom admin profile, activity and security details." },
      { property: "og:title", content: "Profile — Bloom Admin" },
      {
        property: "og:description",
        content: "Your Bloom admin profile, activity and security details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    timezone: "",
    recoveryEmail: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Dialog state
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getProfile();
      setProfile(data);
      setEditForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        location: data.location || "",
        timezone: data.timezone || "",
        recoveryEmail: data.recoveryEmail || "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const updated = await settingsApi.updateProfile(editForm);
      setProfile((prev) => (prev ? { ...prev, ...updated } : updated));
      toast.success("Profile updated successfully");
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please enter both current and new password");
      return;
    }
    try {
      setSavingPassword(true);
      await settingsApi.changePassword(passwordForm);
      toast.success("Password changed successfully");
      setIsPasswordOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await settingsApi.deleteSession(sessionId);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              activeSessions: prev.activeSessions.filter((s) => s.id !== sessionId),
            }
          : prev
      );
      toast.success("Session revoked");
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke session");
    }
  };

  const name = profile?.name || user?.name || "Alex Morgan";
  const email = profile?.email || user?.email || "alex.morgan@bloom.store";
  const role = profile?.role || user?.role || "Administrator";
  const initials =
    profile?.initials ||
    (user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase());

  const stats = profile?.stats || [
    { label: "Orders handled", value: "1,284", icon: "ShoppingCart", tone: "text-blue bg-blue-soft" },
    { label: "Products edited", value: "376", icon: "Package", tone: "text-success bg-success-soft" },
    { label: "Customers assisted", value: "912", icon: "Users", tone: "text-primary bg-primary/15" },
    { label: "Avg. response", value: "4m 12s", icon: "Clock", tone: "text-warning bg-warning-soft" },
  ];

  const activity = profile?.recentActivity || [
    { title: "Published Monsoon Essentials campaign", time: "Today, 09:40" },
    { title: "Updated Catalog Manager role permissions", time: "Yesterday, 17:35" },
    { title: "Approved refund for order #BLM-10460", time: "16 Sep, 11:20" },
    { title: "Added Pune Hub warehouse", time: "14 Sep, 10:02" },
    { title: "Invited Vikram Iyer to the workspace", time: "12 Sep, 15:48" },
  ];

  const sessions = profile?.activeSessions || [
    { id: "SES-01", device: "MacBook Pro · Chrome", place: "Mumbai, IN", time: "Active now", current: true },
    { id: "SES-02", device: "iPhone 15 · Safari", place: "Mumbai, IN", time: "3 hours ago", current: false },
    { id: "SES-03", device: "Windows 11 · Edge", place: "Pune, IN", time: "2 days ago", current: false },
  ];

  return (
    <SettingsShell>
      <PageHeader
        title="Profile"
        description="Your account details, activity and security across the Bloom workspace."
        action={
          <Button className="rounded-full" onClick={() => setIsEditOpen(true)}>
            <Pencil />
            Edit profile
          </Button>
        }
      />

      <div className="bloom-card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary/40 via-primary/15 to-transparent" />
        <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="-mt-12 grid size-24 shrink-0 place-items-center rounded-3xl border-4 border-card bg-primary text-2xl font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold">{name}</h2>
              <StatusBadge status="Active" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {role} · Bloom Commerce Ops
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/settings/roles">
                <ShieldCheck />
                Permissions
              </Link>
            </Button>
          </div>
        </div>
        <dl className="grid gap-px border-t bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Mail, label: "Email", value: email },
            { icon: Phone, label: "Phone", value: profile?.phone || "+91 98200 41122" },
            { icon: MapPin, label: "Location", value: profile?.location || "Mumbai, India" },
            { icon: Clock, label: "Timezone", value: profile?.timezone || "IST (UTC +5:30)" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 bg-card p-5">
              <Icon className="size-4 text-muted-foreground" />
              <div className="min-w-0">
                <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
                <dd className="truncate text-sm font-medium">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon, tone }) => {
          const Icon = iconMap[icon] || Activity;
          return (
            <div key={label} className="bloom-card p-5">
              <span className={`grid size-11 place-items-center rounded-full ${tone}`}>
                <Icon className="size-5" />
              </span>
              <p className="mt-4 text-2xl font-semibold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="bloom-card p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="size-5 text-primary" />
            Recent activity
          </h3>
          <ol className="mt-5 space-y-5">
            {activity.map((a) => (
              <li key={a.title} className="relative border-l pl-6">
                <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-primary" />
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.time}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-6">
          <div className="bloom-card p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <KeyRound className="size-5 text-primary" />
              Security
            </h3>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Password</span>
                <span>{profile?.passwordChangedAgo || "Changed 42 days ago"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Two-factor auth</span>
                <StatusBadge status={profile?.twoFactorEnabled ? "Active" : "Inactive"} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Recovery email</span>
                <span>{profile?.recoveryEmail || "a.morgan@gmail.com"}</span>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => setIsPasswordOpen(true)}
              >
                Change password
              </Button>
            </div>
          </div>
          <div className="bloom-card p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Smartphone className="size-5 text-primary" />
              Active sessions
            </h3>
            <ul className="mt-4 space-y-4">
              {sessions.map((s) => (
                <li key={s.id || s.device} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium">{s.device}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.place} · {s.time}
                    </p>
                  </div>
                  {s.current ? (
                    <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs text-success">
                      This device
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => handleRevokeSession(s.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">First Name</label>
                <Input
                  className="mt-1"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                <Input
                  className="mt-1"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
              <Input
                className="mt-1"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Location</label>
                <Input
                  className="mt-1"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                <Input
                  className="mt-1"
                  value={editForm.timezone}
                  onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Recovery Email</label>
              <Input
                type="email"
                className="mt-1"
                value={editForm.recoveryEmail}
                onChange={(e) => setEditForm({ ...editForm, recoveryEmail: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Current Password</label>
              <Input
                type="password"
                className="mt-1"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">New Password</label>
              <Input
                type="password"
                className="mt-1"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPasswordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? "Updating…" : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SettingsShell>
  );
}
