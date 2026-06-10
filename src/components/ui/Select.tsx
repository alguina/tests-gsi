import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";
import { controlStyles, spacing } from "@/lib/ui/tokens";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  selectSize?: "sm" | "md";
};

function SelectChevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Select({
  className,
  selectSize = "md",
  ...props
}: SelectProps) {
  return (
    <div
      className={cn(
        "relative inline-block",
        className?.includes("w-full") && "w-full",
      )}
    >
      <select
        className={cn(
          "w-full appearance-none",
          spacing.controlRadius,
          controlStyles.select,
          spacing.selectPaddingLeft,
          spacing.selectPaddingRight,
          selectSize === "sm"
            ? spacing.controlPaddingY
            : spacing.controlPaddingYMd,
          className,
        )}
        {...props}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 flex items-center text-text-muted",
          spacing.selectChevronInset,
        )}
      >
        <SelectChevron />
      </span>
    </div>
  );
}
