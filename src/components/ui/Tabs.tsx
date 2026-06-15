"use client";

import { cn } from "@/lib/ui/cn";

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
          "flex gap-1 overflow-x-auto border-b border-border pb-px",
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
                "shrink-0 rounded-t-xl px-4 py-2.5 text-sm font-medium transition",
                selected
                  ? "border border-b-0 border-border bg-surface text-selection-from"
                  : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
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
      className={cn(hidden ? "hidden" : "pt-4", className)}
    >
      {children}
    </section>
  );
}
