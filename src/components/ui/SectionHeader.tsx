import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { typography } from "@/lib/ui/tokens";

type SectionHeaderProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <h2 className={typography.sectionTitle}>{title}</h2>
        {description ? (
          <p className={cn("mt-1", typography.body)}>{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
