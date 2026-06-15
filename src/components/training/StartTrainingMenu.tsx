"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TrainingModeChooser } from "@/components/training/TrainingModeChooser";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/useI18n";
import { cn } from "@/lib/ui/cn";

type StartTrainingMenuProps = {
  hasRecommendationData: boolean;
  recommendedCount?: number;
  fullWidth?: boolean;
  className?: string;
};

export function StartTrainingMenu({
  hasRecommendationData,
  recommendedCount,
  fullWidth,
  className,
}: StartTrainingMenuProps) {
  const { t } = useI18n();
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        fullWidth={fullWidth}
        className={cn(!fullWidth && "sm:w-auto")}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        {t("training.start")}
      </Button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-20 mt-2 w-full min-w-[18rem] sm:w-80"
        >
          <TrainingModeChooser
            hasRecommendationData={hasRecommendationData}
            recommendedCount={recommendedCount}
            onNavigate={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
