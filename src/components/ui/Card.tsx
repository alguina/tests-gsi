import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type CardTone = "default" | "muted" | "success" | "warning" | "danger";
export type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = {
  children: ReactNode;
  className?: string;
  tone?: CardTone;
  padding?: CardPadding;
  as?: "article" | "section" | "div";
};

const toneClasses: Record<CardTone, string> = {
  default: "border-border bg-surface",
  muted: "border-border bg-surface-muted",
  success: "border-emerald-200 bg-success-muted text-emerald-950",
  warning: "border-amber-200 bg-warning-muted text-amber-900",
  danger: "border-red-200 bg-danger-muted text-red-700",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export function Card({
  children,
  className,
  tone = "default",
  padding = "md",
  as: Component = "section",
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-2xl border shadow-sm",
        toneClasses[tone],
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </Component>
  );
}
