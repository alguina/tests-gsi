"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { MainNav } from "@/components/layout/MainNav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <I18nProvider>
      <MainNav />
      {children}
    </I18nProvider>
  );
}
