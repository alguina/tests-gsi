"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RECOMMENDED_DEFAULT_COUNT } from "@/lib/recommendations/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/useI18n";
import { cn } from "@/lib/ui/cn";

export type TrainingModeChooserProps = {
  hasRecommendationData: boolean;
  recommendedCount?: number;
  variant?: "menu" | "list";
  className?: string;
  onNavigate?: () => void;
};

type TrainingMode = {
  id: string;
  labelKey: string;
  href: string;
  preferred?: boolean;
};

export function TrainingModeChooser({
  hasRecommendationData,
  recommendedCount = RECOMMENDED_DEFAULT_COUNT,
  variant = "menu",
  className,
  onNavigate,
}: TrainingModeChooserProps) {
  const { t } = useI18n();
  const router = useRouter();

  const modes: TrainingMode[] = [
    {
      id: "recommended",
      labelKey: "training.recommended",
      href: `/test?mode=recommended&count=${recommendedCount}`,
      preferred: hasRecommendationData,
    },
    {
      id: "random",
      labelKey: "training.random",
      href: "/train?focus=random",
    },
    {
      id: "failed",
      labelKey: "training.reviewMistakes",
      href: "/train?focus=failed",
    },
    {
      id: "topic",
      labelKey: "training.trainByTopic",
      href: "/review-topics",
    },
    {
      id: "exam",
      labelKey: "training.examSimulation",
      href: "/test/exam",
    },
  ];

  function handleClick(href: string) {
    onNavigate?.();
    router.push(href);
  }

  return (
    <Card
      as="div"
      padding={variant === "menu" ? "sm" : "md"}
      className={cn("space-y-2", className)}
    >
      {!hasRecommendationData ? (
        <p className="text-sm text-text-secondary">
          {t("training.notEnoughDataForRecommendations")}
        </p>
      ) : null}

      <ul className="space-y-1" role="menu">
        {modes.map((mode) => (
          <li key={mode.id} role="none">
            {variant === "list" ? (
              <Link
                href={mode.href}
                role="menuitem"
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-surface-muted",
                  mode.preferred
                    ? "text-selection-from"
                    : "text-text-primary",
                )}
                onClick={onNavigate}
              >
                {t(mode.labelKey)}
                {mode.preferred ? (
                  <span className="text-xs font-normal text-text-muted">
                    {t("training.recommendedBadge")}
                  </span>
                ) : null}
              </Link>
            ) : (
              <Button
                variant={mode.preferred ? "primary" : "secondary"}
                fullWidth
                className="justify-start"
                role="menuitem"
                onClick={() => handleClick(mode.href)}
              >
                {t(mode.labelKey)}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
