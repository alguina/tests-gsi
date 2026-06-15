import { redirect } from "next/navigation";

const LEGACY_FOCUS_TO_TAB: Record<string, string> = {
  random: "random",
  failed: "mistakes",
};

export default async function TakeTestPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string; tab?: string }>;
}) {
  const { focus, tab } = await searchParams;
  const resolvedTab = tab ?? (focus ? LEGACY_FOCUS_TO_TAB[focus] : undefined);

  if (resolvedTab) {
    redirect(`/train?tab=${encodeURIComponent(resolvedTab)}`);
  }

  redirect("/train");
}
