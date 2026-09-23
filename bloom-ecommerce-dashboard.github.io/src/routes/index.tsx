import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type ElementType } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Waves,
  Package,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/bloom/auth-context";
import { Field, LoadingButton } from "@/components/bloom/ui";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Bloom Admin" },
      { name: "description", content: "Sign in to manage Bloom ecommerce operations." },
      { property: "og:title", content: "Sign in — Bloom Admin" },
      { property: "og:description", content: "Sign in to manage Bloom ecommerce operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  const overview: Array<{ Icon: ElementType; value: string; label: string; tone: string }> = [
    { Icon: Package, value: "2,486", label: "Products", tone: "bg-blue-soft text-blue" },
    { Icon: TrendingUp, value: "+18%", label: "Growth", tone: "bg-success-soft text-success" },
    { Icon: ShoppingBag, value: "8", label: "Warehouses", tone: "bg-orange-soft text-orange" },
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next["email"] = "Enter a valid email address.";
    if (!password) next["password"] = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(email, password);

      toast.success("Welcome back! Signed in successfully.");
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please check your credentials.";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden border-r p-12 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 text-xl font-semibold">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Waves className="size-6" />
          </span>
          Bloom
        </div>
        <div className="my-auto max-w-xl">
          <h1 className="text-5xl font-semibold leading-[1.08]">
            Manage your commerce operations in one place
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            A focused workspace for products, inventory, and every detail that keeps your catalog
            moving.
          </p>
          <div className="relative mt-12 rounded-3xl border bg-card/70 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b pb-5">
              <div>
                <p className="text-xs text-muted-foreground">Catalog overview</p>
                <p className="mt-1 text-xl font-semibold">September performance</p>
              </div>
              <Button variant="ghost" size="icon" className="bloom-icon-button">
                <ArrowUpRight />
              </Button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {overview.map(({ Icon, value, label, tone }) => (
                <div key={label} className="rounded-2xl border bg-muted/35 p-4">
                  <span className={`grid size-9 place-items-center rounded-full ${tone}`}>
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-7 text-2xl font-semibold">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border bg-muted/30 p-4">
              <div className="flex h-28 items-end gap-3">
                {[38, 54, 47, 72, 64, 88, 76, 92, 68, 83, 95, 78].map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-full bg-blue/70"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Purpose-built for modern retail teams.</p>
      </section>

      <section className="grid place-items-center px-5 py-10 sm:px-8">
        <form onSubmit={submit} className="bloom-card w-full max-w-md p-6 sm:p-9 shadow-xl">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Waves className="size-5" />
            </span>
            <span className="text-lg font-semibold">Bloom</span>
          </div>
          <h2 className="text-3xl font-semibold">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your Bloom admin account</p>

          <div className="mt-8 space-y-5">
            {errors["form"] && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errors["form"]}</span>
              </div>
            )}

            <Field label="Email address" error={errors["email"]}>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-11"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  disabled={loading}
                />
              </div>
            </Field>

            <Field label="Password" error={errors["password"]}>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-4 size-4 text-muted-foreground" />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 px-11"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle password visibility"
                  className="absolute right-1.5 top-1.5"
                  onClick={() => setShow(!show)}
                  disabled={loading}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </Field>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                  disabled={loading}
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Button asChild type="button" variant="link" className="h-auto p-0 text-blue">
                <Link to="/forgot-password">Forgot password?</Link>
              </Button>
            </div>

            <LoadingButton loading={loading} className="h-12 w-full text-base font-medium">
              Sign in
            </LoadingButton>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © Bloom Ecommerce · Admin Panel
          </p>
        </form>
      </section>
    </main>
  );
}
