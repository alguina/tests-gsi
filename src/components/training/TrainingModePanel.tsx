import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/ui/cn";

type TrainingModePanelProps = {
  title: string;
  description: string;
  helperText?: string;
  controls?: ReactNode;
  action?: ReactNode;
  emptyState?: {
    title: string;
    description: string;
  };
  children?: ReactNode;
  className?: string;
};

export function TrainingModePanel({
  title,
  description,
  helperText,
  controls,
  action,
  emptyState,
  children,
  className,
}: TrainingModePanelProps) {
  return (
    <Card as="article" className={cn("flex flex-col", className)}>
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>

      {emptyState ? (
        <div className="mt-4">
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
          />
        </div>
      ) : (
        <>
          {children ? <div className="mt-4 space-y-3">{children}</div> : null}

          {controls ? (
            <div className="mt-4 space-y-3">
              {controls}
            </div>
          ) : null}

          {action ? <div className="mt-4">{action}</div> : null}

          {helperText ? (
            <p className="mt-3 text-sm text-text-muted">{helperText}</p>
          ) : null}
        </>
      )}
    </Card>
  );
}
