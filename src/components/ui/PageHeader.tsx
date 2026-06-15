import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/ui/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  variant?: "default" | "hero";
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  variant = "default",
  className,
}: PageHeaderProps) {
  if (variant === "hero") {
    return (
      <Card padding="lg" className={cn("rounded-3xl overflow-visible", className)}>
        {eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-base leading-7 text-text-secondary">
            {description}
          </p>
        ) : null}
        {actions ? (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">{actions}</div>
        ) : null}
      </Card>
    );
  }

  return (
    <header className={cn("space-y-2", className)}>
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-base leading-7 text-text-secondary">
          {description}
        </p>
      ) : null}
      {meta}
      {actions ? (
        <div className="flex flex-col gap-3 pt-1 sm:flex-row">{actions}</div>
      ) : null}
    </header>
  );
}
