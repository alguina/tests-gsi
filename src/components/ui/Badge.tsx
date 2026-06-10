import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-text-secondary",
  success: "bg-success-muted text-emerald-800",
  warning: "bg-warning-muted text-amber-900",
  danger: "bg-danger-muted text-danger",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
