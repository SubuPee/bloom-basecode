import {
  LoaderCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function LoadingButton({
  loading,
  children,
  ...props
}: ButtonProps & { loading?: boolean }) {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {loading && <LoaderCircle className="animate-spin" />}
      {children}
    </Button>
  );
}
export function StatusBadge({ status }: { status: string }) {
  const active = status.toLowerCase() === "active" || status.toLowerCase() === "published";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        active ? "bg-success-soft text-success" : "bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", active ? "bg-success" : "bg-muted-foreground/60")}
      />
      {status}
    </span>
  );
}
export function Field({
  label,
  error,
  helper,
  children,
}: {
  label: string;
  error?: string | undefined;
  helper?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}
export function SearchBox(props: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative min-w-56 flex-1">
      <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input {...props} className={cn("h-11 rounded-full pl-11", props.className)} />
    </div>
  );
}
export function PageHeader({
  title,
  description,
  action,
  actions,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {action || actions}
    </div>
  );
}
export function Pagination({
  count = 48,
  currentPage,
  totalPages,
  onPageChange,
}: {
  count?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const current = currentPage || 1;
  const total = totalPages || Math.ceil(count / 10) || 1;

  return (
    <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        {totalPages
          ? `Page ${current} of ${total}`
          : `Showing 1–10 of ${count}`}
      </span>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={current <= 1}
          onClick={() => onPageChange?.(Math.max(1, current - 1))}
        >
          <ChevronLeft />
        </Button>
        <span className="text-xs font-medium px-2 text-foreground">
          {current} / {total}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={current >= total}
          onClick={() => onPageChange?.(Math.min(total, current + 1))}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
export const toastIcons = { success: CheckCircle2, error: AlertCircle, info: Info };
