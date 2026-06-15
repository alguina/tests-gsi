import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { interactive, radius, spacing } from "@/lib/ui/tokens";

export type SelectableOptionSize = "sm" | "md" | "lg";

type SelectableOptionProps = {
  selected: boolean;
  children: ReactNode;
  size?: SelectableOptionSize;
  align?: "center" | "left";
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const sizeClasses: Record<SelectableOptionSize, string> = {
  sm: "min-h-9 px-3 py-2 text-xs",
  md: cn(spacing.pillMinHeight, "px-3 py-2.5 text-sm"),
  lg: "min-h-14 px-4 py-3.5 text-sm leading-relaxed",
};

export function SelectableOption({
  selected,
  children,
  size = "md",
  align = "center",
  className,
  type = "button",
  ...props
}: SelectableOptionProps) {
  return (
    <button
      type={type}
      className={cn(
        interactive.optionBase,
        radius.md,
        sizeClasses[size],
        align === "left" ? "text-left" : "text-center",
        selected ? interactive.optionSelected : interactive.optionDefault,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
