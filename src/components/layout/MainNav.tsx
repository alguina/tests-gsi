"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { useProfile } from "@/components/profile/ProfileProvider";
import { cn } from "@/lib/ui/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  APP_TITLE_KEY,
  isNavSectionActive,
  PRIMARY_NAV_SECTIONS,
  type NavSection,
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
  item: NavSection;
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
          ? "text-selection-from underline decoration-selection-from decoration-2 underline-offset-[6px]"
          : "text-text-secondary hover:text-selection-from",
        className,
      )}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

function ProfileControl({ className }: { className?: string }) {
  const { t } = useI18n();
  const { profile, isHydrated, clearProfile } = useProfile();

  if (!isHydrated || !profile) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className="max-w-[10rem] truncate text-sm font-medium text-text-primary"
        title={profile.name}
      >
        {profile.name}
      </span>
      <button
        type="button"
        onClick={clearProfile}
        className="shrink-0 text-xs text-text-secondary underline decoration-text-secondary/50 underline-offset-2 transition hover:text-selection-from"
      >
        {t("profile.changeProfile")}
      </button>
    </div>
  );
}

export function MainNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const [openedAtPath, setOpenedAtPath] = useState<string | null>(null);
  const isMenuOpen = openedAtPath === pathname && openedAtPath !== null;

  function openMenu() {
    setOpenedAtPath(pathname);
  }

  function closeMenu() {
    setOpenedAtPath(null);
  }

  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
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
              onClick={toggleMenu}
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
              {PRIMARY_NAV_SECTIONS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isNavSectionActive(pathname, item)}
                  label={t(item.labelKey)}
                  className="px-3 py-3"
                  onNavigate={closeMenu}
                />
              ))}
              <div className="border-t border-border px-3 pt-3 pb-2">
                <ProfileControl />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-6 lg:flex">
          <div className="flex flex-wrap items-center gap-5">
            {PRIMARY_NAV_SECTIONS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isNavSectionActive(pathname, item)}
                label={t(item.labelKey)}
                className="whitespace-nowrap py-1"
              />
            ))}
          </div>
          <ProfileControl className="border-l border-border pl-4" />
          <LanguageSelector />
        </div>
      </nav>
    </header>
  );
}
