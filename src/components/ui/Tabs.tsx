"use client";

import { cn } from "@/lib/ui/cn";
import { controlStyles, typography } from "@/lib/ui/tokens";

export type TabItem = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
  listClassName?: string;
};

export function Tabs({
  tabs,
  value,
  onChange,
  ariaLabel = "Tabs",
  className,
  listClassName,
}: TabsProps) {
  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          "flex gap-6 overflow-x-auto border-b border-border-subtle",
          listClassName,
        )}
      >
        {tabs.map((tab) => {
          const selected = tab.id === value;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={cn(
                typography.navLink,
                "relative shrink-0 border-b-2 pb-3 pt-1 transition",
                controlStyles.focusRing,
                selected
                  ? "border-accent text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-secondary",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type TabPanelProps = {
  id: string;
  labelledBy: string;
  hidden: boolean;
  children: React.ReactNode;
  className?: string;
};

export function TabPanel({
  id,
  labelledBy,
  hidden,
  children,
  className,
}: TabPanelProps) {
  return (
    <section
      id={`panel-${id}`}
      role="tabpanel"
      aria-labelledby={labelledBy}
      hidden={hidden}
      className={cn(hidden ? "hidden" : "pt-6", className)}
    >
      {children}
    </section>
  );
}
