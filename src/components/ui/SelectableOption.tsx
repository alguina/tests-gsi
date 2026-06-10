import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type SelectableOptionProps = {
  selected: boolean;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function SelectableOption({
  selected,
  children,
  className,
  type = "button",
  ...props
}: SelectableOptionProps) {
  return (
    <button
      type={type}
      className={cn(
        "w-full rounded-xl border text-center text-sm font-semibold text-text-primary transition",
        selected
          ? "border-selection-from bg-selection"
          : "border-border bg-surface-muted hover:border-selection-from/50 hover:bg-zinc-100",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
