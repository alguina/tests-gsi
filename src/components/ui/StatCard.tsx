import { cn } from "@/lib/ui/cn";

type StatCardProps = {
  label: string;
  value: string | number;
  size?: "sm" | "md";
  className?: string;
};

export function StatCard({
  label,
  value,
  size = "md",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-semibold text-text-primary",
          size === "md" ? "text-2xl" : "text-lg",
          size === "md" && "break-words",
        )}
      >
        {value}
      </p>
    </div>
  );
}
