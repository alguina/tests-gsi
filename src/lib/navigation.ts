export type NavSection = {
  id: "home" | "train" | "progress" | "more";
  href: string;
  labelKey: string;
  matchPaths?: string[];
};

export type NavLinkItem = {
  href: string;
  labelKey: string;
  descriptionKey?: string;
};

export const APP_TITLE_KEY = "app.title";

export const PRIMARY_NAV_SECTIONS: NavSection[] = [
  { id: "home", href: "/", labelKey: "nav.home" },
  {
    id: "train",
    href: "/train",
    labelKey: "nav.train",
    matchPaths: ["/take-test", "/test"],
  },
  {
    id: "progress",
    href: "/progress",
    labelKey: "nav.progress",
    matchPaths: ["/dashboard", "/history", "/review-topics"],
  },
  {
    id: "more",
    href: "/more",
    labelKey: "nav.more",
    matchPaths: ["/export", "/import", "/discover", "/saved", "/admin"],
  },
];

export const TRAIN_SECTION_LINKS: NavLinkItem[] = [
  {
    href: "/test?mode=recommended&count=25",
    labelKey: "training.recommended",
    descriptionKey: "trainSection.recommendedDescription",
  },
  {
    href: "/train?tab=random",
    labelKey: "training.random",
    descriptionKey: "trainSection.randomDescription",
  },
  {
    href: "/train?tab=mistakes",
    labelKey: "training.reviewMistakes",
    descriptionKey: "trainSection.failedDescription",
  },
  {
    href: "/review-topics",
    labelKey: "training.trainByTopic",
    descriptionKey: "trainSection.topicDescription",
  },
  {
    href: "/test/exam",
    labelKey: "training.examSimulation",
    descriptionKey: "trainSection.examDescription",
  },
];

export const PROGRESS_SECTION_LINKS: NavLinkItem[] = [
  {
    href: "/dashboard",
    labelKey: "nav.dashboard",
    descriptionKey: "progressSection.dashboardDescription",
  },
  {
    href: "/history",
    labelKey: "nav.history",
    descriptionKey: "progressSection.historyDescription",
  },
  {
    href: "/review-topics",
    labelKey: "nav.reviewTopics",
    descriptionKey: "progressSection.topicsDescription",
  },
  {
    href: "/export?type=bookmarks",
    labelKey: "progressSection.bookmarks",
    descriptionKey: "progressSection.bookmarksDescription",
  },
];

export const MORE_SECTION_LINKS: NavLinkItem[] = [
  {
    href: "/export",
    labelKey: "nav.export",
    descriptionKey: "moreSection.exportDescription",
  },
  {
    href: "/import",
    labelKey: "nav.import",
    descriptionKey: "moreSection.importDescription",
  },
  {
    href: "/admin/quality",
    labelKey: "moreSection.dataQuality",
    descriptionKey: "moreSection.dataQualityDescription",
  },
  {
    href: "/more#profile",
    labelKey: "nav.profile",
    descriptionKey: "moreSection.profileDescription",
  },
];

/** @deprecated Use PRIMARY_NAV_SECTIONS */
export const MAIN_NAV_ITEMS = PRIMARY_NAV_SECTIONS;

export function isNavSectionActive(pathname: string, section: NavSection): boolean {
  if (section.href === "/") {
    return pathname === "/";
  }

  const matchesPrimary =
    pathname === section.href || pathname.startsWith(`${section.href}/`);

  const matchesAlias = section.matchPaths?.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return matchesPrimary || Boolean(matchesAlias);
}

/** @deprecated Use isNavSectionActive */
export function isNavItemActive(pathname: string, item: NavSection): boolean {
  return isNavSectionActive(pathname, item);
}
