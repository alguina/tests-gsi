"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { cn } from "@/lib/ui/cn";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  APP_TITLE_KEY,
  isNavItemActive,
  MAIN_NAV_ITEMS,
} from "@/lib/navigation";
import { layout } from "@/lib/ui/tokens";

export function MainNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <header
      className={cn(
        layout.navHeight,
        "border-b border-border bg-surface/95 backdrop-blur",
      )}
    >
      <nav
        className={cn(
          "mx-auto flex w-full flex-col gap-3 py-3",
          layout.contentMaxWidth,
          layout.pagePaddingX,
          "lg:flex-row lg:items-center lg:justify-between",
        )}
      >
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <Link
            href="/"
            className="text-base font-semibold text-text-primary"
          >
            {t(APP_TITLE_KEY)}
          </Link>
          <div className="lg:hidden">
            <LanguageSelector />
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = isNavItemActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>
          <div className="hidden lg:block">
            <LanguageSelector />
          </div>
        </div>
      </nav>
    </header>
  );
}
