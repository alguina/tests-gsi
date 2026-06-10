import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const inputId = id ?? props.name;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-text-primary",
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        {...props}
      />
      {label}
    </label>
  );
}
