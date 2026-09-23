import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Check, Minus, Users, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SettingsShell } from "@/components/bloom/settings-shell";
import { PageHeader } from "@/components/bloom/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { settingsApi } from "@/lib/settings-api";
import { permissionModules, type Role, type TeamUser } from "@/lib/bloom-settings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions — Bloom Admin" },
      {
        name: "description",
        content: "Define what each Bloom team role can view, create, edit and delete.",
      },
      { property: "og:title", content: "Roles & Permissions — Bloom Admin" },
      {
        property: "og:description",
        content: "Define what each Bloom team role can view, create, edit and delete.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RolesPage,
});

const actions = ["view", "create", "edit", "delete"] as const;

function RolesPage() {
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [teamUsersList, setTeamUsersList] = useState<TeamUser[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create Role Dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    scope: "Workspace",
  });
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedRoles, usersRes] = await Promise.all([
        settingsApi.listRoles(),
        settingsApi.listUsers(),
      ]);
      setRolesList(fetchedRoles);
      setTeamUsersList(usersRes.data || []);
      if (fetchedRoles.length > 0 && !activeId) {
        setActiveId(fetchedRoles[0]?.id || "");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const active = rolesList.find((r) => r.id === activeId) || rolesList[0];
  const members = teamUsersList.filter((u) => u.role === active?.name);

  const togglePermission = (module: string, action: "view" | "create" | "edit" | "delete") => {
    if (!active) return;
    const currentActions = active.permissions?.[module] || [];
    const exists = currentActions.includes(action);
    const updatedActions = exists
      ? currentActions.filter((a) => a !== action)
      : [...currentActions, action];

    setRolesList((prev) =>
      prev.map((r) =>
        r.id === active.id
          ? {
              ...r,
              permissions: {
                ...r.permissions,
                [module]: updatedActions,
              },
            }
          : r
      )
    );
    setHasChanges(true);
  };

  const handleSavePermissions = async () => {
    if (!active) return;
    try {
      setSaving(true);
      await settingsApi.editRole(active.id, {
        modulePermissions: active.permissions,
      });
      setHasChanges(false);
      toast.success(`Permissions for ${active.name} updated successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name) {
      toast.error("Role name is required");
      return;
    }

    try {
      setCreating(true);
      const newRole = await settingsApi.addRole(createForm);
      setRolesList((prev) => [...prev, newRole]);
      setActiveId(newRole.id);
      setIsCreateOpen(false);
      setCreateForm({ name: "", description: "", scope: "Workspace" });
      toast.success(`Role ${newRole.name} created successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create role");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.name === "Administrator") {
      toast.error("The Administrator system role cannot be deleted");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the ${role.name} role?`)) return;

    try {
      await settingsApi.removeRole(role.id);
      const remaining = rolesList.filter((r) => r.id !== role.id);
      setRolesList(remaining);
      if (activeId === role.id && remaining.length > 0) {
        setActiveId(remaining[0]?.id || "");
      }
      toast.success(`Role ${role.name} deleted successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role");
    }
  };

  return (
    <SettingsShell>
      <PageHeader
        title="Roles & Permissions"
        description="Group permissions into roles, then assign roles to your team."
        action={
          <Button className="rounded-full" onClick={() => setIsCreateOpen(true)}>
            <Plus />
            Create role
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="space-y-3">
          {loading && rolesList.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Loading roles…</div>
          ) : (
            rolesList.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setActiveId(r.id);
                  setHasChanges(false);
                }}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition-colors",
                  r.id === active?.id ? "border-primary bg-primary/10" : "hover:bg-accent/60"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{r.name}</p>
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    <Users className="size-3" />
                    {teamUsersList.filter((u) => u.role === r.name).length || r.members || 0}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
              </button>
            ))
          )}
        </div>

        {active && (
          <div className="space-y-6">
            <div className="bloom-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{active.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{active.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    Scope: {active.scope}
                  </span>
                  {active.name !== "Administrator" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteRole(active)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                  {hasChanges && (
                    <Button
                      size="sm"
                      className="rounded-full"
                      onClick={handleSavePermissions}
                      disabled={saving}
                    >
                      <Save className="mr-1.5 size-3.5" />
                      {saving ? "Saving…" : "Save Changes"}
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 font-medium">Module</th>
                      {actions.map((a) => (
                        <th key={a} className="py-3 text-center font-medium capitalize">
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {permissionModules.map((m) => (
                      <tr key={m}>
                        <td className="py-3 font-medium">{m}</td>
                        {actions.map((a) => {
                          const allowed = active.permissions?.[m]?.includes(a);
                          return (
                            <td key={a} className="py-3 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(m, a)}
                                className={cn(
                                  "mx-auto grid size-7 place-items-center rounded-full transition-transform active:scale-90",
                                  allowed
                                    ? "bg-success-soft text-success hover:opacity-80"
                                    : "bg-muted text-muted-foreground/60 hover:bg-muted/80"
                                )}
                              >
                                {allowed ? (
                                  <Check className="size-4" />
                                ) : (
                                  <Minus className="size-4" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bloom-card p-6">
              <h3 className="text-lg font-semibold">Members with this role</h3>
              {members.length ? (
                <ul className="mt-4 divide-y">
                  {members.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 py-3">
                      <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {u.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">{u.lastActive}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No team members currently hold this role.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Role Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRole} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Role Name</label>
              <Input
                className="mt-1"
                required
                placeholder="e.g. Operations Lead"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Input
                className="mt-1"
                placeholder="Responsibilities of this role"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Scope</label>
              <select
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={createForm.scope}
                onChange={(e) => setCreateForm({ ...createForm, scope: e.target.value })}
              >
                <option value="Global">Global</option>
                <option value="Catalog">Catalog</option>
                <option value="CMS">CMS</option>
                <option value="Service">Service</option>
                <option value="Reporting">Reporting</option>
                <option value="Workspace">Workspace</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SettingsShell>
  );
}
