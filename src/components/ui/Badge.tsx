import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { radius } from "@/lib/ui/tokens";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "accent";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-border bg-surface-muted text-text-secondary",
  accent: "border-accent/20 bg-accent-muted text-accent-foreground",
  success: "border-success/20 bg-success-muted text-success",
  warning: "border-warning/20 bg-warning-muted text-warning",
  danger: "border-danger/20 bg-danger-muted text-danger",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em]",
        radius.sm,
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
