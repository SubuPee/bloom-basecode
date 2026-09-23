import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, Waves } from "lucide-react";
import { Field, LoadingButton } from "@/components/bloom/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Bloom Admin" },
      {
        name: "description",
        content: "Request a password reset link for your Bloom admin account.",
      },
      { property: "og:title", content: "Reset your password — Bloom Admin" },
      {
        property: "og:description",
        content: "Request a password reset link for your Bloom admin account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-12">
      <div className="bloom-card w-full max-w-md p-6 sm:p-9">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Waves className="size-5" />
          </span>
          <span className="text-lg font-semibold">Bloom</span>
        </div>
        {sent ? (
          <div className="mt-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success">
              <CheckCircle2 />
            </span>
            <h1 className="mt-5 text-2xl font-semibold">Check your inbox</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              We sent a reset link to <strong className="text-foreground">{email}</strong>. The link
              expires in 30 minutes.
            </p>
            <Button
              variant="outline"
              className="mt-6 w-full rounded-full"
              onClick={() => setSent(false)}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8">
            <h1 className="text-3xl font-semibold">Forgot password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the email linked to your admin account and we'll send a reset link.
            </p>
            <div className="mt-8 space-y-5">
              <Field label="Email address" error={error}>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-11"
                    type="email"
                    placeholder="you@bloom.com"
                    autoComplete="email"
                  />
                </div>
              </Field>
              <LoadingButton loading={loading} className="h-12 w-full">
                Send reset link
              </LoadingButton>
            </div>
          </form>
        )}
        <Button asChild variant="ghost" className="mt-8 w-full rounded-full">
          <Link to="/">
            <ArrowLeft />
            Back to sign in
          </Link>
        </Button>
      </div>
    </main>
  );
}
