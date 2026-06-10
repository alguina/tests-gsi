import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "ghost"
  | "link";

export type ButtonSize = "sm" | "md";

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
  primary:
    "bg-primary text-white hover:bg-primary-muted disabled:bg-zinc-400",
  secondary:
    "border border-border bg-surface text-text-primary hover:bg-surface-muted disabled:opacity-50",
  success:
    "bg-success text-white hover:bg-emerald-600 disabled:bg-emerald-400",
  danger:
    "border border-red-300 text-danger hover:bg-danger-muted disabled:opacity-50",
  ghost: "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
  link: "text-text-secondary underline decoration-border underline-offset-4 hover:text-text-primary",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-4 py-3 text-sm",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-xl font-semibold transition disabled:cursor-not-allowed";

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
    sizeClasses[size],
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
