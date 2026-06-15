import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/ui/cn";
import { typography } from "@/lib/ui/tokens";

type EmptyStateProps = {
  title: string;
  description: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card variant="editorial" padding="md">
      <h2 className={typography.sectionTitle}>{title}</h2>
      <p className={cn("mt-2", typography.body)}>{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}
