/**
 * Layout and spacing conventions shared across pages.
 * Semantic colors live in globals.css @theme for Tailwind utilities.
 */
export const layout = {
  contentMaxWidth: "max-w-7xl",
  pagePaddingX: "px-4 sm:px-6",
  pagePaddingY: "py-4 sm:py-6",
  pageGap: "gap-6",
  navHeight: "sticky top-0 z-20",
} as const;

/** Shared control padding — keep inputs and selects visually aligned */
export const spacing = {
  controlPaddingX: "px-3",
  controlPaddingY: "py-2",
  controlPaddingYMd: "py-3",
  /** Select: left padding for label text */
  selectPaddingLeft: "pl-3",
  /** Select: right padding so text does not run under the chevron */
  selectPaddingRight: "pr-9",
  /** Select: gap between chevron and right border */
  selectChevronInset: "right-3",
  controlRadius: "rounded-xl",
} as const;

export const controlStyles = {
  field:
    "w-full border border-border bg-surface-muted outline-none transition focus:border-primary focus:bg-surface",
  fieldText: "text-sm text-text-primary",
  select:
    "border border-border bg-surface-muted outline-none transition focus:border-primary focus:bg-surface text-sm text-text-primary",
} as const;
