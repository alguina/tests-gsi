"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { cn } from "@/lib/ui/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  APP_TITLE_KEY,
  isNavItemActive,
  MAIN_NAV_ITEMS,
} from "@/lib/navigation";
import { layout } from "@/lib/ui/tokens";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

function NavLink({
  item,
  isActive,
  label,
  className,
  onNavigate,
}: {
  item: (typeof MAIN_NAV_ITEMS)[number];
  isActive: boolean;
  label: string;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "text-sm font-medium transition",
        isActive
          ? "bg-primary text-white"
          : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
        className,
      )}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}

export function MainNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        layout.navHeight,
        "border-b border-border bg-surface/95 backdrop-blur",
      )}
    >
      <nav
        className={cn(
          "mx-auto w-full py-3",
          layout.contentMaxWidth,
          layout.pagePaddingX,
          "lg:flex lg:items-center lg:justify-between lg:gap-4",
        )}
        aria-label={t("nav.openMenu")}
      >
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="min-w-0 truncate text-base font-semibold text-text-primary"
          >
            {t(APP_TITLE_KEY)}
          </Link>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <LanguageSelector />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-primary transition hover:bg-surface-muted"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-main-nav"
              aria-label={isMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <MenuIcon open={isMenuOpen} />
            </button>
          </div>
        </div>

        <div
          id="mobile-main-nav"
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out lg:hidden",
            isMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-1 border-t border-border pb-1 pt-2">
              {MAIN_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isNavItemActive(pathname, item)}
                  label={t(item.labelKey)}
                  className="rounded-xl px-3 py-3"
                  onNavigate={() => setIsMenuOpen(false)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex flex-wrap items-center gap-2">
            {MAIN_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isNavItemActive(pathname, item)}
                label={t(item.labelKey)}
                className="whitespace-nowrap rounded-full px-3 py-2"
              />
            ))}
          </div>
          <LanguageSelector />
        </div>
      </nav>
    </header>
  );
}
