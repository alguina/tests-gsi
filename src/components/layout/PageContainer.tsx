import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { layout } from "@/lib/ui/tokens";

export type PageContainerWidth = "content" | "full";

type PageContainerProps = {
  children: ReactNode;
  width?: PageContainerWidth;
  className?: string;
  innerClassName?: string;
};

/**
 * Shared page wrapper. Mobile-first padding; centered container.
 * - content: max width 1280px (max-w-7xl)
 * - full: no max width (tables, bulk import, etc.)
 */
export function PageContainer({
  children,
  width = "content",
  className,
  innerClassName,
}: PageContainerProps) {
  const containerWidth =
    width === "content" ? layout.contentMaxWidth : "w-full max-w-none";

  return (
    <main
      className={cn(
        "min-h-screen",
        layout.pagePaddingX,
        layout.pagePaddingY,
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col",
          layout.pageGap,
          containerWidth,
          innerClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
}
