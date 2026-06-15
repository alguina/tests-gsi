import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";
import { controlStyles, spacing } from "@/lib/ui/tokens";

type FieldLabelProps = {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

export function FieldLabel({ htmlFor, children, className }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-sm font-medium text-text-primary",
        className,
      )}
    >
      {children}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  inputSize?: "sm" | "md";
};

export function Input({
  className,
  inputSize = "md",
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        spacing.controlRadius,
        controlStyles.field,
        controlStyles.fieldText,
        spacing.controlPaddingX,
        inputSize === "sm"
          ? spacing.controlPaddingY
          : spacing.controlPaddingYMd,
        className,
      )}
      {...props}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        spacing.controlRadius,
        controlStyles.field,
        controlStyles.fieldText,
        "min-h-72 p-3 font-mono leading-6",
        className,
      )}
      {...props}
    />
  );
}
