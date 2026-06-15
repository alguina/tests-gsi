import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { controlStyles, radius, spacing } from "@/lib/ui/tokens";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "subtle"
  | "success"
  | "danger"
  | "ghost"
  | "link";

export type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
};

type ButtonAsButton = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps & {
  href: string;
  disabled?: boolean;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-cta border border-transparent",
  secondary:
    "border border-border bg-surface text-text-primary hover:bg-surface-muted hover:border-border",
  subtle:
    "border border-transparent bg-surface-muted text-text-primary hover:bg-selection hover:border-border",
  success: "bg-cta border border-transparent",
  danger:
    "border border-danger/30 bg-danger-muted text-danger hover:bg-danger-muted/80",
  ghost:
    "border border-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary",
  link: "border border-transparent text-accent underline decoration-border underline-offset-4 hover:text-accent-hover hover:decoration-accent/40 px-0",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

const baseClasses = cn(
  "inline-flex items-center justify-center font-medium transition",
  radius.md,
  controlStyles.focusRing,
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  fullWidth,
  ...props
}: ButtonProps) {
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    variant !== "link" && sizeClasses[size],
    fullWidth && "w-full",
    className,
  );

  if ("href" in props && props.href) {
    const { href, disabled } = props;

    if (disabled) {
      return (
        <span
          aria-disabled="true"
          className={cn(classes, "pointer-events-none opacity-50")}
        >
          {children}
        </span>
      );
    }

    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;

  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
