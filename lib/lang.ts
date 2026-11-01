import { cookies } from "next/headers";
import { LANG_COOKIE, captions, type Lang } from "./captions";

export async function getLang(): Promise<Lang> {
  return (await cookies()).get(LANG_COOKIE)?.value === "en" ? "en" : "fr";
}

export async function getCaptions() {
  return captions[await getLang()];
}
