import { redirect } from "next/navigation";

export default async function TakeTestPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>;
}) {
  const { focus } = await searchParams;
  redirect(focus ? `/train?focus=${encodeURIComponent(focus)}` : "/train");
}
