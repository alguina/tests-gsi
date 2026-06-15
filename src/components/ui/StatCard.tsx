import { cn } from "@/lib/ui/cn";
import { typography } from "@/lib/ui/tokens";

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
        "rounded-md border border-border-subtle bg-surface px-4 py-3.5",
        className,
      )}
    >
      <p className={typography.statLabel}>{label}</p>
      <p
        className={cn(
          "mt-1.5",
          size === "md" ? typography.statValue : typography.statValueSm,
          "break-words",
        )}
      >
        {value}
      </p>
    </div>
  );
}
