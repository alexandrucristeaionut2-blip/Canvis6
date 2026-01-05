import { cookies } from "next/headers";

const COOKIE_NAME = "canvist_admin";

export async function isAdminRequest() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "1";
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}
