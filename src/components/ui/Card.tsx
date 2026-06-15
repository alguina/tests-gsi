import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { radius, shadow, typography } from "@/lib/ui/tokens";

export type CardTone = "default" | "muted" | "success" | "warning" | "danger";
export type CardVariant = "default" | "editorial" | "stat";
export type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = {
  children: ReactNode;
  className?: string;
  tone?: CardTone;
  variant?: CardVariant;
  padding?: CardPadding;
  as?: "article" | "section" | "div";
};

const toneClasses: Record<CardTone, string> = {
  default: "border-border bg-surface",
  muted: "border-border-subtle bg-surface-muted",
  success: "border-success/25 bg-success-muted/50",
  warning: "border-warning/25 bg-warning-muted/50",
  danger: "border-danger/25 bg-danger-muted/50",
};

const variantClasses: Record<CardVariant, string> = {
  default: cn(radius.lg, "border", shadow.none),
  editorial: cn(radius.lg, "border border-border-subtle bg-surface", shadow.none),
  stat: cn(radius.md, "border border-border-subtle bg-surface", shadow.none),
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-7",
};

export function Card({
  children,
  className,
  tone = "default",
  variant = "default",
  padding = "md",
  as: Component = "section",
}: CardProps) {
  return (
    <Component
      className={cn(
        variantClasses[variant],
        toneClasses[tone],
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </Component>
  );
}

export function CardEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn(typography.eyebrow, className)}>{children}</p>;
}
