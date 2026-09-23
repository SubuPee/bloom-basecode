import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { UserPlus, MoreHorizontal, Mail, ShieldCheck, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { SettingsShell } from "@/components/bloom/settings-shell";
import { PageHeader, SearchBox, Pagination } from "@/components/bloom/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { settingsApi } from "@/lib/settings-api";
import type { TeamUser, Role } from "@/lib/bloom-settings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/users")({
  head: () => ({
    meta: [
      { title: "Users — Bloom Admin" },
      { name: "description", content: "Manage team members, their roles and workspace access." },
      { property: "og:title", content: "Users — Bloom Admin" },
      {
        property: "og:description",
        content: "Manage team members, their roles and workspace access.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UsersPage,
});

const statusTone: Record<string, string> = {
  Active: "bg-success-soft text-success",
  Invited: "bg-warning-soft text-warning",
  Suspended: "bg-destructive/15 text-destructive",
};

function UsersPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [counts, setCounts] = useState([
    { label: "Total users", value: 0 },
    { label: "Active", value: 0 },
    { label: "Pending invites", value: 0 },
    { label: "Roles", value: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All roles");
  const [status, setStatus] = useState("All status");

  // Invite User Dialog
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Administrator",
    warehouseName: "All warehouses",
  });
  const [inviting, setInviting] = useState(false);

  // Fetch users with filters
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await settingsApi.listUsers({
        search: query,
        role,
        status,
      });
      setUsers(res.data);
      if (res.counts && res.counts.length > 0) {
        setCounts(res.counts);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load team users");
    } finally {
      setLoading(false);
    }
  }, [query, role, status]);

  // Initial load for roles & users
  useEffect(() => {
    async function loadRoles() {
      try {
        const rolesList = await settingsApi.listRoles();
        setRoles(rolesList);
        if (rolesList.length > 0 && !inviteForm.role) {
          setInviteForm((prev) => ({ ...prev, role: rolesList[0]?.name || "Administrator" }));
        }
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    }
    loadRoles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email) {
      toast.error("Please fill in first name, last name, and email");
      return;
    }

    try {
      setInviting(true);
      await settingsApi.createUser(inviteForm);
      toast.success(`Invitation sent to ${inviteForm.email}`);
      setIsInviteOpen(false);
      setInviteForm({
        firstName: "",
        lastName: "",
        email: "",
        role: roles[0]?.name || "Administrator",
        warehouseName: "All warehouses",
      });
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const handleToggleStatus = async (user: TeamUser) => {
    const nextStatus = user.status === "Suspended" ? "Active" : "Suspended";
    try {
      await settingsApi.setStatus(user.id, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
      toast.success(`User marked as ${nextStatus}`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleResendInvite = async (userId: string) => {
    try {
      await settingsApi.sendInvite(userId);
      toast.success("Invitation resent successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend invitation");
    }
  };

  const handleDeleteUser = async (user: TeamUser) => {
    if (!window.confirm(`Are you sure you want to remove ${user.name}?`)) return;
    try {
      await settingsApi.removeUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`${user.name} removed from workspace`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove user");
    }
  };

  return (
    <SettingsShell>
      <PageHeader
        title="Users"
        description="Everyone with access to the Bloom back-office."
        action={
          <Button className="rounded-full" onClick={() => setIsInviteOpen(true)}>
            <UserPlus />
            Invite user
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {counts.map((c) => (
          <div key={c.label} className="bloom-card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBox
          placeholder="Search by name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="h-11 rounded-full border bg-background px-4 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {["All roles", ...roles.map((r) => r.name)].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-full border bg-background px-4 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {["All status", "Active", "Invited", "Suspended"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="bloom-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-4 font-medium">User</th>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Warehouse</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Last active</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    Loading team members…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-accent/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                          {u.initials}
                        </span>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">{u.role}</td>
                    <td className="px-5 py-4 text-muted-foreground">{u.warehouse}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          statusTone[u.status] || "bg-muted text-muted-foreground"
                        )}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{u.lastActive}</td>
                    <td className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${u.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                          <DropdownMenuItem asChild>
                            <Link to="/settings/roles">
                              <ShieldCheck className="mr-2 size-4" />
                              Manage role
                            </Link>
                          </DropdownMenuItem>
                          {u.status === "Invited" && (
                            <DropdownMenuItem onClick={() => handleResendInvite(u.id)}>
                              <Mail className="mr-2 size-4" />
                              Resend invite
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleToggleStatus(u)}>
                            <Power className="mr-2 size-4" />
                            {u.status === "Suspended" ? "Activate user" : "Suspend user"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteUser(u)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination count={users.length} />
      </div>

      {/* Invite User Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInviteUser} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">First Name</label>
                <Input
                  className="mt-1"
                  required
                  placeholder="e.g. Priya"
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                <Input
                  className="mt-1"
                  required
                  placeholder="e.g. Nair"
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email Address</label>
              <Input
                type="email"
                className="mt-1"
                required
                placeholder="name@bloom.store"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <select
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Warehouse Assignment
              </label>
              <select
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={inviteForm.warehouseName}
                onChange={(e) => setInviteForm({ ...inviteForm, warehouseName: e.target.value })}
              >
                <option value="All warehouses">All warehouses</option>
                <option value="Mumbai Central">Mumbai Central</option>
                <option value="Pune Hub">Pune Hub</option>
                <option value="Delhi North">Delhi North</option>
                <option value="Bengaluru South">Bengaluru South</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviting}>
                {inviting ? "Inviting…" : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SettingsShell>
  );
}
