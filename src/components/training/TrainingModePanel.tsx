import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/ui/cn";
import { typography } from "@/lib/ui/tokens";

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
    <Card
      as="article"
      variant="editorial"
      padding="lg"
      className={cn("flex flex-col", className)}
    >
      <h2 className={typography.panelTitle}>{title}</h2>
      <p className={cn("mt-1.5 max-w-prose", typography.body)}>{description}</p>

      {emptyState ? (
        <div className="mt-5">
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
          />
        </div>
      ) : (
        <>
          {children ? <div className="mt-5 space-y-4">{children}</div> : null}

          {controls ? <div className="mt-5 space-y-4">{controls}</div> : null}

          {action ? <div className="mt-6">{action}</div> : null}

          {helperText ? (
            <p className={cn("mt-3", typography.meta)}>{helperText}</p>
          ) : null}
        </>
      )}
    </Card>
  );
}
