"use client";

import { SectionHubPageContent } from "@/components/pages/SectionHubPageContent";
import { PROGRESS_SECTION_LINKS } from "@/lib/navigation";

export function ProgressPageContent() {
  return (
    <SectionHubPageContent
      eyebrowKey="progressSection.eyebrow"
      titleKey="nav.progress"
      descriptionKey="progressSection.description"
      links={PROGRESS_SECTION_LINKS}
    />
  );
}
