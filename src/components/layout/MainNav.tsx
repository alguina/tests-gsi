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
import { controlStyles, layout, radius, typography } from "@/lib/ui/tokens";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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
        typography.navLink,
        "transition",
        isActive
          ? "text-text-primary"
          : "text-text-muted hover:text-text-secondary",
        className,
      )}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={cn(
          "inline-block border-b-2 pb-0.5 transition",
          isActive ? "border-accent" : "border-transparent",
        )}
      >
        {label}
      </span>
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
        className={cn("max-w-[10rem] truncate", typography.meta, "text-text-secondary")}
        title={profile.name}
      >
        {profile.name}
      </span>
      <button
        type="button"
        onClick={clearProfile}
        className={cn(
          typography.meta,
          "text-text-muted underline decoration-border underline-offset-2 transition hover:text-text-secondary",
          controlStyles.focusRing,
        )}
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

  function closeMenu() {
    setOpenedAtPath(null);
  }

  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      setOpenedAtPath(pathname);
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
        "border-b border-border-subtle bg-background/90 backdrop-blur-sm",
      )}
    >
      <nav
        className={cn(
          "mx-auto w-full py-4",
          layout.contentMaxWidth,
          layout.pagePaddingX,
          "lg:flex lg:items-center lg:justify-between lg:gap-6",
        )}
        aria-label={t("nav.openMenu")}
      >
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className={cn(
              typography.navLink,
              "min-w-0 truncate font-medium tracking-tight text-text-primary",
            )}
          >
            {t(APP_TITLE_KEY)}
          </Link>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <LanguageSelector />
            <button
              type="button"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center border border-border bg-surface text-text-primary transition hover:bg-surface-muted",
                radius.md,
                controlStyles.focusRing,
              )}
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
            <div className="flex flex-col gap-1 border-t border-border-subtle pb-1 pt-3">
              {PRIMARY_NAV_SECTIONS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isNavSectionActive(pathname, item)}
                  label={t(item.labelKey)}
                  className="px-1 py-3"
                  onNavigate={closeMenu}
                />
              ))}
              <div className="border-t border-border-subtle px-1 pt-3 pb-2">
                <ProfileControl />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-8 lg:flex">
          <div className="flex flex-wrap items-center gap-6">
            {PRIMARY_NAV_SECTIONS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isNavSectionActive(pathname, item)}
                label={t(item.labelKey)}
              />
            ))}
          </div>
          <ProfileControl className="border-l border-border-subtle pl-6" />
          <LanguageSelector />
        </div>
      </nav>
    </header>
  );
}
