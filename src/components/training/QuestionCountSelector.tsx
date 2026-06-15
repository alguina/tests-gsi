"use client";

import { SelectableOption } from "@/components/ui/SelectableOption";
import { useI18n } from "@/lib/i18n/useI18n";
import { cn } from "@/lib/ui/cn";

export type QuestionCountValue = number | "all";

export const QUESTION_COUNT_PILL_CLASS = "min-h-11";

type QuestionCountSelectorProps<T extends QuestionCountValue = QuestionCountValue> = {
  label?: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  disabledOptions?: readonly T[];
  formatLabel?: (option: T) => string;
  className?: string;
};

function gridColumnsClass(optionCount: number): string {
  if (optionCount <= 2) {
    return "grid-cols-2";
  }

  if (optionCount === 3) {
    return "grid-cols-3";
  }

  return "grid-cols-2 sm:grid-cols-4";
}

export function QuestionCountSelector<T extends QuestionCountValue>({
  label,
  options,
  value,
  onChange,
  disabledOptions = [],
  formatLabel,
  className,
}: QuestionCountSelectorProps<T>) {
  const { t } = useI18n();

  function resolveLabel(option: T): string {
    if (formatLabel) {
      return formatLabel(option);
    }

    if (option === "all") {
      return t("test.filterAll");
    }

    return t("test.questionsCount", { count: option });
  }

  return (
    <div className={className}>
      {label ? (
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-text-muted">
          {label}
        </p>
      ) : null}
      <div
        className={cn(
          "grid gap-3",
          label ? "mt-3" : undefined,
          gridColumnsClass(options.length),
        )}
        role="group"
        aria-label={label}
      >
        {options.map((option) => (
          <SelectableOption
            key={String(option)}
            selected={value === option}
            disabled={disabledOptions.includes(option)}
            onClick={() => onChange(option)}
            className={QUESTION_COUNT_PILL_CLASS}
          >
            {resolveLabel(option)}
          </SelectableOption>
        ))}
      </div>
    </div>
  );
}
