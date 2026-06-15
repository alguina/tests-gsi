/**
 * Editorial design tokens — layout, typography, controls.
 * Semantic colors live in globals.css @theme.
 */
export const layout = {
  contentMaxWidth: "max-w-6xl",
  pagePaddingX: "px-4 sm:px-6 lg:px-8",
  pagePaddingY: "py-6 sm:py-8",
  pageGap: "gap-8",
  navHeight: "sticky top-0 z-20",
} as const;

export const radius = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
} as const;

export const shadow = {
  none: "shadow-none",
  subtle: "shadow-[var(--shadow-subtle)]",
} as const;

export const typography = {
  eyebrow:
    "text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-text-muted",
  pageTitle:
    "text-2xl font-medium tracking-tight text-text-primary sm:text-[1.75rem]",
  pageTitleHero:
    "text-[1.625rem] font-medium tracking-tight text-text-primary sm:text-[2rem] sm:leading-tight",
  sectionTitle: "text-base font-medium tracking-tight text-text-primary",
  panelTitle: "text-[0.9375rem] font-medium tracking-tight text-text-primary",
  body: "text-sm leading-relaxed text-text-secondary",
  bodyLarge: "text-[0.9375rem] leading-relaxed text-text-secondary",
  meta: "text-xs leading-normal text-text-muted",
  statLabel:
    "text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-text-muted",
  statValue:
    "text-xl font-medium tabular-nums tracking-tight text-text-primary",
  statValueSm:
    "text-lg font-medium tabular-nums tracking-tight text-text-primary",
  question:
    "text-[1rem] font-normal leading-7 text-text-primary sm:text-[1.0625rem]",
  navLink: "text-sm font-normal tracking-tight",
} as const;

export const spacing = {
  controlPaddingX: "px-3",
  controlPaddingY: "py-2",
  controlPaddingYMd: "py-2.5",
  selectPaddingLeft: "pl-3",
  selectPaddingRight: "pr-9",
  selectChevronInset: "right-3",
  controlRadius: radius.md,
  pillMinHeight: "min-h-11",
} as const;

export const controlStyles = {
  field:
    "w-full border border-border bg-surface outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20",
  fieldText: "text-sm text-text-primary",
  select:
    "border border-border bg-surface outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20 text-sm text-text-primary",
  focusRing: "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
} as const;

export const interactive = {
  optionBase:
    "w-full border text-center transition disabled:cursor-not-allowed disabled:opacity-50",
  optionDefault:
    "border-border bg-surface text-text-primary hover:border-accent/40 hover:bg-surface-muted",
  optionSelected:
    "border-accent bg-accent-muted text-accent-foreground font-medium",
} as const;
