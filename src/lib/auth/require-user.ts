import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireUser(nextPath: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/signin?next=${encodeURIComponent(nextPath)}`);
  }
  return session.user;
}
