"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/useI18n";
import { cn } from "@/lib/ui/cn";
import { RECOMMENDED_DEFAULT_COUNT } from "@/lib/recommendations/constants";

type HomeTrainingMenuProps = {
  recommendedCount?: number;
  fullWidth?: boolean;
  className?: string;
};

type HomeTrainingOption = {
  id: string;
  labelKey: string;
  href: string;
};

export function HomeTrainingMenu({
  recommendedCount = RECOMMENDED_DEFAULT_COUNT,
  fullWidth,
  className,
}: HomeTrainingMenuProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const options: HomeTrainingOption[] = [
    {
      id: "random",
      labelKey: "training.random",
      href: "/test?count=10",
    },
    {
      id: "recommended",
      labelKey: "training.recommended",
      href: `/test?mode=recommended&count=${recommendedCount}`,
    },
    {
      id: "other",
      labelKey: "training.otherTests",
      href: "/train",
    },
  ];

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Dropdown
      align="start"
      className={className}
      menuClassName="p-2"
      open={open}
      onOpenChange={setOpen}
      trigger={(props) => (
        <Button
          type="button"
          fullWidth={fullWidth}
          className={cn(!fullWidth && "sm:w-auto")}
          {...props}
        >
          {t("training.start")}
        </Button>
      )}
    >
      <ul className="space-y-1">
        {options.map((option) => (
          <li key={option.id} role="none">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center rounded-md px-3 py-2.5 text-left text-sm text-text-primary transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
              onClick={() => handleSelect(option.href)}
            >
              {t(option.labelKey)}
            </button>
          </li>
        ))}
      </ul>
    </Dropdown>
  );
}
