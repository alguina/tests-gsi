export type NavItem = {
  href: string;
  labelKey: string;
  /** Additional path prefixes that should highlight this nav item */
  matchPaths?: string[];
};

export const APP_TITLE_KEY = "app.title";

export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "nav.home" },
  { href: "/take-test", labelKey: "nav.takeTest" },
  { href: "/dashboard", labelKey: "nav.dashboard" },
  { href: "/review-topics", labelKey: "nav.reviewTopics" },
  { href: "/history", labelKey: "nav.history" },
  { href: "/export", labelKey: "nav.export" },
  {
    href: "/import",
    labelKey: "nav.import",
    matchPaths: ["/discover", "/saved", "/admin"],
  },
];

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") {
    return pathname === "/";
  }

  const matchesPrimary =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  const matchesAlias = item.matchPaths?.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return matchesPrimary || Boolean(matchesAlias);
}
