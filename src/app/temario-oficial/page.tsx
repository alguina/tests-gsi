import { cookies } from "next/headers";
import { TemarioOficialPageContent } from "@/components/pages/TemarioOficialPageContent";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { getTemarioOficialData } from "@/lib/officialTopicsServer";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";

export default async function TemarioOficialPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;
  const data = await getTemarioOficialData(userId);

  return <TemarioOficialPageContent data={data} />;
}
