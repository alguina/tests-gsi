import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { controlStyles, typography } from "@/lib/ui/tokens";

type BackLink = {
  href: string;
  label: string;
};

type PageHeaderProps = {
  backLink?: BackLink;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  variant?: "default" | "hero";
  className?: string;
};

function HeaderBackLink({ href, label }: BackLink) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm text-sm text-text-muted transition hover:text-text-secondary",
        controlStyles.focusRing,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 3 5 8l5 5" />
      </svg>
      {label}
    </Link>
  );
}

export function PageHeader({
  backLink,
  eyebrow,
  title,
  description,
  actions,
  meta,
  variant = "default",
  className,
}: PageHeaderProps) {
  const isHero = variant === "hero";
  const Wrapper = isHero ? "section" : "header";

  return (
    <Wrapper
      className={cn(
        "overflow-visible border-b border-border-subtle",
        isHero ? "pb-8" : "pb-6",
        className,
      )}
    >
      {backLink ? (
        <div className="mb-7">
          <HeaderBackLink {...backLink} />
        </div>
      ) : null}

      {eyebrow ? <p className={typography.eyebrow}>{eyebrow}</p> : null}

      <h1
        className={cn(
          eyebrow ? "mt-3" : undefined,
          isHero ? typography.pageTitleHero : typography.pageTitle,
        )}
      >
        {title}
      </h1>

      {description ? (
        <p className={cn("mt-3 max-w-2xl", typography.bodyLarge)}>
          {description}
        </p>
      ) : null}

      {meta ? <div className="mt-3">{meta}</div> : null}

      {actions ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">{actions}</div>
      ) : null}
    </Wrapper>
  );
}
